import { useId } from 'react';
import { useTheme } from '../context/ThemeContext';
import { fontArabic } from '../assets/play-store/constants';

/** In-app logo: crescent moon + book + "يومي في رمضان" — use on Setup, splash, etc. */
export function AppLogo({ size = 120 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  const t = useTheme();
  const cx = size * 0.5;
  const moonR = size * 0.22;
  const maskR = size * 0.17;
  const maskOff = size * 0.06;
  /* Moon gradient and mask: theme-aware so crescent fits dark/light background */
  const moonLight = t.goldLight;
  const moonDark = t.gold;
  const maskFill = t.bg; /* circle over helal — matches page background in light/dark */
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', margin: '0 auto' }}
    >
      <defs>
        <radialGradient id={`moonGrad-${id}`} cx="35%" cy="35%">
          <stop offset="0%" stopColor={moonLight} />
          <stop offset="100%" stopColor={moonDark} />
        </radialGradient>
        <filter id={`moonGlow-${id}`}>
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx={cx} cy={cx - size * 0.08} r={moonR + 2} fill={moonDark} opacity="0.12" />
      <circle
        cx={cx}
        cy={cx - size * 0.08}
        r={moonR}
        fill={`url(#moonGrad-${id})`}
        filter={`url(#moonGlow-${id})`}
      />
      <circle
        cx={cx + maskOff}
        cy={cx - size * 0.08 - maskOff * 0.4}
        r={maskR}
        fill={maskFill}
      />
      <g transform={`translate(${cx},${cx + size * 0.12})`} opacity="0.9">
        <path
          d="M0 -6 Q-18 -14 -32 -5 L-32 20 Q-16 14 0 20"
          fill="none"
          stroke={moonLight}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M0 -6 Q18 -14 32 -5 L32 20 Q16 14 0 20"
          fill="none"
          stroke={moonLight}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line x1="0" y1="-6" x2="0" y2="20" stroke={moonLight} strokeWidth="1" opacity="0.4" />
      </g>
      <text
        x={cx}
        y={cx + size * 0.42}
        textAnchor="middle"
        fontFamily={fontArabic}
        fontSize={size * 0.2}
        fontWeight="700"
        fill={moonLight}
      >
        يومي في رمضان
      </text>
    </svg>
  );
}
