import { useState } from "react";
import { pick, randBetween, roundTo, sig } from './WorkedExample'
import { motion, AnimatePresence } from "framer-motion";
import NumberField from "./NumberField";
import UnitSelect, { MASS_UNITS } from "./UnitSelect";
import type { UnitOption } from "./UnitSelect";
import MassToMolesHelper from "./MassToMolesHelper";
import ResultDisplay from "./ResultDisplay";
import { useStepsPanelState, StepsTrigger, StepsContent } from "./StepsPanel";
import { SigFigTrigger, SigFigContent } from "./SigFigPanel";
import { sanitize, hasValue } from "../../utils/calcHelpers";

/** Format a raw number cleanly — no scientific notation, no trailing zeros */
function fmtRaw(n: number): string {
  const p = n.toPrecision(8)
  if (p.includes('e') || p.includes('E')) {
    // Fall back to fixed notation with enough decimals
    const decimals = Math.max(0, 8 - Math.floor(Math.log10(Math.abs(n))) - 1)
    return parseFloat(n.toFixed(decimals)).toString()
  }
  return p.replace(/\.?0+$/, '')
}
import type { VerifyState } from "../../utils/calcHelpers";
import {
  buildSigFigBreakdown,
  countSigFigs,
  formatSigFigs,
  lowestSigFigs,
} from "../../utils/sigfigs";
import type { SigFigBreakdown } from "../../utils/sigfigs";

type Mode = "bpe" | "fpd";
interface Solvent {
  name: string;
  bp: number;
  fp: number;
  kb: number;
  kf: number;
}

const SOLVENTS: Solvent[] = [
  { name: "Water", bp: 100.0, fp: 0.0, kb: 0.512, kf: 1.86 },
  { name: "Benzene", bp: 80.1, fp: 5.5, kb: 2.53, kf: 5.12 },
  { name: "Ethanol", bp: 78.4, fp: -114.6, kb: 1.22, kf: 1.99 },
  { name: "Cyclohexane", bp: 80.7, fp: 6.5, kb: 2.79, kf: 20.2 },
  { name: "Carbon Tetrachloride", bp: 76.7, fp: -22.9, kb: 5.02, kf: 29.8 },
  { name: "Chloroform", bp: 61.2, fp: -63.5, kb: 3.63, kf: 4.68 },
];

const COLLIG_SOLUTES_i1 = ['glucose', 'sucrose', 'urea', 'ethanol', 'glycerol']
const COLLIG_SOLUTES_i2 = ['NaCl', 'KCl', 'NaOH', 'KBr', 'LiCl']
const COLLIG_SOLUTES_i3 = ['CaCl₂', 'MgCl₂', 'Na₂SO₄', 'K₂SO₄']

function generateColligativeExample(
  mode: 'bpe' | 'fpd',
  solvent: { name: string; bp: number; fp: number; kb: number; kf: number }
) {
  const iChoice = pick([1, 1, 2, 2, 3])
  const soluteName = iChoice === 1 ? pick(COLLIG_SOLUTES_i1)
    : iChoice === 2 ? pick(COLLIG_SOLUTES_i2)
    : pick(COLLIG_SOLUTES_i3)
  const b = roundTo(randBetween(0.2, 2.5), 2)
  const K = mode === 'bpe' ? solvent.kb : solvent.kf
  const Ksym = mode === 'bpe' ? 'Kb' : 'Kf'
  const dSym = mode === 'bpe' ? 'ΔTb' : 'ΔTf'
  const baseT = mode === 'bpe' ? solvent.bp : solvent.fp
  const dT = iChoice * K * b
  const newT = mode === 'bpe' ? baseT + dT : baseT - dT
  const sign = mode === 'bpe' ? '+' : '−'
  return {
    scenario: `${b} mol/kg ${soluteName} (i = ${iChoice}) in ${solvent.name} (${Ksym} = ${K} °C·kg/mol). Find ${dSym} and the new ${mode === 'bpe' ? 'boiling' : 'freezing'} point.`,
    steps: [
      `${dSym} = i × ${Ksym} × b`,
      `${dSym} = ${iChoice} × ${K} × ${b}`,
      `${dSym} = ${sig(dT, 4)} °C`,
      `New ${mode === 'bpe' ? 'b.p.' : 'f.p.'} = ${baseT} ${sign} ${sig(dT, 3)} = ${sig(newT, 5)} °C`,
    ],
    result: `${dSym} = ${sig(dT, 3)} °C  →  new point = ${sig(newT, 4)} °C`,
  }
}

