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
  // ── Diels-Alder products ────────────────────────────────────────────────
  {
    question: '1,3-Butadiene + maleic anhydride → Diels-Alder product. What is the ring size of the cyclic product?',
    choices: ['6-membered ring (cyclohexene derivative)', '4-membered ring', '5-membered ring', '8-membered ring'],
    answer: '6-membered ring (cyclohexene derivative)',
    explanation: '[4+2] cycloaddition always produces a six-membered ring. The 4π diene (4 carbons) plus the 2π dienophile (2 carbons) form a six-membered ring with one remaining double bond at the 2,3-position of the original diene.',
  },
  {
    question: 'In the Diels-Alder reaction of 1,3-butadiene with maleic anhydride, the stereochemistry of the product is:',
    choices: ['cis (same side) relative to the ring — endo/exo both give cis', 'trans relative to the ring', 'Racemic mixture with no defined stereochemistry'],
    answer: 'cis (same side) relative to the ring — endo/exo both give cis',
    explanation: 'Maleic anhydride is a cis-dienophile, and the Diels-Alder reaction is a suprafacial/suprafacial concerted process. The two substituents on the dienophile end up cis to each other in the product regardless of endo/exo approach.',
  },
  {
    question: 'Which diene/dienophile pair will NOT react readily in a Diels-Alder?',
    choices: [
      '1,3-Butadiene + (E,E)-2,4-hexadiene (both dienes, no dienophile)',
      'Cyclopentadiene + maleic anhydride',
      '1,3-Butadiene + acrolein (CH₂=CH–CHO)',
    ],
    answer: '1,3-Butadiene + (E,E)-2,4-hexadiene (both dienes, no dienophile)',
    explanation: 'Diels-Alder requires one component to be the diene (4π) and the other to be the dienophile (2π, preferably electron-poor). Two dienes have no electron-deficient π system to serve as the dienophile.',
  },
  // ── Endo/exo selectivity ────────────────────────────────────────────────
  {
    question: 'In the Diels-Alder reaction of cyclopentadiene with a dienophile bearing a carbonyl group, the endo product is kinetically preferred because:',
    choices: [
      'Secondary orbital interactions stabilize the endo transition state',
      'The exo approach has higher steric strain',
      'The endo product is thermodynamically more stable',
    ],
    answer: 'Secondary orbital interactions stabilize the endo transition state',
    explanation: 'Endo selectivity arises from favorable secondary orbital interactions between the carbonyl π* (or other π groups) on the dienophile and the diene π system in the endo transition state. This "endo rule" is kinetic — the endo product is often less stable than exo but forms faster.',
  },
  {
    question: 'The endo product from cyclopentadiene + maleic anhydride has the anhydride group pointing:',
    choices: ['Toward the diene bridge (syn)', 'Away from the diene bridge (anti)', 'In the ring plane'],
    answer: 'Toward the diene bridge (syn)',
    explanation: 'In the endo transition state, the carbonyl groups of maleic anhydride point TOWARD (syn) the bridging CH₂ of cyclopentadiene. In the exo product, they point away (anti). The endo product is the kinetically preferred product due to secondary orbital interactions.',
  },
  // ── MO theory ───────────────────────────────────────────────────────────
  {
    question: 'In 1,3-butadiene\'s molecular orbital diagram (ψ₁–ψ₄), which orbital is the HOMO in the ground state?',
    choices: ['ψ₂ (one node, bonding)', 'ψ₁ (no nodes, lowest energy)', 'ψ₃ (two nodes, antibonding)', 'ψ₄ (three nodes, highest energy)'],
    answer: 'ψ₂ (one node, bonding)',
    explanation: 'Butadiene has 4 π electrons occupying ψ₁ and ψ₂. ψ₂ is the highest occupied MO (HOMO). It has one node between C2 and C3, making the C1-C2 and C3-C4 bonds have more π character while C2-C3 has less.',
  },
  {
    question: 'Normal-demand Diels-Alder proceeds by interaction of diene HOMO with dienophile LUMO. For an electron-poor dienophile (e.g., acrolein), the LUMO energy is:',
    choices: [
      'Lower than an unactivated alkene — smaller HOMO-LUMO gap, faster reaction',
      'Higher than an unactivated alkene — smaller HOMO-LUMO gap',
      'The same — withdrawing groups don\'t affect LUMO',
    ],
    answer: 'Lower than an unactivated alkene — smaller HOMO-LUMO gap, faster reaction',
    explanation: 'Electron-withdrawing groups (CHO, CN, NO₂, CO₂R) lower the LUMO of the dienophile. This decreases the energy gap between diene HOMO and dienophile LUMO, accelerating the concerted [4+2] reaction.',
  },
  // ── Allylic resonance and stability ────────────────────────────────────
  {
    question: 'After protonation of 1,3-butadiene at C1, the resulting allylic cation has positive charge delocalized over which carbons?',
    choices: ['C2 and C4', 'C1 and C3', 'Only C2'],
    answer: 'C2 and C4',
    explanation: 'H⁺ adds to C1, giving a carbocation at C2. Resonance delocalizes it to C4 through the adjacent C3=C4 π bond: CH₃–⁺CH–CH=CH₂ ↔ CH₃–CH=CH–⁺CH₂. Nucleophile attack at C2 = 1,2-product; at C4 = 1,4-product.',
  },
  {
    question: 'Compared to a simple allylic carbocation, a pentadienyl (extended allylic) cation is:',
    choices: [
      'More stable — charge delocalized over more carbons',
      'Less stable — more nodes in the orbital',
      'The same stability',
    ],
    answer: 'More stable — charge delocalized over more carbons',
    explanation: 'Extended conjugation spreads the positive charge over more carbons (C1, C3, C5 in a pentadienyl cation vs C1, C3 in an allyl cation), lowering the energy and increasing stability.',
  },
  // ── Diels-Alder regiochemistry ──────────────────────────────────────────
  {
    question: 'In the Diels-Alder reaction of 1-methoxy-1,3-butadiene (electron-rich at C1) with acrolein (CHO at C3 of the dienophile), which regiochemical outcome is predicted by the "ortho/para" rule?',
    choices: [
      '"ortho" product: substituents 1,2 to each other in the ring',
      '"meta" product: substituents 1,3 to each other in the ring',
      'No regioselectivity — equal mixture',
    ],
    answer: '"ortho" product: substituents 1,2 to each other in the ring',
    explanation: 'The ortho/para rule for Diels-Alder: when the diene has a substituent at C1 and the dienophile has a substituent at C1, the preferred regioisomer places them 1,2 ("ortho") in the product ring. The alternative 1,3 ("meta") arrangement is disfavored by FMO analysis.',
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

export default function ConjugatedDieneProblems({ allowCustom = true }: Props) {
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

      <p className="font-sans text-sm text-secondary">Advanced problems: Diels-Alder, stereochemistry, MO theory, regiochemistry.</p>

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

          <div className="p-4 rounded-sm border border-border bg-surface flex flex-col gap-2">
            {problem.context && (
              <p className="font-mono text-sm text-secondary px-2 py-1 rounded-sm"
                style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
                {problem.context}
              </p>
            )}
            <p className="font-sans text-base text-bright leading-relaxed">{problem.question}</p>
          </div>

          <div className="flex flex-col gap-2">
            {problem.shuffled.map(choice => {
              const isSelected = selected === choice
              const isCorrect = choice === problem.answer
              let cls = 'border-border text-secondary hover:border-muted hover:text-primary'
              if (checked && isCorrect)                cls = 'feedback-success text-success-strong'
              if (checked && isSelected && !isCorrect) cls = 'feedback-error text-error-strong'
              return (
                <button key={choice} disabled={checked} onClick={() => handleSelect(choice)}
                  className={`text-left px-4 py-2.5 rounded-sm border font-sans text-sm transition-colors disabled:cursor-default ${cls}`}>
                  {choice}
                </button>
              )
            })}
          </div>

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
