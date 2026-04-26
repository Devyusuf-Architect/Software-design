import { useState, useEffect } from 'react';
import { modeConfigs } from '../utils/modeConfigs';
import OverwhelmedMode from './modes/OverwhelmedMode';
import FoggyMode      from './modes/FoggyMode';
import AnxiousMode    from './modes/AnxiousMode';
import StressedMode   from './modes/StressedMode';
import CalmMode       from './modes/CalmMode';

const MODE_COMPONENTS = {
  overwhelmed: OverwhelmedMode,
  foggy:       FoggyMode,
  anxious:     AnxiousMode,
  stressed:    StressedMode,
  calm:        CalmMode,
};

export default function ContentArea({ mode, text, onTextChange, onModeChange, config, preferences }) {
  const [isEditing, setIsEditing]         = useState(false);
  const [draft, setDraft]                 = useState(text);
  const [fading, setFading]               = useState(false);
  const [renderedMode, setRenderedMode]   = useState(mode);

  // Smooth mode transition: fade out → swap component → fade in
  useEffect(() => {
    if (mode === renderedMode) return;
    setFading(true);
    const t = setTimeout(() => {
      setRenderedMode(mode);
      setFading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApply = () => {
    onTextChange(draft.trim() || text);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(text);
    setIsEditing(false);
  };

  const ModeComponent = MODE_COMPONENTS[renderedMode];
  const renderCfg     = modeConfigs[renderedMode];

  return (
    <main
      className={`flex-1 flex flex-col min-h-screen transition-colors duration-700 ${config.twBg}`}
    >
      {/* Sticky header */}
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h2 className="font-semibold text-slate-800 text-sm leading-none">{config.name} Mode</h2>
            <p className="text-xs text-slate-400 mt-0.5">{config.tagline}</p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={() => { setDraft(text); setIsEditing(true); }}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-200"
          >
            <span>✏️</span>
            <span>Paste your own text</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="text-sm text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="text-sm bg-violet-500 hover:bg-violet-600 text-white px-4 py-1.5 rounded-lg font-medium transition-colors shadow-sm"
            >
              Apply →
            </button>
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="flex-1 py-10">
        {isEditing ? (
          /* Text editor */
          <div className="max-w-2xl mx-auto px-6">
            <p className="text-sm font-medium text-slate-600 mb-3">Paste or type your content below:</p>
            <textarea
              autoFocus
              className="w-full h-72 p-4 rounded-2xl border border-slate-200 text-slate-700 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm leading-relaxed shadow-sm"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Paste any text here — an article, email, document, or anything you need to read…"
            />
            <p className="text-xs text-slate-300 mt-2">
              {draft.length} characters · ClearPath will adapt it to your current mode
            </p>
          </div>
        ) : (
          /* Mode content */
          <div
            className={`content-fade ${fading ? 'fading' : ''}`}
            style={{ transition: 'opacity 0.25s ease, transform 0.25s ease' }}
          >
            <ModeComponent
              text={text}
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
        </p>
      </footer>
    </main>
  );
}
