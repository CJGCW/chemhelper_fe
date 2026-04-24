import { useState, useId } from 'react'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import ResultDisplay from '../shared/ResultDisplay'
import NumberField from '../shared/NumberField'
import { pick, randBetween, roundTo, sig } from '../shared/WorkedExample'
import { P_UNITS, TO_ATM, type PUnit } from '../../utils/idealGas'
import { formatSigFigs, lowestSigFigs, countSigFigs } from '../../utils/sigfigs'
import { sanitize, hasValue, type VerifyState } from '../../utils/calcHelpers'
import { waterVaporPressure, WATER_VAPOR_PRESSURE_MMHG } from '../../data/waterVaporPressure'

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode = 'partial' | 'fraction' | 'gas-over-water'
type FractionInput = 'chi' | 'moles'

interface GasRow {
  id: string
  label: string
  value: string   // partial pressure | mole fraction | moles depending on mode
}

interface PartialResult {
  label: string
  chi: string      // mole fraction (formatted)
  pressure: string // partial pressure (formatted)
}

// ── Example generator ─────────────────────────────────────────────────────────

const DALTON_GAS_SETS = [
  ['N₂', 'O₂', 'Ar'], ['He', 'Ne', 'Ar'], ['H₂', 'N₂', 'CO₂'], ['CH₄', 'CO₂', 'N₂'],
]

const GOW_TEMPS = Object.keys(WATER_VAPOR_PRESSURE_MMHG).map(Number).filter(t => t >= 15 && t <= 35)

function generateGasOverWaterExample() {
  const T    = pick(GOW_TEMPS)
  const pH2O = waterVaporPressure(T)
  const pGas = roundTo(randBetween(700, 780), 0)
  const total = roundTo(pGas + pH2O, 1)
  return {
    scenario: `O₂ is collected over water at ${T} °C. Total pressure = ${total} mmHg. Find P(dry O₂).`,
    steps: [
      `At ${T} °C, P(H₂O) = ${pH2O} mmHg  (Chang Table 5.3)`,
      `P(O₂) = P_total − P(H₂O) = ${total} − ${pH2O} = ${sig(pGas, 4)} mmHg`,
    ],
    result: `P(O₂) = ${sig(pGas, 4)} mmHg`,
  }
}

