import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { Card } from '../components/Card';
import { Sec } from '../components/Sec';
import { Btn } from '../components/Btn';
import { useTheme } from '../context/ThemeContext';
import { getRamadanInfo } from '../lib/ramadan';
import { fontSans } from '../lib/theme';
import { requestNotificationPermission, NOTIFICATION_INTERVALS } from '../lib/notifications';
import { JOURNAL_PROMPTS, DUA_CATEGORIES } from '../lib/data';
import type { AppState, Action, JournalEntry } from '../lib/state';

const inputStyle = (t: ReturnType<typeof useTheme>): React.CSSProperties => ({
  width: '100%',
  background: t.inputBg,
  border: `1px solid ${t.muted}25`,
  borderRadius: 10,
  padding: '9px 12px',
  color: t.text,
  fontFamily: fontSans,
  fontSize: 13,
  outline: 'none',
  direction: 'rtl',
  boxSizing: 'border-box',
});

type NotesProps = { state: AppState; dispatch: (a: Action) => void };

export function Notes({ state, dispatch }: NotesProps) {
  const t = useTheme();
  const info = getRamadanInfo();
  const [sa, setSa] = useState(false);
  const [ti, setTi] = useState('');
  const [no, setNo] = useState('');
  const [du, setDu] = useState('');
  const [duaCat, setDuaCat] = useState('general');
  const [permRequesting, setPermRequesting] = useState(false);
  const location = useLocation();
  const tabFromUrl = (() => {
    const p = new URLSearchParams(location.search);
    const tab = p.get('tab');
    return tab === 'podcasts' ? 'podcasts' : tab === 'journal' ? 'journal' : 'duas';
  })();
  const [activeTab, setActiveTab] = useState<'duas' | 'podcasts' | 'journal'>(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const today = new Date();
  const todayStr =
    today.getFullYear() +
    '-' +
    String(today.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(today.getDate()).padStart(2, '0');
  const dayIdx = Math.max(0, (info.day ?? today.getDate()) - 1);
  const todayPrompt = JOURNAL_PROMPTS[dayIdx % JOURNAL_PROMPTS.length]!;
  const todayJournal: JournalEntry | undefined = state.journal[todayStr];

  const [jFreeText, setJFreeText] = useState(todayJournal?.freeText ?? '');
  const [jClosest, setJClosest] = useState(todayJournal?.closestToAllah ?? '');
  const [jImprove, setJImprove] = useState(todayJournal?.improveText ?? '');
  const [jRating, setJRating] = useState(todayJournal?.dayRating ?? 0);
  const [showAnswered, setShowAnswered] = useState(false);

  const answeredDuas = state.duas.filter((d) => d.answered);
  const activeDuas = state.duas.filter((d) => !d.answered);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '9px 6px',
    borderRadius: 12,
    border: `1.5px solid ${active ? t.gold : t.border + '30'}`,
    background: active ? `${t.gold}15` : 'transparent',
    color: active ? t.goldLight : t.muted,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: fontSans,
    transition: 'all .2s',
    textAlign: 'center' as const,
  });

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="ion-padding"
        style={
          {
            fontFamily: fontSans,
            '--background': t.bg,
            '--ion-background-color': t.bg,
            color: t.text,
          } as React.CSSProperties
        }
      >
        <div className="ion-content-inner">
          <div style={{ textAlign: 'center', padding: '12px 0 6px' }}>
            <h2
              style={{
                fontFamily: 'Amiri',
                fontSize: 20,
                color: t.goldLight,
                margin: 0,
              }}
            >
              📝 دفتر رمضان
            </h2>
          </div>

          {/* Tab Switcher */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              margin: '8px 0 12px',
            }}
          >
            <button style={tabStyle(activeTab === 'duas')} onClick={() => setActiveTab('duas')}>
              🤲 أدعية
            </button>
            <button style={tabStyle(activeTab === 'journal')} onClick={() => setActiveTab('journal')}>
              📝 مذكرات
            </button>
            <button style={tabStyle(activeTab === 'podcasts')} onClick={() => setActiveTab('podcasts')}>
              🎙️ بودكاست
            </button>
          </div>

          {/* ═══ DUAS TAB ═══ */}
          {activeTab === 'duas' && (
            <>
              <Card glow style={{ marginTop: 0 }}>
                <Sec icon="🤲" text={`أدعيتي (${activeDuas.length})`} />

                {/* Category filter for new dua */}
                <div
                  style={{
                    display: 'flex',
                    gap: 4,
                    flexWrap: 'wrap',
                    marginBottom: 10,
                  }}
                >
                  {DUA_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setDuaCat(cat.id)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 10,
                        border: `1.5px solid ${duaCat === cat.id ? t.gold : t.border + '30'}`,
                        background: duaCat === cat.id ? `${t.gold}15` : 'transparent',
                        color: duaCat === cat.id ? t.goldLight : t.muted,
                        fontSize: 10,
                        fontFamily: fontSans,
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all .2s',
                      }}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>

                {/* Active Duas */}
                {activeDuas.map((d, i) => {
                  const realIdx = state.duas.indexOf(d);
                  const catObj = DUA_CATEGORIES.find((c) => c.id === d.category);
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: t.bb(t.gold),
                        borderRadius: 12,
                        padding: '9px 12px',
                        marginBottom: 5,
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{catObj?.icon ?? '🤲'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontFamily: 'Amiri',
                            lineHeight: 1.8,
                            color: t.text,
                          }}
                        >
                          {d.text}
                        </p>
                        {catObj && catObj.id !== 'general' && (
                          <span
                            style={{
                              fontSize: 9,
                              color: t.muted,
                              background: `${t.muted}12`,
                              borderRadius: 6,
                              padding: '1px 6px',
                            }}
                          >
                            {catObj.label}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'TOGGLE_DUA_ANSWERED', i: realIdx })}
                        title="تم الاستجابة"
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          border: `1px solid ${t.green}40`,
                          background: `${t.green}12`,
                          color: t.green,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'RM_DUA', i: realIdx })}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 7,
                          border: 'none',
                          background: `${t.red}20`,
                          color: t.red,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}

                {/* Add Dua */}
                <div style={{ display: 'flex', gap: 7, marginTop: 4 }}>
                  <input
                    value={du}
                    onChange={(e) => setDu(e.target.value)}
                    placeholder="اكتب دعاء..."
                    style={{
                      flex: 1,
                      background: t.inputBg,
                      border: `1px solid ${t.muted}28`,
                      borderRadius: 12,
                      padding: '10px 12px',
                      color: t.text,
                      fontFamily: 'Amiri',
                      fontSize: 14,
                      outline: 'none',
                      direction: 'rtl',
                    }}
                  />
                  <button
                    onClick={() => {
                      if (du.trim()) {
                        dispatch({
                          type: 'ADD_DUA',
                          d: {
                            text: du,
                            day: `${info.day || '—'} رمضان`,
                            category: duaCat,
                          },
                        });
                        setDu('');
                      }
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      border: 'none',
                      background: t.gold,
                      color: '#fff',
                      fontSize: 18,
                      cursor: 'pointer',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Answered Duas */}
                {answeredDuas.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <button
                      onClick={() => setShowAnswered(!showAnswered)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 12,
                        border: `1px solid ${t.green}25`,
                        background: `${t.green}08`,
                        color: t.green,
                        fontSize: 12,
                        cursor: 'pointer',
                        fontFamily: fontSans,
                        fontWeight: 600,
                      }}
                    >
                      ✅ دعوات مستجابة ({answeredDuas.length}) {showAnswered ? '▲' : '▼'}
                    </button>
                    {showAnswered &&
                      answeredDuas.map((d, i) => {
                        const realIdx = state.duas.indexOf(d);
                        return (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              background: `${t.green}08`,
                              borderRadius: 12,
                              padding: '9px 12px',
                              marginTop: 5,
                              border: `1px solid ${t.green}15`,
                            }}
                          >
                            <span style={{ fontSize: 14 }}>✅</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  fontFamily: 'Amiri',
                                  lineHeight: 1.8,
                                  color: t.green,
                                }}
                              >
                                {d.text}
                              </p>
                              {d.answeredDate && (
                                <span style={{ fontSize: 9, color: t.muted }}>
                                  استُجيبت {d.answeredDate}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => dispatch({ type: 'TOGGLE_DUA_ANSWERED', i: realIdx })}
                              style={{
                                fontSize: 10,
                                color: t.muted,
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: fontSans,
                                textDecoration: 'underline',
                              }}
                            >
                              تراجع
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
              </Card>

              {/* Notification Settings */}
              <Card style={{ marginTop: 12 }}>
                <Sec icon="🔔" text="تذكير أدعية وإشعارات" />
                <p style={{ fontSize: 11, color: t.muted, margin: '0 0 10px' }}>
                  اختر كل كم دقيقة يوصلك دعاء عشوائي من قائمتك.
                </p>
                
                {/* Interval Options */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginBottom: 12,
                  }}
                >
                  {NOTIFICATION_INTERVALS.map((interval) => (
                    <button
                      key={interval.value}
                      onClick={() => {
                        dispatch({
                          type: 'SET_DUA_NOTIFICATION_INTERVAL',
                          interval: state.duaNotificationInterval === interval.value ? null : interval.value,
                        });
                      }}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 12,
                        border: `1.5px solid ${
                          state.duaNotificationInterval === interval.value ? t.green : t.border + '30'
                        }`,
                        background:
                          state.duaNotificationInterval === interval.value
                            ? `${t.green}15`
                            : 'transparent',
                        color:
                          state.duaNotificationInterval === interval.value
                            ? t.green
                            : t.text,
                        fontSize: 12,
                        fontFamily: fontSans,
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all .2s',
                        flex: '1 1 auto',
                        minWidth: 'calc(33.333% - 6px)',
                      }}
                    >
                      {interval.label}
                    </button>
                  ))}
                </div>
                
                {state.duaNotificationInterval && (
                  <p style={{ fontSize: 12, color: t.green, margin: '0 0 12px', textAlign: 'center' }}>
                    ✓ تذكير مفعّل كل {NOTIFICATION_INTERVALS.find(i => i.value === state.duaNotificationInterval)?.label}
                  </p>
                )}

                {/* Notification Voice Reading Toggle */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 12,
                    padding: '10px 12px',
                    background: t.cardAlt,
                    borderRadius: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>🗣️</span>
                    <span style={{ fontSize: 12, color: t.text }}>قراءة النص بالصوت</span>
                  </div>
                  <button
                    onClick={() =>
                      dispatch({
                        type: 'SET_NOTIFICATION_VOICE',
                        enabled: !state.notificationVoiceEnabled,
                      })
                    }
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      border: 'none',
                      background: state.notificationVoiceEnabled ? t.green : t.muted + '44',
                      padding: 2,
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        background: '#fff',
                        transform: state.notificationVoiceEnabled ? 'translateX(0)' : 'translateX(20px)',
                        transition: 'transform .2s',
                      }}
                    />
                  </button>
                </div>
                <p style={{ fontSize: 10, color: t.muted, margin: '6px 0 0', textAlign: 'center' }}>
                  عند التفعيل، سيتم قراءة نص الإشعار بالصوت تلقائياً
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 8,
                    padding: '10px 12px',
                    background: t.cardAlt,
                    borderRadius: 12,
                  }}
                >
                  <span style={{ fontSize: 12, color: t.text }}>تذكيرات تشجيعية</span>
                  <button
                    onClick={() =>
                      dispatch({
                        type: 'SET_REMINDERS_ENABLED',
                        enabled: !state.remindersEnabled,
                      })
                    }
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      border: 'none',
                      background: state.remindersEnabled ? t.green : t.muted + '44',
                      padding: 2,
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        background: '#fff',
                        transform: state.remindersEnabled ? 'translateX(0)' : 'translateX(20px)',
                        transition: 'transform .2s',
                      }}
                    />
                  </button>
                </div>
                <button
                  disabled={permRequesting}
                  onClick={async () => {
                    setPermRequesting(true);
                    await requestNotificationPermission();
                    setPermRequesting(false);
                  }}
                  style={{
                    marginTop: 10,
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: `1px solid ${t.gold}50`,
                    background: t.bb(t.gold),
                    color: t.gold,
                    fontSize: 12,
                    cursor: permRequesting ? 'wait' : 'pointer',
                    fontFamily: fontSans,
                    width: '100%',
                  }}
                >
                  {permRequesting ? 'جاري الطلب...' : 'السماح بالإشعارات'}
                </button>
              </Card>

              {/* Salah Ala El Naby Notifications */}
              <Card glow style={{ marginTop: 12 }}>
                <Sec icon="💚" text="الصلاة على النبي" />
                <p
                  style={{
                    fontSize: 11,
                    color: t.textSec,
                    margin: '0 0 12px',
                    lineHeight: 1.6,
                  }}
                >
                  اختر كل كم دقيقة تحب يوصلك تذكير بالصلاة على النبي ﷺ
                </p>

                {/* Interval Options */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                  }}
                >
                  {NOTIFICATION_INTERVALS.map((interval) => (
                    <button
                      key={interval.value}
                      onClick={() => {
                        dispatch({
                          type: 'SET_SALAH_ALA_NABY_INTERVAL',
                          interval: state.salahAlaNabyInterval === interval.value ? null : interval.value,
                        });
                      }}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 12,
                        border: `1.5px solid ${
                          state.salahAlaNabyInterval === interval.value ? t.green : t.border + '30'
                        }`,
                        background:
                          state.salahAlaNabyInterval === interval.value
                            ? `${t.green}15`
                            : 'transparent',
                        color:
                          state.salahAlaNabyInterval === interval.value
                            ? t.green
                            : t.text,
                        fontSize: 12,
                        fontFamily: fontSans,
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all .2s',
                        flex: '1 1 auto',
                        minWidth: 'calc(33.333% - 6px)',
                      }}
                    >
                      {interval.label}
                    </button>
                  ))}
                </div>

                {state.salahAlaNabyInterval ? (
                  <p
                    style={{
                      fontSize: 12,
                      color: t.green,
                      textAlign: 'center',
                      margin: '12px 0 0',
                    }}
                  >
                    ✓ تذكير مفعّل كل {NOTIFICATION_INTERVALS.find(i => i.value === state.salahAlaNabyInterval)?.label}
                  </p>
                ) : (
                  <p
                    style={{
                      fontSize: 12,
                      color: t.muted,
                      textAlign: 'center',
                      margin: '12px 0 0',
                    }}
                  >
                    اختر فترة التذكير من الأعلى
                  </p>
                )}
              </Card>
            </>
          )}

          {/* ═══ JOURNAL TAB ═══ */}
          {activeTab === 'journal' && (
            <Card glow style={{ marginTop: 0 }}>
              <Sec icon="📝" text="مذكرات اليوم" />
              <p
                style={{
                  fontSize: 12,
                  color: t.accent,
                  fontWeight: 600,
                  margin: '0 0 10px',
                  fontFamily: 'Amiri',
                  lineHeight: 1.8,
                }}
              >
                💭 {todayPrompt}
              </p>

              {/* Day Rating */}
              <p style={{ fontSize: 12, color: t.textSec, margin: '0 0 5px' }}>
                تقييم اليوم:
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setJRating(n)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      border: `2px solid ${jRating >= n ? t.gold : t.border + '40'}`,
                      background: jRating >= n ? `${t.gold}18` : 'transparent',
                      cursor: 'pointer',
                      fontSize: 16,
                      transition: 'all .2s',
                    }}
                  >
                    {jRating >= n ? '⭐' : '☆'}
                  </button>
                ))}
              </div>

              {/* Text Fields */}
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: t.textSec, margin: '0 0 4px' }}>
                  💚 إيه أكتر حاجة قربتك من ربنا النهارده؟
                </p>
                <textarea
                  value={jClosest}
                  onChange={(e) => setJClosest(e.target.value)}
                  placeholder="اكتب هنا..."
                  rows={2}
                  style={{ ...inputStyle(t), resize: 'none' }}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: t.textSec, margin: '0 0 4px' }}>
                  🎯 إيه اللي نفسك تحسّنه بكرة؟
                </p>
                <textarea
                  value={jImprove}
                  onChange={(e) => setJImprove(e.target.value)}
                  placeholder="اكتب هنا..."
                  rows={2}
                  style={{ ...inputStyle(t), resize: 'none' }}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: t.textSec, margin: '0 0 4px' }}>
                  📝 كتابة حرة
                </p>
                <textarea
                  value={jFreeText}
                  onChange={(e) => setJFreeText(e.target.value)}
                  placeholder="اكتب أي حاجة في قلبك..."
                  rows={4}
                  style={{ ...inputStyle(t), resize: 'none' }}
                />
              </div>

              <Btn
                small
                color={t.green}
                onClick={() => {
                  dispatch({
                    type: 'SAVE_JOURNAL',
                    date: todayStr,
                    entry: {
                      date: todayStr,
                      dayRating: jRating,
                      closestToAllah: jClosest,
                      improveText: jImprove,
                      freeText: jFreeText,
                    },
                  });
                }}
                style={{ width: '100%' }}
              >
                حفظ المذكرة ✓
              </Btn>

              {todayJournal && (
                <p
                  style={{
                    fontSize: 11,
                    color: t.green,
                    margin: '8px 0 0',
                    textAlign: 'center',
                  }}
                >
                  ✅ المذكرة محفوظة
                </p>
              )}

              {/* Past Entries */}
              {Object.keys(state.journal).length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <Sec icon="📅" text="المذكرات السابقة" />
                  {Object.entries(state.journal)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 7)
                    .map(([date, entry]) => (
                      <div
                        key={date}
                        style={{
                          background: t.cardAlt,
                          borderRadius: 12,
                          padding: '10px 12px',
                          marginBottom: 6,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: t.gold,
                              fontWeight: 600,
                            }}
                          >
                            {date}
                          </span>
                          <span style={{ fontSize: 12 }}>
                            {'⭐'.repeat(entry.dayRating)}
                          </span>
                        </div>
                        {entry.closestToAllah && (
                          <p
                            style={{
                              fontSize: 11,
                              color: t.textSec,
                              margin: '2px 0',
                              lineHeight: 1.6,
                            }}
                          >
                            💚 {entry.closestToAllah}
                          </p>
                        )}
                        {entry.freeText && (
                          <p
                            style={{
                              fontSize: 11,
                              color: t.muted,
                              margin: '2px 0',
                              lineHeight: 1.6,
                            }}
                          >
                            {entry.freeText.slice(0, 100)}
                            {entry.freeText.length > 100 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </Card>
          )}

          {/* ═══ PODCASTS TAB ═══ */}
          {activeTab === 'podcasts' && (
            <Card glow style={{ marginTop: 0 }}>
              <Sec icon="🎙️" text={`بودكاست (${state.podcasts.length})`} />
              {state.podcasts.map((p, i) => (
                <div
                  key={i}
                  style={{
                    background: t.cardAlt,
                    borderRadius: 14,
                    padding: '12px 14px',
                    marginBottom: 7,
                    position: 'relative',
                  }}
                >
                  <button
                    onClick={() => dispatch({ type: 'RM_PODCAST', i })}
                    style={{
                      position: 'absolute',
                      top: 7,
                      left: 7,
                      width: 22,
                      height: 22,
                      borderRadius: 7,
                      border: 'none',
                      background: `${t.red}20`,
                      color: t.red,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 700,
                      color: t.text,
                      paddingLeft: 26,
                    }}
                  >
                    {p.title}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 10, color: t.muted }}>
                    {p.day}
                  </p>
                  {p.note && (
                    <p
                      style={{
                        margin: '6px 0 0',
                        fontSize: 12,
                        color: t.goldLight,
                        background: t.bb(t.gold),
                        padding: '7px 10px',
                        borderRadius: 10,
                        lineHeight: 1.7,
                      }}
                    >
                      💡 {p.note}
                    </p>
                  )}
                </div>
              ))}
              {sa ? (
                <div
                  style={{
                    background: t.cardAlt,
                    borderRadius: 14,
                    padding: '12px',
                  }}
                >
                  <input
                    value={ti}
                    onChange={(e) => setTi(e.target.value)}
                    placeholder="اسم المحاضرة..."
                    style={{ ...inputStyle(t), marginBottom: 7, background: t.bg }}
                  />
                  <textarea
                    value={no}
                    onChange={(e) => setNo(e.target.value)}
                    placeholder="ملاحظاتك..."
                    rows={3}
                    style={{ ...inputStyle(t), resize: 'none', background: t.bg }}
                  />
                  <div style={{ display: 'flex', gap: 7, marginTop: 7 }}>
                    <Btn
                      small
                      color={t.green}
                      onClick={() => {
                        if (ti.trim()) {
                          dispatch({
                            type: 'ADD_PODCAST',
                            p: {
                              title: ti,
                              note: no,
                              day: `${info.day || '—'} رمضان`,
                            },
                          });
                          setTi('');
                          setNo('');
                          setSa(false);
                        }
                      }}
                      style={{ flex: 1 }}
                    >
                      حفظ ✓
                    </Btn>
                    <Btn
                      small
                      color={t.muted}
                      onClick={() => {
                        setSa(false);
                        setTi('');
                        setNo('');
                      }}
                      style={{ flex: 1 }}
                    >
                      إلغاء
                    </Btn>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSa(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 14,
                    border: `2px dashed ${t.accent}35`,
                    background: `${t.accent}08`,
                    color: t.accent,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: fontSans,
                    fontWeight: 600,
                  }}
                >
                  + أضف محاضرة / بودكاست
                </button>
              )}
            </Card>
          )}

          <div style={{ height: 16 }} />
        </div>
      </IonContent>
    </IonPage>
  );
}
