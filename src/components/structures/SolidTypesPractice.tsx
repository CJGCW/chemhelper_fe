import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types & data ───────────────────────────────────────────────────────────────

type SolidId = 'ionic' | 'molecular' | 'metallic' | 'network'

interface Question {
  prompt:      string
  answer:      SolidId
  explanation: string
}

const SOLID_COLORS: Record<SolidId, string> = {
  ionic:     '#fb923c',
  molecular: '#34d399',
  metallic:  '#60a5fa',
  network:   '#c084fc',
}

const SOLID_NAMES: Record<SolidId, string> = {
  ionic:     'Ionic',
  molecular: 'Molecular',
  metallic:  'Metallic',
  network:   'Network Covalent',
}

const OPTIONS: { id: SolidId; label: string }[] = [
  { id: 'ionic',     label: 'Ionic'           },
  { id: 'molecular', label: 'Molecular'        },
  { id: 'metallic',  label: 'Metallic'         },
  { id: 'network',   label: 'Network Covalent' },
]

const QUESTIONS: Question[] = [
  // Property clues
  {
    prompt: 'Conducts electricity only when molten or dissolved in water.',
    answer: 'ionic',
    explanation: 'Ionic solids have ions fixed in the lattice. Melting or dissolving frees them to carry charge. Solid ionic compounds are non-conductors.',
  },
  {
    prompt: 'Good conductor of heat and electricity in all states; malleable and ductile.',
    answer: 'metallic',
    explanation: 'The delocalized electron sea allows charge and heat transport, and lets lattice planes slide without breaking bonds.',
  },
  {
    prompt: 'Extremely hard, very high melting point (often >1000°C), insoluble in virtually all solvents.',
    answer: 'network',
    explanation: 'Every atom is covalently bonded to its neighbors. Melting requires breaking many strong covalent bonds, hence the extremely high mp.',
  },
  {
    prompt: 'Soft, low melting point, non-conductor in all states.',
    answer: 'molecular',
    explanation: 'Only weak intermolecular forces hold discrete molecules together. No free charges exist — non-conductor in any state.',
  },
  {
    prompt: 'Hard but brittle — shatters when struck rather than bending.',
    answer: 'ionic',
    explanation: 'A blow shifts ion planes, bringing like charges into alignment → strong repulsion → fracture. Metals bend instead because the electron sea adjusts.',
  },
  {
    prompt: 'Solubility depends on polarity: polar dissolves in polar, nonpolar in nonpolar.',
    answer: 'molecular',
    explanation: 'The IMFs between molecules are sensitive to polarity. No ionic charges force a preference for polar solvents.',
  },
  {
    prompt: 'Particles are metal cations surrounded by a "sea" of delocalized electrons.',
    answer: 'metallic',
    explanation: 'Metallic bonding is defined by the delocalized electron sea model — cations are held in place by their attraction to the surrounding electrons.',
  },
  {
    prompt: 'Formed between a metal and a nonmetal; held together by electrostatic attraction between oppositely charged ions.',
    answer: 'ionic',
    explanation: 'Ionic bonding arises from electron transfer from metal to nonmetal, producing cations and anions that attract each other.',
  },
  {
    prompt: 'Variable hardness and melting point — can range from soft/low-mp to extremely hard/high-mp within the same type.',
    answer: 'metallic',
    explanation: 'Metallic bond strength varies widely: Na (mp 98°C, soft) vs. W (mp 3422°C, very hard). All share the electron sea structure.',
  },
  {
    prompt: 'Discrete covalent molecules are the structural units; covalent bonds exist within each unit but not between units.',
    answer: 'molecular',
    explanation: 'The strong covalent bonds within each molecule are not the forces that are broken on melting — only the weak IMFs between molecules break.',
  },
  // Substance-based
  {
    prompt: 'What type of solid is diamond (C)?',
    answer: 'network',
    explanation: 'Each carbon forms 4 covalent bonds to neighboring carbons in a 3D lattice — the classic network covalent solid.',
  },
  {
    prompt: 'What type of solid is ice (H₂O)?',
    answer: 'molecular',
    explanation: 'Ice consists of discrete H₂O molecules held together by hydrogen bonds (a strong IMF). The covalent O–H bonds remain intact on melting.',
  },
  {
    prompt: 'What type of solid is iron (Fe)?',
    answer: 'metallic',
    explanation: 'Pure metals are metallic solids — positive ion cores surrounded by delocalized electrons.',
  },
  {
    prompt: 'What type of solid is sodium chloride (NaCl)?',
    answer: 'ionic',
    explanation: 'NaCl consists of Na⁺ and Cl⁻ ions in a crystal lattice — the prototypical ionic solid.',
  },
  {
    prompt: 'What type of solid is quartz (SiO₂)?',
    answer: 'network',
    explanation: 'Quartz has Si and O atoms in an extended 3D covalent lattice. There are no discrete SiO₂ molecules.',
  },
  {
    prompt: 'What type of solid is iodine (I₂)?',
    answer: 'molecular',
    explanation: 'Solid I₂ consists of discrete I₂ molecules held by London dispersion forces.',
  },
  {
    prompt: 'What type of solid is copper (Cu)?',
    answer: 'metallic',
    explanation: 'Copper is a pure metal. Its conductivity and malleability are characteristic of metallic bonding.',
  },
  {
    prompt: 'What type of solid is magnesium oxide (MgO)?',
    answer: 'ionic',
    explanation: 'MgO is formed from Mg²⁺ and O²⁻ ions — a classic high-melting ionic solid (mp 2852°C).',
  },
  {
    prompt: 'What type of solid is graphite (C)?',
    answer: 'network',
    explanation: 'Each graphite layer is a 2D covalent lattice of sp²-hybridized carbons. Layers are held by weak van der Waals forces, but the covalent framework makes it network covalent.',
  },
  {
    prompt: 'What type of solid is sucrose (C₁₂H₂₂O₁₁, table sugar)?',
    answer: 'molecular',
    explanation: 'Sugar consists of discrete covalent molecules held by hydrogen bonds and van der Waals forces.',
  },
  // Conceptual
  {
    prompt: 'This solid type has the highest melting points of any class.',
    answer: 'network',
    explanation: 'Network covalent solids (diamond, SiO₂, SiC) require breaking many strong covalent bonds to melt. Diamond mp exceeds 3500°C.',
  },
  {
    prompt: 'This is the only solid type that conducts electricity in the solid state without any external input.',
    answer: 'metallic',
    explanation: 'The delocalized electron sea conducts freely in the solid. Ionic solids require melting or dissolving before ions can move.',
  },
  {
    prompt: 'A solid has a melting point of −78°C and does not conduct electricity in any state. What type is it?',
    answer: 'molecular',
    explanation: 'A very low mp and zero conductivity in all states is the fingerprint of a molecular solid (here, dry ice / solid CO₂).',
  },
  {
    prompt: 'A solid has a melting point of 801°C, is brittle, and conducts when dissolved in water. What type is it?',
    answer: 'ionic',
    explanation: 'High mp, brittleness, and conductivity only in solution all point to an ionic solid (NaCl, mp 801°C).',
  },
]

