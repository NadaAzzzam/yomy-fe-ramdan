/**
 * Gregorian → Hijri conversion (Kuwaiti algorithm).
 * Used for displaying current Islamic date and for moon phase.
 */

function gregorianToJulianDay(d: Date): number {
  let day = d.getDate();
  let month = d.getMonth() + 1;
  let year = d.getFullYear();
  if (month < 3) {
    year -= 1;
    month += 12;
  }
  const a = Math.floor(year / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (year < 1583) b = 0;
  if (year === 1582 && (month > 10 || (month === 10 && day > 4))) b = -10;
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524;
}

export interface HijriDate {
  year: number;
  month: number; // 1–12
  day: number;
}

/**
 * Get Hijri date for a given Gregorian date.
 */
export function getHijriDate(d: Date = new Date()): HijriDate {
  const jd = gregorianToJulianDay(d);
  const iyear = 10631 / 30;
  const epochastro = 1948084;
  const shift1 = 8.01 / 60;
  let z = jd - epochastro;
  const cyc = Math.floor(z / 10631);
  z -= 10631 * cyc;
  const j = Math.floor((z - shift1) / iyear);
  const iy = 30 * cyc + j;
  z -= Math.floor(j * iyear + shift1);
  let im = Math.floor((z + 28.5001) / 29.5);
  if (im === 13) im = 12;
  const id = Math.round(z - Math.floor(29.5001 * im - 29));
  return {
    year: iy,
    month: im,
    day: Math.max(1, Math.min(30, id)),
  };
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
