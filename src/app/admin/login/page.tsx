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

  const inputClass =
    "w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary-light outline-none transition-colors text-base bg-white";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0F172A" }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
            <rect x="0"  y="0"  width="13" height="13" rx="1" fill="white"/>
            <rect x="17" y="0"  width="13" height="13" rx="1" fill="white"/>
            <rect x="0"  y="17" width="13" height="13" rx="1" fill="white"/>
            <polygon points="17,17 30,17 17,30" fill="white"/>
          </svg>
          <div className="leading-tight">
            <p className="text-[15px] font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              Ramsay Santé
            </p>
            <p className="text-[13px] font-medium" style={{ fontFamily: "var(--font-heading)", color: "rgba(255,255,255,0.75)" }}>
              Hôpital privé de la Loire
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-7 shadow-sm">
          <h1 className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            Connexion
          </h1>
          <p className="text-sm text-muted mb-6">
            Espace réservé au personnel médical autorisé.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-5">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-foreground mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                Identifiant
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white py-3 rounded-lg text-base font-semibold disabled:opacity-50 transition-opacity hover:opacity-85"
              style={{ background: "#0F172A", fontFamily: "var(--font-heading)", minHeight: "48px" }}
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
