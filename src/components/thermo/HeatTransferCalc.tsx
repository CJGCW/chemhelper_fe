import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pick, randBetween, roundTo } from '../calculations/WorkedExample'
import { useStepsPanelState, StepsTrigger, StepsContent } from '../calculations/StepsPanel'

// ── Example generators ────────────────────────────────────────────────────────

const HT_METALS = [
  { name: 'copper', c: 0.385 }, { name: 'iron', c: 0.449 },
  { name: 'aluminum', c: 0.897 }, { name: 'silver', c: 0.235 }, { name: 'gold', c: 0.129 },
]

function generateFindTfExample() {
  const metal = pick(HT_METALS)
  const m1 = roundTo(randBetween(50, 200), 0)
  const T1 = roundTo(randBetween(80, 160), 0)
  const m2 = roundTo(randBetween(100, 400), 0)
  const T2 = roundTo(randBetween(15, 30), 0)
  const mc1 = m1 * metal.c, mc2 = m2 * 4.184
  const Tf = (mc1 * T1 + mc2 * T2) / (mc1 + mc2)
  return {
    scenario: `${m1} g of ${metal.name} (c = ${metal.c} J/g·°C) at ${T1} °C is dropped into ${m2} g of water (c = 4.184 J/g·°C) at ${T2} °C. Find T_final.`,
    steps: [
      `q₁ + q₂ = 0  →  m₁c₁(Tf − T₁) + m₂c₂(Tf − T₂) = 0`,
      `${fmtNum(mc1)}(Tf − ${T1}) + ${fmtNum(mc2)}(Tf − ${T2}) = 0`,
      `${fmtNum(mc1 + mc2)}·Tf = ${fmtNum(mc1 * T1 + mc2 * T2)}`,
      `Tf = ${fmtNum(Tf)} °C`,
    ],
    result: `Tf = ${fmtNum(Tf)} °C`,
  }
}

function generateFindTiExample() {
  const metal = pick(HT_METALS)
  const m1 = roundTo(randBetween(50, 200), 0)
  const m2 = roundTo(randBetween(100, 400), 0)
  const T2 = roundTo(randBetween(15, 25), 0)
  const Tf = roundTo(randBetween(T2 + 3, T2 + 25), 1)
  const mc1 = m1 * metal.c, mc2 = m2 * 4.184
  const q2 = mc2 * (Tf - T2)
  const T1 = Tf + q2 / mc1
  return {
    scenario: `${m1} g of ${metal.name} (c = ${metal.c}) is dropped into ${m2} g of water (c = 4.184) at ${T2} °C. Equilibrium reached at ${Tf} °C. Find T_initial of the metal.`,
    steps: [
      `m₁c₁(Tf − T₁) = −m₂c₂(Tf − T₂)`,
      `${fmtNum(mc1)}(${Tf} − T₁) = −${fmtNum(mc2)}(${Tf} − ${T2})`,
      `${fmtNum(mc1)}(${Tf} − T₁) = ${fmtNum(-q2)}`,
      `T₁ = ${Tf} + ${fmtNum(q2 / mc1)} = ${fmtNum(T1)} °C`,
    ],
    result: `T₁ = ${fmtNum(T1)} °C`,
  }
}

