import { useState, useEffect, useMemo } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { Card } from '../components/Card';
import { Sec } from '../components/Sec';
import { Chk } from '../components/Chk';
import { useTheme, useIsDark } from '../context/ThemeContext';
import { fontSans } from '../lib/theme';
import {
  NAWAFEL,
  SALAWAT,
  TWELVE_RAKAHS_HADITH,
  AZAN_SOUNDS,
  PRAYER_METHODS,
} from '../lib/data';
import type { NafilItem } from '../lib/data';
import {
  usePrayerTimes,
  getNextPrayer,
  formatTime12h,
  playAzan,
  stopAzan,
  isAzanCached,
  downloadAzanForOffline,
} from '../lib/api';
import { getAzanStatus, isAndroidAzan, openAzanSettings } from '../lib/azan';
import type { AppState, Action } from '../lib/state';

type SalahProps = { state: AppState; dispatch: (a: Action) => void };

/* ─── Prayer time display row ─── */
function PrayerTimeRow({
  label,
  icon,
  time,
  isNext,
  color,
}: {
  label: string;
  icon: string;
  time: string;
  isNext: boolean;
  color: string;
}) {
  const t = useTheme();
  const isDark = useIsDark();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 14,
        marginBottom: 4,
        background: isNext
          ? isDark
            ? `${color}15`
            : `${color}12`
          : 'transparent',
        border: isNext ? `1.5px solid ${color}30` : '1.5px solid transparent',
        transition: 'all .3s',
      }}
    >
      <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{icon}</span>
      <span
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: isNext ? 800 : 600,
          color: isNext ? color : t.text,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 15,
          fontWeight: 700,
          fontFamily: 'monospace',
          color: isNext ? color : t.textSec,
          letterSpacing: 0.5,
          direction: 'ltr',
        }}
      >
        {time}
      </span>
      {isNext && (
        <span
          style={{
            fontSize: 8,
            background: `${color}20`,
            color,
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: 8,
          }}
        >
          التالي
        </span>
      )}
    </div>
  );
}

