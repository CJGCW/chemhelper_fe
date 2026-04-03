import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Props {
  liquidAmount: number | null;
  concentration: number | null;
  concMax: number;
  concUnit: string;
  concDisplay?: string | null; // pre-formatted concentration with correct sig figs
  moles: number | null;
  playing: boolean;
  onComplete?: () => void;
}

const BEAKER_SIZES = [
  0.025, 0.05, 0.1, 0.15, 0.25, 0.4, 0.5, 0.6, 1.0, 2.0, 3.0,
];
function pickBeakerSize(v: number): number {
  if (v <= 0) return 0.25;
  return (
    BEAKER_SIZES.find((s) => s >= v / 0.85) ??
    BEAKER_SIZES[BEAKER_SIZES.length - 1]
  );
}
function fmtVol(l: number): string {
  return l >= 1 ? `${l}L` : `${Math.round(l * 1000)}mL`;
}
interface Particle {
  id: number;
  x: number;
  delay: number;
  size: number;
}
function genParticles(n: number): Particle[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    x: 15 + Math.random() * 70,
    delay: i * 0.07,
    size: 2 + Math.random() * 2,
  }));
}
function liqColor(t: number, a: number) {
  return `rgba(${Math.round(200 + t * 40)},${Math.round(150 - t * 60)},${Math.round(40 - t * 30)},${a})`;
}

