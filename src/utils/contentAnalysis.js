const URGENCY_WORDS = [
  'urgent','immediately','right now','hurry','act now','deadline','expires',
  'warning','alert','final notice','overdue','penalty','consequences','legal',
  'suspend','arrest','collection','default',
];

const COMPLEX_WORDS = [
  'pursuant','notwithstanding','arbitration','statute','indemnify',
  'aforementioned','hereinafter','negligence','liability','jurisdiction',
  'compliance','regulation','contraindicated','pursuant to','in accordance with',
];

export function calculateCognitiveLoad(text) {
  if (!text || typeof text !== 'string') return { level: 'low', score: 0, label: 'Low Load' };
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length || 1;
  const avgLen = words / sentences;
  const urgencyCount = URGENCY_WORDS.filter(w => lower.includes(w)).length;
  const complexCount = COMPLEX_WORDS.filter(w => lower.includes(w)).length;
  const paragraphs = text.split(/\n\n+/).filter(Boolean).length;

  let score = 0;
  if (words > 600)      score += 3;
  else if (words > 300) score += 2;
  else if (words > 100) score += 1;

  if (avgLen > 22)      score += 2;
  else if (avgLen > 15) score += 1;

  if (urgencyCount > 3)  score += 2;
  else if (urgencyCount > 0) score += 1;

  if (complexCount > 0)  score += 2;
  if (paragraphs > 6)    score += 1;

  if (score >= 6) return { level: 'high',   score, label: 'High Load' };
  if (score >= 3) return { level: 'medium', score, label: 'Medium Load' };
  return               { level: 'low',    score, label: 'Low Load' };
}

export function getModeRecommendation(cognitiveLoad, text) {
  const lower = (text || '').toLowerCase();
  const hasUrgency = URGENCY_WORDS.slice(0, 8).some(w => lower.includes(w));
  const { level } = cognitiveLoad || {};

  if (level === 'high' && hasUrgency) {
    return {
      mode: 'overwhelmed',
      reason: 'This page has dense content and urgent language. Try Overwhelmed mode to focus on one thing at a time.',
    };
  }
  if (level === 'high') {
    return {
      mode: 'foggy',
      reason: 'This content is complex and dense. Foggy mode highlights what matters most.',
    };
  }
  if (hasUrgency) {
    return {
      mode: 'anxious',
      reason: 'This page uses urgent or pressuring language. Anxious mode removes that pressure.',
    };
  }
  if (level === 'medium') {
    return {
      mode: 'stressed',
      reason: 'Breaking this into small steps will help you get through it steadily.',
    };
  }
  return {
    mode: 'calm',
    reason: 'This content looks manageable. Calm mode gives you full access.',
  };
}

export function estimateReadTime(wordCount) {
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function estimateTaskTime(stepCount) {
  return Math.max(1, Math.ceil(stepCount * 0.5));
}
