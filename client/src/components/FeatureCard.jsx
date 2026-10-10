function FeatureCard({
  icon: Icon,
  title,
  description,
  className = "",
  children,
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-border-strong hover:bg-card ${className}`}
    >
      {Icon && (
        <span className="mb-5 flex size-10 items-center justify-center rounded-lg bg-primary-soft text-accent">
          <Icon size={20} />
        </span>
      )}

      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-text-muted">{description}</p>

      {children && <div className="mt-auto pt-6">{children}</div>}
    </div>
  );
}

export default FeatureCard;
