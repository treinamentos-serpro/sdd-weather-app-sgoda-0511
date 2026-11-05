interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="flex flex-col gap-4 rounded-lg border border-red-300/20 bg-white/5 p-5 text-red-100 shadow-glass backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 rounded-md bg-accent-500 px-4 py-2 font-medium text-night-900 transition-colors hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
      >
        Tentar novamente
      </button>
    </section>
  );
}
