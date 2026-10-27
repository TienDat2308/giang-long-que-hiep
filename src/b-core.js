'use strict';
// ---------- helpers ----------
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const approach = (v, t, d) => v < t ? Math.min(v + d, t) : Math.max(v - d, t);
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = id => document.getElementById(id);
let T = 0;
let GA = 1, REFLECT = false; // alpha factor + flag used while drawing the floor reflection

// ---------- canvas & world ----------
const cv = $('game'), ctx = cv.getContext('2d');
const WORLD_W = 2600, GROUND = 470;
const view = { w: 960, h: 540, scale: 1, dpr: 1, camX: 0, camY: 0, shake: 0, look: 0 };
function resize() {
  view.dpr = Math.min(2, window.devicePixelRatio || 1);
  // a hidden page can report zero size; fall back so the scale (and with it the camera) never becomes 0 or NaN
  const w = cv.clientWidth || innerWidth || 960, h = cv.clientHeight || innerHeight || 540;
  cv.width = Math.round(w * view.dpr); cv.height = Math.round(h * view.dpr);
  view.scale = Math.max(0.05, Math.min(h / 540, w / 760));
  view.w = w / view.scale; view.h = h / view.scale;
}
addEventListener('resize', resize); resize();

// one-way platforms of the current map (set by setMap in b-maps.js)
let PLATFORMS = [];
const C = {
  gold: [242, 181, 68], jade: [98, 214, 180], blood: [226, 72, 63], paper: [239, 230, 210],
  white: [255, 246, 222], ember: [255, 128, 64], mist: [150, 140, 170], moon: [244, 231, 197], plum: [243, 166, 184],
};
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

// ---------- input ----------
const keys = {}, buf = {};
const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowDown: 'down', KeyS: 'down',
  ArrowUp: 'jump', KeyW: 'jump', Space: 'jump', KeyJ: 'attack', KeyK: 'dash', ShiftLeft: 'dash', ShiftRight: 'dash',
  KeyU: 's1', Digit1: 's1', KeyI: 's2', Digit2: 's2', KeyO: 's3', Digit3: 's3', KeyY: 's4', Digit4: 's4', KeyH: 's5', Digit5: 's5',
  KeyL: 'ult', Digit6: 'ult',
  KeyP: 'pause', Escape: 'pause',
};
function press(a) {
  if (a === 'pause') return togglePause();
  if (game.state !== 'play') return;
  if (!keys[a]) buf[a] = 0.16;
  keys[a] = true;
}
function release(a) { keys[a] = false; }
function take(a) { if (buf[a] > 0) { buf[a] = 0; return true; } return false; }
addEventListener('keydown', e => {
  const ov = $('overlay');
  if (!ov.hidden && e.target.closest && e.target.closest('#overlay button') && !e.target.classList.contains('cta') && (e.code === 'Enter' || e.code === 'Space')) return; // let a focused menu button activate itself
  if (!ov.hidden && (e.code === 'Enter' || e.code === 'Space')) {
    e.preventDefault();
    const b = ov.querySelector('[data-screen]:not([hidden]) .cta:not([hidden])'); if (b) b.click();
    return;
  }
  const a = KEYMAP[e.code]; if (!a) return;
  e.preventDefault(); if (e.repeat) return; press(a);
});
addEventListener('keyup', e => { const a = KEYMAP[e.code]; if (a) { e.preventDefault(); release(a); } });
addEventListener('blur', () => { for (const a in keys) keys[a] = false; });
document.querySelectorAll('[data-act]').forEach(b => {
  const a = b.dataset.act;
  const up = () => { b.classList.remove('on'); release(a); };
  b.addEventListener('pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (_) {} b.classList.add('on'); press(a); });
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
  b.addEventListener('contextmenu', e => e.preventDefault());
});
if (matchMedia('(pointer: coarse)').matches) document.body.classList.add('touch');
addEventListener('touchstart', () => document.body.classList.add('touch'), { once: true, passive: true });
// phones: no pinch or double-tap zoom, and wake the audio again after the app returns from the background
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());
const wakeAudio = () => { if (SFX.ac && SFX.ac.state !== 'running') SFX.ac.resume().catch(() => {}); };
addEventListener('pointerdown', wakeAudio, { passive: true });
addEventListener('touchend', wakeAudio, { passive: true });

