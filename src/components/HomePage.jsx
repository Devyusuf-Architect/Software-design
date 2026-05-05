import { useEffect, useRef, useState } from 'react';
import ClearPathLogo from './ClearPathLogo';

const DOWNLOAD_URL =
  'https://github.com/Devyusuf-Architect/Software-design/releases/download/v1.0.5/ClearPath_1.0.0_x64-setup.exe';

/* ── Data ──────────────────────────────────────────────────────── */
const MODES = [
  {
    icon: '🌸', name: 'Overwhelmed', tagline: 'One idea at a time',
    desc: 'Content appears one section at a time with a built-in breathing guide.',
    color: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-600',
  },
  {
    icon: '🌥️', name: 'Foggy', tagline: 'Bold keywords, read aloud',
    desc: 'Key words are highlighted and you can hear any sentence read aloud.',
    color: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-600',
  },
  {
    icon: '🌊', name: 'Anxious', tagline: 'Calm and predictable',
    desc: 'Urgency language removed. You see what to expect before you read anything.',
    color: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-700',
    badge: 'bg-teal-100 text-teal-600',
  },
  {
    icon: '🌱', name: 'Stressed', tagline: 'Small steps forward',
    desc: 'Content becomes a checkable step list with encouragement as you progress.',
    color: 'bg-green-50', border: 'border-green-100', text: 'text-green-700',
    badge: 'bg-green-100 text-green-600',
  },
  {
    icon: '🌿', name: 'Calm', tagline: 'Full access, clear mind',
    desc: 'When you feel steady, ClearPath steps back and lets you work uninterrupted.',
    color: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: '📄', name: 'Original', tagline: 'Unmodified view',
    desc: 'See the original content exactly as it is, with no modifications applied.',
    color: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700',
    badge: 'bg-slate-100 text-slate-600',
  },
];

const WHAT_IT_DOES = [
  {
    icon: '✨', title: 'Simplify complex content',
    desc: 'Instantly converts dense or confusing text into plain, readable language — removing jargon and reducing cognitive load.',
  },
  {
    icon: '📋', title: 'Break tasks into steps',
    desc: 'Instructions and procedures are automatically turned into a clear, checkable step-by-step list you can work through at your own pace.',
  },
  {
    icon: '🔊', title: 'Read content aloud',
    desc: 'Any text can be read aloud with word-level highlighting, so you can listen and follow along without losing your place.',
  },
  {
    icon: '💡', title: 'Explain unfamiliar terms',
    desc: 'Select any word or phrase to get a plain-English definition. No dictionary tabs, no searching — just instant clarity.',
  },
];

const ETHICS = [
  {
    icon: '🔒', title: 'ClearPath does not diagnose you',
    desc: 'Modes are self-selected based on how you feel. No labels, no assessments, no clinical language is used anywhere.',
  },
  {
    icon: '👁️', title: 'No hidden monitoring',
    desc: 'ClearPath does not record your screen, track your activity, or send data about what you read.',
  },
  {
    icon: '🤝', title: 'You control what is shared',
    desc: 'You paste or type the content you want help with. Nothing is captured without your direct action.',
  },
  {
    icon: '🪟', title: 'Overlay Mode is user-activated',
    desc: 'The overlay panel only opens when you launch it. It does not run in the background or start automatically.',
  },
];

const MARQUEE_ITEMS = [
  '🌿 Calm Mode', '🌸 Overwhelmed Mode', '🌥️ Foggy Mode', '🌊 Anxious Mode', '🌱 Stressed Mode', '📄 Original Mode',
  '✨ Simplify', '🔊 Read Aloud', '📋 Step Guidance', '💡 Define', '🪟 Overlay Mode', '📋 Workspace Mode',
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
  return (i) => el => { ref.current[i] = el; };
}

