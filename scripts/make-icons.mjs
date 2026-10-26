// Draws the web/PWA icons into public/icons. Run once after changing scripts/art.mjs: npm run icons
import { mkdirSync, writeFileSync } from 'node:fs';
import { render, png } from './art.mjs';

mkdirSync('public/icons', { recursive: true });
const out = (file, size, opts) => { writeFileSync(file, png(size, size, render(size, size, opts))); console.log('wrote', file); };
out('public/icons/icon-192.png', 192);
out('public/icons/icon-512.png', 512);
out('public/icons/maskable-512.png', 512, { k: (512 / 1024) * 0.8 }); // keeps the hero inside the maskable safe circle
out('public/icons/apple-touch-icon.png', 180);
out('public/icons/favicon-32.png', 32, { moon: false });
