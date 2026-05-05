import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Classification = 'Aromatic' | 'Antiaromatic' | 'Nonaromatic'

interface Problem {
  compound: string
  description: string
  piElectrons: number
  classification: Classification
  explanation: string
}

const PROBLEMS: Problem[] = [
  {
    compound: 'Benzene',
    description: 'Planar, 6-membered fully conjugated ring with 3 double bonds.',
    piElectrons: 6,
    classification: 'Aromatic',
    explanation: '6π electrons = 4(1)+2 = aromatic. Planar and fully conjugated. The textbook example of aromaticity.',
  },
  {
    compound: 'Cyclobutadiene',
    description: 'Planar, 4-membered fully conjugated ring with 2 double bonds.',
    piElectrons: 4,
    classification: 'Antiaromatic',
    explanation: '4π electrons = 4(1) = antiaromatic. Planar and conjugated but 4n electrons makes it destabilized. Extremely reactive.',
  },
  {
    compound: 'Cyclopentadienyl anion (Cp⁻)',
    description: 'Cyclopentadiene loses an H⁺ from sp³ CH₂. The resulting carbanion has an sp² carbon with a lone pair in the p orbital.',
    piElectrons: 6,
    classification: 'Aromatic',
    explanation: 'The lone pair on the sp² carbanion contributes 2π electrons to the ring → 6π total → aromatic. This is why cyclopentadiene is unusually acidic (pKa ≈ 16).',
  },
  {
    compound: 'Cyclopentadienyl cation (Cp⁺)',
    description: 'Cyclopentadienyl cation — one carbon is sp² with an empty p orbital.',
    piElectrons: 4,
    classification: 'Antiaromatic',
    explanation: 'The empty p orbital contributes 0 to the π system → 4π electrons total → antiaromatic. The cation is destabilized.',
  },
  {
    compound: 'Pyrrole',
    description: 'Five-membered ring with one nitrogen; N is sp² hybridized with its lone pair in the p orbital (pointing into the ring).',
    piElectrons: 6,
    classification: 'Aromatic',
    explanation: 'N lone pair contributes 2π to the ring (2 from N + 2 from each C=C) = 6π → aromatic. Pyrrole N lone pair is NOT available for protonation without destroying aromaticity.',
  },
  {
    compound: 'Pyridine',
    description: 'Six-membered ring with one nitrogen; the N lone pair is in an sp² orbital perpendicular to the ring (NOT in the p orbital).',
    piElectrons: 6,
    classification: 'Aromatic',
    explanation: 'N lone pair is NOT in the π system (it\'s in sp² orbital pointing outward); the ring has 6π electrons from the three C=C/C=N bonds → aromatic. Pyridine N lone pair IS available for protonation.',
  },
  {
    compound: 'Furan',
    description: 'Five-membered ring with one oxygen; O is sp² with one lone pair in the ring p orbital.',
    piElectrons: 6,
    classification: 'Aromatic',
    explanation: 'O lone pair (2π) + 2×C=C (4π) = 6π → aromatic. Furan is aromatic but less so than benzene or pyrrole because O\'s lone pair is less efficiently delocalized.',
  },
  {
    compound: 'Cyclooctatetraene (COT, tub-shaped)',
    description: '8-membered ring with 4 double bonds, but it adopts a non-planar tub shape.',
    piElectrons: 8,
    classification: 'Nonaromatic',
    explanation: '8π would be antiaromatic (4n, n=2), but COT avoids this by being non-planar. Non-planarity breaks the conjugation requirement → nonaromatic (not antiaromatic).',
  },
  {
    compound: 'Tropylium cation (cycloheptatrienyl cation)',
    description: '7-membered ring with 3 double bonds; the cationic carbon is sp² with an empty p orbital.',
    piElectrons: 6,
    classification: 'Aromatic',
    explanation: 'The empty p orbital contributes nothing, so the ring has 6π electrons from 3 double bonds → aromatic. The tropylium cation is unusually stable for a carbocation.',
  },
  {
    compound: 'Cyclopropenyl anion',
    description: '3-membered ring with 1 double bond; one sp² carbanion with a lone pair in the p orbital.',
    piElectrons: 4,
    classification: 'Antiaromatic',
    explanation: '2π (C=C) + 2π (lone pair) = 4π = antiaromatic. The 3-membered ring is already strained; adding antiaromaticity makes this extremely unstable.',
  },
  {
    compound: '1,3-Cyclohexadiene',
    description: '6-membered ring with 2 double bonds — NOT fully conjugated (one sp³ CH₂ breaks the conjugation).',
    piElectrons: 4,
    classification: 'Nonaromatic',
    explanation: 'The ring is not fully conjugated (the sp³ carbon breaks the continuous p-orbital overlap). Therefore it\'s nonaromatic regardless of π electron count.',
  },
  {
    compound: '[18]Annulene',
    description: 'An 18-membered ring with 9 double bonds, large enough to be roughly planar.',
    piElectrons: 18,
    classification: 'Aromatic',
    explanation: '18π = 4(4)+2 → aromatic. [18]Annulene shows ring current effects in NMR consistent with aromaticity.',
  },
]

