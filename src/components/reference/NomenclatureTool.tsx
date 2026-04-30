import { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  generateProblem,
  verifyAnswer,
  type Problem,
  type ProblemMode,
  type CompoundType,
} from '../../chem/nomenclature'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../shared/StepsPanel'

const NOM_EXAMPLES = [
  {
    scenario: 'Name the compound NaCl (ionic, Group IA cation + Group VIIA anion).',
    steps: [
      'Identify the cation: Na⁺ (sodium, Group IA — charge is always +1)',
      'Identify the anion: Cl⁻ (chloride, Group VIIA — charge is always −1)',
      'Name the cation using the element name: sodium',
      'Name the anion by replacing the ending with -ide: chlor + ide = chloride',
    ],
    result: 'NaCl = sodium chloride',
  },
  {
    scenario: 'Name the compound FeCl₃ (ionic, transition metal cation).',
    steps: [
      'Identify the anion: Cl⁻ (charge = −1). Three Cl⁻ gives total anion charge = −3',
      'Determine the cation charge: Fe must be +3 to balance (3 × −1 = −3)',
      'Name the cation using Roman numeral for the charge: iron(III)',
      'Name the anion: chloride',
    ],
    result: 'FeCl₃ = iron(III) chloride',
  },
  {
    scenario: 'Name the compound Ca(NO₃)₂ (ionic, polyatomic anion).',
    steps: [
      'Identify the cation: Ca²⁺ (calcium, Group IIA — charge is always +2)',
      'Identify the anion: NO₃⁻ — this is the nitrate polyatomic ion (memorized)',
      'Name the cation: calcium',
      'Name the anion using the polyatomic ion name: nitrate',
    ],
    result: 'Ca(NO₃)₂ = calcium nitrate',
  },
  {
    scenario: 'Name the compound SO₂ (binary covalent, non-metal + non-metal).',
    steps: [
      'Both elements are non-metals → use Greek prefix naming (no ions)',
      'First element (S): 1 atom → no prefix for the first element when count = 1',
      'Second element (O): 2 atoms → di + ox + ide = dioxide',
      'Combine: sulfur dioxide',
    ],
    result: 'SO₂ = sulfur dioxide',
  },
  {
    scenario: 'Name the compound N₂O₄ (binary covalent).',
    steps: [
      'Both elements are non-metals → use Greek prefix naming',
      'First element (N): 2 atoms → di + nitrogen = dinitrogen',
      'Second element (O): 4 atoms → tetr + ox + ide = tetroxide',
      'Combine: dinitrogen tetroxide',
    ],
    result: 'N₂O₄ = dinitrogen tetroxide',
  },
]

function generateNomenclatureExample() {
  const ex = NOM_EXAMPLES[Math.floor(Math.random() * NOM_EXAMPLES.length)]
  return ex
}

type VerifyState = 'none' | 'correct' | 'incorrect'

const TYPE_LABELS: Record<CompoundType, string> = {
  'ionic-simple':      'Simple Ionic',
  'ionic-polyatomic':  'Polyatomic',
  'ionic-transition':  'Transition Metal',
  'covalent-binary':   'Covalent',
}

const ALL_TYPES: CompoundType[] = ['ionic-simple', 'ionic-polyatomic', 'ionic-transition', 'covalent-binary']

