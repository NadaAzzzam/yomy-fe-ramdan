import { useTheme } from "../context/ThemeContext";
import { getMoonPhase } from "../lib/ramadan";

export function DynMoon({ day, size = 44 }: { day: number; size?: number }) {
  const t = useTheme();
  const phase = getMoonPhase(day);
  const off =
    phase < 0.5
      ? (1 - phase * 2) * size * 0.35
      : -(phase - 0.5) * 2 * size * 0.35;
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 35%,${t.goldLight},${t.gold})`,
          boxShadow: `0 0 ${size * 0.5}px ${t.gold}33`,
        }}
      />
      <div
        style={{
          width: size * 0.78,
          height: size * 0.78,
          borderRadius: "50%",
          background: t.bg,
          position: "absolute",
          top: size * 0.02,
          right: off,
          transition: "right 1s",
        }}
      />
    </div>
  );
}
