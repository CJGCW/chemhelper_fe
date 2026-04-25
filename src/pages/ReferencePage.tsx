import SolubilityReference from '../components/reference/SolubilityReference'
import PageShell from '../components/Layout/PageShell'

export default function ReferencePage() {
  return (
    <PageShell>
      <div className="flex items-center gap-3 print:hidden">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Solubility Rules</h2>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                     text-secondary hover:text-primary hover:border-muted transition-colors"
        >
          <span>⎙</span>
          <span>Print</span>
        </button>
      </div>
      <SolubilityReference />
    </PageShell>
  )
}
