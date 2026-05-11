"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Doctor } from "@/types/doctor";
import FileUpload from "./FileUpload";
import DraftBanner from "./DraftBanner";
import { useBeforeUnload, useFormDraft } from "@/lib/use-form-draft";

interface Props {
  doctor?: Doctor;
  mode: "create" | "edit";
}

interface DoctorSnapshot {
  name: string;
  subtitle: string;
  phone: string;
  email: string;
  photoUrl: string;
}

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary-light outline-none transition-colors bg-white text-sm";
const labelClass =
  "block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider";

export default function DoctorForm({ doctor, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(doctor?.name || "");
  const [subtitle, setSubtitle] = useState(
    doctor?.subtitle || "Cardiologie interventionnelle"
  );
  const [phone, setPhone] = useState(doctor?.phone || "");
  const [email, setEmail] = useState(doctor?.email || "");
  const [photoUrl, setPhotoUrl] = useState(doctor?.photoUrl || "");

  // ── Brouillon localStorage + garde fermeture ──
  const draftKey = `cardio-draft:doctor:${doctor?.id ?? "new"}`;
  const snapshot: DoctorSnapshot = useMemo(
    () => ({ name, subtitle, phone, email, photoUrl }),
    [name, subtitle, phone, email, photoUrl]
  );
  const initialSnapshot = useMemo<DoctorSnapshot>(
    () => ({
      name: doctor?.name || "",
      subtitle: doctor?.subtitle || "Cardiologie interventionnelle",
      phone: doctor?.phone || "",
      email: doctor?.email || "",
      photoUrl: doctor?.photoUrl || "",
    }),
    [doctor]
  );
  const dirty = useMemo(
    () => JSON.stringify(snapshot) !== JSON.stringify(initialSnapshot),
    [snapshot, initialSnapshot]
  );
  useBeforeUnload(dirty);
  const { existingDraft, clear: clearDraft, dismiss: dismissDraft } =
    useFormDraft<DoctorSnapshot>(draftKey, snapshot);

  function restoreDraft() {
    if (!existingDraft) return;
    const v = existingDraft.value;
    setName(v.name || "");
    setSubtitle(v.subtitle || "Cardiologie interventionnelle");
    setPhone(v.phone || "");
    setEmail(v.email || "");
    setPhotoUrl(v.photoUrl || "");
    dismissDraft();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Le nom est requis.");
      return;
    }

    setSaving(true);
    try {
      const url =
        mode === "create"
          ? "/api/admin/doctors"
          : `/api/admin/doctors/${doctor!.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subtitle, phone, email, photoUrl }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setError(
            "Votre session a expiré. Votre brouillon est sauvegardé localement : reconnectez-vous puis rouvrez cette fiche pour le restaurer."
          );
        } else {
          setError(data.error || "Échec de l'enregistrement.");
        }
        return;
      }
      clearDraft();
      router.push("/admin/equipe");
      router.refresh();
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {existingDraft && (
        <DraftBanner
          savedAt={existingDraft.savedAt}
          onRestore={restoreDraft}
          onIgnore={dismissDraft}
        />
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <fieldset className="bg-white rounded-xl border border-border p-5 space-y-4">
        <legend
          className="text-lg font-semibold text-foreground px-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Informations
        </legend>

        <div>
          <label htmlFor="name" className={labelClass}>
            Nom complet *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
            placeholder="ex. Dr Mustapha HASSAN"
          />
        </div>

        <div>
          <label htmlFor="subtitle" className={labelClass}>
            Sous-titre
          </label>
          <input
            id="subtitle"
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className={inputClass}
            placeholder="ex. Cardiologie interventionnelle"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="phone" className={labelClass}>
              Téléphone
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              placeholder="04 78 22 91 12"
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="prenom.nom@exemple.fr"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="bg-white rounded-xl border border-border p-5 space-y-3">
        <legend
          className="text-lg font-semibold text-foreground px-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Photo
        </legend>
        <p className="text-sm text-muted">
          Photo portrait du cardiologue, affichée sur la page d&apos;accueil.
        </p>
        <FileUpload
          kind="doctor"
          value={photoUrl || undefined}
          onChange={(url) => setPhotoUrl(url)}
          onClear={() => setPhotoUrl("")}
        />
      </fieldset>

      <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg border border-border text-muted hover:bg-surface-alt transition-colors text-sm font-medium"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-opacity hover:opacity-85"
          style={{ background: "#0F172A", fontFamily: "var(--font-heading)" }}
        >
          <Save className="w-4 h-4" />
          {saving ? "Enregistrement..." : mode === "create" ? "Créer" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
