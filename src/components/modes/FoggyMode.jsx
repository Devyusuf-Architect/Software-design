import { useState, useMemo } from 'react';
import { tokeniseSentences, extractKeyTakeaway, extractKeywords, simplifyText } from '../../utils/contentTransformer';
import { useSpeech } from '../../hooks/useSpeech';
import KeyTakeaway from '../ui/KeyTakeaway';
import GuidancePrompt from '../ui/GuidancePrompt';

// Bold the first word and any word matching a keyword
function TokenisedSentence({ sentence, keywords }) {
  const parts = sentence.split(/(\s+)/);
  let wordIdx = 0;
  return (
    <>
      {parts.map((part, i) => {
        const isSpace = /^\s+$/.test(part);
        if (isSpace) return <span key={i}>{part}</span>;
        const clean = part.replace(/[^a-zA-Z]/g, '').toLowerCase();
        const bold  = wordIdx === 0 || clean.length > 5 || keywords.has(clean);
        wordIdx++;
        return bold
          ? <strong key={i} className="font-bold">{part}</strong>
          : <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function FoggyMode({ text, config }) {
  const [simplified,  setSimplified]  = useState(false);
  const [readKey,     setReadKey]     = useState(0);
  const [readSentIdx, setReadSentIdx] = useState(-1);  // index of sentence being read aloud
  const { speak, stop, isSpeaking, charIndex, isSupported } = useSpeech();

  const displayText  = simplified ? simplifyText(text) : text;
  const sentences    = useMemo(() => tokeniseSentences(displayText), [displayText]);
  const takeaway     = useMemo(() => extractKeyTakeaway(displayText), [displayText]);
  const keywordsArr  = useMemo(() => extractKeywords(displayText), [displayText]);
  const keywordsSet  = useMemo(() => new Set(keywordsArr), [keywordsArr]);

  // Map charIndex → sentence index during read-aloud
  const sentencePositions = useMemo(() => {
    let pos = 0;
    return sentences.map(s => {
      const start = displayText.indexOf(s, pos);
      pos = start + s.length;
      return { start, end: pos };
    });
  }, [sentences, displayText]);

  const activeSentIdx = useMemo(() => {
    if (charIndex < 0) return -1;
    return sentencePositions.findIndex(p => charIndex >= p.start && charIndex <= p.end);
  }, [charIndex, sentencePositions]);

  const handleReadAll = () => {
    if (isSpeaking) { stop(); setReadSentIdx(-1); return; }
    speak(displayText, 0.82);
  };

  const handleReadSentence = (s, i) => {
    stop();
    setReadSentIdx(i);
    speak(s, 0.80);
  };

  const handleReadAgain = () => {
    stop();
    setReadKey(k => k + 1);
    setReadSentIdx(-1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pb-10">

      {/* Key takeaway */}
      <KeyTakeaway
        text={takeaway}
        accentLight="bg-amber-100"
        accentText="text-amber-800"
        border="border-amber-200"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2.5 mb-5">
        {isSupported && (
          <button
            onClick={handleReadAll}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isSpeaking
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
          >
            {isSpeaking ? '⏸ Pause' : '▶ Read aloud'}
          </button>
        )}
        <button
          onClick={handleReadAgain}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 text-amber-800 hover:bg-amber-200 text-sm font-semibold transition-all"
        >
          🔄 Read again
        </button>
        <button
          onClick={() => setSimplified(s => !s)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            simplified
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          }`}
        >
          {simplified ? '✓ Simplified' : '✨ Simplify text'}
        </button>
      </div>

      <GuidancePrompt mode="foggy" index={0} className="text-amber-600 mb-6" />

      {/* Sentences */}
      <div className="space-y-3" key={readKey}>
        {sentences.map((sentence, i) => {
          const isActive    = activeSentIdx === i || readSentIdx === i;
          const isCompleted = activeSentIdx > i;
          return (
            <div
              key={i}
              onClick={() => isSupported && handleReadSentence(sentence, i)}
              className={`group flex gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive    ? 'bg-amber-100 shadow-sm ring-2 ring-amber-300'
                : isCompleted ? 'opacity-60 hover:opacity-100 hover:bg-amber-50'
                :               'hover:bg-amber-50'
              }`}
              title={isSupported ? 'Click to hear this sentence' : undefined}
            >
              {/* Number */}
              <span className={`text-xs font-mono mt-1.5 w-5 text-right flex-shrink-0 transition-colors ${
                isActive ? 'text-amber-500 font-bold' : 'text-amber-200'
              }`}>
                {i + 1}
              </span>

              {/* Text */}
              <p className="text-lg text-amber-900 leading-loose flex-1">
                <TokenisedSentence sentence={sentence} keywords={keywordsSet} />
              </p>

              {/* Re-read button */}
              {isSupported && (
                <button
                  onClick={e => { e.stopPropagation(); handleReadSentence(sentence, i); }}
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 mt-1.5 text-amber-300 hover:text-amber-600 text-sm transition-all"
                  title="Re-read this sentence"
                >
                  🔊
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Keywords strip */}
      {keywordsArr.length > 0 && (
        <div className="mt-8 pt-5 border-t border-amber-100">
          <p className="text-[10px] text-amber-300 uppercase tracking-widest font-bold mb-2">Key words in this content</p>
          <div className="flex flex-wrap gap-2">
            {keywordsArr.slice(0, 8).map(kw => (
              <span key={kw} className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">{kw}</span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-amber-300 mt-4 text-center">
        {isSupported ? 'Click any sentence to hear it · Bold words are key ideas' : 'Bold words are key ideas to focus on'}
      </p>
    </div>
  );
}
