import { useEffect } from 'react'
import { useElementStore } from '../stores/elementStore'
import EmpiricalPractice from '../components/empirical/EmpiricalPractice'

export default function EmpiricalPracticePage() {
  const loadElements = useElementStore(s => s.loadElements)
  const loading = useElementStore(s => s.loading)
  const error = useElementStore(s => s.error)

  useEffect(() => { loadElements() }, [loadElements])

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">
      <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Empirical Formula Practice</h2>
      {loading && <p className="font-mono text-xs text-dim animate-pulse">Loading element data…</p>}
      {error   && <p className="font-sans text-xs" style={{ color: '#f87171' }}>Failed to load elements: {error}</p>}
      {!loading && !error && <EmpiricalPractice />}
    </div>
  )
}
