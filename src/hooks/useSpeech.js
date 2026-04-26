import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused,   setIsPaused]   = useState(false);
  const [charIndex,  setCharIndex]  = useState(-1);
  const [isSupported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window
  );
  const utteranceRef = useRef(null);

  useEffect(() => {
    return () => { if (isSupported) window.speechSynthesis.cancel(); };
  }, [isSupported]);

  const speak = useCallback((text, rate = 0.85) => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setCharIndex(-1);

    const u = new SpeechSynthesisUtterance(text);
    u.rate   = rate;
    u.pitch  = 1.0;
    u.volume = 1.0;

    u.onstart    = () => { setIsSpeaking(true);  setIsPaused(false); };
    u.onend      = () => { setIsSpeaking(false); setIsPaused(false); setCharIndex(-1); };
    u.onerror    = () => { setIsSpeaking(false); setIsPaused(false); setCharIndex(-1); };
    u.onpause    = () => setIsPaused(true);
    u.onresume   = () => setIsPaused(false);
    u.onboundary = (e) => { if (e.name === 'word') setCharIndex(e.charIndex); };

    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  }, [isSupported]);

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

  // Convenience: play → pause → resume cycle
  const toggle = useCallback((text, rate) => {
    if (!isSpeaking)       speak(text, rate);
    else if (!isPaused)    pause();
    else                   resume();
  }, [isSpeaking, isPaused, speak, pause, resume]);

  return { speak, stop, pause, resume, toggle, isSpeaking, isPaused, charIndex, isSupported };
}
