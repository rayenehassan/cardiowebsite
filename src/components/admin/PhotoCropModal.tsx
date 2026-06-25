"use client";

/**
 * PhotoCropModal — recadrage portrait médecin
 *
 * UX :
 *  – Drag pour repositionner l'image dans la zone de recadrage carrée
 *  – Slider + boutons ± pour zoomer
 *  – Bouton rotation 90° CW
 *  – Live preview 56 px : carré (admin) + cercle (site patient)
 *  – Sortie : JPEG 600 × 600 px
 *
 * Aucune dépendance externe — canvas natif.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  Crop,
} from "lucide-react";

interface Props {
  /** objectURL créé par le parent (FileUpload). Le parent gère le cycle de vie. */
  src: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

const OUTPUT_PX = 600; // résolution de sortie

export default function PhotoCropModal({ src, onConfirm, onCancel }: Props) {
  /* ── Image source ──
   * `src` vient du parent (objectURL stable, pas de création ici).
   * `imgSrc` = src ou URL de rotation ; les URLs de rotation sont
   * trackées dans rotationUrls pour nettoyage à l'unmount.
   */
  const [imgSrc, setImgSrc] = useState(src);
  const rotationUrls = useRef<string[]>([]);

  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);

  /* ── Zoom / position ── */
  const [zf, setZf] = useState(1);          // zoomFactor : CSS px par natural px
  const [minZf, setMinZf] = useState(1);     // zoom minimum = fill container
  const [pos, setPos] = useState({ x: 0, y: 0 }); // décalage du centre image vs centre viewport

  /* ── Drag ── */
  const [dragging, setDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const dragOrigin = useRef({ sx: 0, sy: 0, px: 0, py: 0 });

  /* ── State divers ── */
  const [processing, setProcessing] = useState(false);
  const [containerSize, setContainerSize] = useState(380);

  /* ── Refs ── */
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Révoquer uniquement les URLs de rotation créées en interne */
  useEffect(() => {
    const urls = rotationUrls.current;
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, []);

  /* Mesurer le container après mount côté client uniquement */
  useEffect(() => {
    if (containerRef.current) {
      setContainerSize(containerRef.current.clientWidth);
    }
  }, []);

  /* ── Helpers ── */
  const getCS = useCallback(() => containerRef.current?.clientWidth ?? containerSize, [containerSize]);

  function clamp(x: number, y: number, zoom: number, nw: number, nh: number, cs: number) {
    const maxX = Math.max(0, (nw * zoom - cs) / 2);
    const maxY = Math.max(0, (nh * zoom - cs) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }

  /* ── Image chargée ── */
  function onLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const cs = getCS();
    setNaturalW(nw);
    setNaturalH(nh);
    const initZf = Math.max(cs / nw, cs / nh);
    setMinZf(initZf);
    setZf(initZf);
    setPos({ x: 0, y: 0 });
    setHasDragged(false);
  }

  /* ── Pointer events (mouse + touch via pointer API) ── */
  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setDragging(true);
    setShowGrid(true);
    dragOrigin.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - dragOrigin.current.sx;
    const dy = e.clientY - dragOrigin.current.sy;
    if (Math.abs(dx) + Math.abs(dy) > 3) setHasDragged(true);
    const cs = getCS();
    setPos(clamp(dragOrigin.current.px + dx, dragOrigin.current.py + dy, zf, naturalW, naturalH, cs));
  }

  function onPointerUp() {
    setDragging(false);
    setShowGrid(false);
  }

  /* ── Zoom ── */
  function applyZoom(newZf: number) {
    const cs = getCS();
    const clamped = Math.max(minZf, Math.min(minZf * 4, newZf));
    setZf(clamped);
    setPos(prev => clamp(prev.x, prev.y, clamped, naturalW, naturalH, cs));
  }

  /* ── Rotation 90° CW ── */
  async function rotate90CW() {
    const img = imgRef.current;
    if (!img || !naturalW) return;

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalHeight;
    canvas.height = img.naturalWidth;
    const ctx = canvas.getContext("2d")!;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    // Révoquer l'ancienne URL de rotation si ce n'est pas le src initial du parent
    const oldUrl = imgSrc !== src ? imgSrc : null;
    canvas.toBlob(
      blob => {
        if (!blob) return;
        const newUrl = URL.createObjectURL(blob);
        rotationUrls.current.push(newUrl);
        if (oldUrl) {
          // Révoquer l'ancienne rotation URL (délai pour laisser le navigateur charger)
          setTimeout(() => {
            URL.revokeObjectURL(oldUrl);
            rotationUrls.current = rotationUrls.current.filter(u => u !== oldUrl);
          }, 1500);
        }
        setImgSrc(newUrl);
        setNaturalW(0);
        setNaturalH(0);
        setPos({ x: 0, y: 0 });
      },
      "image/jpeg",
      0.95,
    );
  }

  /* ── Confirmer le recadrage → canvas → blob ── */
  async function handleConfirm() {
    const img = imgRef.current;
    if (!img || !naturalW) return;
    setProcessing(true);

    try {
      const cs = getCS();
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_PX;
      canvas.height = OUTPUT_PX;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.imageSmoothingEnabled = true;

      /* Coordonnées du crop en pixels naturels */
      const halfCS = cs / 2;
      const sx = naturalW / 2 - pos.x / zf - halfCS / zf;
      const sy = naturalH / 2 - pos.y / zf - halfCS / zf;
      const sw = cs / zf;

      /* Clamp pour éviter de dépasser les bords */
      const safeSx = Math.max(0, Math.min(naturalW - sw, sx));
      const safeSy = Math.max(0, Math.min(naturalH - sw, sy));
      const safeSw = Math.min(sw, naturalW - safeSx, naturalH - safeSy);

      ctx.drawImage(img, safeSx, safeSy, safeSw, safeSw, 0, 0, OUTPUT_PX, OUTPUT_PX);

      await new Promise<void>(resolve => {
        canvas.toBlob(
          blob => {
            if (blob) onConfirm(blob);
            resolve();
          },
          "image/jpeg",
          0.92,
        );
      });
    } finally {
      setProcessing(false);
    }
  }

  /* ── Preview scale ── */
  const previewScale = 56 / containerSize;

  /* ── Zoom slider : normaliser entre 0 et 100 ── */
  const zoomRange = minZf > 0 ? Math.round(((zf - minZf) / (minZf * 3)) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         style={{ background: "rgba(0,0,0,0.68)", backdropFilter: "blur(4px)" }}>

      <div className="bg-white w-full sm:rounded-2xl sm:max-w-[480px] shadow-2xl overflow-hidden">

        {/* ── En-tête ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Crop className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2
                className="text-sm font-semibold text-foreground leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Recadrer la photo
              </h2>
              <p className="text-xs text-muted">Format carré · export 600 × 600 px</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-surface-alt text-muted transition-colors ml-2"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* ── Zone de recadrage ── */}
          <div
            ref={containerRef}
            className="relative mx-auto overflow-hidden rounded-xl bg-gray-950 select-none"
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              cursor: naturalW === 0 ? "default" : dragging ? "grabbing" : "grab",
              touchAction: "none",
            }}
            onPointerDown={naturalW > 0 ? onPointerDown : undefined}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* Image — blob URL local, <Image /> inapplicable */}
            {imgSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={imgSrc}
                onLoad={onLoad}
                alt=""
                draggable={false}
                style={{
                  position: "absolute",
                  width: naturalW ? naturalW * zf : undefined,
                  height: naturalH ? naturalH * zf : undefined,
                  maxWidth: naturalW ? "none" : "100%",
                  left: "50%",
                  top: "50%",
                  transform: naturalW
                    ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
                    : "translate(-50%, -50%)",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Grille règle des tiers (visible pendant le drag) */}
            {showGrid && (
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: [
                    "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
                    "linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
                  ].join(","),
                  backgroundSize: "33.333% 33.333%",
                }}
              />
            )}

            {/* Bordure blanche */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ border: "2px solid rgba(255,255,255,0.55)" }}
            />

            {/* Astuce (disparaît après le premier drag) */}
            {naturalW > 0 && !hasDragged && !dragging && (
              <div
                aria-hidden
                className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none
                           bg-black/55 text-white text-xs px-3 py-1.5 rounded-full
                           whitespace-nowrap transition-opacity"
              >
                Glissez pour repositionner
              </div>
            )}

            {/* Loader pendant la rotation */}
            {imgSrc && naturalW === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              </div>
            )}
          </div>

          {/* ── Contrôles zoom + rotation ── */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => applyZoom(zf * 0.88)}
              disabled={naturalW === 0 || zf <= minZf * 1.001}
              className="p-1.5 rounded-lg hover:bg-surface-alt text-muted disabled:opacity-30 transition-colors shrink-0"
              title="Dézoomer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min={0}
              max={100}
              value={zoomRange}
              onChange={e => {
                const t = Number(e.target.value) / 100;
                applyZoom(minZf + t * minZf * 3);
              }}
              disabled={naturalW === 0}
              className="flex-1"
              style={{ accentColor: "var(--color-primary)", height: "4px" }}
            />

            <button
              type="button"
              onClick={() => applyZoom(zf * 1.14)}
              disabled={naturalW === 0 || zf >= minZf * 3.999}
              className="p-1.5 rounded-lg hover:bg-surface-alt text-muted disabled:opacity-30 transition-colors shrink-0"
              title="Zoomer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-border shrink-0" aria-hidden />

            <button
              type="button"
              onClick={rotate90CW}
              disabled={naturalW === 0}
              className="p-1.5 rounded-lg hover:bg-surface-alt text-muted disabled:opacity-30 transition-colors shrink-0"
              title="Pivoter de 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* ── Prévisualisations ── */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
            <span className="text-xs font-medium text-muted shrink-0 w-14">Aperçu</span>

            {/* Carré — liste admin */}
            <div
              className="relative overflow-hidden rounded-lg shrink-0 bg-surface-alt"
              style={{ width: 56, height: 56 }}
              title="Rendu admin (liste)"
            >
              {imgSrc && naturalW > 0 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgSrc}
                  alt=""
                  draggable={false}
                  style={{
                    position: "absolute",
                    width: naturalW * zf * previewScale,
                    height: naturalH * zf * previewScale,
                    left: "50%",
                    top: "50%",
                    transform: `translate(calc(-50% + ${pos.x * previewScale}px), calc(-50% + ${pos.y * previewScale}px))`,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />
              )}
            </div>

            {/* Cercle — site patient */}
            <div
              className="relative overflow-hidden shrink-0 bg-surface-alt"
              style={{ width: 56, height: 56, borderRadius: "50%" }}
              title="Rendu patient (site)"
            >
              {imgSrc && naturalW > 0 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgSrc}
                  alt=""
                  draggable={false}
                  style={{
                    position: "absolute",
                    width: naturalW * zf * previewScale,
                    height: naturalH * zf * previewScale,
                    left: "50%",
                    top: "50%",
                    transform: `translate(calc(-50% + ${pos.x * previewScale}px), calc(-50% + ${pos.y * previewScale}px))`,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />
              )}
            </div>

            <div className="text-xs text-muted leading-snug">
              <span className="block">Carré · liste admin</span>
              <span className="block text-muted/60">Rond · page d&apos;accueil</span>
            </div>
          </div>
        </div>

        {/* ── Pied de page ── */}
        <div className="flex items-center justify-between px-5 pb-5 pt-1 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border text-muted hover:bg-surface-alt text-sm font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing || naturalW === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-semibold
                       disabled:opacity-50 hover:opacity-85 transition-opacity"
            style={{ background: "#0F172A", fontFamily: "var(--font-heading)" }}
          >
            <Check className="w-4 h-4" />
            {processing ? "Traitement…" : "Valider le recadrage"}
          </button>
        </div>
      </div>
    </div>
  );
}
