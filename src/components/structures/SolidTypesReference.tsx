// ── Data ──────────────────────────────────────────────────────────────────────

interface SolidType {
  id: string
  name: string
  color: string
  particles: string
  bonds: string
  mp: string
  hardness: string
  conductivity: string
  solubility: string
  examples: { formula: string; name: string; mp?: string }[]
  notes: string
}

const SOLID_TYPES: SolidType[] = [
  {
    id: 'ionic',
    name: 'Ionic',
    color: '#fb923c',
    particles: 'Cations & anions',
    bonds: 'Electrostatic attraction (ionic bonds)',
    mp: 'High (400–3000°C)',
    hardness: 'Hard but brittle — layers shift → like charges repel',
    conductivity: 'Non-conductor (solid); conductor when molten or dissolved',
    solubility: 'Soluble in polar solvents (water); insoluble in nonpolar',
    examples: [
      { formula: 'NaCl',   name: 'Sodium chloride',   mp: '801°C'  },
      { formula: 'MgO',    name: 'Magnesium oxide',   mp: '2852°C' },
      { formula: 'CaF₂',  name: 'Calcium fluoride',  mp: '1418°C' },
      { formula: 'K₂SO₄', name: 'Potassium sulfate', mp: '1069°C' },
    ],
    notes: 'Formed between metals and nonmetals. Brittle because displacement of planes brings like charges into alignment, causing repulsion.',
  },
  {
    id: 'molecular',
    name: 'Molecular',
    color: '#34d399',
    particles: 'Discrete molecules',
    bonds: 'Intermolecular forces (London, dipole-dipole, H-bonds)',
    mp: 'Low (often below 300°C)',
    hardness: 'Soft — weak IMFs between molecules',
    conductivity: 'Non-conductor in all states (no free charges)',
    solubility: 'Depends on polarity: polar ↔ polar, nonpolar ↔ nonpolar',
    examples: [
      { formula: 'H₂O',       name: 'Ice',             mp: '0°C'    },
      { formula: 'CO₂',       name: 'Dry ice',          mp: '−78°C'  },
      { formula: 'C₁₂H₂₂O₁₁', name: 'Sucrose',         mp: '186°C'  },
      { formula: 'I₂',        name: 'Iodine',           mp: '114°C'  },
    ],
    notes: 'Covalent bonds within each molecule are strong — it is the weak IMFs between molecules that determine mp and bp. Soft and low-melting.',
  },
  {
    id: 'metallic',
    name: 'Metallic',
    color: '#60a5fa',
    particles: 'Metal cations in electron sea',
    bonds: 'Metallic bonding (delocalized electron sea)',
    mp: 'Variable — low (Hg −39°C) to very high (W 3422°C)',
    hardness: 'Variable — soft (Na, K) to very hard (W, Cr)',
    conductivity: 'Good conductor of heat and electricity in all states',
    solubility: 'Insoluble in water; some dissolve in acids (reaction)',
    examples: [
      { formula: 'Fe',  name: 'Iron',      mp: '1538°C' },
      { formula: 'Cu',  name: 'Copper',    mp: '1085°C' },
      { formula: 'Na',  name: 'Sodium',    mp: '98°C'   },
      { formula: 'W',   name: 'Tungsten',  mp: '3422°C' },
    ],
    notes: 'Delocalized electrons explain conductivity and malleability — layers slide without breaking bonds. Lustre comes from electrons reflecting light.',
  },
  {
    id: 'network',
    name: 'Network Covalent',
    color: '#c084fc',
    particles: 'Atoms in an extended covalent lattice',
    bonds: 'Covalent bonds throughout the entire structure',
    mp: 'Very high (typically >1000°C)',
    hardness: 'Extremely hard (diamond) or layered-soft (graphite)',
    conductivity: 'Usually non-conductor; graphite is an exception (conducts in layers)',
    solubility: 'Insoluble in virtually all solvents',
    examples: [
      { formula: 'C (diamond)',  name: 'Diamond',         mp: '>3500°C' },
      { formula: 'C (graphite)', name: 'Graphite',        mp: '>3500°C' },
      { formula: 'SiO₂',        name: 'Quartz / silica', mp: '1713°C'  },
      { formula: 'SiC',         name: 'Silicon carbide', mp: '2730°C'  },
    ],
    notes: 'Every atom is covalently bonded to its neighbors — melting requires breaking many strong covalent bonds. Diamond is the hardest natural substance.',
  },
]

// ── Property comparison table ──────────────────────────────────────────────────

const PROPS = [
  { key: 'particles',    label: 'Structural units'      },
  { key: 'bonds',        label: 'Forces holding lattice' },
  { key: 'mp',           label: 'Melting point'          },
  { key: 'hardness',     label: 'Hardness'               },
  { key: 'conductivity', label: 'Conductivity'           },
  { key: 'solubility',   label: 'Solubility'             },
] as const

// ── Identification guide ───────────────────────────────────────────────────────

const ID_STEPS = [
  {
    q: 'Is it composed of metal atoms only?',
    yes: 'Metallic solid',
    no: null,
  },
  {
    q: 'Does it contain a metal bonded to a nonmetal (or polyatomic ion)?',
    yes: 'Ionic solid',
    no: null,
  },
  {
    q: 'Is it a network of atoms (C, Si, SiO₂, SiC…) with no discrete molecules?',
    yes: 'Network covalent solid',
    no: null,
  },
  {
    q: 'Are discrete covalent molecules present?',
    yes: 'Molecular solid',
    no: null,
  },
]

