import { useState, useMemo } from 'react';
import {
  tokeniseParagraphs, convertToBullets, generateSummary,
  extractKeyTakeaway, extractKeywords, getWordCount, getReadingTime,
} from '../../utils/contentTransformer';
import KeyTakeaway from '../ui/KeyTakeaway';
import ReadAloudPlayer from '../ui/ReadAloudPlayer';

const FONT_SIZES = { Small: 'text-sm', Base: 'text-base', Large: 'text-lg', XL: 'text-xl' };
const SPACINGS   = { Tight: 'leading-normal', Normal: 'leading-relaxed', Wide: 'leading-loose' };
const VIEWS      = ['Original', 'Bullets', 'Summary'];

export default function CalmMode({ text }) {
  const [fontSize,      setFontSize]      = useState('Base');
  const [spacing,       setSpacing]       = useState('Normal');
  const [view,          setView]          = useState('Original');
  const [showTakeaway,  setShowTakeaway]  = useState(false);
  const [highlightKws,  setHighlightKws]  = useState(false);

  const paragraphs = useMemo(() => tokeniseParagraphs(text), [text]);
  const bullets    = useMemo(() => convertToBullets(text),   [text]);
  const summary    = useMemo(() => generateSummary(text),    [text]);
  const takeaway   = useMemo(() => extractKeyTakeaway(text), [text]);
  const keywords   = useMemo(() => new Set(extractKeywords(text)), [text]);
  const wordCount  = getWordCount(text);
  const readTime   = getReadingTime(text);

  // Highlight keywords in a paragraph
  const renderPara = (para, i) => {
    if (!highlightKws) return <p key={i} className="mb-4">{para}</p>;
    const parts = para.split(/(\s+)/);
    let wIdx = 0;
    return (
      <p key={i} className="mb-4">
        {parts.map((part, j) => {
          if (/^\s+$/.test(part)) return <span key={j}>{part}</span>;
          const clean = part.replace(/[^a-z]/gi, '').toLowerCase();
          const hl = keywords.has(clean);
          wIdx++;
          return hl
            ? <mark key={j} className="bg-indigo-100 text-indigo-800 rounded px-0.5 not-italic font-medium">{part}</mark>
            : <span key={j}>{part}</span>;
        })}
      </p>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-6 pb-10">

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pb-4 mb-5 border-b border-slate-100">
        <span>{wordCount} words</span>
        <span>·</span>
        <span>~{readTime}</span>
        <span>·</span>
        <span>{paragraphs.length} {paragraphs.length === 1 ? 'paragraph' : 'paragraphs'}</span>
      </div>

      {/* Toolbar row 1 — view + takeaway + keywords */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex rounded-lg overflow-hidden border border-slate-200">
          {VIEWS.map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                view === v ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowTakeaway(v => !v)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors duration-150 ${
            showTakeaway ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          💡 Takeaway
        </button>

        <button
          onClick={() => setHighlightKws(v => !v)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors duration-150 ${
            highlightKws ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          ✨ Keywords
        </button>
      </div>

      {/* Toolbar row 2 — font + spacing */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-medium">Size</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-200">
            {Object.keys(FONT_SIZES).map(k => (
              <button key={k} onClick={() => setFontSize(k)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  fontSize === k ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}>{k}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-medium">Spacing</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-200">
            {Object.keys(SPACINGS).map(k => (
              <button key={k} onClick={() => setSpacing(k)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  spacing === k ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}>{k}</button>
            ))}
          </div>
        </div>

        {/* Read aloud (right-aligned) */}
        <div className="ml-auto">
          <ReadAloudPlayer
            text={text}
            rate={0.9}
            buttonClass="bg-slate-100 text-slate-600 hover:bg-slate-200"
            activeClass="bg-indigo-500 text-white"
            highlightBg="bg-indigo-200"
            showHighlight={false}
          />
        </div>
      </div>

      {/* Takeaway */}
      {showTakeaway && (
        <KeyTakeaway text={takeaway} accentLight="bg-indigo-50" accentText="text-indigo-700" border="border-indigo-200" />
      )}

      {/* Content */}
      <div className={`${FONT_SIZES[fontSize]} ${SPACINGS[spacing]} text-slate-800`}>
        {view === 'Original' && (
          paragraphs.length > 0
            ? paragraphs.map(renderPara)
            : <p className="text-slate-400">Paste your own text using the button above.</p>
        )}

        {view === 'Bullets' && (
          <ul className="space-y-2">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-indigo-300 flex-shrink-0 mt-1.5">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {view === 'Summary' && (
          <div className="space-y-4">
            {summary.map((s, i) => (
              <div key={i} className="flex gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                <span className="text-indigo-300 font-mono text-xs mt-1 flex-shrink-0">{i + 1}</span>
                <p>{s}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
