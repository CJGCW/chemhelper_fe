import { motion, AnimatePresence } from 'framer-motion'
import type { VerifyState } from '../../utils/calcHelpers'

interface Props {
  label: string
  value: string | null
  unit: string
  sigFigsValue?: string | null
  verified?: VerifyState
  verifyMessage?: string  // optional override message from page
}

export default function ResultDisplay({ label, value, unit, sigFigsValue, verified, verifyMessage }: Props) {
  const hasVerification = verified !== null && verified !== undefined
  const isSFWarning = verified === 'sig_fig_warning'
  const isCorrect   = verified === 'correct'
  const isIncorrect = verified === 'incorrect'

  const successToken = 'rgb(var(--color-success))'
  const errorToken   = 'rgb(var(--color-error))'
  const warningToken = 'rgb(var(--color-warning))'

  const borderColor = !hasVerification
    ? (value ? 'color-mix(in srgb, var(--c-halogen) 35%, rgb(var(--color-border)))' : 'rgb(var(--color-border))')
    : isSFWarning
    ? `color-mix(in srgb, ${warningToken} 45%, rgb(var(--color-border)))`
    : isCorrect
    ? `color-mix(in srgb, ${successToken} 45%, rgb(var(--color-border)))`
    : `color-mix(in srgb, ${errorToken} 45%, rgb(var(--color-border)))`

  const bgColor = !hasVerification
    ? (value ? 'color-mix(in srgb, var(--c-halogen) 6%, rgb(var(--color-surface)))' : 'rgb(var(--color-surface))')
    : isSFWarning
    ? `color-mix(in srgb, ${warningToken} 5%, rgb(var(--color-surface)))`
    : isCorrect
    ? `color-mix(in srgb, ${successToken} 6%, rgb(var(--color-surface)))`
    : `color-mix(in srgb, ${errorToken} 6%, rgb(var(--color-surface)))`

  const verifyColor  = isSFWarning ? warningToken : isCorrect ? successToken : errorToken
  const verifyBorder = isSFWarning
    ? `color-mix(in srgb, ${warningToken} 20%, transparent)`
    : isCorrect
    ? `color-mix(in srgb, ${successToken} 20%, transparent)`
    : `color-mix(in srgb, ${errorToken} 20%, transparent)`
  const verifyIcon   = isSFWarning ? '⚠' : isCorrect ? '✓' : '✗'
  const verifyLabel  = isSFWarning
    ? 'Correct value — check sig figs'
    : isCorrect
    ? 'Correct!'
    : 'Check your calculation'

  return (
    <div
      className="flex flex-col gap-2 p-5 rounded-sm border"
      style={{ borderColor, background: bgColor, transition: 'border-color 0.25s, background 0.25s' }}
    >
      {/* Label */}
      <span className="font-sans text-sm font-medium text-secondary">{label}</span>

      {/* Value row */}
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-baseline gap-3 flex-wrap"
          >
            <span className="font-mono text-3xl font-semibold" style={{ color: 'var(--c-halogen)' }}>
              {value}
            </span>
            <span className="font-mono text-base text-secondary">{unit}</span>
            {sigFigsValue && sigFigsValue !== value && (
              <span className="font-mono text-sm" style={{ color: '#f97316' }}>
                = <span className="font-semibold">{sigFigsValue}</span> {unit} with sig figs
              </span>
            )}
          </motion.div>
        ) : (
          <motion.span key="empty" className="font-mono text-3xl text-muted">—</motion.span>
        )}
      </AnimatePresence>

      {/* Verification badge */}
      <AnimatePresence>
        {hasVerification && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 pt-2 border-t mt-1"
            style={{ borderColor: verifyBorder }}
          >
            <span className="text-lg leading-none mt-0.5">{verifyIcon}</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-sans text-sm font-medium" style={{ color: verifyColor }}>
                {verifyMessage ?? verifyLabel}
              </span>
              {isSFWarning && value && (
                <span className="font-mono text-xs text-dim">
                  Answer rounds to <span style={{ color: verifyColor }}>{value} {unit}</span> — check the number of significant figures in your moles value.
                </span>
              )}
              {isIncorrect && value && (
                <span className="font-mono text-xs text-dim">
                  Expected ≈ {value} {unit}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
