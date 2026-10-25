function Bone({ className = "" }) {
  return <div className={`rounded bg-border ${className}`} />;
}
export default function UploadedFilesSkeleton() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-6">
      <Bone className="h-7 w-7" />
      <Bone className="h-4 w-32" />
      <Bone className="h-3 w-44" />
      <div className="mt-2 h-9 w-28 rounded-xl bg-primary-soft" />
    </div>
  );
}
