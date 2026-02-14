# يومي في رمضان (Yomy Ramadan) — Ionic 8

Ramadan daily tracker and tasbih app built with **Ionic Framework 8** and **React**.

## Features

- **Setup** — Set daily Quran pages, reading times, and daily goals (azkar, qiyam, sadaqa, etc.)
- **Home** — Today’s progress: reading slots, challenges, Juz/khatma, hadith of the day
- **Subha (Tasbih)** — Multiple dhikr types with counters (Subhanallah, Alhamdulillah, etc.) and quick +33/+100 actions
- **Notes** — Podcasts/lectures and personal duas
- **Motivation** — Night motivations and “after Tarawih” content
- **Weekly** — Weekly report and stats
- **Dark / Light** theme toggle

## Tech Stack

- [Ionic React](https://ionicframework.com/docs/react) 8
- [React](https://react.dev/) 18
- [React Router](https://v5.reactrouter.com/) 5 (Ionic peer)
- [Vite](https://vitejs.dev/) 5
- TypeScript

## Setup

```bash
npm install
```

## Run

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm preview
```

## Project structure

```
src/
├── App.tsx              # Root: IonApp, IonTabs, routes, theme toggle
├── main.tsx             # Entry, setupIonicReact, Ionic CSS
├── context/
│   └── ThemeContext.tsx # Dark/light theme provider
├── lib/
│   ├── theme.ts         # Theme palettes (dark/light)
│   ├── ramadan.ts       # Ramadan dates, moon phase, AR_DAYS
│   ├── juz.ts           # Juz data and getJuzInfo()
│   ├── data.ts          # Hadiths, NIGHT_MOTIVATIONS
│   └── state.ts         # App state, reducer, initState
├── components/
│   ├── Card.tsx, Btn.tsx, Sec.tsx, Chk.tsx
│   ├── Ring.tsx, DynMoon.tsx, Star.tsx
│   └── Confetti.tsx
├── pages/
│   ├── Setup.tsx        # Onboarding: pages, times, goals
│   ├── Home.tsx         # Daily progress, slots, challenges, hadith
│   ├── Subha.tsx         # Tasbih/dhikr counters
│   ├── Notes.tsx        # Podcasts, duas
│   ├── Motivation.tsx   # Night motivations
│   └── Weekly.tsx       # Weekly report
└── theme/
    └── global.css       # Global + Ionic overrides, RTL
```

## RTL & Arabic

- `index.html` has `lang="ar"` and `dir="rtl"`.
- Arabic fonts: Amiri (serif), Noto Sans Arabic (sans), loaded from Google Fonts.

## Responsive (all Android screens)

The layout is responsive so it works on **all Android screen sizes** (small phones ~320px up to large devices):

- **Safe areas** — Content and the tab bar respect `env(safe-area-inset-*)` so nothing is hidden behind notches, rounded corners, or system navigation.
- **Viewport** — `viewport-fit=cover` and `100dvh` / `100vh` for full-height layout; `overflow-x: hidden` to avoid horizontal scroll.
- **Page padding** — `.ion-content-inner` uses responsive padding (16px on small screens, 20px from 360px up) plus safe-area insets.
- **Confetti** — Uses current window size instead of a fixed 375×812 so it fills the screen on any device.
- **Theme button** — Positioned with `max(12px, env(safe-area-inset-top/left))` so it stays visible on notched devices.

## Performance & Google Play

The app is tuned for **fast startup** and **small bundle size**:

- **Lazy-loaded pages** — Each tab (Setup, Home, Subha, Notes, Motivation, Weekly) is loaded on demand, so the first screen opens quickly.
- **Single vendor chunk** — React + Ionic are in one cacheable chunk (~124 KB gzip).
- **Production build** — `npm run build` uses `es2020` target, esbuild minify, no sourcemaps, and CSS minification.
- **Non-blocking fonts** — Arabic fonts load async so they don’t block first paint.
- **Small assets** — Inline limit 1 KB; larger assets get separate files and hashed names for caching.

For Android/Google Play, run `npm run build`, then `npx cap sync` and open in Android Studio. The same `dist/` output is used so you get the same optimizations.

## Logo & Google Play assets (SVG)

- **In-app logo** — The Setup screen uses the shared SVG logo (crescent moon + book + "يومي في رمضان") from `src/components/AppLogo.tsx`.
- **Favicon** — `public/logo.svg` is linked in `index.html` as the app favicon.

## Capacitor (optional)

The project is set up for Capacitor. To add native platforms:

```bash
npx cap add ios
npx cap add android
npm run build
npx cap sync
npx cap open ios   # or android
```

---

رمضان كريم
