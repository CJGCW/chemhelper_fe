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

      {/* Graham's Law */}
      <div className="flex flex-col gap-4 pt-2">
        <SectionHead label="Graham's Law of Effusion / Diffusion" />

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
              <p className="font-mono text-xs text-dim uppercase tracking-widest mb-2">Solve for unknown molar mass</p>
              <p className="font-mono text-sm text-bright">M₁ = M₂ × (rate₂ / rate₁)²</p>
              <p className="font-mono text-sm text-secondary mt-1">M₁ = M₂ × (t₁ / t₂)²</p>
            </div>
            <div>
              <p className="font-mono text-xs text-dim uppercase tracking-widest mb-2">Units note</p>
              <p className="font-sans text-xs text-secondary">
                Rate units must be consistent (both mol/s, mL/s, etc.). Only the <em>ratio</em> matters,
                so dimensionless comparisons work too. Molar masses in g/mol.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gas Density */}
      <div className="flex flex-col gap-4 pt-2">
        <SectionHead label="Molar Mass from Gas Density" />

        <div className="rounded-sm border border-border bg-raised px-6 py-5 flex flex-col gap-4">
          <p className="font-mono text-2xl font-bold text-bright">M = ρRT / P</p>
          <p className="font-sans text-sm text-secondary">
            Derived from PV = nRT by substituting n = m/M and density ρ = m/V (in g/L).
            Rearranges to measure molar mass experimentally from gas density at known T and P.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-border">
            {[
              { f: 'M = ρRT / P',    label: 'molar mass' },
              { f: 'ρ = MP / RT',    label: 'density'    },
              { f: 'T = MP / ρR',    label: 'temperature' },
              { f: 'P = ρRT / M',    label: 'pressure'   },
            ].map(r => (
              <div key={r.f} className="flex flex-col gap-0.5">
                <span className="font-mono text-sm text-bright">{r.f}</span>
                <span className="font-mono text-[10px] text-dim">solve for {r.label}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-border">
            {[
              { sym: 'ρ', desc: 'Gas density', unit: 'g/L' },
              { sym: 'M', desc: 'Molar mass',  unit: 'g/mol' },
              { sym: 'T', desc: 'Temperature', unit: 'K' },
            ].map(r => (
              <div key={r.sym} className="flex flex-col gap-0.5">
                <span className="font-mono text-sm font-bold text-bright">{r.sym}</span>
                <span className="font-sans text-xs text-secondary">{r.desc}</span>
                <span className="font-mono text-[10px] text-dim">{r.unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dalton's Law */}
      <div className="flex flex-col gap-4 pt-2">
        <SectionHead label="Dalton's Law of Partial Pressures" />

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
              { sym: 'P_total', desc: 'Total pressure of the mixture',             unit: 'atm / kPa / mmHg' },
              { sym: 'Pᵢ',      desc: 'Partial pressure of gas i',                 unit: 'same as P_total'  },
              { sym: 'χᵢ',      desc: 'Mole fraction of gas i  (nᵢ / n_total)',   unit: 'dimensionless (0–1)' },
            ].map(r => (
              <div key={r.sym} className="flex flex-col gap-0.5">
                <span className="font-mono text-sm font-bold text-bright">{r.sym}</span>
                <span className="font-sans text-xs text-secondary">{r.desc}</span>
                <span className="font-mono text-[10px] text-dim">{r.unit}</span>
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

      {/* Graham's Law worked examples */}
      <div className="flex flex-col gap-2">
        <SectionHead label="Graham's Law — Worked Examples" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
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
          ].map((ex, i) => (
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

      {/* Gas Density worked examples */}
      <div className="flex flex-col gap-2">
        <SectionHead label="Gas Density — Worked Examples" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
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
          ].map((ex, i) => (
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

      {/* Dalton's Law worked examples */}
      <div className="flex flex-col gap-2">
        <SectionHead label="Dalton's Law — Worked Examples" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              q: 'A container holds N₂ at 0.60 atm, O₂ at 0.25 atm, and Ar at 0.10 atm. Find P_total.',
              eq: 'P_total = P(N₂) + P(O₂) + P(Ar)',
              steps: [
                'P_total = 0.60 + 0.25 + 0.10 atm',
                'P_total = 0.95 atm',
              ],
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
              steps: [
                'P(H₂) = 1.000 − 0.0313 atm',
                'P(H₂) = 0.969 atm',
              ],
              ans: 'P(H₂) = 0.969 atm',
            },
            {
              q: 'A gas mixture has χ(He) = 0.35, χ(Ne) = 0.45, χ(Ar) = 0.20 and P_total = 2.00 atm. Find P(Ne).',
              eq: 'P(Ne) = χ(Ne) × P_total',
              steps: [
                'P(Ne) = 0.45 × 2.00 atm',
                'P(Ne) = 0.90 atm',
              ],
              ans: 'P(Ne) = 0.90 atm',
            },
          ].map((ex, i) => (
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
