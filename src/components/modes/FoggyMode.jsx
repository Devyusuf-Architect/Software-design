import { useState, useRef } from 'react';
import { splitIntoSentences, getKeyWordTokens } from '../../utils/textProcessing';
import { useSpeech } from '../../hooks/useSpeech';

export default function FoggyMode({ text, config }) {
  const sentences = splitIntoSentences(text);
  const [readKey, setReadKey] = useState(0);
  const [highlighted, setHighlighted] = useState(null);
  const { speak, stop, isSpeaking, isSupported } = useSpeech();
  const sentenceRefs = useRef([]);

  const handleReadAloud = () => {
    if (isSpeaking) { stop(); return; }
    speak(text, 0.82);
  };

  const handleSentenceSpeak = (sentence, i) => {
    stop();
    setHighlighted(i);
    speak(sentence, 0.82);
  };

  const handleReadAgain = () => {
    stop();
    setHighlighted(null);
    setReadKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (sentences.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-amber-400 text-lg">No content to display yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pb-10">

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2.5 mb-5">
        {isSupported && (
          <button
            onClick={handleReadAloud}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              isSpeaking
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
          >
            {isSpeaking ? '⏹ Stop reading' : '🔊 Read aloud'}
          </button>
        )}
        <button
          onClick={handleReadAgain}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 text-amber-800 hover:bg-amber-200 text-sm font-medium transition-all duration-200"
        >
          🔄 Read again
        </button>
      </div>

      {/* Gentle prompt */}
      <p className="text-amber-600 text-sm italic mb-6">{config.prompt}</p>

      {/* Sentences */}
      <div className="space-y-4" key={readKey}>
        {sentences.map((sentence, i) => {
          const tokens = getKeyWordTokens(sentence);
          const isHighlighted = highlighted === i;
          return (
            <div
              key={i}
              ref={el => sentenceRefs.current[i] = el}
              className={`flex gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                isHighlighted
                  ? 'bg-amber-100 shadow-sm'
                  : 'hover:bg-amber-50'
              }`}
              onClick={() => isSupported && handleSentenceSpeak(sentence, i)}
              title={isSupported ? 'Click to hear this sentence' : undefined}
            >
              <span className="text-amber-300 text-xs font-mono mt-1.5 w-5 text-right flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-lg text-amber-900 leading-loose flex-1">
                {tokens.map((token, j) =>
                  token.bold && !token.isSpace
                    ? <strong key={j} className="font-bold text-amber-800">{token.text}</strong>
                    : <span key={j}>{token.text}</span>
                )}
              </p>
              {isSupported && (
                <span className="text-amber-200 text-sm opacity-0 group-hover:opacity-100 transition-opacity mt-1.5 flex-shrink-0">
                  🔊
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Helper note */}
      <p className="text-xs text-amber-300 mt-6 text-center">
        {isSupported ? 'Click any sentence to hear it · Bold words are key ideas' : 'Bold words are key ideas to focus on'}
      </p>
    </div>
  );
}
