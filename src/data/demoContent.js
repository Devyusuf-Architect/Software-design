export const NOTICE = {
  accountNumber: '#847291-B',
  totalDue: '$128.45',
  dueDate: 'May 5, 2026',
  original: '$98.45',
  lateFee: '$25.00',
  adjustment: '$5.00',
  planMonthly: '$47.00',
};

export const TASK_STEPS = [
  {
    id: 1,
    icon: '💰',
    shortTitle: 'Amount',
    title: 'Review the amount owed',
    description: `The total amount due is ${NOTICE.totalDue}. This includes your original balance of ${NOTICE.original}, a late fee of ${NOTICE.lateFee}, and a processing adjustment of ${NOTICE.adjustment}.`,
    simpleLabel: 'The amount you owe',
    simpleValue: NOTICE.totalDue,
    simpleDetail: 'Total balance due on your account.',
    tip: 'You only need to note this number. Nothing happens until you choose to act.',
    completion: 'Good. You\'ve reviewed the amount.',
  },
  {
    id: 2,
    icon: '📅',
    shortTitle: 'Due Date',
    title: 'Confirm the due date',
    description: `This payment is due by ${NOTICE.dueDate}. You still have time. There is no need to rush — reviewing this does not commit you to anything.`,
    simpleLabel: 'When it\'s due',
    simpleValue: NOTICE.dueDate,
    simpleDetail: 'You still have time to decide.',
    tip: 'Just note the date. You don\'t need to pay right now.',
    completion: 'Good. You know the due date.',
  },
  {
    id: 3,
    icon: '🔢',
    shortTitle: 'Options',
    title: 'Choose a payment option',
    description: `You have two choices: pay the full amount of ${NOTICE.totalDue} today, or set up a 3-month payment plan at ${NOTICE.planMonthly} per month. Both are valid options.`,
    simpleLabel: 'Your choices',
    simpleValue: 'Pay now or set up a plan',
    simpleDetail: `Full: ${NOTICE.totalDue} · Plan: ${NOTICE.planMonthly}/month × 3`,
    tip: 'Pick the one that works best for you. You can change this.',
    completion: 'Good. You\'ve chosen your payment option.',
  },
  {
    id: 4,
    icon: '📝',
    shortTitle: 'Details',
    title: 'Enter your payment details',
    description: 'Fill in your name and payment information below. Required fields are marked with *. Your information is processed securely. You can save and return at any time.',
    simpleLabel: 'Fill in your info',
    simpleValue: 'Name and payment details',
    simpleDetail: 'Only required fields. Save anytime.',
    tip: 'Nothing is sent until you click Submit. You can save first.',
    completion: 'Good. Your details are entered.',
  },
  {
    id: 5,
    icon: '✅',
    shortTitle: 'Submit',
    title: 'Submit or save for later',
    description: 'When you\'re ready, submit your payment or save your progress and return later. Nothing is final until you click Submit. You are in complete control.',
    simpleLabel: 'Ready to finish?',
    simpleValue: 'Submit or save progress',
    simpleDetail: 'You\'re in control. No rush.',
    tip: 'Save your progress now and return when you\'re ready.',
    completion: 'Task completed. You handled this one step at a time.',
  },
];

export const SIMPLIFY_OUTPUT = {
  simple: `You have a payment of ${NOTICE.totalDue} due by ${NOTICE.dueDate}. You can pay the full amount now or set up a payment plan spread over 3 months at ${NOTICE.planMonthly} per month.`,
  bullets: [
    `Amount due: ${NOTICE.totalDue}`,
    `Due by: ${NOTICE.dueDate}`,
    `Late fee if unpaid after due date: ${NOTICE.lateFee} additional`,
    `Option 1: Pay in full — ${NOTICE.totalDue}`,
    `Option 2: Payment plan — ${NOTICE.planMonthly}/month for 3 months`,
    `Account number: ${NOTICE.accountNumber}`,
  ],
  action: `Check the amount (${NOTICE.totalDue}), note the due date (${NOTICE.dueDate}), then choose to pay now or set up a plan. You can save your progress at any time and return when you\'re ready.`,
};

export const WHY_HELPS = {
  overwhelmed: 'This mode removes everything except the single most important piece of information. You can move forward one step at a time without feeling overwhelmed by choices.',
  foggy: 'This mode restructures the content into short, clearly labelled sections. Key numbers and dates are bolded so they\'re easy to find, and each section has a re-read option.',
  anxious: 'This mode replaces urgent and threatening language with calm wording, removes visual warning elements, and lets you review at your own pace — nothing is submitted until you decide.',
  stressed: 'This mode breaks the task into five small steps with clear progress tracking. After each step, you receive a small confirmation so you know you\'re moving forward.',
  calm: 'This mode shows the complete original page with light accessibility enhancements. All information and options are visible. You can switch modes anytime.',
};

export const MODE_MESSAGES = {
  overwhelmed: { line1: 'Overwhelmed Mode', line2: 'Showing one step at a time. Everything else is hidden.' },
  foggy:       { line1: 'Foggy Mode',       line2: 'Text restructured. Key words highlighted throughout.' },
  anxious:     { line1: 'Anxious Mode',     line2: 'Urgency language replaced. No surprises here.' },
  stressed:    { line1: 'Stressed Mode',    line2: 'Task broken into small steps. Progress is saved.' },
  calm:        { line1: 'Calm Mode',        line2: 'Viewing full original content with enhancements.' },
};

export const STRESSED_ENCOURAGEMENTS = [
  'You\'re making progress.',
  'One step closer.',
  'You\'re handling this well.',
  'That\'s done. Keep going.',
  'Almost there.',
];
