import { useTheme } from "../context/ThemeContext";

type RingProps = {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  pulse?: boolean;
  children?: React.ReactNode;
};

export function Ring({
  pct,
  size = 100,
  stroke = 8,
  color,
  pulse,
  children,
}: RingProps) {
  const t = useTheme();
  const c = color ?? t.gold;
  const r = (size - stroke) / 2;
  const ci = 2 * Math.PI * r;
  const offset = ci - (Math.min(pct, 100) / 100) * ci;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`${c}18`}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={c}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={ci}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset .8s" }}
          className={pulse && pct >= 90 ? "ring-pulse" : ""}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}
