import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Moles Example ─────────────────────────────────────────────────────────────
// Concept: divide total mass into molar-mass-sized portions; count the portions.
// Example: 54.06 g NaCl  ÷  58.44 g/mol  =  3 mol

const MOLES_EX = { label: "NaCl", M: 58.44, n: 3 };
const MOLES_TOTAL = MOLES_EX.n * MOLES_EX.M; // 54.06

// 15 particles on the pan — 5 per mole.
// slice(0, visibleCount) — particles at lower indices stay on the pan longest.
const PAN_POS: [number, number][] = [
  [-20, -2],
  [-12, -2],
  [-4, -2],
  [4, -2],
  [12, -2],
  [-16, -7],
  [-8, -7],
  [0, -7],
  [8, -7],
  [16, -7],
  [-12, -12],
  [-4, -12],
  [4, -12],
  [12, -12],
  [20, -12],
];

const MOLES_STEPS = [
  `${MOLES_TOTAL} g of ${MOLES_EX.label} on the balance`,
  `Remove 1 molar mass (${MOLES_EX.M} g) — that's 1 mol`,
  `Remove another ${MOLES_EX.M} g — 2 mol accounted for`,
  `Last ${MOLES_EX.M} g removed — n = ${MOLES_EX.n} mol total`,
];

