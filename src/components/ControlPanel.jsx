import { useState, useRef, useEffect, useMemo } from 'react';
import { modeConfigs } from '../utils/modeConfigs';
import ConfidenceBar from './demo/ConfidenceBar';

const MODES = [
  { id:'overwhelmed', icon:'🌸', name:'Overwhelmed', tagline:'Too much at once',   accent:'violet' },
  { id:'foggy',       icon:'🌥️', name:'Foggy',       tagline:'Hard to focus',     accent:'amber'  },
  { id:'anxious',     icon:'🌊', name:'Anxious',     tagline:'Feeling worried',   accent:'teal'   },
  { id:'stressed',    icon:'🌱', name:'Stressed',    tagline:'Under pressure',    accent:'green'  },
  { id:'calm',        icon:'🌿', name:'Calm',        tagline:'All good',          accent:'indigo' },
];

const ACCENT_ACTIVE = {
  violet: 'bg-violet-500 text-white ring-2 ring-violet-300',
  amber:  'bg-amber-500  text-white ring-2 ring-amber-300',
  teal:   'bg-teal-500   text-white ring-2 ring-teal-300',
  green:  'bg-green-500  text-white ring-2 ring-green-300',
  indigo: 'bg-indigo-500 text-white ring-2 ring-indigo-300',
};
const ACCENT_IDLE = {
  violet: 'bg-slate-50 text-slate-600 hover:bg-violet-50 hover:text-violet-700 border border-slate-100',
  amber:  'bg-slate-50 text-slate-600 hover:bg-amber-50  hover:text-amber-700  border border-slate-100',
  teal:   'bg-slate-50 text-slate-600 hover:bg-teal-50   hover:text-teal-700   border border-slate-100',
  green:  'bg-slate-50 text-slate-600 hover:bg-green-50  hover:text-green-700  border border-slate-100',
  indigo: 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-100',
};

const WHY_COLORS = {
  overwhelmed: 'bg-violet-50 border-violet-100 text-violet-800',
  foggy:       'bg-amber-50  border-amber-100  text-amber-800',
  anxious:     'bg-teal-50   border-teal-100   text-teal-800',
  stressed:    'bg-green-50  border-green-100  text-green-800',
  calm:        'bg-indigo-50 border-indigo-100 text-indigo-800',
};

