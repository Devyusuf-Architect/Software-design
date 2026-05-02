import { useState, useEffect, useRef, useCallback } from 'react';

// Rate/pitch settings per mode — slower and lower for anxious; brisk for stressed
const MODE_VOICE_SETTINGS = {
  calm:       { rate: 0.90, pitch: 1.0 },
  overwhelmed:{ rate: 0.78, pitch: 0.95 },
  foggy:      { rate: 0.82, pitch: 1.0 },
  anxious:    { rate: 0.72, pitch: 0.92 },
  stressed:   { rate: 0.95, pitch: 1.0 },
};

function pickBestVoice(voices) {
  if (!voices?.length) return null;

  // Prefer English natural/enhanced voices by name patterns
  const preferred = [
    /samantha/i, /karen/i, /daniel/i, /moira/i,
    /google uk english female/i, /google us english/i,
    /microsoft aria/i, /microsoft zira/i, /microsoft david/i,
    /enhanced/i, /natural/i, /premium/i,
  ];

  for (const pattern of preferred) {
    const found = voices.find(v => pattern.test(v.name) && /en[-_]/i.test(v.lang));
    if (found) return found;
  }

  // Fall back to any English voice
  return voices.find(v => /en[-_]/i.test(v.lang)) || voices[0] || null;
}

export function useSpeech() {
  const [isSpeaking,  setIsSpeaking]  = useState(false);
  const [isPaused,    setIsPaused]    = useState(false);
  const [charIndex,   setCharIndex]   = useState(-1);
  const [voices,      setVoices]      = useState([]);
  const [activeVoice, setActiveVoice] = useState(null);
  const [isSupported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window
  );
  const utteranceRef = useRef(null);

  // Load voices (Chrome fires voiceschanged; Firefox has them immediately)
  useEffect(() => {
    if (!isSupported) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) {
        setVoices(v);
        setActiveVoice(prev => prev || pickBestVoice(v));
      }
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, [isSupported]);

  useEffect(() => {
    return () => { if (isSupported) window.speechSynthesis.cancel(); };
  }, [isSupported]);

  const speak = useCallback((text, rateOverride, mode) => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setCharIndex(-1);

    const settings = MODE_VOICE_SETTINGS[mode] || MODE_VOICE_SETTINGS.calm;
    const rate     = rateOverride ?? settings.rate;

    const u = new SpeechSynthesisUtterance(text);
    u.rate   = rate;
    u.pitch  = settings.pitch;
    u.volume = 1.0;
    if (activeVoice) u.voice = activeVoice;

    u.onstart    = () => { setIsSpeaking(true);  setIsPaused(false); };
    u.onend      = () => { setIsSpeaking(false); setIsPaused(false); setCharIndex(-1); };
    u.onerror    = () => { setIsSpeaking(false); setIsPaused(false); setCharIndex(-1); };
    u.onpause    = () => setIsPaused(true);
    u.onresume   = () => setIsPaused(false);
    u.onboundary = (e) => { if (e.name === 'word') setCharIndex(e.charIndex); };

    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  }, [isSupported, activeVoice]);

  const pause = useCallback(() => {
    if (!isSupported || !isSpeaking || isPaused) return;
    window.speechSynthesis.pause();
  }, [isSupported, isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return;
    window.speechSynthesis.resume();
  }, [isSupported, isPaused]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCharIndex(-1);
  }, [isSupported]);

  const toggle = useCallback((text, rate, mode) => {
    if (!isSpeaking)       speak(text, rate, mode);
    else if (!isPaused)    pause();
    else                   resume();
  }, [isSpeaking, isPaused, speak, pause, resume]);

  const englishVoices = voices.filter(v => /en[-_]/i.test(v.lang));

  return {
    speak, stop, pause, resume, toggle,
    isSpeaking, isPaused, charIndex, isSupported,
    voices: englishVoices,
    activeVoice, setActiveVoice,
  };
}
