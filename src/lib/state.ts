export type ReadingTime = { label: string; icon: string; done?: boolean; pages?: number };

export type SubhaCounts = {
  subhanallah: number;
  alhamdulillah: number;
  allahuakbar: number;
  istighfar: number;
  hawqala: number;
  salawat: number;
  tahlil: number;
  basmala: number;
};

/** One day's completion snapshot — saved when the day rolls over, used for weekly charts */
export type DailySnapshot = {
  pct: number;       // 0–100 overall completion
  quran: boolean;   // met Quran goal
  azkar: boolean;   // morning or evening adhkar done
  subha: boolean;   // any subha done
  qiyam: boolean;   // qiyam done
  pagesRead: number;
};

export type AppState = {
  dailyPages: number;
  readingTimes: ReadingTime[];
  goals: Record<string, boolean>;
  todaySlots: (ReadingTime & { done: boolean; pages: number })[];
  todayChecks: Record<string, boolean>;
  totalPagesEver: number;
  streak: number;
  bestStreak: number;
  level: number;
  podcasts: { title: string; note?: string; day: string }[];
  duas: { text: string; day: string }[];
  subha: SubhaCounts;
  setupDone: boolean;
  /** Daily time for random dua notification, e.g. "20:00" or null if disabled */
  duaNotificationTime: string | null;
  /** Whether motivational reminders (Egyptian Arabic) are enabled */
  remindersEnabled: boolean;
  /** Last calendar date the app was opened (YYYY-MM-DD); used to archive and roll over day */
  lastSeenDate: string;
  /** Per-day completion history for weekly report; key = YYYY-MM-DD */
  dailyHistory: Record<string, DailySnapshot>;
  /** Nawafel (sunnah prayers) done today — key is nafila id e.g. 'fajr_before_2' */
  nawafelChecks: Record<string, boolean>;
  /** Selected azan sound id */
  selectedAzan: string;
  /** Whether azan notifications are enabled */
  azanEnabled: boolean;
  /** City for prayer times API */
  prayerCity: string;
  /** Country for prayer times API */
  prayerCountry: string;
  /** Prayer time calculation method ID (Aladhan API) */
  prayerMethod: number;
};

export type Action =
  | { type: 'SET_PAGES'; v: number }
  | { type: 'ADD_TIME'; t: ReadingTime }
  | { type: 'RM_TIME'; i: number }
  | { type: 'TOGGLE_GOAL'; key: string }
  | { type: 'FINISH_SETUP' }
  | { type: 'TOGGLE_SLOT'; i: number }
  | { type: 'TOGGLE_CHECK'; key: string }
  | { type: 'ADD_PODCAST'; p: { title: string; note?: string; day: string } }
  | { type: 'RM_PODCAST'; i: number }
  | { type: 'ADD_DUA'; d: { text: string; day: string } }
  | { type: 'RM_DUA'; i: number }
  | { type: 'SUBHA_INC'; id: keyof SubhaCounts }
  | { type: 'SUBHA_RESET'; id: keyof SubhaCounts }
  | { type: 'SUBHA_RESET_ALL' }
  | { type: 'SET_DUA_NOTIFICATION_TIME'; time: string | null }
  | { type: 'SET_REMINDERS_ENABLED'; enabled: boolean }
  | { type: 'ARCHIVE_AND_ROLLOVER'; archivedDate: string; snapshot: DailySnapshot; newDate: string }
  | { type: 'SET_LAST_SEEN_DATE'; date: string }
  | { type: 'CLEAR_DAILY_HISTORY' }
  | { type: 'RESET_QURAN_PROGRESS' }
  | { type: 'RESET_TODAY_READING' }
  | { type: 'TOGGLE_NAFILA'; key: string }
  | { type: 'SET_SELECTED_AZAN'; id: string }
  | { type: 'SET_AZAN_ENABLED'; enabled: boolean }
  | { type: 'SET_PRAYER_LOCATION'; city: string; country: string }
  | { type: 'SET_PRAYER_METHOD'; method: number }
  | { type: 'RESET_APP' };

const STORAGE_KEY = 'yomy-ramadan-state';

