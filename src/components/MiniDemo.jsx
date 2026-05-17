import { useState, useEffect, useRef } from 'react';

/* ── Demo content (payment notice) ─────────────────────────────── */
const NOTICE = {
  total:    '$128.45',
  due:      'May 5, 2026',
  monthly:  '$47.00',
  account:  '#847291-B',
  late:     '$25.00',
};

const MODES = [
  { id: 'calm',        label: 'Calm',        color: '#4338ca', pill: '#eef2ff', tagline: 'Full info, clear layout' },
  { id: 'overwhelmed', label: 'Overwhelmed', color: '#7c3aed', pill: '#f5f3ff', tagline: 'One thing at a time'      },
  { id: 'foggy',       label: 'Foggy',       color: '#b45309', pill: '#fffbeb', tagline: 'Key terms highlighted'    },
  { id: 'anxious',     label: 'Anxious',     color: '#0d9488', pill: '#f0fdfa', tagline: 'Urgency removed'          },
  { id: 'stressed',    label: 'Stressed',    color: '#15803d', pill: '#f0fdf4', tagline: 'Step by step'             },
  { id: 'original',    label: 'Original',    color: '#475569', pill: '#f1f5f9', tagline: 'Unmodified view'          },
];

/* ── Render **bold** markdown inline ───────────────────────────── */
function Marked({ children }) {
  const parts = String(children).split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**')
          ? <strong key={i} className="font-semibold text-amber-800">{p.slice(2, -2)}</strong>
          : p
      )}
    </>
  );
}

