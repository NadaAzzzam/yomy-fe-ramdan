import { useState, useEffect, useCallback } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { Card } from "../components/Card";
import { useTheme, useIsDark } from "../context/ThemeContext";
import {
  fetchQuranPage,
  useOnlineStatus,
  QURAN_TOTAL_PAGES,
} from "../lib/api";
import type { QuranPageData, QuranPageAyah } from "../lib/api";
import { fontSans } from "../lib/theme";
import type { AppState } from "../lib/state";
import type { Action } from "../lib/state";

/* ─── Arabic numeral converter ─── */
const AR_NUMS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicNum(n: number): string {
  return String(n)
    .split("")
    .map((d) => AR_NUMS[+d] ?? d)
    .join("");
}

const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";

type QuranProps = { state: AppState; dispatch: (a: Action) => void };

/* ─── One page of the Mus'haf (like a physical Quran page) ─── */
function PageReader({
  pageNum,
  onPageChange,
  state,
  dispatch,
}: {
  pageNum: number;
  onPageChange: (p: number) => void;
  state: AppState;
  dispatch: (a: Action) => void;
}) {
  const t = useTheme();
  const isDark = useIsDark();
  const online = useOnlineStatus();
  const [pageData, setPageData] = useState<QuranPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [jumpInput, setJumpInput] = useState("");

  const loadPage = useCallback(() => {
    setLoading(true);
    setError(false);
    fetchQuranPage(pageNum).then((data) => {
      if (data) {
        setPageData(data);
        setError(false);
        dispatch({ type: "SET_QURAN_PAGE", page: pageNum });
        dispatch({ type: "ADD_QURAN_PAGE_VIEWED", page: pageNum });
      } else {
        setPageData(null);
        setError(true);
      }
      setLoading(false);
    });
  }, [pageNum, dispatch]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const goPrev = () => {
    if (pageNum > 1) onPageChange(pageNum - 1);
  };
  const goNext = () => {
    if (pageNum < QURAN_TOTAL_PAGES) onPageChange(pageNum + 1);
  };
  const goToPage = () => {
    const n = parseInt(jumpInput, 10);
    if (n >= 1 && n <= QURAN_TOTAL_PAGES) {
      onPageChange(n);
      setJumpInput("");
    }
  };

  const isLastSavedPage = state.quranLastPage === pageNum;

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Page content */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: `3px solid ${t.gold}30`,
              borderTopColor: t.gold,
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ fontSize: 13, color: t.muted }}>جارٍ تحميل الصفحة...</p>
        </div>
      )}

      {!loading && error && (
        <Card
          style={{
            margin: "24px 0",
            textAlign: "center",
            padding: "24px 16px",
            background: isDark ? `${t.orange}08` : `${t.orange}0C`,
            border: `1px solid ${t.orange}25`,
          }}
        >
          <span style={{ fontSize: 40 }}>{online ? "⚠️" : "📡"}</span>
          <p style={{ fontSize: 14, color: t.text, margin: "8px 0 4px" }}>
            {online ? "تعذّر تحميل الصفحة" : "لا يوجد اتصال"}
          </p>
          <p style={{ fontSize: 12, color: t.textSec, margin: "0 0 12px" }}>
            {online ? "جرّب مرة أخرى" : "الصفحات المحفوظة فقط متاحة دون اتصال"}
          </p>
          <button
            onClick={loadPage}
            style={{
              background: t.gold,
              color: isDark ? "#080E1F" : "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 24px",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: fontSans,
              cursor: "pointer",
            }}
          >
            إعادة المحاولة
          </button>
        </Card>
      )}

      {!loading && !error && pageData && (
        <>
          {/* Mushaf-style page */}
          <div
            style={{
              background: isDark ? t.card : t.cardAlt,
              borderRadius: 16,
              padding: "20px 16px",
              marginBottom: 16,
              border: `1px solid ${t.border}30`,
              minHeight: 320,
            }}
          >
            {pageData.ayahs.map((ayah: QuranPageAyah, idx: number) => (
              <p
                key={idx}
                style={{
                  fontFamily: "Amiri",
                  fontSize: 20,
                  lineHeight: 2.2,
                  color: t.text,
                  margin: "0 0 6px",
                  textAlign: "right",
                  direction: "rtl",
                  wordSpacing: 2,
                }}
              >
                {ayah.text.trim()}
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 14,
                    color: t.gold,
                    fontWeight: 700,
                    margin: "0 4px",
                    opacity: 0.9,
                  }}
                >
                  ﴿{toArabicNum(ayah.numberInSurah)}﴾
                </span>
              </p>
            ))}
          </div>

          {/* Page navigation */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <button
              onClick={goPrev}
              disabled={pageNum <= 1}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                border: `1px solid ${t.border}50`,
                background: pageNum <= 1 ? t.muted + "15" : t.cardAlt,
                color: pageNum <= 1 ? t.muted : t.text,
                fontSize: 18,
                cursor: pageNum <= 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: fontSans,
              }}
            >
              ←
            </button>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: t.gold,
                minWidth: 100,
                textAlign: "center",
              }}
            >
              صفحة {toArabicNum(pageNum)} من {toArabicNum(QURAN_TOTAL_PAGES)}
            </span>
            <button
              onClick={goNext}
              disabled={pageNum >= QURAN_TOTAL_PAGES}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                border: `1px solid ${t.border}50`,
                background:
                  pageNum >= QURAN_TOTAL_PAGES ? t.muted + "15" : t.cardAlt,
                color: pageNum >= QURAN_TOTAL_PAGES ? t.muted : t.text,
                fontSize: 18,
                cursor: pageNum >= QURAN_TOTAL_PAGES ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: fontSans,
              }}
            >
              →
            </button>
          </div>

          {/* Jump to page */}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              type="number"
              min={1}
              max={QURAN_TOTAL_PAGES}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              placeholder="رقم الصفحة"
              style={{
                width: 90,
                padding: "8px 12px",
                borderRadius: 10,
                border: `1px solid ${t.border}50`,
                background: t.inputBg,
                color: t.text,
                fontSize: 14,
                fontFamily: fontSans,
                outline: "none",
                textAlign: "center",
              }}
            />
            <button
              onClick={goToPage}
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                border: "none",
                background: `${t.gold}25`,
                color: t.gold,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: fontSans,
                cursor: "pointer",
              }}
            >
              انتقل إلى صفحة
            </button>
          </div>

          {/* Return to last saved page hint */}
          {!isLastSavedPage && state.quranLastPage !== pageNum && (
            <button
              onClick={() => onPageChange(state.quranLastPage)}
              style={{
                marginTop: 12,
                width: "100%",
                padding: "10px",
                borderRadius: 12,
                border: `1px solid ${t.gold}30`,
                background: `${t.gold}10`,
                color: t.gold,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: fontSans,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              🔖 العودة لآخر صفحة ({toArabicNum(state.quranLastPage)})
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Main Quran Page (opens at last viewed page) ─── */
export function Quran({ state, dispatch }: QuranProps) {
  const t = useTheme();
  const isDark = useIsDark();
  const online = useOnlineStatus();
  const [currentPage, setCurrentPage] = useState(() =>
    state.quranLastPage >= 1 && state.quranLastPage <= QURAN_TOTAL_PAGES
      ? state.quranLastPage
      : 1
  );

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
          {/* Header */}
          <div style={{ textAlign: "center", padding: "10px 0 12px" }}>
            <span style={{ fontSize: 36 }}>📖</span>
            <h2
              style={{
                fontFamily: "Amiri",
                fontSize: 22,
                color: t.gold,
                margin: "4px 0 2px",
              }}
            >
              القرآن الكريم
            </h2>
            <p style={{ fontSize: 11, color: t.muted, margin: 0 }}>
              مصحف برواية حفص — صفحة كصفحة المصحف
            </p>
          </div>

          {/* Last page bookmark — quick return */}
          {state.quranLastPage > 0 && (
            <Card
              style={{
                margin: "0 0 12px",
                padding: "12px 16px",
                background: isDark
                  ? `linear-gradient(135deg, ${t.gold}0A, ${t.accent}06)`
                  : `linear-gradient(135deg, ${t.gold}0E, ${t.accent}08)`,
                border: `1px solid ${t.gold}20`,
                cursor: "pointer",
              }}
            >
              <div
                onClick={() => setCurrentPage(state.quranLastPage)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `${t.gold}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  🔖
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: 10,
                      color: t.gold,
                      fontWeight: 700,
                    }}
                  >
                    آخر صفحة مفتوحة
                  </span>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: t.text,
                      margin: "2px 0 0",
                    }}
                  >
                    صفحة {toArabicNum(state.quranLastPage)} من{" "}
                    {toArabicNum(QURAN_TOTAL_PAGES)}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: t.gold,
                    fontWeight: 700,
                  }}
                >
                  افتح ←
                </span>
              </div>
            </Card>
          )}

          {!online && (
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 12,
                background: `${t.orange}10`,
                border: `1px solid ${t.orange}20`,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 14 }}>📡</span>
              <span style={{ fontSize: 11, color: t.orange, fontWeight: 600 }}>
                وضع عدم الاتصال — الصفحات المحفوظة فقط
              </span>
            </div>
          )}

          <PageReader
            pageNum={currentPage}
            onPageChange={setCurrentPage}
            state={state}
            dispatch={dispatch}
          />

          <div style={{ height: 20 }} />
        </div>
      </IonContent>
    </IonPage>
  );
}