export function MolesExample() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  function start() {
    setStep(0);
    setRunning(true);
  }

  useEffect(() => {
    const t = setTimeout(start, 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (step >= MOLES_EX.n) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1400);
    return () => clearTimeout(t);
  }, [running, step]);

  const remaining = Math.max(0, MOLES_TOTAL - step * MOLES_EX.M);
  const visParticles = (MOLES_EX.n - step) * 5;

  // SVG layout
  const panCX = 90,
    panCY = 116;
  const balX = 22,
    balY = 148,
    balW = 144,
    balH = 54;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <svg
        viewBox="0 0 290 232"
        className="w-full max-w-xs select-none"
        style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.5))" }}
      >
        {/* ── Pan support ── */}
        <rect
          x={panCX - 13}
          y={balY - 18}
          width={26}
          height={20}
          rx="2"
          fill="#111420"
          stroke="#1c1f2e"
          strokeWidth="0.5"
        />

        {/* ── Pan ── */}
        <ellipse
          cx={panCX}
          cy={panCY + 10}
          rx={54}
          ry={8}
          fill="#111520"
          stroke="#2a2d3d"
          strokeWidth="1.5"
        />
        <ellipse
          cx={panCX}
          cy={panCY + 8}
          rx={22}
          ry={4}
          fill="#1e2130"
          opacity="0.4"
        />
        {/* Pan glow when loaded */}
        <motion.ellipse
          cx={panCX}
          cy={panCY + 10}
          rx={54}
          ry={8}
          fill="none"
          stroke="#4fffc8"
          strokeWidth="0.5"
          animate={{ opacity: visParticles > 0 ? 0.18 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* ── Particles on pan ── */}
        <AnimatePresence>
          {PAN_POS.slice(0, visParticles).map(([dx, dy], i) => (
            <motion.circle
              key={i}
              cx={panCX + dx}
              cy={panCY + dy}
              r={2.3}
              fill="var(--c-transition)"
              opacity={0.88}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.88, scale: 1 }}
              exit={{ opacity: 0, scale: 0, transition: { duration: 0.28 } }}
            />
          ))}
        </AnimatePresence>

        {/* Compound label above pan */}
        <text
          x={panCX}
          y={panCY - 16}
          textAnchor="middle"
          fontFamily="IBM Plex Mono"
          fontSize="10"
          fill="var(--c-transition)"
          opacity="0.65"
        >
          {MOLES_EX.label}
        </text>

        {/* ── Balance body ── */}
        <rect
          x={balX}
          y={balY}
          width={balW}
          height={balH}
          rx="5"
          fill="#141620"
          stroke="#1c1f2e"
          strokeWidth="1"
        />
        <rect
          x={balX}
          y={balY}
          width={balW}
          height={3}
          rx="2"
          fill="#2a2d3d"
          opacity="0.5"
        />

        {/* LCD */}
        <rect
          x={balX + 20}
          y={balY + 9}
          width={92}
          height={36}
          rx="3"
          fill="#050608"
          stroke="#1a1d28"
          strokeWidth="1"
        />
        {Array.from({ length: 7 }, (_, i) => (
          <line
            key={i}
            x1={balX + 12}
            y1={balY + 13 + i * 4}
            x2={balX + 100}
            y2={balY + 13 + i * 4}
            stroke="#0d0f14"
            strokeWidth="0.5"
          />
        ))}
        <text
          x={balX + 97}
          y={balY + 32}
          textAnchor="end"
          fontFamily="IBM Plex Mono"
          fontSize="15"
          letterSpacing="-0.5"
          fill="#4fffc8"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {remaining.toFixed(2)}
        </text>
        <text
          x={balX + 101}
          y={balY + 32}
          fontFamily="IBM Plex Mono"
          fontSize="8"
          fill="#2a7a5a"
        >
          g
        </text>
        <text
          x={balX + 97}
          y={balY + 43}
          textAnchor="end"
          fontFamily="IBM Plex Mono"
          fontSize="7"
          fill="#1a4a3a"
        >
          {remaining > 0.005 ? "STABLE" : "EMPTY"}
        </text>

        {/* Status LED */}
        <circle
          cx={balX + balW - 14}
          cy={balY + balH - 11}
          r="4"
          fill={remaining > 0.005 ? "#4fffc8" : "#1c1f2e"}
          style={{
            filter: remaining > 0.005 ? "drop-shadow(0 0 4px #4fffc8)" : "none",
          }}
        />

        {/* ── Mole tokens ── */}
        {Array.from({ length: step }, (_, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.38 }}
          >
            <rect
              x={182}
              y={30 + i * 64}
              width={108}
              height={48}
              rx="5"
              fill="color-mix(in srgb, var(--c-halogen) 12%, #141620)"
              stroke="color-mix(in srgb, var(--c-halogen) 30%, transparent)"
              strokeWidth="1"
            />
            {/* mol label small */}
            <text
              x={196}
              y={55 + i * 64}
              textAnchor="middle"
              fontFamily="IBM Plex Mono"
              fontSize="8"
              fill="var(--c-halogen)"
              opacity="0.55"
            >
              mol {i + 1}
            </text>
            {/* 1 mol large */}
            <text
              x={234}
              y={52 + i * 64}
              textAnchor="middle"
              fontFamily="IBM Plex Mono"
              fontSize="13"
              fill="var(--c-halogen)"
              fontWeight="600"
            >
              1 mol
            </text>
            {/* mass */}
            <text
              x={234}
              y={67 + i * 64}
              textAnchor="middle"
              fontFamily="IBM Plex Mono"
              fontSize="8"
              fill="var(--c-transition)"
              opacity="0.7"
            >
              {MOLES_EX.M} g
            </text>
          </motion.g>
        ))}

        {/* ── Result ── */}
        <AnimatePresence>
          {step === MOLES_EX.n && (
            <motion.g
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <text
                x={145}
                y={222}
                textAnchor="middle"
                fontFamily="IBM Plex Mono"
                fontSize="13"
                fill="var(--c-halogen)"
                fontWeight="600"
              >
                n = {MOLES_EX.n} mol ✓
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* Step caption */}
      <p className="font-mono text-[11px] text-secondary text-center px-4 min-h-[18px]">
        {MOLES_STEPS[step] ?? ""}
      </p>

      <button
        onClick={start}
        className="font-mono text-[11px] text-dim hover:text-secondary transition-colors"
      >
        ↺ Replay
      </button>
    </div>
  );
}

// ── Molarity Example ─────────────────────────────────────────────────────────
// Concept: n moles of solute dissolved in V litres of solution.
// Example: 2 mol NaCl  in  1.0 L  →  C = 2.0 mol/L

