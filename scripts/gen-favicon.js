import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Minimal 16x16 ICO (dark #080E1F to match app theme)
const w = 16, h = 16;
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);

const dirEntry = Buffer.alloc(16);
dirEntry[0] = w;
dirEntry[1] = h;
dirEntry[2] = 0;
dirEntry[3] = 0;
dirEntry.writeUInt16LE(1, 4);
dirEntry.writeUInt16LE(32, 6);
const bmpSize = 40 + ((w * 4 + 3) & ~3) * h;
dirEntry.writeUInt32LE(bmpSize, 8);
dirEntry.writeUInt32LE(6 + 16, 12);

const dibHeader = Buffer.alloc(40);
dibHeader.writeUInt32LE(40, 0);
dibHeader.writeInt32LE(w, 4);
dibHeader.writeInt32LE(h * 2, 8); // height * 2 for ICO
dibHeader.writeUInt16LE(1, 12);
dibHeader.writeUInt16LE(32, 14);
dibHeader.writeUInt32LE(0, 16);
dibHeader.writeUInt32LE(0, 20);
dibHeader.writeInt32LE(0, 24);
dibHeader.writeInt32LE(0, 28);
dibHeader.writeUInt32LE(0, 32);
dibHeader.writeUInt32LE(0, 36);

const rowBytes = ((w * 4 + 3) & ~3);
const pixels = Buffer.alloc(rowBytes * h);
// #080E1F = RGB 8, 14, 31 -> BGR in little-endian
for (let i = 0; i < rowBytes * h; i += 4) {
  pixels[i] = 31;     // B
  pixels[i + 1] = 14; // G
  pixels[i + 2] = 8;  // R
  pixels[i + 3] = 255;
}

const ico = Buffer.concat([header, dirEntry, dibHeader, pixels]);
const outPath = path.join(__dirname, '..', 'public', 'favicon.ico');
fs.writeFileSync(outPath, ico);
console.log('Wrote', outPath);