// ---------- sound (synthesised, starts on the first click) ----------
const SFX = { ac: null, noise: null, out: null, on: true };
function audioInit() {
  if (SFX.ac) return;
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    SFX.ac = ac; SFX.out = ac.createGain(); SFX.out.gain.value = 0.45; SFX.out.connect(ac.destination);
    const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    SFX.noise = b;
  } catch (e) { SFX.ac = null; }
}
function tone(type, f0, f1, dur, vol, delay = 0) {
  const ac = SFX.ac, t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(SFX.out); o.start(t); o.stop(t + dur + 0.02);
}
function hiss(dur, vol, ftype, f0, f1, q = 1, delay = 0) {
  const ac = SFX.ac, t = ac.currentTime + delay, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = SFX.noise; f.type = ftype; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(SFX.out); s.start(t); s.stop(t + dur + 0.02);
}
function sfx(n) {
  if (!SFX.ac || !SFX.on) return;
  try {
    switch (n) {
      case 'hit': hiss(0.09, 0.45, 'lowpass', 2400, 400); tone('sine', 170, 50, 0.12, 0.45); break;
      case 'heavy': hiss(0.2, 0.6, 'lowpass', 1800, 200); tone('sine', 110, 35, 0.28, 0.6); break;
      case 'swing': hiss(0.12, 0.16, 'bandpass', 900, 3200, 2); break;
      case 'jump': hiss(0.2, 0.13, 'bandpass', 600, 2400, 3); break;
      case 'dash': hiss(0.26, 0.22, 'bandpass', 3200, 500, 2); break;
      case 'charge': tone('sine', 200, 640, 0.4, 0.1); break;
      case 'roar': { // growling dragon: a falling saw with a fast vibrato, a sub drop and breath noise
        const ac = SFX.ac, t = ac.currentTime, o = ac.createOscillator(), l = ac.createOscillator(), lg = ac.createGain(), f = ac.createBiquadFilter(), g = ac.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(50, t + 1.1);
        l.frequency.value = 24; lg.gain.value = 22; l.connect(lg); lg.connect(o.frequency);
        f.type = 'lowpass'; f.frequency.setValueAtTime(1400, t); f.frequency.exponentialRampToValueAtTime(260, t + 1.1);
        g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(0.26, t + 0.06); g.gain.exponentialRampToValueAtTime(0.001, t + 1.15);
        o.connect(f); f.connect(g); g.connect(SFX.out); o.start(t); l.start(t); o.stop(t + 1.2); l.stop(t + 1.2);
        tone('sine', 72, 32, 0.9, 0.45); hiss(1.0, 0.28, 'lowpass', 1500, 140);
        break;
      }
      case 'boom': tone('sine', 92, 26, 0.9, 0.85); hiss(0.7, 0.6, 'lowpass', 1000, 70); break;
      case 'dart': hiss(0.08, 0.14, 'highpass', 4000, 7000, 1); break;
      case 'hurt': tone('triangle', 300, 120, 0.2, 0.28); hiss(0.12, 0.28, 'lowpass', 1500, 300); break;
      case 'bow': tone('triangle', 260, 110, 0.18, 0.2); hiss(0.1, 0.12, 'bandpass', 2000, 800, 2); break;
      case 'clang': tone('square', 1500, 900, 0.12, 0.05); tone('sine', 2400, 2050, 0.3, 0.05); hiss(0.05, 0.12, 'highpass', 5000, 6000, 1); break;
      case 'gong': tone('sine', 220, 212, 1.6, 0.3); tone('sine', 331, 322, 1.3, 0.14); tone('sine', 96, 92, 1.9, 0.28); break;
    }
  } catch (e) {}
}