/* ── Static Overlay Mockup ─────────────────────────────────────── */
function OverlayMockup() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 min-h-[240px] flex items-center justify-center p-6">
      {/* Fake background webpage */}
      <div className="absolute inset-0 p-5 opacity-20 pointer-events-none overflow-hidden">
        {[80, 100, 90, 100, 70, 60, 95, 80].map((w, i) => (
          <div key={i} className="h-2 bg-slate-500 rounded mb-2" style={{ width: `${w}%` }} />
        ))}
      </div>
      {/* Floating panel */}
      <div className="relative z-10 w-56 rounded-2xl overflow-hidden shadow-2xl select-none"
        style={{ background: '#0F172A', border: '1.5px solid rgba(92,122,78,0.5)' }}>
        {/* Title bar */}
        <div className="px-3 py-2.5 flex items-center justify-between"
          style={{ background: '#1a2e1a' }}>
          <div className="flex items-center gap-2">
            <span className="text-sm">🌿</span>
            <span className="text-white font-bold text-xs">ClearPath</span>
            <span className="text-xs px-1.5 py-0.5 rounded text-green-300 font-mono"
              style={{ background: 'rgba(74,222,128,0.15)', fontSize: 9 }}>Overlay</span>
          </div>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-slate-600 text-[9px] text-slate-400 flex items-center justify-center">−</div>
            <div className="w-4 h-4 rounded bg-slate-600 text-[9px] text-slate-400 flex items-center justify-center">✕</div>
          </div>
        </div>
        {/* Body */}
        <div className="p-3 space-y-2.5" style={{ background: '#0F172A' }}>
          <div className="text-[10px] font-semibold text-slate-400 px-0.5">🌿 Calm mode</div>
          <div className="bg-slate-800 rounded-lg px-2.5 py-2 border border-slate-700">
            <p className="text-[10px] text-slate-500 italic">Paste text to analyse…</p>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {['✨ Simplify', '💡 Explain', '📋 Steps', '📖 Define'].map(b => (
              <div key={b} className="text-[9px] font-semibold px-2 py-1.5 rounded-lg text-center"
                style={{ background: '#1E3A1E', color: '#86EFAC' }}>{b}</div>
            ))}
          </div>
          <div className="rounded-lg p-2.5" style={{ background: '#1E3A1E' }}>
            <p className="text-[9px] font-bold uppercase tracking-wide mb-1" style={{ color: '#4ADE80', fontSize: 8 }}>
              Plain English
            </p>
            <p className="text-[10px] leading-relaxed" style={{ color: '#D1FAE5' }}>
              This notice needs your attention. You have time and options to decide.
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-[8px] text-slate-600">User-selected mode · You stay in control</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Navbar ────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'nav-scrolled' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <div className="w-8 h-8 text-violet-500">
            <ClearPathLogo size={32} />
          </div>
          <span className="font-bold text-slate-800 text-base">ClearPath</span>
          <span className="hidden sm:inline text-[10px] font-mono font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-1">
            by ODAI
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
          <a href="#how-it-works" className="hover:text-slate-800 transition-colors">How it works</a>
          <a href="#overlay-mode"  className="hover:text-slate-800 transition-colors">Overlay Mode</a>
          <a href="#modes"         className="hover:text-slate-800 transition-colors">Modes</a>
          <a href="#privacy"       className="hover:text-slate-800 transition-colors">Privacy</a>
        </div>

        <a
          href={DOWNLOAD_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm shadow-md hover:-translate-y-0.5"
        >
          <span>⬇</span>
          <span className="hidden sm:inline">Download for Windows</span>
          <span className="sm:hidden">Download</span>
        </a>
      </div>
    </nav>
  );
}

