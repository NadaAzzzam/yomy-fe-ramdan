import { C } from "./constants";

export function MosqueSilhouette({
  y,
  width,
  opacity = 0.12,
}: {
  y: number;
  width: number;
  opacity?: number;
}) {
  const cx = width / 2;
  return (
    <g opacity={opacity}>
      <path
        d={`M${cx - 50} ${y} Q${cx - 50} ${y - 35} ${cx} ${y - 48} Q${cx + 50} ${y - 35} ${cx + 50} ${y}Z`}
        fill={C.gold}
      />
      <rect x={cx - 72} y={y - 35} width={7} height={35} rx={2} fill={C.gold} />
      <circle cx={cx - 68.5} cy={y - 38} r={5} fill={C.gold} />
      <rect x={cx - 70} y={y - 48} width={3} height={8} rx={1} fill={C.gold} />
      <rect x={cx + 65} y={y - 35} width={7} height={35} rx={2} fill={C.gold} />
      <circle cx={cx + 68.5} cy={y - 38} r={5} fill={C.gold} />
      <rect x={cx + 67} y={y - 48} width={3} height={8} rx={1} fill={C.gold} />
      <path
        d={`M${cx - 38} ${y} Q${cx - 38} ${y - 18} ${cx - 22} ${y - 25} Q${cx - 6} ${y - 18} ${cx - 6} ${y}Z`}
        fill={C.gold}
        opacity="0.7"
      />
      <path
        d={`M${cx + 6} ${y} Q${cx + 6} ${y - 18} ${cx + 22} ${y - 25} Q${cx + 38} ${y - 18} ${cx + 38} ${y}Z`}
        fill={C.gold}
        opacity="0.7"
      />
    </g>
  );
}
