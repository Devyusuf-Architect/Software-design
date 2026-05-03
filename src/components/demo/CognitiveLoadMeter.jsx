const COMPLEXITY = {
  high:   { label: 'Complex content',  style: 'bg-rose-50 text-rose-700 border-rose-200' },
  medium: { label: 'Moderate content', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  low:    { label: 'Simple content',   style: 'bg-green-50 text-green-700 border-green-200' },
};

export default function CognitiveLoadMeter({ load, reduced }) {
  const entry = COMPLEXITY[load?.level] ?? COMPLEXITY.medium;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Reading level:</span>
      <span className={`border rounded-full px-2.5 py-0.5 text-xs font-semibold ${entry.style}`}>
        {entry.label}
      </span>
      {reduced && (
        <>
          <span className="text-slate-300 text-xs">→</span>
          <span className="border rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700 border-green-200">
            Simplified ✓
          </span>
        </>
      )}
    </div>
  );
}
