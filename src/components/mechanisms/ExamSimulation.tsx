import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateMixedQuestion, generateQuestion, checkMechAnswer, type MechQuestion } from '../../utils/mechanismQuestions'
import type { MechanismCategory } from '../../data/mechanisms/types'
import { CATEGORY_LABELS } from '../../data/mechanisms/types'

// ── Exam presets ──────────────────────────────────────────────────────────────

interface ExamPreset {
  id: string
  label: string
  description: string
  questions: number
  minutes: number
  categories: (MechanismCategory | 'all')[]
}

const EXAM_PRESETS: ExamPreset[] = [
  {
    id: 'org1-exam2',
    label: 'Org 1 — Exam 2',
    description: 'SN/E + Alkenes + Alkynes',
    questions: 20,
    minutes: 50,
    categories: ['sn_e', 'alkene', 'alkyne'],
  },
  {
    id: 'org1-exam3',
    label: 'Org 1 — Exam 3',
    description: 'Aromatics + Alcohols + Ethers',
    questions: 20,
    minutes: 50,
    categories: ['aromatic', 'alcohol', 'ether_epoxide'],
  },
  {
    id: 'org2-midterm',
    label: 'Org 2 — Midterm',
    description: 'Carbonyls + Enolates + Carboxylic Derivatives',
    questions: 25,
    minutes: 75,
    categories: ['carbonyl', 'enolate', 'carboxylic'],
  },
  {
    id: 'org2-final',
    label: 'Org 2 — Final (Comprehensive)',
    description: 'All reaction categories',
    questions: 30,
    minutes: 90,
    categories: ['all'],
  },
]

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function generateExamQuestions(preset: ExamPreset): MechQuestion[] {
  const questions: MechQuestion[] = []
  const cats = preset.categories
  for (let i = 0; i < preset.questions; i++) {
    const cat = cats[i % cats.length]
    // Mix types: 40% product, 25% reagent, 20% mechanism, 15% regio/stereo
    const rand = Math.random()
    let q: MechQuestion | null = null
    if (rand < 0.40) q = generateQuestion('predict-product', cat)
    else if (rand < 0.65) q = generateQuestion('identify-reagent', cat)
    else if (rand < 0.85) q = generateQuestion('identify-mechanism', cat)
    else {
      q = generateQuestion('predict-stereo', cat) ?? generateQuestion('predict-regio', cat)
    }
    questions.push(q ?? generateMixedQuestion(cat === 'all' ? 'all' : cat))
  }
  return questions
}

// ── Component ─────────────────────────────────────────────────────────────────

type State = 'setup' | 'running' | 'done'

