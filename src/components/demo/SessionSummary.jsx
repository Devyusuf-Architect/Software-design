import { modeConfigs } from '../../utils/modeConfigs';

export default function SessionSummary({
  scenario,
  mode,
  step,
  stepCount,
  startTime,
  onClose,
  visible,
}) {
  if (!visible) return null;

  const elapsedMs = Date.now() - startTime;
  const elapsedMinutes = Math.max(1, Math.round(elapsedMs / 60000));
  const timeLabel = elapsedMinutes === 1 ? '1 minute' : `${elapsedMinutes} minutes`;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-3xl">
            ✅
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-semibold text-slate-800 text-center mb-1">
          Task Complete
        </h2>
        <p className="text-sm text-slate-500 text-center mb-6">
          You successfully completed this task with reduced stress.
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 rounded-2xl p-3">
            <p className="text-xs text-slate-400 mb-0.5">Steps completed</p>
            <p className="text-sm font-semibold text-slate-700">
              {step} of {stepCount}
            </p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3">
            <p className="text-xs text-slate-400 mb-0.5">Time spent</p>
            <p className="text-sm font-semibold text-slate-700">{timeLabel}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3">
            <p className="text-xs text-slate-400 mb-0.5">Scenario</p>
            <p className="text-sm font-semibold text-slate-700 truncate">
              {scenario?.label ?? '—'}
            </p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3">
            <p className="text-xs text-slate-400 mb-0.5">Mode used</p>
            <p className="text-sm font-semibold text-slate-700 truncate">
              {modeConfigs[mode]?.name ?? mode ?? '—'}
            </p>
          </div>
        </div>

        {/* What was simplified */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            What was simplified
          </p>
          <ul className="space-y-1.5">
            {[
              'Complex language removed',
              'Task broken into steps',
              'Urgency removed',
            ].map((item) => (
              <li key={item} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Final message */}
        <p className="text-sm text-slate-500 italic text-center mb-6">
          ClearPath, powered by ODAI, helped you see through the complexity.
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full bg-slate-800 text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
