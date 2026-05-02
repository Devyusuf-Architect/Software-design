import { useState } from 'react';

/* ── Payment notice ────────────────────────────────────── */
function PaymentContent({ formData, step, onStepChange }) {
  const [payMethod, setPayMethod] = useState('');
  const [agreed, setAgreed]       = useState(false);
  const f = formData;

  return (
    <div className="bg-white border border-gray-300 shadow-sm rounded overflow-hidden text-sm">
      <div className="bg-red-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-white text-2xl">⚠</span>
          <div>
            <h1 className="text-white font-extrabold text-lg uppercase tracking-wide leading-tight">
              FINAL NOTICE: PAYMENT REQUIRED IMMEDIATELY
            </h1>
            <p className="text-red-200 text-xs mt-0.5">
              ⏰ Action required · Account suspension effective {f.dueDate} if unpaid
            </p>
          </div>
        </div>
      </div>
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5">
        <span className="text-amber-600 text-xs font-bold">
          URGENT — This is your 4th and FINAL notice. Failure to act TODAY may result in additional fees and legal proceedings.
        </span>
      </div>
      <div className="px-6 py-4 border-b border-gray-200 grid grid-cols-3 gap-4">
        {[['Account', f.accountNumber],['Total Due', f.totalDue],['Due Date', f.dueDate]].map(([k,v]) => (
          <div key={k}><p className="text-gray-400 text-[10px] uppercase tracking-wider">{k}</p>
          <p className={`font-bold ${k==='Total Due' ? 'text-red-600 text-xl' : k==='Due Date' ? 'text-orange-600' : 'font-mono text-gray-800'}`}>{v}</p></div>
        ))}
      </div>
      <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
        <p className="text-gray-700 leading-relaxed">
          <strong>This is your FINAL NOTICE.</strong> Your account has an outstanding balance of <strong>{f.totalDue}</strong>. Failure to pay this amount <strong>immediately</strong> will result in: additional late fees of <strong>{f.lateFee}</strong>, account suspension, referral to collections, and potential credit score reporting. Legal action may be initiated.
        </p>
      </div>
      <div className="px-6 py-4 border-b border-gray-200">
        <p className="font-semibold text-gray-700 text-xs uppercase tracking-wider mb-3">Balance breakdown</p>
        <div className="space-y-1 text-sm text-gray-600">
          {[['Service period','Jan – Mar 2026'],['Original amount',f.original],['Late fee applied',f.lateFee],['Adjustment',f.adjustment]].map(([k,v]) => (
            <div key={k} className="flex justify-between"><span>{k}</span><span className="font-mono">{v}</span></div>
          ))}
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-2">
            <span>Total Amount Due</span><span className="text-red-600">{f.totalDue}</span>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-b border-gray-200">
        <p className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3">Payment options</p>
        <div className="flex flex-wrap gap-2">
          {[['Pay Full Amount Now','bg-red-600 text-white hover:bg-red-700'],['Set Up Payment Plan','border border-gray-300 text-gray-600'],['Dispute This Charge','border border-gray-300 text-gray-400'],['Request Extension','border border-gray-300 text-gray-400'],['Download Statement','border border-gray-300 text-gray-400'],['Update Method','border border-gray-300 text-gray-400']].map(([label, cls]) => (
            <button key={label} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${cls}`}
              onClick={() => step === 2 && onStepChange?.(3)}>{label}</button>
          ))}
        </div>
      </div>
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong>Payment Plan Terms:</strong> If you cannot pay the full amount today, you may qualify for a 3-month plan at {f.planMonthly}/month. Interest of 2.5% per month applies. Early termination fee of $15.00. Applications subject to approval. Plans cannot be modified once approved.
        </p>
      </div>
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          {[['Full Name *','text','Your full legal name'],['Account Number *','text',f.accountNumber]].map(([label,type,ph]) => (
            <div key={label}><label className="block text-xs text-gray-500 mb-1">{label}</label>
            <input type={type} placeholder={ph} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400" /></div>
          ))}
        </div>
        <div className="mt-3">
          <label className="block text-xs text-gray-500 mb-1">Payment Method *</label>
          <div className="flex gap-4 text-sm text-gray-600">
            {['Credit Card','Bank Transfer','Check'].map(m => (
              <label key={m} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="paymethod" value={m} checked={payMethod===m} onChange={()=>setPayMethod(m)}/>{m}
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          {['Card/Account Number *','Expiry Date *','CVV *'].map(label=>(
            <div key={label}><label className="block text-xs text-gray-500 mb-1">{label}</label>
            <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"/></div>
          ))}
        </div>
        <div className="mt-3"><label className="block text-xs text-gray-500 mb-1">Billing Address *</label>
        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"/></div>
        <div className="mt-3 flex items-start gap-2">
          <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} className="mt-0.5 flex-shrink-0"/>
          <label className="text-xs text-gray-500 leading-relaxed cursor-pointer" onClick={()=>setAgreed(v=>!v)}>
            I agree to the Terms and Conditions (15,000 words), Payment Processing Agreement, Privacy Policy, and acknowledge this constitutes a legal and binding obligation under statute 45.891(b).
          </label>
        </div>
      </div>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex gap-2 flex-wrap">
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded font-semibold text-sm">SUBMIT PAYMENT</button>
          <button className="border border-gray-300 text-gray-600 px-4 py-2.5 rounded text-sm">Save for Later</button>
          <button className="border border-gray-300 text-gray-400 px-4 py-2.5 rounded text-sm">Cancel</button>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          By submitting, you agree to our Terms of Service, Privacy Policy, and Payment Processing Agreement. Late payments subject to additional fees. Questions? Call 1-800-555-0147. Disputes must be submitted in writing within 14 days. Arbitration clause applies — see section 18.4.
        </p>
      </div>
    </div>
  );
}

/* ── School assignment ──────────────────────────────────── */
function SchoolContent({ formData }) {
  const f = formData;
  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden text-sm">
      <div className="bg-blue-700 px-6 py-4">
        <p className="text-blue-200 text-[10px] uppercase tracking-widest mb-1">ASSIGNMENT BRIEF — FINAL VERSION</p>
        <h1 className="text-white font-bold text-base leading-snug">{f.assignmentTitle}</h1>
        <p className="text-blue-300 text-xs mt-1">⚠ DEADLINE APPROACHING · {f.weight} · Submit via {f.submissionPortal}</p>
      </div>
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5">
        <p className="text-amber-700 text-xs font-semibold">IMPORTANT: This assignment constitutes {f.weight}. Failure to submit by the deadline will result in a grade of ZERO. No extensions will be granted without prior approval from the Module Coordinator.</p>
      </div>
      <div className="px-6 py-4 border-b border-gray-200 grid grid-cols-4 gap-3 text-center">
        {[['Module',f.subject],['Weight',f.weight],['Due',f.dueDate],['Format',f.format]].map(([k,v])=>(
          <div key={k} className="bg-gray-50 rounded p-2"><p className="text-[10px] text-gray-400 uppercase tracking-wider">{k}</p><p className="font-semibold text-gray-800 text-xs mt-0.5">{v}</p></div>
        ))}
      </div>
      <div className="px-6 py-4 border-b border-gray-200">
        <p className="font-bold text-gray-800 mb-2 text-xs uppercase tracking-wider">Assignment Description</p>
        <p className="text-gray-700 leading-relaxed">Students are required to critically analyse contemporary policy frameworks as they pertain to urban climate governance, with particular emphasis on the intersection of municipal planning authorities and national emissions reduction targets. Your response must demonstrate a comprehensive understanding of the theoretical underpinnings of climate policy, drawing on at least <strong>eight peer-reviewed sources</strong> published after 2018. Engagement with contradictory literature is expected and will be assessed accordingly within the critical analysis criterion.</p>
      </div>
      <div className="px-6 py-4 border-b border-gray-200">
        <p className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider">Learning Outcomes Assessed</p>
        <ul className="space-y-1 text-xs text-gray-600 list-disc list-inside">
          <li>Demonstrate critical evaluation of complex policy environments (LO2)</li>
          <li>Synthesise primary and secondary literature sources coherently (LO4)</li>
          <li>Communicate academic argument in a structured, referenced format (LO6)</li>
          <li>Apply theoretical frameworks to contemporary case studies (LO3, LO5)</li>
        </ul>
      </div>
      <div className="px-6 py-4 border-b border-gray-200 overflow-x-auto">
        <p className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider">Assessment Rubric</p>
        <table className="w-full text-[10px] border border-gray-200">
          <thead className="bg-gray-50">
            <tr>{['Criterion','Weight','Pass (40–49)','Merit (50–69)','Distinction (70+)'].map(h=>(
              <th key={h} className="border border-gray-200 px-2 py-1.5 text-left font-semibold text-gray-600">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {[['Critical Analysis','30%','Descriptive, limited argument','Some critical engagement','Sustained critical analysis'],
              ['Use of Evidence','25%','Minimal references','Adequate evidence base','Comprehensive, well-integrated'],
              ['Structure & Clarity','25%','Some logical progression','Clear structure evident','Coherent, well-signposted'],
              ['Academic Writing','20%','Numerous errors','Minor errors only','Exemplary academic register']].map(([c,w,...grades])=>(
              <tr key={c} className="even:bg-gray-50">
                <td className="border border-gray-200 px-2 py-1.5 font-medium">{c}</td>
                <td className="border border-gray-200 px-2 py-1.5 text-center">{w}</td>
                {grades.map((g,i)=><td key={i} className="border border-gray-200 px-2 py-1.5 text-gray-500">{g}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-b border-gray-200">
        <p className="font-bold text-gray-800 mb-2 text-xs uppercase tracking-wider">Submission Requirements</p>
        <ul className="space-y-1 text-xs text-gray-600 list-disc list-inside">
          <li>File formats accepted: PDF or DOCX only — no other formats accepted</li>
          <li>File name convention: STUDENTID_ENV304_Assignment2.pdf</li>
          <li>Word count must be stated on the title page (±10% tolerance applies)</li>
          <li>Submit via {f.submissionPortal} by 23:59 on {f.dueDate}</li>
          <li>Retain a copy of your submission receipt — it will be emailed to your university address</li>
          <li>Academic integrity declaration required before final submission</li>
        </ul>
      </div>
      <div className="px-6 py-4 bg-gray-50">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          This brief is subject to the University's Academic Regulations (Section 7.4). All submitted work is processed through automated similarity detection software. Collusion and plagiarism will be referred to the Academic Misconduct Panel. Appeals against grades must be lodged within 10 working days of results release.
        </p>
      </div>
    </div>
  );
}

/* ── Medical form ───────────────────────────────────────── */
function MedicalContent({ formData }) {
  const f = formData;
  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden text-sm">
      <div className="bg-gray-600 px-6 py-4">
        <p className="text-gray-300 text-[10px] uppercase tracking-widest mb-1">{f.clinicName} · {f.department}</p>
        <h1 className="text-white font-bold text-base">{f.formTitle}</h1>
        <p className="text-gray-300 text-xs mt-1">⚠ Appointment: {f.appointmentDate} · Incomplete forms may result in appointment cancellation.</p>
      </div>
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2">
        <p className="text-amber-700 text-xs font-semibold">ALL fields marked with * are mandatory. This form must be completed in full and returned to reception no later than 30 minutes before your appointment. Patient confidentiality is maintained in accordance with GDPR and applicable healthcare legislation.</p>
      </div>
      {[
        { title:'Section 1: Personal Information', fields:[['Full Legal Name *','text'],['Date of Birth *','text'],['NHS Number *','text'],['Address Line 1 *','text'],['Address Line 2','text'],['Postcode *','text'],['Telephone *','text'],['Emergency Contact Name *','text'],['Emergency Contact Number *','text'],['Relationship to Patient *','text']] },
        { title:'Section 2: Current Medications (list all)', fields:[['Medication 1 — Name / Dose / Frequency','text'],['Medication 2 — Name / Dose / Frequency','text'],['Medication 3 — Name / Dose / Frequency','text'],['OTC Medications, Vitamins, Supplements *','text']] },
        { title:'Section 3: Allergies and Adverse Reactions', fields:[['Drug Allergies *','text'],['Food Allergies *','text'],['Other Allergies (latex, dyes, etc.) *','text'],['Previous Adverse Drug Reactions *','text']] },
        { title:'Section 4: Medical History', fields:[['Previous Diagnoses *','text'],['Previous Surgeries / Procedures *','text'],['Family Medical History (first-degree relatives) *','text'],['Current Symptoms / Reason for Appointment *','text']] },
      ].map(({title,fields})=>(
        <div key={title} className="px-6 py-4 border-b border-gray-200">
          <p className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-3">{title}</p>
          <div className="grid grid-cols-2 gap-2">
            {fields.map(([label,type])=>(
              <div key={label}><label className="block text-[10px] text-gray-500 mb-1">{label}</label>
              <input type={type} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"/></div>
            ))}
          </div>
        </div>
      ))}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <p className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-2">Section 5: Patient Consent Declaration</p>
        <p className="text-xs text-gray-600 leading-relaxed mb-3">
          I hereby consent to examination and treatment by {f.clinicName} and its staff. I understand that all information provided is subject to the Data Protection Act 2018 and GDPR. I consent to the sharing of necessary clinical information with other healthcare professionals involved in my care. I acknowledge that this form constitutes a legal record and that knowingly providing false information may affect the care I receive. I confirm that all information provided above is accurate to the best of my knowledge at the time of completion.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-[10px] text-gray-500 mb-1">Patient Signature *</label><input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none"/></div>
          <div><label className="block text-[10px] text-gray-500 mb-1">Date *</label><input type="text" className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none"/></div>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50">
        <p className="text-[10px] text-gray-400 leading-relaxed">For clinic use only. Patient record reference: ___________. Received by: ___________. Time received: ___________. Verified: □ Yes □ No.</p>
      </div>
    </div>
  );
}

/* ── News article ───────────────────────────────────────── */
function NewsContent({ formData }) {
  const f = formData;
  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden text-sm">
      <div className="px-6 pt-5 pb-3 border-b border-gray-100">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {f.tags?.map(tag=>(
            <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-full uppercase tracking-wider">{tag}</span>
          ))}
        </div>
        <h1 className="text-xl font-bold text-gray-900 leading-snug mb-2">{f.headline}</h1>
        <p className="text-xs text-gray-400">{f.author} · {f.source} · {f.date} · {f.readTime}</p>
      </div>
      <div className="px-6 py-5 space-y-4 text-gray-700 leading-relaxed">
        <p>The Chancellor of the Exchequer yesterday confirmed the allocation of £4.2 billion over four fiscal years toward a multifaceted infrastructure initiative designed to ameliorate longstanding disparities in digital connectivity across rural and coastal constituencies. The programme, formally designated the Rural Digital Connectivity and Inclusion Strategy (RDCIS), will be administered jointly through the Department for Digital Infrastructure and newly established regional delivery partnerships comprising local authorities, combined authorities, and nominated telecommunications operators.</p>
        <p>According to documentation released alongside the fiscal announcement, the initiative targets the delivery of gigabit-capable broadband infrastructure to approximately 2.3 million premises currently classified under the Government's Difficult-to-Reach Premises Framework — a designation encompassing rural settlements, dispersed hamlets, and coastal communities where incumbent operators have historically declined to invest owing to insufficient return-on-investment projections under existing subsidy mechanisms.</p>
        <div className="border-l-4 border-blue-200 pl-4 bg-blue-50 rounded-r py-2">
          <p className="text-sm text-gray-700 italic">"This investment represents a fundamental correction of a structural inequality that has persisted for over a decade. Communities which have been systematically excluded from the digital economy will now have access to the infrastructure they need to participate fully."</p>
          <p className="text-xs text-gray-400 mt-1">— Secretary of State for Digital Infrastructure</p>
        </div>
        <p>Critics from the opposition benches and the Digital Equity Alliance have, however, questioned the adequacy of the proposed timeline and the sufficiency of the targets. A briefing document circulated by the Alliance argues that the programme's 2030 completion date fails to account for projected demand growth, and that the 2.3 million premises figure represents only 68% of those currently classified as underserved according to the Ofcom Connected Nations methodology, leaving a residual cohort of approximately 1.1 million premises without a clear delivery pathway.</p>
        <div className="border-l-4 border-amber-200 pl-4 bg-amber-50 rounded-r py-2">
          <p className="text-sm text-gray-700 italic">"While we welcome any investment in rural connectivity, the targets set out today are modest at best. The 2030 deadline is simply not commensurate with the urgency of the situation facing rural businesses and households."</p>
          <p className="text-xs text-gray-400 mt-1">— Spokesperson, Digital Equity Alliance</p>
        </div>
        <p>Alongside the infrastructure component, the strategy allocates £320 million to a network of community-based digital literacy programmes, to be delivered in partnership with adult education providers, libraries, and third-sector organisations. The programmes target adults classified as digitally excluded under the ONS Internet Access Bulletin criteria, with particular emphasis on older adults, those with disabilities, and individuals with no prior engagement with digital services.</p>
      </div>
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-[10px] text-gray-400">Related: Digital Economy Act Amendments (2025) · Ofcom Connected Nations Report 2026 · Rural Productivity Commission Interim Findings</p>
      </div>
      <div className="px-6 py-3 border-t border-gray-100">
        <p className="text-[9px] text-gray-300 leading-relaxed">The National Policy Review is an independent publication. This article reflects information available at time of publication and may not reflect subsequent developments. For corrections contact editor@nationalpolicyreview.co.uk.</p>
      </div>
    </div>
  );
}

/* ── Main dispatcher ───────────────────────────────────── */
export default function OriginalContent({ scenario, step, onStepChange }) {
  const { formData } = scenario || {};
  if (!formData) return null;

  switch (formData.type) {
    case 'payment': return <PaymentContent formData={formData} step={step} onStepChange={onStepChange} />;
    case 'school':  return <SchoolContent  formData={formData} />;
    case 'medical': return <MedicalContent formData={formData} />;
    case 'news':    return <NewsContent    formData={formData} />;
    default:        return <PaymentContent formData={formData} step={step} onStepChange={onStepChange} />;
  }
}
