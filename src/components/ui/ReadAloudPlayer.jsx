import { useSpeech } from '../../hooks/useSpeech';

// Renders text with the currently-spoken word highlighted.
function HighlightedText({ text, charIndex, highlightBg }) {
  if (charIndex < 0 || charIndex >= text.length) return <>{text}</>;

  const before    = text.slice(0, charIndex);
  const remainder = text.slice(charIndex);
  const wordEnd   = remainder.search(/\s|$/);
  const word      = remainder.slice(0, wordEnd < 0 ? undefined : wordEnd);
  const after     = text.slice(charIndex + word.length);

  return (
    <>
      {before}
      <mark className={`${highlightBg} rounded px-0.5 font-bold not-italic text-inherit`}>{word}</mark>
      {after}
    </>
  );
}

export default function ReadAloudPlayer({
  text,
  rate          = 0.85,
  buttonClass   = 'bg-slate-100 text-slate-600 hover:bg-slate-200',
  activeClass   = 'bg-indigo-500 text-white',
  highlightBg   = 'bg-yellow-200',
  showHighlight = false,   // if true, renders the text with word highlight below buttons
  textClass     = 'text-slate-800',
}) {
  const { toggle, stop, isSpeaking, isPaused, charIndex, isSupported } = useSpeech();

  if (!isSupported) return null;

  const label = !isSpeaking ? '▶ Read aloud'
    : isPaused             ? '▶ Resume'
    :                        '⏸ Pause';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => toggle(text, rate)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm ${
            isSpeaking && !isPaused ? activeClass : buttonClass
          }`}
        >
          {label}
        </button>
        {isSpeaking && (
          <button
            onClick={stop}
            className="text-sm text-slate-400 hover:text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ⏹ Stop
          </button>
        )}
        {isSpeaking && (
          <span className="text-xs text-slate-400 animate-pulse">Now reading…</span>
        )}
      </div>

      {showHighlight && isSpeaking && (
        <div className={`p-4 rounded-xl bg-white/60 border border-slate-200 text-sm leading-relaxed ${textClass}`}>
          <HighlightedText text={text} charIndex={charIndex} highlightBg={highlightBg} />
        </div>
      )}
    </div>
  );
}
