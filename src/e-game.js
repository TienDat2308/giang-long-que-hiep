
// ---------- game state ----------
const game = {
  state: 'menu', wave: 0, score: 0, best: 0, enemies: [], dragons: [], shots: [], debris: [], rain: [], queue: [], spawnT: 0, waveT: 0, waveClear: false,
  combo: 0, comboT: 0, slow: 1, slowT: 0, ultOn: false, ultDark: 0, ultCount: 0, overT: 0, boss: null, player: null, demoT: 1.2, demoI: 0,
  mode: 'campaign', chapter: 0, stage: 0, chapterScore: 0, startTime: 0, fade: 0, mapCycleT: 8,
};
// modes: Phá đảo walks the five maps in order (three waves and a boss each); Sinh tồn is endless, changing map every five waves
const MODES = {
  campaign: { name: 'Phá đảo', note: 'Năm hồi, năm cảnh: Rừng Trúc, Thiền Viện, Tuyết Sơn, Lạc Nhật Cổ Thành, Huyết Ma Cung. Mỗi hồi ba đợt địch rồi một trùm. Thua thì đấu lại đúng hồi đang dở.' },
  endless: { name: 'Sinh tồn', note: 'Đánh đến khi gục, địch mạnh dần. Cứ năm đợt đổi cảnh và gặp một trùm. Tính điểm kỷ lục.' },
};
const STAGES = 4; // per chapter: three waves, then the boss
try { const m = localStorage.getItem('glqh-mode'); if (MODES[m]) game.mode = m; } catch (e) {}
// difficulty: multipliers on foes (hp, damage, attack cooldown, wind-up, numbers) and on the hero's recovery
const DIFFS = {
  easy: { name: 'Dễ', note: 'Địch chậm và thưa, hồi nhiều sinh lực sau mỗi đợt. Hợp để luyện chiêu.', hp: 1, boss: 1, dmg: 1, cd: 1, wind: 1, count: 1, conc: 0, heal: 0.25, chi: 4.5, chiHit: 3, poise: 99, inv: 0.8, shot: 1, score: 0.8 },
  normal: { name: 'Vừa', note: 'Địch đông, đánh dồn và báo đòn ngắn hơn. Bị đánh liên tục, địch sẽ phá thế phản đòn.', hp: 1.35, boss: 1.3, dmg: 1.5, cd: 0.7, wind: 0.88, count: 1.3, conc: 1, heal: 0.15, chi: 3.2, chiHit: 2.5, poise: 6, inv: 0.65, shot: 1.12, score: 1 },
  hard: { name: 'Khó', note: 'Địch đánh đau gấp đôi, phá thế sau bốn đòn, ít hồi sinh lực, nội lực hồi chậm. Điểm nhân 1,5.', hp: 1.7, boss: 1.6, dmg: 2, cd: 0.5, wind: 0.78, count: 1.6, conc: 2, heal: 0.1, chi: 2.4, chiHit: 2, poise: 4, inv: 0.5, shot: 1.25, score: 1.5 },
};
let DIFF = DIFFS.normal;
game.diff = 'normal';
try { const d = localStorage.getItem('glqh-diff'); if (DIFFS[d]) { game.diff = d; DIFF = DIFFS[d]; } } catch (e) {}
const bestKey = () => (game.mode === 'campaign' ? 'glqh-best-campaign-' : 'glqh-best-') + game.diff;
function loadBest() { try { game.best = +localStorage.getItem(bestKey()) || 0; } catch (e) { game.best = 0; } }
const clearedHere = () => { try { return localStorage.getItem('glqh-clear-' + game.diff) === '1'; } catch (e) { return false; } };
function saveBest() { if (game.score > game.best) { game.best = game.score; try { localStorage.setItem(bestKey(), game.best); } catch (e) {} } }
loadBest();
const HD = '〇一二三四五六七八九';
function han(n) {
  if (n < 10) return HD[n];
  if (n === 10) return '十';
  if (n < 20) return '十' + HD[n - 10];
  const r = n % 10; return HD[Math.floor(n / 10) % 10] + '十' + (r ? HD[r] : '');
}
const fmt = n => n.toLocaleString('vi-VN');

function banner(hanTxt, viet, cls = '') {
  if (game.state === 'menu') return;
  const b = $('banner');
  b.querySelector('.han').textContent = hanTxt; b.querySelector('.viet').textContent = viet;
  b.className = ''; void b.offsetWidth; b.className = ('show ' + cls).trim();
}

