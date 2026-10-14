import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getStudyRoom } from "../services/studyRoomService";
import { Plus, Upload, BookOpen } from "lucide-react";
import Navbar from "../components/Navbar";
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
    <div className="min-h-screen bg-background text-text">
      <Navbar />

      <main className="mx-auto w-full px-4 py-8 lg:px-8">
        {loading ? (
          <StudyRoomSkeleton />
        ) : error ? (
          <p role="alert" className="text-red-500">
            {error}
          </p>
        ) : room ? (
          <>
            <div className="flex flex-col mb-8 gap-8 sm:flex-row sm:justify-between h-full">
              {/* Room heading */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-primary-soft text-accent">
                    <BookOpen size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                      Your workspace
                      {room.subject && ` / ${room.subject}`}
                    </p>

                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                      {room.name}
                    </h1>
                  </div>
                </div>

                {room.description && (
                  <p className="max-w-2xl text-sm/7 text-text-muted sm:text-base">
                    {room.description}
                  </p>
                )}
              </div>
              {/* Timer */}
              <div>
                <FocusTimer />
              </div>
            </div>

            {/* Three-panel workspace */}
            <div className="grid min-h-[calc(100vh-280px)] grid-cols-1 gap-5 lg:grid-cols-[minmax(220px,0.9fr)_minmax(350px,1.4fr)_minmax(280px,1fr)]">
              {/* Uploaded Files */}
              <section className="flex min-h-105 flex-col surface-card-padded">
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
          </>
        ) : (
          <p className="text-text-muted">Study room not found.</p>
        )}
      </main>
    </div>
  );
}

export default StudyRoom;
