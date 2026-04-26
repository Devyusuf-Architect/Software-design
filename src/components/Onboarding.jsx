import { useState } from 'react';

const QUESTIONS = [
  {
    id: 'currentFeeling',
    question: 'How are you feeling right now?',
    subtitle: 'Choose the one that feels closest. You can always change this later.',
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

/* ── Account step (step 4) ──────────────────────────────────────── */
function AccountStep({ onSignUp, onSkip, loading, error }) {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [localErr, setLocalErr] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim())   return setLocalErr('Please enter your name.');
    if (!email.trim())  return setLocalErr('Please enter your email.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setLocalErr('Please enter a valid email.');
    if (password.length < 6) return setLocalErr('Password must be at least 6 characters.');
    setLocalErr('');
    onSignUp(name, email, password);
  };

  const displayError = localErr || error;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-1.5">Save your preferences</h2>
        <p className="text-slate-400 text-sm">
          Create a free account to keep your settings — or skip and use locally.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        {[
          { id: 'ob-name',  label: 'Your name',        type: 'text',     val: name,     set: setName },
          { id: 'ob-email', label: 'Email address',    type: 'email',    val: email,    set: setEmail },
          { id: 'ob-pw',    label: 'Password (6+ chars)', type: 'password', val: password, set: setPassword },
        ].map(({ id, label, type, val, set }) => (
          <div key={id} className="space-y-1.5">
            <label htmlFor={id} className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {label}
            </label>
            <input
              id={id}
              type={type}
              value={val}
              onChange={e => set(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all"
              placeholder={type === 'email' ? 'you@example.com' : type === 'password' ? '••••••••' : 'Your name'}
            />
          </div>
        ))}

        {displayError && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {displayError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-200 text-sm"
        >
          {loading ? 'Creating account…' : 'Create my account →'}
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={onSkip}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
        >
          Skip for now — save locally
        </button>
        <p className="text-xs text-slate-300 mt-2">You can create an account anytime from within the app</p>
      </div>
    </div>
  );
}

/* ── Main onboarding component ──────────────────────────────────── */
export default function Onboarding({ onComplete, user, onSignUp }) {
  const [step,     setStep]     = useState(0); // 0=welcome, 1-3=questions, 4=account
  const [answers,  setAnswers]  = useState({});
  const [selected, setSelected] = useState(null);
  const [fading,   setFading]   = useState(false);
  const [authLoad, setAuthLoad] = useState(false);
  const [authErr,  setAuthErr]  = useState('');

  const isWelcome    = step === 0;
  const isAccountStep = step === QUESTIONS.length + 1;
  const currentQ     = QUESTIONS[step - 1];
  const isLastQ      = step === QUESTIONS.length;

  const transition = (fn) => {
    setFading(true);
    setTimeout(() => { fn(); setSelected(null); setFading(false); }, 280);
  };

  const handleNext = () => {
    if (!isWelcome && !selected) return;

    let updatedAnswers = answers;
    if (!isWelcome && currentQ) {
      updatedAnswers = { ...answers, [currentQ.id]: selected };
      setAnswers(updatedAnswers);
    }

    if (isLastQ) {
      // If already signed in, skip account step
      if (user) {
        transition(() => onComplete(updatedAnswers));
      } else {
        transition(() => setStep(QUESTIONS.length + 1));
      }
      return;
    }

    transition(() => setStep(s => s + 1));
  };

  const handleBack = () => {
    if (step <= 1) return;
    transition(() => setStep(s => s - 1));
  };

  const handleSignUpAndComplete = async (name, email, password) => {
    setAuthLoad(true);
    setAuthErr('');
    const result = onSignUp(name, email, password);
    setAuthLoad(false);
    if (result?.error) { setAuthErr(result.error); return; }
    transition(() => onComplete(answers));
  };

  const handleSkipAccount = () => {
    transition(() => onComplete(answers));
  };

  const progressTotal = QUESTIONS.length + (user ? 0 : 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-teal-50 flex items-center justify-center p-6">
      <div
        className="max-w-xl w-full"
        style={{
          transition: 'opacity 0.28s ease, transform 0.28s ease',
          opacity: fading ? 0 : 1,
          transform: fading ? 'translateY(10px)' : 'translateY(0)',
        }}
      >
        {/* Progress bar */}
        {!isWelcome && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
              <span>{isAccountStep ? 'Almost done' : 'Getting to know you'}</span>
              <span>{Math.min(step, progressTotal)} of {progressTotal}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-400 rounded-full transition-all duration-500"
                style={{ width: `${(Math.min(step, progressTotal) / progressTotal) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Welcome */}
        {isWelcome && (
          <div className="text-center">
            <div className="w-20 h-20 bg-violet-500 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-violet-200">
              🌿
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight">Welcome to ClearPath</h1>
            <p className="text-lg text-slate-500 mb-2">A space that adapts to how you feel.</p>
            <p className="text-slate-400 mb-10 leading-relaxed max-w-sm mx-auto text-sm">
              We'll ask three quick questions to personalise your experience.
              No wrong answers — you can change everything later.
            </p>
            <button
              onClick={handleNext}
              className="bg-violet-500 hover:bg-violet-600 text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-200 shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5"
            >
              Let's begin →
            </button>
            <p className="text-xs text-slate-300 mt-6">No account required to get started</p>
          </div>
        )}

        {/* Questions */}
        {!isWelcome && !isAccountStep && (
          <div>
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-800 mb-1.5">{currentQ.question}</h2>
              <p className="text-slate-400 text-sm">{currentQ.subtitle}</p>
            </div>

            <div className="space-y-2.5 mb-8">
              {currentQ.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSelected(opt.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                    selected === opt.value
                      ? 'border-violet-400 bg-violet-50 shadow-md shadow-violet-100'
                      : 'border-slate-100 bg-white hover:border-violet-200 hover:bg-violet-50/40'
                  }`}
                >
                  <span className="text-2xl w-9 text-center">{opt.emoji}</span>
                  <div className="flex-1">
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
                {isLastQ ? (user ? 'Get started →' : 'Almost done →') : 'Continue →'}
              </button>
            </div>
          </div>
        )}

        {/* Account step */}
        {isAccountStep && (
          <AccountStep
            onSignUp={handleSignUpAndComplete}
            onSkip={handleSkipAccount}
            loading={authLoad}
            error={authErr}
          />
        )}
      </div>
    </div>
  );
}
