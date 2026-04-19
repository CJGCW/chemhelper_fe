import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GrahamsLawCalc from './GrahamsLawCalc'

function SectionHead({ label }: { label: string }) {
  return <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">{label}</h3>
}

function ReferenceContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-sm border border-border bg-raised px-6 py-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-2xl font-bold text-bright">rate₁ / rate₂ = √(M₂ / M₁)</p>
          <p className="font-mono text-lg text-secondary">t₁ / t₂ = √(M₁ / M₂)</p>
        </div>
        <p className="font-sans text-sm text-secondary">
          Lighter gases effuse (escape through a pinhole) and diffuse faster. The rate is inversely
          proportional to the square root of the molar mass. Effusion <em>time</em> is proportional
          to the square root of molar mass — a heavier gas takes longer.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border">
          <div>
            <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-2">Solve for unknown molar mass</p>
            <p className="font-mono text-sm text-bright">M₁ = M₂ × (rate₂ / rate₁)²</p>
            <p className="font-mono text-sm text-secondary mt-1">M₁ = M₂ × (t₁ / t₂)²</p>
          </div>
          <div>
            <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-2">Units note</p>
            <p className="font-sans text-xs text-secondary">
              Rate units must be consistent (both mol/s, mL/s, etc.). Only the <em>ratio</em> matters,
              so dimensionless comparisons work too. Molar masses in g/mol.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
          <h4 className="font-sans text-sm font-semibold text-bright">Effusion</h4>
          <p className="font-sans text-xs text-secondary">
            Escape of gas molecules through a tiny pinhole into a vacuum. Graham's law applies
            exactly for ideal gases in the limit of very small hole size.
          </p>
        </div>
        <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
          <h4 className="font-sans text-sm font-semibold text-bright">Diffusion</h4>
          <p className="font-sans text-xs text-secondary">
            Spreading of gas molecules through another gas. Graham's law gives an approximation —
            actual diffusion rates depend on intermolecular collisions and concentration gradients.
          </p>
        </div>
      </div>
    </div>
  )
}

const EXAMPLES = [
  {
    q: 'How much faster does H₂ (M = 2.016 g/mol) effuse compared to O₂ (M = 32.00 g/mol)?',
    eq: 'rate(H₂) / rate(O₂) = √(M(O₂) / M(H₂))',
    steps: ['= √(32.00 / 2.016)', '= √15.87', '= 3.98'],
    ans: 'H₂ effuses 3.98× faster than O₂',
  },
  {
    q: 'An unknown gas takes 4.00 min to effuse. N₂ (M = 28.02 g/mol) takes 1.50 min. Find M of the unknown.',
    eq: 'M_x = M(N₂) × (t_x / t(N₂))²',
    steps: ['M_x = 28.02 × (4.00 / 1.50)²', 'M_x = 28.02 × (2.667)²', 'M_x = 28.02 × 7.11'],
    ans: 'M_x = 199 g/mol',
  },
  {
    q: 'If CO₂ (M = 44.01) effuses at rate 1.00 mol/s, what is the rate for He (M = 4.003)?',
    eq: 'rate(He) = rate(CO₂) × √(M(CO₂) / M(He))',
    steps: ['rate(He) = 1.00 × √(44.01 / 4.003)', 'rate(He) = 1.00 × √10.99', 'rate(He) = 1.00 × 3.315'],
    ans: 'rate(He) = 3.32 mol/s',
  },
  {
    q: 'Gas A takes 36.0 s and Gas B takes 12.0 s to effuse. M(B) = 16.04 g/mol. Find M(A).',
    eq: 'M_A = M_B × (t_A / t_B)²',
    steps: ['M_A = 16.04 × (36.0 / 12.0)²', 'M_A = 16.04 × 9.00'],
    ans: 'M_A = 144 g/mol',
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
        <GrahamsLawCalc />
      </div>
    </div>
  )
}

export default function GrahamsLawReference() {
  const [pill, setPill] = useState<'reference' | 'examples'>('reference')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 p-1 rounded-sm self-start print:hidden"
        style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
        {(['reference', 'examples'] as const).map(p => (
          <button key={p} onClick={() => setPill(p)}
            className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors capitalize"
            style={{ color: pill === p ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
            {pill === p && (
              <motion.div layoutId="grahams-ref-pill" className="absolute inset-0 rounded-sm"
                style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
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
