const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// Minimal CRC32 for PNG
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function u32(n) { const b = Buffer.alloc(4); b.writeUInt32BE(n >>> 0); return b; }

function makeChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const crc = u32(crc32(Buffer.concat([t, data])));
  return Buffer.concat([u32(data.length), t, data, crc]);
}

function createPNG(w, h, pixelFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  const rows = [];
  for (let y = 0; y < h; y++) {
    const row = Buffer.alloc(1 + w * 3);
    for (let x = 0; x < w; x++) {
      const [r, g, b] = pixelFn(x, y, w, h);
      row[1 + x * 3] = r; row[1 + x * 3 + 1] = g; row[1 + x * 3 + 2] = b;
    }
    rows.push(row);
  }

  const idat = makeChunk('IDAT', zlib.deflateSync(Buffer.concat(rows)));
  return Buffer.concat([sig, makeChunk('IHDR', ihdr), idat, makeChunk('IEND', Buffer.alloc(0))]);
}

// Brand colors: #e8325a -> #d926ff -> #6b3fa0
function brandGradient(x, y, w, h) {
  const t = y / (h - 1);
  const s = x / (w - 1);
  const cx = s - 0.5, cy = t - 0.5;
  const dist = Math.sqrt(cx * cx + cy * cy);

  // Gradient: top-left accent, bottom-right purple
  const r = Math.round(0xe8 * (1 - t) + 0x6b * t);
  const g = Math.round(0x32 * (1 - t) + 0x3f * t);
  const b = Math.round(0x5a * (1 - t) + 0xa0 * t);

  // Slight vignette
  const vignette = Math.max(0.75, 1 - dist * 0.5);
  return [
    Math.min(255, Math.round(r * vignette)),
    Math.min(255, Math.round(g * vignette)),
    Math.min(255, Math.round(b * vignette)),
  ];
}

function splashPixel(x, y, w, h) {
  // Solid dark background with subtle center glow
  const cx = (x / w) - 0.5, cy = (y / h) - 0.5;
  const dist = Math.sqrt(cx * cx + cy * cy);
  const glow = Math.max(0, 0.35 - dist) / 0.35;
  const r = Math.round(7 + (0xe8 - 7) * glow * 0.45);
  const g = Math.round(8 + (0x32 - 8) * glow * 0.45);
  const b = Math.round(15 + (0x5a - 15) * glow * 0.45);
  return [r, g, b];
}

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

console.log('Generating icon.png (1024x1024)...');
fs.writeFileSync(path.join(assetsDir, 'icon.png'), createPNG(1024, 1024, brandGradient));

console.log('Generating splash.png (1284x2778)...');
fs.writeFileSync(path.join(assetsDir, 'splash.png'), createPNG(1284, 2778, splashPixel));

console.log('Generating adaptive-icon.png (1024x1024)...');
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), createPNG(1024, 1024, brandGradient));

console.log('Done!');
