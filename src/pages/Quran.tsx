import { useState, useEffect, useRef, useCallback } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { Card } from "../components/Card";
import { useTheme, useIsDark } from "../context/ThemeContext";
import { fetchSurahText, isSurahCached, useOnlineStatus } from "../lib/api";
import type { QuranAyah } from "../lib/api";
import { fontSans } from "../lib/theme";
import type { AppState } from "../lib/state";
import type { Action } from "../lib/state";

/* ─── Static surah metadata (3 KB, enables offline browsing) ─── */
const SURAHS: { n: number; name: string; ayahs: number; type: "M" | "D" }[] = [
  { n: 1, name: "الفاتحة", ayahs: 7, type: "M" },
  { n: 2, name: "البقرة", ayahs: 286, type: "D" },
  { n: 3, name: "آل عمران", ayahs: 200, type: "D" },
  { n: 4, name: "النساء", ayahs: 176, type: "D" },
  { n: 5, name: "المائدة", ayahs: 120, type: "D" },
  { n: 6, name: "الأنعام", ayahs: 165, type: "M" },
  { n: 7, name: "الأعراف", ayahs: 206, type: "M" },
  { n: 8, name: "الأنفال", ayahs: 75, type: "D" },
  { n: 9, name: "التوبة", ayahs: 129, type: "D" },
  { n: 10, name: "يونس", ayahs: 109, type: "M" },
  { n: 11, name: "هود", ayahs: 123, type: "M" },
  { n: 12, name: "يوسف", ayahs: 111, type: "M" },
  { n: 13, name: "الرعد", ayahs: 43, type: "D" },
  { n: 14, name: "إبراهيم", ayahs: 52, type: "M" },
  { n: 15, name: "الحجر", ayahs: 99, type: "M" },
  { n: 16, name: "النحل", ayahs: 128, type: "M" },
  { n: 17, name: "الإسراء", ayahs: 111, type: "M" },
  { n: 18, name: "الكهف", ayahs: 110, type: "M" },
  { n: 19, name: "مريم", ayahs: 98, type: "M" },
  { n: 20, name: "طه", ayahs: 135, type: "M" },
  { n: 21, name: "الأنبياء", ayahs: 112, type: "M" },
  { n: 22, name: "الحج", ayahs: 78, type: "D" },
  { n: 23, name: "المؤمنون", ayahs: 118, type: "M" },
  { n: 24, name: "النور", ayahs: 64, type: "D" },
  { n: 25, name: "الفرقان", ayahs: 77, type: "M" },
  { n: 26, name: "الشعراء", ayahs: 227, type: "M" },
  { n: 27, name: "النمل", ayahs: 93, type: "M" },
  { n: 28, name: "القصص", ayahs: 88, type: "M" },
  { n: 29, name: "العنكبوت", ayahs: 69, type: "M" },
  { n: 30, name: "الروم", ayahs: 60, type: "M" },
  { n: 31, name: "لقمان", ayahs: 34, type: "M" },
  { n: 32, name: "السجدة", ayahs: 30, type: "M" },
  { n: 33, name: "الأحزاب", ayahs: 73, type: "D" },
  { n: 34, name: "سبأ", ayahs: 54, type: "M" },
  { n: 35, name: "فاطر", ayahs: 45, type: "M" },
  { n: 36, name: "يس", ayahs: 83, type: "M" },
  { n: 37, name: "الصافات", ayahs: 182, type: "M" },
  { n: 38, name: "ص", ayahs: 88, type: "M" },
  { n: 39, name: "الزمر", ayahs: 75, type: "M" },
  { n: 40, name: "غافر", ayahs: 85, type: "M" },
  { n: 41, name: "فصلت", ayahs: 54, type: "M" },
  { n: 42, name: "الشورى", ayahs: 53, type: "M" },
  { n: 43, name: "الزخرف", ayahs: 89, type: "M" },
  { n: 44, name: "الدخان", ayahs: 59, type: "M" },
  { n: 45, name: "الجاثية", ayahs: 37, type: "M" },
  { n: 46, name: "الأحقاف", ayahs: 35, type: "M" },
  { n: 47, name: "محمد", ayahs: 38, type: "D" },
  { n: 48, name: "الفتح", ayahs: 29, type: "D" },
  { n: 49, name: "الحجرات", ayahs: 18, type: "D" },
  { n: 50, name: "ق", ayahs: 45, type: "M" },
  { n: 51, name: "الذاريات", ayahs: 60, type: "M" },
  { n: 52, name: "الطور", ayahs: 49, type: "M" },
  { n: 53, name: "النجم", ayahs: 62, type: "M" },
  { n: 54, name: "القمر", ayahs: 55, type: "M" },
  { n: 55, name: "الرحمن", ayahs: 78, type: "D" },
  { n: 56, name: "الواقعة", ayahs: 96, type: "M" },
  { n: 57, name: "الحديد", ayahs: 29, type: "D" },
  { n: 58, name: "المجادلة", ayahs: 22, type: "D" },
  { n: 59, name: "الحشر", ayahs: 24, type: "D" },
  { n: 60, name: "الممتحنة", ayahs: 13, type: "D" },
  { n: 61, name: "الصف", ayahs: 14, type: "D" },
  { n: 62, name: "الجمعة", ayahs: 11, type: "D" },
  { n: 63, name: "المنافقون", ayahs: 11, type: "D" },
  { n: 64, name: "التغابن", ayahs: 18, type: "D" },
  { n: 65, name: "الطلاق", ayahs: 12, type: "D" },
  { n: 66, name: "التحريم", ayahs: 12, type: "D" },
  { n: 67, name: "الملك", ayahs: 30, type: "M" },
  { n: 68, name: "القلم", ayahs: 52, type: "M" },
  { n: 69, name: "الحاقة", ayahs: 52, type: "M" },
  { n: 70, name: "المعارج", ayahs: 44, type: "M" },
  { n: 71, name: "نوح", ayahs: 28, type: "M" },
  { n: 72, name: "الجن", ayahs: 28, type: "M" },
  { n: 73, name: "المزمل", ayahs: 20, type: "M" },
  { n: 74, name: "المدثر", ayahs: 56, type: "M" },
  { n: 75, name: "القيامة", ayahs: 40, type: "M" },
  { n: 76, name: "الإنسان", ayahs: 31, type: "D" },
  { n: 77, name: "المرسلات", ayahs: 50, type: "M" },
  { n: 78, name: "النبأ", ayahs: 40, type: "M" },
  { n: 79, name: "النازعات", ayahs: 46, type: "M" },
  { n: 80, name: "عبس", ayahs: 42, type: "M" },
  { n: 81, name: "التكوير", ayahs: 29, type: "M" },
  { n: 82, name: "الانفطار", ayahs: 19, type: "M" },
  { n: 83, name: "المطففين", ayahs: 36, type: "M" },
  { n: 84, name: "الانشقاق", ayahs: 25, type: "M" },
  { n: 85, name: "البروج", ayahs: 22, type: "M" },
  { n: 86, name: "الطارق", ayahs: 17, type: "M" },
  { n: 87, name: "الأعلى", ayahs: 19, type: "M" },
  { n: 88, name: "الغاشية", ayahs: 26, type: "M" },
  { n: 89, name: "الفجر", ayahs: 30, type: "M" },
  { n: 90, name: "البلد", ayahs: 20, type: "M" },
  { n: 91, name: "الشمس", ayahs: 15, type: "M" },
  { n: 92, name: "الليل", ayahs: 21, type: "M" },
  { n: 93, name: "الضحى", ayahs: 11, type: "M" },
  { n: 94, name: "الشرح", ayahs: 8, type: "M" },
  { n: 95, name: "التين", ayahs: 8, type: "M" },
  { n: 96, name: "العلق", ayahs: 19, type: "M" },
  { n: 97, name: "القدر", ayahs: 5, type: "M" },
  { n: 98, name: "البينة", ayahs: 8, type: "D" },
  { n: 99, name: "الزلزلة", ayahs: 8, type: "D" },
  { n: 100, name: "العاديات", ayahs: 11, type: "M" },
  { n: 101, name: "القارعة", ayahs: 11, type: "M" },
  { n: 102, name: "التكاثر", ayahs: 8, type: "M" },
  { n: 103, name: "العصر", ayahs: 3, type: "M" },
  { n: 104, name: "الهمزة", ayahs: 9, type: "M" },
  { n: 105, name: "الفيل", ayahs: 5, type: "M" },
  { n: 106, name: "قريش", ayahs: 4, type: "M" },
  { n: 107, name: "الماعون", ayahs: 7, type: "M" },
  { n: 108, name: "الكوثر", ayahs: 3, type: "M" },
  { n: 109, name: "الكافرون", ayahs: 6, type: "M" },
  { n: 110, name: "النصر", ayahs: 3, type: "D" },
  { n: 111, name: "المسد", ayahs: 5, type: "M" },
  { n: 112, name: "الإخلاص", ayahs: 4, type: "M" },
  { n: 113, name: "الفلق", ayahs: 5, type: "M" },
  { n: 114, name: "الناس", ayahs: 6, type: "M" },
];

