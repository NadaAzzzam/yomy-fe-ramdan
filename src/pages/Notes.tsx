import { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { Card } from '../components/Card';
import { Sec } from '../components/Sec';
import { Btn } from '../components/Btn';
import { useTheme } from '../context/ThemeContext';
import { getRamadanInfo } from '../lib/ramadan';
import { fontSans } from '../lib/theme';
import { requestNotificationPermission } from '../lib/notifications';
import { parseTime } from '../lib/notifications';
import type { AppState } from '../lib/state';
import type { Action } from '../lib/state';

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
  const [sa, setSa] = useState(false);
  const [ti, setTi] = useState('');
  const [no, setNo] = useState('');
  const [du, setDu] = useState('');
  const [duaTimeInput, setDuaTimeInput] = useState(state.duaNotificationTime ?? '');
  const [permRequesting, setPermRequesting] = useState(false);

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding" style={{ fontFamily: fontSans, '--background': t.bg, color: t.text } as React.CSSProperties}>
        <div className="ion-content-inner">
          <div style={{ textAlign: 'center', padding: '12px 0 6px' }}>
            <h2 style={{ fontFamily: 'Amiri', fontSize: 20, color: t.goldLight, margin: 0 }}>
              📝 دفتر رمضان
            </h2>
          </div>

          <Card glow style={{ marginTop: 10 }}>
            <Sec icon="🎙️" text={`بودكاست ودروس (${state.podcasts.length})`} />
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
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: t.text, paddingLeft: 26 }}>
                  {p.title}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 10, color: t.muted }}>{p.day}</p>
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
              <div style={{ background: t.cardAlt, borderRadius: 14, padding: '12px' }}>
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
                          p: { title: ti, note: no, day: `${getRamadanInfo().day || '—'} رمضان` },
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

          <Card style={{ marginTop: 12 }}>
            <Sec icon="🤲" text="أدعية" />
            {state.duas.map((d, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  background: t.bb(t.gold),
                  borderRadius: 12,
                  padding: '9px 12px',
                  marginBottom: 5,
                }}
              >
                <span style={{ fontSize: 15 }}>🤲</span>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontFamily: 'Amiri',
                    lineHeight: 1.8,
                    flex: 1,
                    color: t.text,
                  }}
                >
                  {d.text}
                </p>
                <button
                  onClick={() => dispatch({ type: 'RM_DUA', i })}
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
            ))}
            <div style={{ display: 'flex', gap: 7 }}>
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
                      d: { text: du, day: `${getRamadanInfo().day || '—'} رمضان` },
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

            <div style={{ marginTop: 14 }}>
              <Sec icon="🔔" text="تذكير أدعية وإشعارات" />
            </div>
            <p style={{ fontSize: 11, color: t.muted, margin: '0 0 10px' }}>
              اختر وقت يوصلك فيه دعاء عشوائي من قائمتك كل يوم (حتى لو التطبيق مقفول).
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="time"
                value={duaTimeInput || state.duaNotificationTime || ''}
                onChange={(e) => setDuaTimeInput(e.target.value)}
                style={{
                  background: t.inputBg,
                  border: `1px solid ${t.muted}28`,
                  borderRadius: 12,
                  padding: '10px 12px',
                  color: t.text,
                  fontSize: 14,
                  fontFamily: fontSans,
                }}
              />
              <button
                onClick={() => {
                  const raw = duaTimeInput.trim();
                  const parsed = raw ? parseTime(raw) : null;
                  if (parsed) {
                    const h = String(parsed.hour).padStart(2, '0');
                    const m = String(parsed.minute).padStart(2, '0');
                    dispatch({ type: 'SET_DUA_NOTIFICATION_TIME', time: `${h}:${m}` });
                  }
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: 'none',
                  background: t.green,
                  color: '#fff',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: fontSans,
                  fontWeight: 600,
                }}
              >
                تفعيل التذكير
              </button>
              {state.duaNotificationTime && (
                <button
                  onClick={() => {
                    dispatch({ type: 'SET_DUA_NOTIFICATION_TIME', time: null });
                    setDuaTimeInput('');
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: `1px solid ${t.red}40`,
                    background: 'transparent',
                    color: t.red,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: fontSans,
                  }}
                >
                  إلغاء
                </button>
              )}
            </div>
            {state.duaNotificationTime && (
              <>
                <p style={{ fontSize: 12, color: t.green, margin: '8px 0 0' }}>
                  ✓ تذكير أدعية مفعّل الساعة {state.duaNotificationTime}
                </p>
                {state.duas.length === 0 && (
                  <p style={{ fontSize: 11, color: t.orange, margin: '4px 0 0' }}>
                    أضف أدعية أولاً حتى يوصلك تذكير يومي
                  </p>
                )}
              </>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 14,
                padding: '10px 12px',
                background: t.cardAlt,
                borderRadius: 12,
              }}
            >
              <span style={{ fontSize: 13, color: t.text }}>تذكيرات تشجيعية (زي "تعالى كمل"، "استمر")</span>
              <button
                onClick={() => dispatch({ type: 'SET_REMINDERS_ENABLED', enabled: !state.remindersEnabled })}
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
            <p style={{ fontSize: 10, color: t.muted, margin: '8px 0 0' }}>
              التذكيرات تظهر ٩ ص، ٢ م، ٨ م. لازم تسمح بالإشعارات عشان تشتغل.
            </p>
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
        </div>
      </IonContent>
    </IonPage>
  );
}