function generateDaltonsLawExample() {
  const gases = pick(DALTON_GAS_SETS)
  const p1 = roundTo(randBetween(0.20, 0.55), 2)
  const p2 = roundTo(randBetween(0.10, 0.40), 2)
  const p3 = roundTo(randBetween(0.05, 0.30), 2)
  const total = p1 + p2 + p3
  return {
    scenario: `A flask contains ${gases[0]} (${p1} atm), ${gases[1]} (${p2} atm), and ${gases[2]} (${p3} atm). Find P_total.`,
    steps: [
      `P_total = P(${gases[0]}) + P(${gases[1]}) + P(${gases[2]})`,
      `P_total = ${p1} + ${p2} + ${p3}`,
      `P_total = ${sig(total, 4)} atm`,
    ],
    result: `P_total = ${sig(total, 3)} atm`,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const FROM_ATM: Record<PUnit, number> = {
  atm: 1, kPa: 101.325, mmHg: 760, torr: 760,
}

function toAtm(v: number, unit: PUnit) { return v * TO_ATM[unit] }
function fromAtm(v: number, unit: PUnit) { return v * FROM_ATM[unit] }

let rowCounter = 0
function newRow(label = ''): GasRow {
  return { id: String(rowCounter++), label, value: '' }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ModeCard({ active, onClick, title, sub }: { active: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-start px-4 py-3 rounded-sm font-sans text-sm font-medium transition-colors text-left flex-1"
      style={active ? {
        background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
        border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
        color: 'var(--c-halogen)',
      } : {
        background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', color: 'rgba(var(--overlay),0.45)',
      }}>
      <span className="font-semibold">{title}</span>
      <span className="font-mono text-[10px] mt-0.5 opacity-70">{sub}</span>
    </button>
  )
}

function UnitPills({ active, onChange }: { active: PUnit; onChange: (u: PUnit) => void }) {
  return (
    <div className="flex gap-1">
      {P_UNITS.map(u => (
        <button key={u} onClick={() => onChange(u)}
          className="px-2.5 py-0.5 rounded-sm font-mono text-xs transition-colors"
          style={active === u ? {
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          } : {
            background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', color: 'rgba(var(--overlay),0.4)',
          }}>
          {u}
        </button>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DaltonsLawTool() {
  const uid = useId()

  const [mode, setMode]             = useState<Mode>('partial')
  const [fracInput, setFracInput]   = useState<FractionInput>('chi')
  const [unit, setUnit]             = useState<PUnit>('atm')
  const [totalP, setTotalP]         = useState('')
  const [rows, setRows]             = useState<GasRow[]>([newRow('Gas 1'), newRow('Gas 2')])

  // Gas-over-water specific state
  const [gowTempC, setGowTempC]     = useState('')
  const [gowTotalP, setGowTotalP]   = useState('')
  const [gowUnit, setGowUnit]       = useState<PUnit>('mmHg')
  const [gowAnswer, setGowAnswer]   = useState('')  // optional student answer for verify
  const [gowResult, setGowResult]   = useState<{ pH2O: string; pGas: string } | null>(null)

  // Results state
  const [steps, setSteps]           = useState<string[]>([])
  const stepsState = useStepsPanelState(
    steps,
    () => mode === 'gas-over-water' ? generateGasOverWaterExample() : generateDaltonsLawExample(),
  )
  const [totalResult, setTotalResult] = useState<string | null>(null)
  const [partialResults, setPartialResults] = useState<PartialResult[]>([])
  const [error, setError]           = useState<string | null>(null)
  const [verified, setVerified]     = useState<VerifyState>(null)

  function reset() {
    setSteps([]); setTotalResult(null); setPartialResults([]); setError(null); setVerified(null)
    setGowResult(null)
  }

  function handleModeChange(m: Mode) { setMode(m); reset() }
  function handleUnitChange(u: PUnit) { setUnit(u); reset() }
  function handleFracInputChange(f: FractionInput) { setFracInput(f); reset() }

  function updateRow(id: string, field: keyof GasRow, val: string) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r))
    reset()
  }

  function addRow() {
    setRows(prev => [...prev, newRow(`Gas ${prev.length + 1}`)])
  }

  function removeRow(id: string) {
    setRows(prev => prev.length > 2 ? prev.filter(r => r.id !== id) : prev)
    reset()
  }

  // ── Calculation ──────────────────────────────────────────────────────────────

  function calculate() {
    reset()

    // ── Mode: gas collected over water ────────────────────────────────────────
    if (mode === 'gas-over-water') {
      const tVal = parseFloat(gowTempC)
      const pVal = parseFloat(gowTotalP)
      if (isNaN(tVal)) { setError('Enter a temperature in °C.'); return }
      if (isNaN(pVal) || pVal <= 0) { setError('Enter a valid total pressure.'); return }

      let pH2O_mmHg: number
      try {
        pH2O_mmHg = waterVaporPressure(tVal)
      } catch {
        setError(`Temperature ${tVal} °C is outside the table range [0, 100] °C.`); return
      }

      const sf4 = (v: number) => parseFloat(v.toPrecision(4)).toString()
      // Convert P_total to mmHg, subtract, convert back
      const pTotal_mmHg = pVal * TO_ATM[gowUnit] * 760
      const pGas_mmHg   = pTotal_mmHg - pH2O_mmHg
      if (pGas_mmHg <= 0) { setError('P_H₂O exceeds total pressure — check your inputs.'); return }

      const FROM_ATM_UNIT: Record<PUnit, number> = { atm: 1, kPa: 101.325, mmHg: 760, torr: 760 }
      const convFactor = FROM_ATM_UNIT[gowUnit] / 760  // mmHg → user unit
      const pGas_out   = pGas_mmHg * convFactor
      const pH2O_out   = pH2O_mmHg * convFactor

      const newSteps: string[] = [
        `At ${tVal} °C, P(H₂O) = ${pH2O_mmHg} mmHg  (Chang Table 5.3)`,
        ...(gowUnit !== 'mmHg' ? [`Convert: ${sf4(pH2O_mmHg)} mmHg = ${sf4(pH2O_out)} ${gowUnit}`] : []),
        `P_gas = P_total − P(H₂O)`,
        `P_gas = ${sf4(pVal)} − ${sf4(pH2O_out)} = ${sf4(pGas_out)} ${gowUnit}`,
      ]

      if (hasValue(gowAnswer)) {
        const userVal = parseFloat(gowAnswer)
        if (isNaN(userVal)) { setError('Invalid answer value.'); return }
        const relErr = Math.abs(userVal - pGas_out) / pGas_out
        setVerified(relErr <= 0.01 ? 'correct' : 'incorrect')
        newSteps.push(relErr <= 0.01 ? '✓ Correct' : `✗ Expected ≈ ${sf4(pGas_out)} ${gowUnit}`)
      }

      setSteps(newSteps)
      setGowResult({ pH2O: `${sf4(pH2O_out)} ${gowUnit}`, pGas: `${sf4(pGas_out)} ${gowUnit}` })
      return
    }

    if (mode === 'partial') {
      // P_total = P1 + P2 + ...
      const values = rows.map(r => ({ label: r.label || r.id, raw: r.value }))
      const parsed = values.map(v => parseFloat(v.raw))

      if (parsed.some(isNaN)) { setError('Enter a partial pressure for every gas.'); return }
      if (parsed.some(v => v < 0)) { setError('Partial pressures must be ≥ 0.'); return }

      const sum = parsed.reduce((a, b) => a + b, 0)
      const sf  = lowestSigFigs(rows.map(r => r.value))

      const buildSteps = () => {
        const eqParts = values.map((_, i) => `${parsed[i]} ${unit}`)
        return [
          `P_total = ${eqParts.join(' + ')}`,
          `P_total = ${sum} ${unit}`,
          `Rounded to ${sf} sig fig(s): ${formatSigFigs(sum, sf)} ${unit}`,
        ]
      }

      if (hasValue(totalP)) {
        // Verify mode
        const userVal = parseFloat(totalP)
        if (isNaN(userVal)) { setError('Invalid total pressure value.'); return }
        const valueOk = Math.abs(sum - userVal) / sum <= 0.01
        const sfOk    = countSigFigs(totalP) === sf
        setVerified(!valueOk ? 'incorrect' : !sfOk ? 'sig_fig_warning' : 'correct')
        setSteps([
          ...buildSteps(),
          !valueOk
            ? `✗ Expected ≈ ${formatSigFigs(sum, sf)} ${unit}`
            : !sfOk
            ? `⚠ Correct value — expected ${sf} sig fig(s), got ${countSigFigs(totalP)}`
            : `✓ Correct — value and sig figs match`,
        ])
      } else {
        setSteps(buildSteps())
      }
      setTotalResult(formatSigFigs(sum, sf))
      return
    }

    // ── Mode: mole fractions / moles ──────────────────────────────────────────
    if (!hasValue(totalP)) { setError('Enter the total pressure.'); return }
    const Ptotal_user = parseFloat(totalP)
    if (isNaN(Ptotal_user) || Ptotal_user <= 0) { setError('Invalid total pressure.'); return }
    const Ptotal_atm = toAtm(Ptotal_user, unit)

    if (fracInput === 'chi') {
      // χi values provided directly
      const chis = rows.map(r => parseFloat(r.value))
      if (chis.some(isNaN)) { setError('Enter a mole fraction for every gas.'); return }
      if (chis.some(v => v < 0 || v > 1)) { setError('Mole fractions must be between 0 and 1.'); return }

      const sumChi = chis.reduce((a, b) => a + b, 0)
      if (Math.abs(sumChi - 1) > 0.001) { setError(`Mole fractions must sum to 1 (current sum: ${sumChi.toPrecision(4)}).`); return }

      const sf = lowestSigFigs([totalP, ...rows.map(r => r.value)])

      const newSteps: string[] = [`P_total = ${Ptotal_user} ${unit}`]
      const results: PartialResult[] = rows.map((r, i) => {
        const Pi_atm = chis[i] * Ptotal_atm
        const Pi     = fromAtm(Pi_atm, unit)
        newSteps.push(`P(${r.label || `Gas ${i+1}`}) = χ × P_total = ${chis[i]} × ${Ptotal_user} ${unit} = ${Pi.toPrecision(6).replace(/\.?0+$/, '')} ${unit}`)
        return {
          label:    r.label || `Gas ${i+1}`,
          chi:      formatSigFigs(chis[i], sf),
          pressure: formatSigFigs(Pi, sf),
        }
      })
      newSteps.push(`All partial pressures rounded to ${sf} sig fig(s)`)
      setSteps(newSteps)
      setPartialResults(results)
      return
    }

    // fracInput === 'moles'
    const moles = rows.map(r => parseFloat(r.value))
    if (moles.some(isNaN)) { setError('Enter moles for every gas.'); return }
    if (moles.some(v => v <= 0)) { setError('Moles must be > 0.'); return }

    const nTotal = moles.reduce((a, b) => a + b, 0)
    const sf     = lowestSigFigs([totalP, ...rows.map(r => r.value)])

    const newSteps: string[] = [
      `n_total = ${moles.join(' + ')} = ${nTotal} mol`,
      `P_total = ${Ptotal_user} ${unit}`,
    ]
    const results: PartialResult[] = rows.map((r, i) => {
      const chi    = moles[i] / nTotal
      const Pi_atm = chi * Ptotal_atm
      const Pi     = fromAtm(Pi_atm, unit)
      newSteps.push(
        `χ(${r.label || `Gas ${i+1}`}) = ${moles[i]} / ${nTotal} = ${chi.toPrecision(4).replace(/\.?0+$/, '')}`,
        `P(${r.label || `Gas ${i+1}`}) = ${chi.toPrecision(4).replace(/\.?0+$/, '')} × ${Ptotal_user} ${unit} = ${Pi.toPrecision(6).replace(/\.?0+$/, '')} ${unit}`,
      )
      return {
        label:    r.label || `Gas ${i+1}`,
        chi:      formatSigFigs(chi, sf),
        pressure: formatSigFigs(Pi, sf),
      }
    })
    newSteps.push(`All values rounded to ${sf} sig fig(s)`)
    setSteps(newSteps)
    setPartialResults(results)
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const canCalculate = mode === 'gas-over-water'
    ? hasValue(gowTempC) && hasValue(gowTotalP)
    : mode === 'partial'
    ? rows.every(r => hasValue(r.value))
    : rows.every(r => hasValue(r.value)) && hasValue(totalP)

  const isVerifyMode = (mode === 'partial' && hasValue(totalP)) ||
                       (mode === 'gas-over-water' && hasValue(gowAnswer))

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 max-w-xl">

      {/* Mode selector */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-primary">Mode</label>
        <div className="flex gap-2">
          <ModeCard
            active={mode === 'partial'} onClick={() => handleModeChange('partial')}
            title="Partial Pressures → P_total"
            sub="P_total = P₁ + P₂ + … + Pₙ"
          />
          <ModeCard
            active={mode === 'fraction'} onClick={() => handleModeChange('fraction')}
            title="Mole Fractions → Partial P"
            sub="Pᵢ = χᵢ × P_total"
          />
          <ModeCard
            active={mode === 'gas-over-water'} onClick={() => handleModeChange('gas-over-water')}
            title="Gas over Water"
            sub="P_gas = P_total − P(H₂O)"
          />
        </div>
      </div>

      {/* Gas-over-water inputs */}
      {mode === 'gas-over-water' && (
        <div className="flex flex-col gap-4">
          <p className="font-sans text-sm text-secondary leading-relaxed">
            Enter the collection temperature and total pressure. The water vapor pressure is looked up
            from Chang Table 5.3 and subtracted to give the partial pressure of the dry gas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumberField
              label="T — Temperature"
              value={gowTempC}
              onChange={v => { setGowTempC(sanitize(v)); reset() }}
              placeholder="e.g. 25"
              unit={<span className="font-mono text-sm text-secondary px-2">°C</span>}
            />
            <div className="flex flex-col gap-1.5">
              <NumberField
                label="P_total — Total pressure"
                value={gowTotalP}
                onChange={v => { setGowTotalP(sanitize(v)); reset() }}
                placeholder="e.g. 762.0"
                unit={
                  <div className="shrink-0">
                    <UnitPills active={gowUnit} onChange={u => { setGowUnit(u); reset() }} />
                  </div>
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-sm font-medium text-primary">
              Your answer for P_gas
            </label>
            <span className="font-sans text-xs text-secondary">Optional — enter to verify</span>
            <div className="flex items-stretch gap-1.5">
              <input
                type="text"
                inputMode="decimal"
                value={gowAnswer}
                onChange={e => { setGowAnswer(sanitize(e.target.value)); reset() }}
                placeholder="optional — enter to verify"
                className="flex-1 min-w-0 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2
                           text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
              />
              <div className="shrink-0 flex items-center">
                <span className="font-mono text-sm text-secondary px-2">{gowUnit}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pressure unit (for partial/fraction modes) */}
      {mode !== 'gas-over-water' && (
      <div className="flex items-center gap-3">
        <label className="font-sans text-sm font-medium text-primary">Pressure unit</label>
        <UnitPills active={unit} onChange={handleUnitChange} />
      </div>
      )}

      {/* Fraction sub-mode */}
      {mode === 'fraction' && (
        <div className="flex items-center gap-3">
          <label className="font-sans text-sm font-medium text-primary">Enter values as</label>
          <div className="flex gap-1">
            {(['chi', 'moles'] as FractionInput[]).map(f => (
              <button key={f} onClick={() => handleFracInputChange(f)}
                className="px-3 py-1 rounded-sm font-sans text-xs font-medium transition-colors"
                style={fracInput === f ? {
                  background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  color: 'var(--c-halogen)',
                } : {
                  background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', color: 'rgba(var(--overlay),0.4)',
                }}>
                {f === 'chi' ? 'Mole fractions (χ)' : 'Moles (n)'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gas rows (hidden in gas-over-water mode) */}
      {mode !== 'gas-over-water' && <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-sans text-sm font-medium text-primary">Gas components</label>
          <button onClick={addRow}
            className="flex items-center gap-1 px-2.5 py-1 rounded-sm font-mono text-xs transition-colors"
            style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', color: 'rgba(var(--overlay),0.5)' }}>
            + Add gas
          </button>
        </div>

        <div className="rounded-sm border border-border overflow-hidden">
          {/* Header */}
          <div className="grid gap-2 px-3 py-2 border-b border-border"
            style={{ background: 'rgb(var(--color-surface))', gridTemplateColumns: '1fr 1.4fr auto' }}>
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">Label</span>
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">
              {mode === 'partial' ? `Partial pressure (${unit})` : fracInput === 'chi' ? 'Mole fraction (χ)' : 'Moles (n)'}
            </span>
            <span />
          </div>

          {rows.map((row, i) => (
            <div key={row.id}
              className={`grid items-center gap-2 px-3 py-2 ${i < rows.length - 1 ? 'border-b border-border' : ''}`}
              style={{ gridTemplateColumns: '1fr 1.4fr auto' }}>
              <input
                id={`${uid}-label-${row.id}`}
                type="text"
                value={row.label}
                onChange={e => updateRow(row.id, 'label', e.target.value)}
                placeholder={`Gas ${i + 1}`}
                className="w-full bg-transparent font-sans text-sm text-primary placeholder-dim
                           border-b border-border/50 pb-0.5 focus:outline-none focus:border-accent/40 transition-colors"
              />
              <input
                id={`${uid}-val-${row.id}`}
                type="text"
                inputMode="decimal"
                value={row.value}
                onChange={e => { updateRow(row.id, 'value', sanitize(e.target.value)); reset() }}
                placeholder={mode === 'partial' ? 'e.g. 0.250' : fracInput === 'chi' ? 'e.g. 0.40' : 'e.g. 2.00'}
                className="w-full bg-raised border border-border rounded-sm px-2 py-1 font-mono text-sm
                           text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
              />
              <button
                onClick={() => removeRow(row.id)}
                disabled={rows.length <= 2}
                className="font-mono text-sm text-dim hover:text-red-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                title="Remove gas"
              >×</button>
            </div>
          ))}
        </div>
      </div>}

      {/* Total pressure field (partial/fraction only) */}
      {mode !== 'gas-over-water' && (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="font-sans text-sm font-medium text-primary">
            {`Total pressure (${unit})`}
          </label>
          {mode === 'partial' && (
            <span className="font-sans text-xs text-secondary">
              {hasValue(totalP) ? 'Verify mode — checking your answer' : 'Leave blank to calculate'}
            </span>
          )}
          {mode === 'fraction' && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm tracking-wider"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 12%, transparent)',
                color: 'var(--c-halogen)',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
              }}>REQUIRED</span>
          )}
        </div>
        <div className="flex items-stretch gap-1.5">
          <input
            type="text"
            inputMode="decimal"
            value={totalP}
            onChange={e => { setTotalP(sanitize(e.target.value)); reset() }}
            placeholder={mode === 'partial' ? 'optional — enter to verify' : 'e.g. 1.000'}
            className="flex-1 min-w-0 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2
                       text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
          />
          <div className="shrink-0 flex items-center">
            <span className="font-mono text-sm text-secondary px-2">{unit}</span>
          </div>
        </div>
      </div>
      )}

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      <div className="flex items-stretch gap-2">
        <button
          onClick={calculate}
          disabled={!canCalculate}
          className="shrink-0 py-2 px-5 rounded-sm font-sans font-medium text-sm transition-all disabled:opacity-40"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          }}
        >
          {isVerifyMode ? 'Verify' : 'Calculate'}
        </button>
        <StepsTrigger {...stepsState} />
      </div>
      <StepsContent {...stepsState} />

      {/* Results */}
      {steps.length > 0 && (
        <div className="flex flex-col gap-4">

          {/* Mode 1: single total result */}
          {mode === 'partial' && totalResult !== null && (
            <ResultDisplay label="Total Pressure (P_total)" value={String(totalResult)} unit={unit} verified={verified} />
          )}

          {/* Mode: gas over water */}
          {mode === 'gas-over-water' && gowResult && (
            <div className="rounded-sm border border-border overflow-hidden"
              style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 35%, rgb(var(--color-border)))' }}>
              <div className="grid gap-3 px-4 py-2 border-b border-border"
                style={{ background: 'color-mix(in srgb, var(--c-halogen) 6%, rgb(var(--color-surface)))', gridTemplateColumns: '1fr auto' }}>
                <span className="font-sans text-sm font-medium text-secondary">Species</span>
                <span className="font-sans text-sm font-medium text-secondary text-right">Pressure</span>
              </div>
              <div className="grid gap-3 items-center px-4 py-3 border-b border-border"
                style={{ gridTemplateColumns: '1fr auto' }}>
                <span className="font-sans text-sm text-secondary">P(H₂O) — from table</span>
                <span className="font-mono text-sm text-secondary text-right">{gowResult.pH2O}</span>
              </div>
              <div className="grid gap-3 items-center px-4 py-3"
                style={{ gridTemplateColumns: '1fr auto' }}>
                <span className="font-sans text-sm text-primary font-medium">P(dry gas)</span>
                <span className="font-mono text-sm font-semibold text-right" style={{ color: 'var(--c-halogen)' }}>
                  {gowResult.pGas}
                </span>
              </div>
            </div>
          )}
          {mode === 'gas-over-water' && gowResult && verified !== null && (
            <ResultDisplay label="P(dry gas)" value={gowResult.pGas.split(' ')[0]} unit={gowUnit} verified={verified} />
          )}

          {/* Mode 2: per-gas partial pressures table */}
          {mode === 'fraction' && partialResults.length > 0 && (
            <div className="rounded-sm border border-border overflow-hidden"
              style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 35%, rgb(var(--color-border)))' }}>
              <div className="grid gap-3 px-4 py-2 border-b border-border"
                style={{ background: 'color-mix(in srgb, var(--c-halogen) 6%, rgb(var(--color-surface)))', gridTemplateColumns: '1fr auto auto' }}>
                <span className="font-sans text-sm font-medium text-secondary">Gas</span>
                <span className="font-sans text-sm font-medium text-secondary text-right">Mole fraction (χ)</span>
                <span className="font-sans text-sm font-medium text-secondary text-right">Partial pressure</span>
              </div>
              {partialResults.map(r => (
                <div key={r.label}
                  className="grid gap-3 items-center px-4 py-3 border-b border-border last:border-0"
                  style={{ gridTemplateColumns: '1fr auto auto' }}>
                  <span className="font-sans text-sm text-primary">{r.label}</span>
                  <span className="font-mono text-sm text-secondary text-right">{r.chi}</span>
                  <span className="font-mono text-sm font-semibold text-right" style={{ color: 'var(--c-halogen)' }}>
                    {r.pressure} <span className="font-sans font-normal text-secondary text-xs">{unit}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <p className="font-mono text-xs text-secondary">P_total = P₁ + P₂ + ... · χᵢ = nᵢ / n_total · Pᵢ = χᵢ × P_total</p>
    </div>
  )
}
