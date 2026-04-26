const MODE_PROMPTS = {
  overwhelmed: [
    'Start here — just this one part.',
    'You only need to read this right now.',
    'This is the main idea.',
    'You can skip ahead if you need to.',
    'You\'re almost there.',
  ],
  foggy: [
    'Start here.',
    'This is the key sentence.',
    'Bold words are the most important.',
    'You can re-read this as many times as you need.',
    'Click any sentence to hear it.',
  ],
  anxious: [
    'Everything here is calm and predictable.',
    'Nothing will change without you clicking something.',
    'You are in control of this page.',
    'Take as long as you need.',
  ],
  stressed: [
    'Just focus on step 1 for now.',
    'You don\'t have to do it all at once.',
    'Each small step counts.',
    'You\'re making progress.',
  ],
  calm: [
    'All features are available.',
    'Take your time.',
  ],
};

export default function GuidancePrompt({ mode, index = 0, className = '' }) {
  const pool = MODE_PROMPTS[mode] || [];
  const message = pool[index % pool.length];
  if (!message) return null;

  return (
    <p className={`text-xs italic opacity-70 ${className}`}>
      {message}
    </p>
  );
}
