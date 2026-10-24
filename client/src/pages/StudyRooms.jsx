import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createStudyRoom,
  getStudyRooms,
  deleteStudyRoom,
} from "../services/studyRoomService";
import {
  Plus,
  Search,
  BookOpen,
  Brain,
  Code,
  Calculator,
  Trash2,
} from "lucide-react";
import Navbar from "../components/Navbar";

function StudyRooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomSubject, setRoomSubject] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // Choose an icon based on the room's subject.
  // Icons are UI data, so they do not need to be stored in Supabase.
  function getRoomIcon(subject) {
    const value = (subject || "").toLowerCase();

    if (value.includes("math")) return Calculator;
    if (
      value.includes("computer") ||
      value.includes("programming") ||
      value.includes("software") ||
      value.includes("data structures")
    ) {
      return Code;
    }
    if (
      value.includes("ai") ||
      value.includes("machine learning") ||
      value.includes("science")
    ) {
      return Brain;
    }

    return BookOpen;
  }

  // Fetch rooms belonging to the logged-in user.
  async function loadRooms() {
    setLoading(true);
    setError("");

    try {
      const data = await getStudyRooms();
      setRooms(data);
    } catch (err) {
      console.error("Failed to load study rooms:", err);
      setError(err.message || "Could not load study rooms.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRooms();
  }, []);

  // Create a room in Supabase.
  async function createRoom(event) {
    event.preventDefault();

    if (!roomName.trim() || creating) return;

    setCreating(true);
    setError("");

    try {
      const newRoom = await createStudyRoom({
        name: roomName.trim(),
        description: roomDescription.trim(),
        subject: roomSubject.trim(),
      });

      // Add the returned database row to the UI.
      setRooms((previousRooms) => [newRoom, ...previousRooms]);

      setRoomName("");
      setRoomDescription("");
      setRoomSubject("");
      setShowForm(false);
    } catch (err) {
      console.error("Failed to create study room:", err);
      setError(err.message || "Could not create study room.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteRoom(room) {
    const confirmed = window.confirm(
      `Delete "${room.name}"?\n\nThis permanently deletes the room's notes, uploaded files, study sessions and entire AI chat history. This can't be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(room.id);
    setError("");

    try {
      await deleteStudyRoom(room.id);
      setRooms((previous) => previous.filter((r) => r.id !== room.id));
    } catch (err) {
      console.error("Failed to delete study room:", err);
      setError(err.message || "Could not delete study room.");
    } finally {
      setDeletingId(null);
    }
  }

  // Filter rooms by their database name.
  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-16">
        {/* Page heading */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Your workspace</p>

            <h1 className="text-4xl font-bold sm:text-5xl">Study Rooms</h1>

            <p className="mt-4 max-w-xl leading-7 text-text-muted">
              Organize your subjects, keep your study materials together, and
              learn with your AI assistant.
            </p>
          </div>

          <button
            onClick={() => {
              setError("");
              setShowForm(true);
            }}
            className="btn-primary"
          >
            <Plus size={20} />
            Create Room
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-8 max-w-md">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          />

          <input
            type="text"
            placeholder="Search study rooms..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 outline-none transition-colors placeholder:text-text-subtle focus:border-accent"
          />
        </div>

        {/* Error message */}
        {error && !showForm && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm"
          >
            {error}
            <button
              onClick={loadRooms}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div className="animate-pulse surface-card-padded h-75">
              <div className="h-6 w-2/3 rounded bg-card" />
              <div className="mt-4 h-4 w-1/3 rounded bg-card" />
              <div className="mt-6 h-4 w-full rounded bg-card" />
              <div className="mt-2 h-4 w-4/5 rounded bg-card" />
            </div>
          </div>
        ) : (
          <>
            {/* Study room cards */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredRooms.map((room) => {
                const Icon = getRoomIcon(room.subject);

                return (
                  <div
                    key={room.id}
                    data-gsap="reveal"
                    className="surface-card-interactive"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border-strong bg-primary-soft text-accent">
                      <Icon size={24} />
                    </div>

                    <p className="mb-2 text-sm text-primary">
                      {room.subject || "Other"}
                    </p>

                    <h2 className="text-xl font-semibold">{room.name}</h2>

                    <p className="mt-3 min-h-12 text-sm/6 text-text-muted">
                      {room.description || "Your personal study space."}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                      <span className="flex items-center gap-2 text-sm text-text-muted">
                        <BookOpen size={16} />
                        Study room
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteRoom(room)}
                          disabled={deletingId === room.id}
                          aria-label={`Delete ${room.name}`}
                          title="Delete room"
                          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-primary-soft hover:text-red-500 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>

                        <button
                          onClick={() => navigate(`/study-rooms/${room.id}`)}
                          className="font-medium text-primary hover:underline"
                        >
                          Open Room →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {filteredRooms.length === 0 && (
              <p className="py-12 text-center text-text-muted">
                {rooms.length === 0
                  ? "You haven't created any study rooms yet. Create your first one!"
                  : "No study rooms found. Try another search."}
              </p>
            )}
          </>
        )}

        {/* Create room form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <form
              onSubmit={createRoom}
              className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-glow"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Create Study Room</h2>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                  className="text-xl text-text-muted hover:text-text"
                  aria-label="Close form"
                >
                  ×
                </button>
              </div>

              {error && (
                <p role="alert" className="mb-4 text-sm text-red-500">
                  {error}
                </p>
              )}

              <label className="mb-2 block text-sm font-medium">
                Room name
              </label>

              <input
                type="text"
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="e.g. Operating Systems"
                className="mb-5 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-accent"
                required
                maxLength={100}
              />

              <label className="mb-2 block text-sm font-medium">Subject</label>

              <input
                type="text"
                value={roomSubject}
                onChange={(event) => setRoomSubject(event.target.value)}
                placeholder="e.g. Computer Science"
                className="mb-5 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-accent"
                maxLength={100}
              />

              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={roomDescription}
                onChange={(event) => setRoomDescription(event.target.value)}
                placeholder="What will you study here?"
                rows={3}
                className="mb-6 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-accent"
                maxLength={1000}
              />

              <button
                type="submit"
                disabled={creating}
                className="btn-primary w-full"
              >
                {creating ? "Creating..." : "Create Room"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudyRooms;
