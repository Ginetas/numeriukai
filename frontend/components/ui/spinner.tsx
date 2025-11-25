export function Spinner() {
  return (
    <div className="flex items-center justify-center" role="status">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
