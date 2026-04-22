import { useState } from 'react'
import { generateReaction, type Reaction } from '../../utils/stoichiometryPractice'
import { UnitToggle, NumInput, SpeciesSelect } from './StoichiometryTool'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../calculations/StepsPanel'
import { SigFigTrigger, SigFigContent } from '../calculations/SigFigPanel'
import CustomReactionForm from './CustomReactionForm'
import { buildSigFigBreakdown, lowestSigFigs, type SigFigBreakdown } from '../../utils/sigfigs'
import { calcTheoreticalYield, type TYSolution } from '../../chem/stoich'
import type { Unit } from '../../chem/amount'

function fmt(n: number) { return parseFloat(n.toPrecision(4)).toString() }

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

export default function TheoreticalYieldTool({ allowCustom = true }: { allowCustom?: boolean }) {
  const [rxn,         setRxn]         = useState<Reaction>(() => generateReaction())
  const [lrFormula,   setLrFormula]   = useState(() => rxn.reactants[0].formula)
  const [lrVal,       setLrVal]       = useState('')
  const [lrUnit,      setLrUnit]      = useState<Unit>('g')
  const [prodFormula, setProdFormula] = useState(() => rxn.products[0]?.formula ?? rxn.reactants[rxn.reactants.length - 1].formula)
  const [result,      setResult]      = useState<TYSolution | null>(null)
  const [steps,       setSteps]       = useState<string[]>([])
  const [sigBreakdown, setSigBreakdown] = useState<SigFigBreakdown | null>(null)
  const [sfOpen,      setSfOpen]      = useState(false)

  const stepsState = useStepsPanelState(steps, () => {
    const ex = buildWorkedExample(rxn)
    return { scenario: ex.problem, steps: ex.steps, result: ex.answer }
  })

  function applyReaction(r: Reaction) {
    setRxn(r)
    setLrFormula(r.reactants[0].formula)
    setProdFormula(r.products[0]?.formula ?? r.reactants[r.reactants.length - 1].formula)
    setLrVal('')
    setResult(null)
    setSteps([])
    setSigBreakdown(null)
  }

  function handleTool() {
    const val = parseFloat(lrVal)
    if (isNaN(val) || val <= 0) return
    const allSp = [...rxn.reactants, ...rxn.products]
    const lr   = allSp.find(s => s.formula === lrFormula)!
    const prod = allSp.find(s => s.formula === prodFormula)!
    if (!lr || !prod) return
    const res = calcTheoreticalYield(rxn, lr, val, lrUnit, prod)
    setResult(res)
    setSteps(res.steps)

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

  const prodDisplay = [...rxn.reactants, ...rxn.products].find(s => s.formula === prodFormula)?.display ?? ''

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
          <NumInput value={lrVal} onChange={v => { setLrVal(v); setResult(null); setSteps([]); setSigBreakdown(null) }} />
          <UnitToggle unit={lrUnit} onChange={u => { setLrUnit(u); setResult(null); setSteps([]); setSigBreakdown(null) }} />
          <span className="font-mono text-xs text-dim">of</span>
          <SpeciesSelect rxn={rxn} value={lrFormula} reactantsOnly
            onChange={f => { setLrFormula(f); setResult(null); setSteps([]); setSigBreakdown(null) }} />
        </div>
      </div>

      {/* Product row */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">Product to find yield of</label>
        <SpeciesSelect rxn={rxn} value={prodFormula} productsOnly
          onChange={f => { setProdFormula(f); setResult(null); setSteps([]); setSigBreakdown(null) }} />
      </div>

      <div className="flex items-stretch gap-2">
        <button onClick={handleTool} disabled={!lrVal || parseFloat(lrVal) <= 0}
          className="shrink-0 px-5 py-2 rounded-sm font-sans text-sm font-semibold
                     transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Calculate
        </button>
        <StepsTrigger {...stepsState} />
        <SigFigTrigger breakdown={sigBreakdown} open={sfOpen} onToggle={() => setSfOpen(o => !o)} />
      </div>

      <StepsContent {...stepsState} />
      <SigFigContent breakdown={sigBreakdown} open={sfOpen} />

      {result && (
        <div className="rounded-sm border px-4 py-3"
          style={{
            borderColor: 'color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            background: 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-surface)))',
          }}>
          <span className="font-mono text-xs text-secondary tracking-widest uppercase block mb-1">
            Theoretical Yield
          </span>
          <span className="font-mono text-2xl font-semibold" style={{ color: 'var(--c-halogen)' }}>
            {result.gramsProduct} g {prodDisplay}
          </span>
          <span className="font-mono text-sm text-dim block mt-1">
            ({result.molProduct} mol)
          </span>
        </div>
      )}

      <p className="font-mono text-xs text-secondary">theoretical yield = moles from limiting reagent × molar mass of product</p>
    </div>
  )
}