function hit(e, dmg, kbx, kby, stun, o = {}) {
  if (e.dead) return false;
  const pl = game.player;
  if (e.bellT > 0 && !o.pierce) { // 金鐘罩: the golden bell turns every blow aside
    sparks(e.x, e.y - 60 * e.s, Math.sign(kbx) || 1, 8, C.gold); hitstop(0.03);
    const now = performance.now();
    if (now - (game.lastClang || 0) > 160) { game.lastClang = now; sfx('clang'); popText(e.x, e.y - 160 * e.s, 'Vô hiệu', '#ffd27a', 16); }
    return false;
  }
  e.hp -= dmg; e.flashT = 0.1;
  let armored = !o.big && ((e.d.armor && (e.mode === 'wind' || e.mode === 'atk')) || e.armorT > 0);
  if (!armored && !o.big && !e.d.boss) { // 破勢: a foe kept in hitstun too long breaks free and counters at once
    e.poise = (e.poiseT > 0 ? e.poise : 0) + 1; e.poiseT = 1.1;
    if (e.poise >= DIFF.poise && e.hp > 0) {
      e.poise = 0; e.armorT = 0.8; armored = true; e.stun = 0; e.mode = 'move'; e.st = 0; e.cd = 0;
      ring(e.x, e.y - 50 * e.s, 10, 80, 0.3, C.blood, 6); popText(e.x, e.y - 125 * e.s, 'Phá thế!', '#ff6d62', 20);
    }
  }
  const kbm = e.d.boss ? 0.35 : e.d.smash ? 0.6 : 1;
  if (!armored) {
    e.vx = kbx * kbm; if (kby < 0) e.vy = kby * kbm; else if (!e.ground) e.vy = Math.max(e.vy, kby);
    e.stun = stun * (e.d.boss ? 0.4 : 1); e.mode = 'hurt'; e.st = 0; e.slamming = false; e.trail.length = 0;
    if (kby * kbm < -200) e.ground = false;
    if (kby * kbm < -380 && !e.d.boss) { e.tumble = -(Math.sign(kbx) || 1) * e.face * rand(9, 13); e.tumbleR = e.pose.rot; } // launched foes somersault
  }
  const cx = e.x, cy = e.y - 50 * e.s, dir = Math.sign(kbx) || 1;
  spawn({ x: cx, y: cy, kind: 'flare', size: o.big ? 58 : 32, life: 0.16, col: o.big ? [255, 226, 150] : C.white, rot: rand(0, Math.PI), drag: 0 });
  if (o.big) FX.zoom = Math.max(FX.zoom, 0.045);
  if (o.dragon) { // a dragon striking home explodes on the target
    ring(cx, cy, 10, 125, 0.42, C.gold, 10); ring(cx, cy, 6, 70, 0.3, C.white, 4);
    spawn({ x: cx, y: cy, kind: 'flare', size: 115, life: 0.26, col: [255, 230, 160], rot: rand(0, 3), drag: 0 });
    burst(cx, cy, 18, C.gold, 520); sparks(cx, cy, dir, 14, C.gold);
    shake(11); FX.zoom = Math.max(FX.zoom, 0.06);
    const now = performance.now(); if (now - (game.lastBoom || 0) > 120) { sfx('boom'); game.lastBoom = now; }
  }
  sparks(cx, cy, dir, o.big ? 16 : 8, o.big ? C.gold : C.white);
  burst(cx, cy, o.big ? 10 : 4, C.gold, o.big ? 300 : 160);
  ring(cx, cy, 4, o.big ? 62 : 30, 0.22, C.white, 3);
  popText(cx + rand(-10, 10), cy - 34, dmg, o.big ? '#ffd27a' : '#efe6d2', o.big ? 30 : 21);
  hitstop(o.dragon ? (game.ultOn ? 0.045 : 0.09) : o.big ? 0.07 : 0.035); shake(o.big ? 9 : 3); sfx(o.big ? 'heavy' : 'hit');
  game.combo++; game.comboT = 2.2;
  pl.chi = Math.min(pl.maxChi, pl.chi + (o.chi ?? DIFF.chiHit));
  if (e.hp <= 0) kill(e, kbx, kby);
  return true;
}
function kill(e, kbx, kby) {
  e.dead = true; e.deadT = 0; e.hp = 0; e.mode = 'dead'; e.stun = 0;
  e.vx = (kbx || 0) * (e.d.boss ? 0.6 : 1.1); e.vy = Math.min(-420, kby * 1.2); e.ground = false;
  e.spin = (Math.sign(kbx) || 1) * rand(8, 14) * e.face;
  if (e.d.weapon && e.J) { // the weapon flies out of the hand
    const b = bladeOf(e);
    game.debris.push({ kind: e.d.weapon, x: b.x, y: b.y, a: b.a, vx: e.vx * 0.4 + rand(-140, 140), vy: rand(-680, -380), vr: rand(-16, 16), face: e.face, s: e.s, t: 0, rest: false });
  }
  const mult = (1 + Math.min(game.combo, 50) * 0.04) * DIFF.score;
  game.score += Math.round(e.d.score * mult);
  burst(e.x, e.y - 50 * e.s, 14, e.d.c, 300);
  if (e.d.boss) {
    game.slow = 0.25; game.slowT = 1.2; flash(0.5, '255,246,222'); shake(18); sfx('gong');
    banner('勝', e.d.name + ' bại trận'); game.boss = null; game.rain = [];
  }
}
function hurtPlayer(dmg, dir) {
  const p = game.player;
  if (game.state !== 'play' || p.inv > 0 || p.state === 'ult' || p.state === 'dead' || p.state === 'dash') return;
  dmg = Math.round(dmg * DIFF.dmg);
  p.hp -= dmg; p.inv = DIFF.inv; p.flashT = 0.1;
  flash(0.22, '226,72,63'); FX.vig = 0.9; shake(8); sfx('hurt'); hitstop(0.05);
  spawn({ x: p.x, y: p.y - 55, kind: 'flare', arms: 1, size: 72, life: 0.22, col: [255, 150, 140], rot: dir > 0 ? 0.6 : -0.6, drag: 0 });
  sparks(p.x, p.y - 55, dir, 10, C.blood);
  popText(p.x, p.y - 104, '−' + dmg, '#ff7a6e', 22);
  game.combo = 0; game.comboT = 0;
  if (p.state !== 'skill') { p.setState('hurt'); p.atk = null; p.vx = dir * 320; p.vy = -260; p.ground = false; p.flip = 0; p.pose.rot = 0; }
  if (p.hp <= 0) { p.hp = 0; p.setState('dead'); p.sk = null; p.lying = true; p.vx = dir * 380; p.vy = -380; gameOver(); }
}
function gameOver() {
  game.state = 'over'; game.slow = 0.3; game.slowT = 1.2; game.overT = 1.7; game.ultOn = false;
  saveBest();
  banner('敗', 'Que Hiệp gục ngã', 'foe');
  for (const a in keys) keys[a] = false;
}
function winGame() {
  game.state = 'win'; game.overT = 2.4; game.winTime = (performance.now() - game.startTime) / 1000;
  saveBest(); try { localStorage.setItem('glqh-clear-' + game.diff, '1'); } catch (e) {}
  banner('天下無敵', 'Phá đảo! Huyết Ma giáo tan rã'); flash(0.6, '255,236,190'); sfx('gong');
  for (const a in keys) keys[a] = false;
}

