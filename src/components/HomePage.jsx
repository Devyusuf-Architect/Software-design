import { useEffect, useRef, useState } from 'react';

/* ── Data ──────────────────────────────────────────────────────── */
const MODES = [
  {
    icon: '🌿', name: 'Calm',        tagline: 'Full access, clear mind',
    desc: 'When you\'re feeling steady, ClearPath steps back and lets you work with everything available.',
    color: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-600', float: 'float-a',
  },
  {
    icon: '🌸', name: 'Overwhelmed', tagline: 'One idea at a time',
    desc: 'Content is shown one section at a time. A breathing guide is built in when you need a moment.',
    color: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-600', float: 'float-b',
  },
  {
    icon: '🌥️', name: 'Foggy',       tagline: 'Bold keywords, read aloud',
    desc: 'Key words are highlighted. Click any sentence to hear it. Simplify the text with one tap.',
    color: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-600', float: 'float-c',
  },
  {
    icon: '🌊', name: 'Anxious',     tagline: 'Calm & predictable',
    desc: 'Urgency language is removed. You see what to expect before you read. Exit to safety anytime.',
    color: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-700',
    badge: 'bg-teal-100 text-teal-600', float: 'float-d',
  },
  {
    icon: '🌱', name: 'Stressed',    tagline: 'Small steps forward',
    desc: 'Content becomes a checklist. Encouraging messages appear as you tick each step off.',
    color: 'bg-green-50', border: 'border-green-100', text: 'text-green-700',
    badge: 'bg-green-100 text-green-600', float: 'float-e',
  },
];

const FEATURES = [
  { icon: '✨', title: 'Content Transformation',     desc: 'Instantly convert any text into simplified language, bullet points, or a clean summary.' },
  { icon: '🔊', title: 'Read Aloud with Highlight',  desc: 'Word-level highlighting as text is read aloud. Pause, resume, or hear one sentence at a time.' },
  { icon: '📋', title: 'Step-by-Step Task Guidance', desc: 'Instructions auto-detect into a checkable step list you can tick through at your own pace.' },
  { icon: '💾', title: 'Session Save & Restore',      desc: 'Pick up exactly where you left off. Your mode, progress, and text are restored automatically.' },
  { icon: '🎯', title: 'Focus Controller',            desc: 'One section visible at a time. A breathing guide is built in when you need a moment.' },
  { icon: '🤍', title: 'No Diagnosis Required',       desc: 'No labels, no forms, no clinical language. Select how you feel and the interface adapts.' },
];

const HOW = [
  { n: '01', title: 'Choose your mode',      desc: 'Select how you feel right now — overwhelmed, foggy, anxious, stressed, or calm.' },
  { n: '02', title: 'Paste your content',    desc: 'Drop in any text: an email, article, instructions, or document you need to read.' },
  { n: '03', title: 'Let ClearPath adapt it', desc: 'Layout, text, colour, and guidance change instantly. You focus — ClearPath handles the rest.' },
];

const MARQUEE_ITEMS = [
  '🌿 Calm Mode', '🌸 Overwhelmed Mode', '🌥️ Foggy Mode', '🌊 Anxious Mode', '🌱 Stressed Mode',
  '✨ Content Simplification', '🔊 Read Aloud', '📋 Step Guidance', '💾 Save Progress', '🎯 Focus Mode',
];

