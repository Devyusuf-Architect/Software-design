import { modeConfigs, MODES } from '../utils/modeConfigs';

export default function ModePanel({ currentMode, onModeChange, onResetOnboarding }) {
  const cfg = modeConfigs[currentMode];

  return (
    <aside className="w-72 flex-shrink-0 min-h-screen bg-white border-r border-slate-100 flex flex-col shadow-sm">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-500 rounded-xl flex items-center justify-center text-xl shadow-md shadow-violet-200">
            🌿
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-none">ClearPath</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Content that adapts to you</p>
          </div>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-3 px-2">
          How are you feeling?
        </p>
        <nav className="space-y-1">
          {MODES.map(mode => {
            const c = modeConfigs[mode];
            const isActive = currentMode === mode;
            return (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${
                  isActive
                    ? `${c.twAccentLight} ${c.twAccentText} font-semibold`
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <span className="text-xl w-8 text-center flex-shrink-0">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none">{c.name}</p>
                  <p className={`text-xs mt-0.5 truncate ${isActive ? c.twAccentText : 'text-slate-400'}`}>
                    {c.tagline}
                  </p>
                </div>
                {isActive && (
                  <div className={`w-1.5 h-5 rounded-full flex-shrink-0 ${c.twAccent}`} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Current mode description */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className={`p-3 rounded-xl ${cfg.twAccentLight}`}>
          <p className={`text-xs leading-relaxed ${cfg.twAccentText}`}>
            {cfg.description}
          </p>
        </div>

        {/* Reset / about links */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={onResetOnboarding}
            className="text-[11px] text-slate-300 hover:text-slate-500 transition-colors"
          >
            Reset preferences
          </button>
          <span className="text-[11px] text-slate-200">v1.0</span>
        </div>
      </div>
    </aside>
  );
}