const MOL_EX = { solute: "NaCl", n: 2, V: 1.0 };
const MOL_C = MOL_EX.n / MOL_EX.V; // 2.0

const MOL_STEPS = [
  `Measure ${MOL_EX.V} L of solution in a volumetric flask`,
  `Dissolve ${MOL_EX.n} mol of ${MOL_EX.solute} in the solvent`,
  `Bring to the ${MOL_EX.V} L mark with additional solvent`,
  `C = ${MOL_EX.n} mol ÷ ${MOL_EX.V} L = ${MOL_C.toFixed(1)} mol/L`,
];

// Fixed particle positions (relative to beaker center cx, bottom bBotY)
const MOL_PARTICLES: [number, number][] = [
  [0, -28],
  [18, -48],
  [-18, -58],
  [30, -20],
  [-30, -38],
  [8, -70],
  [-8, -18],
  [42, -44],
  [-42, -52],
  [50, -28],
  [-50, -34],
  [24, -80],
  [-24, -68],
  [14, -54],
  [-14, -34],
  [36, -62],
  [-36, -24],
  [46, -16],
  [-46, -60],
  [2, -90],
];

export function MolarityExample() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  function start() {
    setStep(0);
    setRunning(true);
  }
  useEffect(() => {
    const t = setTimeout(start, 500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!running) return;
    if (step >= 3) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1200);
    return () => clearTimeout(t);
  }, [running, step]);

  // Beaker geometry
  const cx = 108;
  const bTopY = 44,
    bBotY = 185,
    bH = bBotY - bTopY;
  const hw = 74; // outer half-width

  // Liquid fills from step 0 → 1
  const fillFrac = step >= 1 ? 0.84 : 0;
  const liqTopY = bBotY - fillFrac * bH;

  const particlesVisible = step >= 2;
  const pCount = step >= 2 ? MOL_PARTICLES.length : 0;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <svg
        viewBox="0 0 240 215"
        className="w-full max-w-[220px] select-none"
        style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.5))" }}
      >
        {/* ── Liquid fill ── */}
        <defs>
          <clipPath id="beakerClip-mol">
            <rect x={cx - hw + 4} y={bTopY} width={(hw - 4) * 2} height={bH} />
          </clipPath>
          <linearGradient id="liqGradMol" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(70,120,255,0.25)" />
            <stop offset="100%" stopColor="rgba(70,120,255,0.35)" />
          </linearGradient>
        </defs>

        <motion.rect
          x={cx - hw + 4}
          width={(hw - 4) * 2}
          y={bBotY}
          height={0}
          fill="url(#liqGradMol)"
          clipPath="url(#beakerClip-mol)"
          animate={{ y: liqTopY, height: fillFrac > 0 ? bBotY - liqTopY : 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />

        {/* Liquid surface shimmer */}
        {fillFrac > 0 && (
          <motion.line
            x1={cx - hw + 4}
            y1={bBotY}
            x2={cx + hw - 4}
            y2={bBotY}
            stroke="rgba(100,150,255,0.5)"
            strokeWidth="1.5"
            animate={{ y1: liqTopY, y2: liqTopY }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        )}

        {/* ── Solute particles ── */}
        <AnimatePresence>
          {particlesVisible &&
            MOL_PARTICLES.slice(0, pCount).map(([dx, dy], i) => (
              <motion.circle
                key={i}
                cx={cx + dx}
                cy={bBotY + dy}
                r={3}
                fill="var(--c-halogen)"
                opacity={0.72}
                initial={{ opacity: 0, scale: 0, cy: bTopY - 10 }}
                animate={{ opacity: 0.72, scale: 1, cy: bBotY + dy }}
                transition={{
                  delay: i * 0.055,
                  type: "spring",
                  stiffness: 160,
                  damping: 13,
                }}
              />
            ))}
        </AnimatePresence>

        {/* ── Beaker glass outline ── */}
        {/* Left wall */}
        <line
          x1={cx - hw}
          y1={bTopY}
          x2={cx - hw}
          y2={bBotY}
          stroke="#242840"
          strokeWidth="5"
          strokeLinecap="square"
        />
        {/* Right wall */}
        <line
          x1={cx + hw}
          y1={bTopY}
          x2={cx + hw}
          y2={bBotY}
          stroke="#242840"
          strokeWidth="5"
          strokeLinecap="square"
        />
        {/* Bottom */}
        <line
          x1={cx - hw}
          y1={bBotY}
          x2={cx + hw}
          y2={bBotY}
          stroke="#242840"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Rim */}
        <line
          x1={cx - hw}
          y1={bTopY}
          x2={cx + hw - 2}
          y2={bTopY}
          stroke="#242840"
          strokeWidth="4"
        />
        {/* Pour spout */}
        <path
          d={`M ${cx + hw - 2} ${bTopY} L ${cx + hw + 20} ${bTopY - 16}`}
          stroke="#242840"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* ── Volume line ── */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <line
                x1={cx + hw - 6}
                y1={liqTopY}
                x2={cx + hw + 14}
                y2={liqTopY}
                stroke="#4080ff"
                strokeWidth="1.5"
              />
              <text
                x={cx + hw + 18}
                y={liqTopY + 4}
                fontFamily="IBM Plex Mono"
                fontSize="9"
                fill="#5090ff"
              >
                {MOL_EX.V} L
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* n mol label inside beaker when particles visible */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.text
              x={cx}
              y={liqTopY + 22}
              textAnchor="middle"
              fontFamily="IBM Plex Mono"
              fontSize="10"
              fill="var(--c-halogen)"
              opacity={0.8}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
            >
              {MOL_EX.n} mol {MOL_EX.solute}
            </motion.text>
          )}
        </AnimatePresence>

        {/* ── Result ── */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.g
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <text
                x={cx}
                y={206}
                textAnchor="middle"
                fontFamily="IBM Plex Mono"
                fontSize="13"
                fill="var(--c-halogen)"
                fontWeight="600"
              >
                C = {MOL_C.toFixed(1)} mol/L ✓
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      <p className="font-mono text-[11px] text-secondary text-center px-4 min-h-[18px]">
        {MOL_STEPS[step] ?? ""}
      </p>

      <button
        onClick={start}
        className="font-mono text-[11px] text-dim hover:text-secondary transition-colors"
      >
        ↺ Replay
      </button>
    </div>
  );
}

