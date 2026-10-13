function NoteCardSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="rounded-xl border border-border bg-background p-4"
    >
      {/* title */}
      <div className="h-4 w-2/5 rounded bg-border" />

      {/* preview lines */}
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-border" />
        <div className="h-3 w-4/5 rounded bg-border" />
      </div>

      {/* action buttons */}
      <div className="mt-3 flex justify-end gap-2">
        <div className="h-6 w-6 rounded-lg bg-border" />
        <div className="h-6 w-6 rounded-lg bg-border" />
      </div>
    </li>
  );
}

export default NoteCardSkeleton;
