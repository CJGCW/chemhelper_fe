import SpectrumViewer from './SpectrumViewer'
import type { Peak } from './SpectrumViewer'

interface EstimateResult {
  smiles: string
  molecular_formula: string
  molecular_weight: number
  degrees_unsaturation: number
  ir: Peak[]
  nmr_1h: Peak[]
  nmr_13c: Peak[]
  ms: Peak[]
}

interface Props {
  result: EstimateResult
  structureSvgUrl: string | null
}

export default function SpectrumPrintSheet({ result, structureSvgUrl }: Props) {
  return (
    <div className="hidden print:block print-sheet">
      {/* Header */}
      <header className="text-center border-b border-gray-300 pb-3 mb-4">
        <h1 className="text-base font-semibold">Estimated Spectra — ChemHelper</h1>
      </header>

      {/* Compound info */}
      <section className="mb-4 flex gap-4 items-start">
        {structureSvgUrl && (
          <img src={structureSvgUrl} alt="structure" style={{ width: 200, height: 120, objectFit: 'contain' }} />
        )}
        <div className="text-xs space-y-0.5">
          <div>Formula: <span className="font-mono font-semibold">{result.molecular_formula}</span></div>
          <div>MW: {result.molecular_weight.toFixed(2)} g/mol</div>
          <div>Degrees of unsaturation: {result.degrees_unsaturation}</div>
          <div className="mt-2 text-gray-500">SMILES: <span className="font-mono text-[10px]">{result.smiles}</span></div>
        </div>
      </section>

      <p className="text-[10px] text-gray-400 italic mb-4">
        Estimates are based on standard correlation tables (Brown &amp; Foote, Organic Chemistry).
        Real spectra may differ slightly from these ranges.
      </p>

      <PrintSpectrumRow type="ir"       label="IR (cm⁻¹)"      peaks={result.ir}      xUnit="cm⁻¹" />
      <PrintSpectrumRow type="1h_nmr"   label="¹H NMR (ppm)"   peaks={result.nmr_1h}  xUnit="ppm"  />
      <PrintSpectrumRow type="13c_nmr"  label="¹³C NMR (ppm)"  peaks={result.nmr_13c} xUnit="ppm"  />
      <PrintSpectrumRow type="mass_spec" label="MS (m/z)"      peaks={result.ms}      xUnit="m/z"  />
    </div>
  )
}

function PrintSpectrumRow({
  type, label, peaks, xUnit,
}: {
  type: 'ir' | '1h_nmr' | '13c_nmr' | 'mass_spec'
  label: string
  peaks: Peak[]
  xUnit: string
}) {
  return (
    <section className="mb-5 break-inside-avoid">
      <h2 className="text-xs font-semibold border-b border-gray-200 pb-0.5 mb-1">{label}</h2>
      <SpectrumViewer type={type} peaks={peaks} width={640} height={120} />
      {peaks.length > 0 && (
        <ul className="mt-1.5 text-[10px] space-y-0.5 columns-2">
          {peaks.map((p, i) => (
            <li key={i} className="break-inside-avoid">
              •{' '}
              <span className="font-mono">
                {type === 'ir' ? Math.round(p.x) : type === 'mass_spec' ? Math.round(p.x) : p.x.toFixed(1)} {xUnit}
              </span>
              {p.splitting && (
                <span className="text-gray-500"> ({p.splitting}{p.integration ? `, ${p.integration}H` : ''})</span>
              )}
              {': '}
              {p.label}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
