import { useEffect, useRef, useState } from 'react';
import ClearPathLogo from './ClearPathLogo';

const DOWNLOAD_URL =
  'https://github.com/Devyusuf-Architect/Software-design/releases/download/v1.0.5/ClearPath_1.0.0_x64-setup.exe';

/* ── Minimal line icons ─────────────────────────────────────────── */
const svgBase = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};
function Icon({ name, size = 18 }) {
  const p = { ...svgBase, width: size, height: size, viewBox: '0 0 24 24' };
  switch (name) {
    case 'lines':
      return (
        <svg {...p}>
          <line x1="4" y1="7"  x2="20" y2="7"  />
          <line x1="4" y1="12" x2="15" y2="12" />
          <line x1="4" y1="17" x2="11" y2="17" />
        </svg>
      );
    case 'list':
      return (
        <svg {...p}>
          <line x1="8" y1="7"  x2="20" y2="7"  />
          <line x1="8" y1="12" x2="20" y2="12" />
          <line x1="8" y1="17" x2="20" y2="17" />
          <circle cx="4.5" cy="7"  r="1" />
          <circle cx="4.5" cy="12" r="1" />
          <circle cx="4.5" cy="17" r="1" />
        </svg>
      );
    case 'audio':
      return (
        <svg {...p}>
          <path d="M4 9v6h3l5 4V5L7 9H4z" />
          <path d="M16 8a5 5 0 0 1 0 8" />
        </svg>
      );
    case 'info':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="11" x2="12" y2="16" />
          <circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...p}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 1 1 8 0v4" />
        </svg>
      );
    case 'eye':
      return (
        <svg {...p}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
          <line x1="4" y1="20" x2="20" y2="4" />
        </svg>
      );
    case 'check':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l2.5 2.5L16 9.5" />
        </svg>
      );
    case 'window':
      return (
        <svg {...p}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <circle cx="6.5" cy="7" r="0.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'arrowDown':
      return (
        <svg {...p}>
          <line x1="12" y1="5"  x2="12" y2="19" />
          <polyline points="6 13 12 19 18 13" />
        </svg>
      );
    case 'arrowRight':
      return (
        <svg {...p}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="13 6 19 12 13 18" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...p}>
          <line x1="4" y1="7"  x2="20" y2="7"  />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      );
    case 'x':
      return (
        <svg {...p}>
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
      );
    default: return null;
  }
}

/* ── Data ──────────────────────────────────────────────────────── */
const MODES = [
  { name: 'Overwhelmed', tagline: 'One idea at a time',
    desc: 'Content appears one section at a time, with a built-in breathing guide.',
    accent: '#7c3aed' },
  { name: 'Foggy',       tagline: 'Bold keywords, read aloud',
    desc: 'Key words are highlighted, and you can hear any sentence read aloud.',
    accent: '#b45309' },
  { name: 'Anxious',     tagline: 'Calm and predictable',
    desc: 'Urgency language is removed. You see what to expect before you read anything.',
    accent: '#0d9488' },
  { name: 'Stressed',    tagline: 'Small steps forward',
    desc: 'Content becomes a checkable step list, with encouragement as you progress.',
    accent: '#15803d' },
  { name: 'Calm',        tagline: 'Full access, clear mind',
    desc: 'When you feel steady, ClearPath steps back and lets you work uninterrupted.',
    accent: '#4338ca' },
  { name: 'Original',    tagline: 'Unmodified view',
    desc: 'See the original content exactly as it is, with no modifications applied.',
    accent: '#475569' },
];

const WHAT_IT_DOES = [
  {
    icon: 'lines', title: 'Simplify complex content',
    desc: 'Instantly converts dense or confusing text into plain, readable language. Jargon is removed and cognitive load is reduced.',
  },
  {
    icon: 'list', title: 'Break tasks into steps',
    desc: 'Instructions and procedures are automatically turned into a clear, checkable step-by-step list you can work through at your own pace.',
  },
  {
    icon: 'audio', title: 'Read content aloud',
    desc: 'Any text can be read aloud with word-level highlighting, so you can listen and follow along without losing your place.',
  },
  {
    icon: 'info', title: 'Explain unfamiliar terms',
    desc: 'Select any word or phrase to get a plain-English definition. No dictionary tabs, no searching, just instant clarity.',
  },
];

