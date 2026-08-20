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

  // Une seule entrée vers l'assistant à la fois : la bulle sur les fiches,
  // le bouton d'en-tête sur l'accueil (voir Header). Les deux ensemble
  // dupliquaient la même action et masquaient le contenu sur mobile.
  const showBubble = pathname !== "/";

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
      {(showBubble || open) && (
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant"}
          className="print:hidden fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center bg-primary text-white shadow-lg transition-colors hover:bg-primary-dark cursor-pointer"
        >
          {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        </button>
      )}

      {open && (
        <div
          className="print:hidden fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-24px)] h-[560px] max-h-[calc(100vh-140px)] flex flex-col overflow-hidden border border-border-strong bg-background shadow-xl"
        >
          <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-primary text-white">
            <div className="flex-1 min-w-0">
              <p
                className="text-base font-bold leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Poser une question
              </p>
              <p className="text-sm text-white/70 truncate">
                Réponses tirées des fiches — {brandName}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="shrink-0 w-9 h-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-surface">
            {empty && (
              <div className="flex flex-col gap-3">
                <p className="border border-border bg-background px-3.5 py-2.5 text-base text-foreground">
                  {greeting}
                </p>

                {suggestions.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-sm text-muted-soft">
                      {current ? "Questions fréquentes" : "Choisissez une intervention"}
                    </p>
                    {suggestions.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => send(s.query)}
                        className="text-left min-h-11 px-3 py-2 text-base text-primary bg-background border border-border transition-colors hover:border-primary hover:bg-surface-alt cursor-pointer"
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
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 text-base leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-white"
                      : msg.isError
                        ? "border-l-2 border-warn bg-background text-muted"
                        : "border border-border bg-background text-foreground"
                  }`}
                >
                  {msg.content}
                  {msg.role === "assistant" && msg.answered === false && !msg.isError && (
                    <span className="block mt-1.5 text-sm text-muted-soft">
                      Question transmise à l&rsquo;équipe médicale.
                    </span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="border border-border bg-background px-4 py-3 flex items-center gap-1.5">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-muted-soft animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                  <span className="sr-only">L&rsquo;assistant rédige une réponse…</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="shrink-0 px-3 pb-3 pt-2.5 border-t border-border bg-background">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Votre question…"
                rows={1}
                disabled={loading}
                className="flex-1 resize-none border border-border-strong px-3 py-2.5 text-base leading-relaxed bg-background text-foreground focus:outline-none focus:border-primary disabled:opacity-50"
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
                className="w-11 h-11 flex items-center justify-center shrink-0 bg-primary text-white transition-colors hover:bg-primary-dark disabled:opacity-40 cursor-pointer disabled:cursor-default"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-1.5 text-sm text-muted-soft text-center">{PRIVACY}</p>
          </div>
        </div>
      )}
    </>
  );
}
