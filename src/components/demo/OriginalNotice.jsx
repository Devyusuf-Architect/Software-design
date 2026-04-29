import { useState } from 'react';
import { NOTICE } from '../../data/demoContent';

export default function OriginalNotice({ onStepChange, step }) {
  const [payMethod, setPayMethod] = useState('');
  const [agreed,    setAgreed]    = useState(false);

  return (
    <div className="bg-white border border-gray-300 shadow-sm rounded overflow-hidden text-sm">

      {/* Urgent red header */}
      <div className="bg-red-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-white text-2xl">⚠</span>
          <div>
            <h1 className="text-white font-extrabold text-lg uppercase tracking-wide leading-tight">
              FINAL NOTICE: PAYMENT REQUIRED IMMEDIATELY
            </h1>
            <p className="text-red-200 text-xs mt-0.5">
              ⏰ Action required · Account suspension effective May 6, 2026 if unpaid
            </p>
          </div>
        </div>
      </div>

      {/* Alert strip */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2">
        <span className="text-amber-600 text-xs font-bold">
          URGENT — This is your 4th and FINAL notice. Previous notices were sent: April 1, April 15, April 28.
          Failure to act TODAY may result in additional fees and legal proceedings.
        </span>
      </div>

      {/* Account summary */}
      <div className="px-6 py-4 border-b border-gray-200 grid grid-cols-3 gap-4">
        <div>
          <p className="text-gray-400 text-[10px] uppercase tracking-wider">Account</p>
          <p className="font-mono font-bold text-gray-800 text-sm">{NOTICE.accountNumber}</p>
        </div>
        <div>
          <p className="text-gray-400 text-[10px] uppercase tracking-wider">Total Due</p>
          <p className="font-bold text-red-600 text-xl">{NOTICE.totalDue}</p>
        </div>
        <div>
          <p className="text-gray-400 text-[10px] uppercase tracking-wider">Due Date</p>
          <p className="font-bold text-orange-600">{NOTICE.dueDate}</p>
        </div>
      </div>

      {/* Threatening body text */}
      <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
        <p className="text-gray-700 leading-relaxed">
          <strong>This is your FINAL NOTICE.</strong> Your account has an outstanding balance
          of <strong>{NOTICE.totalDue}</strong>. Failure to pay this amount{' '}
          <strong>immediately</strong> will result in: additional late fees of{' '}
          <strong>{NOTICE.lateFee}</strong>, account suspension effective May 6, referral to
          our collections department, and potential credit score reporting. Legal action may
          be initiated. You <em>must</em> act immediately to avoid these consequences.
        </p>
      </div>

      {/* Balance breakdown */}
      <div className="px-6 py-4 border-b border-gray-200">
        <p className="font-semibold text-gray-700 text-xs uppercase tracking-wider mb-3">Balance breakdown</p>
        <div className="space-y-1 text-sm text-gray-600">
          {[
            ['Service period', `Jan – Mar 2026`],
            ['Original amount', NOTICE.original],
            ['Late fee applied', NOTICE.lateFee],
            ['Adjustment', NOTICE.adjustment],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span>{k}</span><span className="font-mono">{v}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-2">
            <span>Total Amount Due</span><span className="text-red-600">{NOTICE.totalDue}</span>
          </div>
        </div>
      </div>

      {/* Confusing buttons row */}
      <div className="px-6 py-4 border-b border-gray-200">
        <p className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3">Payment options</p>
        <div className="flex flex-wrap gap-2">
          {[
            ['Pay Full Amount Now', 'bg-red-600 text-white hover:bg-red-700'],
            ['Set Up Payment Plan', 'border border-gray-300 text-gray-600 hover:bg-gray-50'],
            ['Dispute This Charge', 'border border-gray-300 text-gray-400 hover:bg-gray-50'],
            ['Request Extension',   'border border-gray-300 text-gray-400 hover:bg-gray-50'],
            ['Download Statement',  'border border-gray-300 text-gray-400 hover:bg-gray-50'],
            ['Update Method',       'border border-gray-300 text-gray-400 hover:bg-gray-50'],
          ].map(([label, cls]) => (
            <button key={label}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${cls}`}
              onClick={() => step === 2 && onStepChange?.(3)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Fine print paragraph */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong>Payment Plan Terms:</strong> If you cannot pay the full amount today, you may qualify
          for a 3-month payment plan at {NOTICE.planMonthly}/month. Interest of 2.5% per month
          applies. Early termination fee of $15.00 applies if plan is cancelled. Processing takes
          3–5 business days. Applications are subject to approval. Plans cannot be modified once
          approved. You must maintain a valid payment method on file at all times.
        </p>
      </div>

      {/* Form fields */}
      <div className="px-6 py-5 border-b border-gray-200">
        <p className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-4">Required information</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Full Name *', 'text', 'Your full legal name'],
            ['Account Number *', 'text', NOTICE.accountNumber],
          ].map(([label, type, ph]) => (
            <div key={label}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <input type={type} placeholder={ph}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          ))}
        </div>

        <div className="mt-3">
          <label className="block text-xs text-gray-500 mb-1">Payment Method *</label>
          <div className="flex gap-4 text-sm text-gray-600">
            {['Credit Card', 'Bank Transfer', 'Check'].map(m => (
              <label key={m} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="paymethod" value={m}
                  checked={payMethod === m} onChange={() => setPayMethod(m)} />
                {m}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3">
          {['Card/Account Number *', 'Expiry Date *', 'CVV *'].map(label => (
            <div key={label}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          ))}
        </div>

        <div className="mt-3">
          <label className="block text-xs text-gray-500 mb-1">Billing Address *</label>
          <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
        </div>

        <div className="mt-3 flex items-start gap-2">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 flex-shrink-0" />
          <label className="text-xs text-gray-500 leading-relaxed cursor-pointer" onClick={() => setAgreed(v => !v)}>
            I agree to the Terms and Conditions (15,000 words), Payment Processing Agreement, Privacy Policy, and
            acknowledge that this constitutes a legal and binding payment obligation under statute 45.891(b).
          </label>
        </div>
      </div>

      {/* Submit buttons */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex gap-2 flex-wrap">
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded font-semibold text-sm transition-colors">
            SUBMIT PAYMENT
          </button>
          <button className="border border-gray-300 text-gray-600 px-4 py-2.5 rounded text-sm hover:bg-gray-50 transition-colors">
            Save for Later
          </button>
          <button className="border border-gray-300 text-gray-400 px-4 py-2.5 rounded text-sm hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>

      {/* Legal fine print */}
      <div className="px-6 py-4 bg-gray-50">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          By submitting this payment, you agree to our Terms of Service (updated March 2026), Privacy Policy,
          Payment Processing Agreement, and acknowledge that this constitutes a legal and binding payment obligation
          under statute 45.891(b). Late payments are subject to additional fees under our collection policy.
          Questions? Call 1-800-555-0147 (Mon–Fri 9am–5pm EST, closed holidays). If you believe this notice was
          sent in error, you must submit a written dispute within 14 days. After 14 days, this debt is considered
          acknowledged and accepted. Include your account number, full legal name, and reason for dispute along
          with supporting documentation. Arbitration clause applies — see section 18.4 of our Terms of Service.
        </p>
      </div>
    </div>
  );
}
