import { useState } from 'react';
import { modeConfigs } from '../../utils/modeConfigs';
import ClearPathLogo from '../ClearPathLogo';

const ALL_MODES = ['calm', 'overwhelmed', 'foggy', 'anxious', 'stressed', 'original'];

/* ── Bold key terms (amounts, dates, action words) ─────────────────── */
function BoldTerms({ text }) {
  const parts = String(text).split(
    /(\$[\d,.]+|\b\d+\/\d+\/\d+\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d+,?\s*\d{0,4}\b|\b(?:pay|submit|call|review|click|select|complete|confirm|deadline)\b)/gi
  );
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1
          ? <strong key={i} className="font-bold text-white">{p}</strong>
          : p
      )}
    </>
  );
}

/* ── Calm ───────────────────────────────────────────────────────────── */
function CalmContent({ result, cfg }) {
  const a = cfg.hex.accent;
  return (
    <div className="p-5 space-y-4">
      {result.mainIdea && (
        <div className="rounded-xl p-4" style={{ background: a + '14', border: `1px solid ${a}28` }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: a }}>Summary</p>
          <p className="text-sm leading-relaxed text-slate-200">{result.mainIdea}</p>
        </div>
      )}
      {result.keyPoints?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: a }}>Key points</p>
          <ul className="space-y-2">
            {result.keyPoints.map((pt, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                  style={{ background: a + '28', color: a }}>{i + 1}</span>
                <span className="leading-relaxed">{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="rounded-xl p-4" style={{ background: a + '22', border: `1px solid ${a}40` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: a }}>What matters most</p>
        <p className="text-sm leading-relaxed text-slate-100 font-medium">{result.mattersMost}</p>
      </div>
      <div className="rounded-xl p-4 border-l-2" style={{ background: 'rgba(255,255,255,0.03)', borderLeftColor: a }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: a }}>Next step</p>
        <p className="text-sm leading-relaxed text-slate-200">{result.nextStep}</p>
      </div>
    </div>
  );
}

/* ── Overwhelmed ────────────────────────────────────────────────────── */
function OverwhelmedContent({ result, cfg, step, setStep }) {
  const a = cfg.hex.accent;
  const slides = [
    { heading: 'What matters most', content: result.mattersMost },
    { heading: 'What to do next',   content: result.nextStep },
    { heading: "You've reviewed it", content: 'That\'s all you need right now. Take your time with the next step.', final: true },
  ];
  const curr  = slides[step];
  const total = slides.length;

  return (
    <div className="p-6 flex flex-col items-center min-h-[320px]">
      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-8">
        {slides.map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-300"
            style={{
              width:      i === step ? 28 : 8,
              height:     8,
              background: i <= step ? a : 'rgba(255,255,255,0.12)',
            }} />
        ))}
      </div>

      <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: a + 'aa' }}>
        Step {step + 1} of {total}
      </p>

      <div className="w-full rounded-2xl p-6 text-center mb-5"
        style={{ background: a + '16', border: `1px solid ${a}32` }}>
        {curr.final && (
          <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ background: a + '28' }}>
            <span className="text-lg">✓</span>
          </div>
        )}
        <p className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: a }}>{curr.heading}</p>
        <p className="text-base font-semibold text-white leading-relaxed">{curr.content}</p>
      </div>

      <p className="text-[11px] text-slate-600 mb-6 italic">Take a breath. One step at a time.</p>

      <div className="flex items-center gap-3 w-full">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>
            ← Back
          </button>
        )}
        {step < total - 1 && (
          <button onClick={() => setStep(s => s + 1)}
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
            style={{ background: a, color: '#fff', boxShadow: `0 4px 16px ${a}44` }}>
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Foggy ──────────────────────────────────────────────────────────── */
function FoggyContent({ result, cfg }) {
  const a = cfg.hex.accent;
  return (
    <div className="p-5 space-y-4">
      <div className="rounded-xl p-4" style={{ background: a + '14', border: `1px solid ${a}28` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: a }}>The short version</p>
        <p className="text-sm leading-loose text-slate-200">
          <BoldTerms text={result.mattersMost} />
        </p>
      </div>
      {result.keyPoints?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: a }}>Key points</p>
          <div className="space-y-2">
            {result.keyPoints.map((pt, i) => (
              <div key={i} className="flex gap-3 px-3.5 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-[11px] font-bold mt-0.5 flex-shrink-0" style={{ color: a }}>#{i + 1}</span>
                <p className="text-sm text-slate-300 leading-relaxed"><BoldTerms text={pt} /></p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="rounded-xl p-4 border-l-2" style={{ background: 'rgba(255,255,255,0.03)', borderLeftColor: a }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: a }}>Next step</p>
        <p className="text-sm leading-relaxed text-slate-200"><BoldTerms text={result.nextStep} /></p>
      </div>
    </div>
  );
}

/* ── Anxious ────────────────────────────────────────────────────────── */
function AnxiousContent({ result, cfg }) {
  const a = cfg.hex.accent;
  return (
    <div className="p-5 space-y-4">
      <div className="rounded-xl p-4 text-center" style={{ background: a + '14', border: `1px solid ${a}28` }}>
        <p className="text-base font-semibold text-slate-200 mb-1">Take a breath.</p>
        <p className="text-[12px] text-slate-400">Here is what is happening, explained calmly.</p>
      </div>
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: a }}>What is happening</p>
        <p className="text-sm leading-relaxed text-slate-300">{result.mattersMost}</p>
      </div>
      {result.keyPoints?.length > 0 && (
        <div className="space-y-2">
          {result.keyPoints.map((pt, i) => (
            <div key={i} className="flex gap-2.5 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <span className="text-slate-600 flex-shrink-0 mt-0.5">·</span>
              <p className="text-sm text-slate-400 leading-relaxed">{pt}</p>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-xl p-4" style={{ background: a + '18', border: `1px solid ${a}34` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: a }}>When you are ready</p>
        <p className="text-sm leading-relaxed text-slate-100 font-medium">{result.nextStep}</p>
      </div>
      <div className="rounded-xl p-3.5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-[12px] text-slate-500">You are in control. There is no rush.</p>
        {result.reassurance && (
          <p className="text-[11px] text-slate-600 mt-0.5">{result.reassurance}</p>
        )}
      </div>
    </div>
  );
}

/* ── Stressed ───────────────────────────────────────────────────────── */
function StressedContent({ result, cfg, checkedSteps, toggleStep }) {
  const a     = cfg.hex.accent;
  const total = result.steps?.length || 0;
  const done  = Object.values(checkedSteps).filter(Boolean).length;

  return (
    <div className="p-5 space-y-4">
      {total > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: a }}>Progress</p>
            <p className="text-[11px] font-semibold" style={{ color: a }}>{done} / {total} done</p>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-400"
              style={{ width: `${total ? (done / total) * 100 : 0}%`, background: a }} />
          </div>
        </div>
      )}
      {result.steps?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: a }}>Action checklist</p>
          <div className="space-y-2">
            {result.steps.map(({ n, text: t }) => (
              <button key={n} onClick={() => toggleStep(n)}
                className="w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all"
                style={{
                  background: checkedSteps[n] ? a + '22' : 'rgba(255,255,255,0.04)',
                  border:     checkedSteps[n] ? `1px solid ${a}40` : '1px solid rgba(255,255,255,0.07)',
                }}>
                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                  style={{ background: checkedSteps[n] ? a : 'rgba(255,255,255,0.12)', border: checkedSteps[n] ? 'none' : '1px solid rgba(255,255,255,0.25)' }}>
                  {checkedSteps[n] && <span className="text-white text-[10px] font-bold">✓</span>}
                </div>
                <span className="text-sm leading-relaxed"
                  style={{ color: checkedSteps[n] ? '#475569' : '#CBD5E1', textDecoration: checkedSteps[n] ? 'line-through' : 'none' }}>
                  {t}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="rounded-xl p-4 border-l-2" style={{ background: 'rgba(255,255,255,0.03)', borderLeftColor: a }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: a }}>Focus on first</p>
        <p className="text-sm leading-relaxed text-slate-200">{result.nextStep}</p>
      </div>
    </div>
  );
}

/* ── Original ───────────────────────────────────────────────────────── */
function OriginalContent({ text, cfg }) {
  const a = cfg.hex.accent;
  return (
    <div className="p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: a }}>Original content</p>
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap font-mono text-[12px]">{text}</p>
      </div>
    </div>
  );
}

/* ── ModeContent dispatcher ─────────────────────────────────────────── */
function ModeContent({ mode, result, cfg, text, overwhelmedStep, setOverwhelmedStep, checkedSteps, toggleStep }) {
  if (!result) return (
    <div className="p-6 text-slate-500 text-sm text-center">No analysis available.</div>
  );
  switch (mode) {
    case 'overwhelmed': return <OverwhelmedContent result={result} cfg={cfg} step={overwhelmedStep} setStep={setOverwhelmedStep} />;
    case 'foggy':       return <FoggyContent result={result} cfg={cfg} />;
    case 'anxious':     return <AnxiousContent result={result} cfg={cfg} />;
    case 'stressed':    return <StressedContent result={result} cfg={cfg} checkedSteps={checkedSteps} toggleStep={toggleStep} />;
    case 'original':    return <OriginalContent text={text} cfg={cfg} />;
    default:            return <CalmContent result={result} cfg={cfg} />;
  }
}

/* ════════════════════════════════════════════════════════════════════
   DIAGNOSE VIEW
   ════════════════════════════════════════════════════════════════════ */
export default function DiagnoseView({
  text,
  results,
  suggestedMode,
  currentMode,
  onModeChange,
  onReturnToOverlay,
  onEndSession,
  onMinimize,
  onClose,
}) {
  const [activeMode,       setActiveMode]       = useState(suggestedMode || currentMode || 'calm');
  const [overwhelmedStep,  setOverwhelmedStep]  = useState(0);
  const [checkedSteps,     setCheckedSteps]     = useState({});
  const [suggBannerDone,   setSuggBannerDone]   = useState(!suggestedMode || suggestedMode === (currentMode || 'calm'));

  const result = results?.[activeMode];
  const cfg    = modeConfigs[activeMode] || modeConfigs.calm;
  const suggCfg = suggestedMode ? (modeConfigs[suggestedMode] || modeConfigs.calm) : null;

  const handleModeChange = (m) => {
    setActiveMode(m);
    setOverwhelmedStep(0);
    onModeChange?.(m);
  };

  const toggleStep = (n) => setCheckedSteps(prev => ({ ...prev, [n]: !prev[n] }));

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: '#0A0F1E', color: '#F1F5F9' }}>

      {/* ── Title bar ──────────────────────────────────────────────── */}
      <div
        data-tauri-drag-region
        className="flex-shrink-0 flex items-center justify-between px-4 py-2.5"
        style={{ background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.06)', userSelect: 'none' }}
      >
        {/* Breadcrumb */}
        <button onClick={onReturnToOverlay}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors">
          <span>←</span>
          <span>Overlay</span>
          <span className="text-slate-700 mx-0.5">/</span>
          <span className="text-white font-semibold text-sm">Diagnose Mode</span>
        </button>

        {/* Active indicator */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full pointer-events-none"
          style={{ background: cfg.hex.accent + '18', border: `1px solid ${cfg.hex.accent}35` }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.hex.accent }} />
          <span className="text-[10px] font-semibold" style={{ color: cfg.hex.accent }}>Screen Analysis Active</span>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1">
          <button onClick={onMinimize}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/10 text-xs transition-colors">━</button>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-500/80 text-xs transition-colors">✕</button>
        </div>
      </div>

      {/* ── Suggestion banner ──────────────────────────────────────── */}
      {!suggBannerDone && suggCfg && suggestedMode !== activeMode && (
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 text-[12px]"
          style={{ background: suggCfg.hex.accent + '14', borderBottom: `1px solid ${suggCfg.hex.accent}28` }}>
          <span className="text-slate-300">
            Suggested for this content:&nbsp;
            <strong className="font-semibold" style={{ color: suggCfg.hex.accent }}>
              {suggCfg.icon} {suggCfg.name} mode
            </strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { handleModeChange(suggestedMode); setSuggBannerDone(true); }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
              style={{ background: suggCfg.hex.accent, color: '#fff' }}>
              Switch
            </button>
            <button onClick={() => setSuggBannerDone(true)}
              className="text-slate-600 hover:text-slate-400 transition-colors">✕</button>
          </div>
        </div>
      )}

      {/* ── Mode tabs ──────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto"
        style={{ background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.05)', scrollbarWidth: 'none' }}
      >
        {ALL_MODES.map(m => {
          const mc     = modeConfigs[m];
          const active = m === activeMode;
          return (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all flex-shrink-0"
              style={active
                ? { background: mc.hex.accent, color: '#fff', boxShadow: `0 2px 8px ${mc.hex.accent}50` }
                : { background: 'rgba(255,255,255,0.05)', color: '#64748B' }
              }
            >
              <span>{mc.icon}</span>
              <span>{mc.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── Scrollable content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
        <ModeContent
          mode={activeMode}
          result={result}
          cfg={cfg}
          text={text}
          overwhelmedStep={overwhelmedStep}
          setOverwhelmedStep={setOverwhelmedStep}
          checkedSteps={checkedSteps}
          toggleStep={toggleStep}
        />
      </div>

      {/* ── Footer navigation ──────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3"
        style={{ background: '#0B1120', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <button
            onClick={onReturnToOverlay}
            className="flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-xl transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            ← Return to Overlay
          </button>
        </div>
        <button
          onClick={onEndSession}
          className="flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-xl transition-colors"
          style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.22)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
        >
          ■ End Session
        </button>
      </div>
    </div>
  );
}
