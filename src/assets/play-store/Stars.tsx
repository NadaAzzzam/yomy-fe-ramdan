import { C } from "./constants";

export function Stars({
  width,
  height,
  count = 20,
  seed = 1,
}: {
  width: number;
  height: number;
  count?: number;
  seed?: number;
}) {
  const stars: { x: number; y: number; r: number; o: number }[] = [];
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rand() * width,
      y: rand() * height,
      r: 0.5 + rand() * 1.5,
      o: 0.15 + rand() * 0.4,
    });
  }
  return (
    <>
      {stars.map((st, i) => (
        <circle
          key={i}
          cx={st.x}
          cy={st.y}
          r={st.r}
          fill={C.goldLight}
          opacity={st.o}
        />
      ))}
    </>
  );
}
