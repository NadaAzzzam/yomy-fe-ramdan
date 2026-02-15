import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { IonApp, IonTabs, IonTabBar, IonTabButton, IonLabel, IonRouterOutlet, IonIcon } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, useHistory } from 'react-router-dom';
import { home, ellipse, time, book, grid } from 'ionicons/icons';
import { ThemeProvider, useTheme, useIsDark, useThemeMode } from './context/ThemeContext';
import type { ThemeMode } from './context/ThemeContext';
import { Star } from './components/Star';
import { PageLoader } from './components/PageLoader';
import { initState, reducer, saveState, buildDailySnapshot } from './lib/state';
import { scheduleNotifications } from './lib/notifications';
import { getRamadanInfo } from './lib/ramadan';
import type { AppState } from './lib/state';
import type { Action } from './lib/state';

const Setup = lazy(() => import('./pages/Setup').then(m => ({ default: m.Setup })));
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Subha = lazy(() => import('./pages/Subha').then(m => ({ default: m.Subha })));
const Notes = lazy(() => import('./pages/Notes').then(m => ({ default: m.Notes })));
const Motivation = lazy(() => import('./pages/Motivation').then(m => ({ default: m.Motivation })));
const Weekly = lazy(() => import('./pages/Weekly').then(m => ({ default: m.Weekly })));
const Salah = lazy(() => import('./pages/Salah').then(m => ({ default: m.Salah })));
const QuranPage = lazy(() => import('./pages/Quran').then(m => ({ default: m.Quran })));
const MorePage = lazy(() => import('./pages/More').then(m => ({ default: m.More })));

/* ─── Beautiful 3-way theme switcher ─── */
const THEME_OPTIONS: { mode: ThemeMode; icon: string; label: string }[] = [
  { mode: 'light', icon: '☀️', label: 'فاتح' },
  { mode: 'system', icon: '📱', label: 'تلقائي' },
  { mode: 'dark', icon: '🌙', label: 'داكن' },
];

