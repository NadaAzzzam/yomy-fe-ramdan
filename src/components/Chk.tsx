import { useTheme } from "../context/ThemeContext";
import { themes } from "../lib/theme";

export function Chk({
  done,
  onClick,
  size = 26,
}: {
  done: boolean;
  onClick: (e?: React.MouseEvent) => void;
  size?: number;
}) {
  const t = useTheme();
  return (
    <div
      onClick={(e) => onClick(e)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(undefined)}
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        border: `2.5px solid ${done ? t.green : t.muted + "55"}`,
        background: done ? t.green : t.checkBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all .25s",
        flexShrink: 0,
      }}
    >
      {done && (
        <span
          style={{
            color: t === themes.dark ? "#080E1F" : "#fff",
            fontSize: size * 0.55,
            fontWeight: 800,
          }}
        >
          ✓
        </span>
      )}
    </div>
  );
}