interface Props { initialMode?: 'bpe' | 'fpd' }

export default function ColligativeTool({ initialMode = 'bpe' }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [solvent, setSolvent] = useState<Solvent>(SOLVENTS[0]);
  const [molalityValue, setMolalityValue] = useState("");
  const [vhfValue, setVhfValue] = useState("1");
  const [deltaValue, setDeltaValue] = useState("");
  const [massSteps, setMassSteps] = useState<string[]>([]);
  const [vhfSuggestion, setVhfSuggestion] = useState<{
    i: number;
    note: string;
  } | null>(null);
  const [solventMassValue, setSolventMassValue] = useState("");
  const [solventMassUnit, setSolventMassUnit] = useState<UnitOption>(
    MASS_UNITS[2],
  );
  const [showMolalityHelper, setShowMolalityHelper] = useState(false);
  const [helperMolesValue, setHelperMolesValue] = useState('');
  const [helperMolesFromMass, setHelperMolesFromMass] = useState(false);

  const [result, setResult] = useState<string | null>(null);
  const [resultUnit, setResultUnit] = useState("");
  const [resultLabel, setResultLabel] = useState("Result");
  const [resultNewPoint, setResultNewPoint] = useState<string | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [breakdown, setBreakdown] = useState<SigFigBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState<VerifyState>(null);
  const stepsState = useStepsPanelState(steps, () => generateColligativeExample(mode, solvent));
  const [sfOpen, setSfOpen] = useState(false);

  const K = mode === "bpe" ? solvent.kb : solvent.kf;
  const baseT = mode === "bpe" ? solvent.bp : solvent.fp;
  const Ksym = mode === "bpe" ? "Kb" : "Kf";
  const dSym = mode === "bpe" ? "ΔTb" : "ΔTf";
  const baseTLabel = mode === "bpe" ? "boiling point" : "freezing point";

  function reset() {
    setResult(null);
    setResultNewPoint(null);
    setBreakdown(null);
    setSteps([]);
    setError(null);
    setVerified(null);
  }

  function handleMassToMolesResolved(
    moles: string,
    mSteps: string[],
    suggestedI?: { i: number; note: string } | null,
  ) {
    setHelperMolesValue(moles);
    setHelperMolesFromMass(true);
    setMassSteps(mSteps);
    if (suggestedI) setVhfSuggestion(suggestedI);
  }

  function handleMassToMolesClear() {
    setHelperMolesValue('');
    setHelperMolesFromMass(false);
    setMassSteps([]);
    setVhfSuggestion(null);
  }

  function computeMolality() {
    const n = parseFloat(helperMolesValue);
    const mG = parseFloat(solventMassValue) * solventMassUnit.toGrams;
    const mKg = mG / 1000;
    if (isNaN(n) || isNaN(mKg) || mKg === 0) return;
    const b = n / mKg;
    const sf = lowestSigFigs([helperMolesValue, solventMassValue]);
    const bStr = formatSigFigs(b, sf);
    // Store molality derivation steps to prefix the main calculation
    const molalSteps = [
      ...massSteps,
      `Convert solvent: ${solventMassValue} ${solventMassUnit.label} = ${mG} g = ${mKg} kg`,
      `b = n / m = ${n} mol ÷ ${mKg} kg = ${b} mol/kg`,
      `Rounded to ${sf} sf: ${bStr} mol/kg`,
    ];
    setMassSteps(molalSteps);
    setMolalityValue(bStr);
    setShowMolalityHelper(false);
    reset();
  }

  function npVal(dT: number): number {
    return mode === "bpe" ? baseT + dT : baseT - dT;
  }

  function npStr(dT: number, sf: number): string {
    return formatSigFigs(npVal(dT), sf);
  }

  function calculate() {
    reset();
    const i = hasValue(vhfValue) ? parseFloat(vhfValue) : 1;
    const b = hasValue(molalityValue) ? parseFloat(molalityValue) : NaN;
    const dT = hasValue(deltaValue) ? parseFloat(deltaValue) : NaN;
    const prefix = massSteps.length > 0 ? [...massSteps] : [];
    try {
      if (hasValue(molalityValue) && hasValue(deltaValue)) {
        if (isNaN(b) || isNaN(dT) || b === 0) {
          setError("Invalid values.");
          return;
        }
        const expected = i * K * b;
        const limSF = lowestSigFigs([molalityValue]);
        const userSF = countSigFigs(deltaValue);
        const valueOk = Math.abs(expected - dT) / expected <= 0.01;
        const sfOk = userSF === limSF;
        setVerified(
          !valueOk ? "incorrect" : !sfOk ? "sig_fig_warning" : "correct",
        );
        setSteps([
          ...prefix,
          `${Ksym}(${solvent.name}) = ${K} °C·kg/mol`,
          `${dSym} = i × ${Ksym} × b = ${i} × ${K} × ${b}`,
          `${dSym} = ${expected} °C → ${formatSigFigs(expected, limSF)} °C (${limSF} sf)`,
          !valueOk
            ? `✗ Expected ≈ ${formatSigFigs(expected, limSF)} °C`
            : !sfOk
              ? `⚠ Correct value — expected ${limSF} sf, got ${userSF}`
              : `✓ Correct`,
          `New ${baseTLabel}: ${baseT} ${mode === "bpe" ? "+" : "−"} ${formatSigFigs(expected, limSF)} = ${npStr(expected, limSF)} °C`,
        ]);
        setResult(formatSigFigs(expected, limSF));
        setResultUnit("°C");
        setResultLabel(dSym);
        setResultNewPoint(`${npStr(expected, limSF)} °C`);
        return;
      }

      if (!hasValue(deltaValue)) {
        if (!hasValue(molalityValue) || isNaN(b)) {
          setError("Enter molality.");
          return;
        }
        const res = i * K * b;
        const sf = lowestSigFigs([molalityValue]);
        setSteps([
          ...prefix,
          `${Ksym}(${solvent.name}) = ${K} °C·kg/mol`,
          `${dSym} = i × ${Ksym} × b = ${i} × ${K} × ${b}`,
          `${dSym} = ${res} °C`,
          `Rounded to ${sf} sf: ${formatSigFigs(res, sf)} °C`,
          `New ${baseTLabel} = ${baseT} ${mode === "bpe" ? "+" : "−"} ${formatSigFigs(res, sf)} = ${npStr(res, sf)} °C`,
        ]);
        setResult(fmtRaw(res));
        setResultUnit("°C");
        setResultLabel(dSym);
        setResultNewPoint(`${npStr(res, sf)} °C`);
        setBreakdown(
          buildSigFigBreakdown(
            [{ label: "Molality", value: molalityValue }],
            res,
            "°C",
          ),
        );
      } else {
        if (isNaN(dT) || K === 0 || i === 0) {
          setError("Invalid values.");
          return;
        }
        const res = dT / (i * K);
        const sf = lowestSigFigs([deltaValue]);
        setSteps([
          ...prefix,
          `${Ksym}(${solvent.name}) = ${K} °C·kg/mol`,
          `b = ${dSym} / (i × ${Ksym}) = ${dT} / (${i} × ${K})`,
          `b = ${res} mol/kg`,
          `Rounded to ${sf} sf: ${formatSigFigs(res, sf)} mol/kg`,
        ]);
        setResult(fmtRaw(res));
        setResultUnit("mol/kg");
        setResultLabel("Molality (b)");
        setBreakdown(
          buildSigFigBreakdown(
            [{ label: dSym, value: deltaValue }],
            res,
            "mol/kg",
          ),
        );
      }
    } catch {
      setError("An unexpected error occurred.");
    }
  }

  const sigFigsResult = breakdown
    ? formatSigFigs(breakdown.rawResult, breakdown.limiting)
    : null;
  const isVerify = hasValue(molalityValue) && hasValue(deltaValue);

  const form = (
    <div className="flex flex-col gap-5">
      {/* BPE / FPD sub-pills */}
      <div className="flex gap-0 rounded-sm overflow-hidden border border-border self-start">
        {(["bpe", "fpd"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              reset();
            }}
            className="px-3 py-1 font-sans text-xs font-medium transition-colors"
            style={{
              background:
                mode === m
                  ? "color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))"
                  : "rgb(var(--color-surface))",
              color: mode === m ? "var(--c-halogen)" : "rgba(var(--overlay),0.4)",
              borderRight: m === "bpe" ? "1px solid rgb(var(--color-border))" : "none",
            }}
          >
            {m === "bpe"
              ? "Boiling Point Elevation"
              : "Freezing Point Depression"}
          </button>
        ))}
      </div>

      {/* Solvent selector */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">
          Solvent
        </label>
        <div className="flex flex-wrap gap-2">
          {SOLVENTS.map((s) => (
            <button
              key={s.name}
              onClick={() => {
                setSolvent(s);
                reset();
              }}
              className="px-3 py-1.5 rounded-sm font-sans text-xs font-medium transition-colors border"
              style={{
                background:
                  solvent.name === s.name
                    ? "color-mix(in srgb, var(--c-halogen) 14%, rgb(var(--color-raised)))"
                    : "rgb(var(--color-surface))",
                borderColor:
                  solvent.name === s.name
                    ? "color-mix(in srgb, var(--c-halogen) 40%, transparent)"
                    : "rgb(var(--color-border))",
                color:
                  solvent.name === s.name
                    ? "var(--c-halogen)"
                    : "rgba(var(--overlay),0.45)",
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
        <p className="font-mono text-xs text-secondary mt-0.5">
          bp: {solvent.bp} °C · fp: {solvent.fp} °C · Kb: {solvent.kb} °C·kg/mol
          · Kf: {solvent.kf} °C·kg/mol
        </p>
      </div>
      {/* Calculate molality — collapsible: solvent mass + moles from mass */}
      <div className="flex flex-col gap-1.5">
        <button
          onClick={() => setShowMolalityHelper((o) => !o)}
          className="flex items-center gap-2 font-sans text-sm font-medium transition-colors self-start"
          style={{
            color: solventMassValue
              ? "var(--c-halogen)"
              : "rgba(var(--overlay),0.4)",
          }}
        >
          <motion.span
            animate={{ rotate: showMolalityHelper ? 90 : 0 }}
            transition={{ duration: 0.15 }}
            className="font-mono text-xs inline-block"
          >
            ▶
          </motion.span>
          {solventMassValue
            ? `Solvent: ${solventMassValue} ${solventMassUnit.label}`
            : "Calculate molality"}
        </button>

        <AnimatePresence initial={false}>
          {showMolalityHelper && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              style={{ overflow: "hidden" }}
            >
              <div
                className="flex flex-col gap-3 p-3 rounded-sm border"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--c-halogen) 20%, rgb(var(--color-border)))",
                  background:
                    "color-mix(in srgb, var(--c-halogen) 4%, rgb(var(--color-surface)))",
                }}
              >
                <p className="font-mono text-xs text-secondary">
                  b = n / m_solvent
                </p>

                {/* Solvent mass */}
                <NumberField
                  label="Solvent mass (m)"
                  value={solventMassValue}
                  onChange={(v) => { setSolventMassValue(sanitize(v)); reset(); }}
                  placeholder="e.g. 500"
                  unit={<UnitSelect options={MASS_UNITS} value={solventMassUnit} onChange={setSolventMassUnit} />}
                />

                {/* Moles — direct input or from mass helper */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-sm font-medium text-primary">Moles of solute (n)</label>
                  <MassToMolesHelper
                    onResolved={handleMassToMolesResolved}
                    onClear={handleMassToMolesClear}
                  />
                  <div className="flex items-stretch gap-1.5">
                    <input
                      type="text" inputMode="decimal"
                      value={helperMolesValue}
                      onChange={e => { setHelperMolesValue(sanitize(e.target.value)); setHelperMolesFromMass(false); }}
                      placeholder="e.g. 0.500"
                      className="flex-1 font-mono text-sm bg-surface border border-border rounded-sm px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
                      style={helperMolesFromMass ? { borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, rgb(var(--color-border)))', background: 'color-mix(in srgb, var(--c-halogen) 5%, rgb(var(--color-raised)))' } : undefined}
                    />
                    <span className="font-mono text-sm text-secondary px-2 flex items-center">mol</span>
                  </div>
                </div>

                {/* Compute button */}
                <button
                  onClick={computeMolality}
                  disabled={!hasValue(helperMolesValue) || !hasValue(solventMassValue)}
                  className="w-full py-2 rounded-sm font-sans font-medium text-sm transition-all disabled:opacity-40"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 14%, rgb(var(--color-surface)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                    color: 'var(--c-halogen)',
                  }}
                >
                  Compute Molality → fill above
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Molality */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-primary">
          Molality (b)
        </label>
        <AnimatePresence>
          {vhfSuggestion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-sm border mt-1"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--c-halogen) 30%, rgb(var(--color-border)))",
                  background:
                    "color-mix(in srgb, var(--c-halogen) 5%, rgb(var(--color-surface)))",
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <span
                    className="font-sans text-sm font-medium"
                    style={{ color: "var(--c-halogen)" }}
                  >
                    Suggested i = {vhfSuggestion.i}
                  </span>
                  <span className="font-mono text-xs text-secondary">
                    {vhfSuggestion.note}
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setVhfValue(String(vhfSuggestion.i));
                      setVhfSuggestion(null);
                    }}
                    className="px-2.5 py-1 rounded-sm font-sans font-medium text-xs transition-colors"
                    style={{
                      background:
                        "color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))",
                      border:
                        "1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)",
                      color: "var(--c-halogen)",
                    }}
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setVhfSuggestion(null)}
                    className="px-2 py-1 rounded-sm font-mono text-xs text-dim hover:text-secondary transition-colors border border-border"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-stretch gap-1.5">
          <input
            type="text"
            inputMode="decimal"
            value={molalityValue}
            onChange={(e) => {
              setMolalityValue(sanitize(e.target.value));
              reset();
            }}
            placeholder="e.g. 1.000"
            className="flex-1 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
          />
          <span className="font-mono text-sm text-secondary px-2 flex items-center">
            mol/kg
          </span>
        </div>
      </div>

      {/* Van't Hoff factor */}
      <NumberField
        label="Van't Hoff factor (i)"
        value={vhfValue}
        onChange={(v) => {
          setVhfValue(sanitize(v));
          reset();
        }}
        placeholder="1"
        hint="1 = non-electrolyte  ·  2 = NaCl  ·  3 = CaCl₂"
        unit={<span className="font-mono text-sm text-secondary px-2">—</span>}
      />

      {/* ΔT */}
      <NumberField
        label={dSym}
        value={deltaValue}
        onChange={(v) => {
          setDeltaValue(sanitize(v));
          reset();
        }}
        placeholder={mode === "bpe" ? "e.g. 0.512" : "e.g. 1.860"}
        unit={<span className="font-mono text-sm text-secondary px-2">°C</span>}
      />

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      <div className="flex items-stretch gap-2">
        <button
          onClick={calculate}
          className="shrink-0 py-2 px-5 rounded-sm font-sans font-medium text-sm transition-all"
          style={{
            background: "color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))",
            border: "1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)",
            color: "var(--c-halogen)",
          }}
        >
          {isVerify ? "Verify" : "Calculate"}
        </button>
        <StepsTrigger {...stepsState} />
        <SigFigTrigger breakdown={breakdown} open={sfOpen} onToggle={() => setSfOpen(o => !o)} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {form}

      <StepsContent {...stepsState} />
      <SigFigContent breakdown={breakdown} open={sfOpen} />

      {/* Results — full width */}
      {(steps.length > 0 || result) && (
        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <ResultDisplay
            label={resultLabel}
            value={result}
            unit={resultUnit}
            sigFigsValue={sigFigsResult}
            verified={verified}
          />
          <AnimatePresence>
            {resultNewPoint && result && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-1.5 p-4 rounded-sm border"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--c-halogen) 25%, rgb(var(--color-border)))",
                  background:
                    "color-mix(in srgb, var(--c-halogen) 4%, rgb(var(--color-surface)))",
                }}
              >
                <span className="font-sans text-sm font-medium text-secondary">
                  New {baseTLabel} of {solvent.name}
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-mono text-3xl font-semibold"
                    style={{ color: "var(--c-halogen)" }}
                  >
                    {resultNewPoint}
                  </span>
                </div>
                <p className="font-mono text-xs text-secondary">
                  Pure {baseTLabel}: {baseT} °C ·{" "}
                  {mode === "bpe" ? "elevated" : "depressed"} by {result} °C
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      <p className="font-mono text-xs text-secondary">ΔTb = i·Kb·b · ΔTf = i·Kf·b · b = n_solute / kg_solvent · i = van't Hoff factor</p>
    </div>
  );
}
