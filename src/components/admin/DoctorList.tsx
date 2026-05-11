"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { Doctor } from "@/types/doctor";

interface Props {
  doctors: Doctor[];
  archived: Doctor[];
}

export default function DoctorList({ doctors, archived }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  // La liste affichée vient directement des props serveur ; après reorder/archive,
  // router.refresh() pousse les nouvelles props et React re-rendu.
  const list = doctors;

  async function move(index: number, dir: "up" | "down") {
    if (reordering) return;
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];

    setError("");
    setReordering(true);
    try {
      const res = await fetch("/api/admin/doctors/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((d) => d.id) }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Impossible de réordonner.");
        return;
      }
      router.refresh();
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setReordering(false);
    }
  }

  async function handleArchive(id: string) {
    setError("");
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/doctors/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Archivage impossible.");
        return;
      }
      router.refresh();
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoadingId(null);
      setPendingDeleteId(null);
    }
  }

  async function handleRestore(id: string) {
    setError("");
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/doctors/${id}`, { method: "PATCH" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Restauration impossible.");
        return;
      }
      router.refresh();
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Cardiologues actifs ── */}
      {list.length === 0 ? (
        <div className="rounded-2xl p-10 text-center border bg-white border-border">
          <UserRound className="w-8 h-8 text-primary mx-auto mb-4" />
          <h3
            className="text-lg font-semibold text-foreground mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Aucun cardiologue enregistré
          </h3>
          <p className="text-sm text-muted">
            Ajoutez le premier membre de l&apos;équipe médicale.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <ul className="divide-y divide-border">
            {list.map((doctor, i) => (
              <li
                key={doctor.id}
                className="flex flex-wrap sm:flex-nowrap items-center gap-3 px-3 sm:px-4 py-3 hover:bg-surface-alt/40"
              >
                <div className="flex flex-col shrink-0">
                  <button
                    type="button"
                    onClick={() => move(i, "up")}
                    disabled={i === 0 || reordering}
                    className="p-0.5 text-muted hover:text-foreground disabled:opacity-20 transition-colors"
                    title="Monter"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, "down")}
                    disabled={i === list.length - 1 || reordering}
                    className="p-0.5 text-muted hover:text-foreground disabled:opacity-20 transition-colors"
                    title="Descendre"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div
                  className="w-14 h-14 rounded-lg bg-surface border border-border overflow-hidden shrink-0 flex items-center justify-center"
                  style={{ backgroundImage: doctor.photoUrl ? `url(${doctor.photoUrl})` : undefined, backgroundSize: "cover", backgroundPosition: "50% 25%" }}
                >
                  {!doctor.photoUrl && <UserRound className="w-6 h-6 text-muted" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-foreground truncate"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {doctor.name}
                  </p>
                  <p className="text-sm text-muted truncate">{doctor.subtitle}</p>
                  <p className="text-xs text-muted truncate">
                    {[doctor.phone, doctor.email].filter(Boolean).join(" · ")}
                  </p>
                </div>

                {pendingDeleteId === doctor.id ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium text-danger whitespace-nowrap">
                      Archiver ?
                    </span>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(null)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-muted bg-white border border-border hover:bg-surface transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArchive(doctor.id)}
                      disabled={loadingId === doctor.id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-white bg-danger hover:opacity-85 transition-opacity disabled:opacity-50"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      <Trash2 className="w-3 h-3" />
                      Archiver
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/admin/equipe/${doctor.id}`}
                      className="p-2.5 text-muted hover:text-primary rounded-lg hover:bg-surface-alt transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(doctor.id)}
                      className="p-2.5 text-muted hover:text-danger rounded-lg hover:bg-red-50 transition-colors"
                      title="Archiver"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Archives ── */}
      {archived.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            Archivés ({archived.length})
          </h2>
          <div className="bg-white rounded-xl border border-border overflow-hidden opacity-70">
            <ul className="divide-y divide-border">
              {archived.map((doctor) => (
                <li
                  key={doctor.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-alt/40"
                >
                  <div
                    className="w-12 h-12 rounded-lg bg-surface border border-border overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ backgroundImage: doctor.photoUrl ? `url(${doctor.photoUrl})` : undefined, backgroundSize: "cover", backgroundPosition: "50% 25%" }}
                  >
                    {!doctor.photoUrl && <UserRound className="w-5 h-5 text-muted" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {doctor.name}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {doctor.subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRestore(doctor.id)}
                    disabled={loadingId === doctor.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40"
                    title="Restaurer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restaurer
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
