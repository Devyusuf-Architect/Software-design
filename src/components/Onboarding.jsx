import { useState } from 'react';

const QUESTIONS = [
  {
    id: 'currentFeeling',
    question: 'How are you feeling right now?',
    subtitle: 'Choose the one that feels closest. You can change this at any time.',
    options: [
      { value: 'calm',        label: 'Pretty good',   emoji: '🌿', desc: "I'm feeling steady and clear" },
      { value: 'overwhelmed', label: 'Overwhelmed',   emoji: '🌸', desc: "There's too much happening at once" },
      { value: 'foggy',       label: 'A bit foggy',   emoji: '🌥️', desc: "I'm having trouble focusing" },
      { value: 'anxious',     label: 'Anxious',       emoji: '🌊', desc: "I'm feeling worried or on edge" },
      { value: 'stressed',    label: 'Stressed',      emoji: '🌱', desc: "I have a lot to get through" },
    ],
  },
  {
    id: 'readingPreference',
    question: 'How do you prefer to read?',
    subtitle: 'This helps us set your default text style.',
    options: [
      { value: 'chunks', label: 'Small chunks', emoji: '📖', desc: 'Break it up, one piece at a time' },
      { value: 'full',   label: 'Full text',   emoji: '📄', desc: 'I like to see everything at once' },
      { value: 'aloud',  label: 'Read aloud',  emoji: '🔊', desc: 'I prefer to listen while I read' },
    ],
  },
  {
    id: 'helpPreference',
    question: "When you're struggling, what helps most?",
    subtitle: "We'll use this to personalise your experience.",
    options: [
      { value: 'encouragement', label: 'Gentle encouragement', emoji: '💬', desc: "Remind me I'm doing okay" },
      { value: 'structure',     label: 'Clear structure',      emoji: '📋', desc: 'Show me exactly what to do next' },
      { value: 'minimal',       label: 'Less is more',         emoji: '🤍', desc: "Remove everything I don't need" },
    ],
  },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0); // 0 = welcome, 1–3 = questions
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [fading, setFading] = useState(false);

  const isWelcome = step === 0;
  const currentQ = QUESTIONS[step - 1];
  const isLast = step === QUESTIONS.length;

  const transition = (fn) => {
    setFading(true);
    setTimeout(() => {
      fn();
      setSelected(null);
      setFading(false);
    }, 280);
  };

  const handleNext = () => {
    if (!isWelcome && !selected) return;

    if (!isWelcome) {
      const updated = { ...answers, [currentQ.id]: selected };
      if (isLast) {
        transition(() => onComplete(updated));
        return;
      }
      setAnswers(updated);
    }
    transition(() => setStep(s => s + 1));
  };

  const handleBack = () => {
    if (step <= 1) return;
    transition(() => setStep(s => s - 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-teal-50 flex items-center justify-center p-6">
      <div
        className={`max-w-xl w-full transition-all duration-280 ${fading ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}
        style={{ transition: 'opacity 0.28s ease, transform 0.28s ease' }}
      >

        {/* Progress bar (questions only) */}
        {!isWelcome && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
              <span>Getting to know you</span>
              <span>{step} of {QUESTIONS.length}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-400 rounded-full transition-all duration-500"
                style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Welcome screen */}
        {isWelcome ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-violet-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-violet-200">
              🌿
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight">
              Welcome to ClearPath
            </h1>
            <p className="text-lg text-slate-500 mb-2 leading-relaxed">
              A space that adapts to how you feel.
            </p>
            <p className="text-slate-400 mb-10 leading-relaxed max-w-sm mx-auto text-sm">
              We'll ask you three quick questions to personalise your experience.
              There are no wrong answers, and you can change everything later.
            </p>
            <button
              onClick={handleNext}
              className="bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-200 shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5"
            >
              Let's begin →
            </button>
            <p className="text-xs text-slate-300 mt-6">
              Your answers are saved only on your device
            </p>
          </div>

        ) : (
          /* Question screen */
          <div>
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-800 mb-1.5">{currentQ.question}</h2>
              <p className="text-slate-400 text-sm">{currentQ.subtitle}</p>
            </div>

            <div className="space-y-2.5 mb-8">
              {currentQ.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelected(opt.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 group ${
                    selected === opt.value
                      ? 'border-violet-400 bg-violet-50 shadow-md shadow-violet-100'
                      : 'border-slate-100 bg-white hover:border-violet-200 hover:bg-violet-50/40'
                  }`}
                >
                  <span className="text-2xl w-9 text-center">{opt.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{opt.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                  {selected === opt.value && (
                    <div className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className={`text-slate-400 hover:text-slate-600 text-sm transition-colors ${step <= 1 ? 'invisible' : ''}`}
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                disabled={!selected}
                className="bg-violet-500 hover:bg-violet-600 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md shadow-violet-200 disabled:shadow-none"
              >
                {isLast ? 'Get started' : 'Continue →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
