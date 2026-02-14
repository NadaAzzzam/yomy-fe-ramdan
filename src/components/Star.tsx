import { useTheme } from "../context/ThemeContext";

export function Star({
  x,
  y,
  s = 2,
  d = 0,
}: {
  x: string;
  y: string;
  s?: number;
  d?: number;
}) {
  const t = useTheme();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: s,
        height: s,
        borderRadius: "50%",
        background: t.starColor,
        animation: `tw 3s ${d}s ease-in-out infinite alternate`,
        pointerEvents: "none",
      }}
    />
  );
}
