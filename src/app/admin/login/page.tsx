"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Connexion impossible");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0F172A" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <svg width="28" height="28" viewBox="0 0 30 30" fill="none" aria-hidden="true">
              <rect x="0"  y="0"  width="13" height="13" rx="1" fill="white"/>
              <rect x="17" y="0"  width="13" height="13" rx="1" fill="white"/>
              <rect x="0"  y="17" width="13" height="13" rx="1" fill="white"/>
              <polygon points="17,17 30,17 17,30" fill="white"/>
            </svg>
            <div className="leading-tight text-left">
              <p className="text-[14px] font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                Ramsay Santé
              </p>
              <p className="text-[11px]" style={{ fontFamily: "var(--font-heading)", color: "rgba(255,255,255,0.5)" }}>
                Hôpital privé de la Loire
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-border p-6 shadow-sm"
        >
          <h1 className="text-lg font-semibold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            Connexion
          </h1>
          <p className="text-xs text-muted mb-6">Espace réservé au personnel médical autorisé.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Identifiant
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary-light outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary-light outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 transition-opacity hover:opacity-85"
              style={{ background: "#0F172A", fontFamily: "var(--font-heading)" }}
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