/* ── Scroll animation hook ─────────────────────────────────────── */
function useScrollFade() {
  const ref = useRef([]);
  useEffect(() => {
    const els = ref.current.filter(Boolean);
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const set = (i) => el => { ref.current[i] = el; };
  return set;
}

/* ── Navbar ────────────────────────────────────────────────────── */
function Navbar({ onSignIn, onGetStarted, onTryDemo }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'nav-scrolled' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-violet-500 rounded-xl flex items-center justify-center text-lg shadow-md shadow-violet-200">
            🌿
          </div>
          <span className="font-bold text-slate-800 text-base">ClearPath</span>
        </a>

        {/* Links (desktop) */}
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
          <a href="#how-it-works" className="hover:text-slate-800 transition-colors">How it works</a>
          <a href="#modes"        className="hover:text-slate-800 transition-colors">Modes</a>
          <a href="#features"     className="hover:text-slate-800 transition-colors">Features</a>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSignIn}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all duration-200"
          >
            Sign in
          </button>
          <button
            onClick={onTryDemo}
            className="text-sm font-semibold border-2 border-violet-200 text-violet-600 hover:border-violet-400 hover:text-violet-700 px-5 py-2 rounded-xl transition-all duration-200 hover:bg-violet-50"
          >
            Try Demo
          </button>
          <button
            onClick={onGetStarted}
            className="text-sm font-semibold bg-violet-500 hover:bg-violet-600 text-white px-5 py-2 rounded-xl transition-all duration-200 shadow-md shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5"
          >
            Get started free
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ── HomePage ──────────────────────────────────────────────────── */
export default function HomePage({ onGetStarted, onSignIn, onTryDemo }) {
  const fade = useScrollFade();
  let fi = 0; // fade index counter

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar onSignIn={onSignIn} onGetStarted={onGetStarted} onTryDemo={onTryDemo} />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-200 rounded-full bg-blob opacity-30 pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-teal-200 rounded-full bg-blob-2 opacity-25 pointer-events-none" />
        <div className="absolute top-40 right-10 w-64 h-64 bg-amber-100 rounded-full bg-blob opacity-20 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-24">
          {/* Left — text */}
          <div>
            <div className="hero-in-0 flex flex-wrap items-center gap-2 mb-6">
              <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-4 py-2 rounded-full">
                <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
                Adapts to how you feel, not the other way around
              </div>
              <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-xs font-mono font-semibold px-3 py-2 rounded-full">
                Powered by ODAI
              </div>
            </div>

            <h1 className="hero-in-1 text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.08] tracking-tight mb-6">
              Stressful pages made{' '}
              <span className="gradient-text">easy to complete</span>
            </h1>

            <p className="hero-in-2 text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
              ClearPath uses ODAI to transform confusing, overwhelming content
              based on how you feel right now — reducing cognitive load and making
              every task easier to act on.
            </p>

            <div className="hero-in-3 flex flex-wrap gap-3 mb-8">
              <button
                onClick={onTryDemo}
                className="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all duration-200 shadow-xl shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5 text-sm"
              >
                Try Demo — see it live
                <span className="text-violet-200">→</span>
              </button>
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 border-2 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 font-semibold px-7 py-3.5 rounded-2xl transition-all duration-200 hover:bg-slate-50 text-sm"
              >
                Get started free
              </button>
            </div>

            <div className="hero-in-4 flex items-center gap-3 text-sm text-slate-400">
              <div className="flex -space-x-2">
                {['🧑', '👩', '🧑‍💻', '👨'].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-base">
                    {e}
                  </div>
                ))}
              </div>
              <span>No account required to get started · Free forever</span>
            </div>
          </div>

          {/* Right — floating mode cards */}
          <div className="hidden lg:block relative h-[480px]">
            {[
              { m: MODES[0], pos: 'top-0 left-8',         size: 'w-52' },
              { m: MODES[1], pos: 'top-4 right-0',         size: 'w-48' },
              { m: MODES[2], pos: 'top-40 left-0',         size: 'w-44' },
              { m: MODES[3], pos: 'top-44 right-8',        size: 'w-52' },
              { m: MODES[4], pos: 'bottom-0 left-20',      size: 'w-48' },
            ].map(({ m, pos, size }, i) => (
              <div
                key={m.name}
                className={`absolute ${pos} ${size} ${m.float}`}
              >
                <div className={`${m.color} ${m.border} border rounded-2xl p-4 shadow-lg backdrop-blur-sm`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <p className={`font-bold text-sm ${m.text}`}>{m.name}</p>
                      <p className="text-xs text-slate-400">{m.tagline}</p>
                    </div>
                  </div>
                  <div className={`h-1.5 ${m.badge.split(' ')[0]} rounded-full`}>
                    <div className={`h-full w-3/5 ${m.badge.split(' ')[0].replace('50','300').replace('100','400')} rounded-full`} />
                  </div>
                </div>
              </div>
            ))}
            {/* Decorative circles */}
            <div className="absolute bottom-16 right-4 w-24 h-24 border-2 border-dashed border-violet-100 rounded-full float-b" />
            <div className="absolute top-24 left-4 w-16 h-16 border-2 border-dashed border-teal-100 rounded-full float-d" />
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-300">
          <span className="text-xs">Scroll to explore</span>
          <div className="w-5 h-8 border-2 border-slate-200 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-slate-300 rounded-full" style={{ animation: 'floatA 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── MARQUEE BAND ─────────────────────────────────────── */}
      <div className="bg-slate-900 py-4 overflow-hidden">
        <div className="marquee-track inline-flex">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 text-slate-400 text-sm font-medium mx-6">
              {item}
              <span className="text-slate-700">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div ref={fade(fi++)} className="scroll-fade text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-3">How it works</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Three steps to clarity</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              No setup, no learning curve. Open ClearPath, select your mode, and start reading.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-violet-200 via-teal-200 to-green-200" />

            {HOW.map(({ n, title, desc }, i) => (
              <div key={n} ref={fade(fi++)} className={`scroll-fade delay-${i + 1} flex flex-col items-center text-center`}>
                <div className="relative w-24 h-24 bg-gradient-to-br from-violet-50 to-teal-50 border-2 border-slate-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <span className="text-3xl font-bold text-slate-200">{n}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODES SHOWCASE ───────────────────────────────────── */}
      <section id="modes" className="py-28 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div ref={fade(fi++)} className="scroll-fade text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-3">Five modes</p>
            <h2 className="text-4xl font-bold text-white mb-4">One clear path forward</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Each mode is a completely different experience — not just a colour change.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {MODES.map((m, i) => (
              <div
                key={m.name}
                ref={fade(fi++)}
                className={`scroll-fade delay-${i + 1} group relative bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default`}
              >
                <div className={`${m.badge} inline-flex items-center justify-center w-12 h-12 rounded-2xl text-2xl mb-4`}>
                  {m.icon}
                </div>
                <h3 className="font-bold text-white mb-1 text-sm">{m.name}</h3>
                <p className="text-slate-400 text-xs mb-3">{m.tagline}</p>
                <p className="text-slate-500 text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-x-5 bottom-5 top-auto bg-slate-700 rounded-xl p-3 pointer-events-none">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────── */}
      <section id="features" className="py-28 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div ref={fade(fi++)} className="scroll-fade text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-3">Features</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Built to reduce cognitive load</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Every feature was designed to make digital content easier to understand and act on.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, title, desc }, i) => (
              <div
                key={title}
                ref={fade(fi++)}
                className={`scroll-fade delay-${(i % 3) + 1} bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-xl mb-4">
                  {icon}
                </div>
                <h3 className="font-bold text-slate-800 mb-1.5 text-sm">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ────────────────────────────────────────────── */}
      <section className="py-28 bg-gradient-to-br from-violet-600 via-violet-500 to-teal-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div ref={fade(fi++)} className="scroll-fade relative max-w-3xl mx-auto px-6 text-center">
          <p className="text-5xl text-white/20 font-serif mb-4">"</p>
          <p className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-6">
            Your content. Your pace. Your way.
          </p>
          <p className="text-violet-200 text-base">
            ClearPath meets you where you are — not where the website expects you to be.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div ref={fade(fi++)} className="scroll-fade max-w-2xl mx-auto px-6 text-center">
          <div className="text-5xl mb-6">🌿</div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Ready to take back control?</h2>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed">
            See ClearPath in action on a real stressful page — then start using it
            on any content. No account needed. No diagnosis required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={onTryDemo}
              className="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5 text-base"
            >
              Try Demo →
            </button>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 border-2 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 font-semibold px-8 py-4 rounded-2xl transition-all duration-200 hover:bg-slate-50 text-base"
            >
              Get started free
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-6">Powered by ODAI · Free forever · Data stays on your device · No diagnosis</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-8 border-b border-slate-800">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 bg-violet-500 rounded-lg flex items-center justify-center text-base">🌿</div>
                <span className="font-bold text-white">ClearPath</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                A tool that adapts digital content to how you feel in the moment.
                No diagnosis. No labels. Just clarity.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-16 gap-y-2 text-sm">
              {[
                ['How it works', '#how-it-works'],
                ['Modes',        '#modes'],
                ['Features',     '#features'],
                ['Get started',  '#'],
              ].map(([label, href]) => (
                <a key={label} href={href}
                  className="text-slate-500 hover:text-white transition-colors"
                >{label}</a>
              ))}
            </div>
          </div>
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <span>© {new Date().getFullYear()} ClearPath. Built for clarity.</span>
            <span>ClearPath does not diagnose, assess, or label users in any way.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
