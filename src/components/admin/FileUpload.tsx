"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText, Film, ImageIcon, RotateCcw, AlertCircle } from "lucide-react";

export type UploadKind = "image" | "video" | "document" | "doctor";

interface Props {
  kind: UploadKind;
  value?: string;
  onChange: (publicUrl: string) => void;
  onClear: () => void;
}

const CONFIG: Record<
  UploadKind,
  { accept: string; hint: string; maxMb: number; Icon: React.ElementType }
> = {
  image: {
    accept: "image/jpeg,image/png,image/webp,image/gif",
    hint: "JPG, PNG, WebP ou GIF — max 10 Mo",
    maxMb: 10,
    Icon: ImageIcon,
  },
  video: {
    accept: "video/mp4,video/webm",
    hint: "MP4 ou WebM — max 50 Mo",
    maxMb: 50,
    Icon: Film,
  },
  document: {
    accept: "application/pdf",
    hint: "PDF — max 20 Mo",
    maxMb: 20,
    Icon: FileText,
  },
  doctor: {
    accept: "image/jpeg,image/png,image/webp",
    hint: "Photo portrait — JPG, PNG ou WebP — max 10 Mo",
    maxMb: 10,
    Icon: ImageIcon,
  },
};

export default function FileUpload({ kind, value, onChange, onClear }: Props) {
  const cfg = CONFIG[kind];
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  async function upload(file: File) {
    setError("");

    if (file.size > cfg.maxMb * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${cfg.maxMb} Mo)`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // 1. Obtenir l'URL signée depuis notre API admin
      const signRes = await fetch("/api/admin/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          filename: file.name,
          size: file.size,
          mime: file.type,
        }),
      });

      if (!signRes.ok) {
        const err = await signRes.json();
        throw new Error(err.error ?? "Impossible d'obtenir l'URL d'upload");
      }

      const { uploadUrl, publicUrl } = await signRes.json();

      // 2. Upload direct navigateur → Supabase via XHR (pour la progression)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Erreur d'envoi (${xhr.status})`));
        });
        xhr.addEventListener("error", () => reject(new Error("Erreur réseau")));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // 3. Supprimer l'ancien fichier s'il existait (fire and forget)
      if (value) {
        fetch("/api/admin/uploads", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: value }),
        }).catch(() => {});
      }

      onChange(publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  function handleClear() {
    if (value) {
      fetch("/api/admin/uploads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      }).catch(() => {});
    }
    setError("");
    onClear();
  }

  // ── Aperçu si fichier déjà uploadé ──
  if (value && !uploading) {
    return (
      <div className="rounded-xl border border-border overflow-hidden bg-white">
        {(kind === "image" || kind === "doctor") && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Aperçu"
            className="w-full max-h-56 object-cover"
          />
        )}
        {kind === "video" && (
          <video
            src={value}
            controls
            className="w-full max-h-56 bg-black"
            preload="metadata"
          />
        )}
        {kind === "document" && (
          <div className="flex items-center gap-3 px-4 py-4 bg-amber-50">
            <FileText className="w-8 h-8 text-amber-600 shrink-0" />
            <span className="text-sm text-foreground flex-1 truncate">
              {decodeURIComponent(value.split("/").pop() ?? "document.pdf")}
            </span>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline shrink-0"
            >
              Ouvrir
            </a>
          </div>
        )}
        <div className="flex items-center justify-between px-3 py-2 bg-surface border-t border-border">
          <span className="text-xs text-muted">Fichier uploadé</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Remplacer
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-danger hover:opacity-75 transition-opacity"
            >
              <X className="w-3 h-3" />
              Supprimer
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={cfg.accept}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    );
  }

  // ── Zone de dépôt / progression ──
  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed transition-colors cursor-pointer text-center select-none ${
          dragOver
            ? "border-primary bg-blue-50"
            : uploading
            ? "border-border bg-surface cursor-not-allowed"
            : "border-border hover:border-primary hover:bg-surface"
        }`}
      >
        {uploading ? (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted">{progress}% — envoi en cours…</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-surface-alt flex items-center justify-center">
              <cfg.Icon className="w-6 h-6 text-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Glissez un fichier ici ou{" "}
                <span className="text-primary">parcourez</span>
              </p>
              <p className="text-xs text-muted mt-0.5">{cfg.hint}</p>
            </div>
            {dragOver && (
              <div className="absolute inset-0 rounded-xl bg-blue-50/80 flex items-center justify-center pointer-events-none">
                <Upload className="w-8 h-8 text-primary" />
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={cfg.accept}
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}
