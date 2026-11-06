import fs from 'fs';
import path from 'path';

const distWeb = path.resolve('dist-web');
const indexHtml = path.join(distWeb, 'index.html');

if (fs.existsSync(distWeb) && fs.existsSync(indexHtml)) {
  console.log('[POST-BUILD] Nalia MedCore SaaS System successfully set as root dist-web/index.html');
} else {
  console.error('[POST-BUILD] dist-web/index.html not found!');
}
