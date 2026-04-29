import { WHY_HELPS } from '../data/demoContent';

const MODES = [
  { id: 'overwhelmed', icon: '🌸', name: 'Overwhelmed', accent: 'violet' },
  { id: 'foggy',       icon: '🌥️', name: 'Foggy',       accent: 'amber'  },
  { id: 'anxious',     icon: '🌊', name: 'Anxious',     accent: 'teal'   },
  { id: 'stressed',    icon: '🌱', name: 'Stressed',    accent: 'green'  },
  { id: 'calm',        icon: '🌿', name: 'Calm',        accent: 'indigo' },
];

const ACCENT = {
  violet: { btn: 'bg-violet-500 text-white shadow-violet-200', ring: 'ring-2 ring-violet-400 ring-offset-1', idle: 'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-100' },
  amber:  { btn: 'bg-amber-500  text-white shadow-amber-200',  ring: 'ring-2 ring-amber-400  ring-offset-1', idle: 'bg-amber-50  text-amber-700  hover:bg-amber-100  border border-amber-100'  },
  teal:   { btn: 'bg-teal-500   text-white shadow-teal-200',   ring: 'ring-2 ring-teal-400   ring-offset-1', idle: 'bg-teal-50   text-teal-700   hover:bg-teal-100   border border-teal-100'   },
  green:  { btn: 'bg-green-500  text-white shadow-green-200',  ring: 'ring-2 ring-green-400  ring-offset-1', idle: 'bg-green-50  text-green-700  hover:bg-green-100  border border-green-100'  },
  indigo: { btn: 'bg-indigo-500 text-white shadow-indigo-200', ring: 'ring-2 ring-indigo-400 ring-offset-1', idle: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100' },
};

export default function ControlPanel({
  mode, onModeChange,
  step, stepCount,
  onNextStep, onPrevStep,
  onSimplify, onReadAloud,
  onSave, onReset,
  isTransitioning,
  isSpeaking,
}) {
  const current = MODES.find(m => m.id === mode) || MODES[4];
  const ac = ACCENT[current.accent];

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-100 overflow-y-auto">

      {/* Branding */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300 mb-0.5">Powered by</p>
        <p className="text-lg font-black text-slate-800 leading-tight">ODAI</p>
        <p className="text-[10px] text-slate-400 leading-tight">Optimized Digital Accessibility Intelligence</p>
      </div>

      {/* Mode selector */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">How are you feeling?</p>
        <div className="space-y-1.5">
          {MODES.map(m => {
            const a = ACCENT[m.accent];
            const active = m.id === mode;
            return (
              <button
                key={m.id}
                onClick={() => !isTransitioning && onModeChange(m.id)}
                disabled={isTransitioning}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 font-medium text-sm ${
                  active ? `${a.btn} shadow-md ${a.ring}` : a.idle
                } disabled:opacity-40`}
              >
                <span className="text-base">{m.icon}</span>
                <span>{m.name}</span>
                {active && <span className="ml-auto text-[10px] opacity-70">● active</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task progress */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Task progress</p>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-semibold text-slate-700">Step {Math.min(step + 1, stepCount)} of {stepCount}</p>
          <p className="text-xs text-slate-400">{Math.round(((step) / stepCount) * 100)}%</p>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-slate-400 rounded-full transition-all duration-700"
            style={{ width: `${Math.round((step / stepCount) * 100)}%` }}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onPrevStep}
            disabled={step === 0}
            className="flex-1 py-2 text-xs font-semibold border border-slate-200 text-slate-500 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all"
          >
            ← Back
          </button>
          <button
            onClick={onNextStep}
            disabled={step >= stepCount}
            className="flex-1 py-2 text-xs font-semibold bg-slate-700 text-white rounded-xl disabled:opacity-30 hover:bg-slate-900 transition-all"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Tools</p>

        <button
          onClick={onSimplify}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 transition-all shadow-sm"
        >
          <span>✨</span>
          <span>Simplify This</span>
        </button>

        <button
          onClick={onReadAloud}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
            isSpeaking
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>{isSpeaking ? '⏸' : '🔊'}</span>
          <span>{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</span>
        </button>

        <button
          onClick={onSave}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
        >
          <span>💾</span>
          <span>Save Progress</span>
        </button>

        <button
          onClick={onReset}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-400 text-sm hover:bg-slate-50 transition-all"
        >
          <span>↺</span>
          <span>Reset Demo</span>
        </button>
      </div>

      {/* Why This Helps */}
      <div className="px-4 pt-4 pb-5 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Why this helps</p>
        <div className={`p-3.5 rounded-2xl border transition-all duration-500 ${
          mode === 'overwhelmed' ? 'bg-violet-50 border-violet-100 text-violet-800'
          : mode === 'foggy'    ? 'bg-amber-50  border-amber-100  text-amber-800'
          : mode === 'anxious'  ? 'bg-teal-50   border-teal-100   text-teal-800'
          : mode === 'stressed' ? 'bg-green-50  border-green-100  text-green-800'
          :                       'bg-indigo-50 border-indigo-100 text-indigo-800'
        }`}>
          <p className="text-xs leading-relaxed">{WHY_HELPS[mode]}</p>
        </div>

        {/* ODAI note */}
        <p className="mt-4 text-center text-[10px] text-slate-300">
          ODAI · Optimized Digital Accessibility Intelligence
        </p>
      </div>
    </div>
  );
}
