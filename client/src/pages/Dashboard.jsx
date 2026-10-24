import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getStudyRooms } from "../services/studyRoomService";
import { useAuth } from "../context/AuthContext";
import { BookOpen, ArrowRight } from "lucide-react";

function Dashboard() {
  const { user, loading } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRooms([]);
      setRoomsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadRooms() {
      setRoomsLoading(true);
      setRoomsError("");

      try {
        const data = await getStudyRooms();

        if (!cancelled) {
          setRooms(data);
        }
      } catch (error) {
        console.error("Failed to load study rooms:", error);

        if (!cancelled) {
          setRoomsError("Could not load your study rooms.");
        }
      } finally {
        if (!cancelled) {
          setRoomsLoading(false);
        }
      }
    }

    loadRooms();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  if (loading) {
    return <p>Loading your dashboard...</p>;
  }

  if (!user) {
    return <p>You are not logged in.</p>;
  }
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-14">
        <p className="eyebrow">Dashboard</p>

        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Welcome back,
          <span className="block text-text">
            {user.user_metadata.full_name}
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-lg/8 text-text-muted">
          Continue your learning journey, review flashcards, take quizzes, and
          build consistency one study session at a time.
        </p>
      </section>

      {/* Quick Stats */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-8">Quick Stats</h2>
        <div data-gsap="reveal" className="overflow-hidden surface-card">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4">
            {/* Stat 1 */}
            <div className="p-6 border-r border-b md:border-b-0 border-border">
              <p className="text-4xl font-bold tracking-tight text-accent">
                12
              </p>
              <p className="mt-2 text-sm text-text-subtle">Day Streak</p>
            </div>

            {/* Stat 2 */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-border">
              <p className="text-4xl font-bold tracking-tight text-accent">
                38h
              </p>
              <p className="mt-2 text-sm text-text-subtle">Hours Studied</p>
            </div>

            {/* Stat 3 */}
            <div className="p-6 border-r border-border">
              <p className="text-4xl font-bold tracking-tight text-accent">
                86
              </p>
              <p className="mt-2 text-sm text-text-subtle">
                Flashcards Mastered
              </p>
            </div>

            {/* Stat 4 */}
            <div className="p-6">
              <p className="text-4xl font-bold tracking-tight text-accent">
                24
              </p>
              <p className="mt-2 text-sm text-text-subtle">Quizzes Completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Continue Learning */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Your Study Rooms</h2>

          <Link
            to="/study-rooms"
            className="flex items-center gap-2 text-sm font-medium text-primary"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        {roomsLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-border bg-surface p-6"
              >
                <div className="h-6 w-2/3 rounded bg-card" />
                <div className="mt-4 h-4 w-1/3 rounded bg-card" />
                <div className="mt-6 h-4 w-full rounded bg-card" />
                <div className="mt-2 h-4 w-4/5 rounded bg-card" />
              </div>
            ))}
          </div>
        ) : roomsError ? (
          <p className="text-text-muted">{roomsError}</p>
        ) : rooms.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center">
            <BookOpen size={32} className="mx-auto text-primary" />
            <h3 className="mt-4 text-lg font-semibold">No study rooms yet</h3>
            <p className="mt-2 text-text-muted">
              Create your first room to get started.
            </p>
            <Link
              to="/study-rooms"
              className="mt-5 inline-flex items-center gap-2 font-medium text-primary"
            >
              Explore Study Rooms
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Link
                key={room.id}
                to={`/study-rooms/${room.id}`}
                data-gsap="reveal"
                className="surface-card-interactive"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">{room.name}</h3>
                    <p className="mt-2 text-sm text-primary">
                      {room.subject || "General Study"}
                    </p>
                  </div>
                  <BookOpen size={22} className="shrink-0 text-primary" />
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-text-subtle">
                  {room.description || "No description added yet."}
                </p>

                <span className="mt-6 flex items-center gap-2 font-medium text-primary">
                  Open Room
                  <ArrowRight size={18} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
