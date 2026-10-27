
// ---------- maps: five painted scenes, each with its own sky, props, ground, platforms and weather ----------
// sky() draws in screen space (view units, gy = ground line on screen); props, ground details and platforms in world space.
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const STARS = Array.from({ length: 130 }, () => ({ x: Math.random(), y: Math.random(), r: rand(0.5, 1.6), p: rand(0, TAU) }));
const disc = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
function ridge(x, seed, amp) {
  return (Math.sin(x * 0.0023 + seed) * 0.45 + Math.sin(x * 0.0061 + seed * 2.3) * 0.3 +
    Math.sin(x * 0.017 + seed * 4.1) * 0.12 + Math.abs(Math.sin(x * 0.0011 + seed * 0.7)) * 0.9) * amp;
}
const dune = (x, seed, amp) => (Math.sin(x * 0.0018 + seed) * 0.6 + Math.sin(x * 0.0047 + seed * 1.7) * 0.3 + 1) * amp * 0.5;
function skyGrad(gy, stops) {
  const g = ctx.createLinearGradient(0, gy - 600, 0, gy);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g; ctx.fillRect(0, 0, view.w, view.h);
}
function stars(gy, a) {
  ctx.fillStyle = '#efe6d2';
  for (const st of STARS) { ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(T * 1.4 + st.p)); ctx.fillRect(st.x * view.w, st.y * (gy - 140), st.r, st.r); }
  ctx.globalAlpha = 1;
}
function celestial(x, y, r, col, halo, haloA) {
  ctx.globalCompositeOperation = 'lighter'; glow(x, y, r * 4.5, halo, haloA, false); glow(x, y, r * 2, col, 0.3, false);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = rgba(col, 1); disc(x, y, r);
}
// a silhouette ridge (or smooth dunes) with a mist band at its foot; returns where props on it should stand
function hills(p, seed, amp, lift, col, gy, mist, smooth) {
  const off = view.camX * p, base = gy - lift, f = smooth ? dune : ridge;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, gy + 2);
  for (let x = 0; x <= view.w + 12; x += 12) ctx.lineTo(x, base - f(x + off, seed, amp));
  ctx.lineTo(view.w + 12, gy + 2); ctx.closePath(); ctx.fill();
  if (mist) { const m = ctx.createLinearGradient(0, base - 50, 0, gy); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(1, mist); ctx.fillStyle = m; ctx.fillRect(0, base - 50, view.w, gy - base + 52); }
  return { at: lx => ({ x: lx - off, y: base - f(lx, seed, amp) }) };
}
function onScreen(x, pad = 120) { return x > -pad && x < view.w + pad; }
function lanternPos(p) {
  const sw = Math.sin(T * 1.6 + p.x) * 0.14;
  return { x: p.x + p.w / 2 + Math.sin(sw) * 24, y: p.y + 14 + Math.cos(sw) * 24 };
}
function hangingLantern(p, glowCol, body) {
  const lx = p.x + p.w / 2, { x, y } = lanternPos(p);
  ctx.strokeStyle = 'rgba(239,230,210,0.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(lx, p.y + 12); ctx.lineTo(x, y - 10); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter'; glow(x, y, 48, glowCol, 0.5, false);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(x, y, 8, 10, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#f2b544'; ctx.fillRect(x - 5, y - 11, 10, 2.5); ctx.fillRect(x - 5, y + 8.5, 10, 2.5);
}
// curved eave roof: ridge at y - h, tips flicking up beyond the half-width hw
function eaveRoof(x, y, hw, h) {
  ctx.beginPath(); ctx.moveTo(x - hw - 16, y - 8); ctx.quadraticCurveTo(x - hw * 0.55, y + 2, x - hw * 0.3, y - h);
  ctx.lineTo(x + hw * 0.3, y - h); ctx.quadraticCurveTo(x + hw * 0.55, y + 2, x + hw + 16, y - 8);
  ctx.lineTo(x + hw, y + 4); ctx.lineTo(x - hw, y + 4); ctx.closePath(); ctx.fill();
}
function drawPagoda(x, y, col, tiers = 4, s = 1, lit = 'rgba(255,170,90,0.55)') {
  ctx.fillStyle = col;
  for (let i = 0; i < tiers; i++) { const bw = (16 - i * 2.6) * s, yy = y - i * 15 * s; ctx.fillRect(x - bw / 2, yy - 11 * s, bw, 12 * s); eaveRoof(x, yy - 9 * s, bw / 2 + 6 * s, 9 * s); ctx.fillStyle = col; }
  ctx.fillRect(x - 1 * s, y - (tiers * 15 + 16) * s, 2 * s, 16 * s);
  ctx.fillStyle = lit; ctx.fillRect(x - 2.5 * s, y - 8 * s, 5 * s, 5 * s); ctx.fillRect(x - 2 * s, y - 23 * s, 4 * s, 4 * s);
}
function drawHall(x, y, col, s) {
  ctx.fillStyle = col;
  ctx.fillRect(x - 95 * s, y - 55 * s, 190 * s, 56 * s); eaveRoof(x, y - 55 * s, 150 * s, 30 * s);
  ctx.fillRect(x - 60 * s, y - 100 * s, 120 * s, 26 * s); eaveRoof(x, y - 98 * s, 100 * s, 26 * s);
  ctx.fillRect(x - 3 * s, y - 142 * s, 6 * s, 18 * s);
  ctx.fillStyle = 'rgba(255,170,90,0.45)';
  for (let i = -2; i <= 2; i++) ctx.fillRect(x + i * 34 * s - 6 * s, y - 42 * s, 12 * s, 18 * s);
}
// stalks of bamboo across a parallax layer: leaning culms with nodes and swaying leaf sprays
function bambooLayer(p, seed, spacing, thick, col, gy) {
  const off = view.camX * p, i0 = Math.floor(off / spacing) - 1, i1 = Math.ceil((off + view.w) / spacing) + 1, top = -60;
  ctx.fillStyle = col;
  for (let i = i0; i <= i1; i++) {
    const h = hash(i * 7 + seed), x = i * spacing + h * spacing * 0.6 - off, w = thick * (0.75 + h * 0.5);
    const lean = (hash(i + seed * 3) - 0.5) * 0.08 + Math.sin(T * 0.6 + i) * 0.004, at = y => x + lean * (gy - y);
    ctx.beginPath(); ctx.moveTo(x - w / 2, gy + 2); ctx.lineTo(x + w / 2, gy + 2); ctx.lineTo(at(top) + w / 2, top); ctx.lineTo(at(top) - w / 2, top); ctx.fill();
    for (let y = gy - 30 - h * 40; y > top; y -= 50 + thick * 2) ctx.fillRect(at(y) - w * 0.75, y, w * 1.5, Math.max(1.5, w * 0.22));
    for (let k = 0; k < 3; k++) {
      const y = gy * (0.12 + 0.2 * k + h * 0.12), nx = at(y), right = (k + i) % 2 === 0, sway = Math.sin(T * 1.2 + i + k) * 0.08;
      for (let m = 0; m < 4; m++) {
        const a = right ? 0.35 + m * 0.2 + sway : Math.PI - 0.35 - m * 0.2 + sway, L = thick * 3.2 + m * thick * 0.6;
        ctx.save(); ctx.translate(nx, y); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(L / 2, 0, L / 2, Math.max(1.4, thick * 0.32), 0, 0, TAU); ctx.fill(); ctx.restore();
      }
    }
  }
}
function pine(x, y, s, col, snow) {
  ctx.fillStyle = col; ctx.fillRect(x - 3 * s, y - 18 * s, 6 * s, 18 * s);
  for (let i = 0; i < 3; i++) {
    const w = (34 - i * 8) * s, yy = y - 14 * s - i * 22 * s;
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - w, yy); ctx.lineTo(x, yy - 34 * s); ctx.lineTo(x + w, yy); ctx.closePath(); ctx.fill();
    if (snow) { ctx.strokeStyle = snow; ctx.lineWidth = 2.5 * s; ctx.beginPath(); ctx.moveTo(x - w * 0.7, yy - 9 * s); ctx.lineTo(x, yy - 32 * s); ctx.lineTo(x + w * 0.5, yy - 14 * s); ctx.stroke(); }
  }
}
function flame(x, y, s) { // brazier or torch fire
  const f = Math.sin(T * 18 + x) * 0.15;
  ctx.globalCompositeOperation = 'lighter'; glow(x, y - 10 * s, 60 * s, C.ember, 0.6, false);
  ctx.fillStyle = 'rgba(255,140,50,0.9)'; ctx.beginPath(); ctx.moveTo(x - 9 * s, y); ctx.quadraticCurveTo(x - 6 * s, y - 16 * s, x + f * 20 * s, y - 30 * s); ctx.quadraticCurveTo(x + 6 * s, y - 16 * s, x + 9 * s, y); ctx.fill();
  ctx.fillStyle = 'rgba(255,230,150,0.9)'; ctx.beginPath(); ctx.moveTo(x - 4 * s, y); ctx.quadraticCurveTo(x, y - 12 * s, x + f * 10 * s, y - 18 * s); ctx.quadraticCurveTo(x + 3 * s, y - 8 * s, x + 4 * s, y); ctx.fill();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
const visibleX = (x, pad = 200) => x > view.camX - pad && x < view.camX + view.w + pad;

const MAPS = [
  { // ---------- 1. bamboo forest at dawn ----------
    orb: [0.32, [200, 235, 190]], id: 'truc', name: 'Rừng Trúc', han: '竹林', boss: 'trucboss', mix: { thug: 3, dart: 1.2 },
    floor: ['#10261d', '#030a07'], edge: 'rgba(160,230,170,0.3)', fade: [6, 16, 12], refl: 0.18,
    plats: [{ x: 420, y: 330, w: 200 }, { x: 880, y: 240, w: 180 }, { x: 1270, y: 150, w: 160 }, { x: 1660, y: 240, w: 180 }, { x: 2060, y: 330, w: 200 }],
    sky(gy) {
      skyGrad(gy, [[0, '#04100f'], [0.5, '#0b2a28'], [0.85, '#1d4a40'], [1, '#3c6e58']]);
      const sx = view.w * 0.32 - view.camX * 0.02, sy = gy - 300;
      celestial(sx, sy, 46, [230, 240, 205], [70, 140, 110], 0.55);
      hills(0.06, 2.1, 90, 160, '#0d2a27', gy, 'rgba(90,150,120,0.25)');
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(190,240,200,0.045)';
      for (let i = 0; i < 5; i++) { const x = sx + (i - 2) * 70; ctx.beginPath(); ctx.moveTo(x - 6, sy); ctx.lineTo(x + 6, sy); ctx.lineTo(x + 140 + i * 60, gy); ctx.lineTo(x - 40 + i * 60, gy); ctx.fill(); }
      ctx.globalCompositeOperation = 'source-over';
      bambooLayer(0.16, 1, 44, 4, '#15423b', gy);
      const m = ctx.createLinearGradient(0, gy - 220, 0, gy); m.addColorStop(0, 'rgba(120,180,150,0)'); m.addColorStop(1, 'rgba(120,180,150,0.22)');
      ctx.fillStyle = m; ctx.fillRect(0, gy - 220, view.w, 222);
      bambooLayer(0.34, 2, 86, 8, '#0d2e29', gy);
      bambooLayer(0.58, 3, 170, 14, '#071c19', gy);
    },
    props() {},
    ground(x0, w) {
      for (let x = Math.floor(x0 / 18) * 18; x < x0 + w; x += 18) {
        const h = hash(x);
        if (h > 0.35) { ctx.strokeStyle = 'rgba(90,150,90,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let b = -1; b <= 1; b++) { ctx.moveTo(x + b * 3, GROUND); ctx.lineTo(x + b * 5 + Math.sin(T * 2 + x) * 2, GROUND - 6 - h * 9); } ctx.stroke(); }
        if (h > 0.94) { ctx.fillStyle = '#2a3a30'; ctx.beginPath(); ctx.ellipse(x, GROUND + 4, 10, 5, 0, 0, TAU); ctx.fill(); }
      }
    },
    plat(p) {
      const { x, y, w } = p;
      ctx.strokeStyle = 'rgba(60,90,45,0.9)'; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(x + 14, y); ctx.lineTo(x + 14, y - 260); ctx.moveTo(x + w - 14, y); ctx.lineTo(x + w - 14, y - 260); ctx.stroke();
      for (let i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? '#5f7d3c' : '#7a9b4c'; ctx.fillRect(x - 6, y + i * 5, w + 12, 5); }
      ctx.fillStyle = '#3f5a28'; for (let xx = x + 22; xx < x + w; xx += 34) ctx.fillRect(xx, y, 2, 15);
      ctx.fillStyle = '#c9b27a'; for (const xx of [x + 8, x + w - 12]) ctx.fillRect(xx, y - 1, 4, 17);
      ctx.strokeStyle = 'rgba(210,240,160,0.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + w + 6, y); ctx.stroke();
    },
    ambient(rdt) {
      if (Math.random() < rdt * 4) spawn({ x: view.camX + rand(-50, view.w + 250), y: view.camY - 10, vx: rand(-70, -20), vy: rand(30, 60), life: rand(6, 10), size: rand(5, 8), col: [110, 175, 95], kind: 'petal', drag: 0, vr: rand(-2, 2), rot: rand(0, TAU) });
      if (Math.random() < rdt * 2.5) spawn({ x: view.camX + rand(0, view.w), y: GROUND - rand(10, 220), vx: rand(-20, 20), vy: rand(-15, 15), life: rand(2, 4), size: rand(1.5, 2.6), col: [200, 255, 140], kind: 'ember', drag: 0, rot: rand(0, 9) });
    },
  },
  { // ---------- 2. Zen monastery under the moon ----------
    orb: [0.74, C.moon], id: 'vien', name: 'Thiền Viện', han: '禪院', boss: 'monkboss', mix: { thug: 3, heavy: 1, archer: 1 },
    floor: ['#221b30', '#07060b'], edge: 'rgba(242,181,68,0.3)', fade: [12, 10, 18], refl: 0.22, lamp: C.ember,
    plats: [{ x: 360, y: 340, w: 240 }, { x: 790, y: 232, w: 200 }, { x: 1160, y: 335, w: 280 }, { x: 1220, y: 150, w: 160 }, { x: 1610, y: 232, w: 200 }, { x: 2000, y: 340, w: 240 }],
    sky(gy) {
      skyGrad(gy, [[0, '#07060d'], [0.55, '#171229'], [0.86, '#2e1d3c'], [1, '#46283f']]);
      stars(gy, 0.6);
      celestial(view.w * 0.74 - view.camX * 0.02, gy - 335, 54, C.moon, [90, 70, 120], 0.55);
      hills(0.08, 1.3, 120, 175, '#2a2043', gy, 'rgba(120,96,150,0.20)');
      const mid = hills(0.2, 4.2, 95, 105, '#1d1630', gy, 'rgba(90,70,120,0.18)');
      for (const lx of [520, 1650]) { const q = mid.at(lx); if (onScreen(q.x)) drawPagoda(q.x, q.y + 4, '#1d1630'); }
      const near = hills(0.42, 7.9, 70, 45, '#130f20', gy, 'rgba(60,46,86,0.22)');
      for (const lx of [760, 2050]) { const q = near.at(lx); if (onScreen(q.x, 200)) drawHall(q.x, q.y + 10, '#130f20', 0.8); }
      for (const lx of [1500]) { const q = near.at(lx); if (onScreen(q.x)) drawPagoda(q.x, q.y + 4, '#130f20', 5, 1.2); }
    },
    props() { // stone lanterns along the courtyard and the great bell in its frame
      for (const x of [180, 960, 1640, 2420]) {
        if (!visibleX(x)) continue;
        ctx.fillStyle = '#2a2236'; ctx.fillRect(x - 16, GROUND - 10, 32, 10); ctx.fillRect(x - 5, GROUND - 46, 10, 36); ctx.fillRect(x - 13, GROUND - 50, 26, 6);
        ctx.fillStyle = '#3a3048'; ctx.fillRect(x - 11, GROUND - 74, 22, 24);
        ctx.globalCompositeOperation = 'lighter'; glow(x, GROUND - 62, 40, C.ember, 0.45 + 0.1 * Math.sin(T * 5 + x), false); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(255,190,110,0.8)'; ctx.fillRect(x - 6, GROUND - 68, 12, 12);
        ctx.fillStyle = '#2a2236'; eaveRoof(x, GROUND - 74, 14, 10);
      }
      const bx = 1300;
      if (visibleX(bx)) {
        ctx.fillStyle = '#1c1527'; ctx.fillRect(bx - 74, GROUND - 170, 9, 170); ctx.fillRect(bx + 65, GROUND - 170, 9, 170); ctx.fillRect(bx - 84, GROUND - 176, 168, 10);
        eaveRoof(bx, GROUND - 176, 90, 22);
        const sw = Math.sin(T * 0.9) * 0.03;
        ctx.save(); ctx.translate(bx, GROUND - 166); ctx.rotate(sw);
        ctx.fillStyle = '#4a3a2a'; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.lineTo(10, 12); ctx.quadraticCurveTo(28, 16, 30, 70); ctx.lineTo(-30, 70); ctx.quadraticCurveTo(-28, 16, -10, 12); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(242,181,68,0.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-30, 70); ctx.lineTo(30, 70); ctx.moveTo(-27, 40); ctx.lineTo(27, 40); ctx.stroke();
        ctx.restore();
      }
    },
    ground(x0, w) {
      ctx.strokeStyle = 'rgba(239,230,210,0.05)'; ctx.lineWidth = 1; ctx.beginPath();
      const mid = view.camX + view.w / 2;
      for (let x = Math.floor(x0 / 90) * 90; x < x0 + w; x += 90) { ctx.moveTo(x, GROUND + 2); ctx.lineTo(x + (x - mid) * 0.35, GROUND + 90); }
      for (const yy of [16, 40, 76]) { ctx.moveTo(x0, GROUND + yy); ctx.lineTo(x0 + w, GROUND + yy); }
      ctx.stroke();
    },
    plat(p) {
      hangingLantern(p, C.ember, '#d4442c');
      ctx.fillStyle = '#1c1527'; ctx.beginPath();
      ctx.moveTo(p.x - 24, p.y - 9); ctx.quadraticCurveTo(p.x - 10, p.y, p.x + 4, p.y); ctx.lineTo(p.x + p.w - 4, p.y); ctx.quadraticCurveTo(p.x + p.w + 10, p.y, p.x + p.w + 24, p.y - 9);
      ctx.lineTo(p.x + p.w + 6, p.y + 13); ctx.lineTo(p.x - 6, p.y + 13); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(239,230,210,0.07)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = p.x + 8; x < p.x + p.w - 4; x += 13) { ctx.moveTo(x, p.y + 2); ctx.lineTo(x, p.y + 12); }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(242,181,68,0.5)'; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(p.x - 24, p.y - 9); ctx.quadraticCurveTo(p.x - 10, p.y, p.x + 4, p.y); ctx.lineTo(p.x + p.w - 4, p.y); ctx.quadraticCurveTo(p.x + p.w + 10, p.y, p.x + p.w + 24, p.y - 9); ctx.stroke();
    },
    ambient(rdt) {
      if (Math.random() < rdt * 5) spawn({ x: view.camX + rand(-50, view.w + 250), y: view.camY - 10, vx: rand(-80, -30), vy: rand(30, 70), life: rand(6, 10), size: rand(2.5, 4.5), col: C.plum, kind: 'petal', drag: 0, vr: rand(-3, 3), rot: rand(0, TAU) });
    },
  },
  { // ---------- 3. snow peaks under the aurora ----------
    orb: [0.18, [220, 235, 255]], id: 'tuyet', name: 'Tuyết Sơn', han: '雪山', boss: 'iceboss', mix: { thug: 2, archer: 1.5, dart: 1, heavy: 0.8 },
    floor: ['#dfe8f4', '#3a4a66'], edge: 'rgba(255,255,255,0.75)', fade: [190, 204, 228], refl: 0.1,
    plats: [{ x: 300, y: 350, w: 260 }, { x: 760, y: 260, w: 220 }, { x: 1190, y: 170, w: 200 }, { x: 1620, y: 260, w: 220 }, { x: 2050, y: 350, w: 260 }],
    sky(gy) {
      skyGrad(gy, [[0, '#03060f'], [0.5, '#0b1a33'], [0.85, '#1c3557'], [1, '#33507a']]);
      stars(gy, 0.8);
      ctx.globalCompositeOperation = 'lighter';
      for (const [base, col, ph] of [[gy - 400, [70, 230, 170], 0], [gy - 350, [110, 150, 255], 2.2]]) {
        for (let x = 0; x <= view.w; x += 7) {
          const y = base + Math.sin(x * 0.006 + T * 0.3 + ph) * 34 + Math.sin(x * 0.017 + ph) * 12;
          ctx.globalAlpha = 0.16 + 0.12 * Math.sin(x * 0.01 + T * 0.5 + ph); ctx.drawImage(sprite(col, false), x - 5, y - 40, 10, 170);
        }
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      celestial(view.w * 0.18 - view.camX * 0.02, gy - 360, 28, [230, 240, 255], [80, 110, 170], 0.4);
      // snow-capped ranges: the ridge in snow, then the same ridge lowered by a cap that is thickest on the peaks
      for (const [p, seed, amp, lift, body, cap] of [[0.08, 3.3, 150, 170, '#23385c', '#cddbef'], [0.22, 5.1, 110, 100, '#172849', '#b5c6e2'], [0.45, 8.7, 70, 40, '#0e1932', '#9fb2d0']]) {
        const off = view.camX * p, base = gy - lift;
        for (const [col, dy] of [[cap, 0], [body, 30]]) {
          ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, gy + 2);
          for (let x = 0; x <= view.w + 12; x += 12) { const r = ridge(x + off, seed, amp); ctx.lineTo(x, base - r + dy * Math.min(1, r / amp)); }
          ctx.lineTo(view.w + 12, gy + 2); ctx.closePath(); ctx.fill();
        }
        if (p > 0.4) for (let lx = 60; lx < WORLD_W; lx += 130) { const x = lx - off; if (onScreen(x)) pine(x, base - ridge(lx, seed, amp) + 30 * Math.min(1, ridge(lx, seed, amp) / amp) + 6, 0.7 + hash(lx) * 0.4, '#0b1426', 'rgba(220,235,255,0.8)'); }
      }
    },
    props() { for (const x of [140, 1000, 1600, 2450]) if (visibleX(x)) pine(x, GROUND + 2, 2.2, '#16233c', 'rgba(235,245,255,0.95)'); },
    ground(x0, w) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let x = Math.floor(x0 / 60) * 60; x < x0 + w; x += 60) { const h = hash(x); ctx.beginPath(); ctx.ellipse(x + h * 30, GROUND + 1, 26 + h * 20, 4 + h * 3, 0, Math.PI, 0); ctx.fill(); }
      ctx.strokeStyle = 'rgba(120,150,190,0.25)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = Math.floor(x0 / 46) * 46; x < x0 + w; x += 46) { const h = hash(x + 3); ctx.moveTo(x, GROUND + 14 + h * 30); ctx.quadraticCurveTo(x + 20, GROUND + 10 + h * 30, x + 40, GROUND + 14 + h * 30); }
      ctx.stroke();
    },
    plat(p) {
      const { x, y, w } = p;
      ctx.fillStyle = 'rgba(190,230,255,0.85)';
      for (let xx = x + 6; xx < x + w - 6; xx += 16) { const L = 6 + hash(xx) * 16; ctx.beginPath(); ctx.moveTo(xx, y + 12); ctx.lineTo(xx + 5, y + 12 + L); ctx.lineTo(xx + 10, y + 12); ctx.fill(); }
      ctx.fillStyle = '#7fb1d6'; ctx.beginPath(); ctx.moveTo(x - 10, y + 2); ctx.lineTo(x + w + 10, y + 2); ctx.lineTo(x + w, y + 14); ctx.lineTo(x, y + 14); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#eef6ff'; ctx.fillRect(x - 10, y - 3, w + 20, 6);
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 10, y - 3); ctx.lineTo(x + w + 10, y - 3); ctx.stroke();
    },
    ambient(rdt) {
      for (let i = 0; i < 2; i++) if (Math.random() < rdt * 10) spawn({ x: view.camX + rand(-50, view.w + 150), y: view.camY - 10, vx: rand(-45, -8), vy: rand(40, 90), life: rand(8, 12), size: rand(1.2, 2.8), col: [240, 248, 255], kind: 'snow', drag: 0, rot: rand(0, 9) });
    },
  },
  { // ---------- 4. ancient fortress at sunset ----------
    orb: [0.62, [255, 200, 120]], id: 'thanh', name: 'Lạc Nhật Cổ Thành', han: '落日古城', boss: 'archboss', mix: { thug: 2, archer: 2, heavy: 1, dart: 0.6 },
    floor: ['#4a2418', '#120705'], edge: 'rgba(255,190,120,0.35)', fade: [22, 9, 6], refl: 0.15,
    plats: [{ x: 480, y: 300, w: 230 }, { x: 1185, y: 210, w: 230 }, { x: 1890, y: 300, w: 230 }],
    sky(gy) {
      skyGrad(gy, [[0, '#1c0a1a'], [0.45, '#6a1f2c'], [0.75, '#d0603a'], [1, '#f2b25c']]);
      const sx = view.w * 0.62 - view.camX * 0.03, sy = gy - 125;
      celestial(sx, sy, 110, [255, 214, 140], [255, 120, 60], 0.6);
      ctx.fillStyle = 'rgba(70,20,30,0.55)';
      for (const [dy, len, sp] of [[-150, 340, 8], [-95, 260, -5], [-60, 420, 4]]) { const x = ((sx - len / 2 + T * sp) % (view.w + len)); ctx.beginPath(); ctx.ellipse(x, sy + dy, len / 2, 6, 0, 0, TAU); ctx.fill(); }
      hills(0.08, 1.1, 110, 120, '#8a3a2a', gy, 'rgba(255,150,90,0.18)', true);
      const mid = hills(0.24, 2.6, 90, 70, '#5a2420', gy, 'rgba(160,70,50,0.2)', true);
      for (const lx of [620, 1720]) { // ruined walls with a gate tower and a torn banner
        const q = mid.at(lx); if (!onScreen(q.x, 260)) continue;
        const x = q.x, y = q.y + 12; ctx.fillStyle = '#3a1718';
        ctx.fillRect(x - 160, y - 60, 320, 62);
        for (let i = -160; i < 160; i += 22) if (hash(lx + i) > 0.25) ctx.fillRect(x + i, y - 72, 13, 12);
        ctx.fillRect(x - 40, y - 120, 80, 122); for (let i = -40; i < 40; i += 20) ctx.fillRect(x + i, y - 132, 12, 12);
        ctx.fillStyle = '#5a2420'; ctx.beginPath(); ctx.moveTo(x - 20, y + 2); ctx.lineTo(x - 20, y - 50); ctx.quadraticCurveTo(x, y - 74, x + 20, y - 50); ctx.lineTo(x + 20, y + 2); ctx.fill();
        ctx.strokeStyle = '#3a1718'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - 132); ctx.lineTo(x, y - 190); ctx.stroke();
        ctx.fillStyle = '#a8302a'; ctx.beginPath(); ctx.moveTo(x, y - 188);
        for (let k = 0; k <= 6; k++) ctx.lineTo(x + k * 9, y - 188 + Math.sin(T * 4 + k) * 3 + k * 0.6);
        for (let k = 6; k >= 0; k--) ctx.lineTo(x + k * 9, y - 166 + Math.sin(T * 4 + k) * 3 + k * 1.2);
        ctx.closePath(); ctx.fill();
      }
      hills(0.45, 4.4, 60, 30, '#34151a', gy, 'rgba(90,40,30,0.25)', true);
    },
    props() {
      for (const x of [260, 1100, 2300]) { // broken pillars
        if (!visibleX(x)) continue;
        const h = 90 + hash(x) * 70; ctx.fillStyle = '#4a2a20'; ctx.fillRect(x - 16, GROUND - 10, 32, 10); ctx.fillRect(x - 11, GROUND - h, 22, h);
        ctx.beginPath(); ctx.moveTo(x - 11, GROUND - h); ctx.lineTo(x - 2, GROUND - h - 14); ctx.lineTo(x + 4, GROUND - h - 4); ctx.lineTo(x + 11, GROUND - h - 10); ctx.lineTo(x + 11, GROUND - h); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = -6; k <= 6; k += 6) { ctx.moveTo(x + k, GROUND - 10); ctx.lineTo(x + k, GROUND - h); } ctx.stroke();
      }
      for (const x of [720, 1900]) { // spears stuck in the sand with tattered pennants
        if (!visibleX(x)) continue;
        ctx.strokeStyle = '#2a1410'; ctx.lineWidth = 2.5;
        for (const [dx, a] of [[0, -0.15], [14, 0.1]]) { ctx.beginPath(); ctx.moveTo(x + dx, GROUND); ctx.lineTo(x + dx + Math.sin(a) * 110, GROUND - 110); ctx.stroke(); }
        ctx.fillStyle = '#8a2a22'; ctx.beginPath(); ctx.moveTo(x - 16, GROUND - 106); ctx.lineTo(x - 16 - 22 - Math.sin(T * 5) * 4, GROUND - 98); ctx.lineTo(x - 14, GROUND - 90); ctx.fill();
      }
    },
    ground(x0, w) {
      ctx.strokeStyle = 'rgba(255,200,140,0.09)'; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let x = Math.floor(x0 / 34) * 34; x < x0 + w; x += 34) { const h = hash(x); ctx.moveTo(x, GROUND + 10 + h * 50); ctx.quadraticCurveTo(x + 16, GROUND + 6 + h * 50, x + 30, GROUND + 10 + h * 50); }
      ctx.stroke();
    },
    plat(p) {
      const { x, y, w } = p;
      ctx.strokeStyle = '#2e1a12'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(x + 18, y + 10); ctx.lineTo(x + 18, GROUND); ctx.moveTo(x + w - 18, y + 10); ctx.lineTo(x + w - 18, GROUND); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 18, y + 30); ctx.lineTo(x + w - 18, GROUND - 20); ctx.moveTo(x + w - 18, y + 30); ctx.lineTo(x + 18, GROUND - 20); ctx.stroke();
      ctx.fillStyle = '#6a4028'; ctx.fillRect(x - 6, y, w + 12, 12);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; ctx.beginPath(); for (let xx = x + 14; xx < x + w; xx += 20) { ctx.moveTo(xx, y); ctx.lineTo(xx, y + 12); } ctx.stroke();
      ctx.strokeStyle = 'rgba(255,200,140,0.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + w + 6, y); ctx.stroke();
      ctx.strokeStyle = '#2e1a12'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x + w - 2, y); ctx.lineTo(x + w - 2, y - 70); ctx.stroke();
      ctx.fillStyle = '#a8302a'; ctx.beginPath(); ctx.moveTo(x + w - 2, y - 70); ctx.lineTo(x + w - 2 - 30, y - 64 + Math.sin(T * 5 + x) * 3); ctx.lineTo(x + w - 2, y - 52); ctx.fill();
    },
    ambient(rdt) {
      if (Math.random() < rdt * 12) spawn({ x: view.camX + view.w + 30, y: GROUND - rand(0, 240), vx: rand(-560, -320), vy: rand(-20, 20), life: rand(1.5, 2.5), size: rand(3, 9), col: [235, 175, 115], kind: 'soft', drag: 0 });
    },
  },
  { // ---------- 5. the Blood Demon palace ----------
    orb: [0.7, [220, 60, 60]], id: 'cung', name: 'Huyết Ma Cung', han: '血魔宮', boss: 'boss', mix: { thug: 2.5, archer: 1.2, dart: 1, heavy: 1.2 },
    floor: ['#1c070b', '#050102'], edge: 'rgba(255,80,60,0.4)', fade: [8, 2, 3], refl: 0.24, lamp: [255, 60, 40],
    plats: [{ x: 350, y: 330, w: 220 }, { x: 820, y: 230, w: 200 }, { x: 1200, y: 140, w: 200 }, { x: 1580, y: 230, w: 200 }, { x: 2030, y: 330, w: 220 }],
    sky(gy) {
      skyGrad(gy, [[0, '#050103'], [0.5, '#1e040b'], [0.85, '#4a0a14'], [1, '#6e1418']]);
      stars(gy, 0.25);
      const mx = view.w * 0.7 - view.camX * 0.02, my = gy - 330;
      celestial(mx, my, 66, [200, 48, 58], [140, 20, 30], 0.7);
      ctx.fillStyle = 'rgba(90,10,20,0.45)'; for (const [cx, cy, r] of [[-20, -12, 14], [18, 10, 10], [6, -28, 7]]) disc(mx + cx, my + cy, r);
      ctx.fillStyle = 'rgba(70,8,16,0.55)';
      for (let i = 0; i < 4; i++) { const x = ((i * 380 + T * (10 + i * 4)) % (view.w + 500)) - 250; ctx.beginPath(); ctx.ellipse(x, gy - 420 + i * 55, 220, 12, 0, 0, TAU); ctx.fill(); }
      const far = hills(0.1, 6.2, 130, 150, '#1a050b', gy, 'rgba(120,20,30,0.2)');
      for (const lx of [300, 1200, 2100]) { const q = far.at(lx); if (onScreen(q.x)) drawPagoda(q.x, q.y + 6, '#1a050b', 6, 1.4, 'rgba(255,60,40,0.6)'); }
      const near = hills(0.32, 9.4, 90, 60, '#110308', gy, 'rgba(160,30,30,0.22)');
      for (const lx of [700, 1750]) { const q = near.at(lx); if (onScreen(q.x, 220)) { drawHall(q.x, q.y + 10, '#110308', 1.1); drawPagoda(q.x - 110, q.y + 4, '#110308', 7, 1.5, 'rgba(255,60,40,0.65)'); drawPagoda(q.x + 110, q.y + 4, '#110308', 7, 1.5, 'rgba(255,60,40,0.65)'); } }
      ctx.strokeStyle = '#140306'; ctx.lineWidth = 3; // chains hanging into view
      for (let i = 0; i < 3; i++) {
        const x = ((i * 520 + 180) - view.camX * 0.9) % (view.w + 200), L = 120 + i * 40, sw = Math.sin(T * 0.8 + i) * 8;
        for (let k = 0; k < L; k += 12) { ctx.beginPath(); ctx.ellipse(x + sw * k / L, k, 3.5, 6, 0, 0, TAU); ctx.stroke(); }
      }
    },
    props() {
      for (const x of [300, 1050, 1550, 2300]) {
        if (!visibleX(x)) continue;
        ctx.fillStyle = '#2a0c10'; ctx.fillRect(x - 3, GROUND - 60, 6, 60); ctx.fillRect(x - 18, GROUND - 66, 36, 8);
        ctx.beginPath(); ctx.moveTo(x - 18, GROUND - 58); ctx.lineTo(x + 18, GROUND - 58); ctx.lineTo(x + 10, GROUND - 48); ctx.lineTo(x - 10, GROUND - 48); ctx.fill();
        flame(x, GROUND - 66, 1.2);
      }
    },
    ground(x0, w) {
      ctx.globalCompositeOperation = 'lighter';
      for (let x = Math.floor(x0 / 140) * 140; x < x0 + w; x += 140) {
        if (hash(x) < 0.35) continue;
        ctx.strokeStyle = `rgba(255,70,40,${0.35 + 0.25 * Math.sin(T * 2 + x)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, GROUND + 3);
        let cx = x, cy = GROUND + 3; for (let k = 0; k < 5; k++) { cx += 10 + hash(x + k) * 20; cy += 6 + hash(x - k) * 10; ctx.lineTo(cx, cy); }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    },
    plat(p) {
      hangingLantern(p, [255, 60, 40], '#7a1018');
      const { x, y, w } = p;
      ctx.fillStyle = '#1c0b10'; ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x + w + 12, y); ctx.lineTo(x + w, y + 16); ctx.lineTo(x, y + 16); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `rgba(255,70,50,${0.5 + 0.3 * Math.sin(T * 3 + x)})`; ctx.lineWidth = 1.6; ctx.beginPath();
      for (let xx = x; xx < x + w; xx += 26) { ctx.moveTo(xx + 4, y + 8); ctx.lineTo(xx + 14, y + 8); ctx.moveTo(xx + 9, y + 4); ctx.lineTo(xx + 9, y + 12); }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,90,70,0.5)'; ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x + w + 12, y); ctx.stroke();
    },
    ambient(rdt) {
      if (Math.random() < rdt * 10) spawn({ x: view.camX + rand(0, view.w), y: GROUND + rand(0, 10), vx: rand(-20, 20), vy: rand(-90, -40), life: rand(2, 4), size: rand(1.5, 3), col: [255, 90, 50], kind: 'ember', drag: 0, rot: rand(0, 9) });
    },
  },
];
let MAP = MAPS[1];
function setMap(i) { MAP = MAPS[(i + MAPS.length) % MAPS.length]; PLATFORMS = MAP.plats; }
setMap(0);

function drawBackground() {
  const s = view.dpr * view.scale; ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  MAP.sky(GROUND - view.camY);
}
function drawGround(between) {
  const x0 = view.camX - 60, w = view.w + 120;
  const g = ctx.createLinearGradient(0, GROUND, 0, GROUND + 220);
  g.addColorStop(0, MAP.floor[0]); g.addColorStop(1, MAP.floor[1]);
  ctx.fillStyle = g; ctx.fillRect(x0, GROUND, w, view.h + 500);
  if (between) between();
  MAP.ground(x0, w);
  ctx.strokeStyle = MAP.edge; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x0, GROUND); ctx.lineTo(x0 + w, GROUND); ctx.stroke();
}
function drawPlatforms() {
  MAP.props();
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  for (const p of PLATFORMS) if (p.x + p.w > view.camX - 80 && p.x < view.camX + view.w + 80) MAP.plat(p);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
