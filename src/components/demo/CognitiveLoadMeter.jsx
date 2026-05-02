const levelStyles = {
  high:   'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low:    'bg-green-50 text-green-700 border-green-200',
};

export default function CognitiveLoadMeter({ load, reduced }) {
  const style = levelStyles[load?.level] ?? levelStyles.medium;
  const label = load?.label ?? load?.level ?? 'Unknown';

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
        Cognitive Load:
      </span>
      <span className={`border rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>
        {label}
      </span>
      {reduced && (
        <>
          <span className="text-slate-400 text-xs">→</span>
          <span className="border rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700 border-green-200">
            Low Load
          </span>
        </>
      )}
    </div>
  );
}