// ---------- waves ----------
// a foe drawn from the current map's mix, e.g. bamboo forest: mostly swordsmen and dart throwers
function pickFoe() {
  const mix = Object.entries(MAP.mix), total = mix.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [type, w] of mix) if ((r -= w) <= 0) return type;
  return 'thug';
}
function startWave(n) {
  game.wave = n; game.waveClear = false; game.spawnT = 1.2;
  const camp = game.mode === 'campaign', boss = camp ? game.stage === STAGES - 1 : n % 5 === 0, q = [];
  if (boss) {
    q.push(MAP.boss); for (let i = 0; i < 1 + Math.floor(n / 5); i++) q.push('thug');
    if (n >= 8) q.push(pickFoe(), pickFoe());
  } else for (let i = 0, total = Math.round((3 + n * 0.9) * DIFF.count); i < total; i++) q.push(pickFoe());
  game.queue = q;
  const where = camp ? `Hồi ${game.chapter + 1}/5 · ${boss ? 'Trùm' : `Đợt ${game.stage + 1}/3`}` : `Đợt ${n} · ${MAP.name}`;
  $('wave').textContent = where;
  if (camp && game.stage === 0) banner('第' + han(game.chapter + 1) + '回 · ' + MAP.han, `Hồi ${game.chapter + 1}: ${MAP.name}`);
  else if (boss) banner('決戰', `${MAP.name} · ${ETYPES[MAP.boss].name} giáng thế`, 'foe');
  else banner('第' + han(camp ? game.stage + 1 : n) + '陣', camp ? `${MAP.name} · đợt ${game.stage + 1}` : 'Đợt ' + n);
}
// switch scene: clear the field, put the hero back in the middle and fade in
function changeMap(i) {
  setMap(i); game.fade = 1;
  game.enemies = []; game.shots = []; game.debris = []; game.rain = []; game.dragons = []; FX.parts = []; FX.ghosts = [];
  const pl = game.player; pl.x = WORLD_W / 2; pl.y = pl.prevY = GROUND; pl.vx = pl.vy = 0; pl.ground = true;
  camera(10);
}
function enterChapter(c) {
  game.chapter = c; game.stage = 0; game.chapterScore = game.score;
  changeMap(c); startWave(c * STAGES + 1);
}
function nextWave() {
  if (game.mode === 'campaign') {
    if (game.stage < STAGES - 1) { game.stage++; startWave(game.wave + 1); }
    else if (game.chapter < MAPS.length - 1) enterChapter(game.chapter + 1);
    else winGame();
    return;
  }
  const n = game.wave + 1, mi = Math.floor((n - 1) / 5) % MAPS.length;
  if (MAPS[mi] !== MAP) changeMap(mi);
  startWave(n);
}
function spawnEnemy(type) {
  const pl = game.player, alive = game.enemies.filter(e => !e.dead);
  const left = alive.filter(e => e.x < pl.x).length, right = alive.length - left;
  let side = Math.random() < 0.5 ? -1 : 1;
  if (left > right + 1) side = 1; else if (right > left + 1) side = -1;
  const isBoss = ETYPES[type].boss;
  let x = side < 0 ? view.camX - 60 : view.camX + view.w + 60, y = GROUND;
  if (x < 40 || x > WORLD_W - 40 || isBoss) { x = clamp(isBoss ? pl.x + side * 330 : x, 60, WORLD_W - 60); y = GROUND - 540; }
  const e = new Enemy(x, y, type); e.face = pl.x > x ? 1 : -1;
  if (y < GROUND) { e.flip = 1; e.flipT = 0; e.flipDur = 0.5; }
  game.enemies.push(e);
  if (isBoss) { banner(e.d.han, e.d.name, 'foe'); sfx('gong'); game.boss = e; $('bossName').textContent = e.d.name; }
}
function waves(dt) {
  const alive = game.enemies.filter(e => !e.dead).length, pl = game.player;
  if (game.queue.length) {
    game.spawnT -= dt;
    if (game.spawnT <= 0 && alive < Math.min(7 + DIFF.conc, 3 + DIFF.conc + Math.floor(game.wave / 2)) && !game.ultOn) { spawnEnemy(game.queue.shift()); game.spawnT = rand(0.5, 1.3) * (DIFF.cd + 1) / 2; }
  } else if (!alive && !game.waveClear) {
    const chapterDone = game.mode === 'campaign' && game.stage === STAGES - 1;
    game.waveClear = true; game.waveT = chapterDone ? 3.4 : 2.8;
    pl.hp = Math.min(pl.maxHp, pl.hp + pl.maxHp * (chapterDone ? 0.5 : DIFF.heal)); pl.chi = Math.min(pl.maxChi, pl.chi + 30);
    if (chapterDone && game.chapter === MAPS.length - 1) game.waveT = 1.2;
    else if (chapterDone) banner('勝', `Qua hồi ${game.chapter + 1}: ${MAP.name}`);
    else banner('勝', 'Dẹp yên đợt · hồi sinh lực');
    popText(pl.x, pl.y - 112, '+ sinh lực', '#7fe0b9', 18);
  } else if (game.waveClear) { game.waveT -= dt; if (game.waveT <= 0) nextWave(); }
}

