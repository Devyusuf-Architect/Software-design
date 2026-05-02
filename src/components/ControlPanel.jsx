import { useMemo } from 'react';
import { modeConfigs } from '../utils/modeConfigs';
import ConfidenceBar from './demo/ConfidenceBar';

const MODES = [
  { id:'overwhelmed', icon:'🌸', name:'Overwhelmed', tagline:'Too much at once',   accent:'violet' },
  { id:'foggy',       icon:'🌥️', name:'Foggy',       tagline:'Hard to focus',     accent:'amber'  },
  { id:'anxious',     icon:'🌊', name:'Anxious',     tagline:'Feeling worried',   accent:'teal'   },
  { id:'stressed',    icon:'🌱', name:'Stressed',    tagline:'Under pressure',    accent:'green'  },
  { id:'calm',        icon:'🌿', name:'Calm',        tagline:'All good',          accent:'indigo' },
];

const AC = {
  violet:{ btn:'bg-violet-500 text-white',  ring:'ring-2 ring-violet-300 ring-offset-1', idle:'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-100'  },
  amber: { btn:'bg-amber-500  text-white',  ring:'ring-2 ring-amber-300  ring-offset-1', idle:'bg-amber-50  text-amber-700  hover:bg-amber-100  border border-amber-100'   },
  teal:  { btn:'bg-teal-500   text-white',  ring:'ring-2 ring-teal-300   ring-offset-1', idle:'bg-teal-50   text-teal-700   hover:bg-teal-100   border border-teal-100'    },
  green: { btn:'bg-green-500  text-white',  ring:'ring-2 ring-green-300  ring-offset-1', idle:'bg-green-50  text-green-700  hover:bg-green-100  border border-green-100'   },
  indigo:{ btn:'bg-indigo-500 text-white',  ring:'ring-2 ring-indigo-300 ring-offset-1', idle:'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'  },
};

