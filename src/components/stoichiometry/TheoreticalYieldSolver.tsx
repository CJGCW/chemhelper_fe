import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { REACTIONS, type Reaction, type Species } from '../../utils/stoichiometryPractice'
import { UnitToggle, NumInput, SpeciesSelect, StepsPanel, WorkedExample } from './StoichiometrySolver'

type InputUnit = 'g' | 'mol'

function sig(n: number, sf = 4): string {
  return parseFloat(n.toPrecision(sf)).toString()
}

function toMoles(val: number, unit: InputUnit, species: Species): number {
  return unit === 'mol' ? val : val / species.molarMass
}

interface TYResult {
  steps: string[]
  molProduct: number
  gramsProduct: number
  productDisplay: string
}

function calcTheoreticalYield(
  rxn: Reaction,
  lr: Species, lrVal: number, lrUnit: InputUnit,
  product: Species,
): TYResult {
  const steps: string[] = []
  steps.push(`Balanced equation: ${rxn.equation}`)

  const molLR = toMoles(lrVal, lrUnit, lr)
  if (lrUnit === 'g') {
    steps.push(`Convert limiting reagent to moles: ${lrVal} g ÷ ${lr.molarMass} g/mol = ${sig(molLR)} mol ${lr.display}`)
  } else {
    steps.push(`Given: ${lrVal} mol ${lr.display} (limiting reagent)`)
  }

  const molProduct = molLR * (product.coeff / lr.coeff)
  steps.push(
    `Apply mole ratio: ${sig(molLR)} mol ${lr.display} × (${product.coeff} mol ${product.display} / ${lr.coeff} mol ${lr.display}) = ${sig(molProduct)} mol ${product.display}`,
  )

  const gramsProduct = molProduct * product.molarMass
  steps.push(`Theoretical yield: ${sig(molProduct)} mol × ${product.molarMass} g/mol = ${sig(gramsProduct)} g ${product.display}`)

  return {
    steps,
    molProduct: parseFloat(sig(molProduct)),
    gramsProduct: parseFloat(sig(gramsProduct)),
    productDisplay: product.display,
  }
}

export default function TheoreticalYieldSolver() {
  const [rxnIdx,     setRxnIdx]     = useState(0)
  const [lrFormula,  setLrFormula]  = useState(() => REACTIONS[0].reactants[0].formula)
  const [lrVal,      setLrVal]      = useState('')
  const [lrUnit,     setLrUnit]     = useState<InputUnit>('g')
  const [prodFormula,setProdFormula]= useState(() => REACTIONS[0].products[0].formula)
  const [result,     setResult]     = useState<TYResult | null>(null)

  const rxn = REACTIONS[rxnIdx]

  function switchReaction(idx: number) {
    const r = REACTIONS[idx]
    setRxnIdx(idx)
    setLrFormula(r.reactants[0].formula)
    setProdFormula(r.products[0].formula)
    setLrVal('')
    setResult(null)
  }

  function handleCalc() {
    const val = parseFloat(lrVal)
    if (isNaN(val) || val <= 0) return
    const lr   = [...rxn.reactants, ...rxn.products].find(s => s.formula === lrFormula)!
    const prod = [...rxn.reactants, ...rxn.products].find(s => s.formula === prodFormula)!
    if (!lr || !prod) return
    setResult(calcTheoreticalYield(rxn, lr, val, lrUnit, prod))
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Reaction selector */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">Reaction</label>
        <select value={rxnIdx} onChange={e => switchReaction(Number(e.target.value))}
          className="bg-raised border border-border rounded-sm px-3 py-2
                     font-sans text-sm text-bright focus:outline-none focus:border-muted">
          {REACTIONS.map((r, i) => <option key={i} value={i}>{r.name}</option>)}
        </select>
        <p className="font-mono text-sm text-secondary">{rxn.equation}</p>
      </div>

      {/* Limiting reagent row */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">Limiting Reagent (given)</label>
        <div className="flex flex-wrap items-center gap-2">
          <NumInput value={lrVal} onChange={v => { setLrVal(v); setResult(null) }} />
          <UnitToggle unit={lrUnit} onChange={u => { setLrUnit(u); setResult(null) }} />
          <span className="font-mono text-xs text-dim">of</span>
          <SpeciesSelect rxn={rxn} value={lrFormula} reactantsOnly
            onChange={f => { setLrFormula(f); setResult(null) }} />
        </div>
      </div>

      {/* Product row */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">Product to find yield of</label>
        <SpeciesSelect rxn={rxn} value={prodFormula} productsOnly
          onChange={f => { setProdFormula(f); setResult(null) }} />
      </div>

      <button onClick={handleCalc} disabled={!lrVal || parseFloat(lrVal) <= 0}
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
        {result && (
          <motion.div key="ty-result"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}>
            <div className="flex flex-col gap-3 pt-1">
              <div className="rounded-sm border px-4 py-3"
                style={{
                  borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  background: 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-surface)))',
                }}>
                <span className="font-mono text-xs text-secondary tracking-widest uppercase block mb-1">
                  Theoretical Yield
                </span>
                <span className="font-mono text-2xl font-semibold" style={{ color: 'var(--c-halogen)' }}>
                  {result.gramsProduct} g {result.productDisplay}
                </span>
                <span className="font-mono text-sm text-dim block mt-1">
                  ({result.molProduct} mol)
                </span>
              </div>
              <StepsPanel steps={result.steps} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <WorkedExample
        problem="8.36 g of Fe is the limiting reagent. What is the theoretical yield of Fe₂O₃? (4 Fe + 3 O₂ → 2 Fe₂O₃)"
        steps={[
          'Balanced equation: 4 Fe + 3 O₂ → 2 Fe₂O₃',
          'Convert to moles: 8.36 g ÷ 55.85 g/mol = 0.1497 mol Fe',
          'Apply mole ratio: 0.1497 mol Fe × (2 mol Fe₂O₃ / 4 mol Fe) = 0.07483 mol Fe₂O₃',
          'Theoretical yield: 0.07483 mol × 159.69 g/mol = 11.95 g Fe₂O₃',
        ]}
        answer="11.95 g Fe₂O₃"
      />
      <p className="font-mono text-xs text-secondary">theoretical yield = moles from limiting reagent × molar mass of product</p>
    </div>
  )
}
