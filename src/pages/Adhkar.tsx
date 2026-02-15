import { useState, useCallback, useRef } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { Card } from "../components/Card";
import { ShareButton } from "../components/ShareButton";
import { useTheme, useIsDark } from "../context/ThemeContext";
import { fontSans } from "../lib/theme";
import adhkarData from "../lib/adhkar.json";

type DhikrItem = {
  arabic: string;
  transliteration: string;
  meaning: string;
  source: string;
  repetition: number;
};

type AdhkarCategory = {
  id: string;
  label: string;
  icon: string;
  color: string;
  data: DhikrItem[];
};

type DhikrCount = {
  count: number;
  completed: boolean;
};

const ADHKAR_CATEGORIES: AdhkarCategory[] = [
  {
    id: "morning",
    label: "أذكار الصباح",
    icon: "☀️",
    color: "#FDB31",
    data: adhkarData.morning as DhikrItem[],
  },
  {
    id: "evening",
    label: "أذكار المساء",
    icon: "🌅",
    color: "#F87C13",
    data: adhkarData.evening as DhikrItem[],
  },
  {
    id: "afterPrayer",
    label: "أذكار بعد الصلاة",
    icon: "🤲",
    color: "#B8860B",
    data: adhkarData.afterPrayer as DhikrItem[],
  },
  {
    id: "beforeSleep",
    label: "أذكار النوم",
    icon: "🌙",
    color: "#7B68EE",
    data: adhkarData.beforeSleep as DhikrItem[],
  },
  {
    id: "uponWaking",
    label: "أذكار الاستيقاظ",
    icon: "🌄",
    color: "#FF6B6B",
    data: adhkarData.uponWaking as DhikrItem[],
  },
  {
    id: "enteringHome",
    label: "دخول المنزل",
    icon: "🏠",
    color: "#4ECDC4",
    data: adhkarData.enteringHome as DhikrItem[],
  },
  {
    id: "leavingHome",
    label: "الخروج من المنزل",
    icon: "🚪",
    color: "#95E1D3",
    data: adhkarData.leavingHome as DhikrItem[],
  },
  {
    id: "enteringMosque",
    label: "دخول المسجد",
    icon: "🕌",
    color: "#38A169",
    data: adhkarData.enteringMosque as DhikrItem[],
  },
  {
    id: "leavingMosque",
    label: "الخروج من المسجد",
    icon: "🕋",
    color: "#2F855A",
    data: adhkarData.leavingMosque as DhikrItem[],
  },
  {
    id: "beforeEating",
    label: "قبل الطعام",
    icon: "🍽️",
    color: "#F97316",
    data: adhkarData.beforeEating as DhikrItem[],
  },
  {
    id: "afterEating",
    label: "بعد الطعام",
    icon: "✨",
    color: "#EA580C",
    data: adhkarData.afterEating as DhikrItem[],
  },
  {
    id: "beforeWudu",
    label: "قبل الوضوء",
    icon: "💧",
    color: "#3B82F6",
    data: adhkarData.beforeWudu as DhikrItem[],
  },
  {
    id: "afterWudu",
    label: "بعد الوضوء",
    icon: "💦",
    color: "#2563EB",
    data: adhkarData.afterWudu as DhikrItem[],
  },
];

