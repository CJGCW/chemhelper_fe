import { motion, AnimatePresence } from 'framer-motion'

type VerifyState = true | false | 'sig_fig_warning' | null | undefined

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
  const isCorrect   = verified === true
  const isIncorrect = verified === false

  const borderColor = !hasVerification
    ? (value ? 'color-mix(in srgb, var(--c-halogen) 35%, #1c1f2e)' : '#1c1f2e')
    : isSFWarning
    ? 'color-mix(in srgb, #facc15 45%, #1c1f2e)'
    : isCorrect
    ? 'color-mix(in srgb, #4ade80 45%, #1c1f2e)'
    : 'color-mix(in srgb, #f87171 45%, #1c1f2e)'

  const bgColor = !hasVerification
    ? (value ? 'color-mix(in srgb, var(--c-halogen) 6%, #0e1016)' : '#0e1016')
    : isSFWarning
    ? 'color-mix(in srgb, #facc15 5%, #0e1016)'
    : isCorrect
    ? 'color-mix(in srgb, #4ade80 6%, #0e1016)'
    : 'color-mix(in srgb, #f87171 6%, #0e1016)'

  const verifyColor  = isSFWarning ? '#facc15' : isCorrect ? '#4ade80' : '#f87171'
  const verifyBorder = isSFWarning
    ? 'color-mix(in srgb, #facc15 20%, transparent)'
    : isCorrect
    ? 'color-mix(in srgb, #4ade80 20%, transparent)'
    : 'color-mix(in srgb, #f87171 20%, transparent)'
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
