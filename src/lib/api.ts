/**
 * Free external APIs for Azkar & Hadith — keeps bundle small and avoids loading
 * large static data. All APIs are free, no keys required. Fallback to local data
 * when offline or on fetch error.
 *
 * AZKAR:
 * - Athkar API (Hisnul Muslim): https://athkar-api.cyclic.app — /morning, /night
 * - muslimKit JSON: https://ahegazy.github.io/muslimKit/json/ (azkar_morning, azkar_evening, etc.)
 *
 * HADITH:
 * - fawazahmed0/hadith-api (Unlicense): https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1
 *   - Arabic: editions/ara-bukhari, ara-muslim, ara-nawawi, etc.
 *   - Single hadith: editions/ara-bukhari/{hadithNo}.min.json
 *   - Use .min.json and fallback to .json if needed (per API docs)
 */

import { useState, useEffect } from 'react';

const HADITH_BASE =
  'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';
const ATHKAR_BASE = 'https://athkar-api.cyclic.app';

export type HadithItem = { text: string; source: string };

/** Render hadith HTML safely: <br> → line break, strip other tags. Use with whiteSpace: 'pre-line'. */
export function formatHadithText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '');
}

/** Fetch a single Arabic hadith by book and number. Returns null on error. */
export async function fetchHadith(
  edition: string = 'ara-bukhari',
  hadithNo: number = 1
): Promise<HadithItem | null> {
  try {
    const url = `${HADITH_BASE}/editions/${edition}/${hadithNo}.min.json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const h = data?.hadiths?.[0];
    const text = h?.text ?? '';
    const bookName = data?.metadata?.name ?? edition;
    return { text, source: bookName };
  } catch {
    return null;
  }
}

/** Pick a hadith number from day index (e.g. Ramadan day) so we get variety without loading the whole book. */
export function hadithNoFromDayIndex(dayIndex: number, maxHadith: number = 1500): number {
  return (dayIndex % maxHadith) + 1;
}

export type AthkarItem = { id: string; text: string; counter: number };

/** Fetch morning athkar. API returns array of { id, text, counter }. Returns [] on error. */
export async function fetchMorningAthkar(): Promise<AthkarItem[]> {
  try {
    const res = await fetch(`${ATHKAR_BASE}/morning`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.content ?? (data?.id ? [data] : []);
  } catch {
    return [];
  }
}

/** Fetch evening/night athkar. Returns [] on error. */
export async function fetchEveningAthkar(): Promise<AthkarItem[]> {
  try {
    const res = await fetch(`${ATHKAR_BASE}/night`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.content ?? (data?.id ? [data] : []);
  } catch {
    return [];
  }
}

/** React hook: hadith of the day from API with local fallback */
export function useHadithOfTheDay(
  dayIndex: number,
  localHadiths: HadithItem[]
): { hadith: HadithItem; loading: boolean } {
  const [hadith, setHadith] = useState<HadithItem>(() => localHadiths[dayIndex % localHadiths.length]!);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const no = hadithNoFromDayIndex(dayIndex);
    fetchHadith('ara-bukhari', no).then((h) => {
      if (cancelled) return;
      if (h?.text) setHadith(h);
      else setHadith(localHadiths[dayIndex % localHadiths.length]!);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [dayIndex, localHadiths]);

  return { hadith, loading };
}

/* ─── Prayer Times (Aladhan API) ─── */

export type PrayerTimings = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

const ALADHAN_BASE = 'https://api.aladhan.com/v1';

/** Fetch today's prayer times by city. method: calculation method ID (default 5 = Egyptian). */
export async function fetchPrayerTimes(
  city: string = 'Cairo',
  country: string = 'Egypt',
  method: number = 5
): Promise<PrayerTimings | null> {
  try {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const dateStr = `${dd}-${mm}-${yyyy}`;
    const url = `${ALADHAN_BASE}/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const timings = data?.data?.timings;
    if (!timings) return null;
    // Strip timezone info like " (EET)" — keep only HH:mm
    const clean = (t: string) => (t ?? '').replace(/\s*\(.*\)/, '').trim();
    return {
      Fajr: clean(timings.Fajr),
      Sunrise: clean(timings.Sunrise),
      Dhuhr: clean(timings.Dhuhr),
      Asr: clean(timings.Asr),
      Maghrib: clean(timings.Maghrib),
      Isha: clean(timings.Isha),
    };
  } catch {
    return null;
  }
}

