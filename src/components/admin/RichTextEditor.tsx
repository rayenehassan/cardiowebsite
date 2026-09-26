"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import { useReducer } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  RemoveFormatting,
  Palette,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  /** Mode ligne unique : Enter insère un retour à la ligne, pas de boutons liste */
  inline?: boolean;
}

const TEXT_COLORS = [
  "#0f172a",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#db2777",
];

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

/** Mode inline : Enter insère un retour à la ligne dans le même élément au lieu de créer un nouveau paragraphe */
const InlineLineBreak = Extension.create({
  name: "inlineLineBreak",
  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.setHardBreak(),
      "Shift-Enter": () => this.editor.commands.setHardBreak(),
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
  const [colorPickerOpen, toggleColorPicker] = useReducer((x: boolean) => !x, false);

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
      TextStyle,
      Color,
      ...(inline ? [InlineLineBreak] : []),
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

  const activeColor = editor.getAttributes("textStyle").color as string | undefined;

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

        <div className="relative">
          <ToolbarButton
            onClick={toggleColorPicker}
            active={colorPickerOpen}
            title="Couleur du texte"
          >
            <Palette
              className="w-3.5 h-3.5"
              style={activeColor ? { color: activeColor } : undefined}
            />
          </ToolbarButton>
          {colorPickerOpen && (
            <div className="absolute z-10 top-full left-0 mt-1 p-2 bg-white border border-border rounded-lg shadow-lg flex flex-wrap gap-1.5 w-[104px]">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().unsetColor().run();
                  toggleColorPicker();
                }}
                title="Couleur par défaut"
                className="w-5 h-5 rounded-full border border-border shrink-0 overflow-hidden"
              >
                <svg viewBox="0 0 20 20" className="w-full h-full">
                  <line x1="3" y1="17" x2="17" y2="3" stroke="var(--color-danger)" strokeWidth="1.5" />
                </svg>
              </button>
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().setColor(color).run();
                    toggleColorPicker();
                  }}
                  title={color}
                  className={`w-5 h-5 rounded-full border shrink-0 ${
                    activeColor === color ? "ring-2 ring-offset-1 ring-primary" : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

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
        onMouseDownCapture={() => colorPickerOpen && toggleColorPicker()}
      />
    </div>
  );
}
