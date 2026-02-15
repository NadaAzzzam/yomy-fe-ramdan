import { useMemo } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { Card } from "../components/Card";
import { Sec } from "../components/Sec";
import { Ring } from "../components/Ring";
import { useTheme } from "../context/ThemeContext";
import { fontSans } from "../lib/theme";
import { AR_DAYS } from "../lib/ramadan";
import type { AppState, Action, DailySnapshot } from "../lib/state";
import { buildDailySnapshot } from "../lib/state";

type DayRow = {
  dateKey: string;
  dayName: string;
  pct: number;
  quran: boolean;
  azkar: boolean;
  subha: boolean;
  qiyam: boolean;
};

function getDateKey(d: Date): string {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

/** Last 7 days (oldest first): today is last in list for RTL display. */
function getLast7Days(state: AppState): DayRow[] {
  const today = new Date();
  const rows: DayRow[] = [];
  const todayKey = getDateKey(today);
  const todaySnapshot = buildDailySnapshot(state);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = getDateKey(d);
    const dayName = AR_DAYS[d.getDay()] ?? "—";
    const snap: DailySnapshot | undefined =
      dateKey === todayKey
        ? todaySnapshot
        : state.dailyHistory[dateKey];

    rows.push({
      dateKey,
      dayName,
      pct: snap?.pct ?? 0,
      quran: snap?.quran ?? false,
      azkar: snap?.azkar ?? false,
      subha: snap?.subha ?? false,
      qiyam: snap?.qiyam ?? false,
    });
  }
  return rows;
}

function toArabicDigits(n: number): string {
  return String(n)
    .replace(/0/g, "٠")
    .replace(/1/g, "١")
    .replace(/2/g, "٢")
    .replace(/3/g, "٣")
    .replace(/4/g, "٤")
    .replace(/5/g, "٥")
    .replace(/6/g, "٦")
    .replace(/7/g, "٧")
    .replace(/8/g, "٨")
    .replace(/9/g, "٩");
}

type WeeklyProps = { state: AppState; dispatch: (a: Action) => void };

