import { useState } from 'react';
import { SIMPLIFY_OUTPUT } from '../../data/demoContent';

const TABS = [
  { id: 'simple',  label: 'Simple version', icon: '💬' },
  { id: 'bullets', label: 'Key points',      icon: '•·' },
  { id: 'action',  label: 'What to do',      icon: '🎯' },
];

export default function SimplifyOutput({ onClose, accentHex = '#7C3AED', accentLight = '#EDE9FE' }) {
  const [tab, setTab] = useState('simple');

  return (
    <div className="mt-4 rounded-2xl border-2 overflow-hidden" style={{ borderColor: accentHex + '40' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: accentLight }}>
        <p className="text-sm font-bold" style={{ color: accentHex }}>✨ Simplified view</p>
        <button onClick={onClose} className="text-xs opacity-50 hover:opacity-100 transition-opacity" style={{ color: accentHex }}>
          ✕ Close
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-xs font-semibold transition-colors duration-150 ${
              tab === t.id ? 'text-white' : 'text-slate-400 hover:text-slate-600'
            }`}
            style={tab === t.id ? { backgroundColor: accentHex } : {}}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
        {tab === 'simple' && (
          <p className="text-sm text-slate-700 leading-relaxed">{SIMPLIFY_OUTPUT.simple}</p>
        )}
        {tab === 'bullets' && (
          <ul className="space-y-2">
            {SIMPLIFY_OUTPUT.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                  style={{ backgroundColor: accentHex }}>
                  {i + 1}
                </span>
                {b}
              </li>
            ))}
          </ul>
        )}
        {tab === 'action' && (
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: accentHex }}>
              What you need to do
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{SIMPLIFY_OUTPUT.action}</p>
          </div>
        )}
      </div>
    </div>
  );
}
