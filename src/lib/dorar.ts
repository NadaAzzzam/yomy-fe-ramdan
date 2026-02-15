/**
 * Dorar.net hadith verification (الموسوعة الحديثية).
 * API: https://dorar.net/dorar_api.json?skey=SEARCH_TERM
 * Used to ensure hadiths shown in the app are authenticated as Sahih when possible.
 * @see https://dorar.net/hadith
 */

const DORAR_API = 'https://dorar.net/dorar_api.json';
/** In dev we use Vite proxy to avoid CORS. In production, use CORS proxy fallback when direct fetch fails. */
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const CACHE_PREFIX = 'yomy-dorar:';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Ruling text that indicates Sahih (authentic) in Dorar results */
const SAHIH_INDICATORS = [
  'صحيح',
  'إسناده صحيح',
  'أخرجه في صحيحه',
  'رجال أحمد رجال الصحيح',
  'إسناده صحيح على شرط مسلم',
];

/** Ruling text that indicates weak/fake — we exclude these */
const WEAK_INDICATORS = ['ضعيف', 'موضوع', 'لا يصح', 'منكر', 'مُنكر'];

export type DorarVerifyResult = {
  verified: boolean;
  source?: string;
  detail?: string;
};

function getDorarCacheKey(skey: string): string {
  return CACHE_PREFIX + encodeURIComponent(skey.trim());
}

function getCachedVerify(skey: string): DorarVerifyResult | null {
  try {
    const raw = localStorage.getItem(getDorarCacheKey(skey));
    if (!raw) return null;
    const { exp, data } = JSON.parse(raw) as { exp: number; data: DorarVerifyResult };
    if (Date.now() > exp) return null;
    return data;
  } catch {
    return null;
  }
}

function setCachedVerify(skey: string, result: DorarVerifyResult): void {
  try {
    const exp = Date.now() + CACHE_TTL_MS;
    localStorage.setItem(getDorarCacheKey(skey), JSON.stringify({ exp, data: result }));
  } catch {
    /* ignore */
  }
}

/**
 * Extract a short search key from hadith text (first meaningful words, max ~40 chars)
 * so Dorar search returns relevant results.
 */
export function hadithTextToSearchKey(text: string, maxWords: number = 8): string {
  if (!text || typeof text !== 'string') return '';
  const cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove some diacritics for broader match
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(' ');
}

/**
 * Parse Dorar API HTML result and return true if at least one hadith entry
 * has a Sahih (صحيح) ruling from the scholar.
 */
function parseDorarResultHtml(html: string): DorarVerifyResult {
  if (!html || typeof html !== 'string') return { verified: false, detail: 'empty' };

  // Entries are separated by "--------------" or similar; each has "خلاصة حكم المحدث: ... صحيح"
  const rulingBlocks = html.split(/---------\s*/);
  for (const block of rulingBlocks) {
    // Match "خلاصة حكم المحدث:" then content until </span> or </div>
    const rulingMatch = block.match(/خلاصة\s+حكم\s+المحدث[:\s]*<\/span>\s*([^<]+)/i)
      || block.match(/خلاصة\s+حكم\s+المحدث[^>]*>([^<]+)/i);
    const ruling = rulingMatch ? rulingMatch[1].trim() : '';
    if (!ruling) continue;

    const rulingLower = ruling;
    const isWeak = WEAK_INDICATORS.some((w) => rulingLower.includes(w));
    if (isWeak) continue;

    const isSahih = SAHIH_INDICATORS.some((s) => rulingLower.includes(s));
    if (isSahih) return { verified: true, detail: ruling };
  }

  return { verified: false, detail: 'no_sahih_ruling' };
}

/**
 * Fetch Dorar API. In dev uses Vite proxy (/api/dorar) to avoid CORS. Otherwise tries direct, then CORS proxy.
 */
