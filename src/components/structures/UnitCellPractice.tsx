import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types & data ───────────────────────────────────────────────────────────────

interface Question {
  prompt:      string
  options:     string[]
  answer:      number   // index into options
  explanation: string
}

const QUESTIONS: Question[] = [
  // Atoms per unit cell (Z)
  {
    prompt: 'How many atoms does a simple cubic (SC) unit cell contain?',
    options: ['1', '2', '4', '6'],
    answer: 0,
    explanation: 'SC has 8 corner atoms × ⅛ each = 1 atom per unit cell.',
  },
  {
    prompt: 'How many atoms does a body-centered cubic (BCC) unit cell contain?',
    options: ['1', '2', '4', '8'],
    answer: 1,
    explanation: 'BCC: 8 corner atoms × ⅛ = 1, plus 1 body-center atom = 2 total.',
  },
  {
    prompt: 'How many atoms does a face-centered cubic (FCC) unit cell contain?',
    options: ['2', '3', '4', '6'],
    answer: 2,
    explanation: 'FCC: 8 corner atoms × ⅛ = 1, plus 6 face atoms × ½ = 3, total = 4.',
  },
  // Coordination number (CN)
  {
    prompt: 'What is the coordination number (number of nearest neighbors) in a simple cubic lattice?',
    options: ['4', '6', '8', '12'],
    answer: 1,
    explanation: 'Each SC atom touches 6 neighbors: 2 along each of the 3 axes (±x, ±y, ±z).',
  },
  {
    prompt: 'What is the coordination number in a BCC lattice?',
    options: ['6', '8', '10', '12'],
    answer: 1,
    explanation: 'Each BCC atom has 8 nearest neighbors along the body diagonals.',
  },
  {
    prompt: 'What is the coordination number in an FCC lattice?',
    options: ['8', '10', '12', '14'],
    answer: 2,
    explanation: 'FCC has CN = 12: 4 in the same layer, 4 above, and 4 below.',
  },
  // Packing efficiency
  {
    prompt: 'What is the packing efficiency of simple cubic (SC)?',
    options: ['52.4%', '68.0%', '74.0%', '90.7%'],
    answer: 0,
    explanation: 'SC packing efficiency = π/6 ≈ 52.4% — the least efficient cubic arrangement.',
  },
  {
    prompt: 'What is the packing efficiency of body-centered cubic (BCC)?',
    options: ['52.4%', '60.0%', '68.0%', '74.0%'],
    answer: 2,
    explanation: 'BCC packing efficiency = π√3/8 ≈ 68.0%. The body-center atom fills the central void.',
  },
  {
    prompt: 'What is the packing efficiency of face-centered cubic (FCC)?',
    options: ['68.0%', '70.0%', '72.1%', '74.0%'],
    answer: 3,
    explanation: 'FCC (cubic closest packing) achieves ≈74.0% — the theoretical maximum for equal spheres.',
  },
  {
    prompt: 'Which cubic structure has the highest packing efficiency?',
    options: ['SC', 'BCC', 'FCC', 'All equal'],
    answer: 2,
    explanation: 'FCC ≈74.0% > BCC ≈68.0% > SC ≈52.4%.',
  },
  // Contact direction / radius–edge relationships
  {
    prompt: 'In a simple cubic unit cell, atoms touch along the:',
    options: ['Face diagonal', 'Body diagonal', 'Edge', 'They don\'t touch'],
    answer: 2,
    explanation: 'SC atoms touch along the cell edge, giving a = 2r, so r = a/2.',
  },
  {
    prompt: 'In a BCC unit cell, atoms touch along the:',
    options: ['Edge', 'Face diagonal', 'Body diagonal', 'They don\'t touch'],
    answer: 2,
    explanation: 'Corner and body-center atoms touch along the body diagonal (length a√3 = 4r), so r = a√3/4.',
  },
  {
    prompt: 'In an FCC unit cell, atoms touch along the:',
    options: ['Edge', 'Face diagonal', 'Body diagonal', 'They don\'t touch'],
    answer: 1,
    explanation: 'FCC atoms touch along the face diagonal (length a√2 = 4r), so r = a√2/4.',
  },
  {
    prompt: 'In SC, if the edge length is a, the atom radius r equals:',
    options: ['a/4', 'a/2', 'a√2/4', 'a√3/4'],
    answer: 1,
    explanation: 'Edge = 2r → r = a/2.',
  },
  {
    prompt: 'In BCC, if the edge length is a, the atom radius r equals:',
    options: ['a/2', 'a√2/4', 'a√3/4', 'a/4'],
    answer: 2,
    explanation: 'Body diagonal a√3 = 4r → r = a√3/4.',
  },
  {
    prompt: 'In FCC, if the edge length is a, the atom radius r equals:',
    options: ['a/2', 'a√2/4', 'a√3/4', 'a/4'],
    answer: 1,
    explanation: 'Face diagonal a√2 = 4r → r = a√2/4.',
  },
  // Real metals
  {
    prompt: 'Iron (α-Fe) crystallizes in which unit cell structure?',
    options: ['SC', 'BCC', 'FCC', 'Diamond cubic'],
    answer: 1,
    explanation: 'α-iron (room-temperature phase) is BCC with a = 286.7 pm. (γ-iron above 912°C is FCC.)',
  },
  {
    prompt: 'Copper (Cu) crystallizes in which unit cell structure?',
    options: ['SC', 'BCC', 'FCC', 'HCP'],
    answer: 2,
    explanation: 'Copper is FCC (a = 361.5 pm). Gold, silver, nickel, and aluminium also adopt FCC.',
  },
  {
    prompt: 'Polonium (Po) is notable for being the only element that normally adopts which structure?',
    options: ['BCC', 'FCC', 'SC', 'Diamond cubic'],
    answer: 2,
    explanation: 'α-polonium is the only element that crystallizes in a simple cubic lattice under normal conditions.',
  },
  {
    prompt: 'Tungsten (W) and chromium (Cr) both crystallize in which structure?',
    options: ['SC', 'BCC', 'FCC', 'HCP'],
    answer: 1,
    explanation: 'W (a = 316.5 pm) and Cr (a = 288.0 pm) are both BCC — common for group 6 metals.',
  },
  // Rankings / comparisons
  {
    prompt: 'Rank SC, BCC, FCC by atoms per unit cell from fewest to most.',
    options: ['SC(1) < BCC(2) < FCC(4)', 'BCC(2) < SC(1) < FCC(4)', 'SC(1) = BCC(1) < FCC(4)', 'All contain 4 atoms'],
    answer: 0,
    explanation: 'SC = 1, BCC = 2, FCC = 4 atoms per unit cell.',
  },
  {
    prompt: 'Rank SC, BCC, FCC by coordination number from lowest to highest.',
    options: ['SC(6) < BCC(8) < FCC(12)', 'SC(4) < BCC(8) < FCC(12)', 'BCC(8) < SC(6) < FCC(12)', 'All equal at 12'],
    answer: 0,
    explanation: 'SC CN = 6, BCC CN = 8, FCC CN = 12.',
  },
  {
    prompt: 'The density formula for a cubic unit cell is ρ = ZM / (N_A · a³). What does Z represent?',
    options: ['Atomic number', 'Atoms per unit cell', 'Avogadro\'s number', 'Edge length'],
    answer: 1,
    explanation: 'Z is the number of atoms per unit cell (1 for SC, 2 for BCC, 4 for FCC). M is molar mass, N_A is Avogadro\'s number, a is edge length.',
  },
]

