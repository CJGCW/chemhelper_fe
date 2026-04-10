import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { REACTIONS, type Reaction, type Species } from '../../utils/stoichiometryPractice'
import { UnitToggle, NumInput, StepsPanel, WorkedExample } from './StoichiometrySolver'

type InputUnit = 'g' | 'mol'

function sig(n: number, sf = 4): string {
  return parseFloat(n.toPrecision(sf)).toString()
}

function toMoles(val: number, unit: InputUnit, species: Species): number {
  return unit === 'mol' ? val : val / species.molarMass
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

  const isALimiting  = molBNeeded > molB
  const limiting     = isALimiting ? rA : rB
  const excess       = isALimiting ? rB : rA
  const molLim       = isALimiting ? molA : molB
  const molExcess    = isALimiting ? molB : molA
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

// ── Main component ────────────────────────────────────────────────────────────

export default function LimitingReagentSolver() {
  const [rxnIdx,   setRxnIdx]   = useState(0)
  const [lrValA,   setLrValA]   = useState('')
  const [lrUnitA,  setLrUnitA]  = useState<InputUnit>('g')
  const [lrValB,   setLrValB]   = useState('')
  const [lrUnitB,  setLrUnitB]  = useState<InputUnit>('g')
  const [lrResult, setLrResult] = useState<LRResult | null>(null)

  const rxn   = REACTIONS[rxnIdx]
  const canLR = rxn.reactants.length >= 2

  function switchReaction(idx: number) {
    setRxnIdx(idx)
    setLrValA('')
    setLrValB('')
    setLrResult(null)
  }

  function handleCalc() {
    const va = parseFloat(lrValA)
    const vb = parseFloat(lrValB)
    if (isNaN(va) || va <= 0 || isNaN(vb) || vb <= 0) return
    if (!canLR) return
    setLrResult(calcLimitingReagent(rxn, va, lrUnitA, vb, lrUnitB))
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Reaction selector */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[10px] text-secondary tracking-widest uppercase">Reaction</label>
        <select value={rxnIdx} onChange={e => switchReaction(Number(e.target.value))}
          className="bg-raised border border-border rounded-sm px-3 py-2
                     font-sans text-sm text-bright focus:outline-none focus:border-muted">
          {REACTIONS.filter(r => r.reactants.length >= 2).map(r => {
            const origIdx = REACTIONS.indexOf(r)
            return <option key={origIdx} value={origIdx}>{r.name}</option>
          })}
        </select>
        <p className="font-mono text-sm text-secondary">{rxn.equation}</p>
      </div>

      {!canLR ? (
        <p className="font-mono text-sm text-dim">
          This reaction only has one reactant — choose a different reaction for limiting reagent analysis.
        </p>
      ) : (
        <>
          {/* Reactant inputs */}
          {rxn.reactants.map((sp, idx) => {
            const val     = idx === 0 ? lrValA : lrValB
            const unit    = idx === 0 ? lrUnitA : lrUnitB
            const setVal  = idx === 0 ? setLrValA : setLrValB
            const setUnit = idx === 0
              ? (u: InputUnit) => setLrUnitA(u)
              : (u: InputUnit) => setLrUnitB(u)
            return (
              <div key={sp.formula} className="flex flex-col gap-2">
                <label className="font-mono text-[10px] text-secondary tracking-widest uppercase">
                  {sp.display}
                  <span className="normal-case font-normal text-dim ml-2">
                    ({sp.name}, M = {sp.molarMass} g/mol)
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <NumInput value={val} onChange={v => { setVal(v); setLrResult(null) }} />
                  <UnitToggle unit={unit} onChange={u => { setUnit(u); setLrResult(null) }} />
                </div>
              </div>
            )
          })}

          <button onClick={handleCalc}
            disabled={!lrValA || !lrValB || parseFloat(lrValA) <= 0 || parseFloat(lrValB) <= 0}
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
            {lrResult && (
              <motion.div key="lr-result"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}>
                <div className="flex flex-col gap-3 pt-1">
                  {/* Summary cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-sm border border-rose-800/50 bg-rose-950/20 px-4 py-3">
                      <span className="font-mono text-[10px] text-dim uppercase tracking-widest block mb-1">Limiting Reagent</span>
                      <span className="font-mono text-xl font-semibold text-rose-300">{lrResult.limitingReagent.display}</span>
                      <span className="font-mono text-xs text-dim block mt-0.5">{lrResult.limitingReagent.name}</span>
                    </div>
                    <div className="rounded-sm border border-border bg-surface px-4 py-3">
                      <span className="font-mono text-[10px] text-dim uppercase tracking-widest block mb-1">
                        {lrResult.excessReagent.display} Remaining
                      </span>
                      <span className="font-mono text-xl font-semibold text-bright">{lrResult.excessRemainingG} g</span>
                      <span className="font-mono text-xs text-dim block mt-0.5">({lrResult.excessRemainingMol} mol)</span>
                    </div>
                  </div>

                  {/* Theoretical yields */}
                  <div className="rounded-sm border border-border bg-surface px-4 py-1">
                    <span className="font-mono text-[10px] text-secondary uppercase tracking-widest block py-2 border-b border-border">
                      Theoretical Yields
                    </span>
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

      <WorkedExample
        problem="28.0 g of N₂ and 9.09 g of H₂ are mixed. Which is the limiting reagent? (N₂ + 3 H₂ → 2 NH₃)"
        steps={[
          'mol N₂ = 28.0 g ÷ 28.01 g/mol = 0.9996 mol',
          'mol H₂ = 9.09 g ÷ 2.016 g/mol = 4.509 mol',
          'H₂ needed to consume all N₂: 0.9996 × (3/1) = 2.999 mol',
          'Have 4.509 mol H₂ > 2.999 mol needed → N₂ is the limiting reagent',
          'H₂ consumed: 0.9996 × (3/1) = 2.999 mol; remaining: 4.509 − 2.999 = 1.510 mol (3.044 g)',
          'Theoretical yield NH₃: 0.9996 × (2/1) × 17.03 g/mol = 34.05 g',
        ]}
        answer="Limiting reagent: N₂ — Theoretical yield of NH₃: 34.05 g"
      />
    </div>
  )
}
