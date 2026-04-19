import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { R, P_UNITS, type PUnit, type TUnit, toK, fromK, toAtm, fromAtm } from '../../utils/idealGas'

// ── Field component (matches IdealGasCalc style) ──────────────────────────────

function FieldBox({
  label, value, onChange, unit, unitNode, placeholder = '',
}: {
  label: string; value: string; onChange: (v: string) => void
  unit?: string; unitNode?: React.ReactNode; placeholder?: string
}) {
  const isEmpty = value.trim() === ''
  return (
    <div className={`flex flex-col gap-1.5 rounded-sm border p-3 transition-colors ${
      isEmpty ? 'border-border/40 bg-surface/50' : 'border-border bg-surface'
    }`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-secondary">{label}</span>
        {unitNode ?? (unit && <span className="font-mono text-xs text-dim">{unit}</span>)}
      </div>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'leave blank to solve'}
        className="w-full bg-transparent font-mono text-base text-bright placeholder:text-dim/50
                   focus:outline-none [appearance:textfield]
                   [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  )
}

function UnitPill({
  options, active, onChange,
}: { options: readonly string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className="px-2 py-0.5 rounded-sm font-mono text-xs transition-colors"
          style={active === o ? {
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
            color: 'var(--c-halogen)',
          } : {
            border: '1px solid rgba(var(--overlay),0.12)',
            color: 'rgba(var(--overlay),0.35)',
          }}
        >{o}</button>
      ))}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

type SolveFor = 'M' | 'rho' | 'T' | 'P'

