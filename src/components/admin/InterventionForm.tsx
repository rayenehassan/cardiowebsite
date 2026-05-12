"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Intervention, InterventionStatus, Section, SectionType } from "@/types/intervention";
import { useBeforeUnload, useFormDraft } from "@/lib/use-form-draft";
import DraftBanner from "./DraftBanner";
import {
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Type,
  ListOrdered,
  Video,
  Image as ImageIcon,
  FileText,
  HelpCircle,
  X,
  Link as LinkIcon,
  Folder,
} from "lucide-react";
import FileUpload from "./FileUpload";
import RichTextEditor from "./RichTextEditor";

interface Props {
  intervention?: Intervention;
  mode: "create" | "edit";
}

const SECTION_TYPE_META: Record<
  SectionType,
  { label: string; icon: React.ElementType; color: string }
> = {
  text: { label: "Texte", icon: Type, color: "bg-gray-100 text-gray-600" },
  list: { label: "Liste", icon: ListOrdered, color: "bg-blue-100 text-blue-600" },
  video: { label: "Vidéo", icon: Video, color: "bg-red-100 text-red-600" },
  image: { label: "Image", icon: ImageIcon, color: "bg-green-100 text-green-600" },
  document: { label: "Document", icon: FileText, color: "bg-amber-100 text-amber-600" },
  faqs: { label: "FAQ", icon: HelpCircle, color: "bg-purple-100 text-purple-600" },
};

const SECTION_TYPE_ORDER: SectionType[] = [
  "text",
  "list",
  "video",
  "image",
  "document",
  "faqs",
];

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function newSection(type: SectionType): Section {
  const base = { id: `s-${Date.now()}-${Math.random().toString(36).slice(2)}`, type, title: SECTION_TYPE_META[type].label };
  switch (type) {
    case "text": return { ...base, body: "" };
    case "list": return { ...base, items: [""], ordered: true };
    case "video": return { ...base, videoUrl: "", videoType: "youtube" };
    case "image": return { ...base, imageUrl: "", imageAlt: "" };
    case "document": return { ...base, documentUrl: "", isPublic: true };
    case "faqs": return { ...base, faqs: [{ id: `faq-${Date.now()}`, question: "", answer: "" }] };
  }
}

function moveItem<T>(arr: T[], index: number, dir: "up" | "down"): T[] {
  const next = [...arr];
  const target = dir === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= next.length) return arr;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function makeTemplateSection(type: SectionType, title: string, extra: Partial<Section> = {}): Section {
  return {
    id: `t-${type}-${Math.random().toString(36).slice(2)}`,
    type,
    title,
    ...extra,
  };
}

const BASE_TEMPLATE: Section[] = [
  makeTemplateSection("text", "Vue d'ensemble", { body: "" }),
  makeTemplateSection("text", "Pourquoi cette procédure ?", { body: "" }),
  makeTemplateSection("list", "Comment se préparer", {
    ordered: true,
    items: ["", "", ""],
  }),
  makeTemplateSection("text", "Pendant l'intervention", { body: "" }),
  makeTemplateSection("text", "Après l'intervention", { body: "" }),
  makeTemplateSection("list", "Risques", {
    ordered: false,
    items: ["", ""],
  }),
  makeTemplateSection("text", "Informations pratiques", { body: "" }),
  makeTemplateSection("faqs", "Questions fréquentes", {
    faqs: [
      { id: "tfaq-1", question: "", answer: "" },
      { id: "tfaq-2", question: "", answer: "" },
    ],
  }),
];

interface FormSnapshot {
  title: string;
  slug: string;
  subtitle: string;
  status: InterventionStatus;
  sections: Section[];
}

