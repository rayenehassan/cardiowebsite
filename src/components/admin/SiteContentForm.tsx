"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Save,
  RotateCcw,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Heart,
  Lock,
  Shield,
  BookOpen,
  Users,
} from "lucide-react";
import {
  SiteBadge,
  SiteContent,
  BadgeIcon,
} from "@/types/site";
import { DEFAULT_SITE_CONTENT } from "@/lib/site-defaults";
import { useBeforeUnload, useFormDraft } from "@/lib/use-form-draft";
import DraftBanner from "./DraftBanner";
import RichTextEditor from "./RichTextEditor";

/**
 * Convertit un texte brut (legacy) en HTML basique pour Tiptap : double saut
 * de ligne = paragraphe, saut simple = <br>. Si l'entrée est déjà du HTML
 * (commence par `<`), retourne tel quel.
 */
function plainToHtml(text: string): string {
  if (!text) return "";
  if (text.trimStart().startsWith("<")) return text;
  return text
    .split(/\n{2,}/)
    .map((para) => `<p>${para.trim().replace(/\n/g, "<br>")}</p>`)
    .join("");
}

interface Props {
  initial: SiteContent;
}

const BADGE_ICONS: Record<BadgeIcon, React.ElementType> = {
  heart: Heart,
  lock: Lock,
  shield: Shield,
  book: BookOpen,
  users: Users,
};

const BADGE_ICON_LABEL: Record<BadgeIcon, string> = {
  heart: "Cœur",
  lock: "Cadenas",
  shield: "Bouclier",
  book: "Livre",
  users: "Personnes",
};

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary-light outline-none transition-colors bg-white text-sm";
const labelClass =
  "block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider";

type SectionKey =
  | "brand"
  | "hero"
  | "interventionsSection"
  | "teamSection"
  | "importantInfo"
  | "footer"
  | "legalNotice";

const SECTION_LABEL: Record<SectionKey, string> = {
  brand: "Marque (en-tête et pied de page)",
  hero: "Bannière principale (Hero)",
  interventionsSection: "Section interventions",
  teamSection: "Section équipe médicale",
  importantInfo: "Information importante",
  footer: "Pied de page",
  legalNotice: "Mentions légales",
};

function moveItem<T>(arr: T[], index: number, dir: "up" | "down"): T[] {
  const next = [...arr];
  const target = dir === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= next.length) return arr;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

interface SectionHeaderProps {
  sectionKey: SectionKey;
  isCollapsed: boolean;
  confirmReset: SectionKey | null;
  onToggle: () => void;
  onAskReset: () => void;
  onConfirmReset: () => void;
  onCancelReset: () => void;
}

function SectionHeader({
  sectionKey,
  isCollapsed,
  confirmReset,
  onToggle,
  onAskReset,
  onConfirmReset,
  onCancelReset,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-surface border-b border-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 flex-1 min-w-0 text-left"
      >
        <ChevronRight
          className={`w-4 h-4 text-muted transition-transform ${
            isCollapsed ? "" : "rotate-90"
          }`}
        />
        <span
          className="font-semibold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {SECTION_LABEL[sectionKey]}
        </span>
      </button>

      {confirmReset === sectionKey ? (
        <span className="flex items-center gap-2 text-xs">
          <span className="text-muted">Restaurer les valeurs par défaut ?</span>
          <button
            type="button"
            onClick={onConfirmReset}
            className="text-danger font-medium hover:underline"
          >
            Oui
          </button>
          <button
            type="button"
            onClick={onCancelReset}
            className="text-muted hover:underline"
          >
            Non
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={onAskReset}
          className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
          title="Restaurer les valeurs par défaut"
        >
          <RotateCcw className="w-3 h-3" />
          Réinitialiser
        </button>
      )}
    </div>
  );
}

