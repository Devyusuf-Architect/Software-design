// Generates all ClearPath icon files from the geometric wireframe logo.
// Pure Node — no canvas/sharp dependency. Uses same rasterizer as gen-logo.mjs.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// SVG geometry — same source-of-truth as ClearPathLogo.jsx (viewBox 0 0 64 64)
const POLY_BACK  = [[32,12],[48,20],[48,40],[32,48],[16,40],[16,20]];
const POLY_FRONT = [[32,4],[54,16],[54,44],[32,56],[10,44],[10,16]];
const DEPTH      = [[[32,12],[32,4]],[[48,20],[54,16]],[[48,40],[54,44]],
                    [[32,48],[32,56]],[[16,40],[10,44]],[[16,20],[10,16]]];
const INTERNAL   = [[[32,12],[32,30]],[[32,30],[48,40]],[[32,30],[16,40]]];

const INDIGO = [0x43, 0x38, 0xCA];
const WHITE  = [0xFF, 0xFF, 0xFF];

/* ── PNG encoder ──────────────────────────────────────────────────── */
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c >>> 0;
}
function crc32(b) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function u32be(n) { const b = Buffer.alloc(4); b.writeUInt32BE(n >>> 0, 0); return b; }
function u32le(n) { const b = Buffer.alloc(4); b.writeUInt32LE(n >>> 0, 0); return b; }
function u16le(n) { const b = Buffer.alloc(2); b.writeUInt16LE(n, 0);      return b; }

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  return Buffer.concat([u32be(data.length), t, data, u32be(crc32(Buffer.concat([t, data])))]);
}