// ---------- screens ----------
const overlay = $('overlay');
function showScreen(kind) {
  for (const el of overlay.querySelectorAll('[data-screen]')) el.hidden = el.dataset.screen !== kind;
  overlay.hidden = false;
  const camp = game.mode === 'campaign';
  if (kind === 'over') {
    $('ovDiff').textContent = `${MODES[game.mode].name} · ${DIFF.name}`; $('ovScore').textContent = fmt(game.score); $('ovBest').textContent = fmt(game.best);
    $('ovWave').textContent = camp ? `hồi ${game.chapter + 1} · ${MAP.name}` : `đợt ${game.wave}`;
    $('retryBtn').hidden = !camp;
  }
  if (kind === 'win') {
    const t = Math.round(game.winTime || 0);
    $('wnDiff').textContent = DIFF.name; $('wnTime').textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    $('wnScore').textContent = fmt(game.score); $('wnBest').textContent = fmt(game.best);
  }
  if (kind === 'menu') { $('best').textContent = fmt(game.best); $('clearMark').hidden = !clearedHere(); }
  const b = overlay.querySelector(`[data-screen="${kind}"] .cta:not([hidden])`); if (b) b.focus({ preventScroll: true });
}
// chapter/score let "Đấu lại hồi này" restart the campaign at the chapter that was lost, with that chapter's starting score
function newGame(chapter = 0, score = 0) {
  audioInit(); sfx('gong');
  FX.rings = []; FX.texts = [];
  game.score = score; game.combo = 0; game.comboT = 0; game.slow = 1; game.slowT = 0; game.ultOn = false; game.boss = null;
  for (const a in keys) keys[a] = false; for (const a in buf) buf[a] = 0;
  game.player = new Player(WORLD_W / 2); game.state = 'play';
  if (!chapter) game.startTime = performance.now();
  overlay.hidden = true; document.body.classList.add('playing'); hudCache = {};
  if (game.mode === 'campaign') enterChapter(chapter);
  else { changeMap(0); startWave(1); }
  if (document.activeElement) document.activeElement.blur();
}
const retryChapter = () => newGame(game.chapter, game.chapterScore);
function togglePause() {
  if (game.state === 'play') { game.state = 'pause'; for (const a in keys) keys[a] = false; showScreen('pause'); }
  else if (game.state === 'pause') { game.state = 'play'; overlay.hidden = true; last = performance.now(); if (document.activeElement) document.activeElement.blur(); }
}
function setDiff(d) {
  game.diff = d; DIFF = DIFFS[d]; loadBest();
  try { localStorage.setItem('glqh-diff', d); } catch (e) {}
  for (const b of document.querySelectorAll('[data-diff]')) b.setAttribute('aria-checked', b.dataset.diff === d ? 'true' : 'false');
  $('diffNote').textContent = DIFF.note; $('best').textContent = fmt(game.best); $('clearMark').hidden = !clearedHere();
}
function setMode(m) {
  game.mode = m; loadBest();
  try { localStorage.setItem('glqh-mode', m); } catch (e) {}
  for (const b of document.querySelectorAll('[data-mode]')) b.setAttribute('aria-checked', b.dataset.mode === m ? 'true' : 'false');
  $('modeNote').textContent = MODES[m].note; $('best').textContent = fmt(game.best);
}
function toMenu() {
  game.state = 'menu'; document.body.classList.remove('playing');
  game.boss = null; game.ultOn = false; game.slow = 1; game.slowT = 0; game.mapCycleT = 8;
  game.player = new Player(WORLD_W / 2); game.player.face = -1; changeMap(MAPS.indexOf(MAP)); showScreen('menu');
}
document.querySelectorAll('[data-diff]').forEach(b => b.addEventListener('click', () => setDiff(b.dataset.diff)));
document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
for (const id of ['menuBtn', 'quitBtn', 'winMenuBtn']) $(id).addEventListener('click', toMenu);
$('startBtn').addEventListener('click', () => newGame());
$('againBtn').addEventListener('click', () => newGame());
$('winAgainBtn').addEventListener('click', () => newGame());
$('retryBtn').addEventListener('click', retryChapter);
$('resumeBtn').addEventListener('click', togglePause);
$('pauseBtn').addEventListener('click', e => { e.currentTarget.blur(); togglePause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && game.state === 'play') togglePause(); });

