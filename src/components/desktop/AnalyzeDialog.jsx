import { useState } from 'react';
import { captureScreen, extractTextFromImage } from '../../utils/screenCapture';

/**
 * Screen-capture-first Analyze dialog.
 *
 * Flow:
 *   idle       → user sees "Capture Screen" button (primary) and a small
 *                 paste/type fallback for environments without capture
 *   capturing  → OS picker is open; user is choosing a surface
 *   extracting → frame was captured; running OCR to pull out text
 *   review     → captured image + editable extracted text + Analyze button
 *   error      → capture failed for a non-cancelled reason
 *
 * Nothing is captured until the user clicks Capture Screen.
 */
export default function AnalyzeDialog({ onConfirm, onCancel, cfg, sampleText = '' }) {
  const [step,          setStep]          = useState('idle');
  const [error,         setError]         = useState(null);
  const [screenshot,    setScreenshot]    = useState(null);
  const [ocrProgress,   setOcrProgress]   = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [manualText,    setManualText]    = useState('');

  const captureSupported =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia;

  /* ── Actions ──────────────────────────────────────────────── */
  const startCapture = async () => {
    setError(null);
    setScreenshot(null);
    setExtractedText('');
    setOcrProgress(0);
    setStep('capturing');
    try {
      const shot = await captureScreen();
      setScreenshot(shot);
      setStep('extracting');
      let text = '';
      try {
        text = await extractTextFromImage(shot.dataUrl, setOcrProgress);
      } catch (ocrErr) {
        // OCR failure shouldn't break the flow — user can type the text manually
        console.warn('OCR failed:', ocrErr);
      }
      setExtractedText(text || '');
      setStep('review');
    } catch (err) {
      const msg = err?.message || 'Screen capture failed.';
      if (/cancel/i.test(msg)) {
        setStep('idle');
        return;
      }
      setError(msg);
      setStep('error');
    }
  };

  const resetCapture = () => {
    setStep('idle');
    setScreenshot(null);
    setExtractedText('');
    setOcrProgress(0);
    setError(null);
  };

  const submitCaptured = () => {
    const t = extractedText.trim();
    if (t) onConfirm(t);
  };
  const submitManual = () => {
    const t = manualText.trim();
    if (t) onConfirm(t);
  };

  /* ── Render header ──────────────────────────────────────── */
  const renderHeader = () => {
    if (step === 'capturing' || step === 'extracting') {
      return (
        <div className="flex items-center gap-2.5">
          <span className="relative flex items-center justify-center w-5 h-5">
            <span className="absolute w-5 h-5 rounded-full bg-red-500/30 animate-ping" />
            <span className="relative w-2 h-2 rounded-full bg-red-500" />
          </span>
          <div>
            <p className="font-semibold text-red-300 text-sm leading-tight">Screen capture active</p>
            <p className="text-[11px] text-slate-500">
              {step === 'capturing' ? 'Waiting for you to pick a surface' : 'Reading text from capture'}
            </p>
          </div>
        </div>
      );
    }
    if (step === 'review') {
      return (
        <div className="flex items-center gap-2.5">
          <span className="text-lg">✓</span>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Captured</p>
            <p className="text-[11px] text-slate-500">Review the text below, then analyze</p>
          </div>
        </div>
      );
    }
    if (step === 'error') {
      return (
        <div className="flex items-center gap-2.5">
          <span className="text-lg">⚠️</span>
          <p className="font-bold text-white text-sm leading-tight">Capture failed</p>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2.5">
        <span className="text-lg">🔍</span>
        <div>
          <p className="font-bold text-white text-sm leading-tight">Analyze Screen</p>
          <p className="text-[11px] text-slate-500">Capture content from your screen</p>
        </div>
      </div>
    );
  };

  /* ── Render body ────────────────────────────────────────── */
  const body = (() => {
    /* IDLE */
    if (step === 'idle') {
      return (
        <>
          {/* Primary action — Capture Screen */}
          <button
            onClick={startCapture}
            disabled={!captureSupported}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${cfg.hex.accent}d9, ${cfg.hex.accent})`,
              color: '#fff',
              boxShadow: `0 4px 20px ${cfg.hex.accent}30`,
            }}
          >
            <span className="text-3xl leading-none">📺</span>
            <div className="text-left flex-1">
              <p className="font-bold text-sm">Capture Screen</p>
              <p className="text-xs opacity-85 leading-snug">
                Choose a screen or window to analyze
              </p>
            </div>
            <span className="text-xl opacity-80">→</span>
          </button>

          {/* Ethics note */}
          <div
            className="rounded-lg p-3 flex items-start gap-2"
            style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}
          >
            <span className="text-xs mt-0.5">🔒</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your OS will show a picker. ClearPath only captures the screen or window
              you select, and only when you click the button. Nothing happens in the background.
            </p>
          </div>

          {!captureSupported && (
            <div
              className="rounded-lg p-3 text-[11px] text-amber-300 leading-relaxed"
              style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}
            >
              Screen capture isn't supported in this build. Use the fallback below.
            </div>
          )}

          {/* Fallback divider */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] text-slate-600 uppercase tracking-widest">
              {captureSupported ? 'Or fallback' : 'Manual entry'}
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Manual text entry */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Type or paste text
            </p>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Type or paste text manually…"
              className="w-full rounded-xl px-3 py-2.5 text-sm leading-relaxed placeholder-slate-600 resize-none focus:outline-none"
              style={{
                background: '#1E293B',
                color: '#E2E8F0',
                border: '1px solid rgba(255,255,255,0.06)',
                minHeight: 80,
                maxHeight: 130,
              }}
            />
            <div className="flex items-center justify-between mt-1">
              {sampleText ? (
                <button
                  onClick={() => setManualText(sampleText)}
                  className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
                >
                  ✦ Use sample text
                </button>
              ) : <span />}
              {manualText && (
                <span className="text-[10px] text-slate-700">
                  {manualText.split(/\s+/).filter(Boolean).length} words
                </span>
              )}
            </div>
          </div>
        </>
      );
    }

    /* CAPTURING */
    if (step === 'capturing') {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <span className="text-2xl">📺</span>
          </div>
          <div className="text-center max-w-xs">
            <p className="text-white font-semibold text-sm mb-1.5">
              Choose a screen or window
            </p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Your operating system is showing a picker. Pick what you want
              ClearPath to analyze, then confirm.
            </p>
          </div>
        </div>
      );
    }

    /* EXTRACTING */
    if (step === 'extracting') {
      return (
        <div className="space-y-4">
          {screenshot && (
            <div
              className="rounded-xl overflow-hidden border"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <img
                src={screenshot.dataUrl}
                alt="Captured screen"
                className="w-full h-32 object-cover"
              />
            </div>
          )}
          <div>
            <p className="text-white font-semibold text-sm mb-2 text-center">
              Reading text from screen…
            </p>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ background: '#1E293B' }}
            >
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${Math.round(ocrProgress * 100)}%`,
                  background: cfg.hex.accent,
                }}
              />
            </div>
            <p className="text-slate-500 text-[11px] mt-2 text-center">
              {Math.round(ocrProgress * 100)}% · OCR running locally
            </p>
          </div>
        </div>
      );
    }

    /* REVIEW */
    if (step === 'review') {
      return (
        <div className="space-y-4">
          {screenshot && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Captured screen
              </p>
              <div
                className="rounded-xl overflow-hidden border"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <img
                  src={screenshot.dataUrl}
                  alt="Captured screen"
                  className="w-full h-32 object-cover"
                />
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-2">
              <span>Extracted text</span>
              {!extractedText && (
                <span className="text-amber-400 normal-case tracking-normal font-normal">
                  · no text found, type below
                </span>
              )}
            </p>
            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder={
                extractedText
                  ? ''
                  : 'No readable text was extracted. You can type what you want analyzed here.'
              }
              className="w-full rounded-xl px-3 py-2.5 text-sm leading-relaxed placeholder-slate-600 resize-none focus:outline-none"
              style={{
                background: '#1E293B',
                color: '#E2E8F0',
                border: `1px solid ${cfg.hex.accent}30`,
                minHeight: 110,
                maxHeight: 180,
              }}
            />
            <div className="flex items-center justify-between mt-1">
              <button
                onClick={resetCapture}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
              >
                ↻ Re-capture
              </button>
              {extractedText && (
                <span className="text-[10px] text-slate-700">
                  {extractedText.split(/\s+/).filter(Boolean).length} words
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    /* ERROR */
    return (
      <div className="space-y-4">
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <span className="text-lg">⚠️</span>
          <div className="flex-1">
            <p className="font-semibold text-red-300 text-sm mb-1">Capture failed</p>
            <p className="text-[12px] text-slate-400 leading-relaxed">{error}</p>
          </div>
        </div>
        <button
          onClick={resetCapture}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: cfg.hex.accent, color: '#fff' }}
        >
          Try again
        </button>
      </div>
    );
  })();

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: '#0B1120' }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {renderHeader()}
        <button
          onClick={onCancel}
          disabled={step === 'capturing' || step === 'extracting'}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 text-xs transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 min-h-0 space-y-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
      >
        {body}
      </div>

      {/* Footer */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-5 py-3.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={onCancel}
          disabled={step === 'capturing' || step === 'extracting'}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: '#1E293B', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Cancel
        </button>

        {step === 'idle' && (
          <button
            onClick={submitManual}
            disabled={!manualText.trim()}
            className="flex-[2] py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: cfg.hex.accent, color: '#fff' }}
          >
            Analyze pasted text →
          </button>
        )}

        {step === 'review' && (
          <button
            onClick={submitCaptured}
            disabled={!extractedText.trim()}
            className="flex-[2] py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: cfg.hex.accent, color: '#fff' }}
          >
            Analyze captured text →
          </button>
        )}

        {(step === 'capturing' || step === 'extracting') && (
          <div
            className="flex-[2] py-2.5 rounded-xl text-sm font-semibold text-center"
            style={{ background: '#1E293B', color: '#64748B', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            Working…
          </div>
        )}

        {step === 'error' && <div className="flex-[2]" />}
      </div>
    </div>
  );
}
