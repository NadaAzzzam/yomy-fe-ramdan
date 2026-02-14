/**
 * Content policy: ensure we do not display any بدعة (bid'ah) or content that
 * promotes religious innovation. Also strip non-Quranic additions (e.g. وصدق الله العظيم)
 * from ayah text — these are not part of the Quran.
 */

/** Phrases that must not appear in displayed religious content (بدعة-related). */
const BIDAH_BLOCKLIST: string[] = [
  'صلاة الرغائب',
  'بدعة',
  'بدعي',
  'مبتدع',
  'مبتدعة',
  'أهل البدع',
  'الاحتفال بالمولد',
  'ذكر جماعي بصيغة واحدة بعد الصلاة',
];

/** Non-Quranic phrases sometimes appended after ayahs — strip from display (not in the Mushaf). */
const NON_QURANIC_AYAH_SUFFIXES: string[] = [
  'وصدق الله العظيم',
  'صدق الله العظيم',
  'و صدق الله العظيم',
  '، وصدق الله العظيم',
  '، صدق الله العظيم',
];

/**
 * Returns true if the text is safe to display (no blocklisted بدعة content).
 * Normalizes by trimming and collapsing spaces; check is case-sensitive for Arabic.
 */
export function isContentSafe(text: string | null | undefined): boolean {
  if (text == null || typeof text !== 'string') return true;
  const normalized = text.trim().replace(/\s+/g, ' ');
  for (const phrase of BIDAH_BLOCKLIST) {
    if (normalized.includes(phrase)) return false;
  }
  return true;
}

/**
 * Strip non-Quranic suffixes (e.g. وصدق الله العظيم) from ayah or Quran text.
 * Use for any displayed ayah text so we never show additions that are not in the Mushaf.
 */
export function stripNonQuranicSuffixes(text: string | null | undefined): string {
  if (text == null || typeof text !== 'string') return '';
  let out = text.trim().replace(/\s+/g, ' ');
  for (const suffix of NON_QURANIC_AYAH_SUFFIXES) {
    const trimmed = suffix.trim();
    if (out.endsWith(trimmed)) {
      out = out.slice(0, -trimmed.length).trim();
      break;
    }
  }
  return out;
}

/**
 * Filter an array of items by text field; only items with safe text are returned.
 */
export function filterSafeContent<T extends { text: string }>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => isContentSafe(item?.text));
}
