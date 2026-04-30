import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VseprShapeDiagram from './VseprShapeDiagram'
import KetcherStructureEditor, { type KetcherEditorHandle, type ValidationResult } from './KetcherStructureEditor'
import VseprVisualizer from './VseprVisualizer'
import type { LewisStructure } from '../../pages/LewisPage'
import { fetchLewisStructure } from '../../api/calculations'
import {
  PROBLEMS, GEO_DISPLAY,
  molGeo, elecGeo, hybrid, bondAngles,
  type VseprEntry,
} from '../../utils/vseprPractice'

export type { VseprEntry }
export { PROBLEMS }

const VseprDrawChallenge = lazy(() => import('./VseprDrawChallenge'))

function toApiFormula(formula: string): string {
  return formula
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => String(c.charCodeAt(0) - 0x2080))
    .replace(/[²³⁻⁺]/g, '')
    .trim()
}

// ── Subtabs & question types ──────────────────────────────────────────────────

type QuestionType = 'molecular_geometry' | 'electron_geometry' | 'hybridization' | 'bond_angles' | 'bonding_pairs' | 'lone_pairs'
type Subtab = 'geometry' | 'bond_angles' | 'hybridization' | 'electron_pairs' | 'combined' | 'drawing'

const SUBTABS: { id: Subtab; label: string; formula: string; types?: QuestionType[] }[] = [
  { id: 'geometry',       label: 'Geometry',       formula: '⬡',   types: ['molecular_geometry', 'electron_geometry'] },
  { id: 'bond_angles',    label: 'Bond Angles',    formula: '∠',   types: ['bond_angles'] },
  { id: 'hybridization',  label: 'Hybridization',  formula: 'sp³', types: ['hybridization'] },
  { id: 'electron_pairs', label: 'Electron Pairs', formula: '∶',   types: ['bonding_pairs', 'lone_pairs'] },
  { id: 'drawing',        label: 'Drawing',        formula: '✎' },
  { id: 'combined',       label: 'Combined',       formula: '⊞' },
]

const ALL_MOL_GEOMETRIES = Object.values(GEO_DISPLAY)
const ALL_ELEC_GEOMETRIES = ['Linear', 'Trigonal Planar', 'Tetrahedral', 'Trigonal Bipyramidal', 'Octahedral']
const ALL_HYBRIDIZATIONS  = ['sp', 'sp²', 'sp³', 'sp³d', 'sp³d²']
const ALL_BOND_ANGLES     = ['90°', '≈104.5°', '≈107°', '≈109.5°', '≈120°', '120°', '90°, 120°', '90°, 180°', '≈90°, ≈120°', '180°']
const ALL_PAIR_COUNTS     = ['0', '1', '2', '3', '4', '5', '6']

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
      return { question: 'What is the molecular geometry?',               correct: molGeo(entry),        options: makeOptions(molGeo(entry),        ALL_MOL_GEOMETRIES) }
    case 'electron_geometry':
      return { question: 'What is the electron geometry?',                correct: elecGeo(entry),       options: makeOptions(elecGeo(entry),       ALL_ELEC_GEOMETRIES) }
    case 'hybridization':
      return { question: 'What is the hybridization of the central atom?', correct: hybrid(entry),       options: makeOptions(hybrid(entry),        ALL_HYBRIDIZATIONS) }
    case 'bond_angles':
      return { question: 'What are the approximate bond angles?',          correct: bondAngles(entry),   options: makeOptions(bondAngles(entry),    ALL_BOND_ANGLES) }
    case 'bonding_pairs':
      return { question: 'How many bonding pairs does the central atom have?', correct: String(entry.bonds),     options: makeOptions(String(entry.bonds),     ALL_PAIR_COUNTS) }
    case 'lone_pairs':
      return { question: 'How many lone pairs does the central atom have?',    correct: String(entry.lonePairs), options: makeOptions(String(entry.lonePairs), ALL_PAIR_COUNTS) }
  }
}

// ── Combined section ──────────────────────────────────────────────────────────

