import { useState, useEffect } from 'react';
import HomePage       from './components/HomePage';
import Onboarding     from './components/Onboarding';
import ModePanel      from './components/ModePanel';
import ContentArea    from './components/ContentArea';
import AuthModal      from './components/auth/AuthModal';
import DemoWorkspace  from './components/DemoWorkspace';
import ModeSelectScreen from './components/ModeSelectScreen';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAuth }         from './hooks/useAuth';
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
const loadSession = () => { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } };
const saveSession = (d)  => { try { localStorage.setItem(SESSION_KEY, JSON.stringify({ ...d, savedAt: Date.now() })); } catch {} };

// view: 'home' | 'onboarding' | 'app'
// authModal: null | 'signin' | 'signup'
export default function App() {
  const { user, signUp, signIn, signOut } = useAuth();

  const [onboardingDone, setOnboardingDone, clearOnboarding] = useLocalStorage('clearpath_onboarding', false);
  const [preferences,    setPreferences,    clearPreferences] = useLocalStorage('clearpath_prefs', null);

  const [view,       setView]       = useState(() => {
    if (user && onboardingDone) return 'app';
    if (user)                   return 'onboarding';
    return 'home';
  });
  const [authModal,     setAuthModal]     = useState(null); // null | 'signin' | 'signup'
  const [mode,          setMode]          = useState('calm');
  const [text,          setText]          = useState(DEMO_TEXT);
  const [resumeBanner,  setResumeBanner]  = useState(null);
  const [demoInitView,  setDemoInitView]  = useState('workspace'); // 'workspace' | 'overlay'

  // If user signs in while on homepage, advance to onboarding or app
  useEffect(() => {
    if (user && view === 'home') {
      setAuthModal(null);
      setView(onboardingDone ? 'app' : 'onboarding');
    }
  }, [user]); // eslint-disable-line

  /* ── Try Demo ───────────────────────────────────────────── */
  const handleTryDemo = () => setView('mode-select');

  // Check for saved session on app load
  useEffect(() => {
    if (view === 'app') {
      const s = loadSession();
      if (s?.mode) setResumeBanner(s);
    }
  }, [view]);

  /* ── Auth modal handler ─────────────────────────────────── */
  const handleAuthSuccess = (tab, name, email, password) => {
    const result = tab === 'signup' ? signUp(name, email, password) : signIn(email, password);
    if (result?.error) return result; // propagate error back to modal
    setAuthModal(null);
    if (!onboardingDone) setView('onboarding');
    else setView('app');
  };

  /* ── Onboarding complete ────────────────────────────────── */
  const handleOnboardingComplete = (prefs) => {
    setPreferences(prefs);
    setOnboardingDone(true);
    if (prefs.currentFeeling) setMode(prefs.currentFeeling);
    setView('app');
  };

  /* ── Onboarding sign-up (step 4) ────────────────────────── */
  const handleOnboardingSignUp = (name, email, password) => {
    return signUp(name, email, password); // result returned to AccountStep
  };

  /* ── Reset ──────────────────────────────────────────────── */
  const handleReset = () => {
    clearOnboarding();
    clearPreferences();
    localStorage.removeItem(SESSION_KEY);
    setMode('calm');
    setText(DEMO_TEXT);
    setResumeBanner(null);
    setView('home');
  };

  const handleSignOut = () => {
    signOut();
    handleReset();
  };

  /* ── Session save ───────────────────────────────────────── */
  const handleSessionSave = () => {
    saveSession({ mode, text: text !== DEMO_TEXT ? text : undefined });
    setResumeBanner({ mode, savedAt: Date.now(), justSaved: true });
    setTimeout(() => setResumeBanner(null), 2500);
  };

  const config = modeConfigs[mode];

  /* ══════ RENDER ════════════════════════════════════════════ */

  return (
    <>
      {/* Auth modal — available from any view */}
      {authModal && (
        <AuthModal
          initialTab={authModal}
          onSuccess={handleAuthSuccess}
          onClose={() => setAuthModal(null)}
        />
      )}

      {/* Home page */}
      {view === 'home' && (
        <HomePage
          onGetStarted={() => setView('onboarding')}
          onSignIn={() => setAuthModal('signin')}
          onTryDemo={handleTryDemo}
        />
      )}

      {/* Mode select screen */}
      {view === 'mode-select' && (
        <ModeSelectScreen
          onSelectOverlay={() => { setDemoInitView('overlay'); setView('demo'); }}
          onSelectWorkspace={() => { setDemoInitView('workspace'); setView('demo'); }}
          onExit={() => setView('home')}
        />
      )}

      {/* Demo workspace */}
      {view === 'demo' && (
        <DemoWorkspace
          initialView={demoInitView}
          onExit={() => setView('mode-select')}
        />
      )}

      {/* Onboarding */}
      {view === 'onboarding' && (
        <Onboarding
          onComplete={handleOnboardingComplete}
          user={user}
          onSignUp={handleOnboardingSignUp}
        />
      )}

      {/* Main app */}
      {view === 'app' && (
        <div className="flex min-h-screen relative">

          {/* Resume session banner */}
          {resumeBanner && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-slate-800 text-white rounded-2xl shadow-xl text-sm whitespace-nowrap">
              {resumeBanner.justSaved ? (
                <><span className="text-green-400">✓</span> Session saved in <strong>{modeConfigs[resumeBanner.mode]?.name}</strong> mode</>
              ) : (
                <>
                  <span>Resume in <strong>{modeConfigs[resumeBanner.mode]?.icon} {modeConfigs[resumeBanner.mode]?.name}</strong> mode?</span>
                  <button onClick={() => { setMode(resumeBanner.mode); if (resumeBanner.text) setText(resumeBanner.text); setResumeBanner(null); }}
                    className="bg-violet-500 hover:bg-violet-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors">
                    Resume
                  </button>
                  <button onClick={() => setResumeBanner(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
                </>
              )}
            </div>
          )}

          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <ModePanel
              currentMode={mode}
              onModeChange={setMode}
              onResetOnboarding={handleReset}
              user={user}
              onSignOut={handleSignOut}
              onSignIn={() => setAuthModal('signin')}
            />
          </div>

          {/* Content */}
          <ContentArea
            mode={mode}
            text={text}
            onTextChange={setText}
            config={config}
            onModeChange={setMode}
            preferences={preferences}
            onSessionSave={handleSessionSave}
          />

          {/* Mobile bottom bar */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-100 flex justify-around px-2 py-2 shadow-lg">
            {Object.values(modeConfigs).map(c => (
              <button key={c.id} onClick={() => setMode(c.id)}
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
      )}
    </>
  );
}