export function Adhkar() {
  const t = useTheme();
  const isDark = useIsDark();
  const [selectedCat, setSelectedCat] = useState<string>("morning");
  const [dhikrCounts, setDhikrCounts] = useState<Record<string, DhikrCount>>({});
  const [tappedKey, setTappedKey] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);
  const tapTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const activeCat = ADHKAR_CATEGORIES.find((c) => c.id === selectedCat) || ADHKAR_CATEGORIES[0]!;

  const handleTap = useCallback(
    (catId: string, idx: number, targetReps: number) => {
      const key = `${catId}-${idx}`;

      // Hide hint after first tap
      if (showHint) setShowHint(false);

      // Trigger tap animation
      setTappedKey(key);
      if (tapTimeouts.current[key]) clearTimeout(tapTimeouts.current[key]);
      tapTimeouts.current[key] = setTimeout(() => setTappedKey(null), 250);

      setDhikrCounts((prev) => {
        const current = prev[key] || { count: 0, completed: false };
        if (current.completed) return prev;
        const newCount = current.count + 1;
        const isCompleted = newCount >= targetReps;
        return {
          ...prev,
          [key]: { count: newCount, completed: isCompleted },
        };
      });
    },
    [showHint]
  );

  const resetDhikr = useCallback((catId: string, idx: number) => {
    const key = `${catId}-${idx}`;
    setDhikrCounts((prev) => ({
      ...prev,
      [key]: { count: 0, completed: false },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setDhikrCounts((prev) => {
      const next = { ...prev };
      activeCat.data.forEach((_, i) => {
        const key = `${selectedCat}-${i}`;
        next[key] = { count: 0, completed: false };
      });
      return next;
    });
  }, [activeCat.data, selectedCat]);

  const completedCount = activeCat.data.filter((_, i) => {
    const key = `${selectedCat}-${i}`;
    return dhikrCounts[key]?.completed;
  }).length;
  const totalCount = activeCat.data.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
          {/* Header */}
          <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
            <h2
              style={{
                fontFamily: "Amiri",
                fontSize: 22,
                color: t.goldLight,
                margin: "0 0 4px",
                fontWeight: 700,
              }}
            >
              الأذكار اليومية
            </h2>
            <p style={{ color: t.muted, fontSize: 12, margin: 0, letterSpacing: 0.3 }}>
              من أذكار الكتاب والسنة
            </p>
          </div>

          {/* Category Chips */}
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              padding: "8px 0 14px",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {ADHKAR_CATEGORIES.map((cat) => {
              const isActive = selectedCat === cat.id;
              const catCompleted = cat.data.filter((_, i) => {
                const key = `${cat.id}-${i}`;
                return dhikrCounts[key]?.completed;
              }).length;
              const allDone = catCompleted === cat.data.length && cat.data.length > 0;

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  style={{
                    minWidth: 80,
                    textAlign: "center",
                    padding: "10px 10px 8px",
                    borderRadius: 14,
                    background: isActive
                      ? isDark
                        ? `${cat.color}20`
                        : `${cat.color}15`
                      : isDark
                        ? `${t.card}`
                        : `${t.cardAlt}`,
                    border: `1.5px solid ${isActive ? cat.color + "55" : "transparent"}`,
                    cursor: "pointer",
                    transition: "all .25s ease",
                    flexShrink: 0,
                    position: "relative",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <span style={{ fontSize: 22, display: "block" }}>{cat.icon}</span>
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: isActive ? cat.color : t.muted,
                      margin: "4px 0 0",
                      lineHeight: 1.3,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat.label}
                  </p>
                  {allDone && (
                    <span
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        background: t.green,
                        color: "#fff",
                        fontSize: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        boxShadow: `0 2px 6px ${t.green}44`,
                        animation: "checkIn .3s ease",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Section */}
          <Card style={{ padding: "12px 16px", margin: "0 0 12px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{activeCat.icon}</span>
                <span
                  style={{
                    fontSize: 13,
                    color: activeCat.color,
                    fontWeight: 700,
                  }}
                >
                  {activeCat.label}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {completedCount > 0 && (
                  <button
                    onClick={resetAll}
                    style={{
                      background: `${t.red}15`,
                      border: `1px solid ${t.red}25`,
                      borderRadius: 8,
                      padding: "4px 10px",
                      color: t.red,
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: "pointer",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    إعادة ↺
                  </button>
                )}
                <span
                  style={{
                    fontSize: 12,
                    color: progress === 100 ? t.green : activeCat.color,
                    fontWeight: 800,
                    background:
                      progress === 100 ? `${t.green}15` : `${activeCat.color}12`,
                    padding: "3px 10px",
                    borderRadius: 10,
                  }}
                >
                  {completedCount}/{totalCount}
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div
              style={{
                width: "100%",
                height: 6,
                background: isDark ? `${activeCat.color}12` : `${activeCat.color}18`,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: progress === 100
                    ? `linear-gradient(90deg, ${t.green}, ${t.green}CC)`
                    : `linear-gradient(90deg, ${activeCat.color}, ${activeCat.color}CC)`,
                  borderRadius: 3,
                  transition: "width .5s ease, background .3s",
                }}
              />
            </div>
          </Card>

          {/* Tap hint — shown only initially */}
          {showHint && (
            <div
              style={{
                textAlign: "center",
                padding: "6px 0 2px",
                animation: "fadeIn .5s ease",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: t.muted,
                  background: isDark ? `${t.gold}08` : `${t.gold}12`,
                  padding: "4px 14px",
                  borderRadius: 10,
                  display: "inline-block",
                }}
              >
                اضغط على الذكر لتسبيحه
              </span>
            </div>
          )}

          {/* Adhkar List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            {activeCat.data.map((dhikr, idx) => {
              const key = `${selectedCat}-${idx}`;
              const dhikrState = dhikrCounts[key] || {
                count: 0,
                completed: false,
              };
              const currentCount = dhikrState.count;
              const isCompleted = dhikrState.completed;
              const isTapped = tappedKey === key;
              const pct = Math.min(
                100,
                Math.round((currentCount / dhikr.repetition) * 100)
              );
              const hasMultiple = dhikr.repetition > 1;

              return (
                <div
                  key={idx}
                  className="adhkar-card"
                  onClick={() => handleTap(selectedCat, idx, dhikr.repetition)}
                  style={{
                    background: isCompleted
                      ? isDark
                        ? `linear-gradient(135deg, ${t.green}0C, ${t.green}06)`
                        : `linear-gradient(135deg, ${t.green}12, ${t.green}08)`
                      : t.card,
                    borderRadius: 18,
                    padding: 0,
                    border: isCompleted
                      ? `1.5px solid ${t.green}30`
                      : `1px solid ${t.border}30`,
                    boxShadow: isTapped
                      ? `0 0 20px ${activeCat.color}25`
                      : `0 2px 8px ${t.shadowColor}`,
                    transition: "all .2s ease",
                    transform: isTapped ? "scale(0.98)" : "scale(1)",
                    cursor: isCompleted ? "default" : "pointer",
                    overflow: "hidden",
                    WebkitTapHighlightColor: "transparent",
                    userSelect: "none",
                    position: "relative",
                    animation: `fadeIn .4s ease ${idx * 0.04}s both`,
                  }}
                >
                  {/* Progress fill bar at top */}
                  {hasMultiple && !isCompleted && currentCount > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: `${pct}%`,
                        height: 3,
                        background: `linear-gradient(90deg, ${activeCat.color}88, ${activeCat.color})`,
                        borderRadius: "3px 0 0 0",
                        transition: "width .4s ease",
                      }}
                    />
                  )}
                  {isCompleted && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: 3,
                        background: t.green,
                        borderRadius: "3px 3px 0 0",
                      }}
                    />
                  )}

                  <div style={{ padding: "14px 16px 12px" }}>
                    {/* Top row: number badge + actions */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {/* Index badge */}
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 10,
                            background: isCompleted
                              ? t.green
                              : isDark
                                ? `${activeCat.color}18`
                                : `${activeCat.color}14`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: isCompleted ? 13 : 12,
                            fontWeight: 800,
                            color: isCompleted ? "#fff" : activeCat.color,
                            flexShrink: 0,
                            transition: "all .3s ease",
                          }}
                        >
                          {isCompleted ? "✓" : idx + 1}
                        </span>

                        {/* Repetition counter */}
                        {hasMultiple && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              background: isCompleted
                                ? `${t.green}15`
                                : `${activeCat.color}10`,
                              padding: "3px 10px",
                              borderRadius: 8,
                              transition: "all .3s",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: isCompleted ? t.green : activeCat.color,
                                fontFeatureSettings: "'tnum'",
                                minWidth: 20,
                                textAlign: "center",
                              }}
                            >
                              {currentCount}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                color: t.muted,
                                fontWeight: 600,
                              }}
                            >
                              / {dhikr.repetition}
                            </span>
                          </div>
                        )}

                        {/* Single rep check indicator */}
                        {!hasMultiple && isCompleted && (
                          <span
                            style={{
                              fontSize: 11,
                              color: t.green,
                              fontWeight: 700,
                              animation: "checkIn .3s ease",
                            }}
                          >
                            تم
                          </span>
                        )}
                      </div>

                      {/* Right actions */}
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <ShareButton
                            compact
                            content={{
                              title: activeCat.label,
                              text: dhikr.arabic,
                              source: dhikr.source,
                            }}
                          />
                        </div>
                        {currentCount > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              resetDhikr(selectedCat, idx);
                            }}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              border: `1px solid ${t.muted}25`,
                              background: isDark ? `${t.muted}10` : `${t.muted}08`,
                              color: t.muted,
                              fontSize: 13,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all .2s",
                              WebkitTapHighlightColor: "transparent",
                              padding: 0,
                            }}
                          >
                            ↺
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Arabic text — the main content */}
                    <div
                      style={{
                        background: isCompleted
                          ? isDark
                            ? `${t.green}06`
                            : `${t.green}08`
                          : isDark
                            ? `${activeCat.color}06`
                            : `${activeCat.color}08`,
                        borderRadius: 14,
                        padding: "14px 16px",
                        marginBottom: 8,
                        transition: "all .3s",
                        position: "relative",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "Amiri",
                          fontSize: 19,
                          color: isCompleted ? `${t.text}99` : t.text,
                          lineHeight: 2,
                          margin: 0,
                          textAlign: "center",
                          transition: "color .3s",
                        }}
                      >
                        {dhikr.arabic}
                      </p>
                    </div>

                    {/* Transliteration */}
                    {dhikr.transliteration && (
                      <p
                        style={{
                          fontSize: 11,
                          color: isCompleted ? `${t.textSec}80` : t.textSec,
                          margin: "0 0 6px",
                          lineHeight: 1.6,
                          fontStyle: "italic",
                          textAlign: "center",
                          padding: "0 4px",
                          transition: "color .3s",
                        }}
                      >
                        {dhikr.transliteration}
                      </p>
                    )}

                    {/* Footer: source + tap indicator */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: `1px solid ${isCompleted ? `${t.green}15` : `${t.border}18`}`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          color: t.muted,
                          background: isDark ? `${t.gold}08` : `${t.gold}12`,
                          padding: "3px 10px",
                          borderRadius: 8,
                        }}
                      >
                        {dhikr.source}
                      </span>

                      {/* Tap action hint */}
                      {!isCompleted && (
                        <span
                          style={{
                            fontSize: 10,
                            color: `${activeCat.color}88`,
                            fontWeight: 600,
                          }}
                        >
                          {hasMultiple
                            ? `اضغط للتسبيح`
                            : `اضغط للتحقق`}
                        </span>
                      )}
                    </div>

                    {/* Completion celebration */}
                    {isCompleted && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: "8px 12px",
                          background: isDark ? `${t.green}0C` : `${t.green}12`,
                          borderRadius: 12,
                          textAlign: "center",
                          animation: "fadeIn .4s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <span style={{ fontSize: 14 }}>&#x2714;</span>
                        <span
                          style={{
                            fontSize: 12,
                            color: t.green,
                            fontWeight: 700,
                          }}
                        >
                          بارك الله فيك
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* All Complete Message */}
          {progress === 100 && (
            <div
              style={{
                marginTop: 16,
                textAlign: "center",
                padding: "20px 16px",
                borderRadius: 20,
                background: isDark
                  ? `linear-gradient(135deg,${activeCat.color}10,${t.green}0A)`
                  : `linear-gradient(135deg,${activeCat.color}18,${t.green}12)`,
                border: `1.5px solid ${t.green}25`,
                animation: "fadeInScale .5s ease",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 4 }}>
                &#x1F389;
              </div>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: activeCat.color,
                  margin: "0 0 4px",
                  fontFamily: "Amiri",
                }}
              >
                أحسنت! أكملت {activeCat.label}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: t.green,
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                تقبل الله منك
              </p>
            </div>
          )}

          {/* Bottom spacer */}
          <div style={{ height: 20 }} />
        </div>
      </IonContent>
    </IonPage>
  );
}
