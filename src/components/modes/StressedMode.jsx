import { useState, useEffect } from 'react';
import { breakIntoSteps } from '../../utils/textProcessing';

export default function StressedMode({ text, config }) {
  const [steps, setSteps] = useState(() => {
    const saved = localStorage.getItem('clearpath_stressed_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const fresh = breakIntoSteps(text);
        return fresh.map(s => ({ ...s, completed: parsed[s.id] ?? false }));
      } catch { /* fall through */ }
    }
    return breakIntoSteps(text);
  });
  const [saveFlash, setSaveFlash] = useState(false);

  const completed = steps.filter(s => s.completed).length;
  const total = steps.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const allDone = completed === total && total > 0;

  // Reset steps when text changes
  useEffect(() => {
    setSteps(breakIntoSteps(text));
    localStorage.removeItem('clearpath_stressed_progress');
  }, [text]);

  const toggleStep = (id) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const saveProgress = () => {
    const map = {};
    steps.forEach(s => { map[s.id] = s.completed; });
    localStorage.setItem('clearpath_stressed_progress', JSON.stringify(map));
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2200);
  };

  if (total === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-green-400 text-lg">No content to display yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pb-10">

      {/* Progress header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-green-700 text-sm font-semibold">
            {completed} of {total} steps done
            {completed > 0 && <span className="ml-2 text-green-400 font-normal">— keep going!</span>}
          </p>
          <button
            onClick={saveProgress}
            className={`flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-xl font-medium transition-all duration-200 ${
              saveFlash
                ? 'bg-green-500 text-white shadow-sm shadow-green-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {saveFlash ? '✓ Saved!' : '💾 Save progress'}
          </button>
        </div>
        <div className="h-2 bg-green-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Gentle prompt */}
      <p className="text-green-600 text-sm italic mb-6">{config.prompt}</p>

      {/* Steps list */}
      <div className="space-y-2.5">
        {steps.map((step, i) => (
          <button
            key={step.id}
            onClick={() => toggleStep(step.id)}
            className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 group ${
              step.completed
                ? 'border-green-200 bg-green-50/60 opacity-60'
                : 'border-green-100 bg-white hover:border-green-300 hover:bg-green-50 hover:shadow-sm'
            }`}
          >
            {/* Checkbox */}
            <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200 ${
              step.completed
                ? 'bg-green-400 border-green-400'
                : 'border-green-300 group-hover:border-green-400'
            }`}>
              {step.completed && (
                <span className="text-white text-xs font-bold check-animate">✓</span>
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-green-300 font-mono font-bold uppercase tracking-wider">
                Step {i + 1}
              </span>
              <p className={`text-green-900 text-sm mt-0.5 leading-relaxed ${
                step.completed ? 'line-through text-green-400' : ''
              }`}>
                {step.text}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Completion celebration */}
      {allDone && (
        <div className="mt-6 p-5 bg-green-100 border border-green-200 rounded-2xl text-center">
          <p className="text-2xl mb-1">🌱</p>
          <p className="text-green-700 font-semibold">Every step is done. Well done — that took real effort.</p>
        </div>
      )}
    </div>
  );
}
