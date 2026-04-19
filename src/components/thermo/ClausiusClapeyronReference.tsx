const R_VAL = 8.314

const REARRANGED = [
  {
    solve: 'P₂',
    formula: 'P₂ = P₁ · exp[−(ΔH_vap / R) · (1/T₂ − 1/T₁)]',
    use: 'Vapor pressure at a new temperature',
  },
  {
    solve: 'P₁',
    formula: 'P₁ = P₂ · exp[+(ΔH_vap / R) · (1/T₂ − 1/T₁)]',
    use: 'Pressure at the reference temperature',
  },
  {
    solve: 'T₂',
    formula: '1/T₂ = 1/T₁ − (R / ΔH_vap) · ln(P₂/P₁)',
    use: 'Boiling/condensation point at a new pressure',
  },
  {
    solve: 'T₁',
    formula: '1/T₁ = 1/T₂ + (R / ΔH_vap) · ln(P₂/P₁)',
    use: 'Reference temperature from a known point',
  },
  {
    solve: 'ΔH_vap',
    formula: 'ΔH_vap = −R · ln(P₂/P₁) / (1/T₂ − 1/T₁)',
    use: 'Enthalpy of vaporization from two (T, P) pairs',
  },
]

const SUBSTANCES = [
  { name: 'Water',          formula: 'H₂O',         dHvap: 40.7,  bp: 100.0  },
  { name: 'Ethanol',        formula: 'C₂H₅OH',      dHvap: 38.6,  bp: 78.4   },
  { name: 'Methanol',       formula: 'CH₃OH',        dHvap: 35.3,  bp: 64.7   },
  { name: 'Benzene',        formula: 'C₆H₆',         dHvap: 30.7,  bp: 80.1   },
  { name: 'Diethyl ether',  formula: '(C₂H₅)₂O',    dHvap: 27.1,  bp: 34.6   },
  { name: 'Acetone',        formula: '(CH₃)₂CO',     dHvap: 31.3,  bp: 56.1   },
  { name: 'Chloroform',     formula: 'CHCl₃',        dHvap: 31.4,  bp: 61.2   },
  { name: 'Ammonia',        formula: 'NH₃',          dHvap: 23.35, bp: -33.4  },
  { name: 'Cyclohexane',    formula: 'C₆H₁₂',       dHvap: 29.9,  bp: 80.7   },
  { name: 'Acetic acid',    formula: 'CH₃COOH',      dHvap: 51.6,  bp: 117.9  },
]

const NOTES = [
  {
    title: 'Temperatures must be in Kelvin',
    body: '1/T appears in the equation — always convert °C to K (add 273.15) before substituting.',
  },
  {
    title: 'Pressures appear as a ratio ln(P₂/P₁)',
    body: 'Any consistent pressure unit cancels. atm, kPa, mmHg all work — just use the same unit for both.',
  },
  {
    title: 'ΔH_vap is assumed constant',
    body: 'This is the integrated form of the Clausius-Clapeyron equation. It assumes ΔH_vap does not change with temperature — a good approximation over modest T ranges.',
  },
  {
    title: 'Vapor pressure increases with temperature',
    body: 'Since ΔH_vap > 0, a higher T gives a higher P. A substance boils when its vapor pressure equals external pressure.',
  },
  {
    title: 'Slope of ln P vs. 1/T gives −ΔH_vap / R',
    body: 'Plotting ln(P) on the y-axis vs. 1/T on the x-axis gives a straight line with slope = −ΔH_vap / R.',
  },
]

export default function ClausiusClapeyronReference() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl print:max-w-none print:text-black">

      {/* Master equation */}
      <div className="rounded-sm border border-border bg-surface p-5 flex flex-col gap-4">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Clausius-Clapeyron Equation</span>
        <div className="flex flex-col gap-1">
          <p className="font-mono text-base lg:text-lg text-bright" style={{ color: 'var(--c-halogen)' }}>
            ln(P₂/P₁) = −(ΔH_vap / R) × (1/T₂ − 1/T₁)
          </p>
          <p className="font-mono text-xs text-dim mt-1">
            Integrated two-point form · assumes ΔH_vap constant over the T range
          </p>
        </div>

        {/* Variable key */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 pt-1 border-t border-border">
          {[
            { sym: 'P₁',     desc: 'Vapor pressure at T₁',                    unit: 'any consistent unit' },
            { sym: 'P₂',     desc: 'Vapor pressure at T₂',                    unit: 'same unit as P₁'     },
            { sym: 'T₁',     desc: 'Initial temperature',                      unit: 'Kelvin'              },
            { sym: 'T₂',     desc: 'Final temperature',                        unit: 'Kelvin'              },
            { sym: 'ΔH_vap', desc: 'Molar enthalpy of vaporization',           unit: 'J/mol'               },
            { sym: 'R',      desc: `Gas constant (${R_VAL} J·mol⁻¹·K⁻¹)`,     unit: 'J/(mol·K)'           },
          ].map(v => (
            <div key={v.sym} className="flex flex-col gap-0.5">
              <span className="font-mono text-xs font-semibold" style={{ color: 'var(--c-halogen)' }}>{v.sym}</span>
              <span className="font-sans text-[11px] text-secondary">{v.desc}</span>
              <span className="font-mono text-xs text-secondary">{v.unit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rearranged forms */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Solving for Each Variable</span>
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-3 py-2 text-left text-dim font-normal w-16">Solve</th>
                <th className="px-3 py-2 text-left text-dim font-normal">Formula</th>
                <th className="px-3 py-2 text-left text-dim font-normal hidden sm:table-cell">Typical use</th>
              </tr>
            </thead>
            <tbody>
              {REARRANGED.map(r => (
                <tr key={r.solve} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 font-semibold" style={{ color: 'var(--c-halogen)' }}>{r.solve}</td>
                  <td className="px-3 py-2 text-secondary">{r.formula}</td>
                  <td className="px-3 py-2 text-dim hidden sm:table-cell">{r.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ΔHvap table */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">
          Common ΔH_vap Values at Normal Boiling Point
        </span>
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-3 py-2 text-left text-dim font-normal">Substance</th>
                <th className="px-3 py-2 text-left text-dim font-normal">Formula</th>
                <th className="px-3 py-2 text-right text-dim font-normal">bp (°C)</th>
                <th className="px-3 py-2 text-right text-dim font-normal">ΔH_vap (kJ/mol)</th>
              </tr>
            </thead>
            <tbody>
              {SUBSTANCES.map(s => (
                <tr key={s.name} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 text-primary">{s.name}</td>
                  <td className="px-3 py-2 text-secondary">{s.formula}</td>
                  <td className="px-3 py-2 text-right text-secondary">{s.bp.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right" style={{ color: 'var(--c-halogen)' }}>{s.dHvap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-sans text-xs text-secondary px-0.5">
          Values at 1 atm. ΔH_vap decreases slightly with temperature and reaches zero at the critical point.
        </p>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Key Notes</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {NOTES.map(n => (
            <div key={n.title}
              className="flex flex-col gap-1.5 px-4 py-3 rounded-sm bg-raised border border-border">
              <span className="font-sans text-sm font-semibold text-bright">{n.title}</span>
              <span className="font-sans text-xs text-secondary leading-relaxed">{n.body}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
