// ─── Word / phrase simplification map ─────────────────────────────────────
const SIMPLIFY_PAIRS = [
  // Long phrases first (order matters: longest → shortest)
  ['due to the fact that',   'because'],
  ['in the event that',      'if'],
  ['at this point in time',  'now'],
  ['on a regular basis',     'regularly'],
  ['with the exception of',  'except'],
  ['as a result of',         'because of'],
  ['a large number of',      'many'],
  ['for the purpose of',     'for'],
  ['in order to',            'to'],
  ['with regard to',         'about'],
  ['prior to',               'before'],
  ['in addition to',         'as well as'],
  ['at the same time',       'while'],
  ['in spite of',            'despite'],
  // Complex words
  ['utilise',     'use'],   ['utilize',      'use'],
  ['commence',    'start'], ['terminate',    'end'],
  ['endeavour',   'try'],   ['endeavor',     'try'],
  ['facilitate',  'help'],  ['approximately', 'about'],
  ['demonstrate', 'show'],  ['sufficient',   'enough'],
  ['subsequently','then'],  ['furthermore',  'also'],
  ['additionally','also'],  ['nevertheless', 'but'],
  ['consequently','so'],    ['therefore',    'so'],
  ['numerous',    'many'],  ['implement',    'use'],
  ['obtain',      'get'],   ['provide',      'give'],
  ['receive',     'get'],   ['indicate',     'show'],
  ['require',     'need'],  ['ensure',       'make sure'],
  ['modify',      'change'],['purchase',     'buy'],
  ['regarding',   'about'], ['concerning',   'about'],
  ['assistance',  'help'],  ['however',      'but'],
];

// ─── Urgency / anxiety language ────────────────────────────────────────────
const URGENCY_WORDS = [
  'urgent', 'urgently', 'immediately', 'right now', 'hurry', 'act now',
  'limited time', 'last chance', 'don\'t miss', 'deadline', 'expires',
  'expiring', 'warning', 'alert', 'critical', 'danger', 'must', 'required immediately',
  'do not delay', 'time sensitive', 'final notice', 'overdue',
];

// ─── Action verb detection ──────────────────────────────────────────────────
const ACTION_VERBS = new Set([
  'click','open','go','select','enter','type','choose','press','tap',
  'find','search','read','review','complete','fill','submit','start',
  'begin','create','add','remove','delete','check','verify','confirm',
  'save','download','upload','log','sign','navigate','scroll','drag',
  'copy','paste','move','resize','adjust','enable','disable','toggle',
]);

// ─── Stop words (excluded from keyword extraction) ─────────────────────────
const STOP_WORDS = new Set([
  'about','above','after','again','against','being','below','between',
  'during','every','first','found','given','going','great','group',
  'having','helps','their','there','these','thing','think','those',
  'through','under','until','using','where','which','while','would',
  'could','should','might','other','often','always','never','something',
  'everything','nothing','anyone','someone','people','place','makes',
  'really','things','content','information','experience','simply','actually',
]);

// ─── Public API ────────────────────────────────────────────────────────────

export function simplifyText(text) {
  let result = text;
  for (const [complex, simple] of SIMPLIFY_PAIRS) {
    const escaped = complex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), simple);
  }
  return result;
}

export function removeUrgencyLanguage(text) {
  let result = text;
  for (const term of URGENCY_WORDS) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), '');
  }
  return result.replace(/\s{2,}/g, ' ').trim();
}

export function extractKeyTakeaway(text) {
  const sentences = tokeniseSentences(text);
  if (!sentences.length) return '';
  const SIGNALS = ['important','key','main','primary','essential','remember',
    'significant','core','central','vital','goal','purpose'];
  for (const sig of SIGNALS) {
    const hit = sentences.find(s => s.toLowerCase().includes(sig));
    if (hit) return hit.trim();
  }
  // Fall back: longest sentence in first paragraph
  const firstPara = text.split(/\n\s*\n/)[0] || text;
  const firstSentences = tokeniseSentences(firstPara);
  return (firstSentences.sort((a,b) => b.length - a.length)[0] || sentences[0]).trim();
}

export function convertToBullets(text) {
  const sentences = tokeniseSentences(text);
  return sentences.filter(s => s.trim().length > 15);
}

export function generateSummary(text) {
  const paras = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  return paras
    .map(p => {
      const sentences = tokeniseSentences(p);
      return sentences[0]?.trim() || '';
    })
    .filter(Boolean);
}

export function extractKeywords(text) {
  const words = text.toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
  const freq = {};
  for (const w of words) {
    if (!STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14)
    .map(([w]) => w);
}

export function splitIntoSections(text) {
  const paras = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  return paras.map((content, i) => {
    const first = (tokeniseSentences(content)[0] || content).trim();
    const title = first.length > 60 ? first.slice(0, 57) + '…' : first;
    return { id: i, title, content };
  });
}

export function detectSteps(text) {
  const sentences = tokeniseSentences(text);
  const steps = sentences.filter(s => {
    const first = s.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
    return ACTION_VERBS.has(first);
  });
  // If fewer than 2 detected action steps, treat every sentence as a step
  return steps.length >= 2 ? steps : sentences.filter(s => s.trim().length > 10);
}

export function getWordCount(text) {
  return (text.match(/\S+/g) || []).length;
}

export function getReadingTime(text) {
  const wpm = 200;
  const mins = Math.ceil(getWordCount(text) / wpm);
  return mins === 1 ? '1 minute' : `${mins} minutes`;
}

// ─── Internal helper ───────────────────────────────────────────────────────

export function tokeniseSentences(text) {
  if (!text?.trim()) return [];
  const raw = text.replace(/\n+/g, ' ');
  return (raw.match(/[^.!?]*[.!?]+(?:\s|$)|[^.!?]+$/g) || [])
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export function tokeniseParagraphs(text) {
  if (!text?.trim()) return [];
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
}
