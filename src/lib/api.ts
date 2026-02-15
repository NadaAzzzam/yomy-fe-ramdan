/**
 * Free external APIs for Azkar & Hadith — keeps bundle small and avoids loading
 * large static data. All APIs are free, no keys required. Fallback to local data
 * when offline or on fetch error.
 *
 * CACHING: Static data (Quran, hadith, athkar) is cached on device so we don't
 * call APIs repeatedly. Prayer times are cached per day + location. All cache
 * survives app restarts (localStorage).
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
import { isContentSafe, filterSafeContent, stripNonQuranicSuffixes } from './contentPolicy';
import { verifyHadithWithDorar, isKnownSahihSource } from './dorar';

const HADITH_BASE =
  'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';
const ATHKAR_BASE = 'https://athkar-api.cyclic.app';

const API_CACHE_PREFIX = 'yomy-api-cache:';

/** Get cached JSON; returns null if missing or expired. expiresAt: optional timestamp (ms). */
function getApiCache<T>(key: string, expiresAt?: number): T | null {
  try {
    const raw = localStorage.getItem(API_CACHE_PREFIX + key);
    if (!raw) return null;
    if (expiresAt != null && Date.now() > expiresAt) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Store in cache. expiresAt: optional; omit for static data (no expiry). When set, stored as { _exp, data }. */
function setApiCache(key: string, data: unknown, expiresAt?: number): void {
  try {
    const payload = expiresAt != null ? { _exp: expiresAt, data } : data;
    localStorage.setItem(API_CACHE_PREFIX + key, JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
}

/** Get cache entry that was stored with expiresAt (reads _exp from stored object). */
function getApiCacheWithExpiry<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(API_CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { _exp?: number; data?: T };
    if (parsed._exp != null && Date.now() > parsed._exp) return null;
    return (parsed.data ?? parsed) as T;
  } catch {
    return null;
  }
}

/** End of current day (midnight) in ms, for prayer cache TTL. */
function endOfTodayMs(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export type HadithItem = { text: string; source: string; dorarVerified?: boolean };

/** Render hadith HTML safely: <br> → line break, strip other tags. Use with whiteSpace: 'pre-line'. */
export function formatHadithText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '');
}

/** Fetch a single Arabic hadith by book and number. Cached on device (static data). Returns null on error. */
export async function fetchHadith(
  edition: string = 'ara-bukhari',
  hadithNo: number = 1
): Promise<HadithItem | null> {
  const cacheKey = `hadith:${edition}:${hadithNo}`;
  const cached = getApiCache<HadithItem>(cacheKey);
  if (cached?.text && isContentSafe(cached.text)) return cached;
  try {
    const url = `${HADITH_BASE}/editions/${edition}/${hadithNo}.min.json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const h = data?.hadiths?.[0];
    const text = h?.text ?? '';
    const bookName = data?.metadata?.name ?? edition;
    if (!isContentSafe(text)) return null;
    const item: HadithItem = { text, source: bookName };
    setApiCache(cacheKey, item);
    return item;
  } catch {
    return getApiCache<HadithItem>(cacheKey);
  }
}

/** Pick a hadith number from day index (e.g. Ramadan day) so we get variety without loading the whole book. */
export function hadithNoFromDayIndex(dayIndex: number, maxHadith: number = 1500): number {
  return (dayIndex % maxHadith) + 1;
}

export type AthkarItem = { id: string; text: string; counter: number };

/** Fetch morning athkar. Cached on device (static data). Returns [] on error. */
export async function fetchMorningAthkar(): Promise<AthkarItem[]> {
  const cacheKey = 'athkar:morning';
  const cached = getApiCache<AthkarItem[]>(cacheKey);
  if (Array.isArray(cached) && cached.length > 0) return filterSafeContent(cached);
  try {
    const res = await fetch(`${ATHKAR_BASE}/morning`);
    if (!res.ok) return [];
    const data = await res.json();
    let list = Array.isArray(data) ? data : data?.content ?? (data?.id ? [data] : []);
    list = filterSafeContent(list);
    if (list.length > 0) setApiCache(cacheKey, list);
    return list;
  } catch {
    const fallback = getApiCache<AthkarItem[]>(cacheKey);
    return Array.isArray(fallback) ? filterSafeContent(fallback) : [];
  }
}

/** Fetch evening/night athkar. Cached on device (static data). Returns [] on error. */
export async function fetchEveningAthkar(): Promise<AthkarItem[]> {
  const cacheKey = 'athkar:night';
  const cached = getApiCache<AthkarItem[]>(cacheKey);
  if (Array.isArray(cached) && cached.length > 0) return filterSafeContent(cached);
  try {
    const res = await fetch(`${ATHKAR_BASE}/night`);
    if (!res.ok) return [];
    const data = await res.json();
    let list = Array.isArray(data) ? data : data?.content ?? (data?.id ? [data] : []);
    list = filterSafeContent(list);
    if (list.length > 0) setApiCache(cacheKey, list);
    return list;
  } catch {
    const fallback = getApiCache<AthkarItem[]>(cacheKey);
    return Array.isArray(fallback) ? filterSafeContent(fallback) : [];
  }
}

/** React hook: hadith of the day from API with local fallback. Verifies with Dorar when source is not known Sahih. */
export function useHadithOfTheDay(
  dayIndex: number,
  localHadiths: HadithItem[]
): { hadith: HadithItem; loading: boolean; dorarVerified: boolean | null } {
  const [hadith, setHadith] = useState<HadithItem>(() => ({
    ...localHadiths[dayIndex % localHadiths.length]!,
    dorarVerified: undefined,
  }));
  const [loading, setLoading] = useState(true);
  const [dorarVerified, setDorarVerified] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setDorarVerified(null);
    const no = hadithNoFromDayIndex(dayIndex);
    fetchHadith('ara-bukhari', no).then((h) => {
      if (cancelled) return;
      if (h?.text) {
        const fromSahihBook = isKnownSahihSource(h.source);
        setHadith({ ...h, dorarVerified: fromSahihBook });
        setDorarVerified(fromSahihBook ? true : null);
      } else {
        const fallback = localHadiths[dayIndex % localHadiths.length]!;
        setHadith({ ...fallback, dorarVerified: undefined });
        setDorarVerified(null);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [dayIndex, localHadiths]);

  // Background Dorar verification for hadiths not from known Sahih books
  useEffect(() => {
    if (!hadith?.text || loading) return;
    if (isKnownSahihSource(hadith.source)) {
      setDorarVerified(true);
      return;
    }
    let cancelled = false;
    verifyHadithWithDorar(hadith.text).then((r) => {
      if (!cancelled) setDorarVerified(r.verified);
    });
    return () => { cancelled = true; };
  }, [hadith?.text, hadith?.source, loading]);

  return { hadith, loading, dorarVerified };
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

/** Build local date string DD-MM-YYYY (user's timezone). */
function getLocalDateStr(): string {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/** Fetch today's prayer times by city. Cached per day+location until end of day. method: calculation method ID (default 5 = Egyptian). */
export async function fetchPrayerTimes(
  city: string = 'Cairo',
  country: string = 'Egypt',
  method: number = 5
): Promise<PrayerTimings | null> {
  const dateStr = getLocalDateStr();
  const cacheKey = `prayer:${dateStr}:city:${city}:${country}:${method}`;
  const cached = getApiCacheWithExpiry<PrayerTimings>(cacheKey);
  if (cached) return cached;
  try {
    const url = `${ALADHAN_BASE}/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const timings = data?.data?.timings;
    if (!timings) return null;
    // Strip timezone info like " (EET)" — keep only HH:mm
    const clean = (t: string) => (t ?? '').replace(/\s*\(.*\)/, '').trim();
    const result: PrayerTimings = {
      Fajr: clean(timings.Fajr),
      Sunrise: clean(timings.Sunrise),
      Dhuhr: clean(timings.Dhuhr),
      Asr: clean(timings.Asr),
      Maghrib: clean(timings.Maghrib),
      Isha: clean(timings.Isha),
    };
    setApiCache(cacheKey, result, endOfTodayMs());
    return result;
  } catch {
    return getApiCacheWithExpiry<PrayerTimings>(cacheKey);
  }
}

/** Fetch today's prayer times by user coordinates. Cached per day+coords until end of day. */
export async function fetchPrayerTimesByCoords(
  latitude: number,
  longitude: number,
  method: number = 5
): Promise<PrayerTimings | null> {
  const dateStr = getLocalDateStr();
  const cacheKey = `prayer:${dateStr}:coords:${latitude.toFixed(4)}:${longitude.toFixed(4)}:${method}`;
  const cached = getApiCacheWithExpiry<PrayerTimings>(cacheKey);
  if (cached) return cached;
  try {
    const url = `${ALADHAN_BASE}/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${method}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const timings = data?.data?.timings;
    if (!timings) return null;
    const clean = (t: string) => (t ?? '').replace(/\s*\(.*\)/, '').trim();
    const result: PrayerTimings = {
      Fajr: clean(timings.Fajr),
      Sunrise: clean(timings.Sunrise),
      Dhuhr: clean(timings.Dhuhr),
      Asr: clean(timings.Asr),
      Maghrib: clean(timings.Maghrib),
      Isha: clean(timings.Isha),
    };
    setApiCache(cacheKey, result, endOfTodayMs());
    return result;
  } catch {
    return getApiCacheWithExpiry<PrayerTimings>(cacheKey);
  }
}

/** React hook: prayer times for today. Uses coordinates when both provided, else city/country. */
export function usePrayerTimes(
  city: string,
  country: string,
  method: number,
  latitude?: number | null,
  longitude?: number | null
): { times: PrayerTimings | null; loading: boolean; error: boolean } {
  const [times, setTimes] = useState<PrayerTimings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const useCoords =
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    const fetchFn = useCoords
      ? fetchPrayerTimesByCoords(latitude!, longitude!, method)
      : fetchPrayerTimes(city, country, method);
    fetchFn.then((t) => {
      if (cancelled) return;
      if (t) {
        setTimes(t);
        setError(false);
      } else {
        setError(true);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [useCoords, city, country, method, latitude, longitude]);

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

/* ─── Azan Audio Player (offline cache) ─── */

const AZAN_CACHE_NAME = 'yomy-azan-v1';

let currentAudio: HTMLAudioElement | null = null;
let currentBlobUrl: string | null = null;

function openAzanCache(): Promise<Cache | null> {
  if (typeof caches === 'undefined') return Promise.resolve(null);
  return caches.open(AZAN_CACHE_NAME).catch(() => null);
}

/** Get cached azan as a blob URL for playback, or null if not cached. */
export async function getCachedAzanBlobUrl(url: string): Promise<string | null> {
  const cache = await openAzanCache();
  if (!cache) return null;
  try {
    const res = await cache.match(url);
    if (!res || !res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

/** Download azan audio and store in cache for offline use. Uses proxy in dev to avoid CORS. */
export async function downloadAzanForOffline(url: string): Promise<boolean> {
  const cache = await openAzanCache();
  if (!cache) return false;
  try {
    const fetchUrl = getAzanFetchUrl(url);
    const res = await fetch(fetchUrl);
    if (!res.ok) return false;
    await cache.put(url, res);
    return true;
  } catch {
    return false;
  }
}

/** Check if azan for this URL is already cached (available offline). */
export async function isAzanCached(url: string): Promise<boolean> {
  const cache = await openAzanCache();
  if (!cache) return false;
  const res = await cache.match(url);
  return res != null && res.ok;
}

/**
 * In dev, CDN has no CORS; use Vite proxy URL so fetch works. In prod/capacitor use original URL.
 * Strip /audio so we request /aladhan-audio/adhans/... which proxy rewrites to /audio/adhans/...
 */
function getAzanFetchUrl(url: string): string {
  if (import.meta.env.DEV && url.startsWith('https://cdn.aladhan.com/audio/')) {
    return `${window.location.origin}/aladhan-audio${url.slice('https://cdn.aladhan.com/audio'.length)}`;
  }
  return url;
}

/**
 * Resolve playable URL: use cached blob if available; otherwise use remote URL directly.
 * We do not fetch here (CDN has no CORS). Cache is filled only via downloadAzanForOffline.
 * Caller must revoke the returned blob URL when done if it's a blob.
 */
async function resolveAzanPlayUrl(url: string): Promise<{ url: string; isBlob: boolean }> {
  const blobUrl = await getCachedAzanBlobUrl(url);
  if (blobUrl) return { url: blobUrl, isBlob: true };
  return { url, isBlob: false };
}

/**
 * Play an azan sound from URL. Uses cached copy when available (offline); otherwise
 * fetches once and caches for next time. Stops any currently playing azan.
 * Returns a promise that resolves with the audio element if playback started,
 * or null if playback failed.
 */
export function playAzan(url: string): Promise<HTMLAudioElement | null> {
  return new Promise((resolve) => {
    (async () => {
      try {
        stopAzan();
        const { url: playUrl, isBlob } = await resolveAzanPlayUrl(url);
        if (isBlob) currentBlobUrl = playUrl;

        const audio = new Audio(playUrl);
        audio.volume = 1.0;
        currentAudio = audio;

        const cleanup = () => {
          audio.removeEventListener('error', onError);
          if (currentAudio === audio) currentAudio = null;
          if (currentBlobUrl === playUrl && isBlob) {
            URL.revokeObjectURL(playUrl);
            currentBlobUrl = null;
          }
        };

        const onError = () => {
          cleanup();
          stopAzan();
          resolve(null);
        };

        audio.addEventListener('error', onError);
        audio.addEventListener('ended', () => {
          if (currentAudio === audio) currentAudio = null;
          if (currentBlobUrl === playUrl && isBlob) {
            URL.revokeObjectURL(playUrl);
            currentBlobUrl = null;
          }
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
    })();
  });
}

/** Stop currently playing azan */
export function stopAzan(): void {
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }
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
const QURAN_PAGE_CACHE_PREFIX = 'yomy-quran-page-';
export const QURAN_TOTAL_PAGES = 604;

export type QuranAyah = {
  number: number;
  text: string;
  numberInSurah: number;
};

/** Single ayah as returned in a page (includes surah info) */
export type QuranPageAyah = {
  text: string;
  numberInSurah: number;
  surah: { number: number; name: string };
};

/** One page of the Mus'haf (standard 604-page layout) */
export type QuranPageData = {
  pageNumber: number;
  ayahs: QuranPageAyah[];
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

function getCachedPage(pageNum: number): QuranPageData | null {
  try {
    const raw = localStorage.getItem(QURAN_PAGE_CACHE_PREFIX + pageNum);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function cachePage(data: QuranPageData): void {
  try {
    localStorage.setItem(QURAN_PAGE_CACHE_PREFIX + data.pageNumber, JSON.stringify(data));
  } catch { /* ignore quota */ }
}

/** Check if a surah is cached locally */
export function isSurahCached(num: number): boolean {
  return getCachedSurah(num) !== null;
}

/** Check if a page is cached locally (for offline) */
export function isQuranPageCached(pageNum: number): boolean {
  return getCachedPage(pageNum) !== null;
}

/** Fetch one page of the Quran (1–604, Mus'haf layout). Cached for offline. Ayah text is stripped of non-Quranic suffixes (e.g. وصدق الله العظيم). */
export async function fetchQuranPage(pageNum: number): Promise<QuranPageData | null> {
  if (pageNum < 1 || pageNum > QURAN_TOTAL_PAGES) return null;
  const cached = getCachedPage(pageNum);
  if (cached) return stripPageAyahs(cached);
  if (typeof navigator !== 'undefined' && !navigator.onLine) return null;
  try {
    const res = await fetch(`${QURAN_API}/page/${pageNum}`);
    if (!res.ok) return null;
    const data = await res.json();
    const ayahs = data?.data?.ayahs;
    if (!Array.isArray(ayahs)) return null;
    const cleaned: QuranPageData = {
      pageNumber: pageNum,
      ayahs: ayahs.map((a: { text: string; numberInSurah: number; surah: { number: number; name: string } }) => ({
        text: stripNonQuranicSuffixes(a.text),
        numberInSurah: a.numberInSurah,
        surah: { number: a.surah.number, name: a.surah.name },
      })),
    };
    cachePage(cleaned);
    return cleaned;
  } catch {
    const fallback = getCachedPage(pageNum);
    return fallback ? stripPageAyahs(fallback) : null;
  }
}

function stripPageAyahs(page: QuranPageData): QuranPageData {
  return {
    pageNumber: page.pageNumber,
    ayahs: page.ayahs.map((a) => ({ ...a, text: stripNonQuranicSuffixes(a.text) })),
  };
}

/** Fetch surah text (Hafs/Uthmani) from API with local cache. Ayah text is stripped of non-Quranic suffixes. Returns null on error/offline. */
export async function fetchSurahText(surahNum: number): Promise<QuranAyah[] | null> {
  const cached = getCachedSurah(surahNum);
  if (cached) return cached.map((a) => ({ ...a, text: stripNonQuranicSuffixes(a.text) }));
  if (typeof navigator !== 'undefined' && !navigator.onLine) return null;
  try {
    const res = await fetch(`${QURAN_API}/surah/${surahNum}`);
    if (!res.ok) return null;
    const data = await res.json();
    const ayahs = data?.data?.ayahs;
    if (!Array.isArray(ayahs)) return null;
    const cleaned: QuranAyah[] = ayahs.map((a: { number: number; text: string; numberInSurah: number }) => ({
      number: a.number,
      text: stripNonQuranicSuffixes(a.text),
      numberInSurah: a.numberInSurah,
    }));
    cacheSurah(surahNum, cleaned);
    return cleaned;
  } catch {
    const fallback = getCachedSurah(surahNum);
    return fallback ? fallback.map((a) => ({ ...a, text: stripNonQuranicSuffixes(a.text) })) : null;
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

/** React hook: one hadith for Subha "dhikr hadiths" carousel. Fetches by index from Forty Hadith Nawawi (1–42), fallback to local list. Verifies with Dorar when using fallback. */
export function useDhikrHadith(
  hadithIdx: number,
  fallbackList: HadithItem[]
): { hadith: HadithItem; loading: boolean; dorarVerified: boolean | null } {
  const [hadith, setHadith] = useState<HadithItem>(() => ({ ...fallbackList[0]!, dorarVerified: undefined }));
  const [loading, setLoading] = useState(true);
  const [dorarVerified, setDorarVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const newFallback = fallbackList[hadithIdx % fallbackList.length] ?? fallbackList[0]!;
    setHadith({ ...newFallback, dorarVerified: undefined });
    setLoading(true);
    setDorarVerified(null);
    let cancelled = false;
    const hadithNo = (hadithIdx % 42) + 1;
    fetchHadith('ara-nawawi', hadithNo).then((h) => {
      if (cancelled) return;
      if (h?.text) {
        const fromSahih = isKnownSahihSource(h.source);
        setHadith({ ...h, dorarVerified: fromSahih });
        setDorarVerified(fromSahih ? true : null);
      } else {
        setHadith({ ...newFallback, dorarVerified: undefined });
        setDorarVerified(null);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [hadithIdx, fallbackList]);

  useEffect(() => {
    if (!hadith?.text || loading) return;
    if (isKnownSahihSource(hadith.source)) {
      setDorarVerified(true);
      return;
    }
    let cancelled = false;
    verifyHadithWithDorar(hadith.text).then((r) => {
      if (!cancelled) setDorarVerified(r.verified);
    });
    return () => { cancelled = true; };
  }, [hadith?.text, hadith?.source, loading]);

  return { hadith, loading, dorarVerified };
}
