import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ELEMENTS, EXCEPTIONS,
  computeConfig, getNobleGasCore,
  groupByShell, parseWrittenConfig, checkWrittenConfig, checkBoxDiagram,
  configForSpecies, unpairedForSpecies, chargeLabel, VALID_CHARGES,
  type SubshellFill,
} from './electronConfigUtils'

// ── Difficulty presets ────────────────────────────────────────────────────────

const PRESETS: { label: string; min: number; max: number }[] = [
  { label: 'Periods 1–2',    min: 1,  max: 10  },
  { label: 'Periods 1–3',    min: 1,  max: 18  },
  { label: '3d Block',       min: 1,  max: 30  },
  { label: '4d Block',       min: 1,  max: 48  },
  { label: 'All Elements',   min: 1,  max: 118 },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Problem { z: number; charge: number }

function generateProblems(min: number, max: number, count: number, includeIons: boolean): Problem[] {
  const pool: Problem[] = []
  for (let z = min; z <= max; z++) {
    pool.push({ z, charge: 0 })
    if (includeIons) {
      for (const c of (VALID_CHARGES[z] ?? [])) {
        const eCount = z - c
        if (eCount >= 1 && eCount <= 118) pool.push({ z, charge: c })
      }
    }
  }
  return shuffle(pool).slice(0, Math.min(count, pool.length))
}

// Returns the abbreviated ionic config ({coreLabel, subshells}) for a species.
function getIonicAbbrConfig(z: number, charge: number) {
  const full = configForSpecies(z, charge)
  const core = getNobleGasCore(z)
  if (!core) return { coreLabel: null, subshells: full }
  const coreLabels = new Set(computeConfig(core.coreZ, true).map(s => s.label))
  return { coreLabel: `[${core.symbol}]`, subshells: full.filter(s => !coreLabels.has(s.label)) }
}

// ── Clickable orbital box ─────────────────────────────────────────────────────
// state: 0=empty, 1=↑, 2=↑↓

type BoxStatus = 'neutral' | 'correct' | 'wrong-count' | 'wrong-hund'

function ClickableOrbitalBox({
  value,
  onClick,
  status,
  disabled,
}: {
  value: 0 | 1 | 2
  onClick: () => void
  status: BoxStatus
  disabled: boolean
}) {
  const borderColor = {
    neutral:     'rgba(var(--overlay),0.18)',
    correct:     '#22c55e',
    'wrong-count': '#ef4444',
    'wrong-hund':  '#f59e0b',
  }[status]

  const bg = {
    neutral:     value > 0 ? 'rgba(var(--overlay),0.04)' : 'transparent',
    correct:     'rgba(34,197,94,0.08)',
    'wrong-count': 'rgba(239,68,68,0.08)',
    'wrong-hund':  'rgba(245,158,11,0.08)',
  }[status]

  const arrowColor = status === 'neutral' ? 'var(--c-halogen)' : borderColor

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-8 rounded-sm flex items-center justify-center gap-px shrink-0 transition-colors"
      style={{ border: `1px solid ${borderColor}`, background: bg }}
      title={disabled ? undefined : 'Click to cycle: empty → ↑ → ↑↓ → empty'}
    >
      <span className="font-mono text-xs leading-none select-none"
        style={{ color: value >= 1 ? arrowColor : 'rgba(var(--overlay),0.08)' }}>↑</span>
      <span className="font-mono text-xs leading-none select-none"
        style={{ color: value === 2 ? arrowColor : 'rgba(var(--overlay),0.08)' }}>↓</span>
    </button>
  )
}

// ── Box diagram input ─────────────────────────────────────────────────────────

