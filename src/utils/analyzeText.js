const CALM_MAP = [
  [/\burgent(ly)?\b/gi,   'worth noting'],
  [/\bASAP\b/g,           'when you are ready'],
  [/\bimmediately\b/gi,   'soon'],
  [/\bmust\b/gi,          'can'],
  [/\brequired\b/gi,      'expected'],
  [/\bdeadline\b/gi,      'date'],
  [/\boverdue\b/gi,       'pending'],
  [/\blate fee\b/gi,      'additional charge'],
  [/\bfailed?\b/gi,       'encountered an issue'],
  [/\bwarning\b/gi,       'note'],
  [/\bcritical\b/gi,      'important'],
  [/\balert\b/gi,         'notice'],
  [/\bexpires?\b/gi,      'is valid until'],
  [/\bpenalty\b/gi,       'charge'],
];

function calmify(s) {
  return CALM_MAP.reduce((str, [from, to]) => str.replace(from, to), s);
}

export function detectContext(text) {
  const t = text.toLowerCase();
  if (/\$[\d,]+|\bpay(?:ment)?\b|\bdue\b|\bbalance\b|\binvoice\b|\bbill\b/.test(t)) return 'payment';
  if (/\berror\b|\bfailed?\b|\bexception\b|\bwarning:\s|\bcannot\b|\bunable to\b/.test(t)) return 'error';
  if (/\bform\b.*\brequired\b|\bplease (?:enter|fill|complete)\b|\bsubmit\b.*\bform\b/.test(t)) return 'form';
  if (/\bstep \d\b|\bhow to\b|\binstruction\b|\bfollowing steps\b/.test(t)) return 'instructions';
  if (/\burgent\b|\basap\b|\bimmediately\b|\bdeadline\b|\boverdue\b|\bexpires?\b/.test(t)) return 'urgent';
  return 'general';
}

export function suggestMode(text) {
  const t = text.toLowerCase();
  const urgencyScore = (t.match(/\b(urgent|asap|immediately|deadline|overdue|required|must|critical|warning)\b/g) || []).length;
  const stepsScore   = (t.match(/\b(step \d|first.*then|\d+\.|action item|to-do)\b/g) || []).length;
  const wordCount    = text.split(/\s+/).filter(Boolean).length;

  if (urgencyScore >= 2) return 'anxious';
  if (stepsScore  >= 3) return 'stressed';
  if (wordCount   > 80) return 'foggy';
  return 'calm';
}

export function analyzeText(text, mode) {
  const raw = text.trim();
  if (!raw) return null;

  const sentences = (raw.match(/[^.!?\n]+[.!?\n]*/g) || [raw])
    .map(s => s.trim())
    .filter(s => s.length > 8);

  const urgentRx  = /\b(due|deadline|urgent|important|must|required|need to|asap|immediately|before|by\s+\w+\s+\d+|expires?|overdue)\b/i;
  const actionRx  = /\b(pay|submit|reply|sign|review|choose|select|click|fill|complete|contact|call|visit|update|confirm|verify|return|cancel|schedule|accept|decline)\b/i;

  const context   = detectContext(raw);
  const urgent    = sentences.find(s => urgentRx.test(s));
  const action    = sentences.find(s => actionRx.test(s));

  let mattersMost = urgent || sentences[0] || raw.slice(0, 200);
  let nextStep    = action  || 'Decide whether to act on this now or set it aside for later.';

  // Context-aware refinement
  if (context === 'payment') {
    const amountMatch = raw.match(/\$[\d,]+\.?\d*/);
    const dateMatch   = raw.match(/(?:by|due|before)\s+([A-Z][a-z]+ \d+,?\s*\d{4}|\d+\/\d+\/\d+)/i);
    if (amountMatch) {
      mattersMost = `Amount due: ${amountMatch[0]}${dateMatch ? ` by ${dateMatch[1]}` : ''}`;
    }
    nextStep = 'Decide if you want to pay now, set a reminder, or explore a payment plan.';
  } else if (context === 'error') {
    const errLine = sentences.find(s => /error|failed|exception/i.test(s));
    if (errLine) mattersMost = errLine;
    const fixLine = sentences.find(s => /try|restart|update|contact|check/i.test(s));
    nextStep = fixLine || 'Find the specific error message and look up a fix or contact support.';
  } else if (context === 'urgent') {
    nextStep = 'Take the required action before the date shown to avoid any issues.';
  }

  if (mode === 'anxious') {
    mattersMost = calmify(mattersMost);
    nextStep    = calmify(nextStep);
  }

  const keyPoints  = sentences.slice(1, 5).filter(s => s.length > 12);
  const shortPts   = mode === 'foggy'
    ? keyPoints.map(s => s.split(/(?<=[\.\!\?])\s+/)[0]).filter(Boolean)
    : keyPoints;

  return {
    type:        'analyze',
    context,
    mode,
    mainIdea:    mode === 'overwhelmed' ? '' : (sentences[0] || raw.slice(0, 200)),
    keyPoints:   mode === 'overwhelmed' ? [] : shortPts,
    mattersMost,
    nextStep,
    steps:       mode === 'stressed'
      ? shortPts.slice(0, 5).map((s, i) => ({ n: i + 1, text: s }))
      : null,
    reassurance: mode === 'anxious'
      ? 'You have time to handle this. Take it one step at a time.'
      : null,
    rawText:     mode === 'original' ? raw : null,
  };
}

const ALL_MODES = ['calm', 'overwhelmed', 'foggy', 'anxious', 'stressed', 'original'];

export function analyzeAllModes(text) {
  const out = {};
  ALL_MODES.forEach(m => { out[m] = analyzeText(text, m); });
  return out;
}
