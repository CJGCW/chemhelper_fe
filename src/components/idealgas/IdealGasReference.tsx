import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { R_TABLE, EXAMPLES } from '../../utils/idealGas'
import GasSimulation from './GasSimulation'

function SectionHead({ label }: { label: string }) {
  return <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">{label}</h3>
}

function ReferenceContent() {
  return (
    <div className="flex flex-col gap-6">

      {/* PV = nRT formula box */}
      <div className="rounded-sm border border-border bg-raised px-6 py-5 flex flex-col gap-4">
        <p className="font-mono text-3xl font-bold text-bright">PV = nRT</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-border">
          {[
            { f: 'P = nRT / V', label: 'pressure'    },
            { f: 'V = nRT / P', label: 'volume'      },
            { f: 'n = PV / RT', label: 'moles'       },
            { f: 'T = PV / nR', label: 'temperature' },
          ].map(r => (
            <div key={r.f} className="flex flex-col gap-0.5">
              <span className="font-mono text-sm text-bright">{r.f}</span>
              <span className="font-mono text-[10px] text-dim">solve for {r.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Variables */}
        <div className="flex flex-col gap-2">
          <SectionHead label="Variables" />
          <div className="rounded-sm border border-border bg-surface overflow-hidden">
            {[
              { sym: 'P', name: 'Pressure',    unit: 'atm / kPa / mmHg / torr' },
              { sym: 'V', name: 'Volume',       unit: 'L'                       },
              { sym: 'n', name: 'Moles',        unit: 'mol'                     },
              { sym: 'R', name: 'Gas constant', unit: 'see table →'             },
              { sym: 'T', name: 'Temperature',  unit: 'K  (K = °C + 273.15)'   },
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

        {/* R table */}
        <div className="flex flex-col gap-2">
          <SectionHead label="Gas Constant R" />
          <div className="rounded-sm border border-border bg-surface overflow-hidden">
            <div className="grid grid-cols-[4.5rem_1fr_4rem] gap-x-3 px-4 py-2 bg-raised border-b border-border">
              <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Value</span>
              <span className="font-mono text-[10px] text-dim tracking-widest uppercase">Units</span>
              <span className="font-mono text-[10px] text-dim tracking-widest uppercase">P in</span>
            </div>
            {R_TABLE.map(r => (
              <div key={r.use}
                className="grid grid-cols-[4.5rem_1fr_4rem] gap-x-3 px-4 py-2.5 border-b border-border last:border-b-0 items-baseline">
                <span className="font-mono text-sm text-bright">{r.val}</span>
                <span className="font-mono text-sm text-secondary">{r.units}</span>
                <span className="font-mono text-sm text-dim">{r.use}</span>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-dim">
            1 atm = 101.325 kPa = 760 mmHg = 760 torr
          </p>
        </div>
      </div>

      {/* Combined Gas Law */}
      <div className="flex flex-col gap-4 pt-2">
        <SectionHead label="Combined Gas Law" />

        <div className="rounded-sm border border-border bg-raised px-6 py-5 flex flex-col gap-4">
          <p className="font-mono text-3xl font-bold text-bright">P₁V₁/T₁ = P₂V₂/T₂</p>
          <p className="font-sans text-sm text-secondary">
            Relates two states of the <em>same fixed amount of gas</em>. Use when n is constant
            and two or more variables change simultaneously.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-border">
            {[
              { f: 'P₂ = P₁V₁T₂ / (T₁V₂)', label: 'final pressure'     },
              { f: 'V₂ = P₁V₁T₂ / (T₁P₂)', label: 'final volume'       },
              { f: 'T₂ = P₂V₂T₁ / (P₁V₁)', label: 'final temperature'  },
              { f: 'P₁ = P₂V₂T₁ / (T₂V₁)', label: 'initial pressure'   },
              { f: 'V₁ = P₂V₂T₁ / (P₁T₂)', label: 'initial volume'     },
              { f: 'T₁ = P₁V₁T₂ / (P₂V₂)', label: 'initial temperature' },
            ].map(r => (
              <div key={r.f} className="flex flex-col gap-0.5">
                <span className="font-mono text-sm text-bright">{r.f}</span>
                <span className="font-mono text-[10px] text-dim">solve for {r.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Special cases */}
        <div className="flex flex-col gap-2">
          <SectionHead label="Special Cases" />
          <div className="rounded-sm border border-border bg-surface overflow-hidden">
            {[
              { law: "Boyle's Law",      held: 'T constant', formula: 'P₁V₁ = P₂V₂'   },
              { law: "Charles' Law",     held: 'P constant', formula: 'V₁/T₁ = V₂/T₂' },
              { law: "Gay-Lussac's Law", held: 'V constant', formula: 'P₁/T₁ = P₂/T₂' },
            ].map(r => (
              <div key={r.law}
                className="grid grid-cols-[auto_1fr_auto] gap-x-4 items-baseline px-4 py-2.5 border-b border-border last:border-b-0">
                <span className="font-sans text-sm text-primary">{r.law}</span>
                <span className="font-mono text-xs text-dim">{r.held} held constant</span>
                <span className="font-mono text-sm text-bright">{r.formula}</span>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-dim">
            T must always be in Kelvin. Pressure units must match on both sides.
          </p>
        </div>
      </div>
    </div>
  )
}

function ExamplesContent() {
  return (
    <div className="flex flex-col gap-6">

      {/* PV = nRT worked examples */}
      <div className="flex flex-col gap-2">
        <SectionHead label="PV = nRT — Worked Examples" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EXAMPLES.map((ex, i) => (
            <div key={i} className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-dim shrink-0">Ex {i + 1}</span>
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

      {/* Combined Gas Law worked example */}
      <div className="flex flex-col gap-2">
        <SectionHead label="Combined Gas Law — Worked Example" />
        <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
          <p className="font-sans text-sm text-secondary">
            A gas occupies 4.00 L at 2.00 atm and 300 K. Pressure drops to 1.00 atm and
            temperature rises to 400 K. Find the new volume.
          </p>
          <div className="font-mono text-sm text-bright bg-raised rounded-sm px-3 py-2">
            V₂ = P₁V₁T₂ / (T₁P₂)
          </div>
          <div className="flex flex-col gap-0.5 pl-3 border-l-2 border-border">
            <p className="font-mono text-sm text-primary">V₂ = (2.00 atm × 4.00 L × 400 K) / (300 K × 1.00 atm)</p>
            <p className="font-mono text-sm text-primary">V₂ = 3200 / 300</p>
            <p className="font-mono text-sm font-semibold text-emerald-400">∴ V₂ = 10.7 L</p>
          </div>
        </div>
      </div>

      {/* Gas particle simulation */}
      <div className="pt-2">
        <GasSimulation />
      </div>
    </div>
  )
}

export default function IdealGasReference() {
  const [pill, setPill] = useState<'reference' | 'examples'>('reference')

  return (
    <div className="flex flex-col gap-6">

      {/* Pills */}
      <div className="flex gap-1 p-1 rounded-sm self-start"
        style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
        {(['reference', 'examples'] as const).map(p => (
          <button key={p} onClick={() => setPill(p)}
            className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors capitalize"
            style={{ color: pill === p ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
            {pill === p && (
              <motion.div layoutId="ideal-gas-ref-pill" className="absolute inset-0 rounded-sm"
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

      {/* Content */}
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