export function defaultState(): AppState {
  return {
    dailyPages: 20,
    readingTimes: [
      { label: 'بعد الفجر', icon: '🌅' },
      { label: 'بعد المغرب', icon: '🌆' },
    ],
    goals: {
      azkarMorning: true,
      azkarEvening: true,
      qiyam: true,
      sadaqa: false,
      podcast: true,
      dua: true,
      tafsir: false,
      subha: true,
    },
    todaySlots: [],
    todayChecks: {},
    totalPagesEver: 0,
    streak: 0,
    bestStreak: 0,
    level: 1,
    podcasts: [
      { title: 'رمضان فرصة لا تعوض', note: 'قيمة الأيام المعدودة وكل يوم في رمضان كنز', day: 'رمضان' },
      { title: 'فتور ما بعد البداية', note: 'إحساس إن الحماس بيقل بعد أول أيام', day: 'رمضان' },
      { title: 'الإخلاص في رمضان', note: 'تصحيح النية مش بس كثرة العمل', day: 'رمضان' },
      { title: 'هل قُبل صيامي؟', note: 'حلقة مؤثرة عن الخوف المحمود بعد الطاعة', day: 'رمضان' },
      { title: 'حتى لا ينتهي رمضان', note: 'الاستمرارية بعد الشهر الكريم', day: 'رمضان' },
    ],
    duas: [{ text: 'اللهم اعتق رقابنا من النار', day: '١٤ رمضان' }],
    subha: {
      subhanallah: 0,
      alhamdulillah: 0,
      allahuakbar: 0,
      istighfar: 0,
      hawqala: 0,
      salawat: 0,
      tahlil: 0,
      basmala: 0,
    },
    setupDone: false,
    duaNotificationTime: null,
    remindersEnabled: true,
    lastSeenDate: '',
    dailyHistory: {},
    nawafelChecks: {},
    selectedAzan: 'mishary',
    azanEnabled: false,
    prayerCity: 'Cairo',
    prayerCountry: 'Egypt',
    prayerMethod: 5,
  };
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function loadState(): AppState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isPlainObject(parsed)) return null;
    const def = defaultState();
    const dailyPages = typeof parsed.dailyPages === 'number' ? parsed.dailyPages : def.dailyPages;
    const readingTimes = Array.isArray(parsed.readingTimes)
      ? parsed.readingTimes.filter(
        (t: unknown) => isPlainObject(t) && typeof t.label === 'string' && typeof t.icon === 'string'
      ).map((t: { label: string; icon: string }) => ({ label: t.label, icon: t.icon }))
      : def.readingTimes;
    const savedSlots = Array.isArray(parsed.todaySlots)
      ? parsed.todaySlots.filter(
        (s: unknown) =>
          isPlainObject(s) &&
          typeof s.label === 'string' &&
          typeof s.icon === 'string' &&
          typeof (s as { done?: unknown }).done === 'boolean' &&
          typeof (s as { pages?: unknown }).pages === 'number'
      ).map((s: ReadingTime & { done: boolean; pages: number }) => ({
        label: s.label,
        icon: s.icon,
        done: s.done,
        pages: s.pages,
      }))
      : [];
    // Always derive todaySlots from readingTimes so first screen (Home) stays in sync with second screen (Setup)
    const n = Math.max(1, readingTimes.length);
    const pagesPerSlot = Math.ceil(dailyPages / n);
    const todaySlots = readingTimes.map((t) => {
      const saved = savedSlots.find((s) => s.label === t.label && s.icon === t.icon);
      return {
        ...t,
        done: saved?.done ?? false,
        pages: saved?.pages ?? pagesPerSlot,
      };
    });
    return {
      dailyPages,
      readingTimes,
      goals: (() => {
        if (!isPlainObject(parsed.goals)) return def.goals;
        const merged: Record<string, boolean> = { ...def.goals };
        for (const k of Object.keys(parsed.goals)) {
          if (k in def.goals && typeof parsed.goals[k] === 'boolean') {
            merged[k] = parsed.goals[k];
          }
        }
        return merged;
      })(),
      todaySlots,
      todayChecks: (() => {
        if (!isPlainObject(parsed.todayChecks)) return def.todayChecks;
        const out: Record<string, boolean> = {};
        for (const k of Object.keys(parsed.todayChecks)) {
          if (typeof parsed.todayChecks[k] === 'boolean') out[k] = parsed.todayChecks[k];
        }
        return out;
      })(),
      totalPagesEver: typeof parsed.totalPagesEver === 'number' ? parsed.totalPagesEver : def.totalPagesEver,
      streak: typeof parsed.streak === 'number' ? parsed.streak : def.streak,
      bestStreak: typeof parsed.bestStreak === 'number' ? parsed.bestStreak : def.bestStreak,
      level: typeof parsed.level === 'number' ? parsed.level : def.level,
      podcasts: Array.isArray(parsed.podcasts)
        ? parsed.podcasts.filter(
          (p: unknown) =>
            isPlainObject(p) && typeof (p as { title?: unknown }).title === 'string' && typeof (p as { day?: unknown }).day === 'string'
        ).map((p: { title: string; note?: string; day: string }) => ({
          title: p.title,
          note: typeof p.note === 'string' ? p.note : undefined,
          day: p.day,
        }))
        : def.podcasts,
      duas: Array.isArray(parsed.duas)
        ? parsed.duas.filter(
          (d: unknown) => isPlainObject(d) && typeof (d as { text?: unknown }).text === 'string' && typeof (d as { day?: unknown }).day === 'string'
        ).map((d: { text: string; day: string }) => ({ text: d.text, day: d.day }))
        : def.duas,
      subha: isPlainObject(parsed.subha)
        ? { ...def.subha, ...parsed.subha } as SubhaCounts
        : def.subha,
      setupDone: typeof parsed.setupDone === 'boolean' ? parsed.setupDone : def.setupDone,
      duaNotificationTime:
        parsed.duaNotificationTime === null || (typeof parsed.duaNotificationTime === 'string' && /^\d{1,2}:\d{2}$/.test(parsed.duaNotificationTime))
          ? (parsed.duaNotificationTime as string | null)
          : def.duaNotificationTime,
      remindersEnabled: typeof parsed.remindersEnabled === 'boolean' ? parsed.remindersEnabled : def.remindersEnabled,
      lastSeenDate: typeof parsed.lastSeenDate === 'string' ? parsed.lastSeenDate : def.lastSeenDate,
      dailyHistory: (() => {
        if (!isPlainObject(parsed.dailyHistory)) return def.dailyHistory;
        const out: Record<string, DailySnapshot> = {};
        for (const k of Object.keys(parsed.dailyHistory)) {
          const v = (parsed.dailyHistory as Record<string, unknown>)[k];
          if (
            isPlainObject(v) &&
            typeof (v as DailySnapshot).pct === 'number' &&
            typeof (v as DailySnapshot).quran === 'boolean' &&
            typeof (v as DailySnapshot).azkar === 'boolean' &&
            typeof (v as DailySnapshot).subha === 'boolean' &&
            typeof (v as DailySnapshot).qiyam === 'boolean' &&
            typeof (v as DailySnapshot).pagesRead === 'number'
          ) {
            out[k] = v as DailySnapshot;
          }
        }
        return out;
      })(),
      nawafelChecks: (() => {
        if (!isPlainObject(parsed.nawafelChecks)) return def.nawafelChecks;
        const out: Record<string, boolean> = {};
        for (const k of Object.keys(parsed.nawafelChecks)) {
          if (typeof parsed.nawafelChecks[k] === 'boolean') out[k] = parsed.nawafelChecks[k];
        }
        return out;
      })(),
      selectedAzan: typeof parsed.selectedAzan === 'string' ? parsed.selectedAzan : def.selectedAzan,
      azanEnabled: typeof parsed.azanEnabled === 'boolean' ? parsed.azanEnabled : def.azanEnabled,
      prayerCity: typeof parsed.prayerCity === 'string' ? parsed.prayerCity : def.prayerCity,
      prayerCountry: typeof parsed.prayerCountry === 'string' ? parsed.prayerCountry : def.prayerCountry,
      prayerMethod: typeof parsed.prayerMethod === 'number' ? parsed.prayerMethod : def.prayerMethod,
    };
  } catch {
    return null;
  }
}

