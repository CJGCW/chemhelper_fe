import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LewisStructure } from '../../pages/LewisPage'
import VsepDiagram from './VsepDiagram'
import VseprEditor from './VseprEditor'

// ── Static VSEPR problem pool ─────────────────────────────────────────────────

interface VseprEntry {
  label:             string
  formula:           string
  charge:            number
  molecularGeometry: string
  electronGeometry:  string
  hybridization:     string
  bondAngles:        string
  bondingPairs:      number
  lonePairs:         number
  // Minimal LewisStructure needed for VsepDiagram rendering
  structure:         LewisStructure
}

// Helper to build a minimal LewisStructure for diagram rendering only
function mol(name: string, formula: string, charge: number, geometry: string,
  atoms: LewisStructure['atoms'], bonds: LewisStructure['bonds']): LewisStructure {
  return { name, formula, charge, total_valence_electrons: 0, geometry, atoms, bonds, steps: [], notes: '' }
}

const PROBLEMS: VseprEntry[] = [
  {
    label: 'H₂O', formula: 'H2O', charge: 0,
    molecularGeometry: 'Bent', electronGeometry: 'Tetrahedral',
    hybridization: 'sp³', bondAngles: '≈104.5°', bondingPairs: 2, lonePairs: 2,
    structure: mol('Water', 'H2O', 0, 'bent',
      [{ id:'O', element:'O', lone_pairs:2, formal_charge:0 }, { id:'H1', element:'H', lone_pairs:0, formal_charge:0 }, { id:'H2', element:'H', lone_pairs:0, formal_charge:0 }],
      [{ from:'O', to:'H1', order:1 }, { from:'O', to:'H2', order:1 }]),
  },
  {
    label: 'CO₂', formula: 'CO2', charge: 0,
    molecularGeometry: 'Linear', electronGeometry: 'Linear',
    hybridization: 'sp', bondAngles: '180°', bondingPairs: 2, lonePairs: 0,
    structure: mol('Carbon Dioxide', 'CO2', 0, 'linear',
      [{ id:'C', element:'C', lone_pairs:0, formal_charge:0 }, { id:'O1', element:'O', lone_pairs:2, formal_charge:0 }, { id:'O2', element:'O', lone_pairs:2, formal_charge:0 }],
      [{ from:'C', to:'O1', order:2 }, { from:'C', to:'O2', order:2 }]),
  },
  {
    label: 'NH₃', formula: 'NH3', charge: 0,
    molecularGeometry: 'Trigonal Pyramidal', electronGeometry: 'Tetrahedral',
    hybridization: 'sp³', bondAngles: '≈107°', bondingPairs: 3, lonePairs: 1,
    structure: mol('Ammonia', 'NH3', 0, 'trigonal_pyramidal',
      [{ id:'N', element:'N', lone_pairs:1, formal_charge:0 }, { id:'H1', element:'H', lone_pairs:0, formal_charge:0 }, { id:'H2', element:'H', lone_pairs:0, formal_charge:0 }, { id:'H3', element:'H', lone_pairs:0, formal_charge:0 }],
      [{ from:'N', to:'H1', order:1 }, { from:'N', to:'H2', order:1 }, { from:'N', to:'H3', order:1 }]),
  },
  {
    label: 'CH₄', formula: 'CH4', charge: 0,
    molecularGeometry: 'Tetrahedral', electronGeometry: 'Tetrahedral',
    hybridization: 'sp³', bondAngles: '≈109.5°', bondingPairs: 4, lonePairs: 0,
    structure: mol('Methane', 'CH4', 0, 'tetrahedral',
      [{ id:'C', element:'C', lone_pairs:0, formal_charge:0 }, { id:'H1', element:'H', lone_pairs:0, formal_charge:0 }, { id:'H2', element:'H', lone_pairs:0, formal_charge:0 }, { id:'H3', element:'H', lone_pairs:0, formal_charge:0 }, { id:'H4', element:'H', lone_pairs:0, formal_charge:0 }],
      [{ from:'C', to:'H1', order:1 }, { from:'C', to:'H2', order:1 }, { from:'C', to:'H3', order:1 }, { from:'C', to:'H4', order:1 }]),
  },
  {
    label: 'BF₃', formula: 'BF3', charge: 0,
    molecularGeometry: 'Trigonal Planar', electronGeometry: 'Trigonal Planar',
    hybridization: 'sp²', bondAngles: '120°', bondingPairs: 3, lonePairs: 0,
    structure: mol('Boron Trifluoride', 'BF3', 0, 'trigonal_planar',
      [{ id:'B', element:'B', lone_pairs:0, formal_charge:0 }, { id:'F1', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F2', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F3', element:'F', lone_pairs:3, formal_charge:0 }],
      [{ from:'B', to:'F1', order:1 }, { from:'B', to:'F2', order:1 }, { from:'B', to:'F3', order:1 }]),
  },
  {
    label: 'SO₂', formula: 'SO2', charge: 0,
    molecularGeometry: 'Bent', electronGeometry: 'Trigonal Planar',
    hybridization: 'sp²', bondAngles: '≈120°', bondingPairs: 2, lonePairs: 1,
    structure: mol('Sulfur Dioxide', 'SO2', 0, 'bent',
      [{ id:'S', element:'S', lone_pairs:1, formal_charge:0 }, { id:'O1', element:'O', lone_pairs:2, formal_charge:0 }, { id:'O2', element:'O', lone_pairs:2, formal_charge:0 }],
      [{ from:'S', to:'O1', order:2 }, { from:'S', to:'O2', order:1 }]),
  },
  {
    label: 'PCl₅', formula: 'PCl5', charge: 0,
    molecularGeometry: 'Trigonal Bipyramidal', electronGeometry: 'Trigonal Bipyramidal',
    hybridization: 'sp³d', bondAngles: '90°, 120°', bondingPairs: 5, lonePairs: 0,
    structure: mol('Phosphorus Pentachloride', 'PCl5', 0, 'trigonal_bipyramidal',
      [{ id:'P', element:'P', lone_pairs:0, formal_charge:0 }, { id:'Cl1', element:'Cl', lone_pairs:3, formal_charge:0 }, { id:'Cl2', element:'Cl', lone_pairs:3, formal_charge:0 }, { id:'Cl3', element:'Cl', lone_pairs:3, formal_charge:0 }, { id:'Cl4', element:'Cl', lone_pairs:3, formal_charge:0 }, { id:'Cl5', element:'Cl', lone_pairs:3, formal_charge:0 }],
      [{ from:'P', to:'Cl1', order:1 }, { from:'P', to:'Cl2', order:1 }, { from:'P', to:'Cl3', order:1 }, { from:'P', to:'Cl4', order:1 }, { from:'P', to:'Cl5', order:1 }]),
  },
  {
    label: 'SF₄', formula: 'SF4', charge: 0,
    molecularGeometry: 'See-Saw', electronGeometry: 'Trigonal Bipyramidal',
    hybridization: 'sp³d', bondAngles: '≈90°, ≈120°, 180°', bondingPairs: 4, lonePairs: 1,
    structure: mol('Sulfur Tetrafluoride', 'SF4', 0, 'see_saw',
      [{ id:'S', element:'S', lone_pairs:1, formal_charge:0 }, { id:'F1', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F2', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F3', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F4', element:'F', lone_pairs:3, formal_charge:0 }],
      [{ from:'S', to:'F1', order:1 }, { from:'S', to:'F2', order:1 }, { from:'S', to:'F3', order:1 }, { from:'S', to:'F4', order:1 }]),
  },
  {
    label: 'ClF₃', formula: 'ClF3', charge: 0,
    molecularGeometry: 'T-Shaped', electronGeometry: 'Trigonal Bipyramidal',
    hybridization: 'sp³d', bondAngles: '90°, 180°', bondingPairs: 3, lonePairs: 2,
    structure: mol('Chlorine Trifluoride', 'ClF3', 0, 't_shaped',
      [{ id:'Cl', element:'Cl', lone_pairs:2, formal_charge:0 }, { id:'F1', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F2', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F3', element:'F', lone_pairs:3, formal_charge:0 }],
      [{ from:'Cl', to:'F1', order:1 }, { from:'Cl', to:'F2', order:1 }, { from:'Cl', to:'F3', order:1 }]),
  },
  {
    label: 'SF₆', formula: 'SF6', charge: 0,
    molecularGeometry: 'Octahedral', electronGeometry: 'Octahedral',
    hybridization: 'sp³d²', bondAngles: '90°', bondingPairs: 6, lonePairs: 0,
    structure: mol('Sulfur Hexafluoride', 'SF6', 0, 'octahedral',
      [{ id:'S', element:'S', lone_pairs:0, formal_charge:0 }, { id:'F1', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F2', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F3', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F4', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F5', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F6', element:'F', lone_pairs:3, formal_charge:0 }],
      [{ from:'S', to:'F1', order:1 }, { from:'S', to:'F2', order:1 }, { from:'S', to:'F3', order:1 }, { from:'S', to:'F4', order:1 }, { from:'S', to:'F5', order:1 }, { from:'S', to:'F6', order:1 }]),
  },
  {
    label: 'XeF₄', formula: 'XeF4', charge: 0,
    molecularGeometry: 'Square Planar', electronGeometry: 'Octahedral',
    hybridization: 'sp³d²', bondAngles: '90°', bondingPairs: 4, lonePairs: 2,
    structure: mol('Xenon Tetrafluoride', 'XeF4', 0, 'square_planar',
      [{ id:'Xe', element:'Xe', lone_pairs:2, formal_charge:0 }, { id:'F1', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F2', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F3', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F4', element:'F', lone_pairs:3, formal_charge:0 }],
      [{ from:'Xe', to:'F1', order:1 }, { from:'Xe', to:'F2', order:1 }, { from:'Xe', to:'F3', order:1 }, { from:'Xe', to:'F4', order:1 }]),
  },
  {
    label: 'BrF₅', formula: 'BrF5', charge: 0,
    molecularGeometry: 'Square Pyramidal', electronGeometry: 'Octahedral',
    hybridization: 'sp³d²', bondAngles: '90°', bondingPairs: 5, lonePairs: 1,
    structure: mol('Bromine Pentafluoride', 'BrF5', 0, 'square_pyramidal',
      [{ id:'Br', element:'Br', lone_pairs:1, formal_charge:0 }, { id:'F1', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F2', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F3', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F4', element:'F', lone_pairs:3, formal_charge:0 }, { id:'F5', element:'F', lone_pairs:3, formal_charge:0 }],
      [{ from:'Br', to:'F1', order:1 }, { from:'Br', to:'F2', order:1 }, { from:'Br', to:'F3', order:1 }, { from:'Br', to:'F4', order:1 }, { from:'Br', to:'F5', order:1 }]),
  },
]

// ── MCQ option generation ─────────────────────────────────────────────────────

const ALL_MOL_GEOMETRIES = ['Linear', 'Bent', 'Trigonal Planar', 'Trigonal Pyramidal', 'Tetrahedral', 'T-Shaped', 'See-Saw', 'Square Planar', 'Square Pyramidal', 'Trigonal Bipyramidal', 'Octahedral']
const ALL_ELEC_GEOMETRIES = ['Linear', 'Trigonal Planar', 'Tetrahedral', 'Trigonal Bipyramidal', 'Octahedral']
const ALL_HYBRIDIZATIONS  = ['s', 'sp', 'sp²', 'sp³', 'sp³d', 'sp³d²']
const ALL_BOND_ANGLES     = ['90°', '≈104.5°', '≈107°', '≈109.5°', '≈120°', '120°', '90°, 120°', '90°, 180°', '≈90°, ≈120°, 180°', '180°']

type QuestionType = 'molecular_geometry' | 'electron_geometry' | 'hybridization' | 'bond_angles'

const QUESTION_TYPES: QuestionType[] = ['molecular_geometry', 'molecular_geometry', 'electron_geometry', 'hybridization', 'bond_angles']

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeOptions(correct: string, pool: string[]): string[] {
  const wrong = shuffle(pool.filter(x => x !== correct)).slice(0, 3)
  return shuffle([correct, ...wrong])
}

function buildQuestion(entry: VseprEntry, qType: QuestionType) {
  switch (qType) {
    case 'molecular_geometry':
      return { question: 'What is the molecular geometry?', correct: entry.molecularGeometry, options: makeOptions(entry.molecularGeometry, ALL_MOL_GEOMETRIES) }
    case 'electron_geometry':
      return { question: 'What is the electron geometry?', correct: entry.electronGeometry, options: makeOptions(entry.electronGeometry, ALL_ELEC_GEOMETRIES) }
    case 'hybridization':
      return { question: 'What is the hybridization of the central atom?', correct: entry.hybridization, options: makeOptions(entry.hybridization, ALL_HYBRIDIZATIONS) }
    case 'bond_angles':
      return { question: 'What are the approximate bond angles?', correct: entry.bondAngles, options: makeOptions(entry.bondAngles, ALL_BOND_ANGLES) }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface QuestionState {
  entryIdx:  number
  qType:     QuestionType
  question:  string
  correct:   string
  options:   string[]
}

function newQuestion(entryIdx?: number): QuestionState {
  const idx = entryIdx ?? Math.floor(Math.random() * PROBLEMS.length)
  const entry = PROBLEMS[idx]
  const qType = QUESTION_TYPES[Math.floor(Math.random() * QUESTION_TYPES.length)]
  const q = buildQuestion(entry, qType)
  return { entryIdx: idx, qType, question: q.question, correct: q.correct, options: q.options }
}

export default function VseprPractice() {
  const [q, setQ]           = useState<QuestionState>(() => newQuestion())
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore]   = useState({ correct: 0, total: 0 })

  const entry = PROBLEMS[q.entryIdx]
  const answered = selected !== null
  const isCorrect = selected === q.correct

  function handleSelect(opt: string) {
    if (answered) return
    setSelected(opt)
    setScore(s => ({ correct: s.correct + (opt === q.correct ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setSelected(null)
    setQ(newQuestion())
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Score */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-dim">Score:</span>
        <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>
          {score.correct} / {score.total}
        </span>
        {score.total > 0 && (
          <span className="font-mono text-xs text-dim">
            ({Math.round(score.correct / score.total * 100)}%)
          </span>
        )}
        <button onClick={() => setScore({ correct: 0, total: 0 })}
          className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded-sm border border-border text-dim hover:text-secondary transition-colors">
          reset
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${q.entryIdx}-${q.qType}`}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
          className="flex flex-col gap-5">

          {/* Molecule label + diagram */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] text-dim tracking-wider uppercase">Molecule</span>
            <span className="font-sans font-semibold text-bright text-xl">{entry.label}</span>
          </div>

          <div className="w-56">
            <VsepDiagram structure={entry.structure} />
          </div>

          {/* Question */}
          <p className="font-sans text-base text-primary">{q.question}</p>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map(opt => {
              const isSelected = selected === opt
              const isRight    = answered && opt === q.correct
              const isWrong    = answered && isSelected && !isRight

              return (
                <button key={opt} onClick={() => handleSelect(opt)}
                  disabled={answered}
                  className="px-4 py-2.5 rounded-sm font-sans text-sm text-left transition-all border"
                  style={{
                    borderColor: isRight  ? 'color-mix(in srgb, #4ade80 40%, transparent)'
                               : isWrong ? 'color-mix(in srgb, #f87171 40%, transparent)'
                               : isSelected ? 'color-mix(in srgb, var(--c-halogen) 40%, transparent)'
                               : '#1c1f2e',
                    background:  isRight  ? 'color-mix(in srgb, #4ade80 8%, #0e1016)'
                               : isWrong ? 'color-mix(in srgb, #f87171 8%, #0e1016)'
                               : isSelected ? 'color-mix(in srgb, var(--c-halogen) 8%, #0e1016)'
                               : '#0e1016',
                    color:       isRight  ? '#4ade80'
                               : isWrong ? '#f87171'
                               : 'rgba(255,255,255,0.75)',
                    cursor:      answered ? 'default' : 'pointer',
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>

          {/* Feedback + next */}
          {answered && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1 px-3 py-2.5 rounded-sm border"
                style={{
                  borderColor: isCorrect ? 'color-mix(in srgb, #4ade80 30%, transparent)' : 'color-mix(in srgb, #f87171 30%, transparent)',
                  background:  isCorrect ? 'color-mix(in srgb, #4ade80 5%, #0e1016)' : 'color-mix(in srgb, #f87171 5%, #0e1016)',
                }}>
                <span className="font-sans text-sm font-medium" style={{ color: isCorrect ? '#4ade80' : '#f87171' }}>
                  {isCorrect ? '✓ Correct!' : `✗ The answer is ${q.correct}`}
                </span>
                <span className="font-mono text-xs text-secondary">
                  {entry.label}: {entry.bondingPairs} bonding pair{entry.bondingPairs !== 1 ? 's' : ''}, {entry.lonePairs} lone pair{entry.lonePairs !== 1 ? 's' : ''} on center · {entry.electronGeometry} → {entry.molecularGeometry} · {entry.hybridization} · {entry.bondAngles}
                </span>
              </div>
              <button onClick={handleNext}
                className="self-start px-5 py-2 rounded-sm font-sans text-sm font-medium transition-all"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  color: 'var(--c-halogen)',
                }}>
                Next →
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Structure builder — explore geometries while practicing */}
      <div className="border-t border-border pt-6 mt-2">
        <p className="font-mono text-[10px] text-dim tracking-wider uppercase mb-4">Structure Builder</p>
        <VseprEditor />
      </div>
    </div>
  )
}
