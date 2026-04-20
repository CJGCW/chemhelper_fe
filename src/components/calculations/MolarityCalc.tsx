import { useState } from "react";
import { pick, randBetween, roundTo, sig } from './WorkedExample'
import NumberField from "./NumberField";
import UnitSelect, { VOLUME_UNITS } from "./UnitSelect";
import type { UnitOption } from "./UnitSelect";
import MassToMolesHelper from "./MassToMolesHelper";
import ResultDisplay from "./ResultDisplay";
import { useStepsPanelState, StepsTrigger, StepsContent } from "./StepsPanel";
import { SigFigTrigger, SigFigContent } from "./SigFigPanel";
import {
  sanitize,
  hasValue,
  toStandard,
  conversionStep,
} from "../../utils/calcHelpers";
import type { VerifyState } from "../../utils/calcHelpers";
import {
  buildSigFigBreakdown,
  countSigFigs,
  formatSigFigs,
  lowestSigFigs,
} from "../../utils/sigfigs";
import type { SigFigBreakdown } from "../../utils/sigfigs";

const MOLARITY_SOLUTES = [
  { name: 'NaCl', M: 58.44 },
  { name: 'NaOH', M: 40.00 },
  { name: 'KCl', M: 74.55 },
  { name: 'HCl', M: 36.46 },
  { name: 'H₂SO₄', M: 98.08 },
  { name: 'glucose (C₆H₁₂O₆)', M: 180.16 },
  { name: 'CuSO₄', M: 159.61 },
  { name: 'NH₄Cl', M: 53.49 },
  { name: 'KNO₃', M: 101.10 },
  { name: 'MgCl₂', M: 95.21 },
]
const VOL_OPTIONS_mL = [100, 150, 200, 250, 500, 750, 1000]

function generateMolarityExample() {
  const solute = pick(MOLARITY_SOLUTES)
  const mass = roundTo(randBetween(2, 50), 2)
  const vol_mL = pick(VOL_OPTIONS_mL)
  const V = vol_mL / 1000
  const n = mass / solute.M
  const C = n / V
  return {
    scenario: `${mass} g of ${solute.name} (M = ${solute.M} g/mol) is dissolved to make ${vol_mL} mL of solution. Find the molarity.`,
    steps: [
      `Step 1 — moles of solute`,
      `n = m / M = ${mass} g ÷ ${solute.M} g/mol = ${sig(n, 4)} mol`,
      `Step 2 — volume in litres`,
      `V = ${vol_mL} mL ÷ 1000 = ${V} L`,
      `Step 3 — molarity`,
      `C = n / V = ${sig(n, 4)} mol ÷ ${V} L`,
      `C = ${sig(C, 5)} mol/L → rounded: ${sig(C, 3)} mol/L`,
    ],
    result: `C = ${sig(C, 3)} mol/L`,
  }
}