// ── Molality Example ──────────────────────────────────────────────────────────
// Concept: n moles of solute per kg of SOLVENT (not per litre of solution).
// Key distinction: the denominator is the mass of solvent only.
// Example: 0.5 mol NaCl in 250 g water  →  b = 2.0 mol/kg

const MOLAL_EX = { solute: "NaCl", solvent: "H₂O", n: 0.5, solventG: 250 };
const MOLAL_B = MOLAL_EX.n / (MOLAL_EX.solventG / 1000); // 2.0

const MOLAL_STEPS = [
  `Weigh out ${MOLAL_EX.solventG} g (${MOLAL_EX.solventG / 1000} kg) of ${MOLAL_EX.solvent} solvent`,
  `Dissolve ${MOLAL_EX.n} mol ${MOLAL_EX.solute} directly into the weighed solvent`,
  `b = n ÷ m_solvent = ${MOLAL_EX.n} mol ÷ ${MOLAL_EX.solventG / 1000} kg = ${MOLAL_B.toFixed(1)} mol/kg`,
];

const MOLAL_PARTICLES: [number, number][] = [
  [0, -22],
  [14, -40],
  [-14, -52],
  [24, -16],
  [-24, -32],
  [6, -60],
  [-6, -14],
  [34, -38],
  [-34, -44],
  [30, -22],
  [-30, -28],
];

