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
      className="animate-pulse motion-reduce:animate-none lg:h-full"
    >
      <span className="sr-only">Loading study room...</span>

      {/* Three-panel workspace */}
      <div className="grid grid-cols-1 gap-5 lg:h-full lg:grid-cols-[minmax(220px,0.9fr)_minmax(350px,1.4fr)_minmax(280px,1fr)] lg:grid-rows-[minmax(0,1fr)]">
        {/* Uploaded Files */}
        <section className="flex min-h-105 flex-col surface-card-padded lg:min-h-0">
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
        <section className="flex min-h-105 flex-col surface-card-padded lg:min-h-0">
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
        <section className="flex min-h-105 flex-col overflow-hidden surface-card lg:min-h-0">
          {/* Header: no border, matches p-5 */}
          <div className="p-5">
            <PanelHeaderSkeleton />
          </div>

          {/* Conversation area: same wrapper + dashed box as AIChat */}
          <div className="flex min-h-0 flex-1 flex-col px-5 py-1">
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl  p-2">
              <div className="mb-4 h-14 w-14 rounded-2xl bg-primary-soft" />
              <Bone className="h-4 w-48" />
              <Bone className="mt-2 h-3 w-64 max-w-sm" />
              <Bone className="mt-2 h-3 w-48" />
            </div>
          </div>

          {/* Composer: input box with send button, then the hint line */}
          <div className="p-4">
            <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2">
              <Bone className="mb-3 ml-2 h-3 flex-1" />
              <div className="h-10 w-10 shrink-0 rounded-lg bg-primary-soft" />
            </div>

            <div className="mt-2 flex h-4 items-center justify-center">
              <Bone className="h-3 w-44" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
