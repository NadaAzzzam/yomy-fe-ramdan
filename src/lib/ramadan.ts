import { getHijriDate } from './hijri';

export type RamadanPhase = 'pre' | 'ramadan' | 'post';

export function getRamadanInfo(now: Date = new Date()): {
  phase: RamadanPhase; daysTo: number; day: number; remaining: number;
} {
  const h = getHijriDate(now);
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  if (h.month === 9) {
    let remaining = 0;
    do { cursor.setDate(cursor.getDate() + 1); remaining++; }
    while (getHijriDate(cursor).month === 9);
    return { phase: 'ramadan', daysTo: 0, day: h.day, remaining: remaining - 1 };
  }
  let daysTo = 0;
  while (getHijriDate(cursor).month !== 9) {
    cursor.setDate(cursor.getDate() + 1);
    daysTo++;
  }
  return { phase: h.month < 9 ? 'pre' : 'post', daysTo, day: 0, remaining: 0 };
}

export function getMoonPhase(day: number): number {
  if (day <= 0) return 0.02;
  if (day <= 7) return 0.05 + (day / 7) * 0.45;
  if (day <= 15) return 0.5 + ((day - 7) / 8) * 0.5;
  if (day <= 22) return 1 - ((day - 15) / 7) * 0.5;
  return 0.5 - ((day - 22) / 8) * 0.45;
}

export const AR_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
