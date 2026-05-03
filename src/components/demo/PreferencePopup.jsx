import { useState } from 'react';
import { modeConfigs } from '../../utils/modeConfigs';

const FEELINGS = [
  { id: 'overwhelmed', icon: '🌸', label: 'Overwhelmed',  sub: 'Too much at once' },
  { id: 'foggy',       icon: '🌥️', label: 'Foggy',        sub: 'Hard to focus'    },
  { id: 'anxious',     icon: '🌊', label: 'Anxious',      sub: 'Feeling worried'  },
  { id: 'stressed',    icon: '🌱', label: 'Stressed',      sub: 'Under pressure'  },
  { id: 'calm',        icon: '🌿', label: 'Calm',          sub: 'Ready to go'     },
];

const PREFS = [
  {
    id: 'textSize',
    question: 'How do you prefer text size?',
    options: [
      { id: 'small',  label: 'Smaller' },
      { id: 'normal', label: 'Default' },
      { id: 'large',  label: 'Larger'  },
    ],
  },
  {
    id: 'pace',
    question: 'How would you like to move through tasks?',
    options: [
      { id: 'one',  label: 'One step at a time' },
      { id: 'all',  label: 'See everything'     },
    ],
  },
];

const STORAGE_KEY = 'clearpath_preferences';

export function loadPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function savePreferences(prefs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
}

export default function PreferencePopup({ onComplete }) {
  const [feeling,    setFeeling]    = useState(null);
  const [answers,    setAnswers]    = useState({});
  const [step,       setStep]       = useState(0); // 0=feeling, 1=prefs, 2=done

  const handleFeelingSelect = (id) => {
    setFeeling(id);
  };

  const handleAnswer = (prefId, optionId) => {
    setAnswers(prev => ({ ...prev, [prefId]: optionId }));
  };

  const handleNext = () => {
    if (step === 0 && !feeling) return;
    if (step < 1) { setStep(s => s + 1); return; }
    // Save and complete
    const prefs = { feeling, ...answers, seenAt: Date.now() };
    savePreferences(prefs);
    onComplete(prefs);
  };

  const handleSkip = () => {
    const prefs = { feeling: 'calm', seenAt: Date.now() };
    savePreferences(prefs);
    onComplete(prefs);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md px-8 py-8"
        style={{ animation: 'modalPop 0.3s cubic-bezier(0.16,1,0.3,1) forwards' }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
            🌿
          </div>
          <h2 className="text-xl font-bold text-slate-800">Welcome to ClearPath</h2>
          <p className="text-sm text-slate-500 mt-1">
            {step === 0
              ? 'How are you feeling right now?'
              : 'A couple of quick preferences'}
          </p>
        </div>

        {/* Step 0 — Feeling picker */}
        {step === 0 && (
          <div className="grid grid-cols-1 gap-2">
            {FEELINGS.map(f => {
              const mc = modeConfigs[f.id];
              const active = feeling === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleFeelingSelect(f.id)}
                  className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl border-2 text-left transition-all duration-150 btn-micro"
                  style={active
                    ? { borderColor: mc.hex.accent, background: mc.hex.accentLight, boxShadow: `0 2px 8px ${mc.hex.accent}20` }
                    : { borderColor: '#E2E8F0', background: '#fff' }
                  }
                >
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: active ? mc.hex.text : '#374151' }}>{f.label}</p>
                    <p className="text-xs" style={{ color: active ? mc.hex.accent : '#9CA3AF' }}>{f.sub}</p>
                  </div>
                  {active && <span className="ml-auto text-lg" style={{ color: mc.hex.accent }}>✓</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Step 1 — Preference questions */}
        {step === 1 && (
          <div className="space-y-6">
            {PREFS.map(pref => (
              <div key={pref.id}>
                <p className="text-sm font-semibold text-slate-700 mb-2">{pref.question}</p>
                <div className="flex gap-2 flex-wrap">
                  {pref.options.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswer(pref.id, opt.id)}
                      className="px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all btn-micro"
                      style={answers[pref.id] === opt.id
                        ? { borderColor: '#475569', background: '#1E293B', color: '#fff' }
                        : { borderColor: '#E2E8F0', color: '#4B5563' }
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-7">
          <button onClick={handleSkip} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            Skip for now
          </button>
          <button
            onClick={handleNext}
            disabled={step === 0 && !feeling}
            className="px-6 py-2.5 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all btn-micro"
            style={{ background: '#1E293B', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          >
            {step === 0 ? 'Continue →' : 'Start ClearPath →'}
          </button>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mt-5">
          {[0, 1].map(i => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{ width: i === step ? 20 : 6, height: 6, background: i === step ? '#475569' : '#E2E8F0' }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
