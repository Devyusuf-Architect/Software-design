import { useState, useCallback, useRef, useEffect } from 'react';
import { modeConfigs }   from '../../utils/modeConfigs';
import { lookupWord }    from '../../data/wordDictionary';
import { useSpeech }     from '../../hooks/useSpeech';
import { isTauri }       from '../../utils/isTauri';
import DemoWorkspace     from '../DemoWorkspace';
import ClearPathLogo     from '../ClearPathLogo';

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

/* ── Modes (all six) ─────────────────────────────────────────────────── */
const ALL_MODES = ['calm', 'overwhelmed', 'foggy', 'anxious', 'stressed', 'original'];

/* ── Action definitions ──────────────────────────────────────────────── */
const ACTIONS = [
  { id: 'simplify',   icon: '✨', label: 'Simplify'   },
  { id: 'explain',    icon: '💡', label: 'Explain'    },
  { id: 'steps',      icon: '📋', label: 'Step Guide' },
  { id: 'define',     icon: '📖', label: 'Define'     },
];

/* ── Text processing (rule-based) ────────────────────────────────────── */
const SAMPLE_TEXT =
  'Your outstanding balance of $128.45 is due by May 5, 2026. ' +
  'You may pay in full or arrange a payment plan at $47 per month for three months. ' +
  'Late payment may incur additional charges. Please review your options at your earliest convenience.';

function processText(text, action) {
  const raw = text.trim();
  if (!raw) return null;
  const sentences = (raw.match(/[^.!?\n]+[.!?\n]*/g) || [raw])
    .map(s => s.trim()).filter(s => s.length > 8);

  switch (action) {
    case 'simplify':
      return {
        type: 'simplify', heading: '✨ Plain English',
        summary: sentences.slice(0, 2).join(' '),
        bullets: sentences.slice(0, Math.min(4, sentences.length)),
        next: 'Read once, then decide if action is needed.',
      };
    case 'explain':
      return {
        type: 'explain', heading: '💡 What this means',
        summary: sentences[0] || raw.slice(0, 150),
        bullets: sentences.slice(1, 4).length ? sentences.slice(1, 4) : null,
      };
    case 'steps':
      return {
        type: 'steps', heading: '📋 Step by step',
        steps: sentences.slice(0, 5).map((s, i) => ({ n: i + 1, text: s })),
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
        type: 'define',
        heading: term ? `📖 "${term}"` : '📖 Definition',
        summary: def || 'Paste a single word or phrase to look it up.',
      };
    }
    case 'analyze': {
      const urgentRegex = /\b(due|deadline|urgent|important|must|required|need to|asap|immediately|before|by\s+\w+\s+\d+|expires?|overdue)\b/i;
      const actionRegex = /\b(pay|submit|reply|sign|review|choose|select|click|fill|complete|contact|call|visit|update|confirm|verify|return|cancel|schedule|book|register|enrol|accept|decline)\b/i;

      const mainIdea = sentences[0] || raw.slice(0, 200);
      const keyPoints = sentences.slice(1, 5).filter(s => s.length > 12);
      const urgent = sentences.find(s => urgentRegex.test(s));
      const action = sentences.find(s => actionRegex.test(s));

      return {
        type: 'analyze',
        heading: '🔍 Screen analysis',
        mainIdea,
        keyPoints,
        mattersMost: urgent || sentences[0] || 'No critical deadlines or urgency detected.',
        nextStep: action || 'Decide whether to act on this now or set it aside for later.',
      };
    }
    default: return null;
  }
}

/* ════════════════════════════════════════════════════════════════════════
   ANALYZE SCREEN DIALOG
   ════════════════════════════════════════════════════════════════════════ */
