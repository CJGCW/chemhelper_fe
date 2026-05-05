const H_NMR_ROWS = [
  { proton: 'R–CH₃',                  range: '0.8–1.0',   example: 'Ethane CH₃' },
  { proton: 'R₂CH₂',                  range: '1.2–1.4',   example: 'Propane CH₂' },
  { proton: 'R₃CH',                   range: '1.4–1.7',   example: 'Cyclopentane' },
  { proton: 'Allylic (C=C–CH)',        range: '1.6–1.9',   example: 'Propene CH₃' },
  { proton: 'C≡C–H (terminal alkyne)', range: '1.8–2.5',   example: 'Propyne' },
  { proton: 'CO–CH (α to C=O)',        range: '2.0–2.5',   example: 'Acetone CH₃' },
  { proton: 'X–CH (X = halogen)',      range: '2.5–4.0',   example: 'CH₃Cl' },
  { proton: 'RO–CH (ether)',           range: '3.3–3.9',   example: 'Diethyl ether' },
  { proton: '=CH– (vinyl)',            range: '4.6–5.3',   example: 'Ethylene' },
  { proton: 'Ar–H',                    range: '6.5–8.5',   example: 'Benzene' },
  { proton: 'R–CHO (aldehyde)',        range: '9.5–10.0',  example: 'Acetaldehyde' },
  { proton: 'RCOOH',                   range: '10–12',     example: 'Acetic acid' },
  { proton: 'R–OH (alcohol)',          range: '1–5',       example: 'Variable; depends on conc.' },
  { proton: 'Ar–OH (phenol)',          range: '4–12',      example: 'Phenol' },
  { proton: 'R–NH (amine)',            range: '0.5–5',     example: 'Variable; often broad' },
]

const C_NMR_ROWS = [
  { carbon: 'R–CH₃ / R₂CH₂ / R₃CH (alkyl)', range: '0–50'   },
  { carbon: 'C–O (ether, ester, alcohol)',    range: '50–90'  },
  { carbon: 'C=C (alkene)',                   range: '100–150' },
  { carbon: 'Aromatic C',                    range: '110–160' },
  { carbon: 'C=O (aldehyde / ketone)',        range: '190–220' },
  { carbon: 'C=O (acid / ester / amide)',     range: '160–185' },
]

export default function NMRShiftTable() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <p className="font-mono text-xs text-secondary">
        Source: Brown &amp; Foote, <em>Organic Chemistry</em>, Table 13.3. All values in ppm (δ).
      </p>

      {/* ¹H NMR table */}
      <div className="flex flex-col gap-2">
        <h3 className="font-sans font-semibold text-sm text-primary">¹H NMR Chemical Shifts</h3>
        <table className="w-full text-xs font-sans border-collapse">
          <thead>
            <tr style={{ background: 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))' }}>
              {['Proton Type', 'δ Range (ppm)', 'Example'].map(h => (
                <th key={h} className="text-left px-3 py-1.5 font-mono text-[10px] text-secondary tracking-wider uppercase border-b border-border">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {H_NMR_ROWS.map((row, i) => (
              <tr key={row.proton}
                style={{ background: i % 2 === 0 ? 'rgb(var(--color-surface))' : 'rgb(var(--color-raised))' }}
                className="border-b border-border/50">
                <td className="px-3 py-1.5 text-primary font-medium font-mono">{row.proton}</td>
                <td className="px-3 py-1.5 font-mono text-secondary">{row.range}</td>
                <td className="px-3 py-1.5 text-dim">{row.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ¹³C NMR table */}
      <div className="flex flex-col gap-2">
        <h3 className="font-sans font-semibold text-sm text-primary">¹³C NMR Chemical Shifts</h3>
        <p className="font-mono text-xs text-dim">Broadband-decoupled (all singlets).</p>
        <table className="w-full text-xs font-sans border-collapse">
          <thead>
            <tr style={{ background: 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))' }}>
              {['Carbon Type', 'δ Range (ppm)'].map(h => (
                <th key={h} className="text-left px-3 py-1.5 font-mono text-[10px] text-secondary tracking-wider uppercase border-b border-border">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {C_NMR_ROWS.map((row, i) => (
              <tr key={row.carbon}
                style={{ background: i % 2 === 0 ? 'rgb(var(--color-surface))' : 'rgb(var(--color-raised))' }}
                className="border-b border-border/50">
                <td className="px-3 py-1.5 text-primary font-medium font-mono">{row.carbon}</td>
                <td className="px-3 py-1.5 font-mono text-secondary">{row.range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
