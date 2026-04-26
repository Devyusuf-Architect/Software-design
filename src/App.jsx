import { useState } from 'react';
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

export default function App() {
  const [onboardingComplete, setOnboardingComplete, clearOnboarding] = useLocalStorage('clearpath_onboarding', false);
  const [preferences, setPreferences, clearPreferences]              = useLocalStorage('clearpath_prefs', null);
  const [currentMode, setCurrentMode] = useState('calm');
  const [text, setText]               = useState(DEMO_TEXT);

  const handleOnboardingComplete = (prefs) => {
    setPreferences(prefs);
    setOnboardingComplete(true);
    if (prefs.currentFeeling) setCurrentMode(prefs.currentFeeling);
  };

  const handleResetOnboarding = () => {
    clearOnboarding();
    clearPreferences();
    setCurrentMode('calm');
    setText(DEMO_TEXT);
  };

  if (!onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const config = modeConfigs[currentMode];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — hidden on small screens */}
      <div className="hidden lg:block">
        <ModePanel
          currentMode={currentMode}
          onModeChange={setCurrentMode}
          onResetOnboarding={handleResetOnboarding}
        />
      </div>

      {/* Main content */}
      <ContentArea
        mode={currentMode}
        text={text}
        onTextChange={setText}
        config={config}
        onModeChange={setCurrentMode}
        preferences={preferences}
      />

      {/* Mobile bottom mode bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-100 flex justify-around px-2 py-2 shadow-lg">
        {Object.values(modeConfigs).map(c => (
          <button
            key={c.id}
            onClick={() => setCurrentMode(c.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
              currentMode === c.id ? `${c.twAccentLight} ${c.twAccentText}` : 'text-slate-400'
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
