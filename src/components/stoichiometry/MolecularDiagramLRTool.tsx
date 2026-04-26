import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ParticleBox, { type Particle, type SpeciesColor } from '../shared/ParticleBox'
import { generateMolecularDiagramProblem, type MolecularDiagramProblem } from '../../utils/molecularDiagramPractice'

const COLOR_A: SpeciesColor = { fill: '#38bdf8', text: '#0c4a6e' }
const COLOR_B: SpeciesColor = { fill: '#fb923c', text: '#7c2d12' }
const COLOR_P: SpeciesColor = { fill: '#a855f7', text: '#3b0764' }

function speciesColors(productLabel: string): Record<string, SpeciesColor> {
  return { A: COLOR_A, B: COLOR_B, [productLabel]: COLOR_P }
}

function makeParticles(
  countA: number, countB: number, idPrefix = ''
): Particle[] {
  return [
    ...Array.from({ length: countA }, (_, i) => ({ id: `${idPrefix}a${i}`, species: 'A', label: 'A' })),
    ...Array.from({ length: countB }, (_, i) => ({ id: `${idPrefix}b${i}`, species: 'B', label: 'B' })),
  ]
}

function makeAfterParticles(p: MolecularDiagramProblem): Particle[] {
  return [
    ...Array.from({ length: p.excessA }, (_, i) => ({ id: `xa${i}`, species: 'A', label: 'A' })),
    ...Array.from({ length: p.excessB }, (_, i) => ({ id: `xb${i}`, species: 'B', label: 'B' })),
    ...Array.from({ length: p.productCount }, (_, i) => ({
      id: `p${i}`, species: p.productLabel, label: p.productLabel,
    })),
  ]
}

function Dot({ color }: { color: string }) {
  return (
    <svg width="14" height="14" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="6" fill={color} />
    </svg>
  )
}

interface Props { allowCustom?: boolean }

