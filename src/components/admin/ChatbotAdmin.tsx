"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare, AlertCircle, CheckCircle2, XCircle, RefreshCw, Bot, Clock } from "lucide-react";
import type { ChatLog, ChatCustomAnswer } from "@/types/chat";

type Tab = "logs" | "unanswered";

interface Counts {
  total: number;
  answered: number;
  unanswered: number;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Logs tab ──────────────────────────────────────────────────────────────────

function LogsTab() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [counts, setCounts] = useState<Counts>({ total: 0, answered: 0, unanswered: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchLogs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/chat/logs?limit=100");
        if (!res.ok) throw new Error("Erreur serveur");
        const data = await res.json();
        if (!cancelled) {
          setLogs(data.logs ?? []);
          setCounts(data.counts ?? { total: 0, answered: 0, unanswered: 0 });
        }
      } catch {
        if (!cancelled) setError("Impossible de charger les logs.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void fetchLogs();
    return () => { cancelled = true; };
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total échanges", value: counts.total, color: "text-foreground", icon: MessageSquare },
          { label: "Répondues par le bot", value: counts.answered, color: "text-success", icon: CheckCircle2 },
          { label: "Hors sujet", value: counts.unanswered, color: "text-amber-500", icon: AlertCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-sm text-muted">{label}</span>
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          100 derniers échanges
        </h2>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {loading && !logs.length ? (
        <div className="text-center py-16 text-muted text-sm">Chargement…</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">Aucun échange pour l&apos;instant.</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${log.botAnswered ? "bg-success" : "bg-amber-400"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-1">{log.question}</p>
                  {log.botAnswered ? (
                    <p className="text-sm text-muted leading-relaxed">{log.answer}</p>
                  ) : (
                    <p className="text-xs text-amber-600 italic">Question hors sujet — renvoyée vers le médecin.</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted shrink-0">
                  <Clock className="w-3 h-3" />
                  {formatDate(log.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Unanswered item ───────────────────────────────────────────────────────────

function UnansweredItem({
  item,
  onUpdate,
}: {
  item: ChatCustomAnswer;
  onUpdate: (updated: ChatCustomAnswer) => void;
}) {
  const [answer, setAnswer] = useState(item.doctorAnswer ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isPending = item.status === "pending";
  const isDismissed = item.status === "dismissed";

  const save = async (status: "answered" | "dismissed") => {
    setSaving(true);
    setSaveError(null);
    try {
      const body: Record<string, string> = { status };
      if (status === "answered") body.doctorAnswer = answer.trim();

      const res = await fetch(`/api/admin/chat/unanswered/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur");
      }

      const updated: ChatCustomAnswer = await res.json();
      onUpdate(updated);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl border p-4 ${isDismissed ? "opacity-50" : "border-border"}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm font-medium text-foreground flex-1">{item.question}</p>
        <div className="flex items-center gap-1 text-xs text-muted shrink-0">
          <Clock className="w-3 h-3" />
          {formatDate(item.createdAt)}
        </div>
      </div>

      {item.status === "answered" ? (
        <div className="flex items-start gap-2 bg-green-50 rounded-lg p-3">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
          <p className="text-sm text-success leading-relaxed">{item.doctorAnswer}</p>
        </div>
      ) : isDismissed ? (
        <p className="text-xs text-muted italic">Question ignorée.</p>
      ) : (
        <div className="space-y-2">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Réponse du médecin (sera injectée dans le chatbot)…"
            rows={3}
            className="w-full resize-none rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
          {saveError && <p className="text-xs text-danger">{saveError}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => save("answered")}
              disabled={saving || !answer.trim()}
              className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-lg transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-default"
              style={{ background: "var(--color-success)" }}
            >
              <CheckCircle2 className="w-4 h-4" />
              {saving ? "Enregistrement…" : "Valider la réponse"}
            </button>
            <button
              onClick={() => save("dismissed")}
              disabled={saving || !isPending}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-danger transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-default"
            >
              <XCircle className="w-4 h-4" />
              Ignorer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Unanswered tab ────────────────────────────────────────────────────────────

function UnansweredTab() {
  const [items, setItems] = useState<ChatCustomAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchItems() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/chat/unanswered");
        if (!res.ok) throw new Error("Erreur serveur");
        const data = await res.json();
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setError("Impossible de charger les questions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void fetchItems();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleUpdate = useCallback((updated: ChatCustomAnswer) => {
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
  }, []);

  const pending = items.filter((i) => i.status === "pending");
  const displayed = showAll ? items : pending;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Questions sans réponse
          </h2>
          <p className="text-sm text-muted mt-0.5">
            Répondez ici : la réponse sera injectée dans le chatbot automatiquement.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {items.length > pending.length && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              {showAll ? "En attente seulement" : `Tout voir (${items.length})`}
            </button>
          )}
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {loading && !items.length ? (
        <div className="text-center py-16 text-muted text-sm">Chargement…</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">
          {pending.length === 0
            ? "Aucune question en attente. Revenez plus tard."
            : "Aucun résultat."}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((item) => (
            <UnansweredItem key={item.id} item={item} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChatbotAdmin() {
  const [tab, setTab] = useState<Tab>("unanswered");

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Bot className="w-6 h-6 text-primary" />
        <h1
          className="text-2xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Chatbot patient
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface rounded-xl border border-border mb-6 w-fit">
        {(
          [
            { id: "unanswered" as Tab, label: "Questions à traiter" },
            { id: "logs" as Tab, label: "Tous les échanges" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              tab === id
                ? "bg-white shadow text-foreground border border-border"
                : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "unanswered" ? <UnansweredTab /> : <LogsTab />}
    </div>
  );
}
