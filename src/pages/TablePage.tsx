import PeriodicTable from '../components/PeriodicTable/PeriodicTable'
import PageShell from '../components/Layout/PageShell'

export default function TablePage() {
  return (
    <PageShell>
      <div>
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">
          Periodic Table
        </h2>
        <p className="font-mono text-xs text-dim mt-1">
          Click any element to view its properties.
          Hover a legend category to highlight that group.
        </p>
      </div>
      <PeriodicTable />
    </PageShell>
  )
}
