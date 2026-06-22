"use client";

import { Field } from "@pharmacie/ui";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, type ComponentProps } from "react";

interface RichTextEditorProps {
  label: string;
  htmlFor: string;
  name: string;
  defaultValue: string;
  hint?: string;
}

function ToolbarButton({ active, ...props }: { active?: boolean } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-brand-100 text-brand-700"
          : "text-muted hover:bg-bg-subtle hover:text-foreground"
      }`}
      {...props}
    />
  );
}

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-line px-2 py-1.5">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Gras"
      >
        <strong>G</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italique"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Souligné"
      >
        <span className="underline">S</span>
      </ToolbarButton>

      <span className="mx-1 h-4 w-px bg-line" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Titre"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Sous-titre"
      >
        H3
      </ToolbarButton>

      <span className="mx-1 h-4 w-px bg-line" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Liste à puces"
      >
        • Liste
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Liste numérotée"
      >
        1. Liste
      </ToolbarButton>

      <span className="mx-1 h-4 w-px bg-line" />

      <ToolbarButton
        onClick={() => {
          if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
            return;
          }
          const url = window.prompt("URL du lien :");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        active={editor.isActive("link")}
        title="Lien"
      >
        🔗 Lien
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({ label, htmlFor, name, defaultValue, hint }: RichTextEditorProps) {
  const hiddenRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content: defaultValue,
    onUpdate: ({ editor: e }) => {
      if (hiddenRef.current) {
        hiddenRef.current.value = e.isEmpty ? "" : e.getHTML();
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm min-h-48 max-w-none px-3 py-2 outline-none " +
          "[&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-base [&_h3]:font-semibold " +
          "[&_a]:text-brand-700 [&_a]:underline " +
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
      },
    },
  });

  return (
    <Field label={label} htmlFor={htmlFor} hint={hint}>
      <input type="hidden" ref={hiddenRef} name={name} defaultValue={defaultValue} />
      <div className="overflow-hidden rounded-sm border border-line bg-surface focus-within:ring-2 focus-within:ring-brand-300">
        <Toolbar editor={editor} />
        <EditorContent editor={editor} id={htmlFor} />
      </div>
    </Field>
  );
}