export default function Beaker({
  liquidAmount,
  concentration,
  concMax,
  concUnit,
  concDisplay,
  moles,
  playing,
  onComplete,
}: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stage, setStage] = useState<"idle" | "filled" | "dissolving" | "done">(
    "idle",
  );
  const [stirAngle, setStirAngle] = useState(0);
  const stirRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const beakerSize = pickBeakerSize(liquidAmount ?? 0);
  const fillFrac =
    liquidAmount != null ? Math.min(liquidAmount / beakerSize, 1) : 0;
  const concFrac =
    concentration != null ? Math.min(concentration / concMax, 1) : 0;
  const pCount =
    moles != null ? Math.min(Math.max(Math.round(moles * 8) + 4, 5), 24) : 0;

  useEffect(() => {
    setStage(liquidAmount != null && liquidAmount > 0 ? "filled" : "idle");
  }, [liquidAmount]);

  useEffect(() => {
    if (!playing || liquidAmount == null) return;
    setParticles(genParticles(pCount));
    setStage("dissolving");
    if (stirRef.current) clearInterval(stirRef.current);
    stirRef.current = setInterval(() => setStirAngle((a) => (a + 6) % 360), 20);
    const t = setTimeout(
      () => {
        setStage("done");
        if (stirRef.current) clearInterval(stirRef.current);
        onComplete?.();
      },
      pCount * 70 + 800,
    );
    return () => {
      clearTimeout(t);
      if (stirRef.current) clearInterval(stirRef.current);
    };
  }, [playing]);

  // ── Geometry ────────────────────────────────────────────────
  const cx = 110;
  const bTopY = 55;
  const bBotY = 222;
  const bH = bBotY - bTopY;
  const botHW = 86; // half-width
  const topHW = 86; // same — straight vertical walls
  const eRY = 8; // rim ellipse vertical radius (shallow = front-facing)
  const wT = 5; // wall thickness

  // Inner trapezoid half-widths
  const iTopHW = topHW - wT;
  const iBotHW = botHW - wT;

  // Linear interpolation: half-width at any y between bTopY and bBotY
  function hwAt(y: number) {
    const t = (y - bTopY) / bH;
    return topHW - t * (topHW - botHW);
  }
  function iHwAt(y: number) {
    const t = (y - bTopY) / bH;
    return iTopHW - t * (iTopHW - iBotHW);
  }
  function DissolvingParticle({
    p,
    cx,
    liqTopHW,
    liqTopY,
    liqH,
    bTopY,
  }: {
    p: Particle;
    cx: number;
    liqTopHW: number;
    liqTopY: number;
    liqH: number;
    bTopY: number;
  }) {
    const [scope, animate] = useAnimate();

    useEffect(() => {
      animate(
        scope.current,
        { cy: liqTopY - 2, opacity: 1, scale: 1 },
        { delay: p.delay, duration: 0.3, ease: "easeIn" },
      ).then(() =>
        animate(
          scope.current,
          { cy: liqTopY + liqH * 0.4, opacity: 0, scale: 0.3 },
          { duration: 0.4, ease: "easeOut" },
        ),
      );
    }, []);

    const px = cx - liqTopHW + (p.x / 100) * liqTopHW * 2;

    return (
      <motion.circle
        ref={scope}
        key={p.id}
        cx={px}
        r={p.size}
        fill="rgba(255,255,255,0.9)"
        initial={{ cy: bTopY - 8, opacity: 0, scale: 0 }}
      />
    );
  }

  const innerH = bH - wT * 2;
  const innerBotY = bBotY - wT;
  const liqH = fillFrac * innerH;
  const liqTopY = innerBotY - liqH;
  const liqTopHW = iHwAt(liqTopY);

  // Stir bar — ellipse, scaleX = |cos(angle)| for flat-spin illusion
  const rad = (stirAngle * Math.PI) / 180;
  const scaleX = Math.max(Math.abs(Math.cos(rad)), 0.07);
  const stirRX = 22 * scaleX;
  const stirRY = 5;
  const stirCY = innerBotY - stirRY - 3;

  const alpha = 0.3 + concFrac * 0.5;
  const mainColor = liqColor(concFrac, alpha);
  const surfColor = liqColor(concFrac, Math.min(alpha + 0.2, 0.92));

  return (
    <div className="flex flex-col items-center gap-2 select-none w-full">
      <svg
        viewBox="0 0 220 260"
        className="w-full max-w-[220px]"
        style={{ filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.5))" }}
      >
        {/* ── INTERIOR BACKGROUND ── */}
        <polygon
          points={`${cx - iTopHW},${bTopY} ${cx + iTopHW},${bTopY} ${cx + iBotHW},${innerBotY} ${cx - iBotHW},${innerBotY}`}
          fill="#0e1016"
        />

        {/* ── LIQUID body — rect clipped to inner cylinder ── */}
        <AnimatePresence>
          {fillFrac > 0 && (
            <motion.rect
              key="liq"
              x={cx - iTopHW}
              width={iTopHW * 2}
              fill={mainColor}
              initial={{ height: 0, y: innerBotY }}
              animate={{ height: liqH, y: liqTopY }}
              exit={{ height: 0, y: innerBotY }}
              transition={{ type: "spring", stiffness: 90, damping: 16 }}
            />
          )}
        </AnimatePresence>

        {/* ── STIR BAR ── */}
        {(stage === "dissolving" || stage === "done") && fillFrac > 0 && (
          <ellipse
            cx={cx}
            cy={stirCY}
            rx={stirRX}
            ry={stirRY}
            fill="rgba(230,235,255,0.8)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.8"
          />
        )}

        {/* ── GLASS WALLS (drawn over liquid) ── */}
        {/* Left wall */}
        <polygon
          points={`${cx - topHW},${bTopY} ${cx - iTopHW},${bTopY} ${cx - iBotHW},${innerBotY} ${cx - botHW},${bBotY}`}
          fill="#141825"
          stroke="#2a2d3d"
          strokeWidth="0.8"
        />
        {/* Right wall */}
        <polygon
          points={`${cx + topHW},${bTopY} ${cx + botHW},${bBotY} ${cx + iBotHW},${innerBotY} ${cx + iTopHW},${bTopY}`}
          fill="#141825"
          stroke="#2a2d3d"
          strokeWidth="0.8"
        />
        {/* Bottom */}
        <polygon
          points={`${cx - botHW},${bBotY} ${cx + botHW},${bBotY} ${cx + iBotHW},${innerBotY} ${cx - iBotHW},${innerBotY}`}
          fill="#0c0d10"
          stroke="#2a2d3d"
          strokeWidth="0.8"
        />
        {/* Inner glass sheen */}
        <polygon
          points={`${cx - iTopHW},${bTopY} ${cx - iTopHW + 3},${bTopY} ${cx - iBotHW + 3},${innerBotY} ${cx - iBotHW},${innerBotY}`}
          fill="rgba(255,255,255,0.025)"
        />

        {/* ── LIQUID SURFACE ELLIPSE — drawn AFTER walls so it sits on top ── */}
        <AnimatePresence>
          {fillFrac > 0 && (
            <motion.ellipse
              key="surf"
              cx={cx}
              rx={iTopHW}
              ry={eRY * 0.75}
              fill={surfColor}
              initial={{ cy: innerBotY, opacity: 0 }}
              animate={{ cy: liqTopY, opacity: 1 }}
              exit={{ cy: innerBotY, opacity: 0 }}
              transition={{ type: "spring", stiffness: 90, damping: 16 }}
            />
          )}
        </AnimatePresence>

        {/* ── PARTICLES ── */}
        <AnimatePresence>
          {stage === "dissolving" &&
            particles.map((p) => (
              <DissolvingParticle
                key={p.id}
                p={p}
                cx={cx}
                liqTopHW={liqTopHW}
                liqTopY={liqTopY}
                liqH={liqH}
                bTopY={bTopY}
              />
            ))}
        </AnimatePresence>

        {/* ── BOTTOM ELLIPSE ── */}
        <ellipse
          cx={cx}
          cy={bBotY}
          rx={botHW}
          ry={eRY}
          fill="#0c0d10"
          stroke="#2a2d3d"
          strokeWidth="1.2"
        />
        <ellipse
          cx={cx}
          cy={bBotY}
          rx={iBotHW}
          ry={eRY * 0.6}
          fill="transparent"
          stroke="#1c1f2e"
          strokeWidth="0.6"
        />

        {/* ── TOP RIM — front arc only, small integrated spout ── */}
        <path
          d={`
            M ${cx - topHW},${bTopY}
            A ${topHW} ${eRY} 0 0 0 ${cx + topHW},${bTopY + 3}
            L ${cx + topHW + 9},${bTopY + 1}
            L ${cx + topHW},${bTopY - 2}
            A ${topHW} ${eRY} 0 0 0 ${cx - topHW},${bTopY}
            Z
          `}
          fill="#141825"
          stroke="#2a2d3d"
          strokeWidth="1.2"
        />
        {/* Inner opening — front arc of inner ellipse */}
        <path
          d={`
            M ${cx - iTopHW},${bTopY}
            A ${iTopHW} ${eRY - 3} 0 0 0 ${cx + iTopHW},${bTopY}
          `}
          fill="none"
          stroke="#1c1f2e"
          strokeWidth="0.8"
        />

        {/* ── GRADUATION MARKS (right side) ── */}
        {[0.25, 0.5, 0.75].map((f) => {
          const markY = innerBotY - f * innerH;
          const rx = hwAt(markY);
          return (
            <g key={f}>
              <line
                x1={cx + rx - 11}
                y1={markY}
                x2={cx + rx - 1}
                y2={markY}
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <text
                x={cx + rx - 14}
                y={markY + 3.5}
                textAnchor="end"
                fontFamily="IBM Plex Mono"
                fontSize="7"
                fill="rgba(255,255,255,0.28)"
              >
                {fmtVol(f * beakerSize)}
              </text>
            </g>
          );
        })}

        {/* ── CONCENTRATION LABEL ── */}
        {concentration != null &&
          stage !== "idle" &&
          fillFrac > 0 &&
          liqH > 24 && (
            <motion.text
              x={cx}
              y={liqTopY + liqH * 0.5 + 4}
              textAnchor="middle"
              fontFamily="IBM Plex Mono"
              fontSize="10"
              fill="rgba(255,255,255,0.72)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {concDisplay ?? concentration.toPrecision(3)} {concUnit}
            </motion.text>
          )}
      </svg>

      {stage === "idle" && (
        <p className="font-mono text-[10px] text-dim text-center">
          Enter a volume — liquid will appear in the beaker
        </p>
      )}
    </div>
  );
}
