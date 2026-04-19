import { useState } from 'react'
import { countSigFigs } from '../../utils/sigfigs'

// ── Helpers ───────────────────────────────────────────────────────────────────

interface SciParts {
  coefficient: number
  exponent: number
  negative: boolean
}

function toSciParts(numStr: string): SciParts | null {
  const n = parseFloat(numStr)
  if (!isFinite(n) || n === 0) return null
  const negative = n < 0
  const abs = Math.abs(n)
  const exp = Math.floor(Math.log10(abs))
  const coeff = parseFloat((abs / Math.pow(10, exp)).toPrecision(12))
  return { coefficient: coeff, exponent: exp, negative }
}

function fmtCoeff(coeff: number, sf: number): string {
  return parseFloat(coeff.toPrecision(Math.max(sf, 1))).toString()
}

function fmtStandard(parts: SciParts, sf: number): string | null {
  const { coefficient, exponent, negative } = parts
  if (Math.abs(exponent) > 14) return null
  const n = (negative ? -1 : 1) * coefficient * Math.pow(10, exponent)
  return parseFloat(n.toPrecision(Math.max(sf, 1))).toString()
}

// ── Sci notation display ──────────────────────────────────────────────────────

function SciDisplay({ parts, sf }: { parts: SciParts; sf: number }) {
  const coeffStr = fmtCoeff(parts.coefficient, sf)
  const expStr   = parts.exponent < 0 ? `−${Math.abs(parts.exponent)}` : String(parts.exponent)

  return (
    <div className="flex items-end gap-2 flex-wrap">
      {parts.negative && (
        <span className="font-mono text-4xl font-bold" style={{ color: 'var(--c-halogen)' }}>−</span>
      )}
      <span className="font-mono text-4xl font-bold" style={{ color: 'var(--c-halogen)' }}>
        {coeffStr}
      </span>
      <div className="flex flex-col items-start leading-none pb-0.5">
        <span className="font-mono font-bold text-xl" style={{ color: 'var(--c-halogen)' }}>
          {expStr}
        </span>
        <span className="font-mono text-2xl text-secondary">× 10</span>
      </div>
    </div>
  )
}

// ── Static data ───────────────────────────────────────────────────────────────

const RULES = [
  {
    title: 'Format',
    desc: 'The coefficient must satisfy 1 ≤ |coefficient| < 10.',
    from: null,
    to: '4.56 × 10⁻⁴',
    note: 'coefficient 4.56 is between 1 and 10',
  },
  {
    title: 'Positive exponent',
    desc: 'Numbers ≥ 10. The decimal point moved left.',
    from: '93,000,000',
    to: '9.3 × 10⁷',
    note: 'decimal moved 7 places left',
  },
  {
    title: 'Negative exponent',
    desc: 'Numbers between 0 and 1. The decimal point moved right.',
    from: '0.000456',
    to: '4.56 × 10⁻⁴',
    note: 'decimal moved 4 places right',
  },
  {
    title: 'Zero exponent',
    desc: 'Numbers between 1 and 10. No decimal movement.',
    from: '7.2',
    to: '7.2 × 10⁰',
    note: 'decimal not moved',
  },
]

const OPERATIONS = [
  {
    tag: '×',
    title: 'Multiply',
    rule: 'Multiply coefficients, add exponents.',
    formula: '(a × 10ᵐ) × (b × 10ⁿ) = (a · b) × 10ᵐ⁺ⁿ',
    example: '(3.0 × 10²) × (2.0 × 10³) = 6.0 × 10⁵',
  },
  {
    tag: '÷',
    title: 'Divide',
    rule: 'Divide coefficients, subtract exponents.',
    formula: '(a × 10ᵐ) ÷ (b × 10ⁿ) = (a ÷ b) × 10ᵐ⁻ⁿ',
    example: '(6.0 × 10⁵) ÷ (2.0 × 10²) = 3.0 × 10³',
  },
  {
    tag: '±',
    title: 'Add / Subtract',
    rule: 'Convert to the same exponent first, then add/subtract coefficients.',
    formula: 'Align exponents → operate → normalize coefficient',
    example: '3.0 × 10³ + 2.0 × 10²\n= 30.0 × 10² + 2.0 × 10²\n= 32.0 × 10² = 3.2 × 10³',
  },
]

// ── Reference view ────────────────────────────────────────────────────────────