export default function MolarityCalc() {
  const [molesValue, setMolesValue] = useState("");
  const [volValue, setVolValue] = useState("");
  const [volUnit, setVolUnit] = useState<UnitOption>(VOLUME_UNITS[3]);
  const [concValue, setConcValue] = useState("");
  const [molesFromMass, setMolesFromMass] = useState(false);
  const [massSteps, setMassSteps] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [resultUnit, setResultUnit] = useState("");
  const [resultLabel, setResultLabel] = useState("Result");
  const [steps, setSteps] = useState<string[]>([]);
  const [breakdown, setBreakdown] = useState<SigFigBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState<VerifyState>(null);
  const stepsState = useStepsPanelState(steps, generateMolarityExample);
  const [sfOpen, setSfOpen] = useState(false);

  function handleMassToMolesResolved(moles: string, mSteps: string[]) {
    setMolesValue(moles);
    setMolesFromMass(true);
    setMassSteps(mSteps);
    setResult(null);
  }
  function handleMassToMolesClear() {
    setMolesValue("");
    setMolesFromMass(false);
    setMassSteps([]);
  }

  function handleVolBlur() {
    if (!hasValue(volValue)) return
    toStandard(volValue, volUnit) // validate only
  }

  const hasMoles = hasValue(molesValue);
  const hasVol = hasValue(volValue);
  const hasConc = hasValue(concValue);
  const filledCount = [hasMoles, hasVol, hasConc].filter(Boolean).length;

  function calculate() {
    setError(null);
    setVerified(null);
    setResult(null);
    setBreakdown(null);
    setSteps([]);
    if (filledCount < 2) {
      setError("Enter at least two values to calculate.");
      return;
    }
    const V = hasVol ? toStandard(volValue, volUnit) : 0;
    const n = hasMoles ? parseFloat(molesValue) : 0;
    const C = hasConc ? parseFloat(concValue) : 0;
    const prefix = molesFromMass ? [...massSteps] : [];
    try {
      if (filledCount === 3) {
        if (isNaN(n) || isNaN(V) || isNaN(C) || V === 0) {
          setError("Invalid values.");
          return;
        }
        const expected = n / V;
        const limSF = lowestSigFigs([molesValue, volValue]);
        const userSF = countSigFigs(concValue);
        const valueOk = Math.abs(expected - C) / expected <= 0.01;
        const sfOk = userSF === limSF;
        setVerified(
          !valueOk ? "incorrect" : !sfOk ? "sig_fig_warning" : "correct",
        );
        setSteps([
          ...prefix,
          ...(conversionStep(volValue, volUnit, "L", V)
            ? [conversionStep(volValue, volUnit, "L", V)!]
            : []),
          `C = n / V = ${n} mol ÷ ${V} L = ${expected} mol/L`,
          `Rounded to ${limSF} sf: ${formatSigFigs(expected, limSF)} mol/L`,
          !valueOk
            ? `✗ Expected ≈ ${formatSigFigs(expected, limSF)} mol/L`
            : !sfOk
              ? `⚠ Correct value — expected ${limSF} sf, got ${userSF}`
              : `✓ Correct`,
        ]);
        setResult(formatSigFigs(expected, limSF));
        setResultUnit("mol/L");
        setResultLabel("Concentration (C)");
        return;
      }
      if (!hasConc) {
        if (V === 0) {
          setError("Invalid values.");
          return;
        }
        const res = n / V;
        const sf = lowestSigFigs([molesValue, volValue]);
        setSteps([
          ...prefix,
          ...(conversionStep(volValue, volUnit, "L", V)
            ? [conversionStep(volValue, volUnit, "L", V)!]
            : []),
          `C = n / V = ${n} mol ÷ ${V} L`,
          `C = ${res} mol/L`,
          `Rounded to ${sf} sf: ${formatSigFigs(res, sf)} mol/L`,
        ]);
        setResult(res.toPrecision(8).replace(/\.?0+$/, ""));
        setResultUnit("mol/L");
        setResultLabel("Concentration (C)");
        setBreakdown(
          buildSigFigBreakdown(
            [
              { label: "Moles", value: molesValue },
              { label: "Volume", value: volValue },
            ],
            res,
            "mol/L",
          ),
        );
      } else if (!hasMoles) {
        if (V === 0) {
          setError("Invalid values.");
          return;
        }
        const res = C * V;
        const sf = lowestSigFigs([concValue, volValue]);
        setSteps([
          ...(conversionStep(volValue, volUnit, "L", V)
            ? [conversionStep(volValue, volUnit, "L", V)!]
            : []),
          `n = C × V = ${C} mol/L × ${V} L`,
          `n = ${res} mol`,
          `Rounded to ${sf} sf: ${formatSigFigs(res, sf)} mol`,
        ]);
        setResult(res.toPrecision(8).replace(/\.?0+$/, ""));
        setResultUnit("mol");
        setResultLabel("Moles (n)");
        setBreakdown(
          buildSigFigBreakdown(
            [
              { label: "Concentration", value: concValue },
              { label: "Volume", value: volValue },
            ],
            res,
            "mol",
          ),
        );
      } else {
        if (C === 0) {
          setError("Invalid values.");
          return;
        }
        const res = n / C;
        const sf = lowestSigFigs([molesValue, concValue]);
        setSteps([
          `V = n / C = ${n} mol ÷ ${C} mol/L`,
          `V = ${res} L`,
          `Rounded to ${sf} sf: ${formatSigFigs(res, sf)} L`,
        ]);
        setResult(res.toPrecision(8).replace(/\.?0+$/, ""));
        setResultUnit("L");
        setResultLabel("Volume (V)");
        setBreakdown(
          buildSigFigBreakdown(
            [
              { label: "Moles", value: molesValue },
              { label: "Concentration", value: concValue },
            ],
            res,
            "L",
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

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium text-primary">
            Moles (n)
          </label>
          <MassToMolesHelper
            onResolved={handleMassToMolesResolved}
            onClear={handleMassToMolesClear}
          />
          <div className="flex items-stretch gap-1.5">
            <input
              type="text"
              inputMode="decimal"
              value={molesValue}
              onChange={(e) => {
                setMolesValue(sanitize(e.target.value));
                setResult(null);
                if (molesFromMass) {
                  setMolesFromMass(false);
                  setMassSteps([]);
                }
              }}
              placeholder="e.g. 0.500"
              className="flex-1 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
              style={
                molesFromMass
                  ? {
                      borderColor:
                        "color-mix(in srgb, var(--c-halogen) 40%, rgb(var(--color-border)))",
                      background:
                        "color-mix(in srgb, var(--c-halogen) 5%, rgb(var(--color-raised)))",
                    }
                  : undefined
              }
            />
            <span className="font-mono text-sm text-secondary px-2 flex items-center">
              mol
            </span>
          </div>
        </div>
        <NumberField
          label="Volume (V)"
          value={volValue}
          onChange={(v) => {
            setVolValue(sanitize(v));
            setResult(null);
          }}
          onBlur={handleVolBlur}
          placeholder="e.g. 0.2500"
          unit={
            <UnitSelect
              options={VOLUME_UNITS}
              value={volUnit}
              onChange={(u) => setVolUnit(u)}
            />
          }
        />
        <NumberField
          label="Concentration (C)"
          value={concValue}
          onChange={(v) => {
            setConcValue(sanitize(v));
            setResult(null);
          }}
          placeholder="e.g. 2.000"
          unit={
            <span className="font-mono text-sm text-secondary px-2">mol/L</span>
          }
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
            {filledCount === 3 ? "Verify" : "Calculate"}
          </button>
          <StepsTrigger {...stepsState} />
          <SigFigTrigger breakdown={breakdown} open={sfOpen} onToggle={() => setSfOpen(o => !o)} />
        </div>
      </div>
      <StepsContent {...stepsState} />
      <SigFigContent breakdown={breakdown} open={sfOpen} />
      {(steps.length > 0 || result) && (
        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <ResultDisplay
            label={resultLabel}
            value={result}
            unit={resultUnit}
            sigFigsValue={sigFigsResult}
            verified={verified}
          />
        </div>
      )}
    </div>
  );
}
