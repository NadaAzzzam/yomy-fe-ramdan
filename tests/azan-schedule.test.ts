import { expect, it } from 'vitest';
import { buildAzanAlarms } from '../src/lib/azan';

it('schedules five prayers, excludes sunrise, past times and malformed times', () => {
  const now = new Date(2026, 10, 13, 12).getTime();
  const days = [{
    date: { gregorian: { date: '13-11-2026' } },
    timings: { Fajr: '05:00', Sunrise: '06:20', Dhuhr: '12:30 (EET)', Asr: '15:00', Maghrib: '17:00', Isha: '25:00' },
  }];
  const alarms = buildAzanAlarms(days, now);
  expect(alarms.map(a => a.label)).toEqual(['الظهر', 'العصر', 'المغرب']);
  expect(alarms[0].at).toBe(new Date(2026, 10, 13, 12, 30).getTime());
});
it('crosses month/year boundaries and limits scheduling to thirty days', () => {
  const day = (date: string) => ({ date: { gregorian: { date } }, timings: { Fajr: '05:00' } });
  const now = new Date(2026, 11, 31).getTime();
  const alarms = buildAzanAlarms([day('01-01-2027'), day('31-12-2026'), day('01-02-2027')], now);
  expect(alarms).toHaveLength(2);
  expect(alarms[0].at).toBeLessThan(alarms[1].at);
});