// ── Component ──────────────────────────────────────────────────────────────────

export default function SolidTypesReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SOLID_TYPES.map(t => (
          <div key={t.id} className="rounded-sm border border-border bg-surface overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border"
              style={{ background: `color-mix(in srgb, ${t.color} 8%, rgb(var(--color-raised)))` }}>
              <span className="font-sans text-base font-semibold" style={{ color: t.color }}>
                {t.name} Solid
              </span>
            </div>

            {/* Key props */}
            <div className="px-4 py-3 flex flex-col gap-2 border-b border-border">
              {[
                { label: 'Particles',     value: t.particles    },
                { label: 'Held together', value: t.bonds        },
                { label: 'Melting point', value: t.mp           },
                { label: 'Hardness',      value: t.hardness     },
                { label: 'Conductivity',  value: t.conductivity },
                { label: 'Solubility',    value: t.solubility   },
              ].map(p => (
                <div key={p.label} className="flex gap-2">
                  <span className="font-mono text-xs text-secondary tracking-widest uppercase shrink-0 w-24 pt-0.5">
                    {p.label}
                  </span>
                  <span className="font-sans text-xs text-secondary leading-relaxed">{p.value}</span>
                </div>
              ))}
            </div>

            {/* Examples */}
            <div className="px-4 py-3 border-b border-border">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">Examples</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {t.examples.map(e => (
                  <span key={e.formula}
                    className="font-mono text-[10px] px-2 py-0.5 rounded-sm border border-border"
                    style={{
                      color: t.color,
                      background: `color-mix(in srgb, ${t.color} 6%, rgb(var(--color-surface)))`,
                      borderColor: `color-mix(in srgb, ${t.color} 20%, transparent)`,
                    }}>
                    {e.formula}
                    {e.mp && <span className="text-dim ml-1">({e.mp})</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="px-4 py-3">
              <span className="font-sans text-[11px] text-dim leading-relaxed italic">{t.notes}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Side-by-Side Comparison</span>
        <div className="rounded-sm border border-border overflow-x-auto">
          <table className="w-full text-xs font-mono min-w-[560px]">
            <thead>
              <tr className="border-b border-border bg-raised">
                <th className="px-3 py-2 text-left text-dim font-normal w-36">Property</th>
                {SOLID_TYPES.map(t => (
                  <th key={t.id} className="px-3 py-2 text-left font-semibold"
                    style={{ color: t.color }}>{t.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROPS.map(p => (
                <tr key={p.key} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 text-dim">{p.label}</td>
                  {SOLID_TYPES.map(t => (
                    <td key={t.id} className="px-3 py-2 text-secondary leading-snug">
                      {t[p.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Identification guide */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">How to Identify the Solid Type</span>
        <div className="rounded-sm border border-border overflow-hidden">
          {ID_STEPS.map((step, i) => (
            <div key={i} className="flex gap-3 px-4 py-3 border-b border-border last:border-b-0">
              <span className="font-mono text-xs font-semibold shrink-0 w-4 text-dim pt-0.5">{i + 1}.</span>
              <div className="flex flex-col gap-1">
                <span className="font-sans text-sm text-primary">{step.q}</span>
                {step.yes && (
                  <span className="font-sans text-xs">
                    <span className="text-dim">→ Yes: </span>
                    <span style={{ color: SOLID_TYPES.find(t => t.name === step.yes.split(' ')[0])?.color ?? 'var(--c-halogen)' }}>
                      {step.yes}
                    </span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="font-sans text-xs text-secondary px-0.5">
          Work through the questions in order — the first match wins.
        </p>
      </div>

      {/* Key contrasts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          {
            title: 'Why are ionic solids brittle?',
            body: 'A mechanical stress shifts ion planes. Like charges align → strong repulsion → crystal shatters. Metals deform instead because the electron sea adjusts to the new geometry.',
            color: '#fb923c',
          },
          {
            title: 'Why does graphite conduct electricity?',
            body: 'Each C atom forms 3 σ-bonds in a plane, leaving one electron delocalized across the layer. These mobile π electrons carry charge. Diamond has no free electrons → non-conductor.',
            color: '#c084fc',
          },
          {
            title: 'Why do molecular solids have low mp?',
            body: 'The covalent bonds within each molecule are strong, but only weak IMFs hold molecules together. Melting only requires overcoming those weak forces, not breaking covalent bonds.',
            color: '#34d399',
          },
          {
            title: 'Why do ionic solids conduct when molten?',
            body: 'In the solid, ions are locked in place. On melting, ions are free to move and carry charge. Covalent and molecular solids have no ions or free electrons in any state.',
            color: '#60a5fa',
          },
        ].map(c => (
          <div key={c.title} className="flex flex-col gap-1.5 px-4 py-3 rounded-sm bg-raised border border-border">
            <span className="font-sans text-sm font-semibold" style={{ color: c.color }}>{c.title}</span>
            <span className="font-sans text-xs text-secondary leading-relaxed">{c.body}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
