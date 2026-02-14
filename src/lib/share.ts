/**
 * Share Hadith / Moaazah as text (message) or as image (story/screenshot style like Ayah apps).
 */

const CARD_PADDING = 32;
const CARD_WIDTH = 340;
const CARD_MIN_HEIGHT = 200;
const TITLE_FONT = "16px 'Noto Sans Arabic', 'Tajawal', sans-serif";
const BODY_FONT = "18px 'Amiri', 'Noto Naskh Arabic', serif";
const SOURCE_FONT = "12px 'Noto Sans Arabic', 'Tajawal', sans-serif";
const GOLD = "#D4A84B";
const TEXT_COLOR = "#F3EDE0";
const MUTED = "#7E87AA";

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: string
): string[] {
  ctx.save();
  ctx.font = font;
  ctx.direction = "rtl";
  const lines: string[] = [];
  const words = text.split(/\s+/).filter(Boolean);
  let current = "";
  for (let i = words.length - 1; i >= 0; i--) {
    const word = words[i]!;
    const next = current ? word + " " + current : word;
    const m = ctx.measureText(next);
    if (m.width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  ctx.restore();
  return lines;
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Build hadith/moaazah card image and return as Blob (PNG). */
export function buildHadithImageBlob(options: {
  title: string;
  body: string;
  source?: string;
  isDark?: boolean;
}): Promise<Blob> {
  const { title, body, source = "", isDark = true } = options;
  const canvas = document.createElement("canvas");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("Canvas not supported"));

  const innerW = CARD_WIDTH - CARD_PADDING * 2;
  canvas.width = CARD_WIDTH * dpr;
  canvas.height = CARD_MIN_HEIGHT * dpr;
  ctx.scale(dpr, dpr);
  ctx.font = BODY_FONT;
  ctx.direction = "rtl";
  const bodyLines = wrapText(ctx, body, innerW, BODY_FONT);
  const lineHeight = 32;
  const bodyHeight = bodyLines.length * lineHeight;
  const titleH = 24;
  const sourceH = source ? 20 : 0;
  const totalH = Math.max(
    CARD_MIN_HEIGHT,
    CARD_PADDING * 2 + titleH + 12 + bodyHeight + (source ? 12 + sourceH : 0)
  );
  canvas.height = totalH * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, CARD_WIDTH, totalH);

  const cw = CARD_WIDTH;
  const ch = totalH;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, cw, ch);
  grad.addColorStop(0, "#111936");
  grad.addColorStop(1, "#172049");
  drawRoundRect(ctx, 0, 0, cw, ch, 20);
  ctx.fillStyle = grad;
  ctx.fill();

  // Border
  ctx.strokeStyle = GOLD + "40";
  ctx.lineWidth = 1;
  drawRoundRect(ctx, 0, 0, cw, ch, 20);
  ctx.stroke();

  // Title (e.g. حديث اليوم)
  ctx.font = TITLE_FONT;
  ctx.fillStyle = GOLD;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "rtl";
  ctx.fillText(title, cw / 2, CARD_PADDING + titleH / 2);

  // Body
  ctx.font = BODY_FONT;
  ctx.fillStyle = TEXT_COLOR;
  ctx.textAlign = "center";
  let y = CARD_PADDING + titleH + 12 + lineHeight / 2;
  for (const line of bodyLines) {
    ctx.fillText(line, cw / 2, y);
    y += lineHeight;
  }

  // Source
  if (source) {
    ctx.font = SOURCE_FONT;
    ctx.fillStyle = MUTED;
    ctx.fillText("— " + source, cw / 2, y + 12 + sourceH / 2);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/png",
      0.92
    );
  });
}

export type ShareContent = {
  title: string;
  text: string;
  source?: string;
};

/** Share as plain text (e.g. to WhatsApp as message). */
export async function shareAsText(content: ShareContent): Promise<boolean> {
  const { title, text, source } = content;
  const fullText = source
    ? `"${text}"\n— ${source}\n${title}`
    : `"${text}"\n${title}`;
  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: fullText,
      });
      return true;
    } catch (e) {
      if ((e as Error).name === "AbortError") return false;
    }
  }
  try {
    await navigator.clipboard.writeText(fullText);
    return true;
  } catch {
    return false;
  }
}

/** Share as image (for story / screenshot style). */
export async function shareAsImage(content: ShareContent): Promise<boolean> {
  const blob = await buildHadithImageBlob({
    title: content.title,
    body: content.text,
    source: content.source,
    isDark: true,
  });
  const file = new File([blob], "hadith.png", { type: "image/png" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: content.title,
        files: [file],
      });
      return true;
    } catch (e) {
      if ((e as Error).name === "AbortError") return false;
    }
  }
  // Fallback: open image in new tab so user can long-press save or share
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hadith.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
  return true;
}
