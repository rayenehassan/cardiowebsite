"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import { useReducer } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  RemoveFormatting,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  /** Mode ligne unique : Enter désactivé, pas de boutons liste */
  inline?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

/** Empêche Enter de créer un nouveau paragraphe (mode inline) */
const PreventEnter = Extension.create({
  name: "preventEnter",
  addKeyboardShortcuts() {
    return {
      Enter: () => true,
      "Shift-Enter": () => true,
    };
  },
});

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? "bg-gray-200 text-gray-900"
          : "text-muted hover:text-foreground hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />;
}

/** Extrait le contenu HTML sans le wrapper <p> externe (pour mode inline) */
function stripParagraph(html: string): string {
  return html.replace(/^<p>([\s\S]*)<\/p>$/, "$1");
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight,
  inline = false,
}: Props) {
  const defaultHeight = inline ? "38px" : "120px";
  const [, rerender] = useReducer((x: number) => x + 1, 0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        // En mode inline, on désactive aussi les listes dans le moteur
        bulletList: inline ? false : undefined,
        orderedList: inline ? false : undefined,
        listItem: inline ? false : undefined,
      }),
      Underline,
      ...(inline ? [PreventEnter] : []),
    ],
    content: value || "",
    onSelectionUpdate() {
      rerender();
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      if (html === "<p></p>") { onChange(""); return; }
      onChange(inline ? stripParagraph(html) : html);
      rerender();
    },
    editorProps: {
      attributes: {
        class: "outline-none",
        "data-placeholder": placeholder || "Saisissez votre texte…",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary-light focus-within:border-primary-light transition-all">
      {/* ── Barre d'outils ── */}
      <div
        className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-surface flex-wrap"
        onMouseDown={(e) => e.preventDefault()}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Gras (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italique (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Souligné (Ctrl+U)"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Barré"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolbarButton>

        {!inline && (
          <>
            <Divider />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive("bulletList")}
              title="Liste à puces"
            >
              <List className="w-3.5 h-3.5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive("orderedList")}
              title="Liste numérotée"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </ToolbarButton>
          </>
        )}

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Effacer la mise en forme"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>

      {/* ── Zone d'édition ── */}
      <EditorContent
        editor={editor}
        className="rich-editor px-3 py-2"
        style={{ minHeight: minHeight ?? defaultHeight }}
      />
    </div>
  );
}
