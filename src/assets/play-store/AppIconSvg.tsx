import { C, fontArabic } from "./constants";
import { Stars } from "./Stars";
import { MosqueSilhouette } from "./MosqueSilhouette";

/** 512×512 App Icon for Google Play — export as PNG from kit page */
export function AppIconSvg({
  size = 512,
  rounded = true,
}: {
  size?: number;
  rounded?: boolean;
}) {
  const r = rounded ? 512 * 0.22 : 0;
  const scale = size / 512;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="appIconBgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0D1530" />
          <stop offset="100%" stopColor="#080E1F" />
        </linearGradient>
        <radialGradient id="appIconMoonGrad" cx="35%" cy="35%">
          <stop offset="0%" stopColor={C.goldLight} />
          <stop offset="100%" stopColor={C.gold} />
        </radialGradient>
        <filter id="appIconGlow">
          <feGaussianBlur stdDeviation={8 * scale} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="appIconTextShadow">
          <feGaussianBlur stdDeviation={3 * scale} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="appIconClip">
          <rect width="512" height="512" rx={r} ry={r} />
        </clipPath>
      </defs>
      <g clipPath="url(#appIconClip)">
        <rect width="512" height="512" fill="url(#appIconBgGrad)" />
        <Stars width={512} height={512} count={30} seed={42} />
        <circle
          cx="256"
          cy="220"
          r="140"
          fill="none"
          stroke={C.gold}
          strokeWidth="1"
          opacity="0.1"
        />
        <circle
          cx="256"
          cy="220"
          r="155"
          fill="none"
          stroke={C.gold}
          strokeWidth="0.5"
          opacity="0.07"
        />
        <circle cx="256" cy="195" r="95" fill={C.gold} opacity="0.08" />
        <circle
          cx="256"
          cy="195"
          r="85"
          fill="url(#appIconMoonGrad)"
          filter="url(#appIconGlow)"
        />
        <circle cx="282" cy="184" r="67" fill="#0D1530" />
        <g transform="translate(256,290)" opacity="0.9">
          <path
            d="M0 -8 Q-28 -18 -48 -6 L-48 28 Q-24 18 0 28"
            fill="none"
            stroke={C.goldLight}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M0 -8 Q28 -18 48 -6 L48 28 Q24 18 0 28"
            fill="none"
            stroke={C.goldLight}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <line
            x1="0"
            y1="-8"
            x2="0"
            y2="28"
            stroke={C.goldLight}
            strokeWidth="1.5"
            opacity="0.4"
          />
        </g>
        <MosqueSilhouette y={480} width={512} opacity={0.1} />
        <text
          x="256"
          y="400"
          textAnchor="middle"
          fontFamily={fontArabic}
          fontSize="52"
          fontWeight="700"
          fill={C.goldLight}
          filter="url(#appIconTextShadow)"
        >
          يومي
        </text>
        <text
          x="256"
          y="455"
          textAnchor="middle"
          fontFamily={fontArabic}
          fontSize="36"
          fontWeight="400"
          fill={C.gold}
          opacity="0.75"
        >
          في رمضان
        </text>
      </g>
    </svg>
  );
}
