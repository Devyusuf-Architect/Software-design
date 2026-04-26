import { useState, useEffect, useMemo } from 'react';
import { detectSteps } from '../../utils/contentTransformer';
import GuidancePrompt from '../ui/GuidancePrompt';

const MICRO_FEEDBACK = [
  'Nice. Keep going.',
  'One more done. Well done.',
  "You're making real progress.",
  'That took effort. Good work.',
  'Halfway there — you can do this.',
  "Every step counts. You're doing it.",
  'Almost there. One step at a time.',
  'Good. Just keep moving forward.',
];

const VISIBLE_BATCH = 4; // steps shown at once in focused view

export default function StressedMode({ text, config }) {
  const rawSteps = useMemo(() => detectSteps(text), [text]);

  const [steps, setSteps] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('clearpath_stressed_progress') || 'null');
      if (saved && saved.length === rawSteps.length) return saved;
    } catch { /* ignore */ }
    return rawSteps.map((t, i) => ({ id: i, text: t, completed: false }));
  });

  const [showAll,    setShowAll]    = useState(false);
  const [saveFlash,  setSaveFlash]  = useState(false);
  const [lastFeedback, setLastFeedback] = useState('');
  const [feedbackIdx,  setFeedbackIdx]  = useState(0);

  // Reset when text changes
  useEffect(() => {
    const next = rawSteps.map((t, i) => ({ id: i, text: t, completed: false }));
    setSteps(next);
    localStorage.removeItem('clearpath_stressed_progress');
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  const completed = steps.filter(s => s.completed).length;
  const total     = steps.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone   = completed === total && total > 0;

  // In focused view: show the next incomplete step + a few neighbours
  const visibleSteps = showAll ? steps : (() => {
    const nextIdx = steps.findIndex(s => !s.completed);
    const start   = nextIdx < 0 ? Math.max(0, total - VISIBLE_BATCH) : Math.max(0, nextIdx - 1);
    return steps.slice(start, start + VISIBLE_BATCH);
  })();

  const toggleStep = (id) => {
    const wasCompleted = steps.find(s => s.id === id)?.completed;
    setSteps(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
    if (!wasCompleted) {
      const next = MICRO_FEEDBACK[feedbackIdx % MICRO_FEEDBACK.length];
      setLastFeedback(next);
      setFeedbackIdx(i => i + 1);
      setTimeout(() => setLastFeedback(''), 2800);
    }
  };

  const saveProgress = () => {
    localStorage.setItem('clearpath_stressed_progress', JSON.stringify(steps));
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2200);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pb-10">

      {/* Progress header */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-green-700 font-semibold text-sm">
              {completed} of {total} steps · {pct}% done
            </p>
            {lastFeedback && (
              <p className="text-green-500 text-xs mt-0.5 animate-pulse">{lastFeedback}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAll(v => !v)}
              className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 font-medium transition-colors"
            >
              {showAll ? 'Focus view' : 'Show all'}
            </button>
            <button
              onClick={saveProgress}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                saveFlash ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {saveFlash ? '✓ Saved' : '💾 Save'}
            </button>
          </div>
        </div>
        <div className="h-2.5 bg-green-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Guidance */}
      <GuidancePrompt mode="stressed" index={Math.floor(completed / 2)} className="text-green-600 mb-5" />

      {/* Next step banner (focused view) */}
      {!showAll && !allDone && (() => {
        const next = steps.find(s => !s.completed);
        return next ? (
          <div className="mb-4 p-4 bg-green-100 border-2 border-green-300 rounded-2xl">
            <p className="text-[10px] text-green-500 uppercase tracking-widest font-bold mb-1">Next step</p>
            <p className="text-green-900 font-medium text-sm leading-relaxed">{next.text}</p>
          </div>
        ) : null;
      })()}

      {/* Steps list */}
      <div className="space-y-2.5">
        {visibleSteps.map((step, visIdx) => (
          <button
            key={step.id}
            onClick={() => toggleStep(step.id)}
            className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 group ${
              step.completed
                ? 'border-green-200 bg-green-50/50 opacity-60'
                : 'border-green-100 bg-white hover:border-green-300 hover:bg-green-50 hover:shadow-sm'
            }`}
          >
            {/* Circle checkbox */}
            <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200 ${
              step.completed
                ? 'bg-green-400 border-green-400'
                : 'border-green-300 group-hover:border-green-500'
            }`}>
              {step.completed && <span className="text-white text-xs font-bold check-animate">✓</span>}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-green-300 font-mono font-bold uppercase tracking-wider">
                Step {step.id + 1}
              </span>
              <p className={`text-green-900 text-sm mt-0.5 leading-relaxed ${step.completed ? 'line-through text-green-400' : ''}`}>
                {step.text}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Show more / less */}
      {!showAll && steps.length > VISIBLE_BATCH && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full py-3 rounded-2xl border border-dashed border-green-200 text-green-500 text-sm hover:border-green-300 hover:bg-green-50 transition-all"
        >
          Show all {total} steps →
        </button>
      )}

      {/* All done */}
      {allDone && (
        <div className="mt-6 p-5 bg-green-100 border border-green-200 rounded-2xl text-center">
          <p className="text-2xl mb-2">🌱</p>
          <p className="text-green-700 font-semibold">Every step is done. That took real effort — well done.</p>
        </div>
      )}
    </div>
  );
}