// ---------- effects ----------
const FX = { parts: [], rings: [], texts: [], ghosts: [], flash: 0, flashCol: '255,246,222', hitstop: 0, vig: 0, zoom: 0 };
const sprites = {};
function sprite(c, core) {
  const key = c.join() + (core ? 'c' : '');
  if (sprites[key]) return sprites[key];
  const s = document.createElement('canvas'); s.width = s.height = 64;
  const g = s.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, core ? 'rgba(255,253,240,1)' : rgba(c, 1));
  gr.addColorStop(0.22, rgba(c, 0.85)); gr.addColorStop(0.55, rgba(c, 0.22)); gr.addColorStop(1, rgba(c, 0));
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return (sprites[key] = s);
}
function glow(x, y, r, c, a = 1, core = true) { ctx.globalAlpha = a * GA; ctx.drawImage(sprite(c, core), x - r, y - r, r * 2, r * 2); }
// four-point glint: hit impacts and blade gleams
function drawFlare(x, y, r, rot, col = C.white, a = 1, arms = 2) {
  glow(x, y, r * 0.8, col, a);
  ctx.globalAlpha = a * GA; ctx.fillStyle = rgba(col, 1);
  for (let i = 0; i < arms; i++) { ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.06 + 0.7, rot + i * Math.PI / 2, 0, TAU); ctx.fill(); }
}
// 掌印: a giant golden palm print; sy < 1 flattens it onto the ground
function drawPalm(x, y, r, sy, a, col = C.gold) {
  ctx.save(); ctx.translate(x, y); ctx.scale(r / 40, (r / 40) * sy);
  glow(0, -4, 72, col, a * 0.7);
  ctx.globalAlpha = a * 0.5 * GA; ctx.fillStyle = rgba(col, 1); ctx.strokeStyle = rgba(col, 1); ctx.lineCap = 'round';
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(-17, -8, 34, 36, 9); else ctx.rect(-17, -8, 34, 36); ctx.fill();
  ctx.lineWidth = 8.5; ctx.beginPath();
  for (const [fx, len] of [[-12, 22], [-4, 27], [4, 26], [12, 21]]) { ctx.moveTo(fx, -4); ctx.lineTo(fx * 1.1, -4 - len); }
  ctx.moveTo(-14, 16); ctx.lineTo(-30, 0); ctx.stroke();
  ctx.globalAlpha = a * 0.85 * GA; ctx.strokeStyle = 'rgb(255,248,226)'; ctx.lineWidth = 1.4; ctx.beginPath(); // palm creases
  ctx.moveTo(-14, 4); ctx.quadraticCurveTo(0, 0, 14, 6); ctx.moveTo(-13, 12); ctx.quadraticCurveTo(-2, 10, 10, 18); ctx.moveTo(-6, 26); ctx.quadraticCurveTo(-12, 14, -10, 2); ctx.stroke();
  ctx.restore();
}
function spawn(o) {
  FX.parts.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, t: 0, life: 0.5, size: 6, col: C.gold, grav: 0, drag: 2, kind: 'glow', rot: 0, vr: 0 }, o));
}
function burst(x, y, n, col, spd, o) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), s = rand(spd * 0.3, spd);
    spawn(Object.assign({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.25, 0.6), size: rand(3, 8), col }, o));
  }
}
function sparks(x, y, dir, n, col) {
  for (let i = 0; i < n; i++) spawn({ x, y, vx: dir * rand(150, 750) + rand(-120, 120), vy: rand(-420, 160), life: rand(0.15, 0.4), size: rand(1.5, 3.5), col, kind: 'spark', grav: 1100, drag: 1 });
}
function dust(x, y, n, dir = 0) {
  for (let i = 0; i < n; i++) spawn({ x: x + rand(-12, 12), y: y - 3, vx: dir * rand(40, 160) + rand(-70, 70), vy: rand(-70, -10), life: rand(0.35, 0.75), size: rand(6, 14), col: C.mist, kind: 'soft', drag: 3 });
}
function ring(x, y, r0, r1, life, col, w = 6, o = {}) { FX.rings.push({ x, y, r0, r1, life, t: 0, col, w, flat: o.flat || 1 }); }
function popText(x, y, txt, col, size = 20) { FX.texts.push({ x, y, txt: String(txt), col, size, t: 0, life: 0.85 }); }
function shake(a) { view.shake = Math.max(view.shake, RM ? a * 0.25 : a); }
function flash(a, col = '255,246,222') { a = RM ? a * 0.4 : a; if (a > FX.flash) { FX.flash = a; FX.flashCol = col; } }
function hitstop(t) { FX.hitstop = Math.max(FX.hitstop, t); }
function cloneJ(J) { const o = {}; for (const k in J) o[k] = { x: J[k].x, y: J[k].y }; return o; }
function addGhost(J, col, s) { FX.ghosts.push({ J: cloneJ(J), col, s, t: 0, life: 0.3 }); }

