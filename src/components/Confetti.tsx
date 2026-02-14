import { useEffect, useRef } from "react";

export function Confetti({ trigger }: { trigger: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ps = useRef<
    Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      vx: number;
      vy: number;
      rot: number;
      rv: number;
      c: string;
      life: number;
    }>
  >([]);
  const af = useRef<number | null>(null);
  const dims = useRef({ w: 375, h: 812 });

  useEffect(() => {
    if (!trigger) return;
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const w = typeof window !== "undefined" ? window.innerWidth : 375;
    const h = typeof window !== "undefined" ? window.innerHeight : 812;
    dims.current = { w, h };
    cv.width = w;
    cv.height = h;
    const cols = [
      "#D4A84B",
      "#F5D88E",
      "#3DDC84",
      "#6C7AE0",
      "#A855F7",
      "#F59E42",
      "#fff",
    ];
    ps.current = Array.from({ length: 55 }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * 200,
      w: 4 + Math.random() * 6,
      h: 6 + Math.random() * 8,
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * 360,
      rv: -4 + Math.random() * 8,
      c: cols[Math.floor(Math.random() * cols.length)]!,
      life: 1,
    }));
    const go = () => {
      const { w: cw, h: ch } = dims.current;
      ctx.clearRect(0, 0, cw, ch);
      let alive = false;
      ps.current.forEach((p) => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.rot += p.rv;
        p.life -= 0.006;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.life;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (alive) af.current = requestAnimationFrame(go);
    };
    go();
    return () => {
      if (af.current) cancelAnimationFrame(af.current);
    };
  }, [trigger]);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 99,
      }}
    />
  );
}
