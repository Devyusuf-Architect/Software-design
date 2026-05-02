import { useState } from 'react';
import { NOTICE, TASK_STEPS } from '../../data/demoContent';
import { useSpeech } from '../../hooks/useSpeech';

const DEFAULT_SECTIONS = [
  {
    id: 'amount',
    title: '💰 Amount you owe',
    content: `Your total balance is **${NOTICE.totalDue}**. This includes your original amount of **${NOTICE.original}**, a **late fee** of **${NOTICE.lateFee}**, and an adjustment of **${NOTICE.adjustment}**.`,
  },
  {
    id: 'date',
    title: '📅 When it is due',
    content: `This payment is due by **${NOTICE.dueDate}**. You still have time. There is no need to rush.`,
  },
  {
    id: 'options',
    title: '🔢 Your payment options',
    content: `**Option 1:** Pay the full amount of **${NOTICE.totalDue}** today.\n**Option 2:** Set up a **payment plan** — pay **${NOTICE.planMonthly} per month** for 3 months.`,
  },
  {
    id: 'details',
    title: '📝 What you need to fill in',
    content: `You will need: your **full name**, your **account number** (${NOTICE.accountNumber}), and your **payment method** (card or bank). You can **save your progress** and return later.`,
  },
  {
    id: 'submit',
    title: '✅ When you are ready',
    content: `You can **submit your payment** or **save for later**. Nothing is sent until you click **Submit**. You are in control.`,
  },
];

function BoldText({ text }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <strong key={i} className="font-bold text-amber-900">{part}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

export default function FoggyView({ step, onStepChange, sections: sectionsProp, taskSteps }) {
  const SECTIONS   = sectionsProp || DEFAULT_SECTIONS;
  const taskStepsFinal = taskSteps || TASK_STEPS;
  const [readAgainKey, setReadAgainKey] = useState({});
  const { speak, stop, isSpeaking, isSupported } = useSpeech();

  const handleReadSection = (text) => {
    const plain = text.replace(/\*\*/g, '');
    stop();
    speak(plain, 0.82);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-6">

      {/* Prompt */}
      <p className="text-amber-600 text-sm italic mb-6">
        Take your time. Key words are in bold. Click any section to hear it again.
      </p>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-6">
        {SECTIONS.map((s, i) => (
          <div key={s.id}
            className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
              i <= step ? 'bg-amber-400' : 'bg-amber-100'
            }`}
          />
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-3" key={Object.values(readAgainKey).join('')}>
        {SECTIONS.map((sec, i) => {
          const isActive = i === step;
          const isDone   = i < step;
          const isLocked = i > step;
          return (
            <div
              key={sec.id}
              onClick={() => isSupported && handleReadSection(sec.content)}
              className={`group rounded-2xl p-4 border-2 transition-all duration-300 cursor-pointer ${
                isActive ? 'border-amber-300 bg-amber-50 shadow-md'
                : isDone  ? 'border-amber-100 bg-white opacity-70 hover:opacity-90'
                :           'border-slate-100 bg-white opacity-40 pointer-events-none'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${
                    isActive ? 'text-amber-500' : isDone ? 'text-amber-300' : 'text-slate-300'
                  }`}>
                    {sec.title}
                  </p>
                  <p className={`text-sm leading-relaxed ${isActive ? 'text-amber-900' : 'text-amber-800'}`}>
                    {sec.content.split('\n').map((line, j) => (
                      <span key={j}>
                        <BoldText text={line} />
                        {j < sec.content.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  {isDone && <span className="text-amber-400 text-sm">✓</span>}
                  {isActive && isSupported && (
                    <button
                      onClick={e => { e.stopPropagation(); setReadAgainKey(k => ({ ...k, [sec.id]: Date.now() })); handleReadSection(sec.content); }}
                      className="text-[10px] text-amber-500 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-lg transition-colors font-semibold"
                    >
                      🔄 Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => onStepChange(step - 1)}
          disabled={step === 0}
          className="px-5 py-2.5 border-2 border-amber-200 text-amber-700 rounded-xl text-sm font-medium disabled:opacity-30 hover:bg-amber-50 transition-all"
        >
          ← Back
        </button>
        {step < taskStepsFinal.length - 1 ? (
          <button
            onClick={() => onStepChange(step + 1)}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-amber-200 transition-all"
          >
            Next section →
          </button>
        ) : (
          <div className="px-5 py-2.5 bg-amber-100 text-amber-700 rounded-xl text-sm font-semibold">All sections read ✓</div>
        )}
      </div>

      {step === taskStepsFinal.length - 1 && (
        <div className="mt-5 p-4 bg-amber-100 border border-amber-200 rounded-2xl text-center">
          <p className="text-amber-800 font-semibold text-sm">
            {taskStepsFinal[taskStepsFinal.length - 1].completion}
          </p>
        </div>
      )}
    </div>
  );
}
