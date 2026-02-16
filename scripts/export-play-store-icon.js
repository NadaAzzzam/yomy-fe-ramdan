/**
 * Export 512×512 PNG app icon for Google Play Store.
 * Meets: PNG, up to 1 MB, 512×512 px.
 * Run: node scripts/export-play-store-icon.js
 */

import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "src", "assets", "play-store");
const outPath = join(outDir, "app-icon-512.png");

// Same star algorithm as Stars.tsx (seed 42, count 30)
function generateStars(width, height, count = 30, seed = 42) {
  const stars = [];
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rand() * width,
      y: rand() * height,
      r: 0.5 + rand() * 1.5,
      o: (0.15 + rand() * 0.4).toFixed(2),
    });
  }
  return stars
    .map(
      (st) =>
        `<circle cx="${st.x.toFixed(2)}" cy="${st.y.toFixed(2)}" r="${st.r.toFixed(2)}" fill="#F5D88E" opacity="${st.o}"/>`
    )
    .join("\n        ");
}

// Mosque silhouette at y=480, width=512, opacity=0.1 (cx=256)
function mosqueSilhouette() {
  const cx = 256;
  const y = 480;
  return `<g opacity="0.1">
      <path d="M206 ${y} Q206 ${y - 35} ${cx} ${y - 48} Q306 ${y - 35} 306 ${y}Z" fill="#D4A84B"/>
      <rect x="184" y="${y - 35}" width="7" height="35" rx="2" fill="#D4A84B"/>
      <circle cx="187.5" cy="${y - 38}" r="5" fill="#D4A84B"/>
      <rect x="186" y="${y - 48}" width="3" height="8" rx="1" fill="#D4A84B"/>
      <rect x="321" y="${y - 35}" width="7" height="35" rx="2" fill="#D4A84B"/>
      <circle cx="324.5" cy="${y - 38}" r="5" fill="#D4A84B"/>
      <rect x="323" y="${y - 48}" width="3" height="8" rx="1" fill="#D4A84B"/>
      <path d="M218 ${y} Q218 ${y - 18} 234 ${y - 25} Q250 ${y - 18} 250 ${y}Z" fill="#D4A84B" opacity="0.7"/>
      <path d="M262 ${y} Q262 ${y - 18} 278 ${y - 25} Q294 ${y - 18} 294 ${y}Z" fill="#D4A84B" opacity="0.7"/>
    </g>`;
}

function buildSvg() {
  const stars = generateStars(512, 512, 30, 42);
  const mosque = mosqueSilhouette();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="appIconBgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0D1530"/>
      <stop offset="100%" stop-color="#080E1F"/>
    </linearGradient>
    <radialGradient id="appIconMoonGrad" cx="35%" cy="35%">
      <stop offset="0%" stop-color="#F5D88E"/>
      <stop offset="100%" stop-color="#D4A84B"/>
    </radialGradient>
    <filter id="appIconGlow">
      <feGaussianBlur stdDeviation="8" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="appIconTextShadow">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="512" height="512" fill="url(#appIconBgGrad)"/>
  ${stars}
  <circle cx="256" cy="220" r="140" fill="none" stroke="#D4A84B" stroke-width="1" opacity="0.1"/>
  <circle cx="256" cy="220" r="155" fill="none" stroke="#D4A84B" stroke-width="0.5" opacity="0.07"/>
  <circle cx="256" cy="195" r="95" fill="#D4A84B" opacity="0.08"/>
  <circle cx="256" cy="195" r="85" fill="url(#appIconMoonGrad)" filter="url(#appIconGlow)"/>
  <circle cx="282" cy="184" r="67" fill="#0D1530"/>
  <g transform="translate(256,290)" opacity="0.9">
    <path d="M0 -8 Q-28 -18 -48 -6 L-48 28 Q-24 18 0 28" fill="none" stroke="#F5D88E" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M0 -8 Q28 -18 48 -6 L48 28 Q24 18 0 28" fill="none" stroke="#F5D88E" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="0" y1="-8" x2="0" y2="28" stroke="#F5D88E" stroke-width="1.5" opacity="0.4"/>
  </g>
  ${mosque}
  <text x="256" y="400" text-anchor="middle" font-family="Amiri, 'Noto Naskh Arabic', serif" font-size="52" font-weight="700" fill="#F5D88E" filter="url(#appIconTextShadow)">يومي</text>
  <text x="256" y="455" text-anchor="middle" font-family="Amiri, 'Noto Naskh Arabic', serif" font-size="36" font-weight="400" fill="#D4A84B" opacity="0.75">في رمضان</text>
</svg>`;
}

async function main() {
  const svg = buildSvg();
  mkdirSync(outDir, { recursive: true });

  const png = await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png()
    .toBuffer();

  writeFileSync(outPath, png);
  const sizeKb = (png.length / 1024).toFixed(1);
  console.log(`Written: ${outPath}`);
  console.log(`Size: ${sizeKb} KB (max 1024 KB for Play Store)`);
  console.log(`Dimensions: 512×512 px`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