// ---------- HUD ----------
const HUD = { hp: $('hpFill'), chi: $('chiFill'), chiBar: $('chiBar'), chiNum: $('chiNum'), score: $('score'), combo: $('combo'), comboN: $('comboN'), boss: $('bossBar'), bossFill: $('bossFill'), costs: [...document.querySelectorAll('[data-cost]')] };
let hudCache = {};
function hud() {
  const pl = game.player;
  HUD.hp.style.transform = `scaleX(${pl.hp / pl.maxHp})`;
  HUD.chi.style.transform = `scaleX(${pl.chi / pl.maxChi})`;
  const c = Math.floor(pl.chi);
  if (c !== hudCache.c) { hudCache.c = c; HUD.chiNum.textContent = c; HUD.chiBar.classList.toggle('full', c >= 100); for (const el of HUD.costs) el.classList.toggle('ready', pl.chi >= +el.dataset.cost); }
  if (game.score !== hudCache.s) { hudCache.s = game.score; HUD.score.textContent = fmt(game.score); }
  if (game.combo !== hudCache.cb) {
    hudCache.cb = game.combo; HUD.combo.hidden = game.combo < 2; HUD.comboN.textContent = game.combo;
    HUD.combo.classList.remove('bump'); void HUD.combo.offsetWidth; HUD.combo.classList.add('bump');
  }
  const b = game.boss && !game.boss.dead ? game.boss : null;
  HUD.boss.hidden = !b; if (b) HUD.bossFill.style.transform = `scaleX(${Math.max(0, b.hp / b.maxHp)})`;
}

