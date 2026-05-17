const CLAUDE_API = 'https://api.anthropic.com/v1/messages';
const MODEL      = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You are ClearPath, an adaptive accessibility assistant that helps users understand content on their screens.

Analyze the screenshot and identify ONLY the main content the user is trying to understand or complete.
IGNORE completely: navigation bars, browser chrome, toolbars, system UI, taskbar, ads, sidebars, scroll bars, window decorations, ClearPath's own interface.
FOCUS on: the primary document, form, message, article, error, or task visible on screen.

Return ONLY valid JSON — no markdown, no explanation, just the JSON object:
{
  "context": "payment|error|form|instructions|article|general",
  "intent": "one sentence describing what the user is trying to do",
  "mainIdea": "1-2 sentence summary of the main content",
  "mattersMost": "the single most important piece of information (e.g. amount due, error message, required action)",
  "nextStep": "one clear actionable next step for the user",
  "keyPoints": ["2-4 short key points, one sentence each"],
  "cleanText": "the relevant readable text extracted from the main content area only"
}`;

async function compressImage(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const longSide = Math.max(img.width, img.height);
      if (longSide <= 1568) { resolve(dataUrl); return; }
      const scale  = 1568 / longSide;
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = dataUrl;
  });
}

const BUILT_IN_KEY = import.meta.env.VITE_ANTHROPIC_KEY || '';

export async function analyzeScreenshot(dataUrl, apiKey) {
  const key = BUILT_IN_KEY || apiKey;
  if (!key) throw new Error('NO_API_KEY');

  const compressed = await compressImage(dataUrl);
  const base64     = compressed.replace(/^data:image\/\w+;base64,/, '');
  const mediaType  = compressed.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

  const payload = JSON.stringify({
    model:      MODEL,
    max_tokens: 1024,
    system:     SYSTEM_PROMPT,
    messages: [{
      role:    'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
        { type: 'text', text: 'Analyze this screenshot and return the JSON response.' },
      ],
    }],
  });

  const { status, body } = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLAUDE_API);
    xhr.setRequestHeader('x-api-key',         key);
    xhr.setRequestHeader('anthropic-version', '2023-06-01');
    xhr.setRequestHeader('content-type',      'application/json');
    xhr.timeout   = 30000;
    xhr.onload    = () => resolve({ status: xhr.status, body: xhr.responseText });
    xhr.onerror   = () => reject(new Error('Network error — check your internet connection.'));
    xhr.ontimeout = () => reject(new Error('Request timed out — please try again.'));
    xhr.send(payload);
  });

  if (status === 401) throw new Error('INVALID_API_KEY');
  if (status === 429) throw new Error('RATE_LIMITED');
  if (status < 200 || status >= 300) {
    let msg = `API error ${status}`;
    try { msg = JSON.parse(body).error?.message || msg; } catch {}
    throw new Error(msg);
  }

  const data = JSON.parse(body);
  const text = data.content?.[0]?.text || '';

  try {
    const m = text.match(/```json\n?([\s\S]+?)\n?```/) || text.match(/(\{[\s\S]+\})/);
    return JSON.parse(m ? (m[1] || m[0]) : text);
  } catch {
    throw new Error('Could not parse AI response — please try again.');
  }
}

const KEY_STORAGE = 'clearpath_claude_key';

export const getApiKey   = ()    => (localStorage.getItem(KEY_STORAGE) || '').replace(/\s+/g, '');
export const saveApiKey  = (key) => localStorage.setItem(KEY_STORAGE, key.replace(/\s+/g, ''));
export const clearApiKey = ()    => localStorage.removeItem(KEY_STORAGE);