export default function GasDensityCalc() {
  const [rho, setRho]     = useState('')   // g/L
  const [M, setM]         = useState('')   // g/mol
  const [T, setT]         = useState('')   // K or °C
  const [P, setP]         = useState('')   // selected pressure unit
  const [pUnit, setPUnit] = useState<PUnit>('atm')
  const [tUnit, setTUnit] = useState<TUnit>('K')

  const [result, setResult] = useState<{ solveFor: SolveFor; value: string; unit: string; steps: string[] } | null>(null)
  const [error, setError]   = useState('')

  function handleClear() {
    setRho(''); setM(''); setT(''); setP('')
    setResult(null); setError('')
  }

  function handleCalc() {
    setError(''); setResult(null)

    const blanks = [rho, M, T, P].filter(v => v.trim() === '').length
    if (blanks !== 1) {
      setError(blanks === 0
        ? 'Leave one field blank — that variable will be solved.'
        : 'Fill in exactly three fields.')
      return
    }

    const pRho = rho.trim() ? parseFloat(rho) : null
    const pM   = M.trim()   ? parseFloat(M)   : null
    const pT   = T.trim()   ? toK(parseFloat(T), tUnit) : null
    const pP   = P.trim()   ? parseFloat(P)   : null

    if ([pRho, pM, pT, pP].some(v => v !== null && (isNaN(v) || v <= 0))) {
      setError('All values must be positive numbers.'); return
    }

    const Patm = pP !== null ? toAtm(pP, pUnit) : null
    const sf = (v: number) => parseFloat(v.toPrecision(4)).toString()
    const steps: string[] = []
    const pConv = pUnit !== 'atm' && Patm !== null
      ? [`Convert P: ${sf(pP!)} ${pUnit} = ${sf(Patm)} atm`] : []
    const tConv = tUnit === 'C' && pT !== null
      ? [`Convert T: ${sf(parseFloat(T))} °C = ${sf(pT)} K`] : []

    // M = ρRT / P
    if (pM === null) {
      const ans = (pRho! * R * pT!) / Patm!
      steps.push('M = ρRT / P', ...pConv, ...tConv)
      steps.push(`M = (${sf(pRho!)} g/L × ${R} L·atm/(mol·K) × ${sf(pT!)} K) / ${sf(Patm!)} atm`)
      steps.push(`M = ${sf(ans)} g/mol`)
      setResult({ solveFor: 'M', value: sf(ans), unit: 'g/mol', steps })

    } else if (pRho === null) {
      // ρ = MP / RT
      const ans = (pM! * Patm!) / (R * pT!)
      steps.push('ρ = MP / RT', ...pConv, ...tConv)
      steps.push(`ρ = (${sf(pM!)} g/mol × ${sf(Patm!)} atm) / (${R} L·atm/(mol·K) × ${sf(pT!)} K)`)
      steps.push(`ρ = ${sf(ans)} g/L`)
      setResult({ solveFor: 'rho', value: sf(ans), unit: 'g/L', steps })

    } else if (pT === null) {
      // T = MP / ρR
      const ans = (pM! * Patm!) / (pRho! * R)
      const ansOut = fromK(ans, tUnit)
      steps.push('T = MP / ρR', ...pConv)
      steps.push(`T = (${sf(pM!)} g/mol × ${sf(Patm!)} atm) / (${sf(pRho!)} g/L × ${R} L·atm/(mol·K))`)
      steps.push(`T = ${sf(ans)} K` + (tUnit === 'C' ? `  =  ${sf(ansOut)} °C` : ''))
      setResult({ solveFor: 'T', value: sf(ansOut), unit: tUnit === 'C' ? '°C' : 'K', steps })

    } else {
      // P = ρRT / M
      const ansAtm = (pRho! * R * pT!) / pM!
      const ans = fromAtm(ansAtm, pUnit)
      steps.push('P = ρRT / M', ...tConv)
      steps.push(`P = (${sf(pRho!)} g/L × ${R} L·atm/(mol·K) × ${sf(pT!)} K) / ${sf(pM!)} g/mol`)
      steps.push(`P = ${sf(ansAtm)} atm` + (pUnit !== 'atm' ? `  =  ${sf(ans)} ${pUnit}` : ''))
      setResult({ solveFor: 'P', value: sf(ans), unit: pUnit, steps })
    }
  }

  const hasAny = rho || M || T || P
  const color = result?.solveFor === 'M' ? '#fbbf24' : result?.solveFor === 'rho' ? '#4ade80'
    : result?.solveFor === 'T' ? '#f472b6' : '#60a5fa'

  return (
    <div className="flex flex-col gap-6 max-w-xl">

      <p className="font-sans text-sm text-secondary">
        Fill in three fields and leave one blank — it will be solved using <span className="font-mono">M = ρRT / P</span>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldBox label="ρ — Density" value={rho} onChange={v => { setRho(v); setResult(null) }} unit="g/L" />
        <FieldBox label="M — Molar mass" value={M} onChange={v => { setM(v); setResult(null) }} unit="g/mol" />
        <FieldBox
          label="T — Temperature" value={T} onChange={v => { setT(v); setResult(null) }}
          unitNode={
            <UnitPill options={['K', 'C']} active={tUnit} onChange={v => { setTUnit(v as TUnit); setResult(null) }} />
          }
        />
        <FieldBox
          label="P — Pressure" value={P} onChange={v => { setP(v); setResult(null) }}
          unitNode={
            <UnitPill options={P_UNITS} active={pUnit} onChange={v => { setPUnit(v as PUnit); setResult(null) }} />
          }
        />
      </div>

      <div className="flex gap-2">
        <button onClick={handleCalc}
          className="px-5 py-2 rounded-sm font-sans text-sm font-medium transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
            border: '1px solid color-mix(in srgb, var(--c-halogen) 35%, transparent)',
            color: 'var(--c-halogen)',
          }}>Calculate →</button>
        {(hasAny || result) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>

      {error && <p className="font-sans text-sm text-red-400">{error}</p>}

      <AnimatePresence mode="wait">
        {result && (
          <motion.div key={result.solveFor}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
            className="flex flex-col gap-4 rounded-sm border bg-surface p-5"
            style={{ borderColor: `color-mix(in srgb, ${color} 30%, transparent)` }}
          >
            <span className="font-mono text-2xl font-bold" style={{ color }}>
              {result.solveFor === 'rho' ? 'ρ' : result.solveFor} = {result.value}{' '}
              <span className="font-mono text-base font-normal text-secondary">{result.unit}</span>
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">Steps</span>
              <div className="flex flex-col gap-0.5 pl-3 border-l-2 border-border">
                {result.steps.map((s, i) => (
                  <p key={i} className={`font-mono text-sm ${i === result.steps.length - 1 ? 'font-semibold text-emerald-400' : 'text-primary'}`}>
                    {i === result.steps.length - 1 ? '∴ ' : ''}{s}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="font-mono text-xs text-secondary">
        R = {R} L·atm/(mol·K). Density in g/L, molar mass in g/mol. T must be above 0 K.
      </p>
    </div>
  )
}
