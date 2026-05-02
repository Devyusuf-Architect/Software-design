import { useState, useEffect } from 'react';
import { TASK_STEPS, STRESSED_ENCOURAGEMENTS } from '../../data/demoContent';

export default function StressedView({ step, onStepChange, taskSteps, encouragements }) {
  const steps  = taskSteps    || TASK_STEPS;
  const encArr = encouragements || STRESSED_ENCOURAGEMENTS;
  const [flash, setFlash] = useState('');

  const handleComplete = (targetStep) => {
    if (targetStep !== step) return;
    const msg = encArr[Math.min(step, encArr.length - 1)];
    setFlash(msg);
    setTimeout(() => { setFlash(''); onStepChange(step + 1); }, 1600);
  };

  const pct = Math.round(((step) / steps.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-6 py-6">

      {/* Progress header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-green-700 text-sm font-semibold">
            {step} of {steps.length} steps done
            {step > 0 && <span className="ml-2 text-green-400 font-normal">· {pct}% complete</span>}
          </p>
          {flash && (
            <p className="text-green-500 text-xs font-medium animate-pulse">{flash}</p>
          )}
        </div>
        <div className="h-2.5 bg-green-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Gentle prompt */}
      <p className="text-green-600 text-sm italic mb-6">
        You don't need to do this all at once. Focus on one step at a time.
      </p>

      {/* Next step banner */}
      {step < steps.length && (
        <div className="mb-5 p-4 bg-green-100 border-2 border-green-300 rounded-2xl">
          <p className="text-[10px] text-green-500 uppercase tracking-widest font-bold mb-1">Now focus on</p>
          <p className="text-green-900 font-semibold text-base">{steps[step].title}</p>
          <p className="text-green-700 text-sm mt-1">{steps[step].tip}</p>
        </div>
      )}

      {/* Checklist */}
      <div className="space-y-2.5">
        {steps.map((s, i) => {
          const done    = i < step;
          const current = i === step;
          const locked  = i > step;
          return (
            <button
              key={s.id}
              onClick={() => current && handleComplete(i)}
              disabled={locked || done || !!flash}
              className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                done    ? 'border-green-200 bg-green-50/60 opacity-70'
                : current ? 'border-green-400 bg-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                :           'border-slate-100 bg-white opacity-30'
              }`}
            >
              {/* Circle */}
              <div className={`w-7 h-7 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                done    ? 'bg-green-400 border-green-400'
                : current ? 'border-green-500 bg-white'
                :           'border-slate-200'
              }`}>
                {done    && <span className="text-white text-sm font-bold check-animate">✓</span>}
                {current && <span className="w-2.5 h-2.5 bg-green-400 rounded-full" />}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-green-300">
                  Step {s.id}
                </span>
                <p className={`text-sm mt-0.5 font-semibold ${done ? 'line-through text-green-400' : current ? 'text-green-900' : 'text-slate-400'}`}>
                  {s.title}
                </p>
                {current && (
                  <p className="text-green-600 text-xs mt-1 leading-relaxed">{s.description}</p>
                )}
                {done && (
                  <p className="text-green-400 text-xs mt-0.5">{s.completion}</p>
                )}
              </div>

              {/* CTA */}
              {current && !flash && (
                <div className="flex-shrink-0 px-4 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-xl shadow-sm">
                  Done →
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Back */}
      {step > 0 && step < steps.length && (
        <button
          onClick={() => onStepChange(step - 1)}
          className="mt-4 text-sm text-green-400 hover:text-green-600 transition-colors"
        >
          ← Go back a step
        </button>
      )}

      {/* All done */}
      {step >= steps.length && (
        <div className="mt-6 p-5 bg-green-100 border border-green-200 rounded-2xl text-center">
          <p className="text-2xl mb-2">🌱</p>
          <p className="text-green-700 font-bold text-base">
            {steps[steps.length - 1].completion}
          </p>
          <p className="text-green-500 text-sm mt-1">Every step is done. That took real effort.</p>
        </div>
      )}
    </div>
  );
}
