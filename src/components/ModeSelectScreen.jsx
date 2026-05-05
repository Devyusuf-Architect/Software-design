import { useState } from 'react';

const OVERLAY_FEATURES = [
  'Floating panel — stays on top while you work',
  'Paste any text for instant help',
  'Simplify, Explain, Define, or Step Guide',
  'Read Aloud with mode-matched voice',
  'Collapse to a small icon when not needed',
];

const WORKSPACE_FEATURES = [
  'Paste text or upload a TXT file',
  'Choose from real demo scenarios',
  'Full mode-by-mode content adaptation',
  'Before & after comparison view',
  'Step-by-step task guidance',
  'Save your session progress',
];

/* Mini floating-panel mockup (purely visual) */
function OverlayMockup() {
  return (
    <div className="relative flex items-center justify-center py-4 min-h-[200px]">
      {/* Blurred background suggesting "another app" */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-25">
        {[80, 60, 90, 50, 70].map((w, i) => (
          <div key={i} className="mx-4 mt-3 h-2 rounded-full bg-slate-400"
            style={{ width: `${w}%` }} />
        ))}
      </div>

      {/* Floating panel */}
      <div className="relative w-56 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-[#5C7A4E]">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🌿</span>
            <span className="text-white font-bold text-xs">ClearPath</span>
            <span className="bg-white/20 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full">Overlay</span>
          </div>
          <div className="flex gap-1">
            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-white/70 text-[10px]">━</div>
            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-white/70 text-[10px]">✕</div>
          </div>
        </div>
        {/* Body */}
        <div className="bg-white p-2.5 space-y-2">
          {/* Mode pill */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-[#E2EAD9] text-[#2A3D22]">
            <span>🌿 Calm mode</span>
            <span className="opacity-40">▾</span>
          </div>
          {/* Textarea */}
          <div className="px-2.5 py-2 rounded-xl border border-slate-200 text-[10px] text-slate-400 italic bg-slate-50">
            Paste text to analyse…
          </div>
          {/* Buttons */}
          <div className="grid grid-cols-2 gap-1">
            {['✨ Simplify','💡 Explain','📋 Steps','📖 Define'].map(b => (
              <div key={b} className="text-[9px] font-semibold px-2 py-1.5 rounded-lg text-center bg-[#E2EAD9] text-[#2A3D22]">
                {b}
              </div>
            ))}
          </div>
          {/* Output sample */}
          <div className="rounded-xl p-2 bg-[#E2EAD9]">
            <p className="text-[8px] font-bold uppercase tracking-widest text-[#5C7A4E] mb-1">Plain English</p>
            <p className="text-[9px] leading-relaxed text-[#2A3D22]">
              This notice requires your attention. You have time and options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Mini workspace mockup (purely visual) */
function WorkspaceMockup() {
  return (
    <div className="rounded-2xl overflow-hidden border border-violet-200 shadow-lg">
      {/* Browser chrome */}
      <div className="bg-slate-800 px-3 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          {['bg-red-400','bg-amber-400','bg-green-400'].map(c => (
            <div key={c} className={`w-2 h-2 rounded-full ${c}`} />
          ))}
        </div>
        <div className="flex-1 bg-slate-700 rounded text-[9px] text-slate-400 px-2 py-0.5 text-center">
          clearpath.app
        </div>
      </div>
      {/* Workspace body */}
      <div className="flex bg-white" style={{ height: 140 }}>
        {/* Content area */}
        <div className="flex-1 p-3 space-y-1.5 overflow-hidden">
          <div className="h-2.5 w-3/4 rounded bg-violet-100" />
          {[100, 83, 91, 67, 78].map((w, i) => (
            <div key={i} className="h-1.5 rounded bg-slate-100" style={{ width: `${w}%` }} />
          ))}
          <div className="flex gap-2 pt-1">
            <div className="flex-1 h-6 rounded-lg bg-violet-500 flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">✨ Simplify</span>
            </div>
            <div className="flex-1 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
              <span className="text-[8px] text-violet-700 font-semibold">📋 Steps</span>
            </div>
          </div>
        </div>
        {/* Right panel */}
        <div className="w-20 bg-violet-50 border-l border-violet-100 p-2 space-y-0.5">
          {[['🌿','Calm',true],['🌸','Over…',false],['🌥️','Foggy',false],['🌊','Anxious',false],['🌱','Stressed',false]].map(([icon, label, active]) => (
            <div key={label}
              className={`flex items-center gap-1 px-1 py-1 rounded-lg text-[8px] ${active ? 'bg-violet-200 text-violet-700 font-bold' : 'text-slate-400'}`}>
              <span>{icon}</span>{label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function ModeSelectScreen({ onSelectOverlay, onSelectWorkspace, onExit }) {
  const [hovering, setHovering] = useState(null);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center text-lg">🌿</div>
          <span className="font-bold text-slate-800 text-sm">ClearPath</span>
        </div>
        <button
          onClick={onExit}
          className="text-sm text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1"
        >
          ← Home
        </button>
      </header>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl">

          {/* Heading */}
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-3">Choose your experience</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-3 leading-tight">
              How would you like to use ClearPath?
            </h1>
            <p className="text-slate-500 text-lg max-w-lg mx-auto">
              Both modes use the same adaptive support. Choose based on how you want to work right now.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-5">

            {/* ── Overlay Mode ──────────────────────────────────── */}
            <button
              onClick={onSelectOverlay}
              onMouseEnter={() => setHovering('overlay')}
              onMouseLeave={() => setHovering(null)}
              className="text-left rounded-3xl p-7 flex flex-col gap-5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-700"
              style={{
                background: hovering === 'overlay' ? '#1E293B' : '#0F172A',
                transform: hovering === 'overlay' ? 'translateY(-3px)' : 'none',
                boxShadow: hovering === 'overlay'
                  ? '0 20px 60px rgba(0,0,0,0.3)'
                  : '0 8px 30px rgba(0,0,0,0.15)',
              }}
            >
              <div>
                <div className="inline-flex items-center gap-2 bg-green-900/60 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Primary Mode
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">🪟 Overlay Mode</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Use ClearPath as a floating assistant while working. Stays on top of any app or browser.
                </p>
              </div>

              <OverlayMockup />

              <ul className="space-y-2">
                {OVERLAY_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-400">
                    <span className="w-4 h-4 rounded-full bg-green-900/50 flex items-center justify-center text-green-400 text-[9px] flex-shrink-0 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div
                className="w-full py-3 rounded-2xl text-center text-sm font-bold transition-colors"
                style={{ background: '#5C7A4E', color: '#fff' }}
              >
                Open Overlay Mode →
              </div>
            </button>

            {/* ── Workspace Mode ────────────────────────────────── */}
            <button
              onClick={onSelectWorkspace}
              onMouseEnter={() => setHovering('workspace')}
              onMouseLeave={() => setHovering(null)}
              className="text-left rounded-3xl p-7 flex flex-col gap-5 bg-white border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
              style={{
                borderColor: hovering === 'workspace' ? '#a78bfa' : '#e2e8f0',
                transform: hovering === 'workspace' ? 'translateY(-3px)' : 'none',
                boxShadow: hovering === 'workspace'
                  ? '0 20px 60px rgba(139,92,246,0.15)'
                  : '0 4px 20px rgba(0,0,0,0.06)',
              }}
            >
              <div>
                <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                  Detailed Mode
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">📋 Workspace Mode</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Upload, paste, or analyse content in a full structured workspace. Deeper interaction, full processing.
                </p>
              </div>

              <WorkspaceMockup />

              <ul className="space-y-2">
                {WORKSPACE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-500">
                    <span className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-[9px] flex-shrink-0 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div
                className="w-full py-3 rounded-2xl text-center text-sm font-bold transition-colors bg-violet-500 hover:bg-violet-600 text-white"
              >
                Open Workspace Mode →
              </div>
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-400 mt-8">
            Full system-level overlay available in the{' '}
            <a
              href="https://github.com/Devyusuf-Architect/Software-design/releases/download/v1.0.5/ClearPath_1.0.0_x64-setup.exe"
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 underline hover:text-slate-900 transition-colors"
            >
              Windows desktop app
            </a>
            . This is a web simulation.
          </p>
        </div>
      </main>
    </div>
  );
}