export function saveState(s: AppState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore quota / private mode
  }
}

export function initState(): AppState {
  return loadState() ?? defaultState();
}

/** Build today's snapshot from current state (used when rolling over to next day). */
export function buildDailySnapshot(s: AppState): DailySnapshot {
  // Use slots in sync with readingTimes so completion is based on actual completed items
  const slots =
    s.todaySlots.length === s.readingTimes.length
      ? s.todaySlots
      : s.readingTimes.map((t, idx) => {
          const ex = s.todaySlots[idx];
          const match = ex && ex.label === t.label && ex.icon === t.icon ? ex : null;
          const ps = Math.ceil(s.dailyPages / Math.max(1, s.readingTimes.length));
          return { ...t, done: match?.done ?? false, pages: match?.pages ?? ps };
        });
  const tp = slots.reduce((sum, x) => sum + (x.done ? x.pages : 0), 0);
  const dpct = Math.min(100, Math.round((tp / s.dailyPages) * 100));
  const ac = Object.entries(s.goals)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const cd = ac.filter((k) =>
    k === 'subha'
      ? Object.values(s.subha).reduce((a, b) => a + b, 0) > 0
      : !!s.todayChecks[k]
  ).length;
  const cpct = ac.length > 0 ? Math.round((cd / ac.length) * 100) : 0;
  // When no goals are enabled, day % = Quran only; else average of Quran and challenges
  const pct =
    ac.length > 0 ? Math.round((dpct + cpct) / 2) : dpct;
  const azkar = !!(s.todayChecks.azkarMorning || s.todayChecks.azkarEvening);
  const subha = Object.values(s.subha).reduce((a, b) => a + b, 0) > 0;
  return {
    pct,
    quran: tp >= s.dailyPages,
    azkar,
    subha,
    qiyam: !!s.todayChecks.qiyam,
    pagesRead: tp,
  };
}

