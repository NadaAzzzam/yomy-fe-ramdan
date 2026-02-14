const RAMADAN_START = new Date(2026, 1, 18);

export type RamadanPhase = 'pre' | 'ramadan' | 'post';

export function getRamadanInfo(): {
  phase: RamadanPhase;
  daysTo: number;
  day: number;
  remaining: number;
} {
  const now = new Date();
  const ms = 86400000;
  if (now < RAMADAN_START) {
    const d = Math.ceil((RAMADAN_START.getTime() - now.getTime()) / ms);
    return { phase: 'pre', daysTo: d, day: 0, remaining: 30 };
  }
  const d = Math.floor((now.getTime() - RAMADAN_START.getTime()) / ms) + 1;
  if (d > 30) return { phase: 'post', day: 30, remaining: 0 };
  return { phase: 'ramadan', day: d, remaining: 30 - d };
}

export function getMoonPhase(day: number): number {
  if (day <= 0) return 0.02;
  if (day <= 7) return 0.05 + (day / 7) * 0.45;
  if (day <= 15) return 0.5 + ((day - 7) / 8) * 0.5;
  if (day <= 22) return 1 - ((day - 15) / 7) * 0.5;
  return 0.5 - ((day - 22) / 8) * 0.45;
}

export const AR_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
