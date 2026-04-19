import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DaltonsLawCalc from './DaltonsLawCalc'

function SectionHead({ label }: { label: string }) {
  return <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">{label}</h3>
}

function ReferenceContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-sm border border-border bg-raised px-6 py-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-3xl font-bold text-bright">P<sub>total</sub> = P₁ + P₂ + … + Pₙ</p>
          <p className="font-mono text-lg text-secondary">Pᵢ = χᵢ × P<sub>total</sub></p>
        </div>
        <p className="font-sans text-sm text-secondary">
          In a mixture of non-reacting gases, each component exerts a <em>partial pressure</em> as if it
          occupied the container alone. The total pressure is the sum of all partial pressures.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-border">
          {[
            { sym: 'P_total', desc: 'Total pressure of the mixture',           unit: 'atm / kPa / mmHg' },
            { sym: 'Pᵢ',      desc: 'Partial pressure of gas i',               unit: 'same as P_total'  },
            { sym: 'χᵢ',      desc: 'Mole fraction of gas i  (nᵢ / n_total)', unit: 'dimensionless (0–1)' },
          ].map(r => (
            <div key={r.sym} className="flex flex-col gap-0.5">
              <span className="font-mono text-sm font-bold text-bright">{r.sym}</span>
              <span className="font-sans text-xs text-secondary">{r.desc}</span>
              <span className="font-mono text-xs text-secondary">{r.unit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
          <h4 className="font-sans text-sm font-semibold text-bright">Mole Fraction</h4>
          <div className="font-mono text-sm text-bright bg-raised rounded-sm px-3 py-2">
            χᵢ = nᵢ / n_total
          </div>
          <p className="font-sans text-xs text-secondary">
            The mole fraction is the ratio of moles of one component to total moles.
            All mole fractions in a mixture must sum to exactly 1.
          </p>
          <p className="font-mono text-xs text-dim">Σ χᵢ = 1</p>
        </div>
        <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
          <h4 className="font-sans text-sm font-semibold text-bright">Collecting Gas Over Water</h4>
          <div className="font-mono text-sm text-bright bg-raised rounded-sm px-3 py-2">
            P<sub>gas</sub> = P<sub>total</sub> − P<sub>H₂O</sub>
          </div>
          <p className="font-sans text-xs text-secondary">
            When a gas is collected by displacing water, the measured pressure includes the
            water vapour pressure. Subtract the vapour pressure of water (at the lab temperature)
            to find the dry gas pressure.
          </p>
        </div>
      </div>
    </div>
  )
}

const EXAMPLES = [
  {
    q: 'A container holds N₂ at 0.60 atm, O₂ at 0.25 atm, and Ar at 0.10 atm. Find P_total.',
    eq: 'P_total = P(N₂) + P(O₂) + P(Ar)',
    steps: ['P_total = 0.60 + 0.25 + 0.10 atm', 'P_total = 0.95 atm'],
    ans: 'P_total = 0.95 atm',
  },
  {
    q: 'A flask contains 2.00 mol N₂ and 3.00 mol O₂ at P_total = 1.25 atm. Find each partial pressure.',
    eq: 'χᵢ = nᵢ / n_total',
    steps: [
      'n_total = 2.00 + 3.00 = 5.00 mol',
      'χ(N₂) = 2.00 / 5.00 = 0.400',
      'χ(O₂) = 3.00 / 5.00 = 0.600',
      'P(N₂) = 0.400 × 1.25 = 0.500 atm',
      'P(O₂) = 0.600 × 1.25 = 0.750 atm',
    ],
    ans: 'P(N₂) = 0.500 atm · P(O₂) = 0.750 atm',
  },
  {
    q: 'H₂ gas is collected over water at 25 °C (P_H₂O = 0.0313 atm). Total pressure = 1.000 atm. Find P(H₂).',
    eq: 'P_gas = P_total − P_H₂O',
    steps: ['P(H₂) = 1.000 − 0.0313 atm', 'P(H₂) = 0.969 atm'],
    ans: 'P(H₂) = 0.969 atm',
  },
  {
    q: 'A gas mixture has χ(He) = 0.35, χ(Ne) = 0.45, χ(Ar) = 0.20 and P_total = 2.00 atm. Find P(Ne).',
    eq: 'P(Ne) = χ(Ne) × P_total',
    steps: ['P(Ne) = 0.45 × 2.00 atm', 'P(Ne) = 0.90 atm'],
    ans: 'P(Ne) = 0.90 atm',
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
              <div className="font-mono text-sm text-bright bg-raised rounded-sm px-3 py-2">{ex.eq}</div>
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
        <DaltonsLawCalc />
      </div>
    </div>
  )
}

export default function DaltonsLawReference() {
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
              <motion.div layoutId="daltons-ref-pill" className="absolute inset-0 rounded-sm"
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
