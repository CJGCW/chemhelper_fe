import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
  to: string
  label: string
  icon: string
  group?: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/table',                    label: 'Periodic Table', icon: '⬡', group: 'Reference' },
  { to: '/calculations/molarity',    label: 'Molarity',       icon: '⚗', group: 'Calculations' },
  { to: '/calculations/molality',    label: 'Molality',       icon: '⚗' },
  { to: '/calculations/bpe',         label: 'Boiling Point',  icon: '△' },
  { to: '/calculations/fpd',         label: 'Freezing Point', icon: '▽' },
  { to: '/compound',                 label: 'Compound',       icon: '◈', group: 'Tools' },
]

interface Props {
  open: boolean
  onClose: () => void
}

function NavGroup({ label }: { label: string }) {
  return (
    <div className="px-4 pt-5 pb-1.5">
      <span className="font-mono text-[9px] tracking-[0.15em] text-dim uppercase">
        {label}
      </span>
    </div>
  )
}

function NavItem({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-4 py-2 mx-2 rounded-sm font-sans text-sm
         transition-all duration-150 group
         ${isActive
           ? 'bg-raised text-bright border border-border'
           : 'text-secondary hover:text-primary hover:bg-surface border border-transparent'
         }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className="font-mono text-base leading-none shrink-0 w-4 text-center"
            style={{ color: isActive ? 'var(--c-halogen)' : undefined }}
          >
            {item.icon}
          </span>
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function NavSidebar({ open, onClose }: Props) {
  const groups = NAV_ITEMS.reduce<{ group?: string; item: NavItem }[]>((acc, item) => {
    acc.push({ group: item.group, item })
    return acc
  }, [])

  const inner = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border shrink-0">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-lg font-semibold" style={{ color: 'var(--c-halogen)' }}>
            ⚛
          </span>
          <span className="font-sans font-semibold text-bright tracking-tight">
            Chem<span style={{ color: 'var(--c-halogen)' }}>Helper</span>
          </span>
        </div>
        <p className="font-mono text-[9px] text-dim mt-0.5 tracking-wider">
          CHEMISTRY TOOLKIT
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-2">
        {groups.map(({ group, item }) => (
          <div key={item.to}>
            {group && <NavGroup label={group} />}
            <NavItem item={item} />
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border shrink-0">
        <p className="font-mono text-[9px] text-dim text-center tracking-widest">
          v0.1.0
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop: always visible */}
      <aside className="hidden md:flex flex-col w-52 shrink-0 bg-surface border-r border-border h-screen sticky top-0">
        {inner}
      </aside>

      {/* Mobile: drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="nav-backdrop"
              className="fixed inset-0 bg-black/60 z-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              key="nav-drawer"
              className="fixed top-0 left-0 h-full w-52 bg-surface border-r border-border z-50 md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            >
              {inner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
