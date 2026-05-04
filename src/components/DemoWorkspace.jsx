import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { SCENARIO_LIST, SCENARIOS } from '../data/scenarios';
import { modeConfigs } from '../utils/modeConfigs';
import { useSpeech } from '../hooks/useSpeech';
import { useIsMobile } from '../hooks/useIsMobile';
import ControlPanel        from './ControlPanel';
import TransitionOverlay   from './demo/TransitionOverlay';
import StatusCard          from './demo/StatusCard';
import SimplifyOutput      from './demo/SimplifyOutput';
import ScenarioSelector    from './demo/ScenarioSelector';
import CognitiveLoadMeter  from './demo/CognitiveLoadMeter';
import SessionSummary      from './demo/SessionSummary';
import OriginalContent     from './demo/OriginalContent';
import OverwhelmedView     from './demo/OverwhelmedView';
import FoggyView           from './demo/FoggyView';
import AnxiousView         from './demo/AnxiousView';
import StressedView        from './demo/StressedView';
import CalmView            from './demo/CalmView';
import WordDefinitionPopup from './demo/WordDefinitionPopup';
import PreferencePopup, { loadPreferences } from './demo/PreferencePopup';

const DEMO_SESSION_KEY = 'clearpath_demo_session';
const PANEL_MIN        = 180;
const PANEL_MAX        = 480;
const PANEL_DEFAULT    = 240;

