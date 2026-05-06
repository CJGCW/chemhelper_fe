import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Problem {
  scenario: string
  question: string
  choices: string[]
  correct: number // index into choices
  explanation: string
}

const PROBLEMS: Problem[] = [
  {
    scenario: 'A hydroxide ion (HO⁻) attacks the carbonyl carbon of an aldehyde (R–CHO).',
    question: 'Where does the tail of the first curved arrow start?',
    choices: [
      'On the lone pair of the oxygen of HO⁻',
      'On the C=O pi bond',
      'On the C–H bond of the aldehyde',
      'On the carbonyl oxygen',
    ],
    correct: 0,
    explanation: 'The nucleophile (HO⁻) donates electrons. The arrow tail starts at the lone pair on the nucleophilic oxygen, and the head points to the electrophilic carbonyl carbon.',
  },
  {
    scenario: 'HBr adds to propene (CH₂=CHCH₃). In the first step, the pi electrons of the alkene attack H of HBr.',
    question: 'How many curved arrows are drawn for this first step?',
    choices: ['1', '2', '3', '4'],
    correct: 1,
    explanation: 'Two arrows: (1) alkene pi bond → H of HBr, and (2) H–Br bond → Br. Two bonds break/form, so two arrows are needed.',
  },
  {
    scenario: 'In a radical halogenation mechanism, Cl₂ undergoes homolytic cleavage when irradiated with light.',
    question: 'What type of curved arrow is used to show homolytic bond cleavage?',
    choices: [
      'Full-headed (two-electron) arrow',
      'Half-headed (fishhook) arrow',
      'Double-headed resonance arrow',
      'Equilibrium arrow',
    ],
    correct: 1,
    explanation: 'Homolytic cleavage splits a bond with one electron going to each fragment. Fishhook arrows (half-headed) show single-electron movement, used in radical mechanisms.',
  },
  {
    scenario: 'In an E2 elimination, a base removes a beta hydrogen, and the electrons flow to form a new pi bond while the leaving group departs.',
    question: 'How many curved arrows describe a concerted E2 step?',
    choices: ['1', '2', '3', '4'],
    correct: 2,
    explanation: 'Three arrows: (1) base lone pair → beta H, (2) C–H bond → C=C pi bond (new pi bond forms), (3) C–LG bond → leaving group (LG departs). One step, three electron flows.',
  },
  {
    scenario: 'In an SN2 reaction, a nucleophile attacks a carbon bearing a leaving group.',
    question: 'The head of the curved arrow from the nucleophile points to:',
    choices: [
      'The leaving group',
      'The carbon bonded to the leaving group',
      'The lone pair on the leaving group',
      'Any adjacent hydrogen',
    ],
    correct: 1,
    explanation: 'The nucleophile (Nu:) donates a lone pair to the electrophilic carbon (not the leaving group). The arrow goes Nu: → C. A second arrow then goes C–LG bond → LG.',
  },
  {
    scenario: 'A carboxylate ion has two equivalent resonance structures. You are drawing the resonance arrow from one form to the other.',
    question: 'In resonance arrow-pushing, which statement is correct?',
    choices: [
      'Atoms move to reflect the resonance contributor',
      'Only electrons move — atoms stay fixed',
      'Both electrons and the H atom move between the two oxygens',
      'Each resonance form is a separate real molecule',
    ],
    correct: 1,
    explanation: 'Resonance is a drawing convention — only electrons (lone pairs and pi bonds) move between contributors. Atoms never move. The resonance hybrid is the real species.',
  },
  {
    scenario: 'You are drawing the mechanism for proton transfer from acetic acid (CH₃COOH) to water.',
    question: 'Which arrow correctly shows the first step?',
    choices: [
      'Tail at O–H bond; head at water oxygen',
      'Tail at water lone pair; head at H of O–H',
      'Tail at C=O pi bond; head at water oxygen',
      'Tail at water oxygen; head at the methyl carbon',
    ],
    correct: 1,
    explanation: 'Water acts as the base. Its lone pair (tail) attacks the acidic H (head). A second arrow shows the O–H bond electrons moving to the acetic acid oxygen. Start from the electron source (water lone pair), point toward the proton.',
  },
  {
    scenario: 'The pi bond of an enol attacks a proton from the acid catalyst in an acid-catalyzed tautomerization.',
    question: 'Where does the tail of the arrow from the pi bond start?',
    choices: [
      'At the oxygen lone pair',
      'At the C=C pi bond (between the two carbons)',
      'At the C–O single bond',
      'At the H being removed',
    ],
    correct: 1,
    explanation: 'The pi bond electrons (between C and C) are the nucleophile attacking the proton. The tail sits on the C=C pi bond; the head points to the electrophilic H of the acid.',
  },
  {
    scenario: 'A tertiary carbocation intermediate is attacked by bromide ion (Br⁻) to give the product.',
    question: 'Which of the following correctly describes the curved arrow for this step?',
    choices: [
      'One fishhook arrow from C⁺ to Br',
      'One full-headed arrow from a Br⁻ lone pair to C⁺',
      'Two arrows: Br lone pair → C, and C–C bond → adjacent C',
      'No arrows are needed — ions attract automatically',
    ],
    correct: 1,
    explanation: 'Br⁻ is the nucleophile. One full-headed (2-electron) arrow: tail at a lone pair on Br⁻, head at the carbocation carbon. One arrow, one bond formed.',
  },
  {
    scenario: 'In the formation of a tetrahedral intermediate in nucleophilic acyl substitution, the nucleophile adds to a carbonyl.',
    question: 'After the nucleophile attacks the carbonyl carbon, what happens to the C=O pi bond?',
    choices: [
      'It breaks completely — the C–O bond is lost',
      'The pi bond electrons move to oxygen, giving O a negative charge',
      'Nothing — the carbonyl is unchanged',
      'The pi bond becomes a triple bond',
    ],
    correct: 1,
    explanation: 'When Nu attacks C, the C=O pi bond electrons shift to O (arrow from C=O → O). This gives oxygen a negative charge (alkoxide), and C goes from sp² trigonal to sp³ tetrahedral. The sigma C–O bond remains.',
  },
]

