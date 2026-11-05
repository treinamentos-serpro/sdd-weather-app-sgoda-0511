interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-5 text-white/80 shadow-glass backdrop-blur-md"
    >
      <span
        aria-hidden="true"
        className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-accent-400 border-t-transparent"
      />
      <span>{message}</span>
    </div>
  );
}
