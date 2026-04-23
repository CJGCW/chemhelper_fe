import { useState, useId } from 'react'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import { pick, randBetween, roundTo, sig } from '../shared/WorkedExample'
import { P_UNITS, TO_ATM, type PUnit } from '../../utils/idealGas'
import { formatSigFigs, lowestSigFigs, countSigFigs } from '../../utils/sigfigs'
import { sanitize, hasValue } from '../../utils/calcHelpers'

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode = 'partial' | 'fraction'
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

  // Results state
  const [steps, setSteps]           = useState<string[]>([])
  const stepsState = useStepsPanelState(steps, generateDaltonsLawExample)
  const [totalResult, setTotalResult] = useState<string | null>(null)
  const [partialResults, setPartialResults] = useState<PartialResult[]>([])
  const [error, setError]           = useState<string | null>(null)
  const [verified, setVerified]     = useState<'correct' | 'incorrect' | 'sig_fig_warning' | null>(null)

  function reset() {
    setSteps([]); setTotalResult(null); setPartialResults([]); setError(null); setVerified(null)
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

  const canCalculate = mode === 'partial'
    ? rows.every(r => hasValue(r.value))
    : rows.every(r => hasValue(r.value)) && hasValue(totalP)

  const isVerifyMode = mode === 'partial' && hasValue(totalP)

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
        </div>
      </div>

      {/* Pressure unit */}
      <div className="flex items-center gap-3">
        <label className="font-sans text-sm font-medium text-primary">Pressure unit</label>
        <UnitPills active={unit} onChange={handleUnitChange} />
      </div>

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

      {/* Gas rows */}
      <div className="flex flex-col gap-2">
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
      </div>

      {/* Total pressure field */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="font-sans text-sm font-medium text-primary">
            {mode === 'partial' ? `Total pressure (${unit})` : `Total pressure (${unit})`}
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
            <div
              className="flex flex-col gap-2 p-5 rounded-sm border"
              style={{
                borderColor: verified === 'correct' ? 'color-mix(in srgb, #4ade80 45%, rgb(var(--color-border)))'
                  : verified === 'sig_fig_warning' ? 'color-mix(in srgb, #facc15 45%, rgb(var(--color-border)))'
                  : verified === 'incorrect'       ? 'color-mix(in srgb, #f87171 45%, rgb(var(--color-border)))'
                  : 'color-mix(in srgb, var(--c-halogen) 35%, rgb(var(--color-border)))',
                background: verified === 'correct' ? 'color-mix(in srgb, #4ade80 6%, rgb(var(--color-surface)))'
                  : verified === 'sig_fig_warning' ? 'color-mix(in srgb, #facc15 5%, rgb(var(--color-surface)))'
                  : verified === 'incorrect'       ? 'color-mix(in srgb, #f87171 6%, rgb(var(--color-surface)))'
                  : 'color-mix(in srgb, var(--c-halogen) 6%, rgb(var(--color-surface)))',
              }}
            >
              <span className="font-sans text-sm font-medium text-secondary">Total Pressure (P_total)</span>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-3xl font-semibold" style={{ color: 'var(--c-halogen)' }}>
                  {totalResult}
                </span>
                <span className="font-mono text-base text-secondary">{unit}</span>
              </div>
              {verified && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/30 mt-1">
                  <span className="text-lg leading-none">
                    {verified === 'correct' ? '✓' : verified === 'sig_fig_warning' ? '⚠' : '✗'}
                  </span>
                  <span className="font-sans text-sm font-medium"
                    style={{ color: verified === 'correct' ? '#4ade80' : verified === 'sig_fig_warning' ? '#facc15' : '#f87171' }}>
                    {verified === 'correct' ? 'Correct!'
                      : verified === 'sig_fig_warning' ? 'Correct value — check sig figs'
                      : `Incorrect — expected ≈ ${totalResult} ${unit}`}
                  </span>
                </div>
              )}
            </div>
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
