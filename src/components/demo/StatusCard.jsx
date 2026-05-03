import { modeConfigs } from '../../utils/modeConfigs';

const PHASES = ['Before', 'After', 'Done'];

export default function StatusCard({ mode, step, totalSteps, hasSelectedMode }) {
  const isOriginal = mode === 'original';

  const phase = !hasSelectedMode
    ? 0
    : step >= totalSteps ? 2 : 1;

  const cfg = modeConfigs[mode] || modeConfigs.calm;

  const message =
    !hasSelectedMode
      ? 'Select a mode in the panel to adapt this content for you.'
      : isOriginal
        ? 'Original view — showing content without any ClearPath processing.'
        : phase === 2
          ? 'Task completed. Well done.'
          : `${cfg.name} mode active. ${cfg.description}`;

  return (
    <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-4 flex-shrink-0">
      {/* Phase indicators */}
      <div className="flex items-center gap-0">
        {PHASES.map((label, i) => (
          <div key={label} className="flex items-center">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-300"
              style={i === phase ? { backgroundColor: cfg.hex.accent, color: '#fff' } : {}}
            >
              <span className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === phase ? 'bg-white' : i < phase ? 'bg-slate-400' : 'bg-slate-200'
              }`} />
              <span className={i === phase ? '' : i < phase ? 'text-slate-500' : 'text-slate-300'}>{label}</span>
            </div>
            {i < PHASES.length - 1 && (
              <div className={`w-5 h-px mx-0.5 transition-colors duration-500 ${i < phase ? 'bg-slate-400' : 'bg-slate-100'}`} />
            )}
          </div>
        ))}
      </div>

      <p className={`text-xs flex-1 text-right transition-all duration-300 ${
        phase === 2 ? 'font-semibold text-green-600' : 'text-slate-500'
      }`}>
        {message}
      </p>
    </div>
  );
}
