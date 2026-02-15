#!/usr/bin/env node

/**
 * Salah Ala Naby Audio - Get Natural Human Voice (Like Al-Shafie App)
 *
 * For a natural, calm voice like the Al-Shafie app, use a REAL RECITER's
 * recording — not computer TTS. This script prints the exact steps.
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, '..', 'public', 'audio', 'salah-ala-naby.mp3');

console.log('\n' + '═'.repeat(60));
console.log('🎙️  صوت طبيعي مثل تطبيق الشافعي');
console.log('    Natural human voice like Al-Shafie app');
console.log('═'.repeat(60));
console.log('\n⚠️  Computer TTS is NOT natural. Use a real reciter\'s recording.\n');
console.log('📝 Steps to get natural voice:\n');
console.log('─'.repeat(60));
console.log('\n1. Open YouTube and search (copy exactly):');
console.log('   ► "الصلاة الإبراهيمية مشاري العفاسي"');
console.log('   Or: "الصلاة على النبي مقرئ"');
console.log('   Or: "Salawat Ibrahim Mishary"\n');
console.log('2. Pick a short clip (5–20 seconds) of the Salawat.\n');
console.log('3. Convert to MP3:');
console.log('   • Go to: https://ytmp3.cc or https://y2mate.com');
console.log('   • Paste video URL → choose MP3 → Download\n');
console.log('4. Rename the file to: salah-ala-naby.mp3\n');
console.log('5. Put it here:');
console.log('   ' + outputPath + '\n');
console.log('6. In the app: دفتر رمضان → الصلاة على النبي → Test button ✅\n');
console.log('─'.repeat(60));
console.log('\n💡 Why? Al-Shafie app uses real reciter voices.');
console.log('   Mishary Alafasy or similar reciters = same calm, natural sound.\n');
console.log('📁 Full instructions: public/audio/README.md');
console.log('   Arabic: public/audio/INSTRUCTIONS.txt\n');
console.log('💚 جزاك الله خيراً\n');