async function fetchDorarJson(skey: string): Promise<{ ahadith?: { result?: string } } | null> {
  const query = `skey=${encodeURIComponent(skey)}`;
  const directUrl = `${DORAR_API}?${query}`;

  const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
  const proxyUrl = isDev ? `/api/dorar?${query}` : null;

  const tryFetch = async (url: string, opts?: RequestInit): Promise<Response> => {
    return fetch(url, {
      ...opts,
      headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible; YomyApp/1)', ...opts?.headers },
    });
  };

  // 1) In dev use proxy so same-origin, no CORS
  if (proxyUrl) {
    const res = await tryFetch(proxyUrl);
    if (res.ok) return res.json() as Promise<{ ahadith?: { result?: string } }>;
  }

  // 2) Direct (works in Capacitor/native or same-origin)
  try {
    const res = await tryFetch(directUrl);
    if (res.ok) return res.json() as Promise<{ ahadith?: { result?: string } }>;
  } catch {
    /* CORS or network */
  }

  // 3) CORS proxy fallback for browser when Dorar blocks origin
  try {
    const res = await tryFetch(CORS_PROXY + encodeURIComponent(directUrl));
    if (!res.ok) return null;
    const text = await res.text();
    try {
      return JSON.parse(text) as { ahadith?: { result?: string } };
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

/**
 * Search Dorar.net for hadith by key phrase. Returns verification result.
 * Results are cached by search key for 30 days.
 */
export async function verifyHadithWithDorar(hadithText: string): Promise<DorarVerifyResult> {
  const skey = hadithTextToSearchKey(hadithText);
  if (!skey) return { verified: false, detail: 'empty_skey' };

  const cached = getCachedVerify(skey);
  if (cached !== null) return cached;

  try {
    const data = await fetchDorarJson(skey);
    if (!data) {
      const result: DorarVerifyResult = { verified: false, detail: 'network_error' };
      setCachedVerify(skey, result);
      return result;
    }
    const html = data?.ahadith?.result ?? '';
    const result = parseDorarResultHtml(html);
    setCachedVerify(skey, result);
    return result;
  } catch (e) {
    const result: DorarVerifyResult = {
      verified: false,
      detail: e instanceof Error ? e.message : 'network_error',
    };
    setCachedVerify(skey, result);
    return result;
  }
}

/**
 * Check if a hadith item is from a known Sahih source (Bukhari, Muslim, agreed).
 * Used to skip Dorar lookup when we already know the source is authentic.
 */
export function isKnownSahihSource(source: string): boolean {
  if (!source) return false;
  const s = source.trim();
  return (
    s.includes('البخاري') ||
    s.includes('مسلم') ||
    s.includes('متفق عليه') ||
    s.includes('أخرجه البخاري') ||
    s.includes('صحيح البخاري') ||
    s.includes('صحيح مسلم') ||
    s.includes('صحيح الجامع') ||
    s.includes('صحيح ابن حبان') ||
    s.includes('إسناده صحيح')
  );
}

/* ─── Tafsir (موسوعة التفسير) ─── */
const DORAR_TAFSIR_CACHE_PREFIX = 'yomy-dorar-tafsir:';
const TAFSIR_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Try to fetch tafsir for one ayah from Dorar. Returns null if endpoint not available or parse fails. */
export async function fetchTafsirFromDorar(
  surahNumber: number,
  ayah: number,
): Promise<string | null> {
  const cacheKey = `${surahNumber}_${ayah}`;
  const stored = getTafsirCached(cacheKey);
  if (stored !== undefined) return stored.length > 0 ? stored : null;

  const skey = `${surahNumber}_${ayah}`;
  const query = `skey=${encodeURIComponent(skey)}`;
  const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
  const base = isDev ? '/api/dorar' : DORAR_API;
  const url = `${base}?${query}`;

  try {
    let res: Response;
    if (isDev) {
      res = await fetch(url, { headers: { Accept: 'application/json' } });
    } else {
      try {
        res = await fetch(`${DORAR_API}?${query}`, { headers: { Accept: 'application/json' } });
      } catch {
        res = await fetch(CORS_PROXY + encodeURIComponent(`${DORAR_API}?${query}`));
      }
    }
    if (!res.ok) {
      setTafsirCached(cacheKey, '');
      return null;
    }
    const data = (await res.json()) as { ahadith?: { result?: string }; tafaseer?: { result?: string }; result?: string };
    const html =
      data?.tafaseer?.result ?? (data as { tafsir?: string }).tafsir ?? data?.ahadith?.result ?? data?.result ?? '';
    if (!html || typeof html !== 'string') {
      setTafsirCached(cacheKey, '');
      return null;
    }
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length < 20) {
      setTafsirCached(cacheKey, '');
      return null;
    }
    setTafsirCached(cacheKey, text);
    return text;
  } catch {
    setTafsirCached(cacheKey, '');
    return null;
  }
}

/** Returns cached tafsir string, or '' if cached as no result, or undefined if missing/expired. */
function getTafsirCached(key: string): string | undefined {
  try {
    const raw = localStorage.getItem(DORAR_TAFSIR_CACHE_PREFIX + key);
    if (!raw) return undefined;
    const { exp, text } = JSON.parse(raw) as { exp: number; text: string };
    if (Date.now() > exp) return undefined;
    return text;
  } catch {
    return undefined;
  }
}

function setTafsirCached(key: string, text: string | null): void {
  try {
    const exp = Date.now() + TAFSIR_CACHE_TTL_MS;
    localStorage.setItem(DORAR_TAFSIR_CACHE_PREFIX + key, JSON.stringify({ exp, text }));
  } catch {
    /* ignore */
  }
}
