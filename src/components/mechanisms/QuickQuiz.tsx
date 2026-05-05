import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateMixedQuestion, checkMechAnswer, type MechQuestion } from '../../utils/mechanismQuestions'
import type { MechanismCategory } from '../../data/mechanisms/types'

const QUIZ_LENGTH = 10
const QUIZ_MINUTES = 10

interface Props { category?: MechanismCategory | 'all' }

type QuizState = 'setup' | 'running' | 'done'

function generateQuiz(category: MechanismCategory | 'all'): MechQuestion[] {
  const questions: MechQuestion[] = []
  for (let i = 0; i < QUIZ_LENGTH; i++) {
    questions.push(generateMixedQuestion(category))
  }
  return questions
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function QuickQuiz({ category = 'all' }: Props) {
  const [quizState, setQuizState] = useState<QuizState>('setup')
  const [questions, setQuestions] = useState<MechQuestion[]>([])
  const [answers, setAnswers]     = useState<string[]>([])
  const [current, setCurrent]     = useState(0)
  const [selected, setSelected]   = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [timeLeft, setTimeLeft]   = useState(QUIZ_MINUTES * 60)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startQuiz() {
    const qs = generateQuiz(category)
    setQuestions(qs)
    setAnswers([])
    setCurrent(0)
    setSelected(null)
    setConfirmed(false)
    setTimeLeft(QUIZ_MINUTES * 60)
    setQuizState('running')
  }

  useEffect(() => {
    if (quizState !== 'running') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          setQuizState('done')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [quizState])

  function handleSelect(opt: string) {
    if (confirmed) return
    setSelected(opt)
    setConfirmed(true)
    setAnswers(prev => [...prev, opt])
  }

  function next() {
    if (current + 1 >= questions.length) {
      if (timerRef.current) clearInterval(timerRef.current)
      setQuizState('done')
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setConfirmed(false)
    }
  }

  if (quizState === 'setup') {
    return (
      <div className="flex flex-col gap-4 max-w-lg">
        <p className="font-sans text-sm text-secondary leading-relaxed">
          A {QUIZ_LENGTH}-question mixed quiz covering reaction products, mechanisms, regiochemistry, stereochemistry, and reagents.
          You have {QUIZ_MINUTES} minutes.
        </p>
        <button onClick={startQuiz}
          className="self-start px-5 py-2 rounded-sm font-sans text-sm font-medium border transition-colors"
          style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)', color: 'var(--c-halogen)' }}
        >
          Start Quiz
        </button>
      </div>
    )
  }

  if (quizState === 'done') {
    const correct = answers.filter((a, i) => checkMechAnswer(questions[i], a)).length
    const pct = Math.round((correct / questions.length) * 100)
    return (
      <div className="flex flex-col gap-6 max-w-xl">
        <div className="rounded-sm border border-border p-5 flex flex-col gap-3" style={{ background: 'rgb(var(--color-surface))' }}>
          <h3 className="font-sans text-lg font-semibold text-bright">Quiz Complete</h3>
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
          <span className="font-mono text-xs text-dim uppercase tracking-wider">Review</span>
          {questions.map((q, i) => {
            const wasCorrect = checkMechAnswer(q, answers[i] ?? '')
            return (
              <div key={i} className="rounded-sm border border-border p-3 flex flex-col gap-1" style={{ background: 'rgb(var(--color-raised))' }}>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs ${wasCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {wasCorrect ? '✓' : '✗'}
                  </span>
                  <span className="font-sans text-xs text-secondary capitalize">{q.type.replace(/-/g, ' ')}</span>
                </div>
                <p className="font-mono text-xs text-primary">{q.scenario.split('\n')[0]}</p>
                {!wasCorrect && (
                  <p className="font-sans text-xs text-dim">Correct: {q.answer}</p>
                )}
              </div>
            )
          })}
        </div>

        <button onClick={startQuiz}
          className="self-start px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary hover:border-muted transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  const q = questions[current]
  const correct = confirmed && selected ? checkMechAnswer(q, selected) : false
  const isUrgent = timeLeft < 60

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <span className="font-mono text-sm text-secondary">Q {current + 1}/{questions.length}</span>
        <span className={`font-mono text-sm ${isUrgent ? 'text-rose-400' : 'text-dim'}`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgb(var(--color-raised))' }}>
        <motion.div className="h-full rounded-full" style={{ background: 'var(--c-halogen)' }}
          animate={{ width: `${((current) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={current}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className={`rounded-sm border p-5 flex flex-col gap-4 transition-colors ${
            !confirmed ? 'border-border' : correct ? 'border-emerald-800/50 bg-emerald-950/20' : 'border-rose-800/50 bg-rose-950/20'
          }`}
          style={{ background: confirmed ? undefined : 'rgb(var(--color-surface))' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-dim uppercase tracking-wider">{q.type.replace(/-/g, ' ')}</span>
          </div>
          <pre className="font-mono text-sm text-primary leading-relaxed whitespace-pre-wrap">{q.scenario}</pre>
          <p className="font-sans text-sm text-secondary font-medium">{q.question}</p>

          <div className="flex flex-col gap-2">
            {q.choices.map(opt => {
              const isSelected = selected === opt
              const isCorrect  = opt === q.answer
              let style: React.CSSProperties = { background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))', color: 'rgba(var(--overlay),0.6)' }
              if (confirmed) {
                if (isCorrect) style = { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' }
                else if (isSelected) style = { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }
              } else if (isSelected) {
                style = { background: 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)', color: 'var(--c-halogen)' }
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
            <p className={`font-sans text-sm font-medium ${correct ? 'text-emerald-400' : 'text-rose-400'}`}>
              {correct ? '✓ Correct' : `✗ Incorrect — ${q.answer}`}
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
