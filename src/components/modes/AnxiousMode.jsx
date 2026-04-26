import { useMemo } from 'react';
import {
  removeUrgencyLanguage, tokeniseParagraphs, getReadingTime, getWordCount,
  splitIntoSections,
} from '../../utils/contentTransformer';
import GuidancePrompt from '../ui/GuidancePrompt';

export default function AnxiousMode({ text, config, onModeChange }) {
  const cleanText  = useMemo(() => removeUrgencyLanguage(text), [text]);
  const paragraphs = useMemo(() => tokeniseParagraphs(cleanText), [cleanText]);
  const sections   = useMemo(() => splitIntoSections(cleanText), [cleanText]);
  const readTime   = getReadingTime(cleanText);
  const wordCount  = getWordCount(cleanText);

  return (
    <div className="max-w-2xl mx-auto px-6 pb-10">

      {/* What to expect — shown upfront to reduce anxiety */}
      <div className="p-4 bg-teal-100 rounded-2xl border border-teal-200 mb-7">
        <p className="text-teal-700 font-semibold text-sm mb-2">What to expect on this page</p>
        <ul className="space-y-1.5">
          <li className="flex items-center gap-2 text-teal-600 text-sm">
            <span className="w-4 h-4 rounded-full bg-teal-300 flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>
            About {readTime} to read ({wordCount} words)
          </li>
          <li className="flex items-center gap-2 text-teal-600 text-sm">
            <span className="w-4 h-4 rounded-full bg-teal-300 flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>
            {sections.length} {sections.length === 1 ? 'section' : 'sections'} — no pop-ups, no auto-play
          </li>
          <li className="flex items-center gap-2 text-teal-600 text-sm">
            <span className="w-4 h-4 rounded-full bg-teal-300 flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>
            Urgency language has been removed
          </li>
        </ul>
        {/* Exit button — always in the same place */}
        <div className="mt-3 pt-3 border-t border-teal-200 flex items-center justify-between">
          <GuidancePrompt mode="anxious" index={0} className="text-teal-500" />
          <button
            onClick={() => onModeChange('calm')}
            className="flex-shrink-0 ml-4 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors duration-200 shadow-sm"
          >
            Exit to safety →
          </button>
        </div>
      </div>

      {/* Section map (shows structure upfront — reduces uncertainty) */}
      {sections.length > 1 && (
        <div className="mb-6 p-3 bg-teal-50 border border-teal-100 rounded-xl">
          <p className="text-[10px] text-teal-400 uppercase tracking-widest font-bold mb-2">Page structure</p>
          <ol className="space-y-1">
            {sections.map((sec, i) => (
              <li key={sec.id} className="flex items-start gap-2 text-xs text-teal-600">
                <span className="text-teal-300 font-mono mt-0.5">{i + 1}.</span>
                <a
                  href={`#anxious-section-${sec.id}`}
                  className="hover:underline hover:text-teal-800 transition-colors"
                >
                  {sec.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Content — gentle, no unexpected formatting */}
      <div className="space-y-6">
        {sections.map((sec, i) => (
          <div
            key={sec.id}
            id={`anxious-section-${sec.id}`}
            style={{ animation: `gentleFadeIn ${0.3 + i * 0.07}s ease both` }}
          >
            {sections.length > 1 && (
              <p className="text-[10px] text-teal-300 uppercase tracking-widest font-bold mb-2">
                Section {i + 1} of {sections.length}
              </p>
            )}
            <p className="text-base text-teal-900 leading-relaxed">{sec.content}</p>
          </div>
        ))}
      </div>

      {/* Predictable footer — always in the same place */}
      <div className="mt-10 pt-5 border-t border-teal-100">
        <div className="flex items-center justify-between">
          <p className="text-xs text-teal-300">
            Anxious Mode · calm · predictable · no surprises
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs text-teal-400 hover:text-teal-600 transition-colors"
            >
              Back to top ↑
            </button>
            <button
              onClick={() => onModeChange('calm')}
              className="text-xs px-3 py-1.5 bg-teal-100 text-teal-600 hover:bg-teal-200 rounded-lg transition-colors font-medium"
            >
              Exit to safety →
            </button>
          </div>
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
