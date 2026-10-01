import {
  ArrowDown,
  ArrowRight,
  Bot,
  Brain,
  Layers,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";

import Navbar from "../components/Navbar";

function SectionHeader({ title, description }) {
  return (
    <div className="mb-12 max-w-2xl">
      <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>

      {description && (
        <p className="mt-4 text-lg text-text-muted">{description}</p>
      )}
    </div>
  );
}

export default function About() {
  const features = [
    {
      icon: Bot,
      title: "AI Tutor",
      description:
        "Receive personalized explanations and guidance tailored to your learning style.",
    },
    {
      icon: Layers,
      title: "Flashcards",
      description:
        "Generate flashcards automatically and strengthen memory through active recall.",
    },
    {
      icon: Brain,
      title: "Smart Quizzes",
      description:
        "Test your understanding with AI-generated quizzes and instant feedback.",
    },
    {
      icon: Timer,
      title: "Study Rooms",
      description:
        "Stay focused with distraction-free study sessions and productivity tools.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Monitor your performance and identify areas that need improvement.",
    },
    {
      icon: Sparkles,
      title: "Personalized Learning",
      description:
        "Adaptive recommendations help you focus on what matters most.",
    },
  ];

  const currentTools = [
    "Notes",
    "Videos",
    "Search engines",
    "Flashcards",
    "Productivity apps",
  ];

  const steps = [
    {
      title: "Upload Notes",
      description: "Add your notes or study material.",
    },
    {
      title: "AI Analysis",
      description: "StudyFlow reads and organizes the content.",
    },
    {
      title: "Generate Flashcards",
      description: "Key ideas become flashcards for active recall.",
    },
    {
      title: "Take Quizzes",
      description: "Test yourself and get instant feedback.",
    },
    {
      title: "Track Progress",
      description: "See what you've mastered and what needs work.",
    },
  ];

  const stack = [
    {
      group: "Frontend",
      items: ["React", "Vite", "Tailwind CSS", "React Router"],
    },
    {
      group: "Backend",
      items: ["Node.js", "Express.js", "MongoDB", "Mongoose"],
    },
    {
      group: "AI",
      items: ["OpenAI API", "Prompt Engineering", "Embeddings", "LLMs"],
    },
    { group: "Deployment", items: ["Vercel", "MongoDB Atlas", "GitHub"] },
  ];

  const roadmap = [
    "PDF Uploads",
    "Note Summarization",
    "Voice Conversations",
    "Spaced Repetition",
    "Collaborative Study Rooms",
    "Advanced Analytics",
  ];

  return (
    <div className="text-text">
      <Navbar />
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-glow blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-32">
          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            About StudyFlow
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-text-muted md:text-xl">
            StudyFlow helps students learn smarter through AI-powered tutoring,
            flashcards, quizzes, focused study sessions, and progress tracking—
            all in one place.
          </p>
        </div>
      </section>

      {/* MISSION */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl">Our Mission</h2>

            <p className="text-lg leading-relaxed text-text-muted">
              Modern students often switch between notes, videos, search
              engines, flashcards, and multiple productivity apps. StudyFlow
              aims to bring these tools together into a single intelligent
              learning environment powered by AI.
            </p>

            <p className="mt-6 text-lg leading-relaxed text-text-muted">
              The goal is simple: make studying more effective, engaging, and
              personalized for every learner.
            </p>
          </div>

          {/* Many tools → one place */}
          <div
            aria-hidden="true"
            className="rounded-3xl border border-border bg-surface p-8 shadow-glow"
          >
            <ul className="flex flex-wrap gap-2">
              {currentTools.map((tool) => (
                <li
                  key={tool}
                  className="rounded-lg border border-dashed border-border-strong px-3 py-1.5 text-sm text-text-muted"
                >
                  {tool}
                </li>
              ))}
            </ul>

            <div className="my-6 flex items-center gap-3 text-accent">
              <span className="h-px flex-1 bg-border" />
              <ArrowDown size={18} />
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-primary/40 bg-primary-soft p-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-text">
                <Brain size={24} />
              </span>

              <div>
                <p className="font-semibold">StudyFlow</p>
                <p className="text-sm text-text-muted">
                  Tutoring, flashcards, quizzes and progress in one place
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader
          title="Key Features"
          description="Everything you need to learn efficiently."
        />

        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div key={feature.title} className="bg-surface p-6 sm:p-8">
                <span className="mb-5 flex size-11 items-center justify-center rounded-lg bg-primary-soft text-accent">
                  <Icon size={22} />
                </span>

                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>

                <p className="text-text-muted">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader title="How It Works" />

        <ol className="grid gap-8 lg:grid-cols-5">
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-4 lg:block">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-text">
                {index + 1}
              </span>

              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[3.25rem] -right-5 top-5 hidden h-px bg-border lg:block"
                />
              )}

              <div className="lg:mt-5">
                <h3 className="font-semibold">{step.title}</h3>

                <p className="mt-1 text-sm text-text-muted">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* TECH STACK */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader title="Technology Stack" />

        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {stack.map(({ group, items }) => (
            <div
              key={group}
              className="grid gap-4 p-6 sm:grid-cols-[9rem_1fr] sm:items-center"
            >
              <h3 className="font-semibold text-accent">{group}</h3>

              <ul className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-border bg-card/50 px-3 py-1.5 text-sm text-text-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* WHY I BUILT THIS */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-16">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Why I Built StudyFlow
          </h2>

          <p className="border-l-2 border-primary pl-6 text-xl leading-relaxed text-text-muted lg:col-span-2">
            As a Computer Science student, I wanted to explore how artificial
            intelligence can improve learning experiences. StudyFlow combines
            modern web development, AI integration, and educational tools into a
            single platform designed to make studying more effective and
            engaging.
          </p>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader
          title="Future Roadmap"
          description="Features planned next."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roadmap.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface/50 p-5"
            >
              <span className="text-accent">○</span>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-8">
        <div className="flex flex-col items-start justify-between gap-8 rounded-3xl bg-gradient-to-r from-primary to-secondary p-10 md:flex-row md:items-center md:p-14">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold md:text-4xl">
              Ready to Learn Smarter?
            </h2>

            <p className="mt-3 text-lg text-text/80">
              Start your AI-powered learning journey today.
            </p>
          </div>

          <button className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-text px-8 py-4 font-semibold text-background transition-colors hover:bg-text/90">
            Get Started
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
