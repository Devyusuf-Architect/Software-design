import { useState, useRef, useEffect, useCallback } from 'react';
import { modeConfigs } from '../../utils/modeConfigs';
import { lookupWord } from '../../data/wordDictionary';
import { useSpeech } from '../../hooks/useSpeech';

const OVERLAY_MODES = ['calm', 'overwhelmed', 'foggy', 'anxious', 'stressed'];

/* ── Rule-based text processing (simulates AI output) ─────────────────── */
function processText(text, action) {
  const raw = text.trim();
  if (!raw) return null;

  // Split into sentences; fall back to line-breaks or the whole block
  const sentences = (
    raw.match(/[^.!?\n]+[.!?\n]*/g) || raw.split('\n')
  ).map(s => s.trim()).filter(s => s.length > 8);

  switch (action) {
    case 'simplify':
      return {
        type:    'simplify',
        heading: 'Plain English',
        summary: sentences.slice(0, 2).join(' '),
        bullets: sentences.slice(0, Math.min(sentences.length, 4)),
        next:    'Read through once, then decide if any action is needed.',
      };

    case 'explain':
      return {
        type:    'explain',
        heading: 'What this means',
        summary: sentences[0] || raw.slice(0, 140),
        bullets: sentences.slice(1, 4).length ? sentences.slice(1, 4) : null,
      };

    case 'steps':
      return {
        type:    'steps',
        heading: 'Step by step',
        steps:   sentences.slice(0, 5).map((s, i) => ({ n: i + 1, text: s })),
      };

    case 'define': {
      const words = raw.split(/\s+/);
      let def = null, term = null;
      for (let len = Math.min(3, words.length); len >= 1; len--) {
        const candidate = words.slice(0, len).join(' ');
        def = lookupWord(candidate);
        if (def) { term = candidate; break; }
      }
      return {
        type:    'define',
        heading: term ? `"${term}"` : 'Definition',
        summary: def || 'Paste a single word or short phrase to look it up.',
      };
    }

    default:
      return null;
  }
}

/* ── Action button config ─────────────────────────────────────────────── */
const ACTIONS = [
  { id: 'simplify', label: '✨ Simplify',    sub: 'Plain English'  },
  { id: 'explain',  label: '💡 Explain',     sub: 'What it means'  },
  { id: 'steps',    label: '📋 Step Guide',  sub: 'Break it down'  },
  { id: 'define',   label: '📖 Define',      sub: 'Word meaning'   },
];

