import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateReaction, type Reaction, type Species } from '../../utils/stoichiometryPractice'
import { UnitToggle, NumInput, StepsPanel } from './StoichiometrySolver'
import WorkedExample from '../calculations/WorkedExample'
import SigFigPanel from '../calculations/SigFigPanel'
import CustomReactionForm from './CustomReactionForm'
import { buildSigFigBreakdown, lowestSigFigs, formatSigFigs, roundToSigFigs, type SigFigBreakdown } from '../../utils/sigfigs'

type InputUnit = 'g' | 'mol'

function sig(n: number, sf = 4): string {
  return parseFloat(n.toPrecision(sf)).toString()
}
function fmt(n: number): string { return parseFloat(n.toPrecision(4)).toString() }

function toMoles(val: number, unit: InputUnit, species: Species): number {
  return unit === 'mol' ? val : val / species.molarMass
}

// ── N-reactant limiting reagent calculation ───────────────────────────────────

interface ExcessEntry { species: Species; remainingMol: number; remainingG: number }

interface LRResult {
  steps: string[]
  limitingReagent: Species | null
  excess: ExcessEntry[]
  products: { species: Species; mol: number; grams: number }[]
  rawFirstG: number   // unrounded grams of first output — for sig fig breakdown
}

function calcLimitingReagent(
  rxn: Reaction,
  inputs: { val: number; unit: InputUnit }[],
  sf?: number,
): LRResult {
  const disp = (n: number) => sf ? formatSigFigs(n, sf) : sig(n)
  const rnd  = (n: number) => sf ? roundToSigFigs(n, sf) : parseFloat(sig(n))

  const steps: string[] = []
  steps.push(`Balanced equation: ${rxn.equation}`)

  const mols = rxn.reactants.map((sp, i) => {
    const { val, unit } = inputs[i] ?? { val: 0, unit: 'g' as InputUnit }
    const mol = toMoles(val, unit, sp)
    const label = unit === 'g' ? `${val} g ÷ ${sp.molarMass} g/mol` : `${val} mol`
    steps.push(`mol ${sp.display} = ${label} = ${disp(mol)} mol`)
    return mol
  })

  let limitingIdx = 0
  let molPerCoeff: number

  if (rxn.reactants.length === 1) {
    molPerCoeff = mols[0] / rxn.reactants[0].coeff
    steps.push(`→ Single reactant: ${rxn.reactants[0].display}`)
  } else {
    if (rxn.reactants.length === 2) {
      const [rA, rB] = rxn.reactants
      const needed = mols[0] * (rB.coeff / rA.coeff)
      steps.push(`${rB.display} needed to consume all ${rA.display}: ${disp(mols[0])} × (${rB.coeff}/${rA.coeff}) = ${disp(needed)} mol`)
    } else {
      steps.push(`mol/coeff ratios: ${rxn.reactants.map((sp, i) => `${sp.display}: ${disp(mols[i] / sp.coeff)}`).join(' | ')}`)
    }
    const ratios = rxn.reactants.map((sp, i) => mols[i] / sp.coeff)
    limitingIdx = ratios.indexOf(Math.min(...ratios))
    molPerCoeff = ratios[limitingIdx]
    const limiting = rxn.reactants[limitingIdx]
    const excessNames = rxn.reactants.filter((_, i) => i !== limitingIdx).map(s => s.display).join(', ')
    steps.push(`→ ${limiting.display} is the limiting reagent (${excessNames} in excess)`)
  }

  const limitingR = rxn.reactants[limitingIdx]
  const limitingMol = mols[limitingIdx]

  let rawFirstG = 0
  const excess: ExcessEntry[] = []
  rxn.reactants.forEach((sp, i) => {
    if (rxn.reactants.length === 1 || i === limitingIdx) return
    const consumed = molPerCoeff * sp.coeff
    const remaining = mols[i] - consumed
    const gRemaining = remaining * sp.molarMass
    if (rawFirstG === 0) rawFirstG = gRemaining
    steps.push(`${sp.display} consumed: ${disp(consumed)} mol; remaining: ${disp(remaining)} mol (${disp(gRemaining)} g)`)
    excess.push({ species: sp, remainingMol: rnd(remaining), remainingG: rnd(gRemaining) })
  })

  const products = rxn.products.map((prod, pi) => {
    const mol = molPerCoeff * prod.coeff
    const grams = mol * prod.molarMass
    if (pi === 0) rawFirstG = grams
    steps.push(`Theoretical yield ${prod.display}: ${disp(limitingMol)} × (${prod.coeff}/${limitingR.coeff}) × ${prod.molarMass} g/mol = ${disp(grams)} g`)
    return { species: prod, mol: rnd(mol), grams: rnd(grams) }
  })

  return {
    steps,
    limitingReagent: rxn.reactants.length > 1 ? limitingR : null,
    excess,
    products,
    rawFirstG,
  }
}

