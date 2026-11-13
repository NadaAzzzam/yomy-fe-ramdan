import { Capacitor, registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useEffect } from 'react';
import type { AppState } from './state';
import { AZAN_SOUNDS } from './data';
import { playAzan } from './api';

type Alarm = { at: number; label: string };
const NativeAzan = registerPlugin<{
  schedule(options: { alarms: Alarm[]; url: string }): Promise<void>;
  cancel(): Promise<void>;
  status(): Promise<{ exact: boolean }>;
  openSettings(): Promise<void>;
}>('Azan');
const prayers = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' } as const;
export const isAndroidAzan = () => Capacitor.getPlatform() === 'android';
export const openAzanSettings = async () => {
  await LocalNotifications.requestPermissions();
  await NativeAzan.openSettings();
};
let azanStatus = 'جاري التحقق من مواعيد الأذان والأذونات…';
export const getAzanStatus = () => azanStatus;

export function buildAzanAlarms(days: { date: { gregorian: { date: string } }; timings: Record<string, string> }[], now = Date.now()): Alarm[] {
  return days.flatMap(day => {
    const [d, m, y] = day.date.gregorian.date.split('-').map(Number);
    return Object.entries(prayers).flatMap(([key, label]) => {
      const match = day.timings[key]?.match(/^(\d{1,2}):(\d{2})/);
      if (!match) return [];
      const hour = Number(match[1]), minute = Number(match[2]);
      if (hour > 23 || minute > 59) return [];
      const at = new Date(y, m - 1, d, hour, minute).getTime();
      return at > now && at < now + 30 * 86400000 ? [{ at, label }] : [];
    });
  }).sort((a, b) => a.at - b.at);
}

export function useAzanScheduler(state: AppState) {
  useEffect(() => {
    let disposed = false;
    let alarms: Alarm[] = [];
    let lastPlayed = 0;
    const sound = AZAN_SOUNDS.find(s => s.id === state.selectedAzan) ?? AZAN_SOUNDS[0];
    const report = (message: string) => { azanStatus = message; window.dispatchEvent(new CustomEvent('azan-status', { detail: message })); };
    const refresh = async () => {
      if (!state.azanEnabled || !sound) {
        if (isAndroidAzan()) await NativeAzan.cancel();
        return;
      }
      try {
        if (isAndroidAzan()) {
          const permission = await LocalNotifications.checkPermissions();
          if (permission.display !== 'granted') {
            report('اسمح بالإشعارات من إعدادات التطبيق لتفعيل الأذان');
            return;
          }
          if (!(await NativeAzan.status()).exact) {
            report('اسمح بالمنبهات والتذكيرات لتشغيل الأذان في موعده');
            return;
          }
        }
        const now = new Date();
        const months = [new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 1)];
        const coords = Number.isFinite(state.prayerLatitude) && Number.isFinite(state.prayerLongitude);
        const query = new URLSearchParams({ method: String(state.prayerMethod) });
        if (coords) {
          query.set('latitude', String(state.prayerLatitude));
          query.set('longitude', String(state.prayerLongitude));
        } else {
          query.set('city', state.prayerCity);
          query.set('country', state.prayerCountry);
        }
        const days = await Promise.all(months.map(async month => {
          const endpoint = coords ? 'calendar' : 'calendarByCity';
          const response = await fetch(`https://api.aladhan.com/v1/${endpoint}/${month.getFullYear()}/${month.getMonth() + 1}?${query}`, { signal: AbortSignal.timeout(20000) });
          if (!response.ok) throw new Error('prayer calendar unavailable');
          const result = await response.json();
          if (!Array.isArray(result.data)) throw new Error('invalid prayer calendar');
          return result.data;
        }));
        if (disposed) return;
        alarms = buildAzanAlarms(days.flat());
        if (!alarms.length) throw new Error('empty prayer calendar');
        if (isAndroidAzan()) {
          await NativeAzan.schedule({ alarms, url: sound.url });
          if (!disposed) report('الأذان جاهز تلقائياً لمدة ٣٠ يوماً، حتى في الخلفية. افتح التطبيق لتجديد المواعيد');
        } else {
          report('الأذان متاح أثناء فتح التطبيق؛ قد يتطلب المتصفح تشغيل المعاينة أولاً. الخلفية تحتاج نسخة Android');
        }
      } catch {
        if (!disposed) report('تعذّر تحديث الأذان. تحقق من الإنترنت والأذونات ثم أعد المحاولة');
      }
    };
    // Serialize refreshes so an older download cannot overwrite newer preferences.
    const task = azanQueue.then(() => disposed ? undefined : refresh());
    azanQueue = task.catch(() => {});
    const onFocus = () => { azanQueue = azanQueue.then(() => disposed ? undefined : refresh()).catch(() => {}); };
    const timer = window.setInterval(() => {
      if (!isAndroidAzan() && state.azanEnabled && document.visibilityState === 'visible') {
        const due = alarms.find(a => a.at > lastPlayed && Date.now() >= a.at && Date.now() - a.at < 60000);
        if (due && sound) {
          lastPlayed = due.at;
          void playAzan(sound.url).then(audio => { if (!audio) report('اضغط معاينة الأذان للسماح بالصوت في المتصفح'); });
        }
      }
    }, 1000);
    window.addEventListener('focus', onFocus);
    return () => { disposed = true; clearInterval(timer); window.removeEventListener('focus', onFocus); };
  }, [state.azanEnabled, state.selectedAzan, state.prayerCity, state.prayerCountry, state.prayerMethod, state.prayerLatitude, state.prayerLongitude, state.lastSeenDate]);
}
let azanQueue: Promise<unknown> = Promise.resolve();
