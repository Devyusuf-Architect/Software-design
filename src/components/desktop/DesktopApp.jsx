import { useState, useCallback, useRef, useEffect } from 'react';
import { modeConfigs }         from '../../utils/modeConfigs';
import { analyzeAllModes, suggestMode } from '../../utils/analyzeText';
import { lookupWord }           from '../../data/wordDictionary';
import { useSpeech }            from '../../hooks/useSpeech';
import { isTauri }              from '../../utils/isTauri';
import DemoWorkspace            from '../DemoWorkspace';
import ClearPathLogo            from '../ClearPathLogo';
import AnalyzeDialog            from './AnalyzeDialog';
import DiagnoseView             from './DiagnoseView';

/* ── Tauri window helper ──────────────────────────────────────────────── */
async function tauriWindow() {
  if (!isTauri) return null;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    return getCurrentWindow();
  } catch { return null; }
}

async function resizeTo(w, h) {
  const win = await tauriWindow();
  if (!win) return;
  const { LogicalSize } = await import('@tauri-apps/api/window');
  await win.setSize(new LogicalSize(w, h));
}

const W_OVERLAY   = 400;
const H_OVERLAY   = 640;
const H_COLLAPSED = 56;
const W_WORKSPACE = 1280;
const H_WORKSPACE = 840;
const W_DIAGNOSE  = 560;
const H_DIAGNOSE  = 700;

/* ── Modes ───────────────────────────────────────────────────────────── */
const ALL_MODES = ['calm', 'overwhelmed', 'foggy', 'anxious', 'stressed', 'original'];

/* ── Action definitions ──────────────────────────────────────────────── */
const ACTIONS = [
  { id: 'simplify', icon: '✨', label: 'Simplify'   },
  { id: 'explain',  icon: '💡', label: 'Explain'    },
  { id: 'steps',    icon: '📋', label: 'Step Guide' },
  { id: 'define',   icon: '📖', label: 'Define'     },
];

const SAMPLE_TEXT =
  'Your outstanding balance of $128.45 is due by May 5, 2026. ' +
  'You may pay in full or arrange a payment plan at $47 per month for three months. ' +
  'Late payment may incur additional charges. Please review your options at your earliest convenience.';

