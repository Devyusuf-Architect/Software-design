import { useState } from 'react';
import { modeConfigs, MODES } from '../utils/modeConfigs';

export default function ModePanel({ currentMode, onModeChange, onResetOnboarding, user, onSignOut, onSignIn }) {
  const cfg = modeConfigs[currentMode];
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : null;

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

      {/* User section */}
      <div className="px-4 py-3 border-b border-slate-50">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <span className={`text-slate-300 text-xs transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-10 overflow-hidden">
                <button
                  onClick={() => { onSignOut(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <span className="text-base">👋</span> Sign out
                </button>
                <button
                  onClick={() => { onResetOnboarding(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-400 hover:bg-slate-50 transition-colors border-t border-slate-50"
                >
                  <span className="text-base">🔄</span> Reset preferences
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onSignIn}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-200 text-slate-400 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all duration-200 text-sm font-medium"
          >
            <span>👤</span> Sign in or create account
          </button>
        )}
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

      {/* Current mode info */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className={`p-3 rounded-xl ${cfg.twAccentLight}`}>
          <p className={`text-xs leading-relaxed ${cfg.twAccentText}`}>
            {cfg.description}
          </p>
        </div>
        {!user && (
          <p className="text-[11px] text-slate-300 text-center px-1">
            <button onClick={onSignIn} className="hover:text-violet-500 transition-colors underline underline-offset-2">
              Create an account
            </button>
            {' '}to save preferences
          </p>
        )}
      </div>
    </aside>
  );
}