function pick(excludeIdx?: number): { q: Question; idx: number } {
  let idx = Math.floor(Math.random() * QUESTIONS.length)
  if (idx === excludeIdx && QUESTIONS.length > 1)
    idx = (idx + 1) % QUESTIONS.length
  return { q: QUESTIONS[idx], idx }
}

// ── Component ──────────────────────────────────────────────────────────────────

const STRUCTURE_COLORS: Record<string, string> = {
  SC: '#fb923c', BCC: '#60a5fa', FCC: '#34d399',
}

export default function UnitCellPractice() {
  const [{ q, idx }, setQState] = useState(() => pick())
  const [selected, setSelected] = useState<number | null>(null)
  const [score,    setScore]    = useState(0)
  const [attempts, setAttempts] = useState(0)

  const answered = selected !== null
  const correct  = selected === q.answer

  const next = useCallback(() => {
    setQState(s => pick(s.idx))
    setSelected(null)
  }, [])

  function choose(i: number) {
    if (answered) return
    setSelected(i)
    setAttempts(a => a + 1)
    if (i === q.answer) setScore(s => s + 1)
  }

  // Highlight any SC/BCC/FCC keywords in the prompt
  function highlightPrompt(text: string) {
    const parts = text.split(/\b(SC|BCC|FCC)\b/)
    return parts.map((part, i) =>
      STRUCTURE_COLORS[part]
        ? <span key={i} className="font-semibold" style={{ color: STRUCTURE_COLORS[part] }}>{part}</span>
        : part
    )
  }

  return (
    <div className="flex flex-col gap-5 max-w-xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Unit Cell Practice</span>
          {attempts > 0 && (
            <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>
              {score}/{attempts}
            </span>
          )}
        </div>
        <button onClick={next} className="font-mono text-xs text-dim hover:text-secondary transition-colors">
          ↻ New question
        </button>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className="rounded-sm border border-border bg-surface overflow-hidden"
        >
          {/* Prompt */}
          <div className="px-4 py-3 border-b border-border"
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 6%, #141620)' }}>
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">Unit cell question</span>
          </div>
          <div className="px-4 py-4">
            <p className="font-sans text-base text-bright leading-relaxed">{highlightPrompt(q.prompt)}</p>
          </div>

          {/* Options */}
          <div className="px-4 pb-4 flex flex-col gap-2">
            {q.options.map((opt, i) => {
              const isSelected  = selected === i
              const isAnswer    = i === q.answer
              const showCorrect = answered && isAnswer
              const showWrong   = answered && isSelected && !isAnswer

              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={answered}
                  className="px-3 py-2.5 rounded-sm border font-sans text-sm text-left transition-all"
                  style={{
                    color: showCorrect ? '#34d399' : showWrong ? '#f87171' : 'rgba(255,255,255,0.7)',
                    borderColor: showCorrect ? '#34d39960' : showWrong ? '#f8717160' : '#1c1f2e',
                    background: showCorrect ? 'color-mix(in srgb, #34d399 8%, #0e1016)'
                      : showWrong ? 'color-mix(in srgb, #f87171 8%, #0e1016)'
                      : '#141620',
                  }}
                >
                  <span className="font-mono text-dim mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence initial={false}>
            {answered && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
                className="overflow-hidden border-t border-border"
              >
                <div className="px-4 py-3 flex flex-col gap-2">
                  <span className="font-sans text-sm font-semibold"
                    style={{ color: correct ? '#34d399' : '#f87171' }}>
                    {correct ? `Correct — ${q.options[q.answer]}` : `Incorrect — answer: ${q.options[q.answer]}`}
                  </span>
                  <p className="font-sans text-xs text-secondary leading-relaxed">{q.explanation}</p>
                  <button onClick={next}
                    className="self-start mt-1 px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-all"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                      color: 'var(--c-halogen)',
                    }}>
                    Next →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

    </div>
  )
}
