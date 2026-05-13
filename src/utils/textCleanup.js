/**
 * OCR text cleanup.
 *
 * Filters out navigation chrome, timestamps, repeated UI strings, and
 * very short / low-confidence fragments, then scores the remaining lines
 * by length and presence of action keywords so the most important lines
 * come first.
 */

const NAV_LABELS = new Set([
  'home', 'menu', 'search', 'settings', 'profile', 'login', 'log in', 'log out',
  'sign in', 'sign up', 'sign out', 'signup', 'logout', 'back', 'forward',
  'cancel', 'ok', 'close', 'help', 'about', 'contact', 'privacy', 'terms',
  'cookies', 'accept', 'reject', 'dismiss', 'notifications', 'messages',
  'inbox', 'sent', 'drafts', 'trash', 'spam', 'archive', 'star', 'starred',
  'edit', 'delete', 'save', 'new', 'open', 'file', 'view', 'tools', 'window',
  'tab', 'tabs', 'options', 'preferences', 'account', 'dashboard', 'admin',
  'main', 'next', 'previous', 'prev', 'page', 'more', 'less', 'show', 'hide',
  'expand', 'collapse', 'reply', 'forward', 'reply all',
  'q', 'x', 'y', 'z', 'ok', 'yes', 'no',
]);

const ACTION_KEYWORDS = [
  'submit', 'due', 'pay', 'paid', 'payment', 'read', 'upload', 'continue',
  'required', 'deadline', 'sign', 'confirm', 'verify', 'review', 'complete',
  'finish', 'start', 'apply', 'register', 'enroll', 'enrol', 'book', 'schedule',
  'reserve', 'return', 'update', 'must', 'should', 'need to', 'before',
  'expires', 'expire', 'overdue', 'invoice', 'balance', 'total', 'amount',
  'order', 'shipped', 'delivered', 'arriving', 'tracking', 'order',
  'appointment', 'meeting', 'reminder', 'urgent', 'important', 'action',
];

const TIMESTAMP_RX = /^\s*(\d{1,2}:\d{2}(:\d{2})?\s*(am|pm)?|\d{1,2}\/\d{1,2}(\/\d{2,4})?)\s*$/i;
const PURE_NUMERIC_RX = /^[\d\s\.\,\-]+$/;
const PUNCT_ONLY_RX = /^[\W_]+$/;

/**
 * Normalised lowercase key, stripped of punctuation, used for dedupe / nav matching.
 */
function normKey(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Clean the OCR result.
 *
 * @param {object} result { text, confidence, lines:[{text,confidence}] }
 * @returns {object} { cleanedText, rawText, lines, confidence, confidenceLabel, suggestion }
 */
export function cleanOcrResult(result) {
  const rawText   = result?.text || '';
  const rawConf   = typeof result?.confidence === 'number' ? result.confidence : 0;

  // If per-line data isn't available, split rawText by newline
  let lines = (result?.lines && result.lines.length)
    ? result.lines.slice()
    : rawText.split('\n').map((t) => ({ text: t, confidence: rawConf }));

  // ─── Pass 1: trim, normalise, drop obvious junk ─────────────
  lines = lines
    .map((l) => ({
      text: (l.text || '').replace(/\s+/g, ' ').trim(),
      confidence: l.confidence ?? 0,
    }))
    .filter((l) => l.text.length > 0)
    // remove very short fragments unless they're clearly numeric data
    .filter((l) => l.text.length >= 4 || /\d/.test(l.text))
    // remove pure punctuation lines
    .filter((l) => !PUNCT_ONLY_RX.test(l.text))
    // remove low-confidence garbage
    .filter((l) => l.confidence >= 35)
    // remove standalone timestamps
    .filter((l) => !TIMESTAMP_RX.test(l.text))
    // remove pure number lines that are too short (page counters etc)
    .filter((l) => !(PURE_NUMERIC_RX.test(l.text) && l.text.length < 6))
    // remove pure navigation labels
    .filter((l) => {
      const key = normKey(l.text);
      return !NAV_LABELS.has(key);
    })
    // remove lines that look like garbled OCR (high ratio of non-letter chars)
    .filter((l) => {
      const letters = (l.text.match(/[a-zA-Z]/g) || []).length;
      return letters >= 3 && letters / l.text.length >= 0.4;
    });

  // ─── Pass 2: dedupe ─────────────────────────────────────────
  const seen = new Set();
  lines = lines.filter((l) => {
    const key = normKey(l.text);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // ─── Pass 3: score and sort ─────────────────────────────────
  lines = lines.map((l) => {
    const lower = l.text.toLowerCase();
    const hasAction = ACTION_KEYWORDS.some((k) => lower.includes(k));
    const hasNumber = /\d/.test(l.text);
    let score = l.text.length;
    if (hasAction) score *= 1.6;
    if (hasNumber) score *= 1.25;
    if (l.confidence >= 80) score *= 1.1;
    return { ...l, score, hasAction, hasNumber };
  });

  // Preserve original document order for reading flow, but the scores are
  // available for callers that want the "top" line.

  const cleanedText = lines.map((l) => l.text).join('\n').trim();

  const avgConfidence = lines.length
    ? lines.reduce((s, l) => s + l.confidence, 0) / lines.length
    : rawConf;

  const confidenceLabel =
    avgConfidence >= 78 ? 'high'
    : avgConfidence >= 55 ? 'medium'
    : 'low';

  const suggestion =
    confidenceLabel === 'low'
      ? 'Try selecting the main content area instead of the full screen.'
      : confidenceLabel === 'medium'
        ? 'Selecting a tighter area can improve accuracy.'
        : null;

  return {
    rawText,
    cleanedText,
    lines,
    confidence: avgConfidence,
    confidenceLabel,
    suggestion,
  };
}
