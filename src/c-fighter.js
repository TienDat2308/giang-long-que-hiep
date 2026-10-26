
// ---------- skeleton & poses ----------
// Angles in radians, facing-relative: limbs measured from straight down, torso from straight up, forward is positive.
function P(t, h, a1, b1, a2, b2, l1, k1, l2, k2, rot = 0) { return { t, h, a1, b1, a2, b2, l1, k1, l2, k2, rot }; }
const PK = ['t', 'h', 'a1', 'b1', 'a2', 'b2', 'l1', 'k1', 'l2', 'k2', 'rot'];
const POSES = {
  stance: P(0.1, 0, 1.25, 2.0, 0.45, 2.5, 0.5, 0.05, -0.45, -0.15),
  jump: P(0.05, -0.1, 1.9, 2.6, -1.2, -0.6, 1.3, -0.2, 0.5, -0.9),
  fall: P(0, 0.05, 1.6, 1.9, -1.4, -1.1, 0.5, 0.15, -0.3, -0.5),
  glide: P(0.2, 0.15, 1.75, 1.95, -1.75, -1.95, 1.0, -0.2, -0.25, -0.7),
  dash: P(0.75, 0.25, -1.3, -1.55, -1.5, -1.75, 0.95, 0.3, -0.95, -1.2),
  jabW: P(0, 0, 0.6, 2.4, 0.4, 2.5, 0.5, 0.05, -0.5, -0.2),
  jab: P(0.2, 0, 1.57, 1.57, 0.4, 2.5, 0.6, 0.05, -0.55, -0.2),
  crossW: P(0, 0, 1.4, 1.6, -0.6, 1.2, 0.5, 0.05, -0.5, -0.2),
  cross: P(0.35, 0, 0.5, 2.3, 1.6, 1.55, 0.7, 0.1, -0.65, -0.3),
  kickW: P(-0.1, 0.1, 1.1, 2.3, -0.8, -0.3, 1.2, -0.6, -0.2, -0.1),
  kick: P(-0.4, 0.25, 1.0, 2.1, -1.1, -0.5, 1.7, 1.62, -0.15, -0.05),
  airkick: P(0.35, 0.25, 1.9, 2.3, -1.4, -1.0, 0.85, 0.8, -0.5, -1.7),
  flashK: P(-0.5, 0.3, -1.2, -1.6, -1.4, -1.8, 2.9, 2.95, 0.6, -0.9),
  tuck: P(0.3, 0.3, 1.2, 2.6, 0.9, 2.7, 2.2, 0.2, 2.0, 0),
  swoop: P(0.85, 0.2, 1.5, 1.45, -1.75, -1.95, 0.4, -0.5, -0.9, -1.4),
  snapK: P(-0.15, 0.1, 1.2, 2.2, -0.6, -0.3, 1.45, 1.45, -0.2, -0.1),
  backK: P(-0.5, 0.3, -0.9, -0.4, 1.2, 2.0, 1.6, 1.55, -0.25, -0.1),
  axeW: P(-0.3, 0.2, 1.4, 2.2, -1.0, -0.4, 3.05, 3.1, -0.2, -0.1),
  axe: P(0.45, 0.2, 1.1, 1.8, -1.2, -0.8, 0.75, 0.55, -0.6, -0.3),
  sweepW: P(0.4, 0.1, 1.2, 2.0, -0.2, 0.5, 1.3, -0.1, 1.2, -0.3),
  sweep: P(0.55, 0.25, 0.9, 1.4, -0.4, 0.2, 1.0, 1.1, 1.4, -0.2),
  knee: P(0.3, 0.2, -1.2, -1.6, -1.4, -1.7, 2.1, 0.3, -0.6, -1.4),
  land: P(0.3, 0.1, 1.2, 2.1, 0.5, 2.4, 1.15, 0, -0.65, -0.55),
  skid: P(-0.28, -0.05, 1.0, 1.9, 0.3, 2.2, 0.75, 0.35, -0.35, -0.15),
  gather: P(-0.12, -0.1, -0.35, 1.3, -0.6, 1.1, 0.75, 0.2, -0.75, -0.3),
  palm: P(0.28, 0, 1.56, 1.5, -0.25, 1.45, 0.8, 0.15, -0.8, -0.4),
  palm2: P(0.3, 0, -0.25, 1.45, 1.58, 1.5, 0.8, 0.15, -0.8, -0.4),
  dive: P(0.5, 0.35, 0.55, 0.35, -1.6, -1.9, 0.35, -0.5, -0.5, -1.3),
  slam: P(0.5, 0.2, 0.35, 0.2, -1.2, -0.6, 1.2, 0.2, -1.0, -0.4),
  raise: P(-0.05, -0.35, 2.75, 2.95, 2.5, 3.05, 0.35, 0, -0.35, -0.1),
  hurt: P(-0.45, -0.4, 1.3, 1.9, 1.0, 1.6, 0.3, 0, -0.3, -0.1),
  down: P(-0.1, 0.3, 1.2, 1.5, 0.7, 1.2, 0.35, 0.25, 0.1, 0.05, -1.5),
  bigW: P(-0.15, 0.1, 2.4, 2.8, 2.0, 2.9, 0.6, 0.1, -0.6, -0.3),
  smash: P(0.55, 0.2, 0.9, 0.7, 0.8, 0.6, 0.9, 0.3, -0.8, -0.5),
  throwW: P(-0.1, 0, -1.6, -2.2, 0.6, 2.3, 0.5, 0.05, -0.5, -0.2),
  throw: P(0.25, 0, 1.7, 1.6, -0.5, -0.2, 0.6, 0.1, -0.6, -0.3),
};
function runPose(ph, k) {
  const s = Math.sin(ph), c = Math.cos(ph), l1 = s * 0.95 * k, l2 = -s * 0.95 * k;
  return P(0.12 + 0.38 * k, 0.1 * k,
    lerp(1.0, -1.25, k) - s * 0.25, lerp(1.8, -1.55, k), lerp(0.5, -1.4, k) + s * 0.25, lerp(2.2, -1.75, k),
    l1, l1 - 0.25 - 1.25 * Math.max(0, c) * k, l2, l2 - 0.25 - 1.25 * Math.max(0, -c) * k);
}
function mixPose(a, b, t) { const o = {}; for (const n of PK) o[n] = a[n] + (b[n] - a[n]) * t; return o; }
function breathe() {
  const b = Math.sin(T * 2.2);
  return P(0.1 + b * 0.02, 0, 1.25 + b * 0.04, 2.0 + b * 0.05, 0.45, 2.5 - b * 0.04, 0.5, 0.05, -0.45, -0.15);
}
const footDrop = p => Math.max(Math.cos(p.l1) + Math.cos(p.k1), Math.cos(p.l2) + Math.cos(p.k2)) * 21;
function joints(x, hy, f, p, s) {
  const pt = (o, a, L, down) => ({ x: o.x + Math.sin(a) * f * L * s, y: o.y + (down ? 1 : -1) * Math.cos(a) * L * s });
  const hip = { x, y: hy }, neck = pt(hip, p.t, 30, false), ha = p.t + p.h;
  const J = {
    hip, neck, head: pt(neck, ha, 12, false), sh: pt(neck, p.t, -3, false),
    tk: pt(neck, ha - 0.55, 21, false), sa: pt(neck, ha - 1.3, 11, false),
  };
  J.e1 = pt(J.sh, p.a1, 17, true); J.h1 = pt(J.e1, p.b1, 16, true);
  J.e2 = pt(J.sh, p.a2, 17, true); J.h2 = pt(J.e2, p.b2, 16, true);
  J.k1 = pt(hip, p.l1, 21, true); J.f1 = pt(J.k1, p.k1, 21, true);
  J.k2 = pt(hip, p.l2, 21, true); J.f2 = pt(J.k2, p.k2, 21, true);
  if (p.rot) {
    const r = p.rot * f, c = Math.cos(r), sn = Math.sin(r), cx = x, cy = hy - 14 * s;
    for (const k in J) { const q = J[k], dx = q.x - cx, dy = q.y - cy; J[k] = { x: cx + dx * c - dy * sn, y: cy + dx * sn + dy * c }; }
  }
  return J;
}