/* ── HomePage ──────────────────────────────────────────────────── */
export default function HomePage() {
  const fade = useScrollFade();
  let fi = 0;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-100 rounded-full opacity-40 pointer-events-none"
          style={{ filter: 'blur(80px)' }} />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-teal-100 rounded-full opacity-30 pointer-events-none"
          style={{ filter: 'blur(80px)' }} />

        <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-24">
          <div>
            <div className="hero-in-0 flex flex-wrap items-center gap-2 mb-6">
              <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-4 py-2 rounded-full">
                <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
                Desktop assistant for difficult digital tasks
              </div>
              <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-xs font-mono font-semibold px-3 py-2 rounded-full">
                Powered by ODAI
              </div>
            </div>

            <h1 className="hero-in-1 text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.08] tracking-tight mb-6">
              Adaptive support for{' '}
              <span className="gradient-text">digital tasks</span>,{' '}
              based on how you feel.
            </h1>

            <p className="hero-in-2 text-lg text-slate-500 leading-relaxed mb-10 max-w-lg">
              ClearPath sits on top of any app as a small floating assistant. Paste in
              confusing content — an email, a form, a document — and it instantly simplifies,
              explains, or guides you through it, based on the mode you choose.
            </p>

            <div className="hero-in-3 flex flex-wrap gap-4">
              <a
                href={DOWNLOAD_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-base"
              >
                <span className="text-xl">⬇</span>
                Download Desktop App
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 border-2 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 font-semibold px-8 py-4 rounded-2xl transition-all duration-200 hover:bg-slate-50 text-base"
              >
                See How It Works
              </a>
            </div>

            <p className="hero-in-4 text-xs text-slate-400 mt-5">
              Windows · Free to download · Overlay Mode requires the desktop app
            </p>
          </div>

          {/* Right — floating mode cards */}
          <div className="hidden lg:block relative h-[480px]">
            {[
              { m: MODES[0], pos: 'top-0 left-8',     size: 'w-52', anim: 'float-a' },
              { m: MODES[2], pos: 'top-4 right-0',    size: 'w-48', anim: 'float-b' },
              { m: MODES[4], pos: 'top-40 left-0',    size: 'w-44', anim: 'float-c' },
              { m: MODES[1], pos: 'top-44 right-8',   size: 'w-52', anim: 'float-d' },
              { m: MODES[3], pos: 'bottom-0 left-20', size: 'w-48', anim: 'float-e' },
            ].map(({ m, pos, size, anim }) => (
              <div key={m.name} className={`absolute ${pos} ${size} ${anim}`}>
                <div className={`${m.color} ${m.border} border rounded-2xl p-4 shadow-lg`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <p className={`font-bold text-sm ${m.text}`}>{m.name}</p>
                      <p className="text-xs text-slate-400">{m.tagline}</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div className={`h-full w-3/5 ${m.badge.split(' ')[0].replace('50','200').replace('100','300')} rounded-full`} />
                  </div>
                </div>
              </div>
            ))}
            <div className="absolute bottom-16 right-4 w-24 h-24 border-2 border-dashed border-violet-100 rounded-full float-b" />
            <div className="absolute top-24 left-4 w-16 h-16 border-2 border-dashed border-teal-100 rounded-full float-d" />
          </div>
        </div>

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

      {/* ── WHAT IT DOES ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div ref={fade(fi++)} className="scroll-fade text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-3">What it does</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Digital content, made easier to handle
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              ClearPath helps you simplify, understand, and complete difficult digital tasks —
              emails, forms, notices, articles — using support modes you choose yourself.
              No account required. No setup. Just clarity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHAT_IT_DOES.map(({ icon, title, desc }, i) => (
              <div key={title} ref={fade(fi++)}
                className={`scroll-fade delay-${i + 1} bg-slate-50 rounded-2xl p-6 border border-slate-100`}>
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm border border-slate-100">
                  {icon}
                </div>
                <h3 className="font-bold text-slate-800 mb-2 text-sm leading-snug">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OVERLAY MODE ─────────────────────────────────────── */}
      <section id="overlay-mode" className="py-28 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div ref={fade(fi++)} className="scroll-fade text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-3">Primary feature</p>
            <h2 className="text-4xl font-bold text-white mb-4">🪟 Overlay Mode</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              A floating assistant panel that lives on top of any app or website.
              It opens when you need it and stays out of the way when you don't.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Explanation */}
            <div ref={fade(fi++)} className="scroll-fade space-y-6">
              {[
                {
                  icon: '🪟',
                  title: 'Floats above any app',
                  desc: 'The Overlay panel sits on top of your screen — above your browser, email client, documents, or any other window. You never lose your place.',
                },
                {
                  icon: '📋',
                  title: 'Paste or type content',
                  desc: 'Copy any text you find difficult — a confusing email, a legal notice, a complex form — and paste it into the panel. ClearPath processes it immediately.',
                },
                {
                  icon: '✨',
                  title: 'Simplify, explain, define, guide',
                  desc: 'Four actions are available for any content: Simplify (plain English), Explain (in detail), Steps (break into tasks), and Define (look up a word).',
                },
                {
                  icon: '🔊',
                  title: 'Read it aloud',
                  desc: 'Any output can be read aloud with adjustable speed. The panel highlights each word as it is spoken so you can follow along easily.',
                },
                {
                  icon: '🤝',
                  title: 'Always user-controlled',
                  desc: 'Overlay Mode only opens when you launch it. It does not monitor your activity, read your screen, or run in the background without your action.',
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'rgba(74,222,128,0.1)' }}>
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1 text-sm">{title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <a
                  href={DOWNLOAD_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 bg-white text-slate-900 font-bold px-6 py-3 rounded-2xl text-sm hover:bg-slate-100 transition-colors shadow-lg"
                >
                  ⬇ Download for Windows
                </a>
                <p className="text-slate-600 text-xs mt-2">Overlay Mode is available in the desktop app only.</p>
              </div>
            </div>

            {/* Visual mockup */}
            <div ref={fade(fi++)} className="scroll-fade delay-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 text-center">
                Visual preview — not interactive
              </p>
              <OverlayMockup />
              <p className="text-slate-600 text-xs text-center mt-3">
                The panel is draggable, collapsible, and always on top of other windows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WORKSPACE MODE ───────────────────────────────────── */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div ref={fade(fi++)} className="scroll-fade text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-3">Secondary mode</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">📋 Workspace Mode</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              A full-screen reading and analysis environment for when you want to go deeper.
            </p>
          </div>

          <div ref={fade(fi++)} className="scroll-fade grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📄',
                title: 'Upload or paste content',
                desc: 'Bring in any text — a document, article, notice, or instructions. The workspace formats it cleanly for processing.',
              },
              {
                icon: '🔍',
                title: 'Get summaries, steps, and simplified versions',
                desc: 'Transform content into a summary, a step list, or a fully simplified version — all in one place with side-by-side comparison.',
              },
              {
                icon: '📖',
                title: 'Useful for deeper reading or analysis',
                desc: 'When you need more time and space, the full workspace gives you all five adaptive modes, progress tracking, and read-aloud support.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-2xl mb-4">
                  {icon}
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div ref={fade(fi++)} className="scroll-fade mt-10 text-center">
            <p className="text-slate-400 text-sm">
              Workspace Mode is available in both the desktop app and the browser.
            </p>
          </div>
        </div>
      </section>

      {/* ── MODES ────────────────────────────────────────────── */}
      <section id="modes" className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div ref={fade(fi++)} className="scroll-fade text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-3">Support modes</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">You choose your mode</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              There are six modes. You select the one that matches how you feel right now.
              ClearPath adapts the interface and output instantly — no account, no setup.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODES.map((m, i) => (
              <div key={m.name} ref={fade(fi++)}
                className={`scroll-fade delay-${(i % 3) + 1} ${m.color} ${m.border} border rounded-2xl p-6`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{m.icon}</span>
                  <div>
                    <p className={`font-bold ${m.text}`}>{m.name}</p>
                    <p className="text-xs text-slate-400">{m.tagline}</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>

          <div ref={fade(fi++)} className="scroll-fade mt-10 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
            <p className="text-slate-600 text-sm leading-relaxed max-w-xl mx-auto">
              <strong className="text-slate-800">Modes are always manually selected.</strong>{' '}
              ClearPath never automatically assigns a mode or makes assumptions about how you feel.
              You are always in control of which mode is active.
            </p>
          </div>
        </div>
      </section>

      {/* ── ETHICS / PRIVACY ─────────────────────────────────── */}
      <section id="privacy" className="py-28 bg-slate-900">
        <div className="max-w-5xl mx-auto px-6">
          <div ref={fade(fi++)} className="scroll-fade text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3">Ethics and privacy</p>
            <h2 className="text-4xl font-bold text-white mb-4">Designed with care</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              ClearPath was built to support people, not to label, monitor, or exploit them.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {ETHICS.map(({ icon, title, desc }, i) => (
              <div key={title} ref={fade(fi++)}
                className={`scroll-fade delay-${(i % 2) + 1} bg-slate-800 border border-slate-700 rounded-2xl p-6`}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: 'rgba(45,212,191,0.1)' }}>
                  {icon}
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOWNLOAD CTA ─────────────────────────────────────── */}
      <section id="download" className="py-28 bg-white">
        <div ref={fade(fi++)} className="scroll-fade max-w-2xl mx-auto px-6 text-center">
          <div className="text-5xl mb-6">🪟</div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Download the desktop app
          </h2>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed">
            ClearPath runs as a lightweight floating assistant on Windows.
            Overlay Mode, all six support modes, and read-aloud are included.
            Free to download.
          </p>

          <a
            href={DOWNLOAD_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-bold px-10 py-5 rounded-2xl transition-all duration-200 shadow-2xl hover:-translate-y-1 text-lg"
          >
            <span className="text-2xl">⬇</span>
            Download for Windows
          </a>

          <p className="text-slate-400 text-sm mt-5">
            Desktop app required for Overlay Mode.
          </p>
          <p className="text-slate-300 text-xs mt-2">
            Windows 10 or later · Free forever · No account required
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-8 border-b border-slate-800">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 text-violet-400">
                  <ClearPathLogo size={28} />
                </div>
                <span className="font-bold text-white">ClearPath</span>
                <span className="text-[10px] font-mono text-slate-500 ml-1">by ODAI</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Adaptive support for digital tasks, based on how you feel.
                No diagnosis. No labels. Just clarity.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-16 gap-y-2 text-sm">
              {[
                ['How it works', '#how-it-works'],
                ['Overlay Mode', '#overlay-mode'],
                ['Modes',        '#modes'],
                ['Privacy',      '#privacy'],
                ['Download',     '#download'],
              ].map(([label, href]) => (
                <a key={label} href={href} className="text-slate-500 hover:text-white transition-colors">{label}</a>
              ))}
            </div>
          </div>
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <span>© {new Date().getFullYear()} ClearPath. Powered by ODAI.</span>
            <span>ClearPath does not diagnose, assess, or label users in any way.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
