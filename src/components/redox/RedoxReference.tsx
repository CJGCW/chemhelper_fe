// ── Static reference data ─────────────────────────────────────────────────────

const METALS_REF = [
  { symbol: 'Li', name: 'Lithium',   ion: 'Li⁺',  charge: '+1', waterRxn: 'Cold water (violent)', aboveH2: true  },
  { symbol: 'K',  name: 'Potassium', ion: 'K⁺',   charge: '+1', waterRxn: 'Cold water (violent)', aboveH2: true  },
  { symbol: 'Ba', name: 'Barium',    ion: 'Ba²⁺', charge: '+2', waterRxn: 'Cold water',           aboveH2: true  },
  { symbol: 'Ca', name: 'Calcium',   ion: 'Ca²⁺', charge: '+2', waterRxn: 'Cold water',           aboveH2: true  },
  { symbol: 'Na', name: 'Sodium',    ion: 'Na⁺',  charge: '+1', waterRxn: 'Cold water (violent)', aboveH2: true  },
  { symbol: 'Mg', name: 'Magnesium', ion: 'Mg²⁺', charge: '+2', waterRxn: 'Hot water / steam',    aboveH2: true  },
  { symbol: 'Al', name: 'Aluminum',  ion: 'Al³⁺', charge: '+3', waterRxn: 'Steam only',           aboveH2: true  },
  { symbol: 'Mn', name: 'Manganese', ion: 'Mn²⁺', charge: '+2', waterRxn: 'Steam only',           aboveH2: true  },
  { symbol: 'Zn', name: 'Zinc',      ion: 'Zn²⁺', charge: '+2', waterRxn: 'Steam only',           aboveH2: true  },
  { symbol: 'Cr', name: 'Chromium',  ion: 'Cr³⁺', charge: '+3', waterRxn: 'Steam only',           aboveH2: true  },
  { symbol: 'Fe', name: 'Iron',      ion: 'Fe²⁺', charge: '+2', waterRxn: 'Steam only',           aboveH2: true  },
  { symbol: 'Ni', name: 'Nickel',    ion: 'Ni²⁺', charge: '+2', waterRxn: 'Acid only',            aboveH2: true  },
  { symbol: 'Sn', name: 'Tin',       ion: 'Sn²⁺', charge: '+2', waterRxn: 'Acid only',            aboveH2: true  },
  { symbol: 'Pb', name: 'Lead',      ion: 'Pb²⁺', charge: '+2', waterRxn: 'Acid only',            aboveH2: true  },
  { symbol: 'H₂', name: 'Hydrogen',  ion: 'H⁺',   charge: '+1', waterRxn: '—',                   aboveH2: false, isDivider: true },
  { symbol: 'Cu', name: 'Copper',    ion: 'Cu²⁺', charge: '+2', waterRxn: 'No reaction',          aboveH2: false },
  { symbol: 'Ag', name: 'Silver',    ion: 'Ag⁺',  charge: '+1', waterRxn: 'No reaction',          aboveH2: false },
  { symbol: 'Hg', name: 'Mercury',   ion: 'Hg²⁺', charge: '+2', waterRxn: 'No reaction',          aboveH2: false },
  { symbol: 'Pt', name: 'Platinum',  ion: 'Pt²⁺', charge: '+2', waterRxn: 'No reaction',          aboveH2: false },
  { symbol: 'Au', name: 'Gold',      ion: 'Au³⁺', charge: '+3', waterRxn: 'No reaction',          aboveH2: false },
] as const

const HALOGENS_REF = [
  { formula: 'F₂',  ion: 'F⁻',  name: 'Fluorine',  displaces: 'Cl⁻, Br⁻, I⁻' },
  { formula: 'Cl₂', ion: 'Cl⁻', name: 'Chlorine',  displaces: 'Br⁻, I⁻'      },
  { formula: 'Br₂', ion: 'Br⁻', name: 'Bromine',   displaces: 'I⁻'            },
  { formula: 'I₂',  ion: 'I⁻',  name: 'Iodine',    displaces: '—'             },
]

