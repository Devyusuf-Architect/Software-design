export default function ConfidenceBar({ step, stepCount = 5 }) {
  const pct = stepCount > 0 ? (step / stepCount) * 100 : 0;

  let message = 'Ready to begin';
  if (pct === 100) message = 'Task complete ✓';
  else if (pct >= 71) message = 'Almost done';
  else if (pct >= 41) message = 'Making good progress';
  else if (pct >= 1) message = "You're getting started";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-500 font-medium">Confidence</span>
        <span className="text-xs text-slate-500">{message}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 bg-indigo-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
