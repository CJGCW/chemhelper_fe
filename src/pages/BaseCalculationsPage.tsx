import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { countSigFigs, formatSigFigs, lowestSigFigs } from '../utils/sigfigs'
import SigFigPractice from '../components/calculations/SigFigPractice'
import UnitConversions from '../components/calculations/UnitConversions'
import ScientificNotation from '../components/calculations/ScientificNotation'

// ── Digit annotation ──────────────────────────────────────────────────────────

interface AnnotatedChar { char: string; significant: boolean }

function annotateNumber(numStr: string): AnnotatedChar[] {
  const trimmed = numStr.trim()
  if (!trimmed) return []
  const hasDecimal = trimmed.includes('.')
  const digitStr = trimmed.replace(/[^0-9]/g, '')
  const firstSig = digitStr.search(/[1-9]/)
  if (firstSig === -1) return [...trimmed].map(c => ({ char: c, significant: false }))
  let lastSig = digitStr.length - 1
  if (!hasDecimal) while (lastSig > firstSig && digitStr[lastSig] === '0') lastSig--
  let di = 0
  return [...trimmed].map(c => {
    if (c === '.' || c === '-') return { char: c, significant: false }
    const sig = di >= firstSig && di <= lastSig
    di++
    return { char: c, significant: sig }
  })
}

function countDecimalPlaces(numStr: string): number {
  const dot = numStr.trim().indexOf('.')
  return dot === -1 ? 0 : numStr.trim().length - dot - 1
}

// ── Static data ───────────────────────────────────────────────────────────────

const SF_RULES: { rule: string; description: string; example: string; sigFigs: number }[] = [
  {
    rule: 'Non-zero digits',
    description: 'All non-zero digits are always significant.',
    example: '3.84',
    sigFigs: 3,
  },
  {
    rule: 'Sandwiched zeros',
    description: 'Zeros between two significant digits are significant.',
    example: '1.005',
    sigFigs: 4,
  },
  {
    rule: 'Leading zeros',
    description: 'Zeros before the first non-zero digit are never significant.',
    example: '0.0045',
    sigFigs: 2,
  },
  {
    rule: 'Trailing zeros + decimal',
    description: 'Trailing zeros after a decimal point are significant.',
    example: '1.200',
    sigFigs: 4,
  },
  {
    rule: 'Trailing zeros, no decimal',
    description: 'Trailing zeros without a decimal are ambiguous — not counted.',
    example: '1500',
    sigFigs: 2,
  },
  {
    rule: 'Trailing decimal point',
    description: 'A decimal point after trailing zeros makes all digits significant.',
    example: '100.',
    sigFigs: 3,
  },
]

