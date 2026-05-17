import { useState, useRef } from 'react';
import { captureScreen, cropDataUrl } from '../../utils/screenCapture';
import { analyzeScreenshot, getApiKey, saveApiKey, clearApiKey } from '../../utils/aiVision';

const HAS_BUILT_IN_KEY = !!(import.meta.env.VITE_ANTHROPIC_KEY);

/*
 * Flow:
 *   apikey     → no key stored; user enters their Claude API key
 *   chooser    → pick "Full screen" or "Select area"
 *   capturing  → OS picker open
 *   cropping   → drag region on captured image
 *   analyzing  → AI vision call in progress
 *   error      → something failed
 *
 * On success: onConfirm(aiResult) where aiResult = { context, mainIdea,
 *   mattersMost, nextStep, keyPoints, cleanText, intent }
 */

export default function AnalyzeDialog({ onConfirm, onCancel, cfg }) {
  const storedKey = getApiKey();

  // Skip API key setup if app was built with a bundled key
  const [step,      setStep]      = useState((HAS_BUILT_IN_KEY || storedKey) ? 'chooser' : 'apikey');
  const [apiKeyVal, setApiKeyVal] = useState('');
  const [keyError,  setKeyError]  = useState('');
  const [error,     setError]     = useState(null);
  const [rawShot,   setRawShot]   = useState(null);
  const [progress,  setProgress]  = useState('');

  const captureSupported =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia;

  /* ── API key step ─────────────────────────────────────────────── */
  const handleSaveKey = () => {
    const k = apiKeyVal.trim();
    if (!k) { setKeyError('Please enter your API key.'); return; }
    if (!k.startsWith('sk-ant-')) {
      setKeyError('That does not look like a Claude API key. It should start with sk-ant-');
      return;
    }
    saveApiKey(k);
    setKeyError('');
    setStep('chooser');
  };

  /* ── Screen capture ───────────────────────────────────────────── */
  const startCapture = async (mode) => {
    setError(null);
    setStep('capturing');

    // Hide this window so it doesn't appear in the captured image
    let win = null;
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      win = getCurrentWindow();
      await win.hide();
      await new Promise(r => setTimeout(r, 300));
    } catch {}

    try {
      const shot = await captureScreen();
      if (win) await win.show().catch(() => {});
      setRawShot(shot);
      if (mode === 'area') { setStep('cropping'); return; }
      await runAi(shot.dataUrl);
    } catch (err) {
      if (win) await win.show().catch(() => {});
      const msg = err?.message || '';
      if (/cancel/i.test(msg)) { setStep('chooser'); return; }
      setError(msg || 'Screen capture failed.');
      setStep('error');
    }
  };

  /* ── AI analysis ──────────────────────────────────────────────── */
  const runAi = async (dataUrl) => {
    setStep('analyzing');
    setProgress('Sending to AI…');
    try {
      const key    = getApiKey();
      setProgress('Analyzing your screen…');
      const result = await analyzeScreenshot(dataUrl, key);
      onConfirm(result);
    } catch (err) {
      const msg = err?.message || '';
      if (msg === 'INVALID_API_KEY') {
        clearApiKey();
        setError('Your API key was rejected. Please re-enter it.');
        setStep('apikey');
        return;
      }
      if (msg === 'RATE_LIMITED') {
        setError('Rate limited — please wait a moment and try again.');
      } else {
        setError(msg || 'AI analysis failed.');
      }
      setStep('error');
    }
  };

  const handleCropSelect = async (rect) => {
    try {
      const cropped = await cropDataUrl(rawShot.dataUrl, rect);
      await runAi(cropped.dataUrl);
    } catch (err) {
      setError(err?.message || 'Crop failed.');
      setStep('error');
    }
  };

  /* ── Render body ──────────────────────────────────────────────── */
  const busy = step === 'capturing' || step === 'analyzing';

  const body = (() => {

    /* ── API key entry ─────────────────────────────────────────── */
    if (step === 'apikey') {
      return (
        <div className="space-y-4">
          <div className="rounded-xl p-4 space-y-1"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <p className="text-sm font-semibold text-white">Claude API key required</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ClearPath uses Claude AI to understand your screen. Your key is stored locally on this
              device only — it is never sent to our servers.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Your Claude API key
            </p>
            <input
              type="password"
              value={apiKeyVal}
              onChange={e => { setApiKeyVal(e.target.value); setKeyError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveKey(); }}
              placeholder="sk-ant-api03-…"
              className="w-full rounded-xl px-3 py-2.5 text-sm placeholder-slate-600 focus:outline-none"
              style={{ background: '#1E293B', color: '#E2E8F0', border: `1px solid ${keyError ? '#F87171' : 'rgba(255,255,255,0.08)'}` }}
              autoFocus
            />
            {keyError && <p className="text-[11px] text-red-400 mt-1">{keyError}</p>}
          </div>

          <div className="rounded-lg p-3 flex items-start gap-2"
            style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
            <span className="text-emerald-400 flex-shrink-0 mt-0.5">🔒</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Get a free API key at <span className="text-indigo-400">console.anthropic.com</span>.
              All analysis happens via your own key — no data is stored by ClearPath.
            </p>
          </div>
        </div>
      );
    }

    /* ── Chooser ───────────────────────────────────────────────── */
    if (step === 'chooser') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => startCapture('full')}
              disabled={!captureSupported}
              className="flex flex-col items-start gap-2 px-3.5 py-4 rounded-xl text-left transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background:  `linear-gradient(135deg, ${cfg.hex.accent}d9, ${cfg.hex.accent})`,
                color:       '#fff',
                boxShadow:   `0 4px 18px ${cfg.hex.accent}30`,
              }}
            >
              <SquareIcon name="monitor" size={18} />
              <div>
                <p className="font-semibold text-sm leading-tight">Full Screen</p>
                <p className="text-[11px] opacity-80 leading-snug mt-0.5">Capture entire screen</p>
              </div>
            </button>

            <button
              onClick={() => startCapture('area')}
              disabled={!captureSupported}
              className="flex flex-col items-start gap-2 px-3.5 py-4 rounded-xl text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#1E293B', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#293548'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1E293B'; }}
            >
              <SquareIcon name="crop" size={18} />
              <div>
                <p className="font-semibold text-sm leading-tight">Select Area</p>
                <p className="text-[11px] opacity-60 leading-snug mt-0.5">More precise</p>
              </div>
            </button>
          </div>

          {!captureSupported && (
            <div className="rounded-lg p-3 text-[11px] text-amber-300"
              style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
              Screen capture not supported in this build.
            </div>
          )}

          <div className="rounded-lg p-3 flex items-start gap-2"
            style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
            <span className="text-emerald-400 flex-shrink-0 mt-0.5"><SquareIcon name="lock" size={12} /></span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your OS shows a picker. ClearPath only captures when you click — nothing runs in the background.
            </p>
          </div>

          {!HAS_BUILT_IN_KEY && (
            <button
              onClick={() => { clearApiKey(); setApiKeyVal(''); setStep('apikey'); }}
              className="text-[10px] text-slate-700 hover:text-slate-500 transition-colors w-full text-center pt-1"
            >
              Change API key
            </button>
          )}
        </div>
      );
    }

    /* ── Waiting for OS picker ─────────────────────────────────── */
    if (step === 'capturing') {
      return (
        <div className="flex flex-col items-center justify-center py-10 gap-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <SquareIcon name="monitor" size={24} />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-white font-semibold text-sm mb-1.5">Choose a screen or window</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Your operating system is showing a picker. Select the window you want ClearPath to analyze.
            </p>
          </div>
        </div>
      );
    }

    /* ── Crop region ───────────────────────────────────────────── */
    if (step === 'cropping') {
      return (
        <CropStep
          shot={rawShot}
          onUseFull={() => runAi(rawShot.dataUrl)}
          onSelect={handleCropSelect}
        />
      );
    }

    /* ── AI analyzing ──────────────────────────────────────────── */
    if (step === 'analyzing') {
      return (
        <div className="flex flex-col items-center justify-center py-10 gap-5">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${cfg.hex.accent}30` }} />
            <div className="absolute inset-0 rounded-full animate-spin"
              style={{ border: `2px solid transparent`, borderTopColor: cfg.hex.accent }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg">🔍</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm mb-1">{progress}</p>
            <p className="text-slate-500 text-xs">AI is reading your screen</p>
          </div>
        </div>
      );
    }

    /* ── Error ─────────────────────────────────────────────────── */
    return (
      <div className="space-y-4">
        <div className="rounded-xl p-4"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="font-semibold text-red-300 text-sm mb-1">Something went wrong</p>
          <p className="text-[12px] text-slate-400 leading-relaxed">{error}</p>
        </div>
        <button onClick={() => setStep((HAS_BUILT_IN_KEY || getApiKey()) ? 'chooser' : 'apikey')}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: cfg.hex.accent, color: '#fff' }}>
          Try again
        </button>
      </div>
    );
  })();

  /* ── Header label ─────────────────────────────────────────────── */
  const headerLabel = {
    apikey:    { title: 'Set up AI',          sub: 'One-time setup to enable AI analysis' },
    chooser:   { title: 'Analyze Screen',     sub: 'AI will read your screen'              },
    capturing: { title: 'Screen capture',     sub: 'Waiting for you to pick a surface'     },
    cropping:  { title: 'Select area',        sub: 'Drag to focus on the content'          },
    analyzing: { title: 'AI analyzing',       sub: 'Reading and understanding your screen' },
    error:     { title: 'Something went wrong', sub: ''                                    },
  }[step] || { title: 'Analyze Screen', sub: '' };

  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ background: '#0B1120' }}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p className="font-semibold text-white text-sm leading-tight">{headerLabel.title}</p>
          {headerLabel.sub && <p className="text-[11px] text-slate-500 mt-0.5">{headerLabel.sub}</p>}
        </div>
        <button onClick={onCancel} disabled={busy}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <SquareIcon name="x" size={12} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0 space-y-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
        {body}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onCancel} disabled={busy}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: '#1E293B', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>
          Cancel
        </button>

        {step === 'apikey' && (
          <button onClick={handleSaveKey}
            className="flex-[2] py-2.5 rounded-xl text-sm font-bold transition-colors"
            style={{ background: cfg.hex.accent, color: '#fff' }}>
            Save &amp; Continue
          </button>
        )}

        {(busy || step === 'error' || step === 'cropping') && (
          <div className="flex-[2]" />
        )}
      </div>
    </div>
  );
}

/* ── Crop step ──────────────────────────────────────────────────────── */
function CropStep({ shot, onUseFull, onSelect }) {
  const containerRef = useRef(null);
  const dragStart    = useRef(null);
  const [sel, setSel] = useState(null);

  const getPos = (e) => {
    const r = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (e.clientY - r.top)  / r.height)),
    };
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    const p = getPos(e);
    dragStart.current = p;
    setSel({ x: p.x, y: p.y, w: 0, h: 0 });
  };

  const onMouseMove = (e) => {
    if (!dragStart.current) return;
    const p = getPos(e);
    setSel({
      x: Math.min(dragStart.current.x, p.x),
      y: Math.min(dragStart.current.y, p.y),
      w: Math.abs(p.x - dragStart.current.x),
      h: Math.abs(p.y - dragStart.current.y),
    });
  };

  const onMouseUp = () => { dragStart.current = null; };

  const hasSel = sel && sel.w > 0.03 && sel.h > 0.03;

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-400 px-1">
        {hasSel ? 'Selection ready — click Analyze Area.' : 'Drag on the image to select a region, or analyze the full screen.'}
      </p>

      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="relative w-full rounded-xl overflow-hidden select-none"
        style={{
          aspectRatio: shot ? `${shot.width} / ${shot.height}` : '16/9',
          maxHeight: '190px',
          background: '#000',
          cursor: 'crosshair',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {shot && (
          <img src={shot.dataUrl} alt="" draggable={false}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
        )}

        {!hasSel && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] text-white/20 font-medium uppercase tracking-widest">Drag to select</span>
          </div>
        )}

        {hasSel && (
          <div className="absolute pointer-events-none" style={{
            left:      `${sel.x * 100}%`,
            top:       `${sel.y * 100}%`,
            width:     `${sel.w * 100}%`,
            height:    `${sel.h * 100}%`,
            border:    '2px solid #6366F1',
            background: 'rgba(99,102,241,0.12)',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
          }} />
        )}
      </div>

      <div className="flex gap-2">
        {hasSel && (
          <button onClick={() => { setSel(null); dragStart.current = null; }}
            className="py-2.5 px-3 rounded-xl text-sm font-semibold flex-shrink-0"
            style={{ background: '#1E293B', color: '#64748B', border: '1px solid rgba(255,255,255,0.06)' }}>
            Reset
          </button>
        )}
        <button onClick={onUseFull}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: '#1E293B', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>
          Full Screen
        </button>
        <button onClick={() => onSelect(sel)} disabled={!hasSel}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: hasSel ? '#6366F1' : '#1E293B',
            color: '#fff',
            boxShadow: hasSel ? '0 4px 16px rgba(99,102,241,0.35)' : 'none',
          }}>
          Analyze Area
        </button>
      </div>
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────────────── */
function SquareIcon({ name, size = 14 }) {
  const b = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'monitor': return <svg {...b}><rect x="3" y="5" width="18" height="12" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    case 'crop':    return <svg {...b}><path d="M6 3v14a1 1 0 001 1h14"/><path d="M3 6h14a1 1 0 011 1v14"/></svg>;
    case 'lock':    return <svg {...b}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 118 0v4"/></svg>;
    case 'x':       return <svg {...b}><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>;
    default:        return null;
  }
}