function AnalyzeDialog({ onConfirm, onCancel, cfg }) {
  const [pastedText,     setPastedText]     = useState('');
  const [screenshot,     setScreenshot]     = useState(null);   // { name, dataUrl }
  const [clipboardHint,  setClipboardHint]  = useState(null);   // 'ok' | 'empty' | 'denied'
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const fillFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text?.trim()) {
        setPastedText(prev => (prev ? `${prev}\n\n${text.trim()}` : text.trim()));
        setClipboardHint('ok');
      } else {
        setClipboardHint('empty');
      }
    } catch {
      setClipboardHint('denied');
    }
    setTimeout(() => setClipboardHint(null), 2200);
  };

  const handleScreenshot = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setScreenshot({ name: file.name, dataUrl: reader.result });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const useSample = () => {
    setPastedText(SAMPLE_TEXT);
  };

  const clipboardMsg = {
    ok:     { text: '✓ Pasted from clipboard', color: '#4ADE80' },
    empty:  { text: 'Clipboard is empty',       color: '#FBBF24' },
    denied: { text: 'Clipboard access denied',   color: '#F87171' },
  }[clipboardHint];

  const canAnalyze = pastedText.trim().length > 0;

  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ background: '#0B1120' }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🔍</span>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Analyze Screen</p>
            <p className="text-[11px] text-slate-500">Choose how to capture content</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 text-xs transition-colors"
        >✕</button>
      </div>

      {/* ── Content (scrollable) ───────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>

        {/* Source picker */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Content source
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={fillFromClipboard}
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: '#1E293B', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2D3F52'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1E293B'; }}
            >
              <span className="text-lg leading-none">📋</span>
              <span>Clipboard</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: '#1E293B', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2D3F52'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1E293B'; }}
            >
              <span className="text-lg leading-none">📷</span>
              <span>Screenshot</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleScreenshot}
              className="hidden"
            />

            <button
              onClick={useSample}
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: '#1E293B', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2D3F52'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1E293B'; }}
            >
              <span className="text-lg leading-none">✦</span>
              <span>Sample</span>
            </button>
          </div>

          {/* Clipboard feedback */}
          {clipboardMsg && (
            <p className="text-[11px] mt-2 text-center" style={{ color: clipboardMsg.color }}>
              {clipboardMsg.text}
            </p>
          )}
        </div>

        {/* Screenshot preview */}
        {screenshot && (
          <div
            className="rounded-xl p-2.5 flex items-center gap-3"
            style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <img
              src={screenshot.dataUrl}
              alt="Screenshot preview"
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 truncate">{screenshot.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Reference only. Paste the text from this screenshot below.
              </p>
            </div>
            <button
              onClick={() => setScreenshot(null)}
              className="text-slate-500 hover:text-white text-xs px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
            >✕</button>
          </div>
        )}

        {/* Textarea */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
            Text to analyse
          </p>
          <textarea
            ref={textareaRef}
            value={pastedText}
            onChange={e => setPastedText(e.target.value)}
            placeholder="Paste or type text from your screen…"
            className="w-full rounded-xl px-3 py-2.5 text-sm leading-relaxed placeholder-slate-600 resize-none focus:outline-none"
            style={{
              background: '#1E293B',
              color: '#E2E8F0',
              border: `1px solid ${cfg.hex.accent}30`,
              minHeight: 110,
              maxHeight: 180,
            }}
          />
          {pastedText && (
            <div className="flex items-center justify-between mt-1">
              <button
                onClick={() => setPastedText('')}
                className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
              >Clear</button>
              <span className="text-[10px] text-slate-700">
                {pastedText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
          )}
        </div>

        {/* Ethics note */}
        <div className="rounded-xl p-2.5 flex items-start gap-2"
          style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}
        >
          <span className="text-xs mt-0.5">🔒</span>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Nothing is captured automatically. Analysis only runs when you click
            Analyze, and only on the text you provide above.
          </p>
        </div>
      </div>

      {/* ── Buttons ────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-5 py-3.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: '#1E293B', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Cancel
        </button>
        <button
          onClick={() => canAnalyze && onConfirm(pastedText.trim())}
          disabled={!canAnalyze}
          className="flex-[2] py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: cfg.hex.accent, color: '#fff' }}
        >
          🔍 Analyze →
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN DESKTOP APP
   ════════════════════════════════════════════════════════════════════════ */
export default function DesktopApp() {
  /* ── View / session state ─────────────────────────────────────── */
  const [appView,       setAppView]       = useState('idle');     // 'idle' | 'session' | 'workspace'
  const [collapsed,     setCollapsed]     = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  /* ── Overlay content state ────────────────────────────────────── */
  const [overlayMode,      setOverlayMode]      = useState('calm');
  const [inputText,        setInputText]        = useState('');
  const [output,           setOutput]           = useState(null);
  const [processing,       setProcessing]       = useState(false);
  const [activeAction,     setActiveAction]     = useState(null);
  const [showModeMenu,     setShowModeMenu]     = useState(false);
  const [showAnalyzeDialog,setShowAnalyzeDialog]= useState(false);
  const [alwaysOnTop,      setAlwaysOnTop]      = useState(false);

  const cfg = modeConfigs[overlayMode] || modeConfigs.calm;
  const { speak, stop, isSpeaking, isSupported: speechSupported } = useSpeech();
  const modeMenuRef = useRef(null);

  /* ── Close mode menu on outside click ────────────────────────── */
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

  /* ── Session management ───────────────────────────────────────── */
  const startSession = async () => {
    setTransitioning(true);
    // Auto-enable always-on-top for the duration of a session
    const win = await tauriWindow();
    if (win) {
      await win.setAlwaysOnTop(true);
      await resizeTo(W_OVERLAY, H_OVERLAY);
    }
    setAlwaysOnTop(true);
    setTimeout(() => { setAppView('session'); setTransitioning(false); }, 150);
  };

  const endSession = async () => {
    setTransitioning(true);
    stop();
    const win = await tauriWindow();
    if (win) {
      await win.setAlwaysOnTop(false);
      await resizeTo(W_OVERLAY, H_OVERLAY);
    }
    setTimeout(() => {
      setAppView('idle');
      setCollapsed(false);
      setAlwaysOnTop(false);
      setOutput(null);
      setInputText('');
      setActiveAction(null);
      setShowAnalyzeDialog(false);
      setTransitioning(false);
    }, 150);
  };

  /* ── Collapse / expand ────────────────────────────────────────── */
  const toggleCollapse = async () => {
    const next = !collapsed;
    setCollapsed(next);
    await resizeTo(W_OVERLAY, next ? H_COLLAPSED : H_OVERLAY);
  };

  /* ── Open / close workspace ───────────────────────────────────── */
  const openWorkspace = async () => {
    setTransitioning(true);
    await resizeTo(W_WORKSPACE, H_WORKSPACE);
    const win = await tauriWindow();
    if (win) await win.center();
    setTimeout(() => { setAppView('workspace'); setTransitioning(false); }, 200);
  };

  const closeWorkspace = async () => {
    setTransitioning(true);
    await resizeTo(W_OVERLAY, H_OVERLAY);
    const win = await tauriWindow();
    if (win) await win.center();
    setTimeout(() => { setAppView('session'); setTransitioning(false); }, 200);
  };

  /* ── Actions ──────────────────────────────────────────────────── */
  const runAction = useCallback((action, textOverride) => {
    const text = textOverride ?? inputText;
    if (!text.trim()) return;
    setActiveAction(action);
    setProcessing(true);
    setOutput(null);
    stop();
    setTimeout(() => {
      setOutput(processText(text, action));
      setProcessing(false);
    }, 500);
  }, [inputText, stop]);

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
  const handleAnalyzeConfirm = (text) => {
    setInputText(text);
    setShowAnalyzeDialog(false);
    runAction('analyze', text);
  };

  /* ── Style helpers ────────────────────────────────────────────── */
  const btnPrimary   = { background: cfg.hex.accent,      color: '#fff' };
  const btnSecondary = { background: '#1E293B',            color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.08)' };

  const fadeStyle = { opacity: transitioning ? 0 : 1, transition: 'opacity 0.15s' };

  /* ════════════════════════════════════════════════════════════════
     WORKSPACE VIEW
     ════════════════════════════════════════════════════════════════ */
  if (appView === 'workspace') {
    return (
      <div className="flex flex-col" style={{ height: '100vh', background: '#0F172A', ...fadeStyle }}>
        <div
          data-tauri-drag-region
          className="flex-shrink-0 flex items-center justify-between px-4 py-2.5"
          style={{ background: '#0F172A', userSelect: 'none' }}
        >
          <button
            onClick={closeWorkspace}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors"
          >
            ← Overlay
          </button>
          <div className="flex items-center gap-2 pointer-events-none">
            <div className="w-5 h-5 text-slate-400">
              <ClearPathLogo size={20} />
            </div>
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
     COLLAPSED BAR (active session only)
     ════════════════════════════════════════════════════════════════ */
  if (appView === 'session' && collapsed) {
    return (
      <div
        data-tauri-drag-region
        className="flex items-center justify-between px-4"
        style={{ height: '100vh', background: '#0F172A', userSelect: 'none', ...fadeStyle }}
      >
        {/* Left: logo + session badge */}
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="w-4 h-4 text-violet-400">
            <ClearPathLogo size={16} />
          </div>
          <span className="font-bold text-white text-sm">ClearPath</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-green-400">Session Active</span>
          </div>
        </div>
        {/* Right: expand + window controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleCollapse}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/10 text-xs transition-colors"
            title="Expand"
          >⊡</button>
          <button onClick={handleMinimize}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/10 text-xs transition-colors">━</button>
          <button onClick={handleClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-500/80 text-xs transition-colors">✕</button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     IDLE VIEW (no session running)
     ════════════════════════════════════════════════════════════════ */
  if (appView === 'idle') {
    return (
      <div
        className="flex flex-col"
        style={{ height: '100vh', background: '#0F172A', color: '#F1F5F9', ...fadeStyle }}
      >
        {/* Title bar */}
        <div
          data-tauri-drag-region
          className="flex-shrink-0 flex items-center justify-between px-4 py-3"
          style={{ background: '#0F172A', userSelect: 'none' }}
        >
          <div className="flex items-center gap-2 pointer-events-none">
            <div className="w-5 h-5 text-violet-400">
              <ClearPathLogo size={20} />
            </div>
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

        {/* Hero content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
          <div className="w-16 h-16 text-violet-400">
            <ClearPathLogo size={64} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white mb-2">ClearPath Overlay</h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Your on-demand desktop assistant. Start a session to get help with anything on your screen.
            </p>
          </div>

          {/* Start session button */}
          <button
            onClick={startSession}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #166534, #15803d)',
              color: '#fff',
              boxShadow: '0 8px 32px rgba(21,128,61,0.4)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            Start Overlay Session
          </button>

          {/* Divider */}
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-slate-600 text-xs">or</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Workspace link */}
          <button
            onClick={openWorkspace}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors px-5 py-2.5 rounded-xl hover:bg-white/5 w-full justify-center"
          >
            <span>📋</span>
            <span>Open Workspace Mode</span>
            <span className="opacity-40">→</span>
          </button>
        </div>

        {/* Footer */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-4 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <button
            onClick={() => handleAlwaysOnTop(!alwaysOnTop)}
            className="flex items-center gap-1.5 text-[11px] transition-colors"
            style={{ color: alwaysOnTop ? '#4ADE80' : '#475569' }}
          >
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
    <div
      className="flex flex-col relative"
      style={{ height: '100vh', background: '#0F172A', color: '#F1F5F9', ...fadeStyle }}
    >

      {/* Analyze Screen dialog — full-panel overlay */}
      {showAnalyzeDialog && (
        <AnalyzeDialog
          cfg={cfg}
          onConfirm={handleAnalyzeConfirm}
          onCancel={() => setShowAnalyzeDialog(false)}
        />
      )}

      {/* ── Title bar ────────────────────────────────────────── */}
      <div
        data-tauri-drag-region
        className="flex-shrink-0 flex items-center justify-between px-4 py-2.5"
        style={{ background: '#0F172A', userSelect: 'none' }}
      >
        {/* Logo + session badge */}
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="w-5 h-5 text-violet-400">
            <ClearPathLogo size={20} />
          </div>
          <span className="font-bold text-sm text-white">ClearPath</span>
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-green-400">Session Active</span>
          </div>
        </div>

        {/* Window controls + collapse */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleCollapse}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/10 text-xs transition-colors"
            title="Minimise panel"
          >⊟</button>
          <button onClick={handleMinimize}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/10 text-xs transition-colors">━</button>
          <button onClick={handleClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-500/80 text-xs transition-colors">✕</button>
        </div>
      </div>

      {/* ── Mode + Workspace bar ──────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-2"
        style={{ background: '#1E293B', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Mode dropdown */}
        <div className="relative" ref={modeMenuRef}>
          <button
            onClick={() => setShowModeMenu(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: cfg.hex.accent + '25', color: '#F1F5F9', border: `1px solid ${cfg.hex.accent}40` }}
          >
            <span>{cfg.icon}</span>
            <span>{cfg.name}</span>
            <span className="text-slate-500 text-xs ml-0.5">{showModeMenu ? '▴' : '▾'}</span>
          </button>

          {showModeMenu && (
            <div
              className="absolute top-full mt-1.5 left-0 w-56 rounded-2xl overflow-hidden z-50"
              style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            >
              {ALL_MODES.map(m => {
                const mc = modeConfigs[m];
                const active = m === overlayMode;
                return (
                  <button
                    key={m}
                    onClick={() => handleModeSelect(m)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-sm transition-colors"
                    style={active ? { background: mc.hex.accent + '20', color: '#fff' } : { color: '#94A3B8' }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
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

        {/* Workspace link */}
        <button
          onClick={openWorkspace}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-200 text-xs font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
        >
          <span>📋</span>
          <span>Workspace</span>
          <span className="opacity-40">→</span>
        </button>
      </div>

      {/* ── Scrollable main area ──────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
      >

        {/* Analyze Screen — primary action */}
        <button
          onClick={() => setShowAnalyzeDialog(true)}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5"
          style={{
            background: `linear-gradient(135deg, ${cfg.hex.accent}cc, ${cfg.hex.accent})`,
            color: '#fff',
            boxShadow: `0 4px 20px ${cfg.hex.accent}40`,
          }}
        >
          <span className="text-lg">🔍</span>
          Analyze Screen
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
              background: '#1E293B',
              color: '#E2E8F0',
              border: '1px solid rgba(255,255,255,0.08)',
              minHeight: 80,
              maxHeight: 130,
            }}
          />
          <div className="flex items-center justify-between mt-1.5">
            {inputText ? (
              <button
                onClick={() => { setInputText(''); setOutput(null); setActiveAction(null); stop(); }}
                className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
              >Clear</button>
            ) : (
              <button
                onClick={() => setInputText(SAMPLE_TEXT)}
                className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1"
              >✦ Use sample text</button>
            )}
            {inputText && (
              <span className="text-[10px] text-slate-700">{inputText.split(/\s+/).filter(Boolean).length} words</span>
            )}
          </div>
        </div>

        {/* Action buttons grid */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {ACTIONS.map(({ id, icon, label }) => {
              const isActive = activeAction === id && output?.type === id;
              return (
                <button
                  key={id}
                  onClick={() => runAction(id)}
                  disabled={!inputText.trim() || processing}
                  style={isActive ? btnPrimary : btnSecondary}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  onMouseEnter={e => { if (!isActive && inputText.trim() && !processing) e.currentTarget.style.background = '#2D3F52'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '#1E293B'; }}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Read Aloud full-width */}
          <button
            onClick={handleReadAloud}
            disabled={!inputText.trim() && !output}
            style={isSpeaking ? btnPrimary : btnSecondary}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
          >
            <span>{isSpeaking ? '⏹' : '🔊'}</span>
            <span>{isSpeaking ? 'Stop reading' : 'Read Aloud'}</span>
          </button>
        </div>

        {/* Processing indicator */}
        {processing && (
          <div className="flex items-center justify-center gap-1.5 py-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: cfg.hex.accent, animationDelay: `${i * 0.15}s` }} />
            ))}
            <span className="text-xs text-slate-500 ml-1">Analysing…</span>
          </div>
        )}

        {/* Output panel */}
        {output && !processing && (
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: cfg.hex.accent + '18', border: `1px solid ${cfg.hex.accent}30` }}
          >
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: cfg.hex.accent }}>
              {output.heading}
            </p>

            {/* Analyze: structured output */}
            {output.type === 'analyze' ? (
              <div className="space-y-3.5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: cfg.hex.accent }}>
                    💡 Main idea
                  </p>
                  <p className="text-sm leading-relaxed text-slate-200">{output.mainIdea}</p>
                </div>

                {output.keyPoints?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: cfg.hex.accent }}>
                      🔑 Key points
                    </p>
                    <ul className="space-y-1.5">
                      {output.keyPoints.map((p, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                          <span className="opacity-40 flex-shrink-0 mt-0.5">·</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div
                  className="rounded-xl p-3"
                  style={{ background: cfg.hex.accent + '22', border: `1px solid ${cfg.hex.accent}40` }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: cfg.hex.accent }}>
                    ⚡ What matters most
                  </p>
                  <p className="text-sm leading-relaxed text-slate-100">{output.mattersMost}</p>
                </div>

                <div
                  className="rounded-xl p-3 border-l-2"
                  style={{ background: 'rgba(255,255,255,0.03)', borderLeftColor: cfg.hex.accent }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: cfg.hex.accent }}>
                    → Next step
                  </p>
                  <p className="text-sm leading-relaxed text-slate-200">{output.nextStep}</p>
                </div>
              </div>
            ) : (
              <>
                {output.summary && (
                  <p className="text-sm leading-relaxed text-slate-200">{output.summary}</p>
                )}

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
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                          style={{ background: cfg.hex.accent, color: '#fff' }}
                        >{n}</span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ol>
                )}

                {output.next && (
                  <div className="pt-2 border-t" style={{ borderColor: cfg.hex.accent + '25' }}>
                    <p className="text-xs font-semibold" style={{ color: cfg.hex.accent }}>
                      Next: {output.next}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Footer bar ────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-2.5"
        style={{ background: '#0B1120', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Always on top */}
        <button
          onClick={() => handleAlwaysOnTop(!alwaysOnTop)}
          className="flex items-center gap-1.5 text-[11px] transition-colors"
          style={{ color: alwaysOnTop ? '#4ADE80' : '#475569' }}
        >
          <span>📌</span>
          <span>Pin on top</span>
          <div className="w-7 h-4 rounded-full transition-colors flex items-center px-0.5 ml-1"
            style={{ background: alwaysOnTop ? '#4ADE80' : '#1E293B' }}>
            <div className="w-3 h-3 rounded-full bg-white transition-transform"
              style={{ transform: alwaysOnTop ? 'translateX(12px)' : 'translateX(0)' }} />
          </div>
        </button>

        {/* End session */}
        <button
          onClick={endSession}
          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
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