export default function DemoWorkspace({ onExit }) {
  const isMobile = useIsMobile();

  const [scenarioId,       setScenarioId]       = useState('payment');
  const [mode,             setMode]             = useState('calm');
  const [step,             setStep]             = useState(0);
  const [isTransitioning,  setIsTransitioning]  = useState(false);
  const [hasSelectedMode,  setHasSelectedMode]  = useState(false);
  const [showSimplify,     setShowSimplify]     = useState(false);
  const [showCompare,      setShowCompare]      = useState(false);
  const [showSummary,      setShowSummary]      = useState(false);
  const [showFocusTimer,   setShowFocusTimer]   = useState(false);
  const [savedBanner,      setSavedBanner]      = useState(false);
  const [showPrefs,        setShowPrefs]        = useState(false);
  const [showMobilePanel,  setShowMobilePanel]  = useState(false);
  const [panelWidth,       setPanelWidth]       = useState(PANEL_DEFAULT);
  const [panelStyle,       setPanelStyle]       = useState('simple');
  const [startTime]                             = useState(Date.now());

  const contentRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartW = useRef(PANEL_DEFAULT);

  const scenario = SCENARIOS[scenarioId] || SCENARIOS.payment;
  const cfg      = modeConfigs[mode] || modeConfigs.calm;

  /* ── First-visit preference popup ────────────────── */
  useEffect(() => {
    const prefs = loadPreferences();
    if (!prefs) {
      setShowPrefs(true);
    } else {
      const target = prefs.pace === 'all' ? 'calm' : (prefs.feeling || 'calm');
      if (target !== mode) { setMode(target); setHasSelectedMode(true); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Close mobile panel when switching to desktop ── */
  useEffect(() => {
    if (!isMobile) setShowMobilePanel(false);
  }, [isMobile]);

  /* ── Desktop drag-to-resize ──────────────────────── */
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    isDragging.current  = true;
    dragStartX.current  = e.clientX;
    dragStartW.current  = panelWidth;
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [panelWidth]);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      const delta = dragStartX.current - e.clientX;
      setPanelWidth(Math.min(PANEL_MAX, Math.max(PANEL_MIN, dragStartW.current + delta)));
    };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current             = false;
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    };
  }, []);

  const cognitiveLoad = useMemo(() => {
    const level = scenario.cognitiveLoad || 'medium';
    return { level, label: level === 'high' ? 'High Load' : level === 'medium' ? 'Medium Load' : 'Low Load' };
  }, [scenario]);

  const { speak, stop, isSpeaking, isSupported, voices, activeVoice, setActiveVoice } = useSpeech();

  /* ── Handlers ─────────────────────────────────────── */
  const handleScenarioChange = (id) => {
    if (id === scenarioId) return;
    stop();
    setScenarioId(id);
    setStep(0);
    setHasSelectedMode(false);
    setShowSimplify(false);
    setShowCompare(false);
    setShowSummary(false);
  };

  const handleModeChange = useCallback((newMode) => {
    if (newMode === mode || isTransitioning) return;
    stop();
    setShowSimplify(false);
    setShowCompare(false);
    setIsTransitioning(true);
    setTimeout(() => { setMode(newMode); setHasSelectedMode(true); }, 350);
    setTimeout(() => setIsTransitioning(false), 900);
    if (isMobile) setShowMobilePanel(false);
  }, [mode, isTransitioning, stop, isMobile]);

  const handlePrefsComplete = (prefs) => {
    setShowPrefs(false);
    const target = prefs.pace === 'all' ? 'calm' : (prefs.feeling || 'calm');
    setMode(target);
    setHasSelectedMode(true);
  };

  const handleReadAloud = () => {
    if (isSpeaking) { stop(); return; }
    const text = scenario.simplifyOutput?.simple || '';
    if (isSupported && text) speak(text, undefined, mode);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ scenarioId, mode, step, savedAt: Date.now() }));
    } catch {}
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2200);
  };

  const handleReset = () => {
    stop();
    setScenarioId('payment');
    setMode('calm');
    setStep(0);
    setHasSelectedMode(false);
    setShowSimplify(false);
    setShowCompare(false);
    setShowSummary(false);
    try { localStorage.removeItem(DEMO_SESSION_KEY); } catch {}
  };

  const stepCount      = scenario.taskSteps?.length || 5;
  const handleNextStep = () => setStep(s => Math.min(s + 1, stepCount));
  const handlePrevStep = () => setStep(s => Math.max(s - 1, 0));
  const handleComplete = () => setShowSummary(true);

  const renderContent = () => {
    const props = { step, onStepChange: setStep, taskSteps: scenario.taskSteps };
    switch (mode) {
      case 'original':    return <OriginalContent scenario={scenario} step={step} onStepChange={setStep} />;
      case 'overwhelmed': return <OverwhelmedView {...props} />;
      case 'foggy':       return <FoggyView {...props} sections={scenario.foggyViewSections} />;
      case 'anxious':     return <AnxiousView {...props} calmSections={scenario.anxiousViewSections} onModeChange={handleModeChange} scenario={scenario} />;
      case 'stressed':    return <StressedView {...props} encouragements={scenario.stressedEncouragements} />;
      default:            return <CalmView {...props} scenario={scenario} />;
    }
  };

  const controlPanelProps = {
    mode, onModeChange: handleModeChange,
    scenario, step, stepCount,
    onNextStep: handleNextStep,
    onPrevStep: handlePrevStep,
    onSimplify: () => { setShowSimplify(v => !v); setShowCompare(false); if (isMobile) setShowMobilePanel(false); },
    onReadAloud: handleReadAloud,
    onSave: handleSave,
    onReset: handleReset,
    onCompare: () => { setShowCompare(v => !v); setShowSimplify(false); if (isMobile) setShowMobilePanel(false); },
    isTransitioning, isSpeaking, showCompare,
    voices, activeVoice, onVoiceChange: setActiveVoice,
    panelStyle, onPanelStyleChange: setPanelStyle,
  };

  const oneLiner = cfg.oneLiner;

  return (
    <div className="flex flex-col bg-slate-50" style={{ height: '100dvh', overflow: 'hidden' }}>

      {showPrefs && <PreferencePopup onComplete={handlePrefsComplete} />}
      <WordDefinitionPopup containerRef={contentRef} />

      {/* ── Top bar ────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-100" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <button onClick={onExit} className="text-xs text-slate-400 hover:text-slate-700 transition-colors btn-micro p-1">
              ← Back
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <button onClick={onExit} className="flex items-center gap-1.5 hover:opacity-75 transition-opacity btn-micro">
              <div className="w-6 h-6 bg-slate-700 rounded-lg flex items-center justify-center text-sm">🌿</div>
              <p className="text-sm font-semibold text-slate-700">ClearPath</p>
            </button>
            {!isMobile && <span className="text-[10px] text-slate-300 font-mono">Demo</span>}
          </div>

          {savedBanner && <p className="text-xs text-green-600 font-semibold fade-in">✓ Saved</p>}

          <div className="flex items-center gap-2">
            {/* Mobile: mode indicator + panel toggle */}
            {isMobile ? (
              <button
                onClick={() => setShowMobilePanel(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold btn-micro transition-all"
                style={{ background: cfg.hex.accent, color: '#fff', boxShadow: `0 2px 6px ${cfg.hex.accent}40` }}
              >
                <span>{cfg.icon}</span>
                <span className="text-xs">{cfg.name}</span>
                <span className="text-[10px] opacity-70">⚙</span>
              </button>
            ) : (
              <>
                {!showFocusTimer && (
                  <button onClick={() => setShowFocusTimer(true)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 btn-micro">
                    ⏱ Timer
                  </button>
                )}
                {step >= stepCount && (
                  <button onClick={handleComplete}
                    className="text-xs px-2.5 py-1 rounded-lg bg-green-500 text-white font-semibold btn-micro shadow-sm">
                    ✓ Complete
                  </button>
                )}
                <span className="text-xs font-black text-slate-700 tracking-tight">ODAI</span>
              </>
            )}
          </div>
        </div>

        {/* Scenario selector */}
        <div className="px-4 pb-2">
          <ScenarioSelector scenarios={SCENARIO_LIST} currentId={scenarioId} onSelect={handleScenarioChange} />
        </div>
      </div>

      {/* ── Status + reading level ─────────────────────── */}
      <div className="flex-shrink-0">
        <StatusCard mode={mode} step={step} totalSteps={stepCount} hasSelectedMode={hasSelectedMode} />
        <div className="flex items-center justify-between px-4 py-1.5 bg-white border-b border-slate-100">
          <CognitiveLoadMeter load={cognitiveLoad} reduced={hasSelectedMode && mode !== 'original'} />
          {showFocusTimer && !isMobile && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>⏱</span>
              <FocusTimerInline startTime={startTime} />
              <button onClick={() => setShowFocusTimer(false)} className="text-slate-300 hover:text-slate-500 ml-1">✕</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main area ──────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
          {showCompare && (
            <div className="flex-shrink-0 bg-slate-800 text-white text-xs px-4 py-2 flex items-center justify-between">
              <span className="font-semibold">Comparing: Original vs {cfg.name} Mode</span>
              <button onClick={() => setShowCompare(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
          )}

          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto relative transition-colors duration-500"
            style={{ backgroundColor: cfg.hex.bg, paddingBottom: isMobile ? 'calc(64px + env(safe-area-inset-bottom, 0px))' : 0 }}
          >
            <TransitionOverlay mode={mode} visible={isTransitioning} modeMessages={scenario.modeMessages} />

            {showCompare ? (
              <div className="flex h-full min-h-[500px] gap-px bg-slate-200">
                <div className="flex-1 bg-white overflow-y-auto">
                  <div className="p-3 bg-slate-50 border-b border-slate-200">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">📄 Original</p>
                  </div>
                  <div style={{ zoom: 0.72 }}>
                    <OriginalContent scenario={scenario} step={step} onStepChange={setStep} />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto" style={{ backgroundColor: cfg.hex.bg }}>
                  <div className="p-3 border-b" style={{ backgroundColor: cfg.hex.accentLight }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cfg.hex.accent }}>
                      {cfg.icon} {cfg.name} Mode
                    </p>
                  </div>
                  <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    {renderContent()}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

                {/* Mode one-liner */}
                {hasSelectedMode && oneLiner && (
                  <div className="mx-4 mt-4 px-4 py-2.5 rounded-2xl" style={{ background: cfg.hex.accentLight }}>
                    <p className="text-xs font-medium" style={{ color: cfg.hex.text }}>{cfg.icon} {oneLiner}</p>
                  </div>
                )}

                {/* Prominent compare button */}
                {hasSelectedMode && mode !== 'original' && (
                  <div className="mx-4 mt-3">
                    <button
                      onClick={() => { setShowCompare(true); setShowSimplify(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed text-sm transition-all btn-micro"
                      style={{ borderColor: cfg.hex.accent + '50', color: cfg.hex.accent, background: cfg.hex.accentLight }}
                    >
                      <span className="text-xl">⇔</span>
                      <div className="text-left flex-1">
                        <span className="font-semibold text-sm">See before &amp; after ClearPath</span>
                        <span className="block text-[11px] opacity-70 mt-0.5">Compare with the original view</span>
                      </div>
                      <span className="text-xs opacity-50 flex-shrink-0">→</span>
                    </button>
                  </div>
                )}

                {renderContent()}

                {showSimplify && (
                  <div className="px-4 pb-6 slide-in-up">
                    <SimplifyOutput
                      simplifyOutput={scenario.simplifyOutput}
                      onClose={() => setShowSimplify(false)}
                      accentHex={cfg.hex.accent}
                      accentLight={cfg.hex.accentLight}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Desktop side panel + drag handle ─────────── */}
        {!isMobile && (
          <>
            <div
              onMouseDown={handleDragStart}
              className="w-1 flex-shrink-0 cursor-col-resize transition-colors duration-150"
              style={{ background: cfg.hex.accent + '25' }}
              title="Drag to resize"
            />
            <div className="flex-shrink-0 h-full overflow-hidden" style={{ width: panelWidth }}>
              <ControlPanel {...controlPanelProps} />
            </div>
          </>
        )}
      </div>

      {/* ── Mobile: floating bottom tab bar ──────────── */}
      {isMobile && (
        <div
          className="flex-shrink-0 bg-white border-t border-slate-100 flex items-center justify-around px-4 py-2"
          style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
        >
          <button onClick={handlePrevStep} disabled={step === 0}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl disabled:opacity-30 transition-all btn-micro"
            style={{ color: cfg.hex.accent }}>
            <span className="text-lg">←</span>
            <span className="text-[9px] font-semibold">Back</span>
          </button>

          <button
            onClick={() => setShowMobilePanel(v => !v)}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-white btn-micro"
            style={{ background: cfg.hex.accent, boxShadow: `0 2px 8px ${cfg.hex.accent}50` }}>
            <span className="text-xl">{cfg.icon}</span>
            <span className="text-[9px] font-bold">Mode</span>
          </button>

          <button onClick={handleNextStep} disabled={step >= stepCount}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl disabled:opacity-30 transition-all btn-micro"
            style={{ color: cfg.hex.accent }}>
            <span className="text-lg">→</span>
            <span className="text-[9px] font-semibold">Next</span>
          </button>
        </div>
      )}

      {/* ── Mobile panel bottom sheet ─────────────────── */}
      {isMobile && showMobilePanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-40"
            onClick={() => setShowMobilePanel(false)}
            style={{ backdropFilter: 'blur(2px)' }}
          />
          {/* Sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
            style={{
              maxHeight: '78vh',
              animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Drag bar */}
            <div
              className="flex items-center justify-center py-3 cursor-pointer"
              style={{ background: cfg.hex.panel }}
              onClick={() => setShowMobilePanel(false)}
            >
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>
            <div style={{ maxHeight: 'calc(78vh - 40px)', overflowY: 'auto' }}>
              <ControlPanel {...controlPanelProps} />
            </div>
          </div>
        </>
      )}

      {/* Session summary */}
      <SessionSummary
        visible={showSummary}
        scenario={scenario}
        mode={mode}
        step={step}
        stepCount={stepCount}
        startTime={startTime}
        onClose={() => setShowSummary(false)}
      />
    </div>
  );
}

function FocusTimerInline({ startTime }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    setElapsed(Math.floor((Date.now() - startTime) / 1000));
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startTime]);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  return <span className="font-mono text-slate-500">{mm}:{ss}</span>;
}