export default function NomenclatureTool() {
  const [mode,         setMode]         = useState<ProblemMode>('formula-to-name')
  const [allowedTypes, setAllowedTypes] = useState<Set<CompoundType>>(new Set(ALL_TYPES))
  const [problem,      setProblem]      = useState<Problem | null>(null)
  const [userAnswer,   setUserAnswer]   = useState('')
  const [verify,       setVerify]       = useState<VerifyState>('none')
  const [showAnswer,   setShowAnswer]   = useState(false)
  const [stats,        setStats]        = useState({ correct: 0, total: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  const [noSteps] = useState<string[]>([])
  const stepsState = useStepsPanelState(noSteps, generateNomenclatureExample)

  function newProblem(m?: ProblemMode, types?: Set<CompoundType>) {
    const activeModes  = m     ?? mode
    const activeTypes  = types ?? allowedTypes
    const pool = Array.from(activeTypes)
    if (pool.length === 0) { setProblem(null); return }
    const type = pool[Math.floor(Math.random() * pool.length)]
    setProblem(generateProblem(activeModes, type))
    setUserAnswer('')
    setVerify('none')
    setShowAnswer(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // Generate first problem on mount
  useEffect(() => { newProblem() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleCheck() {
    if (!problem || !userAnswer.trim()) return
    const result = verifyAnswer(problem, userAnswer) as 'correct' | 'incorrect'
    setVerify(result)
    setStats(s => ({ correct: s.correct + (result === 'correct' ? 1 : 0), total: s.total + 1 }))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key !== 'Enter') return
    if (verify === 'none') { handleCheck() }
    else { newProblem() }
  }

  function toggleType(t: CompoundType) {
    setAllowedTypes(prev => {
      const next = new Set(prev)
      if (next.has(t) && next.size > 1) next.delete(t)
      else next.add(t)
      const newSet = new Set(next)
      setProblem(null)
      setUserAnswer('')
      setVerify('none')
      setShowAnswer(false)
      setTimeout(() => newProblem(mode, newSet), 0)
      return newSet
    })
  }

  function switchMode(m: ProblemMode) {
    setMode(m)
    setStats({ correct: 0, total: 0 })
    newProblem(m)
  }

  const promptLabel = mode === 'formula-to-name'
    ? 'Name this compound'
    : 'Write the formula'
  const inputPlaceholder = mode === 'formula-to-name'
    ? 'e.g. iron(III) chloride'
    : 'e.g. FeCl3 or FeCl₃'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Mode toggle */}
      <div className="flex items-center gap-4 flex-wrap print:hidden">
        <div className="flex items-center gap-1 p-1 rounded-full self-start"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          {(['formula-to-name', 'name-to-formula'] as ProblemMode[]).map(m => (
            <button key={m} onClick={() => switchMode(m)}
              className="relative px-4 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
              style={{ color: mode === m ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
              {mode === m && (
                <motion.div layoutId="nom-mode" className="absolute inset-0 rounded-full"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
              <span className="relative z-10">
                {m === 'formula-to-name' ? 'Formula → Name' : 'Name → Formula'}
              </span>
            </button>
          ))}
        </div>

        {/* Stats */}
        {stats.total > 0 && (
          <span className="font-mono text-xs text-secondary">
            <span style={{ color: 'var(--c-halogen)' }}>{stats.correct}</span>
            {' / '}{stats.total} correct
          </span>
        )}
      </div>

      {/* Compound type filter */}
      <div className="flex flex-wrap gap-2 print:hidden">
        {ALL_TYPES.map(t => {
          const active = allowedTypes.has(t)
          return (
            <button key={t} onClick={() => toggleType(t)}
              className="px-3 py-1 rounded-full font-sans text-xs font-medium transition-colors"
              style={{
                color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)',
                background: active
                  ? 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))'
                  : 'rgb(var(--color-surface))',
                border: active
                  ? '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)'
                  : '1px solid rgb(var(--color-border))',
              }}>
              {TYPE_LABELS[t]}
            </button>
          )
        })}
      </div>

      {/* Worked example */}
      <div className="flex items-stretch gap-2">
        <StepsTrigger {...stepsState} />
      </div>
      <StepsContent {...stepsState} />

      {/* Problem card */}
      <AnimatePresence mode="wait">
        {problem && (
          <motion.div key={problem.prompt}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>

            <div className="rounded-sm border border-border bg-surface p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-xs text-secondary tracking-widest uppercase">
                  {promptLabel}
                </span>
                <span className="font-mono text-2xl text-bright tracking-wide">
                  {problem.prompt}
                </span>
                <span className="font-mono text-[10px] text-dim capitalize">
                  {TYPE_LABELS[problem.type]}
                </span>
              </div>

              {/* Input */}
              <div className="flex flex-col gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={userAnswer}
                  onChange={e => { setUserAnswer(e.target.value); setVerify('none'); setShowAnswer(false) }}
                  onKeyDown={handleKeyDown}
                  placeholder={inputPlaceholder}
                  disabled={verify === 'correct'}
                  className="w-full font-mono text-sm px-3 py-2 rounded-sm border bg-raised text-primary
                             placeholder-dim focus:outline-none transition-colors"
                  style={{
                    borderColor: verify === 'correct'  ? 'rgb(74 222 128 / 0.5)'
                                : verify === 'incorrect' ? 'rgb(248 113 113 / 0.5)'
                                : 'rgb(var(--color-border))',
                  }}
                />

                {/* Verify feedback */}
                <AnimatePresence>
                  {verify !== 'none' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                      className="flex items-center gap-2 flex-wrap"
                    >
                      <span className="font-mono text-sm font-semibold"
                        style={{ color: verify === 'correct' ? 'rgb(74 222 128)' : 'rgb(248 113 113)' }}>
                        {verify === 'correct' ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                      {verify === 'incorrect' && !showAnswer && (
                        <button
                          onClick={() => setShowAnswer(true)}
                          className="font-mono text-xs text-secondary hover:text-primary transition-colors underline underline-offset-2">
                          Show answer
                        </button>
                      )}
                      {showAnswer && (
                        <span className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>
                          {problem.answer}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2">
                {verify === 'none' && (
                  <button onClick={handleCheck}
                    disabled={!userAnswer.trim()}
                    className="px-5 py-2 rounded-sm font-sans text-sm font-semibold transition-colors
                               disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
                      color: 'var(--c-halogen)',
                    }}>
                    Check
                  </button>
                )}
                <button onClick={() => newProblem()}
                  className="px-4 py-2 rounded-sm font-mono text-xs border border-border
                             text-secondary hover:text-bright transition-colors">
                  {verify !== 'none' ? 'Next ↺' : 'Skip ↺'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="font-mono text-xs text-dim">
        {mode === 'name-to-formula' ? 'ASCII subscripts accepted — FeCl3 = FeCl₃' : 'Classical names accepted where applicable'}
      </p>
    </div>
  )
}
