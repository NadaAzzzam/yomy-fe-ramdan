import { useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { AppLogo } from "../components/AppLogo";
import { Card } from "../components/Card";
import { Sec } from "../components/Sec";
import { Btn } from "../components/Btn";
import { useTheme } from "../context/ThemeContext";
import { getRamadanInfo } from "../lib/ramadan";
import { fontSans } from "../lib/theme";
import type { AppState } from "../lib/state";
import type { Action } from "../lib/state";

const RESET_CONFIRM_MSG =
  "هل تريد إعادة تعيين التطبيق بالكامل؟ ستفقد كل التقدم والإعدادات وتعود كما لو كنت مستخدماً جديداً.";

const GOAL_OPTIONS = [
  { key: "azkarMorning", icon: "☀️", label: "أذكار الصباح" },
  { key: "azkarEvening", icon: "🌅", label: "أذكار المساء" },
  { key: "qiyam", icon: "🌙", label: "قيام الليل" },
  { key: "sadaqa", icon: "💰", label: "صدقة يومية" },
  { key: "podcast", icon: "🎙️", label: "بودكاست / درس" },
  { key: "dua", icon: "🤲", label: "الدعاء قبل المغرب" },
  { key: "tafsir", icon: "📚", label: "تفسير آية" },
  { key: "subha", icon: "📿", label: "سُبحة / تسبيح" },
];

const ICONS = ["⏰", "🕐", "💼", "🏠", "📍", "☕", "🛏️", "🕓"];

type SetupProps = {
  state: AppState;
  dispatch: (a: Action) => void;
  onFinish: () => void;
  onResetApp?: () => void;
};

export function Setup({ state, dispatch, onFinish, onResetApp }: SetupProps) {
  const t = useTheme();
  const info = getRamadanInfo();
  const [showTI, setShowTI] = useState(false);
  const [nt, setNt] = useState("");
  const handleReset = () => {
    if (window.confirm(RESET_CONFIRM_MSG)) onResetApp?.();
  };
  const k = Math.floor((state.dailyPages * 30) / 604);

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
          <div style={{ textAlign: "center", padding: "14px 0 6px" }}>
            <AppLogo size={100} />
            {info.phase === "pre" && (
              <div
                style={{
                  marginTop: 10,
                  background: t.bb(t.orange),
                  border: `1px solid ${t.orange}30`,
                  borderRadius: 16,
                  padding: "12px 16px",
                }}
              >
                <span style={{ fontSize: 26 }}>🌙</span>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: t.orange,
                    margin: "4px 0 2px",
                  }}
                >
                  باقي {info.daysTo} أيام على رمضان!
                </p>
                <p style={{ fontSize: 11, color: t.muted, margin: 0 }}>
                  جهّز قلبك وجدولك من دلوقتي
                </p>
              </div>
            )}
          </div>

          <Card style={{ marginTop: 14 }} glow>
            <Sec icon="📖" text="عدد الصفحات يومياً" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              {[
                { l: "−١٠", v: -10, w: 40 },
                { l: "−", v: -1, w: 34 },
              ].map((b, i) => (
                <button
                  key={i}
                  onClick={() =>
                    dispatch({
                      type: "SET_PAGES",
                      v: Math.max(1, state.dailyPages + b.v),
                    })
                  }
                  style={{
                    width: b.w,
                    height: b.w,
                    borderRadius: 11,
                    border: `1px solid ${t.gold}33`,
                    background: t.cardAlt,
                    color: t.gold,
                    fontSize: 14,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {b.l}
                </button>
              ))}
              <div style={{ textAlign: "center", minWidth: 60 }}>
                <span
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    color: t.gold,
                    lineHeight: 1,
                  }}
                >
                  {state.dailyPages}
                </span>
                <p style={{ color: t.muted, fontSize: 10, margin: "2px 0 0" }}>
                  صفحة/يوم
                </p>
              </div>
              {[
                { l: "+", v: 1, w: 34 },
                { l: "+١٠", v: 10, w: 40 },
              ].map((b, i) => (
                <button
                  key={i}
                  onClick={() =>
                    dispatch({ type: "SET_PAGES", v: state.dailyPages + b.v })
                  }
                  style={{
                    width: b.w,
                    height: b.w,
                    borderRadius: 11,
                    border: `1px solid ${t.gold}33`,
                    background: t.cardAlt,
                    color: t.gold,
                    fontSize: 14,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {b.l}
                </button>
              ))}
            </div>
            <div
              style={{
                background: t.cardAlt,
                borderRadius: 12,
                padding: "10px 14px",
                marginTop: 12,
                textAlign: "center",
              }}
            >
              {k >= 1 ? (
                <span style={{ fontSize: 13, color: t.green, fontWeight: 700 }}>
                  🎉 {k} ختمة في رمضان!
                </span>
              ) : (
                <span style={{ fontSize: 12, color: t.orange }}>
                  📌 تحتاج ٢١ صفحة يومياً لختمة
                </span>
              )}
            </div>
          </Card>

          <Card style={{ marginTop: 12 }}>
            <Sec icon="⏰" text="أوقات القراءة" />
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {state.readingTimes.map((rt, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: t.bb(t.gold),
                    border: `1px solid ${t.gold}20`,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{rt.icon}</span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 13,
                      fontWeight: 600,
                      color: t.text,
                    }}
                  >
                    {rt.label}
                  </span>
                  <span style={{ fontSize: 11, color: t.muted }}>
                    ≈{Math.ceil(state.dailyPages / state.readingTimes.length)} ص
                  </span>
                  <button
                    onClick={() => dispatch({ type: "RM_TIME", i })}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 9,
                      border: "none",
                      background: `${t.red}20`,
                      color: t.red,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {showTI ? (
                <div style={{ display: "flex", gap: 7 }}>
                  <input
                    value={nt}
                    onChange={(e) => setNt(e.target.value)}
                    placeholder="مثلاً: استراحة الغداء"
                    style={{
                      flex: 1,
                      background: t.inputBg,
                      border: `1px solid ${t.gold}30`,
                      borderRadius: 12,
                      padding: "10px 12px",
                      color: t.text,
                      fontFamily: fontSans,
                      fontSize: 13,
                      outline: "none",
                      direction: "rtl",
                    }}
                  />
                  <button
                    onClick={() => {
                      if (nt.trim()) {
                        dispatch({
                          type: "ADD_TIME",
                          t: {
                            label: nt.trim(),
                            icon: ICONS[
                              state.readingTimes.length % ICONS.length
                            ]!,
                          },
                        });
                        setNt("");
                        setShowTI(false);
                      }
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      border: "none",
                      background: t.green,
                      color: "#fff",
                      fontSize: 18,
                      cursor: "pointer",
                      fontWeight: 800,
                    }}
                  >
                    +
                  </button>
                  <button
                    onClick={() => {
                      setShowTI(false);
                      setNt("");
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      border: "none",
                      background: `${t.red}20`,
                      color: t.red,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowTI(true)}
                  style={{
                    padding: "12px",
                    borderRadius: 14,
                    border: `2px dashed ${t.accent}40`,
                    background: `${t.accent}08`,
                    color: t.accent,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: fontSans,
                    fontWeight: 600,
                  }}
                >
                  + أضف وقت قراءة
                </button>
              )}
            </div>
          </Card>

          <Card style={{ marginTop: 12 }}>
            <Sec icon="🎯" text="التحديات اليومية" />
            {GOAL_OPTIONS.map((g) => (
              <div
                key={g.key}
                onClick={() => dispatch({ type: "TOGGLE_GOAL", key: g.key })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "10px 12px",
                  borderRadius: 14,
                  marginBottom: 5,
                  background: state.goals[g.key] ? t.bb(t.gold) : "transparent",
                  border: `1.5px solid ${state.goals[g.key] ? t.gold + "35" : "transparent"}`,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 20 }}>{g.icon}</span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 600,
                    color: t.text,
                  }}
                >
                  {g.label}
                </span>
                <div
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    background: state.goals[g.key] ? t.green : t.muted + "33",
                    padding: 2,
                    transition: "all .3s",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      background: "#fff",
                      transform: state.goals[g.key]
                        ? "translateX(0)"
                        : "translateX(20px)",
                      transition: "all .3s",
                      boxShadow: "0 1px 3px #00000022",
                    }}
                  />
                </div>
              </div>
            ))}
          </Card>

          <Btn
            onClick={onFinish}
            style={{
              width: "100%",
              marginTop: 18,
              fontSize: 16,
              padding: "15px",
            }}
          >
            {info.phase === "pre" ? "جهّز الجدول 🌙" : "ابدأ التحدي 🔥"}
          </Btn>

          {onResetApp && (
            <button
              type="button"
              onClick={handleReset}
              style={{
                width: "100%",
                marginTop: 16,
                padding: "12px 16px",
                fontSize: 13,
                fontFamily: fontSans,
                color: t.muted,
                background: "transparent",
                border: `1px dashed ${t.muted}50`,
                borderRadius: 12,
                cursor: "pointer",
              }}
            >
              إعادة التعيين — كأني مستخدم جديد
            </button>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
