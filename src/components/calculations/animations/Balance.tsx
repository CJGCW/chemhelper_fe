import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Props {
  massOnScale: number | null;
  massDisplayValue: string;
  massUnitLabel: string;
  formula: string;
  calculating: boolean;
  onCalcComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  delay: number;
  size: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 15 + Math.random() * 70,
    delay: i * 0.06,
    size: 1.8 + Math.random() * 2.2,
  }));
}

function formatDisplay(raw: string): string {
  const n = parseFloat(raw);
  if (isNaN(n)) return "0.000";
  if (n >= 1000) return n.toFixed(1);
  if (n >= 100) return n.toFixed(2);
  if (n >= 1) return n.toFixed(3);
  if (n >= 0.01) return n.toFixed(4);
  return n.toExponential(2);
}

// 3-D offset for the isometric body
const DX = 16;
const DY = -11;

export default function Balance({
  massOnScale,
  massDisplayValue,
  massUnitLabel,
  formula,
  calculating,
  onCalcComplete,
}: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stage, setStage] = useState<"idle" | "placed" | "counting" | "done">(
    "idle",
  );
  const [displayValue, setDisplayValue] = useState("0.000");
  const countIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const particleCount = massOnScale
    ? Math.min(Math.max(Math.round(massOnScale / 4) + 5, 6), 30)
    : 0;

  useEffect(() => {
    if (massOnScale === null || !massDisplayValue) {
      setStage("idle");
      setParticles([]);
      setDisplayValue("0.000");
      return;
    }
    setParticles(generateParticles(particleCount));
    setStage("placed");
    setDisplayValue(formatDisplay(massDisplayValue));
  }, [massOnScale, massDisplayValue]);

  useEffect(() => {
    if (!calculating || massOnScale === null) return;
    setStage("counting");
    setDisplayValue("- - - -");
    const target = parseFloat(massDisplayValue);
    if (isNaN(target)) return;
    const steps = 32;
    let current = 0;
    const t = setTimeout(() => {
      countIntervalRef.current = setInterval(() => {
        current += target / steps;
        if (current >= target) {
          current = target;
          clearInterval(countIntervalRef.current!);
          setDisplayValue(formatDisplay(massDisplayValue));
          setStage("done");
          setTimeout(() => onCalcComplete?.(), 350);
        } else {
          setDisplayValue(formatDisplay(current.toString()));
        }
      }, 900 / steps);
    }, 180);
    return () => {
      clearTimeout(t);
      if (countIntervalRef.current) clearInterval(countIntervalRef.current);
    };
  }, [calculating, massDisplayValue]);

  const hasParticles = stage !== "idle" && particles.length > 0;
  const displayLit = stage !== "idle";

  // --- Layout constants ---
  // Front face of the body
  const fx = 18,
    fy = 150,
    fw = 252,
    fh = 72;
  // Top face (parallelogram offset by DX, DY)
  const topPts = `${fx},${fy} ${fx + fw},${fy} ${fx + fw + DX},${fy + DY} ${fx + DX},${fy + DY}`;
  // Right face
  const rfPts = `${fx + fw},${fy} ${fx + fw},${fy + fh} ${fx + fw + DX},${fy + fh + DY} ${fx + fw + DX},${fy + DY}`;
  // Pan platform center on top face
  const panCX = fx + fw * 0.42;
  const panCY = fy + DY - 4; // sits on top face

  return (
    <div className="flex flex-col items-center gap-3 select-none w-full">
      <svg
        viewBox="0 0 310 235"
        className=" max-w-md"
        style={{ filter: "drop-shadow(0 6px 28px rgba(0,0,0,0.55))" }}
      >
        {/* ── RIGHT FACE (darkest — shadow side) ── */}
        <polygon
          points={rfPts}
          fill="#090b0f"
          stroke="rgb(var(--color-border))"
          strokeWidth="0.8"
        />

        {/* ── FRONT FACE ── */}
        <rect
          x={fx}
          y={fy}
          width={fw}
          height={fh}
          rx="7"
          fill="rgb(var(--color-raised))"
          stroke="rgb(var(--color-border))"
          strokeWidth="1"
        />
        {/* Subtle gradient overlay for depth */}
        <defs>
          <linearGradient id="frontGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--color-border))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="rgb(var(--color-base))" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient
            id="panGrad"
            cx="50%"
            cy="40%"
            r="50%"
            fx="35%"
            fy="35%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="rgb(var(--color-muted))" />
            <stop offset="100%" stopColor="rgb(var(--color-surface))" />
          </linearGradient>
          <radialGradient
            id="panSheen"
            cx="38%"
            cy="36%"
            r="55%"
            fx="38%"
            fy="36%"
          >
            <stop offset="0%" stopColor="#2a3040" />
            <stop offset="60%" stopColor="#111520" />
            <stop offset="100%" stopColor="rgb(var(--color-base))" />
          </radialGradient>
        </defs>
        <rect
          x={fx}
          y={fy}
          width={fw}
          height={fh}
          rx="7"
          fill="url(#frontGrad)"
        />

        {/* Front face edge highlight (top rim) */}
        <rect
          x={fx}
          y={fy}
          width={fw}
          height="3"
          rx="2"
          fill="rgb(var(--color-muted))"
          opacity="0.5"
        />

        {/* ── DISPLAY PANEL ── */}
        <rect
          x={fx + 12}
          y={fy + 10}
          width="162"
          height="46"
          rx="4"
          fill="#050608"
          stroke="#1a1d28"
          strokeWidth="1"
        />
        {/* LCD scanlines */}
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={i}
            x1={fx + 14}
            y1={fy + 14 + i * 4.5}
            x2={fx + 172}
            y2={fy + 14 + i * 4.5}
            stroke="#0d0f14"
            strokeWidth="0.5"
          />
        ))}
        {/* Mass readout */}
        <text
          x={fx + 163}
          y={fy + 32}
          textAnchor="end"
          fontFamily="IBM Plex Mono"
          fontSize="15"
          letterSpacing="-0.5"
          fill={displayLit ? "#4fffc8" : "#1a2020"}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {displayValue}
        </text>
        {/* Unit */}
        <text
          x={fx + 171}
          y={fy + 32}
          textAnchor="end"
          fontFamily="IBM Plex Mono"
          fontSize="8"
          fill={displayLit ? "#2a7a5a" : "#111"}
        >
          {massUnitLabel || "g"}
        </text>
        {/* Secondary line - stability indicator */}
        <text
          x={fx + 163}
          y={fy + 46}
          textAnchor="end"
          fontFamily="IBM Plex Mono"
          fontSize="7"
          fill={displayLit ? "#1a4a3a" : "rgb(var(--color-surface))"}
        >
          {displayLit
            ? stage === "counting"
              ? "WEIGHING"
              : "STABLE"
            : "STANDBY"}
        </text>

        {/* ── BUTTON GROUP (right side of front face) ── */}
        {[
          { label: "ON\nOFF", x: fx + 188, y: fy + 10 },
          { label: "TARE", x: fx + 216, y: fy + 10 },
          { label: "UNIT", x: fx + 188, y: fy + 32 },
          { label: "HOLD", x: fx + 216, y: fy + 32 },
        ].map((btn) => (
          <g key={btn.label}>
            <rect
              x={btn.x}
              y={btn.y}
              width="22"
              height="18"
              rx="3"
              fill="rgb(var(--color-surface))"
              stroke="rgb(var(--color-muted))"
              strokeWidth="0.8"
            />
            <text
              x={btn.x + 11}
              y={btn.y + 12}
              textAnchor="middle"
              fontFamily="IBM Plex Mono"
              fontSize="5"
              fill="#3a4050"
            >
              {btn.label.replace("\n", " ")}
            </text>
          </g>
        ))}
        {/* Status LED */}
        <circle
          cx={fx + fw - 14}
          cy={fy + fh - 12}
          r="4"
          fill={displayLit ? "#4fffc8" : "rgb(var(--color-border))"}
          style={{
            filter: displayLit ? "drop-shadow(0 0 4px #4fffc8)" : "none",
          }}
        />
        {/* Level bubble */}
        <circle
          cx={fx + fw - 14}
          cy={fy + fh - 26}
          r="4"
          fill="rgb(var(--color-surface))"
          stroke="rgb(var(--color-muted))"
          strokeWidth="0.8"
        />
        <circle
          cx={fx + fw - 14}
          cy={fy + fh - 26}
          r="2"
          fill="#4ade80"
          opacity="0.7"
        />

        {/* ── TOP FACE ── */}
        <polygon
          points={topPts}
          fill="#181b26"
          stroke="rgb(var(--color-muted))"
          strokeWidth="0.8"
        />
        {/* Top face highlight on front edge */}
        <line
          x1={fx}
          y1={fy}
          x2={fx + fw}
          y2={fy}
          stroke="rgb(var(--color-muted))"
          strokeWidth="1.5"
        />

        {/* ── PAN SUPPORT PILLARS (short, under pan) ── */}
        {[-22, 0, 22].map((ox, i) => (
          <ellipse
            key={i}
            cx={panCX + ox}
            cy={panCY + 4}
            rx="3"
            ry="2"
            fill="rgb(var(--color-surface))"
            stroke="rgb(var(--color-border))"
            strokeWidth="0.5"
          />
        ))}
        <rect
          x={panCX - 24}
          y={panCY + 2}
          width="48"
          height="8"
          rx="2"
          fill="#111420"
          stroke="rgb(var(--color-border))"
          strokeWidth="0.5"
        />

        {/* ── PAN (large circle on top) ── */}
        {/* Shadow under pan */}
        <ellipse
          cx={panCX}
          cy={panCY + 5}
          rx="76"
          ry="11"
          fill="rgba(0,0,0,0.5)"
        />
        {/* Pan body */}
        <ellipse
          cx={panCX}
          cy={panCY}
          rx="74"
          ry="10"
          fill="url(#panSheen)"
          stroke="rgb(var(--color-muted))"
          strokeWidth="1.5"
        />
        {/* Pan rim highlight */}
        <ellipse
          cx={panCX}
          cy={panCY}
          rx="74"
          ry="10"
          fill="none"
          stroke="#3a3f52"
          strokeWidth="1"
          opacity="0.6"
        />
        {/* Pan brushed metal sheen */}
        <ellipse
          cx={panCX - 12}
          cy={panCY - 2}
          rx="32"
          ry="5"
          fill="#242838"
          opacity="0.5"
        />
        <ellipse
          cx={panCX - 8}
          cy={panCY - 3}
          rx="16"
          ry="2.5"
          fill="#2e3345"
          opacity="0.4"
        />

        {/* ── PARTICLES on pan ── */}
        <AnimatePresence>
          {hasParticles &&
            particles.map((p) => (
              <motion.circle
                key={p.id}
                cx={panCX - 37 + (p.x / 100) * 74}
                cy={panCY - 2}
                r={p.size}
                fill="var(--c-transition)"
                opacity={0.9}
                initial={{ cy: panCY - 50, opacity: 0, scale: 0 }}
                animate={{ cy: panCY - 2, opacity: 0.9, scale: 1 }}
                transition={{
                  delay: p.delay,
                  type: "spring",
                  stiffness: 180,
                  damping: 16,
                }}
              />
            ))}
        </AnimatePresence>

        {/* Formula label above pan */}
        <AnimatePresence>
          {formula && hasParticles && (
            <motion.text
              x={panCX}
              y={panCY - 18}
              textAnchor="middle"
              fontFamily="IBM Plex Mono"
              fontSize="11"
              fill="var(--c-transition)"
              initial={{ opacity: 0, y: panCY - 5 }}
              animate={{ opacity: 1, y: panCY - 18 }}
              exit={{ opacity: 0 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
            >
              {formula}
            </motion.text>
          )}
        </AnimatePresence>

        {/* Pan depression when loaded */}
        <motion.ellipse
          cx={panCX}
          cy={panCY}
          rx="74"
          ry="10"
          fill="none"
          stroke="#4fffc8"
          strokeWidth="0.5"
          opacity="0"
          animate={{ opacity: hasParticles ? 0.15 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </svg>
    </div>
  );
}
