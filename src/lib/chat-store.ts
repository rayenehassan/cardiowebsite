import { supabaseAdmin } from "@/lib/supabase";
import { ChatLog, ChatCustomAnswer } from "@/types/chat";

// ── Row mappers ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toLog(r: any): ChatLog {
  return {
    id: r.id,
    question: r.question,
    answer: r.answer,
    botAnswered: r.bot_answered,
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCustomAnswer(r: any): ChatCustomAnswer {
  return {
    id: r.id,
    question: r.question,
    doctorAnswer: r.doctor_answer ?? null,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ── Rétention & anonymisation (RGPD) ────────────────────────────────────────

const RETENTION_DAYS = 30;

// Masque les identifiants évidents avant stockage dans les logs analytics.
// Les logs servent à voir CE QUE les patients demandent, pas QUI ils sont.
export function redactPII(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/\b(?:\+33|0)\s*[1-9](?:[\s.-]*\d{2}){4}\b/g, "[téléphone]")
    .replace(/\b\d{6,}\b/g, "[numéro]");
}

async function purgeOldChatData(): Promise<void> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000).toISOString();
  await Promise.all([
    // Logs analytics : suppression au-delà de la durée de rétention.
    supabaseAdmin.from("chat_logs").delete().lt("created_at", cutoff),
    // Ménage des questions ignorées. On CONSERVE 'answered' (savoir du bot)
    // et 'pending' (file d'attente du médecin).
    supabaseAdmin
      .from("chat_custom_answers")
      .delete()
      .eq("status", "dismissed")
      .lt("created_at", cutoff),
  ]);
}

// ── Logs ────────────────────────────────────────────────────────────────────

export async function insertChatLog(
  question: string,
  answer: string,
  botAnswered: boolean
): Promise<void> {
  // Anonymisation avant stockage.
  await supabaseAdmin
    .from("chat_logs")
    .insert({
      question: redactPII(question),
      answer: redactPII(answer),
      bot_answered: botAnswered,
    });
  // Purge opportuniste (déclenchée par le trafic, sans job planifié).
  await purgeOldChatData().catch(() => {});
}

export async function getChatLogs(limit = 100, offset = 0): Promise<ChatLog[]> {
  const { data, error } = await supabaseAdmin
    .from("chat_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(toLog);
}

export async function countChatLogs(): Promise<{ total: number; answered: number; unanswered: number }> {
  const [{ count: total }, { count: answered }] = await Promise.all([
    supabaseAdmin.from("chat_logs").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("chat_logs").select("*", { count: "exact", head: true }).eq("bot_answered", true),
  ]);
  const t = total ?? 0;
  const a = answered ?? 0;
  return { total: t, answered: a, unanswered: t - a };
}

// ── Custom answers (questions hors-sujet + réponses médecin) ────────────────

export async function insertCustomAnswer(question: string): Promise<void> {
  // Question conservée en clair : le médecin (destinataire légitime) a besoin
  // du contexte pour y répondre. Seuls les logs analytics sont anonymisés.
  const normalized = question.trim();

  // Évite de re-remplir la file avec une question déjà en attente
  // (plusieurs patients posent souvent la même question hors-sujet).
  const { data: existing } = await supabaseAdmin
    .from("chat_custom_answers")
    .select("id")
    .eq("status", "pending")
    .ilike("question", normalized)
    .limit(1);

  if (existing && existing.length > 0) return;

  await supabaseAdmin
    .from("chat_custom_answers")
    .insert({ question: normalized, status: "pending" });
}

export async function getCustomAnswers(statusFilter?: string, limit = 100): Promise<ChatCustomAnswer[]> {
  let q = supabaseAdmin
    .from("chat_custom_answers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (statusFilter) q = q.eq("status", statusFilter);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(toCustomAnswer);
}

export async function updateCustomAnswer(
  id: string,
  patch: { doctorAnswer?: string; status?: "answered" | "dismissed" }
): Promise<ChatCustomAnswer | null> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.doctorAnswer !== undefined) row.doctor_answer = patch.doctorAnswer;
  if (patch.status !== undefined) row.status = patch.status;

  const { data, error } = await supabaseAdmin
    .from("chat_custom_answers")
    .update(row)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data ? toCustomAnswer(data as any) : null;
}

export async function getAnsweredCustomAnswers(): Promise<ChatCustomAnswer[]> {
  return getCustomAnswers("answered", 200);
}
