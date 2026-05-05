import { useState } from 'react'

interface Polymer {
  name: string
  abbrev: string
  monomer: string
  type: 'addition' | 'condensation' | 'ring-opening'
  subtype: string
  properties: string
  uses: string
}

const POLYMERS: Polymer[] = [
  { name: 'Polyethylene (LDPE)',        abbrev: 'LDPE',   monomer: 'CH₂=CH₂',                        type: 'addition',     subtype: 'Radical (high P)',       properties: 'Soft, flexible, low density, branched',      uses: 'Plastic bags, food wrap, squeeze bottles' },
  { name: 'Polyethylene (HDPE)',        abbrev: 'HDPE',   monomer: 'CH₂=CH₂',                        type: 'addition',     subtype: 'Ziegler-Natta',          properties: 'Rigid, strong, high density, linear',        uses: 'Milk jugs, pipes, cutting boards, toys' },
  { name: 'Polypropylene',             abbrev: 'PP',     monomer: 'CH₂=CHCH₃',                      type: 'addition',     subtype: 'Ziegler-Natta (isotactic)', properties: 'Tough, heat-resistant, light',              uses: 'Carpets, containers, living-hinge packaging' },
  { name: 'Polystyrene',               abbrev: 'PS',     monomer: 'CH₂=CHC₆H₅',                     type: 'addition',     subtype: 'Radical',                properties: 'Brittle, transparent, glassy',               uses: 'Foam cups (expanded PS), CD cases, disposable cutlery' },
  { name: 'Poly(vinyl chloride)',       abbrev: 'PVC',    monomer: 'CH₂=CHCl',                        type: 'addition',     subtype: 'Radical',                properties: 'Rigid or flexible (plasticizer added)',      uses: 'Pipes, vinyl siding, wire insulation, vinyl records' },
  { name: 'Polytetrafluoroethylene',   abbrev: 'PTFE',   monomer: 'CF₂=CF₂',                         type: 'addition',     subtype: 'Radical',                properties: 'Chemically inert, non-stick, high mp',      uses: 'Non-stick cookware (Teflon®), lab ware, gaskets' },
  { name: 'Poly(methyl methacrylate)', abbrev: 'PMMA',   monomer: 'CH₂=C(CH₃)COOCH₃',               type: 'addition',     subtype: 'Radical / anionic',      properties: 'Transparent, hard, brittle, optical clarity', uses: 'Acrylic glass (Plexiglas®), contact lenses, dental' },
  { name: 'Polyacrylonitrile',         abbrev: 'PAN',    monomer: 'CH₂=CHCN',                        type: 'addition',     subtype: 'Radical',                properties: 'Strong fiber, high Tg',                      uses: 'Acrylic textiles, carbon fiber precursor' },
  { name: 'Poly(ethylene terephthalate)', abbrev: 'PET',  monomer: 'Terephthalic acid + ethylene glycol', type: 'condensation', subtype: 'Polyester',           properties: 'Strong, clear, high melting point',          uses: 'Soda bottles, polyester fiber (Dacron®), mylar' },
  { name: 'Nylon-6,6',                 abbrev: 'PA-6,6', monomer: 'Hexamethylenediamine + adipic acid', type: 'condensation', subtype: 'Polyamide',            properties: 'Strong, elastic, good wear resistance',      uses: 'Stockings, ropes, parachutes, gears' },
  { name: 'Nylon-6',                   abbrev: 'PA-6',   monomer: 'Caprolactam (ring-opening)',       type: 'ring-opening', subtype: 'Polyamide',              properties: 'Similar to 6,6, slightly more elastic',      uses: 'Clothing, tire cord, automotive parts' },
  { name: 'Polyurethane',              abbrev: 'PU',     monomer: 'Diisocyanate + diol',              type: 'condensation', subtype: 'Urethane (no byproduct)', properties: 'Flexible foam, rigid foam, or elastomer',    uses: 'Foam cushions, insulation, spandex fiber' },
  { name: 'Polycarbonate',             abbrev: 'PC',     monomer: 'Bisphenol A + phosgene',           type: 'condensation', subtype: 'Polycarbonate',          properties: 'Tough, transparent, high impact resistance', uses: 'Eyewear lenses, CDs/DVDs, bulletproof glass' },
  { name: 'Kevlar®',                   abbrev: 'PPTA',   monomer: 'p-phenylenediamine + terephthaloyl Cl', type: 'condensation', subtype: 'Aromatic polyamide',  properties: 'Extremely high tensile strength, rigid',    uses: 'Body armor, bullet-resistant vests, fiber composites' },
  { name: 'Bakelite',                  abbrev: '—',      monomer: 'Phenol + formaldehyde',            type: 'condensation', subtype: 'Thermoset phenolic',     properties: 'Hard, rigid, thermoset (non-remeltable)',    uses: 'Old electrical insulators, billiard balls, handles' },
]

type TypeFilter = 'all' | 'addition' | 'condensation' | 'ring-opening'

export default function CommonPolymersTable() {
  const [filter, setFilter] = useState<TypeFilter>('all')

  const filtered = filter === 'all' ? POLYMERS : POLYMERS.filter(p => p.type === filter)

  const pills: { id: TypeFilter; label: string }[] = [
    { id: 'all',           label: `All (${POLYMERS.length})` },
    { id: 'addition',      label: `Addition (${POLYMERS.filter(p => p.type === 'addition').length})` },
    { id: 'condensation',  label: `Condensation (${POLYMERS.filter(p => p.type === 'condensation').length})` },
    { id: 'ring-opening',  label: `Ring-Opening (${POLYMERS.filter(p => p.type === 'ring-opening').length})` },
  ]

  return (
    <div className="flex flex-col gap-5 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Common Polymers Reference Table</h3>
        <p className="font-sans text-xs text-secondary">15 commercially important polymers. Brown Ch. 29.</p>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        {pills.map(p => (
          <button
            key={p.id}
            onClick={() => setFilter(p.id)}
            className="px-3 py-1 rounded-full text-xs font-sans border transition-colors"
            style={filter === p.id ? {
              background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
              borderColor: 'color-mix(in srgb, var(--c-halogen) 30%, transparent)',
              color: 'var(--c-halogen)',
            } : {
              background: 'transparent',
              borderColor: 'rgb(var(--color-border))',
              color: 'rgb(var(--color-secondary))',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-sans border-collapse">
          <thead>
            <tr className="border-b border-border">
              {['Polymer', 'Monomer(s)', 'Type / Subtype', 'Properties', 'Uses'].map(h => (
                <th key={h} className="text-left py-2 pr-3 text-secondary font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.abbrev + p.name} className="border-b border-border/50 align-top">
                <td className="py-2 pr-3">
                  <p className="font-semibold text-primary">{p.name}</p>
                  {p.abbrev !== '—' && <p className="font-mono text-secondary" style={{ fontSize: 10 }}>{p.abbrev}</p>}
                </td>
                <td className="py-2 pr-3 font-mono text-secondary">{p.monomer}</td>
                <td className="py-2 pr-3">
                  <span className={`px-2 py-0.5 rounded-full text-white`} style={{
                    fontSize: 10,
                    background: p.type === 'addition' ? 'var(--c-alkene)' : p.type === 'condensation' ? 'var(--c-acid)' : 'var(--c-alcohol)',
                  }}>
                    {p.type}
                  </span>
                  <p className="text-secondary mt-1" style={{ fontSize: 10 }}>{p.subtype}</p>
                </td>
                <td className="py-2 pr-3 text-secondary">{p.properties}</td>
                <td className="py-2 text-secondary">{p.uses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
