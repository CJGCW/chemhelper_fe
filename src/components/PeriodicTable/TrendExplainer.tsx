import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TrendMode } from '../../stores/elementStore'

interface TrendInfo {
  name:         string
  color:        string
  concept:      string
  acrossPeriod: string
  downGroup:    string
  extra?:       string
}

const EXPLANATIONS: Record<Exclude<TrendMode, 'none'>, TrendInfo> = {
  electronegativity: {
    name:    'Electronegativity',
    color:   '#f97316',
    concept: 'Effective Nuclear Charge (Zeff)',
    acrossPeriod:
      'Increases left → right. Nuclear charge (Z) rises while electrons fill the same shell, so shielding barely changes. Higher Zeff means the nucleus pulls bonding electrons more strongly.',
    downGroup:
      'Decreases top → bottom. Each period adds a new electron shell, increasing the distance between the nucleus and bonding electrons. More inner-shell electrons also increase shielding, reducing the nucleus\'s grip.',
    extra:
      'Noble gases are excluded — they form very few bonds and have no defined Pauling electronegativity.',
  },
  radius: {
    name:    'Atomic Radius',
    color:   '#38bdf8',
    concept: 'Shell distance vs. Effective Nuclear Charge (Zeff)',
    acrossPeriod:
      'Decreases left → right. All valence electrons occupy the same shell, but nuclear charge increases across the period. The higher Zeff pulls the electron cloud inward.',
    downGroup:
      'Increases top → bottom. Each period begins a completely new electron shell, dramatically increasing the average distance of valence electrons from the nucleus.',
  },
  ie1: {
    name:    'First Ionization Energy',
    color:   '#4ade80',
    concept: 'Zeff and orbital distance',
    acrossPeriod:
      'Generally increases left → right as Zeff rises — it takes more energy to remove a more tightly held electron. Notable dips: Group 13 (first p electron, slightly lower than filled s) and Group 16 (paired p electron is easier to remove due to e⁻ repulsion).',
    downGroup:
      'Decreases top → bottom. Outer electrons are in progressively higher shells — farther from the nucleus and more shielded by inner electrons — requiring less energy to remove.',
    extra:
      'Noble gases peak at each period: their full valence shells (s²p⁶) are maximally stable, requiring the most energy to ionize.',
  },
  ea: {
    name:    'Electron Affinity',
    color:   '#a78bfa',
    concept: 'Stability of the resulting anion',
    acrossPeriod:
      'Generally becomes more exothermic (more negative) left → right, peaking at halogens (Group 17). Adding an electron to a high-Zeff atom produces a more stable, tightly bound anion.',
    downGroup:
      'Generally decreases in magnitude. The added electron enters a more distant, more diffuse orbital — less attracted to the nucleus and less stabilizing.',
    extra:
      'Groups 2 (filled s²) and 5 (half-filled p³) have near-zero or positive EA: the extra electron would disrupt a stable subshell configuration. Noble gases have large positive EA — their anions are highly unstable.',
  },
  ionicRadius: {
    name:    'Ionic Radius',
    color:   '#fb923c',
    concept: 'Electron count vs. nuclear charge balance',
    acrossPeriod:
      'Cations (metals, left of table) are smaller than their neutral atoms — losing electrons increases the Zeff-per-electron ratio, pulling the remaining cloud inward. Anions (nonmetals, right) are larger — extra electrons add repulsion, expanding the cloud.',
    downGroup:
      'Increases top → bottom, mirroring the atomic radius trend. Each additional period adds a new electron shell that dominates the size.',
    extra:
      'Isoelectronic series — same electron count, different nuclear charge: higher Z → smaller radius. Example: O²⁻ (Z=8) > F⁻ (Z=9) > Na⁺ (Z=11) > Mg²⁺ (Z=12), all with 10 electrons.',
  },
}

export default function TrendExplainer({ trendMode }: { trendMode: TrendMode }) {
  const [open, setOpen] = useState(false)

  if (trendMode === 'none') return null
  const info = EXPLANATIONS[trendMode]

  return (
    <div
      className="rounded-sm border overflow-hidden"
      style={{ borderColor: `color-mix(in srgb, ${info.color} 30%, rgba(255,255,255,0.08))` }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface/40 transition-colors"
      >
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: info.color }} />
        <span className="font-mono text-[11px]" style={{ color: info.color }}>{info.name}</span>
        <span className="font-mono text-[10px] text-dim">— why does this trend occur?</span>
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="font-mono text-[9px] text-dim ml-auto"
        >▶</motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-2 border-t border-border flex flex-col gap-3"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>

              {/* Key concept */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-dim tracking-widest uppercase shrink-0">
                  Key concept
                </span>
                <span className="font-mono text-xs font-semibold" style={{ color: info.color }}>
                  {info.concept}
                </span>
              </div>

              {/* Period / Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] text-dim tracking-widest uppercase">
                    Across a period →
                  </span>
                  <p className="font-mono text-xs text-secondary leading-relaxed">
                    {info.acrossPeriod}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] text-dim tracking-widest uppercase">
                    Down a group ↓
                  </span>
                  <p className="font-mono text-xs text-secondary leading-relaxed">
                    {info.downGroup}
                  </p>
                </div>
              </div>

              {/* Extra note */}
              {info.extra && (
                <p className="font-mono text-[11px] text-dim leading-relaxed border-t pt-2"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  {info.extra}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
