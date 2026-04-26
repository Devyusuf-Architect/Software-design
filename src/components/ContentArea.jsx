import { useState, useEffect, useRef } from 'react';
import { modeConfigs } from '../utils/modeConfigs';
import {
  simplifyText, convertToBullets, generateSummary, tokeniseParagraphs,
} from '../utils/contentTransformer';
import OverwhelmedMode from './modes/OverwhelmedMode';
import FoggyMode       from './modes/FoggyMode';
import AnxiousMode     from './modes/AnxiousMode';
import StressedMode    from './modes/StressedMode';
import CalmMode        from './modes/CalmMode';

const MODE_COMPONENTS = {
  overwhelmed: OverwhelmedMode,
  foggy:       FoggyMode,
  anxious:     AnxiousMode,
  stressed:    StressedMode,
  calm:        CalmMode,
};

const TRANSFORM_OPTIONS = [
  { id: 'original',   label: 'Original',  icon: '📄' },
  { id: 'simplified', label: 'Simplified',icon: '✨' },
  { id: 'bullets',    label: 'Bullets',   icon: '•·' },
  { id: 'summary',    label: 'Summary',   icon: '📝' },
];

// Apply a global text transformation before the mode renders it
function applyTransform(text, transform) {
  if (transform === 'simplified') return simplifyText(text);
  if (transform === 'bullets')    return convertToBullets(text).join('\n\n');
  if (transform === 'summary')    return generateSummary(text).join('\n\n');
  return text;
}

export default function ContentArea({
  mode, text, onTextChange, onModeChange, config, preferences, onSessionSave,
}) {
  const [isEditing,     setIsEditing]     = useState(false);
  const [draft,         setDraft]         = useState(text);
  const [transform,     setTransform]     = useState('original');
  const [fading,        setFading]        = useState(false);
  const [renderedMode,  setRenderedMode]  = useState(mode);
  const [selectionMenu, setSelectionMenu] = useState(null);
  const contentRef = useRef(null);

  // Fade transition between modes
  useEffect(() => {
    if (mode === renderedMode) return;
    setFading(true);
    const t = setTimeout(() => { setRenderedMode(mode); setFading(false); }, 250);
    return () => clearTimeout(t);
  }, [mode]); // eslint-disable-line

  // Close selection menu on outside click
  useEffect(() => {
    const hide = () => setSelectionMenu(null);
    document.addEventListener('mousedown', hide);
    return () => document.removeEventListener('mousedown', hide);
  }, []);

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { setSelectionMenu(null); return; }
    const selected = sel.toString().trim();
    if (selected.length < 20) { setSelectionMenu(null); return; }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    setSelectionMenu({ x: rect.left + rect.width / 2, y: rect.top + window.scrollY - 52, selected });
  };

  const applySelectionTransform = (type) => {
    if (!selectionMenu) return;
    const { selected } = selectionMenu;
    let replacement = selected;
    if (type === 'simplify') replacement = simplifyText(selected);
    if (type === 'bullets')  replacement = convertToBullets(selected).map(b => `• ${b}`).join('\n');
    if (type === 'summarise') {
      const paras = tokeniseParagraphs(selected);
      replacement = paras.map(p => p.split(/[.!?]/)[0]?.trim()).filter(Boolean).join('. ');
    }
    onTextChange(text.replace(selected, replacement));
    setSelectionMenu(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleApply = () => {
    onTextChange(draft.trim() || text);
    setIsEditing(false);
  };

  const handleCancel = () => { setDraft(text); setIsEditing(false); };

  const transformedText = applyTransform(text, transform);
  const ModeComponent   = MODE_COMPONENTS[renderedMode];
  const renderCfg       = modeConfigs[renderedMode];

  return (
    <main className={`flex-1 flex flex-col min-h-screen transition-colors duration-700 ${config.twBg}`}>

      {/* Sticky header */}
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/75 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h2 className="font-semibold text-slate-800 text-sm leading-none">{config.name} Mode</h2>
            <p className="text-xs text-slate-400 mt-0.5">{config.tagline}</p>
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button onClick={handleCancel} className="text-sm text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button onClick={handleApply} className="text-sm bg-violet-500 hover:bg-violet-600 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors shadow-sm">
              Apply →
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onSessionSave}
              className="text-xs text-slate-300 hover:text-slate-500 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="Save your current position and mode"
            >
              💾 Save session
            </button>
            <button
              onClick={() => { setDraft(text); setIsEditing(true); }}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              ✏️ Paste text
            </button>
          </div>
        )}
      </header>

      {/* Transform toolbar — only when not editing */}
      {!isEditing && (
        <div className="px-8 py-2.5 bg-white/50 border-b border-white/60 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold mr-1">View as</span>
          {TRANSFORM_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setTransform(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                transform === opt.id
                  ? `${renderCfg.twAccent} text-white shadow-sm`
                  : `text-slate-400 hover:text-slate-600 hover:bg-slate-100`
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
          {transform !== 'original' && (
            <span className="ml-2 text-xs text-slate-300 italic">
              Applies before mode-specific display
            </span>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 py-10 relative" ref={contentRef} onMouseUp={handleMouseUp}>

        {/* Selection floating menu */}
        {selectionMenu && (
          <div
            className="fixed z-50 flex items-center gap-1 bg-slate-800 rounded-xl px-2 py-1.5 shadow-xl"
            style={{ left: selectionMenu.x, top: selectionMenu.y, transform: 'translateX(-50%)' }}
            onMouseDown={e => e.stopPropagation()}
          >
            <span className="text-slate-400 text-xs mr-1">Transform:</span>
            {[
              { id: 'simplify',  label: 'Simplify'  },
              { id: 'bullets',   label: 'Bullets'   },
              { id: 'summarise', label: 'Summarise' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => applySelectionTransform(opt.id)}
                className="text-xs text-white bg-slate-700 hover:bg-violet-500 px-2.5 py-1 rounded-lg transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {isEditing ? (
          <div className="max-w-2xl mx-auto px-6">
            <p className="text-sm font-medium text-slate-600 mb-3">Paste or type your content below:</p>
            <textarea
              autoFocus
              className="w-full h-72 p-4 rounded-2xl border border-slate-200 text-slate-700 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm leading-relaxed shadow-sm"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Paste any text here — an article, email, instructions, or anything you need to read…"
            />
            <p className="text-xs text-slate-300 mt-2">
              {draft.length} characters · ClearPath will adapt it to your current mode
            </p>
          </div>
        ) : (
          <div
            style={{ transition: 'opacity 0.25s ease, transform 0.25s ease' }}
            className={fading ? 'opacity-0 translate-y-1.5' : 'opacity-100 translate-y-0'}
          >
            <ModeComponent
              text={transformedText}
              config={renderCfg}
              onModeChange={onModeChange}
              preferences={preferences}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-white/60 bg-white/40 text-center">
        <p className="text-xs text-slate-300">
          ClearPath adapts content to how you feel — no diagnosis, just support.
          {selectionMenu == null && ' Select any text to simplify, convert to bullets, or summarise it.'}
        </p>
      </footer>
    </main>
  );
}
