import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateDynamicICEProblem, checkConcentrationAnswer } from '../../utils/equilibriumPractice'
import type { ICESolution } from '../../chem/equilibrium'
import type { EquilibriumSpecies } from '../../data/equilibriumReactions'
import GeneratedBadge from '../shared/GeneratedBadge'

interface Props { allowCustom?: boolean }

type Prefilled = Record<string, { initial: boolean; change: boolean; equilibrium: boolean }>
type Difficulty = 2 | 3 | 4 | 5

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  2: 'Simple',
  3: 'Standard',
  4: 'Advanced',
  5: 'Expert',
}

interface Problem {
  equation: string
  skeletonEquation?: string
  balancingRequired: boolean
  correctCoefficients: Record<string, number>
  K: number
  kType: 'Kc' | 'Kp'
  species: string[]
  reactantSpecies: EquilibriumSpecies[]
  productSpecies: EquilibriumSpecies[]
  initial: Record<string, number>
  solution: ICESolution
  prefilled: Prefilled
  isDynamic: boolean
}

// Expert mode: all C/E blank, higher blank-I rate.
// Normal mode: random C/E pre-fills at low rate, 25% chance of one blank I.
function generatePrefilled(species: string[], difficulty: Difficulty): Prefilled {
  const n = species.length
  const result: Prefilled = {}

  const blankIProb = difficulty === 5 ? 0.5 : 0.25
  const blankIMode = n >= 2 && Math.random() < blankIProb
  const blankISpecies = blankIMode ? species[Math.floor(Math.random() * n)] : null

  for (const sp of species) {
    result[sp] = {
      initial:     sp !== blankISpecies,
      change:      false,
      equilibrium: sp === blankISpecies, // forced given when I is blank
    }
  }

  if (difficulty < 5) {
    const prob = Math.random() * 0.45
    for (const sp of species) {
      if (Math.random() < prob) result[sp].change = true
      if (sp !== blankISpecies && Math.random() < prob) result[sp].equilibrium = true
    }

    // Ensure at least n blank cells remain
    const filledCE = species
      .flatMap(sp => (['change', 'equilibrium'] as const)
        .filter(row => result[sp][row] && !(sp === blankISpecies && row === 'equilibrium'))
        .map(row => ({ sp, row }))
      )
      .sort(() => Math.random() - 0.5)

    const iBlanks = blankISpecies ? 1 : 0
    const ceBlanks = species.length * 2 - filledCE.length - (blankISpecies ? 1 : 0)
    let totalBlanks = iBlanks + ceBlanks
    let i = 0
    while (totalBlanks < n && i < filledCE.length) {
      result[filledCE[i].sp][filledCE[i].row] = false
      totalBlanks++
      i++
    }
  }

  return result
}

function generateProblem(difficulty: Difficulty): Problem {
  const p = generateDynamicICEProblem(difficulty)
  const species = [
    ...p.reactants.map(s => s.formula),
    ...p.products.map(s => s.formula),
  ]
  const correctCoefficients: Record<string, number> = {}
  for (const s of [...p.reactants, ...p.products]) correctCoefficients[s.formula] = s.coefficient

  return {
    equation:           p.equation,
    skeletonEquation:   p.skeletonEquation,
    balancingRequired:  p.balancingRequired ?? false,
    correctCoefficients,
    K:                  p.K,
    kType:              p.kType,
    species,
    reactantSpecies:    p.reactants,
    productSpecies:     p.products,
    initial:            p.initial,
    solution:           p.solution,
    prefilled:          generatePrefilled(species, difficulty),
    isDynamic:          p.isTemplate ?? false,
  }
}

function fmt(n: number): string {
  const p = parseFloat(n.toPrecision(4))
  if (Math.abs(p) >= 1e4 || (Math.abs(p) < 1e-3 && p !== 0)) return p.toExponential(3)
  return String(p)
}

type CellState = 'idle' | 'correct' | 'wrong'
type RowKey = 'initial' | 'change' | 'equilibrium'

const GIVEN_STYLE: React.CSSProperties = {
  background: 'color-mix(in srgb, var(--c-halogen) 5%, rgb(var(--color-raised)))',
}

