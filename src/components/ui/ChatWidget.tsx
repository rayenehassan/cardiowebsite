"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { X, Send, MessageSquare } from "lucide-react";
import type { ChatMessage } from "@/types/chat";

interface Message {
  role: "user" | "assistant";
  content: string;
  answered?: boolean;
  isError?: boolean;
}

export interface ChatIntervention {
  slug: string;
  name: string;
}

const NAVY = "#0F172A";

const GREETING =
  "Bonjour. Posez-moi une question sur votre intervention — je réponds uniquement à partir de nos fiches patient.";

const PRIVACY = "N'indiquez pas d'informations personnelles (nom, téléphone…).";

const ERROR_MSG =
  "L'assistant est momentanément indisponible. Pour toute question, contactez directement l'équipe médicale.";

export default function ChatWidget({
  interventions,
  brandName,
}: {
  interventions: ChatIntervention[];
  brandName: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("cardio:open-chat", openChat);
    return () => window.removeEventListener("cardio:open-chat", openChat);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(
    async (textArg?: string) => {
      const question = (textArg ?? input).trim();
      if (!question || loading) return;

      setMessages((prev) => [...prev, { role: "user", content: question }]);
      setInput("");
      setLoading(true);

      const history: ChatMessage[] = messages
        .filter((m) => !m.isError)
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, history }),
        });

        if (!res.ok) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: ERROR_MSG, isError: true },
          ]);
          return;
        }

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer, answered: data.answered },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: ERROR_MSG, isError: true },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages]
  );

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const empty = messages.length === 0;

  const current = interventions.find(
    (i) => pathname === `/interventions/${i.slug}`
  );

  const suggestions: { label: string; query: string }[] = current
    ? [
        { label: "Comment me préparer ?", query: `${current.name} : comment dois-je me préparer ?` },
        { label: "Est-ce douloureux ?", query: `${current.name} : est-ce que c'est douloureux ?` },
        { label: "Combien de temps ça dure ?", query: `${current.name} : combien de temps ça dure ?` },
        { label: "Quand puis-je rentrer chez moi ?", query: `${current.name} : quand puis-je rentrer chez moi ?` },
      ]
    : interventions.slice(0, 4).map((i) => ({
        label: i.name,
        query: `${i.name} : en quoi ça consiste et comment ça se passe ?`,
      }));

  const greeting = current
    ? `Bonjour. Une question sur votre ${current.name} ? Je réponds uniquement à partir de nos fiches patient.`
    : GREETING;

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant"}
        className="print:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
        style={{
          background: NAVY,
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 8px 24px -6px rgba(18,35,63,0.45), 0 2px 8px rgba(0,0,0,0.10)",
        }}
      >
        {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {/* Panneau de chat */}
      {open && (
        <div
          className="print:hidden fixed bottom-24 right-6 z-50 w-[384px] max-w-[calc(100vw-24px)] flex flex-col rounded-2xl overflow-hidden"
          style={{
            height: "560px",
            background: "#fff",
            boxShadow: "0 20px 60px -12px rgba(18,35,63,0.28), 0 4px 16px rgba(0,0,0,0.08)",
            border: "1px solid rgba(18,35,63,0.12)",
          }}
        >
          {/* En-tête */}
          <div className="shrink-0 px-4 py-3.5 text-white" style={{ background: NAVY }}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)" }}
              >
                <MessageSquare className="w-4 h-4 text-white/90" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[14px] leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  Questions sur votre intervention
                </p>
                <p className="text-white/55 text-[11px] mt-0.5 font-medium tracking-wide uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                  Fiches patient · {brandName}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3.5 bg-[#F8FAFF]">
            {empty && (
              <div className="flex flex-col gap-3">
                <div className="flex items-end gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: NAVY }}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="max-w-[82%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed bg-white border border-black/6 shadow-sm text-foreground">
                    {greeting}
                  </div>
                </div>

                {suggestions.length > 0 && (
                  <div className="flex flex-col gap-1.5 pl-9">
                    {!current && (
                      <p className="text-xs text-muted mb-1 font-medium" style={{ fontFamily: "var(--font-heading)" }}>
                        Choisissez une intervention :
                      </p>
                    )}
                    {suggestions.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => send(s.query)}
                        className="text-left px-3 py-2 rounded-lg text-[13px] text-foreground bg-white border border-border hover:border-primary/30 hover:bg-surface transition-colors cursor-pointer"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={msg.isError ? { background: "#FEF3C7" } : { background: NAVY }}
                  >
                    <MessageSquare className={`w-3.5 h-3.5 ${msg.isError ? "text-amber-500" : "text-white"}`} />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "text-white rounded-br-md"
                      : msg.isError
                        ? "text-muted rounded-bl-md border border-amber-200 bg-amber-50"
                        : "text-foreground rounded-bl-md border border-black/6 bg-white shadow-sm"
                  }`}
                  style={msg.role === "user" ? { background: NAVY } : undefined}

                >
                  {msg.content}
                  {msg.role === "assistant" && msg.answered === false && !msg.isError && (
                    <p className="mt-1.5 text-xs text-muted italic">
                      Question transmise à l&apos;équipe médicale.
                    </p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: NAVY }}>
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="rounded-2xl rounded-bl-md px-4 py-3 border border-black/6 bg-white shadow-sm flex items-center gap-1.5">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: "#94A3B8", animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Saisie */}
          <div className="shrink-0 px-3 pb-3 pt-2.5 border-t border-black/6 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Votre question…"
                rows={1}
                disabled={loading}
                className="flex-1 resize-none rounded-xl border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 leading-relaxed bg-surface"
                style={{ maxHeight: "120px", minHeight: "44px" }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                aria-label="Envoyer"
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-35 disabled:hover:scale-100 cursor-pointer disabled:cursor-default"
                style={{ background: NAVY }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-muted text-center">{PRIVACY}</p>
          </div>
        </div>
      )}
    </>
  );
}
