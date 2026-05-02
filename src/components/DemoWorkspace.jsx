import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { SCENARIO_LIST, SCENARIOS } from '../data/scenarios';
import { modeConfigs } from '../utils/modeConfigs';
import { useSpeech } from '../hooks/useSpeech';
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

const DEMO_SESSION_KEY  = 'clearpath_demo_session';
const PANEL_MIN         = 180;
const PANEL_MAX         = 480;
const PANEL_DEFAULT     = 240;

export default function DemoWorkspace({ onExit }) {
  const [scenarioId,      setScenarioId]      = useState('payment');
  const [mode,            setMode]            = useState('calm');
  const [step,            setStep]            = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasSelectedMode, setHasSelectedMode] = useState(false);
  const [showSimplify,    setShowSimplify]    = useState(false);
  const [showCompare,     setShowCompare]     = useState(false);
  const [showSummary,     setShowSummary]     = useState(false);
  const [showFocusTimer,  setShowFocusTimer]  = useState(false);
  const [savedBanner,     setSavedBanner]     = useState(false);
  const [showPrefs,       setShowPrefs]       = useState(false);
  const [panelWidth,      setPanelWidth]      = useState(PANEL_DEFAULT);
  const [panelStyle,      setPanelStyle]      = useState('simple'); // 'simple' | 'full'
  const [startTime]                           = useState(Date.now());

  const contentRef  = useRef(null);
  const isDragging  = useRef(false);
  const dragStartX  = useRef(0);
  const dragStartW  = useRef(PANEL_DEFAULT);

  const scenario = SCENARIOS[scenarioId] || SCENARIOS.payment;
  const cfg      = modeConfigs[mode];

  /* ── First-visit preference popup ────────────────── */
  useEffect(() => {
    const prefs = loadPreferences();
    if (!prefs) {
      setShowPrefs(true);
    } else if (prefs.feeling && prefs.feeling !== mode) {
      setMode(prefs.feeling);
      setHasSelectedMode(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Drag-to-resize panel ────────────────────────── */
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    isDragging.current  = true;
    dragStartX.current  = e.clientX;
    dragStartW.current  = panelWidth;
    document.body.style.cursor    = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [panelWidth]);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      // Panel is on the right, so dragging left = bigger panel
      const delta = dragStartX.current - e.clientX;
      const next  = Math.min(PANEL_MAX, Math.max(PANEL_MIN, dragStartW.current + delta));
      setPanelWidth(next);
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
    return {
      level,
      label: level === 'high' ? 'High Load' : level === 'medium' ? 'Medium Load' : 'Low Load',
    };
  }, [scenario]);

  const { speak, stop, isSpeaking, isSupported, voices, activeVoice, setActiveVoice } = useSpeech();

  /* ── Scenario change ──────────────────────────────── */
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

  /* ── Mode change with transition overlay ─────────── */
  const handleModeChange = useCallback((newMode) => {
    if (newMode === mode || isTransitioning) return;
    stop();
    setShowSimplify(false);
    setIsTransitioning(true);
    setTimeout(() => { setMode(newMode); setHasSelectedMode(true); }, 350);
    setTimeout(() => setIsTransitioning(false), 900);
  }, [mode, isTransitioning, stop]);

  /* ── Preference popup complete ────────────────────── */
  const handlePrefsComplete = (prefs) => {
    setShowPrefs(false);
    if (prefs.feeling) { setMode(prefs.feeling); setHasSelectedMode(true); }
  };

  /* ── Read aloud ───────────────────────────────────── */
  const handleReadAloud = () => {
    if (isSpeaking) { stop(); return; }
    const text = scenario.simplifyOutput?.simple || '';
    if (isSupported && text) speak(text, undefined, mode);
  };

  /* ── Save / Reset ─────────────────────────────────── */
  const handleSave = () => {
    try {
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
        scenarioId, mode, step, savedAt: Date.now(),
      }));
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

  /* ── Step navigation ──────────────────────────────── */
  const stepCount      = scenario.taskSteps?.length || 5;
  const handleNextStep = () => setStep(s => Math.min(s + 1, stepCount));
  const handlePrevStep = () => setStep(s => Math.max(s - 1, 0));

  /* ── Complete task ────────────────────────────────── */
  const handleComplete = () => setShowSummary(true);

  /* ── Current mode view ────────────────────────────── */
  const renderContent = () => {
    const props = { step, onStepChange: setStep, taskSteps: scenario.taskSteps };
    switch (mode) {
      case 'overwhelmed': return <OverwhelmedView {...props} />;
      case 'foggy':       return <FoggyView {...props} sections={scenario.foggyViewSections} />;
      case 'anxious':     return <AnxiousView {...props} calmSections={scenario.anxiousViewSections} onModeChange={handleModeChange} />;
      case 'stressed':    return <StressedView {...props} encouragements={scenario.stressedEncouragements} />;
      default:            return <CalmView {...props} scenario={scenario} />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">

      {/* Preference popup */}
      {showPrefs && <PreferencePopup onComplete={handlePrefsComplete} />}

      {/* Word definition popup */}
      <WordDefinitionPopup containerRef={contentRef} />

      {/* ── Top bar ────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between px-5 py-2.5">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="text-xs text-slate-400 hover:text-slate-700 transition-colors btn-micro">
              ← Back
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <button onClick={onExit} className="flex items-center gap-2 hover:opacity-75 transition-opacity btn-micro">
              <div className="w-6 h-6 bg-violet-500 rounded-lg flex items-center justify-center text-sm">🌿</div>
              <p className="text-sm font-semibold text-slate-700">ClearPath</p>
            </button>
            <span className="text-[10px] text-slate-300 font-mono">Demo</span>
          </div>

          {savedBanner && <p className="text-xs text-green-600 font-semibold fade-in">✓ Progress saved</p>}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFocusTimer(v => !v)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors btn-micro ${
                showFocusTimer ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              ⏱ {showFocusTimer ? 'Hide' : 'Timer'}
            </button>
            {step >= stepCount && (
              <button onClick={handleComplete}
                className="text-xs px-2.5 py-1 rounded-lg bg-green-500 text-white font-semibold btn-micro shadow-sm">
                ✓ Complete
              </button>
            )}
            <span className="text-xs font-black text-slate-700 tracking-tight">ODAI</span>
          </div>
        </div>

        <div className="px-5 pb-2">
          <ScenarioSelector scenarios={SCENARIO_LIST} currentId={scenarioId} onSelect={handleScenarioChange} />
        </div>
      </div>

      {/* ── Status bar ─────────────────────────────────── */}
      <div className="flex-shrink-0">
        <StatusCard mode={mode} step={step} totalSteps={stepCount} hasSelectedMode={hasSelectedMode} />
        <div className="flex items-center justify-between px-5 py-1.5 bg-white border-b border-slate-100">
          <CognitiveLoadMeter load={cognitiveLoad} reduced={hasSelectedMode} />
          {showFocusTimer && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>⏱</span>
              <FocusTimerInline startTime={startTime} />
              <span className="text-slate-300">· no rush</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Main area ──────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Content area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
          {showCompare && (
            <div className="flex-shrink-0 bg-slate-800 text-white text-xs px-4 py-2 flex items-center justify-between">
              <span className="font-semibold">Compare — Original vs {cfg.name} Mode</span>
              <button onClick={() => setShowCompare(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
          )}

          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto relative transition-colors duration-500"
            style={{ backgroundColor: cfg.hex.bg }}
          >
            <TransitionOverlay mode={mode} visible={isTransitioning} modeMessages={scenario.modeMessages} />

            {showCompare ? (
              <div className="flex h-full min-h-[500px] gap-px bg-slate-200">
                <div className="flex-1 bg-white overflow-y-auto">
                  <div className="p-3 bg-slate-50 border-b border-slate-200">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Original — before ClearPath</p>
                  </div>
                  <div style={{ zoom: 0.72 }}>
                    <OriginalContent scenario={scenario} step={step} onStepChange={setStep} />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto" style={{ backgroundColor: cfg.hex.bg }}>
                  <div className="p-3 border-b" style={{ backgroundColor: cfg.hex.accentLight }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cfg.hex.accent }}>
                      {cfg.icon} {cfg.name} Mode — after ClearPath
                    </p>
                  </div>
                  <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    {renderContent()}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {renderContent()}
                {showSimplify && (
                  <div className="px-6 pb-6 slide-in-up">
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

        {/* Drag handle */}
        <div
          onMouseDown={handleDragStart}
          className="w-1 flex-shrink-0 bg-slate-100 hover:bg-violet-300 cursor-col-resize transition-colors duration-150 active:bg-violet-400"
          title="Drag to resize panel"
        />

        {/* Right panel — width controlled by drag */}
        <div className="flex-shrink-0 h-full overflow-hidden" style={{ width: panelWidth }}>
          <ControlPanel
            mode={mode}
            onModeChange={handleModeChange}
            scenario={scenario}
            step={step}
            stepCount={stepCount}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
            onSimplify={() => { setShowSimplify(v => !v); setShowCompare(false); }}
            onReadAloud={handleReadAloud}
            onSave={handleSave}
            onReset={handleReset}
            onCompare={() => { setShowCompare(v => !v); setShowSimplify(false); }}
            isTransitioning={isTransitioning}
            isSpeaking={isSpeaking}
            showCompare={showCompare}
            voices={voices}
            activeVoice={activeVoice}
            onVoiceChange={setActiveVoice}
            panelStyle={panelStyle}
            onPanelStyleChange={setPanelStyle}
          />
        </div>
      </div>

      {/* Session summary modal */}
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

/* Inline focus timer */
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
