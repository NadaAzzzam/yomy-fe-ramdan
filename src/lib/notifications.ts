/**
 * Notifications: random dua at user-chosen time + Egyptian Arabic reminder messages.
 * Uses Capacitor Local Notifications for native support (works when app is closed).
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const REMINDER_MESSAGES_AR: string[] = [
  'تعالى افتح التطبيق واكمل مهامك 🌙',
  'استمر، أنت قدها! كمل شوية وخلص',
  'روح افتح يومي وشاف بقى إيه اللي باقي',
  'متنساش تزورنا وتكمل الدفتر 🤲',
  'شوف تقريرك اليوم وإيه اللي عملته',
  'تعالى نكمل بعض — افتح يومي',
  'افتح التطبيق واكمل شغلك',
  'تذكير: عندك مهام اليوم متنسهاش',
  'استنى إيه؟ تعالى! 🌙',
  'روح يومي واكمل اللي عليك',
  'وقتك غالي — افتح التطبيق واكمل',
  'خلص مهامك وارتاح بالك',
  'كل شوية وانت فاتح نكمل مع بعض',
  'افتكر هدفك وافتح يومي',
  'متبقاش كتير — تعالى كمل',
];

/** Challenge-specific reminders */
export const CHALLENGE_REMINDERS: string[] = [
  '🤲 متنساش الدعاء قبل المغرب — دعوة الصائم لا تُرد!',
  '📿 فكّرك تسبّح — سبحان الله وبحمده ١٠٠ مرة',
  '☀️ فاكر أذكار الصباح؟ حصنك اليوم!',
  '🌅 وقت أذكار المساء — متفوتهاش',
  '💰 صدقة اليوم ولو بسيطة — الصدقة تطفئ الخطيئة',
  '📖 افتح المصحف ولو صفحة — القرآن يشفع لصاحبه',
  '🕌 صلّي النوافل — بيت في الجنة!',
  '🌙 قيام الليل — أقرب ما يكون العبد من ربه',
];

/** Last 10 nights special reminders */
export const LAST_TEN_NIGHTS_REMINDERS: string[] = [
  '✨ العشر الأواخر — اجتهد الليلة! قد تكون ليلة القدر',
  '🤲 اللهم إنك عفو تحب العفو فاعفُ عنا',
  '🌙 أحيِ هذه الليلة — خير من ألف شهر!',
  '📖 أكثر من القرآن والدعاء في هذه الليالي المباركة',
  '💎 لا تضيّع ليالي العشر — كل ليلة ممكن تكون ليلة القدر',
];

/** Salah ala el naby messages */
export const SALAH_ALA_NABY_MESSAGES: string[] = [
  'اللهم صل على محمد وعلى آل محمد كما صليت على إبراهيم وعلى آل إبراهيم',
  'اللهم بارك على محمد وعلى آل محمد كما باركت على إبراهيم وعلى آل إبراهيم',
  'صلى الله عليه وسلم — أكثر من الصلاة على النبي اليوم 💚',
  'اللهم صل وسلم وبارك على سيدنا محمد',
  'اللهم صل على محمد النبي الأمي وعلى آله وصحبه وسلم تسليماً',
];

// Notification channel IDs
const CHANNEL_DUA = 1000;
const CHANNEL_REMINDER_START = 2000;
const CHANNEL_CHALLENGE_START = 3000;
const CHANNEL_LAST_TEN = 4000;
const CHANNEL_SALAH_ALA_NABY_START = 5000;

// Notification interval options (in minutes)
export const NOTIFICATION_INTERVALS = [
  { value: 5, label: '5 دقائق' },
  { value: 10, label: '10 دقائق' },
  { value: 15, label: '15 دقيقة' },
  { value: 30, label: '30 دقيقة' },
  { value: 60, label: 'ساعة' },
  { value: 120, label: 'ساعتين' },
] as const;

