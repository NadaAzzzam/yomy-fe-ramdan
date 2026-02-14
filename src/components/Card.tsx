import { useTheme } from "../context/ThemeContext";

type CardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  glow?: boolean;
};

export function Card({ children, style = {}, glow }: CardProps) {
  const t = useTheme();
  return (
    <div
      style={{
        background: t.card,
        borderRadius: 20,
        padding: "16px 18px",
        border: `1px solid ${glow ? t.gold + "25" : t.border}30`,
        boxShadow: glow ? t.cg(t.gold) : `0 2px 10px ${t.shadowColor}`,
        transition: "all .35s",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
