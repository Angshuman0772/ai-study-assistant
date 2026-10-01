import { ArrowRight, Bot, Send } from "lucide-react";

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft glow behind the content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-glow blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:py-28">
        {/* Copy */}
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Learn Smarter with AI
          </h1>

          <p className="mt-6 max-w-xl text-lg text-text-muted">
            Upload notes, ask questions, generate quizzes, summarize lectures,
            and get personalized study assistance powered by AI.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-text transition-colors duration-200 hover:bg-primary-hover">
              Get Started
              <ArrowRight size={18} />
            </button>

            <a
              href="#features"
              className="rounded-xl border border-border-strong px-6 py-3 font-medium text-text-muted transition-colors hover:bg-surface hover:text-text"
            >
              Explore features
            </a>
          </div>
        </div>

        {/* Example conversation */}
        <div
          aria-hidden="true"
          className="rounded-2xl border border-border bg-surface shadow-glow"
        >
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-accent">
              <Bot size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold">AI Tutor</p>
              <p className="text-xs text-text-subtle">
                Biology notes · Chapter 4
              </p>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex justify-end">
              <p className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-text">
                Why do plants lose water through their leaves?
              </p>
            </div>

            <div className="flex">
              <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-card px-4 py-2.5 text-sm text-text">
                Through stomata, tiny pores that let the leaf take in CO₂. Water
                vapor escapes at the same time, which is called transpiration.
              </p>
            </div>

            <div className="flex">
              <div className="rounded-2xl rounded-bl-md bg-card px-4 py-3 text-sm text-text">
                <p>Want to check what you remember?</p>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full border border-accent/50 bg-primary-soft px-3 py-1 text-xs text-accent">
                    Quiz me
                  </span>
                  <span className="rounded-full border border-border-strong px-3 py-1 text-xs text-text-muted">
                    Explain it simpler
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border p-4">
            <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-subtle">
              Ask about your notes…
              <Send size={18} className="text-accent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