// ---------- loop ----------
function camera(rdt) {
  const pl = game.player, menu = game.state === 'menu';
  // look-ahead eases toward the facing side instead of jumping when the hero turns
  view.look += ((menu ? 0 : pl.face * view.w * 0.07) - view.look) * (1 - Math.exp(-2.2 * rdt));
  let tx = pl.x - view.w * (menu ? 0.64 : 0.5) + view.look;
  tx = view.w >= WORLD_W ? (WORLD_W - view.w) / 2 : clamp(tx, 0, WORLD_W - view.w);
  const base = GROUND + (document.body.classList.contains('touch') ? 105 : 92) - view.h;
  const ty = Math.min(base, pl.y - view.h * 0.42);
  if (!isFinite(view.camX) || !isFinite(view.camY)) { view.camX = tx; view.camY = ty; view.look = 0; } // recover from a bad frame instead of staying broken
  view.camX += (tx - view.camX) * (1 - Math.exp(-5 * rdt)); view.camY += (ty - view.camY) * (1 - Math.exp(-3.5 * rdt));
}
function demo(dt) {
  const pl = game.player; pl.chi = pl.maxChi; pl.face = -1;
  game.demoT -= dt;
  if (game.demoT <= 0 && pl.state === 'idle' && pl.ground) {
    const seq = ['s1', 'jump', 's4', 'fly', 'attack', 's5', 'leap', 's3', 's2'], a = seq[game.demoI++ % seq.length];
    if (a === 'fly') { buf.dash = 0.16; setTimeout(() => { buf.attack = 0.16; }, 60); } // dash into the flying side kick
    else if (a === 'leap') { buf.jump = 0.16; setTimeout(() => { buf.attack = 0.16; }, 90); } // scissor kick on the way up
    else { const rep = a === 'jump' ? 3 : a === 'attack' ? 4 : 1; for (let i = 0; i < rep; i++) setTimeout(() => { buf[a] = 0.16; }, i * (a === 'jump' ? 260 : 170)); }
    game.demoT = a === 's2' ? 2.4 : 2.0;
  }
}
function update(dt, rdt) {
  const pl = game.player;
  if (game.state === 'menu') {
    demo(rdt);
    if ((game.mapCycleT -= rdt) <= 0 && pl.state === 'idle') { game.mapCycleT = 8; changeMap(MAPS.indexOf(MAP) + 1); } // the title screen tours the five scenes
  }
  game.fade = Math.max(0, game.fade - rdt * 1.1);
  pl.update(dt);
  const edt = dt * (game.ultOn ? 0.1 : 1), es = game.enemies;
  for (const e of es) e.update(edt, pl);
  for (let i = 0; i < es.length; i++) for (let j = i + 1; j < es.length; j++) {
    const a = es[i], b = es[j]; if (a.dead || b.dead) continue;
    const dx = b.x - a.x, m = 26 * Math.max(a.s, b.s);
    if (Math.abs(dx) < m && Math.abs(a.y - b.y) < 40) { const push = (m - Math.abs(dx)) * 0.25 * (Math.sign(dx) || 1); a.x -= push; b.x += push; }
  }
  for (const d of game.dragons) d.update(dt);
  for (const s of game.shots) s.update(edt, pl);
  for (const r of game.rain) {
    r.t -= edt;
    if (r.fired || r.t > 0) continue;
    r.fired = true;
    if (r.kind === 'ice') game.shots.push(new Shot(r.x, view.camY - 40, 0, 1150 * DIFF.shot, 'ice'));
    else if (r.kind === 'spike') game.shots.push(new Shot(r.x, GROUND - 24, 0, 0, 'spike'));
    else game.shots.push(new Shot(r.x - 45, view.camY - 40, 110, 1250, 'arrow', 12));
  }
  game.rain = game.rain.filter(r => r.t > -0.6);
  for (const w of game.debris) {
    w.t += dt; if (w.rest) continue;
    w.vy += 2300 * dt; w.x += w.vx * dt; w.y += w.vy * dt; w.a += w.vr * dt;
    if (w.y >= GROUND - 3) {
      w.y = GROUND - 3; if (w.vy > 220) { sfx('clang'); sparks(w.x, w.y, 0, 5, C.white); }
      w.vy *= -0.35; w.vx *= 0.5; w.vr *= 0.5;
      if (Math.abs(w.vy) < 90) { w.rest = true; w.a = Math.cos(w.a) >= 0 ? 0.04 : Math.PI - 0.04; }
    }
  }
  game.debris = game.debris.filter(w => w.t < 3.4);
  game.enemies = es.filter(e => !e.gone); game.dragons = game.dragons.filter(d => !d.dead); game.shots = game.shots.filter(s => !s.dead);
  if (game.state === 'play') waves(dt);
  if (game.state === 'over' || game.state === 'win') { game.overT -= rdt; if (game.overT <= 0 && overlay.hidden) showScreen(game.state); }
  if (game.comboT > 0) { game.comboT -= dt; if (game.comboT <= 0) game.combo = 0; }
  game.ultDark = approach(game.ultDark, game.ultOn ? 1 : 0, rdt * 3);
  updateFX(dt > 0 ? dt : rdt * 0.1);
  MAP.ambient(rdt);
  camera(rdt);
  view.shake *= Math.exp(-9 * rdt); if (view.shake < 0.1) view.shake = 0;
  FX.flash = Math.max(0, FX.flash - rdt * 2.2); FX.vig = Math.max(0, FX.vig - rdt * 1.5);
  FX.zoom = RM ? 0 : FX.zoom * Math.exp(-7 * rdt);
}
// moonlit wet stone: everything mirrored under the ground line, fading with depth
function drawReflections() {
  ctx.save();
  ctx.beginPath(); ctx.rect(view.camX - 60, GROUND, view.w + 120, 150); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  ctx.save(); ctx.translate(view.camX * 0.98 + view.w * MAP.orb[0], GROUND + 60); ctx.scale(0.4, 1.7); glow(0, 0, 60, MAP.orb[1], 0.13, false); ctx.restore();
  ctx.translate(0, GROUND * 2); ctx.scale(1, -1);
  REFLECT = true; GA = MAP.refl;
  if (MAP.lamp) for (const p of PLATFORMS) { const L = lanternPos(p); glow(L.x, L.y, 44, MAP.lamp, 0.7, false); }
  ctx.globalCompositeOperation = 'source-over';
  for (const e of game.enemies) e.draw();
  game.player.draw();
  GA = MAP.refl * 0.65; for (const d of game.dragons) d.draw();
  GA = 1; REFLECT = false;
  ctx.restore();
  const g = ctx.createLinearGradient(0, GROUND, 0, GROUND + 150);
  g.addColorStop(0, rgba(MAP.fade, 0)); g.addColorStop(1, rgba(MAP.fade, 0.95));
  ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(view.camX - 60, GROUND, view.w + 120, 150);
}
function drawDebris() {
  for (const w of game.debris) {
    ctx.globalAlpha = clamp((3.4 - w.t) / 0.6, 0, 1);
    drawWeapon(w.kind, w.x, w.y, w.a, w.s, w.face);
  }
  ctx.globalAlpha = 1;
}
function shadow(f) {
  let gy = GROUND;
  for (const p of PLATFORMS) if (f.x > p.x && f.x < p.x + p.w && p.y >= f.y - 2 && p.y < gy) gy = p.y;
  const a = clamp(1 - (gy - f.y) / 300, 0, 1) * 0.45 * f.alpha; if (a <= 0.01) return;
  ctx.globalAlpha = 1; ctx.fillStyle = `rgba(0,0,0,${a})`;
  ctx.beginPath(); ctx.ellipse(f.x, gy + 1, 22 * f.s * (0.5 + a), 4.5 * f.s, 0, 0, TAU); ctx.fill();
}
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  drawBackground();
  const s = view.dpr * view.scale, sh = view.shake, ox = sh ? rand(-sh, sh) : 0, oy = sh ? rand(-sh, sh) : 0;
  const z = FX.zoom, sz = s * (1 + z);
  ctx.setTransform(sz, 0, 0, sz, (-view.camX + ox) * sz - view.w / 2 * s * z, (-view.camY + oy) * sz - view.h * 0.6 * s * z);
  drawGround(drawReflections); drawPlatforms();
  ctx.lineWidth = 2; // where the arrow rain, icicles or frost spikes will land
  for (const r of game.rain) {
    ctx.strokeStyle = r.kind ? '#8fd8ff' : '#ff6a4a';
    ctx.globalAlpha = r.fired ? 0.45 : clamp(1 - r.t / 0.9, 0.15, 0.75) * (0.75 + 0.25 * Math.sin(T * 24));
    ctx.beginPath(); ctx.ellipse(r.x, GROUND + 2, 17, 4.5, 0, 0, TAU); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  if (game.ultDark > 0) {
    ctx.globalAlpha = 1; ctx.fillStyle = `rgba(6,4,12,${0.62 * game.ultDark})`;
    ctx.fillRect(view.camX - 60, view.camY - 60, view.w + 120, view.h + 120);
    if (game.ultCount > 0) {
      ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `${Math.round(view.h * 0.42)}px "Ma Shan Zheng", KaiTi, serif`;
      ctx.fillStyle = `rgba(242,181,68,${0.2 * game.ultDark})`;
      ctx.fillText(han(game.ultCount), view.camX + view.w / 2, view.camY + view.h * 0.46);
      ctx.restore();
    }
  }
  const pl = game.player;
  for (const e of game.enemies) shadow(e);
  shadow(pl);
  drawSoftFX(); drawDebris(); drawGhosts();
  for (const e of game.enemies) e.draw();
  pl.draw();
  for (const x of game.shots) x.draw();
  for (const d of game.dragons) d.draw();
  drawFX(); drawTexts();
  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const W = cv.width / view.dpr, H = cv.height / view.dpr;
  if (game.ultDark > 0) { const bh = H * 0.09 * game.ultDark; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh); }
  const low = game.state === 'play' && pl.hp < pl.maxHp * 0.3 ? 0.35 + 0.15 * Math.sin(T * 6) : 0, v = Math.max(FX.vig, low);
  if (v > 0) {
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.72);
    g.addColorStop(0, 'rgba(226,72,63,0)'); g.addColorStop(1, `rgba(226,72,63,${0.45 * v})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  if (FX.flash > 0) { ctx.fillStyle = `rgba(${FX.flashCol},${FX.flash * 0.5})`; ctx.fillRect(0, 0, W, H); }
  if (game.fade > 0) { ctx.fillStyle = `rgba(5,3,8,${Math.min(1, game.fade * 1.4)})`; ctx.fillRect(0, 0, W, H); } // fade in after a scene change
}
let last = performance.now();
function frame(now) {
  const rdt = Math.min(0.033, Math.max(0, (now - last) / 1000)); last = now;
  if (game.state !== 'pause') {
    for (const a in buf) buf[a] = Math.max(0, buf[a] - rdt);
    if (game.slowT > 0) game.slowT -= rdt; else game.slow = approach(game.slow, 1, rdt * 1.6);
    let dt = rdt * game.slow;
    if (FX.hitstop > 0) { FX.hitstop -= rdt; dt = 0; }
    T += dt;
    update(dt, rdt);
    if (game.state !== 'menu') hud();
  }
  render();
  requestAnimationFrame(frame);
}

// ---------- boot ----------
game.player = new Player(WORLD_W / 2);
game.player.face = -1;
camera(10);
setMode(game.mode);
setDiff(game.diff);
showScreen('menu');
if (document.fonts && document.fonts.load) document.fonts.load('40px "Ma Shan Zheng"', '〇一二三四五六七八九十降龍掌回陣竹林禪院雪山落日古城血魔宮').catch(() => {});
requestAnimationFrame(frame);
