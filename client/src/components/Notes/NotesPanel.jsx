// This component is responsible for displaying the notes column.

import { useState, useEffect } from "react";
import { NotebookPen, Plus } from "lucide-react";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../../services/noteService";
import NoteCard from "./NoteCard";
import NoteEditorModal from "./NoteEditorModal";
import NoteCardSkeleton from "../Skeletons/NoteCardSkeleton";
import { EMPTY_DOC } from "./noteUtils";

function NotesPanel({ roomId }) {
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [noteError, setNoteError] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState(EMPTY_DOC);
  const [isSaving, setIsSaving] = useState(false);

  // Load notes whenever the room changes.
  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    async function fetchNotes() {
      setNotesLoading(true);
      setNoteError("");

      try {
        const data = await getNotes(roomId);
        if (!cancelled) setNotes(data);
      } catch (err) {
        if (cancelled) return;
        console.error("Error fetching notes:", err);
        setNoteError("Couldn't load your notes. Please try again.");
      } finally {
        if (!cancelled) setNotesLoading(false);
      }
    }

    fetchNotes();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  function openNewNote() {
    setSelectedNote(null);
    setNoteTitle("");
    setNoteContent(EMPTY_DOC);
    setNoteError("");
    setIsEditorOpen(true);
  }

  function openEditNote(note) {
    setSelectedNote(note);
    setNoteTitle(note.title ?? "");
    setNoteContent(note.content ?? EMPTY_DOC);
    setNoteError("");
    setIsEditorOpen(true);
  }

  function closeEditor() {
    if (isSaving) return;
    setIsEditorOpen(false);
    setSelectedNote(null);
    setNoteTitle("");
    setNoteContent(EMPTY_DOC);
    setNoteError("");
  }

  async function handleSaveNote() {
    setIsSaving(true);
    setNoteError("");

    try {
      if (selectedNote) {
        const updated = await updateNote({
          noteId: selectedNote.id,
          title: noteTitle,
          content: noteContent ?? EMPTY_DOC,
        });

        setNotes((prev) =>
          prev.map((n) => (n.id === updated.id ? updated : n)),
        );
      } else {
        const created = await createNote({
          roomId,
          title: noteTitle,
          content: noteContent ?? EMPTY_DOC,
        });

        setNotes((prev) => [created, ...prev]);
      }

      // Only close on success, so failures stay visible inside the modal.
      setIsSaving(false);
      setIsEditorOpen(false);
      setSelectedNote(null);
      setNoteTitle("");
      setNoteContent(EMPTY_DOC);
    } catch (err) {
      console.error("Error saving note:", err);
      setNoteError("Couldn't save your note. Please try again.");
      setIsSaving(false);
    }
  }

  async function handleDeleteNote(noteId) {
    if (!window.confirm("Delete this note?")) return;

    try {
      setNoteError("");
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error("Error deleting note:", err);
      setNoteError("Couldn't delete the note. Please try again.");
    }
  }

  return (
    <>
      {/* My Notes */}
      <section className="flex min-h-105 flex-col surface-card-padded">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-accent">
              <NotebookPen size={20} />
            </div>

            <div>
              <h2 className="font-semibold">My Notes</h2>
              <p className="text-sm text-text-muted">Capture your ideas</p>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary-sm rounded-xl"
            onClick={openNewNote}
          >
            <Plus size={16} />
            New
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto">
          {notesLoading ? (
            <ul
              className="space-y-3 animate-pulse"
              role="status"
              aria-label="Loading notes"
            >
              <NoteCardSkeleton />
              <NoteCardSkeleton />
              <NoteCardSkeleton />
            </ul>
          ) : noteError && !isEditorOpen ? (
            <p role="alert" className="m-auto text-sm text-red-500">
              {noteError}
            </p>
          ) : notes.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center">
              <NotebookPen size={30} className="mb-3 text-text-muted" />

              <p className="font-medium">Your notes start here</p>

              <p className="mt-2 max-w-xs text-sm/6 text-text-muted">
                Write summaries, save important concepts, and organize what you
                learn.
              </p>
            </div>
          ) : (
            // Display the list of notes
            <ul className="space-y-3">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={openEditNote}
                  onDelete={handleDeleteNote}
                />
              ))}
            </ul>
          )}
        </div>
      </section>

      {isEditorOpen && (
        <NoteEditorModal
          note={selectedNote}
          title={noteTitle}
          onTitleChange={setNoteTitle}
          onContentChange={setNoteContent}
          error={noteError}
          isSaving={isSaving}
          onSave={handleSaveNote}
          onClose={closeEditor}
        />
      )}
    </>
  );
}

export default NotesPanel;
