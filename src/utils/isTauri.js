// True when running inside the Tauri desktop runtime, false in any browser.
export const isTauri =
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
