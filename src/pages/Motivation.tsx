import { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { DynMoon } from '../components/DynMoon';
import { Card } from '../components/Card';
import { Sec } from '../components/Sec';
import { useTheme } from '../context/ThemeContext';
import { getRamadanInfo } from '../lib/ramadan';
import { NIGHT_MOTIVATIONS } from '../lib/data';
import { fontSans } from '../lib/theme';
import type { AppState } from '../lib/state';

type MotivationProps = { state: AppState };

export function Motivation({ state }: MotivationProps) {
  const t = useTheme();
  const info = getRamadanInfo();
  const [ci, setCi] = useState(0);
  const m = NIGHT_MOTIVATIONS[ci]!;
  const mc = t[m.color as keyof typeof t] ?? t.gold;
  const mcStr = typeof mc === 'string' ? mc : t.gold;

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding" style={{ fontFamily: fontSans, '--background': t.bg, color: t.text } as React.CSSProperties}>
        <div className="ion-content-inner">
          <div style={{ textAlign: 'center', padding: '12px 0 6px' }}>
            <DynMoon day={info.day} size={36} />
            <h2 style={{ fontFamily: 'Amiri', fontSize: 20, color: t.goldLight, margin: '6px 0 2px' }}>
              بعد التراويح 🌙
            </h2>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '14px 0' }}>
            {[
              { v: info.phase === 'pre' ? '—' : info.day, l: 'مضى', c: t.gold },
              { v: info.phase === 'pre' ? info.daysTo : info.remaining, l: 'باقي', c: t.orange },
              { v: state.streak, l: '🔥', c: t.green },
            ].map((b, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  background: t.card,
                  borderRadius: 16,
                  padding: '12px 16px',
                  border: `1px solid ${b.c}1A`,
                  flex: 1,
                }}
              >
                <p style={{ fontSize: 26, fontWeight: 800, color: b.c, margin: 0 }}>{b.v}</p>
                <p style={{ fontSize: 9, color: t.muted, margin: '2px 0 0' }}>{b.l}</p>
              </div>
            ))}
          </div>

          <Card
            glow
            style={{
              textAlign: 'center',
              padding: '22px 18px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg,${mcStr},${mcStr}44)`,
              }}
            />
            <span style={{ fontSize: 42 }}>{m.icon}</span>
            <h3 style={{ fontFamily: 'Amiri', fontSize: 19, color: mcStr, margin: '8px 0' }}>
              {m.title}
            </h3>
            <p style={{ fontSize: 14, fontFamily: 'Amiri', color: t.text, lineHeight: 2, margin: 0 }}>
              {m.text}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 14 }}>
              {NIGHT_MOTIVATIONS.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setCi(i)}
                  style={{
                    width: ci === i ? 18 : 7,
                    height: 7,
                    borderRadius: 4,
                    background: ci === i ? mcStr : `${t.muted}33`,
                    cursor: 'pointer',
                    transition: 'all .3s',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <button
                onClick={() => setCi((ci + 1) % NIGHT_MOTIVATIONS.length)}
                style={{
                  background: `${mcStr}15`,
                  border: `1px solid ${mcStr}30`,
                  borderRadius: 12,
                  padding: '7px 18px',
                  color: mcStr,
                  fontSize: 12,
                  fontFamily: fontSans,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                → التالي
              </button>
              <button
                onClick={() => setCi((ci - 1 + NIGHT_MOTIVATIONS.length) % NIGHT_MOTIVATIONS.length)}
                style={{
                  background: `${mcStr}15`,
                  border: `1px solid ${mcStr}30`,
                  borderRadius: 12,
                  padding: '7px 18px',
                  color: mcStr,
                  fontSize: 12,
                  fontFamily: fontSans,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                السابق ←
              </button>
            </div>
          </Card>

          <Card style={{ marginTop: 12 }}>
            <Sec icon="⚡" text="تحدي الليلة" />
            <div
              style={{
                background: `${t.purple}10`,
                borderRadius: 14,
                padding: '14px',
                border: `1px solid ${t.purple}1A`,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 30 }}>🤲</span>
              <p style={{ fontSize: 14, fontWeight: 700, color: t.purple, margin: '6px 0 3px' }}>
                صلّي ركعتين زيادة الليلة
              </p>
            </div>
          </Card>

          <div
            style={{
              textAlign: 'center',
              marginTop: 14,
              padding: '14px',
              borderRadius: 18,
              background: `${t.green}0C`,
              border: `1px solid ${t.green}20`,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 700, color: t.green, margin: '0 0 3px' }}>
              💚 أنت أقرب للجنة مما تتخيل
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