const ETHICS = [
  {
    icon: 'lock', title: 'ClearPath does not diagnose you',
    desc: 'Modes are self-selected based on how you feel. No labels, no assessments, no clinical language is used anywhere.',
  },
  {
    icon: 'eye', title: 'No hidden monitoring',
    desc: 'ClearPath does not record your screen, track your activity, or send data about what you read.',
  },
  {
    icon: 'check', title: 'You control what is shared',
    desc: 'Screen capture only happens when you click Analyze Screen. You choose what gets captured, every single time.',
  },
  {
    icon: 'window', title: 'Overlay Mode is user-activated',
    desc: 'The overlay panel only opens when you launch it. It does not run in the background or start automatically.',
  },
];

const NAV_LINKS = [
  ['How it works', '#how-it-works'],
  ['Overlay Mode', '#overlay-mode'],
  ['Modes',        '#modes'],
  ['Privacy',      '#privacy'],
];

/* ── Scroll animation hook ─────────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef([]);
  useEffect(() => {
    const els = ref.current.filter(Boolean);
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (i) => el => { ref.current[i] = el; };
}

/* ── Overlay panel mockup ────────────────────────────────────────── */
function OverlayMockup() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden min-h-[260px] flex items-center justify-center p-6 sm:p-7"
      style={{
        background: '#0f172a',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="absolute inset-0 p-6 opacity-[0.07] pointer-events-none overflow-hidden">
        {[80, 100, 90, 100, 70, 60, 95, 80, 100].map((w, i) => (
          <div key={i} className="h-2 bg-slate-300 rounded mb-2.5" style={{ width: `${w}%` }} />
        ))}
      </div>

      <div
        className="relative w-56 sm:w-60 rounded-xl overflow-hidden select-none"
        style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 12px 40px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        <div className="px-3 py-2 flex items-center justify-between" style={{ background: '#0b1220' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 text-violet-300/80">
              <ClearPathLogo size={14} />
            </div>
            <span className="text-white font-medium text-[11px] tracking-wide">ClearPath</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] text-emerald-400 font-medium">Session active</span>
          </div>
        </div>

        <div className="p-2.5 space-y-2">
          <div className="flex items-center text-[10px] px-0.5">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#4338ca' }} />
              Calm mode
            </span>
          </div>

          <div
            className="rounded-lg px-2.5 py-2.5 flex items-center gap-2 cursor-pointer"
            style={{ background: '#1a2236', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            <div className="w-3.5 h-3.5 text-violet-400 flex-shrink-0">
              <svg fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="14" height="14">
                <rect x="2" y="6" width="20" height="14" rx="2" />
                <circle cx="12" cy="13" r="3.5" />
                <path d="M8 6l1.5-2h5L16 6" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-violet-300">Analyze Screen</span>
          </div>

          <div className="rounded-lg p-2"
            style={{ background: 'rgba(76,222,128,0.06)', border: '1px solid rgba(76,222,128,0.15)' }}>
            <p className="text-[8px] font-semibold uppercase tracking-wider mb-1 text-emerald-400">
              Plain English
            </p>
            <p className="text-[10px] leading-relaxed text-slate-300">
              A bill is due May 5. You can pay in full, or in three monthly parts.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1">
            {['Simplify', 'Explain', 'Steps', 'Define'].map(b => (
              <div key={b} className="text-[9px] font-medium px-1.5 py-1.5 rounded-md text-center"
                style={{ background: '#1a2236', color: '#cbd5e1' }}>{b}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Navbar ────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close menu when user taps a link
  function handleLinkClick() { setMobileOpen(false); }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
      scrolled || mobileOpen
        ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/60'
        : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2" onClick={handleLinkClick}>
          <div className="w-7 h-7 text-indigo-700">
            <ClearPathLogo size={28} />
          </div>
          <span className="font-semibold text-slate-900 text-[15px] tracking-tight">ClearPath</span>
          <span className="hidden sm:inline text-[10px] font-mono text-slate-400 ml-1 tracking-wider">
            BY ODAI
          </span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7 text-[13px] text-slate-600">
          {NAV_LINKS.map(([label, href]) => (
            <a key={label} href={href} className="hover:text-slate-900 transition-colors">{label}</a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={DOWNLOAD_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-medium px-4 py-2 rounded-md transition-colors"
          >
            <Icon name="arrowDown" size={14} />
            <span className="hidden sm:inline">Download for Windows</span>
            <span className="sm:hidden">Download</span>
          </a>

          {/* Mobile hamburger - hidden on md+ */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Icon name={mobileOpen ? 'x' : 'menu'} size={18} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="mobile-nav-menu md:hidden border-t border-slate-200/70 bg-white/95 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-5 py-3 flex flex-col gap-0.5">
            {NAV_LINKS.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={handleLinkClick}
                className="text-[15px] text-slate-700 hover:text-slate-900 font-medium py-2.5 px-1 border-b border-slate-100 last:border-0 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

/* ── Section label + heading helper ─────────────────────────────── */
function SectionHeading({ label, labelColor = 'text-indigo-600', title, body, dark = false }) {
  return (
    <>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.15em] ${labelColor} mb-3`}>
        {label}
      </p>
      <h2 className={`text-[22px] sm:text-[28px] lg:text-[32px] font-semibold leading-[1.15] tracking-tight mb-3 ${dark ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </h2>
      {body && (
        <p className={`text-[15px] leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          {body}
        </p>
      )}
    </>
  );
}

/* ── HomePage ──────────────────────────────────────────────────── */
export default function HomePage() {
  const reveal = useScrollReveal();
  let ri = 0;

  return (
    <div
      className="min-h-screen bg-white text-slate-900 overflow-x-hidden"
      style={{ fontFeatureSettings: '"ss01", "cv11"' }}
    >
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative pt-24 pb-14 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.10) 0%, transparent 60%)',
            filter: 'blur(40px)',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
          <div>
            <div className="hero-in-0 inline-flex items-center gap-2 mb-6 sm:mb-7">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 tracking-wider uppercase">
                <span className="w-1 h-1 rounded-full bg-indigo-500" />
                Powered by ODAI
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-medium text-slate-500 tracking-wider uppercase">
                Desktop assistant
              </span>
            </div>

            <h1 className="hero-in-1 text-[1.85rem] sm:text-4xl lg:text-[2.875rem] font-semibold text-slate-900 leading-[1.14] tracking-tight mb-4 sm:mb-5">
              Adaptive support for digital tasks,
              <span className="text-slate-500"> based on how you feel.</span>
            </h1>

            <p className="hero-in-2 text-[15px] text-slate-600 leading-relaxed mb-7 sm:mb-8 max-w-[28rem]">
              ClearPath floats above any app as a small overlay panel.
              Capture any screen content, paste in text, or type a question,
              and ClearPath simplifies, explains, or guides you through it.
            </p>

            <div className="hero-in-3 flex flex-wrap items-center gap-3">
              <a
                href={DOWNLOAD_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
              >
                <Icon name="arrowDown" size={14} />
                Download Desktop App
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 text-sm font-medium px-4 py-2.5 transition-colors"
              >
                See how it works
                <span className="text-slate-400"><Icon name="arrowRight" size={14} /></span>
              </a>
            </div>

            <p className="hero-in-4 text-[12px] text-slate-400 mt-5 sm:mt-6">
              Windows · Free to download · Overlay Mode requires the desktop app
            </p>
          </div>

          {/* Mockup: hidden on small phones, visible on tablets and desktop */}
          <div className="hidden sm:block lg:block">
            <div className="relative">
              <OverlayMockup />
              <div
                className="absolute -bottom-3 left-6 right-6 h-6 rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, #0f172a 0%, transparent 70%)' }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-4 sm:mt-5 text-center font-medium">
              Visual preview, not interactive
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT IT DOES ─────────────────────────────────── */}
      <section id="how-it-works" className="py-14 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="grid lg:grid-cols-[0.9fr_1.6fr] gap-10 lg:gap-16">
            <div ref={reveal(ri++)} className="reveal-up">
              <SectionHeading
                label="What it does"
                title={<>Digital content,<br />made easier to handle.</>}
                body="ClearPath helps you simplify, understand, and complete difficult digital tasks: emails, forms, notices, and articles. You choose the support mode that fits you right now."
              />
              <p className="text-[13px] text-slate-400 leading-relaxed mt-4">
                No account. No setup. No clinical language.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-7 sm:gap-y-8 mt-8 lg:mt-0">
              {WHAT_IT_DOES.map(({ icon, title, desc }, i) => (
                <div key={title} ref={reveal(ri++)}
                  className={`reveal-up stagger-${(i % 4) + 1}`}>
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 mb-3 border border-slate-200/70">
                    <Icon name={icon} size={18} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1.5 text-[15px]">{title}</h3>
                  <p className="text-[13.5px] text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OVERLAY MODE ─────────────────────────────────── */}
      <section id="overlay-mode" className="py-14 sm:py-20 lg:py-24 bg-slate-900 border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div ref={reveal(ri++)} className="reveal-up max-w-2xl mb-8 sm:mb-12 lg:mb-14">
            <SectionHeading
              dark
              label="Primary feature · Desktop only"
              labelColor="text-emerald-400"
              title="Overlay Mode"
              body="A compact 400px panel that floats above every other window on your screen. Start a session, capture anything on your screen with one click, and get instant support in your chosen mode. No uploading. No setup."
            />
          </div>

          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-start">
            <div ref={reveal(ri++)} className="reveal-left space-y-6 sm:space-y-7">
              {[
                {
                  num: '01',
                  title: 'Start a session',
                  desc: 'Tap Start Session and ClearPath becomes active, floating above every other open window. Choose your support mode first.',
                },
                {
                  num: '02',
                  title: 'Analyze Screen with one click',
                  desc: 'Click Analyze Screen. Your operating system opens its own native picker and you select exactly which window, app, or region to capture. Nothing is captured until you confirm.',
                },
                {
                  num: '03',
                  title: 'Text is read locally, on your device',
                  desc: 'ClearPath extracts the text from your capture using on-device OCR. Nothing is uploaded or sent anywhere. You can also crop to a specific region of the image to focus on.',
                },
                {
                  num: '04',
                  title: 'Choose how to process it',
                  desc: 'Simplify (plain English), Explain (in detail), Steps (break into tasks), or Define (look up a word). The output is shaped by your active mode.',
                },
                {
                  num: '05',
                  title: 'End session when done',
                  desc: 'Tap End Session and the overlay returns to idle. No background activity, no stored captures, no continuous monitoring.',
                },
              ].map(({ num, title, desc }) => (
                <div key={num} className="flex gap-4 sm:gap-5">
                  <span className="text-[11px] font-mono text-slate-500 mt-0.5 tabular-nums flex-shrink-0">{num}</span>
                  <div className="flex-1 pb-6 sm:pb-7 border-b border-slate-800 last:border-0 last:pb-0">
                    <h3 className="font-semibold text-white mb-1.5 text-[15px]">{title}</h3>
                    <p className="text-[13.5px] text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <a
                  href={DOWNLOAD_URL}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
                >
                  <Icon name="arrowDown" size={14} />
                  Download for Windows
                </a>
                <p className="text-[12px] text-slate-500 mt-3">
                  Overlay Mode is available in the desktop app only.
                </p>
              </div>
            </div>

            <div ref={reveal(ri++)} className="reveal-right stagger-2 mt-4 lg:mt-0 lg:sticky lg:top-24">
              <OverlayMockup />
              <p className="text-[11px] text-slate-500 text-center mt-4">
                Draggable panel, always on top, session-based
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WORKSPACE MODE ─────────────────────────────── */}
      <section className="py-14 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div ref={reveal(ri++)} className="reveal-up max-w-2xl mb-10 sm:mb-12">
            <SectionHeading
              label="Secondary mode"
              title="Workspace Mode"
              body="A full-screen reading and analysis environment for when you want to go deeper into a document or piece of content."
            />
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-x-6 sm:gap-y-8 lg:gap-x-8">
            {[
              {
                num: '01',
                title: 'Upload or paste content',
                desc: 'Bring in any text: a document, article, notice, or set of instructions. The workspace formats it cleanly for processing.',
              },
              {
                num: '02',
                title: 'Get summaries, steps, simplified versions',
                desc: 'Transform content into a summary, step list, or fully simplified version, with side-by-side comparison.',
              },
              {
                num: '03',
                title: 'For deeper reading or analysis',
                desc: 'When you need more time and space, the workspace gives you all six adaptive modes, progress tracking, and read-aloud.',
              },
            ].map(({ num, title, desc }, i) => (
              <div key={num} ref={reveal(ri++)}
                className={`reveal-up stagger-${i + 1} border-t border-slate-200 pt-5`}>
                <p className="text-[11px] font-mono text-slate-400 mb-3 tabular-nums">{num}</p>
                <h3 className="font-semibold text-slate-900 mb-2 text-[15px]">{title}</h3>
                <p className="text-[13.5px] text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <p ref={reveal(ri++)} className="reveal-up text-[12px] text-slate-400 mt-8 sm:mt-10">
            Available in the desktop app and the browser.
          </p>
        </div>
      </section>

      {/* ── MODES ──────────────────────────────────────── */}
      <section id="modes" className="py-14 sm:py-20 lg:py-24 bg-slate-50/60 border-y border-slate-200/60">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div ref={reveal(ri++)} className="reveal-up max-w-2xl mb-8 sm:mb-12">
            <SectionHeading
              label="Support modes"
              title="You choose your mode."
              body="Six modes, manually selected. ClearPath never assumes how you feel. You stay in control."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MODES.map((m, i) => (
              <div key={m.name} ref={reveal(ri++)}
                className={`reveal-scale stagger-${(i % 3) + 1} bg-white rounded-xl p-5 border transition-colors hover:border-slate-300`}
                style={{ borderColor: '#e2e8f0' }}>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                      style={{ background: m.accent }} />
                    <span className="font-semibold text-[15px]" style={{ color: m.accent }}>
                      {m.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 tabular-nums font-mono">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-[12px] text-slate-400 mb-3">{m.tagline}</p>
                <p className="text-[13.5px] text-slate-600 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIVACY / ETHICS ─────────────────────────── */}
      <section id="privacy" className="py-14 sm:py-20 lg:py-24 bg-slate-900">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="grid lg:grid-cols-[0.9fr_1.6fr] gap-10 lg:gap-16">
            <div ref={reveal(ri++)} className="reveal-left">
              <SectionHeading
                dark
                label="Ethics and privacy"
                labelColor="text-teal-400"
                title="Designed with care."
                body="ClearPath was built to support people, not to label, monitor, or exploit them."
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-7 sm:gap-y-8 mt-2 lg:mt-0">
              {ETHICS.map(({ icon, title, desc }, i) => (
                <div key={title} ref={reveal(ri++)} className={`reveal-up stagger-${(i % 2) + 1}`}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-teal-300 mb-3"
                    style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.18)' }}>
                    <Icon name={icon} size={18} />
                  </div>
                  <h3 className="font-semibold text-white mb-1.5 text-[15px]">{title}</h3>
                  <p className="text-[13.5px] text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DOWNLOAD CTA ─────────────────────────────── */}
      <section id="download" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <div ref={reveal(ri++)} className="reveal-up text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600 mb-3">
              Get ClearPath
            </p>
            <h2 className="text-[22px] sm:text-[28px] lg:text-[32px] font-semibold text-slate-900 leading-[1.15] tracking-tight mb-4">
              Download the desktop app.
            </h2>
            <p className="text-[15px] text-slate-600 leading-relaxed mb-7 sm:mb-8 max-w-lg mx-auto">
              ClearPath runs as a lightweight floating assistant on Windows.
              Overlay Mode, screen capture, all six support modes, and read-aloud
              are included. Free to download.
            </p>

            <div className="flex flex-col items-center gap-3">
              <a
                href={DOWNLOAD_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-6 py-3 rounded-md transition-colors"
              >
                <Icon name="arrowDown" size={14} />
                Download for Windows
              </a>
              <p className="text-[12px] text-slate-400 px-4 text-center">
                Desktop app required for Overlay Mode · Windows 10 or later · Free
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200/70 py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-8">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 text-indigo-700">
                  <ClearPathLogo size={24} />
                </div>
                <span className="font-semibold text-slate-900 text-[15px]">ClearPath</span>
                <span className="text-[10px] font-mono text-slate-400 ml-0.5 tracking-wider">BY ODAI</span>
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Adaptive support for digital tasks, based on how you feel.
                No diagnosis. No labels. Just clarity.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 sm:gap-x-14 gap-y-2 text-[13px]">
              {[
                ['How it works', '#how-it-works'],
                ['Overlay Mode', '#overlay-mode'],
                ['Modes',        '#modes'],
                ['Privacy',      '#privacy'],
                ['Download',     '#download'],
              ].map(([label, href]) => (
                <a key={label} href={href} className="text-slate-500 hover:text-slate-900 transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/70 flex flex-col md:flex-row items-center justify-between gap-3 text-[12px] text-slate-400 text-center md:text-left">
            <span>© {new Date().getFullYear()} ClearPath · Powered by ODAI</span>
            <span>ClearPath does not diagnose, assess, or label users in any way.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