/* ─── Arabic numeral converter ─── */
const AR_NUMS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicNum(n: number): string {
  return String(n)
    .split("")
    .map((d) => AR_NUMS[+d] ?? d)
    .join("");
}

/* ─── Bismillah constant ─── */
const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ";

type QuranProps = { state: AppState; dispatch: (a: Action) => void };

/* ─── Surah Reader Sub-component ─── */
function SurahReader({
  surahNum,
  onBack,
  state,
  dispatch,
}: {
  surahNum: number;
  onBack: () => void;
  state: AppState;
  dispatch: (a: Action) => void;
}) {
  const t = useTheme();
  const isDark = useIsDark();
  const online = useOnlineStatus();
  const [ayahs, setAyahs] = useState<QuranAyah[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const surah = SURAHS[surahNum - 1]!;

  const loadSurah = useCallback(() => {
    setLoading(true);
    setError(false);
    fetchSurahText(surahNum).then((data) => {
      if (data) {
        setAyahs(data);
        setError(false);
      } else {
        setError(true);
      }
      setLoading(false);
    });
  }, [surahNum]);

  useEffect(() => {
    loadSurah();
  }, [loadSurah]);

  // Save reading position
  useEffect(() => {
    if (ayahs && ayahs.length > 0) {
      dispatch({ type: "SET_QURAN_POSITION", surah: surahNum, ayah: 0 });
    }
  }, [ayahs, surahNum, dispatch]);

  // Scroll to last ayah if resuming same surah
  useEffect(() => {
    if (
      ayahs &&
      state.quranLastSurah === surahNum &&
      state.quranLastAyah > 0
    ) {
      const el = document.getElementById(`ayah-${state.quranLastAyah}`);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
      }
    }
  }, [ayahs, state.quranLastSurah, state.quranLastAyah, surahNum]);

  return (
    <div>
      {/* Sticky header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: t.bg,
          padding: "12px 0 8px",
          borderBottom: `1px solid ${t.border}30`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: t.cardAlt,
            border: `1px solid ${t.border}40`,
            borderRadius: 12,
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 18,
            color: t.text,
            flexShrink: 0,
          }}
        >
          →
        </button>
        <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
          <p
            style={{
              fontFamily: "Amiri",
              fontSize: 18,
              fontWeight: 700,
              color: t.gold,
              margin: 0,
            }}
          >
            سورة {surah.name}
          </p>
          <p style={{ fontSize: 10, color: t.muted, margin: "2px 0 0" }}>
            {toArabicNum(surah.ayahs)} آية • {surah.type === "M" ? "مكية" : "مدنية"}
          </p>
        </div>
        <div style={{ width: 38 }} />
      </div>

      {/* Loading state */}
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
          <p style={{ fontSize: 13, color: t.muted }}>جارٍ تحميل السورة...</p>
        </div>
      )}

      {/* Error / Offline state */}
      {!loading && error && (
        <Card
          style={{
            margin: "40px 0",
            textAlign: "center",
            padding: "30px 20px",
            background: isDark
              ? `linear-gradient(135deg, ${t.orange}08, ${t.red}06)`
              : `linear-gradient(135deg, ${t.orange}0C, ${t.red}08)`,
            border: `1px solid ${t.orange}25`,
          }}
        >
          <span style={{ fontSize: 48, display: "block", marginBottom: 12 }}>
            {online ? "⚠️" : "📡"}
          </span>
          <p
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: t.text,
              margin: "0 0 8px",
            }}
          >
            {online ? "حدث خطأ" : "لا يوجد اتصال بالإنترنت"}
          </p>
          <p
            style={{
              fontSize: 13,
              color: t.textSec,
              margin: "0 0 16px",
              lineHeight: 1.7,
            }}
          >
            {online
              ? "تعذر تحميل السورة. يرجى المحاولة مرة أخرى."
              : "يرجى الاتصال بالإنترنت لتحميل سورة " + surah.name + " لأول مرة. بعد ذلك ستكون متاحة بدون إنترنت."}
          </p>
          <button
            onClick={loadSurah}
            style={{
              background: `linear-gradient(135deg, ${t.gold}, ${t.gold}BB)`,
              color: isDark ? "#080E1F" : "#fff",
              border: "none",
              borderRadius: 14,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: fontSans,
              cursor: "pointer",
              boxShadow: `0 3px 16px ${t.gold}44`,
            }}
          >
            إعادة المحاولة
          </button>
        </Card>
      )}

      {/* Ayahs content */}
      {!loading && !error && ayahs && (
        <div ref={contentRef}>
          {/* Bismillah (except surah 9 - At-Tawbah) */}
          {surahNum !== 9 && (
            <div
              style={{
                textAlign: "center",
                padding: "20px 10px 16px",
                margin: "8px 0 12px",
              }}
            >
              <p
                style={{
                  fontFamily: "Amiri",
                  fontSize: 22,
                  color: t.gold,
                  margin: 0,
                  lineHeight: 2,
                }}
              >
                {BISMILLAH}
              </p>
              <div
                style={{
                  width: 120,
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${t.gold}40, transparent)`,
                  margin: "8px auto 0",
                }}
              />
            </div>
          )}

          {/* Verses */}
          <div style={{ padding: "0 4px" }}>
            {ayahs.map((ayah) => (
              <div
                key={ayah.numberInSurah}
                id={`ayah-${ayah.numberInSurah}`}
                onClick={() =>
                  dispatch({
                    type: "SET_QURAN_POSITION",
                    surah: surahNum,
                    ayah: ayah.numberInSurah,
                  })
                }
                style={{
                  padding: "12px 14px",
                  marginBottom: 4,
                  borderRadius: 14,
                  background:
                    state.quranLastSurah === surahNum &&
                    state.quranLastAyah === ayah.numberInSurah
                      ? isDark
                        ? `${t.gold}0C`
                        : `${t.gold}10`
                      : ayah.numberInSurah % 2 === 0
                        ? isDark
                          ? `${t.card}80`
                          : `${t.cardAlt}60`
                        : "transparent",
                  border:
                    state.quranLastSurah === surahNum &&
                    state.quranLastAyah === ayah.numberInSurah
                      ? `1px solid ${t.gold}25`
                      : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                <p
                  style={{
                    fontFamily: "Amiri",
                    fontSize: 20,
                    lineHeight: 2.2,
                    color: t.text,
                    margin: 0,
                    textAlign: "right",
                    direction: "rtl",
                    wordSpacing: 2,
                  }}
                >
                  {/* Remove bismillah from first ayah if surah > 1 (API includes it) */}
                  {surahNum !== 1 && ayah.numberInSurah === 1
                    ? ayah.text.replace(BISMILLAH, "").trim()
                    : ayah.text}
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 14,
                      color: t.gold,
                      fontWeight: 700,
                      margin: "0 6px",
                      opacity: 0.85,
                    }}
                  >
                    ﴿{toArabicNum(ayah.numberInSurah)}﴾
                  </span>
                </p>
              </div>
            ))}
          </div>

          {/* End of surah ornament */}
          <div style={{ textAlign: "center", padding: "20px 0 10px" }}>
            <div
              style={{
                width: 160,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${t.gold}40, transparent)`,
                margin: "0 auto 10px",
              }}
            />
            <span style={{ fontSize: 10, color: t.muted }}>
              صدق الله العظيم
            </span>
          </div>

          {/* Navigation buttons */}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              padding: "10px 0 20px",
            }}
          >
            {surahNum < 114 && (
              <button
                onClick={() => {
                  dispatch({
                    type: "SET_QURAN_POSITION",
                    surah: surahNum + 1,
                    ayah: 0,
                  });
                  onBack();
                  setTimeout(
                    () =>
                      document
                        .querySelector('[data-surah="' + (surahNum + 1) + '"]')
                        ?.scrollIntoView({ behavior: "smooth" }),
                    100
                  );
                }}
                style={{
                  background: t.cardAlt,
                  border: `1px solid ${t.border}40`,
                  borderRadius: 12,
                  padding: "10px 20px",
                  fontSize: 12,
                  fontFamily: fontSans,
                  fontWeight: 600,
                  color: t.text,
                  cursor: "pointer",
                }}
              >
                ← السورة التالية
              </button>
            )}
            {surahNum > 1 && (
              <button
                onClick={() => {
                  dispatch({
                    type: "SET_QURAN_POSITION",
                    surah: surahNum - 1,
                    ayah: 0,
                  });
                  onBack();
                }}
                style={{
                  background: t.cardAlt,
                  border: `1px solid ${t.border}40`,
                  borderRadius: 12,
                  padding: "10px 20px",
                  fontSize: 12,
                  fontFamily: fontSans,
                  fontWeight: 600,
                  color: t.text,
                  cursor: "pointer",
                }}
              >
                السورة السابقة →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Quran Page ─── */
export function Quran({ state, dispatch }: QuranProps) {
  const t = useTheme();
  const isDark = useIsDark();
  const online = useOnlineStatus();
  const [view, setView] = useState<"list" | "reader">("list");
  const [selectedSurah, setSelectedSurah] = useState<number>(
    state.quranLastSurah || 1
  );
  const [search, setSearch] = useState("");

  const openSurah = useCallback(
    (n: number) => {
      setSelectedSurah(n);
      setView("reader");
    },
    []
  );

  const filtered = search
    ? SURAHS.filter(
        (s) =>
          s.name.includes(search) ||
          String(s.n).includes(search) ||
          toArabicNum(s.n).includes(search)
      )
    : SURAHS;

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
          {view === "reader" ? (
            <SurahReader
              surahNum={selectedSurah}
              onBack={() => setView("list")}
              state={state}
              dispatch={dispatch}
            />
          ) : (
            <>
              {/* ─── Header ─── */}
              <div
                style={{
                  textAlign: "center",
                  padding: "10px 0 12px",
                }}
              >
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
                  رواية حفص عن عاصم
                </p>
              </div>

              {/* ─── Last Read Bookmark ─── */}
              {state.quranLastSurah > 0 && (
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
                    onClick={() => openSurah(state.quranLastSurah)}
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
                        آخر قراءة
                      </span>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: t.text,
                          margin: "2px 0 0",
                        }}
                      >
                        سورة{" "}
                        {SURAHS[state.quranLastSurah - 1]?.name ?? "الفاتحة"}
                        {state.quranLastAyah > 0 && (
                          <span
                            style={{
                              fontSize: 11,
                              color: t.muted,
                              fontWeight: 400,
                              marginRight: 6,
                            }}
                          >
                            — آية {toArabicNum(state.quranLastAyah)}
                          </span>
                        )}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: t.gold,
                        fontWeight: 700,
                      }}
                    >
                      أكمل ←
                    </span>
                  </div>
                </Card>
              )}

              {/* ─── Search ─── */}
              <div
                style={{
                  position: "relative",
                  marginBottom: 12,
                }}
              >
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن سورة..."
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 40px",
                    borderRadius: 14,
                    border: `1px solid ${t.border}40`,
                    background: t.inputBg,
                    color: t.text,
                    fontSize: 14,
                    fontFamily: fontSans,
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color .2s",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = t.gold + "60")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = t.border + "40")
                  }
                />
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16,
                    color: t.muted,
                    pointerEvents: "none",
                  }}
                >
                  🔍
                </span>
              </div>

              {/* ─── Online status indicator ─── */}
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
                    وضع عدم الاتصال — السور المحفوظة فقط متاحة
                  </span>
                </div>
              )}

              {/* ─── Surah List ─── */}
              <div>
                {filtered.map((s) => {
                  const cached = isSurahCached(s.n);
                  const isLastRead = state.quranLastSurah === s.n;
                  return (
                    <div
                      key={s.n}
                      data-surah={s.n}
                      onClick={() => openSurah(s.n)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        marginBottom: 4,
                        borderRadius: 14,
                        background: isLastRead
                          ? isDark
                            ? `${t.gold}0A`
                            : `${t.gold}0D`
                          : "transparent",
                        border: isLastRead
                          ? `1px solid ${t.gold}20`
                          : `1px solid transparent`,
                        cursor: "pointer",
                        transition: "all .2s",
                      }}
                    >
                      {/* Surah number badge */}
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: isDark
                            ? `${t.gold}12`
                            : `${t.gold}10`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: t.gold,
                          }}
                        >
                          {toArabicNum(s.n)}
                        </span>
                      </div>

                      {/* Surah info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: "Amiri",
                            fontSize: 16,
                            fontWeight: 700,
                            color: t.text,
                            margin: 0,
                          }}
                        >
                          {s.name}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 2,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              color: t.muted,
                            }}
                          >
                            {toArabicNum(s.ayahs)} آية
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              color:
                                s.type === "M" ? t.green : t.accent,
                              background:
                                s.type === "M"
                                  ? `${t.green}12`
                                  : `${t.accent}12`,
                              padding: "1px 8px",
                              borderRadius: 6,
                              fontWeight: 600,
                            }}
                          >
                            {s.type === "M" ? "مكية" : "مدنية"}
                          </span>
                          {cached && !online && (
                            <span
                              style={{
                                fontSize: 9,
                                color: t.green,
                                fontWeight: 600,
                              }}
                            >
                              ✓ محفوظة
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Last read indicator */}
                      {isLastRead && (
                        <span
                          style={{
                            fontSize: 9,
                            color: t.gold,
                            fontWeight: 700,
                            background: `${t.gold}15`,
                            padding: "3px 8px",
                            borderRadius: 8,
                          }}
                        >
                          🔖
                        </span>
                      )}

                      {/* Arrow */}
                      <span
                        style={{
                          fontSize: 14,
                          color: t.muted,
                          opacity: 0.5,
                        }}
                      >
                        ←
                      </span>
                    </div>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                  }}
                >
                  <span style={{ fontSize: 36 }}>🔍</span>
                  <p style={{ fontSize: 13, color: t.muted, margin: "8px 0 0" }}>
                    لا توجد نتائج
                  </p>
                </div>
              )}

              {/* Bottom spacer */}
              <div style={{ height: 20 }} />
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