// cloth ribbon (headband / hair), verlet chain
class Ribbon {
  constructor(n, len) { this.n = n; this.len = len; this.p = null; }
  update(ax, ay, dt) {
    if (!this.p) this.p = Array.from({ length: this.n }, () => ({ x: ax, y: ay, px: ax, py: ay }));
    const d = Math.min(dt, 1 / 30), P0 = this.p[0];
    P0.x = P0.px = ax; P0.y = P0.py = ay;
    for (let i = 1; i < this.n; i++) {
      const q = this.p[i], vx = (q.x - q.px) * 0.9, vy = (q.y - q.py) * 0.9;
      q.px = q.x; q.py = q.y;
      q.x += vx - 260 * d * d; q.y += vy + 260 * d * d + Math.sin(T * 7 + i * 0.8) * 0.18;
    }
    for (let it = 0; it < 3; it++) for (let i = 1; i < this.n; i++) {
      const a = this.p[i - 1], b = this.p[i], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, k = (L - this.len) / L;
      b.x -= dx * k; b.y -= dy * k;
    }
  }
  draw(col, w) {
    if (!this.p) return;
    ctx.strokeStyle = col; ctx.lineCap = 'round';
    for (let i = 1; i < this.n; i++) {
      ctx.lineWidth = w * (1 - i / this.n) + 0.6; ctx.beginPath();
      ctx.moveTo(this.p[i - 1].x, this.p[i - 1].y); ctx.lineTo(this.p[i].x, this.p[i].y); ctx.stroke();
    }
  }
}

class Fighter {
  constructor(x, o) {
    Object.assign(this, {
      x, y: GROUND, prevY: GROUND, vx: 0, vy: 0, face: 1, ground: true, hp: o.hp, maxHp: o.hp, s: o.s || 1,
      state: 'idle', st: 0, stun: 0, inv: 0, dead: false, flashT: 0, dropT: 0, noGrav: false, lying: false,
      flip: 0, flipT: 0, flipDur: 0.42, alpha: 1, pose: { ...POSES.stance }, hipOff: 40, J: null, lw: 4,
      col: '#fff', backCol: 'rgba(255,255,255,.5)', glowCol: null, glowBlur: 0,
    });
  }
  setState(s) { this.state = s; this.st = 0; }
  physics(dt) {
    this.prevY = this.y;
    if (!this.noGrav) this.vy += 2300 * dt * (Math.abs(this.vy) < 140 ? 0.55 : 1); // brief hang at the top of a leap
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.ground = false;
    if (this.y >= GROUND) { this.y = GROUND; if (this.vy > 0) this.vy = 0; this.ground = true; }
    else if (this.vy >= 0 && this.dropT <= 0) {
      for (const p of PLATFORMS) {
        if (this.x > p.x - 8 && this.x < p.x + p.w + 8 && this.prevY <= p.y + 1 && this.y >= p.y) { this.y = p.y; this.vy = 0; this.ground = true; break; }
      }
    }
    this.x = clamp(this.x, 24, WORLD_W - 24);
  }
  body() { const s = this.s; return { x: this.x - 15 * s, y: this.y - 88 * s, w: 30 * s, h: 88 * s }; }
  animate(dt, target, rate = 22) {
    const k = 1 - Math.exp(-rate * dt);
    for (const n of PK) this.pose[n] += (target[n] - this.pose[n]) * k;
    const want = (this.lying ? 7 : this.ground ? footDrop(this.pose) : 42) * this.s;
    this.hipOff += (want - this.hipOff) * (1 - Math.exp(-30 * dt));
    if (this.flip) {
      this.flipT += dt; this.pose.rot = Math.min(1, this.flipT / this.flipDur) * TAU * this.flip;
      if (this.flipT >= this.flipDur) { this.flip = 0; this.pose.rot = 0; }
    }
  }
  computeJ() { return (this.J = joints(this.x, this.y - this.hipOff, this.face, this.pose, this.s)); }
  draw() {
    const J = this.J; if (!J) return;
    const s = this.s, w = this.flashT > 0, col = w ? '#ffffff' : this.col, back = w ? 'rgba(255,255,255,.75)' : this.backCol;
    ctx.save(); ctx.globalAlpha = this.alpha * GA;
    this.drawBehind(J);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (!REFLECT) { // ink outline separates the figure from the night sky
      ctx.strokeStyle = 'rgba(8,6,12,0.85)'; ctx.lineWidth = this.lw * s + 4; ctx.beginPath(); figPath(J); ctx.stroke();
      ctx.fillStyle = 'rgba(8,6,12,0.85)'; ctx.beginPath(); ctx.arc(J.head.x, J.head.y, 9 * s + 2, 0, TAU); ctx.fill();
    }
    ctx.strokeStyle = back; ctx.lineWidth = this.lw * s * 0.9; ctx.beginPath();
    ctx.moveTo(J.sh.x, J.sh.y); ctx.lineTo(J.e2.x, J.e2.y); ctx.lineTo(J.h2.x, J.h2.y);
    ctx.moveTo(J.hip.x, J.hip.y); ctx.lineTo(J.k2.x, J.k2.y); ctx.lineTo(J.f2.x, J.f2.y); ctx.stroke();
    if (this.glowCol && !REFLECT) { ctx.shadowColor = this.glowCol; ctx.shadowBlur = this.glowBlur; }
    ctx.strokeStyle = col; ctx.lineWidth = this.lw * s * 1.25; ctx.beginPath();
    ctx.moveTo(J.hip.x, J.hip.y); ctx.lineTo(J.neck.x, J.neck.y); ctx.stroke();
    ctx.lineWidth = this.lw * s; ctx.beginPath();
    ctx.moveTo(J.hip.x, J.hip.y); ctx.lineTo(J.k1.x, J.k1.y); ctx.lineTo(J.f1.x, J.f1.y);
    ctx.moveTo(J.sh.x, J.sh.y); ctx.lineTo(J.e1.x, J.e1.y); ctx.lineTo(J.h1.x, J.h1.y); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(J.head.x, J.head.y, 9 * s, 0, TAU); ctx.fill();
    ctx.shadowBlur = 0;
    this.drawExtra(J, col);
    ctx.restore();
  }
  drawBehind() {}
  drawExtra() {}
}