function ThemeSwitcher() {
  const t = useTheme();
  const isDark = useIsDark();
  const [mode, setMode] = useThemeMode();
  const [open, setOpen] = useState(false);
  const activeIdx = THEME_OPTIONS.findIndex(o => o.mode === mode);

  return (
    <div style={{ position: 'fixed', top: 'max(12px, env(safe-area-inset-top))', left: 'max(12px, env(safe-area-inset-left))', zIndex: 99999, direction: 'ltr' }}>
      {/* Collapsed: just a small button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Theme"
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            border: `1.5px solid ${t.border}60`,
            background: isDark
              ? 'linear-gradient(135deg, #172049, #111936)'
              : 'linear-gradient(135deg, #FFFFFF, #F0EBE2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            transition: 'all .35s cubic-bezier(.4,0,.2,1)',
            transform: 'translateZ(0)',
            pointerEvents: 'auto',
            boxShadow: isDark
              ? '0 4px 20px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06)'
              : '0 4px 20px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.8)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {mode === 'dark' ? '🌙' : mode === 'light' ? '☀️' : '📱'}
        </button>
      )}

      {/* Expanded: 3-way segmented pill */}
      {open && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            borderRadius: 18,
            padding: 4,
            background: isDark
              ? 'linear-gradient(135deg, #111936ee, #172049ee)'
              : 'linear-gradient(135deg, #FFFFFFee, #F0EBE2ee)',
            border: `1.5px solid ${t.border}60`,
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06)'
              : '0 8px 32px rgba(0,0,0,.1), inset 0 1px 0 rgba(255,255,255,.8)',
            backdropFilter: 'blur(16px)',
            position: 'relative',
            animation: 'themeSwitcherIn .25s cubic-bezier(.4,0,.2,1)',
            pointerEvents: 'auto',
          }}
        >
          {/* Sliding indicator */}
          <div
            style={{
              position: 'absolute',
              top: 4,
              left: 4 + activeIdx * 48,
              width: 46,
              height: 36,
              borderRadius: 14,
              background: isDark
                ? `linear-gradient(135deg, ${t.gold}30, ${t.accent}20)`
                : `linear-gradient(135deg, ${t.gold}25, ${t.accent}15)`,
              border: `1px solid ${t.gold}30`,
              transition: 'left .3s cubic-bezier(.4,0,.2,1)',
              zIndex: 0,
            }}
          />
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.mode}
              onClick={() => {
                setMode(opt.mode);
                setTimeout(() => setOpen(false), 350);
              }}
              aria-label={opt.label}
              title={opt.label}
              style={{
                width: 46,
                height: 36,
                borderRadius: 14,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                transition: 'transform .2s',
                transform: opt.mode === mode ? 'scale(1.1)' : 'scale(1)',
                position: 'relative',
                zIndex: 1,
                padding: 0,
              }}
            >
              {opt.icon}
            </button>
          ))}

          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: 'none',
              background: `${t.muted}15`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: t.muted,
              marginRight: 2,
              marginLeft: 4,
              transition: 'background .2s',
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function AppContent() {
  const history = useHistory();
  const [state, setState] = useState<AppState>(initState);
  const dispatch = useCallback((a: Action) => setState((p) => reducer(p, a)), []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Day rollover: when date changes, archive previous day and reset today
  useEffect(() => {
    const now = new Date();
    const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    if (!state.lastSeenDate) {
      dispatch({ type: 'SET_LAST_SEEN_DATE', date: today });
      return;
    }
    if (state.lastSeenDate < today) {
      const snapshot = buildDailySnapshot(state);
      dispatch({
        type: 'ARCHIVE_AND_ROLLOVER',
        archivedDate: state.lastSeenDate,
        snapshot,
        newDate: today,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when lastSeenDate or dispatch changes; state is read for snapshot when rolling over
  }, [state.lastSeenDate, dispatch]);

  useEffect(() => {
    const ramInfo = getRamadanInfo();
    scheduleNotifications(
      state.duas,
      state.duaNotificationTime,
      state.remindersEnabled,
      ramInfo.day,
      state.salahAlaNabyTimes
    );
  }, [state.duas, state.duaNotificationTime, state.remindersEnabled, state.salahAlaNabyTimes]);

  const isDark = useIsDark();
  const t = useTheme();

  // Sync body/document background with theme
  useEffect(() => {
    document.body.style.backgroundColor = t.bg;
    document.body.style.color = t.text;
    document.documentElement.style.backgroundColor = t.bg;
    // Update Ionic CSS variables
    document.documentElement.style.setProperty('--ion-background-color', t.bg);
    document.documentElement.style.setProperty('--ion-text-color', t.text);
  }, [t.bg, t.text]);

  const onFinishSetup = useCallback(() => {
    dispatch({ type: 'FINISH_SETUP' });
    history.replace('/home');
  }, [dispatch, history]);

  const onResetApp = useCallback(() => {
    dispatch({ type: 'RESET_APP' });
    history.replace('/');
  }, [dispatch, history]);

  return (
    <IonApp style={{ backgroundColor: t.bg, color: t.text, transition: 'background-color .4s, color .4s' }}>
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/setup" render={() => <Suspense fallback={<PageLoader />}><Setup state={state} dispatch={dispatch} onFinish={onFinishSetup} onResetApp={onResetApp} /></Suspense>} />
            <Route path="/home" render={() => <Suspense fallback={<PageLoader />}><Home state={state} dispatch={dispatch} /></Suspense>} />
            <Route path="/subha" render={() => <Suspense fallback={<PageLoader />}><Subha state={state} dispatch={dispatch} /></Suspense>} />
            <Route path="/salah" render={() => <Suspense fallback={<PageLoader />}><Salah state={state} dispatch={dispatch} /></Suspense>} />
            <Route path="/quran" render={() => <Suspense fallback={<PageLoader />}><QuranPage state={state} dispatch={dispatch} /></Suspense>} />
            <Route path="/more" render={() => <Suspense fallback={<PageLoader />}><MorePage /></Suspense>} />
            <Route path="/notes" render={() => <Suspense fallback={<PageLoader />}><Notes state={state} dispatch={dispatch} /></Suspense>} />
            <Route path="/motivation" render={() => <Suspense fallback={<PageLoader />}><Motivation state={state} dispatch={dispatch} /></Suspense>} />
            <Route path="/weekly" render={() => <Suspense fallback={<PageLoader />}><Weekly state={state} dispatch={dispatch} /></Suspense>} />
            <Route exact path="/" render={() => <Redirect to={state.setupDone ? '/home' : '/setup'} />} />
            <Route render={() => <Redirect to="/" />} />
          </IonRouterOutlet>

          <IonTabBar
            id="app-main-tab-bar"
            slot="bottom"
            style={{
              '--background': t.navBg,
              '--border': `1px solid ${t.muted}12`,
            } as Record<string, string>}
          >
            <IonTabButton tab="home" href="/home">
              <IonIcon icon={home} />
              <IonLabel>يومي</IonLabel>
            </IonTabButton>
            <IonTabButton tab="quran" href="/quran">
              <IonIcon icon={book} />
              <IonLabel>القرآن</IonLabel>
            </IonTabButton>
            <IonTabButton tab="salah" href="/salah">
              <IonIcon icon={time} />
              <IonLabel>صلاتي</IonLabel>
            </IonTabButton>
            <IonTabButton tab="subha" href="/subha">
              <IonIcon icon={ellipse} />
              <IonLabel>سُبحة</IonLabel>
            </IonTabButton>
            <IonTabButton tab="more" href="/more">
              <IonIcon icon={grid} />
              <IonLabel>المزيد</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>

      {/* Theme switcher — fixed in viewport via portal so it never scrolls */}
      {typeof document !== 'undefined' &&
        createPortal(<ThemeSwitcher />, document.body)}

      {isDark && (
        <>
          <Star x="9%" y="5%" s={2} d={0} />
          <Star x="87%" y="9%" s={1.5} d={1} />
          <Star x="68%" y="3%" s={2} d={0.5} />
          <Star x="28%" y="2%" s={1.5} d={2} />
        </>
      )}
    </IonApp>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <IonReactRouter>
        <AppContent />
      </IonReactRouter>
    </ThemeProvider>
  );
}
