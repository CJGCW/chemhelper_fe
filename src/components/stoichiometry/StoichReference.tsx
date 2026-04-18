import StoichExamples from './StoichExamples'

// ── Shared card primitives ────────────────────────────────────────────────────

function FormulaBox({ lines }: { lines: string[] }) {
  return (
    <div className="rounded-sm bg-raised border border-border px-4 py-3 mb-3
                    print:bg-gray-50 print:border-gray-200">
      {lines.map((l, i) => (
        <p key={i} className={`font-mono print:text-gray-900 ${i === 0 ? 'text-base font-semibold text-bright' : 'text-xs text-secondary print:text-gray-500 mt-0.5'}`}>
          {l}
        </p>
      ))}
    </div>
  )
}

function Example({ scenario, steps, result }: { scenario: string; steps: string[]; result: string }) {
  return (
    <div className="border-t border-border print:border-gray-200 pt-3">
      <p className="font-mono text-[10px] text-secondary print:text-gray-400 uppercase tracking-widest mb-2">
        Worked Example
      </p>
      <p className="font-sans text-sm text-secondary print:text-gray-700 mb-2 italic">{scenario}</p>
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

function RefCard({ title, formulaLines, notes, example }: {
  title: string
  formulaLines: string[]
  notes?: string[]
  example: { scenario: string; steps: string[]; result: string }
}) {
  return (
    <div className="rounded-sm border border-border bg-surface p-5
                    print:bg-white print:border-gray-300 print:break-inside-avoid print:rounded-none">
      <h3 className="font-sans font-semibold text-bright print:text-gray-900 mb-3">{title}</h3>
      <FormulaBox lines={formulaLines} />
      {notes && (
        <ul className="mb-3 flex flex-col gap-1">
          {notes.map((n, i) => (
            <li key={i} className="font-sans text-sm text-secondary print:text-gray-600 flex gap-2">
              <span className="text-dim print:text-gray-400 shrink-0">•</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      )}
      <Example {...example} />
    </div>
  )
}

// ── Equation balancing reference ──────────────────────────────────────────────

function BalancingCard() {
  const steps = [
    'Write the unbalanced equation with correct formulas',
    'Count atoms of each element on each side',
    'Add coefficients (never change subscripts) to balance',
    'Balance metals first, then nonmetals, then H, finally O',
    'Verify: atom count left = atom count right for all elements',
    'Reduce coefficients to lowest whole-number ratio',
  ]
  return (
    <div className="rounded-sm border border-border bg-surface p-5
                    print:bg-white print:border-gray-300 print:break-inside-avoid print:rounded-none">
      <h3 className="font-sans font-semibold text-bright print:text-gray-900 mb-3">Equation Balancing</h3>
      <div className="rounded-sm bg-raised border border-border px-4 py-3 mb-3
                      print:bg-gray-50 print:border-gray-200">
        <p className="font-mono text-sm text-secondary print:text-gray-500">
          Law of Conservation of Mass: atoms in = atoms out
        </p>
        <p className="font-mono text-sm text-secondary print:text-gray-500 mt-1">
          Only coefficients may change — never subscripts
        </p>
      </div>
      <ul className="flex flex-col gap-1.5 mb-3">
        {steps.map((s, i) => (
          <li key={i} className="font-sans text-sm text-secondary print:text-gray-600 flex gap-2">
            <span className="font-mono text-[10px] text-dim print:text-gray-400 shrink-0 mt-0.5">{i + 1}.</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-border print:border-gray-200 pt-3">
        <p className="font-mono text-[10px] text-secondary print:text-gray-400 uppercase tracking-widest mb-2">
          Worked Example
        </p>
        <p className="font-sans text-sm text-secondary print:text-gray-700 mb-2 italic">
          Balance: Fe + O₂ → Fe₂O₃
        </p>
        <div className="flex flex-col gap-1 pl-3 border-l-2 border-border print:border-gray-300">
          <p className="font-mono text-sm text-primary print:text-gray-800">Fe: 1 left vs 2 right → need coefficient 4 on Fe</p>
          <p className="font-mono text-sm text-primary print:text-gray-800">O: 2 left vs 3 right → need coefficient 3 on O₂, 2 on Fe₂O₃</p>
          <p className="font-mono text-sm text-primary print:text-gray-800">Check: Fe 4 = 4 ✓, O 6 = 6 ✓</p>
          <p className="font-mono text-sm font-semibold text-emerald-400 print:text-green-700 mt-0.5">
            ∴ 4 Fe + 3 O₂ → 2 Fe₂O₃
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Roadmap diagram ───────────────────────────────────────────────────────────

function RoadmapCard() {
  return (
    <div className="rounded-sm border border-border bg-surface p-5
                    print:bg-white print:border-gray-300 print:break-inside-avoid print:rounded-none">
      <h3 className="font-sans font-semibold text-bright print:text-gray-900 mb-3">
        Mass-to-Mass Roadmap
      </h3>
      <div className="flex flex-col gap-2">
        {[
          ['Given mass of A (g)', '÷ molar mass of A', 'Moles of A (mol)'],
          ['Moles of A (mol)',    '× (coeff B / coeff A)', 'Moles of B (mol)'],
          ['Moles of B (mol)',    '× molar mass of B', 'Mass of B (g)'],
        ].map(([from, op, to], i) => (
          <div key={i} className="flex items-center gap-2 text-sm font-mono">
            <span className="text-secondary print:text-gray-600 shrink-0">{from}</span>
            <span className="text-dim print:text-gray-400 shrink-0">→</span>
            <span className="text-[10px] text-secondary print:text-gray-500 italic shrink-0">[{op}]</span>
            <span className="text-dim print:text-gray-400 shrink-0">→</span>
            <span className="text-bright print:text-gray-900 shrink-0">{to}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-border print:border-gray-200 pt-3 mt-3">
        <p className="font-mono text-[10px] text-secondary print:text-gray-400 uppercase tracking-widest mb-1">
          Key conversions
        </p>
        <p className="font-mono text-sm text-primary print:text-gray-800">mol = g ÷ M (g/mol)</p>
        <p className="font-mono text-sm text-primary print:text-gray-800">g = mol × M (g/mol)</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export type RefTopic = 'stoich' | 'limiting' | 'theoretical' | 'percent' | 'balance' | 'solution' | 'gas-stoich'

export default function StoichReference({ section = 'guide', topic }: { section?: 'guide' | 'visual'; topic?: RefTopic }) {
  if (section === 'visual') return <StoichExamples />

  const show = (t: RefTopic) => !topic || topic === t

  return (
    <div className="flex flex-col gap-5 print:max-w-none print:gap-4">

      {/* Print-only title */}
      <div className="hidden print:block print:mb-4">
        <h2 className="font-sans font-bold text-2xl text-gray-900">Stoichiometry — Reference Sheet</h2>
        <p className="font-mono text-sm text-gray-500 mt-1">ChemHelper</p>
        <hr className="border-gray-300 mt-3" />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 print:grid-cols-2 print:gap-4">

        {show('stoich') && <RefCard
          title="Stoichiometry (Mole Ratio)"
          formulaLines={[
            'mol B = mol A × (coeff B / coeff A)',
            'mol A = given mass (g) ÷ molar mass A (g/mol)',
          ]}
          example={{
            scenario: 'How many moles of CO₂ form when 2.00 mol CH₄ burns? (CH₄ + 2O₂ → CO₂ + 2H₂O)',
            steps: [
              'mol CO₂ = mol CH₄ × (1/1)',
              'mol CO₂ = 2.00 × 1',
            ],
            result: '2.00 mol CO₂',
          }}
        />}

        {show('stoich') && <RoadmapCard />}

        {show('stoich') && <RefCard
          title="Mass-to-Mass"
          formulaLines={[
            'g B = (g A ÷ M_A) × (coeff B / coeff A) × M_B',
          ]}
          example={{
            scenario: 'How many grams of CO₂ form from 32.0 g CH₄? (CH₄ + 2O₂ → CO₂ + 2H₂O)',
            steps: [
              'mol CH₄ = 32.0 g ÷ 16.04 g/mol = 1.995 mol',
              'mol CO₂ = 1.995 × (1/1) = 1.995 mol',
              'g CO₂ = 1.995 × 44.01 g/mol',
            ],
            result: '87.8 g CO₂',
          }}
        />}

        {show('limiting') && <RefCard
          title="Limiting Reagent"
          formulaLines={[
            'available ratio = mol A / coeff A',
            'Limiting reagent: species with smallest available ratio',
            'Excess remaining = mol excess − mol excess used',
          ]}
          notes={[
            'Convert all reactant masses to moles first',
            'The LR determines how much product can form',
            'The excess reagent has leftover moles after reaction',
          ]}
          example={{
            scenario: '28.0 g N₂ and 9.09 g H₂ mixed. (N₂ + 3H₂ → 2NH₃) Which is limiting?',
            steps: [
              'mol N₂ = 28.0 / 28.01 = 0.9996 mol; ratio = 0.9996/1 = 0.9996',
              'mol H₂ = 9.09 / 2.016 = 4.509 mol; ratio = 4.509/3 = 1.503',
              '0.9996 < 1.503 → N₂ limits',
            ],
            result: 'N₂ is the limiting reagent',
          }}
        />}

        {show('theoretical') && <RefCard
          title="Theoretical Yield"
          formulaLines={[
            'mol product = mol LR × (coeff product / coeff LR)',
            'g product = mol product × M product',
          ]}
          example={{
            scenario: '0.9996 mol N₂ is the limiting reagent. Find theoretical yield of NH₃.',
            steps: [
              'mol NH₃ = 0.9996 × (2/1) = 1.999 mol',
              'g NH₃ = 1.999 × 17.03 g/mol',
            ],
            result: '34.05 g NH₃',
          }}
        />}

        {show('percent') && <RefCard
          title="Percent Yield"
          formulaLines={[
            '% yield = (actual yield / theoretical yield) × 100',
            'Actual yield: mass of product collected in lab',
            'Theoretical yield: max possible from stoichiometry',
          ]}
          notes={[
            'Percent yield ≤ 100% (actual cannot exceed theoretical)',
            'Low % yield may indicate side reactions or losses',
          ]}
          example={{
            scenario: 'Theoretical yield of NH₃ = 34.05 g. Student collects 9.85 g. Find % yield.',
            steps: [
              '% yield = (actual / theoretical) × 100',
              '% yield = (9.85 / 34.05) × 100',
            ],
            result: '% yield = 28.9%',
          }}
        />}

        {show('balance') && <BalancingCard />}

        {show('balance') && <RefCard
          title="Avogadro's Number / Particle Conversions"
          formulaLines={[
            'N = n × Nₐ',
            'Nₐ = 6.022 × 10²³ mol⁻¹',
            'n = N / Nₐ',
          ]}
          example={{
            scenario: 'How many molecules are in 2.50 mol of CO₂?',
            steps: [
              'N = n × Nₐ',
              'N = 2.50 × 6.022 × 10²³',
            ],
            result: 'N = 1.506 × 10²⁴ molecules',
          }}
        />}

        {show('balance') && <RefCard
          title="Percent Composition"
          formulaLines={[
            '% element = (n × M_element / M_compound) × 100',
            'n = number of atoms of that element in formula',
          ]}
          notes={[
            'Sum of all percent compositions = 100%',
            'Use molar masses from the periodic table',
          ]}
          example={{
            scenario: 'Find the percent composition of oxygen in H₂SO₄ (M = 98.08 g/mol).',
            steps: [
              '4 O atoms: mass = 4 × 16.00 = 64.00 g/mol',
              '% O = (64.00 / 98.08) × 100',
            ],
            result: '% O = 65.25%',
          }}
        />}

        {show('solution') && <RefCard
          title="Solution Stoichiometry"
          formulaLines={[
            'n = C × V',
            'Use n as the bridge between solution data and stoichiometry',
            'mol product = mol reactant × (coeff product / coeff reactant)',
          ]}
          notes={[
            'Convert V to litres before using C × V',
            'Apply the mole ratio from the balanced equation',
          ]}
          example={{
            scenario: '25.0 mL of 0.200 mol/L HCl reacts with NaOH. How many moles of NaOH are needed? (HCl + NaOH → NaCl + H₂O)',
            steps: [
              'n(HCl) = C × V = 0.200 × 0.0250 = 0.00500 mol',
              'mole ratio HCl : NaOH = 1 : 1',
              'n(NaOH) = 0.00500 mol',
            ],
            result: 'n(NaOH) = 5.00 × 10⁻³ mol',
          }}
        />}

        {show('gas-stoich') && <RefCard
          title="Gas Stoichiometry"
          formulaLines={[
            'PV = nRT   (R = 0.08206 L·atm/mol·K)',
            'n = PV / RT',
            'At STP (0 °C, 1 atm): molar volume = 22.4 L/mol',
          ]}
          notes={[
            'Convert T to Kelvin: T(K) = T(°C) + 273.15',
            'At STP use 22.4 L/mol for quick conversions',
            'Apply mole ratio after finding n from PV = nRT',
          ]}
          example={{
            scenario: 'What volume of CO₂ (at STP) is produced from 1.00 mol CH₄? (CH₄ + 2O₂ → CO₂ + 2H₂O)',
            steps: [
              'mol CO₂ = mol CH₄ × (1/1) = 1.00 mol',
              'V = n × 22.4 L/mol (at STP)',
              'V = 1.00 × 22.4',
            ],
            result: 'V = 22.4 L CO₂',
          }}
        />}

      </div>

    </div>
  )
}