export default function SiteContentForm({ initial }: Props) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(initial);
  const [collapsed, setCollapsed] = useState<Set<SectionKey>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState<SectionKey | null>(null);

  // ── Brouillon localStorage + garde fermeture ──
  const draftKey = "cardio-draft:site-content";
  const dirty = useMemo(
    () => JSON.stringify(content) !== JSON.stringify(initial),
    [content, initial]
  );
  useBeforeUnload(dirty);
  const { existingDraft, clear: clearDraft } = useFormDraft<SiteContent>(
    draftKey,
    content,
    initial
  );

  function restoreDraft() {
    if (!existingDraft) return;
    setContent(existingDraft.value);
    clearDraft();
  }

  function toggle(key: SectionKey) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function patch<K extends SectionKey>(
    key: K,
    value: SiteContent[K]
  ) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  function resetSection(key: SectionKey) {
    setContent((prev) => ({ ...prev, [key]: DEFAULT_SITE_CONTENT[key] }));
    setConfirmReset(null);
  }

  // ── Badges helpers ────────────────────────────────────────────────────────

  function addBadge() {
    const badges = [
      ...content.interventionsSection.badges,
      { icon: "heart" as BadgeIcon, label: "" },
    ];
    patch("interventionsSection", { ...content.interventionsSection, badges });
  }

  function updateBadge(index: number, change: Partial<SiteBadge>) {
    const badges = content.interventionsSection.badges.map((b, i) =>
      i === index ? { ...b, ...change } : b
    );
    patch("interventionsSection", { ...content.interventionsSection, badges });
  }

  function removeBadge(index: number) {
    const badges = content.interventionsSection.badges.filter(
      (_, i) => i !== index
    );
    patch("interventionsSection", { ...content.interventionsSection, badges });
  }

  function moveBadge(index: number, dir: "up" | "down") {
    const badges = moveItem(content.interventionsSection.badges, index, dir);
    patch("interventionsSection", { ...content.interventionsSection, badges });
  }

  // ── Footer contact lines helpers ──────────────────────────────────────────

  function addContactLine() {
    patch("footer", {
      ...content.footer,
      contact: {
        ...content.footer.contact,
        lines: [...content.footer.contact.lines, ""],
      },
    });
  }

  function updateContactLine(index: number, value: string) {
    patch("footer", {
      ...content.footer,
      contact: {
        ...content.footer.contact,
        lines: content.footer.contact.lines.map((l, i) =>
          i === index ? value : l
        ),
      },
    });
  }

  function removeContactLine(index: number) {
    patch("footer", {
      ...content.footer,
      contact: {
        ...content.footer.contact,
        lines: content.footer.contact.lines.filter((_, i) => i !== index),
      },
    });
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  // Masque le toast "Enregistré" 4s après l'apparition, avec cleanup propre.
  useEffect(() => {
    if (!showSuccess) return;
    const timer = window.setTimeout(() => setShowSuccess(false), 4000);
    return () => window.clearTimeout(timer);
  }, [showSuccess]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setShowSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setError(
            "Votre session a expiré. Votre brouillon est sauvegardé localement : reconnectez-vous puis revenez sur cette page pour le restaurer."
          );
        } else {
          setError(data.error || "Échec de l'enregistrement.");
        }
        return;
      }
      const saved = (await res.json()) as SiteContent;
      setContent(saved); // resync avec le serveur (au cas où il normalise)
      clearDraft();
      setShowSuccess(true);
      router.refresh();
    } catch {
      setError("Une erreur est survenue pendant l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  function headerProps(k: SectionKey): SectionHeaderProps {
    return {
      sectionKey: k,
      isCollapsed: collapsed.has(k),
      confirmReset,
      onToggle: () => toggle(k),
      onAskReset: () => setConfirmReset(k),
      onConfirmReset: () => resetSection(k),
      onCancelReset: () => setConfirmReset(null),
    };
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-5xl">
      {existingDraft && (
        <DraftBanner
          savedAt={existingDraft.savedAt}
          onRestore={restoreDraft}
          onIgnore={clearDraft}
        />
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Brand */}
      <fieldset className="bg-white rounded-xl border border-border overflow-hidden">
        <SectionHeader {...headerProps("brand")} />
        {!collapsed.has("brand") && (
          <div className="p-5 space-y-4">
            <div>
              <label className={labelClass}>Nom (ex. Ramsay Santé)</label>
              <input
                type="text"
                value={content.brand.name}
                onChange={(e) =>
                  patch("brand", { ...content.brand, name: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Sous-titre (ex. Hôpital privé de la Loire)</label>
              <input
                type="text"
                value={content.brand.subtitle}
                onChange={(e) =>
                  patch("brand", { ...content.brand, subtitle: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>
        )}
      </fieldset>

      {/* Hero */}
      <fieldset className="bg-white rounded-xl border border-border overflow-hidden">
        <SectionHeader {...headerProps("hero")} />
        {!collapsed.has("hero") && (
          <div className="p-5 space-y-4">
            <div>
              <label className={labelClass}>Étiquette de localisation</label>
              <input
                type="text"
                value={content.hero.locationLabel}
                onChange={(e) =>
                  patch("hero", { ...content.hero, locationLabel: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Début du titre</label>
                <input
                  type="text"
                  value={content.hero.titleBefore}
                  onChange={(e) =>
                    patch("hero", { ...content.hero, titleBefore: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Fin du titre (mis en évidence)</label>
                <input
                  type="text"
                  value={content.hero.titleHighlight}
                  onChange={(e) =>
                    patch("hero", { ...content.hero, titleHighlight: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Sous-titre</label>
              <textarea
                value={content.hero.subtitle}
                onChange={(e) =>
                  patch("hero", { ...content.hero, subtitle: e.target.value })
                }
                className={inputClass + " min-h-[80px]"}
              />
            </div>
            <div>
              <label className={labelClass}>Texte du bouton</label>
              <input
                type="text"
                value={content.hero.ctaLabel}
                onChange={(e) =>
                  patch("hero", { ...content.hero, ctaLabel: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>
        )}
      </fieldset>

      {/* Interventions section */}
      <fieldset className="bg-white rounded-xl border border-border overflow-hidden">
        <SectionHeader {...headerProps("interventionsSection")} />
        {!collapsed.has("interventionsSection") && (
          <div className="p-5 space-y-4">
            <div>
              <label className={labelClass}>Étiquette (kicker)</label>
              <input
                type="text"
                value={content.interventionsSection.kicker}
                onChange={(e) =>
                  patch("interventionsSection", {
                    ...content.interventionsSection,
                    kicker: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Titre</label>
              <input
                type="text"
                value={content.interventionsSection.title}
                onChange={(e) =>
                  patch("interventionsSection", {
                    ...content.interventionsSection,
                    title: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Sous-titre</label>
              <textarea
                value={content.interventionsSection.subtitle}
                onChange={(e) =>
                  patch("interventionsSection", {
                    ...content.interventionsSection,
                    subtitle: e.target.value,
                  })
                }
                className={inputClass + " min-h-[60px]"}
              />
            </div>

            <div>
              <label className={labelClass}>Badges de confiance</label>
              <div className="space-y-2">
                {content.interventionsSection.badges.map((badge, i) => {
                  const Icon = BADGE_ICONS[badge.icon];
                  return (
                    <div
                      key={i}
                      className="flex gap-1.5 items-start border border-border rounded-lg p-2 bg-surface"
                    >
                      <div className="flex flex-col shrink-0 mt-1.5">
                        <button
                          type="button"
                          onClick={() => moveBadge(i, "up")}
                          disabled={i === 0}
                          className="p-0.5 text-muted hover:text-foreground disabled:opacity-20 transition-colors"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBadge(i, "down")}
                          disabled={
                            i === content.interventionsSection.badges.length - 1
                          }
                          className="p-0.5 text-muted hover:text-foreground disabled:opacity-20 transition-colors"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      <select
                        value={badge.icon}
                        onChange={(e) =>
                          updateBadge(i, { icon: e.target.value as BadgeIcon })
                        }
                        className="px-2 py-2 border border-border rounded-md bg-white text-sm shrink-0"
                      >
                        {(Object.keys(BADGE_ICONS) as BadgeIcon[]).map((k) => (
                          <option key={k} value={k}>
                            {BADGE_ICON_LABEL[k]}
                          </option>
                        ))}
                      </select>
                      <div className="w-8 h-9 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <input
                        type="text"
                        value={badge.label}
                        onChange={(e) =>
                          updateBadge(i, { label: e.target.value })
                        }
                        placeholder="Texte du badge…"
                        className="flex-1 min-w-0 px-2.5 py-2 border border-border rounded-md bg-white text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeBadge(i)}
                        className="p-2 text-muted hover:text-danger transition-colors shrink-0"
                        title="Retirer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={addBadge}
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter un badge
                </button>
              </div>
            </div>
          </div>
        )}
      </fieldset>

      {/* Team section */}
      <fieldset className="bg-white rounded-xl border border-border overflow-hidden">
        <SectionHeader {...headerProps("teamSection")} />
        {!collapsed.has("teamSection") && (
          <div className="p-5 space-y-4">
            <div>
              <label className={labelClass}>Étiquette (kicker)</label>
              <input
                type="text"
                value={content.teamSection.kicker}
                onChange={(e) =>
                  patch("teamSection", {
                    ...content.teamSection,
                    kicker: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Titre</label>
              <input
                type="text"
                value={content.teamSection.title}
                onChange={(e) =>
                  patch("teamSection", {
                    ...content.teamSection,
                    title: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Sous-titre</label>
              <textarea
                value={content.teamSection.subtitle}
                onChange={(e) =>
                  patch("teamSection", {
                    ...content.teamSection,
                    subtitle: e.target.value,
                  })
                }
                className={inputClass + " min-h-[60px]"}
              />
            </div>
            <p className="text-xs text-muted">
              Les cardiologues affichés dans cette section se modifient depuis
              l&apos;onglet <strong>Équipe médicale</strong>.
            </p>
          </div>
        )}
      </fieldset>

      {/* Important info */}
      <fieldset className="bg-white rounded-xl border border-border overflow-hidden">
        <SectionHeader {...headerProps("importantInfo")} />
        {!collapsed.has("importantInfo") && (
          <div className="p-5 space-y-4">
            <div>
              <label className={labelClass}>Titre</label>
              <input
                type="text"
                value={content.importantInfo.title}
                onChange={(e) =>
                  patch("importantInfo", {
                    ...content.importantInfo,
                    title: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Texte</label>
              <textarea
                value={content.importantInfo.body}
                onChange={(e) =>
                  patch("importantInfo", {
                    ...content.importantInfo,
                    body: e.target.value,
                  })
                }
                className={inputClass + " min-h-[140px]"}
              />
            </div>
          </div>
        )}
      </fieldset>

      {/* Footer */}
      <fieldset className="bg-white rounded-xl border border-border overflow-hidden">
        <SectionHeader {...headerProps("footer")} />
        {!collapsed.has("footer") && (
          <div className="p-5 space-y-4">
            <div>
              <label className={labelClass}>Description (sous le logo)</label>
              <textarea
                value={content.footer.description}
                onChange={(e) =>
                  patch("footer", {
                    ...content.footer,
                    description: e.target.value,
                  })
                }
                className={inputClass + " min-h-[80px]"}
              />
            </div>

            <div>
              <label className={labelClass}>Lignes d&apos;adresse</label>
              <div className="space-y-2">
                {content.footer.contact.lines.map((line, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={line}
                      onChange={(e) => updateContactLine(i, e.target.value)}
                      placeholder="ex. Hôpital Privé de la Loire"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => removeContactLine(i)}
                      className="p-2 text-muted hover:text-danger transition-colors shrink-0"
                      title="Retirer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addContactLine}
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter une ligne
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Téléphone affiché</label>
                <input
                  type="text"
                  value={content.footer.contact.phoneLabel}
                  onChange={(e) =>
                    patch("footer", {
                      ...content.footer,
                      contact: {
                        ...content.footer.contact,
                        phoneLabel: e.target.value,
                      },
                    })
                  }
                  placeholder="Tél. : 04 78 22 91 12"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Lien tel: (sans espaces)</label>
                <input
                  type="text"
                  value={content.footer.contact.phoneHref}
                  onChange={(e) =>
                    patch("footer", {
                      ...content.footer,
                      contact: {
                        ...content.footer.contact,
                        phoneHref: e.target.value,
                      },
                    })
                  }
                  placeholder="tel:0478229112"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Mention en bas (gauche)</label>
              <textarea
                value={content.footer.bottomNote}
                onChange={(e) =>
                  patch("footer", {
                    ...content.footer,
                    bottomNote: e.target.value,
                  })
                }
                className={inputClass + " min-h-[60px]"}
              />
            </div>
          </div>
        )}
      </fieldset>

      {/* Legal Notice */}
      <fieldset className="bg-white rounded-xl border border-border overflow-hidden">
        <SectionHeader {...headerProps("legalNotice")} />
        {!collapsed.has("legalNotice") && (
          <div className="p-5 space-y-4">
            <div>
              <label className={labelClass}>Titre de la page</label>
              <input
                type="text"
                value={content.legalNotice.title}
                onChange={(e) =>
                  patch("legalNotice", {
                    ...content.legalNotice,
                    title: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Contenu (obligatoire en France — éditeur, directeur de publication,
                hébergeur, données personnelles, etc.)
              </label>
              <RichTextEditor
                value={plainToHtml(content.legalNotice.body)}
                onChange={(html) =>
                  patch("legalNotice", {
                    ...content.legalNotice,
                    body: html,
                  })
                }
                placeholder="Saisissez les mentions légales…"
                minHeight="320px"
              />
              <p className="text-xs text-muted mt-1.5">
                Gras, italique, listes disponibles. Page publique :{" "}
                <a
                  href="/mentions-legales"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  /mentions-legales ↗
                </a>
              </p>
            </div>
          </div>
        )}
      </fieldset>

      {/* Sticky action bar */}
      <div className="sticky bottom-4 bg-white rounded-xl border border-border p-3 flex flex-wrap items-center gap-3 shadow-sm">
        {showSuccess && (
          <span className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-2.5 py-1">
            Enregistré.
          </span>
        )}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-sm text-muted hover:text-foreground transition-colors"
        >
          Voir le site public ↗
        </a>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-opacity hover:opacity-85"
          style={{ background: "#0F172A", fontFamily: "var(--font-heading)" }}
        >
          <Save className="w-4 h-4" />
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