function encodePng(pixels /* Uint8Array RGBA */, size) {
  const stride   = size * 4;
  const filtered = Buffer.alloc(size * (1 + stride));
  for (let y = 0; y < size; y++) {
    filtered[y * (1 + stride)] = 0;
    pixels.subarray(y * stride, y * stride + stride).forEach((v, i) => {
      filtered[y * (1 + stride) + 1 + i] = v;
    });
  }
  return Buffer.concat([
    Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]),
    pngChunk('IHDR', Buffer.concat([u32be(size), u32be(size), Buffer.from([8,6,0,0,0])])),
    pngChunk('IDAT', zlib.deflateSync(filtered, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ── Rasterizer ───────────────────────────────────────────────────── */
function renderIcon(size, { bg = null, color = INDIGO, strokePx = null, padding = 0.14 } = {}) {
  // Auto-scale stroke so lines are always visible
  const stroke = strokePx ?? Math.max(1.5, size * 0.055);

  const pixels = new Uint8Array(size * size * 4);

  if (bg) {
    for (let i = 0; i < size * size; i++) {
      pixels[i*4]   = bg[0];
      pixels[i*4+1] = bg[1];
      pixels[i*4+2] = bg[2];
      pixels[i*4+3] = 0xFF;
    }
  }

  function blend(xf, yf, a) {
    const x = xf | 0, y = yf | 0;
    if (x < 0 || y < 0 || x >= size || y >= size || a <= 0) return;
    const i   = (y * size + x) * 4;
    const na  = Math.min(255, Math.round(255 * a));
    if (bg) {
      const t = na / 255;
      pixels[i]   = Math.round(color[0]*t + bg[0]*(1-t));
      pixels[i+1] = Math.round(color[1]*t + bg[1]*(1-t));
      pixels[i+2] = Math.round(color[2]*t + bg[2]*(1-t));
      pixels[i+3] = 0xFF;
    } else {
      if (na > pixels[i+3]) {
        pixels[i] = color[0]; pixels[i+1] = color[1];
        pixels[i+2] = color[2]; pixels[i+3] = na;
      }
    }
  }

  function disc(cx, cy, r) {
    const rUp = Math.ceil(r) + 1;
    for (let dy = -rUp; dy <= rUp; dy++)
      for (let dx = -rUp; dx <= rUp; dx++) {
        const a = Math.max(0, Math.min(1, r - Math.hypot(dx, dy)));
        if (a > 0) blend(cx+dx, cy+dy, a);
      }
  }

  function line(x0, y0, x1, y1) {
    const steps = Math.max(2, Math.ceil(Math.hypot(x1-x0, y1-y0) * 1.5));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      disc(x0+(x1-x0)*t, y0+(y1-y0)*t, stroke/2);
    }
  }

  function sv([x, y]) {
    const inner = size * (1 - 2 * padding);
    return [size * padding + (x/64)*inner, size * padding + (y/64)*inner];
  }

  function polygon(poly) {
    for (let i = 0; i < poly.length; i++) {
      const [ax,ay] = sv(poly[i]);
      const [bx,by] = sv(poly[(i+1) % poly.length]);
      line(ax,ay,bx,by);
    }
  }

  function segments(segs) {
    for (const [a,b] of segs) {
      const [ax,ay] = sv(a), [bx,by] = sv(b);
      line(ax,ay,bx,by);
    }
  }

  polygon(POLY_BACK);
  segments(DEPTH);
  polygon(POLY_FRONT);
  segments(INTERNAL);

  return pixels;
}

/* ── ICO writer (PNG-inside-ICO, works on Windows Vista+) ─────────── */
function buildIco(entries /* [{size, pngBytes}] */) {
  const count    = entries.length;
  const hdrSize  = 6 + count * 16;
  let   offset   = hdrSize;

  const header = Buffer.concat([
    Buffer.from([0,0, 1,0]),
    u16le(count),
  ]);

  const dirEntries = entries.map(({ size, pngBytes }) => {
    const w = size >= 256 ? 0 : size;
    const h = size >= 256 ? 0 : size;
    const e = Buffer.concat([
      Buffer.from([w, h, 0, 0]),
      u16le(1), u16le(32),
      u32le(pngBytes.length),
      u32le(offset),
    ]);
    offset += pngBytes.length;
    return e;
  });

  return Buffer.concat([header, ...dirEntries, ...entries.map(e => e.pngBytes)]);
}

/* ── Generate all icons ───────────────────────────────────────────── */
function write(relPath, buf) {
  const abs = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, buf);
  console.log(`  wrote  ${relPath}  (${(buf.length/1024).toFixed(1)} KB)`);
}

console.log('\nGenerating website PWA icons...');

// Transparent-bg indigo wireframe — consistent with the logo PNG
for (const size of [192, 512]) {
  const px  = renderIcon(size, { bg: null, color: INDIGO });
  const png = encodePng(px, size);
  write(`public/icons/icon-${size}.png`, png);
}

// Maskable icons need a solid "safe zone" background (indigo fill)
for (const size of [192, 512]) {
  const px  = renderIcon(size, { bg: INDIGO, color: WHITE });
  const png = encodePng(px, size);
  write(`public/icons/icon-maskable-${size}.png`, png);
}

// 32x32 favicon PNG
const fav32 = renderIcon(32, { bg: null, color: INDIGO, strokePx: 2.5 });
write('public/favicon.png', encodePng(fav32, 32));

console.log('\nGenerating Tauri app icons...');

// White-background icons so they look correct in Windows Explorer / taskbar
const tauriConfigs = [
  { size: 32,  file: 'src-tauri/icons/32x32.png',       strokePx: 2.5  },
  { size: 128, file: 'src-tauri/icons/128x128.png',      strokePx: 8    },
  { size: 256, file: 'src-tauri/icons/128x128@2x.png',   strokePx: 14   },
  { size: 512, file: 'src-tauri/icons/icon.png',         strokePx: 24   },
];

for (const { size, file, strokePx } of tauriConfigs) {
  const px  = renderIcon(size, { bg: WHITE, color: INDIGO, strokePx });
  write(file, encodePng(px, size));
}

// ICO: 16, 32, 48 — used by Windows installer / exe
console.log('\nGenerating icon.ico...');
const icoEntries = [16, 32, 48].map((size) => {
  const strokePx = size === 16 ? 1.5 : size === 32 ? 2.5 : 3.5;
  const px  = renderIcon(size, { bg: WHITE, color: INDIGO, strokePx });
  return { size, pngBytes: encodePng(px, size) };
});
write('src-tauri/icons/icon.ico', buildIco(icoEntries));

console.log('\nDone.\n');
