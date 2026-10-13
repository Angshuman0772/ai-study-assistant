import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import "./tiptap-editor.css";

export default function TiptapEditor({
  initialContent = null,
  onContentChange,
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing..." }),
    ],
    content: initialContent,

    onUpdate: ({ editor }) => {
      // Get the complete formatted document as JSON.
      const content = editor.getJSON();

      if (onContentChange) {
        onContentChange(content);
      }
    },
  });

  if (!editor) {
    return <p>Loading editor...</p>;
  }

  const buttonClass = (active = false) =>
    `rounded-md px-3 py-2 text-sm transition ${
      active
        ? "bg-blue-100 text-blue-700"
        : "text-text hover:bg-accent hover hover:text-gray-900"
    }`;

  return (
    <div className="max-w-5xl mx-auto overflow-hidden rounded-xl border border-border ">
      {/* Toolbar */}
      <div className=" bg-surface text-text flex flex-wrap items-center gap-1 border-b border-border p-2">
        <button
          type="button"
          className={buttonClass(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive("strike"))}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </button>

        <div className="mx-1 h-6 border-l border-gray-200" />

        <button
          type="button"
          className={buttonClass(editor.isActive("heading", { level: 1 }))}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive("heading", { level: 2 }))}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullets
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbering
        </button>

        <div className="mx-1 h-6 border-l border-gray-200" />

        <button
          type="button"
          className={buttonClass()}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          Undo
        </button>

        <button
          type="button"
          className={buttonClass()}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          Redo
        </button>
      </div>

      {/* Editable area */}
      <EditorContent editor={editor} />
    </div>
  );
}
