import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getStudyRoom } from "../services/studyRoomService";
import { Plus, Upload, BookOpen, ArrowLeft } from "lucide-react";
import NotesPanel from "../components/notes/NotesPanel";
import FocusTimer from "../components/FocusTimer";
import AIChat from "../components/AIChat";
import StudyRoomSkeleton from "../components/Skeletons/StudyRoomSkeleton";

function StudyRoom() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchRoom() {
      if (!id) {
        setRoom(null);
        setError("Invalid study room ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setRoom(null);

      try {
        const data = await getStudyRoom(id);

        // Ignore results from an outdated request.
        if (cancelled) return;

        if (!data) {
          setError("Study room not found or unavailable.");
          return;
        }

        setRoom(data);
      } catch (err) {
        if (cancelled) return;

        console.error("Error fetching study room:", err);
        setError("Unable to load study room. Please try again.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRoom();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    // Desktop: exactly one viewport tall, no page scroll. Mobile: scrolls normally.
    <div className="flex min-h-screen flex-col bg-background text-text lg:h-dvh lg:overflow-hidden">
      {/* Room header — replaces the navbar */}
      <header className="flex h-17 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/dashboard"
            aria-label="Back to dashboard"
            className="shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-background hover:text-text"
          >
            <ArrowLeft size={18} />
          </Link>

          {room && (
            <>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-accent">
                <BookOpen size={20} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Your workspace
                  {room.subject && ` / ${room.subject}`}
                </p>

                <h1
                  title={room.description || undefined}
                  className="truncate text-lg font-bold tracking-tight"
                >
                  {room.name}
                </h1>
              </div>
            </>
          )}
        </div>

        {room && <FocusTimer />}
      </header>

      <main className="mx-auto w-full flex-1 px-4 py-5 lg:min-h-0 lg:px-8">
        {loading ? (
          <StudyRoomSkeleton />
        ) : error ? (
          <p role="alert" className="text-red-500">
            {error}
          </p>
        ) : room ? (
          // Three-panel workspace: fills the remaining height on desktop
          <div className="grid grid-cols-1 gap-5 lg:h-full lg:grid-cols-[minmax(220px,0.9fr)_minmax(350px,1.4fr)_minmax(280px,1fr)] lg:grid-rows-[minmax(0,1fr)]">
            {/* Uploaded Files */}
            <section className="flex min-h-105 flex-col surface-card-padded lg:min-h-0">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-accent">
                  <Upload size={20} />
                </div>

                <div>
                  <h2 className="font-semibold">Uploaded Files</h2>
                  <p className="text-sm text-text-muted">
                    Your study materials
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center">
                <Upload size={28} className="mb-3 text-text-muted" />

                <p className="font-medium">Add your materials</p>

                <p className="mt-2 text-sm/6 text-text-muted">
                  Upload lecture slides, PDFs, and study documents.
                </p>

                <button
                  type="button"
                  className="mt-5 btn-primary-sm rounded-xl"
                >
                  <Plus size={16} />
                  Upload file
                </button>
              </div>
            </section>

            {/* My Notes (section + editor modal) */}
            <NotesPanel roomId={room.id} />

            {/* AI Assistant */}
            <AIChat />
          </div>
        ) : (
          <p className="text-text-muted">Study room not found.</p>
        )}
      </main>
    </div>
  );
}

export default StudyRoom;
