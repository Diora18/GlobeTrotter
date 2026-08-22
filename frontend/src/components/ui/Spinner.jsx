export function Spinner({ className = '' }) {
  return (
    <div
      className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