function updateFX(dt) {
  for (const p of FX.parts) {
    p.t += dt; const d = 1 / (1 + p.drag * dt);
    p.vx *= d; p.vy = p.vy * d + p.grav * dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    if (p.grav > 0 && p.y > GROUND) { p.y = GROUND; p.vy *= -0.3; p.vx *= 0.6; }
    if (p.kind === 'petal' || p.kind === 'snow') { p.vx += Math.sin(T * 1.3 + p.rot) * 6 * dt; if (p.y > GROUND) p.t = p.life; }
  }
  FX.parts = FX.parts.filter(p => p.t < p.life);
  if (FX.parts.length > 1500) FX.parts.splice(0, FX.parts.length - 1500);
  for (const r of FX.rings) r.t += dt;
  FX.rings = FX.rings.filter(r => r.t < r.life);
  for (const t of FX.texts) t.t += dt;
  FX.texts = FX.texts.filter(t => t.t < t.life);
  for (const g of FX.ghosts) g.t += dt;
  FX.ghosts = FX.ghosts.filter(g => g.t < g.life);
}
function drawSoftFX() {
  ctx.save();
  for (const p of FX.parts) {
    const k = 1 - p.t / p.life;
    if (p.kind === 'soft') glow(p.x, p.y, p.size * (2.2 - k), p.col, k * 0.28, false);
    else if (p.kind === 'rock') {
      ctx.globalAlpha = Math.min(1, k * 3); ctx.fillStyle = rgba(p.col, 1);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.75); ctx.restore();
    }
    else if (p.kind === 'snow') { ctx.globalAlpha = Math.min(1, k * 4) * 0.85; ctx.fillStyle = rgba(p.col, 1); ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill(); }
    else if (p.kind === 'petal') {
      ctx.globalAlpha = Math.min(1, k * 4) * 0.8; ctx.fillStyle = rgba(p.col, 1);
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size, p.size * 0.45 * Math.abs(Math.cos(p.rot)) + 0.6, p.rot, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}
function drawFX() {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (const p of FX.parts) {
    const k = 1 - p.t / p.life;
    if (p.kind === 'glow') glow(p.x, p.y, p.size * (0.6 + k) * 2.2, p.col, k);
    else if (p.kind === 'ember') glow(p.x, p.y, p.size * 2.4, p.col, k * (0.55 + 0.45 * Math.sin(p.t * 28 + p.rot)));
    else if (p.kind === 'flare') drawFlare(p.x, p.y, p.size * (0.6 + (1 - k) * 0.7), p.rot, p.col, k, p.arms || 2);
    else if (p.kind === 'pillar') { // column of light bursting from the ground
      ctx.save(); ctx.translate(p.x, p.y - p.size); ctx.scale(0.3, 1);
      glow(0, 0, p.size, p.col, k * Math.min(1, p.t / 0.05)); ctx.restore();
    } else if (p.kind === 'palm') drawPalm(p.x, p.y, p.size * (0.7 + (1 - k) * 0.8), p.flat || 1, k * Math.min(1, p.t / 0.04));
    else if (p.kind === 'streak') { // chưởng phong: wind lines driven ahead of a palm
      ctx.globalAlpha = k * 0.6 * GA; ctx.strokeStyle = rgba(p.col, 1); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - Math.sign(p.vx) * p.size, p.y); ctx.stroke();
    } else if (p.kind === 'feather') {
      ctx.globalAlpha = k * 0.85 * GA; ctx.fillStyle = rgba(p.col, 1);
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size, p.size * 0.3, p.rot + Math.sin(p.t * 6) * 0.5, 0, TAU); ctx.fill();
    }
    else if (p.kind === 'spark') {
      ctx.globalAlpha = k; ctx.strokeStyle = rgba(p.col, 1); ctx.lineWidth = p.size;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025); ctx.stroke();
    }
  }
  for (const r of FX.rings) {
    const k = r.t / r.life, e = 1 - Math.pow(1 - k, 3), rad = lerp(r.r0, r.r1, e);
    ctx.strokeStyle = rgba(r.col, 1);
    for (const [wm, am] of [[2.6, 0.25], [1, 1]]) {
      ctx.globalAlpha = (1 - k) * am; ctx.lineWidth = r.w * (1 - k) * wm + 0.5;
      ctx.beginPath(); ctx.ellipse(r.x, r.y, rad, rad * r.flat, 0, 0, TAU); ctx.stroke();
    }
  }
  ctx.restore();
}
function figPath(J) {
  ctx.moveTo(J.hip.x, J.hip.y); ctx.lineTo(J.neck.x, J.neck.y);
  ctx.moveTo(J.sh.x, J.sh.y); ctx.lineTo(J.e1.x, J.e1.y); ctx.lineTo(J.h1.x, J.h1.y);
  ctx.moveTo(J.sh.x, J.sh.y); ctx.lineTo(J.e2.x, J.e2.y); ctx.lineTo(J.h2.x, J.h2.y);
  ctx.moveTo(J.hip.x, J.hip.y); ctx.lineTo(J.k1.x, J.k1.y); ctx.lineTo(J.f1.x, J.f1.y);
  ctx.moveTo(J.hip.x, J.hip.y); ctx.lineTo(J.k2.x, J.k2.y); ctx.lineTo(J.f2.x, J.f2.y);
}
function drawGhosts() {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const g of FX.ghosts) {
    const k = 1 - g.t / g.life, J = g.J;
    ctx.globalAlpha = k * 0.42; ctx.strokeStyle = rgba(g.col, 1); ctx.fillStyle = rgba(g.col, 1); ctx.lineWidth = 4 * g.s;
    ctx.beginPath(); figPath(J); ctx.stroke();
    ctx.beginPath(); ctx.arc(J.head.x, J.head.y, 8.5 * g.s, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function drawTexts() {
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  for (const t of FX.texts) {
    const k = t.t / t.life, sc = k < 0.15 ? 1.45 - k * 3 : 1, y = t.y - k * 50;
    ctx.globalAlpha = 1 - Math.max(0, (k - 0.6) / 0.4);
    ctx.font = `700 ${Math.round(t.size * sc)}px "Cormorant Garamond", Georgia, serif`;
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(8,6,12,0.85)'; ctx.strokeText(t.txt, t.x, y);
    ctx.fillStyle = t.col; ctx.fillText(t.txt, t.x, y);
  }
  ctx.restore();
}

