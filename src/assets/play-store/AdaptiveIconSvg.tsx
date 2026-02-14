import { C, fontArabic } from "./constants";
import { Stars } from "./Stars";
import { MosqueSilhouette } from "./MosqueSilhouette";

/** Android adaptive icon — foreground layer 432×432 */
export function AdaptiveIconForegroundSvg({ size = 432 }: { size?: number }) {
  const scale = size / 432;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 432 432"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="aiFgMoon" cx="35%" cy="35%">
          <stop offset="0%" stopColor={C.goldLight} />
          <stop offset="100%" stopColor={C.gold} />
        </radialGradient>
        <filter id="aiFgGlow">
          <feGaussianBlur stdDeviation={6 * scale} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="216"
        cy="180"
        r="80"
        fill="url(#aiFgMoon)"
        filter="url(#aiFgGlow)"
      />
      <circle cx="240" cy="168" r="63" fill="#080E1F" />
      <g transform="translate(216,270)" opacity="0.85">
        <path
          d="M0 -6 Q-22 -14 -38 -5 L-38 22 Q-18 14 0 22"
          fill="none"
          stroke={C.goldLight}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M0 -6 Q22 -14 38 -5 L38 22 Q18 14 0 22"
          fill="none"
          stroke={C.goldLight}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <text
        x="216"
        y="350"
        textAnchor="middle"
        fontFamily={fontArabic}
        fontSize="42"
        fontWeight="700"
        fill={C.goldLight}
      >
        يومي
      </text>
      <text
        x="216"
        y="392"
        textAnchor="middle"
        fontFamily={fontArabic}
        fontSize="26"
        fill={C.gold}
        opacity="0.7"
      >
        في رمضان
      </text>
    </svg>
  );
}

/** Android adaptive icon — background layer 432×432 */
export function AdaptiveIconBackgroundSvg({ size = 432 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 432 432"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="aiBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F1835" />
          <stop offset="100%" stopColor="#080E1F" />
        </linearGradient>
      </defs>
      <rect width="432" height="432" fill="url(#aiBg)" />
      <Stars width={432} height={432} count={15} seed={55} />
      <MosqueSilhouette y={420} width={432} opacity={0.06} />
    </svg>
  );
}
