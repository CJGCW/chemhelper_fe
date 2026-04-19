import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VDW_GASES } from '../../utils/vanDerWaalsPractice'
import VanDerWaalsCalc from './VanDerWaalsCalc'

function SectionHead({ label }: { label: string }) {
  return <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">{label}</h3>
}

function ReferenceContent() {
  return (
    <div className="flex flex-col gap-6">

      {/* Formula box */}
      <div className="rounded-sm border border-border bg-raised px-6 py-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-2xl font-bold text-bright">(P + a(n/V)²)(V − nb) = nRT</p>
          <p className="font-mono text-lg text-secondary">P = nRT / (V − nb) − a(n/V)²</p>
        </div>
        <p className="font-sans text-sm text-secondary">
          Corrects the ideal gas law for real gas behaviour by accounting for
          intermolecular attractions (constant <em>a</em>) and the finite volume of gas molecules (constant <em>b</em>).
          At low pressure and high temperature, real gases approach ideal behaviour and corrections become negligible.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-sm text-bright">V − nb</span>
            <span className="font-mono text-xs text-secondary">volume correction (free space)</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-sm text-bright">a(n/V)²</span>
            <span className="font-mono text-xs text-secondary">pressure correction (attraction)</span>
          </div>
        </div>
      </div>

      {/* Variables */}
      <div className="flex flex-col gap-2">
        <SectionHead label="Variables" />
        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          {[
            { sym: 'P', name: 'Pressure',           unit: 'atm' },
            { sym: 'V', name: 'Volume',              unit: 'L' },
            { sym: 'n', name: 'Moles',               unit: 'mol' },
            { sym: 'T', name: 'Temperature',         unit: 'K' },
            { sym: 'R', name: 'Gas constant',        unit: '0.08206 L·atm / mol·K' },
            { sym: 'a', name: 'Attraction constant', unit: 'L²·atm / mol²  (larger = stronger attraction)' },
            { sym: 'b', name: 'Volume constant',     unit: 'L/mol  (excluded volume per mole)' },
          ].map(r => (
            <div key={r.sym}
              className="grid grid-cols-[2rem_auto_1fr] gap-x-4 items-baseline px-4 py-2.5 border-b border-border last:border-b-0">
              <span className="font-mono text-base font-bold" style={{ color: 'var(--c-halogen)' }}>{r.sym}</span>
              <span className="font-sans text-sm text-primary">{r.name}</span>
              <span className="font-mono text-sm text-secondary text-right">{r.unit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* When deviations occur */}
      <div className="flex flex-col gap-2">
        <SectionHead label="When Ideal Gas Law Fails" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
            <h4 className="font-sans text-sm font-semibold text-bright">High Pressure</h4>
            <p className="font-sans text-xs text-secondary">
              Molecules are close together — excluded volume becomes significant.
              The <em>b</em> correction matters most. Real pressure is typically
              <span className="font-mono text-primary"> higher</span> than ideal.
            </p>
          </div>
          <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
            <h4 className="font-sans text-sm font-semibold text-bright">Low Temperature / Polar Gases</h4>
            <p className="font-sans text-xs text-secondary">
              Molecules move slowly — intermolecular attractions reduce the effective pressure.
              The <em>a</em> correction matters most. Real pressure is typically
              <span className="font-mono text-primary"> lower</span> than ideal.
            </p>
          </div>
        </div>
      </div>

      {/* Constants table */}
      <div className="flex flex-col gap-2">
        <SectionHead label="Van der Waals Constants" />
        <div className="rounded-sm border border-border overflow-hidden" style={{ background: 'rgb(var(--color-surface))' }}>
          <div className="grid grid-cols-[3rem_1fr_5rem_5rem] px-4 py-2 bg-raised border-b border-border">
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">Gas</span>
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">Name</span>
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">a</span>
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">b</span>
          </div>
          {VDW_GASES.map(g => (
            <div key={g.formula}
              className="grid grid-cols-[3rem_1fr_5rem_5rem] px-4 py-2.5 border-b border-border last:border-b-0 bg-surface hover:bg-raised transition-colors">
              <span className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>{g.formula}</span>
              <span className="font-sans text-sm text-primary">{g.name}</span>
              <span className="font-mono text-sm text-secondary">{g.a}</span>
              <span className="font-mono text-sm text-secondary">{g.b}</span>
            </div>
          ))}
          <div className="px-4 py-2 bg-raised border-t border-border">
            <span className="font-mono text-xs text-dim">a: L²·atm/mol²  ·  b: L/mol</span>
          </div>
        </div>
      </div>

    </div>
  )
}

const EXAMPLES = [
  {
    gas: 'CO₂',
    a: 3.640,
    b: 0.04267,
    q: '2.00 mol CO₂ in 5.00 L at 300 K. Compare ideal vs real pressure.',
    steps: [
      'P(ideal) = nRT/V = (2.00 × 0.08206 × 300) / 5.00 = 9.85 atm',
      'V − nb = 5.00 − (2.00 × 0.04267) = 5.00 − 0.0853 = 4.915 L',
      'nRT/(V−nb) = (2.00 × 0.08206 × 300) / 4.915 = 10.01 atm',
      'a(n/V)² = 3.640 × (2.00/5.00)² = 3.640 × 0.160 = 0.582 atm',
      'P(real) = 10.01 − 0.582 = 9.43 atm',
    ],
    ans: 'P(ideal) = 9.85 atm · P(real) = 9.43 atm  (−4.3%)',
  },
  {
    gas: 'H₂O',
    a: 5.536,
    b: 0.03049,
    q: '1.50 mol H₂O vapour in 3.00 L at 500 K. Find the van der Waals pressure.',
    steps: [
      'P(ideal) = (1.50 × 0.08206 × 500) / 3.00 = 20.5 atm',
      'V − nb = 3.00 − (1.50 × 0.03049) = 3.00 − 0.0457 = 2.954 L',
      'nRT/(V−nb) = (1.50 × 0.08206 × 500) / 2.954 = 20.8 atm',
      'a(n/V)² = 5.536 × (1.50/3.00)² = 5.536 × 0.250 = 1.38 atm',
      'P(real) = 20.8 − 1.38 = 19.4 atm',
    ],
    ans: 'P(real) = 19.4 atm  (−5.5% vs ideal)',
  },
  {
    gas: 'He',
    a: 0.0341,
    b: 0.02370,
    q: '3.00 mol He in 2.00 L at 273 K. Why is the deviation small?',
    steps: [
      'P(ideal) = (3.00 × 0.08206 × 273) / 2.00 = 33.6 atm',
      'V − nb = 2.00 − (3.00 × 0.02370) = 2.00 − 0.0711 = 1.929 L',
      'nRT/(V−nb) = (3.00 × 0.08206 × 273) / 1.929 = 34.9 atm',
      'a(n/V)² = 0.0341 × (3.00/2.00)² = 0.0341 × 2.25 = 0.0767 atm',
      'P(real) = 34.9 − 0.077 = 34.8 atm',
    ],
    ans: 'P(real) ≈ 34.8 atm  (+3.6%) — He has tiny a & b; near-ideal behaviour',
  },
  {
    gas: 'NH₃',
    a: 4.169,
    b: 0.03707,
    q: '1.00 mol NH₃ in 1.00 L at 350 K. Expect lower real pressure?',
    steps: [
      'P(ideal) = (1.00 × 0.08206 × 350) / 1.00 = 28.7 atm',
      'V − nb = 1.00 − (1.00 × 0.03707) = 0.963 L',
      'nRT/(V−nb) = (1.00 × 0.08206 × 350) / 0.963 = 29.8 atm',
      'a(n/V)² = 4.169 × (1.00/1.00)² = 4.17 atm',
      'P(real) = 29.8 − 4.17 = 25.7 atm',
    ],
    ans: 'P(real) = 25.7 atm  (−10.5%) — strong NH₃ attraction pulls P down',
  },
]

function ExamplesContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <SectionHead label="Worked Examples" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EXAMPLES.map((ex, i) => (
            <div key={i} className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs text-secondary shrink-0">Ex {i + 1}</span>
                <p className="font-sans text-sm text-secondary">{ex.q}</p>
              </div>
              <div className="font-mono text-xs text-dim bg-raised rounded-sm px-3 py-1.5">
                {ex.gas}: a = {ex.a} L²·atm/mol²,  b = {ex.b} L/mol
              </div>
              <div className="flex flex-col gap-0.5 pl-3 border-l-2 border-border">
                {ex.steps.map((s, j) => (
                  <p key={j} className="font-mono text-sm text-primary">{s}</p>
                ))}
                <p className="font-mono text-sm font-semibold text-emerald-400 mt-0.5">∴ {ex.ans}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionHead label="Calculator" />
        <VanDerWaalsCalc />
      </div>
    </div>
  )
}

export default function VanDerWaalsReference() {
  const [pill, setPill] = useState<'reference' | 'examples'>('reference')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 p-1 rounded-sm self-start print:hidden"
        style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
        {(['reference', 'examples'] as const).map(p => (
          <button key={p} onClick={() => setPill(p)}
            className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors capitalize"
            style={{ color: pill === p ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}>
            {pill === p && (
              <motion.div layoutId="vdw-ref-pill" className="absolute inset-0 rounded-sm"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
            <span className="relative z-10">{p}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={pill}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
          {pill === 'reference' ? <ReferenceContent /> : <ExamplesContent />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