function generateFindMassExample() {
  const metal = pick(HT_METALS)
  const m1 = roundTo(randBetween(100, 300), 0)
  const T1 = roundTo(randBetween(80, 160), 0)
  const T2 = roundTo(randBetween(15, 25), 0)
  const Tf = roundTo(randBetween(T2 + 2, T2 + 15), 1)
  const mc1 = m1 * metal.c
  const q1  = mc1 * (Tf - T1)
  const m2  = -q1 / (4.184 * (Tf - T2))
  return {
    scenario: `${m1} g of ${metal.name} (c = ${metal.c}) at ${T1} °C is mixed with water (c = 4.184) at ${T2} °C. Final temperature is ${Tf} °C. Find the mass of water.`,
    steps: [
      `m₁c₁(Tf − T₁) + m₂c₂(Tf − T₂) = 0`,
      `m₂ = −m₁c₁(Tf − T₁) / [c₂(Tf − T₂)]`,
      `m₂ = −(${m1})(${metal.c})(${Tf} − ${T1}) / [(4.184)(${Tf} − ${T2})]`,
      `m₂ = ${fmtNum(m2)} g`,
    ],
    result: `m₂ = ${fmtNum(m2)} g`,
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode = 'find_tf' | 'find_ti' | 'find_mass'

const MODES: { id: Mode; label: string; formula: string }[] = [
  { id: 'find_tf',   label: 'Find T_final',   formula: 'Tf'  },
  { id: 'find_ti',   label: 'Find T_initial', formula: 'Ti'  },
  { id: 'find_mass', label: 'Find Mass',       formula: 'm'   },
]

const SPECIFIC_HEATS = [
  { label: 'Custom',     c: ''      },
  { label: 'Water (l)',  c: '4.184' },
  { label: 'Water (s)',  c: '2.09'  },
  { label: 'Aluminum',   c: '0.897' },
  { label: 'Copper',     c: '0.385' },
  { label: 'Iron',       c: '0.449' },
  { label: 'Lead',       c: '0.128' },
  { label: 'Silver',     c: '0.235' },
  { label: 'Gold',       c: '0.129' },
  { label: 'Ethanol',    c: '2.44'  },
  { label: 'Glass',      c: '0.84'  },
]

// ── Shared helpers ────────────────────────────────────────────────────────────

function parse(s: string): number { return parseFloat(s) }
function ok(n: number): boolean   { return isFinite(n) && !isNaN(n) }

function fmtNum(n: number): string {
  return parseFloat(n.toPrecision(6)).toString()
}

const labelCls = 'font-mono text-xs text-secondary tracking-widest uppercase'

function NumberInput({
  label, value, onChange, unit = '', placeholder = '',
}: {
  label: string; value: string; onChange: (v: string) => void
  unit?: string; placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelCls}>{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="number" value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-raised border border-border rounded-sm px-3 py-1.5 font-mono text-sm
                     text-primary focus:outline-none focus:border-muted placeholder:text-dim"
        />
        {unit && <span className="font-mono text-xs text-secondary shrink-0">{unit}</span>}
      </div>
    </div>
  )
}

function SpecificHeatField({
  value, preset, onValueChange, onPresetChange,
}: {
  value: string; preset: string
  onValueChange: (v: string) => void; onPresetChange: (p: string, c: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelCls}>Specific Heat c</label>
      <div className="flex gap-1.5">
        <select
          value={preset}
          onChange={e => {
            const found = SPECIFIC_HEATS.find(s => s.label === e.target.value)
            onPresetChange(e.target.value, found?.c ?? '')
          }}
          className="bg-raised border border-border rounded-sm px-2 py-1.5 font-mono text-xs
                     text-primary focus:outline-none focus:border-muted cursor-pointer"
        >
          {SPECIFIC_HEATS.map(s => <option key={s.label}>{s.label}</option>)}
        </select>
        <input
          type="number" value={value}
          onChange={e => onValueChange(e.target.value)}
          className="flex-1 bg-raised border border-border rounded-sm px-3 py-1.5 font-mono text-sm
                     text-primary focus:outline-none focus:border-muted"
        />
        <span className="font-mono text-xs text-secondary self-center shrink-0">J/(g·°C)</span>
      </div>
    </div>
  )
}

function SolveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="shrink-0 py-2 px-5 rounded-sm font-sans font-medium text-sm transition-all"
      style={{
        background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
        border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
        color: 'var(--c-halogen)',
      }}>
      Calculate
    </button>
  )
}

function ResultPanel({
  label, value, unit, steps,
}: {
  label: string; value: string; unit: string; steps: string[]
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 rounded-sm border border-border bg-surface p-4">
      <div className="flex items-baseline gap-2">
        <span className={labelCls}>{label}</span>
        <span className="font-mono text-2xl font-bold text-bright">{value}</span>
        <span className="font-mono text-sm text-secondary">{unit}</span>
      </div>
      {steps.length > 0 && (
        <div className="border-t border-border pt-3">
          <pre className="font-mono text-xs text-secondary whitespace-pre-wrap leading-relaxed">
            {steps.join('\n')}
          </pre>
        </div>
      )}
    </motion.div>
  )
}

function ErrorMsg({ msg }: { msg: string }) {
  return <p className="font-mono text-xs text-red-400">{msg}</p>
}

function ObjectCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-sm border border-border bg-surface p-4">
      <span className="font-mono text-xs font-semibold text-secondary tracking-widest uppercase">{title}</span>
      {children}
    </div>
  )
}

// ── Mode: Find T_final ────────────────────────────────────────────────────────

function FindTf() {
  const [m1, setM1] = useState(''); const [c1, setC1] = useState(''); const [p1, setP1] = useState('Custom'); const [T1, setT1] = useState('')
  const [m2, setM2] = useState(''); const [c2, setC2] = useState(''); const [p2, setP2] = useState('Custom'); const [T2, setT2] = useState('')
  const [result, setResult] = useState<{ value: string; steps: string[] } | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const [noSteps] = useState<string[]>([])
  const stepsState = useStepsPanelState(noSteps, generateFindTfExample)

  function handleClear() {
    setM1(''); setC1(''); setP1('Custom'); setT1('')
    setM2(''); setC2(''); setP2('Custom'); setT2('')
    setResult(null); setError(null)
  }

  function calculate() {
    setResult(null); setError(null)
    const nm1 = parse(m1), nc1 = parse(c1), nT1 = parse(T1)
    const nm2 = parse(m2), nc2 = parse(c2), nT2 = parse(T2)
    if (!ok(nm1) || !ok(nc1) || !ok(nT1)) { setError('Check Object 1 inputs.'); return }
    if (!ok(nm2) || !ok(nc2) || !ok(nT2)) { setError('Check Object 2 inputs.'); return }
    const mc1 = nm1 * nc1, mc2 = nm2 * nc2
    const Tf = (mc1 * nT1 + mc2 * nT2) / (mc1 + mc2)
    const steps = [
      'q_gained + q_lost = 0',
      'm₁c₁(Tf − T₁) + m₂c₂(Tf − T₂) = 0',
      `(${nm1})(${nc1})(Tf − ${nT1}) + (${nm2})(${nc2})(Tf − ${nT2}) = 0`,
      `${fmtNum(mc1)}(Tf − ${nT1}) + ${fmtNum(mc2)}(Tf − ${nT2}) = 0`,
      `${fmtNum(mc1 + mc2)}·Tf = ${fmtNum(mc1*nT1 + mc2*nT2)}`,
      `Tf = ${fmtNum(mc1*nT1 + mc2*nT2)} / ${fmtNum(mc1 + mc2)}`,
      `Tf = ${fmtNum(Tf)} °C`,
    ]
    setResult({ value: fmtNum(Tf), steps })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ObjectCard title="Object 1 (hot)">
          <NumberInput label="Mass (m₁)" value={m1} onChange={setM1} unit="g" />
          <SpecificHeatField value={c1} preset={p1}
            onValueChange={setC1}
            onPresetChange={(p, c) => { setP1(p); if (c) setC1(c) }} />
          <NumberInput label="Initial Temp (T₁)" value={T1} onChange={setT1} unit="°C" />
        </ObjectCard>
        <ObjectCard title="Object 2 (cold)">
          <NumberInput label="Mass (m₂)" value={m2} onChange={setM2} unit="g" />
          <SpecificHeatField value={c2} preset={p2}
            onValueChange={setC2}
            onPresetChange={(p, c) => { setP2(p); if (c) setC2(c) }} />
          <NumberInput label="Initial Temp (T₂)" value={T2} onChange={setT2} unit="°C" />
        </ObjectCard>
      </div>
      <div className="flex items-stretch gap-2">
        <SolveBtn onClick={calculate} />
        <StepsTrigger {...stepsState} />
        {(m1 || c1 || T1 || m2 || c2 || T2 || result) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>
      <StepsContent {...stepsState} />
      {error  && <ErrorMsg msg={error} />}
      {result && <ResultPanel label="Final Temperature" value={result.value} unit="°C" steps={result.steps} />}
    </div>
  )
}

// ── Mode: Find T_initial ──────────────────────────────────────────────────────

function FindTi() {
  const [m1, setM1] = useState(''); const [c1, setC1] = useState(''); const [p1, setP1] = useState('Custom')
  const [m2, setM2] = useState(''); const [c2, setC2] = useState(''); const [p2, setP2] = useState('Custom'); const [T2, setT2] = useState('')
  const [Tf, setTf] = useState('')
  const [result, setResult] = useState<{ value: string; steps: string[] } | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const [noSteps] = useState<string[]>([])
  const stepsState = useStepsPanelState(noSteps, generateFindTiExample)

  function handleClear() {
    setM1(''); setC1(''); setP1('Custom')
    setM2(''); setC2(''); setP2('Custom'); setT2('')
    setTf(''); setResult(null); setError(null)
  }

  function calculate() {
    setResult(null); setError(null)
    const nm1 = parse(m1), nc1 = parse(c1)
    const nm2 = parse(m2), nc2 = parse(c2), nT2 = parse(T2), nTf = parse(Tf)
    if (!ok(nm1) || !ok(nc1)) { setError('Check Object 1 inputs.'); return }
    if (!ok(nm2) || !ok(nc2) || !ok(nT2)) { setError('Check Object 2 inputs.'); return }
    if (!ok(nTf)) { setError('Enter a valid final temperature.'); return }
    const mc1 = nm1 * nc1, mc2 = nm2 * nc2
    const q2 = mc2 * (nTf - nT2)
    const T1 = nTf + q2 / mc1  // rearranged from mc1*(Tf-T1) = -q2
    const steps = [
      'm_hot · c_hot · (Tf − T₁) = −m_cold · c_cold · (Tf − T₂)',
      `(${nm1})(${nc1})(${nTf} − T₁) = −(${nm2})(${nc2})(${nTf} − ${nT2})`,
      `${fmtNum(mc1)}(${nTf} − T₁) = ${fmtNum(-q2)}`,
      `${nTf} − T₁ = ${fmtNum(-q2 / mc1)}`,
      `T₁ = ${nTf} + ${fmtNum(q2 / mc1)}`,
      `T₁ = ${fmtNum(T1)} °C`,
    ]
    setResult({ value: fmtNum(T1), steps })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ObjectCard title="Object 1 — T_initial unknown">
          <NumberInput label="Mass (m₁)" value={m1} onChange={setM1} unit="g" />
          <SpecificHeatField value={c1} preset={p1}
            onValueChange={setC1}
            onPresetChange={(p, c) => { setP1(p); if (c) setC1(c) }} />
        </ObjectCard>
        <ObjectCard title="Object 2 — T_initial known">
          <NumberInput label="Mass (m₂)" value={m2} onChange={setM2} unit="g" />
          <SpecificHeatField value={c2} preset={p2}
            onValueChange={setC2}
            onPresetChange={(p, c) => { setP2(p); if (c) setC2(c) }} />
          <NumberInput label="Initial Temp (T₂)" value={T2} onChange={setT2} unit="°C" />
        </ObjectCard>
      </div>
      <NumberInput label="Final (Equilibrium) Temperature" value={Tf} onChange={setTf} unit="°C" />
      <div className="flex items-stretch gap-2">
        <SolveBtn onClick={calculate} />
        <StepsTrigger {...stepsState} />
        {(m1 || c1 || m2 || c2 || T2 || Tf || result) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>
      <StepsContent {...stepsState} />
      {error  && <ErrorMsg msg={error} />}
      {result && <ResultPanel label="Initial Temp of Object 1" value={result.value} unit="°C" steps={result.steps} />}
    </div>
  )
}

// ── Mode: Find Mass ───────────────────────────────────────────────────────────

function FindMass() {
  const [m1, setM1] = useState(''); const [c1, setC1] = useState(''); const [p1, setP1] = useState('Custom'); const [T1, setT1] = useState('')
  const [c2, setC2] = useState(''); const [p2, setP2] = useState('Custom'); const [T2, setT2] = useState('')
  const [Tf, setTf] = useState('')
  const [result, setResult] = useState<{ value: string; steps: string[] } | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const [noSteps] = useState<string[]>([])
  const stepsState = useStepsPanelState(noSteps, generateFindMassExample)

  function handleClear() {
    setM1(''); setC1(''); setP1('Custom'); setT1('')
    setC2(''); setP2('Custom'); setT2('')
    setTf(''); setResult(null); setError(null)
  }

  function calculate() {
    setResult(null); setError(null)
    const nm1 = parse(m1), nc1 = parse(c1), nT1 = parse(T1)
    const nc2 = parse(c2), nT2 = parse(T2), nTf = parse(Tf)
    if (!ok(nm1) || !ok(nc1) || !ok(nT1)) { setError('Check Object 1 inputs.'); return }
    if (!ok(nc2) || !ok(nT2)) { setError('Check Object 2 inputs.'); return }
    if (!ok(nTf)) { setError('Enter a valid final temperature.'); return }
    if (Math.abs(nTf - nT2) < 0.001) { setError('Tf and T₂ are too close; mass would be infinite.'); return }
    const mc1 = nm1 * nc1
    const q1 = mc1 * (nTf - nT1)
    const m2 = -q1 / (nc2 * (nTf - nT2))
    if (m2 <= 0) { setError('Result is non-physical. Check that Tf is between the two initial temperatures.'); return }
    const steps = [
      'm₁c₁(Tf − T₁) + m₂c₂(Tf − T₂) = 0',
      `m₂ = −m₁c₁(Tf − T₁) / [c₂(Tf − T₂)]`,
      `m₂ = −(${nm1})(${nc1})(${nTf} − ${nT1}) / [(${nc2})(${nTf} − ${nT2})]`,
      `m₂ = ${fmtNum(-q1)} / ${fmtNum(nc2*(nTf-nT2))}`,
      `m₂ = ${fmtNum(m2)} g`,
    ]
    setResult({ value: fmtNum(m2), steps })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ObjectCard title="Object 1 — mass known">
          <NumberInput label="Mass (m₁)" value={m1} onChange={setM1} unit="g" />
          <SpecificHeatField value={c1} preset={p1}
            onValueChange={setC1}
            onPresetChange={(p, c) => { setP1(p); if (c) setC1(c) }} />
          <NumberInput label="Initial Temp (T₁)" value={T1} onChange={setT1} unit="°C" />
        </ObjectCard>
        <ObjectCard title="Object 2 — mass unknown">
          <SpecificHeatField value={c2} preset={p2}
            onValueChange={setC2}
            onPresetChange={(p, c) => { setP2(p); if (c) setC2(c) }} />
          <NumberInput label="Initial Temp (T₂)" value={T2} onChange={setT2} unit="°C" />
        </ObjectCard>
      </div>
      <NumberInput label="Final (Equilibrium) Temperature" value={Tf} onChange={setTf} unit="°C" />
      <div className="flex items-stretch gap-2">
        <SolveBtn onClick={calculate} />
        <StepsTrigger {...stepsState} />
        {(m1 || c1 || T1 || c2 || T2 || Tf || result) && (
          <button onClick={handleClear}
            className="px-4 py-2 rounded-sm font-sans text-sm border border-border text-secondary hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>
      <StepsContent {...stepsState} />
      {error  && <ErrorMsg msg={error} />}
      {result && <ResultPanel label="Mass of Object 2" value={result.value} unit="g" steps={result.steps} />}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HeatTransferCalc() {
  const [mode, setMode] = useState<Mode>('find_tf')

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Formula banner */}
      <div className="rounded-sm border border-border bg-surface px-5 py-4 flex flex-col gap-2">
        <p className="font-mono text-xl text-bright">q<sub>gained</sub> = −q<sub>lost</sub></p>
        <p className="font-mono text-sm text-secondary">
          m₁c₁(T_f − T₁) + m₂c₂(T_f − T₂) = 0
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex items-center gap-1 p-1 rounded-full self-start"
        style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
        {MODES.map(m => {
          const active = mode === m.id
          return (
            <button key={m.id} onClick={() => setMode(m.id)}
              className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors"
              style={{ color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
              {active && (
                <motion.div layoutId="ht-mode-switch" className="absolute inset-0 rounded-full"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
              <span className="relative z-10">{m.label}</span>
            </button>
          )
        })}
      </div>

      {/* Active mode */}
      <AnimatePresence mode="wait">
        <motion.div key={mode}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
          {mode === 'find_tf'   && <FindTf />}
          {mode === 'find_ti'   && <FindTi />}
          {mode === 'find_mass' && <FindMass />}
        </motion.div>
      </AnimatePresence>
      <p className="font-mono text-xs text-secondary">q = mcΔT · q_hot = −q_cold at thermal equilibrium · c_water = 4.184 J/(g·°C)</p>
    </div>
  )
}
