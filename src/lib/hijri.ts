/** Hijri dates use the device's offline Umm al-Qura calendar, in local time.
 * Local moon-sighting announcements can differ by one day.
 */
const hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura-nu-latn', {
  year: 'numeric', month: 'numeric', day: 'numeric',
});

export interface HijriDate {
  year: number;
  month: number; // 1–12
  day: number;
}

/**
 * Get Hijri date for a given Gregorian date.
 */
export function getHijriDate(d: Date = new Date()): HijriDate {
  const parts = hijriFormatter.formatToParts(d);
  const value = (type: string) => Number(parts.find(p => p.type === type)!.value);
  return { year: value('year'), month: value('month'), day: value('day') };
}

/** Arabic month names (Hijri). */
export const HIJRI_MONTHS_AR: readonly string[] = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];

const AR_NUMS = "٠١٢٣٤٥٦٧٨٩";

function toArabicNumerals(n: number): string {
  return String(n)
    .split("")
    .map((c) => (c >= "0" && c <= "9" ? AR_NUMS[+c]! : c))
    .join("");
}

/**
 * Format Hijri date for display, e.g. "١٥ شعبان ١٤٤٧".
 */
export function formatHijriDate(h: HijriDate): string {
  const monthName = HIJRI_MONTHS_AR[h.month - 1] ?? "";
  return `${toArabicNumerals(h.day)} ${monthName} ${toArabicNumerals(h.year)}`;
}

/**
 * Lunar day (1–30) for moon phase. Same as Hijri day of month.
 */
export function getHijriLunarDay(d: Date = new Date()): number {
  const h = getHijriDate(d);
  return Math.max(1, Math.min(30, h.day));
}