const COMBINED_ROWS: { id: string; label: string; get: (e: VseprEntry) => string }[] = [
  { id: 'mol_geo',  label: 'Molecular Geometry', get: e => molGeo(e)          },
  { id: 'elec_geo', label: 'Electron Geometry',  get: e => elecGeo(e)         },
  { id: 'hybrid',   label: 'Hybridization',      get: e => hybrid(e)          },
  { id: 'angles',   label: 'Bond Angles',        get: e => bondAngles(e)      },
  { id: 'bonding',  label: 'Bonding Pairs',      get: e => String(e.bonds)    },
  { id: 'lone',     label: 'Lone Pairs',         get: e => String(e.lonePairs)},
]

function normalizeAns(s: string): string {
  return s.toLowerCase().trim()
    .replace(/²/g, '2').replace(/³/g, '3')
    .replace(/[≈~]/g, '')
    .replace(/°/g, '')
    .replace(/\s+/g, ' ')
}

function checkAns(input: string, correct: string): boolean {
  return normalizeAns(input) === normalizeAns(correct)
}

function randomEntry(): VseprEntry {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

const pillStyle = {
  background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
  border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
  color: 'var(--c-halogen)',
} as const

function CombinedSection() {
  const [entry, setEntry]           = useState<VseprEntry>(randomEntry)
  const [structure, setStructure]   = useState<LewisStructure | null>(null)
  const [inputs, setInputs]         = useState<Record<string, string>>({})
  const [submitted, setSubmitted]   = useState(false)
  const [score, setScore]           = useState({ correct: 0, total: 0 })
  const [drawOpen, setDrawOpen]     = useState(false)
  const [hasOpened, setHasOpened]   = useState(false)
  const [drawnSvg, setDrawnSvg]     = useState<string | null>(null)
  const [drawResult, setDrawResult] = useState<ValidationResult | null>(null)
  const editorRef = useRef<KetcherEditorHandle>(null)

  // Fetch LewisStructure for the current molecule
  useEffect(() => {
    let cancelled = false
    setStructure(null)
    fetchLewisStructure(toApiFormula(entry.formula), entry.charge)
      .then(d => { if (!cancelled) setStructure(d) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [entry]) // eslint-disable-line react-hooks/exhaustive-deps

  function openDraw() {
    setHasOpened(true)
    setDrawOpen(true)
  }

  async function closeDraw() {
    const svg = await editorRef.current?.getSvg() ?? null
    setDrawnSvg(svg)
    if (svg) {
      const result = await editorRef.current?.triggerCheck() ?? null
      setDrawResult(result)
    }
    setDrawOpen(false)
  }

  function handleCheck() {
    const n = COMBINED_ROWS.filter(r => checkAns(inputs[r.id] ?? '', r.get(entry))).length
    setScore(s => ({ correct: s.correct + n, total: s.total + COMBINED_ROWS.length }))
    setSubmitted(true)
  }

  function handleNext() {
    setEntry(randomEntry())
    setInputs({})
    setSubmitted(false)
    setDrawnSvg(null)
    setDrawResult(null)
    setDrawOpen(false)
    setHasOpened(false)  // unmount Ketcher so next Draw starts fresh
  }

  function handleReset() {
    setScore({ correct: 0, total: 0 })
    setEntry(randomEntry())
    setInputs({})
    setSubmitted(false)
    setDrawnSvg(null)
    setDrawResult(null)
    setDrawOpen(false)
    setHasOpened(false)
  }

  const pct = score.total > 0 ? Math.round(score.correct / score.total * 100) : null

  return (
    <div className="flex flex-col gap-5 max-w-2xl">

      {/* Score */}
      <div className="flex items-center gap-3 print:hidden">
        <span className="font-mono text-xs text-dim">Score:</span>
        <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>
          {score.correct} / {score.total}
        </span>
        {pct !== null && (
          <span className="font-mono text-xs text-dim">({pct}%)</span>
        )}
        <button onClick={handleReset}
          className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded-sm border border-border text-dim hover:text-secondary transition-colors">
          reset
        </button>
      </div>

      {/* Molecule header */}
      <div className="flex gap-6 items-start">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Molecule</span>
          <span className="font-sans font-semibold text-bright text-2xl">{entry.formula}</span>
          <span className="font-mono text-xs text-dim">central atom: {entry.central}</span>
        </div>

        {/* Draw area */}
        <div className="flex-shrink-0">
          {drawnSvg ? (
            <div className="flex gap-4 items-start">
              {/* Thumbnail */}
              <div className="w-36 flex-shrink-0 relative">
                <img
                  src={drawnSvg}
                  alt="Your structure"
                  className="w-full rounded-md border border-border"
                  style={{ background: 'white' }}
                />
                {!submitted && (
                  <button onClick={openDraw}
                    className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-sm font-mono text-[10px] border border-border transition-colors hover:text-primary"
                    style={{ background: 'rgb(var(--color-raised))', color: 'rgb(var(--color-secondary))' }}>
                    Edit
                  </button>
                )}
              </div>
              {/* Validation checks — shown only after Check is clicked */}
              {submitted && drawResult && (
                <div className="flex flex-col gap-1.5 pt-0.5">
                  {drawResult.checks.map((check, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="font-mono text-xs shrink-0 mt-px"
                        style={{ color: check.passed ? '#4ade80' : '#f87171' }}>
                        {check.passed ? '✓' : '✗'}
                      </span>
                      <div className="font-mono text-xs min-w-0">
                        <span className="font-medium text-primary">{check.label}: </span>
                        <span className="text-secondary">{check.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-36">
              <button onClick={openDraw}
                className="w-full rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors hover:border-secondary"
                style={{ borderColor: 'rgb(var(--color-border))', aspectRatio: '1', color: 'rgb(var(--color-dim))' }}>
                <span className="font-mono text-xl">✎</span>
                <span className="font-mono text-[11px]">Draw</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Property table */}
      <table className="w-full border-collapse font-sans text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgb(var(--color-border))' }}>
            <th className="py-2 pr-4 text-left font-medium text-secondary w-44">Property</th>
            <th className="py-2 text-left font-medium text-secondary">Answer</th>
            <th className="py-2 pl-3 text-left font-medium text-secondary print:hidden w-40">
              {submitted ? 'Result' : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Property rows */}
          {COMBINED_ROWS.map((row, i) => {
            const correct   = row.get(entry)
            const val       = inputs[row.id] ?? ''
            const isCorrect = submitted && checkAns(val, correct)
            const isWrong   = submitted && !isCorrect
            const rowBorder = i < COMBINED_ROWS.length - 1 ? '1px solid rgb(var(--color-border))' : undefined
            return (
              <tr key={row.id} style={{ borderBottom: rowBorder }}>
                <td className="py-2 pr-4 font-medium text-primary">{row.label}</td>
                <td className="py-2">
                  <input
                    type="text"
                    value={val}
                    onChange={e => setInputs(prev => ({ ...prev, [row.id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter' && !submitted) handleCheck() }}
                    disabled={submitted}
                    placeholder="…"
                    className="print:hidden w-full bg-transparent border-b font-mono text-sm text-primary outline-none placeholder:text-dim transition-colors"
                    style={{
                      borderColor: isCorrect ? '#4ade80' : isWrong ? '#f87171' : 'rgb(var(--color-border))',
                      color: isWrong ? '#f87171' : undefined,
                    }}
                  />
                  <span className="hidden print:block border-b border-current w-48 h-5" />
                </td>
                <td className="py-2 pl-3 font-mono text-xs print:hidden">
                  {isCorrect && <span style={{ color: '#4ade80' }}>✓</span>}
                  {isWrong   && <span style={{ color: '#f87171' }}>✗ {correct}</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Actions */}
      <div className="flex gap-2 print:hidden">
        {!submitted ? (
          <button onClick={handleCheck} className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-all" style={pillStyle}>
            Check
          </button>
        ) : (
          <button onClick={handleNext} className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-all" style={pillStyle}>
            Next →
          </button>
        )}
      </div>

      {/* Draw modal — kept mounted once opened so drawing persists on close/reopen */}
      {hasOpened && (
        <div
          className="fixed inset-0 z-50"
          style={{
            opacity: drawOpen ? 1 : 0,
            pointerEvents: drawOpen ? 'auto' : 'none',
            transition: 'opacity 0.15s',
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={closeDraw} />

          {/* Dialog */}
          <div className="absolute inset-4 md:inset-8 rounded-sm border border-border flex flex-col overflow-hidden"
            style={{ background: 'rgb(var(--color-surface))' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
              <div className="flex flex-col">
                <span className="font-mono text-xs text-secondary">Draw the structure of</span>
                <span className="font-sans font-semibold text-bright text-lg">{entry.formula}</span>
              </div>
              <button onClick={closeDraw}
                className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-all"
                style={pillStyle}>
                Done
              </button>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-auto p-4">
              <KetcherStructureEditor
                ref={editorRef}
                correctStructure={structure}
                showCheck={false}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )

}

// ── MCQ section ───────────────────────────────────────────────────────────────

interface QuestionState {
  entryIdx: number
  qType:    QuestionType
  question: string
  correct:  string
  options:  string[]
}

function nextQuestion(types: QuestionType[]): QuestionState {
  const idx    = Math.floor(Math.random() * PROBLEMS.length)
  const entry  = PROBLEMS[idx]
  const eligible = types.filter(t => t !== 'lone_pairs' || entry.lonePairs > 0)
  const pool   = eligible.length > 0 ? eligible : types
  const qType  = pool[Math.floor(Math.random() * pool.length)]
  const q      = buildQuestion(entry, qType)
  return { entryIdx: idx, qType, question: q.question, correct: q.correct, options: q.options }
}

function ShowMeModal({ entry, onClose }: { entry: VseprEntry; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}>
      <div className="relative w-full max-w-3xl rounded-sm border border-border flex flex-col overflow-hidden"
        style={{ background: 'rgb(var(--color-surface))' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <span className="font-mono text-xs text-secondary">VSEPR Breakdown</span>
          <button onClick={onClose}
            className="px-3 py-1 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Close
          </button>
        </div>
        <div className="overflow-auto p-5">
          <VseprVisualizer
            formula={entry.formula} central={entry.central}
            bonds={entry.bonds} lonePairs={entry.lonePairs}
            geometry={entry.geometry}
          />
        </div>
      </div>
    </div>
  )
}

function McqSection({ types }: { types: QuestionType[] }) {
  const [q, setQ]          = useState<QuestionState>(() => nextQuestion(types))
  const [selected, setSel] = useState<string | null>(null)
  const [score, setScore]  = useState({ correct: 0, total: 0 })
  const [showMe, setShowMe] = useState(false)

  const entry     = PROBLEMS[q.entryIdx]
  const answered  = selected !== null
  const isCorrect = selected === q.correct

  function handleSelect(opt: string) {
    if (answered) return
    setSel(opt)
    setScore(s => ({ correct: s.correct + (opt === q.correct ? 1 : 0), total: s.total + 1 }))
  }

  function handleNext() {
    setSel(null)
    setQ(nextQuestion(types))
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* Score */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-dim">Score:</span>
        <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>
          {score.correct} / {score.total}
        </span>
        {score.total > 0 && (
          <span className="font-mono text-xs text-dim">({Math.round(score.correct / score.total * 100)}%)</span>
        )}
        <button
          onClick={() => { setScore({ correct: 0, total: 0 }); setSel(null); setQ(nextQuestion(types)) }}
          className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded-sm border border-border text-dim hover:text-secondary transition-colors">
          reset
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${q.entryIdx}-${q.qType}`}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
          className="flex flex-col gap-5">

          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">Molecule</span>
            <span className="font-sans font-semibold text-bright text-2xl">{entry.formula}</span>
            <span className="font-mono text-xs text-dim">central atom: {entry.central}</span>
          </div>

          <div className="flex items-end gap-3">
            <div className="w-44">
              <VseprShapeDiagram
                central={entry.central}
                geometry={entry.geometry}
                bonds={entry.bonds}
                lonePairs={entry.lonePairs}
              />
            </div>
            <button onClick={() => setShowMe(true)}
              className="mb-1 px-3 py-1.5 rounded-sm font-sans text-xs font-medium border border-border text-secondary hover:text-primary hover:border-muted transition-colors shrink-0">
              Show Me
            </button>
          </div>

          <p className="font-sans text-base text-primary">{q.question}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map(opt => {
              const isSelected = selected === opt
              const isRight    = answered && opt === q.correct
              const isWrong    = answered && isSelected && !isRight
              return (
                <button key={opt} onClick={() => handleSelect(opt)} disabled={answered}
                  className="px-4 py-2.5 rounded-sm font-sans text-sm text-left transition-all border"
                  style={{
                    borderColor: isRight    ? 'color-mix(in srgb, #4ade80 40%, transparent)'
                               : isWrong   ? 'color-mix(in srgb, #f87171 40%, transparent)'
                               : isSelected ? 'color-mix(in srgb, var(--c-halogen) 40%, transparent)'
                               : 'rgb(var(--color-border))',
                    background:  isRight    ? 'color-mix(in srgb, #4ade80 8%, rgb(var(--color-surface)))'
                               : isWrong   ? 'color-mix(in srgb, #f87171 8%, rgb(var(--color-surface)))'
                               : isSelected ? 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-surface)))'
                               : 'rgb(var(--color-surface))',
                    color:       isRight ? '#4ade80' : isWrong ? '#f87171' : 'rgba(var(--overlay),0.75)',
                    cursor:      answered ? 'default' : 'pointer',
                  }}>
                  {opt}
                </button>
              )
            })}
          </div>

          {answered && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1 px-3 py-2.5 rounded-sm border"
                style={{
                  borderColor: isCorrect ? 'color-mix(in srgb, #4ade80 30%, transparent)' : 'color-mix(in srgb, #f87171 30%, transparent)',
                  background:  isCorrect ? 'color-mix(in srgb, #4ade80 5%, rgb(var(--color-surface)))' : 'color-mix(in srgb, #f87171 5%, rgb(var(--color-surface)))',
                }}>
                <span className="font-sans text-sm font-medium" style={{ color: isCorrect ? '#4ade80' : '#f87171' }}>
                  {isCorrect ? '✓ Correct!' : `✗ The answer is ${q.correct}`}
                </span>
                <span className="font-mono text-xs text-secondary">
                  {entry.formula}: {entry.bonds} bonding pair{entry.bonds !== 1 ? 's' : ''}, {entry.lonePairs} lone pair{entry.lonePairs !== 1 ? 's' : ''} · {elecGeo(entry)} → {molGeo(entry)} · {hybrid(entry)} · {bondAngles(entry)}
                </span>
              </div>

              <button onClick={handleNext}
                className="self-start px-5 py-2 rounded-sm font-sans text-sm font-medium transition-all"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                  color: 'var(--c-halogen)',
                }}>
                Next →
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="font-mono text-xs text-secondary">
        electron geometry includes lone pairs · molecular geometry describes atom positions only · lone pairs compress bond angles
      </p>

      {showMe && <ShowMeModal entry={entry} onClose={() => setShowMe(false)} />}
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

interface Props { allowCustom?: boolean }

export default function VseprPractice({ allowCustom = true }: Props) {
  const [subtab, setSubtab] = useState<Subtab>('geometry')

  return (
    <div className="flex flex-col gap-5">

      {/* Subtab pills */}
      {allowCustom && <div className="flex flex-wrap gap-1.5 print:hidden">
        {SUBTABS.map(st => {
          const active = subtab === st.id
          return (
            <button key={st.id} onClick={() => setSubtab(st.id)}
              className="relative px-4 py-1.5 rounded-full font-sans text-sm font-medium transition-colors"
              style={{ color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.45)' }}>
              {active && (
                <motion.span layoutId="vsepr-subtab-pill" className="absolute inset-0 rounded-full"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{st.label}</span>
              <span className="relative z-10 font-mono text-[10px] ml-1.5 opacity-50">{st.formula}</span>
            </button>
          )
        })}
      </div>}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={subtab}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
          {subtab !== 'drawing' && subtab !== 'combined' && (
            <McqSection types={SUBTABS.find(s => s.id === subtab)!.types!} />
          )}
          {subtab === 'combined' && <CombinedSection />}
          {subtab === 'drawing' && (
            <Suspense fallback={<span className="font-mono text-xs text-dim animate-pulse">Loading editor…</span>}>
              <VseprDrawChallenge />
            </Suspense>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
