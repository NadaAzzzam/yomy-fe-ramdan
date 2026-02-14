import { C, fontArabic, fontSans } from "./constants";
import { Stars } from "./Stars";
import { MosqueSilhouette } from "./MosqueSilhouette";

/** Splash screen 375×812 — use for app launch / export for store */
export function SplashSvg() {
  return (
    <svg
      width="375"
      height="812"
      viewBox="0 0 375 812"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="splashBg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#0F1835" />
          <stop offset="100%" stopColor="#080E1F" />
        </linearGradient>
        <radialGradient id="splashMoon" cx="35%" cy="35%">
          <stop offset="0%" stopColor={C.goldLight} />
          <stop offset="100%" stopColor={C.gold} />
        </radialGradient>
        <filter id="splashGlow">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="375" height="812" fill="url(#splashBg)" />
      <Stars width={375} height={812} count={40} seed={88} />
      <circle cx="187" cy="310" r="95" fill={C.gold} opacity="0.06" />
      <circle
        cx="187"
        cy="310"
        r="82"
        fill="url(#splashMoon)"
        filter="url(#splashGlow)"
      />
      <circle cx="210" cy="298" r="65" fill="#0F1835" />
      <g transform="translate(187,420)" opacity="0.85">
        <path
          d="M0 -8 Q-30 -18 -50 -6 L-50 30 Q-26 20 0 30"
          fill="none"
          stroke={C.goldLight}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M0 -8 Q30 -18 50 -6 L50 30 Q26 20 0 30"
          fill="none"
          stroke={C.goldLight}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="-8"
          x2="0"
          y2="30"
          stroke={C.goldLight}
          strokeWidth="1.5"
          opacity="0.4"
        />
      </g>
      <text
        x="187"
        y="520"
        textAnchor="middle"
        fontFamily={fontArabic}
        fontSize="48"
        fontWeight="700"
        fill={C.goldLight}
        filter="url(#splashGlow)"
      >
        يومي في رمضان
      </text>
      <text
        x="187"
        y="565"
        textAnchor="middle"
        fontFamily={fontSans}
        fontSize="20"
        fill={C.gold}
        opacity="0.6"
      >
        رمضانك منظم وبركة ✨
      </text>
      <MosqueSilhouette y={790} width={375} opacity={0.08} />
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={175 + i * 14}
          cy={660}
          r={4}
          fill={C.gold}
          opacity={0.3 + i * 0.2}
        >
          <animate
            attributeName="opacity"
            values="0.2;0.8;0.2"
            dur="1.2s"
            begin={`${i * 0.3}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}
