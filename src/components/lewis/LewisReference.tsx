import LewisStructureDiagram from './LewisStructureDiagram'
import type { LewisStructure } from '../../pages/LewisPage'

// ── Static example data ───────────────────────────────────────────────────────

const EXAMPLES: (LewisStructure & { highlight: string })[] = [
  {
    name: 'Water', formula: 'H₂O', charge: 0, total_valence_electrons: 8,
    geometry: 'bent', notes: '', steps: [],
    highlight: '2 bonding pairs, 2 lone pairs → bent (≈104.5°)',
    atoms: [
      { id: 'O',  element: 'O', lone_pairs: 2, formal_charge: 0 },
      { id: 'H1', element: 'H', lone_pairs: 0, formal_charge: 0 },
      { id: 'H2', element: 'H', lone_pairs: 0, formal_charge: 0 },
    ],
    bonds: [{ from: 'O', to: 'H1', order: 1 }, { from: 'O', to: 'H2', order: 1 }],
  },
  {
    name: 'Carbon Dioxide', formula: 'CO₂', charge: 0, total_valence_electrons: 16,
    geometry: 'linear', notes: '', steps: [],
    highlight: 'Two C=O double bonds, no lone pairs on C → linear (180°)',
    atoms: [
      { id: 'C',  element: 'C', lone_pairs: 0, formal_charge: 0 },
      { id: 'O1', element: 'O', lone_pairs: 2, formal_charge: 0 },
      { id: 'O2', element: 'O', lone_pairs: 2, formal_charge: 0 },
    ],
    bonds: [{ from: 'C', to: 'O1', order: 2 }, { from: 'C', to: 'O2', order: 2 }],
  },
  {
    name: 'Ammonia', formula: 'NH₃', charge: 0, total_valence_electrons: 8,
    geometry: 'trigonal_pyramidal', notes: '', steps: [],
    highlight: '3 bonding pairs, 1 lone pair → trigonal pyramidal (≈107°)',
    atoms: [
      { id: 'N',  element: 'N', lone_pairs: 1, formal_charge: 0 },
      { id: 'H1', element: 'H', lone_pairs: 0, formal_charge: 0 },
      { id: 'H2', element: 'H', lone_pairs: 0, formal_charge: 0 },
      { id: 'H3', element: 'H', lone_pairs: 0, formal_charge: 0 },
    ],
    bonds: [
      { from: 'N', to: 'H1', order: 1 },
      { from: 'N', to: 'H2', order: 1 },
      { from: 'N', to: 'H3', order: 1 },
    ],
  },
  {
    name: 'Methane', formula: 'CH₄', charge: 0, total_valence_electrons: 8,
    geometry: 'tetrahedral', notes: '', steps: [],
    highlight: '4 bonding pairs, 0 lone pairs → tetrahedral (≈109.5°)',
    atoms: [
      { id: 'C',  element: 'C', lone_pairs: 0, formal_charge: 0 },
      { id: 'H1', element: 'H', lone_pairs: 0, formal_charge: 0 },
      { id: 'H2', element: 'H', lone_pairs: 0, formal_charge: 0 },
      { id: 'H3', element: 'H', lone_pairs: 0, formal_charge: 0 },
      { id: 'H4', element: 'H', lone_pairs: 0, formal_charge: 0 },
    ],
    bonds: [
      { from: 'C', to: 'H1', order: 1 }, { from: 'C', to: 'H2', order: 1 },
      { from: 'C', to: 'H3', order: 1 }, { from: 'C', to: 'H4', order: 1 },
    ],
  },
  {
    name: 'Phosphorus Pentachloride', formula: 'PCl₅', charge: 0, total_valence_electrons: 40,
    geometry: 'trigonal_bipyramidal', notes: '', steps: [],
    highlight: '5 bonding pairs, 0 lone pairs → trigonal bipyramidal (90°, 120°)',
    atoms: [
      { id: 'P',   element: 'P',  lone_pairs: 0, formal_charge: 0 },
      { id: 'Cl1', element: 'Cl', lone_pairs: 3, formal_charge: 0 },
      { id: 'Cl2', element: 'Cl', lone_pairs: 3, formal_charge: 0 },
      { id: 'Cl3', element: 'Cl', lone_pairs: 3, formal_charge: 0 },
      { id: 'Cl4', element: 'Cl', lone_pairs: 3, formal_charge: 0 },
      { id: 'Cl5', element: 'Cl', lone_pairs: 3, formal_charge: 0 },
    ],
    bonds: [
      { from: 'P', to: 'Cl1', order: 1 }, { from: 'P', to: 'Cl2', order: 1 },
      { from: 'P', to: 'Cl3', order: 1 }, { from: 'P', to: 'Cl4', order: 1 },
      { from: 'P', to: 'Cl5', order: 1 },
    ],
  },
  {
    name: 'Sulfur Hexafluoride', formula: 'SF₆', charge: 0, total_valence_electrons: 48,
    geometry: 'octahedral', notes: '', steps: [],
    highlight: '6 bonding pairs, 0 lone pairs → octahedral (90°)',
    atoms: [
      { id: 'S',  element: 'S', lone_pairs: 0, formal_charge: 0 },
      { id: 'F1', element: 'F', lone_pairs: 3, formal_charge: 0 },
      { id: 'F2', element: 'F', lone_pairs: 3, formal_charge: 0 },
      { id: 'F3', element: 'F', lone_pairs: 3, formal_charge: 0 },
      { id: 'F4', element: 'F', lone_pairs: 3, formal_charge: 0 },
      { id: 'F5', element: 'F', lone_pairs: 3, formal_charge: 0 },
      { id: 'F6', element: 'F', lone_pairs: 3, formal_charge: 0 },
    ],
    bonds: [
      { from: 'S', to: 'F1', order: 1 }, { from: 'S', to: 'F2', order: 1 },
      { from: 'S', to: 'F3', order: 1 }, { from: 'S', to: 'F4', order: 1 },
      { from: 'S', to: 'F5', order: 1 }, { from: 'S', to: 'F6', order: 1 },
    ],
  },
  {
    name: 'Nitrate Ion', formula: 'NO₃⁻', charge: -1, total_valence_electrons: 24,
    geometry: 'trigonal_planar', notes: '', steps: [],
    highlight: 'Resonance — formal charge distributed across the 3 oxygen atoms',
    atoms: [
      { id: 'N',  element: 'N', lone_pairs: 0, formal_charge: 0 },
      { id: 'O1', element: 'O', lone_pairs: 2, formal_charge: 0 },
      { id: 'O2', element: 'O', lone_pairs: 3, formal_charge: -1 },
      { id: 'O3', element: 'O', lone_pairs: 3, formal_charge: -1 },
    ],
    bonds: [
      { from: 'N', to: 'O1', order: 2 },
      { from: 'N', to: 'O2', order: 1 },
      { from: 'N', to: 'O3', order: 1 },
    ],
  },
  {
    name: 'Xenon Tetrafluoride', formula: 'XeF₄', charge: 0, total_valence_electrons: 36,
    geometry: 'square_planar', notes: '', steps: [],
    highlight: '4 bonding pairs, 2 lone pairs → square planar (90°) — expanded octet',
    atoms: [
      { id: 'Xe', element: 'Xe', lone_pairs: 2, formal_charge: 0 },
      { id: 'F1', element: 'F',  lone_pairs: 3, formal_charge: 0 },
      { id: 'F2', element: 'F',  lone_pairs: 3, formal_charge: 0 },
      { id: 'F3', element: 'F',  lone_pairs: 3, formal_charge: 0 },
      { id: 'F4', element: 'F',  lone_pairs: 3, formal_charge: 0 },
    ],
    bonds: [
      { from: 'Xe', to: 'F1', order: 1 }, { from: 'Xe', to: 'F2', order: 1 },
      { from: 'Xe', to: 'F3', order: 1 }, { from: 'Xe', to: 'F4', order: 1 },
    ],
  },
]

