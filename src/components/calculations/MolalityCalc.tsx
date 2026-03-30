import { useState } from "react";
import NumberField from "./NumberField";
import UnitSelect, { MASS_UNITS } from "./UnitSelect";
import type { UnitOption } from "./UnitSelect";
import MassToMolesHelper from "./MassToMolesHelper";
import ResultDisplay from "./ResultDisplay";
import StepsPanel from "./StepsPanel";
import SigFigPanel from "./SigFigPanel";
import Beaker from "./animations/Beaker";
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
  const [beakerKg, setBeakerKg] = useState<number | null>(null);
  const [beakerMolality, setBeakerMolality] = useState<number | null>(null);
  const [beakerMoles, setBeakerMoles] = useState<number | null>(null);
  const [beakerPlaying, setBeakerPlaying] = useState(false);

  function handleMassToMolesResolved(
    moles: string,
    mSteps: string[],
    _suggestedI?: { i: number; note: string } | null,
  ) {
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
    if (!hasValue(solventMass)) {
      setBeakerKg(null);
      return;
    }
    setBeakerKg(toStandard(solventMass, solventUnit) / 1000);
  }

  function triggerBeaker(molality: number, n: number, kg: number) {
    setBeakerKg(kg);
    setBeakerMolality(molality);
    setBeakerMoles(n);
    setBeakerPlaying(false);
    setTimeout(() => setBeakerPlaying(true), 80);
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
    if (mKg > 0) setBeakerKg(mKg);
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
        triggerBeaker(expected, n, mKg);
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
        triggerBeaker(res, n, mKg);
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
        triggerBeaker(b, res, mKg);
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
        triggerBeaker(b, n, resKg);
      }
    } catch {
      setError("An unexpected error occurred.");
    }
  }

  const sigFigsResult = breakdown
    ? formatSigFigs(breakdown.rawResult, breakdown.limiting)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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
                        "color-mix(in srgb, var(--c-halogen) 40%, #1c1f2e)",
                      background:
                        "color-mix(in srgb, var(--c-halogen) 5%, #141620)",
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
              onChange={(u) => {
                setSolventUnit(u);
                setBeakerKg(null);
              }}
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
            background: "color-mix(in srgb, var(--c-halogen) 18%, #0e1016)",
            border:
              "1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)",
            color: "var(--c-halogen)",
          }}
        >
          {filledCount === 3 ? "Verify" : "Calculate"}
        </button>
      </div>
      <div className="self-start flex justify-center">
        <div className="w-full max-w-[330px]">
          <Beaker
            liquidAmount={beakerKg}
            concentration={beakerMolality}
            concMax={5}
            concUnit="mol/kg"
            concDisplay={
              resultUnit === "mol/kg" ? (sigFigsResult ?? result) : null
            }
            moles={beakerMoles}
            playing={beakerPlaying}
            onComplete={() => setBeakerPlaying(false)}
          />
        </div>
      </div>
      {(steps.length > 0 || result) && (
        <div className="lg:col-span-2 flex flex-col gap-4 border-t border-border pt-4">
          <StepsPanel steps={steps} />
          <SigFigPanel breakdown={breakdown} />
          <ResultDisplay
            label={resultLabel}
            value={result}
            unit={resultUnit}
            sigFigsValue={sigFigsResult}
            verified={
              verified === "correct"
                ? true
                : verified === "incorrect"
                  ? false
                  : verified === "sig_fig_warning"
                    ? "sig_fig_warning"
                    : null
            }
          />
        </div>
      )}
    </div>
  );
}
