import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 30 } },
}

const DESCRIPTIONS: Record<string, string> = {
  '/calculations/moles':       'Calculate moles, molar mass, or mass using n = m / M.',
  '/calculations/molarity':    'Calculate concentration in moles per litre from moles, mass, or volume.',
  '/calculations/molality':    'Calculate moles of solute per kilogram of solvent.',
  '/calculations/bpe':         'Determine how much a solute raises the boiling point of a solvent.',
  '/calculations/fpd':         'Determine how much a solute lowers the freezing point of a solvent.',
  '/compound':                 'Resolve a SMILES string to molecular formula and molar mass via PubChem.',
}

const ICONS: Record<string, string> = {
  '/calculations/molarity':    '⚗',
  '/calculations/molality':    '⚗',
  '/calculations/bpe':         '△',
  '/calculations/fpd':         '▽',
  '/compound':                 '◈',
}

export default function PlaceholderPage() {
  const { pathname } = useLocation()
  const description = DESCRIPTIONS[pathname] ?? 'Coming soon.'
  const icon = ICONS[pathname] ?? '○'

  return (
    <div className="flex items-center justify-center h-full p-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-md w-full text-center"
      >
        {/* Icon */}
        <motion.div
          variants={item}
          className="font-mono text-5xl mb-6"
          style={{ color: 'var(--c-halogen)' }}
        >
          {icon}
        </motion.div>

        {/* Title */}
        <motion.h2 variants={item} className="font-sans font-semibold text-bright text-xl mb-2">
          Coming Soon
        </motion.h2>

        {/* Description */}
        <motion.p variants={item} className="font-sans text-sm text-secondary leading-relaxed mb-8">
          {description}
        </motion.p>

        {/* Decorative progress bar */}
        <motion.div variants={item} className="h-px w-full bg-border relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full"
            style={{ background: 'var(--c-halogen)', width: '30%' }}
            animate={{ x: ['0%', '300%'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <motion.p variants={item} className="font-mono text-xs text-secondary mt-3 tracking-widest">
          UNDER CONSTRUCTION
        </motion.p>
      </motion.div>
    </div>
  )
}
