import { motion } from 'framer-motion'
import type { Element } from '../../types'
import { getColorCategory, GROUP_COLORS, matchesSearch } from './groupColors'
import { useElementStore } from '../../stores/elementStore'

interface Props {
  element: Element
  animationIndex?: number
}

const EN_MAX  = 4.0
const RAD_MIN = 120
const RAD_MAX = 360

const CIRCLE_MIN = 0.20
const CIRCLE_MAX = 0.85

function normEN(val: number) { return val <= 0 ? 0 : Math.min(val / EN_MAX, 1) }
function radiusFraction(val: number): number {
  if (val <= 0) return 0
  const t = Math.min((val - RAD_MIN) / (RAD_MAX - RAD_MIN), 1)
  return CIRCLE_MIN + t * (CIRCLE_MAX - CIRCLE_MIN)
}

export default function ElementCell({ element, animationIndex = 0 }: Props) {
  const {
    hoveredGroup, hoveredColumnGroup,
    searchQuery, selectElement, trendMode,
  } = useElementStore()

  const category   = getColorCategory(element)
  const color      = GROUP_COLORS[category]
  const isGroupDimmed  = hoveredGroup !== null && getColorCategory(element) !== hoveredGroup
  const isColumnDimmed = hoveredColumnGroup !== null && element.group !== hoveredColumnGroup
  const isSearchDimmed = searchQuery !== '' && !matchesSearch(element, searchQuery)
  const isDimmed       = isGroupDimmed || isColumnDimmed || isSearchDimmed

  const showTrend  = trendMode !== 'none'
  const showEN     = trendMode === 'electronegativity'
  const showRadius = trendMode === 'radius'

  const enFill  = showEN     ? normEN(element.electronegativity)            : 0
  const radFrac = showRadius ? radiusFraction(element.vanDerWaalsRadiusPm)  : 0

  const trendColor = showEN ? '#f97316' : '#38bdf8'
  const trendLabel = showEN
    ? (element.electronegativity > 0 ? element.electronegativity.toFixed(2) : '—')
    : showRadius
    ? (element.vanDerWaalsRadiusPm > 0 ? `${element.vanDerWaalsRadiusPm}` : '—')
    : ''

  return (
    // Outer div: hides in-place when selected so grid doesn't reflow,
    // but keeps its space. The visual is owned by the modal's layoutId.
    <div style={{ isolation: 'isolate', width: '100%' }}>
      <motion.button
        onClick={() => selectElement(element)}
        className="relative w-full aspect-[4/5] flex flex-col items-center justify-center
                   rounded-sm border cursor-pointer select-none outline-none overflow-hidden
                   focus-visible:ring-1 focus-visible:ring-white/30"
        style={{
          borderColor: 'rgba(255,255,255,0.07)',
          backgroundColor: '#0e1016',
        }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{
          opacity: isDimmed ? 0.12 : 1,
          scale: 1,
          transition: {
            opacity: { duration: 0.15 },
            scale: {
              delay: animationIndex * 0.004,
              type: 'spring',
              stiffness: 400,
              damping: 28,
            },
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
        {/* EN fill bar */}
        {showEN && enFill > 0 && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{ background: `color-mix(in srgb, #f97316 28%, transparent)` }}
            initial={{ height: 0 }}
            animate={{ height: `${enFill * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: animationIndex * 0.003 }}
          />
        )}

        {/* Radius circle */}
        {showRadius && radFrac > 0 && (
          <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="rounded-full"
              style={{
                aspectRatio: '1',
                background: `color-mix(in srgb, #38bdf8 22%, transparent)`,
                border: `1px solid color-mix(in srgb, #38bdf8 50%, transparent)`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${radFrac * 100}%` }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: animationIndex * 0.003 }}
            />
          </motion.div>
        )}

        {/* Atomic number */}
        <span
          className="absolute top-[2px] left-[3px] font-mono leading-none"
          style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(6px, 1.3vw, 16px)" }}
        >
          {element.atomicNumber}
        </span>

        {/* Symbol */}
        <span
          className="font-mono font-semibold leading-none relative z-10"
          style={{ color, fontSize: 'clamp(7px, 1.4vw, 18px)' }}
        >
          {element.symbol}
        </span>

        {/* Value row */}
        {showTrend ? (
          <span
            className="font-mono mt-0.5 leading-none relative z-10"
            style={{
              color: (showEN ? enFill : radFrac) > 0 ? trendColor : 'rgba(255,255,255,0.2)',
              fontSize: 'clamp(6px, 1.1vw, 14px)',
            }}
          >
            {trendLabel}
          </span>
        ) : (
          <span
            className="font-mono mt-0.5 leading-none"
            style={{ color: 'rgba(255,255,255,0.28)', fontSize: 'clamp(6px, 1.1vw, 14px)' }}
          >
            {parseFloat(element.atomicWeight).toFixed(2)}
          </span>
        )}
      </motion.button>
    </div>
  )
}