/* ── Calm ───────────────────────────────────────────────────────── */
function CalmContent() {
  return (
    <div className="space-y-4 text-[14px] leading-relaxed text-slate-700">
      <div className="grid grid-cols-2 gap-3">
        {[
          ['Amount due',   NOTICE.total],
          ['Due date',     NOTICE.due],
          ['Account',      NOTICE.account],
          ['Late fee',     `+${NOTICE.late} if unpaid`],
        ].map(([label, val]) => (
          <div key={label} className="bg-slate-50 rounded-lg px-3.5 py-2.5 border border-slate-200/70">
            <p className="text-[11px] text-slate-400 mb-0.5 uppercase tracking-wide font-medium">{label}</p>
            <p className="font-semibold text-slate-900 text-[14px]">{val}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 pt-4 space-y-2.5">
        <p className="text-[13px] font-medium text-slate-700">Your payment options:</p>
        <div className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
          <p>Pay {NOTICE.total} in full today.</p>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
          <p>Pay {NOTICE.monthly}/month for 3 months.</p>
        </div>
      </div>
      <p className="text-[12px] text-slate-400 border-t border-slate-200 pt-3">
        Contact: clearpath-billing.com or 1-800-555-0147
      </p>
    </div>
  );
}

/* ── Overwhelmed (step-through) ─────────────────────────────────── */
const OW_STEPS = [
  {
    heading: 'You have a bill.',
    body:    `The amount is ${NOTICE.total}.`,
    note:    'You only need to remember this number.',
    breath:  'Take a breath. This is one piece of information.',
  },
  {
    heading: `It is due ${NOTICE.due}.`,
    body:    'You still have time.',
    note:    'Reading this does not mean you have to pay right now.',
    breath:  'Good. One fact at a time.',
  },
  {
    heading: 'You have two ways to pay.',
    body:    `All at once (${NOTICE.total}), or ${NOTICE.monthly} a month for 3 months.`,
    note:    'Both options are valid. Pick whichever works for you.',
    breath:  "That is everything. You know what this is about.",
  },
];

function OverwhelmedContent() {
  const [step, setStep] = useState(0);
  const s = OW_STEPS[step];

  return (
    <div className="space-y-4">
      {/* Progress dots */}
      <div className="flex items-center gap-1.5 justify-center">
        {OW_STEPS.map((_, i) => (
          <span key={i} className="rounded-full transition-all duration-300"
            style={{
              width:  i === step ? 20 : 6,
              height: 6,
              background: i === step ? '#7c3aed' : i < step ? '#c4b5fd' : '#e2e8f0',
            }} />
        ))}
      </div>

      {/* Content */}
      <div className="rounded-xl p-4 sm:p-5" style={{ background: '#faf5ff', border: '1px solid #ede9fe' }}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-400 mb-2">
          Step {step + 1} of {OW_STEPS.length}
        </p>
        <p className="text-[18px] sm:text-[20px] font-semibold text-slate-900 mb-1.5 leading-snug">
          {s.heading}
        </p>
        <p className="text-[15px] text-slate-700 mb-3">{s.body}</p>
        <p className="text-[12px] text-slate-500 italic">{s.note}</p>
      </div>

      {/* Breathe prompt */}
      <p className="text-[12px] text-violet-400 text-center italic">{s.breath}</p>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="text-[13px] text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1.5"
        >
          Back
        </button>
        {step < OW_STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="text-[13px] font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 px-4 py-1.5 rounded-lg transition-colors border border-violet-200"
          >
            Next piece
          </button>
        ) : (
          <button
            onClick={() => setStep(0)}
            className="text-[13px] font-medium text-violet-500 hover:text-violet-700 transition-colors px-2 py-1.5"
          >
            Start over
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Foggy ───────────────────────────────────────────────────────── */
const FOGGY_SECTIONS = [
  {
    title: 'Amount',
    text:  `Your account balance of **${NOTICE.total}** is past due.`,
  },
  {
    title: 'Due date',
    text:  `Payment is required by **${NOTICE.due}**. A late fee of **${NOTICE.late}** applies after this date.`,
  },
  {
    title: 'Option 1',
    text:  `Pay the full amount of **${NOTICE.total}** today.`,
  },
  {
    title: 'Option 2',
    text:  `Set up a payment plan: **${NOTICE.monthly}/month for 3 months**.`,
  },
  {
    title: 'Contact',
    text:  `**clearpath-billing.com** or call **1-800-555-0147**`,
  },
];

function FoggyContent() {
  return (
    <div className="space-y-3 text-[14px]">
      {FOGGY_SECTIONS.map(({ title, text }) => (
        <div key={title} className="flex gap-3 items-start">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 w-14 flex-shrink-0 pt-0.5">
            {title}
          </span>
          <p className="text-slate-700 leading-relaxed flex-1">
            <Marked>{text}</Marked>
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── Anxious ─────────────────────────────────────────────────────── */
function AnxiousContent() {
  return (
    <div className="space-y-4 text-[14px] leading-relaxed text-slate-700">
      {/* Reassurance bar */}
      <div className="rounded-lg px-3.5 py-2.5 text-[13px]"
        style={{ background: '#f0fdfa', border: '1px solid #99f6e4', color: '#0f766e' }}>
        This is a payment reminder. There is nothing urgent happening right now.
      </div>

      <p>
        Your account has a balance of {NOTICE.total}. The payment date is {NOTICE.due}.
        You have time to review your options.
      </p>
      <p>
        There are two ways to handle this. You can pay the full amount at once, or spread it across three months.
        Both are completely fine choices.
      </p>
      <p>
        You do not need to decide right now. You can close this, take a break, and return when you feel ready.
        Nothing is submitted until you choose to act.
      </p>

      <div className="rounded-lg px-3.5 py-2.5 text-[12px] text-slate-500"
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        What to expect: 2 simple options. No unexpected forms. No automatic charges.
      </div>
    </div>
  );
}

/* ── Stressed ────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, text: `Check the amount: ${NOTICE.total}`                            },
  { id: 2, text: `Note the due date: ${NOTICE.due}`                             },
  { id: 3, text: 'Choose: pay in full, or set up monthly payments'               },
  { id: 4, text: 'Go to clearpath-billing.com or call 1-800-555-0147'           },
  { id: 5, text: 'Make your payment and save the confirmation'                  },
];

function StressedContent() {
  const [done, setDone] = useState({});
  const toggle = (id) => setDone(d => ({ ...d, [id]: !d[id] }));
  const count = Object.values(done).filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(count / STEPS.length) * 100}%`, background: '#15803d' }}
          />
        </div>
        <span className="text-[11px] text-slate-400 tabular-nums">{count}/{STEPS.length}</span>
      </div>

      {STEPS.map(({ id, text }) => (
        <button
          key={id}
          onClick={() => toggle(id)}
          className="w-full flex items-start gap-3 text-left group"
        >
          <span
            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all duration-200"
            style={{
              background:   done[id] ? '#15803d' : 'transparent',
              borderColor:  done[id] ? '#15803d' : '#d1d5db',
            }}
          >
            {done[id] && (
              <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className={`text-[14px] leading-relaxed transition-colors duration-200 ${
            done[id] ? 'line-through text-slate-400' : 'text-slate-700 group-hover:text-slate-900'
          }`}>
            {text}
          </span>
        </button>
      ))}

      {count === STEPS.length && (
        <p className="text-[13px] text-green-700 font-medium text-center pt-2">
          All done. You handled that one step at a time.
        </p>
      )}
    </div>
  );
}

/* ── Original ────────────────────────────────────────────────────── */
function OriginalContent() {
  return (
    <div className="text-[13px] sm:text-[14px] leading-relaxed text-slate-600 space-y-3 font-mono">
      <p className="font-semibold text-slate-900 not-italic uppercase tracking-wide text-[11px]">
        ACCOUNT {NOTICE.account} - PAYMENT REQUIRED
      </p>
      <p>
        Your outstanding balance of {NOTICE.total} is 67 days past due. Failure to respond within
        72 hours may result in additional fees of {NOTICE.late} and referral to a collections agency.
      </p>
      <p>
        Payment is due by {NOTICE.due}. To avoid further charges you must remit payment immediately.
      </p>
      <p>
        <strong>Option 1:</strong> Pay {NOTICE.total} in full.{' '}
        <strong>Option 2:</strong> Enrol in a 3-month payment plan at {NOTICE.monthly}/month.
        By proceeding you agree to our Terms of Service (section 18.4, arbitration clause applies).
      </p>
      <p>
        Visit clearpath-billing.com or call 1-800-555-0147 Mon-Fri 9am-5pm EST. Do not ignore
        this notice.
      </p>
    </div>
  );
}

/* ── MiniDemo (main export) ─────────────────────────────────────── */
export default function MiniDemo() {
  const [open,     setOpen]     = useState(false);
  const [activeId, setActiveId] = useState('calm');
  const [animKey,  setAnimKey]  = useState(0);
  const contentRef = useRef(null);

  const active = MODES.find(m => m.id === activeId);

  function switchMode(id) {
    if (id === activeId) return;
    setActiveId(id);
    setAnimKey(k => k + 1);
  }

  return (
    <section id="demo" className="py-14 sm:py-20 lg:py-24 bg-white border-b border-slate-200/60">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">

        {/* Header - always visible */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600 mb-3">
            Live preview
          </p>
          <h2 className="text-[22px] sm:text-[28px] lg:text-[32px] font-semibold text-slate-900 leading-[1.15] tracking-tight mb-3">
            Same content. Six different views.
          </h2>
          <p className="text-[15px] text-slate-600 leading-relaxed mb-7">
            Watch a payment notice transform across all six modes.
            This is exactly how ClearPath works on real content.
          </p>

          {/* Toggle button */}
          {!open ? (
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-medium px-6 py-3 rounded-lg transition-colors shadow-sm shadow-indigo-200"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Try the demo
            </button>
          ) : (
            <button
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 text-[13px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
              Close demo
            </button>
          )}
        </div>

        {/* Expandable demo - only rendered when open */}
        {open && (
          <div className="mt-8 sm:mt-10 demo-content-enter">

            {/* Mode picker */}
            <div className="flex flex-wrap justify-center gap-2 mb-7 sm:mb-8">
              {MODES.map(m => {
                const isActive = m.id === activeId;
                return (
                  <button
                    key={m.id}
                    onClick={() => switchMode(m.id)}
                    className="px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border"
                    style={{
                      background:  isActive ? m.color : m.pill,
                      color:       isActive ? '#fff'  : m.color,
                      borderColor: isActive ? m.color : 'transparent',
                      boxShadow:   isActive ? `0 0 0 3px ${m.color}22` : 'none',
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Demo card */}
            <div
              className="rounded-2xl overflow-hidden border shadow-sm"
              style={{ borderColor: `${active.color}22` }}
            >
              {/* Card header */}
              <div
                className="px-4 sm:px-5 py-3 flex items-center gap-2.5 border-b"
                style={{ background: `${active.color}0d`, borderColor: `${active.color}22` }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: active.color }} />
                <span className="font-semibold text-[13px]" style={{ color: active.color }}>
                  {active.label} mode
                </span>
                <span className="text-[12px] text-slate-400 ml-auto hidden sm:inline">
                  {active.tagline}
                </span>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-1 sm:ml-0">
                  demo
                </span>
              </div>

              {/* Content area */}
              <div
                ref={contentRef}
                key={animKey}
                className="p-4 sm:p-6 demo-content-enter"
                style={{ background: active.id === 'original' ? '#f8fafc' : '#fff', minHeight: 220 }}
              >
                {activeId === 'calm'        && <CalmContent />}
                {activeId === 'overwhelmed' && <OverwhelmedContent />}
                {activeId === 'foggy'       && <FoggyContent />}
                {activeId === 'anxious'     && <AnxiousContent />}
                {activeId === 'stressed'    && <StressedContent />}
                {activeId === 'original'    && <OriginalContent />}
              </div>

              {/* Card footer */}
              <div
                className="px-4 sm:px-5 py-2.5 border-t flex items-center gap-2 text-[11px] text-slate-400"
                style={{ borderColor: `${active.color}22`, background: `${active.color}06` }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="11" x2="12" y2="16" />
                  <circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none" />
                </svg>
                Content is a sample payment notice used for demonstration purposes only.
              </div>
            </div>

            {/* CTA under demo */}
            <p className="text-center text-[13px] text-slate-500 mt-5 sm:mt-6">
              Use it on any real content - emails, forms, articles, documents.{' '}
              <a
                href="https://github.com/Devyusuf-Architect/Software-design/releases/download/v1.1.0/ClearPath_1.0.0_x64-setup.exe"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2 transition-colors"
              >
                Download the app
              </a>{' '}
              to run it on your own screen.
            </p>

          </div>
        )}

      </div>
    </section>
  );
}
