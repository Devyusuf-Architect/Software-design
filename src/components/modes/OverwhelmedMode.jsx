import { useState } from 'react';
import { splitIntoParagraphs } from '../../utils/textProcessing';

export default function OverwhelmedMode({ text, config }) {
  const chunks = splitIntoParagraphs(text);
  const total = chunks.length;
  const [index, setIndex] = useState(0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-violet-400 text-lg">No content to display yet.</p>
      </div>
    );
  }

  const goNext = () => setIndex(i => Math.min(i + 1, total - 1));
  const goPrev = () => setIndex(i => Math.max(i - 1, 0));

  const progressPct = total > 1 ? (index / (total - 1)) * 100 : 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] max-w-2xl mx-auto px-6 py-8">

      {/* Breathing indicator — subtle, purposeful */}
      <div className="mb-6 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-violet-300 breathe" />
        <p className="text-violet-400 text-sm font-medium">{config.prompt}</p>
      </div>

      {/* Content card */}
      <div
        key={index}
        className="bg-white border border-violet-100 rounded-3xl px-10 py-10 w-full shadow-sm"
        style={{ animation: 'fadeSlideIn 0.35s ease forwards' }}
      >
        <p className="text-2xl text-violet-900 leading-loose font-light text-center">
          {chunks[index]}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-5 mt-8">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="px-6 py-3 rounded-xl border-2 border-violet-200 text-violet-700 font-medium text-sm disabled:opacity-30 hover:bg-violet-50 transition-all duration-200"
        >
          ← Previous
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {chunks.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === index
                  ? 'bg-violet-500 w-6 h-2'
                  : i < index
                    ? 'bg-violet-300 w-2 h-2'
                    : 'bg-violet-100 w-2 h-2'
              }`}
              aria-label={`Go to section ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={index === total - 1}
          className="px-6 py-3 rounded-xl bg-violet-500 text-white font-medium text-sm disabled:opacity-30 hover:bg-violet-600 transition-all duration-200 shadow-md shadow-violet-200"
        >
          Next →
        </button>
      </div>

      {/* Progress text + bar */}
      <div className="mt-5 w-full max-w-xs">
        <div className="flex justify-between text-xs text-violet-300 mb-1.5">
          <span>Section {index + 1} of {total}</span>
          <span>{Math.round(progressPct)}% read</span>
        </div>
        <div className="h-1 bg-violet-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
