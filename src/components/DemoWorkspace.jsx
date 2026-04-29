import { useState, useCallback } from 'react';
import { TASK_STEPS } from '../data/demoContent';
import { modeConfigs } from '../utils/modeConfigs';
import { useSpeech } from '../hooks/useSpeech';
import ControlPanel       from './ControlPanel';
import TransitionOverlay  from './demo/TransitionOverlay';
import StatusCard         from './demo/StatusCard';
import SimplifyOutput     from './demo/SimplifyOutput';
import OverwhelmedView    from './demo/OverwhelmedView';
import FoggyView          from './demo/FoggyView';
import AnxiousView        from './demo/AnxiousView';
import StressedView       from './demo/StressedView';
import CalmView           from './demo/CalmView';
import OriginalNotice     from './demo/OriginalNotice';

const DEMO_SESSION_KEY = 'clearpath_demo_session';

const READ_ALOUD_TEXT = `You have a payment of $128.45 due by May 5, 2026. You can pay the full amount now, or set up a payment plan for $47 per month for 3 months. Your account number is 847291-B. Nothing is submitted until you choose to submit.`;

export default function DemoWorkspace({ onExit }) {
  const [mode,            setMode]            = useState('calm');
  const [step,            setStep]            = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasSelectedMode, setHasSelectedMode] = useState(false);
  const [showSimplify,    setShowSimplify]    = useState(false);
  const [savedBanner,     setSavedBanner]     = useState(false);

  const { speak, stop, isSpeaking, isSupported } = useSpeech();

  const cfg = modeConfigs[mode];

  /* ── Mode change with transition overlay ─────────────────── */
  const handleModeChange = useCallback((newMode) => {
    if (newMode === mode || isTransitioning) return;
    stop();
    setShowSimplify(false);
    setIsTransitioning(true);
    setTimeout(() => {
      setMode(newMode);
      setHasSelectedMode(true);
    }, 350);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 900);
  }, [mode, isTransitioning, stop]);

  /* ── Read aloud ──────────────────────────────────────────── */
  const handleReadAloud = () => {
    if (isSpeaking) { stop(); return; }
    if (isSupported) speak(READ_ALOUD_TEXT, 0.85);
  };

  /* ── Save demo progress ───────────────────────────────────── */
  const handleSave = () => {
    try {
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ mode, step, savedAt: Date.now() }));
    } catch {}
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2200);
  };

  /* ── Reset demo ───────────────────────────────────────────── */
  const handleReset = () => {
    stop();
    setMode('calm');
    setStep(0);
    setHasSelectedMode(false);
    setShowSimplify(false);
    try { localStorage.removeItem(DEMO_SESSION_KEY); } catch {}
  };

  /* ── Step navigation ─────────────────────────────────────── */
  const handleNextStep = () => setStep(s => Math.min(s + 1, TASK_STEPS.length));
  const handlePrevStep = () => setStep(s => Math.max(s - 1, 0));

  /* ── Render mode content ─────────────────────────────────── */
  const renderContent = () => {
    const props = { step, onStepChange: setStep };
    switch (mode) {
      case 'overwhelmed': return <OverwhelmedView {...props} />;
      case 'foggy':       return <FoggyView       {...props} />;
      case 'anxious':     return <AnxiousView      {...props} onModeChange={handleModeChange} />;
      case 'stressed':    return <StressedView     {...props} />;
      default:            return <CalmView         {...props} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ── Left/main panel (65%) ─────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
            >
              ← Back
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <p className="text-sm font-semibold text-slate-700">ClearPath</p>
            <span className="text-[10px] text-slate-300 font-mono">Demo</span>
          </div>

          {savedBanner && (
            <p className="text-xs text-green-600 font-semibold animate-pulse">✓ Progress saved</p>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:block">Powered by</span>
            <span className="text-xs font-black text-slate-700 tracking-tight">ODAI</span>
          </div>
        </div>

        {/* Before / After / Outcome strip */}
        <StatusCard
          mode={mode}
          step={step}
          totalSteps={TASK_STEPS.length}
          hasSelectedMode={hasSelectedMode}
        />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto relative transition-colors duration-500"
          style={{ backgroundColor: cfg.hex.bg }}>

          {/* Transition overlay */}
          <TransitionOverlay mode={mode} visible={isTransitioning} />

          {/* Main view */}
          <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {renderContent()}

            {/* Simplify output panel (below content) */}
            {showSimplify && (
              <div className="px-6 pb-6">
                <SimplifyOutput
                  onClose={() => setShowSimplify(false)}
                  accentHex={cfg.hex.accent}
                  accentLight={cfg.hex.accentLight}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right control panel (fixed width) ────────────────── */}
      <div className="w-64 flex-shrink-0 h-full">
        <ControlPanel
          mode={mode}
          onModeChange={handleModeChange}
          step={step}
          stepCount={TASK_STEPS.length}
          onNextStep={handleNextStep}
          onPrevStep={handlePrevStep}
          onSimplify={() => setShowSimplify(v => !v)}
          onReadAloud={handleReadAloud}
          onSave={handleSave}
          onReset={handleReset}
          isTransitioning={isTransitioning}
          isSpeaking={isSpeaking}
        />
      </div>
    </div>
  );
}