export function MolalityExample() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  function start() {
    setStep(0);
    setRunning(true);
  }
  useEffect(() => {
    const t = setTimeout(start, 500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!running) return;
    if (step >= 2) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1400);
    return () => clearTimeout(t);
  }, [running, step]);

  // Left: balance showing solvent mass
  // Right: beaker with solvent (and later solute particles)
  const balX = -10,
    balY = 120,
    balW = 110,
    balH = 44;
  const panCX = 35,
    panCY = 100;

  // Beaker geometry (right side)
  const bcx = 178;
  const bTopY = 48,
    bBotY = 172,
    bH = bBotY - bTopY;
  const hw = 54;
  const fillFrac = step >= 0 ? 0.76 : 0;
  const liqTopY = bBotY - fillFrac * bH;
  const particlesVisible = step >= 1;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <svg
        viewBox="-20 0 270 210"
        className="w-full max-w-[260px] select-none"
        style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.5))" }}
      >
        {/* ── LEFT: Balance for solvent mass ── */}

        {/* Pan support */}
        <rect
          x={panCX - 11}
          y={balY - 12}
          width={22}
          height={14}
          rx="2"
          fill="#111420"
          stroke="#1c1f2e"
          strokeWidth="0.5"
        />

        {/* Pan */}
        <ellipse
          cx={panCX}
          cy={panCY}
          rx={40}
          ry={6}
          fill="#111520"
          stroke="#2a2d3d"
          strokeWidth="1.2"
        />
        <ellipse
          cx={panCX - 8}
          cy={panCY - 1}
          rx={16}
          ry={3}
          fill="#1e2130"
          opacity="0.4"
        />

        {/* Water "blob" on pan — represents solvent */}
        <AnimatePresence>
          {step >= 0 && (
            <motion.ellipse
              cx={panCX}
              cy={panCY - 2}
              rx={28}
              ry={5}
              fill="rgba(80,130,220,0.45)"
              stroke="rgba(100,150,255,0.5)"
              strokeWidth="0.8"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        {/* Solvent label above pan */}
        <text
          x={panCX}
          y={panCY - 14}
          textAnchor="middle"
          fontFamily="IBM Plex Mono"
          fontSize="9"
          fill="rgba(100,160,255,0.7)"
        >
          {MOLAL_EX.solvent}
        </text>

        {/* Balance body */}
        <rect
          x={balX}
          y={balY}
          width={balW}
          height={balH}
          rx="4"
          fill="#141620"
          stroke="#1c1f2e"
          strokeWidth="1"
        />
        <rect
          x={balX}
          y={balY}
          width={balW}
          height={3}
          rx="2"
          fill="#2a2d3d"
          opacity="0.5"
        />

        {/* LCD */}
        <rect
          x={balX + 8}
          y={balY + 7}
          width={70}
          height={30}
          rx="3"
          fill="#050608"
          stroke="#1a1d28"
          strokeWidth="1"
        />
        {Array.from({ length: 6 }, (_, i) => (
          <line
            key={i}
            x1={balX + 10}
            y1={balY + 11 + i * 4}
            x2={balX + 76}
            y2={balY + 11 + i * 4}
            stroke="#0d0f14"
            strokeWidth="0.5"
          />
        ))}
        <text
          x={balX + 73}
          y={balY + 27}
          textAnchor="end"
          fontFamily="IBM Plex Mono"
          fontSize="12"
          letterSpacing="-0.5"
          fill="#4fffc8"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {MOLAL_EX.solventG.toFixed(1)}
        </text>
        <text
          x={balX + 76}
          y={balY + 27}
          fontFamily="IBM Plex Mono"
          fontSize="7"
          fill="#2a7a5a"
        >
          g
        </text>
        <text
          x={balX + 73}
          y={balY + 36}
          textAnchor="end"
          fontFamily="IBM Plex Mono"
          fontSize="6"
          fill="#1a4a3a"
        >
          STABLE
        </text>

        {/* "Solvent mass" label under balance */}
        <text
          x={balX + balW / 2}
          y={balY + balH + 12}
          textAnchor="middle"
          fontFamily="IBM Plex Mono"
          fontSize="8"
          fill="rgba(255,255,255,0.35)"
        >
          solvent mass
        </text>

        {/* Arrow from balance to beaker */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 1 ? 0.5 : 0 }}
        >
          <line
            x1={balX + balW + 4}
            y1={balY + balH / 2}
            x2={bcx - hw - 6}
            y2={(bTopY + bBotY) / 2}
            stroke="#888"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <text
            x={(balX + balW + bcx - hw) / 2 + 2}
            y={balY + balH / 2 - 6}
            textAnchor="middle"
            fontFamily="IBM Plex Mono"
            fontSize="8"
            fill="#888"
          >
            dissolve in
          </text>
        </motion.g>

        {/* ── RIGHT: Beaker ── */}
        <defs>
          <clipPath id="beakerClip-molal">
            <rect x={bcx - hw + 4} y={bTopY} width={(hw - 4) * 2} height={bH} />
          </clipPath>
          <linearGradient id="liqGradMolal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(70,120,255,0.22)" />
            <stop offset="100%" stopColor="rgba(70,120,255,0.32)" />
          </linearGradient>
        </defs>

        <rect
          x={bcx - hw + 4}
          width={(hw - 4) * 2}
          y={liqTopY}
          height={fillFrac > 0 ? bBotY - liqTopY : 0}
          fill="url(#liqGradMolal)"
          clipPath="url(#beakerClip-molal)"
        />

        {/* Liquid surface */}
        {fillFrac > 0 && (
          <line
            x1={bcx - hw + 4}
            y1={liqTopY}
            x2={bcx + hw - 4}
            y2={liqTopY}
            stroke="rgba(100,150,255,0.45)"
            strokeWidth="1.2"
          />
        )}

        {/* Solute particles */}
        <AnimatePresence>
          {particlesVisible &&
            MOLAL_PARTICLES.map(([dx, dy], i) => (
              <motion.circle
                key={i}
                cx={bcx + dx}
                cy={bBotY + dy}
                r={2.5}
                fill="var(--c-halogen)"
                opacity={0.72}
                initial={{ opacity: 0, scale: 0, cy: bTopY - 8 }}
                animate={{ opacity: 0.72, scale: 1, cy: bBotY + dy }}
                transition={{
                  delay: i * 0.07,
                  type: "spring",
                  stiffness: 155,
                  damping: 14,
                }}
              />
            ))}
        </AnimatePresence>

        {/* Beaker walls */}
        <line
          x1={bcx - hw}
          y1={bTopY}
          x2={bcx - hw}
          y2={bBotY}
          stroke="#242840"
          strokeWidth="4"
          strokeLinecap="square"
        />
        <line
          x1={bcx + hw}
          y1={bTopY}
          x2={bcx + hw}
          y2={bBotY}
          stroke="#242840"
          strokeWidth="4"
          strokeLinecap="square"
        />
        <line
          x1={bcx - hw}
          y1={bBotY}
          x2={bcx + hw}
          y2={bBotY}
          stroke="#242840"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1={bcx - hw}
          y1={bTopY}
          x2={bcx + hw - 2}
          y2={bTopY}
          stroke="#242840"
          strokeWidth="3.5"
        />
        <path
          d={`M ${bcx + hw - 2} ${bTopY} L ${bcx + hw + 16} ${bTopY - 12}`}
          stroke="#242840"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Solvent mass label on beaker */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.text
              x={bcx}
              y={liqTopY + 16}
              textAnchor="middle"
              fontFamily="IBM Plex Mono"
              fontSize="8"
              fill="rgba(100,160,255,0.7)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {MOLAL_EX.solventG}g H₂O
            </motion.text>
          )}
        </AnimatePresence>

        {/* n mol label */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.text
              x={bcx}
              y={liqTopY + 32}
              textAnchor="middle"
              fontFamily="IBM Plex Mono"
              fontSize="8"
              fill="var(--c-halogen)"
              opacity={0.7}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
            >
              {MOLAL_EX.n} mol {MOLAL_EX.solute}
            </motion.text>
          )}
        </AnimatePresence>

        {/* ── Result ── */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.g
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <text
                x={125}
                y={200}
                textAnchor="middle"
                fontFamily="IBM Plex Mono"
                fontSize="12"
                fill="var(--c-halogen)"
                fontWeight="600"
              >
                b = {MOLAL_B.toFixed(1)} mol/kg ✓
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      <p className="font-mono text-[11px] text-secondary text-center px-4 min-h-[18px]">
        {MOLAL_STEPS[Math.min(step, MOLAL_STEPS.length - 1)] ?? ""}
      </p>

      <button
        onClick={start}
        className="font-mono text-[11px] text-dim hover:text-secondary transition-colors"
      >
        ↺ Replay
      </button>
    </div>
  );
}