// ── Drawing rules ─────────────────────────────────────────────────────────────

const RULES = [
  {
    step: '1',
    title: 'Count valence electrons',
    body: 'Add up all valence electrons from every atom. Adjust for charge: subtract 1 per positive charge, add 1 per negative charge.',
    example: 'H₂O: O(6) + 2×H(1) = 8 e⁻',
  },
  {
    step: '2',
    title: 'Place the central atom',
    body: 'The least electronegative atom (except H, which is always terminal) goes in the centre. For symmetric molecules like CO₂, C goes in the middle.',
    example: 'In NH₃, N is the centre; in H₂O, O is the centre.',
  },
  {
    step: '3',
    title: 'Connect with single bonds',
    body: 'Draw single bonds from the central atom to each surrounding atom. Each bond uses 2 electrons.',
    example: 'H₂O: 2 single bonds use 4 of 8 electrons, leaving 4.',
  },
  {
    step: '4',
    title: 'Complete terminal octets',
    body: 'Fill lone pairs on terminal atoms to satisfy the octet rule (H only needs 2 electrons).',
    example: 'In H₂O, H atoms already have 2 electrons each from the bonds.',
  },
  {
    step: '5',
    title: 'Place remaining electrons on the central atom',
    body: 'Any electrons not yet assigned go on the central atom as lone pairs.',
    example: 'H₂O: 4 remaining electrons → 2 lone pairs on O.',
  },
  {
    step: '6',
    title: 'Form multiple bonds if needed',
    body: "If the central atom still has fewer than 8 electrons, convert a terminal atom's lone pair into a double or triple bond.",
    example: 'CO₂: C has only 4 electrons after single bonds — each O donates a lone pair → two C=O double bonds.',
  },
  {
    step: '7',
    title: 'Check formal charges',
    body: 'Formal charge = Valence electrons − Lone pair electrons − ½ Bonding electrons. The best structure minimises formal charges (ideally 0 on all atoms).',
    example: 'In CO₂ with double bonds, all formal charges = 0.',
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function LewisReference() {
  return (
    <div className="flex flex-col gap-8">

      {/* Concepts */}
      <div>
        <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-3">Concepts</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
            <h3 className="font-sans font-semibold text-bright">What is a Lewis Structure?</h3>
            <p className="font-sans text-sm text-primary leading-relaxed">
              A Lewis structure (or electron-dot structure) is a diagram that shows the arrangement of
              valence electrons in a molecule. Dots represent lone pair electrons; lines represent
              shared bonding pairs between atoms.
            </p>
            <p className="font-sans text-sm text-primary leading-relaxed">
              They reveal bonding (single, double, triple), lone pairs, formal charges, and — combined
              with VSEPR theory — allow you to predict molecular geometry.
            </p>
          </div>

          <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
            <h3 className="font-sans font-semibold text-bright">The Octet Rule</h3>
            <p className="font-sans text-sm text-primary leading-relaxed">
              Most main-group atoms are most stable with 8 electrons in their valence shell (a full
              octet). Hydrogen and helium are exceptions — they need only 2.
            </p>
            <p className="font-sans text-sm text-secondary leading-relaxed text-xs mt-1">
              Exceptions to the octet rule:
            </p>
            <ul className="font-sans text-sm text-primary leading-relaxed list-none flex flex-col gap-1">
              <li><span className="font-mono text-secondary mr-2">Incomplete:</span>B in BF₃ has 6 electrons</li>
              <li><span className="font-mono text-secondary mr-2">Expanded:</span>P, S, Xe (period 3+) can hold 10–12</li>
              <li><span className="font-mono text-secondary mr-2">Odd-electron:</span>NO•, NO₂• (free radicals)</li>
            </ul>
          </div>

          <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
            <h3 className="font-sans font-semibold text-bright">Formal Charge</h3>
            <p className="font-sans text-sm text-primary leading-relaxed">
              Formal charge helps identify the best Lewis structure when multiple arrangements are possible.
            </p>
            <div className="rounded-sm bg-raised border border-border px-3 py-2 my-1">
              <p className="font-mono text-sm text-bright">FC = V − L − B/2</p>
              <p className="font-mono text-xs text-secondary mt-0.5">V = valence e⁻ · L = lone pair e⁻ · B = bonding e⁻</p>
            </div>
            <p className="font-sans text-sm text-primary leading-relaxed">
              The preferred structure minimises formal charges and places any negative charge on the
              most electronegative atom.
            </p>
          </div>
        </div>
      </div>

      {/* Drawing rules */}
      <div>
        <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-3">How to Draw a Lewis Structure</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {RULES.map(r => (
            <div key={r.step} className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-xs font-bold w-6 h-6 rounded-sm flex items-center justify-center shrink-0"
                  style={{ background: 'color-mix(in srgb, var(--c-halogen) 15%, #141620)', color: 'var(--c-halogen)', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
                >
                  {r.step}
                </span>
                <h4 className="font-sans text-sm font-semibold text-bright">{r.title}</h4>
              </div>
              <p className="font-sans text-sm text-primary leading-relaxed">{r.body}</p>
              <p className="font-mono text-xs text-secondary mt-auto pt-1 border-t border-border">{r.example}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Example gallery */}
      <div>
        <p className="font-mono text-[10px] text-dim uppercase tracking-widest mb-3">Examples</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXAMPLES.map(ex => (
            <div key={ex.formula} className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-3">
              <div>
                <p className="font-sans font-semibold text-bright">{ex.name}</p>
                <p className="font-mono text-sm text-secondary">{ex.formula}{ex.charge !== 0 ? (ex.charge === -1 ? '⁻' : ex.charge === 1 ? '⁺' : `${Math.abs(ex.charge)}${ex.charge < 0 ? '⁻' : '⁺'}`) : ''}</p>
              </div>
              <LewisStructureDiagram structure={ex} />
              <p className="font-sans text-xs text-secondary leading-relaxed">{ex.highlight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