/** Request permission for notifications. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    // Web fallback
    if (typeof window === 'undefined') return false;
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }

  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return false;
  }
}

/** Parse "HH:mm" or "H:mm" to { hour, minute }. */
export function parseTime(timeStr: string): { hour: number; minute: number } | null {
  const m = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hour = parseInt(m[1]!, 10);
  const minute = parseInt(m[2]!, 10);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Get next occurrence of HH:mm (today or tomorrow) */
function getNextOccurrence(hour: number, minute: number): Date {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

/** Get date after specified minutes from now */
function getDateAfterMinutes(minutes: number): Date {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60 * 1000);
}

/** Show a web notification (fallback for web platform) */
function showWebNotification(title: string, body: string): void {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/favicon.ico' });
  } catch {
    // ignore
  }
}

/**
 * Schedule all notifications:
 * - If duaNotificationInterval is set and duas exist: recurring dua notification at the specified interval.
 * - If remindersEnabled: Egyptian Arabic reminders at 9:00, 14:00, 20:00 + challenge reminders.
 * - If in last 10 nights of Ramadan: special notification at 10pm.
 * - Salah ala el naby notifications at user-defined intervals.
 * Call after permission is granted and when state changes.
 */
export async function scheduleNotifications(
  duas: { text: string; day: string }[],
  duaNotificationInterval: number | null, // in minutes
  remindersEnabled: boolean,
  ramadanDay?: number,
  salahAlaNabyInterval?: number | null, // in minutes
  soundEnabled?: boolean // whether to play sound with notifications
): Promise<void> {
  // Cancel all existing notifications first
  await cancelScheduledNotifications();

  const granted = await requestNotificationPermission();
  if (!granted) return;

  const notifications: {
    title: string;
    body: string;
    id: number;
    schedule: { at: Date; repeats?: boolean; every?: 'day' | 'week' | 'month' | 'year' };
    sound?: string;
    silent?: boolean;
  }[] = [];

  // 1. Recurring dua notification (schedule multiple throughout the day)
  if (duaNotificationInterval && duas.length > 0) {
    // Schedule notifications for the next 24 hours at the specified interval
    const maxNotifications = Math.floor((24 * 60) / duaNotificationInterval);
    const notificationsToSchedule = Math.min(maxNotifications, 20); // Cap at 20 to avoid too many
    
    for (let i = 0; i < notificationsToSchedule; i++) {
      const dua = pickRandom(duas);
      if (dua) {
        const minutesOffset = duaNotificationInterval * (i + 1);
        const nextAt = getDateAfterMinutes(minutesOffset);
        notifications.push({
          id: CHANNEL_DUA + i,
          title: '🤲 تذكير الدعاء',
          body: dua.text.length > 120 ? dua.text.slice(0, 117) + '...' : dua.text,
          schedule: { at: nextAt },
          ...(soundEnabled === false && { silent: true }),
        });
      }
    }
  }

  // 2. Motivational reminders
  if (remindersEnabled) {
    const reminderHours = [9, 14, 20]; // 9am, 2pm, 8pm
    reminderHours.forEach((hour, index) => {
      const msg = pickRandom(REMINDER_MESSAGES_AR);
      if (msg) {
        const nextAt = getNextOccurrence(hour, 0);
        notifications.push({
          id: CHANNEL_REMINDER_START + index,
          title: 'يومي 🌙',
          body: msg,
          schedule: { at: nextAt, repeats: true, every: 'day' },
          ...(soundEnabled === false && { silent: true }),
        });
      }
    });

    // 3. Challenge reminders
    const challengeHours = [15, 18]; // 3pm, 6pm
    challengeHours.forEach((hour, index) => {
      const msg = pickRandom(CHALLENGE_REMINDERS);
      if (msg) {
        const nextAt = getNextOccurrence(hour, 30);
        notifications.push({
          id: CHANNEL_CHALLENGE_START + index,
          title: 'تحدي رمضان 🌙',
          body: msg,
          schedule: { at: nextAt, repeats: true, every: 'day' },
          ...(soundEnabled === false && { silent: true }),
        });
      }
    });

    // 4. Last 10 nights special notification
    if (ramadanDay != null && ramadanDay >= 21 && ramadanDay <= 30) {
      const msg = pickRandom(LAST_TEN_NIGHTS_REMINDERS);
      if (msg) {
        const nextAt = getNextOccurrence(22, 0); // 10pm
        notifications.push({
          id: CHANNEL_LAST_TEN,
          title: 'العشر الأواخر ✨',
          body: msg,
          schedule: { at: nextAt, repeats: true, every: 'day' },
          ...(soundEnabled === false && { silent: true }),
        });
      }
    }
  }

  // 5. Salah ala el naby notifications (schedule multiple throughout the day)
  if (salahAlaNabyInterval) {
    // Schedule notifications for the next 24 hours at the specified interval
    const maxNotifications = Math.floor((24 * 60) / salahAlaNabyInterval);
    const notificationsToSchedule = Math.min(maxNotifications, 20); // Cap at 20
    
    for (let i = 0; i < notificationsToSchedule; i++) {
      const msg = pickRandom(SALAH_ALA_NABY_MESSAGES);
      if (msg) {
        const minutesOffset = salahAlaNabyInterval * (i + 1);
        const nextAt = getDateAfterMinutes(minutesOffset);
        notifications.push({
          id: CHANNEL_SALAH_ALA_NABY_START + i,
          title: 'الصلاة على النبي 💚',
          body: msg,
          schedule: { at: nextAt },
          ...(soundEnabled === false && { silent: true }),
        });
      }
    }
  }

  // Schedule all notifications
  if (notifications.length > 0) {
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: notifications.map(n => ({
            id: n.id,
            title: n.title,
            body: n.body,
            schedule: n.schedule,
            ...(n.silent !== undefined && { silent: n.silent }),
          })),
        });
        console.log(`Scheduled ${notifications.length} notifications`);
      } catch (error) {
        console.error('Failed to schedule notifications:', error);
      }
    } else {
      // Web fallback: show next notification immediately for testing
      const nextNotif = notifications[0];
      if (nextNotif) {
        showWebNotification(nextNotif.title, nextNotif.body);
      }
    }
  }
}