/* ════════════════════════════════════════════════════════════════════════ */
export default function OverlayPanel({ initialPos, onClose, defaultMode = 'calm', onModeChange }) {
  const [pos,          setPos]         = useState(initialPos || { x: 24, y: 100 });
  const [collapsed,    setCollapsed]   = useState(false);
  const [inputText,    setInputText]   = useState('');
  const [output,       setOutput]      = useState(null);
  const [processing,   setProcessing]  = useState(false);
  const [activeAction, setActiveAction]= useState(null);
  const [overlayMode,  setOverlayMode] = useState(defaultMode);
  const [showModeMenu, setShowModeMenu]= useState(false);

  const panelRef   = useRef(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const cfg = modeConfigs[overlayMode] || modeConfigs.calm;
  const { speak, stop, isSpeaking, isSupported } = useSpeech();

  /* ── Drag ─────────────────────────────────────────────────────── */
  const onHeaderMouseDown = useCallback((e) => {
    if (e.target.closest('button, textarea, select')) return;
    e.preventDefault();
    isDragging.current  = true;
    dragOffset.current  = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    document.body.style.userSelect = 'none';
  }, [pos]);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      const pw = panelRef.current?.offsetWidth  || 320;
      const ph = panelRef.current?.offsetHeight || 400;
      setPos({
        x: Math.min(window.innerWidth  - pw - 8, Math.max(8, e.clientX - dragOffset.current.x)),
        y: Math.min(window.innerHeight - ph - 8, Math.max(72, e.clientY - dragOffset.current.y)),
      });
    };
    const onUp = () => {
      isDragging.current = false;
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    };
  }, []);

  /* ── Actions ──────────────────────────────────────────────────── */
  const handleAction = (action) => {
    if (!inputText.trim()) return;
    setActiveAction(action);
    setProcessing(true);
    setOutput(null);
    setTimeout(() => {
      setOutput(processText(inputText, action));
      setProcessing(false);
    }, 550);
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
    onModeChange?.(m);
  };

  const handleClear = () => {
    setInputText('');
    setOutput(null);
    setActiveAction(null);
    stop();
  };

  /* ── Collapsed bubble ──────────────────────────────────────────── */
  if (collapsed) {
    return (
      <div style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999 }}>
        <button
          onClick={() => setCollapsed(false)}
          title="Open ClearPath"
          style={{ background: cfg.hex.accent }}
          className="w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center text-xl hover:scale-110 transition-transform"
        >
          {cfg.icon}
        </button>
      </div>
    );
  }

  /* ── Button style helpers ──────────────────────────────────────── */
  const btnActive   = { background: cfg.hex.accent,      color: '#fff' };
  const btnInactive = { background: cfg.hex.accentLight, color: cfg.hex.text };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999,
        width: 308,
        background: '#fff',
        borderRadius: 24,
        boxShadow: `0 8px 40px rgba(0,0,0,0.18), 0 0 0 1.5px ${cfg.hex.accent}28`,
      }}
    >
      {/* ── Header / drag bar ─────────────────────────────────── */}
      <div
        onMouseDown={onHeaderMouseDown}
        style={{ background: cfg.hex.accent, borderRadius: '24px 24px 0 0', cursor: 'move' }}
        className="flex items-center justify-between px-4 py-2.5"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{cfg.icon}</span>
          <span className="text-white font-bold text-sm leading-none">ClearPath</span>
          <span className="text-white/50 text-[10px] font-mono leading-none">Overlay</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(true)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 text-xs transition-colors"
            title="Collapse"
          >━</button>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 text-xs transition-colors"
            title="Close"
          >✕</button>
        </div>
      </div>

      <div className="p-3 space-y-2.5" style={{ maxHeight: '72vh', overflowY: 'auto' }}>

        {/* ── Mode selector ──────────────────────────────────── */}
        <div className="relative">
          <button
            onClick={() => setShowModeMenu(v => !v)}
            style={btnInactive}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <span>{cfg.icon} {cfg.name} mode</span>
            <span className="text-xs opacity-50">{showModeMenu ? '▴' : '▾'}</span>
          </button>

          {showModeMenu && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-2xl shadow-xl z-10 overflow-hidden"
              style={{ border: `1px solid ${cfg.hex.accent}20` }}>
              {OVERLAY_MODES.map(m => {
                const mc = modeConfigs[m];
                const active = m === overlayMode;
                return (
                  <button
                    key={m}
                    onClick={() => handleModeSelect(m)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-base">{mc.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{mc.name}</p>
                      <p className="text-xs text-slate-400 truncate">{mc.tagline}</p>
                    </div>
                    {active && <span className="text-xs" style={{ color: mc.hex.accent }}>✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Text input ─────────────────────────────────────── */}
        <div>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Paste text to analyse…"
            className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-slate-200 focus:outline-none resize-none leading-relaxed text-slate-700 placeholder-slate-300 transition-colors focus:border-slate-300"
            style={{ minHeight: 76, maxHeight: 140 }}
          />
          {inputText && (
            <button
              onClick={handleClear}
              className="text-[11px] text-slate-300 hover:text-slate-500 transition-colors mt-0.5 ml-1"
            >Clear</button>
          )}
        </div>

        {/* ── Action buttons ─────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-1.5">
          {ACTIONS.map(({ id, label, sub }) => {
            const isActive = activeAction === id && output?.type === id;
            return (
              <button
                key={id}
                onClick={() => handleAction(id)}
                disabled={!inputText.trim() || processing}
                style={isActive ? btnActive : btnInactive}
                className="flex flex-col items-start px-3 py-2 rounded-xl text-left transition-all disabled:opacity-35 disabled:cursor-not-allowed"
              >
                <span className="text-xs font-semibold leading-tight">{label}</span>
                <span className="text-[10px] opacity-55 leading-tight">{sub}</span>
              </button>
            );
          })}
        </div>

        {/* ── Read aloud ─────────────────────────────────────── */}
        <button
          onClick={handleReadAloud}
          disabled={!inputText.trim() && !output}
          style={isSpeaking ? btnActive : btnInactive}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-35"
        >
          <span>{isSpeaking ? '⏹' : '🔊'}</span>
          {isSpeaking ? 'Stop reading' : 'Read Aloud'}
        </button>

        {/* ── Processing indicator ────────────────────────────── */}
        {processing && (
          <div className="flex items-center gap-2 justify-center py-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: cfg.hex.accent, animationDelay: `${i * 0.15}s` }} />
            ))}
            <span className="text-xs text-slate-400 ml-1">Analysing…</span>
          </div>
        )}

        {/* ── Output ─────────────────────────────────────────── */}
        {output && !processing && (
          <div className="rounded-2xl p-3 space-y-2 fade-in"
            style={{ background: cfg.hex.accentLight }}>
            <p className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: cfg.hex.accent }}>{output.heading}</p>

            {output.summary && (
              <p className="text-[13px] leading-relaxed" style={{ color: cfg.hex.text }}>
                {output.summary}
              </p>
            )}

            {output.bullets?.length > 0 && (
              <ul className="space-y-1">
                {output.bullets.map((b, i) => (
                  <li key={i} className="flex gap-1.5 text-[12px]" style={{ color: cfg.hex.text }}>
                    <span className="opacity-40 flex-shrink-0 mt-0.5">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {output.steps?.length > 0 && (
              <ol className="space-y-1.5">
                {output.steps.map(({ n, text }) => (
                  <li key={n} className="flex gap-2 text-[12px]" style={{ color: cfg.hex.text }}>
                    <span className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5"
                      style={{ background: cfg.hex.accent, color: '#fff' }}>{n}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            )}

            {output.next && (
              <div className="pt-2 mt-1 border-t" style={{ borderColor: cfg.hex.accent + '25' }}>
                <p className="text-[11px] font-semibold" style={{ color: cfg.hex.accent }}>
                  Next: {output.next}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Ethics footer ──────────────────────────────────── */}
        <p className="text-center text-[10px] text-slate-300 pt-1 pb-0.5">
          User-selected mode · You stay in control
        </p>
      </div>
    </div>
  );
}