// ── Concentration (Dilution) Example ─────────────────────────────────────────
// Concept: dilution — same moles, more volume → lower concentration
// C₁V₁ = C₂V₂: moles are conserved
// Example: 2.0 mol/L × 0.5 L → add 0.5 L water → 1.0 mol/L × 1.0 L

const CONC_EX = { C1: 2.0, V1: 0.5, V2: 1.0, n: 1.0 };
const CONC_C2 = (CONC_EX.C1 * CONC_EX.V1) / CONC_EX.V2; // 1.0

const CONC_STEPS = [
  `${CONC_EX.C1} mol/L — ${CONC_EX.V1} L of concentrated solution`,
  `Add ${(CONC_EX.V2 - CONC_EX.V1).toFixed(1)} L water — same moles, more volume`,
  `C₁V₁ = C₂V₂: ${CONC_EX.C1}×${CONC_EX.V1} = ${CONC_C2.toFixed(1)}×${CONC_EX.V2}`,
];

// [initialDx, initialDy, finalDx, finalDy] — offsets from (cx, bBotY)
// Initial: 12 particles dense in lower 50% of beaker
// Final:   same particles spread across full 87% fill
const CONC_PARTICLES: [number, number, number, number][] = [
  [  0, -12,   2, -22],
  [ 16, -28,  20, -58],
  [-16, -44, -22, -90],
  [ 30, -10,  34, -16],
  [-30, -20, -34, -42],
  [  8, -58,   8,-106],
  [ -8,  -8,  -8, -16],
  [ 40, -36,  42, -68],
  [-40, -46, -44, -78],
  [ 24, -16,  28, -32],
  [-24, -50, -26,-114],
  [ 12, -34,  14, -50],
];

