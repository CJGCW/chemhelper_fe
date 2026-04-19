import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useElementStore } from '../../stores/elementStore'
import { GROUP_INFO } from './groupInfo'

interface Props {
  groupNumber: number
}

export default function GroupHeader({ groupNumber }: Props) {
  const { setHoveredColumnGroup } = useElementStore()
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const info = GROUP_INFO[groupNumber]

  function handleEnter() {
    setHoveredColumnGroup(groupNumber)
    setTooltipVisible(true)
  }
  function handleLeave() {
    setHoveredColumnGroup(null)
    setTooltipVisible(false)
  }

  return (
    <div
      className="relative flex items-center justify-center py-0.5"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Number label */}
      <span
        className="font-sans font-medium leading-none select-none cursor-default transition-colors duration-100"
        style={{
          fontSize: 'clamp(9px, 0.85vw, 13px)',
          color: tooltipVisible ? 'rgba(var(--overlay),0.9)' : 'rgba(var(--overlay),0.4)',
        }}
      >
        {groupNumber}
      </span>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltipVisible && info && (
          <motion.div
            key="tooltip"
            className="absolute top-full mt-1 z-50 pointer-events-none"
            style={{
              left: groupNumber <= 3
                ? '0'
                : groupNumber >= 16
                ? 'auto'
                : '50%',
              right: groupNumber >= 16 ? '0' : 'auto',
              transform:
                groupNumber <= 3 || groupNumber >= 16
                  ? 'none'
                  : 'translateX(-50%)',
              width: '210px',
            }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
          >
            <div
              className="rounded-sm border p-3 shadow-xl"
              style={{
                background: 'rgb(var(--color-raised))',
                borderColor: 'rgba(var(--overlay),0.12)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              }}
            >
              {/* Header line */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-mono text-xs text-secondary">
                  Group {groupNumber}
                </span>
                <span className="font-mono text-xs text-secondary opacity-50 tracking-wide">
                  {info.iupacName}
                </span>
              </div>

              {/* Name */}
              <p className="font-sans font-semibold text-bright text-sm leading-tight mb-2">
                {info.name}
              </p>

              {/* Description */}
              <p
                className="font-sans text-[11px] leading-relaxed"
                style={{ color: 'rgba(var(--overlay),0.5)' }}
              >
                {info.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
