import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { REACTIONS, type Reaction, type Species } from '../../utils/stoichiometryPractice'

type InputUnit = 'g' | 'mol'
type SolverMode = 'standard' | 'limiting'

function sig(n: number, sf = 4): string {
  return parseFloat(n.toPrecision(sf)).toString()
}

function toMoles(val: number, unit: InputUnit, species: Species): number {
  return unit === 'mol' ? val : val / species.molarMass
}

// ── Standard stoich calculation ───────────────────────────────────────────────

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

// ── Limiting reagent calculation ──────────────────────────────────────────────

interface LRResult {
  steps: string[]
  limitingReagent: Species
  excessReagent: Species
  excessRemainingMol: number
  excessRemainingG: number
  products: { species: Species; mol: number; grams: number }[]
}

function calcLimitingReagent(
  rxn: Reaction,
  valA: number, unitA: InputUnit,
  valB: number, unitB: InputUnit,
): LRResult {
  const [rA, rB] = rxn.reactants
  const steps: string[] = []
  steps.push(`Balanced equation: ${rxn.equation}`)

  const molA = toMoles(valA, unitA, rA)
  const molB = toMoles(valB, unitB, rB)
  const labelA = unitA === 'g' ? `${valA} g ÷ ${rA.molarMass} g/mol` : `${valA} mol`
  const labelB = unitB === 'g' ? `${valB} g ÷ ${rB.molarMass} g/mol` : `${valB} mol`
  steps.push(`mol ${rA.display} = ${labelA} = ${sig(molA)} mol`)
  steps.push(`mol ${rB.display} = ${labelB} = ${sig(molB)} mol`)

  const molBNeeded = molA * (rB.coeff / rA.coeff)
  steps.push(`${rB.display} needed to consume all ${rA.display}: ${sig(molA)} × (${rB.coeff}/${rA.coeff}) = ${sig(molBNeeded)} mol`)

  const isALimiting = molBNeeded > molB
  const limiting  = isALimiting ? rA : rB
  const excess    = isALimiting ? rB : rA
  const molLim    = isALimiting ? molA : molB
  const molExcess = isALimiting ? molB : molA
  steps.push(`→ ${limiting.display} is the limiting reagent (${excess.display} is in excess)`)

  const molExcessUsed   = molLim * (excess.coeff / limiting.coeff)
  const molExcessRemain = molExcess - molExcessUsed
  const gExcessRemain   = molExcessRemain * excess.molarMass
  steps.push(`${excess.display} consumed: ${sig(molExcessUsed)} mol; remaining: ${sig(molExcessRemain)} mol (${sig(gExcessRemain)} g)`)

  const products = rxn.products.map(p => {
    const mol   = molLim * (p.coeff / limiting.coeff)
    const grams = mol * p.molarMass
    steps.push(`Theoretical yield ${p.display}: ${sig(molLim)} × (${p.coeff}/${limiting.coeff}) × ${p.molarMass} g/mol = ${sig(grams)} g`)
    return { species: p, mol: parseFloat(sig(mol)), grams: parseFloat(sig(grams)) }
  })

  return {
    steps,
    limitingReagent: limiting,
    excessReagent: excess,
    excessRemainingMol: parseFloat(sig(molExcessRemain)),
    excessRemainingG: parseFloat(sig(gExcessRemain)),
    products,
  }
}

// ── Unit toggle ───────────────────────────────────────────────────────────────

function UnitToggle({ unit, onChange }: { unit: InputUnit; onChange: (u: InputUnit) => void }) {
  return (
    <div className="flex rounded-sm overflow-hidden border border-border shrink-0">
      {(['g', 'mol'] as InputUnit[]).map(u => (
        <button
          key={u}
          onClick={() => onChange(u)}
          className="px-2.5 py-1 font-mono text-xs transition-colors"
          style={unit === u
            ? { background: 'color-mix(in srgb, var(--c-halogen) 18%, #141620)', color: 'var(--c-halogen)' }
            : { background: 'transparent', color: 'rgba(255,255,255,0.4)' }}
        >
          {u}
        </button>
      ))}
    </div>
  )
}

// ── Species selector ──────────────────────────────────────────────────────────

function SpeciesSelect({
  species, value, onChange, exclude,
}: {
  species: Species[]
  value: string
  onChange: (f: string) => void
  exclude?: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-raised border border-border rounded-sm px-2 py-1.5
                 font-mono text-sm text-bright focus:outline-none focus:border-muted"
    >
      {species.filter(s => s.formula !== exclude).map(s => (
        <option key={s.formula} value={s.formula}>{s.display} ({s.name})</option>
      ))}
    </select>
  )
}

// ── Number input ──────────────────────────────────────────────────────────────

function NumInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min="0"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="value"
      className="w-28 bg-raised border border-border rounded-sm px-3 py-1.5
                 font-mono text-sm text-bright placeholder-dim
                 focus:outline-none focus:border-muted"
    />
  )
}

