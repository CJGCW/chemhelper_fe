import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateReaction, type Reaction, type Species } from '../../utils/stoichiometryPractice'
import { UnitToggle, NumInput, SpeciesSelect, StepsPanel } from './StoichiometrySolver'
import WorkedExample from '../calculations/WorkedExample'
import SigFigPanel from '../calculations/SigFigPanel'
import CustomReactionForm from './CustomReactionForm'
import { buildSigFigBreakdown, lowestSigFigs, type SigFigBreakdown } from '../../utils/sigfigs'
import { genAdvPctProblem } from '../../utils/advancedPercentYieldPractice'

type InputUnit = 'g' | 'mol'
type SolveFor = 'percent' | 'actual'

function sig(n: number, sf = 4): string { return parseFloat(n.toPrecision(sf)).toString() }

function toMoles(val: number, unit: InputUnit, sp: Species): number {
  return unit === 'mol' ? val : val / sp.molarMass
}

interface AdvPYResult {
  theoreticalG: number
  answer: number
  answerUnit: string
  steps: string[]
  rawTheoretical: number
}

function calcAdvancedPercentYield(
  rxn: Reaction,
  lr: Species, lrVal: number, lrUnit: InputUnit,
  product: Species,
  solveFor: SolveFor,
  knownVal: number,
): AdvPYResult {
  const steps: string[] = []
  steps.push(`Balanced equation: ${rxn.equation}`)

  const molLR = toMoles(lrVal, lrUnit, lr)
  if (lrUnit === 'g') {
    steps.push(`mol ${lr.display} = ${lrVal} g ÷ ${lr.molarMass} g/mol = ${sig(molLR)} mol`)
  } else {
    steps.push(`Given: ${lrVal} mol ${lr.display}`)
  }

  const molProd = molLR * (product.coeff / lr.coeff)
  steps.push(`mol ${product.display} = ${sig(molLR)} × (${product.coeff}/${lr.coeff}) = ${sig(molProd)} mol`)

  const tyRaw = molProd * product.molarMass
  const ty    = parseFloat(sig(tyRaw))
  steps.push(`Theoretical yield = ${sig(molProd)} mol × ${product.molarMass} g/mol = ${ty} g`)

  if (solveFor === 'percent') {
    const pct = (knownVal / ty) * 100
    steps.push(`% yield = (actual / theoretical) × 100`)
    steps.push(`% yield = (${sig(knownVal)} g / ${ty} g) × 100 = ${sig(pct)}%`)
    return { theoreticalG: ty, answer: parseFloat(sig(pct)), answerUnit: '%', steps, rawTheoretical: tyRaw }
  }

  // solveFor === 'actual'
  const actual = ty * (knownVal / 100)
  steps.push(`Actual yield = theoretical × (% yield / 100)`)
  steps.push(`Actual yield = ${ty} g × (${sig(knownVal)} / 100) = ${sig(actual)} g`)
  return { theoreticalG: ty, answer: parseFloat(sig(actual)), answerUnit: 'g', steps, rawTheoretical: tyRaw }
}