export default function InterventionForm({ intervention, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(intervention?.title || "");
  const [slug, setSlug] = useState(intervention?.slug || "");
  const [subtitle, setSubtitle] = useState(intervention?.subtitle || "");
  const [status, setStatus] = useState<InterventionStatus>(
    intervention?.status || "draft"
  );
  const [sections, setSections] = useState<Section[]>(
    intervention?.sections || []
  );

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [showPicker, setShowPicker] = useState(false);
  const [confirmTemplate, setConfirmTemplate] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // ── Brouillon localStorage + garde fermeture ──
  // `restoreVersion` est incrémenté à chaque restauration pour forcer
  // le remount des `RichTextEditor` (Tiptap n'observe pas la prop `content`
  // après initialisation : sans nouveau key, le contenu visible ne change pas).
  const [restoreVersion, setRestoreVersion] = useState(0);
  const draftKey = `cardio-draft:intervention:${intervention?.id ?? "new"}`;
  const snapshot: FormSnapshot = useMemo(
    () => ({ title, slug, subtitle, status, sections }),
    [title, slug, subtitle, status, sections]
  );
  const initialSnapshot = useMemo<FormSnapshot>(
    () => ({
      title: intervention?.title || "",
      slug: intervention?.slug || "",
      subtitle: intervention?.subtitle || "",
      status: intervention?.status || "draft",
      sections: intervention?.sections || [],
    }),
    [intervention]
  );
  const dirty = useMemo(
    () => JSON.stringify(snapshot) !== JSON.stringify(initialSnapshot),
    [snapshot, initialSnapshot]
  );
  useBeforeUnload(dirty);
  const { existingDraft, clear: clearDraft } = useFormDraft<FormSnapshot>(
    draftKey,
    snapshot,
    initialSnapshot
  );

  function restoreDraft() {
    if (!existingDraft) return;
    const v = existingDraft.value;
    setTitle(v.title || "");
    setSlug(v.slug || "");
    setSubtitle(v.subtitle || "");
    setStatus(v.status || "draft");
    setSections(Array.isArray(v.sections) ? v.sections : []);
    setRestoreVersion((n) => n + 1);
    clearDraft();
  }

  function loadTemplate() {
    setSections(BASE_TEMPLATE.map((s) => ({ ...s, id: `t-${Date.now()}-${Math.random().toString(36).slice(2)}` })));
    setConfirmTemplate(false);
  }

  function toggleCollapse(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (mode === "create") setSlug(slugify(value));
  }

  function addSection(type: SectionType) {
    setSections((prev) => [...prev, newSection(type)]);
    setShowPicker(false);
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
    setPendingDeleteId(null);
  }

  function moveSection(index: number, dir: "up" | "down") {
    setSections((prev) => moveItem(prev, index, dir));
  }

  function updateSection(id: string, patch: Partial<Section>) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  }

  // List item helpers
  function addListItem(sectionId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, items: [...(s.items || []), ""] } : s
      )
    );
  }
  function updateListItem(sectionId: string, index: number, value: string) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const items = [...(s.items || [])];
        items[index] = value;
        return { ...s, items };
      })
    );
  }
  function removeListItem(sectionId: string, index: number) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, items: (s.items || []).filter((_, i) => i !== index) }
          : s
      )
    );
  }
  function moveListItem(sectionId: string, index: number, dir: "up" | "down") {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, items: moveItem(s.items || [], index, dir) }
          : s
      )
    );
  }

  // FAQ helpers
  function addFaq(sectionId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              faqs: [
                ...(s.faqs || []),
                { id: `faq-${Date.now()}`, question: "", answer: "" },
              ],
            }
          : s
      )
    );
  }
  function updateFaq(
    sectionId: string,
    faqIndex: number,
    field: "question" | "answer",
    value: string
  ) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const faqs = [...(s.faqs || [])];
        faqs[faqIndex] = { ...faqs[faqIndex], [field]: value };
        return { ...s, faqs };
      })
    );
  }
  function removeFaq(sectionId: string, faqIndex: number) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, faqs: (s.faqs || []).filter((_, i) => i !== faqIndex) }
          : s
      )
    );
  }
  function moveFaq(sectionId: string, index: number, dir: "up" | "down") {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, faqs: moveItem(s.faqs || [], index, dir) }
          : s
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const body = { title, slug, subtitle, status, sections };
    try {
      const url =
        mode === "create"
          ? "/api/admin/interventions"
          : `/api/admin/interventions/${intervention!.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setError(
            "Votre session a expiré. Votre brouillon est sauvegardé localement : reconnectez-vous puis rouvrez cette fiche pour le restaurer."
          );
        } else {
          setError(data.error || "Échec de l'enregistrement");
        }
        return;
      }
      clearDraft();
      router.push("/admin/interventions");
      router.refresh();
    } catch {
      setError("Une erreur est survenue pendant l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary-light focus:border-primary-light outline-none transition-colors bg-white text-sm";
  const labelClass = "block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wider";

  function renderSectionEditor(section: Section, index: number) {
    const isCollapsed = collapsed.has(section.id);
    const meta = SECTION_TYPE_META[section.type];
    const Icon = meta.icon;

    return (
      <div
        key={section.id}
        className="bg-white rounded-xl border border-border overflow-hidden"
      >
        {/* Section header */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-surface border-b border-border">
          {/* Reorder buttons */}
          <div className="flex flex-col shrink-0">
            <button
              type="button"
              onClick={() => moveSection(index, "up")}
              disabled={index === 0}
              className="p-0.5 text-muted hover:text-foreground disabled:opacity-20 transition-colors"
              title="Monter"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => moveSection(index, "down")}
              disabled={index === sections.length - 1}
              className="p-0.5 text-muted hover:text-foreground disabled:opacity-20 transition-colors"
              title="Descendre"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Type badge */}
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${meta.color}`}>
            <Icon className="w-3 h-3" />
            {meta.label}
          </span>

          {/* Editable title */}
          <input
            type="text"
            value={section.title}
            onChange={(e) => updateSection(section.id, { title: e.target.value })}
            className="flex-1 min-w-0 text-sm font-semibold text-foreground bg-transparent border-none outline-none placeholder:text-muted"
            placeholder="Titre de la section"
          />

          {/* Collapse + delete */}
          {pendingDeleteId === section.id ? (
            /* Confirmation inline */
            <div className="flex items-center gap-1.5 shrink-0 animate-in fade-in duration-150">
              <span className="text-xs font-medium text-danger whitespace-nowrap">
                Supprimer ?
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
                onClick={() => removeSection(section.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-white bg-danger hover:opacity-85 transition-opacity"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <Trash2 className="w-3 h-3" />
                Supprimer
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => toggleCollapse(section.id)}
                className="p-1 text-muted hover:text-foreground transition-colors shrink-0"
                title={isCollapsed ? "Développer" : "Réduire"}
              >
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                />
              </button>
              <button
                type="button"
                onClick={() => setPendingDeleteId(section.id)}
                className="p-1 text-muted hover:text-danger transition-colors shrink-0"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Section content */}
        {!isCollapsed && (
          <div className="p-4 space-y-3">
            {section.type === "text" && (
              <>
                <label className={labelClass}>Contenu</label>
                <RichTextEditor
                  key={`${section.id}-body-${restoreVersion}`}
                  value={section.body || ""}
                  onChange={(html) => updateSection(section.id, { body: html })}
                  placeholder="Saisissez votre texte…"
                />
              </>
            )}

            {section.type === "list" && (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <label className={labelClass + " mb-0"}>Type de liste</label>
                  <label className="flex items-center gap-1.5 text-sm text-foreground cursor-pointer">
                    <input
                      type="radio"
                      checked={section.ordered !== false}
                      onChange={() => updateSection(section.id, { ordered: true })}
                    />
                    Numérotée
                  </label>
                  <label className="flex items-center gap-1.5 text-sm text-foreground cursor-pointer">
                    <input
                      type="radio"
                      checked={section.ordered === false}
                      onChange={() => updateSection(section.id, { ordered: false })}
                    />
                    À puces
                  </label>
                </div>
                <div className="space-y-2">
                  {(section.items || []).map((item, i) => (
                    <div key={i} className="flex gap-1.5 items-start">
                      <div className="flex flex-col shrink-0 mt-2">
                        <button
                          type="button"
                          onClick={() => moveListItem(section.id, i, "up")}
                          disabled={i === 0}
                          className="p-0.5 text-muted hover:text-foreground disabled:opacity-20 transition-colors"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveListItem(section.id, i, "down")}
                          disabled={i === (section.items || []).length - 1}
                          className="p-0.5 text-muted hover:text-foreground disabled:opacity-20 transition-colors"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs text-muted w-5 text-right shrink-0 mt-3">
                        {section.ordered !== false ? `${i + 1}.` : "•"}
                      </span>
                      <div className="flex-1">
                        <RichTextEditor
                          key={`${section.id}-item-${i}-${restoreVersion}`}
                          inline
                          value={item}
                          onChange={(html) => updateListItem(section.id, i, html)}
                          placeholder="Élément…"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeListItem(section.id, i)}
                        className="p-1 text-muted hover:text-danger transition-colors shrink-0 mt-2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addListItem(section.id)}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium mt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter un élément
                  </button>
                </div>
              </>
            )}

            {section.type === "video" && (
              <>
                {/* Onglets Fichier / Lien */}
                <div className="flex items-center gap-1 p-1 bg-surface rounded-lg border border-border w-fit mb-1">
                  <button
                    type="button"
                    onClick={() => updateSection(section.id, { videoType: "file", videoUrl: "" })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      (section.videoType ?? "youtube") === "file"
                        ? "bg-white text-foreground shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <Folder className="w-3 h-3" />
                    Fichier
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSection(section.id, { videoType: "youtube", videoUrl: "" })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      (section.videoType ?? "youtube") !== "file"
                        ? "bg-white text-foreground shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    Lien YouTube / Vimeo
                  </button>
                </div>

                {(section.videoType ?? "youtube") === "file" ? (
                  <FileUpload
                    kind="video"
                    value={section.videoUrl || undefined}
                    onChange={(url) => updateSection(section.id, { videoUrl: url, videoType: "file" })}
                    onClear={() => updateSection(section.id, { videoUrl: "", videoType: "file" })}
                  />
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>URL YouTube ou Vimeo</label>
                      <input
                        type="text"
                        value={section.videoUrl || ""}
                        onChange={(e) => updateSection(section.id, { videoUrl: e.target.value })}
                        className={inputClass}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Plateforme</label>
                      <select
                        value={section.videoType || "youtube"}
                        onChange={(e) =>
                          updateSection(section.id, {
                            videoType: e.target.value as Section["videoType"],
                          })
                        }
                        className={inputClass}
                      >
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}

            {section.type === "image" && (
              <>
                <FileUpload
                  kind="image"
                  value={section.imageUrl || undefined}
                  onChange={(url) => updateSection(section.id, { imageUrl: url })}
                  onClear={() => updateSection(section.id, { imageUrl: "" })}
                />
                <div>
                  <label className={labelClass}>Texte alternatif (accessibilité)</label>
                  <input
                    type="text"
                    value={section.imageAlt || ""}
                    onChange={(e) => updateSection(section.id, { imageAlt: e.target.value })}
                    className={inputClass}
                    placeholder="Description de l'image pour les lecteurs d'écran"
                  />
                </div>
              </>
            )}

            {section.type === "document" && (
              <>
                <FileUpload
                  kind="document"
                  value={section.documentUrl || undefined}
                  onChange={(url) => updateSection(section.id, { documentUrl: url })}
                  onClear={() => updateSection(section.id, { documentUrl: "" })}
                />
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={section.isPublic !== false}
                    onChange={(e) =>
                      updateSection(section.id, { isPublic: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                  Visible par les patients
                </label>
              </>
            )}

            {section.type === "faqs" && (
              <div className="space-y-3">
                {(section.faqs || []).map((faq, i) => (
                  <div
                    key={faq.id}
                    className="border border-border rounded-lg p-3 space-y-2 bg-surface"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="flex flex-col shrink-0">
                        <button
                          type="button"
                          onClick={() => moveFaq(section.id, i, "up")}
                          disabled={i === 0}
                          className="p-0.5 text-muted hover:text-foreground disabled:opacity-20 transition-colors"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFaq(section.id, i, "down")}
                          disabled={i === (section.faqs || []).length - 1}
                          className="p-0.5 text-muted hover:text-foreground disabled:opacity-20 transition-colors"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-medium text-muted flex-1">
                        Q{i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFaq(section.id, i)}
                        className="p-1 text-muted hover:text-danger transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) =>
                        updateFaq(section.id, i, "question", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Question"
                    />
                    <RichTextEditor
                      key={`${faq.id}-${restoreVersion}`}
                      value={faq.answer}
                      onChange={(html) => updateFaq(section.id, i, "answer", html)}
                      placeholder="Réponse…"
                      minHeight="80px"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addFaq(section.id)}
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter une question
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
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

      {/* General info — fixed */}
      <fieldset className="bg-white rounded-xl border border-border p-5 space-y-4">
        <legend className="text-lg font-semibold text-foreground px-1" style={{ fontFamily: "var(--font-heading)" }}>
          Informations générales
        </legend>

        <div>
          <label htmlFor="title" className={labelClass}>
            Titre *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className={inputClass}
            placeholder="ex. Coronarographie"
          />
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>
            Slug d&apos;URL *
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className={inputClass}
            placeholder="ex. coronarographie"
          />
          <p className="text-xs text-muted mt-1">
            URL : /interventions/{slug || "..."}
          </p>
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
            placeholder="Description courte affichée sur les cartes"
          />
        </div>

      </fieldset>

      {/* Content blocks */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">
            Contenu — {sections.length} section{sections.length !== 1 ? "s" : ""}
          </p>

          {sections.length > 0 && (
            confirmTemplate ? (
              <span className="flex items-center gap-2 text-xs">
                <span className="text-danger font-medium">
                  Cela supprimera toutes vos sections actuelles. Continuer ?
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmTemplate(false)}
                  className="px-2 py-1 rounded-md text-xs font-medium text-muted bg-white border border-border hover:bg-surface transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={loadTemplate}
                  className="px-2 py-1 rounded-md text-xs font-semibold text-white bg-danger hover:opacity-85 transition-opacity"
                >
                  Effacer et charger le modèle
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmTemplate(true)}
                className="text-xs text-muted hover:text-primary transition-colors"
              >
                Effacer et charger le modèle de base
              </button>
            )
          )}
        </div>

        {sections.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-border p-8 text-center space-y-4">
            <p className="text-muted text-sm">Aucune section pour l&apos;instant.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={loadTemplate}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-opacity hover:opacity-85"
                style={{ background: "#0F172A", fontFamily: "var(--font-heading)" }}
              >
                Charger le modèle de base
              </button>
              <span className="text-xs text-muted">ou ajoutez des sections manuellement ci-dessous</span>
            </div>
          </div>
        )}

        {sections.map((section, index) =>
          renderSectionEditor(section, index)
        )}

        {/* Add section picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPicker((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted hover:border-primary hover:text-primary transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Ajouter une section
          </button>

          {showPicker && (
            <div className="absolute left-0 right-0 top-full mt-1 z-10 bg-white rounded-xl border border-border shadow-lg p-3 grid grid-cols-3 gap-2">
              {SECTION_TYPE_ORDER.map((type) => {
                const meta = SECTION_TYPE_META[type];
                const Icon = meta.icon;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addSection(type)}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-surface-alt transition-colors text-center"
                  >
                    <span className={`w-10 h-10 flex items-center justify-center rounded-lg ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status + submit row */}
      <div className="bg-white rounded-xl border border-border p-4 flex flex-wrap items-center gap-4">
        {/* Publish toggle */}
        <div className="flex items-center gap-1 p-1 bg-surface rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setStatus("draft")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              status === "draft"
                ? "bg-amber-100 text-amber-700"
                : "text-muted hover:text-foreground"
            }`}
          >
            Brouillon
          </button>
          <button
            type="button"
            onClick={() => setStatus("published")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              status === "published"
                ? "bg-green-100 text-green-700"
                : "text-muted hover:text-foreground"
            }`}
          >
            ● Publié
          </button>
        </div>

        <div className="flex items-center gap-3 ml-auto">
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
      </div>
    </form>
  );
}
