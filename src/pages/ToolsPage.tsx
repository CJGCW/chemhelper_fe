import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import KetcherGuide from '../components/vsepr/KetcherGuide'

type Tool = 'ketcher'

const TOOLS: { id: Tool; label: string; formula: string }[] = [
  { id: 'ketcher', label: 'Ketcher Editor', formula: '✎' },
]

export default function ToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTool = (searchParams.get('tool') as Tool) ?? 'ketcher'

  function setTool(tool: Tool) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tool', tool)
      return next
    })
  }

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">

      {/* Header */}
      <div className="flex flex-col gap-3">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Tools & References</h2>

        {/* Tool tabs */}
        <div className="flex items-center gap-1 p-1 rounded-sm self-start flex-wrap"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          {TOOLS.map(tool => {
            const isActive = activeTool === tool.id
            return (
              <button key={tool.id} onClick={() => setTool(tool.id)}
                className="relative flex-shrink-0 px-3.5 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}>
                {isActive && (
                  <motion.div layoutId="tools-tab-pill" className="absolute inset-0 rounded-sm"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                )}
                <span className="relative z-10">{tool.label}</span>
                <span className="relative z-10 font-mono text-[10px] ml-1.5 opacity-50">{tool.formula}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTool === 'ketcher' && (
          <motion.div key="ketcher"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <KetcherGuide />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