const OP_EXAMPLES = [
  {
    tag: '× / ÷',
    rule: 'Round result to fewest significant figures.',
    detail: '4.56 × 1.4 = 6.384 → 6.4  (limited by 1.4 at 2 sf)',
  },
  {
    tag: '+ / −',
    rule: 'Round result to fewest decimal places.',
    detail: '12.11 + 18.0 = 30.11 → 30.1  (limited by 18.0 at 1 d.p.)',
  },
  {
    tag: 'round half to even',
    rule: 'When the dropped digit is exactly 5, round to make the last kept digit even.',
    detail: '2.25 → 2.2  (2 is even)  ·  2.35 → 2.4  (4 is even)  ·  2.55 → 2.6  (6 is even)',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

type OpType = '×' | '÷' | '+' | '−'

export default function BaseCalculationsPage() {
  const [searchParams] = useSearchParams()
  const pageTab = searchParams.get('tab') ?? 'sig-figs'
  const [sigFigTab, setSigFigTab] = useState<'reference' | 'practice'>('reference')
  const [counterInput, setCounterInput] = useState('')

  const [inputA, setInputA] = useState('')
  const [inputB, setInputB] = useState('')
  const [operation, setOperation] = useState<OpType>('×')
  const [opResult, setOpResult] = useState<{ value: string; label: string; steps: string[] } | null>(null)
  const [opError, setOpError] = useState<string | null>(null)

  const annotated = annotateNumber(counterInput)
  const sfCount = counterInput.trim() ? countSigFigs(counterInput) : null
  const isMultDiv = operation === '×' || operation === '÷'

  function calculate() {
    setOpError(null)
    setOpResult(null)
    const a = parseFloat(inputA), b = parseFloat(inputB)
    if (isNaN(a) || isNaN(b)) { setOpError('Enter valid numbers for both inputs.'); return }
    if (operation === '÷' && b === 0) { setOpError('Cannot divide by zero.'); return }

    if (operation === '×' || operation === '÷') {
      const raw = operation === '×' ? a * b : a / b
      const sfA = countSigFigs(inputA), sfB = countSigFigs(inputB)
      const sf = lowestSigFigs([inputA, inputB])
      const limitingInput = sfA <= sfB ? inputA : inputB
      const formatted = formatSigFigs(raw, sf)
      setOpResult({
        value: formatted,
        label: `${sf} sig fig${sf !== 1 ? 's' : ''}`,
        steps: [
          `${inputA} ${operation} ${inputB} = ${raw.toPrecision(10).replace(/\.?0+$/, '')}`,
          `Limiting: ${limitingInput} (${sf} sf)`,
          `Rounded to ${sf} sf → ${formatted}`,
        ],
      })
    } else {
      const raw = operation === '+' ? a + b : a - b
      const dpA = countDecimalPlaces(inputA), dpB = countDecimalPlaces(inputB)
      const dp = Math.min(dpA, dpB)
      const limitingInput = dpA <= dpB ? inputA : inputB
      const formatted = raw.toFixed(dp)
      setOpResult({
        value: formatted,
        label: `${dp} decimal place${dp !== 1 ? 's' : ''}`,
        steps: [
          `${inputA} ${operation} ${inputB} = ${raw}`,
          `Limiting: ${limitingInput} (${dp} d.p.)`,
          `Rounded to ${dp} d.p. → ${formatted}`,
        ],
      })
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <h2 className="font-sans font-semibold text-bright text-xl">
          {pageTab === 'conversions' ? 'Unit Conversions' : pageTab === 'sci-notation' ? 'Scientific Notation' : 'Sig Figs'}
        </h2>

        {/* Reference / Practice pills — only shown on sig figs tab */}
        {pageTab === 'sig-figs' && (
          <div className="flex items-center gap-1 p-1 rounded-sm self-start"
            style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
            {(['reference', 'practice'] as const).map(tab => (
              <button key={tab} onClick={() => setSigFigTab(tab)}
                className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: sigFigTab === tab ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}
              >
                {sigFigTab === tab && (
                  <motion.div layoutId="sf-tab-bg"
                    className="absolute inset-0 rounded-sm"
                    style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
      {pageTab === 'conversions' ? (
        <motion.div key="conversions"
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          <UnitConversions />
        </motion.div>
      ) : pageTab === 'sci-notation' ? (
        <motion.div key="sci-notation"
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          <ScientificNotation />
        </motion.div>
      ) : sigFigTab === 'practice' ? (
        <motion.div key="practice"
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          <SigFigPractice />
        </motion.div>
      ) : (
      <motion.div key="reference"
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18 }}
        className="flex flex-col gap-6"
      >

      {/* Two cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* ── Sig Fig Counter ── */}
        <div className="flex flex-col gap-4 p-4 rounded-sm border border-border" style={{ background: '#0e1016' }}>
          <p className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase">Sig Fig Counter</p>

          <input
            type="text"
            inputMode="decimal"
            value={counterInput}
            onChange={e => setCounterInput(e.target.value)}
            placeholder="e.g. 0.00750"
            className="font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
          />

          {/* Annotated digit display */}
          <AnimatePresence>
            {annotated.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-end gap-1.5 min-h-[72px] flex-wrap"
              >
                {annotated.map((ac, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span
                      className="font-mono text-4xl font-semibold leading-none"
                      style={{
                        color: ac.char === '.' || ac.char === '-'
                          ? 'rgba(255,255,255,0.2)'
                          : ac.significant
                            ? 'var(--c-halogen)'
                            : 'rgba(255,255,255,0.22)',
                      }}
                    >
                      {ac.char}
                    </span>
                    {ac.char !== '.' && ac.char !== '-' && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: ac.significant
                            ? 'var(--c-halogen)'
                            : 'rgba(255,255,255,0.12)',
                        }}
                      />
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {sfCount !== null && (
            <div className="flex items-baseline gap-2 border-t border-border pt-3">
              <span className="font-mono text-3xl font-bold" style={{ color: 'var(--c-halogen)' }}>
                {sfCount}
              </span>
              <span className="font-sans text-sm text-secondary">
                significant figure{sfCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* ── Operation Calculator ── */}
        <div className="flex flex-col gap-4 p-4 rounded-sm border border-border" style={{ background: '#0e1016' }}>
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase">Operation Calculator</p>
            <span className="font-sans text-xs text-secondary">
              {isMultDiv ? 'fewest sig figs' : 'fewest decimal places'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text" inputMode="decimal" value={inputA}
              onChange={e => { setInputA(e.target.value); setOpResult(null) }}
              placeholder="e.g. 4.56"
              className="w-0 flex-1 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
            />
            <div className="flex gap-1 shrink-0">
              {(['×', '÷', '+', '−'] as OpType[]).map(op => (
                <button
                  key={op}
                  onClick={() => { setOperation(op); setOpResult(null) }}
                  className="w-8 h-8 rounded-sm font-mono text-sm font-semibold transition-colors"
                  style={{
                    background: operation === op
                      ? 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)'
                      : 'transparent',
                    border: operation === op
                      ? '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)'
                      : '1px solid rgba(255,255,255,0.1)',
                    color: operation === op ? 'var(--c-halogen)' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {op}
                </button>
              ))}
            </div>
            <input
              type="text" inputMode="decimal" value={inputB}
              onChange={e => { setInputB(e.target.value); setOpResult(null) }}
              placeholder="e.g. 1.4"
              className="w-0 flex-1 font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2 text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>

          {opError && <p className="font-mono text-xs text-red-400">{opError}</p>}

          <button
            onClick={calculate}
            className="w-full py-2 rounded-sm font-sans font-medium text-sm transition-all"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, #0e1016)',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            }}
          >
            Calculate
          </button>

          <AnimatePresence>
            {opResult && (
              <motion.div
                key="op-result"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-2 pt-3 border-t border-border"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-dim text-sm">=</span>
                  <span className="font-mono text-2xl font-bold" style={{ color: 'var(--c-halogen)' }}>
                    {opResult.value}
                  </span>
                  <span className="font-sans text-xs text-secondary">({opResult.label})</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  {opResult.steps.map((s, i) => (
                    <p key={i} className="font-mono text-xs text-secondary">{s}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Rules Reference */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-[10px] tracking-[0.15em] text-dim uppercase">Rules Reference</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SF_RULES.map((r, i) => (
            <div key={i} className="flex flex-col gap-3 p-3 rounded-sm border border-border" style={{ background: '#0e1016' }}>
              <div className="flex items-start justify-between gap-2">
                <span className="font-sans text-xs font-medium text-primary leading-snug">{r.rule}</span>
                <span
                  className="font-mono text-sm font-semibold px-2 py-0.5 rounded-sm shrink-0"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, transparent)',
                    color: 'var(--c-halogen)',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 25%, transparent)',
                  }}
                >
                  {r.sigFigs} sf
                </span>
              </div>
              <p className="font-sans text-xs text-secondary leading-relaxed">{r.description}</p>
              <div className="flex items-end gap-1">
                {annotateNumber(r.example).map((ac, j) => (
                  <div key={j} className="flex flex-col items-center gap-1.5">
                    <span
                      className="font-mono text-2xl font-semibold leading-none"
                      style={{
                        color: ac.char === '.'
                          ? 'rgba(255,255,255,0.2)'
                          : ac.significant
                            ? 'var(--c-halogen)'
                            : 'rgba(255,255,255,0.22)',
                      }}
                    >
                      {ac.char}
                    </span>
                    {ac.char !== '.' && (
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: ac.significant ? 'var(--c-halogen)' : 'rgba(255,255,255,0.12)' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {OP_EXAMPLES.map((ex, i) => (
            <div key={i} className="flex flex-col gap-2 p-3 rounded-sm border border-border" style={{ background: '#0e1016' }}>
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded-sm shrink-0"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, transparent)',
                    color: 'var(--c-halogen)',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 25%, transparent)',
                  }}
                >
                  {ex.tag}
                </span>
                <span className="font-sans text-xs font-medium text-primary">{ex.rule}</span>
              </div>
              <p className="font-mono text-xs text-secondary leading-relaxed">{ex.detail}</p>
            </div>
          ))}
        </div>
      </div>

      </motion.div>
      )}
      </AnimatePresence>

    </div>
  )
}
