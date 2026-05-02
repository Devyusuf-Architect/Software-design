import { useState, useEffect } from 'react';

export default function FocusTimer({ startTime, visible }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setElapsed(Math.floor((Date.now() - startTime) / 1000));
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, visible]);

  if (!visible) return null;

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5">
      <svg
        className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span className="text-xs text-slate-500 font-mono tabular-nums">
        {minutes}:{seconds}
      </span>
      <span className="text-xs text-slate-400">·</span>
      <span className="text-xs text-slate-400">Take your time, no rush</span>
    </div>
  );
}
