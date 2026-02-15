import { useState, useMemo } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { DynMoon } from '../components/DynMoon';
import { Card } from '../components/Card';
import { Sec } from '../components/Sec';
import { Chk } from '../components/Chk';
import { useTheme, useIsDark } from '../context/ThemeContext';
import { getRamadanInfo } from '../lib/ramadan';
import { getHijriLunarDay } from '../lib/hijri';
import {
  NIGHT_MOTIVATIONS,
  FAMILY_ACTIVITIES,
  CHARITY_TYPES,
  SELF_CARE_ITEMS,
  ENERGY_LEVELS,
  RELATIONSHIP_CHALLENGES,
  LAST_TEN_GOALS,
  LAYLAT_QADR_NIGHTS,
  NO_PRESSURE_MESSAGES,
  BEDTIME_QUESTIONS,
  SUPPORT_MESSAGE,
  REWARD_MILESTONES,
} from '../lib/data';
import { fontSans } from '../lib/theme';
import type { AppState, Action } from '../lib/state';

type MotivationProps = { state: AppState; dispatch: (a: Action) => void };

export function Motivation({ state, dispatch }: MotivationProps) {
  const t = useTheme();
  const isDark = useIsDark();
  const info = getRamadanInfo();
  const [ci, setCi] = useState(0);
  const m = NIGHT_MOTIVATIONS[ci]!;
  const mc = t[m.color as keyof typeof t] ?? t.gold;
  const mcStr = typeof mc === 'string' ? mc : t.gold;

  const dayIdx = Math.max(0, (info.day ?? new Date().getDate()) - 1);
  const todayRelChallenge = RELATIONSHIP_CHALLENGES[dayIdx % RELATIONSHIP_CHALLENGES.length]!;
  const noPressureMsg = NO_PRESSURE_MESSAGES[dayIdx % NO_PRESSURE_MESSAGES.length]!;
  const isLastTen = info.phase === 'ramadan' && info.day > 20;
  const isLaylatQadr = LAYLAT_QADR_NIGHTS.includes(info.day);

  const familyDone = Object.values(state.familyChecks).filter(Boolean).length;
  const selfCareDone = Object.values(state.selfCareChecks).filter(Boolean).length;
  const lastTenDone = Object.values(state.lastTenChecks).filter(Boolean).length;

  // Streaks for reward milestones
  const streakDays = state.streak;
  const currentMilestone = useMemo(
    () => REWARD_MILESTONES.filter((m) => streakDays >= m.days).pop(),
    [streakDays],
  );

  const today = new Date();
  const todayStr =
    today.getFullYear() +
    '-' +
    String(today.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(today.getDate()).padStart(2, '0');

  const inputStyle: React.CSSProperties = {
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
    resize: 'none',
  };

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
            <DynMoon day={getHijriLunarDay()} size={36} />
            <h2
              style={{
                fontFamily: 'Amiri',
                fontSize: 20,
                color: t.goldLight,
                margin: '6px 0 2px',
              }}
            >
              بعد التراويح 🌙
            </h2>
          </div>

          {/* ─── Day Stats ─── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              margin: '10px 0',
              flexWrap: 'wrap',
            }}
          >
            {[
              {
                v: info.phase === 'pre' ? '—' : info.day,
                l: 'مضى',
                c: t.gold,
              },
              {
                v: info.phase === 'pre' ? info.daysTo : info.remaining,
                l: 'باقي',
                c: t.orange,
              },
              { v: state.streak, l: '🔥', c: t.green },
            ].map((b, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  background: t.card,
                  borderRadius: 16,
                  padding: '10px 14px',
                  border: `1px solid ${b.c}1A`,
                  flex: '1 1 80px',
                  minWidth: 0,
                }}
              >
                <p
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: b.c,
                    margin: 0,
                  }}
                >
                  {b.v}
                </p>
                <p style={{ fontSize: 9, color: t.muted, margin: '2px 0 0' }}>
                  {b.l}
                </p>
              </div>
            ))}
          </div>

          {/* ─── Spiritual Reward Milestone ─── */}
          {currentMilestone && (
            <div
              style={{
                textAlign: 'center',
                padding: '12px 14px',
                borderRadius: 18,
                background: `linear-gradient(135deg, ${t.gold}10, ${t.green}08)`,
                border: `1px solid ${t.gold}20`,
                marginBottom: 10,
                animation: 'fadeIn .5s',
              }}
            >
              <span style={{ fontSize: 28 }}>{currentMilestone.icon}</span>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: t.goldLight,
                  margin: '4px 0 2px',
                }}
              >
                {currentMilestone.title}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: t.textSec,
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {currentMilestone.message}
              </p>
            </div>
          )}

          {/* ─── Night Motivation Cards ─── */}
          <Card
            glow
            style={{
              textAlign: 'center',
              padding: '20px 16px',
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
            <span style={{ fontSize: 38 }}>{m.icon}</span>
            <h3
              style={{
                fontFamily: 'Amiri',
                fontSize: 18,
                color: mcStr,
                margin: '8px 0',
              }}
            >
              {m.title}
            </h3>
            <p
              style={{
                fontSize: 13,
                fontFamily: 'Amiri',
                color: t.text,
                lineHeight: 2,
                margin: 0,
              }}
            >
              {m.text}
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 5,
                marginTop: 12,
              }}
            >
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 10,
              }}
            >
              <button
                onClick={() =>
                  setCi((ci + 1) % NIGHT_MOTIVATIONS.length)
                }
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
                onClick={() =>
                  setCi(
                    (ci - 1 + NIGHT_MOTIVATIONS.length) %
                      NIGHT_MOTIVATIONS.length,
                  )
                }
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

          {/* ─── Bedtime Review ─── */}
          <Card style={{ marginTop: 12 }}>
            <Sec icon="🌙" text="مراجعة قبل النوم" />
            {/* Day Rating */}
            <p
              style={{
                fontSize: 12,
                color: t.textSec,
                margin: '0 0 8px',
              }}
            >
              تقييمك ليومك:
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
                  onClick={() =>
                    dispatch({ type: 'SET_BEDTIME_RATING', rating: n })
                  }
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    border: `2px solid ${state.bedtimeRating >= n ? t.gold : t.border + '40'}`,
                    background:
                      state.bedtimeRating >= n
                        ? `${t.gold}18`
                        : 'transparent',
                    cursor: 'pointer',
                    fontSize: 16,
                    transition: 'all .2s',
                  }}
                >
                  {state.bedtimeRating >= n ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            {/* Text Questions */}
            {BEDTIME_QUESTIONS.filter((q) => q.type === 'text').map((q) => (
              <div key={q.question} style={{ marginBottom: 10 }}>
                <p
                  style={{
                    fontSize: 12,
                    color: t.textSec,
                    margin: '0 0 5px',
                  }}
                >
                  {q.icon} {q.question}
                </p>
                <textarea
                  value={state.bedtimeTexts[q.question] ?? ''}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_BEDTIME_TEXT',
                      key: q.question,
                      text: e.target.value,
                    })
                  }
                  placeholder="اكتب هنا..."
                  rows={2}
                  style={inputStyle}
                />
              </div>
            ))}
          </Card>

          {/* ─── Family Worship ─── */}
          <Card style={{ marginTop: 12 }}>
            <Sec
              icon="🏠"
              text={`عبادة الأسرة (${familyDone}/${FAMILY_ACTIVITIES.length})`}
            />
            {FAMILY_ACTIVITIES.map((a) => (
              <div
                key={a.id}
                onClick={() =>
                  dispatch({ type: 'TOGGLE_FAMILY_CHECK', key: a.id })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  padding: '10px 11px',
                  borderRadius: 13,
                  marginBottom: 4,
                  background: state.familyChecks[a.id]
                    ? `${t.green}08`
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all .25s',
                }}
              >
                <Chk
                  done={!!state.familyChecks[a.id]}
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    dispatch({ type: 'TOGGLE_FAMILY_CHECK', key: a.id });
                  }}
                />
                <span style={{ fontSize: 17 }}>{a.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: state.familyChecks[a.id] ? t.green : t.text,
                      textDecoration: state.familyChecks[a.id]
                        ? 'line-through'
                        : 'none',
                      transition: 'color .25s',
                    }}
                  >
                    {a.label}
                  </span>
                  <p
                    style={{
                      fontSize: 10,
                      color: t.muted,
                      margin: '1px 0 0',
                    }}
                  >
                    {a.description}
                  </p>
                </div>
              </div>
            ))}
          </Card>

          {/* ─── Charity / Sadaqa ─── */}
          <Card style={{ marginTop: 12 }}>
            <Sec
              icon="💰"
              text={`صدقة اليوم — ${state.charityLog.length} يوم إجمالي`}
            />
            {!state.todayCharityDone ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  justifyContent: 'center',
                }}
              >
                {CHARITY_TYPES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() =>
                      dispatch({
                        type: 'ADD_CHARITY',
                        entry: { date: todayStr, type: c.id },
                      })
                    }
                    style={{
                      background: t.cardAlt,
                      border: `1px solid ${t.border}40`,
                      borderRadius: 14,
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontFamily: fontSans,
                      color: t.text,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 3,
                      transition: 'all .2s',
                      flex: '1 1 calc(33% - 6px)',
                      minWidth: 80,
                      boxSizing: 'border-box',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{c.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>
                      {c.label}
                    </span>
                    <span style={{ fontSize: 9, color: t.muted }}>
                      {c.description}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '14px',
                  borderRadius: 14,
                  background: `${t.green}0C`,
                  border: `1px solid ${t.green}20`,
                  animation: 'fadeIn .4s',
                }}
              >
                <span style={{ fontSize: 28 }}>✅</span>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: t.green,
                    margin: '4px 0 0',
                  }}
                >
                  تصدّقت النهارده — بارك الله لك!
                </p>
                <button
                  onClick={() =>
                    dispatch({ type: 'SET_TODAY_CHARITY_DONE', done: false })
                  }
                  style={{
                    fontSize: 10,
                    color: t.muted,
                    background: 'transparent',
                    border: 'none',
                    fontFamily: fontSans,
                    cursor: 'pointer',
                    marginTop: 6,
                    textDecoration: 'underline',
                  }}
                >
                  تعديل
                </button>
              </div>
            )}
          </Card>

          {/* ─── Relationship Repair ─── */}
          <Card style={{ marginTop: 12 }}>
            <Sec icon="💛" text="إصلاح العلاقات" />
            <div
              onClick={() =>
                dispatch({
                  type: 'SET_RELATIONSHIP_DONE',
                  done: !state.relationshipDone,
                })
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                borderRadius: 14,
                background: state.relationshipDone
                  ? `${t.green}0C`
                  : `${t.gold}08`,
                border: `1px solid ${state.relationshipDone ? t.green : t.gold}20`,
                cursor: 'pointer',
                transition: 'all .25s',
              }}
            >
              <Chk
                done={state.relationshipDone}
                onClick={(e) => {
                  e?.stopPropagation?.();
                  dispatch({
                    type: 'SET_RELATIONSHIP_DONE',
                    done: !state.relationshipDone,
                  });
                }}
              />
              <span style={{ fontSize: 20 }}>{todayRelChallenge.icon}</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: state.relationshipDone ? t.green : t.text,
                  textDecoration: state.relationshipDone
                    ? 'line-through'
                    : 'none',
                  flex: 1,
                }}
              >
                {todayRelChallenge.text}
              </span>
            </div>
            <p
              style={{
                fontSize: 10,
                color: t.muted,
                margin: '6px 0 0',
                textAlign: 'center',
              }}
            >
              إصلاح ذات البين أفضل من الصلاة والصيام
            </p>
          </Card>

          {/* ─── Self-Care ─── */}
          <Card style={{ marginTop: 12 }}>
            <Sec
              icon="🧘"
              text={`عنايتك بنفسك (${selfCareDone}/${SELF_CARE_ITEMS.length})`}
            />
            <p
              style={{
                fontSize: 11,
                color: t.muted,
                margin: '0 0 8px',
              }}
            >
              رمضان مش ضغط — اعتني بجسمك عشان تعبد ربنا أحسن
            </p>
            {SELF_CARE_ITEMS.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  dispatch({ type: 'TOGGLE_SELF_CARE', key: item.id })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  padding: '9px 10px',
                  borderRadius: 12,
                  marginBottom: 4,
                  background: state.selfCareChecks[item.id]
                    ? `${t.green}08`
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all .25s',
                }}
              >
                <Chk
                  done={!!state.selfCareChecks[item.id]}
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    dispatch({ type: 'TOGGLE_SELF_CARE', key: item.id });
                  }}
                />
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: state.selfCareChecks[item.id] ? t.green : t.text,
                    textDecoration: state.selfCareChecks[item.id]
                      ? 'line-through'
                      : 'none',
                    flex: 1,
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
            {/* Energy Level */}
            <p
              style={{
                fontSize: 12,
                color: t.textSec,
                margin: '10px 0 6px',
              }}
            >
              طاقتك عاملة إيه؟
            </p>
            <div
              style={{
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
              }}
            >
              {ENERGY_LEVELS.map((e) => (
                <button
                  key={e.id}
                  onClick={() =>
                    dispatch({ type: 'SET_ENERGY_LEVEL', level: e.id })
                  }
                  style={{
                    flex: '1 1 calc(25% - 6px)',
                    minWidth: 60,
                    padding: '8px 6px',
                    borderRadius: 12,
                    border: `2px solid ${state.energyLevel === e.id ? t.accent : t.border + '30'}`,
                    background:
                      state.energyLevel === e.id
                        ? `${t.accent}12`
                        : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontSize: 10,
                    fontFamily: fontSans,
                    color: state.energyLevel === e.id ? t.accent : t.text,
                    fontWeight: 600,
                    transition: 'all .2s',
                    boxSizing: 'border-box',
                  }}
                >
                  <span style={{ fontSize: 18, display: 'block' }}>
                    {e.emoji}
                  </span>
                  {e.label}
                </button>
              ))}
            </div>
          </Card>

          {/* ─── Last 10 Nights ─── */}
          {isLastTen && (
            <Card
              glow
              style={{
                marginTop: 12,
                background: isDark
                  ? `linear-gradient(135deg, ${t.purple}10, ${t.gold}08)`
                  : `linear-gradient(135deg, ${t.purple}12, ${t.gold}0A)`,
              }}
            >
              <Sec
                icon="🕌"
                text={`العشر الأواخر — الليلة ${info.day} (${lastTenDone}/${LAST_TEN_GOALS.length})`}
              />
              {isLaylatQadr && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '10px',
                    marginBottom: 10,
                    borderRadius: 14,
                    background: `${t.gold}15`,
                    border: `1px solid ${t.gold}30`,
                    animation: 'gentlePulse 2s infinite',
                  }}
                >
                  <span style={{ fontSize: 22 }}>✨</span>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: t.goldLight,
                      margin: '3px 0 0',
                    }}
                  >
                    ليلة وتر — قد تكون ليلة القدر!
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: t.textSec,
                      margin: '2px 0 0',
                    }}
                  >
                    اجتهد الليلة — خير من ألف شهر
                  </p>
                </div>
              )}
              {LAST_TEN_GOALS.map((g) => (
                <div
                  key={g.id}
                  onClick={() =>
                    dispatch({ type: 'TOGGLE_LAST_TEN_CHECK', key: g.id })
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '10px 11px',
                    borderRadius: 13,
                    marginBottom: 4,
                    background: state.lastTenChecks[g.id]
                      ? `${t.green}08`
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all .25s',
                  }}
                >
                  <Chk
                    done={!!state.lastTenChecks[g.id]}
                    onClick={(e) => {
                      e?.stopPropagation?.();
                      dispatch({
                        type: 'TOGGLE_LAST_TEN_CHECK',
                        key: g.id,
                      });
                    }}
                  />
                  <span style={{ fontSize: 17 }}>{g.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: state.lastTenChecks[g.id]
                          ? t.green
                          : t.text,
                        textDecoration: state.lastTenChecks[g.id]
                          ? 'line-through'
                          : 'none',
                      }}
                    >
                      {g.label}
                    </span>
                    <p
                      style={{
                        fontSize: 10,
                        color: t.muted,
                        margin: '1px 0 0',
                      }}
                    >
                      {g.description}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* ─── Night Challenge ─── */}
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
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: t.purple,
                  margin: '6px 0 3px',
                }}
              >
                صلّي ركعتين زيادة الليلة
              </p>
            </div>
          </Card>

          {/* ─── No Pressure Toggle ─── */}
          <Card style={{ marginTop: 12 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <div style={{ flex: 1 }}>
                <Sec icon="🌿" text='وضع "بدون ضغط"' />
                <p
                  style={{
                    fontSize: 11,
                    color: t.muted,
                    margin: '-6px 0 0',
                  }}
                >
                  يظهر رسائل لطيفة بدل التحديات لو حسيت بضغط
                </p>
              </div>
              <button
                onClick={() =>
                  dispatch({
                    type: 'SET_NO_PRESSURE_MODE',
                    enabled: !state.noPressureMode,
                  })
                }
                style={{
                  width: 48,
                  height: 26,
                  borderRadius: 13,
                  border: 'none',
                  background: state.noPressureMode
                    ? t.green
                    : t.muted + '44',
                  padding: 3,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background .2s',
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    background: '#fff',
                    transform: state.noPressureMode
                      ? 'translateX(0)'
                      : 'translateX(22px)',
                    transition: 'transform .2s',
                  }}
                />
              </button>
            </div>
            {state.noPressureMode && (
              <div
                style={{
                  marginTop: 10,
                  padding: '12px 14px',
                  borderRadius: 14,
                  background: `${t.green}08`,
                  border: `1px solid ${t.green}15`,
                  textAlign: 'center',
                  animation: 'fadeIn .4s',
                }}
              >
                <span style={{ fontSize: 20 }}>{noPressureMsg.icon}</span>
                <p
                  style={{
                    fontSize: 13,
                    fontFamily: 'Amiri',
                    color: t.textSec,
                    margin: '4px 0 0',
                    lineHeight: 1.8,
                  }}
                >
                  {noPressureMsg.text}
                </p>
              </div>
            )}
          </Card>

          {/* ─── Steadfastness Indicator ─── */}
          <Card style={{ marginTop: 12 }}>
            <Sec icon="🤍" text="مؤشر الثبات" />
            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              {[
                {
                  label: 'مستوى القرب',
                  icon: '🤍',
                  value: state.bedtimeRating || 3,
                  max: 5,
                  color: t.purple,
                },
                {
                  label: 'مستوى التركيز',
                  icon: '✨',
                  value: Math.min(
                    5,
                    Math.round(
                      (Object.values(state.todayChecks).filter(Boolean)
                        .length /
                        Math.max(
                          1,
                          Object.keys(state.goals).filter(
                            (k) => state.goals[k],
                          ).length,
                        )) *
                        5,
                    ),
                  ),
                  max: 5,
                  color: t.accent,
                },
                {
                  label: 'مستوى الالتزام',
                  icon: '🌙',
                  value: Math.min(5, Math.round(state.streak / 2)),
                  max: 5,
                  color: t.gold,
                },
              ].map((ind) => (
                <div
                  key={ind.label}
                  style={{
                    flex: '1 1 calc(33% - 8px)',
                    minWidth: 90,
                    textAlign: 'center',
                    padding: '10px 8px',
                    borderRadius: 14,
                    background: t.cardAlt,
                    boxSizing: 'border-box',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{ind.icon}</span>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 2,
                      margin: '6px 0 4px',
                    }}
                  >
                    {Array.from({ length: ind.max }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          background:
                            i < ind.value
                              ? ind.color
                              : `${t.muted}30`,
                          transition: 'background .3s',
                        }}
                      />
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: 9,
                      color: t.muted,
                      margin: 0,
                      fontWeight: 600,
                    }}
                  >
                    {ind.label}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* ─── Encouraging Close ─── */}
          <div
            style={{
              textAlign: 'center',
              marginTop: 12,
              padding: '14px',
              borderRadius: 18,
              background: `${t.green}0C`,
              border: `1px solid ${t.green}20`,
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: t.green,
                margin: '0 0 3px',
              }}
            >
              💚 أنت أقرب للجنة مما تتخيل
            </p>
          </div>

          {/* ─── Support Message ─── */}
          {!state.supportDismissed && (
            <Card
              style={{
                marginTop: 12,
                background: isDark
                  ? `linear-gradient(135deg, ${t.gold}08, ${t.accent}06)`
                  : `linear-gradient(135deg, ${t.gold}0A, ${t.accent}08)`,
                border: `1px solid ${t.gold}18`,
                position: 'relative',
              }}
            >
              <button
                onClick={() =>
                  dispatch({
                    type: 'SET_SUPPORT_DISMISSED',
                    dismissed: true,
                  })
                }
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  width: 22,
                  height: 22,
                  borderRadius: 7,
                  border: 'none',
                  background: `${t.muted}20`,
                  color: t.muted,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
              <div style={{ textAlign: 'center', padding: '4px 0' }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: t.goldLight,
                    margin: '0 0 6px',
                  }}
                >
                  {SUPPORT_MESSAGE.title}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: t.textSec,
                    lineHeight: 1.7,
                    margin: '0 0 8px',
                  }}
                >
                  {SUPPORT_MESSAGE.text}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: t.muted,
                    margin: '6px 0 0',
                    fontStyle: 'italic',
                  }}
                >
                  {SUPPORT_MESSAGE.note}
                </p>
              </div>
            </Card>
          )}

          <div style={{ height: 16 }} />
        </div>
      </IonContent>
    </IonPage>
  );
}