export default function ExamSimulation() {
  const [state, setState]         = useState<State>('setup')
  const [preset, setPreset]       = useState<ExamPreset>(EXAM_PRESETS[0])
  const [questions, setQuestions] = useState<MechQuestion[]>([])
  const [answers, setAnswers]     = useState<(string | null)[]>([])
  const [current, setCurrent]     = useState(0)
  const [selected, setSelected]   = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [timeLeft, setTimeLeft]   = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startExam() {
    const qs = generateExamQuestions(preset)
    setQuestions(qs)
    setAnswers(new Array(qs.length).fill(null))
    setCurrent(0)
    setSelected(null)
    setConfirmed(false)
    setTimeLeft(preset.minutes * 60)
    setState('running')
  }

  useEffect(() => {
    if (state !== 'running') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setState('done')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [state])

  function handleSelect(opt: string) {
    if (confirmed) return
    setSelected(opt)
    setConfirmed(true)
    setAnswers(prev => { const next = [...prev]; next[current] = opt; return next })
  }

  function next() {
    if (current + 1 >= questions.length) {
      if (timerRef.current) clearInterval(timerRef.current)
      setState('done')
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setConfirmed(false)
    }
  }

  // ── Setup screen ──────────────────────────────────────────────────────────────

  if (state === 'setup') {
    return (
      <div className="flex flex-col gap-6 max-w-xl">
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Simulate a full exam with timed scoring and mixed question types.
          Select an exam below to begin.
        </p>
        <div className="flex flex-col gap-2">
          {EXAM_PRESETS.map(p => (
            <button key={p.id} onClick={() => setPreset(p)}
              className="px-4 py-3 rounded-sm border text-left transition-colors"
              style={preset.id === p.id
                ? { background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)' }
                : { background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }
              }
            >
              <span className="font-sans text-sm font-semibold text-bright block">{p.label}</span>
              <span className="font-sans text-xs text-secondary">{p.description} · {p.questions} questions · {p.minutes} min</span>
            </button>
          ))}
        </div>
        <button onClick={startExam}
          className="self-start px-5 py-2 rounded-sm font-sans text-sm font-medium border transition-colors"
          style={{ background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)', color: 'var(--c-halogen)' }}
        >
          Begin {preset.label}
        </button>
      </div>
    )
  }

  // ── Results screen ────────────────────────────────────────────────────────────

  if (state === 'done') {
    const correct = answers.filter((a, i) => a && checkMechAnswer(questions[i], a)).length
    const pct = Math.round((correct / questions.length) * 100)
    const byType: Record<string, { correct: number; total: number }> = {}
    questions.forEach((q, i) => {
      const k = q.type
      if (!byType[k]) byType[k] = { correct: 0, total: 0 }
      byType[k].total++
      if (answers[i] && checkMechAnswer(q, answers[i]!)) byType[k].correct++
    })

    return (
      <div className="flex flex-col gap-6 max-w-xl">
        <div className="rounded-sm border border-border p-5 flex flex-col gap-3" style={{ background: 'rgb(var(--color-surface))' }}>
          <h3 className="font-sans font-semibold text-primary text-sm">{preset.label} — Results</h3>
          <div className="flex items-end gap-2">
            <span className="font-mono text-4xl font-bold" style={{ color: pct >= 70 ? '#34d399' : pct >= 50 ? '#f59e0b' : '#f87171' }}>
              {correct}/{questions.length}
            </span>
            <span className="font-sans text-sm text-secondary mb-1">({pct}%)</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
            <motion.div className="h-full rounded-full" style={{ background: pct >= 70 ? '#34d399' : pct >= 50 ? '#f59e0b' : '#f87171' }}
              animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.2 }} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs text-dim uppercase tracking-wider">By question type</span>
          {Object.entries(byType).map(([type, { correct: c, total }]) => (
            <div key={type} className="flex items-center gap-3">
              <span className="font-sans text-xs text-secondary w-40 capitalize">{type.replace(/-/g, ' ')}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
                <div className="h-full rounded-full" style={{ width: `${(c / total) * 100}%`, background: 'var(--c-halogen)' }} />
              </div>
              <span className="font-mono text-xs text-dim">{c}/{total}</span>
            </div>
          ))}
        </div>

        <button onClick={() => setState('setup')}
          className="self-start px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors"
        >
          New Exam
        </button>
      </div>
    )
  }

  // ── Running screen ────────────────────────────────────────────────────────────

  const q = questions[current]
  const isCorrect = confirmed && selected ? checkMechAnswer(q, selected) : false
  const isUrgent = timeLeft < 120

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex items-center justify-between print:hidden">
        <span className="font-mono text-sm text-secondary">{preset.label} · Q {current + 1}/{questions.length}</span>
        <span className={`font-mono text-sm ${isUrgent ? 'text-rose-700 dark:text-rose-400' : 'text-dim'}`}>{formatTime(timeLeft)}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
        <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
          animate={{ width: `${(current / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={current}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${
            !confirmed ? 'border-border' : isCorrect ? 'border-emerald-500 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20' : 'border-rose-500 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/20'
          }`}
          style={{ background: confirmed ? undefined : 'rgb(var(--color-surface))' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-dim uppercase tracking-wider">{q.type.replace(/-/g, ' ')}</span>
            <span className="font-mono text-[10px] text-dim">·</span>
            <span className="font-mono text-[10px] text-dim">{CATEGORY_LABELS[q.category]}</span>
          </div>
          <pre className="font-mono text-sm text-primary leading-relaxed whitespace-pre-wrap">{q.scenario}</pre>
          <p className="font-sans text-sm text-secondary font-medium">{q.question}</p>
          <div className="flex flex-col gap-2">
            {q.choices.map(opt => {
              const isSelected = selected === opt
              const isOptCorrect = opt === q.answer
              let style: React.CSSProperties = { background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))', color: 'rgba(var(--overlay),0.6)' }
              if (confirmed) {
                if (isOptCorrect) style = { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' }
                else if (isSelected) style = { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }
              } else if (isSelected) {
                style = { background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)', color: 'var(--c-halogen)' }
              }
              return (
                <button key={opt} onClick={() => handleSelect(opt)} disabled={confirmed}
                  className="px-4 py-2.5 rounded-sm font-sans text-sm text-left transition-colors disabled:cursor-not-allowed leading-snug"
                  style={style}
                >
                  {opt}
                </button>
              )
            })}
          </div>
          {confirmed && (
            <p className={`font-sans text-sm font-medium ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              {isCorrect ? '✓ Correct' : `✗ Incorrect — ${q.answer}`}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {confirmed && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={next}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors"
          >
            {current + 1 >= questions.length ? 'See Results' : 'Next →'}
          </button>
        </motion.div>
      )}
    </div>
  )
}
