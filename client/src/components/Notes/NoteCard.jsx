// This component is responsible for rendering a single note card in the notes list.

import { Pencil, Trash2 } from "lucide-react";
import { getPreview } from "./noteUtils";

function NoteCard({ note, onEdit, onDelete }) {
  return (
    <li className="rounded-xl border border-border bg-background p-4 transition-colors hover:border-accent">
      <button
        type="button"
        onClick={() => onEdit(note)}
        className="block w-full text-left"
      >
        <h3 className="truncate font-medium">
          {note.title || "Untitled note"}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-text-muted">
          {getPreview(note.content) || "No content"}
        </p>
      </button>

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onEdit(note)}
          aria-label="Edit note"
          className="rounded-lg p-1.5 text-text-muted transition hover:bg-primary-soft hover:text-accent"
        >
          <Pencil size={15} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(note.id)}
          aria-label="Delete note"
          className="rounded-lg p-1.5 text-text-muted transition hover:bg-primary-soft hover:text-red-500"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </li>
  );
}

export default NoteCard;