export function ScientificNotationReference() {
  return (
    <div className="flex flex-col gap-8">

      {/* General form */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-widest text-secondary uppercase">General Form</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3 p-4 rounded-sm border border-border" style={{ background: '#0e1016' }}>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-xs text-secondary">Format</p>
              <p className="font-mono text-lg text-primary">a × 10ⁿ</p>
              <p className="font-sans text-xs text-secondary">where 1 ≤ |a| &lt; 10 and n is an integer</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { label: 'n > 0', desc: 'large number', ex: '10³ = 1,000' },
                { label: 'n < 0', desc: 'small number', ex: '10⁻³ = 0.001' },
                { label: 'n = 0', desc: 'between 1–10', ex: '10⁰ = 1' },
                { label: 'a < 0', desc: 'negative number', ex: '−2.5 × 10²' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-0.5 p-2 rounded-sm"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>{item.label}</span>
                  <span className="font-sans text-xs text-secondary">{item.desc}</span>
                  <span className="font-mono text-xs text-secondary">{item.ex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sig figs note */}
          <div className="flex flex-col gap-3 p-4 rounded-sm border border-border" style={{ background: '#0e1016' }}>
            <p className="font-mono text-xs tracking-widest text-secondary uppercase">Sig Figs in Sci Notation</p>
            <p className="font-sans text-xs text-secondary leading-relaxed">
              Only the <strong className="text-primary">coefficient</strong> (mantissa) determines significant figures.
              The × 10ⁿ part is exact and never limits precision.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              {[
                { ex: '6.022 × 10²³', sf: 4, note: '4 digits in coefficient → 4 sf' },
                { ex: '3.0 × 10⁴',    sf: 2, note: 'trailing zero after decimal → 2 sf' },
                { ex: '1.500 × 10⁻³', sf: 4, note: 'all trailing zeros significant → 4 sf' },
              ].map((row, i) => (
                <div key={i} className="flex items-baseline justify-between gap-3 py-1.5 border-b border-border last:border-b-0">
                  <span className="font-mono text-sm text-primary">{row.ex}</span>
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded-sm shrink-0"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, transparent)',
                      color: 'var(--c-halogen)',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 25%, transparent)',
                    }}>
                    {row.sf} sf
                  </span>
                  <span className="font-mono text-xs text-secondary shrink-0 hidden sm:block">{row.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Converting rules */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-widest text-secondary uppercase">Converting</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RULES.map((r, i) => (
            <div key={i} className="flex flex-col gap-2 p-3 rounded-sm border border-border" style={{ background: '#0e1016' }}>
              <span className="font-sans text-xs font-semibold text-primary">{r.title}</span>
              <p className="font-sans text-xs text-secondary leading-relaxed">{r.desc}</p>
              <div className="flex flex-col gap-0.5 mt-auto pt-2 border-t border-border">
                {r.from && <span className="font-mono text-xs text-secondary">{r.from}</span>}
                <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>{r.to}</span>
                <span className="font-mono text-xs text-secondary">{r.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operations */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-widest text-secondary uppercase">Operations</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {OPERATIONS.map((op, i) => (
            <div key={i} className="flex flex-col gap-2 p-3 rounded-sm border border-border" style={{ background: '#0e1016' }}>
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-sm px-2 py-0.5 rounded-sm shrink-0"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, transparent)',
                    color: 'var(--c-halogen)',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 25%, transparent)',
                  }}
                >
                  {op.tag}
                </span>
                <span className="font-sans text-xs font-semibold text-primary">{op.title}</span>
              </div>
              <p className="font-sans text-xs text-secondary">{op.rule}</p>
              <p className="font-mono text-xs text-secondary">{op.formula}</p>
              <div className="mt-auto pt-2 border-t border-border">
                {op.example.split('\n').map((line, j, arr) => (
                  <p key={j} className="font-mono text-xs"
                    style={{ color: j === 0 ? 'rgba(255,255,255,0.6)' : j === arr.length - 1 ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

// ── Practice (converter) view ─────────────────────────────────────────────────

export function ScientificNotationPracticeConverter() {
  const [input, setInput] = useState('')

  const num    = parseFloat(input)
  const hasVal = input.trim() !== '' && !isNaN(num) && num !== 0
  const parts  = hasVal ? toSciParts(input) : null
  const sf     = hasVal ? countSigFigs(input) : 1
  const stdForm = parts ? fmtStandard(parts, sf) : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div className="flex flex-col gap-4 p-4 rounded-sm border border-border" style={{ background: '#0e1016' }}>
        <p className="font-mono text-xs tracking-widest text-secondary uppercase">Notation Converter</p>

        <input
          type="text"
          inputMode="decimal"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. 0.000456 or 6.022e23"
          className="font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2
                     text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
        />

        {parts ? (
          <div className="flex flex-col gap-3 pt-1">
            <div>
              <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-2">Scientific Notation</p>
              <SciDisplay parts={parts} sf={sf} />
            </div>

            {stdForm && (
              <div className="border-t border-border pt-3 flex flex-col gap-1">
                <p className="font-mono text-xs text-secondary uppercase tracking-widest">Standard Form</p>
                <span className="font-mono text-xl font-semibold text-primary">
                  {parts.negative && stdForm[0] !== '-' ? '−' : ''}{stdForm}
                </span>
              </div>
            )}
            {!stdForm && (
              <div className="border-t border-border pt-3">
                <p className="font-mono text-xs text-secondary">Number too large/small to display in standard form.</p>
              </div>
            )}

            <div className="border-t border-border pt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold" style={{ color: 'var(--c-halogen)' }}>{sf}</span>
              <span className="font-sans text-sm text-secondary">significant figure{sf !== 1 ? 's' : ''}</span>
            </div>
          </div>
        ) : (
          <p className="font-sans text-xs text-secondary">Enter a number to convert.</p>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4 rounded-sm border border-border" style={{ background: '#0e1016' }}>
        <p className="font-mono text-xs tracking-widest text-secondary uppercase">Reading Scientific Notation</p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs text-secondary">General form</p>
            <p className="font-mono text-lg text-primary">a × 10ⁿ</p>
            <p className="font-sans text-xs text-secondary">where 1 ≤ |a| &lt; 10 and n is an integer</p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { label: 'n > 0', desc: 'large number', ex: '10³ = 1,000' },
              { label: 'n < 0', desc: 'small number', ex: '10⁻³ = 0.001' },
              { label: 'n = 0', desc: 'between 1–10', ex: '10⁰ = 1' },
              { label: 'a < 0', desc: 'negative number', ex: '−2.5 × 10²' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-0.5 p-2 rounded-sm"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>{item.label}</span>
                <span className="font-sans text-xs text-secondary">{item.desc}</span>
                <span className="font-mono text-xs text-secondary">{item.ex}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Default export (backward compat — used nowhere but keep for safety) ────────

export default function ScientificNotation() {
  return (
    <div className="flex flex-col gap-8">
      <ScientificNotationPracticeConverter />
      <ScientificNotationReference />
    </div>
  )
}
