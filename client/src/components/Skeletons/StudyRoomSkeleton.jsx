import NoteCardSkeleton from "./NoteCardSkeleton";

// A single grey placeholder bar. Size it with width/height classes.
function Bone({ className = "" }) {
  return <div className={`rounded bg-border ${className}`} />;
}

// Icon square + title + subtitle, shared by every panel header.
function PanelHeaderSkeleton({ children }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-primary-soft" />

      <div className="space-y-2">
        <Bone className="h-4 w-28" />
        <Bone className="h-3 w-36" />
      </div>

      {children}
    </div>
  );
}

export default function StudyRoomSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="animate-pulse motion-reduce:animate-none"
    >
      <span className="sr-only">Loading study room...</span>

      {/* Room heading */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 rounded-xl border border-border bg-primary-soft" />

          <div className="min-w-0 flex-1 space-y-2">
            <Bone className="h-3 w-40" />
            <Bone className="h-8 w-2/3 max-w-md" />
          </div>
        </div>

        <Bone className="h-4 w-full max-w-2xl" />
      </div>

      {/* Three-panel workspace */}
      <div className="grid min-h-[calc(100vh-280px)] grid-cols-1 gap-5 lg:grid-cols-[minmax(220px,0.9fr)_minmax(350px,1.4fr)_minmax(280px,1fr)]">
        {/* Uploaded Files */}
        <section className="flex min-h-105 flex-col surface-card-padded">
          <div className="mb-5">
            <PanelHeaderSkeleton />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-6">
            <Bone className="h-7 w-7" />
            <Bone className="h-4 w-32" />
            <Bone className="h-3 w-44" />
            <div className="mt-2 h-9 w-28 rounded-xl bg-primary-soft" />
          </div>
        </section>

        {/* My Notes */}
        <section className="flex min-h-105 flex-col surface-card-padded">
          <div className="mb-5 flex items-center justify-between gap-3">
            <PanelHeaderSkeleton />
            <div className="h-9 w-20 rounded-xl bg-primary-soft" />
          </div>

          <ul className="space-y-3">
            <NoteCardSkeleton />
            <NoteCardSkeleton />
            <NoteCardSkeleton />
          </ul>
        </section>

        {/* AI Assistant */}
        <section className="flex min-h-105 flex-col overflow-hidden surface-card">
          <div className="border-b border-border p-5">
            <PanelHeaderSkeleton />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
            <div className="mb-1 h-14 w-14 rounded-2xl bg-primary-soft" />
            <Bone className="h-4 w-48" />
            <Bone className="h-3 w-56" />
            <Bone className="h-3 w-40" />
          </div>

          <div className="border-t border-border p-4">
            <div className="h-11 w-full rounded-xl border border-border bg-background" />
          </div>
        </section>
      </div>
    </div>
  );
}
