import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CompoundDisplay from '../shared/CompoundDisplay'

interface Problem {
  acid: string; acidFormula: string; acidSmiles?: string; pkaAcid: number
  base: string; baseFormula: string
  conjAcid: string; conjAcidFormula: string; conjAcidSmiles?: string; pkaConjAcid: number
  conjBase: string; conjBaseFormula: string
  scenario: string
}

const POOL: Problem[] = [
  {
    scenario: 'NaOH added to acetic acid',
    acid: 'Acetic acid', acidFormula: 'CH₃COOH', acidSmiles: 'CC(=O)O', pkaAcid: 4.8,
    base: 'Hydroxide', baseFormula: 'OH⁻',
    conjAcid: 'Water', conjAcidFormula: 'H₂O', conjAcidSmiles: 'O', pkaConjAcid: 15.7,
    conjBase: 'Acetate', conjBaseFormula: 'CH₃COO⁻',
  },
  {
    scenario: 'Ethanol + sodium amide (NaNH₂)',
    acid: 'Ethanol', acidFormula: 'CH₃CH₂OH', acidSmiles: 'CCO', pkaAcid: 16,
    base: 'Amide (NH₂⁻)', baseFormula: 'NH₂⁻',
    conjAcid: 'Ammonia', conjAcidFormula: 'NH₃', conjAcidSmiles: 'N', pkaConjAcid: 36,
    conjBase: 'Ethoxide', conjBaseFormula: 'CH₃CH₂O⁻',
  },
  {
    scenario: 'Terminal alkyne + NaNH₂',
    acid: 'Propyne', acidFormula: 'CH₃C≡CH', acidSmiles: 'CC#C', pkaAcid: 25,
    base: 'Amide (NH₂⁻)', baseFormula: 'NH₂⁻',
    conjAcid: 'Ammonia', conjAcidFormula: 'NH₃', conjAcidSmiles: 'N', pkaConjAcid: 36,
    conjBase: 'Propynyl anion', conjBaseFormula: 'CH₃C≡C⁻',
  },
  {
    scenario: 'Acetic acid + acetylide anion',
    acid: 'Acetic acid', acidFormula: 'CH₃COOH', acidSmiles: 'CC(=O)O', pkaAcid: 4.8,
    base: 'Propynyl anion', baseFormula: 'CH₃C≡C⁻',
    conjAcid: 'Propyne', conjAcidFormula: 'CH₃C≡CH', conjAcidSmiles: 'CC#C', pkaConjAcid: 25,
    conjBase: 'Acetate', conjBaseFormula: 'CH₃COO⁻',
  },
  {
    scenario: 'Phenol + NaHCO₃',
    acid: 'Phenol', acidFormula: 'PhOH', acidSmiles: 'Oc1ccccc1', pkaAcid: 10,
    base: 'Bicarbonate', baseFormula: 'HCO₃⁻',
    conjAcid: 'Carbonic acid', conjAcidFormula: 'H₂CO₃', pkaConjAcid: 6.4,
    conjBase: 'Phenoxide', conjBaseFormula: 'PhO⁻',
  },
  {
    scenario: 'Carboxylic acid + NaHCO₃',
    acid: 'Butanoic acid', acidFormula: 'CH₃CH₂CH₂COOH', acidSmiles: 'CCCC(=O)O', pkaAcid: 4.8,
    base: 'Bicarbonate', baseFormula: 'HCO₃⁻',
    conjAcid: 'Carbonic acid', conjAcidFormula: 'H₂CO₃', pkaConjAcid: 6.4,
    conjBase: 'Butanoate', conjBaseFormula: 'CH₃CH₂CH₂COO⁻',
  },
  {
    scenario: 'Acetone α-H + NaOH',
    acid: 'Acetone', acidFormula: 'CH₃COCH₃', acidSmiles: 'CC(C)=O', pkaAcid: 20,
    base: 'Hydroxide', baseFormula: 'OH⁻',
    conjAcid: 'Water', conjAcidFormula: 'H₂O', conjAcidSmiles: 'O', pkaConjAcid: 15.7,
    conjBase: 'Acetone enolate', conjBaseFormula: '⁻CH₂COCH₃',
  },
]

function pickRandom(): Problem {
  return POOL[Math.floor(Math.random() * POOL.length)]
}

