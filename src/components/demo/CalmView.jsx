import { useState } from 'react';
import OriginalNotice from './OriginalNotice';

export default function CalmView({ step, onStepChange }) {
  const [fontSize, setFontSize] = useState('normal');

  const sizes = { small: 'text-xs', normal: 'text-sm', large: 'text-base' };

  return (
    <div className="max-w-2xl mx-auto px-6 py-6">

      {/* Mode note */}
      <div className="flex items-center justify-between mb-5 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
        <p className="text-indigo-700 text-sm font-medium">
          🌿 You can switch modes anytime using the panel on the right.
        </p>
        <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
          {(['small', 'normal', 'large']).map(sz => (
            <button
              key={sz}
              onClick={() => setFontSize(sz)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                fontSize === sz
                  ? 'bg-indigo-500 text-white'
                  : 'bg-indigo-100 text-indigo-500 hover:bg-indigo-200'
              }`}
            >
              {sz === 'small' ? 'A' : sz === 'normal' ? 'A' : 'A'}
              {sz === 'small' && <span className="text-[9px]"> –</span>}
              {sz === 'large' && <span className="text-[9px]"> +</span>}
            </button>
          ))}
          <span className="text-indigo-300 text-xs ml-1">Text size</span>
        </div>
      </div>

      {/* Full notice */}
      <div className={sizes[fontSize]}>
        <OriginalNotice step={step} onStepChange={onStepChange} />
      </div>
    </div>
  );
}
