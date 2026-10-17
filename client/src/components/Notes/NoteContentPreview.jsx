import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function NoteContentPreview({ content }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content ?? {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="note-content-preview">
      <EditorContent editor={editor} />
    </div>
  );
}
