import { motion, AnimatePresence, useSpring } from "framer-motion";
import { useEffect } from "react";

interface Props {
  temperature: number | null;
  pureTemperature: number;
  mode: "bpe" | "fpd";
}

export default function Thermometer({
  temperature,
  pureTemperature,
  mode,
}: Props) {
  const newT = temperature ?? pureTemperature;
  const lo = Math.min(pureTemperature, newT);
  const hi = Math.max(pureTemperature, newT);
  const span = Math.max(hi - lo + 12, 28);
  const rangeMin = lo - (span - (hi - lo)) / 2;
  const rangeMax = rangeMin + span;

  // ── Geometry — tall viewBox, stem centred, labels on right ──
  const vw = 160,
    vh = 380;
  const bulbCX = 70,
    bulbCY = 340,
    bulbR = 22;
  const stemX = 70,
    stemTop = 30,
    stemBot = bulbCY - bulbR + 2;
  const stemW = 11;
  const innerW = 5.5;
  const stemH = stemBot - stemTop;

  function tempToY(t: number): number {
    const frac = (t - rangeMin) / (rangeMax - rangeMin);
    return stemBot - frac * stemH;
  }

  const pureY = tempToY(pureTemperature);
  const newY = temperature != null ? tempToY(newT) : pureY;
  const mercBot = stemBot;
  const mercTop = Math.min(newY, stemBot);

  const springConfig = { stiffness: 55, damping: 16 };
  const springY = useSpring(mercBot, springConfig);
  const springH = useSpring(0, springConfig);
  useEffect(() => {
    springY.set(mercTop);
    springH.set(mercBot - mercTop);
  }, [mercTop]);

  const mercColor = mode === "bpe" ? "#ef4444" : "#60a5fa";
  const bulbColor = mode === "bpe" ? "#dc2626" : "#3b82f6";
  const glowColor =
    mode === "bpe" ? "rgba(239,68,68,0.28)" : "rgba(96,165,250,0.28)";

  const tickStep = span <= 20 ? 1 : span <= 50 ? 2 : 5;
  const tickStart = Math.ceil(rangeMin / tickStep) * tickStep;
  const ticks: number[] = [];
  for (let t = tickStart; t <= rangeMax; t += tickStep) ticks.push(t);

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <svg
        viewBox={`0 0 ${vw} ${vh}`}
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.4))" }}
      >
        <defs>
          <linearGradient id="therm-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.09)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
          </linearGradient>
          <clipPath id="stem-clip">
            <rect
              x={stemX - stemW}
              y={stemTop}
              width={stemW * 2}
              height={stemH + 4}
            />
          </clipPath>
        </defs>

        {/* Bulb glow */}
        {temperature != null && (
          <circle cx={bulbCX} cy={bulbCY} r={bulbR + 8} fill={glowColor} />
        )}

        {/* Stem glass */}
        <rect
          x={stemX - stemW}
          y={stemTop}
          width={stemW * 2}
          height={stemH}
          rx={stemW}
          fill="#141825"
          stroke="#2a2d3d"
          strokeWidth="1.2"
        />

        {/* Mercury column — springs are passed as SVG attributes to stay in SVG user space */}
        <motion.rect
          x={stemX - innerW}
          width={innerW * 2}
          y={springY}
          height={springH}
          fill={mercColor}
          clipPath="url(#stem-clip)"
        />

        {/* Stem glass sheen */}
        <rect
          x={stemX - stemW}
          y={stemTop}
          width={stemW * 2}
          height={stemH}
          rx={stemW}
          fill="url(#therm-grad)"
          stroke="#2a2d3d"
          strokeWidth="1.2"
        />

        {/* Bulb */}
        <circle
          cx={bulbCX}
          cy={bulbCY}
          r={bulbR}
          fill={temperature != null ? bulbColor : "#141825"}
          stroke="#2a2d3d"
          strokeWidth="1.4"
        />
        <circle
          cx={bulbCX - 6}
          cy={bulbCY - 6}
          r={6}
          fill="rgba(255,255,255,0.13)"
        />

        {/* Tick marks — on the RIGHT of the stem, suppress label near mercury top */}
        {ticks.map((t) => {
          const y = tempToY(t);
          if (y < stemTop || y > stemBot) return null;
          const isMajor = t % (tickStep * 2) === 0;
          const isPure = Math.abs(t - pureTemperature) < 0.01;
          const isNew = temperature != null && Math.abs(t - newT) < 0.5;
          const tickLen = isMajor ? 12 : 7;
          // Suppress label if too close to the mercury top label (avoid overlap)
          const nearMercTop = temperature != null && Math.abs(y - mercTop) < 20;
          return (
            <g key={t}>
              <line
                x1={stemX + stemW}
                y1={y}
                x2={stemX + stemW + tickLen}
                y2={y}
                stroke={
                  isPure || isNew
                    ? "rgba(255,255,255,0.45)"
                    : "rgba(255,255,255,0.22)"
                }
                strokeWidth={isPure || isNew ? 1.2 : 0.8}
              />
              {isMajor && !nearMercTop && (
                <text
                  x={stemX + stemW + tickLen + 3}
                  y={y + 3.5}
                  fontFamily="IBM Plex Mono"
                  fontSize="8"
                  fill={
                    isPure || isNew
                      ? "rgba(255,255,255,0.45)"
                      : "rgba(255,255,255,0.25)"
                  }
                >
                  {t}°
                </text>
              )}
            </g>
          );
        })}

        {/* Pure temperature dashed reference */}
        {pureY >= stemTop && pureY <= stemBot && (
          <g>
            <text
              x={stemX - stemW - 28}
              y={pureY - 5}
              textAnchor="end"
              fontFamily="IBM Plex Mono"
              fontSize="7"
              fill="rgba(190, 252, 252, 0.45)"
            >
              {mode === "bpe" ? "BP" : "FP"}
            </text>
            <line
              x1={stemX - stemW - 14}
              y1={pureY}
              x2={stemX + stemW + 2}
              y2={pureY}
              stroke="rgba(190, 252, 252, 0.6)"
              strokeWidth="1"
              strokeDasharray="3 2"
            />
            <text
              x={stemX - stemW - 17}
              y={pureY + 3.5}
              textAnchor="end"
              fontFamily="IBM Plex Mono"
              fontSize="10"
              fill="rgba(190, 252, 252, 0.6)"
            >
              {pureTemperature}°
            </text>
          </g>
        )}

        {/* New temperature label — LEFT of stem so it never clips */}
        <AnimatePresence>
          {temperature != null && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.text
                x={stemX - stemW - 24}
                y={mercTop - 5}
                textAnchor="end"
                fontFamily="IBM Plex Mono"
                fontSize="7"
                fontWeight="600"
                fill={mercColor}
              >
                {mode === "bpe" ? "New BP" : "New FP"}
              </motion.text>
              <motion.line
                x1={stemX - stemW - 3}
                y1={mercTop}
                x2={stemX - stemW - 14}
                y2={mercTop}
                stroke={mercColor}
                strokeWidth="1.2"
              />
              <motion.text
                x={stemX - stemW - 16}
                y={mercTop + 3.5}
                textAnchor="end"
                fontFamily="IBM Plex Mono"
                fontSize="9"
                fontWeight="600"
                fill={mercColor}
              >
                {newT.toFixed(1)}°C
              </motion.text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}