const OPTIONS: Classification[] = ['Aromatic', 'Antiaromatic', 'Nonaromatic']

function randomProblem(): Problem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

interface Props { allowCustom?: boolean }

export default function AromaticityClassifier({ allowCustom = true }: Props) {
  void allowCustom
  const [problem, setProblem] = useState<Problem>(randomProblem)
  const [selected, setSelected] = useState<Classification | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  function handleSelect(opt: Classification) {
    if (selected !== null) return
    setSelected(opt)
    setScore(s => ({ correct: s.correct + (opt === problem.classification ? 1 : 0), total: s.total + 1 }))
  }

  function nextProblem() {
    let next: Problem
    do { next = randomProblem() } while (next.compound === problem.compound && PROBLEMS.length > 1)
    setProblem(next)
    setSelected(null)
  }

  const checked = selected !== null
  const correct = selected === problem.classification

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="p-3 rounded-sm border border-border bg-surface text-sm font-sans text-secondary flex flex-col gap-1">
        <p className="font-mono text-xs text-dim uppercase tracking-wider mb-1">Quick Reference</p>
        <p><span className="text-emerald-400 font-semibold">Aromatic:</span> cyclic + planar + conjugated + 4n+2 π electrons</p>
        <p><span className="text-rose-400 font-semibold">Antiaromatic:</span> cyclic + planar + conjugated + 4n π electrons</p>
        <p><span className="text-secondary font-semibold">Nonaromatic:</span> fails any one of the first three requirements</p>
      </div>

      {score.total > 0 && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-secondary">
            Score: <span className="text-bright">{score.correct}</span><span className="text-dim"> / {score.total}</span>
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-raised">
            <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
              animate={{ width: `${(score.correct / score.total) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={problem.compound}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
          className="flex flex-col gap-4">
          <div className="p-4 rounded-sm border border-border bg-surface flex flex-col gap-2">
            <p className="font-mono text-sm font-semibold text-primary">{problem.compound}</p>
            <p className="font-sans text-sm text-secondary leading-relaxed">{problem.description}</p>
            {!checked && (
              <p className="font-mono text-xs text-dim">Classify: is this compound aromatic, antiaromatic, or nonaromatic?</p>
            )}
          </div>

          {checked && (
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="text-dim">π electrons:</span>
              <span className="text-primary font-bold">{problem.piElectrons}</span>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {OPTIONS.map(opt => {
              const isSelected = selected === opt
              const isCorrect = opt === problem.classification
              let style = 'border-border text-secondary hover:border-muted hover:text-primary'
              if (checked && isCorrect) style = 'border-emerald-700/70 bg-emerald-950/25 text-emerald-400'
              if (checked && isSelected && !isCorrect) style = 'border-rose-700/70 bg-rose-950/25 text-rose-400'
              return (
                <button key={opt} disabled={checked} onClick={() => handleSelect(opt)}
                  className={`px-5 py-2.5 rounded-sm border font-sans text-sm font-medium transition-colors ${style}`}>
                  {opt}
                </button>
              )
            })}
          </div>

          {checked && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-sm border text-sm font-sans ${correct ? 'border-emerald-700/50 bg-emerald-950/20 text-emerald-300' : 'border-rose-700/50 bg-rose-950/20 text-rose-300'}`}>
              <span className="font-semibold">{correct ? 'Correct. ' : `Incorrect — ${problem.classification}. `}</span>
              {problem.explanation}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {checked && (
        <button onClick={nextProblem}
          className="self-start px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Next Problem →
        </button>
      )}
    </div>
  )
}
