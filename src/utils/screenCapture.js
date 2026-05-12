/**
 * Screen capture utilities.
 *
 * Uses the standard navigator.mediaDevices.getDisplayMedia() API which:
 *   - Triggers the OS-native screen / window / region picker
 *   - Requires explicit user consent every time it is called
 *   - Returns a MediaStream from the chosen surface
 *
 * Nothing happens until the caller invokes captureScreen(); the user is
 * fully in control. The stream is stopped immediately after one frame is
 * grabbed — no continuous capture.
 */

/**
 * Open the OS screen/window picker and capture a single frame.
 * Returns a PNG data URL of the captured frame.
 *
 * Throws if the user dismisses the picker or the browser refuses.
 */
export async function captureScreen() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('Screen capture is not supported in this environment.');
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        // Hint to the OS picker: prefer a full monitor or window over a browser tab
        displaySurface: 'monitor',
        // Keep frame rate low — we only grab one frame
        frameRate: { ideal: 1, max: 5 },
      },
      audio: false,
      // Hint to exclude the ClearPath window itself from the picker if supported
      selfBrowserSurface: 'exclude',
      surfaceSwitching: 'exclude',
      systemAudio: 'exclude',
      preferCurrentTab: false,
    });
  } catch (err) {
    if (err?.name === 'NotAllowedError') {
      throw new Error('Screen capture was cancelled.');
    }
    throw new Error(err?.message || 'Screen capture failed to start.');
  }

  try {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;

    // Wait until the first frame is actually decoded
    await video.play();
    await new Promise((resolve) => {
      if (video.readyState >= 2) return resolve();
      video.onloadeddata = () => resolve();
    });
    // Give the OS a brief moment to render the chosen surface
    await new Promise((r) => setTimeout(r, 120));

    const w = video.videoWidth  || 1280;
    const h = video.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);

    return {
      dataUrl: canvas.toDataURL('image/png'),
      width: w,
      height: h,
    };
  } finally {
    // Always stop every track so the OS capture indicator turns off
    stream.getTracks().forEach((t) => t.stop());
  }
}

/**
 * Run OCR on a data URL using Tesseract.js (dynamically imported so the
 * library is only fetched when the user actually captures a screen).
 *
 * Returns the extracted text (may be empty if the image had no readable text).
 *
 * Optional `onProgress(0..1)` callback receives Tesseract's recognition progress.
 */
export async function extractTextFromImage(dataUrl, onProgress) {
  const { createWorker } = await import('tesseract.js');

  const worker = await createWorker('eng', undefined, {
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof onProgress === 'function') {
        onProgress(Math.min(1, m.progress ?? 0));
      }
    },
  });

  try {
    const { data } = await worker.recognize(dataUrl);
    return (data?.text || '').replace(/[ \t]+\n/g, '\n').trim();
  } finally {
    await worker.terminate();
  }
}
