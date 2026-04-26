export default function KeyTakeaway({ text, accentLight, accentText, border }) {
  if (!text) return null;
  return (
    <div className={`flex gap-3 p-4 rounded-2xl border ${border} ${accentLight} mb-6`}>
      <span className="text-lg flex-shrink-0 mt-0.5">💡</span>
      <div>
        <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${accentText} opacity-60`}>
          Key Takeaway
        </p>
        <p className={`text-sm leading-relaxed font-medium ${accentText}`}>{text}</p>
      </div>
    </div>
  );
}
