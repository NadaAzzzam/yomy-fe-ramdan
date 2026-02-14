import { useState, useRef } from "react";
import { IonContent, IonPage } from "@ionic/react";
import {
  AppIconSvg,
  FeatureGraphicSvg,
  SplashSvg,
  AdaptiveIconForegroundSvg,
  AdaptiveIconBackgroundSvg,
} from "../assets/play-store";
import { fontSans } from "../lib/theme";
import { C } from "../assets/play-store/constants";

function downloadSvg(container: HTMLDivElement | null, filename: string) {
  const svgEl = container?.querySelector("svg");
  if (!svgEl) return;
  const svg = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function PlayStoreKit() {
  const [tab, setTab] = useState(0);
  const appIconRef = useRef<HTMLDivElement>(null);
  const featureRef = useRef<HTMLDivElement>(null);
  const splashRef = useRef<HTMLDivElement>(null);
  const adaptiveFgRef = useRef<HTMLDivElement>(null);
  const adaptiveBgRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { label: "أيقونة التطبيق 512", id: 0 },
    { label: "Feature Graphic 1024×500", id: 1 },
    { label: "Splash Screen", id: 2 },
    { label: "Adaptive Icon", id: 3 },
  ];

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="ion-padding"
        style={
          {
            fontFamily: fontSans,
            direction: "rtl",
            "--background": "#040812",
          } as React.CSSProperties
        }
      >
        <div
          className="ion-content-inner"
          style={{ maxWidth: 1060, margin: "0 auto" }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h1
              style={{
                fontFamily: "Amiri",
                fontSize: 28,
                color: C.goldLight,
                margin: 0,
              }}
            >
              يومي في رمضان
            </h1>
            <p style={{ color: C.muted, fontSize: 14, margin: "4px 0 0" }}>
              Google Play Store — تصدير SVG
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 24,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background:
                    tab === t.id
                      ? `linear-gradient(135deg,${C.gold},${C.goldDark})`
                      : C.navyMid,
                  color: tab === t.id ? "#080E1F" : C.muted,
                  border: `1px solid ${tab === t.id ? C.gold : "#222850"}`,
                  borderRadius: 14,
                  padding: "8px 16px",
                  fontFamily: fontSans,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 0 && (
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 13,
                  color: C.gold,
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                أيقونة التطبيق 512×512 — للـ Play Store
              </p>
              <div
                ref={appIconRef}
                style={{
                  borderRadius: 90,
                  overflow: "hidden",
                  boxShadow: "0 10px 40px #00000066",
                  display: "inline-block",
                  marginBottom: 12,
                }}
              >
                <AppIconSvg size={280} />
              </div>
              <br />
              <button
                onClick={() =>
                  downloadSvg(
                    appIconRef.current,
                    "yomy-ramadan-app-icon-512.svg",
                  )
                }
                style={{
                  background: C.gold,
                  color: "#080E1F",
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 24px",
                  fontFamily: fontSans,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ⬇ تحميل SVG
              </button>
              <p style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
                حوّل إلى PNG 512×512 عبر أداة أونلاين أو Android Studio
              </p>
            </div>
          )}

          {tab === 1 && (
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 13,
                  color: C.gold,
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                Feature Graphic 1024×500
              </p>
              <div
                ref={featureRef}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 10px 50px #00000066",
                  display: "inline-block",
                  maxWidth: "100%",
                  marginBottom: 12,
                }}
              >
                <FeatureGraphicSvg />
              </div>
              <br />
              <button
                onClick={() =>
                  downloadSvg(
                    featureRef.current,
                    "yomy-ramadan-feature-graphic-1024x500.svg",
                  )
                }
                style={{
                  background: C.gold,
                  color: "#080E1F",
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 24px",
                  fontFamily: fontSans,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ⬇ تحميل SVG
              </button>
            </div>
          )}

          {tab === 2 && (
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 13,
                  color: C.gold,
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                Splash Screen 375×812
              </p>
              <div
                ref={splashRef}
                style={{
                  borderRadius: 40,
                  overflow: "hidden",
                  boxShadow: "0 20px 60px #00000066",
                  display: "inline-block",
                  border: "2px solid #222850",
                  marginBottom: 12,
                }}
              >
                <SplashSvg />
              </div>
              <br />
              <button
                onClick={() =>
                  downloadSvg(
                    splashRef.current,
                    "yomy-ramadan-splash-375x812.svg",
                  )
                }
                style={{
                  background: C.gold,
                  color: "#080E1F",
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 24px",
                  fontFamily: fontSans,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ⬇ تحميل SVG
              </button>
            </div>
          )}

          {tab === 3 && (
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 13,
                  color: C.gold,
                  fontWeight: 700,
                  marginBottom: 14,
                }}
              >
                Adaptive Icon — طبقة خلفية + أمامية (432×432)
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 24,
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                <div>
                  <p style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
                    الخلفية
                  </p>
                  <div
                    ref={adaptiveBgRef}
                    style={{
                      borderRadius: 20,
                      overflow: "hidden",
                      boxShadow: "0 6px 24px #00000044",
                      display: "inline-block",
                    }}
                  >
                    <AdaptiveIconBackgroundSvg size={160} />
                  </div>
                  <br />
                  <button
                    onClick={() =>
                      downloadSvg(
                        adaptiveBgRef.current,
                        "yomy-ramadan-adaptive-background.svg",
                      )
                    }
                    style={{
                      marginTop: 8,
                      background: C.navyMid,
                      color: C.goldLight,
                      border: `1px solid ${C.gold}40`,
                      borderRadius: 10,
                      padding: "8px 16px",
                      fontFamily: fontSans,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    تحميل SVG
                  </button>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
                    الأمامية
                  </p>
                  <div
                    ref={adaptiveFgRef}
                    style={{
                      borderRadius: 20,
                      overflow: "hidden",
                      boxShadow: "0 6px 24px #00000044",
                      display: "inline-block",
                      background: "#1a1a3a",
                    }}
                  >
                    <AdaptiveIconForegroundSvg size={160} />
                  </div>
                  <br />
                  <button
                    onClick={() =>
                      downloadSvg(
                        adaptiveFgRef.current,
                        "yomy-ramadan-adaptive-foreground.svg",
                      )
                    }
                    style={{
                      marginTop: 8,
                      background: C.navyMid,
                      color: C.goldLight,
                      border: `1px solid ${C.gold}40`,
                      borderRadius: 10,
                      padding: "8px 16px",
                      fontFamily: fontSans,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    تحميل SVG
                  </button>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
                    مُجمّع (دائرة)
                  </p>
                  <div
                    style={{
                      borderRadius: "50%",
                      overflow: "hidden",
                      boxShadow: "0 6px 24px #00000044",
                      display: "inline-block",
                      position: "relative",
                      width: 160,
                      height: 160,
                    }}
                  >
                    <div style={{ position: "absolute", inset: 0 }}>
                      <AdaptiveIconBackgroundSvg size={160} />
                    </div>
                    <div style={{ position: "absolute", inset: 0 }}>
                      <AdaptiveIconForegroundSvg size={160} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              textAlign: "center",
              marginTop: 32,
              padding: 16,
              borderTop: `1px solid ${C.muted}15`,
            }}
          >
            <p style={{ fontSize: 11, color: C.muted }}>
              صادر من تطبيق يومي في رمضان · استخدم SVG ثم حوّلها إلى PNG
              بالأحجام المطلوبة للـ Play Store
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