/* ── Non-analyze text processing (manual input actions) ──────────────── */
function processText(text, action, options = {}) {
  const raw       = text.trim();
  if (!raw) return null;
  const sentences = (raw.match(/[^.!?\n]+[.!?\n]*/g) || [raw])
    .map(s => s.trim()).filter(s => s.length > 8);

  switch (action) {
    case 'simplify':
      return {
        type:    'simplify',
        heading: '✨ Plain English',
        summary: sentences.slice(0, 2).join(' '),
        bullets: sentences.slice(0, Math.min(4, sentences.length)),
        next:    'Read once, then decide if action is needed.',
      };
    case 'explain':
      return {
        type:    'explain',
        heading: '💡 What this means',
        summary: sentences[0] || raw.slice(0, 150),
        bullets: sentences.slice(1, 4).length ? sentences.slice(1, 4) : null,
      };
    case 'steps':
      return {
        type:    'steps',
        heading: '📋 Step by step',
        steps:   sentences.slice(0, 5).map((s, i) => ({ n: i + 1, text: s })),
      };
    case 'define': {
      const words = raw.split(/\s+/);
      let def = null, term = null;
      for (let len = Math.min(3, words.length); len >= 1; len--) {
        const w = words.slice(0, len).join(' ');
        def = lookupWord(w);
        if (def) { term = w; break; }
      }
      return {
        type:    'define',
        heading: term ? `📖 "${term}"` : '📖 Definition',
        summary: def || 'Paste a single word or phrase to look it up.',
      };
    }
    default: return null;
  }
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN DESKTOP APP
   ════════════════════════════════════════════════════════════════════════ */
export default function DesktopApp() {
  /* ── App state ────────────────────────────────────────────────── */
  const [appView,   setAppView]   = useState('idle');
  const [collapsed, setCollapsed] = useState(false);

  /* ── Overlay content ──────────────────────────────────────────── */
  const [overlayMode,       setOverlayMode]       = useState('calm');
  const [inputText,         setInputText]         = useState('');
  const [output,            setOutput]            = useState(null);
  const [processing,        setProcessing]        = useState(false);
  const [activeAction,      setActiveAction]      = useState(null);
  const [showModeMenu,      setShowModeMenu]      = useState(false);
  const [showAnalyzeDialog, setShowAnalyzeDialog] = useState(false);
  const [alwaysOnTop,       setAlwaysOnTop]       = useState(false);

  /* ── Diagnose state ───────────────────────────────────────────── */
  const [diagnoseText,     setDiagnoseText]     = useState('');
  const [diagnoseResults,  setDiagnoseResults]  = useState(null);
  const [diagnoseSuggested,setDiagnoseSuggested]= useState(null);

  const cfg        = modeConfigs[overlayMode] || modeConfigs.calm;
  const { speak, stop, isSpeaking, isSupported: speechSupported } = useSpeech();
  const modeMenuRef = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target))
        setShowModeMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Window controls ──────────────────────────────────────────── */
  const handleMinimize = async () => { (await tauriWindow())?.minimize(); };
  const handleClose    = async () => { (await tauriWindow())?.close(); };

  const handleAlwaysOnTop = async (val) => {
    setAlwaysOnTop(val);
    (await tauriWindow())?.setAlwaysOnTop(val);
  };

  const resetPosition = () => {
    tauriWindow().then(win => win?.center().catch(() => {})).catch(() => {});
  };

  /* ── Escape key: close analyze dialog ────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && showAnalyzeDialog) setShowAnalyzeDialog(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showAnalyzeDialog]);

  /* ── Session management ───────────────────────────────────────── */
  const startSession = () => {
    setAppView('session');
    // No Tauri window calls — session is a pure React view change.
    // setAlwaysOnTop is user-controlled via the footer toggle only.
  };

  const endSession = () => {
    stop();
    setAppView('idle');
    setCollapsed(false);
    setAlwaysOnTop(false);
    setOutput(null);
    setInputText('');
    setActiveAction(null);
    setShowAnalyzeDialog(false);
    setDiagnoseText('');
    setDiagnoseResults(null);
    setDiagnoseSuggested(null);
    tauriWindow().then(win => win?.setAlwaysOnTop(false).catch(() => {})).catch(() => {});
  };

  /* ── Collapse / expand ────────────────────────────────────────── */
  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    resizeTo(W_OVERLAY, next ? H_COLLAPSED : H_OVERLAY).catch(() => {});
  };

  /* ── Workspace ────────────────────────────────────────────────── */
  const openWorkspace = () => {
    setAppView('workspace');
    resizeTo(W_WORKSPACE, H_WORKSPACE)
      .then(() => tauriWindow().then(win => win?.center().catch(() => {})))
      .catch(() => {});
  };

  const closeWorkspace = () => {
    setAppView('session');
    resizeTo(W_OVERLAY, H_OVERLAY)
      .then(() => tauriWindow().then(win => win?.center().catch(() => {})))
      .catch(() => {});
  };

  /* ── Diagnose Mode ────────────────────────────────────────────── */
  const openDiagnose = (text, prebuiltResults, suggestedModeOverride) => {
    const results   = prebuiltResults || analyzeAllModes(text);
    const suggested = suggestedModeOverride || suggestMode(text);
    setDiagnoseText(text);
    setDiagnoseResults(results);
    setDiagnoseSuggested(suggested);
    setAppView('diagnose');
    resizeTo(W_DIAGNOSE, H_DIAGNOSE)
      .then(() => tauriWindow().then(win => win?.center().catch(() => {})))
      .catch(() => {});
  };

  const closeDiagnose = () => {
    setAppView('session');
    setDiagnoseText('');
    setDiagnoseResults(null);
    setDiagnoseSuggested(null);
    resizeTo(W_OVERLAY, H_OVERLAY)
      .then(() => tauriWindow().then(win => win?.center().catch(() => {})))
      .catch(() => {});
  };

  /* ── Manual text actions ──────────────────────────────────────── */
  const runAction = useCallback((action, textOverride) => {
    const text = textOverride ?? inputText;
    if (!text.trim()) return;
    setActiveAction(action);
    setProcessing(true);
    setOutput(null);
    stop();
    setTimeout(() => {
      setOutput(processText(text, action, { mode: overlayMode }));
      setProcessing(false);
    }, 500);
  }, [inputText, stop, overlayMode]);

  const handleReadAloud = () => {
    const text = output?.summary || inputText;
    if (!text.trim()) return;
    if (isSpeaking) { stop(); return; }
    if (speechSupported) speak(text, undefined, overlayMode);
  };

  const handleModeSelect = m => {
    setOverlayMode(m);
    setShowModeMenu(false);
    setOutput(null);
  };

  /* ── Analyze Screen ───────────────────────────────────────────── */
  const handleAnalyzeConfirm = (aiResult) => {
    setShowAnalyzeDialog(false);

    // aiResult is the structured AI response: { context, cleanText, mainIdea,
    // mattersMost, nextStep, keyPoints, intent }
    const text = aiResult?.cleanText || (typeof aiResult === 'string' ? aiResult : '');
    if (!text) return;

    // Build all-mode results from the AI's clean text
    const results = analyzeAllModes(text);

    // Enhance calm mode with AI's directly computed fields (higher quality)
    if (aiResult && typeof aiResult === 'object') {
      results.calm = {
        ...results.calm,
        mainIdea:    aiResult.mainIdea    || results.calm.mainIdea,
        mattersMost: aiResult.mattersMost || results.calm.mattersMost,
        nextStep:    aiResult.nextStep    || results.calm.nextStep,
        keyPoints:   aiResult.keyPoints?.length ? aiResult.keyPoints : results.calm.keyPoints,
      };
    }

    // Suggest mode based on AI's context field
    const contextModeMap = {
      payment:      'calm',
      error:        'foggy',
      form:         'stressed',
      instructions: 'stressed',
      urgent:       'anxious',
      general:      'calm',
      article:      'foggy',
    };
    const suggested = (aiResult?.context && contextModeMap[aiResult.context])
      || suggestMode(text);

    openDiagnose(text, results, suggested);
  };

  /* ── Style helpers ────────────────────────────────────────────── */
  const btnPrimary   = { background: cfg.hex.accent, color: '#fff' };
  const btnSecondary = { background: '#1E293B', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.08)' };

  /* ════════════════════════════════════════════════════════════════
     DIAGNOSE VIEW
     ════════════════════════════════════════════════════════════════ */
  if (appView === 'diagnose') {
    return (
      <div>
        <DiagnoseView
          text={diagnoseText}
          results={diagnoseResults}
          suggestedMode={diagnoseSuggested}
          currentMode={overlayMode}
          onModeChange={setOverlayMode}
          onReturnToOverlay={closeDiagnose}
          onEndSession={endSession}
          onMinimize={handleMinimize}
          onClose={handleClose}
        />
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     WORKSPACE VIEW
     ════════════════════════════════════════════════════════════════ */
  if (appView === 'workspace') {
    return (
      <div className="flex flex-col" style={{ height: '100vh', background: '#0F172A' }}>
        <div
          data-tauri-drag-region
          className="flex-shrink-0 flex items-center justify-between px-4 py-2.5"
          style={{ background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.06)', userSelect: 'none' }}
        >
          <button onClick={closeWorkspace}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors">
            ← Overlay
          </button>
          <div className="flex items-center gap-2 pointer-events-none">
            <div className="w-5 h-5 text-slate-400"><ClearPathLogo size={20} /></div>
            <span className="text-white font-semibold text-sm">ClearPath Workspace</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleMinimize}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 text-xs transition-colors">━</button>
            <button onClick={handleClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-500/80 text-xs transition-colors">✕</button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <DemoWorkspace initialView="workspace" onExit={closeWorkspace} />
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     COLLAPSED BAR
     ════════════════════════════════════════════════════════════════ */
  if (appView === 'session' && collapsed) {
    return (
      <div data-tauri-drag-region
        className="flex items-center justify-between px-4"
        style={{ height: '100vh', background: '#0F172A', userSelect: 'none' }}>
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="w-4 h-4 text-violet-400"><ClearPathLogo size={16} /></div>
          <span className="font-bold text-white text-sm">ClearPath</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-green-400">Session Active</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleCollapse}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/10 text-xs transition-colors" title="Expand">⊡</button>
          <button onClick={handleMinimize}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/10 text-xs transition-colors">━</button>
          <button onClick={handleClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-500/80 text-xs transition-colors">✕</button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     IDLE VIEW
     ════════════════════════════════════════════════════════════════ */
  if (appView === 'idle') {
    return (
      <div className="flex flex-col" style={{ height: '100vh', background: '#0F172A', color: '#F1F5F9' }}>
        <div data-tauri-drag-region
          className="flex-shrink-0 flex items-center justify-between px-4 py-3"
          style={{ background: '#0F172A', userSelect: 'none' }}>
          <div className="flex items-center gap-2 pointer-events-none">
            <div className="w-5 h-5 text-violet-400"><ClearPathLogo size={20} /></div>
            <span className="font-bold text-sm text-white">ClearPath</span>
            <span className="text-slate-600 text-[10px] font-mono">by ODAI</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleMinimize}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/10 text-xs transition-colors">━</button>
            <button onClick={handleClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-500/80 text-xs transition-colors">✕</button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
          <div className="w-16 h-16 text-violet-400"><ClearPathLogo size={64} /></div>
          <div>
            <h1 className="text-xl font-bold text-white mb-2">ClearPath Overlay</h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Your on-demand desktop assistant. Start a session to get help with anything on your screen.
            </p>
          </div>

          <button onClick={startSession}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            style={{
              background:  'linear-gradient(135deg, #166534, #15803d)',
              color:       '#fff',
              boxShadow:   '0 8px 32px rgba(21,128,61,0.4)',
            }}>
            <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            Start Overlay Session
          </button>

          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-slate-600 text-xs">or</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <button onClick={openWorkspace}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors px-5 py-2.5 rounded-xl hover:bg-white/5 w-full justify-center">
            <span>📋</span>
            <span>Open Workspace Mode</span>
            <span className="opacity-40">→</span>
          </button>
        </div>

        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <button onClick={() => handleAlwaysOnTop(!alwaysOnTop)}
            className="flex items-center gap-1.5 text-[11px] transition-colors"
            style={{ color: alwaysOnTop ? '#4ADE80' : '#475569' }}>
            <span>📌</span>
            <span>Always on top</span>
            <div className="w-7 h-4 rounded-full transition-colors flex items-center px-0.5 ml-1"
              style={{ background: alwaysOnTop ? '#4ADE80' : '#1E293B' }}>
              <div className="w-3 h-3 rounded-full bg-white transition-transform"
                style={{ transform: alwaysOnTop ? 'translateX(12px)' : 'translateX(0)' }} />
            </div>
          </button>
          <p className="text-[10px] text-slate-700">User-activated only</p>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     ACTIVE SESSION VIEW
     ════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col relative"
      style={{ height: '100vh', background: '#0F172A', color: '#F1F5F9' }}>

      {showAnalyzeDialog && (
        <AnalyzeDialog
          cfg={cfg}
          sampleText={SAMPLE_TEXT}
          onConfirm={handleAnalyzeConfirm}
          onCancel={() => setShowAnalyzeDialog(false)}
        />
      )}

      {/* ── Title bar ─────────────────────────────────────────── */}
      <div data-tauri-drag-region
        className="flex-shrink-0 flex items-center justify-between px-4 py-2.5"
        style={{ background: '#0F172A', userSelect: 'none' }}>
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="w-5 h-5 text-violet-400"><ClearPathLogo size={20} /></div>
          <span className="font-bold text-sm text-white">ClearPath</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-green-400">Session Active</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleCollapse}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/10 text-xs transition-colors" title="Minimise panel">⊟</button>
          <button onClick={handleMinimize}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/10 text-xs transition-colors">━</button>
          <button onClick={handleClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-500/80 text-xs transition-colors">✕</button>
        </div>
      </div>

      {/* ── Mode + Workspace bar ──────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2"
        style={{ background: '#1E293B', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="relative" ref={modeMenuRef}>
          <button onClick={() => setShowModeMenu(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: cfg.hex.accent + '25', color: '#F1F5F9', border: `1px solid ${cfg.hex.accent}40` }}>
            <span>{cfg.icon}</span>
            <span>{cfg.name}</span>
            <span className="text-slate-500 text-xs ml-0.5">{showModeMenu ? '▴' : '▾'}</span>
          </button>

          {showModeMenu && (
            <div className="absolute top-full mt-1.5 left-0 w-56 rounded-2xl overflow-hidden z-50"
              style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              {ALL_MODES.map(m => {
                const mc     = modeConfigs[m];
                const active = m === overlayMode;
                return (
                  <button key={m} onClick={() => handleModeSelect(m)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-sm transition-colors"
                    style={active ? { background: mc.hex.accent + '20', color: '#fff' } : { color: '#94A3B8' }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                    <span className="text-base leading-none">{mc.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{mc.name}</p>
                      <p className="text-xs opacity-50 truncate">{mc.tagline}</p>
                    </div>
                    {active && <span className="text-xs" style={{ color: mc.hex.accent }}>✓</span>}
                  </button>
                );
              })}
              <div className="px-4 py-2 border-t border-white/5">
                <p className="text-[10px] text-slate-600">You select your mode manually.</p>
              </div>
            </div>
          )}
        </div>

        <button onClick={openWorkspace}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-200 text-xs font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">
          <span>📋</span>
          <span>Workspace</span>
          <span className="opacity-40">→</span>
        </button>
      </div>

      {/* ── Scrollable main area ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>

        {/* Analyze Screen — primary CTA */}
        <button onClick={() => setShowAnalyzeDialog(true)}
          className="w-full flex flex-col items-center justify-center gap-1.5 py-5 rounded-2xl font-bold transition-all hover:-translate-y-0.5"
          style={{
            background:  `linear-gradient(135deg, ${cfg.hex.accent}cc, ${cfg.hex.accent})`,
            color:       '#fff',
            boxShadow:   `0 4px 20px ${cfg.hex.accent}40`,
          }}>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <span className="text-base">Analyze Screen</span>
          </div>
          <span className="text-[11px] opacity-75 font-normal">Capture + enter Diagnose Mode</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[11px] text-slate-600">or paste text below</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Text input */}
        <div>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Paste text here…"
            className="w-full px-3 py-2.5 rounded-xl text-sm leading-relaxed placeholder-slate-600 resize-none focus:outline-none transition-colors"
            style={{
              background: '#1E293B', color: '#E2E8F0',
              border:     '1px solid rgba(255,255,255,0.08)',
              minHeight:  80, maxHeight: 130,
            }}
          />
          <div className="flex items-center justify-between mt-1.5">
            {inputText ? (
              <button onClick={() => { setInputText(''); setOutput(null); setActiveAction(null); stop(); }}
                className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors">Clear</button>
            ) : (
              <button onClick={() => setInputText(SAMPLE_TEXT)}
                className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1">✦ Use sample text</button>
            )}
            {inputText && (
              <span className="text-[10px] text-slate-700">{inputText.split(/\s+/).filter(Boolean).length} words</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {ACTIONS.map(({ id, icon, label }) => {
              const isActive = activeAction === id && output?.type === id;
              return (
                <button key={id} onClick={() => runAction(id)}
                  disabled={!inputText.trim() || processing}
                  style={isActive ? btnPrimary : btnSecondary}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  onMouseEnter={e => { if (!isActive && inputText.trim() && !processing) e.currentTarget.style.background = '#2D3F52'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '#1E293B'; }}>
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          <button onClick={handleReadAloud}
            disabled={!inputText.trim() && !output}
            style={isSpeaking ? btnPrimary : btnSecondary}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30">
            <span>{isSpeaking ? '⏹' : '🔊'}</span>
            <span>{isSpeaking ? 'Stop reading' : 'Read Aloud'}</span>
          </button>
        </div>

        {/* Processing */}
        {processing && (
          <div className="flex items-center justify-center gap-1.5 py-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: cfg.hex.accent, animationDelay: `${i * 0.15}s` }} />
            ))}
            <span className="text-xs text-slate-500 ml-1">Processing…</span>
          </div>
        )}

        {/* Output panel */}
        {output && !processing && (
          <div className="rounded-2xl p-4 space-y-3"
            style={{ background: cfg.hex.accent + '18', border: `1px solid ${cfg.hex.accent}30` }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: cfg.hex.accent }}>
              {output.heading}
            </p>
            {output.summary && <p className="text-sm leading-relaxed text-slate-200">{output.summary}</p>}
            {output.bullets?.length > 0 && (
              <ul className="space-y-1.5">
                {output.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-300">
                    <span className="opacity-30 flex-shrink-0 mt-0.5">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {output.steps?.length > 0 && (
              <ol className="space-y-2">
                {output.steps.map(({ n, text }) => (
                  <li key={n} className="flex gap-2.5 text-sm text-slate-300">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                      style={{ background: cfg.hex.accent, color: '#fff' }}>{n}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            )}
            {output.next && (
              <div className="pt-2 border-t" style={{ borderColor: cfg.hex.accent + '25' }}>
                <p className="text-xs font-semibold" style={{ color: cfg.hex.accent }}>Next: {output.next}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer bar ────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5"
        style={{ background: '#0B1120', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <button onClick={() => handleAlwaysOnTop(!alwaysOnTop)}
            className="flex items-center gap-1.5 text-[11px] transition-colors"
            style={{ color: alwaysOnTop ? '#4ADE80' : '#475569' }}>
            <span>📌</span>
            <div className="w-7 h-4 rounded-full transition-colors flex items-center px-0.5"
              style={{ background: alwaysOnTop ? '#4ADE80' : '#1E293B' }}>
              <div className="w-3 h-3 rounded-full bg-white transition-transform"
                style={{ transform: alwaysOnTop ? 'translateX(12px)' : 'translateX(0)' }} />
            </div>
          </button>
          <button onClick={resetPosition}
            className="text-[10px] text-slate-700 hover:text-slate-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
            title="Move window back to centre of screen">
            ↺ Reset position
          </button>
        </div>
        <button onClick={endSession}
          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.22)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}>
          ■ End Session
        </button>
      </div>
    </div>
  );
}