/* ─── Settings popover ──────────────────────────────── */
function SettingsPopover({ panelStyle, onStyleChange, voices, activeVoice, onVoiceChange, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-50 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-4"
      style={{ animation: 'defPopIn 0.15s ease forwards' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Settings</p>

      {/* Panel style toggle */}
      <div className="mb-3">
        <p className="text-xs text-slate-600 font-medium mb-2">Panel view</p>
        <div className="flex gap-1.5">
          {['simple', 'full'].map(s => (
            <button
              key={s}
              onClick={() => onStyleChange(s)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                panelStyle === s
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {s === 'simple' ? 'Simple' : 'Full'}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5">
          {panelStyle === 'simple' ? 'Clean, focused layout.' : 'All panels and details visible.'}
        </p>
      </div>

      {/* Voice selector */}
      {voices.length > 1 && (
        <div>
          <p className="text-xs text-slate-600 font-medium mb-1.5">Read-aloud voice</p>
          <select
            value={activeVoice?.name || ''}
            onChange={e => { const v = voices.find(v => v.name === e.target.value); if (v) onVoiceChange(v); }}
            className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white focus:outline-none"
          >
            {voices.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

/* ─── Main ControlPanel ─────────────────────────────── */
export default function ControlPanel({
  mode, onModeChange,
  scenario,
  step, stepCount,
  onNextStep, onPrevStep,
  onSimplify, onReadAloud,
  onSave, onReset, onCompare,
  isTransitioning, isSpeaking, showCompare,
  voices = [], activeVoice, onVoiceChange,
  panelStyle = 'simple', onPanelStyleChange,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const current    = MODES.find(m => m.id === mode) || MODES[4];
  const stepsDone  = Math.min(step, stepCount);
  const pct        = Math.round((stepsDone / stepCount) * 100);
  const whyHelps   = scenario?.whyHelps?.[mode] || '';

  const recommendation = useMemo(() => {
    if (!scenario) return null;
    const rec = scenario.recommendedMode;
    if (!rec || rec === mode) return null;
    return { mode: rec, reason: scenario.recommendationReason };
  }, [scenario, mode]);

  const timeEstimate = useMemo(() => {
    if (!scenario) return null;
    return { before: scenario.estimatedReadMinutes, after: scenario.estimatedModeMinutes };
  }, [scenario]);

  /* ── Shared sections ────────────────────────────── */
  const modeGridSimple = (
    <div className="px-3 pt-3 pb-2 border-b border-slate-100">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">How are you feeling?</p>
      <div className="grid grid-cols-5 gap-1 mb-1.5">
        {MODES.map(m => {
          const active = m.id === mode;
          return (
            <button
              key={m.id}
              title={`${m.name} — ${m.tagline}`}
              onClick={() => !isTransitioning && onModeChange(m.id)}
              disabled={isTransitioning}
              className={`flex flex-col items-center justify-center py-2 rounded-xl text-center transition-all duration-200 btn-micro disabled:opacity-40 ${
                active ? ACCENT_ACTIVE[m.accent] : ACCENT_IDLE[m.accent]
              }`}
            >
              <span className="text-lg leading-none">{m.icon}</span>
            </button>
          );
        })}
      </div>
      <p className="text-center text-xs font-semibold text-slate-600">{current.name}</p>
      <p className="text-center text-[10px] text-slate-400">{current.tagline}</p>
    </div>
  );

  const modeListFull = (
    <div className="px-3 pt-3 pb-2 border-b border-slate-100">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">How are you feeling?</p>
      <div className="space-y-1">
        {MODES.map(m => {
          const active = m.id === mode;
          return (
            <button
              key={m.id}
              onClick={() => !isTransitioning && onModeChange(m.id)}
              disabled={isTransitioning}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all duration-200 btn-micro disabled:opacity-40 ${
                active ? ACCENT_ACTIVE[m.accent] : ACCENT_IDLE[m.accent]
              }`}
            >
              <span className="text-base">{m.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold">{m.name}</span>
                <span className={`ml-1.5 text-[10px] ${active ? 'opacity-60' : 'opacity-50'}`}>{m.tagline}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const progressSection = (
    <div className="px-3 pt-3 pb-2 border-b border-slate-100">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-slate-700">Step {Math.min(step + 1, stepCount)} of {stepCount}</p>
        <p className="text-[10px] text-slate-400">{pct}%</p>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-slate-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      {panelStyle === 'full' && (
        <div className="mb-2"><ConfidenceBar step={stepsDone} stepCount={stepCount} /></div>
      )}
      <div className="flex gap-1.5">
        <button onClick={onPrevStep} disabled={step === 0}
          className="flex-1 py-1.5 text-xs font-semibold border border-slate-200 text-slate-500 rounded-lg disabled:opacity-30 hover:bg-slate-50 btn-micro">
          ← Back
        </button>
        <button onClick={onNextStep} disabled={step >= stepCount}
          className="flex-1 py-1.5 text-xs font-semibold bg-slate-700 text-white rounded-lg disabled:opacity-30 hover:bg-slate-900 btn-micro">
          Next →
        </button>
      </div>
    </div>
  );

  const toolsSimple = (
    <div className="px-3 pt-3 pb-2 border-b border-slate-100">
      <div className="grid grid-cols-2 gap-1.5 mb-1.5">
        <button onClick={onSimplify}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 btn-micro">
          <span>✨</span><span>Simplify</span>
        </button>
        <button onClick={onReadAloud}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold btn-micro border ${
            isSpeaking ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}>
          <span>{isSpeaking ? '⏸' : '🔊'}</span>
          <span>{isSpeaking ? 'Stop' : 'Read'}</span>
        </button>
        <button onClick={onCompare}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold btn-micro border ${
            showCompare ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}>
          <span>⇔</span><span>Compare</span>
        </button>
        <button onClick={onSave}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 btn-micro">
          <span>💾</span><span>Save</span>
        </button>
      </div>
      <button onClick={onReset}
        className="w-full text-[10px] text-slate-400 hover:text-slate-600 transition-colors py-1">
        ↺ Reset demo
      </button>
    </div>
  );

  const toolsFull = (
    <div className="px-3 pt-3 pb-2 border-b border-slate-100 space-y-1.5">
      <button onClick={onSimplify}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 btn-micro">
        <span>✨</span><span>Simplify This</span>
      </button>
      <button onClick={onReadAloud}
        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold btn-micro border ${
          isSpeaking ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}>
        <span>{isSpeaking ? '⏸' : '🔊'}</span>
        <span>{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</span>
      </button>
      <button onClick={onCompare}
        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold btn-micro border ${
          showCompare ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}>
        <span>⇔</span><span>{showCompare ? 'Exit Compare' : 'Compare View'}</span>
      </button>
      <button onClick={onSave}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 btn-micro">
        <span>💾</span><span>Save Progress</span>
      </button>
      <button onClick={onReset}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-400 text-sm hover:bg-slate-50 btn-micro">
        <span>↺</span><span>Reset Demo</span>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-100 overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-slate-100 flex-shrink-0">
        <div>
          <p className="text-sm font-black text-slate-800 leading-tight">ODAI</p>
          <p className="text-[9px] text-slate-400">ClearPath assistant</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSettings(v => !v)}
            aria-label="Settings"
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-colors btn-micro ${
              showSettings ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            ⚙
          </button>
          {showSettings && (
            <SettingsPopover
              panelStyle={panelStyle}
              onStyleChange={onPanelStyleChange}
              voices={voices}
              activeVoice={activeVoice}
              onVoiceChange={onVoiceChange}
              onClose={() => setShowSettings(false)}
            />
          )}
        </div>
      </div>

      {/* Recommendation (full mode only) */}
      {panelStyle === 'full' && recommendation && (
        <div className="px-3 pt-2 pb-2 border-b border-slate-100">
          <div className="p-2.5 bg-violet-50 border border-violet-100 rounded-xl">
            <p className="text-[10px] font-bold text-violet-500 mb-1">💡 Suggestion</p>
            <p className="text-xs text-violet-700 leading-relaxed mb-2">{recommendation.reason}</p>
            <button
              onClick={() => onModeChange(recommendation.mode)}
              disabled={isTransitioning}
              className="text-[10px] font-semibold bg-violet-500 text-white px-2.5 py-1 rounded-lg btn-micro disabled:opacity-40"
            >
              Try {modeConfigs[recommendation.mode]?.name} →
            </button>
          </div>
        </div>
      )}

      {/* Time estimate (full mode only) */}
      {panelStyle === 'full' && timeEstimate && (
        <div className="px-3 pt-2 pb-2 border-b border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Est. time</p>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 bg-red-50 border border-red-100 rounded-lg px-2 py-1.5 text-center">
              <p className="text-[9px] text-red-400">Without</p>
              <p className="text-sm font-bold text-red-600">{timeEstimate.before}m</p>
            </div>
            <span className="text-slate-300">→</span>
            <div className="flex-1 bg-green-50 border border-green-100 rounded-lg px-2 py-1.5 text-center">
              <p className="text-[9px] text-green-500">With</p>
              <p className="text-sm font-bold text-green-600">{timeEstimate.after}m</p>
            </div>
          </div>
        </div>
      )}

      {/* Mode selector */}
      {panelStyle === 'simple' ? modeGridSimple : modeListFull}

      {/* Progress */}
      {progressSection}

      {/* Tools */}
      {panelStyle === 'simple' ? toolsSimple : toolsFull}

      {/* Why this helps */}
      <div className="px-3 pt-3 pb-4 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Why this helps</p>
        <div className={`p-3 rounded-xl border text-xs leading-relaxed transition-all duration-500 ${WHY_COLORS[mode] || WHY_COLORS.calm}`}>
          {whyHelps}
        </div>
        <p className="mt-3 text-center text-[9px] text-slate-300">ODAI · Optimized Digital Accessibility Intelligence</p>
      </div>
    </div>
  );
}
