const VP_TABLE = [
  { substance: 'Water (H₂O)',            vp: 23.8,  bp: 100 },
  { substance: 'Ethanol (C₂H₅OH)',       vp: 59.0,  bp: 78.4 },
  { substance: 'Diethyl ether',          vp: 534,   bp: 34.6 },
  { substance: 'Benzene (C₆H₆)',         vp: 95.2,  bp: 80.1 },
  { substance: 'Acetone ((CH₃)₂CO)',     vp: 229,   bp: 56.1 },
  { substance: 'Methanol (CH₃OH)',        vp: 127,   bp: 64.7 },
  { substance: 'Chloroform (CHCl₃)',     vp: 199,   bp: 61.2 },
  { substance: 'Mercury (Hg)',            vp: 0.0017, bp: 357 },
]

export default function VaporPressureReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Vapor Pressure</p>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Vapor pressure is the pressure exerted by a vapor in equilibrium with its liquid (or solid) phase
          at a given temperature. It reflects how readily molecules escape the liquid surface.
          Higher temperature → higher vapor pressure.
        </p>
      </div>

      {/* Key concepts */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Key Concepts</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              title: 'Boiling point',
              body: 'Temperature at which vapor pressure equals atmospheric pressure. At higher altitude (lower P), liquids boil at lower temperatures.',
            },
            {
              title: 'Temperature dependence',
              body: 'Vapor pressure rises exponentially with temperature. Described quantitatively by the Clausius–Clapeyron equation (see Clausius–Clapeyron tab).',
            },
            {
              title: 'Intermolecular forces',
              body: 'Stronger IMFs (more H-bonding, larger dispersion forces) → lower vapor pressure → higher boiling point.',
            },
            {
              title: 'Raoult\'s Law (solutions)',
              body: 'P_A = x_A × P°_A.  Vapor pressure of a component in an ideal mixture equals its mole fraction times its pure-component vapor pressure.',
            },
          ].map(c => (
            <div key={c.title} className="flex flex-col gap-2 p-3 rounded-sm border border-border"
              style={{ background: 'rgb(var(--color-surface))' }}>
              <span className="font-sans text-xs font-semibold text-primary">{c.title}</span>
              <p className="font-sans text-xs text-secondary leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* VP table */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Vapor Pressure at 25 °C (mmHg)</p>
        <div className="overflow-x-auto rounded-sm border border-border" style={{ background: 'rgb(var(--color-base))' }}>
          <table className="w-full border-collapse text-xs font-mono">
            <thead>
              <tr style={{ background: 'rgba(var(--overlay),0.03)' }}>
                {['Substance', 'VP at 25 °C (mmHg)', 'Normal bp (°C)'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VP_TABLE.map(r => (
                <tr key={r.substance} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-primary">{r.substance}</td>
                  <td className="px-4 py-2 font-semibold" style={{ color: 'var(--c-halogen)' }}>{r.vp}</td>
                  <td className="px-4 py-2 text-secondary">{r.bp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-sans text-xs text-dim">Values from Chang 14e Table 11.5 and CRC Handbook.</p>
      </div>

    </div>
  )
}
