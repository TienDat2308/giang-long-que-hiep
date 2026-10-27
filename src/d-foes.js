
// ---------- golden dragon chi ----------
class Dragon {
  constructor(x, y, ang, o = {}) {
    Object.assign(this, {
      x, y, ang, spd: o.spd || 1000, life: o.life || 1.2, dmg: o.dmg ?? 45, s: o.s || 1, kb: o.kb || 700,
      target: o.target || null, turn: o.turn || 0, t: 0, dead: false, hits: new Set(), pts: [], head: { x, y }, wig: rand(0, TAU),
      burrow: !!o.burrow, base: y, lift: o.lift || 0, eruptT: 0,
    });
  }
  update(dt) {
    if (dt <= 0) return;
    this.t += dt;
    if (this.burrow) { // swims through the earth, arching out of the ground in waves
      this.x += Math.cos(this.ang) * this.spd * dt;
      this.head = { x: this.x, y: this.base - (Math.max(0, Math.sin(this.t * 9)) * 50 - 14) * this.s };
      this.eruptT -= dt;
      if (this.eruptT <= 0) {
        this.eruptT = 0.07;
        spawn({ x: this.x, y: this.base, kind: 'pillar', size: rand(55, 85), life: 0.4, col: C.gold, drag: 0 });
        for (let i = 0; i < 4; i++) spawn({ x: this.x + rand(-14, 14), y: this.base - 2, vx: rand(-160, 160), vy: rand(-620, -260), life: rand(0.5, 0.8), size: rand(2.5, 5), col: [120, 96, 74], kind: 'rock', grav: 2000, drag: 0.3, rot: rand(0, 6), vr: rand(-12, 12) });
        dust(this.x, this.base, 2);
      }
    } else {
      const tg = this.target;
      if (tg && !tg.dead && this.t > 0.12) {
        const want = Math.atan2(tg.y - 50 * tg.s - this.y, tg.x - this.x);
        let d = want - this.ang; d = Math.atan2(Math.sin(d), Math.cos(d));
        this.ang += clamp(d, -this.turn * dt, this.turn * dt);
      }
      this.x += Math.cos(this.ang) * this.spd * dt; this.y += Math.sin(this.ang) * this.spd * dt;
      const w = Math.sin(this.t * 14 + this.wig) * 16 * this.s, nx = -Math.sin(this.ang), ny = Math.cos(this.ang);
      this.head = { x: this.x + nx * w, y: this.y + ny * w };
    }
    const p0 = this.pts[0];
    if (!p0 || Math.hypot(this.head.x - p0.x, this.head.y - p0.y) > 11 * this.s) { this.pts.unshift(this.head); if (this.pts.length > 30) this.pts.pop(); }
    if (Math.random() < 0.8) spawn({ x: this.head.x + rand(-8, 8), y: this.head.y + rand(-8, 8), vx: rand(-60, 60), vy: rand(-60, 60), life: 0.45, size: rand(2.5, 6) * this.s, col: C.gold });
    if (this.pts.length > 4 && Math.random() < 0.7) { // embers shed along the whole body
      const q = this.pts[(Math.random() * this.pts.length) | 0];
      spawn({ x: q.x, y: q.y, vx: rand(-40, 40), vy: rand(-90, -20), life: rand(0.4, 0.7), size: rand(2, 3.5) * this.s, col: C.gold, kind: 'ember', drag: 0.5, rot: rand(0, 9) });
    }
    if (this.dmg > 0) for (const e of game.enemies) {
      if (e.dead || this.hits.has(e)) continue;
      const near = this.burrow ? Math.abs(e.x - this.x) < 46 * this.s && Math.abs(e.y - this.base) < 70
        : Math.hypot(e.x - this.head.x, e.y - 48 * e.s - this.head.y) < 44 * this.s + 20 * e.s;
      if (near) {
        this.hits.add(e);
        hit(e, this.dmg, Math.cos(this.ang) * this.kb, this.lift || Math.min(-300, Math.sin(this.ang) * this.kb), 0.8, { big: true, chi: 0, dragon: true });
      }
    }
    for (const s of game.shots) if (!s.dead && Math.hypot(s.x - this.head.x, s.y - this.head.y) < 50 * this.s) { s.dead = true; burst(s.x, s.y, 10, C.gold, 260); }
    if (this.t > this.life) this.dead = true;
  }
  draw() {
    const pts = [this.head, ...this.pts], n = pts.length; if (n < 3) return;
    const fade = clamp(Math.min((this.life - this.t) / 0.25, this.t / 0.05), 0, 1), s = this.s;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (this.burrow) { ctx.beginPath(); ctx.rect(this.x - 3000, this.base - 3000, 6000, 3000); ctx.clip(); } // the part underground stays hidden
    const F = fade * GA;
    for (let i = n - 1; i >= 0; i--) { const k = 1 - i / n; glow(pts[i].x, pts[i].y, (6 + 18 * Math.pow(k, 0.7)) * s * 2.6, C.gold, 0.26 * fade); }
    // tapering body in three passes: hot outer haze, golden flesh, white-hot spine
    for (const [w, col, a] of [[20, 'rgb(255,150,50)', 0.3], [11, 'rgb(255,208,110)', 0.8], [4, 'rgb(255,250,232)', 0.95]]) {
      ctx.strokeStyle = col; ctx.globalAlpha = a * F;
      for (let i = 0; i < n - 1; i += 3) {
        ctx.lineWidth = w * s * (1 - 0.75 * i / n); ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y);
        for (let j = i + 1; j <= Math.min(i + 3, n - 1); j++) ctx.lineTo(pts[j].x, pts[j].y);
        ctx.stroke();
      }
    }
    // dorsal fins on the back, two clawed legs on the belly
    ctx.globalAlpha = 0.9 * F; ctx.strokeStyle = 'rgb(255,196,100)'; ctx.lineWidth = 2.2 * s; ctx.beginPath();
    for (let i = 2; i < n - 1; i += 2) {
      const a = pts[i - 1], b = pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, len = (5 + 15 * (1 - i / n)) * s;
      ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[i].x + (dy / L) * len + (dx / L) * len * 0.6, pts[i].y - (dx / L) * len + (dy / L) * len * 0.6);
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgb(255,236,190)'; ctx.lineWidth = 2.4 * s; ctx.beginPath();
    for (const f of [0.22, 0.5]) {
      const i = Math.floor(n * f); if (i < 1 || i >= n - 1) continue;
      const a = pts[i - 1], b = pts[i + 1], L = Math.hypot(b.x - a.x, b.y - a.y) || 1, ux = (b.x - a.x) / L, uy = (b.y - a.y) / L, bx = -uy, by = ux;
      const kx = pts[i].x + (bx * 11 + ux * 7) * s, ky = pts[i].y + (by * 11 + uy * 7) * s, fx = kx + (bx * 8 - ux * 9) * s, fy = ky + (by * 8 - uy * 9) * s;
      ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy);
      for (const sp of [-0.6, 0, 0.6]) { ctx.moveTo(fx, fy); ctx.lineTo(fx + (-ux * Math.cos(sp) + uy * Math.sin(sp)) * 6 * s, fy + (-uy * Math.cos(sp) - ux * Math.sin(sp)) * 6 * s); }
    }
    ctx.stroke();
    // head: flame mane, antlers, roaring jaw, blazing eye
    const h = pts[0], ref = pts[Math.min(2, n - 1)], ang = Math.atan2(h.y - ref.y, h.x - ref.x), jaw = 0.22 + 0.16 * Math.sin(this.t * 22);
    ctx.translate(h.x, h.y); ctx.rotate(ang); if (Math.cos(ang) < 0) ctx.scale(1, -1); ctx.scale(s * 1.2, s * 1.2);
    glow(8, 0, 54, C.gold, 0.85 * fade);
    ctx.globalAlpha = 0.85 * F; ctx.strokeStyle = 'rgb(255,170,70)'; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const fl = Math.sin(this.t * 30 + i * 1.7) * 4; ctx.moveTo(-6, -6 + i * 2.5); ctx.quadraticCurveTo(-20, -14 + i * 4 + fl, -38 - i * 3, -10 + i * 5 + fl * 1.5); }
    ctx.stroke();
    ctx.globalAlpha = F; ctx.fillStyle = 'rgb(255,216,135)';
    ctx.beginPath(); ctx.moveTo(-12, -10); ctx.quadraticCurveTo(10, -16, 31, -7); ctx.lineTo(37, -3); ctx.lineTo(33, 1); ctx.lineTo(8, 2); ctx.lineTo(-12, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); for (let x = 10; x < 30; x += 5) { ctx.moveTo(x, 1); ctx.lineTo(x + 1.6, 4.5); ctx.lineTo(x + 3.2, 1); } ctx.fill();
    ctx.save(); ctx.translate(2, 2); ctx.rotate(jaw); ctx.fillStyle = 'rgb(255,216,135)';
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(28, 0); ctx.lineTo(25, 5); ctx.quadraticCurveTo(8, 9, -10, 7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); for (let x = 8; x < 26; x += 5) { ctx.moveTo(x, 0); ctx.lineTo(x + 1.6, -3); ctx.lineTo(x + 3.2, 0); } ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgb(255,244,210)'; ctx.lineWidth = 2.6; ctx.beginPath();
    ctx.moveTo(2, -11); ctx.quadraticCurveTo(-8, -26, -28, -30); ctx.moveTo(-12, -24); ctx.lineTo(-10, -34); ctx.moveTo(-20, -28); ctx.lineTo(-24, -38);
    ctx.moveTo(-4, -10); ctx.quadraticCurveTo(-16, -18, -32, -17); ctx.moveTo(-20, -17); ctx.lineTo(-22, -25); ctx.stroke();
    const w = Math.sin(this.t * 18) * 7; ctx.lineWidth = 1.7; ctx.beginPath();
    ctx.moveTo(33, 2); ctx.bezierCurveTo(16, 22 + w, -8, 16 - w, -40, 30 + w);
    ctx.moveTo(31, -6); ctx.bezierCurveTo(12, -22 - w, -12, -8 + w, -44, -16 - w); ctx.stroke();
    glow(14, -6, 15, [255, 120, 60], fade); ctx.globalAlpha = F; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(14, -6, 2.8, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

// ---------- enemy projectiles: darts and blood orbs ----------
// [damage, hit radius, lifetime] per projectile kind; arrows fly on a ballistic arc, bolts fly straight
// leaf: bamboo-leaf blade; shard: ice shard; ice: falling icicle; spike: frost spikes erupting from the ground; quake: a staff's ground wave
const SHOTS = { dart: [8, 7, 1.6], orb: [18, 22, 2.4], arrow: [10, 7, 3], bolt: [20, 10, 1.6], leaf: [9, 9, 2.2], shard: [12, 9, 2], ice: [13, 10, 2], spike: [14, 26, 0.5], quake: [15, 30, 2.2] };
class Shot {
  constructor(x, y, vx, vy, kind, dmg) {
    const D = SHOTS[kind];
    Object.assign(this, { x, y, vx, vy, kind, t: 0, dead: false, dmg: dmg ?? D[0], r: D[1], life: D[2] });
  }
  update(dt, pl) {
    if (dt <= 0) return;
    this.t += dt; if (this.kind === 'arrow') this.vy += 900 * dt;
    this.x += this.vx * dt; this.y += this.vy * dt;
    if (this.kind === 'orb' && Math.random() < 0.85) spawn({ x: this.x, y: this.y, vx: -this.vx * 0.1 + rand(-40, 40), vy: rand(-40, 40), life: 0.4, size: rand(4, 9), col: C.blood });
    if (this.kind === 'bolt' && Math.random() < 0.9) spawn({ x: this.x, y: this.y, vx: -this.vx * 0.05, vy: rand(-30, 30), life: 0.3, size: rand(3, 6), col: C.ember });
    if ((this.kind === 'shard' || this.kind === 'ice') && Math.random() < 0.6) spawn({ x: this.x, y: this.y, vx: rand(-30, 30), vy: rand(-30, 30), life: 0.35, size: rand(2, 4), col: ICE });
    if (this.kind === 'quake' && Math.random() < 0.9) spawn({ x: this.x + rand(-20, 20), y: GROUND - 2, vx: rand(-60, 60), vy: rand(-260, -80), life: 0.4, size: rand(2, 4), col: C.gold, kind: 'spark', grav: 900 });
    if (this.kind === 'spike' && this.t < 0.05 && !this.cracked) { this.cracked = true; burst(this.x, GROUND - 10, 10, ICE, 260); sfx('clang'); }
    const b = pl.body(), live = this.kind !== 'spike' || (this.t > 0.08 && this.t < 0.4);
    if (live && this.dmg > 0 && pl.state !== 'dead' && this.x > b.x - this.r && this.x < b.x + b.w + this.r && this.y > b.y - this.r && this.y < b.y + b.h + this.r) {
      if (!(pl.inv > 0 || pl.state === 'dash' || pl.state === 'ult')) {
        hurtPlayer(this.dmg, Math.sign(this.vx) || Math.sign(pl.x - this.x) || 1);
        if (this.kind !== 'spike' && this.kind !== 'quake') this.dead = true;
        burst(this.x, this.y, 12, this.kind === 'leaf' ? LEAF : this.kind === 'orb' || this.kind === 'dart' || this.kind === 'arrow' ? C.blood : ICE, 260);
      }
    }
    if (this.kind === 'ice' && this.y > GROUND - 4) { burst(this.x, GROUND - 4, 14, ICE, 300); this.dead = true; }
    if (this.y > GROUND) {
      if (this.kind === 'arrow' || this.kind === 'bolt') { // arrows stay stuck in the stone for a moment
        const a = Math.atan2(this.vy, this.vx);
        game.debris.push({ kind: 'arrow', x: this.x - Math.cos(a) * 38, y: GROUND + 3 - Math.sin(a) * 38, a, vx: 0, vy: 0, vr: 0, face: 1, s: 1, t: 1.6, rest: true });
        dust(this.x, GROUND, 2);
      }
      this.dead = true;
    }
    if (this.t > this.life || this.x < -50 || this.x > WORLD_W + 50) this.dead = true;
  }
  draw() {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    if (this.kind === 'arrow' || this.kind === 'bolt') {
      const a = Math.atan2(this.vy, this.vx), bolt = this.kind === 'bolt';
      if (bolt) { glow(this.x, this.y, 42, C.ember, 0.85); ctx.globalAlpha = 0.5; ctx.strokeStyle = rgba(C.ember, 1); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x - Math.cos(a) * 110, this.y - Math.sin(a) * 110); ctx.stroke(); }
      else glow(this.x, this.y, 12, C.white, 0.35);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      drawWeapon('arrow', this.x - Math.cos(a) * 38, this.y - Math.sin(a) * 38, a, bolt ? 1.3 : 1, 1);
    } else if (this.kind === 'leaf') { // spinning bamboo-leaf blade
      glow(this.x, this.y, 18, LEAF, 0.7);
      ctx.globalCompositeOperation = 'source-over'; ctx.translate(this.x, this.y); ctx.rotate(this.t * 22);
      ctx.fillStyle = '#9fe0a0'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 3.2, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#2f6a3a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke();
    } else if (this.kind === 'shard' || this.kind === 'ice') { // ice: a shard along its flight, an icicle point-down
      const a = Math.atan2(this.vy, this.vx), L = this.kind === 'ice' ? 30 : 22;
      glow(this.x, this.y, 26, ICE, 0.7);
      ctx.translate(this.x, this.y); ctx.rotate(a); ctx.fillStyle = 'rgba(210,240,255,0.95)';
      ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-L * 0.4, -4); ctx.lineTo(-L, 0); ctx.lineTo(-L * 0.4, 4); ctx.closePath(); ctx.fill();
    } else if (this.kind === 'spike') { // a crown of frost spikes bursting up out of the ground
      const k = this.t < 0.08 ? this.t / 0.08 : this.t > 0.4 ? Math.max(0, 1 - (this.t - 0.4) / 0.1) : 1;
      glow(this.x, GROUND - 20, 40, ICE, 0.6 * k);
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(200,236,255,0.92)'; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1;
      for (const [dx, h] of [[-14, 30], [0, 52], [12, 38], [-6, 22], [20, 20]]) {
        ctx.beginPath(); ctx.moveTo(this.x + dx - 6, GROUND); ctx.lineTo(this.x + dx, GROUND - h * k); ctx.lineTo(this.x + dx + 6, GROUND); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    } else if (this.kind === 'quake') { // a rolling arc of golden force along the ground
      const dir = Math.sign(this.vx) || 1;
      glow(this.x, GROUND - 16, 46, C.gold, 0.7);
      ctx.strokeStyle = 'rgba(255,214,120,0.9)'; ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) { ctx.globalAlpha = 1 - i * 0.3; ctx.beginPath(); ctx.ellipse(this.x - dir * i * 16, GROUND, 14 + i * 4, 34 - i * 6, 0, Math.PI, TAU); ctx.stroke(); }
    } else if (this.kind === 'dart') {
      const a = Math.atan2(this.vy, this.vx);
      ctx.strokeStyle = rgba(C.ember, 0.9); ctx.lineWidth = 2.5; ctx.beginPath();
      ctx.moveTo(this.x, this.y); ctx.lineTo(this.x - Math.cos(a) * 28, this.y - Math.sin(a) * 28); ctx.stroke();
      glow(this.x, this.y, 14, C.ember, 0.9);
    } else {
      glow(this.x, this.y, 64, C.blood, 0.8); glow(this.x, this.y, 28, [255, 160, 150], 0.9);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = '#2a0710';
      ctx.beginPath(); ctx.arc(this.x, this.y, 8 + Math.sin(this.t * 20), 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
}

// ---------- weapons ----------
// drawn in the hand's local frame: +x runs from the grip out along the blade
const WEAPONS = { dao: { len: 45, grip: 0.22 }, kiem: { len: 59, grip: 0.1 }, chuy: { len: 60, grip: 0 }, tieu: { len: 22, grip: 0.3 }, bow: { len: 10, grip: 0 }, truong: { len: 64, grip: 0.05 } };
function bladeOf(e) {
  const J = e.J, W = WEAPONS[e.d.weapon], a = Math.atan2(J.h1.y - J.e1.y, J.h1.x - J.e1.x) - e.face * W.grip, s = e.s;
  return { x: J.h1.x, y: J.h1.y, a, bx: J.h1.x + Math.cos(a) * 12 * s, by: J.h1.y + Math.sin(a) * 12 * s, tx: J.h1.x + Math.cos(a) * W.len * s, ty: J.h1.y + Math.sin(a) * W.len * s };
}
function drawWeapon(kind, x, y, a, s, face, drawn = false) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, face < 0 ? -s : s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const line = (col, w, x0, y0, x1, y1) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
  if (kind === 'dao') { // curved saber with a red tassel
    line('#5b3a24', 3.6, -9, 0, 0, 0);
    ctx.strokeStyle = '#e04a3c'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.quadraticCurveTo(-14, 4, -12, 10); ctx.stroke();
    ctx.fillStyle = '#e6e9f1'; ctx.beginPath(); ctx.moveTo(1, -2.4); ctx.quadraticCurveTo(24, -3.8, 45, -8.5); ctx.lineTo(41, -2); ctx.quadraticCurveTo(24, 4.2, 1, 2.8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(110,120,145,0.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(3, -1); ctx.quadraticCurveTo(24, -1.6, 40, -5.4); ctx.stroke();
    line('#f2b544', 2.8, 0, -4.8, 0, 4.8);
  } else if (kind === 'kiem') { // straight double-edged sword
    line('#2a1420', 3.4, -11, 0, 0, 0);
    ctx.strokeStyle = '#d23a63'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.quadraticCurveTo(-17, 5, -15, 14); ctx.stroke();
    ctx.fillStyle = '#f1e9f1'; ctx.beginPath(); ctx.moveTo(1, -2.3); ctx.lineTo(52, -2.3); ctx.lineTo(59, 0); ctx.lineTo(52, 2.3); ctx.lineTo(1, 2.3); ctx.closePath(); ctx.fill();
    line('rgba(150,120,150,0.9)', 0.9, 3, 0, 54, 0);
    line('#d23a63', 3.2, 0, -6.5, 0, 6.5);
  } else if (kind === 'chuy') { // spiked iron mace
    line('#6b4a2e', 4.2, -8, 0, 44, 0); line('#b08850', 4.6, 38, 0, 42, 0);
    for (let i = 0; i < 8; i++) { const q = i * TAU / 8; line('#b3aec0', 2.4, 50 + Math.cos(q) * 8, Math.sin(q) * 8, 50 + Math.cos(q) * 15, Math.sin(q) * 15); }
    ctx.fillStyle = '#5f5b6c'; ctx.beginPath(); ctx.arc(50, 0, 10, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#a7a2b8'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(50, 0, 7, -2.4, -1.0); ctx.stroke();
  } else if (kind === 'truong') { // 禪杖: a monk's long staff held mid-shaft, rings jangling at the head
    line('#6b4a2e', 4.6, -38, 0, 60, 0); line('#b08850', 5, -40, 0, -34, 0);
    ctx.strokeStyle = '#d9b46a'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(66, 0, 9, 7, 0, 0, TAU); ctx.stroke();
    for (const ry of [-6, 0, 6]) { ctx.beginPath(); ctx.arc(66 + Math.sin(T * 9 + ry) * 1.5, ry, 3, 0, TAU); ctx.stroke(); }
  } else if (kind === 'bow') { // recurve bow held across the arm; the string is drawn separately while aiming
    ctx.strokeStyle = '#8a5a2e'; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(-7, -26); ctx.quadraticCurveTo(12, 0, -7, 26); ctx.stroke();
    ctx.fillStyle = '#f2b544';
    for (const ty of [-26, 26]) { ctx.beginPath(); ctx.arc(-7, ty, 1.8, 0, TAU); ctx.fill(); }
    if (!drawn) line('rgba(240,230,210,0.85)', 1.1, -7, -26, -7, 26);
    line('#3a2416', 4, 1.5, -4, 1.5, 4);
  } else if (kind === 'arrow') { // origin at the nock, point at +42
    line('#e6d6b0', 1.8, 0, 0, 34, 0);
    ctx.fillStyle = '#cfd3dd'; ctx.beginPath(); ctx.moveTo(34, -3); ctx.lineTo(42, 0); ctx.lineTo(34, 3); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e04a3c'; ctx.lineWidth = 1.4; ctx.beginPath();
    for (const sy of [-1, 1]) { ctx.moveTo(1, 0); ctx.lineTo(-4, sy * 3.5); ctx.moveTo(5, 0); ctx.lineTo(0, sy * 3.5); }
    ctx.stroke();
  } else if (kind === 'tieu') { // a fan of three throwing knives
    for (const da of [-0.42, 0, 0.42]) {
      ctx.save(); ctx.rotate(da); line('#dadde6', 2.2, 3, 0, 16, 0);
      ctx.fillStyle = '#dadde6'; ctx.beginPath(); ctx.moveTo(16, -2.4); ctx.lineTo(22, 0); ctx.lineTo(16, 2.4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#b08850'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(1, 0, 1.8, 0, TAU); ctx.stroke(); ctx.restore();
    }
  }
  ctx.restore();
}
// archer stance: bow arm points along the aim elevation (radians above level), string hand at the cheek or flung back on release
function aimPose(el, release) {
  const a = Math.PI / 2 + el;
  return P(0.05 - el * 0.15, -el * 0.3, a, a, release ? -1.6 : -1.75 + el * 0.4, release ? -1.9 : 1.45 + el, 0.6, 0.1, -0.6, -0.3);
}
POSES.slashW = P(-0.2, 0.05, 2.75, 3.55, 0.7, 2.3, 0.55, 0.1, -0.5, -0.25);
POSES.slash = P(0.42, 0.1, 1.15, 0.75, -0.4, 0.9, 0.85, 0.2, -0.75, -0.35);

// ---------- Huyết Ma giáo đồ ----------
const ETYPES = {
  thug: { hp: 48, s: 1, spd: 150, dmg: 9, range: 66, wind: 0.42, score: 100, c: [255, 92, 74], lw: 4, hat: true, weapon: 'dao' },
  dart: { hp: 34, s: 0.94, spd: 175, dmg: 8, range: 0, wind: 0.5, score: 150, c: [255, 152, 74], lw: 3.6, hat: true, ranged: true, weapon: 'tieu', keep: [240, 420] },
  archer: { hp: 36, s: 0.96, spd: 165, dmg: 10, range: 0, wind: 0.65, score: 170, c: [196, 140, 255], lw: 3.6, ranged: true, weapon: 'bow', keep: [300, 440] },
  heavy: { hp: 140, s: 1.3, spd: 95, dmg: 18, range: 92, wind: 0.75, score: 280, c: [232, 64, 76], lw: 5.5, armor: true, smash: true, weapon: 'chuy' },
  boss: { hp: 950, s: 1.45, spd: 220, dmg: 16, range: 96, wind: 0.55, score: 3000, c: [242, 84, 132], lw: 5, armor: true, boss: true, weapon: 'kiem', name: 'Huyết Ma Lão Tổ', han: '血魔老祖', hairCol: 'rgba(110,22,52,0.95)' },
  trucboss: { hp: 780, s: 1.32, spd: 290, dmg: 13, range: 92, wind: 0.42, score: 2500, c: [120, 232, 150], lw: 4.6, armor: true, boss: true, hat: true, weapon: 'kiem', name: 'Thanh Trúc Kiếm Khách', han: '青竹劍客', hairCol: 'rgba(40,120,70,0.95)' },
  monkboss: { hp: 1150, s: 1.75, spd: 120, dmg: 18, range: 125, wind: 0.62, score: 2800, c: [255, 190, 90], lw: 6.2, armor: true, boss: true, smash: true, weapon: 'truong', name: 'Thiết Tháp La Hán', han: '鐵塔羅漢' },
  iceboss: { hp: 860, s: 1.32, spd: 230, dmg: 14, range: 0, wind: 0.55, score: 3000, c: [150, 220, 255], lw: 4.4, armor: true, boss: true, ranged: true, keep: [260, 440], weapon: null, name: 'Băng Phách Tiên Cơ', han: '冰魄仙姬', hairCol: 'rgba(170,225,255,0.9)' },
  archboss: { hp: 820, s: 1.4, spd: 250, dmg: 14, range: 0, wind: 0.5, score: 3500, c: [255, 140, 64], lw: 5, armor: true, boss: true, ranged: true, weapon: 'bow', keep: [280, 460], name: 'Lạc Nhật Thần Cung', han: '落日神弓', hairCol: 'rgba(150,64,22,0.95)' },
};
class Enemy extends Fighter {
  constructor(x, y, type) {
    const d = ETYPES[type];
    super(x, { hp: Math.round((d.hp + (d.boss ? Math.max(0, game.wave / 5 - 1) * 260 : Math.floor(game.wave / 4) * 8)) * (d.boss ? DIFF.boss : DIFF.hp)), s: d.s });
    Object.assign(this, { y, prevY: y, d, type, mode: 'move', cd: rand(0.6, 1.5) * DIFF.cd, poise: 0, poiseT: 0, armorT: 0, face: -1, runPh: rand(0, 9), deadT: 0, fade: 0, act: null, windT: 0.4, recT: 0.45, hits: false, slamming: false, landed: y >= GROUND, gone: false, spin: 0, tumble: 0, tumbleR: 0, escT: 0, aimA: 0, aimX: 0, aimY: 0, leapShot: false });
    this.col = rgba(d.c, 1); this.backCol = rgba(d.c, 0.5); this.lw = d.lw; this.trail = [];
    if (y < GROUND) this.ground = false;
    if (d.boss) { this.hair = d.hairCol ? new Ribbon(11, 9) : null; this.glowCol = rgba(d.c, 0.6); this.glowBlur = 14; }
  }
  update(dt, pl) {
    if (dt <= 0) { this.computeJ(); return; }
    this.st += dt; this.flashT = Math.max(0, this.flashT - dt); this.cd -= dt; this.escT -= dt;
    this.poiseT -= dt; this.armorT = Math.max(0, this.armorT - dt);
    if (this.dead) return this.updDead(dt);
    const ai = BOSS_AI[this.type]; if (ai && ai.tick) ai.tick(this, dt, pl);
    const wasGround = this.ground, d = this.d, dx = pl.x - this.x, adx = Math.abs(dx);
    let tgt = null;
    if (this.stun > 0) {
      this.stun -= dt; this.vx = approach(this.vx, 0, (this.ground ? 1400 : 200) * dt); tgt = POSES.hurt;
      if (this.stun <= 0) { this.mode = 'move'; this.st = 0; }
    } else if (this.mode === 'move') {
      const toward = adx > 14 ? (dx >= 0 ? 1 : -1) : this.face; // small dead zone stops flicker when the hero is right overhead
      this.face = toward;
      let want = 0;
      if (game.ultOn || pl.state === 'dead') want = 0;
      else if (d.ranged) {
        if (adx < d.keep[0]) want = -toward; else if (adx > d.keep[1]) want = toward;
        if (want) this.face = want; // turn and run to the right range instead of backpedalling
        if (d.boss) this.bossThink(adx);
        else if (d.weapon === 'bow' && adx < 190 && this.ground && this.escT <= 0) { // khinh công backflip away from a close hero
          this.face = toward; this.vy = -820; this.vx = -toward * 380; this.ground = false;
          this.flip = -1; this.flipT = 0; this.flipDur = 0.55; this.escT = 2.6; want = 0; sfx('jump');
        } else if (this.cd <= 0 && adx < 760) this.begin(d.weapon === 'bow' ? 'shoot' : 'throw');
      } else if (d.boss) {
        want = adx > 130 ? this.face : 0; this.bossThink(adx);
      } else {
        if (adx > d.range) want = this.face;
        else if (this.cd <= 0 && Math.abs(pl.y - this.y) < 80) this.begin('melee');
        else want = -this.face * 0.3;
        if (this.ground && pl.ground && pl.y < this.y - 50 && adx < 230 && this.cd <= 0) { this.vy = -980; this.vx = this.face * 220; this.ground = false; this.cd = 0.9; this.flip = 1; this.flipT = 0; }
      }
      if (this.ground) this.vx += (want * d.spd * (this.spdMul || 1) - this.vx) * (1 - Math.exp(-8 * dt));
    } else if (this.mode === 'wind') {
      this.vx = approach(this.vx, 0, 1500 * dt);
      if (this.act === 'shoot') this.aimA = this.solveAim(pl, 820);
      else if (this.act === 'rain') this.aimA = 1.2;
      else if (this.act === 'snipe') { // tracks the hero, then locks 0.2 s before release
        if (this.st < this.windT - 0.2) { this.aimX = pl.x; this.aimY = pl.y - 50; }
        if (this.J) this.aimA = Math.atan2(this.J.h1.y - this.aimY, Math.abs(this.aimX - this.J.h1.x));
      }
      if (this.act === 'orb' || this.act === 'snipe' || this.type === 'boss') { const a = rand(0, TAU), r = rand(50, 90), hx = this.x + this.face * 30 * this.s, hy = this.y - 60 * this.s; spawn({ x: hx + Math.cos(a) * r, y: hy + Math.sin(a) * r, vx: -Math.cos(a) * r * 4, vy: -Math.sin(a) * r * 4, life: 0.22, size: 3, col: this.act === 'snipe' ? C.ember : C.blood, drag: 0 }); }
      if (this.st > this.windT) this.fire(pl);
    } else if (this.mode === 'atk') this.updAct(dt, pl);
    else if (this.mode === 'rec') {
      this.vx = approach(this.vx, 0, 1200 * dt);
      if (this.st > this.recT) { this.mode = 'move'; this.st = 0; this.cd = rand(0.8, 1.7) * (d.boss ? 0.55 : 1) * DIFF.cd * (this.cdMul || 1); }
    }
    this.physics(dt);
    if (this.ground && !wasGround) {
      dust(this.x, this.y, 5);
      if (!this.landed) { this.landed = true; if (d.boss) { ring(this.x, this.y, 10, 270, 0.6, C.blood, 10, { flat: 0.3 }); shake(16); sfx('boom'); dust(this.x, this.y, 16); } }
      if (this.slamming) this.slamLand(pl);
      if (this.mode === 'atk' && this.act === 'leap') { this.mode = 'rec'; this.st = 0; this.recT = 0.4; }
    }
    this.animate(dt, tgt || this.poseFor(dt), this.mode === 'atk' ? 30 : 22);
    if (this.tumble) {
      if (this.ground) { this.tumble = 0; this.pose.rot = Math.atan2(Math.sin(this.pose.rot), Math.cos(this.pose.rot)); dust(this.x, this.y, 8); }
      else { this.tumbleR += this.tumble * dt; this.pose.rot = this.tumbleR; }
    }
    this.computeJ();
    for (const q of this.trail) q.age += dt;
    if (this.mode === 'atk' && this.d.weapon && this.d.weapon !== 'tieu' && this.d.weapon !== 'bow' && (this.act === 'melee' || this.act === 'dashP' || this.act === 'slam')) { const b = bladeOf(this); this.trail.unshift({ bx: b.bx, by: b.by, tx: b.tx, ty: b.ty, age: 0 }); }
    while (this.trail.length && this.trail[this.trail.length - 1].age > 0.14) this.trail.pop();
    if (this.hair) this.hair.update(this.J.sa.x, this.J.sa.y, dt);
    if (d.boss && Math.random() < dt * 22) spawn({ x: this.x + rand(-26, 26), y: this.y - rand(0, 120), vy: rand(-90, -40), vx: rand(-20, 20), life: rand(0.5, 1), size: rand(2, 4), col: d.c, kind: 'ember', drag: 0.5, rot: rand(0, 9) });
  }
  begin(kind) {
    this.mode = 'wind'; this.st = 0; this.act = kind; this.hits = false; this.leapShot = false;
    const pl = game.player; if (Math.abs(pl.x - this.x) > 4) this.face = pl.x > this.x ? 1 : -1;
    this.windT = (BOSS_AI[this.type]?.wind?.[kind] ?? { throw: 0.5, orb: 0.65, dashP: 0.5, slam: 0.35, shoot: this.d.boss ? 0.5 : 0.65, snipe: 0.85, rain: 0.6, leap: 0.12 }[kind] ?? this.d.wind) * DIFF.wind;
  }
  // elevation (radians above level) for a low ballistic arc that lands on the hero's chest
  solveAim(pl, v, spread = 0) {
    const x0 = this.J ? this.J.h1.x : this.x, y0 = this.J ? this.J.h1.y : this.y - 60, g = 900;
    const dx = Math.max(1, Math.abs(pl.x - x0)), dy = y0 - (pl.y - 50), disc = v ** 4 - g * (g * dx * dx + 2 * dy * v * v);
    return clamp((disc >= 0 ? Math.atan((v * v - Math.sqrt(disc)) / (g * dx)) : Math.PI / 4) + spread, -0.9, 1.3);
  }
  shootArrow(pl, spread = 0, v = 820) {
    v *= DIFF.shot;
    const th = this.solveAim(pl, v, spread), J = this.J, dir = Math.sign(pl.x - this.x) || this.face;
    game.shots.push(new Shot(J.h1.x, J.h1.y, dir * v * Math.cos(th), -v * Math.sin(th), 'arrow', this.d.boss ? 13 : 10));
  }
  bossThink(adx) {
    if (this.cd > 0 || game.ultOn) return;
    const r = Math.random(), ai = BOSS_AI[this.type];
    if (ai && ai.think && ai.think(this, adx, r)) return;
    if (this.type === 'archboss') {
      if (adx < 180 && this.ground) this.begin('leap');
      else this.begin(r < 0.38 ? 'snipe' : r < 0.68 ? 'rain' : 'shoot');
      return;
    }
    if (adx > 420) this.begin(r < 0.6 ? 'orb' : 'slam');
    else if (adx < 140) this.begin(r < 0.55 ? 'melee' : 'slam');
    else this.begin(r < 0.45 ? 'dashP' : r < 0.75 ? 'orb' : 'slam');
  }
  fire(pl) {
    this.mode = 'atk'; this.st = 0; const k = this.act, s = this.s;
    if (BOSS_AI[this.type]?.fire?.(this, k, pl)) return;
    if (k === 'melee') {
      this.vx = this.face * (this.d.smash ? 120 : 260); sfx('swing');
      if (this.d.smash) { ring(this.x + this.face * 60, this.y, 10, 110, 0.4, C.blood, 6, { flat: 0.3 }); shake(6); sfx('heavy'); dust(this.x + this.face * 60, this.y, 8); }
    } else if (k === 'throw') {
      const hx = this.x + this.face * 20, hy = this.y - 64 * s, n = game.wave >= 6 ? 3 : 1, sp = 720 * DIFF.shot;
      for (let i = 0; i < n; i++) {
        const tt = Math.max(0.2, Math.abs(pl.x - hx) / sp), vy = clamp((pl.y - 50 - hy) / tt, -300, 300) + (i - (n - 1) / 2) * 110;
        game.shots.push(new Shot(hx, hy, this.face * sp, vy, 'dart'));
      }
      sfx('dart'); this.mode = 'rec'; this.recT = 0.5;
    } else if (k === 'dashP') { this.vx = this.face * 980; sfx('dash'); }
    else if (k === 'orb') {
      game.shots.push(new Shot(this.x + this.face * 40 * s, this.y - 62 * s, this.face * 560 * DIFF.shot, 0, 'orb'));
      sfx('roar'); shake(6); ring(this.x + this.face * 40 * s, this.y - 62 * s, 6, 70, 0.3, C.blood, 6); this.mode = 'rec'; this.recT = 0.6;
    } else if (k === 'slam') {
      this.vy = -1050; this.vx = clamp((pl.x - this.x) * 1.1, -700, 700); this.ground = false; this.slamming = true; sfx('jump');
    } else if (k === 'shoot') {
      const n = this.d.boss ? 3 : game.wave >= 8 ? 2 : 1;
      for (let i = 0; i < n; i++) this.shootArrow(pl, (i - (n - 1) / 2) * 0.07);
      sfx('bow'); this.mode = 'rec'; this.recT = 0.45;
    } else if (k === 'snipe') { // 落日箭: one straight, fast arrow along the locked aim line
      const J = this.J, a = Math.atan2(this.aimY - J.h1.y, this.aimX - J.h1.x);
      game.shots.push(new Shot(J.h1.x, J.h1.y, Math.cos(a) * 1500 * DIFF.shot, Math.sin(a) * 1500 * DIFF.shot, 'bolt'));
      sfx('bow'); sfx('dash'); shake(6); flash(0.12, '255,128,64'); this.mode = 'rec'; this.recT = 0.55;
    } else if (k === 'rain') { // arrows loosed skyward come down over marked spots around the hero
      const J = this.J;
      for (let i = 0; i < 3; i++) game.shots.push(new Shot(J.h1.x, J.h1.y, rand(-80, 80), -1500, 'arrow', 0));
      for (let i = 0; i < 12; i++) game.rain.push({ x: clamp(pl.x + rand(-240, 240), 30, WORLD_W - 30), t: 0.75 + i * 0.06, fired: false });
      sfx('bow'); this.mode = 'rec'; this.recT = 0.6;
    } else if (k === 'leap') {
      this.vy = -950; this.vx = -this.face * 480; this.ground = false; this.flip = -1; this.flipT = 0; this.flipDur = 0.6; sfx('jump');
    }
  }
  updAct(dt, pl) {
    if (BOSS_AI[this.type]?.act?.(this, dt, pl)) return;
    const k = this.act, t = this.st, s = this.s;
    if (k === 'melee') {
      this.vx = approach(this.vx, 0, 1400 * dt);
      if (!this.hits && t < 0.14) {
        const r = this.d.range + 12, box = { x: this.face > 0 ? this.x : this.x - r, y: this.y - 82 * s, w: r, h: 74 * s };
        if (overlap(box, pl.body())) { this.hits = true; hurtPlayer(this.d.dmg, this.face); }
      }
      if (t > 0.18) { this.mode = 'rec'; this.st = 0; this.recT = this.d.smash ? 0.7 : 0.5; }
    } else if (k === 'dashP') {
      if (Math.random() < 0.8) spawn({ x: this.x, y: this.y - rand(10, 110), vx: -this.vx * 0.2, life: 0.3, size: rand(3, 6), col: C.blood });
      if (!this.hits && overlap(this.body(), pl.body())) { this.hits = true; hurtPlayer(this.d.dmg, this.face); }
      if (t > 0.32) { this.vx *= 0.3; this.mode = 'rec'; this.st = 0; this.recT = 0.55; }
    } else if (k === 'leap') { // three arrows fanned at the top of the backflip
      this.aimA = this.solveAim(pl, 900);
      if (!this.leapShot && this.vy > -150) { this.leapShot = true; for (const sp of [-0.12, 0, 0.12]) this.shootArrow(pl, sp, 900); sfx('bow'); }
    }
  }
  slamLand(pl) {
    this.slamming = false;
    ring(this.x, this.y, 10, 230, 0.5, C.blood, 10, { flat: 0.3 }); shake(14); sfx('boom'); dust(this.x, this.y, 14);
    if (Math.abs(pl.x - this.x) < 175 && pl.ground && Math.abs(pl.y - this.y) < 40) hurtPlayer(this.d.dmg + 4, Math.sign(pl.x - this.x) || 1);
    this.mode = 'rec'; this.st = 0; this.recT = 0.7;
  }
  poseFor(dt) {
    const bp = BOSS_AI[this.type]?.pose?.(this); if (bp) return bp;
    const m = this.mode, k = this.act, heavy = !!this.d.smash, blade = this.d.weapon === 'dao' || this.d.weapon === 'kiem';
    const bowAct = k === 'shoot' || k === 'snipe' || k === 'rain';
    if ((m === 'wind' && bowAct) || (m === 'atk' && k === 'leap')) return aimPose(this.aimA, false);
    if (m === 'rec' && bowAct) return aimPose(this.aimA, true);
    if (!this.ground && m !== 'atk') return mixPose(POSES.jump, POSES.fall, clamp((this.vy + 250) / 500, 0, 1));
    if (m === 'wind') return k === 'throw' ? POSES.throwW : (k === 'orb' || k === 'dashP') ? POSES.gather : (heavy || k === 'slam') ? POSES.bigW : blade ? POSES.slashW : POSES.jabW;
    if (m === 'atk') return k === 'melee' ? (heavy ? POSES.smash : blade ? POSES.slash : POSES.jab) : k === 'slam' ? (this.vy < 0 ? POSES.raise : POSES.dive) : POSES.palm;
    if (m === 'rec') return k === 'throw' ? POSES.throw : k === 'orb' ? POSES.palm : k === 'melee' ? (heavy ? POSES.smash : blade ? POSES.slash : POSES.stance) : POSES.stance;
    const sp = Math.abs(this.vx);
    if (sp > 25) { this.runPh += dt * sp / 20; return runPose(this.runPh, Math.min(0.75, sp / 300)); }
    return POSES.stance;
  }
  updDead(dt) {
    this.deadT += dt;
    const wasG = this.ground;
    this.vx = approach(this.vx, 0, (this.ground ? 1500 : 150) * dt);
    this.physics(dt);
    if (this.ground && !wasG) { this.pose.rot = Math.atan2(Math.sin(this.pose.rot), Math.cos(this.pose.rot)); dust(this.x, this.y, 8); }
    if (this.ground) { this.lying = true; this.animate(dt, POSES.down, 12); }
    else { this.pose.rot += this.spin * dt; const r = this.pose.rot; this.animate(dt, POSES.hurt, 14); this.pose.rot = r; }
    if (this.deadT > 0.9 && this.ground) {
      this.fade += dt * 1.4;
      if (this.J && Math.random() < 0.8) { const ks = ['head', 'hip', 'h1', 'f1', 'k2', 'neck'], q = this.J[ks[(Math.random() * ks.length) | 0]]; spawn({ x: q.x, y: q.y, vx: rand(-20, 20), vy: rand(-120, -50), life: rand(0.5, 0.9), size: rand(2, 4), col: this.d.c, kind: 'ember', drag: 0.4, rot: rand(0, 9) }); }
    }
    this.alpha = 1 - clamp(this.fade, 0, 1);
    if (this.fade >= 1) this.gone = true;
    this.computeJ();
  }
  drawBehind(J) {
    if (this.hair) this.hair.draw(this.d.hairCol, 6 * this.s);
    if (this.d.weapon === 'bow' && !this.dead) { // quiver slung across the back
      const s = this.s, off = -this.face * 7 * s;
      ctx.save(); ctx.translate(lerp(J.hip.x, J.neck.x, 0.6), lerp(J.hip.y, J.neck.y, 0.6));
      ctx.rotate(Math.atan2(J.neck.y - J.hip.y, J.neck.x - J.hip.x) + this.face * 0.3);
      ctx.fillStyle = '#5b3a24'; ctx.fillRect(-14 * s, off - 3 * s, 26 * s, 6 * s);
      ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 1.2 * s; ctx.beginPath();
      for (const dy of [-2, 0, 2]) { ctx.moveTo(12 * s, off + dy * s); ctx.lineTo(20 * s, off + dy * 1.6 * s); }
      ctx.stroke(); ctx.restore();
    }
  }
  drawBow(J) {
    const s = this.s, b = bladeOf(this), k = this.act, drawing = this.mode === 'wind' && (k === 'shoot' || k === 'snipe' || k === 'rain');
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = this.alpha * GA;
    drawWeapon('bow', b.x, b.y, b.a, s, this.face, drawing);
    if (!drawing) return;
    const c = Math.cos(b.a), sn = Math.sin(b.a), tip = ly => ({ x: b.x + (-7 * c - ly * sn) * s, y: b.y + (-7 * sn + ly * c) * s });
    const T1 = tip(26), T2 = tip(-26), hx = J.h2.x, hy = J.h2.y, ax = b.x + c * 14 * s, ay = b.y + sn * 14 * s;
    ctx.strokeStyle = 'rgba(240,230,210,0.9)'; ctx.lineWidth = 1.1 * s; ctx.beginPath();
    ctx.moveTo(T1.x, T1.y); ctx.lineTo(hx, hy); ctx.lineTo(T2.x, T2.y); ctx.stroke();
    drawWeapon('arrow', hx, hy, Math.atan2(ay - hy, ax - hx), s, 1);
    const q = clamp(this.st / this.windT, 0, 1);
    ctx.globalCompositeOperation = 'lighter'; glow(ax, ay, (8 + 12 * q) * s, this.d.boss ? C.ember : C.white, 0.5 + 0.5 * q);
    if (k === 'snipe' && !REFLECT) { // aim line: faint while tracking, flickering once locked
      const locked = this.st > this.windT - 0.2, a = Math.atan2(this.aimY - b.y, this.aimX - b.x);
      ctx.globalAlpha = (locked ? 0.55 + 0.45 * Math.sin(T * 60) : 0.15 + 0.35 * q) * GA;
      ctx.strokeStyle = 'rgb(255,110,60)'; ctx.lineWidth = locked ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + Math.cos(a) * 1400, b.y + Math.sin(a) * 1400); ctx.stroke();
    }
  }
  drawExtra(J, col) {
    const s = this.s;
    if (this.d.hat) {
      const ux = J.head.x - J.neck.x, uy = J.head.y - J.neck.y, L = Math.hypot(ux, uy) || 1, nx = ux / L, ny = uy / L;
      const cx = J.head.x + nx * 3 * s, cy = J.head.y + ny * 3 * s;
      ctx.fillStyle = '#7a5a32'; ctx.strokeStyle = '#d2a866'; ctx.lineWidth = 1.6 * s; ctx.beginPath();
      ctx.moveTo(cx - ny * 18 * s, cy + nx * 18 * s); ctx.lineTo(J.head.x + nx * 16 * s, J.head.y + ny * 16 * s); ctx.lineTo(cx + ny * 18 * s, cy - nx * 18 * s);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    const dropped = this.dead || (this.act === 'throw' && this.mode === 'rec' && this.st < 0.3);
    if (this.d.weapon === 'bow') { if (!this.dead) this.drawBow(J); }
    else if (this.d.weapon && !dropped) {
      if (this.trail.length > 1) { // sword light following the swing
        ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba(this.d.boss ? C.blood : this.d.smash ? [210, 190, 170] : C.white, 1);
        for (let i = 0; i < this.trail.length - 1; i++) {
          const a = this.trail[i], b = this.trail[i + 1], k = 1 - a.age / 0.14;
          ctx.globalAlpha = 0.55 * k * k * GA; ctx.beginPath();
          ctx.moveTo(a.bx, a.by); ctx.lineTo(a.tx, a.ty); ctx.lineTo(b.tx, b.ty); ctx.lineTo(b.bx, b.by); ctx.closePath(); ctx.fill();
        }
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = this.alpha * GA;
      const b = bladeOf(this); drawWeapon(this.d.weapon, b.x, b.y, b.a, s, this.face);
      if (this.d.weapon === 'kiem') { ctx.globalCompositeOperation = 'lighter'; glow(lerp(b.x, b.tx, 0.6), lerp(b.y, b.ty, 0.6), 30 * s, C.blood, 0.35 * this.alpha); }
    }
    ctx.globalCompositeOperation = 'lighter';
    if (this.armorT > 0 && !this.dead) glow(J.neck.x, J.neck.y + 12 * s, 54 * s, C.blood, 0.55 * Math.min(1, this.armorT * 3)); // broke free: brief red aura
    if (this.d.boss && !this.dead) glow(J.head.x + this.face * 3.5 * s, J.head.y - 1.5 * s, 9 * s, this.type === 'archboss' ? [255, 180, 90] : [255, 90, 90], 1);
    if (this.mode === 'wind' && !this.dead && this.stun <= 0 && this.d.weapon !== 'bow') { // telegraph: a gleam runs up the blade before the strike
      const k = clamp(this.st / this.windT, 0, 1);
      if (this.d.weapon && this.d.weapon !== 'tieu' && (this.act === 'melee' || this.act === 'dashP' || this.act === 'slam')) {
        const b = bladeOf(this), q = 0.25 + 0.75 * k;
        glow(lerp(b.x, b.tx, q), lerp(b.y, b.ty, q), 11 * s, C.white, 0.9);
        if (k > 0.65) drawFlare(b.tx, b.ty, (k - 0.65) / 0.35 * 26 * s, T * 3, C.white, 1);
      } else glow(J.h1.x, J.h1.y, (14 + 30 * k) * s, C.blood, 0.35 + 0.65 * k);
    }
    BOSS_AI[this.type]?.draw?.(this, J);
    if (!this.dead && !this.d.boss && this.hp < this.maxHp && !REFLECT) {
      const w = 34 * s, x = this.x - w / 2, y = this.y - 116 * s;
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(8,6,12,0.8)'; ctx.fillRect(x - 1, y - 1, w + 2, 5);
      ctx.fillStyle = this.col; ctx.fillRect(x, y, w * Math.max(0, this.hp / this.maxHp), 3);
    }
  }
}
