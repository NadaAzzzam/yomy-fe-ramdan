import { useState } from "react";
import { IonIcon, IonActionSheet } from "@ionic/react";
import { shareSocialOutline, chatbubbleOutline, imageOutline } from "ionicons/icons";
import { useTheme } from "../context/ThemeContext";
import {
  shareAsText,
  shareAsImage,
  type ShareContent,
} from "../lib/share";
import { fontSans } from "../lib/theme";

type ShareButtonProps = {
  content: ShareContent;
  /** Optional label next to icon (e.g. "مشاركة") */
  label?: string;
  /** Compact: icon only. Default true. */
  compact?: boolean;
  /** Style overrides */
  style?: React.CSSProperties;
};

export function ShareButton({
  content,
  label = "مشاركة",
  compact = true,
  style = {},
}: ShareButtonProps) {
  const t = useTheme();
  const [showSheet, setShowSheet] = useState(false);
  const [loading, setLoading] = useState<"text" | "image" | null>(null);

  const handleShare = async (as: "text" | "image") => {
    setLoading(as);
    try {
      if (as === "text") await shareAsText(content);
      else await shareAsImage(content);
      setShowSheet(false);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowSheet(true)}
        disabled={loading !== null}
        aria-label={label}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: compact ? "8px 10px" : "10px 14px",
          borderRadius: 12,
          border: `1px solid ${t.gold}35`,
          background: `${t.gold}0C`,
          color: t.gold,
          fontSize: 12,
          fontWeight: 600,
          fontFamily: fontSans,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
          transition: "all .2s",
          ...style,
        }}
      >
        <IonIcon icon={shareSocialOutline} style={{ fontSize: 18 }} />
        {!compact && <span>{label}</span>}
      </button>

      <IonActionSheet
        isOpen={showSheet}
        onDidDismiss={() => setShowSheet(false)}
        header={label}
        buttons={[
          {
            text: "مشاركة كنص (واتساب، رسالة…)",
            icon: chatbubbleOutline,
            handler: () => handleShare("text"),
          },
          {
            text: "مشاركة كصورة (ستوري، حفظ صورة)",
            icon: imageOutline,
            handler: () => handleShare("image"),
          },
          { text: "إلغاء", role: "cancel" },
        ]}
      />
    </>
  );
}
