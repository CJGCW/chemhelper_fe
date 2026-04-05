import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ELEMENTS, EXCEPTIONS, NOBLE_GASES,
  computeConfig, getAbbrConfig, getNobleGasCore,
  groupByShell, parseWrittenConfig, checkWrittenConfig, checkBoxDiagram,
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

function generateProblems(min: number, max: number, count: number): number[] {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min)
  return shuffle(pool).slice(0, Math.min(count, pool.length))
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
    neutral:     'rgba(255,255,255,0.18)',
    correct:     '#22c55e',
    'wrong-count': '#ef4444',
    'wrong-hund':  '#f59e0b',
  }[status]

  const bg = {
    neutral:     value > 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
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
        style={{ color: value >= 1 ? arrowColor : 'rgba(255,255,255,0.08)' }}>↑</span>
      <span className="font-mono text-xs leading-none select-none"
        style={{ color: value === 2 ? arrowColor : 'rgba(255,255,255,0.08)' }}>↓</span>
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
          style={{ background: '#0e1016' }}>
          <span className="font-mono text-[10px] text-dim w-8 text-center shrink-0">core</span>
          <span className="font-mono text-sm text-dim">{coreLabel} — pre-filled</span>
        </div>
      )}
      {shellRows.map(([n, subs]) => (
        <div key={n} className="flex items-end gap-4 p-3 rounded-sm border border-border"
          style={{ background: '#0e1016' }}>
          <div className="w-8 shrink-0 flex items-center justify-center pb-0.5">
            <span className="font-mono text-[10px] text-dim">n={n}</span>
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
                           : 'rgba(255,255,255,0.35)',
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

interface ProblemResult {
  z: number
  writtenCorrect: boolean
  boxCorrect: boolean
}

export default function ElectronConfigPractice() {
  const [phase, setPhase] = useState<PracticePhase>('settings')
  const [presetIdx, setPresetIdx] = useState(1)          // Periods 1–3 default
  const [count, setCount] = useState(5)
  const [nobleHint, setNobleHint] = useState(true)

  const [problems, setProblems] = useState<number[]>([])
  const [idx, setIdx] = useState(0)
  const [results, setResults] = useState<ProblemResult[]>([])

  // Per-problem state
  const [writtenInput, setWrittenInput] = useState('')
  const [boxes, setBoxes] = useState<Record<string, (0|1|2)[]>>({})
  const [checked, setChecked] = useState(false)
  const [writtenResult, setWrittenResult] = useState<ReturnType<typeof checkWrittenConfig> | null>(null)
  const [boxResults, setBoxResults] = useState<ReturnType<typeof checkBoxDiagram>>([])

  // ── Derived ─────────────────────────────────────────────────────────────────

  const currentZ = problems[idx] ?? 1
  const element  = ELEMENTS[currentZ]
  const exception = EXCEPTIONS[currentZ]
  const fullConfig  = computeConfig(currentZ)
  const { coreLabel, subshells: abbrSubshells } = getAbbrConfig(currentZ)

  // Subshells the user must fill (abbr if hint on, full if hint off)
  const practiceSubshells = nobleHint ? abbrSubshells : fullConfig
  const practiceCoreLabel = nobleHint ? coreLabel : null

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const initBoxes = useCallback((subshells: SubshellFill[]) => {
    const init: Record<string, (0|1|2)[]> = {}
    for (const s of subshells) init[s.label] = Array(s.orbitals).fill(0)
    setBoxes(init)
  }, [])

  function startPractice() {
    const ps = generateProblems(PRESETS[presetIdx].min, PRESETS[presetIdx].max, count)
    setProblems(ps)
    setIdx(0)
    setResults([])
    setPhase('active')
    resetProblem(ps[0])
  }

  function resetProblem(z: number) {
    setWrittenInput('')
    setChecked(false)
    setWrittenResult(null)
    setBoxResults([])
    const { subshells } = nobleHint ? getAbbrConfig(z) : { subshells: computeConfig(z) }
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
    setResults(prev => [...prev, { z: currentZ, writtenCorrect: wResult.correct, boxCorrect: allBoxCorrect }])
    setChecked(true)
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
  if (checked) {
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
        <div className="flex flex-col gap-4 p-4 rounded-sm border border-border" style={{ background: '#0e1016' }}>
          <p className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase">Element Range</p>
          <div className="flex flex-col gap-1.5">
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => setPresetIdx(i)}
                className="flex items-center gap-3 px-3 py-2 rounded-sm border text-left transition-colors"
                style={{
                  border: presetIdx === i
                    ? '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)'
                    : '1px solid rgba(255,255,255,0.1)',
                  background: presetIdx === i ? 'color-mix(in srgb, var(--c-halogen) 10%, transparent)' : 'transparent',
                  color: presetIdx === i ? 'var(--c-halogen)' : 'rgba(255,255,255,0.55)',
                }}>
                <span className="font-sans text-sm">{p.label}</span>
                <span className="font-mono text-xs text-dim ml-auto">Z = {p.min}–{p.max}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-3 p-4 rounded-sm border border-border" style={{ background: '#0e1016' }}>
            <p className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase">Problems</p>
            <div className="flex gap-2">
              {[5, 10, 15].map(n => (
                <button key={n} onClick={() => setCount(n)}
                  className="flex-1 py-1.5 rounded-sm border font-mono text-sm transition-colors"
                  style={{
                    border: count === n ? '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' : '1px solid rgba(255,255,255,0.1)',
                    background: count === n ? 'color-mix(in srgb, var(--c-halogen) 10%, transparent)' : 'transparent',
                    color: count === n ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)',
                  }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 rounded-sm border border-border" style={{ background: '#0e1016' }}>
            <p className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase">Noble Gas Core</p>
            <button onClick={() => setNobleHint(h => !h)}
              className="py-1.5 rounded-sm border font-sans text-sm transition-colors"
              style={{
                border: nobleHint ? '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' : '1px solid rgba(255,255,255,0.1)',
                background: nobleHint ? 'color-mix(in srgb, var(--c-halogen) 10%, transparent)' : 'transparent',
                color: nobleHint ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)',
              }}>
              {nobleHint ? 'Core shown (easier)' : 'Core hidden (harder)'}
            </button>
          </div>
        </div>

        <button onClick={startPractice}
          className="py-2.5 rounded-sm font-sans font-medium text-sm transition-all"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
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
    const total  = results.length
    const bothCorrect = results.filter(r => r.writtenCorrect && r.boxCorrect).length
    const pct = Math.round((bothCorrect / total) * 100)
    return (
      <div className="flex flex-col gap-6 max-w-lg">
        <div className="flex flex-col gap-4 p-6 rounded-sm border border-border items-center text-center"
          style={{ background: '#0e1016' }}>
          <span className="font-mono text-5xl font-bold" style={{ color: 'var(--c-halogen)' }}>
            {bothCorrect}/{total}
          </span>
          <span className="font-sans text-lg text-bright">{pct}% correct</span>
          <p className="font-sans text-sm text-secondary">Both written config and orbital box must be correct.</p>
        </div>

        <div className="flex flex-col gap-1">
          {results.map((r, i) => {
            const el = ELEMENTS[r.z]
            const both = r.writtenCorrect && r.boxCorrect
            return (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-sm border border-border"
                style={{ background: '#0e1016' }}>
                <span className="font-mono text-sm font-semibold w-8 shrink-0"
                  style={{ color: 'var(--c-halogen)' }}>{el.symbol}</span>
                <span className="font-sans text-xs text-secondary flex-1">{el.name}</span>
                <span className="font-mono text-xs" style={{ color: r.writtenCorrect ? '#22c55e' : '#ef4444' }}>
                  config {r.writtenCorrect ? '✓' : '✗'}
                </span>
                <span className="font-mono text-xs" style={{ color: r.boxCorrect ? '#22c55e' : '#ef4444' }}>
                  boxes {r.boxCorrect ? '✓' : '✗'}
                </span>
              </div>
            )
          })}
        </div>

        <button onClick={() => setPhase('settings')}
          className="py-2.5 rounded-sm font-sans font-medium text-sm transition-all"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          }}>
          Try Again
        </button>
      </div>
    )
  }

  // ── Render: Active problem ────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">

      {/* Progress bar + score */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-1 rounded-full transition-all"
            style={{ width: `${((idx) / problems.length) * 100}%`, background: 'var(--c-halogen)' }} />
        </div>
        <span className="font-mono text-xs text-dim shrink-0">{idx + 1} / {problems.length}</span>
        <span className="font-mono text-xs shrink-0" style={{ color: 'var(--c-halogen)' }}>
          {score} correct
        </span>
      </div>

      {/* Element card */}
      <div className="flex items-center gap-4 p-4 rounded-sm border border-border" style={{ background: '#0e1016' }}>
        <div className="flex flex-col items-center w-16 shrink-0">
          <span className="font-mono text-5xl font-bold leading-none" style={{ color: 'var(--c-halogen)' }}>
            {element.symbol}
          </span>
          <span className="font-mono text-xs text-dim mt-1">{currentZ}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-sans text-base font-semibold text-bright">{element.name}</span>
          <span className="font-mono text-xs text-dim">Z = {currentZ} · {currentZ} electrons</span>
        </div>
        {exception && (
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
        <p className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase">
          Written Configuration
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
        <p className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase">
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
        {checked && exception && (
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

      {/* Action buttons */}
      <div className="flex gap-3">
        {!checked ? (
          <button onClick={checkAnswers}
            className="flex-1 py-2.5 rounded-sm font-sans font-medium text-sm transition-all"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            }}>
            Check Answer
          </button>
        ) : (
          <button onClick={nextProblem}
            className="flex-1 py-2.5 rounded-sm font-sans font-medium text-sm transition-all"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            }}>
            {idx + 1 < problems.length ? 'Next Problem →' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  )
}
