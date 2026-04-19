import { useState } from "react";
import ExampleBox from "./ExampleBox";
import NumberField from "./NumberField";
import UnitSelect, { MASS_UNITS } from "./UnitSelect";
import type { UnitOption } from "./UnitSelect";
import MassToMolesHelper from "./MassToMolesHelper";
import ResultDisplay from "./ResultDisplay";
import StepsPanel from "./StepsPanel";
import SigFigPanel from "./SigFigPanel";
import { sanitize, hasValue, toStandard } from "../../utils/calcHelpers";
import type { VerifyState } from "../../utils/calcHelpers";
import {
  buildSigFigBreakdown,
  countSigFigs,
  formatSigFigs,
  lowestSigFigs,
} from "../../utils/sigfigs";
import type { SigFigBreakdown } from "../../utils/sigfigs";

export default function MolalityCalc() {
  const [molesValue, setMolesValue] = useState("");
  const [solventMass, setSolventMass] = useState("");
  const [solventUnit, setSolventUnit] = useState<UnitOption>(MASS_UNITS[2]);
  const [molalityValue, setMolalityValue] = useState("");
  const [molesFromMass, setMolesFromMass] = useState(false);
  const [massSteps, setMassSteps] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [resultUnit, setResultUnit] = useState("");
  const [resultLabel, setResultLabel] = useState("Result");
  const [steps, setSteps] = useState<string[]>([]);
  const [breakdown, setBreakdown] = useState<SigFigBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState<VerifyState>(null);
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

  function handleSolventBlur() {
    if (!hasValue(solventMass)) return
    toStandard(solventMass, solventUnit) // validate only
  }

  const hasMoles = hasValue(molesValue);
  const hasSolvent = hasValue(solventMass);
  const hasMolality = hasValue(molalityValue);
  const filledCount = [hasMoles, hasSolvent, hasMolality].filter(
    Boolean,
  ).length;

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
    const mG = hasSolvent ? toStandard(solventMass, solventUnit) : 0;
    const mKg = mG / 1000;
    const n = hasMoles ? parseFloat(molesValue) : 0;
    const b = hasMolality ? parseFloat(molalityValue) : 0;
    const solStr = `${solventMass} ${solventUnit.label} = ${mG} g = ${mKg} kg`;
    const prefix = molesFromMass ? [...massSteps] : [];
    try {
      if (filledCount === 3) {
        if (isNaN(n) || isNaN(mKg) || isNaN(b) || mKg === 0) {
          setError("Invalid values.");
          return;
        }
        const expected = n / mKg;
        const limSF = lowestSigFigs([molesValue, solventMass]);
        const userSF = countSigFigs(molalityValue);
        const valueOk = Math.abs(expected - b) / expected <= 0.01;
        const sfOk = userSF === limSF;
        setVerified(
          !valueOk ? "incorrect" : !sfOk ? "sig_fig_warning" : "correct",
        );
        setSteps([
          ...prefix,
          `Convert solvent: ${solStr}`,
          `b = n / m = ${n} mol ÷ ${mKg} kg = ${expected} mol/kg`,
          `Rounded to ${limSF} sf: ${formatSigFigs(expected, limSF)} mol/kg`,
          !valueOk
            ? `✗ Expected ≈ ${formatSigFigs(expected, limSF)} mol/kg`
            : !sfOk
              ? `⚠ Correct value — expected ${limSF} sf, got ${userSF}`
              : `✓ Correct`,
        ]);
        setResult(formatSigFigs(expected, limSF));
        setResultUnit("mol/kg");
        setResultLabel("Molality (b)");
        return;
      }
      if (!hasMolality) {
        if (mKg === 0) {
          setError("Invalid values.");
          return;
        }
        const res = n / mKg;
        const sf = lowestSigFigs([molesValue, solventMass]);
        setSteps([
          ...prefix,
          `Convert solvent: ${solStr}`,
          `b = n / m = ${n} mol ÷ ${mKg} kg`,
          `b = ${res} mol/kg`,
          `Rounded to ${sf} sf: ${formatSigFigs(res, sf)} mol/kg`,
        ]);
        setResult(res.toPrecision(8).replace(/\.?0+$/, ""));
        setResultUnit("mol/kg");
        setResultLabel("Molality (b)");
        setBreakdown(
          buildSigFigBreakdown(
            [
              { label: "Moles", value: molesValue },
              { label: "Solvent Mass", value: solventMass },
            ],
            res,
            "mol/kg",
          ),
        );
      } else if (!hasMoles) {
        if (mKg === 0) {
          setError("Invalid values.");
          return;
        }
        const res = b * mKg;
        const sf = lowestSigFigs([molalityValue, solventMass]);
        setSteps([
          `Convert solvent: ${solStr}`,
          `n = b × m = ${b} mol/kg × ${mKg} kg`,
          `n = ${res} mol`,
          `Rounded to ${sf} sf: ${formatSigFigs(res, sf)} mol`,
        ]);
        setResult(res.toPrecision(8).replace(/\.?0+$/, ""));
        setResultUnit("mol");
        setResultLabel("Moles (n)");
        setBreakdown(
          buildSigFigBreakdown(
            [
              { label: "Molality", value: molalityValue },
              { label: "Solvent Mass", value: solventMass },
            ],
            res,
            "mol",
          ),
        );
      } else {
        if (b === 0) {
          setError("Invalid values.");
          return;
        }
        const resKg = n / b;
        const resG = resKg * 1000;
        const sf = lowestSigFigs([molesValue, molalityValue]);
        setSteps([
          `m = n / b = ${n} mol ÷ ${b} mol/kg`,
          `m = ${resKg} kg = ${resG} g`,
          `Rounded to ${sf} sf: ${formatSigFigs(resG, sf)} g`,
        ]);
        setResult(resG.toPrecision(8).replace(/\.?0+$/, ""));
        setResultUnit("g");
        setResultLabel("Solvent Mass (m)");
        setBreakdown(
          buildSigFigBreakdown(
            [
              { label: "Moles", value: molesValue },
              { label: "Molality", value: molalityValue },
            ],
            resG,
            "g",
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
      <ExampleBox>{`Find molality: 0.500 mol glucose in 500.0 g of water.
  m_solvent = 500.0 g → 0.5000 kg
  b = n / m = 0.500 mol ÷ 0.5000 kg = 1.000 mol/kg`}</ExampleBox>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm font-medium text-primary">
            Moles of solute (n)
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
          label="Solvent mass (m)"
          value={solventMass}
          onChange={(v) => {
            setSolventMass(sanitize(v));
            setResult(null);
          }}
          onBlur={handleSolventBlur}
          placeholder="e.g. 500.0"
          unit={
            <UnitSelect
              options={MASS_UNITS}
              value={solventUnit}
              onChange={(u) => setSolventUnit(u)}
            />
          }
        />
        <NumberField
          label="Molality (b)"
          value={molalityValue}
          onChange={(v) => {
            setMolalityValue(sanitize(v));
            setResult(null);
          }}
          placeholder="e.g. 1.000"
          unit={
            <span className="font-mono text-sm text-secondary px-2">
              mol/kg
            </span>
          }
        />
        {error && <p className="font-mono text-xs text-red-400">{error}</p>}
        <button
          onClick={calculate}
          className="w-full py-2.5 rounded-sm font-sans font-medium text-sm transition-all"
          style={{
            background: "color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))",
            border:
              "1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)",
            color: "var(--c-halogen)",
          }}
        >
          {filledCount === 3 ? "Verify" : "Calculate"}
        </button>
      </div>
      {(steps.length > 0 || result) && (
        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <StepsPanel steps={steps} />
          <SigFigPanel breakdown={breakdown} />
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
