import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Solid Pure White Background: Prevents iOS Safari from defaulting to black -->
  <rect width="512" height="512" fill="#FFFFFF"/>
  
  <!-- OPay Emerald Green Ring with clean gap on the left -->
  <mask id="opayGapMask">
    <rect width="512" height="512" fill="#FFFFFF"/>
    <!-- Cutout gap on the 9 o'clock side -->
    <rect x="40" y="208" width="160" height="96" fill="#000000"/>
  </mask>
  
  <!-- The Green Ring (OPay Signature Emerald Green #00D589) -->
  <circle cx="256" cy="256" r="146" stroke="#00D589" stroke-width="60" fill="none" mask="url(#opayGapMask)"/>
  
  <!-- The Signature OPay Dark Navy / Black Notch Bar -->
  <rect x="80" y="224" width="96" height="64" rx="14" fill="#12163A"/>
</svg>`;

async function generate() {
  const publicDir = path.join(process.cwd(), 'public');
  const iconsDir = path.join(publicDir, 'icons');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Write base SVGs
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
  fs.writeFileSync(path.join(iconsDir, 'opay-icon.svg'), svgContent);
  console.log('Saved SVG files.');

  const svgBuffer = Buffer.from(svgContent);

  const targets = [
    { file: path.join(publicDir, 'apple-touch-icon.png'), size: 180 },
    { file: path.join(publicDir, 'apple-touch-icon-180x180.png'), size: 180 },
    { file: path.join(publicDir, 'apple-touch-icon-167x167.png'), size: 167 },
    { file: path.join(publicDir, 'apple-touch-icon-152x152.png'), size: 152 },
    { file: path.join(publicDir, 'apple-touch-icon-120x120.png'), size: 120 },
    { file: path.join(publicDir, 'apple-touch-icon-precomposed.png'), size: 180 },
    { file: path.join(iconsDir, 'apple-touch-icon.png'), size: 180 },
    { file: path.join(iconsDir, 'icon-192.png'), size: 192 },
    { file: path.join(iconsDir, 'icon-512.png'), size: 512 },
    { file: path.join(publicDir, 'favicon-32x32.png'), size: 32 },
    { file: path.join(publicDir, 'favicon-16x16.png'), size: 16 },
    { file: path.join(publicDir, 'favicon.ico'), size: 32 },
  ];

  for (const t of targets) {
    await sharp(svgBuffer)
      .resize(t.size, t.size)
      .png()
      .toFile(t.file);
    console.log(`Generated ${t.file} (${t.size}x${t.size})`);
  }

  console.log('All icons generated successfully!');
}

generate().catch(console.error);