export default function AdvancedPercentYieldSolver({ allowCustom = true }: { allowCustom?: boolean }) {
  const [rxn,         setRxn]         = useState<Reaction>(() => generateReaction())
  const [lrFormula,   setLrFormula]   = useState(() => rxn.reactants[0].formula)
  const [lrVal,       setLrVal]       = useState('')
  const [lrUnit,      setLrUnit]      = useState<InputUnit>('g')
  const [prodFormula, setProdFormula] = useState(() => rxn.products[0]?.formula ?? rxn.reactants[rxn.reactants.length - 1].formula)
  const [solveFor,    setSolveFor]    = useState<SolveFor>('actual')
  const [knownVal,    setKnownVal]    = useState('')
  const [result,      setResult]      = useState<AdvPYResult | null>(null)
  const [sigBreakdown, setSigBreakdown] = useState<SigFigBreakdown | null>(null)

  function applyReaction(r: Reaction) {
    setRxn(r)
    setLrFormula(r.reactants[0].formula)
    setProdFormula(r.products[0]?.formula ?? r.reactants[r.reactants.length - 1].formula)
    setLrVal('')
    setKnownVal('')
    setResult(null)
    setSigBreakdown(null)
  }

  function handleCalc() {
    const lv = parseFloat(lrVal)
    const kv = parseFloat(knownVal)
    if (isNaN(lv) || lv <= 0 || isNaN(kv) || kv <= 0) return
    if (solveFor === 'percent' && kv <= 0) return
    if (solveFor === 'percent' && kv > 999) return
    if (solveFor === 'actual'  && kv > 100) return

    const allSp = [...rxn.reactants, ...rxn.products]
    const lr   = allSp.find(s => s.formula === lrFormula)!
    const prod = allSp.find(s => s.formula === prodFormula)!
    if (!lr || !prod) return

    const res = calcAdvancedPercentYield(rxn, lr, lv, lrUnit, prod, solveFor, kv)
    setResult(res)

    if (lrUnit === 'g') {
      const sf = lowestSigFigs([lrVal])
      if (sf) {
        setSigBreakdown(buildSigFigBreakdown(
          [{ label: lr.display, value: lrVal }],
          res.rawTheoretical, 'g',
        ))
      } else {
        setSigBreakdown(null)
      }
    } else {
      setSigBreakdown(null)
    }
  }

  function clearResult() { setResult(null); setSigBreakdown(null) }

  const knownLabel = solveFor === 'percent' ? 'Actual Yield (g)' : 'Percent Yield (%)'
  const knownPlaceholder = solveFor === 'percent' ? 'e.g. 8.5' : 'e.g. 78'

  const canCalc = (() => {
    const lv = parseFloat(lrVal)
    const kv = parseFloat(knownVal)
    if (isNaN(lv) || lv <= 0 || isNaN(kv) || kv <= 0) return false
    if (solveFor === 'actual' && kv > 100) return false
    return true
  })()

  const knownError = (() => {
    const kv = parseFloat(knownVal)
    if (solveFor === 'actual' && knownVal && !isNaN(kv) && kv > 100) return '% yield cannot exceed 100.'
    if (solveFor === 'percent' && result && !isNaN(kv) && kv > result.theoreticalG)
      return 'Actual yield cannot exceed theoretical yield.'
    return null
  })()

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Reaction */}
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

      {/* Limiting reagent */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">Limiting Reagent (given)</label>
        <div className="flex flex-wrap items-center gap-2">
          <NumInput value={lrVal} onChange={v => { setLrVal(v); clearResult() }} />
          <UnitToggle unit={lrUnit} onChange={u => { setLrUnit(u); clearResult() }} />
          <span className="font-mono text-xs text-dim">of</span>
          <SpeciesSelect rxn={rxn} value={lrFormula} reactantsOnly
            onChange={f => { setLrFormula(f); clearResult() }} />
        </div>
      </div>

      {/* Product */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">Product</label>
        <SpeciesSelect rxn={rxn} value={prodFormula} productsOnly
          onChange={f => { setProdFormula(f); clearResult() }} />
      </div>

      {/* Solve-for toggle */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">Solve For</label>
        <div className="flex rounded-sm overflow-hidden border border-border self-start">
          {(['actual', 'percent'] as SolveFor[]).map(sf => (
            <button key={sf} onClick={() => { setSolveFor(sf); setKnownVal(''); clearResult() }}
              className="px-3 py-1.5 font-sans text-sm transition-colors"
              style={solveFor === sf
                ? { background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))', color: 'var(--c-halogen)' }
                : { background: 'transparent', color: 'rgba(var(--overlay),0.4)' }}>
              {sf === 'actual' ? 'Actual yield (g)' : '% yield'}
            </button>
          ))}
        </div>
      </div>

      {/* Known value input */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">{knownLabel}</label>
        <div className="flex items-center gap-2">
          <NumInput value={knownVal} onChange={v => { setKnownVal(v); clearResult() }} placeholder={knownPlaceholder} />
          <span className="font-mono text-xs text-secondary">{solveFor === 'percent' ? 'g' : '%'}</span>
        </div>
        {knownError && <p className="font-mono text-xs text-rose-400">{knownError}</p>}
      </div>

      <button onClick={handleCalc} disabled={!canCalc}
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
          <motion.div key="adv-py-result"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}>
            <div className="flex flex-col gap-3 pt-1">
              {/* Theoretical yield (intermediate) */}
              <div className="rounded-sm border border-border bg-surface px-4 py-3">
                <span className="font-mono text-xs text-secondary tracking-widest uppercase block mb-1">Theoretical Yield</span>
                <span className="font-mono text-xl font-semibold text-primary">{result.theoreticalG} g</span>
              </div>
              {/* Final answer */}
              <div className="rounded-sm border px-4 py-3"
                style={{
                  borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  background: 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-surface)))',
                }}>
                <span className="font-mono text-xs text-secondary tracking-widest uppercase block mb-1">
                  {result.answerUnit === '%' ? 'Percent Yield' : 'Actual Yield'}
                </span>
                <span className="font-mono text-2xl font-semibold" style={{ color: 'var(--c-halogen)' }}>
                  {result.answer}{result.answerUnit}
                </span>
              </div>
              <SigFigPanel breakdown={sigBreakdown} />
              <StepsPanel steps={result.steps} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <WorkedExample generate={() => {
        const p = genAdvPctProblem()
        return { scenario: `${p.equation}\n${p.question}`, steps: p.steps, result: `${p.answer} ${p.answerUnit}` }
      }} />
      <p className="font-mono text-xs text-secondary">theoretical yield = mol(LR) × ratio × M(product) · % yield = actual / theoretical × 100</p>
    </div>
  )
}
