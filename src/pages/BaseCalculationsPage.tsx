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

const SCI_NOTATION_EXAMPLES: { coefficient: string; exponent: string; sigFigs: number; note: string }[] = [
  { coefficient: '6.022', exponent: '23',  sigFigs: 4, note: 'Avogadro\'s number (as measured — 4 sf from the coefficient)' },
  { coefficient: '3.0',   exponent: '4',   sigFigs: 2, note: 'Trailing zero after decimal is significant — 2 sf' },
  { coefficient: '1.500', exponent: '−3',  sigFigs: 4, note: 'All trailing zeros after the decimal are significant — 4 sf' },
  { coefficient: '2.1',   exponent: '8',   sigFigs: 2, note: 'Only the two non-zero digits count — 2 sf' },
  { coefficient: '9.979', exponent: '7',   sigFigs: 4, note: 'Four digits in the coefficient → 4 sf' },
]

const EXACT_EXAMPLES: { category: string; badge: string; items: { value: string; label: string }[]; note: string }[] = [
  {
    category: 'Counting Numbers',
    badge: '∞ sf',
    items: [
      { value: '6 atoms',      label: 'exact integer' },
      { value: '3 molecules',  label: 'exact integer' },
      { value: '2 moles',      label: 'exact integer' },
    ],
    note: 'Discrete objects counted without measurement carry infinite precision and never limit sig figs.',
  },
  {
    category: 'Stoichiometric Coefficients',
    badge: '∞ sf',
    items: [
      { value: '2 in 2H₂',    label: 'exact' },
      { value: '1 in O₂',     label: 'exact' },
      { value: '3 in 3CaCl₂', label: 'exact' },
    ],
    note: 'Balancing coefficients are exact integers — they never restrict the sig figs of a mole calculation.',
  },
  {
    category: 'Defined Unit Conversions',
    badge: '∞ sf',
    items: [
      { value: '1 in = 2.54 cm',  label: 'exact by definition' },
      { value: '1 min = 60 s',    label: 'exact by definition' },
      { value: '1 kg = 1000 g',   label: 'exact by definition' },
    ],
    note: 'Defined conversion factors (not measured) are exact — use all the digits without concern for sig figs.',
  },
  {
    category: 'Mathematical Constants',
    badge: '∞ sf',
    items: [
      { value: 'π = 3.14159…',    label: 'irrational' },
      { value: 'e = 2.71828…',    label: 'irrational' },
      { value: '√2 = 1.41421…',   label: 'irrational' },
    ],
    note: 'Mathematical constants are exact by definition. Use enough decimal places so they don\'t limit your answer.',
  },
  {
    category: 'SI-Defined Physical Constants',
    badge: 'exact',
    items: [
      { value: 'c = 299,792,458 m/s',        label: 'speed of light' },
      { value: 'Nₐ = 6.02214076 × 10²³',    label: 'Avogadro (2019 def.)' },
      { value: 'h = 6.62607015 × 10⁻³⁴ J·s', label: 'Planck constant' },
    ],
    note: 'Since the 2019 SI redefinition these constants are fixed exactly. Treat them as exact in calculations.',
  },
  {
    category: 'Molar Mass from Atomic Weights',
    badge: 'use table',
    items: [
      { value: 'M(C)  = 12.011 g/mol',  label: 'IUPAC standard' },
      { value: 'M(Fe) = 55.845 g/mol',  label: 'IUPAC standard' },
      { value: 'M(H)  = 1.008 g/mol',   label: 'IUPAC standard' },
    ],
    note: 'Atomic weights from the periodic table are themselves measured values. Use all digits given — don\'t round them before applying sig figs to your final answer.',
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
  const [convTab, setConvTab] = useState<'converter' | 'dimensional'>('converter')
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
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">
          {pageTab === 'conversions' ? 'Unit Conversions' : pageTab === 'sci-notation' ? 'Scientific Notation' : 'Sig Figs'}
        </h2>

        {/* Converter / Dimensional Analysis pills — only shown on conversions tab */}
        {pageTab === 'conversions' && (
          <div className="flex items-center gap-1 p-1 rounded-sm self-start"
            style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
            {(['converter', 'dimensional'] as const).map(tab => (
              <button key={tab} onClick={() => setConvTab(tab)}
                className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                style={{ color: convTab === tab ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}
              >
                {convTab === tab && (
                  <motion.div layoutId="conv-tab-bg"
                    className="absolute inset-0 rounded-sm"
                    style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tab === 'converter' ? 'Converter' : 'Conversion Examples'}</span>
              </button>
            ))}
          </div>
        )}

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
        <motion.div key={`conversions-${convTab}`}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          <UnitConversions tab={convTab} />
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
          <p className="font-sans text-sm font-semibold text-primary tracking-wide uppercase">Sig Fig Counter</p>

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
            <p className="font-sans text-sm font-semibold text-primary tracking-wide uppercase">Operation Calculator</p>
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
        <p className="font-sans text-sm font-semibold text-primary tracking-wide uppercase">Rules Reference</p>

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

      {/* Scientific Notation */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-sans text-sm font-semibold text-primary tracking-wide uppercase">Sig Figs in Scientific Notation</p>
          <p className="font-sans text-xs text-secondary">
            Only the coefficient (mantissa) determines significant figures. The × 10ⁿ part is exact and never limits precision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SCI_NOTATION_EXAMPLES.map((ex, i) => (
            <div key={i} className="flex flex-col gap-3 p-3 rounded-sm border border-border" style={{ background: '#0e1016' }}>
              {/* Number display */}
              <div className="flex items-end gap-1 flex-wrap">
                {/* Annotated coefficient */}
                {annotateNumber(ex.coefficient).map((ac, j) => (
                  <div key={j} className="flex flex-col items-center gap-1.5">
                    <span className="font-mono text-2xl font-semibold leading-none"
                      style={{
                        color: ac.char === '.'
                          ? 'rgba(255,255,255,0.2)'
                          : ac.significant ? 'var(--c-halogen)' : 'rgba(255,255,255,0.22)',
                      }}>
                      {ac.char}
                    </span>
                    {ac.char !== '.' && (
                      <div className="w-1.5 h-1.5 rounded-full"
                        style={{ background: ac.significant ? 'var(--c-halogen)' : 'rgba(255,255,255,0.12)' }} />
                    )}
                  </div>
                ))}
                {/* × 10^n — dim, not annotated */}
                <span className="font-mono text-base text-dim leading-none mb-1">
                  {' '}× 10<sup>{ex.exponent}</sup>
                </span>
                {/* Sig fig count badge */}
                <span className="font-mono text-sm font-semibold px-2 py-0.5 rounded-sm ml-auto mb-1 shrink-0"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, transparent)',
                    color: 'var(--c-halogen)',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 25%, transparent)',
                  }}>
                  {ex.sigFigs} sf
                </span>
              </div>
              <p className="font-sans text-xs text-secondary leading-relaxed">{ex.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Exact Numbers */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-sans text-sm font-semibold text-primary tracking-wide uppercase">
            When Sig Figs <span className="text-bright font-bold text-base">Don't</span> Apply
          </p>
          <p className="font-sans text-xs text-secondary">
            Exact numbers have infinite significant figures and never limit the precision of a result.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EXACT_EXAMPLES.map((ex, i) => (
            <div key={i} className="flex flex-col gap-3 p-3 rounded-sm border border-border" style={{ background: '#0e1016' }}>
              <div className="flex items-start justify-between gap-2">
                <span className="font-sans text-xs font-medium text-primary leading-snug">{ex.category}</span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded-sm shrink-0"
                  style={{
                    background: 'color-mix(in srgb, #34d399 12%, transparent)',
                    color: '#34d399',
                    border: '1px solid color-mix(in srgb, #34d399 25%, transparent)',
                  }}>
                  {ex.badge}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {ex.items.map((item, j) => (
                  <div key={j} className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-xs text-primary">{item.value}</span>
                    <span className="font-mono text-[10px] text-dim shrink-0">{item.label}</span>
                  </div>
                ))}
              </div>
              <p className="font-sans text-[11px] text-secondary leading-relaxed border-t border-border pt-2">{ex.note}</p>
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