export default function MolecularDiagramLRTool({ allowCustom: _a = true }: Props) {
  const [problem, setProblem] = useState<MolecularDiagramProblem>(
    () => generateMolecularDiagramProblem()
  )
  const [lrChoice,  setLrChoice]  = useState<'A' | 'B' | null>(null)
  const [countAns,  setCountAns]  = useState('')
  const [checked,   setChecked]   = useState(false)
  const [showAfter, setShowAfter] = useState(false)

  const lrCorrect  = checked ? lrChoice === problem.limiting : null
  const cntCorrect = checked ? parseInt(countAns, 10) === problem.productCount : null
  const bothOk     = lrCorrect === true && cntCorrect === true

  function handleCheck() {
    setChecked(true)
    if (lrChoice === problem.limiting && parseInt(countAns, 10) === problem.productCount) {
      setShowAfter(true)
    }
  }

  function handleNew() {
    setProblem(generateMolecularDiagramProblem())
    setLrChoice(null)
    setCountAns('')
    setChecked(false)
    setShowAfter(false)
  }

  function resetCheck() {
    setChecked(false)
    setShowAfter(false)
  }

  const canCheck = lrChoice !== null && countAns.trim() !== ''
  const colors   = speciesColors(problem.productLabel)

  function lrBtnStyle(choice: 'A' | 'B') {
    const selected = lrChoice === choice
    if (checked && selected) {
      return lrCorrect
        ? { background: 'color-mix(in srgb, #22c55e 20%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, #22c55e 40%, transparent)', color: '#22c55e' }
        : { background: 'color-mix(in srgb, #ef4444 20%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, #ef4444 40%, transparent)', color: '#ef4444' }
    }
    if (selected) {
      return {
        background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))',
        border:     '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
        color:      'var(--c-halogen)',
      }
    }
    return {
      background: 'rgb(var(--color-raised))',
      border:     '1px solid rgb(var(--color-border))',
      color:      'rgba(var(--overlay),0.45)',
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">

      {/* Equation */}
      <div className="px-3 py-2 rounded-sm font-mono text-sm text-primary"
        style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
        {problem.equation}
      </div>

      {/* Before reaction */}
      <div className="flex flex-col gap-2">
        <ParticleBox
          particles={makeParticles(problem.reactantA.count, problem.reactantB.count)}
          speciesColors={colors}
          seed={problem.layoutSeed}
          title="Before reaction"
        />
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-mono text-xs text-secondary">
            <Dot color={COLOR_A.fill} /> A ({problem.reactantA.count})
          </span>
          <span className="flex items-center gap-1.5 font-mono text-xs text-secondary">
            <Dot color={COLOR_B.fill} /> B ({problem.reactantB.count})
          </span>
        </div>
      </div>

      {/* Q1: Limiting reagent */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-primary">
          Which reactant is the limiting reagent?
        </label>
        <div className="flex items-center gap-2">
          {(['A', 'B'] as const).map(c => (
            <button key={c} onClick={() => { setLrChoice(c); resetCheck() }}
              className="w-12 py-2 rounded-sm font-mono text-sm font-bold transition-colors"
              style={lrBtnStyle(c)}>
              {c}
            </button>
          ))}
          {checked && lrCorrect !== null && (
            <span className={`font-mono text-xs ${lrCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {lrCorrect ? '✓ Correct' : `✗ Answer: ${problem.limiting}`}
            </span>
          )}
        </div>
      </div>

      {/* Q2: Product count */}
      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-primary">
          How many <span className="font-mono">{problem.productLabel}</span> molecules form?
        </label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            value={countAns}
            onChange={e => { setCountAns(e.target.value.replace(/[^0-9]/g, '')); resetCheck() }}
            placeholder="e.g. 3"
            className="w-20 px-3 py-2 rounded-sm font-mono text-sm text-primary focus:outline-none"
            style={{
              background: 'rgb(var(--color-raised))',
              border: checked
                ? cntCorrect
                  ? '1px solid color-mix(in srgb, #22c55e 50%, transparent)'
                  : '1px solid color-mix(in srgb, #ef4444 50%, transparent)'
                : '1px solid rgb(var(--color-border))',
            }}
          />
          {checked && cntCorrect !== null && (
            <span className={`font-mono text-xs ${cntCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {cntCorrect ? '✓ Correct' : `✗ Answer: ${problem.productCount}`}
            </span>
          )}
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 flex-wrap print:hidden">
        <button onClick={handleCheck} disabled={!canCheck}
          className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border:     '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color:      'var(--c-halogen)',
          }}>
          Check
        </button>
        {checked && !showAfter && (
          <button onClick={() => setShowAfter(true)}
            className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
            style={{
              background: 'rgb(var(--color-raised))',
              border: '1px solid rgb(var(--color-border))',
              color: 'rgba(var(--overlay),0.6)',
            }}>
            Show After-Reaction
          </button>
        )}
        <button onClick={handleNew}
          className="px-4 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'rgb(var(--color-raised))',
            border: '1px solid rgb(var(--color-border))',
            color: 'rgba(var(--overlay),0.6)',
          }}>
          New Problem
        </button>
      </div>

      {/* Summary badge when both correct */}
      {bothOk && (
        <p className="font-mono text-xs text-green-400">
          ✓ {problem.limiting} is limiting — {problem.productCount} {problem.productLabel} form
          {problem.excessA > 0 ? `, ${problem.excessA} A remain` : ''}
          {problem.excessB > 0 ? `, ${problem.excessB} B remain` : ''}
        </p>
      )}

      {/* After-reaction box */}
      <AnimatePresence>
        {showAfter && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-2"
          >
            <ParticleBox
              particles={makeAfterParticles(problem)}
              speciesColors={colors}
              seed={problem.layoutSeed + 1}
              title="After reaction (complete)"
            />
            <div className="flex items-center gap-4 flex-wrap">
              {problem.excessA > 0 && (
                <span className="flex items-center gap-1.5 font-mono text-xs text-secondary">
                  <Dot color={COLOR_A.fill} /> A excess ({problem.excessA})
                </span>
              )}
              {problem.excessB > 0 && (
                <span className="flex items-center gap-1.5 font-mono text-xs text-secondary">
                  <Dot color={COLOR_B.fill} /> B excess ({problem.excessB})
                </span>
              )}
              <span className="flex items-center gap-1.5 font-mono text-xs text-secondary">
                <Dot color={COLOR_P.fill} /> {problem.productLabel} ({problem.productCount})
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
