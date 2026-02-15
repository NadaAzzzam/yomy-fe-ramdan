const JUZ = [
  { j: 1, n: 'الفاتحة', s: 1 }, { j: 2, n: 'سيقول', s: 22 }, { j: 3, n: 'تلك الرسل', s: 42 },
  { j: 4, n: 'لن تنالوا', s: 62 }, { j: 5, n: 'والمحصنات', s: 82 }, { j: 6, n: 'لا يحب الله', s: 102 },
  { j: 7, n: 'وإذا سمعوا', s: 121 }, { j: 8, n: 'ولو أننا', s: 142 }, { j: 9, n: 'قال الملأ', s: 162 },
  { j: 10, n: 'واعلموا', s: 182 }, { j: 11, n: 'يعتذرون', s: 201 }, { j: 12, n: 'ومامن دابة', s: 222 },
  { j: 13, n: 'وما أبرئ', s: 242 }, { j: 14, n: 'ربما', s: 262 }, { j: 15, n: 'سبحان الذي', s: 282 },
  { j: 16, n: 'قال ألم', s: 302 }, { j: 17, n: 'اقترب', s: 322 }, { j: 18, n: 'قد أفلح', s: 342 },
  { j: 19, n: 'وقال الذين', s: 362 }, { j: 20, n: 'أمّن خلق', s: 382 }, { j: 21, n: 'اتل ما أوحي', s: 402 },
  { j: 22, n: 'ومن يقنت', s: 422 }, { j: 23, n: 'وما لي', s: 442 }, { j: 24, n: 'فمن أظلم', s: 462 },
  { j: 25, n: 'إليه يرد', s: 482 }, { j: 26, n: 'حم', s: 502 }, { j: 27, n: 'قال فما خطبكم', s: 522 },
  { j: 28, n: 'قد سمع', s: 542 }, { j: 29, n: 'تبارك', s: 562 }, { j: 30, n: 'عمّ', s: 582 },
];

/** Get juz number (1–30) for a Mus'haf page (1–604). */
export function getJuzByPage(page: number): number {
  if (page < 1 || page > 604) return 1;
  let j = 1;
  for (let i = 0; i < JUZ.length; i++) {
    if (page >= JUZ[i].s) j = JUZ[i].j;
  }
  return j;
}

/** Start page of a juz (1–30). Juz 1 starts at 1, juz 2 at 22, etc. */
export function getJuzStartPage(juzNum: number): number {
  if (juzNum < 1 || juzNum > 30) return 1;
  const j = JUZ.find((x) => x.j === juzNum);
  return j ? j.s : 1;
}

export function getJuzInfo(tp: number): {
  khatmas: number;
  currentPages: number;
  currentJuz: number;
  juzName: string;
  khatmaPct: number;
} {
  const T = 604;
  const k = Math.floor(tp / T);
  const c = tp % T;
  let cj = 1;
  for (let i = JUZ.length - 1; i >= 0; i--) {
    if (c >= JUZ[i].s) {
      cj = JUZ[i].j;
      break;
    }
  }
  return {
    khatmas: k,
    currentPages: c,
    currentJuz: cj,
    juzName: JUZ[cj - 1].n,
    khatmaPct: Math.round((c / T) * 100),
  };
}
