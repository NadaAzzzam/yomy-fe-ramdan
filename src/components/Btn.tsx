import { IonButton } from "@ionic/react";
import { useTheme } from "../context/ThemeContext";
import { themes } from "../lib/theme";

type BtnProps = {
  children: React.ReactNode;
  color?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  small?: boolean;
  disabled?: boolean;
};

export function Btn({
  children,
  color,
  onClick,
  style = {},
  small,
  disabled,
}: BtnProps) {
  const t = useTheme();
  const c = color ?? t.gold;
  const tc = [t.gold, t.orange, t.goldLight].includes(c)
    ? t === themes.dark
      ? "#080E1F"
      : "#fff"
    : t === themes.dark
      ? "#F3EDE0"
      : "#fff";
  return (
    <IonButton
      onClick={onClick}
      disabled={disabled}
      fill="solid"
      style={{
        background: disabled
          ? t.muted + "33"
          : `linear-gradient(135deg,${c},${c}BB)`,
        color: tc,
        borderRadius: small ? 12 : 16,
        padding: small ? "8px 16px" : "14px 24px",
        fontSize: small ? 12 : 15,
        fontWeight: 700,
        boxShadow: disabled ? "none" : `0 3px 16px ${c}44`,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </IonButton>
  );
}
