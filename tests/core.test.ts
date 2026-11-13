import { describe, it, expect, vi, afterEach } from 'vitest';
import { getHijriDate, formatHijriDate } from '../src/lib/hijri';
import { getRamadanInfo } from '../src/lib/ramadan';
import { defaultState, initState, saveState, reducer, buildDailySnapshot } from '../src/lib/state';

afterEach(() => vi.unstubAllGlobals());
describe('calendar', () => {
  it('matches Umm al-Qura on current date', () => {
    expect(getHijriDate(new Date(2026, 10, 12, 12))).toEqual({ year: 1448, month: 6, day: 2 });
  });
  it('formats Arabic date', () => expect(formatHijriDate({year:1448,month:6,day:2})).toBe('٢ جمادى الآخرة ١٤٤٨'));
  it('supports Ramadan beyond 2026', () => {
    expect(getRamadanInfo(new Date(2027, 1, 15)).phase).toBe('ramadan');
    expect(getRamadanInfo(new Date(2026, 10, 12)).phase).toBe('pre');
  });
});
describe('saved state and progress', () => {
  function storage() {
    const data = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k:string) => data.get(k) ?? null, setItem:(k:string,v:string) => data.set(k,v) });
    return data;
  }
  it('falls back safely from invalid JSON', () => {
    storage().set('yomy-ramadan-state', '{');
    expect(initState()).toEqual(defaultState());
  });
  it('preserves answered duas and categories on restart', () => {
    storage();
    const s = defaultState();
    s.duas = [{text:'دعاء',day:'today',category:'family',answered:true,answeredDate:'2026-11-12'}];
    saveState(s);
    expect(initState().duas).toEqual(s.duas);
  });
  it('supports increment and reset of tasbih', () => {
    const s = reducer(defaultState(),{type:'SUBHA_INC',id:'subhanallah'});
    expect(s.subha.subhanallah).toBe(1);
    expect(reducer(s,{type:'SUBHA_RESET_ALL'}).subha.subhanallah).toBe(0);
  });
  it('counts a Quran page only once', () => {
    let s = reducer(defaultState(),{type:'ADD_QURAN_PAGE_VIEWED',page:1});
    s = reducer(s,{type:'ADD_QURAN_PAGE_VIEWED',page:1});
    expect(buildDailySnapshot(s).pagesRead).toBe(1);
  });
  it('archives and resets daily progress but keeps journal', () => {
    const s = defaultState();
    s.todayChecks.qiyam = true;
    s.journal['2026-11-11'] = {date:'2026-11-11',dayRating:5,closestToAllah:'',improveText:'',freeText:'saved'};
    const next = reducer(s,{type:'ARCHIVE_AND_ROLLOVER',archivedDate:'2026-11-11',snapshot:buildDailySnapshot(s),newDate:'2026-11-12'});
    expect(next.todayChecks).toEqual({});
    expect(next.journal).toEqual(s.journal);
    expect(next.dailyHistory['2026-11-11'].qiyam).toBe(true);
  });
});
