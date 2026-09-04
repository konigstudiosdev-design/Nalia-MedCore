import fs from 'fs';
import path from 'path';

const distWeb = path.resolve('dist-web');
const indexHtml = path.join(distWeb, 'index.html');
const landingHtml = path.join(distWeb, 'landing.html');
const appHtml = path.join(distWeb, 'app.html');

if (fs.existsSync(distWeb) && fs.existsSync(landingHtml)) {
  // 1. Move the SaaS App (index.html) to app.html
  if (fs.existsSync(indexHtml)) {
    fs.copyFileSync(indexHtml, appHtml);
    console.log('[POST-BUILD] SaaS App copied to dist-web/app.html');
  }

  // 2. Move Landing Page (landing.html) to index.html (so / serves Landing Page)
  fs.copyFileSync(landingHtml, indexHtml);
  console.log('[POST-BUILD] Landing Page set as main dist-web/index.html');

  // 3. Create app directory structure if needed for clean /app route
  const appDir = path.join(distWeb, 'app');
  if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });
  fs.copyFileSync(appHtml, path.join(appDir, 'index.html'));
  console.log('[POST-BUILD] Created clean /app route at dist-web/app/index.html');
} else {
  console.error('[POST-BUILD] dist-web or landing.html not found!');
}
