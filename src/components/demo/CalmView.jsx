import { useState } from 'react';

const ZOOM = { small: 0.87, normal: 1, large: 1.15 };

export default function CalmView({ step, onStepChange, scenario }) {
  const [fontSize,     setFontSize]     = useState('normal');
  const [stepsOpen,    setStepsOpen]    = useState(false);

  if (!scenario) return null;

  const { simplifyOutput, taskSteps, formData } = scenario;
  const bullets = simplifyOutput?.bullets || [];
  const summary = simplifyOutput?.simple  || '';
  const action  = simplifyOutput?.action  || '';

  return (
    <div className="max-w-2xl mx-auto px-6 py-6">

      {/* ── Toolbar ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl">
        <p className="text-indigo-600 text-sm">
          🌿 <span className="font-medium">Calm Mode</span>
          <span className="text-indigo-400 ml-2 font-normal">— full information, no urgency</span>
        </p>
        <div className="flex items-center gap-1 flex-shrink-0">
          {[
            { id: 'small',  label: 'A–' },
            { id: 'normal', label: 'A'  },
            { id: 'large',  label: 'A+' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFontSize(id)}
              aria-label={`${id} text size`}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold btn-micro transition-colors ${
                fontSize === id
                  ? 'bg-indigo-500 text-white'
                  : 'bg-indigo-100 text-indigo-500 hover:bg-indigo-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content (scaled by zoom) ──────────────── */}
      <div style={{ zoom: ZOOM[fontSize] }}>

        {/* Summary card */}
        <div className="mb-5 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Summary</p>
          <p className="text-slate-700 text-base leading-relaxed">{summary}</p>
        </div>

        {/* Key points */}
        {bullets.length > 0 && (
          <div className="mb-5 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Key Points</p>
            <ul className="space-y-2">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  <span className="text-slate-700 text-sm leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action guidance */}
        {action && (
          <div className="mb-5 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">What to do</p>
            <p className="text-indigo-800 text-sm leading-relaxed">{action}</p>
          </div>
        )}

        {/* Collapsible task steps */}
        {taskSteps?.length > 0 && (
          <div className="mb-5">
            <button
              onClick={() => setStepsOpen(v => !v)}
              className="w-full flex items-center justify-between px-5 py-3 bg-white border border-slate-200 rounded-2xl text-left btn-micro transition-colors hover:bg-slate-50"
            >
              <span className="text-sm font-semibold text-slate-700">
                📋 Task Steps ({taskSteps.length})
              </span>
              <span className="text-slate-400 text-sm">
                {stepsOpen ? '▲ Hide' : '▼ Show'}
              </span>
            </button>

            {stepsOpen && (
              <div className="mt-2 space-y-2 slide-in-up">
                {taskSteps.map((s, i) => {
                  const done    = i < step;
                  const current = i === step;
                  return (
                    <button
                      key={s.id}
                      onClick={() => !done && onStepChange(i)}
                      className={`w-full flex items-start gap-3 px-4 py-3 rounded-2xl border text-left transition-all btn-micro ${
                        done    ? 'border-green-200 bg-green-50 opacity-70'
                        : current ? 'border-indigo-300 bg-indigo-50 shadow-sm'
                        :           'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                        done    ? 'bg-green-400 border-green-400'
                        : current ? 'border-indigo-400 bg-white'
                        :           'border-slate-200'
                      }`}>
                        {done && <span className="text-white text-xs font-bold">✓</span>}
                        {current && <span className="w-2 h-2 bg-indigo-400 rounded-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${
                          done ? 'line-through text-slate-400' : current ? 'text-indigo-900' : 'text-slate-700'
                        }`}>
                          {s.title}
                        </p>
                        {current && (
                          <p className="text-indigo-600 text-xs mt-0.5 leading-relaxed">{s.description}</p>
                        )}
                        {done && (
                          <p className="text-green-500 text-xs mt-0.5">{s.completion}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Reassurance footer */}
        <p className="text-center text-xs text-slate-400 pb-2">
          You can switch modes anytime using the panel on the right.
          There is no time limit here.
        </p>
      </div>
    </div>
  );
}
