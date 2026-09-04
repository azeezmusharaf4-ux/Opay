import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// OPay Logo SVG at 512x512
// White background with centered OPay brand emblem (green circle + navy bar)
const svg512 = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <!-- OPay Green Ring -->
  <circle cx="256" cy="256" r="145" stroke="#00C87A" stroke-width="54" fill="none"/>
  <!-- Navy Indigo Left Bar -->
  <rect x="110" y="231" width="85" height="50" rx="10" fill="#1D2452"/>
</svg>
`;

async function generate() {
  const svgBuffer = Buffer.from(svg512);

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(outDir, 'icon-512.png'));
  console.log('Generated icon-512.png');

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(outDir, 'icon-192.png'));
  console.log('Generated icon-192.png');

  // 180x180 (apple-touch-icon)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(outDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Also write SVG
  fs.writeFileSync(path.join(outDir, 'opay-icon.svg'), svg512.trim());
  console.log('Generated opay-icon.svg');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