// ── Build a worked example from any reaction ──────────────────────────────────

function buildWorkedExample(rxn: Reaction) {
  const massA = 20
  const rA = rxn.reactants[0]
  const molA = massA / rA.molarMass

  if (rxn.reactants.length === 1) {
    const yieldSteps: string[] = []
    const firstP = rxn.products[0] ?? null
    rxn.products.forEach(prod => {
      const mol = molA * (prod.coeff / rA.coeff)
      const g = mol * prod.molarMass
      yieldSteps.push(`Theoretical yield ${prod.display}: ${fmt(molA)} × (${prod.coeff}/${rA.coeff}) × ${prod.molarMass} g/mol = ${fmt(g)} g`)
    })
    const firstMol = firstP ? molA * (firstP.coeff / rA.coeff) : 0
    const firstG   = firstP ? firstMol * firstP.molarMass : 0
    return {
      problem: `${massA} g of ${rA.display} decomposes completely. What mass of ${firstP?.display ?? 'product'} is produced?`,
      steps: [
        `Reaction: ${rxn.equation}`,
        `mol ${rA.display} = ${massA} g ÷ ${rA.molarMass} g/mol = ${fmt(molA)} mol`,
        ...yieldSteps,
      ],
      answer: firstP ? `Theoretical yield of ${firstP.display}: ${fmt(firstG)} g` : 'No products defined',
    }
  }

  const rB = rxn.reactants[1]
  const stoichMolB = molA * (rB.coeff / rA.coeff)
  const molB  = parseFloat((stoichMolB * 0.65).toPrecision(3))
  const massB = parseFloat((molB * rB.molarMass).toPrecision(3))
  const molBNeeded = parseFloat((molA * (rB.coeff / rA.coeff)).toPrecision(4))
  const isBLimiting = molBNeeded > molB
  const limiting = isBLimiting ? rB : rA
  const excess   = isBLimiting ? rA : rB
  const molLim   = isBLimiting ? molB : molA
  const molExc   = isBLimiting ? molA : molB
  const molExcUsed   = parseFloat((molLim * (excess.coeff / limiting.coeff)).toPrecision(4))
  const molExcRemain = parseFloat((molExc - molExcUsed).toPrecision(4))
  const gExcRemain   = parseFloat((molExcRemain * excess.molarMass).toPrecision(4))
  const product = rxn.products[0] ?? null
  const yieldSteps: string[] = []
  let answerSuffix = ''
  if (product) {
    const yieldMol = parseFloat((molLim * (product.coeff / limiting.coeff)).toPrecision(4))
    const yieldG   = parseFloat((yieldMol * product.molarMass).toPrecision(4))
    yieldSteps.push(`Theoretical yield ${product.display}: ${fmt(molLim)} × (${product.coeff}/${limiting.coeff}) × ${product.molarMass} g/mol = ${yieldG} g`)
    answerSuffix = ` — Theoretical yield of ${product.display}: ${yieldG} g`
  }
  return {
    problem: `${massA} g of ${rA.display} is mixed with ${massB} g of ${rB.display}. Which is the limiting reagent?`,
    steps: [
      `Reaction: ${rxn.equation}`,
      `mol ${rA.display} = ${massA} g ÷ ${rA.molarMass} g/mol = ${fmt(molA)} mol`,
      `mol ${rB.display} = ${massB} g ÷ ${rB.molarMass} g/mol = ${fmt(molB)} mol`,
      `${rB.display} needed to consume all ${rA.display}: ${fmt(molA)} × (${rB.coeff}/${rA.coeff}) = ${molBNeeded} mol`,
      `Have ${fmt(molB)} mol ${rB.display}; need ${molBNeeded} mol → ${limiting.display} is the limiting reagent`,
      `${excess.display} consumed: ${molExcUsed} mol; remaining: ${molExcRemain} mol (${gExcRemain} g)`,
      ...yieldSteps,
    ],
    answer: `Limiting reagent: ${limiting.display}${answerSuffix}`,
  }
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props { allowCustom?: boolean }

export default function LimitingReagentSolver({ allowCustom = true }: Props) {
  const [rxn,      setRxn]      = useState<Reaction>(() => generateReaction())
  const [lrInputs, setLrInputs] = useState<{val: string; unit: InputUnit}[]>([
    { val: '', unit: 'g' },
    { val: '', unit: 'g' },
  ])
  const [lrResult,     setLrResult]     = useState<LRResult | null>(null)
  const [sigBreakdown, setSigBreakdown] = useState<SigFigBreakdown | null>(null)

  function applyReaction(r: Reaction) {
    setRxn(r)
    setLrInputs(r.reactants.map(() => ({ val: '', unit: 'g' as InputUnit })))
    setLrResult(null)
    setSigBreakdown(null)
  }

  function newReaction() { applyReaction(generateReaction()) }

  function handleCalc() {
    const inputs = lrInputs.map(i => ({ val: parseFloat(i.val), unit: i.unit }))
    if (inputs.some(i => isNaN(i.val) || i.val <= 0)) return

    const hasMass = lrInputs.some(i => i.unit === 'g')
    const sf = hasMass ? lowestSigFigs(lrInputs.map(i => i.val)) : undefined

    const result = calcLimitingReagent(rxn, inputs, sf)
    setLrResult(result)

    if (hasMass && sf) {
      const sfInputs = lrInputs.map((inp, i) => ({
        label: rxn.reactants[i]?.display ?? `Reactant ${i + 1}`,
        value: inp.val,
      }))
      setSigBreakdown(buildSigFigBreakdown(sfInputs, result.rawFirstG, 'g'))
    } else {
      setSigBreakdown(null)
    }
  }

  function updateInput(idx: number, patch: Partial<{val: string; unit: InputUnit}>) {
    setLrInputs(prev => prev.map((p, i) => i === idx ? { ...p, ...patch } : p))
    setLrResult(null)
    setSigBreakdown(null)
  }

  const isDecomp = rxn.reactants.length === 1

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Reaction display */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <label className="font-mono text-xs text-secondary tracking-widest uppercase">Reaction</label>
          <button onClick={newReaction}
            className="font-mono text-xs px-3 py-1 rounded-sm border border-border text-secondary hover:text-bright transition-colors">
            New ↺
          </button>
          {allowCustom && <CustomReactionForm onApply={applyReaction} />}
        </div>
        <p className="font-mono text-sm text-secondary">{rxn.equation}</p>
      </div>

      <>
        {rxn.reactants.map((sp, idx) => {
          const input = lrInputs[idx] ?? { val: '', unit: 'g' as InputUnit }
          return (
            <div key={sp.formula + idx} className="flex flex-col gap-2">
              <label className="font-mono text-xs text-secondary tracking-widest uppercase">
                {sp.display}
                <span className="normal-case font-normal text-dim ml-2">
                  ({sp.name}, M = {sp.molarMass} g/mol)
                </span>
              </label>
              <div className="flex items-center gap-2">
                <NumInput value={input.val} onChange={v => updateInput(idx, { val: v })} />
                <UnitToggle unit={input.unit} onChange={u => updateInput(idx, { unit: u })} />
              </div>
            </div>
          )
        })}

        <button onClick={handleCalc}
          disabled={lrInputs.some(i => !i.val || parseFloat(i.val) <= 0)}
          className="self-start px-5 py-2 rounded-sm font-sans text-sm font-semibold
                     transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
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
                {!isDecomp && lrResult.limitingReagent && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-sm border border-rose-800/50 bg-rose-950/20 px-4 py-3">
                      <span className="font-mono text-xs text-secondary uppercase tracking-widest block mb-1">Limiting Reagent</span>
                      <span className="font-mono text-xl font-semibold text-rose-300">{lrResult.limitingReagent.display}</span>
                      <span className="font-mono text-xs text-dim block mt-0.5">{lrResult.limitingReagent.name}</span>
                    </div>
                    {lrResult.excess.map(e => (
                      <div key={e.species.formula} className="rounded-sm border border-border bg-surface px-4 py-3">
                        <span className="font-mono text-xs text-secondary uppercase tracking-widest block mb-1">
                          {e.species.display} Remaining
                        </span>
                        <span className="font-mono text-xl font-semibold text-bright">{e.remainingG} g</span>
                        <span className="font-mono text-xs text-dim block mt-0.5">({e.remainingMol} mol)</span>
                      </div>
                    ))}
                  </div>
                )}

                {lrResult.products.length > 0 && (
                  <div className="rounded-sm border border-border bg-surface px-4 py-1">
                    <span className="font-mono text-xs text-secondary uppercase tracking-widest block py-2 border-b border-border">
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
                )}

                <SigFigPanel breakdown={sigBreakdown} />
                <StepsPanel steps={lrResult.steps} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>

      <WorkedExample generate={() => {
        const ex = buildWorkedExample(rxn)
        return { scenario: ex.problem, steps: ex.steps, result: ex.answer }
      }} />
      {!isDecomp && (
        <p className="font-mono text-xs text-secondary">divide available moles by stoichiometric coefficient · smallest quotient = limiting reagent</p>
      )}
    </div>
  )
}
