/**
 * Daily ayah for tadabbor (آية اليوم للتدبر).
 * One source for both the Home card and the Tafsir challenge modal.
 * Tries Dorar tafsir API for the selected ayah per day; falls back to local reflection.
 */

import { useState, useEffect } from 'react';
import type { QuranReflection } from './data';
import { fetchTafsirFromDorar } from './dorar';

export type DailyTafsir = {
  surah: string;
  surahNumber: number;
  ayah: number;
  arabic: string;
  tafsirText: string;
  tags: string[];
  /** When Dorar returns tafsir we set 'dorar'; otherwise 'local' (our reflection). */
  source: 'dorar' | 'local';
};

function reflectionToDailyTafsir(r: QuranReflection): DailyTafsir {
  return {
    surah: r.surah,
    surahNumber: r.surahNumber,
    ayah: r.ayah,
    arabic: r.arabic,
    tafsirText: r.reflection,
    tags: r.tags,
    source: 'local',
  };
}

/** Sync: daily ayah + local reflection. Caller passes the reflections array to avoid load-order issues. */
export function getDailyTafsirSync(dayIdx: number, reflections: QuranReflection[]): DailyTafsir {
  const r = reflections[dayIdx % reflections.length]!;
  return reflectionToDailyTafsir(r);
}

/** Hook: returns daily ayah + tafsir. Pass DAILY_QURAN_REFLECTIONS from the caller (e.g. Home). */
export function useDailyTafsir(dayIdx: number, reflections: QuranReflection[]): { data: DailyTafsir; loading: boolean } {
  const base = getDailyTafsirSync(dayIdx, reflections);
  const [data, setData] = useState<DailyTafsir>(base);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const b = getDailyTafsirSync(dayIdx, reflections);
    setData(b);
    let cancelled = false;
    setLoading(true);
    fetchTafsirFromDorar(b.surahNumber, b.ayah)
      .then((dorarText) => {
        if (cancelled || dorarText == null) return;
        setData((prev) => ({
          ...prev,
          tafsirText: dorarText,
          source: 'dorar',
        }));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dayIdx, reflections]);

  return { data, loading };
}
