// Applies the game's settings to the native projects that `npx cap add` generates:
// landscape lock, full screen without system bars, launcher icons and splash screens drawn from scripts/art.mjs.
// Safe to run repeatedly: npm run sync runs it after every `cap sync`.
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { render, png, pngSize } from './art.mjs';

const { appId } = JSON.parse(readFileSync('capacitor.config.json', 'utf8'));
const edit = (file, fn) => {
  if (!existsSync(file)) return;
  const s = readFileSync(file, 'utf8'), t = fn(s);
  if (t !== s) { writeFileSync(file, t); console.log('patched', file); }
};
const splashArt = (w, h) => png(w, h, render(w, h, { k: (Math.min(w, h) / 1024) * 0.42 }));

// ---------- Android ----------
const A = 'android/app/src/main';
if (existsSync(A)) {
  edit(`${A}/AndroidManifest.xml`, s => s.includes('screenOrientation') ? s : s.replace('<activity', '<activity\n            android:screenOrientation="sensorLandscape"'));
  const activity = join(A, 'java', ...appId.split('.'), 'MainActivity.java');
  if (existsSync(activity)) writeFileSync(activity, `package ${appId};

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    // Immersive full screen: status and navigation bars stay hidden until the player swipes from an edge.
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (!hasFocus) return;
        WindowInsetsControllerCompat bars = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        bars.hide(WindowInsetsCompat.Type.systemBars());
        bars.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }
}
`);
  const densities = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
  for (const [d, n] of Object.entries(densities)) {
    const dir = `${A}/res/mipmap-${d}`, fg = Math.round((n * 108) / 48);
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${dir}/ic_launcher.png`, png(n, n, render(n, n)));
    writeFileSync(`${dir}/ic_launcher_round.png`, png(n, n, render(n, n, { circle: true })));
    // adaptive icon foreground: transparent, hero kept inside the 66/108 safe zone
    writeFileSync(`${dir}/ic_launcher_foreground.png`, png(fg, fg, render(fg, fg, { bg: false, moon: false, k: (fg / 1024) * 0.6 })));
  }
  edit(`${A}/res/values/ic_launcher_background.xml`, s => s.replace(/#[0-9A-Fa-f]{6,8}/, '#1B1530'));
  for (const d of readdirSync(`${A}/res`)) {
    const f = `${A}/res/${d}/splash.png`;
    if (existsSync(f)) { const [w, h] = pngSize(f); writeFileSync(f, splashArt(w, h)); }
  }
  console.log('android: landscape, immersive, icons and splash applied');
}

// ---------- iOS ----------
const I = 'ios/App/App';
if (existsSync(I)) {
  edit(`${I}/Info.plist`, s => {
    const land = '<array>\n\t\t<string>UIInterfaceOrientationLandscapeLeft</string>\n\t\t<string>UIInterfaceOrientationLandscapeRight</string>\n\t</array>';
    s = s.replace(/(<key>UISupportedInterfaceOrientations(?:~ipad)?<\/key>\s*)<array>[\s\S]*?<\/array>/g, `$1${land}`);
    if (!s.includes('UIStatusBarHidden')) s = s.replace('<dict>', '<dict>\n\t<key>UIStatusBarHidden</key>\n\t<true/>\n\t<key>UIViewControllerBasedStatusBarAppearance</key>\n\t<false/>\n\t<key>UIRequiresFullScreen</key>\n\t<true/>');
    return s;
  });
  const icons = `${I}/Assets.xcassets/AppIcon.appiconset`, splash = `${I}/Assets.xcassets/Splash.imageset`;
  if (existsSync(icons)) for (const f of readdirSync(icons).filter(f => f.endsWith('.png'))) { const [w, h] = pngSize(`${icons}/${f}`); writeFileSync(`${icons}/${f}`, png(w, h, render(w, h))); }
  if (existsSync(splash)) {
    const cache = {};
    for (const f of readdirSync(splash).filter(f => f.endsWith('.png'))) { const [w, h] = pngSize(`${splash}/${f}`); writeFileSync(`${splash}/${f}`, cache[`${w}x${h}`] ??= splashArt(w, h)); }
  }
  console.log('ios: landscape, full screen, icon and splash applied');
}