/* ─── Nafila checklist item with expandable hadith ─── */
function NafilaRow({
  item,
  done,
  onToggle,
}: {
  item: NafilItem;
  done: boolean;
  onToggle: () => void;
}) {
  const t = useTheme();
  const isDark = useIsDark();
  const [showHadith, setShowHadith] = useState(false);

  const importanceColor =
    item.importance === 'muakkadah' ? t.green : t.orange;

  return (
    <div style={{ marginBottom: 6 }}>
      <div
        onClick={onToggle}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
        role="button"
        tabIndex={0}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '11px 12px',
          borderRadius: 14,
          background: done
            ? `${t.green}0C`
            : isDark
              ? `${t.card}`
              : t.cardAlt,
          border: `1px solid ${done ? t.green + '25' : 'transparent'}`,
          cursor: 'pointer',
          transition: 'all .25s',
        }}
      >
        <Chk done={done} onClick={(e) => { e?.stopPropagation?.(); onToggle(); }} size={24} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: done ? t.green : t.text,
                textDecoration: done ? 'line-through' : 'none',
                transition: 'color .25s',
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: importanceColor,
                background: `${importanceColor}15`,
                padding: '1px 7px',
                borderRadius: 6,
              }}
            >
              {item.importanceLabel}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowHadith((prev) => !prev);
          }}
          style={{
            background: `${t.gold}12`,
            border: 'none',
            borderRadius: 8,
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: 10,
            color: t.gold,
            fontWeight: 700,
            fontFamily: fontSans,
            transition: 'all .2s',
            flexShrink: 0,
          }}
        >
          {showHadith ? 'إخفاء' : '📜 الحديث'}
        </button>
      </div>

      {/* Expandable hadith */}
      {showHadith && (
        <div
          style={{
            margin: '4px 0 0 36px',
            padding: '10px 14px',
            borderRadius: 12,
            background: isDark
              ? `linear-gradient(135deg, ${t.gold}08, ${t.gold}04)`
              : `linear-gradient(135deg, ${t.gold}0C, ${t.gold}06)`,
            border: `1px solid ${t.gold}18`,
            animation: 'fadeIn .3s',
          }}
        >
          <p
            style={{
              fontFamily: 'Amiri',
              fontSize: 13,
              color: t.text,
              lineHeight: 2,
              margin: '0 0 4px',
            }}
          >
            "{item.hadith}"
          </p>
          <p style={{ fontSize: 10, color: t.gold, margin: 0, fontWeight: 600 }}>
            — {item.source}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Azan sound picker item ─── */
function AzanSoundItem({
  sound,
  selected,
  onSelect,
}: {
  sound: typeof AZAN_SOUNDS[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useTheme();
  const isDark = useIsDark();
  const [playing, setPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    isAzanCached(sound.url).then(setCached);
  }, [sound.url]);

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setErrorMsg(null);
    if (playing) {
      stopAzan();
      setPlaying(false);
    } else {
      setAudioLoading(true);
      playAzan(sound.url).then((audio) => {
        setAudioLoading(false);
        if (audio) {
          setPlaying(true);
          audio.addEventListener('ended', () => setPlaying(false));
          audio.addEventListener('pause', () => setPlaying(false));
          audio.addEventListener('error', () => {
            setPlaying(false);
            setErrorMsg('انقطع الصوت — حاول مرة أخرى');
          });
          isAzanCached(sound.url).then(setCached);
        } else {
          setPlaying(false);
          setErrorMsg('لا يمكن تشغيل الصوت');
          setTimeout(() => setErrorMsg(null), 3000);
        }
      });
    }
  };

  const handleDownloadOffline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cached || downloading) return;
    setDownloading(true);
    setErrorMsg(null);
    const ok = await downloadAzanForOffline(sound.url);
    setDownloading(false);
    if (ok) setCached(true);
    else {
      setErrorMsg('فشل التحميل');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 13px',
        borderRadius: 14,
        marginBottom: errorMsg ? 22 : 5,
        background: selected
          ? isDark
            ? `${t.accent}12`
            : `${t.accent}0C`
          : isDark
            ? t.card
            : t.cardAlt,
        border: selected
          ? `1.5px solid ${t.accent}35`
          : '1.5px solid transparent',
        cursor: 'pointer',
        transition: 'all .25s',
      }}
    >
      {/* Radio indicator */}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: `2.5px solid ${selected ? t.accent : t.muted + '55'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all .25s',
        }}
      >
        {selected && (
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: t.accent,
            }}
          />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: 0 }}>
          {sound.label}
        </p>
        <p style={{ fontSize: 10, color: t.muted, margin: '2px 0 0' }}>
          {sound.reciter}
          {cached && (
            <span style={{ color: t.green ?? t.accent, marginRight: 4 }}> • متاح دون اتصال</span>
          )}
        </p>
      </div>

      {/* Download for offline */}
      {!cached && (
        <button
          onClick={handleDownloadOffline}
          disabled={downloading}
          title="تحميل للاستخدام دون اتصال"
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            border: 'none',
            background: downloading ? t.muted + '20' : `${t.gold ?? t.accent}18`,
            cursor: downloading ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {downloading ? '⏳' : '📥'}
        </button>
      )}

      {/* Preview / play button */}
      <button
        onClick={handlePreview}
        disabled={audioLoading}
        aria-label={playing ? 'إيقاف الأذان' : 'معاينة الأذان'}
        aria-busy={audioLoading}
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          border: 'none',
          background: playing ? `${t.red}18` : `${t.accent}15`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          transition: 'all .2s',
          flexShrink: 0,
        }}
      >
        {audioLoading ? '⏳' : playing ? '⏹️' : '▶️'}
      </button>
      {errorMsg && (
        <p
          style={{
            position: 'absolute',
            bottom: -18,
            right: 0,
            left: 0,
            margin: 0,
            fontSize: 10,
            color: t.red,
            fontWeight: 600,
            textAlign: 'center',
            animation: 'fadeIn .2s',
          }}
        >
          {errorMsg}
        </p>
      )}
    </div>
  );
}

/* ─── Main Salah Page ─── */
export function Salah({ state, dispatch }: SalahProps) {
  const t = useTheme();
  const isDark = useIsDark();
  const hasCoords =
    state.prayerLatitude != null &&
    state.prayerLongitude != null &&
    Number.isFinite(state.prayerLatitude) &&
    Number.isFinite(state.prayerLongitude);

  const { times, loading, error } = usePrayerTimes(
    state.prayerCity,
    state.prayerCountry,
    state.prayerMethod,
    state.prayerLatitude,
    state.prayerLongitude,
  );

  const [now, setNow] = useState(new Date());
  const [azanStatus, setAzanStatus] = useState(getAzanStatus);
  useEffect(() => {
    const update = () => setAzanStatus(getAzanStatus());
    window.addEventListener('azan-status', update);
    update();
    return () => window.removeEventListener('azan-status', update);
  }, []);
  const [showLocationEdit, setShowLocationEdit] = useState(false);
  const [cityInput, setCityInput] = useState(state.prayerCity);
  const [countryInput, setCountryInput] = useState(state.prayerCountry);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Update countdown every 30 seconds
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(iv);
  }, []);

  const nextPrayer = useMemo(
    () => (times ? getNextPrayer(times) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [times, now],
  );

  // Group nawafel by prayer
  const nawafelByPrayer = useMemo(() => {
    const grouped: Record<string, NafilItem[]> = {};
    for (const n of NAWAFEL) {
      if (!grouped[n.prayerKey]) grouped[n.prayerKey] = [];
      grouped[n.prayerKey].push(n);
    }
    return grouped;
  }, []);

  // Count done nawafel for progress
  const totalNawafel = NAWAFEL.length;
  const doneNawafel = NAWAFEL.filter((n) => state.nawafelChecks[n.id]).length;
  const nawafelPct = totalNawafel > 0 ? Math.round((doneNawafel / totalNawafel) * 100) : 0;

  // Count the 12 muakkadah rak'ahs done
  const muakkadahItems = NAWAFEL.filter((n) => n.importance === 'muakkadah' && n.id !== 'witr');
  const muakkadahDone = muakkadahItems.filter((n) => state.nawafelChecks[n.id]).length;
  const muakkadahRakaat = muakkadahItems
    .filter((n) => state.nawafelChecks[n.id])
    .reduce((sum, n) => sum + n.rakaat, 0);
  const totalMuakkadahRakaat = muakkadahItems.reduce((sum, n) => sum + n.rakaat, 0);

  const formatCountdown = (minutesLeft: number) => {
    const h = Math.floor(minutesLeft / 60);
    const m = minutesLeft % 60;
    if (h > 0) return `${h} ساعة ${m > 0 ? `و ${m} دقيقة` : ''}`;
    return `${m} دقيقة`;
  };

  const handleSaveLocation = () => {
    if (cityInput.trim() && countryInput.trim()) {
      dispatch({ type: 'SET_PRAYER_LOCATION', city: cityInput.trim(), country: countryInput.trim() });
      setShowLocationEdit(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم الموقع');
      setTimeout(() => setLocationError(null), 3000);
      return;
    }
    setLocationError(null);
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationLoading(false);
        dispatch({
          type: 'SET_PRAYER_COORDS',
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        });
        setShowLocationEdit(false);
      },
      () => {
        setLocationLoading(false);
        setLocationError('لم نتمكن من الحصول على الموقع');
        setTimeout(() => setLocationError(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
    );
  };

  const handleClearLocation = () => {
    dispatch({ type: 'SET_PRAYER_COORDS', coords: null });
  };

  const prayerTimesData = times
    ? [
        { key: 'Fajr', label: 'الفجر', icon: '🌅', time: formatTime12h(times.Fajr), color: t.orange },
        { key: 'Sunrise', label: 'الشروق', icon: '☀️', time: formatTime12h(times.Sunrise), color: t.goldLight },
        { key: 'Dhuhr', label: 'الظهر', icon: '🔆', time: formatTime12h(times.Dhuhr), color: t.gold },
        { key: 'Asr', label: 'العصر', icon: '🌤️', time: formatTime12h(times.Asr), color: t.accent },
        { key: 'Maghrib', label: 'المغرب', icon: '🌅', time: formatTime12h(times.Maghrib), color: t.orange },
        { key: 'Isha', label: 'العشاء', icon: '🌙', time: formatTime12h(times.Isha), color: t.purple },
      ]
    : [];

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="ion-padding"
        style={{
          fontFamily: fontSans,
          '--background': t.bg,
          '--ion-background-color': t.bg,
          color: t.text,
        } as React.CSSProperties}
      >
        <div className="ion-content-inner" style={{ position: 'relative' }}>
          {/* ─── Header ─── */}
          <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
            <span style={{ fontSize: 36 }}>🕌</span>
            <h2
              style={{
                fontFamily: 'Amiri',
                fontSize: 22,
                color: t.goldLight,
                margin: '4px 0 2px',
              }}
            >
              صلاتي
            </h2>
            <p style={{ fontSize: 11, color: t.muted, margin: 0 }}>
              مواقيت الصلاة والنوافل اليومية
            </p>
          </div>

          {/* ─── Prayer Times Card ─── */}
          <Card glow style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Sec icon="🕐" text="مواقيت الصلاة" />
              <button
                onClick={() => setShowLocationEdit((p) => !p)}
                style={{
                  background: `${t.muted}12`,
                  border: 'none',
                  borderRadius: 10,
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: 10,
                  color: t.muted,
                  fontWeight: 600,
                  fontFamily: fontSans,
                }}
              >
                {hasCoords ? '📍 موقعك الحالي' : `📍 ${state.prayerCity}`}
              </button>
            </div>

            {/* Location editor */}
            {showLocationEdit && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: 14,
                  background: isDark ? `${t.accent}08` : `${t.accent}06`,
                  border: `1px solid ${t.accent}18`,
                  marginBottom: 10,
                  animation: 'fadeIn .3s',
                }}
              >
                {hasCoords ? (
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 11, color: t.muted, margin: '0 0 8px' }}>
                      المواقيت حسب موقعك الحالي
                    </p>
                    <button
                      onClick={handleClearLocation}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: `1px solid ${t.muted}40`,
                        background: 'transparent',
                        color: t.textSec,
                        fontSize: 11,
                        cursor: 'pointer',
                        fontFamily: fontSans,
                      }}
                    >
                      استخدام مدينة بدلاً
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={locationLoading}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 10,
                    border: 'none',
                    background: locationLoading ? `${t.muted}25` : `linear-gradient(135deg, ${t.green}, ${t.accent})`,
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: fontSans,
                    cursor: locationLoading ? 'wait' : 'pointer',
                    marginBottom: 10,
                  }}
                >
                  {locationLoading ? '⏳ جاري تحديد الموقع...' : '📍 استخدام موقعي الحالي'}
                </button>
                {locationError && (
                  <p style={{ fontSize: 10, color: t.red, margin: '0 0 8px', textAlign: 'center' }}>
                    {locationError}
                  </p>
                )}
                <span style={{ fontSize: 10, color: t.muted, display: 'block', marginBottom: 6 }}>
                  أو اختر المدينة يدوياً:
                </span>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="المدينة"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: `1px solid ${t.border}50`,
                      background: t.inputBg,
                      color: t.text,
                      fontSize: 12,
                      fontFamily: fontSans,
                      outline: 'none',
                    }}
                  />
                  <input
                    type="text"
                    value={countryInput}
                    onChange={(e) => setCountryInput(e.target.value)}
                    placeholder="الدولة"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: `1px solid ${t.border}50`,
                      background: t.inputBg,
                      color: t.text,
                      fontSize: 12,
                      fontFamily: fontSans,
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: t.muted, fontWeight: 600 }}>طريقة الحساب:</span>
                  <select
                    value={state.prayerMethod}
                    onChange={(e) => dispatch({ type: 'SET_PRAYER_METHOD', method: Number(e.target.value) })}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      borderRadius: 8,
                      border: `1px solid ${t.border}50`,
                      background: t.inputBg,
                      color: t.text,
                      fontSize: 11,
                      fontFamily: fontSans,
                      outline: 'none',
                    }}
                  >
                    {PRAYER_METHODS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label} ({m.region})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSaveLocation}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 10,
                    border: 'none',
                    background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`,
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: fontSans,
                    cursor: 'pointer',
                  }}
                >
                  حفظ الموقع
                </button>
              </div>
            )}

            {/* Loading / Error states */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span style={{ fontSize: 11, color: t.muted }}>جاري تحميل المواقيت...</span>
              </div>
            )}
            {error && !loading && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '16px',
                  borderRadius: 12,
                  background: `${t.red}0C`,
                  border: `1px solid ${t.red}20`,
                }}
              >
                <span style={{ fontSize: 12, color: t.red }}>
                  تعذّر تحميل المواقيت — تأكد من اسم المدينة والإنترنت
                </span>
              </div>
            )}

            {/* Prayer times list */}
            {times && (
              <>
                {prayerTimesData.map((p) => (
                  <PrayerTimeRow
                    key={p.key}
                    label={p.label}
                    icon={p.icon}
                    time={p.time}
                    isNext={nextPrayer?.key === p.key}
                    color={p.color}
                  />
                ))}

                {/* Next prayer countdown */}
                {nextPrayer && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: '12px 14px',
                      borderRadius: 14,
                      background: isDark
                        ? `linear-gradient(135deg, ${t.gold}10, ${t.accent}08)`
                        : `linear-gradient(135deg, ${t.gold}14, ${t.accent}0A)`,
                      border: `1px solid ${t.gold}20`,
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: 10, color: t.gold, fontWeight: 700 }}>
                      ⏳ الصلاة القادمة
                    </span>
                    <p style={{ fontSize: 15, fontWeight: 800, color: t.text, margin: '4px 0 2px' }}>
                      {nextPrayer.label} — {formatTime12h(nextPrayer.time)}
                    </p>
                    <p style={{ fontSize: 11, color: t.muted, margin: 0 }}>
                      بعد {formatCountdown(nextPrayer.minutesLeft)}
                    </p>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* ─── 12 Rak'ahs Progress ─── */}
          <div
            style={{
              marginTop: 14,
              borderRadius: 22,
              padding: '18px 18px 16px',
              background: isDark
                ? `linear-gradient(135deg, ${t.green}0A, ${t.gold}06)`
                : `linear-gradient(135deg, ${t.green}0E, ${t.gold}08)`,
              border: `1.5px solid ${t.green}20`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative */}
            <div
              style={{
                position: 'absolute',
                top: -15,
                left: -15,
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: `${t.green}06`,
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>🏡</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, color: t.green, fontWeight: 700 }}>بيتك في الجنة</span>
                  <p style={{ fontSize: 10, color: t.muted, margin: '2px 0 0' }}>
                    {muakkadahRakaat}/{totalMuakkadahRakaat} ركعة مؤكدة اليوم
                  </p>
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: t.green }}>
                  {nawafelPct}%
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  width: '100%',
                  height: 8,
                  background: `${t.green}15`,
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, (muakkadahRakaat / totalMuakkadahRakaat) * 100)}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${t.green}, ${t.gold})`,
                    borderRadius: 4,
                    transition: 'width .5s',
                  }}
                />
              </div>

              {/* Hadith */}
              {muakkadahDone === muakkadahItems.length ? (
                <div
                  style={{
                    marginTop: 10,
                    textAlign: 'center',
                    padding: '8px',
                    borderRadius: 10,
                    background: `${t.green}12`,
                  }}
                >
                  <span style={{ fontSize: 20 }}>🎉</span>
                  <p style={{ fontSize: 12, color: t.green, fontWeight: 700, margin: '2px 0 0' }}>
                    ماشاء الله! أتممت الـ١٢ ركعة — بيتك في الجنة إن شاء الله
                  </p>
                </div>
              ) : (
                <p
                  style={{
                    fontFamily: 'Amiri',
                    fontSize: 11,
                    color: t.textSec,
                    lineHeight: 1.9,
                    margin: '8px 0 0',
                  }}
                >
                  "{TWELVE_RAKAHS_HADITH.text}"
                  <span style={{ fontSize: 9, color: t.gold }}> — {TWELVE_RAKAHS_HADITH.source}</span>
                </p>
              )}
            </div>
          </div>

          {/* ─── Nawafel Checklist by Prayer ─── */}
          {SALAWAT.map((prayer) => {
            const items = nawafelByPrayer[prayer.key] ?? [];
            if (items.length === 0) return null;
            const prayerColor = t[prayer.color];
            const allDone = items.every((n) => state.nawafelChecks[n.id]);

            return (
              <Card
                key={prayer.key}
                style={{
                  marginTop: 12,
                  border: allDone
                    ? `1.5px solid ${t.green}30`
                    : `1px solid ${t.border}30`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: `${prayerColor}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {prayer.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: allDone ? t.green : prayerColor,
                      }}
                    >
                      نوافل {prayer.label}
                    </span>
                    <p style={{ fontSize: 10, color: t.muted, margin: '1px 0 0' }}>
                      {items.filter((n) => state.nawafelChecks[n.id]).length}/{items.length} مكتملة
                    </p>
                  </div>
                  {allDone && (
                    <span style={{ fontSize: 18 }}>✅</span>
                  )}
                </div>

                {items.map((n) => (
                  <NafilaRow
                    key={n.id}
                    item={n}
                    done={!!state.nawafelChecks[n.id]}
                    onToggle={() => dispatch({ type: 'TOGGLE_NAFILA', key: n.id })}
                  />
                ))}
              </Card>
            );
          })}

          {/* ─── Azan Settings ─── */}
          <Card style={{ marginTop: 14 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <Sec icon="🔊" text="صوت الأذان" />
              <button
                aria-label="تشغيل الأذان تلقائياً"
                aria-pressed={state.azanEnabled}
                onClick={() => dispatch({ type: 'SET_AZAN_ENABLED', enabled: !state.azanEnabled })}
                onKeyDown={(e) =>
                  e.key === 'Enter' && dispatch({ type: 'SET_AZAN_ENABLED', enabled: !state.azanEnabled })
                }
                role="button"
                tabIndex={0}
                style={{
                  width: 48,
                  height: 44,
                  border: 'none',
                  padding: 0,
                  borderRadius: 22,
                  background: state.azanEnabled
                    ? `linear-gradient(90deg, ${t.green}, ${t.accent})`
                    : `${t.muted}30`,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background .3s',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: state.azanEnabled ? 25 : 3,
                    transition: 'left .3s',
                    boxShadow: '0 1px 4px rgba(0,0,0,.2)',
                  }}
                />
              </button>
            </div>

            <p style={{ fontSize: 11, color: t.muted, margin: '0 0 10px', lineHeight: 1.6 }}>
              {state.azanEnabled
                ? 'اختر صوت الأذان — ▶️ معاينة | 📥 حمّل للاستخدام دون اتصال'
                : 'فعّل التنبيه لسماع الأذان عند دخول وقت الصلاة'}
            </p>

            {state.azanEnabled && (
              <div style={{ animation: 'fadeIn .3s' }}>
                <p role="status" style={{ color: t.textSec, fontSize: 12, lineHeight: 1.8 }}>{azanStatus}</p>
                {isAndroidAzan() && <button onClick={() => { void openAzanSettings().catch(() => setAzanStatus('افتح إعدادات التطبيق واسمح بالإشعارات والمنبهات')); }}
                  style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 12, border: `1px solid ${t.accent}50`, background: `${t.accent}15`, color: t.text }}>
                  إعداد أذونات الأذان
                </button>}
                {AZAN_SOUNDS.map((sound) => (
                  <AzanSoundItem
                    key={sound.id}
                    sound={sound}
                    selected={state.selectedAzan === sound.id}
                    onSelect={() => dispatch({ type: 'SET_SELECTED_AZAN', id: sound.id })}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* ─── Daily Summary ─── */}
          {doneNawafel > 0 && (
            <div
              style={{
                marginTop: 14,
                padding: '14px 16px',
                borderRadius: 18,
                background: isDark
                  ? `linear-gradient(135deg, ${t.purple}0A, ${t.gold}06)`
                  : `linear-gradient(135deg, ${t.purple}0D, ${t.gold}08)`,
                border: `1px solid ${t.purple}18`,
                textAlign: 'center',
                animation: 'fadeIn .5s',
              }}
            >
              <span style={{ fontSize: 24 }}>🌟</span>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: t.text,
                  margin: '4px 0 2px',
                }}
              >
                أتممت {doneNawafel} من {totalNawafel} نوافل اليوم
              </p>
              <p style={{ fontSize: 11, color: t.muted, margin: 0 }}>
                {doneNawafel === totalNawafel
                  ? 'ماشاء الله — يوم مبارك!'
                  : 'استمر وأكمل الباقي — الأجر عظيم'}
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
