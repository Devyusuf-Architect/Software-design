import { removeUrgencyLanguage, splitIntoParagraphs } from '../../utils/textProcessing';

export default function AnxiousMode({ text, config, onModeChange }) {
  const cleanText = removeUrgencyLanguage(text);
  const paragraphs = splitIntoParagraphs(cleanText);

  return (
    <div className="max-w-2xl mx-auto px-6 pb-10">

      {/* Safety strip */}
      <div className="flex items-center justify-between p-4 mb-7 bg-teal-100 rounded-2xl border border-teal-200">
        <div>
          <p className="text-teal-800 font-semibold text-sm">You are safe here</p>
          <p className="text-teal-600 text-xs mt-0.5">
            This content is calm and predictable. Nothing unexpected will happen.
          </p>
        </div>
        <button
          onClick={() => onModeChange('calm')}
          className="ml-4 flex-shrink-0 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors duration-200 shadow-sm"
        >
          Exit to safety →
        </button>
      </div>

      {/* Gentle prompt */}
      <p className="text-teal-600 text-sm italic mb-6">{config.prompt}</p>

      {/* Content — clean, no formatting surprises */}
      <div className="space-y-5">
        {paragraphs.map((para, i) => (
          <p
            key={i}
            className="text-base text-teal-900 leading-relaxed"
            style={{ animation: `gentleFadeIn ${0.3 + i * 0.08}s ease both` }}
          >
            {para}
          </p>
        ))}
      </div>

      {/* Predictable footer navigation */}
      <div className="mt-10 pt-6 border-t border-teal-100">
        <div className="flex items-center justify-between text-xs text-teal-300">
          <p>Anxious Mode — calm, predictable, no surprises</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-teal-400 hover:text-teal-600 transition-colors"
          >
            Back to top ↑
          </button>
        </div>
      </div>

      <style>{`
        @keyframes gentleFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
