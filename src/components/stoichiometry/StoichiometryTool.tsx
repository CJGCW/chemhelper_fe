import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateReaction, type Reaction, type Species } from '../../utils/stoichiometryPractice'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'
import { SigFigTrigger, SigFigContent } from '../shared/SigFigPanel'
import ResultDisplay from '../shared/ResultDisplay'
import NumberField from '../shared/NumberField'
import CustomReactionForm from './CustomReactionForm'
import { buildSigFigBreakdown, lowestSigFigs, formatSigFigs, countSigFigs, type SigFigBreakdown } from '../../utils/sigfigs'
import type { VerifyState } from '../../utils/calcHelpers'
import { calcStoich, type StoichSolution } from '../../chem/stoich'
import type { Unit } from '../../chem/amount'

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
        style={{ color: open ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
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
                <input type="text" inputMode="decimal" value={volume}
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
                        ? { background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))', color: 'var(--c-halogen)' }
                        : { background: 'transparent', color: 'rgba(var(--overlay),0.4)' }}>
                      {s.label}
                    </button>
                  ))}
                </div>
                <span className="font-mono text-xs text-secondary">{std.desc}</span>
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
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
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

export type InputUnit = Unit

// ── Shared UI components ──────────────────────────────────────────────────────

export function UnitToggle({ unit, onChange }: { unit: InputUnit; onChange: (u: InputUnit) => void }) {
  return (
    <div className="flex rounded-sm overflow-hidden border border-border shrink-0">
      {(['g', 'mol'] as InputUnit[]).map(u => (
        <button key={u} onClick={() => onChange(u)}
          className="px-2.5 py-1 font-mono text-xs transition-colors"
          style={unit === u
            ? { background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))', color: 'var(--c-halogen)' }
            : { background: 'transparent', color: 'rgba(var(--overlay),0.4)' }}>
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
    <input type="text" inputMode="decimal" value={value}
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
      <span className="font-mono text-xs text-secondary tracking-widest uppercase">Solution Steps</span>
      <div className="flex flex-col gap-1.5 pl-3 border-l border-border">
        {steps.map((s, i) => <p key={i} className="font-mono text-sm text-primary">{s}</p>)}
      </div>
    </div>
  )
}


// ── Worked example builder ────────────────────────────────────────────────────

function fmt(n: number) { return parseFloat(n.toPrecision(4)).toString() }

function buildWorkedExample(rxn: Reaction) {
  const from = rxn.reactants[0]
  const to   = rxn.products[0] ?? rxn.reactants[rxn.reactants.length - 1]
  const massFrom = 20
  const molFrom  = massFrom / from.molarMass
  const molTo    = molFrom * (to.coeff / from.coeff)
  const massTo   = molTo * to.molarMass
  return {
    problem: `How many grams of ${to.display} are produced from ${massFrom} g of ${from.display}?`,
    steps: [
      `Balanced equation: ${rxn.equation}`,
      `mol ${from.display} = ${massFrom} g ÷ ${from.molarMass} g/mol = ${fmt(molFrom)} mol`,
      `mol ${to.display} = ${fmt(molFrom)} × (${to.coeff}/${from.coeff}) = ${fmt(molTo)} mol`,
      `mass ${to.display} = ${fmt(molTo)} × ${to.molarMass} g/mol = ${fmt(massTo)} g`,
    ],
    answer: `${fmt(massTo)} g ${to.display}`,
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function StoichiometryTool() {
  const [rxn,         setRxn]         = useState<Reaction>(() => generateReaction())
  const [fromFormula, setFromFormula] = useState(() => rxn.reactants[0].formula)
  const [fromVal,     setFromVal]     = useState('')
  const [fromUnit,    setFromUnit]    = useState<InputUnit>('g')
  const [toFormula,   setToFormula]   = useState(() => rxn.products[0]?.formula ?? rxn.reactants[rxn.reactants.length - 1].formula)
  const [toUnit,      setToUnit]      = useState<InputUnit>('g')
  const [result,      setResult]      = useState<StoichSolution | null>(null)
  const [steps,       setSteps]       = useState<string[]>([])
  const [sigBreakdown, setSigBreakdown] = useState<SigFigBreakdown | null>(null)
  const [sfOpen,      setSfOpen]      = useState(false)
  const [gasNote,     setGasNote]     = useState<string | null>(null)
  const [answerVal,   setAnswerVal]   = useState('')
  const [verified,    setVerified]    = useState<VerifyState>(null)

  const allSp = [...rxn.reactants, ...rxn.products]

  const stepsState = useStepsPanelState(steps, () => {
    const ex = buildWorkedExample(rxn)
    return { scenario: ex.problem, steps: ex.steps, result: ex.answer }
  })

  function applyReaction(r: Reaction) {
    setRxn(r)
    setFromFormula(r.reactants[0].formula)
    setToFormula(r.products[0]?.formula ?? r.reactants[r.reactants.length - 1].formula)
    setFromVal('')
    setResult(null)
    setSteps([])
    setSigBreakdown(null)
    setGasNote(null)
    setAnswerVal(''); setVerified(null)
  }

  function getSpecies(f: string) { return allSp.find(s => s.formula === f)! }

  function handleTool() {
    const fv = parseFloat(fromVal)
    if (isNaN(fv) || fv <= 0) return
    const from = getSpecies(fromFormula)
    const to   = getSpecies(toFormula)
    if (!from || !to || from.formula === to.formula) return
    const res = calcStoich(rxn, from, fv, fromUnit, to, toUnit)
    setResult(res)
    setSteps(res.steps)
    setVerified(null)

    if (fromUnit === 'g') {
      const sf = lowestSigFigs([fromVal])
      if (sf && toUnit === 'g') {
        setSigBreakdown(buildSigFigBreakdown(
          [{ label: from.display, value: fromVal }],
          res.rawAnswer, 'g',
        ))
      } else {
        setSigBreakdown(null)
      }

      if (answerVal) {
        const userSF = countSigFigs(answerVal)
        const valueOk = Math.abs(res.rawAnswer - parseFloat(answerVal)) / res.rawAnswer <= 0.01
        const sfOk = sf ? userSF === sf : true
        setVerified(!valueOk ? 'incorrect' : !sfOk ? 'sig_fig_warning' : 'correct')
      }
    } else {
      setSigBreakdown(null)
    }
  }

  const sigFigsResult = sigBreakdown ? formatSigFigs(sigBreakdown.rawResult, sigBreakdown.limiting) : null

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
          <CustomReactionForm onApply={applyReaction} />
        </div>
        <p className="font-mono text-sm text-secondary">{rxn.equation}</p>
      </div>

      {/* Gas volume helper */}
      <GasVolumePanel onUse={(moles, note) => {
        setFromVal(moles)
        setFromUnit('mol')
        setGasNote(note)
        setResult(null)
        setSteps([])
        setSigBreakdown(null)
        setVerified(null)
      }} />

      {/* Given row */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-secondary tracking-widest uppercase">Given</label>
          {gasNote && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-surface)))',
                color: 'var(--c-halogen)',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
              }}>
              from gas vol
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NumInput value={fromVal} onChange={v => { setFromVal(v); setResult(null); setSteps([]); setSigBreakdown(null); setGasNote(null); setVerified(null) }} />
          <UnitToggle unit={fromUnit} onChange={u => { setFromUnit(u); setResult(null); setSteps([]); setSigBreakdown(null); setGasNote(null); setVerified(null) }} />
          <span className="font-mono text-xs text-dim">of</span>
          <SpeciesSelect rxn={rxn} value={fromFormula}
            onChange={f => { setFromFormula(f); setResult(null); setSteps([]); setSigBreakdown(null); setVerified(null) }} exclude={toFormula} />
        </div>
        {gasNote && (
          <p className="font-mono text-xs text-secondary">{gasNote}</p>
        )}
      </div>

      {/* Find row */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-secondary tracking-widest uppercase">Find</label>
        <div className="flex flex-wrap items-center gap-2">
          <UnitToggle unit={toUnit} onChange={u => { setToUnit(u); setResult(null); setSteps([]); setSigBreakdown(null); setVerified(null) }} />
          <span className="font-mono text-xs text-dim">of</span>
          <SpeciesSelect rxn={rxn} value={toFormula}
            onChange={f => { setToFormula(f); setResult(null); setSteps([]); setSigBreakdown(null); setVerified(null) }} exclude={fromFormula} />
        </div>
      </div>

      <NumberField
        label="Your answer — optional, enter to check"
        value={answerVal}
        onChange={v => setAnswerVal(v)}
        placeholder="your answer"
        unit={<span className="font-mono text-sm text-secondary px-2">{toUnit}</span>}
      />

      <div className="flex items-stretch gap-2">
        <button onClick={handleTool} disabled={!fromVal || parseFloat(fromVal) <= 0}
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
        <ResultDisplay
          label={getSpecies(toFormula).display}
          value={String(result.answer)}
          unit={`${result.answerUnit}`}
          sigFigsValue={sigFigsResult}
          verified={verified}
        />
      )}

      <p className="font-mono text-xs text-secondary">mass ↔ moles (÷ M) → mole ratio → moles ↔ mass (× M)</p>
    </div>
  )
}