interface Props { allowCustom?: boolean }

export default function CurvedArrowPractice({ allowCustom = true }: Props) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * PROBLEMS.length))
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const problem = PROBLEMS[idx]
  const correct = submitted && selected === problem.correct

  function next() {
    setIdx(i => (i + 1) % PROBLEMS.length)
    setSelected(null)
    setSubmitted(false)
  }

  function random() {
    setIdx(i => {
      let n = Math.floor(Math.random() * PROBLEMS.length)
      if (n === i) n = (n + 1) % PROBLEMS.length
      return n
    })
    setSelected(null)
    setSubmitted(false)
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="rounded-sm border border-border p-4 flex flex-col gap-3" style={{ background: 'rgb(var(--color-raised))' }}>
        <p className="font-sans text-xs text-secondary leading-relaxed italic">{problem.scenario}</p>
        <p className="font-sans text-sm font-semibold text-primary">{problem.question}</p>

        <div className="flex flex-col gap-2">
          {problem.choices.map((choice, ci) => {
            const isCorrect = ci === problem.correct
            const isSelected = ci === selected
            let borderColor = 'rgb(var(--color-border))'
            let bg = 'rgb(var(--color-surface))'
            let textColor = 'var(--color-text-primary)'
            if (submitted) {
              if (isCorrect) { borderColor = 'var(--c-noble)'; bg = 'color-mix(in srgb, var(--c-noble) 8%, rgb(var(--color-surface)))' }
              else if (isSelected && !isCorrect) { borderColor = 'var(--c-halogen)'; bg = 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-surface)))' }
            } else if (isSelected) {
              borderColor = 'color-mix(in srgb, var(--c-halogen) 60%, transparent)'
            }

            return (
              <button
                key={ci}
                disabled={submitted}
                onClick={() => setSelected(ci)}
                className="text-left px-3 py-2 rounded-sm border font-sans text-sm transition-colors"
                style={{ borderColor, background: bg, color: textColor }}
              >
                <span className="font-mono text-xs text-dim mr-2">{String.fromCharCode(65 + ci)}.</span>
                {choice}
              </button>
            )
          })}
        </div>

        {!submitted && (
          <button
            disabled={selected === null}
            onClick={() => setSubmitted(true)}
            className="self-start px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              color: 'var(--c-halogen)',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            }}
          >
            Check
          </button>
        )}

        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-sm border p-3 flex flex-col gap-1"
              style={{
                borderColor: correct ? 'var(--c-noble)' : 'var(--c-halogen)',
                background: correct
                  ? 'color-mix(in srgb, var(--c-noble) 8%, rgb(var(--color-surface)))'
                  : 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-surface)))',
              }}
            >
              <p className="font-sans text-sm font-semibold" style={{ color: correct ? 'var(--c-noble)' : 'var(--c-halogen)' }}>
                {correct ? '✓ Correct' : `✗ Incorrect — the answer is ${String.fromCharCode(65 + problem.correct)}`}
              </p>
              <p className="font-sans text-xs text-secondary leading-relaxed">{problem.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-2 flex-wrap">
        {allowCustom && (
          <button
            onClick={random}
            className="px-3 py-1.5 rounded-sm border font-sans text-sm font-medium transition-colors"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              color: 'var(--c-halogen)',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            }}
          >
            Random
          </button>
        )}
        <button
          onClick={next}
          className="px-3 py-1.5 rounded-sm border font-sans text-sm transition-colors"
          style={{
            borderColor: 'rgb(var(--color-border))',
            color: 'var(--color-text-secondary)',
          }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
