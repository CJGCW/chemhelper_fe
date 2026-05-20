import { useRef, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import CompoundDisplay from './CompoundDisplay'

interface HoverPreviewProps {
  smiles: string
  label?: string
  width?: number
  height?: number
  delay?: number
  children: React.ReactNode
}

interface Coords { top: number; left: number }

export default function HoverPreview({
  smiles,
  label,
  width = 200,
  height = 140,
  delay = 150,
  children,
}: HoverPreviewProps) {
  const triggerRef = useRef<HTMLSpanElement>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [open, setOpen]       = useState(false)
  const [coords, setCoords]   = useState<Coords>({ top: 0, left: 0 })
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(hover: none)').matches)
  }, [])

  const computeCoords = useCallback((): Coords => {
    const el = triggerRef.current
    if (!el) return { top: 0, left: 0 }
    const rect = el.getBoundingClientRect()
    const pad = 8
    const previewW = width + 16   // p-2 = 8px each side
    const previewH = height + 16

    let left = rect.right + pad
    if (left + previewW > window.innerWidth - pad) {
      left = rect.left - previewW - pad
    }

    let top = rect.top
    if (top + previewH > window.innerHeight - pad) {
      top = rect.bottom - previewH
    }
    top = Math.max(pad, top)

    return { top: top + window.scrollY, left }
  }, [width, height])

  // Desktop: pointer enter/leave
  const handlePointerEnter = useCallback(() => {
    if (isTouchDevice) return
    timerRef.current = setTimeout(() => {
      setCoords(computeCoords())
      setOpen(true)
    }, delay)
  }, [isTouchDevice, delay, computeCoords])

  const handlePointerLeave = useCallback(() => {
    if (isTouchDevice) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpen(false)
  }, [isTouchDevice])

  // Touch: click to toggle + outside-click close
  const handleClick = useCallback(() => {
    if (!isTouchDevice) return
    if (open) {
      setOpen(false)
    } else {
      setCoords(computeCoords())
      setOpen(true)
    }
  }, [isTouchDevice, open, computeCoords])

  useEffect(() => {
    if (!isTouchDevice || !open) return
    const listener = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [isTouchDevice, open])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const preview = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50 rounded-sm border border-border shadow-lg p-2 pointer-events-none print:hidden"
          style={{
            top: coords.top,
            left: coords.left,
            background: 'rgb(var(--color-raised))',
          }}
        >
          <CompoundDisplay smiles={smiles} label={label} width={width} height={height} />
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <span
        ref={triggerRef}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        {children}
      </span>
      {typeof document !== 'undefined' && createPortal(preview, document.body)}
    </>
  )
}
