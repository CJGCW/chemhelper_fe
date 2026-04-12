import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { REACTIONS, type Reaction, type Species } from '../../utils/stoichiometryPractice'

// ── Gas volume helper ─────────────────────────────────────────────────────────

type GasStandard = 'STP' | 'SATP'

const GAS_STANDARDS: { id: GasStandard; label: string; Vm: number; desc: string }[] = [
  { id: 'STP',  label: 'STP',  Vm: 22.414, desc: '0 °C, 1 atm'   },
  { id: 'SATP', label: 'SATP', Vm: 24.789, desc: '25 °C, 100 kPa' },
]

function GasVolumePanel({ onUse }: { onUse: (moles: string, note: string) => void }) {
  const [open,     setOpen]     = useState(false)
  const [volume,   setVolume]   = useState('')
  const [standard, setStandard] = useState<GasStandard>('STP')

  const std   = GAS_STANDARDS.find(s => s.id === standard)!
  const vol   = parseFloat(volume)
  const moles = !isNaN(vol) && vol > 0 ? vol / std.Vm : null

  function handleUse() {
    if (moles === null) return
    onUse(
      moles.toPrecision(4),
      `${volume} L at ${std.label} (${std.desc}) ÷ ${std.Vm} L/mol`
    )
    setOpen(false)
  }

  return (
    <div>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 font-mono text-[11px] transition-colors"
        style={{ color: open ? 'var(--c-halogen)' : 'rgba(255,255,255,0.35)' }}>
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}
          className="inline-block text-[9px]">▶</motion.span>
        Start from a gas volume (STP/SATP)
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}>
            <div className="mt-2 p-3 rounded-sm border border-border bg-surface flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <input type="number" inputMode="decimal" min="0" value={volume}
                  onChange={e => setVolume(e.target.value)}
                  placeholder="volume"
                  className="w-28 bg-raised border border-border rounded-sm px-3 py-1.5
                             font-mono text-sm text-bright placeholder-dim focus:outline-none focus:border-muted" />
                <span className="font-mono text-xs text-dim">L at</span>
                <div className="flex rounded-sm overflow-hidden border border-border">
                  {GAS_STANDARDS.map(s => (
                    <button key={s.id} onClick={() => setStandard(s.id)}
                      className="px-2.5 py-1 font-mono text-xs transition-colors"
                      style={standard === s.id
                        ? { background: 'color-mix(in srgb, var(--c-halogen) 18%, #141620)', color: 'var(--c-halogen)' }
                        : { background: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
                      {s.label}
                    </button>
                  ))}
                </div>
                <span className="font-mono text-[10px] text-dim">{std.desc}</span>
              </div>

              {moles !== null && (
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm text-secondary">
                    {volume} L ÷ {std.Vm} L/mol =&nbsp;
                    <span className="text-primary font-semibold">{moles.toPrecision(4)} mol</span>
                  </span>
                  <button onClick={handleUse}
                    className="shrink-0 px-3 py-1 rounded-sm font-sans text-xs font-medium transition-colors"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, #141620)',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                      color: 'var(--c-halogen)',
                    }}>
                    Use as given →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

type InputUnit = 'g' | 'mol'

function sig(n: number, sf = 4): string {
  return parseFloat(n.toPrecision(sf)).toString()
}

function toMoles(val: number, unit: InputUnit, species: Species): number {
  return unit === 'mol' ? val : val / species.molarMass
}

// ── Shared UI components ──────────────────────────────────────────────────────

export function UnitToggle({ unit, onChange }: { unit: InputUnit; onChange: (u: InputUnit) => void }) {
  return (
    <div className="flex rounded-sm overflow-hidden border border-border shrink-0">
      {(['g', 'mol'] as InputUnit[]).map(u => (
        <button key={u} onClick={() => onChange(u)}
          className="px-2.5 py-1 font-mono text-xs transition-colors"
          style={unit === u
            ? { background: 'color-mix(in srgb, var(--c-halogen) 18%, #141620)', color: 'var(--c-halogen)' }
            : { background: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
          {u}
        </button>
      ))}
    </div>
  )
}

export function NumInput({ value, onChange, placeholder = 'value' }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <input type="number" inputMode="decimal" min="0" value={value}
      onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-28 bg-raised border border-border rounded-sm px-3 py-1.5
                 font-mono text-sm text-bright placeholder-dim focus:outline-none focus:border-muted" />
  )
}

export function SpeciesSelect({
  species, value, onChange, exclude, reactantsOnly, productsOnly, rxn,
}: {
  species?: Species[]; value: string; onChange: (f: string) => void
  exclude?: string; reactantsOnly?: boolean; productsOnly?: boolean; rxn?: Reaction
}) {
  const all = species ?? (rxn ? [...rxn.reactants, ...rxn.products] : [])
  const filtered = all
    .filter(s => s.formula !== exclude)
    .filter(s => reactantsOnly ? rxn?.reactants.includes(s) : true)
    .filter(s => productsOnly  ? rxn?.products.includes(s)  : true)
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="bg-raised border border-border rounded-sm px-2 py-1.5
                 font-mono text-sm text-bright focus:outline-none focus:border-muted">
      {filtered.map(s => (
        <option key={s.formula} value={s.formula}>{s.display} ({s.name})</option>
      ))}
    </select>
  )
}

export function StepsPanel({ steps }: { steps: string[] }) {
  return (
    <div className="rounded-sm border border-border bg-surface px-4 py-3 flex flex-col gap-2">
      <span className="font-mono text-[10px] text-secondary tracking-widest uppercase">Solution Steps</span>
      <div className="flex flex-col gap-1.5 pl-3 border-l border-border">
        {steps.map((s, i) => <p key={i} className="font-mono text-sm text-primary">{s}</p>)}
      </div>
    </div>
  )
}

export function WorkedExample({ problem, steps, answer }: {
  problem: string; steps: string[]; answer: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-sm border border-border">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left">
        <span className="font-mono text-[10px] text-secondary tracking-widest uppercase">Worked Example</span>
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}
          className="font-mono text-[10px] text-dim">▶</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
            <div className="px-4 pb-4 border-t border-border pt-3 flex flex-col gap-3">
              <p className="font-mono text-sm text-secondary">{problem}</p>
              <div className="flex flex-col gap-1.5 pl-3 border-l border-border">
                {steps.map((s, i) => <p key={i} className="font-mono text-sm text-primary">{s}</p>)}
              </div>
              <p className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>
                Answer: {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Standard calculation ──────────────────────────────────────────────────────

interface StandardResult {
  steps: string[]
  answer: number
  answerUnit: InputUnit
  answerDisplay: string
}

function calcStandard(
  rxn: Reaction,
  from: Species, fromVal: number, fromUnit: InputUnit,
  to: Species, toUnit: InputUnit,
): StandardResult {
  const steps: string[] = []
  steps.push(`Balanced equation: ${rxn.equation}`)

  const molFrom = toMoles(fromVal, fromUnit, from)
  if (fromUnit === 'g') {
    steps.push(`Convert to moles: ${fromVal} g ÷ ${from.molarMass} g/mol = ${sig(molFrom)} mol ${from.display}`)
  } else {
    steps.push(`Given: ${fromVal} mol ${from.display}`)
  }

  const molTo = molFrom * (to.coeff / from.coeff)
  steps.push(`Mole ratio: ${sig(molFrom)} mol ${from.display} × (${to.coeff}/${from.coeff}) = ${sig(molTo)} mol ${to.display}`)

  if (toUnit === 'mol') {
    const ans = parseFloat(sig(molTo))
    return { steps, answer: ans, answerUnit: 'mol', answerDisplay: `${ans} mol ${to.display}` }
  }
  const massTo = molTo * to.molarMass
  steps.push(`Convert to grams: ${sig(molTo)} mol × ${to.molarMass} g/mol = ${sig(massTo)} g ${to.display}`)
  const ans = parseFloat(sig(massTo))
  return { steps, answer: ans, answerUnit: 'g', answerDisplay: `${ans} g ${to.display}` }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StoichiometrySolver() {
  const [rxnIdx,      setRxnIdx]      = useState(0)
  const [fromFormula, setFromFormula] = useState(() => REACTIONS[0].reactants[0].formula)
  const [fromVal,     setFromVal]     = useState('')
  const [fromUnit,    setFromUnit]    = useState<InputUnit>('g')
  const [toFormula,   setToFormula]   = useState(() => REACTIONS[0].products[0].formula)
  const [toUnit,      setToUnit]      = useState<InputUnit>('g')
  const [result,      setResult]      = useState<StandardResult | null>(null)
  const [gasNote,     setGasNote]     = useState<string | null>(null)

  const rxn   = REACTIONS[rxnIdx]
  const allSp = [...rxn.reactants, ...rxn.products]

  function switchReaction(idx: number) {
    const r = REACTIONS[idx]
    setRxnIdx(idx)
    setFromFormula(r.reactants[0].formula)
    setToFormula(r.products[0].formula)
    setFromVal('')
    setResult(null)
    setGasNote(null)
  }

  function getSpecies(f: string) { return allSp.find(s => s.formula === f)! }

  function handleCalc() {
    const fv = parseFloat(fromVal)
    if (isNaN(fv) || fv <= 0) return
    const from = getSpecies(fromFormula)
    const to   = getSpecies(toFormula)
    if (!from || !to || from.formula === to.formula) return
    setResult(calcStandard(rxn, from, fv, fromUnit, to, toUnit))
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Reaction selector */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[10px] text-secondary tracking-widest uppercase">Reaction</label>
        <select value={rxnIdx} onChange={e => switchReaction(Number(e.target.value))}
          className="bg-raised border border-border rounded-sm px-3 py-2
                     font-sans text-sm text-bright focus:outline-none focus:border-muted">
          {REACTIONS.map((r, i) => <option key={i} value={i}>{r.name}</option>)}
        </select>
        <p className="font-mono text-sm text-secondary">{rxn.equation}</p>
      </div>

      {/* Gas volume helper */}
      <GasVolumePanel onUse={(moles, note) => {
        setFromVal(moles)
        setFromUnit('mol')
        setGasNote(note)
        setResult(null)
      }} />

      {/* Given row */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="font-mono text-[10px] text-secondary tracking-widest uppercase">Given</label>
          {gasNote && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 12%, #0e1016)',
                color: 'var(--c-halogen)',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
              }}>
              from gas vol
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NumInput value={fromVal} onChange={v => { setFromVal(v); setResult(null); setGasNote(null) }} />
          <UnitToggle unit={fromUnit} onChange={u => { setFromUnit(u); setResult(null); setGasNote(null) }} />
          <span className="font-mono text-xs text-dim">of</span>
          <SpeciesSelect rxn={rxn} value={fromFormula}
            onChange={f => { setFromFormula(f); setResult(null) }} exclude={toFormula} />
        </div>
        {gasNote && (
          <p className="font-mono text-[10px] text-dim">{gasNote}</p>
        )}
      </div>

      {/* Find row */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[10px] text-secondary tracking-widest uppercase">Find</label>
        <div className="flex flex-wrap items-center gap-2">
          <UnitToggle unit={toUnit} onChange={u => { setToUnit(u); setResult(null) }} />
          <span className="font-mono text-xs text-dim">of</span>
          <SpeciesSelect rxn={rxn} value={toFormula}
            onChange={f => { setToFormula(f); setResult(null) }} exclude={fromFormula} />
        </div>
      </div>

      <button onClick={handleCalc} disabled={!fromVal || parseFloat(fromVal) <= 0}
        className="self-start px-5 py-2 rounded-sm font-sans text-sm font-semibold
                   transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: 'color-mix(in srgb, var(--c-halogen) 18%, #141620)',
          border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
          color: 'var(--c-halogen)',
        }}>
        Calculate
      </button>

      <AnimatePresence>
        {result && (
          <motion.div key="result"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}>
            <div className="flex flex-col gap-3 pt-1">
              <div className="rounded-sm border px-4 py-3"
                style={{
                  borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  background: 'color-mix(in srgb, var(--c-halogen) 8%, #0e1016)',
                }}>
                <span className="font-mono text-[10px] text-secondary tracking-widest uppercase block mb-1">Result</span>
                <span className="font-mono text-2xl font-semibold" style={{ color: 'var(--c-halogen)' }}>
                  {result.answerDisplay}
                </span>
              </div>
              <StepsPanel steps={result.steps} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <WorkedExample
        problem="How many grams of CO₂ are produced when 32.0 g of CH₄ burns completely? (CH₄ + 2 O₂ → CO₂ + 2 H₂O)"
        steps={[
          'Balanced equation: CH₄ + 2 O₂ → CO₂ + 2 H₂O',
          'Convert to moles: 32.0 g ÷ 16.04 g/mol = 1.995 mol CH₄',
          'Mole ratio: 1.995 mol CH₄ × (1 mol CO₂ / 1 mol CH₄) = 1.995 mol CO₂',
          'Convert to grams: 1.995 mol × 44.01 g/mol = 87.8 g CO₂',
        ]}
        answer="87.8 g CO₂"
      />
    </div>
  )
}
