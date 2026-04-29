import { modeConfigs } from '../../utils/modeConfigs';

const PHASES = ['Before', 'After', 'Outcome'];

const MESSAGES = {
  before:  'This page may feel overwhelming. Select a mode in the panel to transform it.',
  after:   (mode) => `ClearPath has adapted this page for ${modeConfigs[mode]?.name} mode.`,
  outcome: 'Task completed. You handled this one step at a time.',
};

export default function StatusCard({ mode, step, totalSteps, hasSelectedMode }) {
  const phase = !hasSelectedMode
    ? 0
    : step >= totalSteps
      ? 2
      : 1;

  const cfg = modeConfigs[mode] || modeConfigs.calm;

  const message = phase === 0
    ? MESSAGES.before
    : phase === 1
      ? MESSAGES.after(mode)
      : MESSAGES.outcome;

  return (
    <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between gap-4 flex-shrink-0">
      {/* Phase indicators */}
      <div className="flex items-center gap-0">
        {PHASES.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
              i === phase
                ? 'text-white shadow-sm'
                : i < phase
                  ? 'text-slate-500'
                  : 'text-slate-300'
            }`}
              style={i === phase ? { backgroundColor: cfg.hex.accent } : {}}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                i === phase ? 'bg-white' : i < phase ? 'bg-slate-400' : 'bg-slate-200'
              }`} />
              {label}
            </div>
            {i < PHASES.length - 1 && (
              <div className={`w-6 h-px mx-0.5 transition-colors duration-500 ${i < phase ? 'bg-slate-400' : 'bg-slate-100'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Message */}
      <p className={`text-xs flex-1 text-right transition-all duration-300 ${
        phase === 2 ? 'font-semibold text-green-600' : 'text-slate-500'
      }`}>
        {message}
      </p>
    </div>
  );
}
