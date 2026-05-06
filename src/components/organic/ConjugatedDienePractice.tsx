import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MCProblem {
  question: string
  context?: string
  choices: string[]
  answer: string
  explanation: string
}

const PROBLEMS: MCProblem[] = [
  // ── Classify the diene ──────────────────────────────────────────────────
  {
    question: 'Classify 1,3-butadiene (CH₂=CH–CH=CH₂).',
    choices: ['Conjugated', 'Isolated', 'Cumulated'],
    answer: 'Conjugated',
    explanation: 'Alternating single and double bonds (one single bond between two double bonds) → conjugated diene.',
  },
  {
    question: 'Classify 1,4-pentadiene (CH₂=CH–CH₂–CH=CH₂).',
    choices: ['Conjugated', 'Isolated', 'Cumulated'],
    answer: 'Isolated',
    explanation: 'The two double bonds are separated by a CH₂ group (sp³ carbon) → isolated diene. No conjugation.',
  },
  {
    question: 'Classify 1,2-propadiene (allene, CH₂=C=CH₂).',
    choices: ['Conjugated', 'Isolated', 'Cumulated'],
    answer: 'Cumulated',
    explanation: 'Two consecutive double bonds share the central carbon → cumulated diene (allene). The central carbon is sp-hybridized.',
  },
  {
    question: 'Classify 2,4-hexadiene (CH₃–CH=CH–CH=CH–CH₃).',
    choices: ['Conjugated', 'Isolated', 'Cumulated'],
    answer: 'Conjugated',
    explanation: 'Single bond between two double bonds with no intervening sp³ carbon → conjugated. Extended π system.',
  },
  {
    question: 'Classify cyclopentadiene.',
    choices: ['Conjugated', 'Isolated', 'Cumulated'],
    answer: 'Conjugated',
    explanation: 'Cyclopentadiene has two adjacent double bonds in the ring separated by a single bond → conjugated. It is also locked in s-cis conformation, making it highly reactive in Diels-Alder reactions.',
  },
  // ── s-cis vs s-trans ────────────────────────────────────────────────────
  {
    question: 'Which conformation of a conjugated diene is required for the Diels-Alder reaction?',
    choices: ['s-cis', 's-trans', 'Either works'],
    answer: 's-cis',
    explanation: 'The s-cis conformation (both double bonds on the same face, dihedral ≈ 0°) is required for [4+2] cycloaddition — only in this geometry can both ends of the diene bond simultaneously to the dienophile.',
  },
  {
    question: 'For acyclic 1,3-butadiene, which conformation is more stable at room temperature?',
    choices: ['s-trans', 's-cis', 'They are equally stable'],
    answer: 's-trans',
    explanation: 's-trans (dihedral 180°) is more stable for acyclic dienes because it minimizes steric strain between the terminal CH₂ groups. About 95% of butadiene is s-trans at room temperature.',
  },
  {
    question: 'Why does (E)-1,3-pentadiene react much more slowly in Diels-Alder reactions than cyclopentadiene?',
    choices: [
      'It cannot adopt s-cis conformation due to steric clash',
      'It is an isolated diene',
      'It has no HOMO electrons',
    ],
    answer: 'It cannot adopt s-cis conformation due to steric clash',
    explanation: '(E)-1,3-pentadiene has a trans methyl group that severely destabilizes the s-cis form due to steric interaction. Cyclopentadiene is locked s-cis and reacts very rapidly.',
  },
  // ── 1,2 vs 1,4 addition ─────────────────────────────────────────────────
  {
    question: '1,3-Butadiene + HBr at −78°C: which product is the major product?',
    choices: ['3-bromo-1-butene (1,2-product)', '1-bromo-2-butene (1,4-product)'],
    answer: '3-bromo-1-butene (1,2-product)',
    explanation: 'At low temperature, kinetic control favors the 1,2-addition product. The nucleophile (Br⁻) attacks the nearest carbon of the allylic cation (C2) faster than it diffuses to C4.',
  },
  {
    question: '1,3-Butadiene + HBr at 60°C (equilibrating conditions): which product predominates?',
    choices: ['1-bromo-2-butene (1,4-product)', '3-bromo-1-butene (1,2-product)'],
    answer: '1-bromo-2-butene (1,4-product)',
    explanation: 'At high temperature, thermodynamic control favors the 1,4-product. The internal, more substituted alkene (C2=C3) in the 1,4-product is more stable than the terminal alkene in the 1,2-product.',
  },
  {
    question: 'The allylic cation formed when HX adds to C1 of 1,3-butadiene is best described as:',
    choices: [
      'Delocalized over C2–C3–C4 (resonance-stabilized)',
      'Localized on C2 only',
      'Localized on C4 only',
    ],
    answer: 'Delocalized over C2–C3–C4 (resonance-stabilized)',
    explanation: 'After H⁺ adds to C1, the cation at C2 delocalizes via the adjacent π bond to place positive charge also at C4. Both C2 and C4 are electrophilic sites — nucleophile attack at C2 gives 1,2-product, attack at C4 gives 1,4-product.',
  },
  // ── Stability and conjugation ───────────────────────────────────────────
  {
    question: 'Compared to two isolated double bonds, a conjugated diene has:',
    choices: [
      'Lower energy (extra stabilization from conjugation)',
      'Higher energy (strain from conjugation)',
      'The same energy',
    ],
    answer: 'Lower energy (extra stabilization from conjugation)',
    explanation: 'Conjugation lowers the energy via π-electron delocalization. The heat of hydrogenation of 1,3-butadiene (~239 kJ/mol) is less than twice that of 1-butene (~254 kJ/mol), confirming ~15 kJ/mol resonance stabilization.',
  },
  {
    question: 'Which UV absorption correctly compares an isolated vs conjugated diene?',
    choices: [
      'Conjugated diene absorbs at longer wavelength (lower energy)',
      'Isolated diene absorbs at longer wavelength',
      'Both absorb at the same wavelength',
    ],
    answer: 'Conjugated diene absorbs at longer wavelength (lower energy)',
    explanation: 'Extending conjugation lowers the HOMO–LUMO gap, shifting UV absorption to longer wavelengths (bathochromic shift). Isolated dienes absorb ~170 nm; 1,3-butadiene absorbs ~217 nm.',
  },
  // ── Diels-Alder basics ──────────────────────────────────────────────────
  {
    question: 'In a Diels-Alder [4+2] cycloaddition, the diene contributes how many electrons to new bond formation?',
    choices: ['4 electrons', '2 electrons', '6 electrons'],
    answer: '4 electrons',
    explanation: 'The diene is the 4π component (4 electrons from two π bonds); the dienophile is the 2π component (2 electrons from one π bond). Together they form two new σ bonds in a concerted [4+2] cycloaddition.',
  },
  {
    question: 'Which combination would undergo Diels-Alder reaction most readily?',
    choices: [
      'Electron-rich diene + electron-poor dienophile',
      'Electron-poor diene + electron-poor dienophile',
      'Electron-rich diene + electron-rich dienophile',
    ],
    answer: 'Electron-rich diene + electron-poor dienophile',
    explanation: 'Normal-electron-demand Diels-Alder is favored when the diene HOMO interacts with the dienophile LUMO. Electron-withdrawing groups on the dienophile lower its LUMO energy, decreasing the HOMO-LUMO gap and accelerating the reaction.',
  },
]