function pick(excludeIdx?: number): { q: Question; idx: number } {
  let idx = Math.floor(Math.random() * QUESTIONS.length)
  if (idx === excludeIdx && QUESTIONS.length > 1)
    idx = (idx + 1) % QUESTIONS.length
  return { q: QUESTIONS[idx], idx }
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function SolidTypesPractice() {
  const [{ q, idx }, setQState] = useState(() => pick())
  const [selected, setSelected] = useState<SolidId | null>(null)
  const [score,    setScore]    = useState(0)
  const [attempts, setAttempts] = useState(0)

  const answered = selected !== null
  const correct  = selected === q.answer

  const next = useCallback(() => {
    setQState(s => pick(s.idx))
    setSelected(null)
  }, [])

  function choose(id: SolidId) {
    if (answered) return
    setSelected(id)
    setAttempts(a => a + 1)
    if (id === q.answer) setScore(s => s + 1)
  }

  return (
    <div className="flex flex-col gap-5 max-w-xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Solid Types Practice</span>
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
            style={{ background: 'color-mix(in srgb, var(--c-halogen) 6%, rgb(var(--color-raised)))' }}>
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">Identify the solid type</span>
          </div>
          <div className="px-4 py-4">
            <p className="font-sans text-base text-bright leading-relaxed">{q.prompt}</p>
          </div>

          {/* Options */}
          <div className="px-4 pb-4 grid grid-cols-2 gap-2">
            {OPTIONS.map(opt => {
              const isSelected  = selected === opt.id
              const isAnswer    = opt.id === q.answer
              const showCorrect = answered && isAnswer
              const showWrong   = answered && isSelected && !isAnswer

              return (
                <button
                  key={opt.id}
                  onClick={() => choose(opt.id)}
                  disabled={answered}
                  className="px-3 py-2.5 rounded-sm border font-sans text-sm font-medium text-left transition-all"
                  style={{
                    color: showCorrect ? '#34d399'
                      : showWrong ? '#f87171'
                      : 'rgba(var(--overlay),0.6)',
                    borderColor: showCorrect ? '#34d39960'
                      : showWrong ? '#f8717160'
                      : 'rgb(var(--color-border))',
                    background: showCorrect ? 'color-mix(in srgb, #34d399 8%, rgb(var(--color-surface)))'
                      : showWrong ? 'color-mix(in srgb, #f87171 8%, rgb(var(--color-surface)))'
                      : 'rgb(var(--color-raised))',
                  }}
                >
                  <span style={{ color: showCorrect || showWrong ? 'inherit' : SOLID_COLORS[opt.id], marginRight: 6 }}>■</span>
                  {opt.label}
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
                    {correct
                      ? `Correct — ${SOLID_NAMES[q.answer]}`
                      : `Incorrect — answer: ${SOLID_NAMES[q.answer]}`}
                  </span>
                  <p className="font-sans text-xs text-secondary leading-relaxed">{q.explanation}</p>
                  <button onClick={next}
                    className="self-start mt-1 px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-all"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
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
