// Split text into paragraphs (double newline separated)
export function splitIntoParagraphs(text) {
  if (!text || !text.trim()) return [];
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

// Split text into individual sentences
export function splitIntoSentences(text) {
  if (!text || !text.trim()) return [];
  const raw = text.replace(/\n+/g, ' ');
  const matches = raw.match(/[^.!?]*[.!?]+(?:\s|$)|[^.!?]+$/g) || [];
  return matches.map(s => s.trim()).filter(s => s.length > 0);
}

// Tokenise a sentence, returning each word with a bold flag.
// First word and words longer than 5 chars are bolded.
export function getKeyWordTokens(sentence) {
  const parts = sentence.split(/(\s+)/);
  let wordIndex = 0;
  return parts.map(part => {
    const isSpace = /^\s+$/.test(part);
    if (isSpace) return { text: part, bold: false, isSpace: true };
    const clean = part.replace(/[^a-zA-Z]/g, '');
    const bold = wordIndex === 0 || clean.length > 5;
    wordIndex++;
    return { text: part, bold, isSpace: false };
  });
}

// Convert text into a step list for StressedMode
export function breakIntoSteps(text) {
  const sentences = splitIntoSentences(text);
  return sentences.map((sentence, index) => ({
    id: index,
    text: sentence,
    completed: false,
  }));
}

// Strip words that carry urgency / anxiety from a block of text
export function removeUrgencyLanguage(text) {
  if (!text) return '';
  const patterns = [
    /\b(urgently?|immediately|right\s+now|hurry|limited\s+time|don'?t\s+miss|act\s+now|last\s+chance|deadline|expires?|expiring|warning|alert|critical|danger|must|required\s+immediately)\b/gi,
  ];
  let clean = text;
  patterns.forEach(p => { clean = clean.replace(p, ''); });
  return clean.replace(/\s{2,}/g, ' ').trim();
}