function pick(): MCProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Props { allowCustom?: boolean }

export default function ConjugatedDienePractice({ allowCustom = true }: Props) {
  void allowCustom
  const [problem, setProblem] = useState<MCProblem & { shuffled: string[] }>(() => {
    const p = pick()
    return { ...p, shuffled: shuffle(p.choices) }
  })
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })

  function nextProblem() {
    let p: MCProblem
    do { p = pick() } while (p.question === problem.question && PROBLEMS.length > 1)
    setProblem({ ...p, shuffled: shuffle(p.choices) })
    setSelected(null)
  }

  function handleSelect(choice: string) {
    if (selected !== null) return
    const correct = choice === problem.answer
    setSelected(choice)
    setScore(s => ({ right: s.right + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const checked = selected !== null

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Score bar */}
      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.right}</span>
            <span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-raised">
            <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.right / score.total) * 100}%` }}
              transition={{ duration: 0.3 }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={problem.question}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className="flex flex-col gap-4">

          {/* Question card */}
          <div className="p-4 rounded-sm border border-border bg-surface flex flex-col gap-2">
            {problem.context && (
              <p className="font-mono text-sm text-secondary px-2 py-1 rounded-sm"
                style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
                {problem.context}
              </p>
            )}
            <p className="font-sans text-base text-bright leading-relaxed">{problem.question}</p>
          </div>

          {/* Choice buttons */}
          <div className="flex flex-col gap-2">
            {problem.shuffled.map(choice => {
              const isSelected = selected === choice
              const isCorrect = choice === problem.answer
              let cls = 'border-border text-secondary hover:border-muted hover:text-primary'
              if (checked && isCorrect)                    cls = 'feedback-success text-success-strong'
              if (checked && isSelected && !isCorrect)     cls = 'feedback-error text-error-strong'
              return (
                <button key={choice} disabled={checked} onClick={() => handleSelect(choice)}
                  className={`text-left px-4 py-2.5 rounded-sm border font-sans text-sm transition-colors disabled:cursor-default ${cls}`}>
                  {choice}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {checked && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-sm border font-sans text-sm leading-relaxed
                ${selected === problem.answer
                  ? 'feedback-success text-success-strong'
                  : 'feedback-error text-error-strong'}`}>
              <span className="font-semibold">{selected === problem.answer ? '✓ Correct. ' : `✗ Incorrect — ${problem.answer}. `}</span>
              {problem.explanation}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {checked && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={nextProblem}
            className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            }}>
            Next Problem →
          </button>
        </motion.div>
      )}
    </div>
  )
}