export default function ControlPanel({
  mode, onModeChange,
  scenario,
  step, stepCount,
  onNextStep, onPrevStep,
  onSimplify, onReadAloud,
  onSave, onReset, onCompare,
  isTransitioning,
  isSpeaking,
  showCompare,
  voices = [],
  activeVoice,
  onVoiceChange,
}) {
  const current = MODES.find(m => m.id === mode) || MODES[4];

  // Mode recommendation from scenario
  const recommendation = useMemo(() => {
    if (!scenario) return null;
    const rec = scenario.recommendedMode;
    const reason = scenario.recommendationReason;
    if (!rec || rec === mode) return null;
    return { mode: rec, reason };
  }, [scenario, mode]);

  // Time to complete estimate
  const timeEstimate = useMemo(() => {
    if (!scenario) return null;
    return {
      before: scenario.estimatedReadMinutes,
      after:  scenario.estimatedModeMinutes,
    };
  }, [scenario]);

  const whyHelps = scenario?.whyHelps?.[mode] || '';
  const stepsDone = Math.min(step, stepCount);

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-100 overflow-y-auto">

      {/* Branding */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300 mb-0.5">Powered by</p>
        <p className="text-lg font-black text-slate-800 leading-tight">ODAI</p>
        <p className="text-[10px] text-slate-400 leading-tight">Optimized Digital Accessibility Intelligence</p>
      </div>

      {/* Time to complete */}
      {timeEstimate && (
        <div className="px-4 pt-3 pb-2 border-b border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Estimated time</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-red-50 border border-red-100 rounded-xl px-2.5 py-2 text-center">
              <p className="text-[10px] text-red-400 mb-0.5">Without ClearPath</p>
              <p className="text-sm font-bold text-red-600">{timeEstimate.before} min</p>
            </div>
            <span className="text-slate-300 text-sm">→</span>
            <div className="flex-1 bg-green-50 border border-green-100 rounded-xl px-2.5 py-2 text-center">
              <p className="text-[10px] text-green-500 mb-0.5">With ClearPath</p>
              <p className="text-sm font-bold text-green-600">{timeEstimate.after} min</p>
            </div>
          </div>
        </div>
      )}

      {/* Mode recommendation */}
      {recommendation && (
        <div className="px-4 pt-3 pb-2 border-b border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">💡 Suggestion</p>
          <div className="p-2.5 bg-violet-50 border border-violet-100 rounded-xl">
            <p className="text-xs text-violet-700 leading-relaxed mb-2">{recommendation.reason}</p>
            <button
              onClick={() => onModeChange(recommendation.mode)}
              disabled={isTransitioning}
              className="text-[10px] font-semibold bg-violet-500 text-white px-3 py-1 rounded-lg btn-micro transition-all disabled:opacity-40"
            >
              Try {modeConfigs[recommendation.mode]?.name} mode →
            </button>
          </div>
        </div>
      )}

      {/* Mode selector */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">How are you feeling?</p>
        <div className="space-y-1.5">
          {MODES.map(m => {
            const a = AC[m.accent];
            const active = m.id === mode;
            return (
              <button
                key={m.id}
                onClick={() => !isTransitioning && onModeChange(m.id)}
                disabled={isTransitioning}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 text-sm ${
                  active ? `${a.btn} shadow-md ${a.ring} mode-card-enter` : `${a.idle} card-hover`
                } disabled:opacity-40`}
              >
                <span className="text-base">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold">{m.name}</span>
                  <span className={`ml-1.5 text-[10px] ${active ? 'opacity-60' : 'opacity-50'}`}>{m.tagline}</span>
                </div>
                {active && <span className="text-[9px] opacity-60 flex-shrink-0">● active</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task progress + confidence */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Task progress</p>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-semibold text-slate-700">Step {Math.min(step + 1, stepCount)} of {stepCount}</p>
          <p className="text-xs text-slate-400">{Math.round((stepsDone / stepCount) * 100)}%</p>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-slate-400 rounded-full transition-all duration-700"
            style={{ width: `${Math.round((stepsDone / stepCount) * 100)}%` }}
          />
        </div>
        <div className="mb-3">
          <ConfidenceBar step={stepsDone} stepCount={stepCount} />
        </div>
        <div className="flex gap-2">
          <button onClick={onPrevStep} disabled={step === 0}
            className="flex-1 py-2 text-xs font-semibold border border-slate-200 text-slate-500 rounded-xl disabled:opacity-30 hover:bg-slate-50 btn-micro transition-all">
            ← Back
          </button>
          <button onClick={onNextStep} disabled={step >= stepCount}
            className="flex-1 py-2 text-xs font-semibold bg-slate-700 text-white rounded-xl disabled:opacity-30 hover:bg-slate-900 btn-micro transition-all">
            Next →
          </button>
        </div>
      </div>

      {/* Action tools */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Tools</p>

        <button onClick={onSimplify}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 btn-micro transition-all shadow-sm">
          <span>✨</span><span>Simplify This</span>
        </button>

        <button onClick={onReadAloud}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold btn-micro transition-all border ${
            isSpeaking ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}>
          <span>{isSpeaking ? '⏸' : '🔊'}</span>
          <span>{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</span>
        </button>

        <button onClick={onCompare}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold btn-micro transition-all border ${
            showCompare ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}>
          <span>⇔</span><span>{showCompare ? 'Exit Compare' : 'Compare View'}</span>
        </button>

        <button onClick={onSave}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 btn-micro transition-all">
          <span>💾</span><span>Save Progress</span>
        </button>

        <button onClick={onReset}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-400 text-sm hover:bg-slate-50 btn-micro transition-all">
          <span>↺</span><span>Reset Demo</span>
        </button>

        {/* Voice selector — only shown when multiple voices are available */}
        {voices.length > 1 && (
          <div>
            <p className="text-[10px] text-slate-400 mb-1 mt-1">🔊 Voice</p>
            <select
              value={activeVoice?.name || ''}
              onChange={e => {
                const v = voices.find(v => v.name === e.target.value);
                if (v) onVoiceChange(v);
              }}
              className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 text-slate-600 bg-white focus:outline-none focus:border-slate-400"
            >
              {voices.map(v => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Why this helps */}
      <div className="px-4 pt-4 pb-5 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Why this helps</p>
        <div className={`p-3.5 rounded-2xl border transition-all duration-500 slide-in-up ${
          mode === 'overwhelmed' ? 'bg-violet-50 border-violet-100 text-violet-800'
          : mode === 'foggy'    ? 'bg-amber-50  border-amber-100  text-amber-800'
          : mode === 'anxious'  ? 'bg-teal-50   border-teal-100   text-teal-800'
          : mode === 'stressed' ? 'bg-green-50  border-green-100  text-green-800'
          :                       'bg-indigo-50 border-indigo-100 text-indigo-800'
        }`}>
          <p className="text-xs leading-relaxed">{whyHelps}</p>
        </div>
        <p className="mt-4 text-center text-[10px] text-slate-300">
          ODAI · Optimized Digital Accessibility Intelligence
        </p>
      </div>
    </div>
  );
}
