import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AnalysisStep {
  numValue: string
  numUnit: string
  numCancelled: boolean
  denValue: string
  denUnit: string
  denCancelled: boolean
  note: string
}

interface StartBlock {
  value: string
  numUnit: string
  numCancelled: boolean
  denUnit?: string
  denCancelled?: boolean
}

interface AnalysisData {
  start: StartBlock
  steps: AnalysisStep[]
  resultValue: string
  resultNumUnit: string
  resultDenUnit?: string
}

// ── Number formatting ─────────────────────────────────────────────────────────

const SUP_MAP: Record<string, string> = {
  '-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
}
function toSup(n: number): string {
  return String(n).split('').map(c => SUP_MAP[c] ?? c).join('')
}

export function fmtNum(n: number, precision = 4): string {
  if (!isFinite(n) || isNaN(n)) return '—'
  const abs = Math.abs(n)
  if (abs === 0) return '0'
  if (abs >= 1e6 || (abs < 0.001)) {
    const exp = Math.floor(Math.log10(abs))
    const coeff = parseFloat((n / Math.pow(10, exp)).toPrecision(precision))
    return `${coeff} × 10${toSup(exp)}`
  }
  return parseFloat(n.toPrecision(precision)).toString()
}

// ── Common elements for molar mass quick-pick ─────────────────────────────────

const QUICK_ELEMENTS = [
  { symbol: 'H',  molarMass: 1.008   },
  { symbol: 'C',  molarMass: 12.011  },
  { symbol: 'N',  molarMass: 14.007  },
  { symbol: 'O',  molarMass: 15.999  },
  { symbol: 'Na', molarMass: 22.990  },
  { symbol: 'Mg', molarMass: 24.305  },
  { symbol: 'Al', molarMass: 26.982  },
  { symbol: 'S',  molarMass: 32.06   },
  { symbol: 'Cl', molarMass: 35.45   },
  { symbol: 'K',  molarMass: 39.098  },
  { symbol: 'Ca', molarMass: 40.078  },
  { symbol: 'Fe', molarMass: 55.845  },
  { symbol: 'Cu', molarMass: 63.546  },
  { symbol: 'Zn', molarMass: 65.38   },
  { symbol: 'Ag', molarMass: 107.868 },
  { symbol: 'Au', molarMass: 196.967 },
]

// ── Analysis builders ─────────────────────────────────────────────────────────

export function buildMassToMol(massStr: string, mStr: string): AnalysisData | null {
  const mass = parseFloat(massStr), M = parseFloat(mStr)
  if (isNaN(mass) || isNaN(M) || M <= 0) return null
  return {
    start: { value: fmtNum(mass, 5), numUnit: 'g', numCancelled: true },
    steps: [{
      numValue: '1', numUnit: 'mol', numCancelled: false,
      denValue: fmtNum(M, 6), denUnit: 'g', denCancelled: true,
      note: 'molar mass',
    }],
    resultValue: fmtNum(mass / M), resultNumUnit: 'mol',
  }
}

export function buildMolToMass(molStr: string, mStr: string): AnalysisData | null {
  const mol = parseFloat(molStr), M = parseFloat(mStr)
  if (isNaN(mol) || isNaN(M) || M <= 0) return null
  return {
    start: { value: fmtNum(mol, 5), numUnit: 'mol', numCancelled: true },
    steps: [{
      numValue: fmtNum(M, 6), numUnit: 'g', numCancelled: false,
      denValue: '1', denUnit: 'mol', denCancelled: true,
      note: 'molar mass',
    }],
    resultValue: fmtNum(mol * M), resultNumUnit: 'g',
  }
}

export function buildMolToParticles(molStr: string): AnalysisData | null {
  const mol = parseFloat(molStr)
  if (isNaN(mol)) return null
  return {
    start: { value: fmtNum(mol, 5), numUnit: 'mol', numCancelled: true },
    steps: [{
      numValue: '6.022 × 10²³', numUnit: 'particles', numCancelled: false,
      denValue: '1', denUnit: 'mol', denCancelled: true,
      note: 'Avogadro\'s number',
    }],
    resultValue: fmtNum(mol * 6.02214076e23), resultNumUnit: 'particles',
  }
}