export function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'SET_PAGES':
      return { ...s, dailyPages: a.v };
    case 'ADD_TIME': {
      const nextTimes = [...s.readingTimes, a.t];
      const ps = Math.ceil(s.dailyPages / Math.max(1, nextTimes.length));
      const nextSlots = nextTimes.map((t, i) => {
        const ex = s.todaySlots[i];
        const keepDone = ex && ex.label === t.label && ex.icon === t.icon ? ex.done : false;
        return { ...t, done: keepDone, pages: ps };
      });
      return { ...s, readingTimes: nextTimes, todaySlots: nextSlots };
    }
    case 'RM_TIME': {
      const nextTimes = s.readingTimes.filter((_, j) => j !== a.i);
      const ps = Math.ceil(s.dailyPages / Math.max(1, nextTimes.length));
      const nextSlots = nextTimes.map((t) => {
        const ex = s.todaySlots.find((sl) => sl.label === t.label && sl.icon === t.icon);
        return { ...t, done: ex?.done ?? false, pages: ex?.pages ?? ps };
      });
      return { ...s, readingTimes: nextTimes, todaySlots: nextSlots };
    }
    case 'TOGGLE_GOAL':
      return { ...s, goals: { ...s.goals, [a.key]: !s.goals[a.key] } };
    case 'FINISH_SETUP': {
      const ps = Math.ceil(s.dailyPages / Math.max(1, s.readingTimes.length));
      return {
        ...s,
        setupDone: true,
        todaySlots: s.readingTimes.map((t) => ({ ...t, done: false, pages: ps })),
      };
    }
    case 'TOGGLE_SLOT': {
      // Keep todaySlots in sync with readingTimes (in case lengths diverged)
      const baseSlots =
        s.todaySlots.length === s.readingTimes.length
          ? [...s.todaySlots]
          : s.readingTimes.map((t, idx) => {
              const ex = s.todaySlots[idx];
              const match = ex && ex.label === t.label && ex.icon === t.icon ? ex : null;
              const ps = Math.ceil(s.dailyPages / Math.max(1, s.readingTimes.length));
              return { ...t, done: match?.done ?? false, pages: match?.pages ?? ps };
            });
      const slot = baseSlots[a.i];
      if (!slot) return s;
      const sl = [...baseSlots];
      sl[a.i] = { ...slot, done: !slot.done };
      if (!sl[a.i].done) sl[a.i].pages = 0;
      else sl[a.i].pages = Math.ceil(s.dailyPages / sl.length);
      return { ...s, todaySlots: sl };
    }
    case 'TOGGLE_CHECK':
      return { ...s, todayChecks: { ...s.todayChecks, [a.key]: !s.todayChecks[a.key] } };
    case 'ADD_PODCAST':
      return { ...s, podcasts: [a.p, ...s.podcasts] };
    case 'RM_PODCAST':
      return { ...s, podcasts: s.podcasts.filter((_, j) => j !== a.i) };
    case 'ADD_DUA':
      return { ...s, duas: [a.d, ...s.duas] };
    case 'RM_DUA':
      return { ...s, duas: s.duas.filter((_, j) => j !== a.i) };
    case 'SUBHA_INC':
      return { ...s, subha: { ...s.subha, [a.id]: (s.subha[a.id] || 0) + 1 } };
    case 'SUBHA_RESET':
      return { ...s, subha: { ...s.subha, [a.id]: 0 } };
    case 'SUBHA_RESET_ALL':
      return {
        ...s,
        subha: Object.fromEntries(Object.keys(s.subha).map((k) => [k, 0])) as SubhaCounts,
      };
    case 'SET_DUA_NOTIFICATION_TIME':
      return { ...s, duaNotificationTime: a.time };
    case 'SET_REMINDERS_ENABLED':
      return { ...s, remindersEnabled: a.enabled };
    case 'ARCHIVE_AND_ROLLOVER': {
      const ps = Math.ceil(s.dailyPages / Math.max(1, s.readingTimes.length));
      const newSlots = s.readingTimes.map((t) => ({ ...t, done: false, pages: ps }));
      const prevBest = s.bestStreak;
      const isYesterday =
        (() => {
          const [y, m, d] = a.newDate.split('-').map(Number);
          const next = new Date(y!, m! - 1, d!);
          next.setDate(next.getDate() - 1);
          const prevStr = next.getFullYear() + '-' + String(next.getMonth() + 1).padStart(2, '0') + '-' + String(next.getDate()).padStart(2, '0');
          return prevStr === a.archivedDate;
        })();
      const newStreak = isYesterday ? (a.snapshot.pct >= 100 ? s.streak + 1 : 0) : 0;
      return {
        ...s,
        dailyHistory: { ...s.dailyHistory, [a.archivedDate]: a.snapshot },
        lastSeenDate: a.newDate,
        todaySlots: newSlots,
        todayChecks: {},
        subha: Object.fromEntries(Object.keys(s.subha).map((k) => [k, 0])) as SubhaCounts,
        totalPagesEver: s.totalPagesEver + a.snapshot.pagesRead,
        streak: newStreak,
        bestStreak: Math.max(prevBest, newStreak),
        nawafelChecks: {},
      };
    }
    case 'SET_LAST_SEEN_DATE':
      return { ...s, lastSeenDate: a.date };
    case 'CLEAR_DAILY_HISTORY':
      return { ...s, dailyHistory: {} };
    case 'RESET_QURAN_PROGRESS':
      return { ...s, totalPagesEver: 0 };
    case 'RESET_TODAY_READING': {
      const slots =
        s.todaySlots.length === s.readingTimes.length
          ? s.todaySlots
          : s.readingTimes.map((t, idx) => {
              const ex = s.todaySlots[idx];
              const match = ex && ex.label === t.label && ex.icon === t.icon ? ex : null;
              const ps = Math.ceil(s.dailyPages / Math.max(1, s.readingTimes.length));
              return { ...t, done: match?.done ?? false, pages: match?.pages ?? ps };
            });
      return {
        ...s,
        todaySlots: slots.map((slot) => ({ ...slot, done: false, pages: 0 })),
      };
    }
    case 'TOGGLE_NAFILA':
      return { ...s, nawafelChecks: { ...s.nawafelChecks, [a.key]: !s.nawafelChecks[a.key] } };
    case 'SET_SELECTED_AZAN':
      return { ...s, selectedAzan: a.id };
    case 'SET_AZAN_ENABLED':
      return { ...s, azanEnabled: a.enabled };
    case 'SET_PRAYER_LOCATION':
      return { ...s, prayerCity: a.city, prayerCountry: a.country };
    case 'SET_PRAYER_METHOD':
      return { ...s, prayerMethod: a.method };
    case 'RESET_APP':
      return defaultState();
    default:
      return s;
  }
}
