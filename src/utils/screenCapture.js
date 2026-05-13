/**
 * Screen capture and OCR utilities.
 *
 * Uses navigator.mediaDevices.getDisplayMedia():
 *   - Triggers the OS-native screen / window / region picker
 *   - Requires explicit user consent every time it is called
 *   - Stream is stopped immediately after one frame is grabbed
 *
 * No background capture, no continuous monitoring.
 */

/**
 * Open the OS screen/window picker and capture a single frame.
 * Returns { dataUrl, width, height }.
 */
export async function captureScreen() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('Screen capture is not supported in this environment.');
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'monitor',
        frameRate: { ideal: 1, max: 5 },
      },
      audio: false,
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
    await video.play();
    await new Promise((resolve) => {
      if (video.readyState >= 2) return resolve();
      video.onloadeddata = () => resolve();
    });
    await new Promise((r) => setTimeout(r, 120));

    const w = video.videoWidth  || 1280;
    const h = video.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);

    return {
      dataUrl: canvas.toDataURL('image/png'),
      width: w,
      height: h,
    };
  } finally {
    stream.getTracks().forEach((t) => t.stop());
  }
}

/**
 * Load a data URL into an HTMLImageElement (waits for decode).
 */
function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Crop the source image to the given normalized rectangle
 * (x, y, w, h are in the 0..1 range, relative to the image).
 * Returns a new dataUrl + dimensions.
 */
export async function cropDataUrl(dataUrl, rectNorm) {
  const img = await loadImage(dataUrl);
  const sx = Math.max(0, Math.round(img.width  * rectNorm.x));
  const sy = Math.max(0, Math.round(img.height * rectNorm.y));
  const sw = Math.max(1, Math.round(img.width  * rectNorm.w));
  const sh = Math.max(1, Math.round(img.height * rectNorm.h));

  const c = document.createElement('canvas');
  c.width = sw;
  c.height = sh;
  c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  return { dataUrl: c.toDataURL('image/png'), width: sw, height: sh };
}

/**
 * Preprocess an image data URL to improve OCR accuracy:
 *   - upscale (1.5x to 2x depending on size)
 *   - convert to grayscale (luminance formula)
 *   - increase contrast
 *   - sharpen via small unsharp mask
 *
 * Returns a new dataUrl + dimensions.
 */
export async function preprocessForOcr(dataUrl) {
  const img = await loadImage(dataUrl);

  // Smaller images benefit more from upscaling. Target ~1600-2000px on long side.
  const longSide = Math.max(img.width, img.height);
  const targetLong = 1800;
  const scale = longSide < targetLong ? Math.min(2, targetLong / longSide) : 1;

  const w = Math.round(img.width  * scale);
  const h = Math.round(img.height * scale);

  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);

  const id = ctx.getImageData(0, 0, w, h);
  const data = id.data;

  // Grayscale + contrast. Contrast: ((v - 128) * factor) + 128
  const contrast = 1.35;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    let v = (gray - 128) * contrast + 128;
    if (v < 0) v = 0;
    else if (v > 255) v = 255;
    data[i] = data[i + 1] = data[i + 2] = v;
  }

  // Light unsharp mask (3x3) — improves text edges noticeably without too much noise.
  // Convolution kernel: center 5, neighbours -1
  // Done in-place by reading from a copy.
  const src = new Uint8ClampedArray(data);
  const stride = w * 4;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * stride + x * 4;
      const center  = src[i];
      const top     = src[i - stride];
      const bottom  = src[i + stride];
      const left    = src[i - 4];
      const right   = src[i + 4];
      let v = 5 * center - (top + bottom + left + right);
      if (v < 0) v = 0;
      else if (v > 255) v = 255;
      data[i] = data[i + 1] = data[i + 2] = v;
    }
  }

  ctx.putImageData(id, 0, 0);
  return { dataUrl: c.toDataURL('image/png'), width: w, height: h };
}

/**
 * Run OCR on a data URL using Tesseract.js. Returns:
 *   { text, confidence, lines: [{ text, confidence }, ...] }
 *
 * onProgress(0..1) is called during the recognition phase.
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
    const rawText = (data?.text || '').replace(/[ \t]+\n/g, '\n').trim();
    const confidence = data?.confidence ?? 0;

    const lines = (data?.lines || [])
      .map((l) => ({
        text: (l.text || '').trim(),
        confidence: typeof l.confidence === 'number' ? l.confidence : 0,
      }))
      .filter((l) => l.text);

    return { text: rawText, confidence, lines };
  } finally {
    await worker.terminate();
  }
}
