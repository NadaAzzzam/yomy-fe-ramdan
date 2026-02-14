import { useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { Card } from "../components/Card";
import { Sec } from "../components/Sec";
import { Ring } from "../components/Ring";
import { useTheme } from "../context/ThemeContext";
import { fontSans } from "../lib/theme";
import { useDhikrHadith, formatHadithText } from "../lib/api";
import type { AppState } from "../lib/state";
import type { Action } from "../lib/state";
import type { SubhaCounts } from "../lib/state";

type TasbihItem = {
  id: keyof SubhaCounts;
  label: string;
  arabic: string;
  target: number;
  color: string;
  icon: string;
  reward: string;
};

function buildTasbihat(t: ReturnType<typeof useTheme>): TasbihItem[] {
  return [
    {
      id: "subhanallah",
      label: "سبحان الله",
      arabic: "سُبْحَانَ اللَّه",
      target: 33,
      color: t.gold,
      icon: "✨",
      reward: "غُرست له نخلة في الجنة",
    },
    {
      id: "alhamdulillah",
      label: "الحمد لله",
      arabic: "الْحَمْدُ لِلَّه",
      target: 33,
      color: t.green,
      icon: "💚",
      reward: "تملأ الميزان",
    },
    {
      id: "allahuakbar",
      label: "الله أكبر",
      arabic: "اللَّهُ أَكْبَر",
      target: 33,
      color: t.orange,
      icon: "🔥",
      reward: "تملأ ما بين السماء والأرض",
    },
    {
      id: "istighfar",
      label: "استغفار",
      arabic: "أَسْتَغْفِرُ اللَّه",
      target: 100,
      color: t.purple,
      icon: "🤲",
      reward: "من لزم الاستغفار جعل الله له من كل ضيق مخرجاً",
    },
    {
      id: "hawqala",
      label: "حوقلة",
      arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّه",
      target: 100,
      color: t.accent,
      icon: "💎",
      reward: "كنز من كنوز الجنة",
    },
    {
      id: "salawat",
      label: "صلاة على النبي",
      arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد ﷺ",
      target: 100,
      color: "#E8A87C",
      icon: "🕌",
      reward: "من صلّى عليّ صلاة صلّى الله عليه بها عشراً",
    },
    {
      id: "tahlil",
      label: "تهليل",
      arabic: "لَا إِلَٰهَ إِلَّا اللَّه",
      target: 100,
      color: "#5BC0BE",
      icon: "🌟",
      reward: "أفضل ما قلت أنا والنبيون من قبلي",
    },
    {
      id: "basmala",
      label: "بسملة",
      arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم",
      target: 33,
      color: t.goldLight,
      icon: "📖",
      reward: "بركة في كل عمل",
    },
  ];
}

const QUICK_TASBIH = [
  { label: "سبحان الله ×٣٣", id: "subhanallah" as const, n: 33, icon: "✨" },
  { label: "الحمد لله ×٣٣", id: "alhamdulillah" as const, n: 33, icon: "💚" },
  { label: "الله أكبر ×٣٣", id: "allahuakbar" as const, n: 33, icon: "🔥" },
  { label: "استغفار ×١٠٠", id: "istighfar" as const, n: 100, icon: "🤲" },
  { label: "حوقلة ×١٠٠", id: "hawqala" as const, n: 100, icon: "💎" },
  { label: "صلاة على النبي ×١٠٠", id: "salawat" as const, n: 100, icon: "🕌" },
];

/** Hadiths about dhikr and remembrance of Allah (الذكر والذاكرون) */
const DHIKR_HADITHS: { text: string; source: string }[] = [
  {
    text: "كان رسولُ اللهِ صلَّى اللهُ عليه وسلَّم يسيرُ في طريقِ مكَّةَ فمَرَّ على جبلٍ يُقالُ له جُمْدَانُ فقال: سِيروا هذا جُمْدَانُ، سبَق المُفرِّدونَ سبَق المُفرِّدونَ. قالوا: يا رسولَ اللهِ ما المُفرِّدونَ؟ قال: الذَّاكرونَ اللهَ كثيرًا والذَّاكراتُ.",
    source: "رواه مسلم",
  },
  {
    text: "أحب الكلام إلى الله أربع: سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر. لا يضرك بأيهن بدأت.",
    source: "رواه مسلم",
  },
  {
    text: "كلمتان خفيفتان على اللسان ثقيلتان في الميزان حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم.",
    source: "رواه البخاري ومسلم",
  },
  {
    text: "من قال سبحان الله وبحمده مائة مرة غُفرت ذنوبه وإن كانت مثل زبد البحر.",
    source: "رواه مسلم",
  },
  {
    text: "من قال لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير، مائة مرة كانت له عدل عشر رقاب.",
    source: "رواه البخاري ومسلم",
  },
  {
    text: "الباقيات الصالحات: سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر، ولا حول ولا قوة إلا بالله.",
    source: "رواه الترمذي",
  },
  {
    text: "ألا أنبئكم بخير أعمالكم وأزكاها عند مليككم وأرفعها في درجاتكم؟ قالوا: بلى. قال: ذكر الله كثيراً.",
    source: "رواه الترمذي",
  },
  {
    text: "مثل الذي يذكر ربه والذي لا يذكر ربه مثل الحي والميت.",
    source: "رواه البخاري",
  },
  {
    text: "إن الله يقول: أنا عند ظن عبدي بي، وأنا معه إذا ذكرني؛ فإن ذكرني في نفسه ذكرته في نفسي، وإن ذكرني في ملأ ذكرته في ملأ خير منهم.",
    source: "رواه البخاري ومسلم",
  },
];

type SubhaProps = { state: AppState; dispatch: (a: Action) => void };

export function Subha({ state, dispatch }: SubhaProps) {
  const t = useTheme();
  const tasbihat = buildTasbihat(t);
  const [activeIdx, setActiveIdx] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [hadithIdx, setHadithIdx] = useState(0);
  const { hadith: dhikrHadith, loading: dhikrHadithLoading } = useDhikrHadith(
    hadithIdx,
    DHIKR_HADITHS,
  );

  const active = tasbihat[activeIdx]!;
  const count = state.subha[active.id] || 0;
  const pct = Math.min(100, Math.round((count / active.target) * 100));
  const totalToday = Object.values(state.subha).reduce((a, b) => a + b, 0);
  const completedCount = tasbihat.filter(
    (tb) => (state.subha[tb.id] || 0) >= tb.target,
  ).length;

  const handleTap = () => {
    dispatch({ type: "SUBHA_INC", id: active.id });
    setPulse(true);
    setTimeout(() => setPulse(false), 200);
  };

  const handleReset = (id: keyof SubhaCounts) => {
    dispatch({ type: "SUBHA_RESET", id });
  };

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="ion-padding"
        style={
          {
            fontFamily: fontSans,
            "--background": t.bg,
            color: t.text,
          } as React.CSSProperties
        }
      >
        <div className="ion-content-inner">
          <div style={{ textAlign: "center", padding: "12px 0 6px" }}>
            <h2
              style={{
                fontFamily: "Amiri",
                fontSize: 21,
                color: t.goldLight,
                margin: "0 0 2px",
              }}
            >
              📿 السُّبحة
            </h2>
            <p style={{ color: t.muted, fontSize: 12, margin: 0 }}>
              ذكر الله حياة القلوب
            </p>
          </div>

          <Card style={{ padding: "10px 14px", margin: "8px 0" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{ fontSize: 12, color: t.goldLight, fontWeight: 700 }}
              >
                📿 إجمالي اليوم: {totalToday} تسبيحة
              </span>
              <span style={{ fontSize: 11, color: t.green, fontWeight: 700 }}>
                {completedCount}/{tasbihat.length} مكتمل
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: 5,
                background: `${t.green}1A`,
                borderRadius: 3,
                marginTop: 6,
              }}
            >
              <div
                style={{
                  width: `${(completedCount / tasbihat.length) * 100}%`,
                  height: "100%",
                  background: t.green,
                  borderRadius: 3,
                  transition: "width .5s",
                }}
              />
            </div>
          </Card>

          <div
            style={{
              display: "flex",
              gap: 7,
              overflowX: "auto",
              padding: "8px 0 12px",
              scrollbarWidth: "none",
            }}
          >
            {tasbihat.map((tb, i) => {
              const cnt = state.subha[tb.id] || 0;
              const done = cnt >= tb.target;
              return (
                <div
                  key={tb.id}
                  onClick={() => setActiveIdx(i)}
                  style={{
                    minWidth: 72,
                    textAlign: "center",
                    padding: "10px 6px",
                    borderRadius: 16,
                    background: activeIdx === i ? `${tb.color}18` : t.cardAlt,
                    border: `2px solid ${activeIdx === i ? tb.color + "55" : "transparent"}`,
                    cursor: "pointer",
                    transition: "all .2s",
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{tb.icon}</span>
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: activeIdx === i ? tb.color : t.muted,
                      margin: "3px 0 0",
                    }}
                  >
                    {tb.label}
                  </p>
                  <p
                    style={{
                      fontSize: 9,
                      color: done ? t.green : t.muted,
                      margin: "2px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    {cnt}/{tb.target}
                  </p>
                  {done && (
                    <div
                      style={{
                        position: "absolute",
                        top: 3,
                        left: 3,
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        background: t.green,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ fontSize: 8, color: "#fff" }}>✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Card glow style={{ textAlign: "center", padding: "24px 18px" }}>
            <p
              style={{
                fontFamily: "Amiri",
                fontSize: 26,
                color: active.color,
                margin: "0 0 4px",
                lineHeight: 1.8,
              }}
            >
              {active.arabic}
            </p>
            <p style={{ fontSize: 11, color: t.muted, margin: "0 0 16px" }}>
              {active.label}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "0 0 16px",
              }}
            >
              <Ring pct={pct} size={180} stroke={10} color={active.color} pulse>
                <div
                  onClick={handleTap}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    background: `radial-gradient(circle at 40% 40%, ${active.color}30, ${active.color}10)`,
                    border: `3px solid ${active.color}44`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all .15s",
                    transform: pulse ? "scale(0.92)" : "scale(1)",
                    boxShadow: pulse ? `0 0 30px ${active.color}44` : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: 42,
                      fontWeight: 800,
                      color: active.color,
                      lineHeight: 1,
                    }}
                  >
                    {count}
                  </span>
                  <span style={{ fontSize: 10, color: t.muted, marginTop: 2 }}>
                    / {active.target}
                  </span>
                </div>
              </Ring>
            </div>

            <p style={{ fontSize: 12, color: t.muted, margin: "0 0 10px" }}>
              {count >= active.target
                ? "🎉 مكتمل — ما شاء الله!"
                : "اضغط على الدائرة للعد"}
            </p>

            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                onClick={handleTap}
                style={{
                  flex: 1,
                  maxWidth: 130,
                  padding: "12px",
                  borderRadius: 14,
                  background: `linear-gradient(135deg,${active.color},${active.color}BB)`,
                  color: "#fff",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: fontSans,
                  cursor: "pointer",
                  boxShadow: `0 3px 16px ${active.color}44`,
                }}
              >
                + سبّح
              </button>
              <button
                onClick={() => handleReset(active.id)}
                style={{
                  padding: "12px 18px",
                  borderRadius: 14,
                  background: `${t.red}15`,
                  border: `1px solid ${t.red}30`,
                  color: t.red,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: fontSans,
                  cursor: "pointer",
                }}
              >
                ↺ إعادة
              </button>
            </div>

            {count >= active.target && (
              <div
                style={{
                  marginTop: 14,
                  background: `${active.color}10`,
                  borderRadius: 14,
                  padding: "12px",
                  border: `1px solid ${active.color}22`,
                  animation: "fadeIn .5s",
                }}
              >
                <span style={{ fontSize: 24 }}>🏆</span>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: active.color,
                    margin: "4px 0 2px",
                  }}
                >
                  أجرك عند الله
                </p>
                <p
                  style={{
                    fontSize: 12,
                    fontFamily: "Amiri",
                    color: t.text,
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  "{active.reward}"
                </p>
              </div>
            )}
          </Card>

          <Card style={{ marginTop: 12 }}>
            <Sec icon="⚡" text="تسبيح سريع" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {QUICK_TASBIH.map((q, i) => {
                const cnt = state.subha[q.id] || 0;
                const done = cnt >= q.n;
                return (
                  <div
                    key={i}
                    onClick={() =>
                      !done && dispatch({ type: "SUBHA_INC", id: q.id })
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "11px 12px",
                      borderRadius: 14,
                      background: done ? `${t.green}0C` : t.cardAlt,
                      border: `1px solid ${done ? t.green + "28" : "transparent"}`,
                      cursor: done ? "default" : "pointer",
                      transition: "all .2s",
                      opacity: done ? 0.7 : 1,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{q.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 11,
                          fontWeight: 600,
                          color: done ? t.green : t.text,
                        }}
                      >
                        {q.label}
                      </p>
                      <div
                        style={{
                          width: "100%",
                          height: 3,
                          background: `${t.gold}1A`,
                          borderRadius: 2,
                          marginTop: 4,
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, (cnt / q.n) * 100)}%`,
                            height: "100%",
                            background: t.gold,
                            borderRadius: 2,
                            transition: "width .3s",
                          }}
                        />
                      </div>
                    </div>
                    {done && (
                      <span style={{ fontSize: 12, color: t.green }}>✅</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button
              onClick={() => {
                if (window.confirm("هل تريد إعادة تعيين كل العدادات؟"))
                  dispatch({ type: "SUBHA_RESET_ALL" });
              }}
              style={{
                background: "transparent",
                border: `1px solid ${t.red}30`,
                borderRadius: 12,
                padding: "8px 20px",
                color: t.red,
                fontSize: 11,
                fontFamily: fontSans,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ↺ إعادة تعيين كل العدادات
            </button>
          </div>

          <Card style={{ marginTop: 14 }}>
            <Sec icon="📜" text="أحاديث في الذكر والتسبيح" />
            <div
              style={{
                overflow: "hidden",
                borderRadius: 14,
                background: `${t.gold}08`,
                border: `1px solid ${t.gold}15`,
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  minHeight: 100,
                }}
              >
                {dhikrHadithLoading ? (
                  <p
                    style={{
                      fontSize: 12,
                      color: t.muted,
                      margin: 0,
                      textAlign: "center",
                    }}
                  >
                    ...
                  </p>
                ) : (
                  <>
                    <p
                      style={{
                        fontFamily: "Amiri",
                        fontSize: 14,
                        color: t.text,
                        lineHeight: 2,
                        margin: 0,
                        textAlign: "center",
                        direction: "rtl",
                        whiteSpace: "pre-line",
                      }}
                    >
                      "{formatHadithText(dhikrHadith.text)}"
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: t.muted,
                        margin: "10px 0 0",
                        textAlign: "center",
                      }}
                    >
                      — {dhikrHadith.source}
                    </p>
                  </>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px 12px",
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  aria-label="حديث سابق"
                  onClick={() =>
                    setHadithIdx((i) =>
                      i === 0 ? DHIKR_HADITHS.length - 1 : i - 1,
                    )
                  }
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: `1px solid ${t.gold}40`,
                    background: t.cardAlt,
                    color: t.gold,
                    fontSize: 18,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  ‹
                </button>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {DHIKR_HADITHS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`حديث ${i + 1}`}
                      onClick={() => setHadithIdx(i)}
                      style={{
                        width: hadithIdx === i ? 20 : 8,
                        height: 8,
                        borderRadius: 4,
                        border: "none",
                        background: hadithIdx === i ? t.gold : `${t.gold}40`,
                        cursor: "pointer",
                        transition: "all .2s",
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  aria-label="حديث تالي"
                  onClick={() =>
                    setHadithIdx((i) =>
                      i === DHIKR_HADITHS.length - 1 ? 0 : i + 1,
                    )
                  }
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: `1px solid ${t.gold}40`,
                    background: t.cardAlt,
                    color: t.gold,
                    fontSize: 18,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  ›
                </button>
              </div>
            </div>
          </Card>
        </div>
      </IonContent>
    </IonPage>
  );
}
