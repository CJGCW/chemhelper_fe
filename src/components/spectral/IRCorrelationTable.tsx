const REGIONS = [
  {
    label: 'O–H / N–H Stretches',
    range: '3000–3700 cm⁻¹',
    rows: [
      { group: 'O–H (free)',          range: '3580–3650', intensity: 'strong',   shape: 'sharp',      notes: 'Alcohol, dilute solution' },
      { group: 'O–H (H-bonded)',      range: '3200–3550', intensity: 'strong',   shape: 'broad',      notes: 'Alcohol, neat liquid' },
      { group: 'O–H (acid)',          range: '2500–3300', intensity: 'strong',   shape: 'very broad', notes: 'Carboxylic acid; overlaps C–H region' },
      { group: 'N–H (1° amine)',      range: '3300–3500', intensity: 'medium',   shape: 'two bands',  notes: 'Primary amine' },
      { group: 'N–H (2° amine)',      range: '3300–3500', intensity: 'medium',   shape: 'sharp',      notes: 'Secondary amine; one band' },
    ],
  },
  {
    label: 'C–H Stretches',
    range: '2700–3300 cm⁻¹',
    rows: [
      { group: 'C–H (sp³)',         range: '2850–2960', intensity: 'strong',   shape: 'sharp',     notes: 'Alkyl C–H' },
      { group: 'C–H (sp²)',         range: '3020–3100', intensity: 'medium',   shape: 'sharp',     notes: 'Vinyl / aromatic C–H' },
      { group: 'C–H (sp, alkyne)',  range: '3260–3330', intensity: 'strong',   shape: 'sharp',     notes: 'Terminal alkyne ≡C–H' },
      { group: 'C–H (aldehyde)',    range: '2700–2850', intensity: 'medium',   shape: 'two bands', notes: '~2720 and ~2820 cm⁻¹ (weak)' },
    ],
  },
  {
    label: 'Triple Bonds',
    range: '2100–2260 cm⁻¹',
    rows: [
      { group: 'C≡C',   range: '2100–2260', intensity: 'variable', shape: 'sharp', notes: 'Absent in symmetrical alkynes' },
      { group: 'C≡N',   range: '2200–2260', intensity: 'strong',   shape: 'sharp', notes: 'Nitrile' },
    ],
  },
  {
    label: 'C=O Stretches',
    range: '1630–1815 cm⁻¹',
    rows: [
      { group: 'Ketone',        range: '1705–1720', intensity: 'strong', shape: 'sharp', notes: '' },
      { group: 'Aldehyde',     range: '1720–1740', intensity: 'strong', shape: 'sharp', notes: 'Also shows C–H at 2700–2850' },
      { group: 'Carboxylic acid', range: '1700–1725', intensity: 'strong', shape: 'sharp', notes: 'Paired with broad O–H' },
      { group: 'Ester',         range: '1735–1750', intensity: 'strong', shape: 'sharp', notes: 'Also C–O stretch ~1200' },
      { group: 'Amide',         range: '1630–1690', intensity: 'strong', shape: 'sharp', notes: 'Lower than typical C=O' },
      { group: 'Acyl chloride', range: '1770–1815', intensity: 'strong', shape: 'sharp', notes: 'Highest-frequency carbonyl' },
      { group: 'Anhydride',     range: '1800–1850', intensity: 'strong', shape: 'two bands', notes: '~1820 and ~1760 cm⁻¹' },
    ],
  },
  {
    label: 'C=C Stretches',
    range: '1450–1680 cm⁻¹',
    rows: [
      { group: 'C=C (alkene)',   range: '1620–1680', intensity: 'variable', shape: 'sharp',    notes: 'Weak/absent if symmetrical' },
      { group: 'C=C (aromatic)', range: '1450–1600', intensity: 'variable', shape: 'multiple', notes: 'Usually two bands' },
    ],
  },
  {
    label: 'Fingerprint Region',
    range: '1000–1500 cm⁻¹',
    rows: [
      { group: 'C–O',       range: '1000–1260', intensity: 'strong', shape: 'sharp',     notes: 'Ether, ester, alcohol' },
      { group: 'N=O (nitro)', range: '1500–1570', intensity: 'strong', shape: 'two bands', notes: 'Asymm. stretch; symm. ~1350' },
    ],
  },
]

export default function IRCorrelationTable() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <p className="font-mono text-xs text-secondary">
        Source: Brown &amp; Foote, <em>Organic Chemistry</em>, Table 12.3. Ranges are approximate.
      </p>

      {REGIONS.map(region => (
        <div key={region.label} className="flex flex-col gap-2">
          <div className="flex items-baseline gap-3">
            <h3 className="font-sans font-semibold text-sm text-primary">
              {region.label}
            </h3>
            <span className="font-mono text-xs text-dim">{region.range}</span>
          </div>

          <table className="w-full text-xs font-sans border-collapse">
            <thead>
              <tr style={{ background: 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))' }}>
                {['Functional Group', 'Wavenumber (cm⁻¹)', 'Intensity', 'Shape', 'Notes'].map(h => (
                  <th key={h} className="text-left px-3 py-1.5 font-mono text-[10px] text-secondary tracking-wider uppercase border-b border-border">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {region.rows.map((row, i) => (
                <tr key={row.group}
                  style={{ background: i % 2 === 0 ? 'rgb(var(--color-surface))' : 'rgb(var(--color-raised))' }}
                  className="border-b border-border/50">
                  <td className="px-3 py-1.5 text-primary font-medium">{row.group}</td>
                  <td className="px-3 py-1.5 font-mono text-secondary">{row.range}</td>
                  <td className="px-3 py-1.5 text-secondary capitalize">{row.intensity}</td>
                  <td className="px-3 py-1.5 text-secondary">{row.shape}</td>
                  <td className="px-3 py-1.5 text-dim">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
