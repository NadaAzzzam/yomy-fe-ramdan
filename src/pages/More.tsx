import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useTheme, useIsDark } from "../context/ThemeContext";
import { fontSans } from "../lib/theme";

const MENU_ITEMS = [
  {
    path: "/notes",
    icon: "📓",
    label: "دفتر",
    desc: "يومياتك وملاحظاتك",
    color: "accent",
  },
  {
    path: "/motivation",
    icon: "🌙",
    label: "تحفيز",
    desc: "أحاديث وتذكير يومي",
    color: "purple",
  },
  {
    path: "/weekly",
    icon: "📊",
    label: "تقرير أسبوعي",
    desc: "متابعة تقدمك",
    color: "green",
  },
  {
    path: "/setup",
    icon: "⚙️",
    label: "الإعدادات",
    desc: "تخصيص التطبيق",
    color: "orange",
  },
] as const;

export function More() {
  const t = useTheme();
  const isDark = useIsDark();
  const history = useHistory();

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="ion-padding"
        style={
          {
            fontFamily: fontSans,
            "--background": t.bg,
            "--ion-background-color": t.bg,
            color: t.text,
          } as React.CSSProperties
        }
      >
        <div style={{ position: "relative" }}>
          {/* ─── Header ─── */}
          <div style={{ textAlign: "center", padding: "14px 0 20px" }}>
            <span style={{ fontSize: 32 }}>📋</span>
            <h2
              style={{
                fontFamily: "Amiri",
                fontSize: 22,
                color: t.goldLight,
                margin: "6px 0 2px",
              }}
            >
              المزيد
            </h2>
            <p style={{ fontSize: 11, color: t.muted, margin: 0 }}>
              كل ما تحتاجه في مكان واحد
            </p>
          </div>

          {/* ─── Grid ─── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {MENU_ITEMS.map((item) => {
              const itemColor = t[item.color as keyof typeof t] as string;
              return (
                <div
                  key={item.path}
                  onClick={() => history.push(item.path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && history.push(item.path)
                  }
                  style={{
                    background: isDark
                      ? `linear-gradient(135deg, ${itemColor}0A, ${itemColor}05)`
                      : `linear-gradient(135deg, ${itemColor}0E, ${itemColor}06)`,
                    border: `1px solid ${itemColor}18`,
                    borderRadius: 18,
                    padding: "20px 16px",
                    cursor: "pointer",
                    transition: "all .25s",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    minHeight: 120,
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 16,
                      background: `${itemColor}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                      marginBottom: 2,
                    }}
                  >
                    {item.icon}
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: t.text,
                      margin: 0,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: t.textSec,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom spacer */}
          <div style={{ height: 20 }} />
        </div>
      </IonContent>
    </IonPage>
  );
}
