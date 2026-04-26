import { useState, useEffect } from 'react';
import Onboarding  from './components/Onboarding';
import ModePanel   from './components/ModePanel';
import ContentArea from './components/ContentArea';
import { useLocalStorage } from './hooks/useLocalStorage';
import { modeConfigs }     from './utils/modeConfigs';

const DEMO_TEXT = `Digital overload is something many of us experience every single day. The moment we open our devices, we are met with a flood of notifications, news headlines, emails, and social media updates. This relentless stream of information can leave us feeling drained, scattered, and unable to focus on what actually matters.

ClearPath is designed to give you back control. By selecting a mode that reflects how you feel right now, you can instantly change the way content appears on your screen. The experience adapts to you — not the other way around.

When you feel overwhelmed, seeing everything at once can make things much worse. Breaking content down to one idea at a time gives your mind the space it needs to process without getting lost in the noise.

When things feel foggy or unclear, having key words highlighted and the option to listen along can help anchor your attention. You move at your own pace, and you can always go back and read it again.

When anxiety is high, a calm and completely predictable environment makes all the difference. No pop-ups, no sudden movements, no urgency. Just quiet, steady content you can trust.

When you feel stressed, a wall of text can feel impossible. Turning content into a simple list of small, checkable steps makes even difficult reading feel manageable. Every small step counts.

When you feel calm and ready, you have full access to everything. All features, all content, no limitations. ClearPath simply gets out of the way and lets you work.

This is your space. ClearPath meets you where you are.`;

const SESSION_KEY = 'clearpath_session';

function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}

function saveSession(data) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ ...data, savedAt: Date.now() })); }
  catch { /* ignore */ }
}

export default function App() {
  const [onboardingDone, setOnboardingDone, clearOnboarding] = useLocalStorage('clearpath_onboarding', false);
  const [preferences,    setPreferences,    clearPreferences] = useLocalStorage('clearpath_prefs', null);

  const [mode,      setMode]      = useState('calm');
  const [text,      setText]      = useState(DEMO_TEXT);
  const [resumeBanner, setResumeBanner] = useState(null); // { mode, savedAt }

  // On first load, check for a saved session
  useEffect(() => {
    const session = loadSession();
    if (session && session.mode && onboardingDone) {
      setResumeBanner(session);
    }
  }, []); // eslint-disable-line

  const handleOnboardingComplete = (prefs) => {
    setPreferences(prefs);
    setOnboardingDone(true);
    if (prefs.currentFeeling) setMode(prefs.currentFeeling);
  };

  const handleResetOnboarding = () => {
    clearOnboarding();
    clearPreferences();
    localStorage.removeItem(SESSION_KEY);
    setMode('calm');
    setText(DEMO_TEXT);
    setResumeBanner(null);
  };

  const handleSessionSave = () => {
    saveSession({ mode, text: text !== DEMO_TEXT ? text : undefined });
    // Brief visual feedback via the banner state
    setResumeBanner({ mode, savedAt: Date.now(), justSaved: true });
    setTimeout(() => setResumeBanner(null), 2500);
  };

  const handleResume = () => {
    if (!resumeBanner) return;
    setMode(resumeBanner.mode);
    if (resumeBanner.text) setText(resumeBanner.text);
    setResumeBanner(null);
  };

  if (!onboardingDone) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const config = modeConfigs[mode];

  return (
    <div className="flex min-h-screen relative">

      {/* Resume / saved banner */}
      {resumeBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-slate-800 text-white rounded-2xl shadow-xl text-sm">
          {resumeBanner.justSaved ? (
            <>
              <span className="text-green-400">✓</span>
              <span>Session saved in <strong>{modeConfigs[resumeBanner.mode]?.name}</strong> mode</span>
            </>
          ) : (
            <>
              <span>Resume in <strong>{modeConfigs[resumeBanner.mode]?.name} {modeConfigs[resumeBanner.mode]?.icon}</strong> mode?</span>
              <button onClick={handleResume} className="ml-1 bg-violet-500 hover:bg-violet-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors">
                Resume
              </button>
              <button onClick={() => setResumeBanner(null)} className="text-slate-400 hover:text-white transition-colors text-xs px-1">
                ✕
              </button>
            </>
          )}
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <ModePanel
          currentMode={mode}
          onModeChange={setMode}
          onResetOnboarding={handleResetOnboarding}
        />
      </div>

      {/* Main content */}
      <ContentArea
        mode={mode}
        text={text}
        onTextChange={setText}
        config={config}
        onModeChange={setMode}
        preferences={preferences}
        onSessionSave={handleSessionSave}
      />

      {/* Mobile bottom mode bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-100 flex justify-around px-2 py-2 shadow-lg">
        {Object.values(modeConfigs).map(c => (
          <button
            key={c.id}
            onClick={() => setMode(c.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
              mode === c.id ? `${c.twAccentLight} ${c.twAccentText}` : 'text-slate-400'
            }`}
          >
            <span className="text-xl">{c.icon}</span>
            <span className="text-[10px] font-medium">{c.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
