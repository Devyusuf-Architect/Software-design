// One-off rasterizer: turns the ClearPath wireframe-polyhedron logo into a PNG.
// Pure Node — no canvas/sharp dependency. Uses Bresenham with a circular brush
// for anti-aliased thick strokes, then encodes RGBA as PNG via zlib + CRC32.

import fs from 'node:fs';
import zlib from 'node:zlib';

const SIZE         = 1024;
const PADDING      = SIZE * 0.16;
const STROKE       = 12;                 // line thickness, in px
const COLOR        = [0x43, 0x38, 0xCA]; // indigo-700
const ALPHA        = 0xFF;

// SVG geometry (viewBox 0 0 64 64) from src/components/ClearPathLogo.jsx
const POLY_BACK = [
  [32,12], [48,20], [48,40], [32,48], [16,40], [16,20],
];
const POLY_FRONT = [
  [32,4],  [54,16], [54,44], [32,56], [10,44], [10,16],
];
const DEPTH = [
  [[32,12],[32,4]],
  [[48,20],[54,16]],
  [[48,40],[54,44]],
  [[32,48],[32,56]],
  [[16,40],[10,44]],
  [[16,20],[10,16]],
];
const INTERNAL = [
  [[32,12],[32,30]],
  [[32,30],[48,40]],
  [[32,30],[16,40]],
];

/* ── Pixel buffer (RGBA, premultiplied-style writes) ──────────── */
const buf = new Uint8Array(SIZE * SIZE * 4);

function blendPixel(xRaw, yRaw, a /* 0..1 */) {
  const x = xRaw | 0;
  const y = yRaw | 0;
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
  if (a <= 0) return;
  const i = (y * SIZE + x) * 4;
  const newA = Math.min(255, Math.round(ALPHA * a));
  if (newA > buf[i + 3]) {
    buf[i]     = COLOR[0];
    buf[i + 1] = COLOR[1];
    buf[i + 2] = COLOR[2];
    buf[i + 3] = newA;
  }
}

function drawDisc(cx, cy, r) {
  const rUp = Math.ceil(r) + 1;
  for (let dy = -rUp; dy <= rUp; dy++) {
    for (let dx = -rUp; dx <= rUp; dx++) {
      const d = Math.hypot(dx, dy);
      const a = Math.max(0, Math.min(1, r - d));   // 1 inside, falls off at edge
      if (a > 0) blendPixel(cx + dx, cy + dy, a);
    }
  }
}

function drawLine(x0, y0, x1, y1) {
  // Step along the line in small fractional increments so the brush overlaps
  const len = Math.hypot(x1 - x0, y1 - y0);
  const steps = Math.max(2, Math.ceil(len * 1.5));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    drawDisc(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, STROKE / 2);
  }
}

/* ── Scale coordinates from 64-unit SVG space to pixel space ─── */
function scale([x, y]) {
  const inner = SIZE - 2 * PADDING;
  return [PADDING + (x / 64) * inner, PADDING + (y / 64) * inner];
}

function drawPolygon(poly) {
  for (let i = 0; i < poly.length; i++) {
    const a = scale(poly[i]);
    const b = scale(poly[(i + 1) % poly.length]);
    drawLine(a[0], a[1], b[0], b[1]);
  }
}

function drawSegments(segs) {
  for (const [a, b] of segs) {
    const sa = scale(a);
    const sb = scale(b);
    drawLine(sa[0], sa[1], sb[0], sb[1]);
  }
}

/* ── Draw all paths ───────────────────────────────────────────── */
drawPolygon(POLY_BACK);
drawSegments(DEPTH);
drawPolygon(POLY_FRONT);
drawSegments(INTERNAL);

/* ── PNG encoder ──────────────────────────────────────────────── */
// CRC32 table (one-time)
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c >>> 0;
}
function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0, 0);
  return b;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = u32(data.length);
  const crc = u32(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

// IHDR — width, height, bit depth=8, color type=6 (RGBA), 0, 0, 0
const ihdr = Buffer.concat([
  u32(SIZE), u32(SIZE),
  Buffer.from([8, 6, 0, 0, 0]),
]);

// Raw scanlines with filter byte (0 = None) per row
const stride = SIZE * 4;
const filtered = Buffer.alloc(SIZE * (1 + stride));
for (let y = 0; y < SIZE; y++) {
  filtered[y * (1 + stride)] = 0;
  buf.subarray(y * stride, y * stride + stride).forEach((v, i) => {
    filtered[y * (1 + stride) + 1 + i] = v;
  });
}
const idat = zlib.deflateSync(filtered, { level: 9 });

const pngBytes = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
]);

const outPath = process.argv[2] || './clearpath-logo.png';
fs.writeFileSync(outPath, pngBytes);
console.log(`Wrote ${outPath} (${(pngBytes.length / 1024).toFixed(1)} KB, ${SIZE}x${SIZE})`);