export default function EquilibriumPredictor() {
  const [problem, setProblem] = useState<Problem>(pickRandom)
  const [sideAnswer, setSideAnswer] = useState<'reactants' | 'products' | null>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [stepsOpen, setStepsOpen] = useState(false)

  const pKeq = +(problem.pkaConjAcid - problem.pkaAcid).toFixed(1)
  const favorProducts = pKeq > 0
  const correct = sideAnswer === (favorProducts ? 'products' : 'reactants')

  function handleCheck() {
    if (!sideAnswer || checked) return
    setChecked(true)
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setProblem(pickRandom())
    setSideAnswer(null)
    setChecked(false)
    setStepsOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'rgb(var(--color-success))' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <span className="font-mono text-xs text-secondary shrink-0">{score.correct} / {score.total}</span>
        </div>
      )}

      {/* Rule box */}
      <div className="rounded-sm border border-border p-3 flex flex-col gap-1" style={{ background: 'rgb(var(--color-raised))' }}>
        <p className="font-mono text-[10px] text-dim uppercase tracking-widest">Key Rule</p>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Equilibrium favors the <strong className="text-primary">weaker acid</strong> (higher pKₐ) side.
          pK<sub>eq</sub> = pKₐ(product acid) − pKₐ(reactant acid). Positive pK<sub>eq</sub> → products favored.
        </p>
      </div>

      {/* Reaction */}
      <div className="rounded-sm border border-border p-4 flex flex-col gap-4" style={{ background: 'rgb(var(--color-raised))' }}>
        <p className="font-sans text-sm font-medium text-primary">{problem.scenario}</p>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start text-sm font-sans">
          {/* Reactants */}
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[10px] text-dim uppercase tracking-widest">Reactants</p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                {problem.acidSmiles ? (
                  <CompoundDisplay smiles={problem.acidSmiles} label={problem.acid} width={140} height={110} />
                ) : (
                  <>
                    <span className="font-mono text-primary">{problem.acidFormula}</span>
                    <span className="text-xs text-secondary">{problem.acid}</span>
                  </>
                )}
                {checked && <span className="font-mono text-xs text-dim">pKₐ = {problem.pkaAcid}</span>}
              </div>
              <span className="text-dim font-semibold">+</span>
              <div className="flex flex-col">
                <span className="font-mono text-primary">{problem.baseFormula}</span>
                <span className="text-xs text-secondary">{problem.base}</span>
              </div>
            </div>
          </div>

          <span className="font-mono text-xl text-dim self-center mt-8">⇌</span>

          {/* Products */}
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[10px] text-dim uppercase tracking-widest">Products</p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                {problem.conjAcidSmiles ? (
                  <CompoundDisplay smiles={problem.conjAcidSmiles} label={problem.conjAcid} width={140} height={110} />
                ) : (
                  <>
                    <span className="font-mono text-primary">{problem.conjAcidFormula}</span>
                    <span className="text-xs text-secondary">{problem.conjAcid}</span>
                  </>
                )}
                {checked && <span className="font-mono text-xs text-dim">pKₐ = {problem.pkaConjAcid}</span>}
              </div>
              <span className="text-dim font-semibold">+</span>
              <div className="flex flex-col">
                <span className="font-mono text-primary">{problem.conjBaseFormula}</span>
                <span className="text-xs text-secondary">{problem.conjBase}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <p className="font-sans text-sm text-primary font-medium">Which side does the equilibrium favor?</p>
      <div className="grid grid-cols-2 gap-3">
        {(['reactants', 'products'] as const).map(side => {
          const isSelected = sideAnswer === side
          const isCorrect = side === (favorProducts ? 'products' : 'reactants')
          let borderColor = 'rgb(var(--color-border))'
          let bg = 'rgb(var(--color-raised))'
          if (checked) {
            if (isCorrect) { borderColor = 'rgb(var(--color-success))'; bg = 'rgb(var(--color-success-bg) / 0.06)' }
            else if (isSelected) { borderColor = 'rgb(var(--color-error))'; bg = 'rgb(var(--color-error-bg) / 0.06)' }
          } else if (isSelected) {
            borderColor = 'var(--c-halogen)'
            bg = 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))'
          }
          return (
            <button key={side} onClick={() => !checked && setSideAnswer(side)}
              disabled={checked}
              className="py-3 rounded-sm border font-sans text-sm font-medium capitalize transition-colors"
              style={{ borderColor, background: bg, color: isSelected ? 'var(--c-halogen)' : 'rgb(var(--overlay)/0.6)' }}>
              {side}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        {!checked ? (
          <button onClick={handleCheck} disabled={!sideAnswer}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium disabled:opacity-40"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                     color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' }}>
            Check
          </button>
        ) : (
          <button onClick={handleNext}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                     color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' }}>
            Next
          </button>
        )}
        {checked && (
          <button onClick={() => setStepsOpen(o => !o)}
            className="px-4 py-1.5 rounded-sm text-sm font-sans font-medium border border-border text-secondary hover:text-primary">
            {stepsOpen ? 'Hide' : 'Solution'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {checked && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-sm border px-4 py-2.5 font-sans text-sm font-semibold ${correct ? 'text-success feedback-success' : 'text-error feedback-error'}`}
            style={{ background: correct ? 'rgb(var(--color-success-bg) / 0.06)' : 'rgb(var(--color-error-bg) / 0.06)' }}>
            {correct ? '✓ Correct!' : `✗ Incorrect — equilibrium favors ${favorProducts ? 'products' : 'reactants'}.`}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checked && stepsOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="rounded-sm border border-border p-4 flex flex-col gap-2" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-mono text-[10px] text-dim uppercase tracking-widest">Solution</p>
            <p className="font-sans text-xs text-secondary">
              Reactant acid: <span className="font-mono text-primary">{problem.acid}</span>, pKₐ = {problem.pkaAcid}
            </p>
            <p className="font-sans text-xs text-secondary">
              Product acid: <span className="font-mono text-primary">{problem.conjAcid}</span>, pKₐ = {problem.pkaConjAcid}
            </p>
            <p className="font-sans text-xs text-secondary">
              pK<sub>eq</sub> = {problem.pkaConjAcid} − {problem.pkaAcid} = <strong className="text-primary">{pKeq}</strong>
            </p>
            <p className="font-sans text-xs text-secondary">
              {pKeq > 0
                ? `pKeq > 0, so equilibrium strongly favors PRODUCTS. ${Math.abs(pKeq) > 5 ? 'The reaction is essentially complete.' : 'The equilibrium lies to the right.'}`
                : `pKeq < 0, so equilibrium strongly favors REACTANTS. The product acid is weaker than the reactant acid, so the reverse is favored.`
              }
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
