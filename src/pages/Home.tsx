import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonPage } from "@ionic/react";
import { DynMoon } from "../components/DynMoon";
import { Card } from "../components/Card";
import { Sec } from "../components/Sec";
import { ShareButton } from "../components/ShareButton";
import { Ring } from "../components/Ring";
import { Chk } from "../components/Chk";
import { Confetti } from "../components/Confetti";
import { useTheme, useIsDark } from "../context/ThemeContext";
import { getRamadanInfo, AR_DAYS } from "../lib/ramadan";
import { formatHijriDate, getHijriDate, getHijriLunarDay } from "../lib/hijri";
import { getJuzInfo } from "../lib/juz";
import { getSurahNameForPage } from "../lib/surah";
import adhkarData from "../lib/adhkar.json";
import {
  HADITHS,
  DAILY_IBADAAT,
  DAILY_TIPS,
  RAMADAN_DAY_HADITHS,
  HEART_FEELINGS,
  DAILY_LEARNING,
  NO_PRESSURE_MESSAGES,
  DAILY_QURAN_REFLECTIONS,
  QURAN_MILESTONES,
} from "../lib/data";
import type { QuranReflection } from "../lib/data";
import { useDailyTafsir, getTadabburDayIndex } from "../lib/tafsir";
import { useHadithOfTheDay, formatHadithText } from "../lib/api";
import { verifyHadithWithDorar, isKnownSahihSource } from "../lib/dorar";
import { stripNonQuranicSuffixes } from "../lib/contentPolicy";
import { fontSans } from "../lib/theme";
import type { AppState } from "../lib/state";
import type { Action } from "../lib/state";

const CHALLENGES: Array<{
  key: string;
  icon: string;
  label: string;
  link: string;
  /** Tafsir: show تدبر in-app modal instead of opening a link */
  openTadabbor?: boolean;
}> = [
  {
    key: "azkarMorning",
    icon: "☀️",
    label: "أذكار الصباح",
    link: "/adhkar?tab=morning",
  },
  {
    key: "azkarEvening",
    icon: "🌅",
    label: "أذكار المساء",
    link: "/adhkar?tab=evening",
  },
  { key: "qiyam", icon: "🌙", label: "قيام الليل", link: "/more#qiyam" },
  { key: "sadaqa", icon: "💰", label: "صدقة", link: "/more#sadaqa" },
  { key: "podcast", icon: "🎙️", label: "بودكاست", link: "/notes?tab=podcasts" },
  { key: "dua", icon: "🤲", label: "الدعاء قبل المغرب", link: "/more#dua" },
  { key: "tafsir", icon: "📚", label: "تفسير", link: "", openTadabbor: true },
];

type HomeProps = { state: AppState; dispatch: (a: Action) => void };

