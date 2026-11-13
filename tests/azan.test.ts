import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { playAzan, stopAzan, isAzanPlaying, isAzanCached } from '../src/lib/api';

class FakeAudio extends EventTarget {
  static instances: FakeAudio[] = [];
  static playResult = () => Promise.resolve();
  paused = true;
  volume = 1;
  preload = '';
  constructor(public src: string) { super(); FakeAudio.instances.push(this); }
  play() { this.paused = false; return FakeAudio.playResult(); }
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
  removeAttribute() { this.src = ''; }
  load() {}
}
beforeEach(() => {
  vi.stubGlobal('Audio', FakeAudio);
  vi.stubGlobal('caches', undefined);
  FakeAudio.instances = [];
  FakeAudio.playResult = () => Promise.resolve();
});
afterEach(() => { stopAzan(); vi.unstubAllGlobals(); vi.useRealTimers(); });
it('starts and stops playback', async () => {
  expect(await playAzan('https://example.test/azan.mp3')).not.toBeNull();
  expect(isAzanPlaying()).toBe(true);
  stopAzan();
  expect(isAzanPlaying()).toBe(false);
});
it('only the newest rapid selection starts', async () => {
  const first = playAzan('first');
  const second = playAzan('second');
  expect(await first).toBeNull();
  expect(await second).not.toBeNull();
  expect(FakeAudio.instances.map(a => a.src)).toEqual(['second']);
});
it('stop cancels a pending cache lookup', async () => {
  const request = playAzan('first');
  stopAzan();
  expect(await request).toBeNull();
  expect(FakeAudio.instances).toHaveLength(0);
});
it('returns failure when playback is denied', async () => {
  FakeAudio.playResult = () => Promise.reject(new Error('NotAllowedError'));
  expect(await playAzan('first')).toBeNull();
  expect(isAzanPlaying()).toBe(false);
});
it('times out a stalled mobile media load', async () => {
  vi.useFakeTimers();
  FakeAudio.playResult = () => new Promise(() => {});
  const request = playAzan('first');
  await vi.advanceTimersByTimeAsync(15000);
  expect(await request).toBeNull();
  expect(isAzanPlaying()).toBe(false);
});
it('cache failures do not break sound picker', async () => {
  vi.stubGlobal('caches', { open: async () => ({ match: async () => { throw new Error('storage unavailable'); } }) });
  expect(await isAzanCached('first')).toBe(false);
});