// ---------- the hero ----------
const SKILLS = {
  s1: { han: '亢龍有悔', vi: 'Kháng Long Hữu Hối', cost: 30 },
  s2: { han: '飛龍在天', vi: 'Phi Long Tại Thiên', cost: 40 },
  s3: { han: '神龍擺尾', vi: 'Thần Long Bãi Vĩ', cost: 25 },
  s4: { han: '見龍在田', vi: 'Kiến Long Tại Điền', cost: 30 },
  s5: { han: '鴻漸於陸', vi: 'Hồng Tiệm Ư Lục', cost: 35 },
};
const SKILL_KEYS = Object.keys(SKILLS);
// limb: which hand/foot carries the strike trail; flip: somersault turns during the move
// act: flourish fired once as the strike lands its active frames; spin: quick body turns before the strike; name: shown for signature moves
const FLASHK = { w: 'kickW', p: 'flashK', a: 0.07, b: 0.26, dur: 0.46, box: [-12, -135, 96, 135], dmg: 18, kb: [260, -820], stun: 0.85, lunge: 190, limb: 'f1', gold: true, big: true, flip: -1, hop: -620, act: 'rise', name: 'Đảo Quải Kim Câu' };
const ROUTES = {
  // standing still: fists and palms
  fist: [
    { w: 'jabW', p: 'jab', a: 0.05, b: 0.12, dur: 0.22, box: [4, -76, 66, 30], dmg: 8, kb: [240, -60], stun: 0.36, lunge: 170, limb: 'h1', act: 'jab' },
    { w: 'crossW', p: 'cross', a: 0.06, b: 0.13, dur: 0.24, box: [4, -78, 70, 32], dmg: 10, kb: [240, -80], stun: 0.38, lunge: 210, limb: 'h2', act: 'palm', hitPalm: true },
    { w: 'kickW', p: 'kick', a: 0.09, b: 0.18, dur: 0.32, box: [4, -88, 84, 46], dmg: 13, kb: [190, -100], stun: 0.55, lunge: 230, limb: 'f1', gold: true },
    FLASHK,
  ],
  // holding a direction: the kick chain
  kick: [
    { w: 'kickW', p: 'snapK', a: 0.06, b: 0.13, dur: 0.24, box: [4, -72, 78, 34], dmg: 9, kb: [260, -60], stun: 0.38, lunge: 210, limb: 'f1', gold: true, act: 'jab' },
    { w: 'kickW', p: 'backK', a: 0.14, b: 0.21, dur: 0.34, spin: true, box: [4, -86, 88, 46], dmg: 12, kb: [300, -120], stun: 0.48, lunge: 170, limb: 'f1', gold: true, act: 'spin', name: 'Hồi Toàn Cước' },
    { w: 'tuck', p: 'kick', a: 0.08, b: 0.32, dur: 0.42, spin: true, spinEnd: 0.32, round: 88, dmg: 14, kb: [240, -400], stun: 0.6, lunge: 170, hop: -560, limb: 'f1', gold: true, act: 'tornado', name: 'Xuyên Phong Cước' },
    { w: 'axeW', p: 'axe', a: 0.17, b: 0.25, dur: 0.46, box: [10, -60, 82, 70], dmg: 18, kb: [180, -600], stun: 0.85, lunge: 110, limb: 'f1', gold: true, big: true, act: 'axe', name: 'Phủ Sơn Cước' },
  ],
  // holding down: a spinning leg sweep that trips, then the rising flip kick
  low: [
    { w: 'sweepW', p: 'sweep', a: 0.11, b: 0.22, dur: 0.36, spin: true, box: [-24, -34, 120, 36], dmg: 11, kb: [150, -440], stun: 0.75, lunge: 150, limb: 'f1', gold: true, act: 'sweep', name: 'Tảo Đường Cước' },
    FLASHK,
  ],
};
// sprinting into an attack: a flying knee that opens the kick chain
const KNEE = { w: 'jump', p: 'knee', a: 0.05, b: 0.2, dur: 0.32, box: [0, -96, 72, 72], dmg: 13, kb: [420, -260], stun: 0.5, lunge: 640, hop: -300, limb: 'k1', gold: true, act: 'knee', name: 'Phi Tất' };
const MOVE_FX = {
  jab(p) { // a puff of fist wind
    const x = p.J.h1.x + p.face * 12, y = p.J.h1.y;
    ring(x, y, 3, 28, 0.18, C.white, 3);
    for (let i = 0; i < 4; i++) spawn({ x, y: y + rand(-14, 14), vx: p.face * rand(700, 1000), life: 0.16, size: rand(24, 44), kind: 'streak', col: C.white, drag: 0 });
  },
  palm(p) { spawn({ x: p.J.h2.x + p.face * 12, y: p.J.h2.y, vx: p.face * 320, kind: 'palm', size: 24, life: 0.3, drag: 3 }); },
  spin(p) {
    ring(p.x, p.y - 50, 20, 95, 0.26, C.gold, 5, { flat: 0.35 });
    for (let i = 0; i < 12; i++) { const a = rand(0, TAU); spawn({ x: p.x + Math.cos(a) * 72, y: p.y - 50 + Math.sin(a) * 22, vx: -Math.sin(a) * 320, vy: Math.cos(a) * 80, life: 0.25, size: rand(3, 5), col: C.gold }); }
  },
  tornado(p) { // a spiral of wind wrapping the jump
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU * 2; spawn({ x: p.x + Math.cos(a) * 42, y: p.y - 6 - i * 5, vx: -Math.sin(a) * 280, vy: -140, life: 0.45, size: rand(2, 4), col: C.jade }); }
    ring(p.x, p.y, 10, 90, 0.3, C.jade, 4, { flat: 0.3 }); sfx('jump');
  },
  axe(p) { if (p.ground) axeImpact(p); else p.vy = 1150; }, // from the air the heel drops straight down
  sweep(p) {
    const fx = p.x + p.face * 50;
    ring(fx, p.y, 10, 125, 0.35, C.gold, 6, { flat: 0.2 }); dust(fx, p.y, 12, p.face);
    for (let i = 0; i < 10; i++) spawn({ x: p.x + p.face * rand(20, 110), y: p.y - 4, vx: p.face * rand(200, 520), vy: rand(-140, -30), life: 0.3, size: rand(2, 3.5), col: C.gold, kind: 'spark', grav: 700 });
  },
  knee(p) { for (let i = 0; i < 10; i++) spawn({ x: p.x, y: p.y - rand(20, 90), vx: p.face * rand(900, 1400), life: rand(0.15, 0.3), size: rand(40, 80), kind: 'streak', col: C.jade, drag: 0 }); },
  rise(p) { ring(p.x, p.y - 60, 10, 110, 0.3, C.gold, 6); for (let i = 0; i < 14; i++) spawn({ x: p.x + rand(-30, 50) * p.face, y: p.y - rand(20, 120), vx: rand(-60, 60), vy: rand(-700, -400), life: 0.3, size: rand(2, 3), col: C.gold, kind: 'spark' }); },
};
// heel strike on the ground: cracked stone, a light pillar, and foes nearby bounced into the air
function axeImpact(p) {
  const A = p.atk, fx = p.x + p.face * 42, y = p.y; A.slammed = true;
  ring(fx, y, 10, 160, 0.45, C.gold, 9, { flat: 0.25 }); dust(fx, y, 14);
  spawn({ x: fx, y, kind: 'pillar', size: 95, life: 0.35, col: C.gold, drag: 0 });
  for (let i = 0; i < 14; i++) spawn({ x: fx + rand(-16, 16), y: y - 2, vx: rand(-280, 280), vy: rand(-650, -250), life: rand(0.5, 0.9), size: rand(2.5, 5), col: [120, 96, 74], kind: 'rock', grav: 2000, drag: 0.3, rot: rand(0, 6), vr: rand(-10, 10) });
  shake(11); sfx('heavy'); FX.zoom = Math.max(FX.zoom, 0.045);
  for (const e of game.enemies) {
    if (e.dead || A.hits.has(e) || Math.abs(e.x - fx) > 115 || Math.abs(e.y - y) > 60) continue;
    A.hits.add(e); hit(e, 16, (Math.sign(e.x - p.x) || p.face) * 200, -580, 0.85, { big: true });
  }
}
const AIRFLIP = { w: 'tuck', p: 'kick', a: 0.02, b: 0.3, dur: 0.36, round: 80, dmg: 12, kb: [320, -380], stun: 0.5, limb: 'f1', gold: true, flip: 1, air: 'flip' };
const AIRKICK = { w: 'airkick', p: 'airkick', a: 0.03, b: 9, dur: 9, box: [-6, -50, 64, 56], dmg: 12, kb: [380, -260], stun: 0.45, air: 'dive', limb: 'f1', gold: true };

