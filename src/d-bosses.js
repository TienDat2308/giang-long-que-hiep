
// ---------- boss behaviour: each boss adds its own moves on top of the shared enemy state machine (d-foes.js) ----------
// Hooks, all optional: wind (wind-up seconds per move), think(e, adx, r) → true when it chose a move,
// tick(e, dt, pl) every frame, fire(e, move, pl) → true when it handled the release, act(e, dt, pl) → true while it
// drives an active move, pose(e) → a pose or null, draw(e, J) for extra art.
const ICE = [150, 220, 255], LEAF = [120, 232, 150];
POSES.meditate = P(0, 0.1, 0.55, 2.7, 0.55, 2.7, 0.6, 0.05, -0.6, -0.05);
const leafBurst = (x, y, n) => {
  for (let i = 0; i < n; i++) spawn({ x: x + rand(-20, 20), y: y + rand(-40, 40), vx: rand(-260, 260), vy: rand(-260, 120), life: rand(0.5, 0.9), size: rand(4, 7), col: [110, 190, 100], kind: 'petal', drag: 2, vr: rand(-8, 8), rot: rand(0, TAU) });
};

const BOSS_AI = {
  trucboss: { // 青竹劍客: vanishes in a whirl of leaves to strike from behind, and throws fans of leaf blades
    wind: { blink: 0.32, leaves: 0.45 },
    think(e, adx, r) {
      if (adx > 320) e.begin(r < 0.5 ? 'blink' : 'leaves');
      else if (adx < 150) e.begin(r < 0.6 ? 'melee' : 'blink');
      else e.begin(r < 0.4 ? 'dashP' : r < 0.7 ? 'leaves' : 'blink');
      return true;
    },
    tick(e) { e.alpha = e.mode === 'wind' && e.act === 'blink' ? clamp(1 - e.st / e.windT, 0.08, 1) : 1; },
    fire(e, k, pl) {
      if (k === 'blink') {
        leafBurst(e.x, e.y - 50, 18);
        e.x = clamp(pl.x - (pl.face || 1) * 95, 40, WORLD_W - 40); e.y = e.prevY = Math.min(GROUND, pl.y); e.vx = 0; e.alpha = 1;
        leafBurst(e.x, e.y - 50, 18); sfx('dash');
        e.begin('melee'); e.windT = 0.2; // the cut comes almost at once
        return true;
      }
      if (k === 'leaves') {
        const J = e.J, a0 = Math.atan2(pl.y - 50 - J.h1.y, pl.x - J.h1.x), v = 650 * DIFF.shot;
        for (let i = -2; i <= 2; i++) game.shots.push(new Shot(J.h1.x, J.h1.y, Math.cos(a0 + i * 0.12) * v, Math.sin(a0 + i * 0.12) * v, 'leaf'));
        sfx('dart'); e.mode = 'rec'; e.recT = 0.45; return true;
      }
      return false;
    },
    pose(e) {
      if (e.act !== 'leaves') return null;
      return e.mode === 'wind' ? POSES.throwW : e.mode === 'rec' ? POSES.throw : null;
    },
  },

  monkboss: { // 鐵塔羅漢: staff sweeps, ground waves, and the golden bell no blow can pierce
    wind: { sweep: 0.45, wave: 0.5, bell: 0.4 },
    think(e, adx, r) {
      if (e.bellCd <= 0 && r < 0.3) e.begin('bell');
      else if (adx < 170) e.begin(r < 0.55 ? 'sweep' : 'melee');
      else e.begin(r < 0.55 ? 'wave' : 'slam');
      return true;
    },
    tick(e, dt) {
      e.bellCd = (e.bellCd ?? 4) - dt;
      if (e.bellT > 0) { e.bellT -= dt; if (e.bellT <= 0) { e.mode = 'rec'; e.st = 0; e.recT = 0.3; } }
    },
    fire(e, k, pl) {
      if (k === 'bell') { // 金鐘罩: stays in its stance until the bell fades (see tick)
        e.bellT = 2.6; e.bellCd = 9; e.pulse = 0.3; e.vx = 0;
        sfx('gong'); popText(e.x, e.y - 200, 'Kim Chung Tráo', '#ffd27a', 20); return true;
      }
      if (k === 'sweep') { sfx('swing'); return true; }
      if (k === 'wave') {
        const dir = Math.sign(pl.x - e.x) || e.face;
        game.shots.push(new Shot(e.x + dir * 70, GROUND - 20, dir * 520 * DIFF.shot, 0, 'quake'));
        ring(e.x + dir * 70, GROUND, 10, 130, 0.4, C.gold, 8, { flat: 0.3 }); dust(e.x + dir * 70, GROUND, 10); shake(8); sfx('boom');
        e.mode = 'rec'; e.recT = 0.55; return true;
      }
      return false;
    },
    act(e, dt, pl) {
      if (e.act === 'bell') {
        e.vx = 0; e.pulse -= dt;
        if (e.pulse <= 0) { // the bell rings out in shock waves
          e.pulse = 0.65; ring(e.x, e.y - 60 * e.s, 20, 175, 0.45, C.gold, 7); sfx('clang');
          const dx = pl.x - e.x; if (Math.abs(dx) < 150 && Math.abs(pl.y - e.y) < 130) hurtPlayer(8, Math.sign(dx) || 1);
        }
        return true;
      }
      if (e.act === 'sweep') { // the staff whirls round, striking both sides
        e.face = Math.floor(e.st / 0.08) % 2 ? 1 : -1;
        if (Math.random() < 0.9) { const a = rand(0, TAU); spawn({ x: e.x + Math.cos(a) * 130, y: e.y - 70 + Math.sin(a) * 30, vx: -Math.sin(a) * 300, vy: Math.cos(a) * 80, life: 0.25, size: rand(3, 5), col: C.gold }); }
        if (!e.hits && e.st > 0.12) { const dx = pl.x - e.x; if (Math.abs(dx) < 150 && Math.abs(pl.y - e.y) < 90) { e.hits = true; hurtPlayer(e.d.dmg, Math.sign(dx) || 1); } }
        if (e.st > 0.5) { e.face = Math.sign(pl.x - e.x) || 1; e.mode = 'rec'; e.st = 0; e.recT = 0.5; }
        return true;
      }
      return false;
    },
    pose(e) {
      if (e.mode === 'atk' && e.act === 'bell') return POSES.meditate;
      if (e.act === 'sweep' && e.mode !== 'move') return e.mode === 'wind' ? POSES.bigW : POSES.slash;
      return null;
    },
    draw(e, J) {
      const s = e.s; // prayer beads at the throat
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = e.alpha * GA; ctx.fillStyle = '#5b3a24'; ctx.strokeStyle = 'rgba(255,214,140,0.8)'; ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; ctx.beginPath(); ctx.arc(J.neck.x + Math.cos(a) * 9 * s, J.neck.y + 6 * s + Math.sin(a) * 5 * s, 2.4 * s, 0, TAU); ctx.fill(); ctx.stroke(); }
      if (e.bellT > 0 && !e.dead) { // golden bell drawn round the body
        const cx = e.x, top = e.y - 150 * s, k = Math.min(1, (2.6 - e.bellT) / 0.2, e.bellT / 0.3);
        ctx.globalCompositeOperation = 'lighter'; glow(cx, e.y - 70 * s, 120 * s, C.gold, 0.35 * k);
        ctx.globalAlpha = 0.85 * k * GA; ctx.strokeStyle = 'rgb(255,214,120)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx - 10 * s, top); ctx.lineTo(cx + 10 * s, top); ctx.lineTo(cx + 14 * s, top + 16 * s);
        ctx.quadraticCurveTo(cx + 54 * s, top + 24 * s, cx + 58 * s, e.y + 4); ctx.lineTo(cx - 58 * s, e.y + 4);
        ctx.quadraticCurveTo(cx - 54 * s, top + 24 * s, cx - 14 * s, top + 16 * s); ctx.closePath(); ctx.stroke();
        ctx.globalAlpha = 0.12 * k * GA; ctx.fillStyle = 'rgb(255,200,90)'; ctx.fill();
        ctx.globalAlpha = 0.6 * k * GA; ctx.beginPath(); ctx.moveTo(cx - 52 * s, e.y - 30 * s); ctx.lineTo(cx + 52 * s, e.y - 30 * s); ctx.moveTo(cx - 40 * s, top + 50 * s); ctx.lineTo(cx + 40 * s, top + 50 * s); ctx.stroke();
      }
    },
  },

  iceboss: { // 冰魄仙姬: fans of ice shards, falling icicles, and a line of frost spikes racing across the ground
    wind: { shards: 0.45, icefall: 0.6, frost: 0.55 },
    think(e, adx, r) { e.begin(r < 0.4 ? 'shards' : r < 0.7 ? 'icefall' : 'frost'); return true; },
    tick(e, dt) {
      if (Math.random() < dt * 14) spawn({ x: e.x + rand(-40, 40), y: e.y - rand(0, 150), vx: rand(-30, 30), vy: rand(-40, 20), life: rand(0.6, 1.1), size: rand(1.2, 2.4), col: [230, 245, 255], kind: 'snow', drag: 1, rot: rand(0, 9) });
    },
    fire(e, k, pl) {
      const J = e.J;
      if (k === 'shards') {
        const a0 = Math.atan2(pl.y - 50 - J.h1.y, pl.x - J.h1.x), v = 700 * DIFF.shot;
        for (const da of [-0.14, 0, 0.14]) game.shots.push(new Shot(J.h1.x, J.h1.y, Math.cos(a0 + da) * v, Math.sin(a0 + da) * v, 'shard'));
        burst(J.h1.x, J.h1.y, 10, ICE, 220); sfx('dart'); e.mode = 'rec'; e.recT = 0.45; return true;
      }
      if (k === 'icefall') {
        for (let i = 0; i < 10; i++) game.rain.push({ x: clamp(pl.x + rand(-220, 220), 30, WORLD_W - 30), t: 0.7 + i * 0.07, fired: false, kind: 'ice' });
        ring(e.x, e.y - 100 * e.s, 10, 90, 0.4, ICE, 5); sfx('charge'); e.mode = 'rec'; e.recT = 0.6; return true;
      }
      if (k === 'frost') {
        const dir = Math.sign(pl.x - e.x) || e.face;
        for (let i = 1; i <= 9; i++) game.rain.push({ x: clamp(e.x + dir * (40 + i * 55), 20, WORLD_W - 20), t: 0.25 + i * 0.09, fired: false, kind: 'spike' });
        ring(e.x, GROUND, 10, 120, 0.4, ICE, 6, { flat: 0.3 }); sfx('boom'); e.mode = 'rec'; e.recT = 0.7; return true;
      }
      return false;
    },
    pose(e) {
      if (e.mode === 'wind') return e.act === 'icefall' ? POSES.raise : e.act === 'frost' ? POSES.gather : POSES.throwW;
      if (e.mode === 'rec') return e.act === 'frost' ? POSES.slam : e.act === 'icefall' ? POSES.raise : POSES.throw;
      return null;
    },
    draw(e, J) {
      if (e.dead) return;
      const k = e.mode === 'wind' ? clamp(e.st / e.windT, 0, 1) : 0;
      ctx.globalCompositeOperation = 'lighter';
      glow(J.h1.x, J.h1.y, (12 + 26 * k) * e.s, ICE, 0.5 + 0.5 * k); glow(J.h2.x, J.h2.y, (10 + 18 * k) * e.s, ICE, 0.4 + 0.4 * k);
    },
  },

  boss: { // 血魔老祖: below half health he shows his true form, faster, and throws rings of blood orbs
    wind: { ring: 0.6 },
    tick(e) {
      if (e.phase2 || e.hp >= e.maxHp * 0.5) return;
      e.phase2 = true; e.spdMul = 1.35; e.cdMul = 0.6; e.armorT = 1.2;
      banner('血魔真身', 'Huyết Ma Lão Tổ hiện chân thân', 'foe'); flash(0.5, '226,72,63'); shake(18); sfx('roar');
      ring(e.x, e.y - 70 * e.s, 20, 260, 0.6, C.blood, 10);
    },
    think(e, adx, r) { if (e.phase2 && r < 0.3) { e.begin('ring'); return true; } return false; },
    fire(e, k) {
      if (k !== 'ring') return false;
      const cy = e.y - 70 * e.s, v = 380 * DIFF.shot;
      for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; game.shots.push(new Shot(e.x + Math.cos(a) * 30, cy + Math.sin(a) * 30, Math.cos(a) * v, Math.sin(a) * v, 'orb', 12)); }
      sfx('roar'); shake(10); e.mode = 'rec'; e.recT = 0.6; return true;
    },
    pose(e) { return e.act === 'ring' && e.mode !== 'move' ? (e.mode === 'wind' ? POSES.gather : POSES.raise) : null; },
    draw(e, J) { if (e.phase2 && !e.dead) { ctx.globalCompositeOperation = 'lighter'; glow(e.x, e.y - 60 * e.s, 110 * e.s, C.blood, 0.25 + 0.1 * Math.sin(T * 8)); } },
  },
};
