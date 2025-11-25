'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-12">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-slate-600">{error.message}</p>
      <button className="rounded-md bg-slate-900 px-4 py-2 text-white" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
