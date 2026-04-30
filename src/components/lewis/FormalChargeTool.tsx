import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LewisStructureDiagram from './LewisStructureDiagram'
import { expectedFormalCharges } from '../../chem/formalCharge'
import { FORMAL_CHARGE_EXERCISES, type FormalChargeExercise } from '../../data/formalChargeExercises'
import type { LewisStructure } from '../../pages/LewisPage'

type Difficulty = 'all' | 'basic' | 'intermediate' | 'advanced'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtFC(n: number): string {
  if (n === 0)  return '0'
  if (n === 1)  return '+'
  if (n === -1) return '−'
  return n > 0 ? `+${n}` : String(n)
}

// Weight toward exercises with at least one non-zero FC (2× weight vs all-zero)
function weightedPick(exercises: FormalChargeExercise[]): FormalChargeExercise {
  const hasNonZero = exercises.filter(e => e.structure.atoms.some(a => a.formal_charge !== 0))
  const allZero    = exercises.filter(e => e.structure.atoms.every(a => a.formal_charge === 0))
  const pool = [...hasNonZero, ...hasNonZero, ...allZero]
  return pool[Math.floor(Math.random() * pool.length)]
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props { allowCustom?: boolean }

export default function FormalChargeTool({ allowCustom = true }: Props) {
  const [difficulty,   setDifficulty]   = useState<Difficulty>('all')
  const [exercise,     setExercise]     = useState<FormalChargeExercise>(() =>
    weightedPick(FORMAL_CHARGE_EXERCISES)
  )
  // atom id → student's assigned FC (null = not yet assigned)
  const [assignments,  setAssignments]  = useState<Record<string, number | null>>({})
  const [selectedAtom, setSelectedAtom] = useState<string | null>(null)
  const [verified,     setVerified]     = useState(false)
  const [results,      setResults]      = useState<Record<string, 'correct' | 'incorrect'>>({})
  const [showAnswer,   setShowAnswer]   = useState(false)
  const [score,        setScore]        = useState({ correct: 0, total: 0 })

  const filteredExercises = useMemo(() =>
    difficulty === 'all'
      ? FORMAL_CHARGE_EXERCISES
      : FORMAL_CHARGE_EXERCISES.filter(e => e.difficulty === difficulty),
    [difficulty]
  )

  // ── Navigation ────────────────────────────────────────────────────────────

  const loadExercise = useCallback((ex: FormalChargeExercise) => {
    setExercise(ex)
    setAssignments({})
    setSelectedAtom(null)
    setVerified(false)
    setResults({})
    setShowAnswer(false)
  }, [])

  function nextExercise() {
    const pool = filteredExercises.filter(e => e.id !== exercise.id)
    loadExercise(weightedPick(pool.length > 0 ? pool : filteredExercises))
  }

  function handleDifficultyChange(d: Difficulty) {
    setDifficulty(d)
    const pool = d === 'all' ? FORMAL_CHARGE_EXERCISES : FORMAL_CHARGE_EXERCISES.filter(e => e.difficulty === d)
    loadExercise(weightedPick(pool))
  }

  // ── Assignments ───────────────────────────────────────────────────────────

  function assign(atomId: string, value: number) {
    setAssignments(prev => ({ ...prev, [atomId]: value }))
    // Auto-advance: select next unassigned atom
    const atoms = exercise.structure.atoms
    const curIdx = atoms.findIndex(a => a.id === atomId)
    const next = atoms.slice(curIdx + 1).find(a => {
      const v = assignments[a.id]
      return v === null || v === undefined
    }) ?? atoms.slice(0, curIdx).find(a => {
      const v = assignments[a.id]
      return v === null || v === undefined
    })
    setSelectedAtom(next?.id ?? null)
  }

  const allAssigned = exercise.structure.atoms.every(
    a => assignments[a.id] !== null && assignments[a.id] !== undefined
  )

  // ── Verify ────────────────────────────────────────────────────────────────

  function handleCheck() {
    const correct = expectedFormalCharges(exercise.structure.atoms)
    const res: Record<string, 'correct' | 'incorrect'> = {}
    let correctCount = 0
    for (const atom of exercise.structure.atoms) {
      const isCorrect = assignments[atom.id] === correct[atom.id]
      res[atom.id] = isCorrect ? 'correct' : 'incorrect'
      if (isCorrect) correctCount++
    }
    setResults(res)
    setVerified(true)
    setSelectedAtom(null)
    setScore(s => ({
      correct: s.correct + correctCount,
      total:   s.total   + exercise.structure.atoms.length,
    }))
  }

  // ── Atom badge overlay ────────────────────────────────────────────────────

  const renderAtomBadge = useCallback((
    atom: LewisStructure['atoms'][0],
    atomCenter: { x: number; y: number },
    badgePos:   { x: number; y: number },
  ) => {
    const assigned  = assignments[atom.id]
    const isSelected = selectedAtom === atom.id
    const result    = verified ? results[atom.id] : undefined

    const hasValue = assigned !== null && assigned !== undefined

    const strokeColor =
      result === 'correct'   ? '#4ade80'
      : result === 'incorrect' ? '#f87171'
      : isSelected             ? 'var(--c-halogen)'
      : hasValue               ? '#60a5fa'
      : 'rgba(200,200,200,0.35)'

    const label = hasValue ? fmtFC(assigned!) : '?'
    const fontSize = label.length > 1 ? 5.5 : 7

    return (
      <g
        onClick={() => { if (!verified) setSelectedAtom(atom.id) }}
        style={{ cursor: verified ? 'default' : 'pointer' }}
      >
        {/* Invisible hit target over atom body */}
        <circle cx={atomCenter.x} cy={atomCenter.y} r={16} fill="transparent" />
        {/* Badge */}
        <circle cx={badgePos.x} cy={badgePos.y} r={7}
          fill="rgba(11,14,23,0.90)"
          stroke={strokeColor}
          strokeWidth={isSelected ? 2 : 1.2}
        />
        <text
          x={badgePos.x} y={badgePos.y}
          textAnchor="middle" dominantBaseline="central" dy="-0.5"
          fill={strokeColor}
          fontSize={fontSize}
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
        >
          {label}
        </text>
      </g>
    )
  }, [assignments, selectedAtom, verified, results])

  // ── Incorrect atoms summary ───────────────────────────────────────────────

  const incorrectAtoms = verified
    ? exercise.structure.atoms.filter(a => results[a.id] === 'incorrect')
    : []
  const correctCount  = verified
    ? exercise.structure.atoms.filter(a => results[a.id] === 'correct').length
    : 0
  const totalAtoms    = exercise.structure.atoms.length
  const allCorrect    = correctCount === totalAtoms

  const CHARGES = [-3, -2, -1, 0, 1, 2, 3]

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Formal Charge</span>
          {/* Difficulty filter */}
          {allowCustom && <div className="flex items-center gap-1 p-0.5 rounded-full"
            style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
            {(['all', 'basic', 'intermediate', 'advanced'] as Difficulty[]).map(d => {
              const active = difficulty === d
              return (
                <button key={d} onClick={() => handleDifficultyChange(d)}
                  className="relative px-3 py-1 rounded-full font-sans text-xs font-medium transition-colors capitalize"
                  style={{ color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}>
                  {active && (
                    <motion.div layoutId="fc-diff-pill" className="absolute inset-0 rounded-full"
                      style={{
                        background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                        border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                  )}
                  <span className="relative z-10">{d}</span>
                </button>
              )
            })}
          </div>}
          {score.total > 0 && (
            <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>
              {score.correct}/{score.total}
            </span>
          )}
        </div>
        <button onClick={nextExercise}
          className="font-mono text-xs text-dim hover:text-secondary transition-colors shrink-0">
          ↻ Next
        </button>
      </div>

      {/* Exercise card */}
      <AnimatePresence mode="wait">
        <motion.div key={exercise.id}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className="flex flex-col gap-4">

          {/* Name + difficulty badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-sans text-base font-semibold text-bright">{exercise.name}</h3>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm"
              style={{
                color: exercise.difficulty === 'basic' ? '#4ade80'
                  : exercise.difficulty === 'intermediate' ? '#fbbf24' : '#f87171',
                background: exercise.difficulty === 'basic'
                  ? 'color-mix(in srgb, #4ade80 12%, transparent)'
                  : exercise.difficulty === 'intermediate'
                  ? 'color-mix(in srgb, #fbbf24 12%, transparent)'
                  : 'color-mix(in srgb, #f87171 12%, transparent)',
                border: exercise.difficulty === 'basic'
                  ? '1px solid color-mix(in srgb, #4ade80 25%, transparent)'
                  : exercise.difficulty === 'intermediate'
                  ? '1px solid color-mix(in srgb, #fbbf24 25%, transparent)'
                  : '1px solid color-mix(in srgb, #f87171 25%, transparent)',
              }}>
              {exercise.difficulty}
            </span>
          </div>

          {/* Instruction */}
          <p className="font-sans text-sm text-secondary leading-relaxed">
            Assign a formal charge to each atom. Click an atom to select it, then choose its charge below.
          </p>

          {/* Diagram */}
          <LewisStructureDiagram
            structure={exercise.structure}
            renderAtomBadge={renderAtomBadge}
          />

          {/* Charge picker */}
          <AnimatePresence>
            {selectedAtom && !verified && (
              <motion.div
                key="picker"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
                className="overflow-hidden">
                <div className="flex flex-col gap-2 pt-1">
                  <p className="font-mono text-xs text-secondary">
                    Formal charge for{' '}
                    <span style={{ color: 'var(--c-halogen)' }}>{selectedAtom}</span>:
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {CHARGES.map(v => {
                      const isCurrent = assignments[selectedAtom] === v
                      return (
                        <button key={v} onClick={() => assign(selectedAtom, v)}
                          className="w-10 py-1.5 rounded-sm font-mono text-sm font-semibold transition-all"
                          style={{
                            background: isCurrent
                              ? 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))'
                              : 'rgb(var(--color-raised))',
                            border: isCurrent
                              ? '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)'
                              : '1px solid rgb(var(--color-border))',
                            color: isCurrent ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.55)',
                          }}>
                          {v > 0 ? `+${v}` : v}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* All atoms listed with assignment status (before verify) */}
          {!verified && (
            <div className="flex items-center gap-2 flex-wrap">
              {exercise.structure.atoms.map(atom => {
                const val = assignments[atom.id]
                const hasVal = val !== null && val !== undefined
                const isSelected = selectedAtom === atom.id
                return (
                  <button key={atom.id}
                    onClick={() => setSelectedAtom(atom.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-sm font-mono text-xs transition-all"
                    style={{
                      background: isSelected
                        ? 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-surface)))'
                        : 'rgb(var(--color-surface))',
                      border: isSelected
                        ? '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)'
                        : '1px solid rgb(var(--color-border))',
                      color: isSelected ? 'var(--c-halogen)'
                        : hasVal ? 'rgba(var(--overlay),0.7)'
                        : 'rgba(var(--overlay),0.35)',
                    }}>
                    <span>{atom.id}</span>
                    <span className="opacity-70">{hasVal ? ` = ${fmtFC(val!)}` : ' = ?'}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Check button */}
          {!verified && (
            <button
              onClick={handleCheck}
              disabled={!allAssigned}
              className="self-start px-5 py-2 rounded-sm font-sans text-sm font-medium transition-all
                         disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                color: 'var(--c-halogen)',
              }}>
              Check answers
            </button>
          )}

          {/* Results */}
          <AnimatePresence>
            {verified && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4">

                {/* Score line */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-sans text-sm font-semibold"
                    style={{ color: allCorrect ? '#4ade80' : 'var(--c-halogen)' }}>
                    {allCorrect
                      ? `All ${totalAtoms} correct!`
                      : `${correctCount} of ${totalAtoms} correct`}
                  </span>
                  {incorrectAtoms.length > 0 && !showAnswer && (
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="font-mono text-xs text-secondary hover:text-primary transition-colors">
                      Show answers
                    </button>
                  )}
                </div>

                {/* Missed atoms */}
                {incorrectAtoms.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <p className="font-mono text-xs text-secondary">Missed:</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {incorrectAtoms.map(atom => (
                        <div key={atom.id} className="flex items-center gap-1 font-mono text-xs px-2 py-1 rounded-sm"
                          style={{
                            background: 'color-mix(in srgb, #f87171 8%, rgb(var(--color-surface)))',
                            border: '1px solid color-mix(in srgb, #f87171 22%, transparent)',
                          }}>
                          <span style={{ color: '#f87171' }}>{atom.id}</span>
                          <span className="text-dim">
                            {' '}you: {fmtFC(assignments[atom.id]!)}{' '}
                            {showAnswer && <>→ correct: <span style={{ color: '#4ade80' }}>{fmtFC(atom.formal_charge)}</span></>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {(allCorrect || showAnswer) && exercise.notes && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-sm border border-border px-4 py-3"
                    style={{ background: 'rgb(var(--color-surface))' }}>
                    <p className="font-sans text-xs text-secondary leading-relaxed">{exercise.notes}</p>
                  </motion.div>
                )}

                {/* Next button */}
                <button onClick={nextExercise}
                  className="self-start px-5 py-2 rounded-sm font-sans text-sm font-medium transition-all"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                    color: 'var(--c-halogen)',
                  }}>
                  Next exercise →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