/** React hook: prayer times for today */
export function usePrayerTimes(
  city: string,
  country: string,
  method: number
): { times: PrayerTimings | null; loading: boolean; error: boolean } {
  const [times, setTimes] = useState<PrayerTimings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchPrayerTimes(city, country, method).then((t) => {
      if (cancelled) return;
      if (t) {
        setTimes(t);
        setError(false);
      } else {
        setError(true);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [city, country, method]);

  return { times, loading, error };
}

/** Convert 24h "HH:mm" to 12h with Arabic ص (AM) / م (PM) */
export function formatTime12h(timeStr: string): string {
  if (!timeStr || !timeStr.trim()) return timeStr;
  const parts = timeStr.trim().split(':');
  const hour = parseInt(parts[0] ?? '0', 10);
  const minute = parseInt(parts[1] ?? '0', 10);
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const m = String(minute).padStart(2, '0');
  const ampm = hour < 12 ? 'ص' : 'م';
  return `${h12}:${m} ${ampm}`;
}

/** Get the next prayer and countdown from prayer times */
export function getNextPrayer(
  times: PrayerTimings
): { key: string; label: string; time: string; minutesLeft: number } | null {
  const PRAYER_ORDER = [
    { key: 'Fajr', label: 'الفجر' },
    { key: 'Sunrise', label: 'الشروق' },
    { key: 'Dhuhr', label: 'الظهر' },
    { key: 'Asr', label: 'العصر' },
    { key: 'Maghrib', label: 'المغرب' },
    { key: 'Isha', label: 'العشاء' },
  ];

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (const p of PRAYER_ORDER) {
    const timeStr = times[p.key as keyof PrayerTimings];
    if (!timeStr) continue;
    const [h, m] = timeStr.split(':').map(Number);
    const prayerMinutes = (h ?? 0) * 60 + (m ?? 0);
    if (prayerMinutes > nowMinutes) {
      return {
        key: p.key,
        label: p.label,
        time: timeStr,
        minutesLeft: prayerMinutes - nowMinutes,
      };
    }
  }

  // All prayers passed today — next is Fajr tomorrow
  const fajrStr = times.Fajr;
  if (fajrStr) {
    const [h, m] = fajrStr.split(':').map(Number);
    const fajrMinutes = (h ?? 0) * 60 + (m ?? 0);
    const minutesLeft = (24 * 60 - nowMinutes) + fajrMinutes;
    return { key: 'Fajr', label: 'الفجر (غداً)', time: fajrStr, minutesLeft };
  }

  return null;
}

/* ─── Azan Audio Player ─── */

let currentAudio: HTMLAudioElement | null = null;

/**
 * Play an azan sound from URL. Stops any currently playing azan.
 * Returns a promise that resolves with the audio element if playback started,
 * or null if playback failed (blocked, load error, or network error).
 */
export function playAzan(url: string): Promise<HTMLAudioElement | null> {
  return new Promise((resolve) => {
    try {
      stopAzan();
      const audio = new Audio(url);
      audio.volume = 1.0;
      currentAudio = audio;

      const cleanup = () => {
        audio.removeEventListener('error', onError);
        if (currentAudio === audio) currentAudio = null;
      };

      const onError = () => {
        cleanup();
        stopAzan();
        resolve(null);
      };

      audio.addEventListener('error', onError);
      audio.addEventListener('ended', () => {
        if (currentAudio === audio) currentAudio = null;
      });

      audio.play().then(() => {
        audio.removeEventListener('error', onError);
        resolve(audio);
      }).catch(() => {
        onError();
      });
    } catch {
      resolve(null);
    }
  });
}

/** Stop currently playing azan */
export function stopAzan(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/** Check if azan is currently playing */
export function isAzanPlaying(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}

/* ─── Quran API (alquran.cloud — free, no key, Hafs/Uthmani) ─── */

const QURAN_API = 'https://api.alquran.cloud/v1';
const QURAN_CACHE_PREFIX = 'yomy-quran-';

export type QuranAyah = {
  number: number;
  text: string;
  numberInSurah: number;
};

function getCachedSurah(num: number): QuranAyah[] | null {
  try {
    const raw = localStorage.getItem(QURAN_CACHE_PREFIX + num);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function cacheSurah(num: number, ayahs: QuranAyah[]): void {
  try {
    localStorage.setItem(QURAN_CACHE_PREFIX + num, JSON.stringify(ayahs));
  } catch { /* ignore quota */ }
}

/** Check if a surah is cached locally */
export function isSurahCached(num: number): boolean {
  return getCachedSurah(num) !== null;
}

/** Fetch surah text (Hafs/Uthmani) from API with local cache. Returns null on error/offline. */
export async function fetchSurahText(surahNum: number): Promise<QuranAyah[] | null> {
  const cached = getCachedSurah(surahNum);
  if (cached) return cached;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return null;
  try {
    const res = await fetch(`${QURAN_API}/surah/${surahNum}`);
    if (!res.ok) return null;
    const data = await res.json();
    const ayahs = data?.data?.ayahs;
    if (!Array.isArray(ayahs)) return null;
    const cleaned: QuranAyah[] = ayahs.map((a: { number: number; text: string; numberInSurah: number }) => ({
      number: a.number,
      text: a.text,
      numberInSurah: a.numberInSurah,
    }));
    cacheSurah(surahNum, cleaned);
    return cleaned;
  } catch {
    return getCachedSurah(surahNum);
  }
}

/** React hook: track online status */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return online;
}

/** React hook: one hadith for Subha "dhikr hadiths" carousel. Fetches by index from Forty Hadith Nawawi (1–42), fallback to local list. */
export function useDhikrHadith(
  hadithIdx: number,
  fallbackList: HadithItem[]
): { hadith: HadithItem; loading: boolean } {
  const [hadith, setHadith] = useState<HadithItem>(() => fallbackList[0]!);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const newFallback = fallbackList[hadithIdx % fallbackList.length] ?? fallbackList[0]!;
    setHadith(newFallback);
    setLoading(true);
    let cancelled = false;
    const hadithNo = (hadithIdx % 42) + 1;
    fetchHadith('ara-nawawi', hadithNo).then((h) => {
      if (cancelled) return;
      if (h?.text) setHadith(h);
      else setHadith(newFallback);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [hadithIdx, fallbackList]);

  return { hadith, loading };
}
