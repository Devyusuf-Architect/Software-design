import { useState, useEffect, useRef, useCallback } from 'react';
import { lookupWord } from '../../data/wordDictionary';

export default function WordDefinitionPopup({ containerRef }) {
  const [popup, setPopup]   = useState(null); // { word, def, x, y }
  const popupRef            = useRef(null);

  const dismiss = useCallback(() => setPopup(null), []);

  useEffect(() => {
    const handleMouseUp = (e) => {
      // Don't open if clicking inside the popup itself
      if (popupRef.current && popupRef.current.contains(e.target)) return;

      const selection = window.getSelection();
      if (!selection) return;

      const raw = selection.toString().trim();
      // Only single words (no spaces, length 2–30)
      if (!raw || raw.includes(' ') || raw.length < 2 || raw.length > 30) {
        setPopup(null);
        return;
      }

      const def = lookupWord(raw);
      if (!def) { setPopup(null); return; }

      const range = selection.getRangeAt(0);
      const rect  = range.getBoundingClientRect();

      // Position popup above the word, clamped to viewport
      const x = Math.min(
        Math.max(rect.left + rect.width / 2, 160),
        window.innerWidth - 160
      );
      const y = rect.top + window.scrollY - 12;

      setPopup({ word: raw, def, x, y });
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') dismiss();
    };

    const target = containerRef?.current ?? document;
    target.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      target.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, dismiss]);

  // Close when clicking outside the popup
  useEffect(() => {
    if (!popup) return;
    const handleClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) dismiss();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [popup, dismiss]);

  if (!popup) return null;

  return (
    <div
      ref={popupRef}
      role="tooltip"
      aria-live="polite"
      style={{
        position: 'fixed',
        left: popup.x,
        top:  popup.y,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
        animation: 'defPopIn 0.18s cubic-bezier(0.16,1,0.3,1) forwards',
      }}
      className="max-w-[260px] bg-slate-900 text-white rounded-xl shadow-xl px-4 py-3 pointer-events-auto"
    >
      {/* Arrow */}
      <div
        style={{
          position: 'absolute',
          bottom: -6,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #0F172A',
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-1 gap-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest truncate">
          {popup.word}
        </span>
        <button
          onClick={dismiss}
          aria-label="Close definition"
          className="text-slate-400 hover:text-white transition-colors flex-shrink-0 text-sm leading-none"
        >
          ✕
        </button>
      </div>

      {/* Definition */}
      <p className="text-sm text-white leading-snug">{popup.def}</p>

      {/* Hint */}
      <p className="text-[10px] text-slate-500 mt-2">Highlight any word for a plain definition</p>

      <style>{`
        @keyframes defPopIn {
          from { opacity: 0; transform: translate(-50%, calc(-100% + 6px)) scale(0.94); }
          to   { opacity: 1; transform: translate(-50%, -100%) scale(1); }
        }
      `}</style>
    </div>
  );
}
