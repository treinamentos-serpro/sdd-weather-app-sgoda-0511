interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-md">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-white/70">{hint}</p>
    </section>
  );
}