export function buildParticlesToMol(pStr: string): AnalysisData | null {
  const p = parseFloat(pStr)
  if (isNaN(p)) return null
  return {
    start: { value: fmtNum(p, 5), numUnit: 'particles', numCancelled: true },
    steps: [{
      numValue: '1', numUnit: 'mol', numCancelled: false,
      denValue: '6.022 × 10²³', denUnit: 'particles', denCancelled: true,
      note: 'Avogadro\'s number',
    }],
    resultValue: fmtNum(p / 6.02214076e23), resultNumUnit: 'mol',
  }
}

export function buildKmhToMs(speedStr: string): AnalysisData | null {
  const speed = parseFloat(speedStr)
  if (isNaN(speed)) return null
  return {
    start: { value: fmtNum(speed, 5), numUnit: 'km', numCancelled: true, denUnit: 'h', denCancelled: true },
    steps: [
      {
        numValue: '1000', numUnit: 'm', numCancelled: false,
        denValue: '1', denUnit: 'km', denCancelled: true,
        note: '1 km = 1000 m',
      },
      {
        numValue: '1', numUnit: 'h', numCancelled: true,
        denValue: '3600', denUnit: 's', denCancelled: false,
        note: '1 h = 3600 s',
      },
    ],
    resultValue: fmtNum(speed * 1000 / 3600),
    resultNumUnit: 'm', resultDenUnit: 's',
  }
}

export function buildMgToKg(mgStr: string): AnalysisData | null {
  const mg = parseFloat(mgStr)
  if (isNaN(mg)) return null
  return {
    start: { value: fmtNum(mg, 5), numUnit: 'mg', numCancelled: true },
    steps: [
      {
        numValue: '1', numUnit: 'g', numCancelled: true,
        denValue: '1000', denUnit: 'mg', denCancelled: true,
        note: '1 g = 1000 mg',
      },
      {
        numValue: '1', numUnit: 'kg', numCancelled: false,
        denValue: '1000', denUnit: 'g', denCancelled: true,
        note: '1 kg = 1000 g',
      },
    ],
    resultValue: fmtNum(mg / 1e6), resultNumUnit: 'kg',
  }
}

// ── Pathway config ────────────────────────────────────────────────────────────

type PathwayId = 'mass-mol' | 'mol-mass' | 'mol-part' | 'part-mol' | 'kmh-ms' | 'mg-kg'

const PATHWAYS: {
  id: PathwayId; label: string; desc: string
  needsMolar: boolean; valuePlaceholder: string; valueLabel: string
}[] = [
  { id: 'mass-mol', label: 'g → mol',        desc: 'Mass to Moles',      needsMolar: true,  valuePlaceholder: 'e.g. 50',      valueLabel: 'Mass (g)'    },
  { id: 'mol-mass', label: 'mol → g',         desc: 'Moles to Mass',      needsMolar: true,  valuePlaceholder: 'e.g. 2.5',     valueLabel: 'Moles (mol)' },
  { id: 'mol-part', label: 'mol → particles', desc: 'Moles to Particles', needsMolar: false, valuePlaceholder: 'e.g. 0.5',     valueLabel: 'Moles (mol)' },
  { id: 'part-mol', label: 'particles → mol', desc: 'Particles to Moles', needsMolar: false, valuePlaceholder: 'e.g. 3.01e23', valueLabel: 'Particles'   },
  { id: 'kmh-ms',   label: 'km/h → m/s',      desc: 'Speed (multi-step)', needsMolar: false, valuePlaceholder: 'e.g. 90',      valueLabel: 'Speed (km/h)'},
  { id: 'mg-kg',    label: 'mg → kg',          desc: 'Metric (two-step)',  needsMolar: false, valuePlaceholder: 'e.g. 500',     valueLabel: 'Mass (mg)'   },
]

// ── Animation timing ──────────────────────────────────────────────────────────

const BLOCK_STAGGER = 0.13   // delay between each block appearing
const BLOCK_DUR    = 0.16   // how long a block fade-in takes
const CANCEL_DUR   = 0.20   // how long the strikethrough line takes to draw

interface CancelDelays {
  startNum: number
  startDen: number
  steps: { num: number; den: number }[]
}

