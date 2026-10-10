import Navbar from "../components/Navbar";
import { ArrowRight, Layers } from "lucide-react";

function Flashcards() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-accent">
          Active recall
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Flashcards</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-text-muted">
          Review key ideas in short, focused rounds that fit your study rhythm.
        </p>
        <div className="mt-12 max-w-2xl rounded-2xl border border-border bg-surface p-6">
          <div className="flex size-11 items-center justify-center rounded-xl border border-border-strong bg-primary-soft text-accent">
            <Layers size={22} />
          </div>
          <h2 className="mt-5 text-xl font-semibold">No decks yet</h2>
          <p className="mt-2 text-text-muted">
            Build your first deck from a subject, note, or study room.
          </p>
          <button className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-text hover:bg-primary-hover">
            Create a deck <ArrowRight size={16} />
          </button>
        </div>
      </main>
    </div>
  );
}

export default Flashcards;
