/**
 * Notifications: random dua at user-chosen time + Egyptian Arabic reminder messages.
 * Uses Web Notifications in browser; for "when app is closed" on mobile, add
 * @capacitor/local-notifications and use native scheduling (see scheduleWithCapacitor).
 */

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

const DUA_CHANNEL_ID = 'yomy-dua';
const REMINDER_CHANNEL_ID = 'yomy-reminder';

let scheduledTimeouts: ReturnType<typeof setTimeout>[] = [];

function clearScheduledTimeouts() {
  scheduledTimeouts.forEach((t) => clearTimeout(t));
  scheduledTimeouts = [];
}

/** Request permission for notifications. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const perm = await Notification.requestPermission();
  return perm === 'granted';
}

/** Pick next occurrence of HH:mm (today or tomorrow). */
function getNextAt(hour: number, minute: number): Date {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next;
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

/** Show a browser notification (Web Notifications API). */
function showWebNotification(title: string, body: string, tag?: string): void {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, tag: tag ?? 'yomy', icon: '/favicon.ico' });
  } catch {
    // ignore
  }
}

/** Schedule one random dua notification at the next occurrence of (hour, minute). */
function scheduleNextDuaWeb(duas: { text: string }[], hour: number, minute: number): void {
  if (duas.length === 0) return;
  const next = getNextAt(hour, minute);
  const ms = next.getTime() - Date.now();
  if (ms <= 0) return;
  const t = setTimeout(() => {
    const dua = pickRandom(duas);
    if (dua) {
      showWebNotification('🤲 الدعاء قبل المغرب', dua.text.length > 120 ? dua.text.slice(0, 117) + '...' : dua.text, DUA_CHANNEL_ID);
    }
    scheduleNextDuaWeb(duas, hour, minute); // reschedule for next day (when app is open)
  }, ms);
  scheduledTimeouts.push(t);
}

/** Schedule next reminder (Egyptian Arabic) at one of the reminder hours. */
const REMINDER_HOURS = [9, 14, 20]; // 9am, 2pm, 8pm
function scheduleNextReminderWeb(): void {
  const now = Date.now();
  let nextAt: Date | null = null;
  for (const hour of REMINDER_HOURS) {
    const n = getNextAt(hour, 0);
    if (n.getTime() > now && (nextAt == null || n.getTime() < nextAt.getTime())) nextAt = n;
  }
  if (!nextAt) return;
  const ms = nextAt.getTime() - now;
  if (ms <= 0) return;
  const t = setTimeout(() => {
    const msg = pickRandom(REMINDER_MESSAGES_AR);
    if (msg) showWebNotification('يومي 🌙', msg, REMINDER_CHANNEL_ID);
    scheduleNextReminderWeb();
  }, ms);
  scheduledTimeouts.push(t);
}

/**
 * For native "when app is closed" notifications, install @capacitor/local-notifications
 * and add a separate native scheduling layer that reads state from storage.
 * Web notifications below work while the app is open.
 */

/**
 * Schedule all notifications:
 * - If duaNotificationTime is set and duas exist: one random dua at that time (daily).
 * - If remindersEnabled: Egyptian Arabic reminders at 9:00, 14:00, 20:00.
 * Call after permission is granted and when state.duas / state.duaNotificationTime / state.remindersEnabled change.
 */
export async function scheduleNotifications(
  duas: { text: string; day: string }[],
  duaNotificationTime: string | null,
  remindersEnabled: boolean
): Promise<void> {
  clearScheduledTimeouts();

  const granted = await requestNotificationPermission();
  if (!granted) return;

  const duaTime = duaNotificationTime ? parseTime(duaNotificationTime) : null;

  // Web notifications (work when app is open; for native when closed, add @capacitor/local-notifications)
  if (duaTime && duas.length > 0) {
    scheduleNextDuaWeb(duas, duaTime.hour, duaTime.minute);
  }
  if (remindersEnabled) {
    scheduleNextReminderWeb();
  }
}

/** Cancel all scheduled notifications (clear timeouts; Capacitor cancel is separate if needed). */
export function cancelScheduledNotifications(): void {
  clearScheduledTimeouts();
}