const OXIDATION_RULES = [
  { rule: 'Free elements',        value: '0',           example: 'Na(s), O₂(g), Fe(s) → all 0'      },
  { rule: 'Monatomic ions',       value: '= ion charge', example: 'Na⁺ → +1 · Fe²⁺ → +2'           },
  { rule: 'Fluorine',             value: '−1 always',   example: 'HF, CF₄, BF₃'                     },
  { rule: 'Oxygen',               value: '−2 usually',  example: 'Exception: peroxides (H₂O₂) = −1' },
  { rule: 'Hydrogen (w/ nonmetal)', value: '+1',        example: 'HCl, H₂O, NH₃'                    },
  { rule: 'Hydrogen (w/ metal)',  value: '−1',          example: 'NaH, CaH₂ (metal hydrides)'       },
  { rule: 'Halogens (Cl, Br, I)', value: '−1 usually', example: 'Exception: when bonded to O or F'  },
  { rule: 'Group 1 metals',       value: '+1 always',   example: 'Li, Na, K, Rb, Cs'                },
  { rule: 'Group 2 metals',       value: '+2 always',   example: 'Mg, Ca, Sr, Ba'                   },
  { rule: 'Neutral molecule',     value: 'sum = 0',     example: 'H₂O: 2(+1) + (−2) = 0 ✓'        },
  { rule: 'Polyatomic ion',       value: 'sum = charge', example: 'SO₄²⁻: S + 4(−2) = −2 → S = +6' },
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
    conditions: ['Strong acid + strong base → complete reaction', 'Weak acid or base → equilibrium reaction', 'Gas-forming variants: carbonates, sulfides, sulfites + acid'],
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
    conditions: ['Metal must be above the displaced metal in activity series', 'Metal must be above H₂ to displace it from acid', 'More active halogen displaces less active halide'],
    example: 'Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)',
    net: 'Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)',
  },
]

const STRONG_ACIDS = ['HCl — Hydrochloric acid', 'HBr — Hydrobromic acid', 'HI — Hydroiodic acid', 'HNO₃ — Nitric acid', 'H₂SO₄ — Sulfuric acid', 'HClO₄ — Perchloric acid']
const STRONG_BASES = ['NaOH — Sodium hydroxide', 'KOH — Potassium hydroxide', 'Ca(OH)₂ — Calcium hydroxide', 'Ba(OH)₂ — Barium hydroxide']

// ── Per-topic sections ────────────────────────────────────────────────────────

export type RefTopic = 'oxidation' | 'reaction-types' | 'activity' | 'acids-bases' | 'redox-concepts'

