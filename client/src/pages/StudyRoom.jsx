import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getStudyRoom } from "../services/studyRoomService";
import {
  BrainCircuit,
  MessageCircle,
  NotebookPen,
  Plus,
  Upload,
  BookOpen,
} from "lucide-react";
import Navbar from "../components/Navbar";

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
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            Loading
          </p>
        ) : error ? (
          <p role="alert" className="text-red-500">
            {error}
          </p>
        ) : room ? (
          <>
            {/* Room heading */}
            <div className="mb-8">
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

              {/* My Notes */}
              <section className="flex min-h-105 flex-col surface-card-padded">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-accent">
                      <NotebookPen size={20} />
                    </div>

                    <div>
                      <h2 className="font-semibold">My Notes</h2>
                      <p className="text-sm text-text-muted">
                        Capture your ideas
                      </p>
                    </div>
                  </div>

                  <button type="button" className="btn-primary-sm rounded-xl">
                    <Plus size={16} />
                    New
                  </button>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center">
                  <NotebookPen size={30} className="mb-3 text-text-muted" />

                  <p className="font-medium">Your notes start here</p>

                  <p className="mt-2 max-w-xs text-sm/6 text-text-muted">
                    Write summaries, save important concepts, and organize what
                    you learn.
                  </p>
                </div>
              </section>

              {/* AI Assistant */}
              <section className="flex min-h-105 flex-col overflow-hidden surface-card">
                <div className="flex items-center gap-3 border-b border-border p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-accent">
                    <BrainCircuit size={20} />
                  </div>

                  <div>
                    <h2 className="font-semibold">AI Assistant</h2>
                    <p className="text-sm text-text-muted">
                      Your personal AI tutor
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-accent">
                    <MessageCircle size={26} />
                  </div>

                  <p className="font-medium">What are you learning today?</p>

                  <p className="mt-2 text-sm/6 text-text-muted">
                    Ask questions, clarify difficult concepts, and get help with
                    your study materials.
                  </p>
                </div>

                <div className="border-t border-border p-4">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left text-sm text-text-muted transition-colors hover:border-accent"
                  >
                    Ask your AI tutor...
                    <MessageCircle size={17} />
                  </button>
                </div>
              </section>
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