export function ConcentrationExample() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  function start() {
    setStep(0);
    setRunning(true);
  }
  useEffect(() => {
    const t = setTimeout(start, 500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!running) return;
    if (step >= 2) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1400);
    return () => clearTimeout(t);
  }, [running, step]);

  const cx = 110;
  const bTopY = 38, bBotY = 178, bH = bBotY - bTopY; // 140
  const hw = 58;

  // liqTopY1 = 50% fill (V1=0.5L),  liqTopY2 = 87% fill (V2=1.0L)
  const liqTopY1 = bBotY - 0.50 * bH; // 108
  const liqTopY2 = Math.round(bBotY - 0.87 * bH); // 56
  const liqTopY = step >= 1 ? liqTopY2 : liqTopY1;
  const diluted = step >= 1;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <svg
        viewBox="0 0 220 220"
        className="w-full max-w-[220px] select-none"
        style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.5))" }}
      >
        <defs>
          <clipPath id="beakerClip-conc">
            <rect x={cx - hw + 4} y={bTopY} width={(hw - 4) * 2} height={bH} />
          </clipPath>
          <linearGradient id="liqGradConc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(70,120,255,0.25)" />
            <stop offset="100%" stopColor="rgba(70,120,255,0.35)" />
          </linearGradient>
        </defs>

        {/* ── Liquid fill ── */}
        <motion.rect
          x={cx - hw + 4}
          width={(hw - 4) * 2}
          animate={{ y: liqTopY, height: bBotY - liqTopY }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          fill="url(#liqGradConc)"
          clipPath="url(#beakerClip-conc)"
        />

        {/* Liquid surface shimmer */}
        <motion.line
          x1={cx - hw + 4}
          y1={liqTopY1}
          x2={cx + hw - 4}
          y2={liqTopY1}
          animate={{ y1: liqTopY, y2: liqTopY }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          stroke="rgba(100,150,255,0.45)"
          strokeWidth="1.2"
        />

        {/* ── Particles (animate from dense → spread) ── */}
        {CONC_PARTICLES.map(([ix, iy, fx, fy], i) => (
          <motion.circle
            key={i}
            r={2.5}
            fill="var(--c-halogen)"
            initial={{ cx: cx + ix, cy: bBotY + iy, opacity: 0.82 }}
            animate={{
              cx: cx + (diluted ? fx : ix),
              cy: bBotY + (diluted ? fy : iy),
              opacity: diluted ? 0.48 : 0.82,
            }}
            transition={{ duration: 0.8, delay: i * 0.04, ease: "easeInOut" }}
          />
        ))}

        {/* ── Concentration label ── */}
        <AnimatePresence mode="wait">
          <motion.text
            key={diluted ? "c-dil" : "c-init"}
            x={cx}
            y={26}
            textAnchor="middle"
            fontFamily="IBM Plex Mono"
            fontSize="13"
            fontWeight="600"
            fill={diluted ? "rgba(140,190,255,0.9)" : "var(--c-halogen)"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {`C = ${diluted ? CONC_C2.toFixed(1) : CONC_EX.C1.toFixed(1)} mol/L`}
          </motion.text>
        </AnimatePresence>

        {/* ── Moles conserved label ── */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.text
              x={cx}
              y={liqTopY2 + 18}
              textAnchor="middle"
              fontFamily="IBM Plex Mono"
              fontSize="8"
              fill="var(--c-halogen)"
              opacity={0.55}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
            >
              n = {CONC_EX.n} mol
            </motion.text>
          )}
        </AnimatePresence>

        {/* ── Volume marker (translates with fill level) ── */}
        <motion.g
          animate={{ y: liqTopY - liqTopY1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <line
            x1={cx + hw - 6}
            y1={liqTopY1}
            x2={cx + hw + 14}
            y2={liqTopY1}
            stroke="#4080ff"
            strokeWidth="1.5"
          />
          <text
            x={cx + hw + 18}
            y={liqTopY1 + 4}
            fontFamily="IBM Plex Mono"
            fontSize="9"
            fill="#5090ff"
          >
            {step >= 1 ? `${CONC_EX.V2} L` : `${CONC_EX.V1} L`}
          </text>
        </motion.g>

        {/* ── Beaker glass ── */}
        <line x1={cx - hw} y1={bTopY} x2={cx - hw} y2={bBotY} stroke="#242840" strokeWidth="5" strokeLinecap="square" />
        <line x1={cx + hw} y1={bTopY} x2={cx + hw} y2={bBotY} stroke="#242840" strokeWidth="5" strokeLinecap="square" />
        <line x1={cx - hw} y1={bBotY} x2={cx + hw} y2={bBotY} stroke="#242840" strokeWidth="5" strokeLinecap="round" />
        <line x1={cx - hw} y1={bTopY} x2={cx + hw - 2} y2={bTopY} stroke="#242840" strokeWidth="4" />
        <path
          d={`M ${cx + hw - 2} ${bTopY} L ${cx + hw + 20} ${bTopY - 16}`}
          stroke="#242840"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* ── Result ── */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.g
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <text
                x={cx}
                y={210}
                textAnchor="middle"
                fontFamily="IBM Plex Mono"
                fontSize="12"
                fill="var(--c-halogen)"
                fontWeight="600"
              >
                C₁V₁ = C₂V₂ ✓
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      <p className="font-mono text-[11px] text-secondary text-center px-4 min-h-[18px]">
        {CONC_STEPS[Math.min(step, CONC_STEPS.length - 1)] ?? ""}
      </p>

      <button
        onClick={start}
        className="font-mono text-[11px] text-dim hover:text-secondary transition-colors"
      >
        ↺ Replay
      </button>
    </div>
  );
}
