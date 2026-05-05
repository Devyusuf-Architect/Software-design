import { useState, useCallback, useRef, useEffect } from 'react';
import { modeConfigs } from '../../utils/modeConfigs';
import { lookupWord } from '../../data/wordDictionary';
import { useSpeech } from '../../hooks/useSpeech';
import { isTauri } from '../../utils/isTauri';
import DemoWorkspace from '../DemoWorkspace';

/* ── Tauri window helpers ─────────────────────────────────────────────── */
async function tauriWindow() {
  if (!isTauri) return null;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    return getCurrentWindow();
  } catch { return null; }
}

const OVERLAY_W = 400, OVERLAY_H = 640;
const WORKSPACE_W = 1280, WORKSPACE_H = 840;

/* ── Text processing (rule-based simulation) ──────────────────────────── */
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
    default: return null;
  }
}

const MODES = ['calm', 'overwhelmed', 'foggy', 'anxious', 'stressed'];
const ACTIONS = [
  { id: 'simplify', icon: '✨', label: 'Simplify' },
  { id: 'explain',  icon: '💡', label: 'Explain'  },
  { id: 'steps',    icon: '📋', label: 'Steps'    },
  { id: 'define',   icon: '📖', label: 'Define'   },
];

/* ════════════════════════════════════════════════════════════════════════ */
export default function DesktopApp() {
  const [view,         setView]         = useState('overlay'); // 'overlay' | 'workspace'
  const [overlayMode,  setOverlayMode]  = useState('calm');
  const [inputText,    setInputText]    = useState('');
  const [output,       setOutput]       = useState(null);
  const [processing,   setProcessing]   = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [alwaysOnTop,  setAlwaysOnTop]  = useState(false);
  const [transitioning,setTransitioning]= useState(false);

  const cfg = modeConfigs[overlayMode] || modeConfigs.calm;
  const { speak, stop, isSpeaking, isSupported } = useSpeech();

  /* ── Window controls ──────────────────────────────────────────── */
  const handleMinimize = async () => {
    const win = await tauriWindow(); win?.minimize();
  };
  const handleClose = async () => {
    const win = await tauriWindow(); win?.close();
  };
  const handleAlwaysOnTop = async (val) => {
    setAlwaysOnTop(val);
    const win = await tauriWindow(); win?.setAlwaysOnTop(val);
  };

  const openWorkspace = async () => {
    setTransitioning(true);
    const win = await tauriWindow();
    if (win) {
      const { LogicalSize } = await import('@tauri-apps/api/window');
      await win.setSize(new LogicalSize(WORKSPACE_W, WORKSPACE_H));
      await win.center();
    }
    setTimeout(() => { setView('workspace'); setTransitioning(false); }, 200);
  };

  const closeWorkspace = async () => {
    setTransitioning(true);
    const win = await tauriWindow();
    if (win) {
      const { LogicalSize } = await import('@tauri-apps/api/window');
      await win.setSize(new LogicalSize(OVERLAY_W, OVERLAY_H));
      await win.center();
    }
    setTimeout(() => { setView('overlay'); setTransitioning(false); }, 200);
  };

  /* ── Actions ──────────────────────────────────────────────────── */
  const runAction = (action) => {
    if (!inputText.trim()) return;
    setActiveAction(action);
    setProcessing(true);
    setOutput(null);
    stop();
    setTimeout(() => {
      setOutput(processText(inputText, action));
      setProcessing(false);
    }, 500);
  };

  const handleReadAloud = () => {
    const text = output?.summary || inputText;
    if (!text.trim()) return;
    if (isSpeaking) { stop(); return; }
    if (isSupported) speak(text, undefined, overlayMode);
  };

  const handleModeSelect = (m) => {
    setOverlayMode(m);
    setShowModeMenu(false);
    setOutput(null);
  };

  /* ── Close mode menu on outside click ─────────────────────────── */
  const modeMenuRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target)) {
        setShowModeMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Style helpers ────────────────────────────────────────────── */
  const btnPrimary   = { background: cfg.hex.accent,      color: '#fff' };
  const btnSecondary = { background: cfg.hex.accentLight, color: cfg.hex.text };

  /* ══════════════════════════════════════════════════════════════ */
  /* WORKSPACE VIEW                                                  */
  /* ══════════════════════════════════════════════════════════════ */
  if (view === 'workspace') {
    return (
      <div
        className="flex flex-col"
        style={{ height: '100vh', background: '#0F172A', opacity: transitioning ? 0 : 1, transition: 'opacity 0.2s' }}
      >
        {/* Custom title bar */}
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
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-[10px]">🌿</span>
            <span className="text-white font-semibold text-sm">ClearPath Workspace</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleMinimize}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 text-xs transition-colors"
            >━</button>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-500/80 text-xs transition-colors"
            >✕</button>
          </div>
        </div>
        {/* Workspace content */}
        <div className="flex-1 overflow-hidden">
          <DemoWorkspace initialView="workspace" onExit={closeWorkspace} />
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════ */
  /* OVERLAY VIEW                                                    */
  /* ══════════════════════════════════════════════════════════════ */
  return (
    <div
      className="flex flex-col"
      style={{
        height: '100vh',
        background: '#0F172A',
        color: '#F1F5F9',
        opacity: transitioning ? 0 : 1,
        transition: 'opacity 0.2s',
        fontFamily: 'inherit',
      }}
    >
      {/* ── Title bar / drag region ─────────────────────────── */}
      <div
        data-tauri-drag-region
        className="flex-shrink-0 flex items-center justify-between px-4 py-3"
        style={{ background: '#0F172A', userSelect: 'none', cursor: 'default' }}
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <span className="text-lg leading-none">{cfg.icon}</span>
          <span className="font-bold text-sm text-white leading-none">ClearPath</span>
          <span className="text-slate-600 text-[10px] font-mono leading-none">by ODAI</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleMinimize}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/10 text-xs transition-colors"
            title="Minimise"
          >━</button>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-red-500/80 text-xs transition-colors"
            title="Close"
          >✕</button>
        </div>
      </div>

      {/* ── Mode + Workspace link ───────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-2.5"
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
            <span className="text-slate-500 text-xs">{showModeMenu ? '▴' : '▾'}</span>
          </button>

          {showModeMenu && (
            <div
              className="absolute top-full mt-1.5 left-0 w-52 rounded-2xl overflow-hidden z-50"
              style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            >
              {MODES.map(m => {
                const mc = modeConfigs[m];
                const active = m === overlayMode;
                return (
                  <button
                    key={m}
                    onClick={() => handleModeSelect(m)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-sm transition-colors"
                    style={active
                      ? { background: mc.hex.accent + '20', color: '#fff' }
                      : { color: '#94A3B8' }}
                    onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
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
              {/* Ethics note */}
              <div className="px-4 py-2.5 border-t border-white/5">
                <p className="text-[10px] text-slate-600">You select your mode manually.</p>
              </div>
            </div>
          )}
        </div>

        {/* Open workspace */}
        <button
          onClick={openWorkspace}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-200 text-xs font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
        >
          <span>📋</span>
          <span>Workspace</span>
          <span className="opacity-40">→</span>
        </button>
      </div>

      {/* ── Scrollable content area ─────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>

        {/* Input */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
            Text to analyse
          </label>
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
              maxHeight: 140,
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
              >
                ✦ Use sample text
              </button>
            )}
            {inputText && (
              <span className="text-[10px] text-slate-700">{inputText.split(/\s+/).length} words</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {ACTIONS.map(({ id, icon, label }) => {
              const isActive = activeAction === id && output?.type === id;
              return (
                <button
                  key={id}
                  onClick={() => runAction(id)}
                  disabled={!inputText.trim() || processing}
                  style={isActive ? btnPrimary : { background: '#1E293B', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.08)' }}
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

          {/* Read Aloud — full width */}
          <button
            onClick={handleReadAloud}
            disabled={!inputText.trim() && !output}
            style={isSpeaking
              ? btnPrimary
              : { background: '#1E293B', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.08)' }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
          >
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
            <span className="text-xs text-slate-500 ml-1">Analysing…</span>
          </div>
        )}

        {/* Output */}
        {output && !processing && (
          <div
            className="rounded-2xl p-4 space-y-3 fade-in"
            style={{ background: cfg.hex.accent + '18', border: `1px solid ${cfg.hex.accent}30` }}
          >
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: cfg.hex.accent }}>
              {output.heading}
            </p>

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
          </div>
        )}
      </div>

      {/* ── Footer bar ──────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-2"
        style={{ background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        {/* Always on top toggle */}
        <button
          onClick={() => handleAlwaysOnTop(!alwaysOnTop)}
          className="flex items-center gap-1.5 text-[11px] transition-colors"
          style={{ color: alwaysOnTop ? cfg.hex.accent : '#475569' }}
        >
          <span>📌</span>
          <span>Always on top</span>
          <div
            className="w-7 h-4 rounded-full transition-colors flex items-center px-0.5"
            style={{ background: alwaysOnTop ? cfg.hex.accent : '#1E293B' }}
          >
            <div
              className="w-3 h-3 rounded-full bg-white transition-transform"
              style={{ transform: alwaysOnTop ? 'translateX(12px)' : 'translateX(0)' }}
            />
          </div>
        </button>

        <p className="text-[10px] text-slate-700">You stay in control</p>
      </div>
    </div>
  );
}
