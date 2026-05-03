import { useState, useRef, useEffect, useMemo } from 'react';
import { modeConfigs } from '../utils/modeConfigs';

const FEELING_MODES = [
  { id:'overwhelmed', icon:'🌸', name:'Overwhelmed' },
  { id:'foggy',       icon:'🌥️', name:'Foggy'       },
  { id:'anxious',     icon:'🌊', name:'Anxious'     },
  { id:'stressed',    icon:'🌱', name:'Stressed'    },
  { id:'calm',        icon:'🌿', name:'Calm'        },
];

/* ─── Settings popover ──────────────────────────────── */
function SettingsPopover({ panelStyle, onStyleChange, voices, activeVoice, onVoiceChange, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-8 z-50 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Settings</p>
      <div className="mb-3">
        <p className="text-xs text-slate-600 font-medium mb-1.5">Panel view</p>
        <div className="flex gap-1.5">
          {['simple', 'full'].map(s => (
            <button key={s} onClick={() => onStyleChange(s)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                panelStyle === s ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}>
              {s === 'simple' ? 'Simple' : 'Full'}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          {panelStyle === 'simple' ? 'Clean, focused.' : 'All details shown.'}
        </p>
      </div>
      {voices.length > 1 && (
        <div>
          <p className="text-xs text-slate-600 font-medium mb-1">Read-aloud voice</p>
          <select value={activeVoice?.name || ''}
            onChange={e => { const v = voices.find(v => v.name === e.target.value); if (v) onVoiceChange(v); }}
            className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
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
  onSimplify, onReadAloud, onSave, onReset, onCompare,
  isTransitioning, isSpeaking, showCompare,
  voices = [], activeVoice, onVoiceChange,
  panelStyle = 'simple', onPanelStyleChange,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [showWhy,      setShowWhy]      = useState(false);
  const [showMore,     setShowMore]     = useState(false);

  const cfg        = modeConfigs[mode] || modeConfigs.calm;
  const stepsDone  = Math.min(step, stepCount);
  const pct        = Math.round((stepsDone / stepCount) * 100);
  const whyHelps   = scenario?.whyHelps?.[mode] || '';

  const recommendation = useMemo(() => {
    if (!scenario) return null;
    const rec = scenario.recommendedMode;
    if (!rec || rec === mode) return null;
    return { mode: rec, reason: scenario.recommendationReason };
  }, [scenario, mode]);

  // Style helpers using inline styles for exact mode colors
  const btnPrimary = {
    background: cfg.hex.accent,
    color: '#fff',
    boxShadow: `0 2px 8px ${cfg.hex.accent}40`,
  };
  const btnSecondary = {
    background: cfg.hex.accentLight,
    color: cfg.hex.text,
    border: `1px solid ${cfg.hex.accent}30`,
  };
  const chipStyle = {
    background: cfg.hex.accentLight,
    color: cfg.hex.accent,
    border: `1px solid ${cfg.hex.accent}35`,
  };

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: cfg.hex.panel }}
    >
      {/* ── Header ──────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3 pt-3 pb-2.5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${cfg.hex.accent}20` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{cfg.icon}</span>
          <div>
            <p className="text-sm font-bold leading-tight" style={{ color: cfg.hex.text }}>
              {cfg.name}
            </p>
            <p className="text-[10px] leading-tight" style={{ color: cfg.hex.accent, opacity: 0.8 }}>
              {cfg.tagline}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 relative">
          <span className="text-[9px] font-bold tracking-widest" style={{ color: cfg.hex.accent, opacity: 0.5 }}>ODAI</span>
          <button
            onClick={() => setShowSettings(v => !v)}
            aria-label="Settings"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all btn-micro"
            style={showSettings ? { background: cfg.hex.accent, color: '#fff' } : { background: cfg.hex.accentLight, color: cfg.hex.accent }}
          >⚙</button>
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

      {/* ── Original mode: strong CTA ────────────────── */}
      {mode === 'original' ? (
        <div className="px-3 pt-4 pb-3 flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-600 mb-1">This is the unprocessed view.</p>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Select how you are feeling to let ClearPath adapt this content for you.
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {FEELING_MODES.map(m => (
              <button key={m.id}
                onClick={() => !isTransitioning && onModeChange(m.id)}
                disabled={isTransitioning}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all btn-micro disabled:opacity-40"
                style={{ background: modeConfigs[m.id].hex.accentLight, color: modeConfigs[m.id].hex.text, border: `1px solid ${modeConfigs[m.id].hex.accent}30` }}
              >
                <span className="text-lg">{m.icon}</span>
                <div>
                  <span className="font-semibold">{m.name}</span>
                  <span className="block text-[10px] opacity-70">{modeConfigs[m.id].tagline}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* ── Mode selector (non-original modes) ─── */}
          <div className="px-3 pt-3 pb-2.5" style={{ borderBottom: `1px solid ${cfg.hex.accent}20` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: cfg.hex.accent, opacity: 0.7 }}>
              Change mode
            </p>
            <div className="grid grid-cols-5 gap-1">
              {FEELING_MODES.map(m => {
                const active = m.id === mode;
                const mc = modeConfigs[m.id];
                return (
                  <button key={m.id}
                    title={`${m.name} — ${mc.tagline}`}
                    onClick={() => !isTransitioning && onModeChange(m.id)}
                    disabled={isTransitioning}
                    className="flex flex-col items-center py-2 rounded-xl transition-all duration-200 btn-micro disabled:opacity-40"
                    style={active
                      ? { background: cfg.hex.accent, boxShadow: `0 2px 6px ${cfg.hex.accent}50` }
                      : { background: cfg.hex.accentLight }}
                  >
                    <span className="text-base leading-none">{m.icon}</span>
                    {active && <span className="text-[8px] mt-0.5 font-bold" style={{ color: '#fff', opacity: 0.85 }}>●</span>}
                  </button>
                );
              })}
            </div>
            {/* Original view link */}
            <button
              onClick={() => !isTransitioning && onModeChange('original')}
              disabled={isTransitioning}
              className="mt-2 w-full text-[10px] py-1.5 rounded-lg transition-all btn-micro"
              style={{ color: cfg.hex.accent, opacity: 0.7, background: cfg.hex.accentLight }}
            >
              📄 View original (no ClearPath)
            </button>
          </div>

          {/* ── Progress ─────────────────────────────── */}
          <div className="px-3 pt-3 pb-2.5" style={{ borderBottom: `1px solid ${cfg.hex.accent}20` }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold" style={{ color: cfg.hex.text }}>
                Step {Math.min(step + 1, stepCount)} of {stepCount}
              </span>
              <span className="text-[10px]" style={{ color: cfg.hex.accent }}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-2.5" style={{ background: cfg.hex.accentLight }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: cfg.hex.accent }} />
            </div>
            <div className="flex gap-1.5">
              <button onClick={onPrevStep} disabled={step === 0}
                className="flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all btn-micro disabled:opacity-30"
                style={{ ...btnSecondary }}>
                ← Back
              </button>
              <button onClick={onNextStep} disabled={step >= stepCount}
                className="flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all btn-micro disabled:opacity-30"
                style={step < stepCount ? btnPrimary : { ...btnSecondary, opacity: 0.4 }}>
                Next →
              </button>
            </div>
          </div>

          {/* ── Primary tools ────────────────────────── */}
          <div className="px-3 pt-3 pb-2.5" style={{ borderBottom: `1px solid ${cfg.hex.accent}20` }}>
            <button onClick={onSimplify}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold mb-2 btn-micro transition-all"
              style={btnPrimary}>
              <span>✨</span><span>Simplify this</span>
            </button>
            <button onClick={onReadAloud}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium btn-micro transition-all"
              style={isSpeaking
                ? { background: cfg.hex.accent, color: '#fff' }
                : btnSecondary
              }>
              <span>{isSpeaking ? '⏸' : '🔊'}</span>
              <span>{isSpeaking ? 'Stop reading' : 'Read aloud'}</span>
            </button>
          </div>

          {/* ── Why this helps (collapsible chip) ────── */}
          {whyHelps && (
            <div className="px-3 pt-2.5 pb-2" style={{ borderBottom: `1px solid ${cfg.hex.accent}20` }}>
              <button
                onClick={() => setShowWhy(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-micro"
                style={chipStyle}
              >
                <span>💡 Why does this help?</span>
                <span style={{ opacity: 0.6 }}>{showWhy ? '▲' : '▼'}</span>
              </button>
              {showWhy && (
                <div className="mt-1.5 px-3 py-2.5 rounded-xl text-xs leading-relaxed slide-in-up"
                  style={{ background: cfg.hex.accentLight, color: cfg.hex.text }}>
                  {whyHelps}
                </div>
              )}
            </div>
          )}

          {/* ── More tools (collapsible) ──────────────── */}
          <div className="px-3 pt-2 pb-3">
            <button
              onClick={() => setShowMore(v => !v)}
              className="w-full text-center text-xs py-1.5 rounded-lg transition-all btn-micro"
              style={{ color: cfg.hex.accent, opacity: 0.65, background: 'transparent' }}
            >
              {showMore ? '▲ Hide tools' : '⋯ More tools'}
            </button>

            {showMore && (
              <div className="mt-2 space-y-1.5 slide-in-up">

                {/* Compare — mode-colored dashed border */}
                <button onClick={onCompare}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all btn-micro border-2 border-dashed"
                  style={showCompare
                    ? { background: cfg.hex.accent, color: '#fff', borderColor: cfg.hex.accent }
                    : { ...chipStyle, borderStyle: 'dashed', borderColor: cfg.hex.accent + '50' }
                  }>
                  <span>⇔</span>
                  <span>{showCompare ? 'Exit compare view' : 'Compare with original'}</span>
                </button>

                {panelStyle === 'full' && recommendation && (
                  <div className="p-2.5 rounded-xl" style={{ background: cfg.hex.accentLight }}>
                    <p className="text-[10px] font-bold mb-1" style={{ color: cfg.hex.accent }}>💡 Suggestion</p>
                    <p className="text-xs leading-relaxed mb-1.5" style={{ color: cfg.hex.text }}>{recommendation.reason}</p>
                    <button onClick={() => onModeChange(recommendation.mode)} disabled={isTransitioning}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg btn-micro disabled:opacity-40"
                      style={btnPrimary}>
                      Try {modeConfigs[recommendation.mode]?.name} →
                    </button>
                  </div>
                )}

                <button onClick={onSave}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all btn-micro"
                  style={btnSecondary}>
                  <span>💾</span><span>Save progress</span>
                </button>

                {panelStyle === 'full' && scenario?.estimatedReadMinutes && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 rounded-lg px-2 py-1.5 text-center bg-white bg-opacity-60 border border-red-100">
                      <p className="text-[9px] text-red-400">Without ClearPath</p>
                      <p className="text-sm font-bold text-red-500">{scenario.estimatedReadMinutes}m</p>
                    </div>
                    <span className="text-slate-300">→</span>
                    <div className="flex-1 rounded-lg px-2 py-1.5 text-center" style={{ background: cfg.hex.accentLight }}>
                      <p className="text-[9px]" style={{ color: cfg.hex.accent }}>With ClearPath</p>
                      <p className="text-sm font-bold" style={{ color: cfg.hex.accent }}>{scenario.estimatedModeMinutes}m</p>
                    </div>
                  </div>
                )}

                <button onClick={onReset}
                  className="w-full text-center text-[10px] py-1 transition-all btn-micro"
                  style={{ color: cfg.hex.accent, opacity: 0.5 }}>
                  ↺ Reset demo
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