export function Weekly({ state, dispatch }: WeeklyProps) {
  const t = useTheme();
  const hasHistory = Object.keys(state.dailyHistory).length > 0;

  const weekRows = useMemo(() => getLast7Days(state), [state]);

  const avgPct =
    weekRows.length > 0
      ? Math.round(
          weekRows.reduce((s, r) => s + r.pct, 0) / weekRows.length
        )
      : 0;

  const prevWeekAvg = useMemo(() => {
    const prevStart = new Date();
    prevStart.setDate(prevStart.getDate() - 14);
    let sum = 0;
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(prevStart);
      d.setDate(d.getDate() + i);
      const key = getDateKey(d);
      const snap = state.dailyHistory[key];
      if (snap != null) {
        sum += snap.pct;
        count++;
      }
    }
    return count === 0 ? null : Math.round(sum / count);
  }, [state.dailyHistory]);

  const diff = prevWeekAvg != null ? avgPct - prevWeekAvg : 0;
  const diffLabel =
    prevWeekAvg != null && prevWeekAvg > 0
      ? diff >= 0
        ? "📈 +" + toArabicDigits(diff) + "%"
        : "📉 −" + toArabicDigits(-diff) + "%"
      : null;

  const detailRows = useMemo(() => {
    const n = weekRows.length;
    const quranCount = weekRows.filter((r) => r.quran).length;
    const azkarCount = weekRows.filter((r) => r.azkar).length;
    const subhaCount = weekRows.filter((r) => r.subha).length;
    const qiyamCount = weekRows.filter((r) => r.qiyam).length;
    return [
      {
        icon: "📖",
        l: "القرآن",
        v: `${toArabicDigits(quranCount)}/${toArabicDigits(n)}`,
        p: n > 0 ? Math.round((quranCount / n) * 100) : 0,
        c: t.gold,
      },
      {
        icon: "☀️",
        l: "أذكار الصباح والمساء",
        v: `${toArabicDigits(azkarCount)}/${toArabicDigits(n)}`,
        p: n > 0 ? Math.round((azkarCount / n) * 100) : 0,
        c: t.orange,
      },
      {
        icon: "📿",
        l: "السُبحة",
        v: `${toArabicDigits(subhaCount)}/${toArabicDigits(n)}`,
        p: n > 0 ? Math.round((subhaCount / n) * 100) : 0,
        c: t.accent,
      },
      {
        icon: "🌙",
        l: "قيام",
        v: `${toArabicDigits(qiyamCount)}/${toArabicDigits(n)}`,
        p: n > 0 ? Math.round((qiyamCount / n) * 100) : 0,
        c: t.purple,
      },
    ];
  }, [weekRows, t]);

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="ion-padding"
        style={{
          fontFamily: fontSans,
          "--background": t.bg,
          color: t.text,
        } as React.CSSProperties}
      >
        <div className="ion-content-inner">
          <div style={{ textAlign: "center", padding: "12px 0 6px" }}>
            <h2
              style={{
                fontFamily: "Amiri",
                fontSize: 20,
                color: t.goldLight,
                margin: 0,
              }}
            >
              📊 التقرير الأسبوعي
            </h2>
            <p style={{ fontSize: 10, color: t.muted, margin: "4px 8px 0", maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}>
              النسبة اليومية = متوسط (نسبة القرآن + نسبة التحديات). قيام الليل ضمن التحديات.
            </p>
            {hasHistory ? (
              <button
                type="button"
                onClick={() => dispatch({ type: "CLEAR_DAILY_HISTORY" })}
                style={{
                  marginTop: 8,
                  padding: "6px 14px",
                  fontSize: 11,
                  color: t.muted,
                  background: "transparent",
                  border: `1px solid ${t.muted}30`,
                  borderRadius: 12,
                  fontFamily: fontSans,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                مسح بيانات التقرير
              </button>
            ) : (
              <p
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  color: t.muted,
                }}
              >
                البيانات حسب إنجازك الفعلي فقط
              </p>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "14px 0",
            }}
          >
            <Ring pct={avgPct} size={122} stroke={8} color={t.green}>
              <span style={{ fontSize: 26, fontWeight: 800, color: t.green }}>
                {toArabicDigits(avgPct)}%
              </span>
              <span style={{ fontSize: 9, color: t.muted }}>المعدل</span>
            </Ring>
          </div>

          {diffLabel != null && (
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <span
                style={{
                  background: `${t.green}12`,
                  padding: "4px 12px",
                  borderRadius: 16,
                  fontSize: 11,
                  color: t.green,
                  fontWeight: 700,
                }}
              >
                {diffLabel}
              </span>
            </div>
          )}

          <Card glow>
            <Sec icon="📊" text="الإنجاز اليومي" />
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                height: 120,
                gap: 4,
              }}
            >
              {weekRows.map((r) => (
                <div
                  key={r.dateKey}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      color: r.pct === 100 ? t.green : t.muted,
                      fontWeight: 700,
                    }}
                  >
                    {toArabicDigits(r.pct)}%
                  </span>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 26,
                      height: `${Math.max(4, (r.pct / 100) * 75)}px`,
                      borderRadius: 7,
                      background:
                        r.pct === 100
                          ? t.green
                          : r.pct >= 80
                            ? t.gold
                            : t.orange,
                      opacity: 0.85,
                      transition: "height .6s",
                    }}
                  />
                  <span style={{ fontSize: 9, color: t.muted }}>
                    {r.dayName}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ marginTop: 12 }}>
            <Sec icon="📋" text="التفاصيل" />
            {detailRows.map((x, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "7px 0",
                  borderBottom:
                    i < detailRows.length - 1
                      ? `1px solid ${t.muted}10`
                      : "none",
                }}
              >
                <span style={{ fontSize: 16 }}>{x.icon}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: t.text,
                      }}
                    >
                      {x.l}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: x.c,
                      }}
                    >
                      {x.v}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: 4,
                      background: `${x.c}1A`,
                      borderRadius: 2,
                    }}
                  >
                    <div
                      style={{
                        width: `${x.p}%`,
                        height: "100%",
                        background: x.c,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </Card>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 9,
              marginTop: 12,
            }}
          >
            <Card style={{ textAlign: "center", padding: "12px 8px" }}>
              <span style={{ fontSize: 22 }}>🔥</span>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: t.orange,
                  margin: "2px 0 0",
                }}
              >
                {toArabicDigits(state.streak)}
              </p>
              <p style={{ fontSize: 9, color: t.muted }}>متتالي</p>
            </Card>
            <Card style={{ textAlign: "center", padding: "12px 8px" }}>
              <span style={{ fontSize: 22 }}>⚡</span>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: t.purple,
                  margin: "2px 0 0",
                }}
              >
                م {toArabicDigits(state.level)}
              </p>
              <p style={{ fontSize: 9, color: t.muted }}>
                {state.level >= 3 ? "مجتهد" : "مبتدئ"}
              </p>
            </Card>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
