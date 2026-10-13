// This component renders the note editor overlay

import TiptapEditor from "../TipTap";

function NoteEditorModal({
  note, // the note being edited, or null for a new note
  title,
  onTitleChange,
  onContentChange,
  error,
  isSaving,
  onSave,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-editor-title"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4 sm:px-7">
          <div>
            <h2
              id="note-editor-title"
              className="text-lg font-semibold text-text"
            >
              {note ? "Edit Note" : "New Note"}
            </h2>

            <p className="mt-1 text-sm text-text/60">
              Capture your ideas and study notes.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close editor"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text/70 transition hover:bg-accent hover:text-text"
          >
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>

        {/* Title */}
        <div className="p-4 sm:p-6">
          <input
            type="text"
            placeholder="Note Title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-text placeholder:text-text/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Editor body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <TiptapEditor
            key={note?.id ?? "new"}
            initialContent={note?.content ?? null}
            onContentChange={onContentChange}
          />
        </div>

        {/* Modal footer */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-card px-5 py-4 sm:px-7">
          {error && (
            <p
              role="alert"
              className="mr-auto self-center text-sm text-red-500"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-accent disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save note"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoteEditorModal;