// ── Steps panel ───────────────────────────────────────────────────────────────

function StepsPanel({ steps }: { steps: string[] }) {
  return (
    <div className="rounded-sm border border-border bg-surface px-4 py-3 flex flex-col gap-2">
      <span className="font-mono text-[10px] text-secondary tracking-widest uppercase">Solution Steps</span>
      <div className="flex flex-col gap-1.5 pl-3 border-l border-border">
        {steps.map((s, i) => (
          <p key={i} className="font-mono text-sm text-primary">{s}</p>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StoichiometrySolver() {
  const [mode,      setMode]      = useState<SolverMode>('standard')
  const [rxnIdx,    setRxnIdx]    = useState(0)

  const rxn = REACTIONS[rxnIdx]
  const allSp = [...rxn.reactants, ...rxn.products]

  // Standard mode state
  const [fromFormula, setFromFormula] = useState(rxn.reactants[0].formula)
  const [fromVal,     setFromVal]     = useState('')
  const [fromUnit,    setFromUnit]    = useState<InputUnit>('g')
  const [toFormula,   setToFormula]   = useState(rxn.products[0].formula)
  const [toUnit,      setToUnit]      = useState<InputUnit>('g')
  const [stdResult,   setStdResult]   = useState<StandardResult | null>(null)

  // Limiting reagent mode state
  const [lrValA, setLrValA] = useState('')
  const [lrUnitA, setLrUnitA] = useState<InputUnit>('g')
  const [lrValB, setLrValB] = useState('')
  const [lrUnitB, setLrUnitB] = useState<InputUnit>('g')
  const [lrResult, setLrResult] = useState<LRResult | null>(null)

  function switchReaction(idx: number) {
    const r = REACTIONS[idx]
    setRxnIdx(idx)
    setFromFormula(r.reactants[0].formula)
    setToFormula(r.products[0].formula)
    setStdResult(null)
    setLrResult(null)
    setFromVal('')
    setLrValA('')
    setLrValB('')
  }

  function getSpecies(formula: string): Species {
    return allSp.find(s => s.formula === formula)!
  }

  function handleCalcStandard() {
    const fv = parseFloat(fromVal)
    if (isNaN(fv) || fv <= 0) return
    const from = getSpecies(fromFormula)
    const to   = getSpecies(toFormula)
    if (!from || !to || from.formula === to.formula) return
    setStdResult(calcStandard(rxn, from, fv, fromUnit, to, toUnit))
  }

  function handleCalcLR() {
    const va = parseFloat(lrValA)
    const vb = parseFloat(lrValB)
    if (isNaN(va) || va <= 0 || isNaN(vb) || vb <= 0) return
    if (rxn.reactants.length < 2) return
    setLrResult(calcLimitingReagent(rxn, va, lrUnitA, vb, lrUnitB))
  }

  const canLR = rxn.reactants.length >= 2

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Mode tabs */}
      <div className="flex items-center gap-1 p-1 rounded-sm self-start"
        style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
        {([['standard', 'Stoichiometry'], ['limiting', 'Limiting Reagent']] as [SolverMode, string][]).map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setStdResult(null); setLrResult(null) }}
            className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
            style={{ color: mode === m ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
            {mode === m && (
              <motion.div layoutId="solver-mode-tab" className="absolute inset-0 rounded-sm"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      {/* Reaction selector */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[10px] text-secondary tracking-widest uppercase">Reaction</label>
        <select
          value={rxnIdx}
          onChange={e => switchReaction(Number(e.target.value))}
          className="bg-raised border border-border rounded-sm px-3 py-2
                     font-sans text-sm text-bright focus:outline-none focus:border-muted"
        >
          {REACTIONS.map((r, i) => (
            <option key={i} value={i}>{r.name}</option>
          ))}
        </select>
        <p className="font-mono text-sm text-secondary">{rxn.equation}</p>
      </div>

      {/* ── Standard mode ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {mode === 'standard' && (
          <motion.div key="standard"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-5"
          >
            {/* Given row */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-secondary tracking-widest uppercase">Given</label>
              <div className="flex flex-wrap items-center gap-2">
                <NumInput value={fromVal} onChange={v => { setFromVal(v); setStdResult(null) }} />
                <UnitToggle unit={fromUnit} onChange={u => { setFromUnit(u); setStdResult(null) }} />
                <span className="font-mono text-xs text-dim">of</span>
                <SpeciesSelect
                  species={allSp} value={fromFormula}
                  onChange={f => { setFromFormula(f); setStdResult(null) }}
                  exclude={toFormula}
                />
              </div>
            </div>

            {/* Find row */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-secondary tracking-widest uppercase">Find</label>
              <div className="flex flex-wrap items-center gap-2">
                <UnitToggle unit={toUnit} onChange={u => { setToUnit(u); setStdResult(null) }} />
                <span className="font-mono text-xs text-dim">of</span>
                <SpeciesSelect
                  species={allSp} value={toFormula}
                  onChange={f => { setToFormula(f); setStdResult(null) }}
                  exclude={fromFormula}
                />
              </div>
            </div>

            <button
              onClick={handleCalcStandard}
              disabled={!fromVal || parseFloat(fromVal) <= 0}
              className="self-start px-5 py-2 rounded-sm font-sans text-sm font-semibold
                         transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 18%, #141620)',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                color: 'var(--c-halogen)',
              }}
            >
              Calculate
            </button>

            <AnimatePresence>
              {stdResult && (
                <motion.div key="std-result"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="flex flex-col gap-3 pt-1">
                    <div className="rounded-sm border px-4 py-3"
                      style={{
                        borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                        background: 'color-mix(in srgb, var(--c-halogen) 8%, #0e1016)',
                      }}>
                      <span className="font-mono text-[10px] text-secondary tracking-widest uppercase block mb-1">Result</span>
                      <span className="font-mono text-2xl font-semibold" style={{ color: 'var(--c-halogen)' }}>
                        {stdResult.answerDisplay}
                      </span>
                    </div>
                    <StepsPanel steps={stdResult.steps} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Limiting reagent mode ─────────────────────────────────────────── */}
        {mode === 'limiting' && (
          <motion.div key="limiting"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-5"
          >
            {!canLR ? (
              <p className="font-mono text-sm text-dim">
                This reaction only has one reactant — choose a different reaction for limiting reagent analysis.
              </p>
            ) : (
              <>
                {rxn.reactants.map((sp, idx) => {
                  const val  = idx === 0 ? lrValA : lrValB
                  const unit = idx === 0 ? lrUnitA : lrUnitB
                  const setVal  = idx === 0 ? setLrValA : setLrValB
                  const setUnit = idx === 0 ? (u: InputUnit) => setLrUnitA(u) : (u: InputUnit) => setLrUnitB(u)
                  return (
                    <div key={sp.formula} className="flex flex-col gap-2">
                      <label className="font-mono text-[10px] text-secondary tracking-widest uppercase">
                        Reactant: {sp.display}
                        <span className="normal-case font-normal text-dim ml-2">({sp.name}, M = {sp.molarMass} g/mol)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <NumInput value={val} onChange={v => { setVal(v); setLrResult(null) }} />
                        <UnitToggle unit={unit} onChange={u => { setUnit(u); setLrResult(null) }} />
                      </div>
                    </div>
                  )
                })}

                <button
                  onClick={handleCalcLR}
                  disabled={!lrValA || !lrValB || parseFloat(lrValA) <= 0 || parseFloat(lrValB) <= 0}
                  className="self-start px-5 py-2 rounded-sm font-sans text-sm font-semibold
                             transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 18%, #141620)',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                    color: 'var(--c-halogen)',
                  }}
                >
                  Calculate
                </button>

                <AnimatePresence>
                  {lrResult && (
                    <motion.div key="lr-result"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="flex flex-col gap-3 pt-1">
                        {/* Summary cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="rounded-sm border border-rose-800/50 bg-rose-950/20 px-4 py-3">
                            <span className="font-mono text-[10px] text-dim uppercase tracking-widest block mb-1">Limiting Reagent</span>
                            <span className="font-mono text-xl font-semibold text-rose-300">{lrResult.limitingReagent.display}</span>
                            <span className="font-mono text-xs text-dim block mt-0.5">{lrResult.limitingReagent.name}</span>
                          </div>
                          <div className="rounded-sm border border-border bg-surface px-4 py-3">
                            <span className="font-mono text-[10px] text-dim uppercase tracking-widest block mb-1">{lrResult.excessReagent.display} Remaining</span>
                            <span className="font-mono text-xl font-semibold text-bright">{lrResult.excessRemainingG} g</span>
                            <span className="font-mono text-xs text-dim block mt-0.5">({lrResult.excessRemainingMol} mol)</span>
                          </div>
                        </div>

                        {/* Theoretical yields */}
                        <div className="rounded-sm border border-border bg-surface px-4 py-1">
                          <span className="font-mono text-[10px] text-secondary uppercase tracking-widest block py-2 border-b border-border">Theoretical Yields</span>
                          {lrResult.products.map(p => (
                            <div key={p.species.formula}
                              className="flex items-baseline gap-4 py-2.5 border-b border-border last:border-b-0">
                              <span className="font-mono text-sm text-secondary w-24 shrink-0">{p.species.display}</span>
                              <span className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>{p.grams} g</span>
                              <span className="font-mono text-sm text-dim">({p.mol} mol)</span>
                            </div>
                          ))}
                        </div>

                        <StepsPanel steps={lrResult.steps} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