class Player extends Fighter {
  constructor(x) {
    super(x, { hp: 220 });
    Object.assign(this, { chi: 60, maxChi: 100, jumps: 0, airDash: true, dashCd: 0, atk: null, sk: null, ghostT: 0, runPh: 0, queued: false, gliding: false, ultN: 0, palmAlt: false, airFlipUsed: false, limbTrail: [], comboT: 0, comboNext: 0 });
    this.col = '#f3ead6'; this.backCol = 'rgba(239,230,210,0.5)'; this.lw = 4.2;
    this.glowCol = 'rgba(242,181,68,0.55)'; this.glowBlur = 10;
    this.scarf = new Ribbon(9, 7);
  }
  dirKey() { return game.state === 'play' ? (keys.right ? 1 : 0) - (keys.left ? 1 : 0) : 0; }
  update(dt) {
    if (dt <= 0) { this.computeJ(); return; }
    this.st += dt; this.inv = Math.max(0, this.inv - dt); this.dashCd -= dt; this.dropT = Math.max(0, this.dropT - dt);
    this.flashT = Math.max(0, this.flashT - dt); this.comboT -= dt; this.landT = Math.max(0, (this.landT || 0) - dt);
    if (this.state !== 'ult' && this.state !== 'dead') this.chi = Math.min(this.maxChi, this.chi + DIFF.chi * dt);
    if (this.chi >= this.maxChi && Math.random() < dt * 18) spawn({ x: this.x + rand(-18, 18), y: this.y - rand(0, 80), vx: rand(-15, 15), vy: rand(-110, -50), life: rand(0.5, 0.9), size: rand(2, 3.5), col: C.gold, kind: 'ember', drag: 0.4, rot: rand(0, 9) });
    const wasGround = this.ground, dir = this.dirKey();
    if (this.state === 'hurt') { this.vx = approach(this.vx, 0, 900 * dt); if (this.st > 0.3) this.setState('idle'); }
    if (this.state === 'dead') this.vx = approach(this.vx, 0, 700 * dt);
    if (this.state === 'idle') {
      // eased speed changes; reversing on the ground brakes into a short skid before turning
      this.vx += (dir * 390 - this.vx) * (1 - Math.exp(-(this.ground ? (dir ? 10 : 13) : 5) * dt));
      if (!dir && Math.abs(this.vx) < 6) this.vx = 0;
      this.skid = this.ground && dir !== 0 && Math.sign(this.vx) === -dir && Math.abs(this.vx) > 120;
      if (dir && !this.skid) this.face = dir;
      if (this.skid && Math.random() < dt * 40) dust(this.x + this.face * 10, this.y, 1, this.face);
      this.readActions(dir);
    } else this.skid = false;
    this.gliding = this.state === 'idle' && !this.ground && keys.jump && game.state === 'play' && this.vy > 0;
    if (this.gliding) {
      this.vy = Math.min(this.vy, 105);
      if (Math.random() < dt * 30) spawn({ x: this.x + rand(-14, 14), y: this.y - rand(0, 20), vx: -this.vx * 0.3, vy: rand(20, 60), life: 0.5, size: rand(2, 4), col: C.jade });
    }
    if (this.state === 'dash') this.updDash(dt);
    else if (this.state === 'atk') this.updAtk(dt);
    else if (this.state === 'skill') this.updSkill(dt);
    else if (this.state === 'ult') this.updUlt(dt);
    this.noGrav = this.state === 'dash' || this.state === 'ult' || (this.state === 'skill' && this.sk.noGrav);
    const fallV = this.vy;
    this.physics(dt);
    if (this.ground) { this.jumps = 0; this.airDash = true; this.airFlipUsed = false; if (!wasGround) this.land(fallV); }
    const fastBlend = this.state === 'atk' || this.state === 'skill' || this.state === 'dash';
    this.animate(dt, this.target(dt), fastBlend ? 34 : 17);
    this.ghostT -= dt;
    const diving = this.sk && ((this.sk.name === 's2' && this.sk.ph === 'c') || (this.sk.name === 's5' && this.sk.ph === 'b'));
    const flipping = this.flip && (this.state === 'idle' || this.state === 'atk');
    if ((this.state === 'dash' || this.gliding || diving || flipping) && this.ghostT <= 0) {
      this.ghostT = this.state === 'dash' ? 0.016 : flipping ? 0.03 : 0.04;
      addGhost(this.computeJ(), diving || this.state === 'atk' ? C.gold : C.jade, this.s);
    }
    this.computeJ();
    for (const q of this.limbTrail) q.age += dt;
    if (this.state === 'atk') { const d = this.atk.d; if (this.st >= d.a - 0.03 && this.st <= d.b + 0.07) this.pushTrail(d.limb, d.gold); }
    else if (this.state === 'skill' && this.sk.name === 's3') this.pushTrail('f1', true);
    while (this.limbTrail.length && this.limbTrail[this.limbTrail.length - 1].age > 0.13) this.limbTrail.pop();
    this.scarf.update(this.J.sa.x, this.J.sa.y, dt);
  }
  readActions(dir) {
    if (dir && ['attack', 'dash', 'ult', ...SKILL_KEYS].some(a => buf[a] > 0)) this.face = dir; // a move always goes where the stick points
    if (take('jump')) {
      if (keys.down && this.ground && this.y < GROUND - 1) { this.dropT = 0.22; this.y += 3; this.ground = false; }
      else if (this.ground) { this.vy = -880; this.jumps = 1; this.ground = false; sfx('jump'); dust(this.x, this.y, 6); }
      else if (this.jumps < 3) {
        this.jumps = Math.max(2, this.jumps + 1); this.vy = -800; if (dir) this.vx = dir * 430;
        ring(this.x, this.y - 4, 4, 46, 0.35, C.jade, 4, { flat: 0.35 });
        burst(this.x, this.y - 6, 10, C.jade, 240, { life: 0.35 });
        // second jump: front somersault; third: double somersault
        this.flip = this.jumps === 3 ? 2 : 1; this.flipT = 0; this.flipDur = this.jumps === 3 ? 0.62 : 0.42;
        sfx('jump');
      }
    }
    if (take('dash') && this.dashCd <= 0 && (this.ground || this.airDash)) return this.startDash(dir);
    if (take('attack')) return this.startAtk(this.comboT > 0 ? this.comboNext : 0);
    for (const n of SKILL_KEYS) if (take(n)) return this.cast(n);
    if (take('ult')) return this.startUlt();
  }
  startDash(dir) {
    if (dir) this.face = dir;
    this.setState('dash'); this.dashCd = 0.45; if (!this.ground) this.airDash = false;
    this.vx = this.face * 1250; this.vy = 0; this.inv = Math.max(this.inv, 0.25); this.flip = 0; this.pose.rot = 0;
    burst(this.x, this.y - 45, 12, C.jade, 220, { life: 0.3 }); sfx('dash');
  }
  updDash(dt) {
    this.vy = 0;
    if (Math.random() < 0.7) spawn({ x: this.x - this.face * 10, y: this.y - rand(10, 80), vx: -this.face * rand(100, 300), vy: rand(-20, 20), life: 0.3, size: rand(2, 4), col: C.jade });
    if (this.st > 0.19) { this.setState('idle'); this.vx = this.face * 390; }
  }
  startAtk(i) {
    let d;
    if (!this.ground && !(i > 0 && this.route === 'kick')) d = this.airFlipUsed ? AIRKICK : AIRFLIP;
    else if (i === 0) {
      // the stick picks the chain: down = sweep, a direction = kicks (a sprint opens with a flying knee), none = fists
      const dir = this.dirKey();
      this.route = game.state === 'play' && keys.down ? 'low' : dir ? 'kick' : 'fist';
      d = this.route === 'kick' && Math.abs(this.vx) > 300 ? KNEE : ROUTES[this.route][0];
    } else d = ROUTES[this.route][Math.min(i, ROUTES[this.route].length - 1)];
    this.atk = { d, i, hits: new Set(), f0: this.face, acted: false, slammed: false }; this.setState('atk'); this.queued = false; this.flip = 0; this.pose.rot = 0;
    if (d.flip) { this.flip = d.flip; this.flipT = 0; this.flipDur = d.dur * 0.92; }
    if (d.air === 'dive') { this.vx = this.face * 600; this.vy = 620; }
    else if (d.air === 'flip') { this.airFlipUsed = true; this.vy = Math.min(this.vy, -260); this.vx = this.face * 260; }
    else { this.vx = this.face * d.lunge; if (d.hop) { this.vy = d.hop; this.ground = false; } }
    addGhost(this.computeJ(), d.gold ? C.gold : C.white, this.s);
    sfx('swing');
  }
  pushTrail(limb, gold) {
    const J = this.J, b = J[{ h1: 'e1', h2: 'e2', f1: 'k1', k1: 'hip' }[limb]], t = J[limb];
    this.limbTrail.unshift({ bx: b.x, by: b.y, tx: t.x + (t.x - b.x) * 0.35, ty: t.y + (t.y - b.y) * 0.35, age: 0, gold });
  }
  updAtk(dt) {
    const A = this.atk, d = A.d, t = this.st;
    if (!d.air) this.vx = approach(this.vx, 0, 1600 * dt);
    if (buf.attack > 0 && t > d.a) { buf.attack = 0; this.queued = true; }
    if (d.spin) this.face = t < (d.spinEnd ?? d.a) ? (Math.floor(t / 0.06) % 2 ? A.f0 : -A.f0) : A.f0; // whip round before the blow
    if (!A.acted && t >= d.a) {
      A.acted = true;
      if (d.act) MOVE_FX[d.act](this);
      if (d.name) popText(this.x, this.y - 122, d.name, '#f2d27a', 17);
    }
    if (t >= d.a && t <= d.b) { this.strike(A); if (this.state !== 'atk') return; }
    if (t > d.b) {
      const dir = this.dirKey();
      if (dir && !d.air) this.face = dir;
      if (take('dash') && this.dashCd <= 0 && (this.ground || this.airDash)) return this.startDash(dir);
      for (const n of SKILL_KEYS) if (take(n)) return this.cast(n);
      if (take('ult')) return this.startUlt();
      if (this.queued && (d.air ? d.air === 'flip' : A.i < ROUTES[this.route].length - 1)) return this.startAtk(A.i + 1);
    }
    if (t >= d.dur) {
      if (!d.air) { this.comboT = 0.32; this.comboNext = (A.i + 1) % ROUTES[this.route].length; } // a late press still continues the chain
      this.setState('idle');
    }
  }
  strike(A) {
    const d = A.d;
    const box = d.round ? { x: this.x - d.round, y: this.y - 45 - d.round, w: d.round * 2, h: d.round * 2 }
      : { x: this.face > 0 ? this.x + d.box[0] : this.x - d.box[0] - d.box[2], y: this.y + d.box[1], w: d.box[2], h: d.box[3] };
    for (const e of game.enemies) {
      if (e.dead || A.hits.has(e) || !overlap(box, e.body())) continue;
      A.hits.add(e);
      const dir = d.round ? (Math.sign(e.x - this.x) || this.face) : this.face;
      hit(e, d.dmg, dir * d.kb[0], d.kb[1], d.stun, { big: d.big });
      if (d.hitPalm) spawn({ x: e.x, y: e.y - 55 * e.s, vx: this.face * 200, kind: 'palm', size: 30, life: 0.3, drag: 3 });
      if (d.air === 'dive') { this.vy = -560; this.vx = -this.face * 80; this.jumps = Math.min(this.jumps, 2); this.airFlipUsed = false; this.setState('idle'); return; }
      if (d.air === 'flip') this.vy = Math.min(this.vy, -300);
    }
  }
  cast(name) {
    const S = SKILLS[name];
    if (this.chi < S.cost) { popText(this.x, this.y - 112, 'Nội lực chưa đủ', '#a9bccb', 17); return; }
    this.chi -= S.cost; this.flip = 0; this.pose.rot = 0;
    this.sk = { name, ph: 'a', hits: new Set(), t2: 0, k: 0, n: 0, noGrav: false };
    this.setState('skill'); banner(S.han, S.vi);
    if (name === 's1') { this.sk.noGrav = !this.ground; this.vy = 0; sfx('charge'); }
    if (name === 's2') {
      this.vy = -1180; this.vx = this.face * 140; this.ground = false; this.flip = 2; this.flipT = 0; this.flipDur = 0.46;
      ring(this.x, this.y, 6, 80, 0.4, C.gold, 6, { flat: 0.3 }); burst(this.x, this.y - 20, 16, C.gold, 320); sfx('jump');
    }
    if (name === 's3') { this.vy = this.ground ? -260 : -120; this.ground = false; sfx('swing'); }
    if (name === 's4') { sfx('charge'); if (!this.ground) this.vy = 1500; }
    if (name === 's5') {
      this.sk.carry = [];
      if (this.ground) { this.vy = -440; this.ground = false; } else this.vy = Math.min(this.vy, -160);
      this.vx = this.face * 260; sfx('jump'); this.featherBurst(10);
    }
  }
  // shared flourish of every Giáng Long strike: a flying palm print, palm wind, shock rings
  palmBlast(px, py, size, streaks = 12) {
    spawn({ x: px, y: py, vx: this.face * 420, kind: 'palm', size, life: 0.5, drag: 2 });
    for (let i = 0; i < streaks; i++) spawn({ x: px + rand(-10, 30) * this.face, y: py + rand(-70, 70), vx: this.face * rand(900, 1500), life: rand(0.2, 0.35), size: rand(40, 100), kind: 'streak', col: C.white, drag: 0 });
    ring(px, py, 6, size * 1.6, 0.4, C.gold, 9); ring(px, py, 4, size * 0.8, 0.28, C.white, 4);
    burst(px, py, Math.min(30, size * 0.4), C.gold, 560);
  }
  featherBurst(n) {
    for (let i = 0; i < n; i++) spawn({ x: this.x + rand(-30, 30), y: this.y - rand(40, 90), vx: rand(-160, 160) - this.face * 120, vy: rand(-140, 40), life: rand(0.7, 1.2), size: rand(4, 7), col: [255, 236, 190], kind: 'feather', drag: 2.5, grav: 140, rot: rand(0, TAU) });
  }
  // 見龍在田: palm driven into the ground; a dragon swims through the earth and bursts up under every foe in its path
  earthPalm() {
    const x = this.x + this.face * 30, y = this.y;
    ring(x, y, 8, 160, 0.45, C.gold, 9, { flat: 0.25 }); dust(x, y, 14); shake(12); hitstop(0.05); sfx('boom'); FX.zoom = 0.05;
    for (let i = 0; i < 18; i++) spawn({ x: x + rand(-20, 20), y: y - 2, vx: rand(-260, 260), vy: rand(-720, -260), life: rand(0.5, 0.9), size: rand(2.5, 5.5), col: [120, 96, 74], kind: 'rock', grav: 2000, drag: 0.3, rot: rand(0, 6), vr: rand(-10, 10) });
    spawn({ x, y: y - 3, kind: 'palm', size: 110, life: 0.7, flat: 0.26, drag: 0 });
    game.dragons.push(new Dragon(x, y, this.face > 0 ? 0 : Math.PI, { burrow: true, spd: 820, life: 1.15, dmg: 34, s: 1.3, kb: 240, lift: -880 }));
  }
  // 鴻漸於陸: wings spread, the hero swoops low like a landing swan, sweeps foes along, then releases one palm
  swanPalm() {
    const px = this.x + this.face * 50, py = this.y - 58;
    game.dragons.push(new Dragon(px, py, this.face > 0 ? 0 : Math.PI, { spd: 900, life: 0.45, dmg: 0, s: 1.3 }));
    this.palmBlast(px, py, 80, 14); this.featherBurst(18);
    shake(14); hitstop(0.06); flash(0.25, '242,181,68'); sfx('roar'); FX.zoom = 0.06;
    for (const e of game.enemies) {
      if (e.dead) continue;
      const dx = (e.x - this.x) * this.face;
      if (dx > -20 && dx < 160 && Math.abs(e.y - this.y) < 110) hit(e, 30, this.face * 720, -420, 0.8, { big: true });
    }
    this.vx = -this.face * 220;
  }
  endSkill() { this.sk = null; this.setState('idle'); }
  updSkill(dt) {
    const S = this.sk, t = this.st;
    if (S.name === 's1') {
      this.vx = approach(this.vx, 0, 1800 * dt); if (S.noGrav) this.vy = 0;
      if (S.ph === 'a') {
        const hx = this.x + this.face * 26, hy = this.y - 52;
        for (let i = 0; i < 2; i++) {
          const a = rand(0, TAU), r = rand(60, 120);
          spawn({ x: hx + Math.cos(a) * r, y: hy + Math.sin(a) * r, vx: -Math.cos(a) * r * 4, vy: -Math.sin(a) * r * 4, life: 0.24, size: rand(2, 4), col: C.gold, drag: 0 });
        }
        if (t > 0.36) {
          S.ph = 'b';
          const px = this.x + this.face * 46, py = this.y - 60;
          game.dragons.push(new Dragon(px, py, this.face > 0 ? 0 : Math.PI, { spd: 1000, life: 1.35, dmg: 55, s: 1.5, kb: 820 }));
          this.palmBlast(px, py, 72, 16); dust(this.x, this.y, 10, -this.face);
          this.vx = -this.face * 340; shake(16); flash(0.3, '242,181,68'); hitstop(0.07); FX.zoom = 0.07;
          sfx('roar'); sfx('boom');
        }
      } else if (t > 0.78) this.endSkill();
    } else if (S.name === 's2') {
      if (S.ph === 'a') {
        if (Math.random() < 0.8) spawn({ x: this.x + rand(-12, 12), y: this.y - rand(0, 80), vy: 120, life: 0.4, size: rand(3, 6), col: C.gold });
        if (this.vy >= -60 || t > 0.5) { S.ph = 'b'; S.t2 = 0; S.noGrav = true; this.vy = 0; this.vx = 0; sfx('charge'); }
      } else if (S.ph === 'b') {
        S.t2 += dt; this.vy = 0;
        const a = rand(0, TAU), r = rand(50, 100);
        spawn({ x: this.x + Math.cos(a) * r, y: this.y - 50 + Math.sin(a) * r, vx: -Math.cos(a) * r * 5, vy: -Math.sin(a) * r * 5, life: 0.2, size: 3, col: C.gold, drag: 0 });
        if (S.t2 > 0.16) { S.ph = 'c'; this.vy = 1700; this.vx = this.face * 560; sfx('dash'); }
      } else if (S.ph === 'c') {
        this.vy = 1700;
        const a = T * 30;
        for (let i = 0; i < 2; i++) { const q = a + i * Math.PI; spawn({ x: this.x + Math.sin(q) * 28, y: this.y - 40 + Math.cos(q) * 12, vy: -220, life: 0.35, size: 5, col: C.gold, drag: 4 }); }
        const box = { x: this.x - 32, y: this.y - 92, w: 64, h: 104 };
        for (const e of game.enemies) if (!e.dead && !S.hits.has(e) && overlap(box, e.body())) { S.hits.add(e); hit(e, 10, this.face * 120, 300, 0.5, { chi: 0 }); }
      } else if (S.ph === 'd') {
        this.vx = approach(this.vx, 0, 3000 * dt);
        if (t - S.t2 > 0.4) this.endSkill();
      }
    } else if (S.name === 's4') {
      this.vx = approach(this.vx, 0, 2400 * dt);
      if (S.ph === 'a') {
        if (!this.ground) this.vy = Math.max(this.vy, 1500);
        const a = rand(0, TAU), r = rand(50, 100), hx = this.x + this.face * 20, hy = this.y - 70;
        spawn({ x: hx + Math.cos(a) * r, y: hy + Math.sin(a) * r, vx: -Math.cos(a) * r * 4.5, vy: -Math.sin(a) * r * 4.5, life: 0.22, size: rand(2, 4), col: C.gold, drag: 0 });
        if (this.ground && t > 0.24) { S.ph = 'b'; S.t2 = t; this.earthPalm(); }
      } else if (t - S.t2 > 0.42) this.endSkill();
    } else if (S.name === 's5') {
      if (S.ph === 'a') { // wings open
        this.vx = approach(this.vx, this.face * 200, 1200 * dt);
        if (Math.random() < 0.5) this.featherBurst(1);
        if (t > 0.2) { S.ph = 'b'; S.t2 = t; S.noGrav = true; this.inv = Math.max(this.inv, 0.5); sfx('dash'); }
      } else if (S.ph === 'b') { // the swoop
        this.vx = this.face * 1050; this.vy = this.ground ? 0 : 480;
        if (Math.random() < 0.6) this.featherBurst(1);
        if (Math.random() < 0.8) spawn({ x: this.x - this.face * 20, y: this.y - rand(20, 90), vx: -this.face * rand(100, 260), life: 0.3, size: rand(3, 5), col: C.gold });
        const box = { x: this.face > 0 ? this.x : this.x - 75, y: this.y - 96, w: 75, h: 100 };
        for (const e of game.enemies) {
          if (e.dead || S.hits.has(e) || !overlap(box, e.body())) continue;
          S.hits.add(e); hit(e, 8, this.face * 300, -40, 0.7, { chi: 2 });
          if (!e.d.boss) S.carry.push(e);
        }
        S.carry.forEach((e, i) => { if (!e.dead) { e.x = clamp(this.x + this.face * (46 * e.s + i * 12), 24, WORLD_W - 24); e.vx = this.vx; e.vy = 0; e.stun = Math.max(e.stun, 0.3); } });
        if (t - S.t2 > 0.34 || this.x <= 30 || this.x >= WORLD_W - 30) { S.ph = 'c'; S.t2 = t; S.noGrav = false; this.swanPalm(); }
      } else if (t - S.t2 > 0.45) this.endSkill();
      else this.vx = approach(this.vx, 0, 2500 * dt);
    } else if (S.name === 's3') {
      this.vx = approach(this.vx, 0, 600 * dt);
      if (this.vy > 0) this.vy *= 0.85;
      S.t2 += dt; if (S.t2 > 0.075) { S.t2 = 0; this.face *= -1; }
      if (Math.random() < 0.9) {
        const a = rand(0, TAU);
        spawn({ x: this.x + Math.cos(a) * 100, y: this.y - 45 + Math.sin(a) * 30, vx: -Math.sin(a) * 320, vy: Math.cos(a) * 90, life: 0.3, size: rand(3, 6), col: C.gold });
      }
      S.k += dt;
      if (S.k > 0.14) {
        S.k = 0; S.n++; const last = S.n >= 4;
        ring(this.x, this.y - 45, 30, 125, 0.25, C.gold, 7, { flat: 0.32 });
        for (const e of game.enemies) {
          if (e.dead) continue;
          const dx = e.x - this.x;
          if (Math.abs(dx) < 128 && Math.abs((e.y - 45 * e.s) - (this.y - 45)) < 95)
            hit(e, last ? 18 : 8, Math.sign(dx || 1) * (last ? 700 : 160), last ? -520 : -120, last ? 0.8 : 0.35, { big: last, chi: 1 });
        }
        sfx('swing');
      }
      if (t > 0.62) this.endSkill();
    }
  }
  slamImpact() {
    const S = this.sk; S.ph = 'd'; S.t2 = this.st; S.noGrav = false;
    const x = this.x, y = this.y;
    ring(x, y, 10, 290, 0.6, C.gold, 12, { flat: 0.28 }); ring(x, y, 10, 180, 0.45, C.white, 5, { flat: 0.28 }); ring(x, y - 40, 10, 140, 0.4, C.gold, 6);
    for (let i = 0; i < 40; i++) spawn({ x: x + rand(-40, 40), y: y - 2, vx: rand(-700, 700), vy: rand(-900, -200), life: rand(0.4, 0.9), size: rand(2, 4), col: C.gold, kind: 'spark', grav: 1800, drag: 0.5 });
    dust(x, y, 18); shake(20); hitstop(0.09); flash(0.3, '242,181,68'); sfx('boom'); sfx('roar'); FX.zoom = 0.08;
    spawn({ x, y: y - 3, kind: 'palm', size: 130, life: 0.7, flat: 0.26, drag: 0 });
    spawn({ x, y, kind: 'pillar', size: 170, life: 0.55, col: C.gold, drag: 0 });
    game.dragons.push(new Dragon(x, y - 10, -Math.PI / 2, { spd: 1100, life: 0.75, dmg: 0, s: 1.6 }));
    for (const e of game.enemies) {
      if (e.dead) continue;
      const dx = e.x - x;
      if (Math.abs(dx) < 240 && Math.abs(e.y - y) < 140) hit(e, 42, Math.sign(dx || this.face) * 520, -760, 0.9, { big: true });
    }
  }
  land(v = 0) {
    this.flip = 0; this.pose.rot = 0;
    if (this.state === 'skill' && this.sk.name === 's2' && this.sk.ph === 'c') return this.slamImpact();
    if (this.state === 'atk' && this.atk.d.air) this.setState('idle');
    if (this.state === 'atk' && this.atk.d.act === 'axe' && this.atk.acted && !this.atk.slammed) axeImpact(this);
    if (v > 450) this.landT = Math.min(0.16, v / 6500); // knees absorb the landing
    dust(this.x, this.y, v > 900 ? 9 : 5);
  }
  startUlt() {
    if (this.chi < this.maxChi) { popText(this.x, this.y - 112, 'Cần đầy nội lực', '#a9bccb', 17); return; }
    this.chi = 0; this.setState('ult'); this.ultN = 0; this.finaleDone = false; this.ultY = Math.min(this.y, GROUND - 130);
    this.vx = 0; this.vy = 0; this.flip = 0; this.pose.rot = 0; this.sk = null;
    game.ultOn = true; game.ultCount = 0;
    banner('降龍十八掌', 'Giáng Long Thập Bát Chưởng', 'ult'); sfx('gong'); flash(0.35, '242,181,68'); FX.zoom = 0.08;
    ring(this.x, this.y - 50, 10, 320, 0.8, C.gold, 10);
  }
  updUlt(dt) {
    const t = this.st; this.vx = 0; this.vy = 0;
    this.y += (this.ultY - this.y) * (1 - Math.exp(-5 * dt));
    const cx = this.x, cy = this.y - 50;
    if (t < 0.8) {
      for (let i = 0; i < 3; i++) {
        const a = rand(0, TAU), r = rand(140, 320);
        spawn({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, vx: -Math.cos(a) * r * 2.6, vy: -Math.sin(a) * r * 2.6, life: 0.38, size: rand(2, 5), col: C.gold, drag: 0 });
      }
    } else if (this.ultN < 18 && t > 0.8 + this.ultN * 0.11) {
      const alive = game.enemies.filter(e => !e.dead);
      const tg = alive.length ? alive[this.ultN % alive.length] : null;
      if (tg) this.face = tg.x >= this.x ? 1 : -1;
      const side = this.ultN % 2 ? 1 : -1;
      const ang = (this.face > 0 ? 0 : Math.PI) + side * rand(0.35, 1.0);
      const hx = this.x + this.face * 40, hy = this.y - 60;
      game.dragons.push(new Dragon(hx, hy, ang, { target: tg, turn: 6.5, spd: 1080, life: 1.7, dmg: 30, s: 0.95, kb: 520 }));
      this.palmBlast(hx, hy, 34, 5);
      sfx(this.ultN % 3 === 0 ? 'roar' : 'swing'); shake(6);
      this.ultN++; game.ultCount = this.ultN; this.palmAlt = !this.palmAlt;
    }
    const end = 0.8 + 18 * 0.11;
    if (!this.finaleDone && t > end + 0.15) { this.finaleDone = true; this.ultFinale(); }
    if (t > end + 0.95) { this.setState('idle'); this.inv = 0.6; game.ultOn = false; }
  }
  // the eighteenth palm: one colossal dragon and a shock wave that sweeps the whole screen
  ultFinale() {
    const alive = game.enemies.filter(e => !e.dead);
    if (alive.length) this.face = alive.filter(e => e.x >= this.x).length * 2 >= alive.length ? 1 : -1;
    this.palmAlt = false;
    const px = this.x + this.face * 50, py = this.y - 60;
    game.dragons.push(new Dragon(px, py, this.face > 0 ? 0 : Math.PI, { spd: 1150, life: 1.4, dmg: 0, s: 2.5 }));
    spawn({ x: px, y: py, vx: this.face * 520, kind: 'palm', size: 160, life: 0.75, drag: 1 });
    for (let i = 0; i < 30; i++) spawn({ x: px, y: py + rand(-200, 160), vx: this.face * rand(1100, 1800), life: rand(0.3, 0.5), size: rand(80, 200), kind: 'streak', col: C.white, drag: 0 });
    ring(px, py, 20, 620, 0.8, C.gold, 16); ring(this.x, GROUND, 20, 760, 0.9, C.gold, 12, { flat: 0.22 }); ring(px, py, 10, 320, 0.5, C.white, 6);
    flash(0.85, '255,236,190'); shake(26); hitstop(0.14); FX.zoom = 0.12; game.slow = 0.35; game.slowT = 0.7; game.ultOn = false;
    sfx('boom'); sfx('roar'); sfx('gong');
    for (const e of game.enemies) {
      if (e.dead || Math.abs(e.x - (view.camX + view.w / 2)) > view.w * 0.65) continue;
      hit(e, 60, (Math.sign(e.x - this.x) || this.face) * 900, -900, 1, { big: true, dragon: true, chi: 0 });
    }
  }
  skPose() {
    const S = this.sk;
    if (S.name === 's1') return S.ph === 'a' ? POSES.gather : POSES.palm;
    if (S.name === 's2') return S.ph === 'a' ? POSES.jump : S.ph === 'b' ? POSES.gather : S.ph === 'c' ? POSES.dive : POSES.slam;
    if (S.name === 's4') return S.ph === 'a' ? (this.ground ? POSES.raise : POSES.dive) : POSES.slam;
    if (S.name === 's5') return S.ph === 'a' ? POSES.glide : S.ph === 'b' ? POSES.swoop : POSES.palm;
    return POSES.kick;
  }
  target(dt) {
    const s = this.state;
    if (s === 'dead') return POSES.down;
    if (s === 'hurt') return POSES.hurt;
    if (s === 'dash') return POSES.dash;
    if (s === 'atk') { const d = this.atk.d; return POSES[this.st < d.a ? d.w : d.p]; }
    if (s === 'skill') return this.skPose();
    if (s === 'ult') return this.st < 0.8 ? POSES.raise : (this.palmAlt ? POSES.palm2 : POSES.palm);
    if (!this.ground) return this.flip ? POSES.tuck : this.gliding ? POSES.glide : mixPose(POSES.jump, POSES.fall, clamp((this.vy + 250) / 500, 0, 1));
    const sp = Math.abs(this.vx);
    if (this.skid) return POSES.skid;
    if (this.landT > 0 && sp < 250) return POSES.land;
    if (sp > 30) {
      // stride length matched to ground speed so feet do not slide; a puff of dust on each footfall
      const s0 = Math.sin(this.runPh); this.runPh += dt * sp / 20;
      if (sp > 220 && Math.sign(Math.sin(this.runPh)) !== Math.sign(s0)) spawn({ x: this.x - this.face * 8, y: this.y - 2, vx: -this.face * rand(30, 80), vy: rand(-30, -8), life: 0.4, size: rand(4, 7), col: C.mist, kind: 'soft', drag: 3 });
      return runPose(this.runPh, Math.min(1, sp / 390));
    }
    return breathe();
  }
  drawBehind(J) {
    const S = this.sk;
    if (this.state === 'ult') { // 法陣: a rotating ring of the art's name; one glyph lights per palm thrown
      const k = Math.min(1, this.st / 0.5), cx = this.x, cy = this.y - 45, R = 120 * k + 10;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgb(242,181,68)';
      ctx.globalAlpha = 0.5 * GA; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 0.3 * GA; ctx.beginPath(); ctx.arc(cx, cy, R * 0.78, 0, TAU); ctx.stroke();
      ctx.fillStyle = 'rgb(255,214,130)'; ctx.font = '17px "Ma Shan Zheng", KaiTi, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let i = 0; i < 18; i++) {
        const a = T * 0.8 + i * TAU / 18;
        ctx.save(); ctx.translate(cx + Math.cos(a) * R * 0.89, cy + Math.sin(a) * R * 0.89); ctx.rotate(a + Math.PI / 2);
        ctx.globalAlpha = (i < game.ultCount ? 0.95 : 0.3) * GA * k; ctx.fillText('降龍十八掌'[i % 5], 0, 0); ctx.restore();
      }
      ctx.restore();
    }
    if (this.state === 'skill' && S.name === 's5' && S.ph !== 'c') { // swan wings of chi, fanned back from the shoulder
      const k = S.ph === 'a' ? Math.min(1, this.st / 0.15) : 1, f = this.face, flap = Math.sin(T * 22) * 0.12;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgb(255,214,140)';
      for (const [off, al] of [[0, 1], [0.18, 0.45]]) for (let i = 0; i < 6; i++) {
        const phi = 0.3 + i * 0.26 + off + flap, L = (66 - i * 6) * k, dx = -f * Math.sin(phi), dy = -Math.cos(phi);
        ctx.globalAlpha = 0.9 * al * GA; ctx.lineWidth = 5.2 - i * 0.55; ctx.beginPath(); ctx.moveTo(J.sh.x, J.sh.y);
        ctx.quadraticCurveTo(J.sh.x + dx * L * 0.55 - f * 8, J.sh.y + dy * L * 0.55 + 6, J.sh.x + dx * L, J.sh.y + dy * L); ctx.stroke();
        glow(J.sh.x + dx * L, J.sh.y + dy * L, 13, C.gold, 0.8 * al);
      }
      ctx.restore();
    }
    this.scarf.draw('#f2b544', 3.4);
  }
  drawExtra(J, col) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(J.tk.x, J.tk.y, 4.2, 0, TAU); ctx.fill();
    const L = this.limbTrail;
    if (L.length > 1) { // crescent of light swept by the striking fist or foot
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < L.length - 1; i++) {
        const a = L[i], b = L[i + 1], k = 1 - a.age / 0.13;
        ctx.fillStyle = a.gold ? 'rgb(255,206,110)' : 'rgb(255,246,226)'; ctx.globalAlpha = 0.62 * k * k * GA;
        ctx.beginPath(); ctx.moveTo(a.bx, a.by); ctx.lineTo(a.tx, a.ty); ctx.lineTo(b.tx, b.ty); ctx.lineTo(b.bx, b.by); ctx.closePath(); ctx.fill();
      }
      if (L[0].age < 0.05) glow(L[0].tx, L[0].ty, 18, L[0].gold ? C.gold : C.white, 0.9);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = this.alpha * GA;
    }
    const charging = (this.state === 'skill' && (this.sk.ph === 'a' || this.sk.ph === 'b') && this.sk.name !== 's3') || (this.state === 'ult');
    if (charging || this.chi >= this.maxChi) {
      ctx.globalCompositeOperation = 'lighter';
      const p = 0.6 + 0.4 * Math.sin(T * 14);
      glow(J.h1.x, J.h1.y, charging ? 26 * p + 10 : 12, C.gold, charging ? 0.9 : 0.5);
      glow(J.h2.x, J.h2.y, charging ? 20 * p + 8 : 10, C.gold, charging ? 0.7 : 0.4);
    }
    if (this.inv > 0 && this.state !== 'dash' && this.state !== 'ult') this.alpha = Math.sin(T * 50) > 0 ? 1 : 0.55; else this.alpha = 1;
  }
}