function BoxDiagramInput({
  subshells,
  coreLabel,
  boxes,
  onCycle,
  boxStatuses,
  disabled,
}: {
  subshells: SubshellFill[]
  coreLabel: string | null
  boxes: Record<string, (0 | 1 | 2)[]>
  onCycle: (label: string, i: number) => void
  boxStatuses: Record<string, BoxStatus>
  disabled: boolean
}) {
  const shellRows = groupByShell(subshells)

  return (
    <div className="flex flex-col gap-1">
      {coreLabel && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-sm border border-border"
          style={{ background: 'rgb(var(--color-surface))' }}>
          <span className="font-mono text-xs text-secondary w-8 text-center shrink-0">core</span>
          <span className="font-mono text-sm text-dim">{coreLabel} — pre-filled</span>
        </div>
      )}
      {shellRows.map(([n, subs]) => (
        <div key={n} className="flex items-end gap-4 p-3 rounded-sm border border-border"
          style={{ background: 'rgb(var(--color-surface))' }}>
          <div className="w-8 shrink-0 flex items-center justify-center pb-0.5">
            <span className="font-mono text-xs text-secondary">n={n}</span>
          </div>
          <div className="flex items-end gap-4 flex-wrap">
            {subs.map(sub => {
              const status = boxStatuses[sub.label] ?? 'neutral'
              return (
                <div key={sub.label} className="flex flex-col items-start gap-1">
                  <span className="font-mono text-[10px] tracking-wide"
                    style={{
                      color: status === 'correct' ? '#22c55e'
                           : status === 'wrong-count' ? '#ef4444'
                           : status === 'wrong-hund' ? '#f59e0b'
                           : 'rgba(var(--overlay),0.35)',
                    }}>
                    {sub.label}
                  </span>
                  <div className="flex gap-0.5">
                    {(boxes[sub.label] ?? Array(sub.orbitals).fill(0)).map((v, i) => (
                      <ClickableOrbitalBox
                        key={i}
                        value={v as 0 | 1 | 2}
                        onClick={() => onCycle(sub.label, i)}
                        status={status}
                        disabled={disabled}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type PracticePhase = 'settings' | 'active' | 'done'
type ProblemPhase  = 'config' | 'magnetic' | 'reviewed'

interface ProblemResult {
  z: number
  charge: number
  writtenCorrect: boolean
  boxCorrect: boolean
  magneticCorrect: boolean | null   // null = magnetic phase skipped
  unpairedCorrect: boolean | null
}

interface Props { allowCustom?: boolean }

export default function ElectronConfigPractice({ allowCustom = true }: Props) {
  const [phase, setPhase] = useState<PracticePhase>('settings')
  const [presetIdx, setPresetIdx] = useState(1)          // Periods 1–3 default
  const [count, setCount] = useState(5)
  const [nobleHint, setNobleHint] = useState(true)
  const [includeIons, setIncludeIons] = useState(false)

  const [problems, setProblems] = useState<Problem[]>([])
  const [idx, setIdx] = useState(0)
  const [results, setResults] = useState<ProblemResult[]>([])

  // Per-problem phase
  const [problemPhase, setProblemPhase] = useState<ProblemPhase>('config')

  // Config phase state
  const [writtenInput, setWrittenInput] = useState('')
  const [boxes, setBoxes] = useState<Record<string, (0|1|2)[]>>({})
  const [writtenResult, setWrittenResult] = useState<ReturnType<typeof checkWrittenConfig> | null>(null)
  const [boxResults, setBoxResults] = useState<ReturnType<typeof checkBoxDiagram>>([])

  // Magnetic phase state
  const [magneticAnswer, setMagneticAnswer] = useState<'para' | 'dia' | null>(null)
  const [unpairedAnswer, setUnpairedAnswer] = useState('')

  // ── Derived ─────────────────────────────────────────────────────────────────

  const currentProblem = problems[idx] ?? { z: 1, charge: 0 }
  const currentZ      = currentProblem.z
  const currentCharge = currentProblem.charge
  const electronCount = currentZ - currentCharge
  const element       = ELEMENTS[currentZ]
  const exception     = EXCEPTIONS[currentZ]
  const fullConfig    = configForSpecies(currentZ, currentCharge)
  const { coreLabel, subshells: abbrSubshells } = getIonicAbbrConfig(currentZ, currentCharge)

  // Subshells the user must fill (abbr if hint on, full if hint off)
  const practiceSubshells = nobleHint ? abbrSubshells : fullConfig
  const practiceCoreLabel = nobleHint ? coreLabel : null

  // Display label for the species
  const speciesLabel = currentCharge !== 0
    ? `${element.symbol}${chargeLabel(currentCharge)}`
    : element.symbol

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const initBoxes = useCallback((subshells: SubshellFill[]) => {
    const init: Record<string, (0|1|2)[]> = {}
    for (const s of subshells) init[s.label] = Array(s.orbitals).fill(0)
    setBoxes(init)
  }, [])

  function startPractice() {
    const ps = generateProblems(PRESETS[presetIdx].min, PRESETS[presetIdx].max, count, includeIons)
    setProblems(ps)
    setIdx(0)
    setResults([])
    setPhase('active')
    resetProblem(ps[0])
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!allowCustom) startPractice() }, [allowCustom])

  function resetProblem(problem: Problem) {
    setWrittenInput('')
    setProblemPhase('config')
    setWrittenResult(null)
    setBoxResults([])
    setMagneticAnswer(null)
    setUnpairedAnswer('')
    const { subshells } = nobleHint
      ? getIonicAbbrConfig(problem.z, problem.charge)
      : { subshells: configForSpecies(problem.z, problem.charge) }
    initBoxes(subshells)
  }

  function cycleBox(label: string, i: number) {
    setBoxes(prev => {
      const row = [...(prev[label] ?? [])]
      row[i] = ((row[i] + 1) % 3) as 0 | 1 | 2
      return { ...prev, [label]: row }
    })
  }

  function checkAnswers() {
    // Check written config
    const userMap = parseWrittenConfig(writtenInput)
    const wResult = userMap
      ? checkWrittenConfig(userMap, fullConfig)
      : { correct: false, wrongSubshells: [], missingSubshells: fullConfig.map(s => s.label), extraSubshells: [] }
    setWrittenResult(wResult)

    // Check box diagram
    const bResult = checkBoxDiagram(boxes, practiceSubshells)
    setBoxResults(bResult)

    const allBoxCorrect = bResult.every(r => r.electronCountCorrect && r.hundCorrect)
    setResults(prev => [...prev, {
      z: currentZ,
      charge: currentCharge,
      writtenCorrect: wResult.correct,
      boxCorrect: allBoxCorrect,
      magneticCorrect: null,
      unpairedCorrect: null,
    }])

    if (allBoxCorrect) {
      setProblemPhase('magnetic')
    } else {
      setProblemPhase('reviewed')
    }
  }

  function checkMagnetic() {
    const correct = unpairedForSpecies(currentZ, currentCharge)
    const isPara = correct > 0
    const magCorrect = magneticAnswer === (isPara ? 'para' : 'dia')
    const unpCorrect = parseInt(unpairedAnswer) === correct
    setResults(prev => prev.map((r, i) =>
      i === prev.length - 1 ? { ...r, magneticCorrect: magCorrect, unpairedCorrect: unpCorrect } : r
    ))
    setProblemPhase('reviewed')
  }

  function nextProblem() {
    const nextIdx = idx + 1
    if (nextIdx >= problems.length) {
      setPhase('done')
    } else {
      setIdx(nextIdx)
      resetProblem(problems[nextIdx])
    }
  }

  // ── Box status map for highlighting ──────────────────────────────────────────

  const boxStatuses: Record<string, BoxStatus> = {}
  if (problemPhase !== 'config') {
    for (const r of boxResults) {
      if (!r.electronCountCorrect) boxStatuses[r.label] = 'wrong-count'
      else if (!r.hundCorrect)     boxStatuses[r.label] = 'wrong-hund'
      else                         boxStatuses[r.label] = 'correct'
    }
  }

  // ── Score ─────────────────────────────────────────────────────────────────────

  const score = results.reduce((s, r) => s + (r.writtenCorrect && r.boxCorrect ? 1 : 0), 0)

  // ── Render: Settings ─────────────────────────────────────────────────────────

  if (phase === 'settings') {
    return (
      <div className="flex flex-col gap-6 max-w-lg">
        <div className="flex flex-col gap-4 p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <p className="font-mono text-xs tracking-widest text-secondary uppercase">Element Range</p>
          <div className="flex flex-col gap-1.5">
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => setPresetIdx(i)}
                className="flex items-center gap-3 px-3 py-2 rounded-sm border text-left transition-colors"
                style={{
                  border: presetIdx === i
                    ? '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)'
                    : '1px solid rgba(var(--overlay),0.1)',
                  background: presetIdx === i ? 'color-mix(in srgb, var(--c-halogen) 10%, transparent)' : 'transparent',
                  color: presetIdx === i ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.55)',
                }}>
                <span className="font-sans text-sm">{p.label}</span>
                <span className="font-mono text-xs text-dim ml-auto">Z = {p.min}–{p.max}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-3 p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
            <p className="font-mono text-xs tracking-widest text-secondary uppercase">Problems</p>
            <div className="flex gap-2">
              {[5, 10, 15].map(n => (
                <button key={n} onClick={() => setCount(n)}
                  className="flex-1 py-1.5 rounded-sm border font-mono text-sm transition-colors"
                  style={{
                    border: count === n ? '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' : '1px solid rgba(var(--overlay),0.1)',
                    background: count === n ? 'color-mix(in srgb, var(--c-halogen) 10%, transparent)' : 'transparent',
                    color: count === n ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)',
                  }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
            <p className="font-mono text-xs tracking-widest text-secondary uppercase">Noble Gas Core</p>
            <button onClick={() => setNobleHint(h => !h)}
              className="py-1.5 rounded-sm border font-sans text-sm transition-colors"
              style={{
                border: nobleHint ? '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' : '1px solid rgba(var(--overlay),0.1)',
                background: nobleHint ? 'color-mix(in srgb, var(--c-halogen) 10%, transparent)' : 'transparent',
                color: nobleHint ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)',
              }}>
              {nobleHint ? 'Core shown (easier)' : 'Core hidden (harder)'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
          <p className="font-mono text-xs tracking-widest text-secondary uppercase">Include Ions</p>
          <button onClick={() => setIncludeIons(h => !h)}
            className="py-1.5 rounded-sm border font-sans text-sm transition-colors"
            style={{
              border: includeIons ? '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' : '1px solid rgba(var(--overlay),0.1)',
              background: includeIons ? 'color-mix(in srgb, var(--c-halogen) 10%, transparent)' : 'transparent',
              color: includeIons ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)',
            }}>
            {includeIons ? 'Ions included (harder)' : 'Neutral atoms only'}
          </button>
        </div>

        <button onClick={startPractice}
          className="py-2.5 rounded-sm font-sans font-medium text-sm transition-all"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Start Practice
        </button>
      </div>
    )
  }

  // ── Render: Done ─────────────────────────────────────────────────────────────

  if (phase === 'done') {
    const total = results.length
    const bothCorrect = results.filter(r => r.writtenCorrect && r.boxCorrect).length
    const pct = Math.round((bothCorrect / total) * 100)
    const hasMagnetic = results.some(r => r.magneticCorrect !== null)
    return (
      <div className="flex flex-col gap-6 max-w-lg">
        <div className="flex flex-col gap-4 p-6 rounded-sm border border-border items-center text-center"
          style={{ background: 'rgb(var(--color-surface))' }}>
          <span className="font-mono text-5xl font-bold" style={{ color: 'var(--c-halogen)' }}>
            {bothCorrect}/{total}
          </span>
          <span className="font-sans text-lg text-bright">{pct}% correct</span>
          <p className="font-sans text-sm text-secondary">Both written config and orbital box must be correct.</p>
        </div>

        <div className="flex flex-col gap-1">
          {results.map((r, i) => {
            const el = ELEMENTS[r.z]
            const cl = chargeLabel(r.charge)
            const label = cl ? `${el.symbol}${cl}` : el.symbol
            return (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-sm border border-border"
                style={{ background: 'rgb(var(--color-surface))' }}>
                <span className="font-mono text-sm font-semibold w-12 shrink-0"
                  style={{ color: 'var(--c-halogen)' }}>{label}</span>
                <span className="font-sans text-xs text-secondary flex-1">{el.name}</span>
                <span className="font-mono text-xs" style={{ color: r.writtenCorrect ? '#22c55e' : '#ef4444' }}>
                  cfg {r.writtenCorrect ? '✓' : '✗'}
                </span>
                <span className="font-mono text-xs" style={{ color: r.boxCorrect ? '#22c55e' : '#ef4444' }}>
                  box {r.boxCorrect ? '✓' : '✗'}
                </span>
                {hasMagnetic && (
                  <span className="font-mono text-xs" style={{
                    color: r.magneticCorrect === null ? 'rgba(var(--overlay),0.3)'
                         : r.magneticCorrect ? '#22c55e' : '#ef4444',
                  }}>
                    mag {r.magneticCorrect === null ? '—' : r.magneticCorrect ? '✓' : '✗'}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <button onClick={() => setPhase('settings')}
          className="py-2.5 rounded-sm font-sans font-medium text-sm transition-all"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Try Again
        </button>
      </div>
    )
  }

  // ── Render: Active problem ────────────────────────────────────────────────────

  const checked = problemPhase !== 'config'

  return (
    <div className="flex flex-col gap-5">

      {/* Progress bar + score */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(var(--overlay),0.08)' }}>
          <div className="h-1 rounded-full transition-all"
            style={{ width: `${((idx) / problems.length) * 100}%`, background: 'var(--c-halogen)' }} />
        </div>
        <span className="font-mono text-xs text-dim shrink-0">{idx + 1} / {problems.length}</span>
        <span className="font-mono text-xs shrink-0" style={{ color: 'var(--c-halogen)' }}>
          {score} correct
        </span>
      </div>

      {/* Element card */}
      <div className="flex items-center gap-4 p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
        <div className="flex flex-col items-center w-16 shrink-0">
          <span className="font-mono text-5xl font-bold leading-none" style={{ color: 'var(--c-halogen)' }}>
            {element.symbol}
          </span>
          {currentCharge !== 0 && (
            <span className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>
              {chargeLabel(currentCharge)}
            </span>
          )}
          <span className="font-mono text-xs text-dim mt-1">{currentZ}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-sans text-base font-semibold text-bright">{element.name}</span>
          <span className="font-mono text-xs text-dim">
            Z = {currentZ}
            {currentCharge !== 0 ? ` · ${electronCount} electrons` : ` · ${currentZ} electrons`}
          </span>
        </div>
        {exception && currentCharge === 0 && (
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm ml-auto self-start"
            style={{
              background: 'color-mix(in srgb, #f59e0b 12%, transparent)',
              color: '#f59e0b',
              border: '1px solid color-mix(in srgb, #f59e0b 30%, transparent)',
            }}>
            exception
          </span>
        )}
      </div>

      {/* Written config input */}
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-widest text-secondary uppercase">
          Written Configuration{currentCharge !== 0 ? ` for ${speciesLabel}` : ''}
        </p>
        <input
          type="text"
          value={writtenInput}
          onChange={e => setWrittenInput(e.target.value)}
          disabled={checked}
          placeholder={nobleHint && coreLabel ? `${coreLabel} ...` : '1s2 2s2 2p6 ...'}
          className="font-mono text-sm bg-raised border rounded-sm px-3 py-2 text-primary
                     placeholder-dim focus:outline-none transition-colors"
          style={{
            borderColor: checked
              ? writtenResult?.correct ? '#22c55e' : '#ef4444'
              : 'var(--border)',
          }}
        />
        <AnimatePresence>
          {checked && writtenResult && !writtenResult.correct && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-1 p-3 rounded-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              {writtenResult.missingSubshells.length > 0 && (
                <p className="font-mono text-xs" style={{ color: '#ef4444' }}>
                  Missing: {writtenResult.missingSubshells.join(', ')}
                </p>
              )}
              {writtenResult.wrongSubshells.map(w => (
                <p key={w.label} className="font-mono text-xs" style={{ color: '#ef4444' }}>
                  {w.label}: got {w.got}, expected {w.expected}
                </p>
              ))}
              {writtenResult.extraSubshells.length > 0 && (
                <p className="font-mono text-xs" style={{ color: '#f59e0b' }}>
                  Unexpected: {writtenResult.extraSubshells.join(', ')}
                </p>
              )}
              <p className="font-mono text-xs text-dim mt-1">
                Correct: {fullConfig.map(s => `${s.label}${s.electrons}`).join(' ')}
              </p>
            </motion.div>
          )}
          {checked && writtenResult?.correct && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="font-mono text-xs" style={{ color: '#22c55e' }}>
              ✓ Correct
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Orbital box diagram input */}
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-widest text-secondary uppercase">
          Orbital Box Diagram
          <span className="ml-2 normal-case tracking-normal font-sans opacity-60">
            — click boxes to cycle: empty → ↑ → ↑↓
          </span>
        </p>
        <BoxDiagramInput
          subshells={practiceSubshells}
          coreLabel={practiceCoreLabel}
          boxes={boxes}
          onCycle={cycleBox}
          boxStatuses={boxStatuses}
          disabled={checked}
        />

        {/* Box result legend */}
        <AnimatePresence>
          {checked && boxResults.some(r => !r.electronCountCorrect || !r.hundCorrect) && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-1 p-3 rounded-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              {boxResults.filter(r => !r.electronCountCorrect).map(r => (
                <p key={r.label} className="font-mono text-xs" style={{ color: '#ef4444' }}>
                  {r.label}: {r.gotElectrons} electrons, expected {r.expectedElectrons}
                </p>
              ))}
              {boxResults.filter(r => r.electronCountCorrect && !r.hundCorrect).map(r => (
                <p key={r.label} className="font-mono text-xs" style={{ color: '#f59e0b' }}>
                  {r.label}: electron count ✓ but Hund's rule violated — maximize unpaired spins first
                </p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exception reveal */}
        {checked && exception && currentCharge === 0 && (
          <div className="flex flex-col gap-1 p-3 rounded-sm"
            style={{
              background: 'color-mix(in srgb, #f59e0b 8%, transparent)',
              border: '1px solid color-mix(in srgb, #f59e0b 25%, transparent)',
            }}>
            <span className="font-mono text-[10px] tracking-wider" style={{ color: '#f59e0b' }}>AUFBAU EXCEPTION</span>
            <p className="font-sans text-xs" style={{ color: 'rgba(245,158,11,0.8)' }}>{exception.note}</p>
          </div>
        )}
      </div>

      {/* Magnetic phase — shown when boxes are correct */}
      <AnimatePresence>
        {problemPhase === 'magnetic' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col gap-4 p-4 rounded-sm border"
            style={{
              background: 'color-mix(in srgb, #f59e0b 5%, rgb(var(--color-surface)))',
              borderColor: 'color-mix(in srgb, #f59e0b 30%, transparent)',
            }}>
            <p className="font-mono text-xs tracking-widest uppercase" style={{ color: '#f59e0b' }}>
              Magnetism — {speciesLabel}
            </p>
            <p className="font-sans text-sm text-secondary">
              Based on the orbital diagram above, is {speciesLabel} paramagnetic or diamagnetic?
            </p>

            {/* Para / Dia buttons */}
            <div className="flex gap-3">
              {(['para', 'dia'] as const).map(opt => (
                <button key={opt} onClick={() => setMagneticAnswer(opt)}
                  className="flex-1 py-2 rounded-sm border font-sans text-sm font-medium transition-colors capitalize"
                  style={{
                    border: magneticAnswer === opt
                      ? `1px solid ${opt === 'para' ? 'rgba(245,158,11,0.6)' : 'rgba(52,211,153,0.6)'}`
                      : '1px solid rgba(var(--overlay),0.1)',
                    background: magneticAnswer === opt
                      ? opt === 'para' ? 'rgba(245,158,11,0.1)' : 'rgba(52,211,153,0.1)'
                      : 'transparent',
                    color: magneticAnswer === opt
                      ? opt === 'para' ? '#f59e0b' : '#34d399'
                      : 'rgba(var(--overlay),0.5)',
                  }}>
                  {opt === 'para' ? 'Paramagnetic' : 'Diamagnetic'}
                </button>
              ))}
            </div>

            {/* Unpaired electron count */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs text-secondary">Number of unpaired electrons</label>
              <input
                type="text"
                inputMode="numeric"
                value={unpairedAnswer}
                onChange={e => setUnpairedAnswer(e.target.value.replace(/\D/, ''))}
                placeholder="0"
                className="w-24 font-mono text-sm bg-raised border rounded-sm px-3 py-2 text-primary
                           placeholder-dim focus:outline-none transition-colors border-border"
              />
            </div>

            <button onClick={checkMagnetic} disabled={magneticAnswer === null}
              className="py-2.5 rounded-sm font-sans font-medium text-sm transition-all disabled:opacity-40"
              style={{
                background: 'color-mix(in srgb, #f59e0b 18%, rgb(var(--color-surface)))',
                border: '1px solid color-mix(in srgb, #f59e0b 40%, transparent)',
                color: '#f59e0b',
              }}>
              Check Magnetic
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Magnetic result — shown in reviewed phase when magnetic was attempted */}
      <AnimatePresence>
        {problemPhase === 'reviewed' && results[results.length - 1]?.magneticCorrect !== null && results[results.length - 1]?.magneticCorrect !== undefined && (() => {
          const last = results[results.length - 1]
          const correctUnpaired = unpairedForSpecies(currentZ, currentCharge)
          const isPara = correctUnpaired > 0
          return (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-2 p-4 rounded-sm border"
              style={{
                background: (last.magneticCorrect && last.unpairedCorrect)
                  ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                borderColor: (last.magneticCorrect && last.unpairedCorrect)
                  ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
              }}>
              <p className="font-mono text-xs tracking-widest uppercase text-secondary">Magnetic Result</p>
              <p className="font-mono text-xs" style={{ color: last.magneticCorrect ? '#22c55e' : '#ef4444' }}>
                {isPara ? 'Paramagnetic' : 'Diamagnetic'} — {last.magneticCorrect ? '✓' : '✗'}
              </p>
              <p className="font-mono text-xs" style={{ color: last.unpairedCorrect ? '#22c55e' : '#ef4444' }}>
                {correctUnpaired} unpaired electron{correctUnpaired !== 1 ? 's' : ''} — {last.unpairedCorrect ? '✓' : '✗'}
              </p>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-3">
        {problemPhase === 'config' ? (
          <button onClick={checkAnswers}
            className="flex-1 py-2.5 rounded-sm font-sans font-medium text-sm transition-all"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            }}>
            Check Answer
          </button>
        ) : problemPhase === 'reviewed' ? (
          <button onClick={nextProblem}
            className="flex-1 py-2.5 rounded-sm font-sans font-medium text-sm transition-all"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            }}>
            {idx + 1 < problems.length ? 'Next Problem →' : 'See Results'}
          </button>
        ) : null}
      </div>
      <p className="font-mono text-xs text-secondary">Aufbau: fill lowest energy first · Hund's rule: maximize unpaired spins · order: 1s 2s 2p 3s 3p 4s 3d 4p…</p>
    </div>
  )
}
