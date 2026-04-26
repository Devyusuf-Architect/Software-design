import { useState } from 'react';
import { splitIntoParagraphs } from '../../utils/textProcessing';
import { useSpeech } from '../../hooks/useSpeech';

const FONT_SIZES = { Small: 'text-sm', Base: 'text-base', Large: 'text-lg', XLarge: 'text-xl' };
const SPACINGS   = { Tight: 'leading-normal', Normal: 'leading-relaxed', Wide: 'leading-loose' };

export default function CalmMode({ text, config }) {
  const [fontSize, setFontSize]   = useState('Base');
  const [spacing, setSpacing]     = useState('Normal');
  const { speak, stop, isSpeaking, isSupported } = useSpeech();
  const paragraphs = splitIntoParagraphs(text);

  return (
    <div className="max-w-3xl mx-auto px-6 pb-10">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 pb-5 mb-6 border-b border-slate-100">

        {/* Font size */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Text size</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-200">
            {Object.keys(FONT_SIZES).map(key => (
              <button
                key={key}
                onClick={() => setFontSize(key)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  fontSize === key
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Line spacing */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Spacing</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-200">
            {Object.keys(SPACINGS).map(key => (
              <button
                key={key}
                onClick={() => setSpacing(key)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  spacing === key
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Read aloud */}
        {isSupported && (
          <button
            onClick={() => isSpeaking ? stop() : speak(text, 0.9)}
            className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
              isSpeaking
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isSpeaking ? '⏹ Stop' : '🔊 Read aloud'}
          </button>
        )}
      </div>

      {/* Prompt */}
      <p className="text-slate-400 text-sm italic mb-6">{config.prompt}</p>

      {/* Full content */}
      <div className={`space-y-4 ${FONT_SIZES[fontSize]} ${SPACINGS[spacing]} text-slate-800`}>
        {paragraphs.length > 0
          ? paragraphs.map((para, i) => <p key={i}>{para}</p>)
          : <p className="text-slate-400">Paste your own text using the button above to get started.</p>
        }
      </div>
    </div>
  );
}
