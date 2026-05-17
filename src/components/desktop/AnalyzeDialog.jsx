import { useState, useRef, useEffect } from 'react';
import {
  captureScreen,
  extractTextFromImage,
  preprocessForOcr,
  cropDataUrl,
} from '../../utils/screenCapture';
import { cleanOcrResult } from '../../utils/textCleanup';

/**
 * Screen-capture-first Analyze dialog.
 *
 * Flow:
 *   chooser     -> pick "Full screen" or "Select area"
 *   capturing   -> OS picker is open / frame is being grabbed
 *   cropping    -> shown only for "Select area"; user drags a rect on the
 *                  captured image
 *   extracting  -> preprocessing + OCR running
 *   review      -> captured image + cleaned text + confidence + Analyze
 *   error       -> capture failed (non-cancel)
 *
 * Demo Safe Mode: if enabled and OCR yields nothing useful, a known-good
 * sample is used so a live demo never falls flat.
 */

const DEMO_SAFE_TEXT =
  'Your outstanding balance of $128.45 is due by May 5, 2026. ' +
  'You may pay in full or arrange a payment plan at $47 per month for three months. ' +
  'Late payment may incur additional charges. Please review your options at your earliest convenience.';

export default function AnalyzeDialog({ onConfirm, onCancel, cfg, sampleText = '' }) {
  /* state */
  const [step,           setStep]           = useState('chooser');
  const [error,          setError]          = useState(null);
  const [rawShot,        setRawShot]        = useState(null);   // { dataUrl, width, height } — full untouched screenshot
  const [workingShot,    setWorkingShot]    = useState(null);   // { dataUrl, width, height } — what was sent to OCR
  const [ocrProgress,    setOcrProgress]    = useState(0);
  const [cleaned,        setCleaned]        = useState(null);   // result from cleanOcrResult
  const [editedText,     setEditedText]     = useState('');
  const [manualText,     setManualText]     = useState('');
  const [showRaw,        setShowRaw]        = useState(false);
  const [enhancing,      setEnhancing]      = useState(false);
  const [demoSafe,       setDemoSafe]       = useState(false);

  const captureSupported =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia;

  /* ─────────────────────────────────────────────────────────── */
  /* Capture pipeline                                            */
  /* ─────────────────────────────────────────────────────────── */
  const reset = (toStep = 'chooser') => {
    setStep(toStep);
    setError(null);
    setRawShot(null);
    setWorkingShot(null);
    setOcrProgress(0);
    setCleaned(null);
    setEditedText('');
    setShowRaw(false);
    setEnhancing(false);
  };

  const startCapture = async (mode /* 'full' | 'area' */) => {
    setError(null);
    setStep('capturing');
    try {
      const shot = await captureScreen();
      setRawShot(shot);
      if (mode === 'area') {
        setStep('cropping');
        return;
      }
      await runOcr(shot);
    } catch (err) {
      const msg = err?.message || 'Screen capture failed.';
      if (/cancel/i.test(msg)) {
        setStep('chooser');
        return;
      }
      setError(msg);
      setStep('error');
    }
  };

  const runOcr = async (shot, cropRect) => {
    setStep('extracting');
    setOcrProgress(0);

    try {
      // 1. Crop (if region selected)
      let working = shot;
      if (cropRect) {
        working = await cropDataUrl(shot.dataUrl, cropRect);
      }

      // 2. Preprocess for better OCR
      const prepped = await preprocessForOcr(working.dataUrl);

      // We store the (cropped, not preprocessed) image for display
      setWorkingShot(working);

      // 3. OCR
      let result;
      try {
        result = await extractTextFromImage(prepped.dataUrl, setOcrProgress);
      } catch (ocrErr) {
        console.warn('OCR failed:', ocrErr);
        result = { text: '', confidence: 0, lines: [] };
      }

      // 4. Cleanup
      let processed = cleanOcrResult(result);

      // 5. Demo safe fallback
      if (demoSafe && (!processed.cleanedText || processed.cleanedText.length < 30)) {
        processed = {
          rawText: DEMO_SAFE_TEXT,
          cleanedText: DEMO_SAFE_TEXT,
          lines: [{ text: DEMO_SAFE_TEXT, confidence: 92 }],
          confidence: 92,
          confidenceLabel: 'high',
          suggestion: null,
          demo: true,
        };
      }

      setCleaned(processed);
      setEditedText(processed.cleanedText);
      setStep('review');
    } catch (err) {
      setError(err?.message || 'Processing failed.');
      setStep('error');
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  /* AI Enhance (simulated — operates only on cleaned text)      */
  /* ─────────────────────────────────────────────────────────── */
  const handleAiEnhance = async () => {
    if (!editedText.trim()) return;
    setEnhancing(true);
    // Simulated enhancement: collapse extra whitespace, fix common OCR errors,
    // strip leftover one-word fragments, and tighten sentences.
    await new Promise((r) => setTimeout(r, 900));
    const improved = editedText
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/\s+/g, ' ')
      .replace(/\s([,.;:!?])/g, '$1')
      .replace(/\b(I|i)\s+\b/g, 'I ')
      .replace(/(?:^|\n)\s*[a-z]{1,3}\s*(?=\n|$)/g, '') // stray short fragments
      .replace(/\s{2,}/g, ' ')
      .trim();
    setEditedText(improved);
    setEnhancing(false);
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Submit                                                      */
  /* ─────────────────────────────────────────────────────────── */
  const submitCaptured = () => {
    const t = editedText.trim();
    if (t) onConfirm(t);
  };
  const submitManual = () => {
    const t = manualText.trim();
    if (t) onConfirm(t);
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Header                                                      */
  /* ─────────────────────────────────────────────────────────── */
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
    if (step === 'cropping') {
      return (
        <div>
          <p className="font-semibold text-white text-sm leading-tight">Select area to analyze</p>
          <p className="text-[11px] text-slate-500">Drag a rectangle around the important content</p>
        </div>
      );
    }
    if (step === 'review') {
      return (
        <div className="flex items-center gap-2.5">
          <span className="text-emerald-400 text-sm font-semibold">Captured</span>
          <p className="text-[11px] text-slate-500">Review the result, then analyze</p>
        </div>
      );
    }
    if (step === 'error') {
      return (
        <div className="flex items-center gap-2.5">
          <p className="font-semibold text-white text-sm leading-tight">Capture failed</p>
        </div>
      );
    }
    return (
      <div>
        <p className="font-semibold text-white text-sm leading-tight">Analyze Screen</p>
        <p className="text-[11px] text-slate-500">Capture content from your screen</p>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────── */
  /* Render — body                                               */
  /* ─────────────────────────────────────────────────────────── */
  const body = (() => {
    if (step === 'chooser') {
      return (
        <>
          {/* Two capture options */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => startCapture('full')}
              disabled={!captureSupported}
              className="flex flex-col items-start gap-1.5 px-3.5 py-3 rounded-xl text-left transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${cfg.hex.accent}d9, ${cfg.hex.accent})`,
                color: '#fff',
                boxShadow: `0 4px 18px ${cfg.hex.accent}30`,
              }}
            >
              <SquareIcon name="monitor" />
              <p className="font-semibold text-sm leading-tight">Analyze Full Screen</p>
              <p className="text-[11px] opacity-85 leading-snug">Capture an entire screen</p>
            </button>
            <button
              onClick={() => startCapture('area')}
              disabled={!captureSupported}
              className="flex flex-col items-start gap-1.5 px-3.5 py-3 rounded-xl text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#1E293B',
                color: '#E2E8F0',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#293548'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1E293B'; }}
            >
              <SquareIcon name="crop" />
              <p className="font-semibold text-sm leading-tight">Select Area to Analyze</p>
              <p className="text-[11px] opacity-70 leading-snug">More accurate on busy screens</p>
            </button>
          </div>

          {/* Ethics note */}
          <div
            className="rounded-lg p-3 flex items-start gap-2"
            style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}
          >
            <span className="text-emerald-400 mt-0.5 flex-shrink-0"><SquareIcon name="lock" size={12} /></span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your OS shows a picker. ClearPath only captures the surface you pick,
              only when you click. Nothing runs in the background.
            </p>
          </div>

          {!captureSupported && (
            <div
              className="rounded-lg p-3 text-[11px] text-amber-300 leading-relaxed"
              style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}
            >
              Screen capture is not supported in this build. Use the fallback below.
            </div>
          )}

          {/* Fallback */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] text-slate-600 uppercase tracking-widest">
              {captureSupported ? 'Or fallback' : 'Manual entry'}
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Type or paste text
            </p>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Type or paste text manually."
              className="w-full rounded-xl px-3 py-2.5 text-sm leading-relaxed placeholder-slate-600 resize-none focus:outline-none"
              style={{
                background: '#1E293B',
                color: '#E2E8F0',
                border: '1px solid rgba(255,255,255,0.06)',
                minHeight: 72,
                maxHeight: 120,
              }}
            />
            <div className="flex items-center justify-between mt-1">
              {sampleText ? (
                <button
                  onClick={() => setManualText(sampleText)}
                  className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
                >
                  Use sample text
                </button>
              ) : <span />}
              {manualText && (
                <span className="text-[10px] text-slate-700">
                  {manualText.split(/\s+/).filter(Boolean).length} words
                </span>
              )}
            </div>
          </div>

          {/* Demo safe toggle */}
          <div className="flex items-center justify-between rounded-lg px-3 py-2"
            style={{ background: '#0e1726', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div>
              <p className="text-[12px] font-semibold text-slate-300">Demo Safe Mode</p>
              <p className="text-[10px] text-slate-500 leading-snug">If OCR fails, use a known-good sample</p>
            </div>
            <Toggle on={demoSafe} onChange={setDemoSafe} accent={cfg.hex.accent} />
          </div>
        </>
      );
    }

    if (step === 'capturing') {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <SquareIcon name="monitor" size={26} />
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

    if (step === 'cropping') {
      return (
        <CropStep
          shot={rawShot}
          onUseFull={() => runOcr(rawShot)}
          onSelect={(rect) => runOcr(rawShot, rect)}
        />
      );
    }

    if (step === 'extracting') {
      return (
        <div className="space-y-4">
          {workingShot && (
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <img src={workingShot.dataUrl} alt="" className="w-full h-32 object-cover" />
            </div>
          )}
          <div>
            <p className="text-white font-semibold text-sm mb-2 text-center">
              Reading text from screen.
            </p>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#1E293B' }}>
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{ width: `${Math.round(ocrProgress * 100)}%`, background: cfg.hex.accent }}
              />
            </div>
            <p className="text-slate-500 text-[11px] mt-2 text-center">
              {Math.round(ocrProgress * 100)}% complete. OCR runs locally.
            </p>
          </div>
        </div>
      );
    }

    if (step === 'review') {
      const conf = cleaned?.confidenceLabel || 'low';
      const confColor =
        conf === 'high'   ? '#4ADE80'
        : conf === 'medium' ? '#FBBF24'
                            : '#F87171';
      const confLabel =
        conf === 'high'   ? 'High confidence'
        : conf === 'medium' ? 'Medium confidence'
                            : 'Low confidence';
      return (
        <div className="space-y-4">
          {workingShot && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Captured screen
                </p>
                <button
                  onClick={() => reset('chooser')}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Re-capture
                </button>
              </div>
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <img src={workingShot.dataUrl} alt="Captured screen" className="w-full h-28 object-cover" />
              </div>
            </div>
          )}

          {/* Confidence badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-2 h-2 rounded-full" style={{ background: confColor }} />
              <span style={{ color: confColor }} className="font-semibold">{confLabel}</span>
              {cleaned?.demo && (
                <span className="text-[10px] text-slate-500 font-mono">(demo)</span>
              )}
            </div>
            {cleaned?.suggestion && conf !== 'high' && (
              <button
                onClick={() => reset('chooser')}
                className="text-[10px] text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors"
              >
                Select smaller area
              </button>
            )}
          </div>
          {cleaned?.suggestion && (
            <p className="text-[11px] text-slate-500 leading-relaxed -mt-2">
              {cleaned.suggestion}
            </p>
          )}

          {/* Cleaned text (editable) */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Cleaned content
            </p>
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              placeholder={editedText ? '' : 'No readable text was extracted. Type here to override.'}
              className="w-full rounded-xl px-3 py-2.5 text-sm leading-relaxed placeholder-slate-600 resize-none focus:outline-none"
              style={{
                background: '#1E293B',
                color: '#E2E8F0',
                border: `1px solid ${cfg.hex.accent}30`,
                minHeight: 90,
                maxHeight: 160,
              }}
            />
            <div className="flex items-center justify-between mt-1">
              <button
                onClick={handleAiEnhance}
                disabled={!editedText.trim() || enhancing}
                className="text-[11px] font-medium transition-colors disabled:opacity-40"
                style={{ color: cfg.hex.accent }}
              >
                {enhancing ? 'Improving.' : 'Improve with AI'}
              </button>
              {editedText && (
                <span className="text-[10px] text-slate-700">
                  {editedText.split(/\s+/).filter(Boolean).length} words
                </span>
              )}
            </div>
          </div>

          {/* Collapsible raw OCR */}
          {cleaned?.rawText && cleaned.rawText !== cleaned.cleanedText && (
            <details
              className="rounded-lg"
              style={{ background: '#0e1726', border: '1px solid rgba(255,255,255,0.04)' }}
              open={showRaw}
              onToggle={(e) => setShowRaw(e.currentTarget.open)}
            >
              <summary className="cursor-pointer px-3 py-2 text-[11px] text-slate-400 hover:text-slate-200 transition-colors select-none">
                View extracted text (unfiltered)
              </summary>
              <div
                className="px-3 pb-3 pt-0 text-[11px] text-slate-500 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
              >
                {cleaned.rawText}
              </div>
            </details>
          )}
        </div>
      );
    }

    /* error */
    return (
      <div className="space-y-4">
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <p className="font-semibold text-red-300 text-sm mb-1">Capture failed</p>
          <p className="text-[12px] text-slate-400 leading-relaxed">{error}</p>
        </div>
        <button
          onClick={() => reset('chooser')}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: cfg.hex.accent, color: '#fff' }}
        >
          Try again
        </button>
      </div>
    );
  })();

  /* ─────────────────────────────────────────────────────────── */
  /* Render — wrapper                                            */
  /* ─────────────────────────────────────────────────────────── */
  const busy = step === 'capturing' || step === 'extracting';

  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ background: '#0B1120' }}>
      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {renderHeader()}
        <button
          onClick={onCancel}
          disabled={busy}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <SquareIcon name="x" size={12} />
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
          disabled={busy}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: '#1E293B', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Cancel
        </button>

        {step === 'chooser' && (
          <button
            onClick={submitManual}
            disabled={!manualText.trim()}
            className="flex-[2] py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: cfg.hex.accent, color: '#fff' }}
          >
            Enter Diagnose Mode →
          </button>
        )}

        {step === 'review' && (
          <button
            onClick={submitCaptured}
            disabled={!editedText.trim()}
            className="flex-[2] py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: cfg.hex.accent, color: '#fff' }}
          >
            Enter Diagnose Mode →
          </button>
        )}

        {busy && (
          <div
            className="flex-[2] py-2.5 rounded-xl text-sm font-semibold text-center"
            style={{ background: '#1E293B', color: '#64748B', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            Working.
          </div>
        )}

        {step === 'error' && <div className="flex-[2]" />}
        {step === 'cropping' && <div className="flex-[2]" />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Crop step                                                   */
/* ─────────────────────────────────────────────────────────── */
function CropStep({ shot, onUseFull, onSelect }) {
  const wrapRef = useRef(null);
  const [drag,   setDrag]   = useState(null);

  const onPointerDown = (e) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top)  / rect.height));
    setDrag({ x0: x, y0: y, x1: x, y1: y });
    wrapRef.current.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top)  / rect.height));
    setDrag(d => ({ ...d, x1: x, y1: y }));
  };

  const rectNorm = drag && {
    x: Math.min(drag.x0, drag.x1),
    y: Math.min(drag.y0, drag.y1),
    w: Math.abs(drag.x1 - drag.x0),
    h: Math.abs(drag.y1 - drag.y0),
  };
  const hasSelection = rectNorm && rectNorm.w > 0.04 && rectNorm.h > 0.04;

  /* Corner handle positions */
  const corners = hasSelection ? [
    { left: `${rectNorm.x * 100}%`,               top: `${rectNorm.y * 100}%`,                           tl: true },
    { left: `${(rectNorm.x + rectNorm.w) * 100}%`, top: `${rectNorm.y * 100}%`,                           tr: true },
    { left: `${rectNorm.x * 100}%`,               top: `${(rectNorm.y + rectNorm.h) * 100}%`,             bl: true },
    { left: `${(rectNorm.x + rectNorm.w) * 100}%`, top: `${(rectNorm.y + rectNorm.h) * 100}%`,            br: true },
  ] : [];

  return (
    <div className="space-y-3">
      {/* Instructions */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <span className="text-slate-400 text-base">✂️</span>
        <p className="text-[11px] text-slate-400 leading-snug">
          {hasSelection
            ? 'Selection ready. Adjust or click Analyze Selected Area.'
            : 'Drag on the screenshot to select the content you want analyzed.'}
        </p>
      </div>

      {/* Screenshot canvas */}
      <div
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className="relative w-full rounded-xl overflow-hidden border touch-none select-none"
        style={{
          borderColor: hasSelection ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)',
          aspectRatio: shot ? `${shot.width} / ${shot.height}` : '16/9',
          background:  '#000',
          cursor:      'crosshair',
          minHeight:   140,
          boxShadow:   hasSelection ? '0 0 0 1px rgba(99,102,241,0.3)' : 'none',
          transition:  'border-color 0.2s, box-shadow 0.2s',
        }}
      >
        {shot && (
          <img src={shot.dataUrl} alt="" draggable={false}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
        )}

        {hasSelection && (
          <>
            {/* Dim outside selection */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: 'rgba(0,0,0,0.55)',
                clipPath: `polygon(
                  0 0, 100% 0, 100% 100%, 0 100%, 0 0,
                  ${rectNorm.x * 100}% ${rectNorm.y * 100}%,
                  ${rectNorm.x * 100}% ${(rectNorm.y + rectNorm.h) * 100}%,
                  ${(rectNorm.x + rectNorm.w) * 100}% ${(rectNorm.y + rectNorm.h) * 100}%,
                  ${(rectNorm.x + rectNorm.w) * 100}% ${rectNorm.y * 100}%,
                  ${rectNorm.x * 100}% ${rectNorm.y * 100}%
                )`,
              }} />

            {/* Selection border */}
            <div className="absolute pointer-events-none"
              style={{
                left:      `${rectNorm.x * 100}%`,
                top:       `${rectNorm.y * 100}%`,
                width:     `${rectNorm.w * 100}%`,
                height:    `${rectNorm.h * 100}%`,
                border:    '2px solid #6366F1',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(99,102,241,0.3)',
              }} />

            {/* Corner handles */}
            {corners.map((c, i) => (
              <div key={i} className="absolute pointer-events-none w-3 h-3 rounded-sm"
                style={{
                  left:       c.left,
                  top:        c.top,
                  transform:  `translate(${c.tr || c.br ? '-100%' : '0'}, ${c.bl || c.br ? '-100%' : '0'})`,
                  background: '#6366F1',
                  boxShadow:  '0 0 4px rgba(99,102,241,0.8)',
                }} />
            ))}
          </>
        )}

        {/* Crosshair hint when no selection */}
        {!hasSelection && !drag && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 opacity-30">
              <span className="text-3xl">⊹</span>
              <span className="text-[10px] text-white font-medium tracking-widest uppercase">Drag to select</span>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {hasSelection && (
          <button onClick={() => setDrag(null)}
            className="py-2.5 px-3.5 rounded-xl text-sm font-semibold transition-colors flex-shrink-0"
            style={{ background: '#1E293B', color: '#64748B', border: '1px solid rgba(255,255,255,0.06)' }}>
            Reset
          </button>
        )}
        <button onClick={onUseFull}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: '#1E293B', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>
          Use Full Screen
        </button>
        <button onClick={() => onSelect(rectNorm)} disabled={!hasSelection}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: hasSelection ? '#6366F1' : '#1E293B', color: '#fff',
                   boxShadow: hasSelection ? '0 4px 16px rgba(99,102,241,0.4)' : 'none' }}>
          Analyze Selected Area
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Small inline icons                                          */
/* ─────────────────────────────────────────────────────────── */
function SquareIcon({ name, size = 14 }) {
  const base = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.5,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (name) {
    case 'monitor':
      return (<svg {...base}><rect x="3" y="5" width="18" height="12" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>);
    case 'crop':
      return (<svg {...base}><path d="M6 3v14a1 1 0 0 0 1 1h14" /><path d="M3 6h14a1 1 0 0 1 1 1v14" /></svg>);
    case 'lock':
      return (<svg {...base}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 1 1 8 0v4" /></svg>);
    case 'x':
      return (<svg {...base}><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>);
    default: return null;
  }
}

/* ─────────────────────────────────────────────────────────── */
/* Toggle                                                      */
/* ─────────────────────────────────────────────────────────── */
function Toggle({ on, onChange, accent }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="w-9 h-5 rounded-full relative transition-colors flex-shrink-0"
      style={{ background: on ? accent : '#334155' }}
      aria-pressed={on}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
        style={{ left: on ? '18px' : '2px' }}
      />
    </button>
  );
}
