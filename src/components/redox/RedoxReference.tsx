// ── Shared primitives ────────────────────────────────────────────────────────

function SectionHead({ label }: { label: string }) {
  return <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">{label}</h3>
}

function FormulaBox({ lines }: { lines: string[] }) {
  return (
    <div className="rounded-sm bg-raised border border-border px-4 py-3 mb-3 print:bg-gray-50 print:border-gray-200">
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
      <p className="font-mono text-xs text-secondary print:text-gray-400 uppercase tracking-widest mb-2">Worked Example</p>
      <p className="font-sans text-sm text-secondary print:text-gray-700 mb-2 italic">{scenario}</p>
      <div className="flex flex-col gap-1 pl-3 border-l-2 border-border print:border-gray-300">
        {steps.map((s, i) => (
          <p key={i} className="font-mono text-sm text-primary print:text-gray-800">{s}</p>
        ))}
        <p className="font-mono text-sm font-semibold text-emerald-400 print:text-green-700 mt-0.5">∴ {result}</p>
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
    <div className="rounded-sm border border-border bg-surface p-5 print:bg-white print:border-gray-300 print:break-inside-avoid print:rounded-none">
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

// ── Static reference data ─────────────────────────────────────────────────────

const METALS_REF = [
  { symbol: 'Li', name: 'Lithium',   ion: 'Li⁺',  waterRxn: 'Cold water (violent)', aboveH2: true  },
  { symbol: 'K',  name: 'Potassium', ion: 'K⁺',   waterRxn: 'Cold water (violent)', aboveH2: true  },
  { symbol: 'Ba', name: 'Barium',    ion: 'Ba²⁺', waterRxn: 'Cold water',           aboveH2: true  },
  { symbol: 'Ca', name: 'Calcium',   ion: 'Ca²⁺', waterRxn: 'Cold water',           aboveH2: true  },
  { symbol: 'Na', name: 'Sodium',    ion: 'Na⁺',  waterRxn: 'Cold water (violent)', aboveH2: true  },
  { symbol: 'Mg', name: 'Magnesium', ion: 'Mg²⁺', waterRxn: 'Hot water / steam',    aboveH2: true  },
  { symbol: 'Al', name: 'Aluminum',  ion: 'Al³⁺', waterRxn: 'Steam only',           aboveH2: true  },
  { symbol: 'Mn', name: 'Manganese', ion: 'Mn²⁺', waterRxn: 'Steam only',           aboveH2: true  },
  { symbol: 'Zn', name: 'Zinc',      ion: 'Zn²⁺', waterRxn: 'Steam only',           aboveH2: true  },
  { symbol: 'Cr', name: 'Chromium',  ion: 'Cr³⁺', waterRxn: 'Steam only',           aboveH2: true  },
  { symbol: 'Fe', name: 'Iron',      ion: 'Fe²⁺', waterRxn: 'Steam only',           aboveH2: true  },
  { symbol: 'Ni', name: 'Nickel',    ion: 'Ni²⁺', waterRxn: 'Acid only',            aboveH2: true  },
  { symbol: 'Sn', name: 'Tin',       ion: 'Sn²⁺', waterRxn: 'Acid only',            aboveH2: true  },
  { symbol: 'Pb', name: 'Lead',      ion: 'Pb²⁺', waterRxn: 'Acid only',            aboveH2: true  },
  { symbol: 'H₂', name: 'Hydrogen',  ion: 'H⁺',   waterRxn: '—',                   aboveH2: false, isDivider: true },
  { symbol: 'Cu', name: 'Copper',    ion: 'Cu²⁺', waterRxn: 'No reaction',          aboveH2: false },
  { symbol: 'Ag', name: 'Silver',    ion: 'Ag⁺',  waterRxn: 'No reaction',          aboveH2: false },
  { symbol: 'Hg', name: 'Mercury',   ion: 'Hg²⁺', waterRxn: 'No reaction',          aboveH2: false },
  { symbol: 'Pt', name: 'Platinum',  ion: 'Pt²⁺', waterRxn: 'No reaction',          aboveH2: false },
  { symbol: 'Au', name: 'Gold',      ion: 'Au³⁺', waterRxn: 'No reaction',          aboveH2: false },
] as const

const HALOGENS_REF = [
  { formula: 'F₂',  ion: 'F⁻',  name: 'Fluorine',  displaces: 'Cl⁻, Br⁻, I⁻' },
  { formula: 'Cl₂', ion: 'Cl⁻', name: 'Chlorine',  displaces: 'Br⁻, I⁻'      },
  { formula: 'Br₂', ion: 'Br⁻', name: 'Bromine',   displaces: 'I⁻'            },
  { formula: 'I₂',  ion: 'I⁻',  name: 'Iodine',    displaces: '—'             },
]

const OXIDATION_RULES = [
  { rule: 'Free elements',          value: '0',            example: 'Na(s), O₂(g), Fe(s) → all 0'       },
  { rule: 'Monatomic ions',         value: '= ion charge', example: 'Na⁺ → +1 · Fe²⁺ → +2'            },
  { rule: 'Fluorine',               value: '−1 always',    example: 'HF, CF₄, BF₃'                      },
  { rule: 'Oxygen',                 value: '−2 usually',   example: 'Exception: peroxides (H₂O₂) = −1'  },
  { rule: 'Hydrogen (w/ nonmetal)', value: '+1',           example: 'HCl, H₂O, NH₃'                     },
  { rule: 'Hydrogen (w/ metal)',    value: '−1',           example: 'NaH, CaH₂ (metal hydrides)'        },
  { rule: 'Halogens (Cl, Br, I)',   value: '−1 usually',  example: 'Exception: when bonded to O or F'   },
  { rule: 'Group 1 metals',         value: '+1 always',    example: 'Li, Na, K, Rb, Cs'                 },
  { rule: 'Group 2 metals',         value: '+2 always',    example: 'Mg, Ca, Sr, Ba'                    },
  { rule: 'Neutral molecule',       value: 'sum = 0',      example: 'H₂O: 2(+1) + (−2) = 0 ✓'         },
  { rule: 'Polyatomic ion',         value: 'sum = charge', example: 'SO₄²⁻: S + 4(−2) = −2 → S = +6'  },
]

const REACTION_TYPES = [
  {
    type: 'Precipitation',
    symbol: '↓',
    description: 'Two soluble ionic compounds exchange ions to form an insoluble precipitate.',
    conditions: ['Both reactants must be soluble', 'Product must be insoluble (check solubility rules)', 'Write net ionic equation omitting spectator ions'],
    example: 'AgNO₃(aq) + NaCl(aq) → AgCl(s)↓ + NaNO₃(aq)',
    net: 'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)',
  },
  {
    type: 'Acid–Base (Neutralization)',
    symbol: '⇌',
    description: 'An acid donates H⁺ to a base. Strong acid + strong base → water + salt.',
    conditions: ['Strong acid + strong base → complete reaction', 'Weak acid or base → equilibrium reaction', 'Gas-forming: carbonates, sulfides, sulfites + acid'],
    example: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
    net: 'H⁺(aq) + OH⁻(aq) → H₂O(l)',
  },
  {
    type: 'Gas-Forming',
    symbol: '↑',
    description: 'Acid reacts with a salt to release a gas (CO₂, H₂S, SO₂, NH₃, or H₂).',
    conditions: ['Carbonate/bicarbonate + acid → CO₂(g)', 'Sulfide + acid → H₂S(g)', 'Sulfite + acid → SO₂(g)', 'Ammonium salt + base → NH₃(g)'],
    example: 'CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)↑',
    net: 'CaCO₃(s) + 2H⁺(aq) → Ca²⁺(aq) + H₂O(l) + CO₂(g)',
  },
  {
    type: 'Single Displacement (Redox)',
    symbol: '→',
    description: 'A more active metal (or halogen) displaces a less active one from its salt solution.',
    conditions: ['Metal must be above the displaced metal in the activity series', 'Metal must be above H₂ to displace it from acid', 'More active halogen displaces less active halide'],
    example: 'Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)',
    net: 'Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)',
  },
]

const STRONG_ACIDS = ['HCl — Hydrochloric acid', 'HBr — Hydrobromic acid', 'HI — Hydroiodic acid', 'HNO₃ — Nitric acid', 'H₂SO₄ — Sulfuric acid', 'HClO₄ — Perchloric acid']
const STRONG_BASES = ['NaOH — Sodium hydroxide', 'KOH — Potassium hydroxide', 'Ca(OH)₂ — Calcium hydroxide', 'Ba(OH)₂ — Barium hydroxide']

const REDUCTION_POTENTIALS = [
  { half: 'F₂(g) + 2e⁻ → 2F⁻',                   e0: '+2.87' },
  { half: 'MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O',    e0: '+1.51' },
  { half: 'Cl₂(g) + 2e⁻ → 2Cl⁻',                  e0: '+1.36' },
  { half: 'Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ + 7H₂O', e0: '+1.33' },
  { half: 'O₂(g) + 4H⁺ + 4e⁻ → 2H₂O',             e0: '+1.23' },
  { half: 'Ag⁺ + e⁻ → Ag(s)',                       e0: '+0.80' },
  { half: 'Fe³⁺ + e⁻ → Fe²⁺',                       e0: '+0.77' },
  { half: 'I₂(s) + 2e⁻ → 2I⁻',                     e0: '+0.54' },
  { half: 'Cu²⁺ + 2e⁻ → Cu(s)',                     e0: '+0.34' },
  { half: '2H⁺ + 2e⁻ → H₂(g)',                      e0:  '0.00', ref: true },
  { half: 'Fe²⁺ + 2e⁻ → Fe(s)',                     e0: '−0.44' },
  { half: 'Zn²⁺ + 2e⁻ → Zn(s)',                     e0: '−0.76' },
  { half: 'Al³⁺ + 3e⁻ → Al(s)',                     e0: '−1.66' },
  { half: 'Mg²⁺ + 2e⁻ → Mg(s)',                     e0: '−2.37' },
  { half: 'Li⁺ + e⁻ → Li(s)',                       e0: '−3.05' },
]

// ── Per-topic sections ────────────────────────────────────────────────────────

export type RefTopic = 'oxidation' | 'reaction-types' | 'activity' | 'acids-bases' | 'redox-concepts'

function OxidationSection() {
  return (
    <div className="flex flex-col gap-8">

      <div className="flex flex-col gap-2">
        <SectionHead label="Oxidation State Rules" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2">
          {OXIDATION_RULES.map(r => (
            <div key={r.rule} className="rounded-sm border border-border bg-surface p-3 flex flex-col gap-1 print:border-gray-300 print:bg-white print:p-2 print:break-inside-avoid">
              <div className="flex items-start justify-between gap-2">
                <span className="font-sans text-sm font-semibold text-bright print:text-black">{r.rule}</span>
                <span
                  className="font-mono text-xs px-1.5 py-0.5 rounded-sm shrink-0"
                  style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))', color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
                >{r.value}</span>
              </div>
              <p className="font-mono text-xs text-secondary print:text-gray-600">{r.example}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 print:grid-cols-2">
        <RefCard
          title="Assigning Oxidation States"
          formulaLines={[
            'sum of all oxidation states = overall charge',
            'apply priority rules top-to-bottom; solve for unknown',
          ]}
          notes={[
            'Priority: F first, then O, then H, then group metals, then unknown',
            'For ions, the sum equals the ionic charge (not zero)',
          ]}
          example={{
            scenario: 'Find the oxidation state of Cr in K₂Cr₂O₇.',
            steps: [
              'K is +1 always (Group 1): 2 × (+1) = +2',
              'O is −2 usually: 7 × (−2) = −14',
              'Net charge = 0: +2 + 2(Cr) + (−14) = 0',
              '2(Cr) = +12',
            ],
            result: 'Cr = +6',
          }}
        />
        <RefCard
          title="Identifying Redox Changes"
          formulaLines={[
            'oxidation: oxidation state increases (loses e⁻)',
            'reduction: oxidation state decreases (gains e⁻)',
          ]}
          notes={[
            'Both processes must occur simultaneously (OIL RIG)',
            'The species oxidised is the reducing agent',
            'The species reduced is the oxidising agent',
          ]}
          example={{
            scenario: 'In Zn + CuSO₄ → ZnSO₄ + Cu, identify what is oxidised and reduced.',
            steps: [
              'Zn: 0 → +2 (increase) — oxidised; Zn is the reducing agent',
              'Cu: +2 → 0 (decrease) — reduced; Cu²⁺ is the oxidising agent',
            ],
            result: 'Zn oxidised · Cu²⁺ reduced',
          }}
        />
      </div>
    </div>
  )
}

function ReactionTypesSection() {
  return (
    <div className="flex flex-col gap-8">

      <div className="flex flex-col gap-2">
        <SectionHead label="Reaction Types" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
          {REACTION_TYPES.map(rt => (
            <div key={rt.type} className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2 print:border-gray-300 print:bg-white print:p-3 print:break-inside-avoid">
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-sm font-bold w-7 h-7 rounded-sm flex items-center justify-center shrink-0"
                  style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, rgb(var(--color-raised)))', color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
                >{rt.symbol}</span>
                <h4 className="font-sans text-sm font-semibold text-bright print:text-black">{rt.type}</h4>
              </div>
              <p className="font-sans text-sm text-primary leading-relaxed print:text-gray-800">{rt.description}</p>
              <ul className="flex flex-col gap-0.5 mt-1">
                {rt.conditions.map(c => (
                  <li key={c} className="font-sans text-xs text-secondary flex gap-1.5 print:text-gray-600">
                    <span className="text-dim shrink-0 mt-0.5">•</span>{c}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2 border-t border-border print:border-gray-200">
                <p className="font-mono text-xs text-secondary print:text-gray-600">{rt.example}</p>
                <p className="font-mono text-xs text-dim mt-0.5 print:text-gray-500">Net: {rt.net}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 print:grid-cols-2">
        <RefCard
          title="Predicting Precipitation"
          formulaLines={[
            'mix two ionic solutions → check if any product is insoluble',
            'insoluble product forms a precipitate (↓)',
          ]}
          notes={[
            'Most nitrates (NO₃⁻) and Group 1 salts are soluble',
            'Most chlorides soluble — except AgCl, PbCl₂, Hg₂Cl₂',
            'Most sulfates soluble — except BaSO₄, PbSO₄, CaSO₄',
            'All carbonates and phosphates insoluble (except Group 1)',
          ]}
          example={{
            scenario: 'Will a precipitate form when Pb(NO₃)₂(aq) and KI(aq) are mixed?',
            steps: [
              'Possible products: PbI₂ and KNO₃',
              'KNO₃: soluble (Group 1 + nitrate)',
              'PbI₂: insoluble (lead halide exception)',
            ],
            result: 'Yes — PbI₂(s) precipitates',
          }}
        />
        <RefCard
          title="Net Ionic Equations"
          formulaLines={[
            'full molecular → complete ionic → cancel spectators → net ionic',
          ]}
          notes={[
            'Split all soluble strong electrolytes into their ions',
            'Keep solids (s), liquids (l), and gases (g) as molecular formulas',
            'Spectator ions appear identically on both sides — cancel them',
          ]}
          example={{
            scenario: 'Write the net ionic equation for AgNO₃(aq) + NaCl(aq).',
            steps: [
              'Complete ionic: Ag⁺ + NO₃⁻ + Na⁺ + Cl⁻ → AgCl(s) + Na⁺ + NO₃⁻',
              'Cancel spectators: Na⁺ and NO₃⁻ appear on both sides',
            ],
            result: 'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)',
          }}
        />
      </div>
    </div>
  )
}

function ActivitySection() {
  return (
    <div className="flex flex-col gap-8">

      <div className="flex flex-col gap-2">
        <SectionHead label="Activity Series — Metals" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse print:text-xs">
            <thead>
              <tr className="border-b border-border print:border-gray-300">
                <th className="font-mono text-xs uppercase tracking-widest text-secondary text-left py-2 pr-3 print:text-gray-500">#</th>
                <th className="font-mono text-xs uppercase tracking-widest text-secondary text-left py-2 pr-4 print:text-gray-500">Metal</th>
                <th className="font-mono text-xs uppercase tracking-widest text-secondary text-left py-2 pr-4 print:text-gray-500">Ion</th>
                <th className="font-mono text-xs uppercase tracking-widest text-secondary text-left py-2 pr-4 print:text-gray-500">Water Reaction</th>
                <th className="font-mono text-xs uppercase tracking-widest text-secondary text-left py-2 print:text-gray-500">Reacts w/ Dilute Acid</th>
              </tr>
            </thead>
            <tbody>
              {METALS_REF.map((m, i) => {
                const isDivider = 'isDivider' in m && m.isDivider
                return (
                  <tr
                    key={m.symbol}
                    className={`border-b print:border-gray-200 ${isDivider
                      ? 'border-b-2 border-dashed border-border bg-surface/50 print:border-gray-400 print:bg-gray-50'
                      : 'border-border hover:bg-surface/40'}`}
                  >
                    <td className="font-mono text-xs text-dim py-1.5 pr-3 print:text-gray-400">{isDivider ? '—' : i + 1}</td>
                    <td className="py-1.5 pr-4">
                      <span className="font-mono text-sm font-bold text-bright print:text-black">{m.symbol}</span>
                      <span className="font-sans text-xs text-secondary ml-2 print:text-gray-600">{m.name}</span>
                    </td>
                    <td className="font-mono text-sm text-secondary py-1.5 pr-4 print:text-gray-600">{m.ion}</td>
                    <td className={`font-sans text-xs py-1.5 pr-4 ${
                      m.waterRxn === 'Cold water (violent)' ? 'text-red-400 print:text-red-700' :
                      m.waterRxn === 'Cold water'           ? 'text-orange-400 print:text-orange-700' :
                      m.waterRxn === 'Hot water / steam'    ? 'text-yellow-400 print:text-yellow-700' :
                      m.waterRxn === 'Steam only'           ? 'text-lime-400 print:text-lime-700' :
                      m.waterRxn === 'Acid only'            ? 'text-blue-400 print:text-blue-700' :
                      'text-dim print:text-gray-400'}`}>{m.waterRxn}</td>
                    <td className="font-sans text-xs py-1.5">
                      {isDivider
                        ? <span className="text-dim print:text-gray-400">— H₂ reference line —</span>
                        : m.aboveH2
                          ? <span className="text-green-400 print:text-green-700">Yes</span>
                          : <span className="text-dim print:text-gray-400">No</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionHead label="Activity Series — Halogens" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
          {HALOGENS_REF.map((h, i) => (
            <div key={h.formula} className="rounded-sm border border-border bg-surface p-3 flex flex-col gap-1 print:border-gray-300 print:bg-white print:p-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-dim print:text-gray-400">{i + 1}</span>
                <span className="font-mono text-base font-bold text-bright print:text-black">{h.formula}</span>
              </div>
              <p className="font-sans text-xs text-secondary print:text-gray-600">{h.name}</p>
              <p className="font-sans text-xs text-dim mt-1 print:text-gray-500">
                Ion: <span className="font-mono text-secondary print:text-gray-600">{h.ion}</span>
              </p>
              <p className="font-sans text-xs text-dim print:text-gray-500">
                Displaces: <span className="font-mono text-secondary print:text-gray-600">{h.displaces}</span>
              </p>
            </div>
          ))}
        </div>
        <p className="font-sans text-xs text-secondary print:text-gray-600">
          A more active halogen (higher in the list) will displace a less active halide ion from solution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 print:grid-cols-2">
        <RefCard
          title="Predicting Displacement Reactions"
          formulaLines={[
            'reaction occurs if metal A is above metal B in the series',
            'A(s) + B⁺(aq) → A⁺(aq) + B(s)',
          ]}
          notes={[
            'Metals above H₂ react with dilute acids to produce H₂(g)',
            'Metals below H₂ do not displace hydrogen from acids',
            'More active metal is the reducing agent (it gets oxidised)',
          ]}
          example={{
            scenario: 'Will iron displace copper from CuSO₄(aq)?',
            steps: [
              'Fe is above Cu in the activity series',
              'Fe(s) + Cu²⁺(aq) → Fe²⁺(aq) + Cu(s)',
              'Fe: 0 → +2 (oxidised) · Cu²⁺: +2 → 0 (reduced)',
            ],
            result: 'Yes — reaction occurs; Fe is the reducing agent',
          }}
        />
        <RefCard
          title="Metal Reactivity with Acids"
          formulaLines={[
            'metal + dilute acid → salt + H₂(g)  (if metal is above H₂)',
            'M(s) + 2HCl(aq) → MCl₂(aq) + H₂(g)',
          ]}
          notes={[
            'Only metals above H₂ in the activity series react',
            'More active metals react more vigorously',
            'Conc. H₂SO₄ and conc. HNO₃ are oxidising acids — different products',
          ]}
          example={{
            scenario: 'Write the equation for zinc reacting with dilute HCl.',
            steps: [
              'Zn is above H₂ → reaction occurs',
              'Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)',
              'Net ionic: Zn(s) + 2H⁺(aq) → Zn²⁺(aq) + H₂(g)',
            ],
            result: 'H₂(g) produced; Zn²⁺ goes into solution',
          }}
        />
      </div>
    </div>
  )
}

function AcidsBasesSection() {
  return (
    <div className="flex flex-col gap-8">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
        <div className="flex flex-col gap-2">
          <SectionHead label="Strong Acids" />
          <div className="rounded-sm border border-border bg-surface overflow-hidden print:border-gray-300 print:bg-white">
            {STRONG_ACIDS.map((a, i) => (
              <div key={a} className={`px-4 py-2 flex items-center gap-3 ${i < STRONG_ACIDS.length - 1 ? 'border-b border-border print:border-gray-200' : ''}`}>
                <span className="font-mono text-sm text-bright print:text-black">{a.split(' — ')[0]}</span>
                <span className="font-sans text-xs text-secondary print:text-gray-600">{a.split(' — ')[1]}</span>
              </div>
            ))}
          </div>
          <p className="font-sans text-xs text-secondary print:text-gray-600">Dissociate completely in water: HA → H⁺ + A⁻</p>
        </div>
        <div className="flex flex-col gap-2">
          <SectionHead label="Strong Bases" />
          <div className="rounded-sm border border-border bg-surface overflow-hidden print:border-gray-300 print:bg-white">
            {STRONG_BASES.map((b, i) => (
              <div key={b} className={`px-4 py-2 flex items-center gap-3 ${i < STRONG_BASES.length - 1 ? 'border-b border-border print:border-gray-200' : ''}`}>
                <span className="font-mono text-sm text-bright print:text-black">{b.split(' — ')[0]}</span>
                <span className="font-sans text-xs text-secondary print:text-gray-600">{b.split(' — ')[1]}</span>
              </div>
            ))}
          </div>
          <p className="font-sans text-xs text-secondary print:text-gray-600">Dissociate completely in water: MOH → M⁺ + OH⁻</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 print:grid-cols-2">
        <RefCard
          title="Neutralization"
          formulaLines={[
            'acid + base → salt + water',
            'n(acid) × acid coeff = n(base) × base coeff  (at equivalence)',
            'n = C × V   (C in mol/L, V in L)',
          ]}
          notes={[
            'Strong acid + strong base → neutral salt (pH = 7)',
            'Titration: equivalence point reached when moles of H⁺ = moles of OH⁻',
          ]}
          example={{
            scenario: '25.0 mL of 0.100 mol/L HCl is titrated with 0.200 mol/L NaOH. What volume of NaOH is needed?',
            steps: [
              'n(HCl) = 0.100 × 0.0250 = 2.50 × 10⁻³ mol',
              'HCl : NaOH = 1 : 1, so n(NaOH) = 2.50 × 10⁻³ mol',
              'V(NaOH) = n / C = 2.50 × 10⁻³ / 0.200',
            ],
            result: 'V(NaOH) = 12.5 mL',
          }}
        />
        <RefCard
          title="Gas-Forming Reactions"
          formulaLines={[
            'carbonate + acid → salt + H₂O + CO₂(g)',
            'sulfide + acid → salt + H₂S(g)',
            'ammonium salt + base → salt + H₂O + NH₃(g)',
          ]}
          notes={[
            'CO₂ makes solution bubble; confirms a carbonate/bicarbonate',
            'H₂S has a rotten-egg smell',
            'Test NH₃ with damp red litmus paper (turns blue)',
          ]}
          example={{
            scenario: 'Write the equation for Na₂CO₃(aq) reacting with excess HCl(aq).',
            steps: [
              'Na₂CO₃(aq) + 2HCl(aq) → 2NaCl(aq) + H₂O(l) + CO₂(g)',
              'Net ionic: CO₃²⁻(aq) + 2H⁺(aq) → H₂O(l) + CO₂(g)',
            ],
            result: 'CO₂(g) released; solution effervesces',
          }}
        />
      </div>
    </div>
  )
}

function RedoxConceptsSection() {
  return (
    <div className="flex flex-col gap-8">

      {/* OIL RIG + agents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3">
        <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2 print:border-gray-300 print:bg-white print:p-3 print:break-inside-avoid">
          <h4 className="font-sans text-sm font-semibold text-bright print:text-black">Oxidation vs Reduction</h4>
          <p className="font-sans text-xs text-primary leading-relaxed print:text-gray-800">
            <span className="font-semibold text-bright print:text-black">Oxidation</span> — loss of electrons; oxidation state increases.<br />
            <span className="font-semibold text-bright print:text-black">Reduction</span> — gain of electrons; oxidation state decreases.
          </p>
          <div className="rounded-sm bg-raised border border-border px-3 py-2 mt-auto print:border-gray-200 print:bg-gray-50">
            <p className="font-mono text-xs text-bright print:text-black">OIL RIG</p>
            <p className="font-mono text-xs text-secondary print:text-gray-600">Oxidation Is Loss · Reduction Is Gain</p>
          </div>
        </div>
        <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2 print:border-gray-300 print:bg-white print:p-3 print:break-inside-avoid">
          <h4 className="font-sans text-sm font-semibold text-bright print:text-black">Oxidising & Reducing Agents</h4>
          <p className="font-sans text-xs text-primary leading-relaxed print:text-gray-800">
            The <span className="font-semibold text-bright print:text-black">oxidising agent</span> causes oxidation — it is itself reduced (gains e⁻).<br />
            The <span className="font-semibold text-bright print:text-black">reducing agent</span> causes reduction — it is itself oxidised (loses e⁻).
          </p>
          <p className="font-mono text-xs text-secondary mt-auto print:text-gray-600">
            Zn + Cu²⁺ → Zn²⁺ + Cu<br />
            Zn = reducing agent · Cu²⁺ = oxidising agent
          </p>
        </div>
        <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2 print:border-gray-300 print:bg-white print:p-3 print:break-inside-avoid">
          <h4 className="font-sans text-sm font-semibold text-bright print:text-black">Spontaneity</h4>
          <div className="flex flex-col gap-1.5 text-xs font-mono">
            <div className="flex items-baseline gap-2">
              <span className="text-green-400 print:text-green-700 shrink-0">E°cell &gt; 0</span>
              <span className="text-secondary print:text-gray-600">→ spontaneous</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-red-400 print:text-red-700 shrink-0">E°cell &lt; 0</span>
              <span className="text-secondary print:text-gray-600">→ non-spontaneous</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-green-400 print:text-green-700 shrink-0">ΔG° &lt; 0</span>
              <span className="text-secondary print:text-gray-600">→ spontaneous</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span style={{ color: 'var(--c-halogen)' }} className="shrink-0">ΔG° = −nFE°</span>
              <span className="text-secondary print:text-gray-600">→ links both</span>
            </div>
          </div>
          <p className="font-sans text-xs text-secondary mt-auto print:text-gray-600">
            Positive E°cell and negative ΔG° both mean the forward reaction is favoured under standard conditions.
          </p>
        </div>
      </div>

      {/* Formula cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 print:grid-cols-2">
        <RefCard
          title="Cell Potential  E°cell"
          formulaLines={[
            'E°cell = E°cathode − E°anode',
            'cathode = reduction (higher E°) · anode = oxidation (lower E°)',
          ]}
          notes={[
            'Standard conditions: 1 M concentrations, 1 atm, 25 °C',
            'Use standard reduction potentials from the table (both as written)',
            'The more positive E° half-reaction is the cathode',
          ]}
          example={{
            scenario: 'Calculate E°cell for the Zn–Cu galvanic cell. E°(Zn²⁺/Zn) = −0.76 V, E°(Cu²⁺/Cu) = +0.34 V.',
            steps: [
              'Cu²⁺ has higher E° → cathode (reduction): Cu²⁺ + 2e⁻ → Cu',
              'Zn has lower E° → anode (oxidation): Zn → Zn²⁺ + 2e⁻',
              'E°cell = E°cathode − E°anode = +0.34 − (−0.76)',
            ],
            result: 'E°cell = +1.10 V (positive → spontaneous)',
          }}
        />
        <RefCard
          title="Nernst Equation"
          formulaLines={[
            'E = E° − (0.05916 / n) × log Q   (at 25 °C)',
            'general: E = E° − (RT / nF) × ln Q',
            'at equilibrium: E = 0  →  log K = n × E° / 0.05916',
          ]}
          notes={[
            'n = moles of electrons transferred in the balanced equation',
            'Q = reaction quotient (products/reactants, same form as K)',
            'Q > 1 lowers E; Q < 1 raises E relative to E°',
          ]}
          example={{
            scenario: 'Zn–Cu cell with [Zn²⁺] = 0.10 M and [Cu²⁺] = 1.0 M. E° = 1.10 V, n = 2.',
            steps: [
              'Q = [Zn²⁺] / [Cu²⁺] = 0.10 / 1.0 = 0.10',
              'E = 1.10 − (0.05916 / 2) × log(0.10)',
              'E = 1.10 − (0.02958) × (−1)',
            ],
            result: 'E = 1.130 V',
          }}
        />
        <RefCard
          title="Gibbs Free Energy from E°cell"
          formulaLines={[
            'ΔG° = −nFE°',
            'F = 96 485 C/mol (Faraday constant)',
            'ΔG° in joules; divide by 1000 for kJ',
          ]}
          notes={[
            'n = moles of electrons in the balanced half-reactions',
            'E°cell > 0 → ΔG° < 0 → spontaneous under standard conditions',
            'ΔG° = −RT ln K  allows linking E°cell to equilibrium constant K',
          ]}
          example={{
            scenario: 'Calculate ΔG° for the Zn–Cu cell (E°cell = 1.10 V, n = 2).',
            steps: [
              'ΔG° = −nFE° = −(2)(96 485)(1.10)',
              'ΔG° = −212 267 J',
            ],
            result: 'ΔG° = −212 kJ/mol (spontaneous)',
          }}
        />
        <div className="rounded-sm border border-border bg-surface p-5 print:bg-white print:border-gray-300 print:break-inside-avoid print:rounded-none">
          <h3 className="font-sans font-semibold text-bright print:text-gray-900 mb-3">Balancing Half-Reactions</h3>
          <div className="flex flex-col gap-3">
            <div>
              <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-1.5">In Acid Solution</p>
              <ol className="flex flex-col gap-1">
                {[
                  'Balance all atoms except O and H',
                  'Balance O by adding H₂O to the deficient side',
                  'Balance H by adding H⁺ to the deficient side',
                  'Balance charge by adding e⁻ to the more positive side',
                  'Multiply half-reactions so electrons cancel, then add',
                ].map((s, i) => (
                  <li key={i} className="font-sans text-xs text-secondary print:text-gray-600 flex gap-2">
                    <span className="font-mono text-xs text-dim shrink-0 mt-0.5">{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="border-t border-border print:border-gray-200 pt-3">
              <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-1.5">In Base — add after balancing in acid</p>
              <p className="font-sans text-xs text-secondary print:text-gray-600">
                For each H⁺, add one OH⁻ to both sides. Combine H⁺ + OH⁻ → H₂O and cancel any H₂O that appears on both sides.
              </p>
            </div>
            <div className="border-t border-border print:border-gray-200 pt-3">
              <p className="font-mono text-xs text-secondary print:text-gray-400 uppercase tracking-widest mb-1.5">Worked Example</p>
              <p className="font-sans text-xs text-secondary print:text-gray-700 italic mb-1.5">Balance MnO₄⁻ + Fe²⁺ → Mn²⁺ + Fe³⁺ in acid.</p>
              <div className="flex flex-col gap-0.5 pl-3 border-l-2 border-border print:border-gray-300">
                <p className="font-mono text-xs text-primary print:text-gray-800">Red: MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O</p>
                <p className="font-mono text-xs text-primary print:text-gray-800">Ox:  Fe²⁺ → Fe³⁺ + e⁻  (×5)</p>
                <p className="font-mono text-xs text-primary print:text-gray-800">Overall: MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O</p>
                <p className="font-mono text-xs font-semibold text-emerald-400 print:text-green-700 mt-0.5">∴ 5 electrons transferred; charges balance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standard reduction potentials */}
      <div className="flex flex-col gap-2">
        <SectionHead label="Standard Reduction Potentials (25 °C, 1 M, 1 atm)" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse print:text-xs">
            <thead>
              <tr className="border-b border-border print:border-gray-300">
                <th className="font-mono text-xs uppercase tracking-widest text-secondary text-left py-2 pr-4 print:text-gray-500">Half-reaction (reduction)</th>
                <th className="font-mono text-xs uppercase tracking-widest text-secondary text-right py-2 print:text-gray-500">E° (V)</th>
              </tr>
            </thead>
            <tbody>
              {REDUCTION_POTENTIALS.map((r) => (
                <tr key={r.half} className={`border-b border-border hover:bg-surface/40 print:border-gray-200 ${r.ref ? 'bg-surface/50 print:bg-gray-50' : ''}`}>
                  <td className={`font-mono text-xs py-1.5 pr-4 ${r.ref ? 'text-secondary italic print:text-gray-500' : 'text-primary print:text-gray-800'}`}>{r.half}</td>
                  <td className={`font-mono text-sm text-right py-1.5 font-semibold ${
                    r.ref ? 'text-secondary print:text-gray-500' :
                    parseFloat(r.e0) > 0 ? 'text-green-400 print:text-green-700' :
                    'text-red-400 print:text-red-700'
                  }`}>{r.e0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-sans text-xs text-secondary print:text-gray-600">
          Higher E° = stronger oxidising agent (more readily reduced). Lower E° = stronger reducing agent (more readily oxidised). E°cell = E°cathode − E°anode.
        </p>
      </div>

    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RedoxReference({ topic }: { topic?: RefTopic }) {
  return (
    <div className="flex flex-col gap-8">
      {(!topic || topic === 'oxidation')      && <OxidationSection />}
      {(!topic || topic === 'reaction-types') && <ReactionTypesSection />}
      {(!topic || topic === 'activity')       && <ActivitySection />}
      {(!topic || topic === 'acids-bases')    && <AcidsBasesSection />}
      {(!topic || topic === 'redox-concepts') && <RedoxConceptsSection />}
    </div>
  )
}
