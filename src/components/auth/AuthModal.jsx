import { useState, useEffect } from 'react';

function Field({ id, label, type = 'text', value, onChange, autoFocus }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus={autoFocus}
        autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'name'}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all duration-200 text-sm"
        placeholder={type === 'email' ? 'you@example.com' : type === 'password' ? '••••••••' : 'Your name'}
      />
    </div>
  );
}

export default function AuthModal({ initialTab = 'signin', onSuccess, onClose }) {
  const [tab,      setTab]      = useState(initialTab); // 'signin' | 'signup'
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [visible,  setVisible]  = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 20); }, []);

  const switchTab = (t) => { setTab(t); setError(''); setName(''); setEmail(''); setPassword(''); };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const validate = () => {
    if (tab === 'signup' && !name.trim())    return 'Please enter your name.';
    if (!email.trim())                        return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (password.length < 6)                 return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) { setError(msg); return; }
    setLoading(true);
    setError('');
    // Simulate async (gives time for button animation)
    await new Promise(r => setTimeout(r, 400));
    onSuccess(tab, name, email, password);
    setLoading(false);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={e => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-violet-50 to-teal-50 border-b border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-violet-500 rounded-xl flex items-center justify-center text-lg shadow-md shadow-violet-200">
                🌿
              </div>
              <span className="font-bold text-slate-800">ClearPath</span>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              ✕
            </button>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-white/70 rounded-2xl p-1 border border-slate-100">
            {[['signin','Sign in'], ['signup','Create account']].map(([t, label]) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  tab === t
                    ? 'bg-violet-500 text-white shadow-md shadow-violet-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          {tab === 'signup' && (
            <Field id="name" label="Your name" value={name} onChange={setName} autoFocus />
          )}
          <Field id="email"    label="Email address" type="email"    value={email}    onChange={setEmail}    autoFocus={tab === 'signin'} />
          <Field id="password" label="Password"      type="password" value={password} onChange={setPassword} />

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-red-400 text-sm">⚠</span>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none text-sm"
          >
            {loading
              ? 'Just a moment…'
              : tab === 'signin' ? 'Sign in to ClearPath' : 'Create my account'}
          </button>

          <p className="text-center text-xs text-slate-400">
            {tab === 'signin' ? (
              <>Don't have an account?{' '}
                <button type="button" onClick={() => switchTab('signup')} className="text-violet-500 hover:text-violet-700 font-semibold underline-offset-2 hover:underline">
                  Create one free
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button type="button" onClick={() => switchTab('signin')} className="text-violet-500 hover:text-violet-700 font-semibold underline-offset-2 hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>

        <div className="px-8 pb-6 text-center">
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Your data is stored only on this device. ClearPath does not diagnose or label users.
          </p>
        </div>
      </div>
    </div>
  );
}
