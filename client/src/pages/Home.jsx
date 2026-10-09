import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  FileText,
  ListChecks,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";

/* ---------- Small previews shown inside the feature cards ---------- */

const sampleQuestions = [
  "Explain mitosis in simple terms",
  "What's the difference between RAM and ROM?",
  "Why does inflation happen?",
];

function TutorPreview() {
  return (
    <div className="flex flex-wrap gap-2">
      {sampleQuestions.map((question) => (
        <span
          key={question}
          className="rounded-full border border-border bg-card/50 px-3 py-1.5 text-sm text-text-muted"
        >
          {question}
        </span>
      ))}
    </div>
  );
}

function QuizPreview() {
  const options = [
    { label: "Ribosome", correct: false },
    { label: "Mitochondrion", correct: true },
    { label: "Golgi apparatus", correct: false },
  ];

  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <p className="mb-3 text-sm font-medium">Which organelle produces ATP?</p>

      <ul className="space-y-2 text-sm">
        {options.map((option) => (
          <li
            key={option.label}
            className={
              option.correct
                ? "flex items-center justify-between rounded-lg border border-success/50 bg-success/10 px-3 py-2 text-success"
                : "rounded-lg border border-border px-3 py-2 text-text-muted"
            }
          >
            {option.label}
            {option.correct && <Check size={16} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Bars({ widths, className }) {
  return (
    <div className="space-y-1.5">
      {widths.map((width, index) => (
        <div
          key={index}
          className={`h-1.5 rounded-full ${className}`}
          style={{ width }}
        />
      ))}
    </div>
  );
}

function SummaryPreview() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full rounded-xl border border-border bg-background/60 p-3">
        <p className="mb-2 text-xs text-text-subtle">
          Lecture notes · 12 pages
        </p>
        <Bars widths={["100%", "92%", "96%", "70%"]} className="bg-border" />
      </div>

      <ArrowDown size={18} className="text-accent" />

      <div className="w-full rounded-xl border border-primary/40 bg-primary-soft p-3">
        <p className="mb-2 text-xs text-accent">Study guide · 1 page</p>
        <Bars widths={["85%", "60%"]} className="bg-accent/50" />
      </div>
    </div>
  );
}

const week = [
  { day: "Mon", topic: "Bio", status: "done" },
  { day: "Tue", topic: "Math", status: "done" },
  { day: "Wed", topic: "Chem", status: "done" },
  { day: "Thu", topic: "Bio", status: "today" },
  { day: "Fri", topic: "CS", status: "upcoming" },
  { day: "Sat", topic: "Mock", status: "upcoming" },
  { day: "Sun", topic: "Rest", status: "upcoming" },
];

const statusStyles = {
  done: "border border-transparent bg-primary text-text",
  today: "border border-accent bg-primary-soft text-accent",
  upcoming: "border border-border text-text-muted",
};

function PlannerPreview() {
  const doneCount = week.filter((item) => item.status === "done").length;

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs">
        {week.map((item) => (
          <div key={item.day}>
            <p className="mb-2 text-text-subtle">{item.day}</p>
            <div
              className={`rounded-lg px-1 py-3 ${statusStyles[item.status]}`}
            >
              {item.topic}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs text-text-subtle">
        <div className="h-1.5 flex-1 rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(doneCount / week.length) * 100}%` }}
          />
        </div>
        <span>
          {doneCount} of {week.length} sessions done
        </span>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

function Home() {
  const features = [
    {
      icon: Bot,
      title: "AI Chat Tutor",
      description:
        "Ask questions about your study material and get instant explanations.",
      className: "md:col-span-4",
      preview: <TutorPreview />,
    },
    {
      icon: ListChecks,
      title: "Quiz Generator",
      description: "Generate practice quizzes from your notes automatically.",
      className: "md:col-span-2",
      preview: <QuizPreview />,
    },
    {
      icon: FileText,
      title: "Smart Summaries",
      description: "Convert lengthy notes into concise study guides.",
      className: "md:col-span-2",
      preview: <SummaryPreview />,
    },
    {
      icon: CalendarDays,
      title: "Study Planner",
      description: "Create personalized study schedules and track progress.",
      className: "md:col-span-4",
      preview: <PlannerPreview />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      {/* FEATURES */}
      <section
        id="features"
        className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20"
      >
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Study tools that work from your own notes
          </h2>

          <p className="mt-4 text-lg text-text-muted">
            Ask, practice, summarize and plan without leaving the page.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-6">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              className={feature.className}
            >
              {feature.preview}
            </FeatureCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex flex-col items-start justify-between gap-8 rounded-3xl border border-primary/30 bg-primary-soft p-10 md:flex-row md:items-center md:p-14">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold">
              Start with your next set of notes
            </h2>

            <p className="mt-3 text-text-muted">
              Upload them, ask a question, and turn them into a quiz in a few
              minutes.
            </p>
          </div>

          <button className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-text transition-colors duration-200 hover:bg-primary-hover">
            Get Started
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-text-subtle">
          <span>© {new Date().getFullYear()} StudyFlow</span>

          <Link to="/about" className="transition-colors hover:text-text">
            About
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default Home;
