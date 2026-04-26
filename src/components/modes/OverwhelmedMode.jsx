import { useState, useEffect } from 'react';
import { splitIntoSections } from '../../utils/contentTransformer';
import GuidancePrompt from '../ui/GuidancePrompt';

const BREATHE_PHASES = [
  { label: 'Breathe in…',  duration: 4000, scale: 1.35 },
  { label: 'Hold…',        duration: 2000, scale: 1.35 },
  { label: 'Breathe out…', duration: 5000, scale: 1.0  },
];

function BreathingGuide({ onClose }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase(p => (p + 1) % BREATHE_PHASES.length), BREATHE_PHASES[phase].duration);
    return () => clearTimeout(t);
  }, [phase]);

  const { label, scale } = BREATHE_PHASES[phase];

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12">
      <div
        className="w-28 h-28 rounded-full bg-violet-200 border-4 border-violet-300 flex items-center justify-center"
        style={{ transform: `scale(${scale})`, transition: `transform ${BREATHE_PHASES[phase].duration}ms ease-in-out` }}
      />
      <p className="text-violet-500 text-xl font-light tracking-wide">{label}</p>
      <button
        onClick={onClose}
        className="text-sm text-violet-400 hover:text-violet-600 underline underline-offset-2 transition-colors"
      >
        I'm ready to continue
      </button>
    </div>
  );
}

export default function OverwhelmedMode({ text, config, onSectionChange }) {
  const sections = splitIntoSections(text);
  const total    = sections.length;
  const [index,    setIndex]    = useState(0);
  const [showBreath, setShowBreath] = useState(false);

  useEffect(() => { onSectionChange?.(index); }, [index, onSectionChange]);

  if (total === 0) return (
    <div className="flex items-center justify-center min-h-96">
      <p className="text-violet-400">Paste some text to get started.</p>
    </div>
  );

  const pct = total > 1 ? Math.round((index / (total - 1)) * 100) : 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] max-w-2xl mx-auto px-6 py-8">

      {showBreath ? (
        <BreathingGuide onClose={() => setShowBreath(false)} />
      ) : (
        <>
          {/* Guidance */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-violet-300 breathe flex-shrink-0" />
            <GuidancePrompt mode="overwhelmed" index={index} className="text-violet-500 text-sm" />
          </div>

          {/* Section card */}
          <div
            key={index}
            className="bg-white border border-violet-100 rounded-3xl px-10 py-10 w-full shadow-sm"
            style={{ animation: 'sectionSlide 0.35s ease forwards' }}
          >
            <p className="text-2xl text-violet-900 leading-loose font-light text-center">
              {sections[index].content}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-5 mt-8">
            <button
              onClick={() => setIndex(i => Math.max(i - 1, 0))}
              disabled={index === 0}
              className="px-6 py-3 rounded-xl border-2 border-violet-200 text-violet-700 font-medium text-sm disabled:opacity-30 hover:bg-violet-50 transition-all"
            >
              ← Back
            </button>

            {/* Dot nav */}
            <div className="flex gap-1.5">
              {sections.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Section ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === index        ? 'bg-violet-500 w-6 h-2'
                    : i < index        ? 'bg-violet-300 w-2 h-2'
                    :                    'bg-violet-100 w-2 h-2'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setIndex(i => Math.min(i + 1, total - 1))}
              disabled={index === total - 1}
              className="px-6 py-3 rounded-xl bg-violet-500 text-white font-medium text-sm disabled:opacity-30 hover:bg-violet-600 transition-all shadow-md shadow-violet-200"
            >
              Next →
            </button>
          </div>

          {/* Sub-footer */}
          <div className="mt-5 w-full max-w-xs">
            <div className="flex justify-between text-xs text-violet-300 mb-1.5">
              <span>Section {index + 1} of {total}</span>
              <span>{pct}% read</span>
            </div>
            <div className="h-1 bg-violet-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <button
            onClick={() => setShowBreath(true)}
            className="mt-5 text-xs text-violet-300 hover:text-violet-500 transition-colors"
          >
            Need a moment? Try a breathing guide →
          </button>

          {index === total - 1 && (
            <div className="mt-6 p-4 bg-violet-100 rounded-2xl text-center border border-violet-200 w-full">
              <p className="text-violet-700 font-medium text-sm">You've reached the end. That took real focus. Well done.</p>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes sectionSlide {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
