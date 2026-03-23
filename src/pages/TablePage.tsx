import PeriodicTable from '../components/PeriodicTable/PeriodicTable'

export default function TablePage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="font-sans font-semibold text-bright text-xl">
          Periodic Table
        </h2>
        <p className="font-mono text-xs text-dim mt-1">
          Click any element to view its properties.
          Hover a legend category to highlight that group.
        </p>
      </div>
      <PeriodicTable />
    </div>
  )
}