function computeCancelDelays(analysis: AnalysisData): CancelDelays {
  // Cancellations start after all blocks have appeared
  const numBlocks = 1 + analysis.steps.length + 1  // start + steps + result
  const baseCancel = numBlocks * BLOCK_STAGGER + 0.25
  let ci = 0
  const next = () => baseCancel + (ci++) * 0.14

  return {
    startNum: analysis.start.numCancelled ? next() : 0,
    startDen: (!!analysis.start.denUnit && !!analysis.start.denCancelled) ? next() : 0,
    steps: analysis.steps.map(s => ({
      num: s.numCancelled ? next() : 0,
      den: s.denCancelled ? next() : 0,
    })),
  }
}

// ── AnimatedUnitTag ───────────────────────────────────────────────────────────

function AnimatedUnitTag({
  unit, cancelled, result, cancelDelay = 0,
}: {
  unit: string
  cancelled: boolean
  result?: boolean
  cancelDelay?: number
}) {
  if (!cancelled) {
    return (
      <span className="font-mono text-xs leading-none font-medium"
        style={{ color: result ? '#4ade80' : 'var(--c-halogen)' }}>
        {unit}
      </span>
    )
  }

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {/* Text fades to dim after line draws */}
      <motion.span
        className="font-mono text-xs leading-none font-medium"
        style={{ color: 'var(--c-halogen)' }}
        animate={{ opacity: 0.28 }}
        transition={{ delay: cancelDelay + CANCEL_DUR * 0.8, duration: 0.18 }}
      >
        {unit}
      </motion.span>
      {/* Strikethrough line draws from left to right */}
      <motion.div
        style={{
          position: 'absolute',
          left: 0, right: 0,
          top: '50%',
          height: '1.5px',
          background: 'rgb(var(--color-dim))',
          transformOrigin: 'left center',
        }}
        initial={{ scaleX: 0, y: '-50%' }}
        animate={{ scaleX: 1, y: '-50%' }}
        transition={{ delay: cancelDelay, duration: CANCEL_DUR, ease: 'easeOut' }}
      />
    </span>
  )
}

// ── Equation sub-components ───────────────────────────────────────────────────

function AnimatedStartValue({ block, delays }: { block: StartBlock; delays: CancelDelays }) {
  if (block.denUnit) {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="font-mono text-xl font-semibold text-primary">{block.value}</span>
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-0.5 pb-[3px]">
            <AnimatedUnitTag unit={block.numUnit} cancelled={block.numCancelled} cancelDelay={delays.startNum} />
          </div>
          <div className="w-full h-px bg-secondary opacity-40" />
          <div className="flex items-baseline gap-0.5 pt-[3px]">
            <AnimatedUnitTag unit={block.denUnit} cancelled={!!block.denCancelled} cancelDelay={delays.startDen} />
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-baseline gap-1 shrink-0">
      <span className="font-mono text-xl font-semibold text-primary">{block.value}</span>
      <AnimatedUnitTag unit={block.numUnit} cancelled={block.numCancelled} cancelDelay={delays.startNum} />
    </div>
  )
}

function AnimatedFactorFraction({
  step, delays,
}: {
  step: AnalysisStep
  delays: { num: number; den: number }
}) {
  return (
    <div className="flex flex-col items-center shrink-0" style={{ minWidth: '80px' }}>
      <div className="flex items-baseline gap-1 pb-[3px]">
        <span className="font-mono text-sm text-primary">{step.numValue}</span>
        <AnimatedUnitTag unit={step.numUnit} cancelled={step.numCancelled} cancelDelay={delays.num} />
      </div>
      <div className="w-full h-px bg-secondary opacity-30" />
      <div className="flex items-baseline gap-1 pt-[3px]">
        <span className="font-mono text-sm text-primary">{step.denValue}</span>
        <AnimatedUnitTag unit={step.denUnit} cancelled={step.denCancelled} cancelDelay={delays.den} />
      </div>
      <span className="font-mono text-xs text-secondary mt-1.5 text-center whitespace-nowrap">{step.note}</span>
    </div>
  )
}

