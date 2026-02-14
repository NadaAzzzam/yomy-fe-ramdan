import { C, fontArabic, fontSans } from "./constants";
import { Stars } from "./Stars";
import { MosqueSilhouette } from "./MosqueSilhouette";

/** 1024×500 Feature Graphic for Google Play */
export function FeatureGraphicSvg() {
  return (
    <svg
      width="1024"
      height="500"
      viewBox="0 0 1024 500"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fgBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0D1530" />
          <stop offset="50%" stopColor="#080E1F" />
          <stop offset="100%" stopColor="#0A0F25" />
        </linearGradient>
        <radialGradient id="fgGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor={C.gold} stopOpacity="0.12" />
          <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fgMoon" cx="35%" cy="35%">
          <stop offset="0%" stopColor={C.goldLight} />
          <stop offset="100%" stopColor={C.gold} />
        </radialGradient>
        <filter id="fgMoonGlow">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="fgTxtGlow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="1024" height="500" fill="url(#fgBg)" />
      <rect width="1024" height="500" fill="url(#fgGlow)" />
      <Stars width={1024} height={500} count={50} seed={33} />
      <MosqueSilhouette y={490} width={1024} opacity={0.08} />
      <circle
        cx="512"
        cy="250"
        r="200"
        fill="none"
        stroke={C.gold}
        strokeWidth="0.5"
        opacity="0.08"
      />
      <circle
        cx="512"
        cy="250"
        r="220"
        fill="none"
        stroke={C.gold}
        strokeWidth="0.3"
        opacity="0.05"
      />
      <circle cx="200" cy="200" r="80" fill={C.gold} opacity="0.05" />
      <circle
        cx="200"
        cy="200"
        r="70"
        fill="url(#fgMoon)"
        filter="url(#fgMoonGlow)"
      />
      <circle cx="222" cy="190" r="55" fill="#0D1530" />
      <text
        x="560"
        y="170"
        textAnchor="middle"
        fontFamily={fontArabic}
        fontSize="82"
        fontWeight="700"
        fill={C.goldLight}
        filter="url(#fgTxtGlow)"
      >
        يومي في رمضان
      </text>
      <text
        x="560"
        y="240"
        textAnchor="middle"
        fontFamily={fontSans}
        fontSize="32"
        fontWeight="600"
        fill={C.gold}
        opacity="0.8"
      >
        رمضانك منظم وبركة
      </text>
      {[
        { icon: "📖", text: "ختم القرآن", x: 370 },
        { icon: "✅", text: "تحديات يومية", x: 560 },
        { icon: "🏆", text: "إنجازات", x: 730 },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x},290)`}>
          <rect
            x="-65"
            y="-18"
            width="130"
            height="36"
            rx="18"
            fill={C.gold}
            opacity="0.12"
            stroke={C.gold}
            strokeWidth="0.8"
            strokeOpacity="0.3"
          />
          <text
            x="0"
            y="7"
            textAnchor="middle"
            fontFamily={fontSans}
            fontSize="16"
            fontWeight="700"
            fill={C.goldLight}
          >
            {p.icon} {p.text}
          </text>
        </g>
      ))}
      <text
        x="560"
        y="380"
        textAnchor="middle"
        fontFamily={fontSans}
        fontSize="22"
        fill={C.muted}
      >
        وازن بين عملك وعبادتك · بدون ضغط · مجاني
      </text>
      <g transform="translate(512,440)">
        <rect
          x="-100"
          y="-20"
          width="200"
          height="40"
          rx="20"
          fill={C.gold}
          opacity="0.15"
          stroke={C.gold}
          strokeWidth="1"
          strokeOpacity="0.3"
        />
        <text
          x="0"
          y="7"
          textAnchor="middle"
          fontFamily={fontSans}
          fontSize="17"
          fontWeight="700"
          fill={C.goldLight}
        >
          حمّل الآن مجاناً
        </text>
      </g>
    </svg>
  );
}
