import { useTheme } from "../context/ThemeContext";

export function Sec({ icon, text }: { icon: string; text: string }) {
  const t = useTheme();
  return (
    <p
      style={{
        fontSize: 13,
        color: t.goldLight,
        margin: "0 0 10px",
        fontWeight: 700,
      }}
    >
      {icon} {text}
    </p>
  );
}
