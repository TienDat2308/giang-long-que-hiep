// Icon and splash art drawn in code: a stick hero throwing a palm under the moon, a gold dragon arc around him.
// Shapes are signed-distance primitives in a 1024-unit design space, anti-aliased per pixel, written as PNG.
import { deflateSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

const INK = [8, 6, 12], PAPER = [243, 234, 214], GOLD = [242, 181, 68], MOON = [244, 231, 197];

const segDist = (x, y, ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(x - ax - dx * t, y - ay - dy * t);
};
const limbs = [
  [[470, 690], [500, 470]], [[497, 485], [620, 488]], [[620, 488], [745, 470]],
  [[497, 485], [420, 560]], [[420, 560], [480, 600]],
  [[470, 690], [590, 790]], [[590, 790], [615, 905]], [[470, 690], [390, 800]], [[390, 800], [335, 905]],
];
// each shape: kind, params, colour, optional glow
function figureShapes() {
  const S = [];
  for (const [a, b] of limbs) S.push({ k: 'seg', a, b, w: 30 + 16, c: INK });
  S.push({ k: 'circ', p: [515, 400], r: 46 + 8, c: INK }, { k: 'circ', p: [485, 350], r: 18 + 8, c: INK });
  for (const [a, b] of limbs) S.push({ k: 'seg', a, b, w: 30, c: PAPER });
  S.push({ k: 'circ', p: [515, 400], r: 46, c: PAPER }, { k: 'circ', p: [485, 350], r: 18, c: PAPER });
  return S;
}
function sceneShapes({ moon = true } = {}) {
  const S = [];
  if (moon) S.push({ k: 'glow', p: [700, 300], r: 280, c: [120, 96, 150], a: 0.45 }, { k: 'circ', p: [700, 300], r: 150, c: MOON });
  S.push({ k: 'glow', p: [512, 560], r: 420, c: GOLD, a: 0.12 });
  S.push({ k: 'arc', p: [512, 560], R: 330, w: 26, a0: 2.6, a1: 7.0, c: GOLD });
  S.push({ k: 'circ', p: [512 + 330 * Math.cos(7.0), 560 + 330 * Math.sin(7.0)], r: 30, c: GOLD });
  S.push(...figureShapes());
  S.push({ k: 'glow', p: [775, 468], r: 170, c: GOLD, a: 0.85 }, { k: 'circ', p: [775, 468], r: 24, c: [255, 250, 232] });
  return S;
}
function coverage(sh, X, Y, px) { // px = output pixels per design unit
  switch (sh.k) {
    case 'circ': return Math.min(1, Math.max(0, 0.5 - (Math.hypot(X - sh.p[0], Y - sh.p[1]) - sh.r) * px));
    case 'seg': return Math.min(1, Math.max(0, 0.5 - (segDist(X, Y, sh.a[0], sh.a[1], sh.b[0], sh.b[1]) - sh.w / 2) * px));
    case 'arc': {
      let ang = Math.atan2(Y - sh.p[1], X - sh.p[0]);
      while (ang < sh.a0) ang += Math.PI * 2;
      if (ang > sh.a1) return 0;
      const taper = 0.35 + 0.65 * (ang - sh.a0) / (sh.a1 - sh.a0); // thin tail, full head
      return Math.min(1, Math.max(0, 0.5 - (Math.abs(Math.hypot(X - sh.p[0], Y - sh.p[1]) - sh.R) - sh.w * taper / 2) * px));
    }
    case 'glow': { const d = Math.hypot(X - sh.p[0], Y - sh.p[1]) / sh.r; return d >= 1 ? 0 : sh.a * (1 - d) * (1 - d); }
  }
  return 0;
}
const bbox = sh => {
  const pad = 4;
  if (sh.k === 'seg') { const h = sh.w / 2 + pad; return [Math.min(sh.a[0], sh.b[0]) - h, Math.min(sh.a[1], sh.b[1]) - h, Math.max(sh.a[0], sh.b[0]) + h, Math.max(sh.a[1], sh.b[1]) + h]; }
  const r = (sh.k === 'arc' ? sh.R + sh.w : sh.r) + pad;
  return [sh.p[0] - r, sh.p[1] - r, sh.p[0] + r, sh.p[1] + r];
};

// w×h image; the 1024 design square is scaled by k and centred at (cx, cy)
export function render(w, h, { k = w / 1024, cx = w / 2, cy = h / 2, bg = true, moon = true, circle = false } = {}) {
  const out = new Uint8Array(w * h * 4), shapes = sceneShapes({ moon }).map(s => ({ ...s, bb: bbox(s) }));
  const ox = cx - 512 * k, oy = cy - 512 * k;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const X = (x + 0.5 - ox) / k, Y = (y + 0.5 - oy) / k;
    let r = 0, g = 0, b = 0, a = 0;
    if (bg) { const t = y / h; r = 11 + 31 * t; g = 9 + 17 * t; b = 22 + 36 * t; a = 1; }
    for (const s of shapes) {
      if (X < s.bb[0] || X > s.bb[2] || Y < s.bb[1] || Y > s.bb[3]) continue;
      const c = coverage(s, X, Y, k); if (c <= 0) continue;
      if (s.k === 'glow' && bg) { r = Math.min(255, r + s.c[0] * c); g = Math.min(255, g + s.c[1] * c); b = Math.min(255, b + s.c[2] * c); continue; } // light adds on the night sky
      const na = a + (1 - a) * c, f = c / na; // straight-alpha "over"
      r += (s.c[0] - r) * f; g += (s.c[1] - g) * f; b += (s.c[2] - b) * f; a = na;
    }
    if (circle) { const d = Math.hypot(x + 0.5 - w / 2, y + 0.5 - h / 2) - w / 2; a *= Math.min(1, Math.max(0, 0.5 - d)); }
    const i = (y * w + x) * 4;
    out[i] = Math.round(r); out[i + 1] = Math.round(g); out[i + 2] = Math.round(b); out[i + 3] = Math.round(a * 255);
  }
  return out;
}

const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = buf => { let c = -1; for (const v of buf) c = CRC[(c ^ v) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]), crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
export function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
export const pngSize = file => { const b = readFileSync(file); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
