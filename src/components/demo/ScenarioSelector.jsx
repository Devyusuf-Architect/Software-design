export default function ScenarioSelector({ scenarios, currentId, onSelect }) {
  return (
    <div className="w-full">
      <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">
        Choose a scenario:
      </p>
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {scenarios.map((scenario) => {
          const isActive = scenario.id === currentId;
          return (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario.id)}
              className={`flex-shrink-0 rounded-2xl border-2 px-4 py-3 cursor-pointer transition-all duration-200 text-left min-w-[140px] max-w-[180px] ${
                isActive
                  ? 'border-violet-400 bg-violet-50 ring-2 ring-violet-300'
                  : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="text-2xl mb-1">{scenario.icon}</div>
              <div
                className={`text-sm font-semibold leading-tight mb-0.5 ${
                  isActive ? 'text-violet-800' : 'text-slate-700'
                }`}
              >
                {scenario.label}
              </div>
              {scenario.description && (
                <div
                  className={`text-xs leading-snug ${
                    isActive ? 'text-violet-600' : 'text-slate-400'
                  }`}
                >
                  {scenario.description}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <style>{`
        .scenario-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