export default function ICETablePractice({ allowCustom = true }: Props) {
  const [difficulty, setDifficulty]   = useState<Difficulty>(3)
  const [problem, setProblem]         = useState<Problem>(() => generateProblem(3))
  const [phase, setPhase]             = useState<'balancing' | 'ice'>('ice')
  const [coeffInputs, setCoeffInputs] = useState<Record<string, string>>({})
  const [coeffError, setCoeffError]   = useState(false)
  const [coeffRevealed, setCoeffRevealed] = useState(false)
  const [cellValues, setCellValues]   = useState<Record<string, Record<RowKey, string>>>({})
  const [cellCheck, setCellCheck]     = useState<Record<string, Record<RowKey, CellState>>>({})
  const [checked, setChecked]         = useState(false)
  const [score, setScore]             = useState({ correct: 0, total: 0 })

  useEffect(() => { if (!allowCustom) nextProblem() }, [allowCustom])

  function nextProblem(d = difficulty) {
    const p = generateProblem(d)
    setProblem(p)
    setPhase(p.balancingRequired ? 'balancing' : 'ice')
    setCoeffInputs({})
    setCoeffError(false)
    setCoeffRevealed(false)
    setCellValues({})
    setCellCheck({})
    setChecked(false)
  }

  function handleDifficulty(d: Difficulty) {
    setDifficulty(d)
    setScore({ correct: 0, total: 0 })
    nextProblem(d)
  }

  // ── Balancing phase ──────────────────────────────────────────────────────────

  function handleSubmitCoefficients() {
    const { species, correctCoefficients } = problem
    const allCorrect = species.every(sp => {
      const v = parseInt(coeffInputs[sp] ?? '', 10)
      return Number.isInteger(v) && v > 0 && v === correctCoefficients[sp]
    })
    if (allCorrect) {
      setCoeffError(false)
      setPhase('ice')
    } else {
      setCoeffError(true)
    }
  }

  function handleReveal() {
    setCoeffRevealed(true)
    const { species, correctCoefficients } = problem
    const revealed: Record<string, string> = {}
    for (const sp of species) revealed[sp] = String(correctCoefficients[sp])
    setCoeffInputs(revealed)
  }

  function handleCoeffKeyDown(e: React.KeyboardEvent, formula: string) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const { species } = problem
    const idx = species.indexOf(formula)
    if (idx < species.length - 1) {
      ;(document.getElementById(`coeff-${species[idx + 1]}`) as HTMLInputElement | null)?.focus()
    } else {
      handleSubmitCoefficients()
    }
  }

  // ── ICE table phase ──────────────────────────────────────────────────────────

  function get(sp: string, row: RowKey): string { return cellValues[sp]?.[row] ?? '' }
  function set(sp: string, row: RowKey, val: string) {
    setCellValues(prev => ({ ...prev, [sp]: { ...prev[sp], [row]: val } }))
  }

  function handleCheck() {
    if (checked) return
    const { species, initial, solution, prefilled } = problem
    const newCheck: Record<string, Record<RowKey, CellState>> = {}
    let allBlankCorrect = true

    for (const sp of species) {
      newCheck[sp] = {} as Record<RowKey, CellState>
      const correct: Record<RowKey, number> = {
        initial:     initial[sp] ?? 0,
        change:      solution.equilibriumConcentrations[sp] - (initial[sp] ?? 0),
        equilibrium: solution.equilibriumConcentrations[sp],
      }
      for (const row of ['initial', 'change', 'equilibrium'] as RowKey[]) {
        if (prefilled[sp][row]) continue
        const v = get(sp, row)
        const ok = v.trim() ? checkConcentrationAnswer(v, correct[row]) : false
        newCheck[sp][row] = ok ? 'correct' : 'wrong'
        if (!ok) allBlankCorrect = false
      }
    }

    setCellCheck(newCheck)
    setChecked(true)
    setScore(s => ({ correct: s.correct + (allBlankCorrect ? 1 : 0), total: s.total + 1 }))
  }

  function blankCellIds(): string[] {
    const { species, prefilled } = problem
    const ids: string[] = []
    for (const row of ['initial', 'change', 'equilibrium'] as RowKey[]) {
      for (const sp of species) {
        if (!prefilled[sp][row]) ids.push(`ice-${sp}-${row}`)
      }
    }
    return ids
  }

  function handleKeyDown(e: React.KeyboardEvent, sp: string, row: RowKey) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const ids = blankCellIds()
    const idx = ids.indexOf(`ice-${sp}-${row}`)
    if (idx >= 0 && idx < ids.length - 1) {
      ;(document.getElementById(ids[idx + 1]) as HTMLInputElement | null)?.focus()
    } else {
      handleCheck()
    }
  }

  // ── Render helpers ───────────────────────────────────────────────────────────

  const { equation, skeletonEquation, balancingRequired, K, kType, species, reactantSpecies, productSpecies, initial, solution, prefilled } = problem

  function stateColor(state: CellState | undefined, type: 'border' | 'text') {
    if (state === 'correct') return type === 'border' ? 'border-emerald-700/60' : 'text-emerald-300'
    if (state === 'wrong')   return type === 'border' ? 'border-rose-700/60'    : 'text-rose-300'
    return type === 'border' ? 'border-border' : 'text-primary'
  }

  function correctValue(sp: string, row: RowKey): number {
    if (row === 'initial')     return initial[sp] ?? 0
    if (row === 'change')      return solution.equilibriumConcentrations[sp] - (initial[sp] ?? 0)
    return solution.equilibriumConcentrations[sp]
  }

  function renderCell(sp: string, row: RowKey) {
    const isGiven = prefilled[sp][row]
    const val     = correctValue(sp, row)
    const state   = cellCheck[sp]?.[row]

    if (isGiven) {
      return (
        <div className="px-3 py-2 text-center font-mono text-sm text-secondary rounded-sm"
          style={GIVEN_STYLE}>
          {fmt(val)}
        </div>
      )
    }

    if (checked) {
      return (
        <div className="flex flex-col items-center gap-0.5 py-1 px-2">
          <span className={`text-sm font-mono ${stateColor(state, 'text')}`}>
            {get(sp, row) || '—'}
          </span>
          {state === 'wrong' && (
            <span className="text-xs text-emerald-400">{fmt(val)}</span>
          )}
        </div>
      )
    }

    const placeholder = row === 'initial' ? '?' : row === 'change' ? '±value' : 'M'
    return (
      <input
        id={`ice-${sp}-${row}`}
        type="text"
        inputMode="decimal"
        value={get(sp, row)}
        onChange={e => set(sp, row, e.target.value)}
        onKeyDown={e => handleKeyDown(e, sp, row)}
        placeholder={placeholder}
        className={`w-full bg-raised border rounded-sm px-2 py-1 text-center font-mono text-sm
          focus:outline-none focus:border-muted transition-colors
          ${stateColor(state, 'border')} ${stateColor(state, 'text')}`}
      />
    )
  }

  function renderSpeciesSide(sps: EquilibriumSpecies[]) {
    return sps.map((s, i) => {
      const isWrong = coeffError && coeffInputs[s.formula] !== undefined
        && parseInt(coeffInputs[s.formula], 10) !== problem.correctCoefficients[s.formula]
      return (
        <span key={s.formula} className="flex items-center gap-1">
          {i > 0 && <span className="text-dim px-1 font-mono text-sm">+</span>}
          <input
            id={`coeff-${s.formula}`}
            type="text"
            inputMode="numeric"
            value={coeffInputs[s.formula] ?? ''}
            onChange={e => setCoeffInputs(prev => ({ ...prev, [s.formula]: e.target.value }))}
            onKeyDown={e => handleCoeffKeyDown(e, s.formula)}
            placeholder="1"
            className={`w-10 text-center bg-raised border rounded-sm px-1 py-0.5 font-mono text-sm
              focus:outline-none focus:border-muted transition-colors
              ${isWrong ? 'border-rose-700/60 text-rose-300' : 'border-border text-primary'}`}
          />
          <span className="font-mono text-sm text-primary">
            {s.formula}<span className="text-dim text-xs">({s.state})</span>
          </span>
        </span>
      )
    })
  }

  const allBlankCorrect = species.every(sp =>
    (['initial', 'change', 'equilibrium'] as RowKey[]).every(
      row => prefilled[sp][row] || cellCheck[sp]?.[row] === 'correct'
    )
  )

  const rows: { label: string; row: RowKey; bg?: string }[] = [
    { label: 'I', row: 'initial',     bg: 'color-mix(in srgb, var(--c-halogen) 4%, rgb(var(--color-raised)))' },
    { label: 'C', row: 'change' },
    { label: 'E', row: 'equilibrium', bg: 'rgb(var(--color-surface))' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Fill in the blank cells of the ICE table. Shaded cells are given. Answers accepted within ±2%.
      </p>

      {/* Difficulty selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-mono text-xs text-secondary uppercase tracking-wider">Difficulty</span>
        <div className="flex gap-1.5 flex-wrap">
          {([2, 3, 4, 5] as Difficulty[]).map(d => {
            const isActive = d === difficulty
            return (
              <button key={d} onClick={() => handleDifficulty(d)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-sm font-sans text-xs transition-colors"
                style={isActive ? {
                  background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                  color: 'var(--c-halogen)',
                } : {
                  background: 'rgb(var(--color-raised))',
                  border: '1px solid rgb(var(--color-border))',
                  color: 'var(--color-secondary)',
                }}>
                <span>{'★'.repeat(d - 1)}</span>
                <span>{DIFFICULTY_LABELS[d]}</span>
              </button>
            )
          })}
        </div>
        {difficulty === 5 && (
          <span className="font-sans text-xs text-dim">Balance the equation first, then fill the ICE table</span>
        )}
      </div>

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
        <motion.div key={equation + JSON.stringify(initial)}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          className="rounded-sm border border-border bg-surface p-5 flex flex-col gap-4"
        >
          {/* Reaction header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-secondary uppercase tracking-wider">Reaction</p>
              {problem.isDynamic && <GeneratedBadge />}
            </div>
            {phase === 'ice' && (
              <>
                <p className="font-mono text-sm text-primary">{equation}</p>
                <p className="font-mono text-sm text-secondary">
                  K<sub>{kType === 'Kc' ? 'c' : 'p'}</sub> = {K.toPrecision(3)}
                </p>
              </>
            )}
            {phase === 'balancing' && (
              <p className="font-mono text-sm text-dim">{skeletonEquation}</p>
            )}
          </div>

          {/* Phase content */}
          <AnimatePresence mode="wait">
            {phase === 'balancing' ? (
              <motion.div key="balancing"
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-xs text-secondary uppercase tracking-wider">Step 1 — Balance the Equation</p>
                  <p className="font-sans text-sm text-secondary">
                    Enter integer coefficients to balance this reaction. Leave blank for 1.
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {renderSpeciesSide(reactantSpecies)}
                  <span className="font-mono text-sm text-secondary px-2">⇌</span>
                  {renderSpeciesSide(productSpecies)}
                </div>

                {coeffError && !coeffRevealed && (
                  <p className="font-sans text-sm text-rose-400">
                    Some coefficients are incorrect — check your work and try again.
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <button onClick={handleSubmitCoefficients}
                    className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                      color: 'var(--c-halogen)',
                    }}>
                    Submit
                  </button>
                  {!coeffRevealed ? (
                    <button onClick={handleReveal}
                      className="font-sans text-xs text-dim hover:text-secondary transition-colors">
                      Reveal balanced equation
                    </button>
                  ) : (
                    <button onClick={() => setPhase('ice')}
                      className="px-3 py-1 rounded-sm font-sans text-xs border border-border text-secondary hover:text-primary hover:border-muted transition-colors">
                      Continue to ICE table →
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="ice"
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                className="flex flex-col gap-4"
              >
                {balancingRequired && (
                  <p className="font-mono text-xs text-secondary">Step 2 — Complete the ICE table</p>
                )}

                {/* ICE table */}
                <div className="overflow-x-auto">
                  <table className="font-mono text-sm border-collapse w-full">
                    <thead>
                      <tr>
                        <th className="border border-border px-3 py-1.5 text-left text-secondary font-normal text-xs uppercase tracking-wider w-6" />
                        {species.map(sp => (
                          <th key={sp} className="border border-border px-3 py-2 text-center text-primary font-medium min-w-[7rem]">
                            {sp}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ label, row, bg }) => (
                        <tr key={row} style={bg ? { background: bg } : undefined}>
                          <td className="border border-border px-3 py-1.5 text-secondary text-xs font-bold">{label}</td>
                          {species.map(sp => (
                            <td key={sp} className="border border-border p-1">
                              {renderCell(sp, row)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Check / result */}
                {!checked ? (
                  <div className="flex items-center gap-3">
                    <button onClick={handleCheck}
                      className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                      style={{
                        background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
                        border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
                        color: 'var(--c-halogen)',
                      }}>
                      Check
                    </button>
                    <span className="font-mono text-xs text-dim">Enter/Tab to advance cells</span>
                  </div>
                ) : (
                  <span className={`font-sans text-sm font-medium ${allBlankCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {allBlankCorrect ? '✓ All correct' : '✗ See corrections above in green'}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Steps + Next (only shown after ICE table is checked) */}
      {checked && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-xs text-secondary uppercase tracking-wider">Steps</p>
            {solution.steps.map((step, i) => (
              <p key={i} className="font-sans text-sm text-secondary">{i + 1}. {step}</p>
            ))}
          </div>
          <button onClick={() => nextProblem()}
            className="self-start px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors">
            Next &rarr;
          </button>
        </motion.div>
      )}

      <p className="font-mono text-xs text-secondary">Answers within ±2% accepted</p>
    </div>
  )
}
