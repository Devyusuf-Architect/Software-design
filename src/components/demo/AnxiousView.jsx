import { NOTICE, TASK_STEPS } from '../../data/demoContent';

const CALM_SECTIONS = [
  {
    id: 'intro',
    label: 'What this notice is about',
    content: `This is a payment reminder for your account (${NOTICE.accountNumber}). There is a balance of ${NOTICE.totalDue} that needs your attention. You can review this at your own pace before deciding what to do.`,
  },
  {
    id: 'amount',
    label: 'The amount involved',
    content: `The total amount is ${NOTICE.totalDue}. This includes your original balance of ${NOTICE.original} and some additional charges. No action is required right now — this is for your information.`,
  },
  {
    id: 'timing',
    label: 'The timing',
    content: `There is a due date of ${NOTICE.dueDate}. You still have time to review your options carefully. Nothing needs to happen immediately while you are reading this.`,
  },
  {
    id: 'options',
    label: 'Your options — no rush to decide',
    content: `You can choose to pay the full amount (${NOTICE.totalDue}), or you may be able to arrange a payment plan at ${NOTICE.planMonthly} per month. Both are valid choices. There is no pressure to decide right now.`,
  },
  {
    id: 'next',
    label: 'When you are ready to proceed',
    content: `When you feel ready, you can fill in your payment details and submit. You can also save your progress and return later. Nothing will be submitted without your deliberate action.`,
  },
];

export default function AnxiousView({ step, onStepChange, onModeChange }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-6">

      {/* Safety / reassurance strip */}
      <div className="flex items-center justify-between p-4 bg-teal-100 rounded-2xl border border-teal-200 mb-6">
        <div>
          <p className="text-teal-800 font-semibold text-sm">You are safe here</p>
          <p className="text-teal-600 text-xs mt-0.5">
            You can review this without submitting anything. Nothing happens until you decide.
          </p>
        </div>
        <button
          onClick={() => onModeChange?.('calm')}
          className="ml-4 flex-shrink-0 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
        >
          Exit to safety →
        </button>
      </div>

      {/* What to expect — reduces uncertainty */}
      <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl mb-6">
        <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-2">What to expect on this page</p>
        <ul className="space-y-1.5">
          {[
            `A payment reminder for ${NOTICE.totalDue}`,
            `Due date: ${NOTICE.dueDate} — you still have time`,
            `${CALM_SECTIONS.length} short sections — no pop-ups or sudden changes`,
            'Nothing is submitted until you choose to submit',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-teal-700 text-sm">
              <span className="w-4 h-4 bg-teal-200 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] text-teal-600 font-bold">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Calm heading */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-teal-900 mb-1">
          Payment reminder — here is what needs your attention
        </h2>
        <p className="text-teal-600 text-sm">
          Take as long as you need. Each section is short.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {CALM_SECTIONS.map((sec, i) => {
          const isActive = i === step;
          const isDone   = i < step;
          const isLocked = i > step;
          return (
            <div key={sec.id}
              className={`rounded-2xl p-5 border transition-all duration-300 ${
                isActive  ? 'border-teal-300 bg-teal-50 shadow-sm'
                : isDone   ? 'border-teal-100 bg-white opacity-75'
                :            'border-slate-100 bg-white opacity-35'
              }`}
              style={{ animation: isActive ? 'gentleIn 0.4s ease forwards' : undefined }}
            >
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${
                isActive ? 'text-teal-500' : isDone ? 'text-teal-300' : 'text-slate-300'
              }`}>
                {i + 1} of {CALM_SECTIONS.length} · {sec.label}
                {isDone && <span className="ml-2 text-teal-400">✓</span>}
              </p>
              <p className={`text-sm leading-relaxed ${isActive ? 'text-teal-900' : 'text-teal-700'}`}>
                {sec.content}
              </p>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => onStepChange(step - 1)}
          disabled={step === 0}
          className="px-5 py-2.5 border-2 border-teal-200 text-teal-700 rounded-xl text-sm font-medium disabled:opacity-30 hover:bg-teal-50 transition-all"
        >
          ← Back
        </button>
        {step < TASK_STEPS.length - 1 ? (
          <button
            onClick={() => onStepChange(step + 1)}
            className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-teal-200 transition-all"
          >
            Next section →
          </button>
        ) : (
          <div className="px-5 py-2.5 bg-teal-100 text-teal-700 rounded-xl text-sm font-semibold">All done ✓</div>
        )}
      </div>

      {step === TASK_STEPS.length - 1 && (
        <div className="mt-5 p-4 bg-teal-100 border border-teal-200 rounded-2xl text-center">
          <p className="text-teal-800 font-semibold text-sm">You have reviewed everything. Well done.</p>
          <p className="text-teal-600 text-xs mt-1">Nothing has been submitted. You are still in control.</p>
        </div>
      )}

      {/* Predictable footer */}
      <div className="mt-8 pt-4 border-t border-teal-100 flex items-center justify-between text-xs text-teal-300">
        <span>Anxious Mode — calm · predictable · no surprises</span>
        <button onClick={() => onModeChange?.('calm')} className="text-teal-400 hover:text-teal-600 transition-colors">
          Exit to safety →
        </button>
      </div>

      <style>{`@keyframes gentleIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
