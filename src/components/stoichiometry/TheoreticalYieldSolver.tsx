import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateReaction, type Reaction, type Species } from '../../utils/stoichiometryPractice'
import { UnitToggle, NumInput, SpeciesSelect, StepsPanel } from './StoichiometrySolver'
import WorkedExample from '../calculations/WorkedExample'
import SigFigPanel from '../calculations/SigFigPanel'
import CustomReactionForm from './CustomReactionForm'
import { buildSigFigBreakdown, lowestSigFigs, type SigFigBreakdown } from '../../utils/sigfigs'

type InputUnit = 'g' | 'mol'

function sig(n: number, sf = 4): string {
  return parseFloat(n.toPrecision(sf)).toString()
}
function fmt(n: number) { return parseFloat(n.toPrecision(4)).toString() }

function toMoles(val: number, unit: InputUnit, species: Species): number {
  return unit === 'mol' ? val : val / species.molarMass
}

interface TYResult {
  steps: string[]
  molProduct: number
  gramsProduct: number
  productDisplay: string
  rawGrams: number
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
    rawGrams: gramsProduct,
  }
}

function buildWorkedExample(rxn: Reaction) {
  const lr   = rxn.reactants[0]
  const prod = rxn.products[0] ?? rxn.reactants[rxn.reactants.length - 1]
  const massLR  = 20
  const molLR   = massLR / lr.molarMass
  const molProd = molLR * (prod.coeff / lr.coeff)
  const massProd = molProd * prod.molarMass
  return {
    problem: `${massLR} g of ${lr.display} is the limiting reagent in the reaction above. What is the theoretical yield of ${prod.display}?`,
    steps: [
      `Balanced equation: ${rxn.equation}`,
      `mol ${lr.display} = ${massLR} g ÷ ${lr.molarMass} g/mol = ${fmt(molLR)} mol`,
      `mol ${prod.display} = ${fmt(molLR)} × (${prod.coeff}/${lr.coeff}) = ${fmt(molProd)} mol`,
      `T.Y. = ${fmt(molProd)} mol × ${prod.molarMass} g/mol = ${fmt(massProd)} g`,
    ],
    answer: `${fmt(massProd)} g ${prod.display}`,
  }
}

export default function TheoreticalYieldSolver({ allowCustom = true }: { allowCustom?: boolean }) {
  const [rxn,         setRxn]         = useState<Reaction>(() => generateReaction())
  const [lrFormula,   setLrFormula]   = useState(() => rxn.reactants[0].formula)
  const [lrVal,       setLrVal]       = useState('')
  const [lrUnit,      setLrUnit]      = useState<InputUnit>('g')
  const [prodFormula, setProdFormula] = useState(() => rxn.products[0]?.formula ?? rxn.reactants[rxn.reactants.length - 1].formula)
  const [result,      setResult]      = useState<TYResult | null>(null)
  const [sigBreakdown, setSigBreakdown] = useState<SigFigBreakdown | null>(null)

  function applyReaction(r: Reaction) {
    setRxn(r)
    setLrFormula(r.reactants[0].formula)
    setProdFormula(r.products[0]?.formula ?? r.reactants[r.reactants.length - 1].formula)
    setLrVal('')
    setResult(null)
    setSigBreakdown(null)
  }

  function handleCalc() {
    const val = parseFloat(lrVal)
    if (isNaN(val) || val <= 0) return
    const allSp = [...rxn.reactants, ...rxn.products]
    const lr   = allSp.find(s => s.formula === lrFormula)!
    const prod = allSp.find(s => s.formula === prodFormula)!
    if (!lr || !prod) return
    const res = calcTheoreticalYield(rxn, lr, val, lrUnit, prod)
    setResult(res)

    if (lrUnit === 'g') {
      const sf = lowestSigFigs([lrVal])
      if (sf) {
        setSigBreakdown(buildSigFigBreakdown(
          [{ label: lr.display, value: lrVal }],
          res.rawGrams, 'g',
        ))
      } else {
        setSigBreakdown(null)
      }
    } else {
      setSigBreakdown(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Reaction display */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <label className="font-mono text-xs text-secondary tracking-widest uppercase">Reaction</label>
          <button onClick={() => applyReaction(generateReaction())}
            className="font-mono text-xs px-3 py-1 rounded-sm border border-border text-secondary hover:text-bright transition-colors">
            New ↺
          </button>
          {allowCustom && <CustomReactionForm onApply={applyReaction} />}
        </div>
        <p className="font-mono text-sm text-secondary">{rxn.equation}</p>
      </div>

      {/* Limiting reagent row */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">Limiting Reagent (given)</label>
        <div className="flex flex-wrap items-center gap-2">
          <NumInput value={lrVal} onChange={v => { setLrVal(v); setResult(null); setSigBreakdown(null) }} />
          <UnitToggle unit={lrUnit} onChange={u => { setLrUnit(u); setResult(null); setSigBreakdown(null) }} />
          <span className="font-mono text-xs text-dim">of</span>
          <SpeciesSelect rxn={rxn} value={lrFormula} reactantsOnly
            onChange={f => { setLrFormula(f); setResult(null); setSigBreakdown(null) }} />
        </div>
      </div>

      {/* Product row */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">Product to find yield of</label>
        <SpeciesSelect rxn={rxn} value={prodFormula} productsOnly
          onChange={f => { setProdFormula(f); setResult(null); setSigBreakdown(null) }} />
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
              <SigFigPanel breakdown={sigBreakdown} />
              <StepsPanel steps={result.steps} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <WorkedExample generate={() => {
        const ex = buildWorkedExample(rxn)
        return { scenario: ex.problem, steps: ex.steps, result: ex.answer }
      }} />
      <p className="font-mono text-xs text-secondary">theoretical yield = moles from limiting reagent × molar mass of product</p>
    </div>
  )
}
