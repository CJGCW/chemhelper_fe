import { useState, useMemo } from 'react'
import { generateReaction, type Reaction } from '../../utils/stoichiometryPractice'
import { UnitToggle, NumInput } from './StoichiometryTool'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import { SigFigTrigger, SigFigContent } from '../shared/SigFigPanel'
import NumberField from '../shared/NumberField'
import ResultDisplay from '../shared/ResultDisplay'
import CustomReactionForm from './CustomReactionForm'
import { buildSigFigBreakdown, lowestSigFigs, countSigFigs, formatSigFigs, roundToSigFigs, type SigFigBreakdown } from '../../utils/sigfigs'
import { calcLimitingReagent, type LRSolution } from '../../chem/stoich'
import type { Unit } from '../../chem/amount'
import type { VerifyState } from '../../utils/calcHelpers'

// ── Build a worked example from any reaction ──────────────────────────────────

function buildWorkedExample(rxn: Reaction) {
  const massA = 20
  const rA = rxn.reactants[0]

  if (rxn.reactants.length === 1) {
    const sol = calcLimitingReagent(rxn, [{ val: massA, unit: 'g' }])
    const firstP = rxn.products[0] ?? null
    return {
      problem: `${massA} g of ${rA.display} decomposes completely. What mass of ${firstP?.display ?? 'product'} is produced?`,
      steps: sol.steps,
      answer: firstP && sol.products[0]
        ? `Theoretical yield of ${firstP.display}: ${sol.products[0].grams} g`
        : 'No products defined',
    }
  }

  const rB = rxn.reactants[1]
  const molA = massA / rA.molarMass
  const molB  = parseFloat((molA * (rB.coeff / rA.coeff) * 0.65).toPrecision(3))
  const massB = parseFloat((molB * rB.molarMass).toPrecision(3))

  const sol = calcLimitingReagent(rxn, [
    { val: massA, unit: 'g' },
    { val: massB, unit: 'g' },
  ])
  const firstP = rxn.products[0] ?? null
  const answerSuffix = firstP && sol.products[0]
    ? ` — Theoretical yield of ${firstP.display}: ${sol.products[0].grams} g`
    : ''

  return {
    problem: `${massA} g of ${rA.display} is mixed with ${massB} g of ${rB.display}. Which is the limiting reagent?`,
    steps: sol.steps,
    answer: `Limiting reagent: ${sol.limitingSpecies?.display ?? 'unknown'}${answerSuffix}`,
  }
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props { allowCustom?: boolean }

export default function LimitingReagentTool({ allowCustom = true }: Props) {
  const [rxn,      setRxn]      = useState<Reaction>(() => generateReaction())
  const [lrInputs, setLrInputs] = useState<{val: string; unit: Unit}[]>([
    { val: '', unit: 'g' },
    { val: '', unit: 'g' },
  ])
  const [lrResult,     setLrResult]     = useState<LRSolution | null>(null)
  const [steps,        setSteps]        = useState<string[]>([])
  const [sigBreakdown, setSigBreakdown] = useState<SigFigBreakdown | null>(null)
  const [sfOpen,       setSfOpen]       = useState(false)
  const [answerVal,    setAnswerVal]    = useState('')

  const stepsState = useStepsPanelState(steps, () => {
    const ex = buildWorkedExample(rxn)
    return { scenario: ex.problem, steps: ex.steps, result: ex.answer }
  })

  function applyReaction(r: Reaction) {
    setRxn(r)
    setLrInputs(r.reactants.map(() => ({ val: '', unit: 'g' as Unit })))
    setLrResult(null)
    setSteps([])
    setSigBreakdown(null)
    setAnswerVal('')
  }

  function newReaction() { applyReaction(generateReaction()) }

  function handleTool() {
    const inputs = lrInputs.map(i => ({ val: parseFloat(i.val), unit: i.unit }))
    if (inputs.some(i => isNaN(i.val) || i.val <= 0)) return

    const hasMass = lrInputs.some(i => i.unit === 'g')
    const sf = hasMass ? lowestSigFigs(lrInputs.map(i => i.val)) : undefined

    const sfFmt = sf ? (n: number) => formatSigFigs(n, sf) : undefined
    const sfRnd = sf ? (n: number) => roundToSigFigs(n, sf) : undefined
    const result = calcLimitingReagent(rxn, inputs, sfFmt, sfRnd)
    setLrResult(result)
    setSteps(result.steps)

    if (hasMass && sf) {
      setSigBreakdown(buildSigFigBreakdown(
        lrInputs.map((inp, i) => ({ label: rxn.reactants[i]?.display ?? `Reactant ${i + 1}`, value: inp.val })),
        result.rawFirstG, 'g',
      ))
    } else {
      setSigBreakdown(null)
    }
  }

  function updateInput(idx: number, patch: Partial<{val: string; unit: Unit}>) {
    setLrInputs(prev => prev.map((p, i) => i === idx ? { ...p, ...patch } : p))
    setLrResult(null)
    setSteps([])
    setSigBreakdown(null)
    setAnswerVal('')
  }

  const hasMassInput = lrInputs.some(i => i.unit === 'g')
  const sf = hasMassInput ? lowestSigFigs(lrInputs.map(i => i.val)) : undefined

  const firstProductVerified = useMemo<VerifyState>(() => {
    if (!lrResult || !lrResult.products.length || !answerVal) return null
    const parsed = parseFloat(answerVal)
    if (isNaN(parsed)) return null
    const expected = lrResult.rawFirstG
    if (Math.abs(expected) < 1e-10) return null
    const valueOk = Math.abs(parsed - expected) / Math.abs(expected) <= 0.01
    const sfOk = sf ? countSigFigs(answerVal) === sf : true
    return !valueOk ? 'incorrect' : !sfOk ? 'sig_fig_warning' : 'correct'
  }, [answerVal, lrResult, sf])

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
          const input = lrInputs[idx] ?? { val: '', unit: 'g' as Unit }
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

        <div className="flex items-stretch gap-2">
          <button onClick={handleTool}
            disabled={lrInputs.some(i => !i.val || parseFloat(i.val) <= 0)}
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

        {lrResult && (
          <div className="flex flex-col gap-3">
            {!isDecomp && lrResult.limitingSpecies && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-sm border border-rose-800/50 bg-rose-950/20 px-4 py-3">
                  <span className="font-mono text-xs text-secondary uppercase tracking-widest block mb-1">Limiting Reagent</span>
                  <span className="font-mono text-xl font-semibold text-rose-300">{lrResult.limitingSpecies.display}</span>
                  <span className="font-mono text-xs text-dim block mt-0.5">{lrResult.limitingSpecies.name}</span>
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

            {lrResult.products.length > 0 && (
              <div className="flex flex-col gap-3">
                <NumberField
                  label={`Your answer — ${lrResult.products[0].species.display} yield (g)`}
                  value={answerVal}
                  onChange={setAnswerVal}
                  placeholder="enter your answer to check"
                />
                {firstProductVerified && (
                  <ResultDisplay
                    label={`Theoretical yield ${lrResult.products[0].species.display}`}
                    value={String(lrResult.products[0].grams)}
                    unit="g"
                    verified={firstProductVerified}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </>

      {!isDecomp && (
        <p className="font-mono text-xs text-secondary">divide available moles by stoichiometric coefficient · smallest quotient = limiting reagent</p>
      )}
    </div>
  )
}
