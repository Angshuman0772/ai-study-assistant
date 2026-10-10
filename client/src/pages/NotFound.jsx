function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-text">
      <main className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">404</p>
        <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-text-muted">The page you are looking for does not exist.</p>
      </main>
    </div>
  );
}
export default NotFound;
