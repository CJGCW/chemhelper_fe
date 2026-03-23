import { motion } from 'framer-motion'
import type { Element } from '../../types'
import { getColorCategory, GROUP_COLORS, matchesSearch } from './groupColors'
import { useElementStore } from '../../stores/elementStore'

interface Props {
  element: Element
  animationIndex?: number
}

export default function ElementCell({ element, animationIndex = 0 }: Props) {
  const { selectedElement, hoveredGroup, searchQuery, selectElement } =
    useElementStore()

  const category = getColorCategory(element)
  const color = GROUP_COLORS[category]
  const isSelected = selectedElement?.atomicNumber === element.atomicNumber
  const isGroupDimmed =
    hoveredGroup !== null && getColorCategory(element) !== hoveredGroup
  const isSearchDimmed = searchQuery !== '' && !matchesSearch(element, searchQuery)
  const isDimmed = isGroupDimmed || isSearchDimmed

  return (
    <motion.button
      onClick={() => selectElement(isSelected ? null : element)}
      className="relative w-full aspect-[4/5] flex flex-col items-center justify-center
                 rounded-sm border cursor-pointer select-none outline-none
                 focus-visible:ring-1 focus-visible:ring-white/30"
      style={{
        borderColor: isSelected ? color : 'rgba(255,255,255,0.07)',
        backgroundColor: isSelected
          ? `color-mix(in srgb, ${color} 18%, #0e1016)`
          : '#0e1016',
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
      {/* Atomic number */}
      <span
        className="absolute top-[3px] left-[4px] font-mono text-[8px] leading-none"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        {element.atomicNumber}
      </span>

      {/* Symbol */}
      <span
        className="font-mono font-semibold leading-none"
        style={{
          color,
          fontSize: 'clamp(10px, 1.4vw, 18px)',
        }}
      >
        {element.symbol}
      </span>

      {/* Atomic weight */}
      <span
        className="font-mono mt-0.5 leading-none"
        style={{
          color: 'rgba(255,255,255,0.28)',
          fontSize: 'clamp(6px, 0.7vw, 9px)',
        }}
      >
        {parseFloat(element.atomicWeight).toFixed(2)}
      </span>

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-sm pointer-events-none"
          style={{ boxShadow: `0 0 10px 2px color-mix(in srgb, ${color} 40%, transparent)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </motion.button>
  )
}
