import { TASK_STEPS } from '../../data/demoContent';

export default function OverwhelmedView({ step, onStepChange }) {
  const current = TASK_STEPS[Math.min(step, TASK_STEPS.length - 1)];
  const isLast  = step >= TASK_STEPS.length - 1;
  const pct     = Math.round(((step + 1) / TASK_STEPS.length) * 100);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 px-6">

      {/* Calm prompt */}
      <p className="text-violet-400 text-sm font-medium mb-8 text-center">
        Focus on this one step first. That is all you need to do right now.
      </p>

      {/* One-step card */}
      <div
        key={step}
        className="w-full max-w-lg bg-white border-2 border-violet-100 rounded-3xl px-10 py-12 shadow-sm text-center"
        style={{ animation: 'slideCard 0.4s cubic-bezier(0.16,1,0.3,1) forwards' }}
      >
        <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
          {current.icon}
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-violet-300 mb-2">
          Step {step + 1} of {TASK_STEPS.length}
        </p>

        <h2 className="text-3xl font-light text-violet-900 mb-3 leading-tight">
          {current.simpleLabel}
        </h2>

        <p className="text-4xl font-bold text-violet-700 mb-4">
          {current.simpleValue}
        </p>

        <p className="text-violet-500 text-base leading-relaxed mb-2">
          {current.simpleDetail}
        </p>

        <p className="text-violet-300 text-sm italic mt-4">
          💡 {current.tip}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-5 mt-8">
        <button
          onClick={() => onStepChange(step - 1)}
          disabled={step === 0}
          className="px-6 py-3 rounded-xl border-2 border-violet-200 text-violet-600 text-sm font-medium disabled:opacity-30 hover:bg-violet-50 transition-all"
        >
          ← Back
        </button>

        {/* Dots */}
        <div className="flex gap-1.5">
          {TASK_STEPS.map((_, i) => (
            <div key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step       ? 'bg-violet-500 w-6 h-2'
                : i < step      ? 'bg-violet-300 w-2 h-2'
                :                  'bg-violet-100 w-2 h-2'
              }`}
            />
          ))}
        </div>

        {isLast ? (
          <div className="px-6 py-3 bg-violet-100 text-violet-600 rounded-xl text-sm font-medium">
            All steps done ✓
          </div>
        ) : (
          <button
            onClick={() => onStepChange(step + 1)}
            className="px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold shadow-md shadow-violet-200 transition-all"
          >
            Next →
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="mt-6 w-full max-w-xs">
        <div className="h-1 bg-violet-100 rounded-full overflow-hidden">
          <div className="h-full bg-violet-400 rounded-full transition-all duration-600"
            style={{ width: `${pct}%` }} />
        </div>
        <p className="text-center text-xs text-violet-300 mt-1.5">{pct}% of task reviewed</p>
      </div>

      {step === TASK_STEPS.length - 1 && (
        <div className="mt-6 p-4 bg-violet-100 rounded-2xl text-center max-w-lg w-full border border-violet-200">
          <p className="text-violet-700 font-semibold">
            {TASK_STEPS[TASK_STEPS.length - 1].completion}
          </p>
        </div>
      )}

      <style>{`
        @keyframes slideCard {
          from { opacity: 0; transform: translateX(16px) scale(0.98); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