/** Speak notification text using Text-to-Speech (Arabic voice) */
export async function speakNotificationText(text: string): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  
  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA'; // Arabic (Saudi Arabia)
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to use an Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(voice => voice.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Failed to speak text:', error);
  }
}

/**
 * Set up notification listeners to trigger text-to-speech when notifications are received/clicked.
 * Call this once during app initialization.
 */
export function setupNotificationListeners(voiceEnabled: boolean): void {
  if (!Capacitor.isNativePlatform()) return;
  
  // Listen for when notification is received (shown)
  LocalNotifications.addListener('localNotificationReceived', (notification) => {
    if (voiceEnabled && notification.body) {
      speakNotificationText(notification.body);
    }
  });
  
  // Listen for when user taps on notification
  LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
    if (voiceEnabled && notificationAction.notification.body) {
      speakNotificationText(notificationAction.notification.body);
    }
  });
}

/** Cancel all scheduled notifications */
export async function cancelScheduledNotifications(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      const idsToCancel = [
        // Dua notifications (up to 20)
        ...Array.from({ length: 20 }, (_, i) => ({ id: CHANNEL_DUA + i })),
        // Regular reminders
        { id: CHANNEL_REMINDER_START },
        { id: CHANNEL_REMINDER_START + 1 },
        { id: CHANNEL_REMINDER_START + 2 },
        // Challenge reminders
        { id: CHANNEL_CHALLENGE_START },
        { id: CHANNEL_CHALLENGE_START + 1 },
        // Last 10 nights
        { id: CHANNEL_LAST_TEN },
        // Salah ala naby notifications (up to 20)
        ...Array.from({ length: 20 }, (_, i) => ({ id: CHANNEL_SALAH_ALA_NABY_START + i })),
      ];
      
      await LocalNotifications.cancel({ notifications: idsToCancel });
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }
}
