import Navbar from "../components/Navbar";
import { ArrowRight, ListChecks } from "lucide-react";

function Quizzes() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-accent">
          Practice
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Quizzes</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-text-muted">
          Turn your notes into focused practice sessions and see what sticks.
        </p>
        <div className="mt-12 max-w-2xl rounded-2xl border border-border bg-surface p-6">
          <div className="flex size-11 items-center justify-center rounded-xl border border-border-strong bg-primary-soft text-accent">
            <ListChecks size={22} />
          </div>
          <h2 className="mt-5 text-xl font-semibold">Your quiz library is ready</h2>
          <p className="mt-2 text-text-muted">
            Create a quiz from a study room or start with a fresh topic.
          </p>
          <button className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-text hover:bg-primary-hover">
            Create a quiz <ArrowRight size={16} />
          </button>
        </div>
      </main>
    </div>
  );
}
export default Quizzes;
