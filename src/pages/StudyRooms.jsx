import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, BookOpen, Brain, Code, Calculator } from "lucide-react";
import Navbar from "../components/Navbar";

function StudyRooms() {
  const navigate = useNavigate();

  // Example study rooms
  const [rooms, setRooms] = useState([
    {
      id: 1,
      title: "Machine Learning",
      description: "Study ML concepts, algorithms, and neural networks.",
      category: "AI & ML",
      icon: Brain,
      materials: 4,
    },
    {
      id: 2,
      title: "Data Structures & Algorithms",
      description: "Practice DSA problems and learn common patterns.",
      category: "Computer Science",
      icon: Code,
      materials: 8,
    },
    {
      id: 3,
      title: "Engineering Mathematics",
      description: "Organize formulas, notes, and practice questions.",
      category: "Mathematics",
      icon: Calculator,
      materials: 5,
    },
  ]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");

  // Filter rooms using the search input
  const filteredRooms = rooms.filter((room) =>
    room.title.toLowerCase().includes(search.toLowerCase()),
  );

  // Create a new room
  function createRoom(event) {
    event.preventDefault();

    if (roomName.trim() === "") {
      return;
    }

    const newRoom = {
      id: Date.now(),
      title: roomName,
      description: roomDescription || "Your personal study space.",
      category: "Other",
      icon: BookOpen,
      materials: 0,
    };

    setRooms([...rooms, newRoom]);

    setRoomName("");
    setRoomDescription("");
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-16">
        {/* Page heading */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 font-medium text-primary">YOUR WORKSPACE</p>

            <h1 className="text-4xl font-bold sm:text-5xl">Study Rooms</h1>

            <p className="mt-4 max-w-xl leading-7 text-text-muted">
              Organize your subjects, keep your study materials together, and
              learn with your AI assistant.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-hover"
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
            className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 outline-none focus:border-primary"
          />
        </div>

        {/* Study room cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => {
            const Icon = room.icon;

            return (
              <div
                key={room.id}
                className="rounded-2xl border border-border bg-card p-6 transition hover:border-primary/60"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={24} />
                </div>

                <p className="mb-2 text-sm text-primary">{room.category}</p>

                <h2 className="text-xl font-semibold">{room.title}</h2>

                <p className="mt-3 min-h-12 text-sm leading-6 text-text-muted">
                  {room.description}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <span className="flex items-center gap-2 text-sm text-text-muted">
                    <BookOpen size={16} />
                    {room.materials} materials
                  </span>

                  <button
                    onClick={() => navigate(`/study-rooms/${room.id}`)}
                    className="font-medium text-primary hover:underline"
                  >
                    Open Room →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* No results */}
        {filteredRooms.length === 0 && (
          <p className="py-12 text-center text-text-muted">
            No study rooms found. Try another search.
          </p>
        )}

        {/* Create room form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <form
              onSubmit={createRoom}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Create Study Room</h2>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xl text-text-muted hover:text-text"
                  aria-label="Close form"
                >
                  ×
                </button>
              </div>

              <label className="mb-2 block text-sm font-medium">
                Room name
              </label>

              <input
                type="text"
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="e.g. Operating Systems"
                className="mb-5 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
                required
              />

              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={roomDescription}
                onChange={(event) => setRoomDescription(event.target.value)}
                placeholder="What will you study here?"
                rows={3}
                className="mb-6 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white hover:bg-primary-hover"
              >
                Create Room
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudyRooms;
