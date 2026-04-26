// Re-exports from contentTransformer — kept for compatibility
export {
  tokeniseSentences as splitIntoSentences,
  tokeniseParagraphs as splitIntoParagraphs,
  splitIntoSections,
  detectSteps as breakIntoSteps,
  removeUrgencyLanguage,
} from './contentTransformer';

// getKeyWordTokens is still used in-file in FoggyMode, so keep a minimal version here
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
