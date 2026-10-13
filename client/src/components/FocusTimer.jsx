import { useEffect, useState } from "react";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";

const FOCUS_SECONDS = 25 * 60;

export default function FocusTimer() {
  const [remaining, setRemaining] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        // If we are about to hit zero, stop the timer immediately
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  function resetTimer() {
    setRunning(false);
    setRemaining(FOCUS_SECONDS);
  }
  return (
    <section className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Timer label */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-accent">
          <Timer size={20} />
        </div>

        <div className="w-56 shrink-0">
          <h2 className="font-semibold">Focus Timer</h2>
          <p className="text-xs text-text-muted">
            {remaining === 0 ? (
              <span className="font-medium text-accent">
                Focus session complete!
              </span>
            ) : running ? (
              "Session is in progress"
            ) : (
              "25-minute focus session"
            )}
          </p>
        </div>
      </div>

      {/* Countdown */}
      <div className="text-left sm:w-24 sm:text-center shrink-0">
        <p className="text-3xl font-bold tracking-tight tabular-nums">
          {formatTime(remaining)}
        </p>
      </div>

      {/* Controls */}
      <div className="flex w-36 items-center justify-end gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setRunning((prev) => !prev)}
          disabled={remaining === 0}
          className="flex w-24 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-text hover:bg-primary-hover disabled:opacity-50"
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? "Pause" : "Start"}
        </button>

        <button
          type="button"
          onClick={resetTimer}
          title="Reset timer"
          aria-label="Reset timer"
          className="shrink-0 rounded-xl border border-border p-2.5 text-text-muted hover:bg-background hover:text-text"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </section>
  );
}
