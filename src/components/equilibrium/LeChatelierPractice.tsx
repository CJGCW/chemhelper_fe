import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props { allowCustom?: boolean }

type CheckState = 'idle' | 'correct' | 'wrong'
type Direction = 'forward' | 'reverse' | 'no-shift'

interface Scenario {
  id: string
  reaction: string
  stress: string
  answer: Direction
  explanation: string
}

const SCENARIOS: Scenario[] = [
  {
    id: 'n2o4-add-n2o4',
    reaction: 'N\u2082O\u2084(g) \u21cc 2NO\u2082(g)',
    stress: 'More N\u2082O\u2084(g) is added to the system.',
    answer: 'forward',
    explanation: 'Adding a reactant increases Q temporarily below K. The reaction shifts forward to consume the added N\u2082O\u2084.',
  },
  {
    id: 'n2o4-remove-no2',
    reaction: 'N\u2082O\u2084(g) \u21cc 2NO\u2082(g)',
    stress: 'Some NO\u2082(g) is removed from the system.',
    answer: 'forward',
    explanation: 'Removing a product lowers Q below K. The reaction shifts forward to replenish the removed NO\u2082.',
  },
  {
    id: 'haber-increase-p',
    reaction: 'N\u2082(g) + 3H\u2082(g) \u21cc 2NH\u2083(g)',
    stress: 'The pressure is increased by decreasing the volume.',
    answer: 'forward',
    explanation: '\u0394n = 2 \u2212 4 = \u22122 (fewer moles of gas on right). Increasing pressure shifts toward the side with fewer gas moles \u2014 forward.',
  },
  {
    id: 'haber-increase-T',
    reaction: 'N\u2082(g) + 3H\u2082(g) \u21cc 2NH\u2083(g) (\u0394H = \u221292 kJ/mol)',
    stress: 'The temperature is increased.',
    answer: 'reverse',
    explanation: 'The reaction is exothermic (heat is a product). Increasing T shifts equilibrium toward reactants (reverse) and decreases K.',
  },
  {
    id: 'haber-add-ar',
    reaction: 'N\u2082(g) + 3H\u2082(g) \u21cc 2NH\u2083(g)',
    stress: 'Argon (an inert gas) is added at constant volume.',
    answer: 'no-shift',
    explanation: 'Adding an inert gas at constant volume does not change the partial pressures of the reacting gases. No shift occurs.',
  },
  {
    id: 'endo-decrease-T',
    reaction: 'CO\u2082(g) + H\u2082(g) \u21cc CO(g) + H\u2082O(g) (\u0394H = +41 kJ/mol)',
    stress: 'The temperature is decreased.',
    answer: 'reverse',
    explanation: 'This reaction is endothermic (heat is a reactant). Decreasing T is like removing a reactant \u2014 shifts reverse, and K decreases.',
  },
  {
    id: 'cocl2-remove-co',
    reaction: 'CO(g) + Cl\u2082(g) \u21cc COCl\u2082(g)',
    stress: 'Some CO(g) is removed from the system.',
    answer: 'reverse',
    explanation: 'Removing a reactant raises Q above K (fewer reactants means less driving force). Reaction shifts reverse to regenerate CO.',
  },
  {
    id: 'pcl5-increase-p',
    reaction: 'PCl\u2085(g) \u21cc PCl\u2083(g) + Cl\u2082(g)',
    stress: 'The pressure is decreased by increasing the volume.',
    answer: 'forward',
    explanation: '\u0394n = 2 \u2212 1 = +1 (more moles of gas on right). Decreasing pressure shifts toward more gas moles \u2014 forward.',
  },
  {
    id: 'caco3-add-caco3',
    reaction: 'CaCO\u2083(s) \u21cc CaO(s) + CO\u2082(g)',
    stress: 'More CaCO\u2083(s) is added.',
    answer: 'no-shift',
    explanation: 'CaCO\u2083 is a pure solid. Its concentration is constant and does not appear in K. Adding more solid has no effect on equilibrium.',
  },
  {
    id: 'fe-scn-add-scn',
    reaction: 'Fe\u00b3\u207a(aq) + SCN\u207b(aq) \u21cc FeSCN\u00b2\u207a(aq)',
    stress: 'More SCN\u207b(aq) is added.',
    answer: 'forward',
    explanation: 'Adding SCN\u207b (a reactant) increases Q temporarily. Reaction shifts forward to consume the excess SCN\u207b and form more FeSCN\u00b2\u207a.',
  },
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function LeChatelierPractice({ allowCustom = true }: Props) {
  const [scenario, setScenario]     = useState<Scenario>(() => pickRandom(SCENARIOS))
  const [selected, setSelected]     = useState<Direction | ''>('')
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [score, setScore]           = useState({ correct: 0, total: 0 })
  const [seen, setSeen]             = useState<Set<string>>(() => new Set())

  useEffect(() => { if (!allowCustom) nextProblem() }, [allowCustom])

  function nextProblem() {
    const unseen = SCENARIOS.filter(s => !seen.has(s.id))
    const pool = unseen.length > 0 ? unseen : SCENARIOS
    const next = pickRandom(pool)
    setScenario(next)
    setSeen(prev => new Set([...prev, next.id]))
    setSelected('')
    setCheckState('idle')
  }

  function handleCheck() {
    if (!selected || checkState !== 'idle') return
    const correct = selected === scenario.answer
    setCheckState(correct ? 'correct' : 'wrong')
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const borderClass = checkState === 'correct'
    ? 'border-emerald-800/50 bg-emerald-950/20'
    : checkState === 'wrong'
    ? 'border-rose-800/50 bg-rose-950/20'
    : 'border-border bg-surface'

  const options: { id: Direction; label: string }[] = [
    { id: 'forward',  label: '\u2192 Shifts forward (toward products)' },
    { id: 'reverse',  label: '\u2190 Shifts reverse (toward reactants)' },
    { id: 'no-shift', label: '\u21cc No shift (equilibrium unchanged)' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Apply Le Chatelier's Principle: given the stress on the equilibrium system, predict the direction of shift.
      </p>

      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.correct}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-raised">
            <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }}
              transition={{ duration: 0.3 }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={scenario.id}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${borderClass}`}
        >
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-secondary uppercase tracking-wider">Reaction at equilibrium</p>
            <p className="font-mono text-sm text-primary">{scenario.reaction}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-xs text-secondary uppercase tracking-wider">Stress applied</p>
            <p className="font-sans text-base text-bright leading-relaxed">{scenario.stress}</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-sans text-sm text-secondary">What happens to the equilibrium?</p>
            <div className="flex flex-col gap-2">
              {options.map(opt => {
                const isSelected = selected === opt.id
                const isCorrectAnswer = opt.id === scenario.answer
                let borderColor = isSelected ? 'color-mix(in srgb, var(--c-halogen) 40%, transparent)' : 'rgb(var(--color-border))'
                let bgColor = isSelected ? 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-raised)))' : 'rgb(var(--color-raised))'
                let textColor = isSelected ? 'var(--c-halogen)' : 'rgb(var(--color-secondary))'

                if (checkState !== 'idle') {
                  if (isCorrectAnswer) {
                    borderColor = 'rgba(34,197,94,0.5)'
                    bgColor = 'rgba(34,197,94,0.05)'
                    textColor = 'rgb(34 197 94)'
                  } else if (isSelected && !isCorrectAnswer) {
                    borderColor = 'rgba(239,68,68,0.5)'
                    bgColor = 'rgba(239,68,68,0.05)'
                    textColor = 'rgb(239 68 68)'
                  }
                }

                return (
                  <button key={opt.id}
                    onClick={() => checkState === 'idle' && setSelected(opt.id)}
                    disabled={checkState !== 'idle'}
                    className="w-full text-left px-4 py-2.5 rounded-sm font-sans text-sm transition-colors disabled:cursor-default"
                    style={{ border: `1px solid ${borderColor}`, background: bgColor, color: textColor }}>
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {checkState === 'idle' && (
            <button onClick={handleCheck} disabled={!selected}
              className="self-start px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-30"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                color: 'var(--c-halogen)',
              }}>
              Check
            </button>
          )}

          {checkState !== 'idle' && (
            <div className="flex flex-col gap-1.5">
              <p className={`font-sans text-sm font-medium ${checkState === 'correct' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {checkState === 'correct' ? '\u2713 Correct!' : '\u2717 Incorrect'}
              </p>
              <p className="font-sans text-sm text-secondary leading-relaxed">{scenario.explanation}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {checkState !== 'idle' && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={nextProblem}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors">
            Next &rarr;
          </button>
        </motion.div>
      )}
      <p className="font-mono text-xs text-secondary">10 scenarios \u2022 based on Chang Ch. 14</p>
    </div>
  )
}
