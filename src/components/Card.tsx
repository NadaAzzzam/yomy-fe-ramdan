import { useTheme } from "../context/ThemeContext";

type CardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  glow?: boolean;
  onClick?: () => void;
};

export function Card({ children, style = {}, glow, onClick }: CardProps) {
  const t = useTheme();
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        background: t.card,
        borderRadius: 20,
        padding: "16px 18px",
        border: `1px solid ${glow ? t.gold + "25" : t.border}30`,
        boxShadow: glow ? t.cg(t.gold) : `0 2px 10px ${t.shadowColor}`,
        transition: "all .35s",
        ...(onClick ? { cursor: "pointer" as const } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
