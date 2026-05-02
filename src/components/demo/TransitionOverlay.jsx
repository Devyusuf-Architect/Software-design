import { modeConfigs } from '../../utils/modeConfigs';
import { MODE_MESSAGES as DEFAULT_MESSAGES } from '../../data/demoContent';

export default function TransitionOverlay({ mode, visible, modeMessages }) {
  const cfg = modeConfigs[mode];
  const msg = (modeMessages || DEFAULT_MESSAGES)[mode];

  return (
    <div
      className={`absolute inset-0 z-30 flex items-center justify-center transition-all duration-400 ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(4px)' }}
    >
      <div className="text-center px-8 py-10">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-lg"
          style={{ backgroundColor: cfg.hex.accentLight }}
        >
          {cfg.icon}
        </div>

        {/* Mode name */}
        <p className="text-2xl font-bold mb-2" style={{ color: cfg.hex.accent }}>
          {msg?.line1}
        </p>

        {/* Detail */}
        <p className="text-sm mb-6" style={{ color: cfg.hex.accent, opacity: 0.7 }}>
          {msg?.line2}
        </p>

        {/* ODAI attribution */}
        <p className="text-xs text-slate-400 mb-5">
          ClearPath — powered by ODAI — is adapting this page for you
        </p>

        {/* Loading dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 rounded-full inline-block"
              style={{
                backgroundColor: cfg.hex.accent,
                animation: `bounce 0.9s ${i * 0.18}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
