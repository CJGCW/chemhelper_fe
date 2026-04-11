// ── Shared card primitives ────────────────────────────────────────────────────

interface VarRow { symbol: string; meaning: string; unit: string }

function FormulaBox({ primary, rearranged }: { primary: string; rearranged?: string[] }) {
  return (
    <div className="rounded-sm bg-raised border border-border px-4 py-3 mb-3
                    print:bg-gray-50 print:border-gray-200">
      <p className="font-mono text-base font-semibold text-bright print:text-gray-900">{primary}</p>
      {rearranged && (
        <p className="font-mono text-xs text-secondary print:text-gray-500 mt-1">
          {rearranged.join('   |   ')}
        </p>
      )}
    </div>
  )
}

function VarsTable({ rows }: { rows: VarRow[] }) {
  return (
    <table className="w-full text-sm mb-3 border-collapse">
      <thead>
        <tr className="border-b border-border print:border-gray-200">
          <th className="font-mono text-[10px] text-dim print:text-gray-400 uppercase tracking-widest text-left pb-1.5 pr-4">Symbol</th>
          <th className="font-mono text-[10px] text-dim print:text-gray-400 uppercase tracking-widest text-left pb-1.5 pr-4">Quantity</th>
          <th className="font-mono text-[10px] text-dim print:text-gray-400 uppercase tracking-widest text-left pb-1.5">Unit</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.symbol} className="border-b border-border/50 print:border-gray-100 last:border-0">
            <td className="font-mono text-sm text-bright print:text-gray-900 py-1.5 pr-4">{r.symbol}</td>
            <td className="font-sans text-sm text-secondary print:text-gray-600 py-1.5 pr-4">{r.meaning}</td>
            <td className="font-mono text-sm text-dim print:text-gray-500 py-1.5">{r.unit}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Example({ scenario, steps, result }: { scenario: string; steps: string[]; result: string }) {
  return (
    <div className="border-t border-border print:border-gray-200 pt-3">
      <p className="font-mono text-[10px] text-secondary print:text-gray-400 uppercase tracking-widest mb-2">
        Worked Example
      </p>
      <p className="font-sans text-sm text-secondary print:text-gray-700 mb-2">{scenario}</p>
      <div className="flex flex-col gap-1 pl-3 border-l-2 border-border print:border-gray-300">
        {steps.map((s, i) => (
          <p key={i} className="font-mono text-sm text-primary print:text-gray-800">{s}</p>
        ))}
        <p className="font-mono text-sm font-semibold text-emerald-400 print:text-green-700 mt-0.5">
          ∴ {result}
        </p>
      </div>
    </div>
  )
}

function RefCard({ title, formula, rearranged, vars, example }: {
  title: string
  formula: string
  rearranged?: string[]
  vars: VarRow[]
  example: { scenario: string; steps: string[]; result: string }
}) {
  return (
    <div className="rounded-sm border border-border bg-surface p-5
                    print:bg-white print:border-gray-300 print:break-inside-avoid print:rounded-none">
      <div className="flex items-baseline gap-3 mb-3">
        <h3 className="font-sans font-semibold text-bright print:text-gray-900">{title}</h3>
        <span className="font-mono text-sm text-secondary print:text-gray-500">{formula}</span>
      </div>
      <FormulaBox primary={formula} rearranged={rearranged} />
      <VarsTable rows={vars} />
      <Example {...example} />
    </div>
  )
}

// ── Solvent constants table ───────────────────────────────────────────────────

const SOLVENTS = [
  { name: 'Water',    bp: '100.0', fp: '0.0',    Kb: '0.512', Kf: '1.86'  },
  { name: 'Benzene',  bp: '80.1',  fp: '5.5',    Kb: '2.53',  Kf: '5.12'  },
  { name: 'Ethanol',  bp: '78.4',  fp: '−114.1', Kb: '1.22',  Kf: '1.99'  },
  { name: 'Acetic acid', bp: '117.9', fp: '16.6', Kb: '3.07', Kf: '3.90'  },
  { name: 'Cyclohexane', bp: '80.7', fp: '6.5',  Kb: '2.79',  Kf: '20.2'  },
]

function SolventTable() {
  return (
    <div className="rounded-sm border border-border bg-surface p-5
                    print:bg-white print:border-gray-300 print:break-inside-avoid print:rounded-none">
      <h3 className="font-sans font-semibold text-bright print:text-gray-900 mb-3">
        Colligative Constants — Common Solvents
      </h3>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border print:border-gray-200">
            {['Solvent', 'bp (°C)', 'fp (°C)', 'Kb (°C·kg/mol)', 'Kf (°C·kg/mol)'].map(h => (
              <th key={h} className="font-mono text-[10px] text-dim print:text-gray-400 uppercase tracking-wide text-left pb-1.5 pr-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SOLVENTS.map(s => (
            <tr key={s.name} className="border-b border-border/50 print:border-gray-100 last:border-0">
              <td className="font-sans text-sm text-secondary print:text-gray-700 py-1.5 pr-3">{s.name}</td>
              <td className="font-mono text-sm text-primary print:text-gray-800 py-1.5 pr-3">{s.bp}</td>
              <td className="font-mono text-sm text-primary print:text-gray-800 py-1.5 pr-3">{s.fp}</td>
              <td className="font-mono text-sm text-primary print:text-gray-800 py-1.5 pr-3">{s.Kb}</td>
              <td className="font-mono text-sm text-primary print:text-gray-800 py-1.5">{s.Kf}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="font-mono text-[10px] text-dim print:text-gray-400 mt-3">
        Van't Hoff factor i: non-electrolytes i = 1; NaCl i ≈ 2; CaCl₂ i ≈ 3; MgSO₄ i ≈ 2
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MolarReference() {
  return (
    <div className="flex flex-col gap-5 print:max-w-none print:gap-4">

      {/* Print controls */}
      <div className="flex items-center justify-between print:hidden">
        <p className="font-mono text-xs text-dim">Molar Calculations — printable reference</p>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-1.5 rounded-sm font-sans text-sm border border-border
                     text-secondary hover:text-primary hover:border-muted transition-colors"
        >
          <span>⎙</span>
          <span>Print</span>
        </button>
      </div>

      {/* Print-only title */}
      <div className="hidden print:block print:mb-4">
        <h2 className="font-sans font-bold text-2xl text-gray-900">Molar Calculations — Reference Sheet</h2>
        <p className="font-mono text-sm text-gray-500 mt-1">ChemHelper</p>
        <hr className="border-gray-300 mt-3" />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 print:grid-cols-2 print:gap-4">

        <RefCard
          title="Mole Calculations"
          formula="n = m / M"
          rearranged={['m = n × M', 'M = m / n']}
          vars={[
            { symbol: 'n', meaning: 'Amount of substance', unit: 'mol' },
            { symbol: 'm', meaning: 'Mass of substance',   unit: 'g'   },
            { symbol: 'M', meaning: 'Molar mass',          unit: 'g/mol' },
          ]}
          example={{
            scenario: 'How many moles are in 36.04 g of water (M = 18.02 g/mol)?',
            steps: [
              'n = m / M',
              'n = 36.04 g / 18.02 g/mol',
              'n = 2.000 mol',
            ],
            result: 'n = 2.000 mol H₂O',
          }}
        />

        <RefCard
          title="Molarity"
          formula="C = n / V"
          rearranged={['n = C × V', 'V = n / C']}
          vars={[
            { symbol: 'C', meaning: 'Molar concentration', unit: 'mol/L' },
            { symbol: 'n', meaning: 'Moles of solute',     unit: 'mol'   },
            { symbol: 'V', meaning: 'Volume of solution',  unit: 'L'     },
          ]}
          example={{
            scenario: '5.85 g of NaCl (M = 58.44 g/mol) is dissolved in 250.0 mL. Find molarity.',
            steps: [
              'n = m / M = 5.85 / 58.44 = 0.1001 mol NaCl',
              'V = 250.0 mL = 0.2500 L',
              'C = n / V = 0.1001 / 0.2500',
            ],
            result: 'C = 0.4003 mol/L',
          }}
        />

        <RefCard
          title="Molality"
          formula="b = n / m"
          rearranged={['n = b × m', 'm = n / b']}
          vars={[
            { symbol: 'b',  meaning: 'Molality',             unit: 'mol/kg' },
            { symbol: 'n',  meaning: 'Moles of solute',      unit: 'mol'    },
            { symbol: 'm',  meaning: 'Mass of solvent',      unit: 'kg'     },
          ]}
          example={{
            scenario: '10.0 g of glucose (M = 180.2 g/mol) in 200.0 g of water. Find molality.',
            steps: [
              'n = 10.0 / 180.2 = 0.05549 mol glucose',
              'm = 200.0 g = 0.2000 kg',
              'b = 0.05549 / 0.2000',
            ],
            result: 'b = 0.2775 mol/kg',
          }}
        />

        <RefCard
          title="Boiling Point Elevation"
          formula="ΔTb = i × Kb × b"
          vars={[
            { symbol: 'ΔTb', meaning: 'Boiling point elevation', unit: '°C'          },
            { symbol: 'i',   meaning: "Van't Hoff factor",        unit: '—'           },
            { symbol: 'Kb',  meaning: 'Ebullioscopic constant',   unit: '°C·kg/mol'   },
            { symbol: 'b',   meaning: 'Molality of solution',     unit: 'mol/kg'      },
          ]}
          example={{
            scenario: '1.00 mol/kg NaCl (i = 2) dissolved in water (Kb = 0.512). Find ΔTb.',
            steps: [
              'ΔTb = i × Kb × b',
              'ΔTb = 2 × 0.512 × 1.00',
            ],
            result: 'ΔTb = 1.024 °C  →  new bp = 101.024 °C',
          }}
        />

        <RefCard
          title="Freezing Point Depression"
          formula="ΔTf = i × Kf × b"
          vars={[
            { symbol: 'ΔTf', meaning: 'Freezing point depression', unit: '°C'         },
            { symbol: 'i',   meaning: "Van't Hoff factor",          unit: '—'          },
            { symbol: 'Kf',  meaning: 'Cryoscopic constant',        unit: '°C·kg/mol'  },
            { symbol: 'b',   meaning: 'Molality of solution',       unit: 'mol/kg'     },
          ]}
          example={{
            scenario: '0.50 mol/kg glucose (i = 1) in water (Kf = 1.86). Find ΔTf.',
            steps: [
              'ΔTf = i × Kf × b',
              'ΔTf = 1 × 1.86 × 0.50',
            ],
            result: 'ΔTf = 0.93 °C  →  new fp = −0.93 °C',
          }}
        />

        <SolventTable />

        <RefCard
          title="Dilution"
          formula="C₁V₁ = C₂V₂"
          rearranged={['C₂ = C₁V₁ / V₂', 'V₁ = C₂V₂ / C₁']}
          vars={[
            { symbol: 'C₁', meaning: 'Initial concentration', unit: 'mol/L' },
            { symbol: 'V₁', meaning: 'Initial volume',         unit: 'L'     },
            { symbol: 'C₂', meaning: 'Final concentration',   unit: 'mol/L' },
            { symbol: 'V₂', meaning: 'Final volume',           unit: 'L'     },
          ]}
          example={{
            scenario: 'Dilute 25.0 mL of 6.00 mol/L HCl to 150.0 mL. Find final concentration.',
            steps: [
              'C₁V₁ = C₂V₂',
              'C₂ = C₁V₁ / V₂ = (6.00 × 0.0250) / 0.1500',
            ],
            result: 'C₂ = 1.00 mol/L',
          }}
        />

        <RefCard
          title="Mole Fraction"
          formula="χ_A = n_A / n_total"
          rearranged={['n_total = n_A + n_B + …', 'Σ χ = 1']}
          vars={[
            { symbol: 'χ_A',     meaning: 'Mole fraction of A',       unit: '—'   },
            { symbol: 'n_A',     meaning: 'Moles of component A',      unit: 'mol' },
            { symbol: 'n_total', meaning: 'Total moles in mixture',    unit: 'mol' },
          ]}
          example={{
            scenario: '2.00 mol ethanol and 8.00 mol water are mixed. Find χ(ethanol).',
            steps: [
              'n_total = 2.00 + 8.00 = 10.00 mol',
              'χ_ethanol = 2.00 / 10.00',
            ],
            result: 'χ_ethanol = 0.200',
          }}
        />

        <RefCard
          title="Percent Concentration"
          formula="% (m/m) = m_solute / m_solution × 100"
          rearranged={['% (v/v) = V_solute / V_solution × 100', '% (m/v) = m_solute (g) / V_solution (mL) × 100']}
          vars={[
            { symbol: 'm_solute',   meaning: 'Mass of solute',      unit: 'g'  },
            { symbol: 'm_solution', meaning: 'Mass of solution',    unit: 'g'  },
            { symbol: 'V_solution', meaning: 'Volume of solution',  unit: 'mL' },
          ]}
          example={{
            scenario: '15.0 g NaCl dissolved in 135.0 g water. Find mass percent.',
            steps: [
              'm_solution = 15.0 + 135.0 = 150.0 g',
              '% (m/m) = 15.0 / 150.0 × 100',
            ],
            result: '% (m/m) = 10.0%',
          }}
        />

        <RefCard
          title="Osmotic Pressure"
          formula="π = iMRT"
          rearranged={['M = π / (iRT)', 'i = π / (MRT)']}
          vars={[
            { symbol: 'π', meaning: 'Osmotic pressure',          unit: 'atm'             },
            { symbol: 'i', meaning: "Van't Hoff factor",          unit: '—'               },
            { symbol: 'M', meaning: 'Molarity of solution',       unit: 'mol/L'           },
            { symbol: 'R', meaning: 'Ideal gas constant',         unit: '0.08206 L·atm/mol·K' },
            { symbol: 'T', meaning: 'Temperature',                unit: 'K'               },
          ]}
          example={{
            scenario: '0.100 mol/L glucose (i = 1) at 25 °C. Find osmotic pressure.',
            steps: [
              'T = 25 + 273.15 = 298.15 K',
              'π = 1 × 0.100 × 0.08206 × 298.15',
            ],
            result: 'π = 2.45 atm',
          }}
        />

      </div>
    </div>
  )
}
