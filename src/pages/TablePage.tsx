import PeriodicTable from '../components/PeriodicTable/PeriodicTable'

export default function TablePage() {
  return (
    <div className="px-2 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
      <div className="mb-4 md:mb-6">
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