function OxidationSection() {
  return (
    <section>
      <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-3 print:text-black">Oxidation State Rules</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2">
        {OXIDATION_RULES.map(r => (
          <div key={r.rule} className="rounded-sm border border-border bg-surface p-3 flex flex-col gap-1 print:border-gray-300 print:bg-white print:p-2">
            <div className="flex items-start justify-between gap-2">
              <span className="font-sans text-sm font-semibold text-bright print:text-black">{r.rule}</span>
              <span
                className="font-mono text-xs px-1.5 py-0.5 rounded-sm shrink-0"
                style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, #141620)', color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
              >{r.value}</span>
            </div>
            <p className="font-mono text-xs text-secondary print:text-gray-600">{r.example}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ReactionTypesSection() {
  return (
    <section>
      <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-3 print:text-black">Reaction Types</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
        {REACTION_TYPES.map(rt => (
          <div key={rt.type} className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2 print:border-gray-300 print:bg-white print:p-3">
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-sm font-bold w-7 h-7 rounded-sm flex items-center justify-center shrink-0"
                style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, #141620)', color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
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
    </section>
  )
}

function ActivitySection() {
  return (
    <section>
      <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-3 print:text-black">Activity Series — Metals</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse print:text-xs">
          <thead>
            <tr className="border-b border-border print:border-gray-300">
              <th className="font-mono text-[10px] uppercase tracking-widest text-dim text-left py-2 pr-3 print:text-gray-500">#</th>
              <th className="font-mono text-[10px] uppercase tracking-widest text-dim text-left py-2 pr-4 print:text-gray-500">Metal</th>
              <th className="font-mono text-[10px] uppercase tracking-widest text-dim text-left py-2 pr-4 print:text-gray-500">Ion</th>
              <th className="font-mono text-[10px] uppercase tracking-widest text-dim text-left py-2 pr-4 print:text-gray-500">Water Reaction</th>
              <th className="font-mono text-[10px] uppercase tracking-widest text-dim text-left py-2 print:text-gray-500">Reacts w/ Dilute Acid</th>
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
      <div className="mt-6 print:mt-4">
        <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-3 print:text-black">Activity Series — Halogens</p>
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
        <p className="font-sans text-xs text-secondary mt-2 print:text-gray-600">
          A more active halogen (higher in the list) will displace a less active halide ion from solution.
        </p>
      </div>
    </section>
  )
}

function AcidsBasesSection() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
      <div>
        <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-3 print:text-black">Strong Acids</p>
        <div className="rounded-sm border border-border bg-surface overflow-hidden print:border-gray-300 print:bg-white">
          {STRONG_ACIDS.map((a, i) => (
            <div key={a} className={`px-4 py-2 flex items-center gap-3 ${i < STRONG_ACIDS.length - 1 ? 'border-b border-border print:border-gray-200' : ''}`}>
              <span className="font-mono text-sm text-bright print:text-black">{a.split(' — ')[0]}</span>
              <span className="font-sans text-xs text-secondary print:text-gray-600">{a.split(' — ')[1]}</span>
            </div>
          ))}
        </div>
        <p className="font-sans text-xs text-secondary mt-2 print:text-gray-600">Dissociate completely in water: HA → H⁺ + A⁻</p>
      </div>
      <div>
        <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-3 print:text-black">Strong Bases</p>
        <div className="rounded-sm border border-border bg-surface overflow-hidden print:border-gray-300 print:bg-white">
          {STRONG_BASES.map((b, i) => (
            <div key={b} className={`px-4 py-2 flex items-center gap-3 ${i < STRONG_BASES.length - 1 ? 'border-b border-border print:border-gray-200' : ''}`}>
              <span className="font-mono text-sm text-bright print:text-black">{b.split(' — ')[0]}</span>
              <span className="font-sans text-xs text-secondary print:text-gray-600">{b.split(' — ')[1]}</span>
            </div>
          ))}
        </div>
        <p className="font-sans text-xs text-secondary mt-2 print:text-gray-600">Dissociate completely in water: MOH → M⁺ + OH⁻</p>
      </div>
    </section>
  )
}

function RedoxConceptsSection() {
  return (
    <section>
      <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-3 print:text-black">Redox Concepts</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3">
        <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2 print:border-gray-300 print:bg-white print:p-3">
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
        <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2 print:border-gray-300 print:bg-white print:p-3">
          <h4 className="font-sans text-sm font-semibold text-bright print:text-black">Oxidizing & Reducing Agents</h4>
          <p className="font-sans text-xs text-primary leading-relaxed print:text-gray-800">
            The <span className="font-semibold text-bright print:text-black">oxidizing agent</span> causes oxidation and is itself reduced (gains e⁻).<br />
            The <span className="font-semibold text-bright print:text-black">reducing agent</span> causes reduction and is itself oxidized (loses e⁻).
          </p>
          <p className="font-mono text-xs text-secondary mt-auto print:text-gray-600">
            Zn + Cu²⁺ → Zn²⁺ + Cu<br />
            Zn = reducing agent · Cu²⁺ = oxidizing agent
          </p>
        </div>
        <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2 print:border-gray-300 print:bg-white print:p-3">
          <h4 className="font-sans text-sm font-semibold text-bright print:text-black">Half-Reactions</h4>
          <p className="font-sans text-xs text-primary leading-relaxed print:text-gray-800">
            Split a redox equation into oxidation and reduction half-reactions. Balance atoms, then balance charge by adding electrons.
          </p>
          <div className="flex flex-col gap-0.5 mt-auto">
            <p className="font-mono text-xs text-secondary print:text-gray-600">Oxidation:  Zn → Zn²⁺ + 2e⁻</p>
            <p className="font-mono text-xs text-secondary print:text-gray-600">Reduction:  Cu²⁺ + 2e⁻ → Cu</p>
            <p className="font-mono text-xs text-dim mt-1 print:text-gray-400">Electrons must cancel when combined.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RedoxReference({ topic }: { topic?: RefTopic }) {
  return (
    <div className="flex flex-col gap-10 print:gap-6">
      {(!topic || topic === 'oxidation')      && <OxidationSection />}
      {(!topic || topic === 'reaction-types') && <ReactionTypesSection />}
      {(!topic || topic === 'activity')       && <ActivitySection />}
      {(!topic || topic === 'acids-bases')    && <AcidsBasesSection />}
      {(!topic || topic === 'redox-concepts') && <RedoxConceptsSection />}
    </div>
  )
}