function ResultValue({ value, numUnit, denUnit }: { value: string; numUnit: string; denUnit?: string }) {
  return (
    <div className="flex flex-col items-center shrink-0">
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-xl font-bold" style={{ color: '#4ade80' }}>{value}</span>
        {!denUnit && <AnimatedUnitTag unit={numUnit} cancelled={false} result />}
        {denUnit && (
          <div className="flex flex-col items-center">
            <div className="flex items-baseline pb-[3px]">
              <AnimatedUnitTag unit={numUnit} cancelled={false} result />
            </div>
            <div className="w-full h-px" style={{ background: 'rgba(74,222,128,0.4)' }} />
            <div className="flex items-baseline pt-[3px]">
              <AnimatedUnitTag unit={denUnit} cancelled={false} result />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ConversionExamples() {
  const [pathway, setPathway] = useState<PathwayId>('mass-mol')
  const [value, setValue] = useState('')
  const [molarMass, setMolarMass] = useState('')

  const pw = PATHWAYS.find(p => p.id === pathway)!

  function compute(): AnalysisData | null {
    if (!value.trim()) return null
    switch (pathway) {
      case 'mass-mol': return buildMassToMol(value, molarMass)
      case 'mol-mass': return buildMolToMass(value, molarMass)
      case 'mol-part': return buildMolToParticles(value)
      case 'part-mol': return buildParticlesToMol(value)
      case 'kmh-ms':   return buildKmhToMs(value)
      case 'mg-kg':    return buildMgToKg(value)
    }
  }

  const analysis = compute()
  const cancelDelays = analysis ? computeCancelDelays(analysis) : null

  // Delay at which all blocks are visible (used to time legend + step text)
  const equationDoneDelay = analysis
    ? (1 + analysis.steps.length + 1) * BLOCK_STAGGER + BLOCK_DUR
    : 0

  return (
    <div className="flex flex-col gap-5 p-4 rounded-sm border border-border" style={{ background: 'rgb(var(--color-surface))' }}>
      <div className="flex flex-col gap-1">
        <p className="font-sans text-sm font-semibold text-primary tracking-wide uppercase">
          Conversion Examples
        </p>
        <p className="font-sans text-xs text-secondary">
          Multiply by conversion factors so units cancel, leaving only the target unit.
        </p>
      </div>

      {/* Pathway selector */}
      <div className="flex flex-wrap gap-2">
        {PATHWAYS.map(p => {
          const active = pathway === p.id
          return (
            <button key={p.id}
              onClick={() => { setPathway(p.id); setValue(''); setMolarMass('') }}
              className="flex flex-col gap-0.5 px-3 py-1.5 rounded-sm border text-left transition-all"
              style={{
                borderColor: active ? 'color-mix(in srgb, var(--c-halogen) 50%, transparent)' : 'rgba(var(--overlay),0.08)',
                background:  active ? 'color-mix(in srgb, var(--c-halogen) 10%, transparent)' : 'transparent',
              }}
            >
              <span className="font-mono text-xs"
                style={{ color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.5)' }}>
                {p.label}
              </span>
              <span className="font-sans text-[10px]"
                style={{ color: active ? 'rgba(var(--overlay),0.45)' : 'rgba(var(--overlay),0.22)' }}>
                {p.desc}
              </span>
            </button>
          )
        })}
      </div>

      {/* Inputs */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[130px]">
          <label className="font-mono text-xs text-secondary">{pw.valueLabel.toUpperCase()}</label>
          <input
            type="text" inputMode="decimal"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={pw.valuePlaceholder}
            className="font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2
                       text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
          />
        </div>

        {pw.needsMolar && (
          <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
            <label className="font-mono text-xs text-secondary">MOLAR MASS (g/mol)</label>
            <input
              type="text" inputMode="decimal"
              value={molarMass}
              onChange={e => setMolarMass(e.target.value)}
              placeholder="e.g. 55.845"
              className="font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2
                         text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
            />
            <div className="flex flex-wrap gap-1">
              {QUICK_ELEMENTS.map(el => {
                const active = molarMass === String(el.molarMass)
                return (
                  <button key={el.symbol}
                    onClick={() => setMolarMass(String(el.molarMass))}
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm border transition-colors"
                    style={{
                      borderColor: active ? 'color-mix(in srgb, var(--c-halogen) 50%, transparent)' : 'rgba(var(--overlay),0.1)',
                      color:       active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)',
                      background:  active ? 'color-mix(in srgb, var(--c-halogen) 10%, transparent)' : 'transparent',
                    }}
                  >
                    {el.symbol}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Equation + steps */}
      <AnimatePresence mode="wait">
        {analysis && cancelDelays ? (
          <motion.div key={`${pathway}-${value}-${molarMass}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="flex flex-col gap-4"
          >
            {/* ── Equation display ── */}
            <div className="rounded-sm border border-border overflow-x-auto"
              style={{ background: 'rgb(var(--color-base))' }}>
              <div className="flex items-center gap-5 px-5 py-5 min-w-max">

                {/* Start block */}
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0, duration: BLOCK_DUR, ease: 'easeOut' }}
                >
                  <AnimatedStartValue block={analysis.start} delays={cancelDelays} />
                </motion.div>

                {/* Conversion factor fractions */}
                {analysis.steps.map((step, i) => (
                  <motion.div key={i} className="flex items-center gap-5"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (i + 1) * BLOCK_STAGGER, duration: BLOCK_DUR, ease: 'easeOut' }}
                  >
                    <span className="font-mono text-lg text-dim select-none">×</span>
                    <AnimatedFactorFraction step={step} delays={cancelDelays.steps[i]} />
                  </motion.div>
                ))}

                {/* = and result */}
                <motion.div className="flex items-center gap-5"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (analysis.steps.length + 1) * BLOCK_STAGGER, duration: BLOCK_DUR, ease: 'easeOut' }}
                >
                  <span className="font-mono text-lg text-dim select-none">=</span>
                  <ResultValue
                    value={analysis.resultValue}
                    numUnit={analysis.resultNumUnit}
                    denUnit={analysis.resultDenUnit}
                  />
                </motion.div>

              </div>
            </div>

            {/* Color legend */}
            <motion.div
              className="flex items-center gap-4 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: equationDoneDelay }}
            >
              <span className="font-mono text-xs text-secondary tracking-wider">KEY</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>unit</span>
                <span className="font-sans text-xs text-secondary">— carries forward</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs" style={{ color: 'rgb(var(--color-dim))', textDecoration: 'line-through' }}>unit</span>
                <span className="font-sans text-xs text-secondary">— cancelled</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs" style={{ color: '#4ade80' }}>unit</span>
                <span className="font-sans text-xs text-secondary">— result</span>
              </div>
            </motion.div>

            {/* Step-by-step text */}
            <div className="flex flex-col gap-2 border-t border-border pt-3">
              {analysis.steps.map((step, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i + 1) * BLOCK_STAGGER + 0.1, duration: 0.18 }}
                  className="flex items-start gap-2.5"
                >
                  <span className="font-mono text-xs text-secondary shrink-0 mt-[2px] w-10">Step {i + 1}</span>
                  <p className="font-sans text-xs text-secondary leading-relaxed">
                    Multiply by{' '}
                    <span className="font-mono text-primary">
                      {step.numValue} {step.numUnit} / {step.denValue} {step.denUnit}
                    </span>
                    {step.note && <> ({step.note})</>}.{' '}
                    The <span className="font-mono" style={{ color: 'rgb(var(--color-dim))', textDecoration: 'line-through' }}>{step.denUnit}</span> cancels.
                  </p>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (analysis.steps.length + 1) * BLOCK_STAGGER + 0.1, duration: 0.18 }}
                className="flex items-start gap-2.5 pt-1"
              >
                <span className="font-mono text-[10px] shrink-0 mt-[2px] w-10" style={{ color: '#4ade80' }}>Result</span>
                <p className="font-mono text-sm font-semibold" style={{ color: '#4ade80' }}>
                  {analysis.resultValue}{' '}
                  {analysis.resultNumUnit}{analysis.resultDenUnit ? `/${analysis.resultDenUnit}` : ''}
                </p>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.p key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="font-sans text-xs text-dim"
          >
            {pw.needsMolar
              ? 'Enter a value and select or type a molar mass to see the breakdown.'
              : 'Enter a value above to see the step-by-step unit cancellation.'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
