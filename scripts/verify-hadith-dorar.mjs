#!/usr/bin/env node
/**
 * Verify static hadiths against Dorar.net (الموسوعة الحديثية).
 * Usage: node scripts/verify-hadith-dorar.mjs
 * Requires Node 18+ (fetch). Dorar API: https://dorar.net/dorar_api.json?skey=...
 *
 * Curl test (run from repo root):
 *   curl -s "https://dorar.net/dorar_api.json?skey=صيام" | head -c 500
 * Or PowerShell:
 *   Invoke-WebRequest -Uri "https://dorar.net/dorar_api.json?skey=صيام" -UseBasicParsing | Select-Object -ExpandProperty Content
 */

const DORAR_API = 'https://dorar.net/dorar_api.json';
const SAHIH_INDICATORS = [
  'صحيح',
  'إسناده صحيح',
  'أخرجه في صحيحه',
  'رجال أحمد رجال الصحيح',
  'إسناده صحيح على شرط مسلم',
];
const WEAK_INDICATORS = ['ضعيف', 'موضوع', 'لا يصح', 'منكر', 'مُنكر'];

function hadithTextToSearchKey(text, maxWords = 8) {
  if (!text || typeof text !== 'string') return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(' ');
}

function parseDorarHtml(html) {
  if (!html || typeof html !== 'string') return false;
  const blocks = html.split(/---------\s*/);
  for (const block of blocks) {
    const rulingMatch =
      block.match(/خلاصة\s+حكم\s+المحدث[:\s]*<\/span>\s*([^<]+)/i) ||
      block.match(/خلاصة\s+حكم\s+المحدث[^>]*>([^<]+)/i);
    const ruling = rulingMatch ? rulingMatch[1].trim() : '';
    if (!ruling) continue;
    const isWeak = WEAK_INDICATORS.some((w) => ruling.includes(w));
    if (isWeak) continue;
    const isSahih = SAHIH_INDICATORS.some((s) => ruling.includes(s));
    if (isSahih) return true;
  }
  return false;
}

async function verifyOne(skey) {
  const url = `${DORAR_API}?skey=${encodeURIComponent(skey)}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible; YomyVerify/1)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const html = data?.ahadith?.result ?? '';
  return parseDorarHtml(html);
}

// Static hadiths from src/lib/data.ts and src/pages/Subha.tsx (hadith text only for verification)
const STATIC_HADITHS = [
  // HADITHS (data.ts)
  'من صام رمضان إيماناً واحتساباً غُفر له ما تقدم من ذنبه',
  'إن لله عتقاء في كل يوم وليلة من رمضان، وإن لكل مسلم دعوة مستجابة',
  'الصيام والقرآن يشفعان للعبد يوم القيامة',
  'من قام ليلة القدر إيماناً واحتساباً غُفر له ما تقدم من ذنبه',
  'إن في الجنة باباً يُقال له الريان يدخل منه الصائمون',
  'خيركم من تعلم القرآن وعلمه',
  'اقرأوا القرآن فإنه يأتي يوم القيامة شفيعاً لأصحابه',
  'ثلاث دعوات لا تُرد: دعوة الصائم ودعوة المسافر ودعوة المظلوم',
  'للصائم فرحتان: فرحة عند فطره وفرحة عند لقاء ربه',
  // RAMADAN_DAY_HADITHS sample (first 5)
  'إذا جاء رمضان فُتحت أبواب الجنة وغُلقت أبواب النار وصُفّدت الشياطين',
  'الصيام جُنّة، فإذا كان يوم صوم أحدكم فلا يرفث ولا يصخب',
  'من لم يدع قول الزور والعمل به فليس لله حاجة في أن يدع طعامه وشرابه',
  'تسحّروا فإن في السحور بركة',
  'عجّلوا الفطر وأخّروا السحور',
  // NAWAFEL (data.ts)
  'ركعتا الفجر خيرٌ من الدنيا وما فيها',
  'من حافظ على أربع ركعات قبل الظهر وأربعٍ بعدها حرّمه الله على النار',
  'من صلى اثنتي عشرة ركعة في يوم وليلة بُني له بيتٌ في الجنة',
  'رحم الله امرأً صلى قبل العصر أربعاً',
  'اجعلوا آخر صلاتكم بالليل وتراً',
  // TWELVE_RAKAHS
  'من صلى اثنتي عشرة ركعة في يوم وليلة بُني له بيتٌ في الجنة: أربعاً قبل الظهر، وركعتين بعدها، وركعتين بعد المغرب، وركعتين بعد العشاء، وركعتين قبل صلاة الفجر',
  // Subha DHIKR_HADITHS (first 3)
  'أحب الكلام إلى الله أربع: سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر',
  'كلمتان خفيفتان على اللسان ثقيلتان في الميزان حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم',
  'ألا أنبئكم بخير أعمالكم وأزكاها عند مليككم وأرفعها في درجاتكم؟ قالوا: بلى. قال: ذكر الله كثيراً',
];

async function main() {
  console.log('Dorar.net hadith verification (الموسوعة الحديثية)\n');
  let ok = 0;
  let fail = 0;
  for (const text of STATIC_HADITHS) {
    const skey = hadithTextToSearchKey(text);
    if (!skey) {
      console.log('SKIP (empty):', text.slice(0, 50) + '...');
      continue;
    }
    try {
      const verified = await verifyOne(skey);
      if (verified) {
        ok++;
        console.log('VERIFIED:', skey.slice(0, 50) + (skey.length > 50 ? '...' : ''));
      } else {
        fail++;
        console.log('NOT FOUND AS SAHIH:', skey.slice(0, 50) + (skey.length > 50 ? '...' : ''));
      }
    } catch (e) {
      fail++;
      console.log('ERROR:', skey.slice(0, 40) + '...', e.message);
    }
    await new Promise((r) => setTimeout(r, 400)); // rate limit
  }
  console.log('\n---');
  console.log(`Verified: ${ok}, Not/Error: ${fail}, Total: ${ok + fail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
