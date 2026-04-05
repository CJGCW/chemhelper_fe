import { motion } from 'framer-motion'
import type { Element } from '../../types'
import { getColorCategory, GROUP_COLORS, matchesSearch } from './groupColors'
import { useElementStore } from '../../stores/elementStore'
import { IE1, EA, IONIC_RADIUS } from '../../data/periodicTrends'

interface Props {
  element: Element
  animationIndex?: number
}

// ── Normalisation helpers ─────────────────────────────────────────────────────

const EN_MAX      = 4.0
const RAD_MIN     = 120,  RAD_MAX     = 360
const IE1_MIN     = 370,  IE1_MAX     = 2400
const EA_MAX      = 360                           // Cl ≈ 349 kJ/mol
const IONIC_MAX   = 235                           // I⁻ ≈ 220 pm

const CIRCLE_MIN = 0.20
const CIRCLE_MAX = 0.85

function normEN(v: number)       { return v  <= 0 ? 0 : Math.min(v / EN_MAX, 1) }
function normIE1(v: number)      { return v  <= 0 ? 0 : Math.min(Math.max((v - IE1_MIN) / (IE1_MAX - IE1_MIN), 0), 1) }
function normEA(v: number)       { return v  <= 0 ? 0 : Math.min(v / EA_MAX, 1) }

function circleFrac(v: number, min: number, max: number) {
  if (v <= 0) return 0
  const t = Math.min((v - min) / (max - min), 1)
  return CIRCLE_MIN + t * (CIRCLE_MAX - CIRCLE_MIN)
}

// ── Trend config ──────────────────────────────────────────────────────────────

interface TrendConfig {
  fillFrac:  number        // 0-1 for fill bar, 0 = no bar
  circFrac:  number        // 0-1 for circle, 0 = no circle
  color:     string
  label:     string        // value shown inside cell
}

function getTrendConfig(
  mode: ReturnType<typeof useElementStore>['trendMode'],
  element: Element,
): TrendConfig {
  const z = element.atomicNumber
  switch (mode) {
    case 'electronegativity': {
      const v = element.electronegativity
      return {
        fillFrac: normEN(v),
        circFrac: 0,
        color: '#f97316',
        label: v > 0 ? v.toFixed(2) : '—',
      }
    }
    case 'radius': {
      const v = element.vanDerWaalsRadiusPm
      return {
        fillFrac: 0,
        circFrac: circleFrac(v, RAD_MIN, RAD_MAX),
        color: '#38bdf8',
        label: v > 0 ? String(v) : '—',
      }
    }
    case 'ie1': {
      const v = IE1[z] ?? 0
      return {
        fillFrac: normIE1(v),
        circFrac: 0,
        color: '#4ade80',
        label: v > 0 ? String(v) : '—',
      }
    }
    case 'ea': {
      const v = EA[z] ?? 0
      return {
        fillFrac: normEA(v),
        circFrac: 0,
        color: '#a78bfa',
        label: v > 0 ? String(v) : (v < 0 ? '—' : '—'),
      }
    }
    case 'ionicRadius': {
      const v = IONIC_RADIUS[z] ?? 0
      return {
        fillFrac: 0,
        circFrac: circleFrac(v, 0, IONIC_MAX),
        color: '#fb923c',
        label: v > 0 ? String(v) : '—',
      }
    }
    default:
      return { fillFrac: 0, circFrac: 0, color: '', label: '' }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ElementCell({ element, animationIndex = 0 }: Props) {
  const {
    hoveredGroup, hoveredColumnGroup,
    searchQuery, selectElement, trendMode,
  } = useElementStore()

  const category       = getColorCategory(element)
  const color          = GROUP_COLORS[category]
  const isGroupDimmed  = hoveredGroup !== null && category !== hoveredGroup
  const isColumnDimmed = hoveredColumnGroup !== null && element.group !== hoveredColumnGroup
  const isSearchDimmed = searchQuery !== '' && !matchesSearch(element, searchQuery)
  const isDimmed       = isGroupDimmed || isColumnDimmed || isSearchDimmed

  const showTrend = trendMode !== 'none'
  const trend     = showTrend ? getTrendConfig(trendMode, element) : null

  const delay = animationIndex * 0.003

  return (
    <div style={{ isolation: 'isolate', width: '100%' }}>
      <motion.button
        onClick={() => selectElement(element)}
        className="relative w-full aspect-[4/5] flex flex-col items-center justify-center
                   rounded-sm border cursor-pointer select-none outline-none overflow-hidden
                   focus-visible:ring-1 focus-visible:ring-white/30"
        style={{ borderColor: 'rgba(255,255,255,0.07)', backgroundColor: '#0e1016' }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{
          opacity: isDimmed ? 0.12 : 1,
          scale: 1,
          transition: {
            opacity: { duration: 0.15 },
            scale: { delay: animationIndex * 0.004, type: 'spring', stiffness: 400, damping: 28 },
          },
        }}
        whileHover={{
          scale: 1.18,
          zIndex: 20,
          backgroundColor: `color-mix(in srgb, ${color} 22%, #0e1016)`,
          borderColor: color,
          transition: { duration: 0.1 },
        }}
        whileTap={{ scale: 1.05 }}
      >
        {/* Fill bar (EN, IE1, EA) */}
        {trend && trend.fillFrac > 0 && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{ background: `color-mix(in srgb, ${trend.color} 28%, transparent)` }}
            initial={{ height: 0 }}
            animate={{ height: `${trend.fillFrac * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut', delay }}
          />
        )}

        {/* Circle (vdW radius, ionic radius) */}
        {trend && trend.circFrac > 0 && (
          <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="rounded-full"
              style={{
                aspectRatio: '1',
                background: `color-mix(in srgb, ${trend.color} 22%, transparent)`,
                border: `1px solid color-mix(in srgb, ${trend.color} 50%, transparent)`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${trend.circFrac * 100}%` }}
              transition={{ duration: 0.45, ease: 'easeOut', delay }}
            />
          </motion.div>
        )}

        {/* Atomic number */}
        <span className="absolute top-[2px] left-[3px] font-mono leading-none"
          style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(6px, 1.3vw, 16px)' }}>
          {element.atomicNumber}
        </span>

        {/* Symbol */}
        <span className="font-mono font-semibold leading-none relative z-10"
          style={{ color, fontSize: 'clamp(7px, 1.4vw, 18px)' }}>
          {element.symbol}
        </span>

        {/* Value row */}
        {showTrend && trend ? (
          <span className="font-mono mt-0.5 leading-none relative z-10"
            style={{
              color: (trend.fillFrac > 0 || trend.circFrac > 0) ? trend.color : 'rgba(255,255,255,0.2)',
              fontSize: 'clamp(6px, 1.1vw, 14px)',
            }}>
            {trend.label}
          </span>
        ) : (
          <span className="font-mono mt-0.5 leading-none"
            style={{ color: 'rgba(255,255,255,0.28)', fontSize: 'clamp(6px, 1.1vw, 14px)' }}>
            {parseFloat(element.atomicWeight).toFixed(2)}
          </span>
        )}
      </motion.button>
    </div>
  )
}
