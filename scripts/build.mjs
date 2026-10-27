// Builds the game from src/:
//   www/  — standalone page + PWA manifest, service worker and icons (GitHub Pages and the Capacitor apps use this)
//   dist/giang-long-que-hiep.html — head-less fragment for publishing as a Claude artifact
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';

const SRC = process.env.GAME_SRC || 'src';
const read = f => readFileSync(`${SRC}/${f}`, 'utf8');
const shell = read('a-shell.html'); // title, fonts, styles and markup, ending with an open <script>
const js = ['b-core.js', 'b-maps.js', 'c-fighter.js', 'd-bosses.js', 'd-foes.js', 'e-game.js'].map(read).join('\n');

mkdirSync('dist', { recursive: true });
writeFileSync('dist/giang-long-que-hiep.html', `${shell}${js}</script>\n`);

const cut = shell.indexOf('</style>') + '</style>'.length;
const build = Date.now().toString(36);
const page = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="description" content="Game người que kiếm hiệp: khinh công, quyền cước và Giáng Long Thập Bát Chưởng.">
<meta name="theme-color" content="#0c0a12">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Que Hiệp">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
${shell.slice(0, cut)}
</head>
<body>
${shell.slice(cut)}${js}</script>
<script>
// offline play once installed; native shells (Capacitor) serve files locally and skip this
if ('serviceWorker' in navigator && location.protocol === 'https:' && !window.Capacitor) navigator.serviceWorker.register('sw.js');
</script>
</body>
</html>
`;

rmSync('www', { recursive: true, force: true });
cpSync('public', 'www', { recursive: true });
writeFileSync('www/index.html', page);
writeFileSync('www/sw.js', readFileSync('public/sw.js', 'utf8').replace('__BUILD__', build));
console.log(`built www/ and dist/ (build ${build})`);
