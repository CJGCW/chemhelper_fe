import PeriodicTable from '../components/PeriodicTable/PeriodicTable'

export default function TablePage() {
  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full">
      <div className="mb-4 md:mb-6">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">
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
