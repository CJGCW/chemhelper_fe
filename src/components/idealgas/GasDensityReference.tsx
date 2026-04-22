import { SectionHead } from '../Layout/PageShell'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GasDensityTool from './GasDensityTool'


function ReferenceContent() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div className="rounded-sm border border-border bg-raised px-6 py-5 flex flex-col gap-4">
        <p className="font-mono text-2xl font-bold text-bright">M = ρRT / P</p>
        <p className="font-sans text-sm text-secondary">
          Derived from PV = nRT by substituting n = m/M and density ρ = m/V (in g/L).
          Rearranges to measure molar mass experimentally from gas density at known T and P.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-border">
          {[
            { f: 'M = ρRT / P', label: 'molar mass'  },
            { f: 'ρ = MP / RT', label: 'density'      },
            { f: 'T = MP / ρR', label: 'temperature'  },
            { f: 'P = ρRT / M', label: 'pressure'     },
          ].map(r => (
            <div key={r.f} className="flex flex-col gap-0.5">
              <span className="font-mono text-sm text-bright">{r.f}</span>
              <span className="font-mono text-xs text-secondary">solve for {r.label}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-border">
          {[
            { sym: 'ρ', desc: 'Gas density', unit: 'g/L'   },
            { sym: 'M', desc: 'Molar mass',  unit: 'g/mol' },
            { sym: 'T', desc: 'Temperature', unit: 'K'     },
          ].map(r => (
            <div key={r.sym} className="flex flex-col gap-0.5">
              <span className="font-mono text-sm font-bold text-bright">{r.sym}</span>
              <span className="font-sans text-xs text-secondary">{r.desc}</span>
              <span className="font-mono text-xs text-secondary">{r.unit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
        <h4 className="font-sans text-sm font-semibold text-bright">Gas Constant R</h4>
        <p className="font-sans text-xs text-secondary">
          Use R = 0.08206 L·atm / (mol·K) when pressure is in atm and density is in g/L.
          Use R = 8.314 L·kPa / (mol·K) when pressure is in kPa.
        </p>
        <p className="font-mono text-xs text-secondary mt-1">
          1 atm = 101.325 kPa = 760 mmHg = 760 torr
        </p>
      </div>
    </div>
  )
}

const EXAMPLES = [
  {
    q: 'A gas has density 1.428 g/L at 298 K and 1.00 atm. Identify it.',
    eq: 'M = ρRT / P',
    steps: ['M = (1.428 × 0.08206 × 298) / 1.00', 'M = 34.97 / 1.00'],
    ans: 'M ≈ 35.0 g/mol — likely H₂S (34.08) or Cl (fragment)',
  },
  {
    q: 'What is the density of CO₂ (M = 44.01 g/mol) at 1.00 atm and 300 K?',
    eq: 'ρ = MP / RT',
    steps: ['ρ = (44.01 × 1.00) / (0.08206 × 300)', 'ρ = 44.01 / 24.62'],
    ans: 'ρ = 1.79 g/L',
  },
  {
    q: 'N₂ (M = 28.02) has density 1.145 g/L at 1.00 atm. Find the temperature.',
    eq: 'T = MP / ρR',
    steps: ['T = (28.02 × 1.00) / (1.145 × 0.08206)', 'T = 28.02 / 0.09396'],
    ans: 'T = 298 K (25 °C)',
  },
  {
    q: 'At what pressure does CH₄ (M = 16.04) have density 0.900 g/L at 273 K?',
    eq: 'P = ρRT / M',
    steps: ['P = (0.900 × 0.08206 × 273) / 16.04', 'P = 20.16 / 16.04'],
    ans: 'P = 1.26 atm',
  },
]

function ExamplesContent() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
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
        <GasDensityTool />
      </div>
    </div>
  )
}

export default function GasDensityReference() {
  const [pill, setPill] = useState<'reference' | 'examples'>('reference')

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div className="flex gap-1 p-1 rounded-sm self-start print:hidden"
        style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
        {(['reference', 'examples'] as const).map(p => (
          <button key={p} onClick={() => setPill(p)}
            className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors capitalize"
            style={{ color: pill === p ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}>
            {pill === p && (
              <motion.div layoutId="gasdensity-ref-pill" className="absolute inset-0 rounded-sm"
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
