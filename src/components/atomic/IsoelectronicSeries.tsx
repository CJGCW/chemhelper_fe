import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Data ──────────────────────────────────────────────────────────────────────
// Shannon ionic radii (pm), 6-coordinate. Source: Acta Crystallographica A32 (1976)

interface IonEntry {
  symbol: string
  charge: number
  protons: number
  radius: number   // pm
  name: string
}

interface Series {
  electrons: number
  label: string
  config: string   // noble gas config they share
  members: IonEntry[]
}

const SERIES: Series[] = [
  {
    electrons: 10,
    label: '10 electrons',
    config: '[Ne] — 1s² 2s² 2p⁶',
    members: [
      { symbol: 'N',  charge: -3, protons: 7,  radius: 146, name: 'Nitride'   },
      { symbol: 'O',  charge: -2, protons: 8,  radius: 140, name: 'Oxide'     },
      { symbol: 'F',  charge: -1, protons: 9,  radius: 133, name: 'Fluoride'  },
      { symbol: 'Na', charge: +1, protons: 11, radius: 102, name: 'Sodium'    },
      { symbol: 'Mg', charge: +2, protons: 12, radius: 72,  name: 'Magnesium' },
      { symbol: 'Al', charge: +3, protons: 13, radius: 54,  name: 'Aluminum'  },
    ],
  },
  {
    electrons: 18,
    label: '18 electrons',
    config: '[Ar] — 1s² 2s² 2p⁶ 3s² 3p⁶',
    members: [
      { symbol: 'P',  charge: -3, protons: 15, radius: 212, name: 'Phosphide' },
      { symbol: 'S',  charge: -2, protons: 16, radius: 184, name: 'Sulfide'   },
      { symbol: 'Cl', charge: -1, protons: 17, radius: 181, name: 'Chloride'  },
      { symbol: 'K',  charge: +1, protons: 19, radius: 138, name: 'Potassium' },
      { symbol: 'Ca', charge: +2, protons: 20, radius: 100, name: 'Calcium'   },
      { symbol: 'Sc', charge: +3, protons: 21, radius: 75,  name: 'Scandium'  },
    ],
  },
  {
    electrons: 36,
    label: '36 electrons',
    config: '[Kr] — 1s² 2s² 2p⁶ 3s² 3p⁶ 3d¹⁰ 4s² 4p⁶',
    members: [
      { symbol: 'As', charge: -3, protons: 33, radius: 222, name: 'Arsenide' },
      { symbol: 'Se', charge: -2, protons: 34, radius: 198, name: 'Selenide' },
      { symbol: 'Br', charge: -1, protons: 35, radius: 196, name: 'Bromide'  },
      { symbol: 'Rb', charge: +1, protons: 37, radius: 152, name: 'Rubidium' },
      { symbol: 'Sr', charge: +2, protons: 38, radius: 118, name: 'Strontium'},
      { symbol: 'Y',  charge: +3, protons: 39, radius: 90,  name: 'Yttrium'  },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCharge(c: number): string {
  if (c === +1) return '⁺'
  if (c === -1) return '⁻'
  if (c > 0)   return `${c}⁺`
  if (c < 0)   return `${Math.abs(c)}⁻`
  return ''
}

function ionColor(charge: number): { bg: string; border: string; label: string } {
  if (charge < 0) return {
    bg:     'color-mix(in srgb, #38bdf8 14%, rgb(var(--color-surface)))',
    border: 'color-mix(in srgb, #38bdf8 40%, transparent)',
    label:  '#38bdf8',
  }
  return {
    bg:     'color-mix(in srgb, #fb923c 14%, rgb(var(--color-surface)))',
    border: 'color-mix(in srgb, #fb923c 40%, transparent)',
    label:  '#fb923c',
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function IsoelectronicSeries() {
  const [seriesIdx, setSeriesIdx] = useState(0)
  const series = SERIES[seriesIdx]

  const maxR  = Math.max(...series.members.map(m => m.radius))
  const MAX_PX = 96   // px for the largest circle
  const MIN_PX = 20

  function circlePx(radius: number) {
    return Math.max(MIN_PX, Math.round((radius / maxR) * MAX_PX))
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      {/* Intro */}
      <p className="font-sans text-sm text-secondary leading-relaxed">
        Isoelectronic species have the <span className="text-primary">same number of electrons</span> but
        different numbers of protons. As nuclear charge (Z) increases, the same electron cloud is
        pulled inward — so <span className="text-primary">higher Z → smaller ion</span>.
      </p>

      {/* Series selector */}
      <div className="flex gap-2 flex-wrap">
        {SERIES.map((s, i) => (
          <button key={s.electrons} onClick={() => setSeriesIdx(i)}
            className="px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
            style={seriesIdx === i ? {
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            } : {
              background: 'rgb(var(--color-surface))',
              border: '1px solid rgb(var(--color-border))',
              color: 'rgba(var(--overlay),0.4)',
            }}>
            {s.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={seriesIdx}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}
          className="flex flex-col gap-6">

          {/* Shared config badge */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">Shared config</span>
            <span className="font-mono text-xs text-secondary">{series.config}</span>
          </div>

          {/* Circle visualisation */}
          <div className="flex items-end gap-4 flex-wrap py-4 px-2">
            {series.members.map(ion => {
              const px = circlePx(ion.radius)
              const colors = ionColor(ion.charge)
              return (
                <div key={ion.symbol} className="flex flex-col items-center gap-2">
                  {/* Circle */}
                  <div
                    className="rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      width:  px,
                      height: px,
                      background: colors.bg,
                      border: `2px solid ${colors.border}`,
                    }}
                  >
                    <span className="font-mono font-semibold select-none"
                      style={{ fontSize: Math.max(9, px * 0.22), color: colors.label }}>
                      {ion.symbol}
                    </span>
                  </div>

                  {/* Ion label */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-mono text-xs font-semibold" style={{ color: colors.label }}>
                      {ion.symbol}{formatCharge(ion.charge)}
                    </span>
                    <span className="font-mono text-xs text-secondary">{ion.radius} pm</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Arrow label */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, #38bdf8, #fb923c)' }} />
            <span className="font-mono text-xs text-secondary whitespace-nowrap">
              increasing Z (protons) →
            </span>
          </div>

          {/* Data table */}
          <div className="rounded-sm border border-border overflow-hidden">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-border bg-raised">
                  {['Ion', 'Name', 'Protons (Z)', 'Electrons', 'Ionic Radius'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs text-secondary tracking-widest uppercase font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {series.members.map((ion, i) => {
                  const colors = ionColor(ion.charge)
                  return (
                    <tr key={ion.symbol}
                      className="border-b border-border/50 last:border-0"
                      style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(var(--overlay),0.02)' }}>
                      <td className="px-3 py-2 font-semibold" style={{ color: colors.label }}>
                        {ion.symbol}{formatCharge(ion.charge)}
                      </td>
                      <td className="px-3 py-2 text-secondary">{ion.name}</td>
                      <td className="px-3 py-2 text-primary">{ion.protons}</td>
                      <td className="px-3 py-2 text-primary">{series.electrons}</td>
                      <td className="px-3 py-2 text-primary">{ion.radius} pm</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Explanation */}
          <div className="rounded-sm border border-border/60 bg-surface/50 p-4 flex flex-col gap-2">
            <span className="font-mono text-xs text-secondary tracking-widest uppercase">Why the trend</span>
            <p className="font-sans text-sm text-secondary leading-relaxed">
              All ions in this series have <span className="text-primary">{series.electrons} electrons</span> in
              identical orbitals. The only difference is nuclear charge Z.
              A higher Z exerts greater electrostatic attraction on the electron cloud,
              pulling it inward — so ionic radius <span className="text-primary">decreases as Z increases</span>.
              The anions (blue) on the left have fewer protons than electrons, so the cloud
              expands; the cations (orange) on the right have more protons, compressing it.
            </p>
          </div>

        </motion.div>
      </AnimatePresence>

      <p className="font-mono text-xs text-secondary">
        Radii: Shannon crystal radii, 6-coordinate (Acta Crystallographica A32, 1976).
      </p>
    </div>
  )
}
