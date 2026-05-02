import { useState } from 'react';
import OriginalNotice from './OriginalNotice';

const ZOOM = { small: 0.82, normal: 1, large: 1.18 };

export default function CalmView({ step, onStepChange, scenario }) {
  const [fontSize, setFontSize] = useState('normal');

  return (
    <div className="max-w-2xl mx-auto px-6 py-6">

      {/* Mode note + text size controls */}
      <div className="flex items-center justify-between mb-5 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
        <p className="text-indigo-700 text-sm font-medium">
          🌿 You can switch modes anytime using the panel on the right.
        </p>
        <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
          {[
            { id: 'small',  label: 'A–', title: 'Smaller text' },
            { id: 'normal', label: 'A',  title: 'Normal text' },
            { id: 'large',  label: 'A+', title: 'Larger text' },
          ].map(({ id, label, title }) => (
            <button
              key={id}
              onClick={() => setFontSize(id)}
              title={title}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold btn-micro transition-colors ${
                fontSize === id
                  ? 'bg-indigo-500 text-white'
                  : 'bg-indigo-100 text-indigo-500 hover:bg-indigo-200'
              }`}
            >
              {label}
            </button>
          ))}
          <span className="text-indigo-300 text-xs ml-1">Text size</span>
        </div>
      </div>

      {/* Full notice — zoom scales all text uniformly */}
      <div style={{ zoom: ZOOM[fontSize] }}>
        <OriginalNotice step={step} onStepChange={onStepChange} />
      </div>
    </div>
  );
}
