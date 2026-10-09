import Navbar from "../components/Navbar";
import { Flame, Clock, BookOpen, Trophy, ArrowRight } from "lucide-react";

function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10">
        <p className="text-primary font-medium mb-3">Dashboard</p>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          Welcome back,
          <span className="block text-text">John</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-text-subtle font-semibold">
          Continue your learning journey, review flashcards, take quizzes, and
          build consistency one study session at a time.
        </p>
      </section>

      {/* Quick Stats */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-8">Quick Stats</h2>
        <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-glow">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4">
            {/* Stat 1 */}
            <div className="p-6 border-r border-b md:border-b-0 border-border">
              <p className="text-4xl font-bold text-primary">12</p>
              <p className="mt-2 text-sm text-text-subtle">Day Streak</p>
            </div>

            {/* Stat 2 */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-border">
              <p className="text-4xl font-bold text-primary">38h</p>
              <p className="mt-2 text-sm text-text-subtle">Hours Studied</p>
            </div>

            {/* Stat 3 */}
            <div className="p-6 border-r border-border">
              <p className="text-4xl font-bold text-primary">86</p>
              <p className="mt-2 text-sm text-text-subtle">
                Flashcards Mastered
              </p>
            </div>

            {/* Stat 4 */}
            <div className="p-6">
              <p className="text-4xl font-bold text-primary">24</p>
              <p className="mt-2 text-sm text-text-subtle">Quizzes Completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Continue Learning */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6">Continue Learning</h2>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-surface border border-border rounded-2xl p-6 hover:border-primary transition-all cursor-pointer">
            <h3 className="text-xl font-semibold">Biology 101</h3>

            <p className="mt-3 text-text-subtle">Last studied 2 days ago</p>

            <button className="mt-6 flex items-center gap-2 text-primary font-medium">
              Continue
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 hover:border-primary transition-all cursor-pointer">
            <h3 className="text-xl font-semibold">Chemistry Basics</h3>

            <p className="mt-3 text-text-subtle">Last studied 5 days ago</p>

            <button className="mt-6 flex items-center gap-2 text-primary font-medium">
              Continue
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 hover:border-primary transition-all cursor-pointer">
            <h3 className="text-xl font-semibold">World History</h3>

            <p className="mt-3 text-text-subtle">Last studied 1 week ago</p>

            <button className="mt-6 flex items-center gap-2 text-primary font-medium">
              Continue
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Study Tools */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6">Study Tools</h2>
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="bg-surface border border-border rounded-2xl p-6 hover:border-primary transition-all cursor-pointer">
            <Flame size={24} className="text-primary" />
            <h3 className="mt-4 text-lg font-semibold">Flashcards</h3>
            <p className="mt-2 text-text-subtle">
              Create and review flashcards to reinforce your memory.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-6 hover:border-primary transition-all cursor-pointer">
            <Clock size={24} className="text-primary" />
            <h3 className="mt-4 text-lg font-semibold">Quizzes</h3>
            <p className="mt-2 text-text-subtle">
              Test your knowledge with interactive quizzes and track your
              progress.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-6 hover:border-primary transition-all cursor-pointer">
            <BookOpen size={24} className="text-primary" />
            <h3 className="mt-4 text-lg font-semibold">Notes</h3>
            <p className="mt-2 text-text-subtle">
              Upload and organize your notes for easy access and review.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-6 hover:border-primary transition-all cursor-pointer">
            <Trophy size={24} className="text-primary" />
            <h3 className="mt-4 text-lg font-semibold">Achievements</h3>
            <p className="mt-2 text-text-subtle">
              Earn badges and track your learning milestones.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
