const FRAGMENTS = [
  { mass: 1,  formula: 'H',             diagnostic: '' },
  { mass: 15, formula: 'CH₃',           diagnostic: 'Methyl group' },
  { mass: 17, formula: 'OH',            diagnostic: 'Alcohol (less common)' },
  { mass: 18, formula: 'H₂O',          diagnostic: 'Alcohol, carboxylic acid' },
  { mass: 27, formula: 'HCN',          diagnostic: 'Aromatic nitrile, pyridine' },
  { mass: 28, formula: 'CO / C₂H₄',   diagnostic: 'Aldehyde, ketone / ethyl compound' },
  { mass: 29, formula: 'CHO / C₂H₅', diagnostic: 'Aldehyde / ethyl group' },
  { mass: 31, formula: 'OCH₃',         diagnostic: 'Methyl ester, methyl ether' },
  { mass: 32, formula: 'CH₃OH',        diagnostic: 'Methyl ester' },
  { mass: 43, formula: 'COCH₃ / C₃H₇', diagnostic: 'Methyl ketone / propyl group' },
  { mass: 44, formula: 'CO₂ / CH₂=CHOH', diagnostic: 'Carboxylic acid / enol' },
  { mass: 45, formula: 'OC₂H₅',       diagnostic: 'Ethyl ester' },
  { mass: 57, formula: 'C₄H₉',         diagnostic: 'tert-Butyl or n-butyl group' },
  { mass: 77, formula: 'C₆H₅',         diagnostic: 'Monosubstituted benzene' },
  { mass: 91, formula: 'C₇H₇⁺',       diagnostic: 'Tropylium / benzyl cation' },
]

export default function FragmentationTable() {
  return (
    <div className="flex flex-col gap-4 max-w-3xl print:max-w-none">
      <p className="font-mono text-xs text-secondary">
        Common neutral losses in EI mass spectrometry. Calculate m/z = M⁺ − mass lost.
      </p>

      <table className="w-full text-xs font-sans border-collapse">
        <thead>
          <tr style={{ background: 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))' }}>
            {['Mass Lost', 'Fragment', 'Diagnostic For'].map(h => (
              <th key={h} className="text-left px-3 py-1.5 font-mono text-[10px] text-secondary tracking-wider uppercase border-b border-border">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FRAGMENTS.map((row, i) => (
            <tr key={row.mass}
              style={{ background: i % 2 === 0 ? 'rgb(var(--color-surface))' : 'rgb(var(--color-raised))' }}
              className="border-b border-border/50">
              <td className="px-3 py-1.5 font-mono text-primary font-semibold">{row.mass}</td>
              <td className="px-3 py-1.5 font-mono text-secondary">{row.formula}</td>
              <td className="px-3 py-1.5 text-dim">{row.diagnostic || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="rounded-sm border border-border p-3 text-xs font-sans text-secondary"
        style={{ background: 'rgb(var(--color-raised))' }}>
        <strong className="text-primary">Key ions:</strong> M⁺ = molecular ion (highest m/z); base peak = most abundant ion (tallest bar).
        Common rearrangements: tropylium (m/z 91) from benzyl systems; loss of 29 often indicates an aldehyde; loss of 15 + 29 suggests a methyl ketone.
      </div>
    </div>
  )
}