export function Home({ state, dispatch }: HomeProps) {
  const t = useTheme();
  const isDark = useIsDark();
  const history = useHistory();
  const info = getRamadanInfo();
  const hijri = getHijriDate();
  const lunarDay = getHijriLunarDay();

  // Use same effective slots as the list (merge todaySlots with readingTimes) so progress always matches what user sees
  const effectiveSlots =
    state.todaySlots.length === state.readingTimes.length
      ? state.todaySlots
      : state.readingTimes.map((rt, idx) => {
          const ex = state.todaySlots[idx];
          const match =
            ex && ex.label === rt.label && ex.icon === rt.icon ? ex : null;
          const ps = Math.ceil(
            state.dailyPages / Math.max(1, state.readingTimes.length),
          );
          return {
            ...rt,
            done: match?.done ?? false,
            pages: match?.pages ?? ps,
          };
        });

  const slotPages = effectiveSlots.reduce(
    (s, x) => s + (x.done ? x.pages : 0),
    0,
  );
  const viewedPages = state.todayQuranPagesViewed?.length ?? 0;
  const tp = Math.max(slotPages, viewedPages);
  const dpct = Math.min(100, Math.round((tp / state.dailyPages) * 100));
  const ac = Object.entries(state.goals)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const cd = ac.filter((k) =>
    k === "subha"
      ? Object.values(state.subha).reduce((a, b) => a + b, 0) > 0
      : state.todayChecks[k],
  ).length;
  const cpct = ac.length > 0 ? Math.round((cd / ac.length) * 100) : 0;
  const xp =
    cd * 50 +
    tp * 3 +
    Object.values(state.subha).reduce((a, b) => a + b, 0) +
    state.quranMilestoneXP;
  const currentQuranPage = Math.min(
    604,
    Math.max(1, state.totalPagesEver + tp),
  );
  const juz = getJuzInfo(state.totalPagesEver + tp);
  const currentSurahName = getSurahNameForPage(currentQuranPage);
  const dayIdx = Math.max(0, (info.day ?? new Date().getDate()) - 1);
  const { hadith, dorarVerified } = useHadithOfTheDay(dayIdx, HADITHS);
  const todayIbada = DAILY_IBADAAT[dayIdx % DAILY_IBADAAT.length]!;
  const todayTip = DAILY_TIPS[dayIdx % DAILY_TIPS.length]!;

  // Dhikr of the day: morning vs evening by time, random zikr each time app opens; click to show another
  const [todayDhikrState, setTodayDhikrState] = useState(() => {
    const hour = new Date().getHours();
    const isEvening = hour >= 12; // مساءً من الظهر، صباحاً قبل الظهر
    const list = isEvening
      ? (adhkarData.evening as { arabic: string }[])
      : (adhkarData.morning as { arabic: string }[]);
    const item = list[Math.floor(Math.random() * list.length)];
    return {
      text: item?.arabic ?? "",
      isEvening,
    };
  });
  const todayDhikr = todayDhikrState.text;
  const isEveningDhikr = todayDhikrState.isEvening;

  const showNextDhikr = () => {
    const list = isEveningDhikr
      ? (adhkarData.evening as { arabic: string }[])
      : (adhkarData.morning as { arabic: string }[]);
    if (list.length === 0) return;
    const others = list.filter((x) => x.arabic !== todayDhikr);
    const pool = others.length > 0 ? others : list;
    const item = pool[Math.floor(Math.random() * pool.length)];
    if (item) setTodayDhikrState((s) => ({ ...s, text: item.arabic }));
  };

  const dayHadith = RAMADAN_DAY_HADITHS[dayIdx % RAMADAN_DAY_HADITHS.length]!;
  const [dayHadithDorarVerified, setDayHadithDorarVerified] = useState<
    boolean | null
  >(null);
  useEffect(() => {
    if (isKnownSahihSource(dayHadith.source)) {
      setDayHadithDorarVerified(true);
      return;
    }
    let cancelled = false;
    verifyHadithWithDorar(dayHadith.text).then((r) => {
      if (!cancelled) setDayHadithDorarVerified(r.verified);
    });
    return () => {
      cancelled = true;
    };
  }, [dayHadith.text, dayHadith.source]);
  const todayLearning = DAILY_LEARNING[dayIdx % DAILY_LEARNING.length]!;
  const selectedHeart = HEART_FEELINGS.find((h) => h.id === state.heartFeeling);
  const noPressureMsg =
    NO_PRESSURE_MESSAGES[dayIdx % NO_PRESSURE_MESSAGES.length]!;
  const tadabburDayIdx = getTadabburDayIndex(
    info.day,
    DAILY_QURAN_REFLECTIONS.length,
  );
  const { data: dailyTafsir } = useDailyTafsir(
    tadabburDayIdx,
    DAILY_QURAN_REFLECTIONS,
  );

  // Check for Quran milestones
  const lastMilestone = QURAN_MILESTONES.filter(
    (m) => m.pages <= state.totalPagesEver + tp,
  ).sort((a, b) => b.pages - a.pages)[0];
  const nextMilestone = QURAN_MILESTONES.find(
    (m) => m.pages > state.totalPagesEver + tp,
  );

  const [conf, setConf] = useState(false);
  const [tafsirModalOpen, setTafsirModalOpen] = useState(false);
  const [tadabburOverride, setTadabburOverride] =
    useState<QuranReflection | null>(null);
  useEffect(() => {
    setTadabburOverride(null);
  }, [tadabburDayIdx]);
  const displayedTafsir =
    tadabburOverride != null
      ? {
          surah: tadabburOverride.surah,
          surahNumber: tadabburOverride.surahNumber,
          ayah: tadabburOverride.ayah,
          arabic: tadabburOverride.arabic,
          tafsirText: tadabburOverride.reflection,
          tags: tadabburOverride.tags,
          source: "local" as const,
        }
      : dailyTafsir;
  const onTadabburTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const withTag = DAILY_QURAN_REFLECTIONS.filter((r) => r.tags.includes(tag));
    if (withTag.length === 0) return;
    const currentKey = `${displayedTafsir.surahNumber}_${displayedTafsir.ayah}`;
    const idx = withTag.findIndex(
      (r) => `${r.surahNumber}_${r.ayah}` === currentKey,
    );
    const next = withTag[(idx + 1) % withTag.length]!;
    setTadabburOverride(next);
  };
  const perf = dpct >= 100 && cpct >= 100;
  useEffect(() => {
    if (perf && !conf) setConf(true);
  }, [perf, conf]);

  const hdr =
    info.phase === "pre"
      ? `باقي ${info.daysTo} يوم على رمضان`
      : info.phase === "ramadan"
      ? `${info.day} رمضان ${hijri.year.toLocaleString('ar-EG', { useGrouping: false })}`
      : "رمضان كريم — استمر!";

  const ibadaColor = t[todayIbada.color];

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="ion-padding"
        style={
          {
            fontFamily: fontSans,
            position: "relative",
            "--background": t.bg,
            "--ion-background-color": t.bg,
            color: t.text,
          } as React.CSSProperties
        }
      >
        <Confetti trigger={conf} />
        <div className="ion-content-inner" style={{ position: "relative" }}>
          {/* ─── Header ─── */}
          <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
            <DynMoon day={lunarDay} size={34} />
            <p style={{ color: t.muted, fontSize: 11, margin: "5px 0 0" }}>
              {AR_DAYS[new Date().getDay()]}
            </p>
            <p
              style={{
                fontFamily: "Amiri",
                fontSize: 14,
                color: t.muted,
                margin: "0 0 2px",
              }}
            >
              {formatHijriDate(hijri)}
            </p>
            <h2
              style={{
                fontFamily: "Amiri",
                fontSize: 19,
                color: t.goldLight,
                margin: "2px 0",
              }}
            >
              {hdr}
            </h2>
            <div
              style={{
                display: "inline-flex",
                gap: 6,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  background: t.bb(t.orange),
                  borderRadius: 16,
                  padding: "3px 10px",
                  fontSize: 11,
                  color: t.orange,
                  fontWeight: 700,
                }}
              >
                🔥 {state.streak}
              </span>
              <span
                style={{
                  background: t.bb(t.purple),
                  borderRadius: 16,
                  padding: "3px 10px",
                  fontSize: 11,
                  color: t.purple,
                  fontWeight: 700,
                }}
              >
                ⚡ المستوى {state.level}
              </span>
            </div>
          </div>

          {/* ─── Day-Specific Hadith under Moon ─── */}
          {info.phase === "ramadan" && (
            <div
              style={{
                position: "relative",
                textAlign: "center",
                padding: "8px 16px",
                margin: "0 0 8px",
                borderRadius: 16,
                background: isDark ? `${t.gold}08` : `${t.gold}0A`,
                border: `1px solid ${t.gold}15`,
              }}
            >
              <div style={{ position: "absolute", top: 6, left: 8 }}>
                <ShareButton
                  compact
                  content={{
                    title: "حديث اليوم",
                    text: dayHadith.text,
                    source: dayHadith.source,
                  }}
                  style={{ padding: "6px 8px", borderRadius: 10 }}
                />
              </div>
              <p
                style={{
                  fontFamily: "Amiri",
                  fontSize: 12,
                  color: t.text,
                  lineHeight: 1.9,
                  margin: "2px 0",
                  opacity: 0.9,
                }}
              >
                "{dayHadith.text}"
              </p>
              <p style={{ fontSize: 9, color: t.muted, margin: 0 }}>
                — {dayHadith.source}
                {dayHadithDorarVerified === true && (
                  <span
                    style={{ marginRight: 4, color: t.green, fontWeight: 600 }}
                  >
                    {" "}
                    • صحيح حسب الدرر
                  </span>
                )}
              </p>
            </div>
          )}

          {/* ─── Heart Check-in ─── */}
          <Card
            style={{
              margin: "0 0 10px",
              padding: "14px 16px",
              background: isDark
                ? `linear-gradient(135deg, ${t.purple}08, ${t.accent}06)`
                : `linear-gradient(135deg, ${t.purple}0A, ${t.accent}08)`,
              border: `1px solid ${t.purple}18`,
            }}
          >
            <Sec icon="💜" text="قلبك النهارده عامل إيه؟" />
            {!selectedHeart ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  justifyContent: "center",
                }}
              >
                {HEART_FEELINGS.map((h) => (
                  <button
                    key={h.id}
                    onClick={() =>
                      dispatch({ type: "SET_HEART_FEELING", feeling: h.id })
                    }
                    style={{
                      background: t.cardAlt,
                      border: `1px solid ${t.border}40`,
                      borderRadius: 14,
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontFamily: fontSans,
                      color: t.text,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "all .2s",
                      minWidth: "calc(50% - 6px)",
                      boxSizing: "border-box",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{h.emoji}</span>
                    <span style={{ fontSize: 11 }}>{h.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div
                style={{
                  background: t.cardAlt,
                  borderRadius: 16,
                  padding: "14px",
                  animation: "fadeIn .4s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 22 }}>{selectedHeart.emoji}</span>
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: t.text }}
                  >
                    {selectedHeart.label}
                  </span>
                  <button
                    onClick={() =>
                      dispatch({ type: "SET_HEART_FEELING", feeling: "" })
                    }
                    style={{
                      marginRight: "auto",
                      fontSize: 10,
                      color: t.muted,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: fontSans,
                      textDecoration: "underline",
                    }}
                  >
                    غيّر
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: state.heartActionDone
                      ? `${t.green}10`
                      : `${t.purple}10`,
                    border: `1px solid ${
                      state.heartActionDone ? t.green : t.purple
                    }20`,
                    cursor: "pointer",
                    transition: "all .25s",
                  }}
                  onClick={() =>
                    dispatch({
                      type: "SET_HEART_ACTION_DONE",
                      done: !state.heartActionDone,
                    })
                  }
                >
                  <span style={{ fontSize: 18 }}>
                    {selectedHeart.actionIcon}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: state.heartActionDone ? t.green : t.text,
                      fontWeight: 600,
                      flex: 1,
                      textDecoration: state.heartActionDone
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {selectedHeart.action}
                  </span>
                  {state.heartActionDone && (
                    <span
                      style={{ fontSize: 10, color: t.green, fontWeight: 700 }}
                    >
                      ✓ تم
                    </span>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* ─── No Pressure Message (when mode is on) ─── */}
          {state.noPressureMode && (
            <div
              style={{
                textAlign: "center",
                padding: "10px 14px",
                marginBottom: 8,
                borderRadius: 14,
                background: `${t.green}08`,
                border: `1px solid ${t.green}15`,
                animation: "fadeIn .5s",
              }}
            >
              <span style={{ fontSize: 16 }}>{noPressureMsg.icon}</span>
              <p
                style={{
                  fontSize: 12,
                  color: t.textSec,
                  margin: "3px 0 0",
                  lineHeight: 1.7,
                  fontFamily: "Amiri",
                }}
              >
                {noPressureMsg.text}
              </p>
            </div>
          )}

          {/* ─── XP Bar ─── */}
          <Card style={{ padding: "10px 14px", margin: "10px 0" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 11, color: t.purple, fontWeight: 700 }}>
                ⚡ {xp} نقطة
              </span>
              <span style={{ fontSize: 10, color: t.muted }}>
                التالي: {state.level * 800}
              </span>
            </div>
            {state.quranMilestoneXP > 0 && (
              <p
                style={{
                  fontSize: 9,
                  color: t.gold,
                  margin: "0 0 4px",
                  textAlign: "center",
                }}
              >
                🏆 مكافأة إنجازات القرآن: +{state.quranMilestoneXP} XP
              </p>
            )}
            <div
              style={{
                width: "100%",
                height: 5,
                background: `${t.purple}1A`,
                borderRadius: 3,
              }}
            >
              <div
                style={{
                  width: `${Math.min(
                    100,
                    (xp / Math.max(1, state.level * 800)) * 100,
                  )}%`,
                  height: "100%",
                  background: `linear-gradient(90deg,${t.purple},${t.accent})`,
                  borderRadius: 3,
                  transition: "width .5s",
                }}
              />
            </div>
          </Card>

          {/* ─── Progress Rings ─── */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              margin: "6px 0 12px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Ring pct={dpct} size={112} stroke={8} color={t.gold} pulse>
                <span style={{ fontSize: 24, fontWeight: 800, color: t.gold }}>
                  {tp}
                </span>
                <span style={{ fontSize: 9, color: t.muted }}>
                  / {state.dailyPages} صفحة
                </span>
              </Ring>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={() => history.push("/setup")}
                  style={{
                    fontSize: 10,
                    color: t.gold,
                    background: "transparent",
                    border: "none",
                    fontFamily: fontSans,
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  تعديل هدف القراءة
                </button>
                {tp > 0 && (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "RESET_TODAY_READING" })}
                    style={{
                      fontSize: 10,
                      color: t.muted,
                      background: "transparent",
                      border: "none",
                      fontFamily: fontSans,
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    إعادة القراءة اليوم
                  </button>
                )}
              </div>
            </div>
            <Ring pct={cpct} size={112} stroke={8} color={t.green} pulse>
              <span style={{ fontSize: 24, fontWeight: 800, color: t.green }}>
                {cd}
              </span>
              <span style={{ fontSize: 9, color: t.muted }}>
                / {ac.length} تحدي
              </span>
            </Ring>
          </div>

          {/* ─── Daily Ibada Card ─── */}
          <div
            style={{
              borderRadius: 22,
              padding: "18px 18px 16px",
              margin: "0 0 12px",
              background: isDark
                ? `linear-gradient(135deg, ${ibadaColor}12, ${ibadaColor}06)`
                : `linear-gradient(135deg, ${ibadaColor}15, ${ibadaColor}08)`,
              border: `1.5px solid ${ibadaColor}25`,
              position: "relative",
              overflow: "hidden",
              animation: "ibadaCardIn .5s cubic-bezier(.4,0,.2,1)",
            }}
          >
            {/* Decorative circle */}
            <div
              style={{
                position: "absolute",
                top: -20,
                left: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: `${ibadaColor}08`,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: isDark ? `${ibadaColor}18` : `${ibadaColor}12`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                {todayIbada.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 3,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: ibadaColor,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                    }}
                  >
                    ✨ عبادة اليوم
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: t.text,
                    margin: "0 0 4px",
                  }}
                >
                  {todayIbada.title}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: t.textSec,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {todayIbada.description}
                </p>
                <div
                  style={{
                    marginTop: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background: `${ibadaColor}12`,
                    borderRadius: 10,
                    padding: "3px 10px",
                  }}
                >
                  <span style={{ fontSize: 10 }}>🏅</span>
                  <span
                    style={{ fontSize: 10, color: ibadaColor, fontWeight: 600 }}
                  >
                    {todayIbada.reward}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Dhikr of the day (morning/evening by time, random on open; tap for another) ─── */}
          <Card
            style={{
              marginBottom: 12,
              background: isDark ? `${t.gold}08` : `${t.gold}0A`,
            }}
            onClick={showNextDhikr}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: `${t.gold}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                🌿
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 10, color: t.gold, fontWeight: 700 }}>
                  ذِكر اليوم {isEveningDhikr ? "مساءً" : "صباحاً"}
                </span>
                <p
                  style={{
                    fontFamily: "Amiri",
                    fontSize: 13,
                    color: t.text,
                    lineHeight: 1.9,
                    margin: "3px 0 0",
                  }}
                >
                  {todayDhikr}
                </p>
                <span style={{ fontSize: 10, color: t.gold, opacity: 0.8 }}>
                  اضغط لذكر آخر
                </span>
              </div>
            </div>
          </Card>

          {/* ─── آية اليوم للتدبر (مصدر واحد مع تحدّي التفسير) ─── */}
          <Card
            style={{
              marginBottom: 12,
              background: isDark
                ? `linear-gradient(135deg, ${t.accent}08, ${t.purple}06)`
                : `linear-gradient(135deg, ${t.accent}0C, ${t.purple}08)`,
              border: `1px solid ${t.accent}20`,
            }}
            onClick={() => setTafsirModalOpen(true)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: `${t.accent}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                ✨
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{ fontSize: 10, color: t.accent, fontWeight: 700 }}
                >
                  آية اليوم للتدبر
                </span>
                <p
                  style={{
                    fontSize: 10,
                    color: t.muted,
                    margin: "2px 0 0",
                  }}
                >
                  {displayedTafsir.surah} : {displayedTafsir.ayah}
                  {displayedTafsir.source === "dorar" && (
                    <span style={{ marginRight: 6, color: t.gold }}>
                      {" "}
                      — من الدرر السنية
                    </span>
                  )}
                </p>
              </div>
            </div>
            <p
              style={{
                fontFamily: "Amiri",
                fontSize: 14,
                color: t.text,
                lineHeight: 2,
                margin: "0 0 8px",
                textAlign: "center",
                padding: "8px",
                background: isDark ? `${t.accent}05` : `${t.accent}08`,
                borderRadius: 10,
              }}
            >
              "{stripNonQuranicSuffixes(displayedTafsir.arabic)}"
            </p>
            <p
              style={{
                fontSize: 12,
                color: t.textSec,
                lineHeight: 1.8,
                margin: "0 0 8px",
              }}
            >
              {displayedTafsir.tafsirText}
            </p>
            <div
              style={{
                display: "flex",
                gap: 4,
                flexWrap: "wrap",
              }}
            >
              {displayedTafsir.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => onTadabburTagClick(tag, e)}
                  style={{
                    fontSize: 9,
                    color: t.accent,
                    background: `${t.accent}10`,
                    padding: "2px 8px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: fontSans,
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </Card>

          {/* ─── Quran Reading ─── (dynamic: slots or actual pages viewed in Quran app) */}
          <Card glow>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Sec
                  icon="📖"
                  text={`القراءة — ${tp} / ${state.dailyPages} صفحة`}
                />
                <span style={{ fontSize: 9, color: t.muted, fontWeight: 600 }}>
                  هدف اليوم: {state.dailyPages} صفحة
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const page = Math.min(
                    604,
                    Math.max(1, state.totalPagesEver + tp),
                  );
                  history.push(`/quran?page=${page}`);
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: 12,
                  border: `1px solid ${t.gold}40`,
                  background: `${t.gold}15`,
                  color: t.gold,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: fontSans,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                افتح المصحف ←
              </button>
            </div>
            {effectiveSlots.map((slot, i) => (
              <div
                key={i}
                onClick={() => dispatch({ type: "TOGGLE_SLOT", i })}
                onKeyDown={(e) =>
                  e.key === "Enter" && dispatch({ type: "TOGGLE_SLOT", i })
                }
                role="button"
                tabIndex={0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "10px 11px",
                  borderRadius: 13,
                  marginBottom: 5,
                  background: slot.done ? `${t.green}0C` : t.cardAlt,
                  border: `1px solid ${
                    slot.done ? t.green + "28" : "transparent"
                  }`,
                  cursor: "pointer",
                  transition: "all .25s",
                }}
              >
                <Chk
                  done={slot.done}
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    dispatch({ type: "TOGGLE_SLOT", i });
                  }}
                />
                <span style={{ fontSize: 17 }}>{slot.icon}</span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 600,
                    color: slot.done ? t.green : t.text,
                    textDecoration: slot.done ? "line-through" : "none",
                    transition: "color .25s",
                  }}
                >
                  {slot.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: slot.done ? t.green : t.muted,
                    fontWeight: 600,
                  }}
                >
                  {slot.done ? `${slot.pages} ص ✅` : `${slot.pages} ص`}
                </span>
              </div>
            ))}
            <div
              key={`juz-progress-${state.totalPagesEver}-${tp}`}
              onClick={() => {
                const page = Math.min(
                  604,
                  Math.max(1, state.totalPagesEver + tp),
                );
                history.push(`/quran?page=${page}`);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const page = Math.min(
                    604,
                    Math.max(1, state.totalPagesEver + tp),
                  );
                  history.push(`/quran?page=${page}`);
                }
              }}
              style={{
                background: t.cardAlt,
                borderRadius: 14,
                padding: "11px 14px",
                marginTop: 8,
                cursor: "pointer",
                transition: "all .25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark
                  ? `${t.gold}08`
                  : `${t.gold}0A`;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 4px 12px ${t.gold}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = t.cardAlt;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: t.goldLight,
                      transition: "all .3s ease",
                    }}
                  >
                    الجزء {juz.currentJuz} — سورة {currentSurahName}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      color: t.muted,
                      fontWeight: 600,
                    }}
                  >
                    أنت عند صفحة {state.totalPagesEver + tp} من ٦٠٤
                  </span>
                </div>
                <span style={{ fontSize: 12, color: t.gold, fontWeight: 700 }}>
                  {juz.khatmaPct}%
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 6,
                  background: `${t.gold}1A`,
                  borderRadius: 3,
                  marginTop: 7,
                }}
              >
                <div
                  style={{
                    width: `${juz.khatmaPct}%`,
                    height: "100%",
                    background: `linear-gradient(90deg,${t.gold},${t.goldLight})`,
                    borderRadius: 3,
                    transition: "width .6s ease-out",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 6,
                  flexWrap: "wrap",
                  gap: 4,
                }}
              >
                {juz.khatmas > 0 && (
                  <p
                    style={{
                      fontSize: 10,
                      color: t.green,
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    ✅ {juz.khatmas} ختمة مكتملة
                  </p>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: "RESET_QURAN_PROGRESS" });
                  }}
                  style={{
                    fontSize: 10,
                    color: t.muted,
                    background: "transparent",
                    border: "none",
                    fontFamily: fontSans,
                    cursor: "pointer",
                    fontWeight: 600,
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  إعادة من بداية المصحف
                </button>
              </div>
            </div>

            {/* Quran Milestone Achievement */}
            {lastMilestone && (
              <div
                style={{
                  marginTop: 10,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${t.gold}12, ${t.accent}08)`,
                  border: `1px solid ${t.gold}25`,
                  animation: "fadeIn .5s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 22 }}>{lastMilestone.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: t.gold,
                        margin: "0 0 2px",
                      }}
                    >
                      {lastMilestone.title}
                    </p>
                    <p
                      style={{
                        fontSize: 10,
                        color: t.textSec,
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {lastMilestone.message}
                    </p>
                  </div>
                </div>
                {nextMilestone && (
                  <p
                    style={{
                      fontSize: 9,
                      color: t.muted,
                      margin: "6px 0 0",
                      textAlign: "center",
                    }}
                  >
                    الهدف التالي: {nextMilestone.title} ({nextMilestone.pages}{" "}
                    صفحة)
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* ─── Daily Challenges ─── */}
          <Card style={{ marginTop: 12 }}>
            <Sec icon="✅" text="تحديات اليوم" />
            {CHALLENGES.filter((c) => state.goals[c.key]).map((c) => (
              <div
                key={c.key}
                onClick={() => dispatch({ type: "TOGGLE_CHECK", key: c.key })}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  dispatch({ type: "TOGGLE_CHECK", key: c.key })
                }
                role="button"
                tabIndex={0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 11px",
                  borderRadius: 13,
                  marginBottom: 4,
                  background: state.todayChecks[c.key]
                    ? `${t.green}08`
                    : "transparent",
                  cursor: "pointer",
                  transition: "all .25s",
                }}
              >
                <Chk
                  done={!!state.todayChecks[c.key]}
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    dispatch({ type: "TOGGLE_CHECK", key: c.key });
                  }}
                />
                <span style={{ fontSize: 17 }}>{c.icon}</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: state.todayChecks[c.key] ? t.green : t.text,
                    textDecoration: state.todayChecks[c.key]
                      ? "line-through"
                      : "none",
                    flex: 1,
                    transition: "color .25s",
                  }}
                >
                  {c.label}
                </span>
                {state.todayChecks[c.key] && (
                  <span
                    style={{ fontSize: 10, color: t.green, fontWeight: 700 }}
                  >
                    +٥٠ ⚡
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (c.openTadabbor) setTafsirModalOpen(true);
                    else if (c.link) history.push(c.link);
                  }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 10,
                    border: `1px solid ${t.border}50`,
                    background: "transparent",
                    color: t.accent,
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: fontSans,
                    cursor: "pointer",
                  }}
                >
                  افتح
                </button>
              </div>
            ))}
          </Card>

          {/* تدبر / تفسير — نفس محتوى آية اليوم للتدبر (من الدرر عند التوفّر) */}
          {tafsirModalOpen && (
            <div
              role="dialog"
              aria-label="آية اليوم للتدبر"
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
              onClick={() => setTafsirModalOpen(false)}
            >
              <div onClick={(e) => e.stopPropagation()} role="presentation">
                <Card
                  style={{
                    maxWidth: 400,
                    width: "100%",
                    maxHeight: "80vh",
                    overflow: "auto",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{ fontSize: 14, fontWeight: 700, color: t.gold }}
                    >
                      آية اليوم للتدبر — {displayedTafsir.surah} :{" "}
                      {displayedTafsir.ayah}
                      {displayedTafsir.source === "dorar" && (
                        <span
                          style={{
                            fontSize: 11,
                            color: t.muted,
                            fontWeight: 500,
                          }}
                        >
                          {" "}
                          (من الدرر السنية)
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTafsirModalOpen(false)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 10,
                        border: "none",
                        background: t.muted + "30",
                        color: t.text,
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: fontSans,
                        cursor: "pointer",
                      }}
                    >
                      إغلاق
                    </button>
                  </div>
                  <p
                    style={{
                      fontFamily: "Amiri",
                      fontSize: 15,
                      color: t.text,
                      lineHeight: 2,
                      margin: "0 0 12px",
                      textAlign: "center",
                    }}
                  >
                    "{stripNonQuranicSuffixes(displayedTafsir.arabic)}"
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: t.textSec,
                      lineHeight: 1.8,
                      margin: 0,
                    }}
                  >
                    {displayedTafsir.tafsirText}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      flexWrap: "wrap",
                      marginTop: 10,
                    }}
                  >
                    {displayedTafsir.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTadabburTagClick(tag, e);
                        }}
                        style={{
                          fontSize: 10,
                          color: t.accent,
                          background: `${t.accent}12`,
                          padding: "2px 8px",
                          borderRadius: 8,
                          border: "none",
                          cursor: "pointer",
                          fontFamily: fontSans,
                          fontWeight: 600,
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ─── Hadith ─── */}
          <Card style={{ marginTop: 12, background: t.gc }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 11, color: t.gold, fontWeight: 600 }}>
                💎 حديث اليوم
              </span>
              <ShareButton
                compact
                content={{
                  title: "حديث اليوم",
                  text: formatHadithText(hadith.text),
                  source: hadith.source,
                }}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontFamily: "Amiri",
                  fontSize: 14,
                  color: t.text,
                  lineHeight: 2,
                  margin: "8px 0 4px",
                  whiteSpace: "pre-line",
                }}
              >
                "{formatHadithText(hadith.text)}"
              </p>
              <p style={{ fontSize: 10, color: t.muted, margin: 0 }}>
                — {hadith.source}
                {dorarVerified === true && (
                  <span
                    style={{ marginRight: 6, color: t.green, fontWeight: 600 }}
                  >
                    {" "}
                    • صحيح حسب الدرر
                  </span>
                )}
              </p>
            </div>
          </Card>

          {/* ─── Daily Tip (Moaazah-like) ─── */}
          <div
            style={{
              marginTop: 12,
              borderRadius: 18,
              padding: "14px 16px",
              background: isDark
                ? `linear-gradient(135deg, ${t.accent}0A, ${t.purple}08)`
                : `linear-gradient(135deg, ${t.accent}0D, ${t.purple}0A)`,
              border: `1px solid ${t.accent}18`,
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: 20,
                width: 34,
                height: 34,
                borderRadius: 10,
                background: `${t.accent}12`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              💡
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 2,
                }}
              >
                <span
                  style={{ fontSize: 10, color: t.accent, fontWeight: 700 }}
                >
                  نصيحة اليوم
                </span>
                <ShareButton
                  compact
                  content={{ title: "نصيحة اليوم", text: todayTip }}
                  style={{
                    padding: "6px 8px",
                    borderRadius: 10,
                    borderColor: `${t.accent}40`,
                    background: `${t.accent}12`,
                    color: t.accent,
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: t.textSec,
                  margin: "3px 0 0",
                  lineHeight: 1.7,
                }}
              >
                {todayTip}
              </p>
            </div>
          </div>

          {/* ─── Daily Learning (Moaazah-like) ─── */}
          <Card style={{ marginTop: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <Sec icon={todayLearning.icon} text={todayLearning.category} />
              <ShareButton
                compact
                content={{
                  title: todayLearning.category + " — " + todayLearning.title,
                  text: todayLearning.content,
                }}
              />
            </div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: t.text,
                margin: "0 0 4px",
              }}
            >
              {todayLearning.title}
            </p>
            <p
              style={{
                fontSize: 12,
                color: t.textSec,
                margin: 0,
                lineHeight: 1.7,
                fontFamily: "Amiri",
              }}
            >
              {todayLearning.content}
            </p>
          </Card>

          {/* ─── Perfect Day ─── */}
          {perf && (
            <div
              style={{
                marginTop: 12,
                textAlign: "center",
                padding: "16px",
                borderRadius: 20,
                background: `linear-gradient(135deg,${t.gold}12,${t.green}0A)`,
                border: `1px solid ${t.gold}28`,
                animation: "fadeIn .6s",
              }}
            >
              <span style={{ fontSize: 40 }}>🏆</span>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: t.goldLight,
                  margin: "4px 0 2px",
                }}
              >
                يوم مثالي!
              </p>
            </div>
          )}

          {/* Bottom spacer */}
          <div style={{ height: 16 }} />
        </div>
      </IonContent>
    </IonPage>
  );
}
