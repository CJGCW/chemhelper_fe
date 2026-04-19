import VsepDiagram from './VsepDiagram'
import type { LewisStructure } from '../../pages/LewisPage'

// ── Static geometry data ──────────────────────────────────────────────────────

interface GeometryEntry {
  geometry: string
  name: string
  electronGeometry: string
  bondingPairs: number
  lonePairs: number
  bondAngles: string
  hybridization: string
  example: string
  structure: LewisStructure
}

const GEOMETRIES: GeometryEntry[] = [
  {
    geometry: 'linear', name: 'Linear', electronGeometry: 'Linear',
    bondingPairs: 2, lonePairs: 0, bondAngles: '180°', hybridization: 'sp', example: 'CO₂, BeCl₂',
    structure: {
      name: 'CO₂', formula: 'CO2', charge: 0, total_valence_electrons: 16,
      geometry: 'linear', notes: '', steps: [],
      atoms: [
        { id: 'C', element: 'C', lone_pairs: 0, formal_charge: 0 },
        { id: 'O1', element: 'O', lone_pairs: 2, formal_charge: 0 },
        { id: 'O2', element: 'O', lone_pairs: 2, formal_charge: 0 },
      ],
      bonds: [{ from: 'C', to: 'O1', order: 2 }, { from: 'C', to: 'O2', order: 2 }],
    },
  },
  {
    geometry: 'bent', name: 'Bent (1 LP)', electronGeometry: 'Trigonal Planar',
    bondingPairs: 2, lonePairs: 1, bondAngles: '≈120°', hybridization: 'sp²', example: 'SO₂',
    structure: {
      name: 'SO₂', formula: 'SO2', charge: 0, total_valence_electrons: 18,
      geometry: 'bent', notes: '', steps: [],
      atoms: [
        { id: 'S',  element: 'S', lone_pairs: 1, formal_charge: 0 },
        { id: 'O1', element: 'O', lone_pairs: 2, formal_charge: 0 },
        { id: 'O2', element: 'O', lone_pairs: 2, formal_charge: 0 },
      ],
      bonds: [{ from: 'S', to: 'O1', order: 2 }, { from: 'S', to: 'O2', order: 1 }],
    },
  },
  {
    geometry: 'bent', name: 'Bent (2 LP)', electronGeometry: 'Tetrahedral',
    bondingPairs: 2, lonePairs: 2, bondAngles: '≈104.5°', hybridization: 'sp³', example: 'H₂O',
    structure: {
      name: 'H₂O', formula: 'H2O', charge: 0, total_valence_electrons: 8,
      geometry: 'bent', notes: '', steps: [],
      atoms: [
        { id: 'O',  element: 'O', lone_pairs: 2, formal_charge: 0 },
        { id: 'H1', element: 'H', lone_pairs: 0, formal_charge: 0 },
        { id: 'H2', element: 'H', lone_pairs: 0, formal_charge: 0 },
      ],
      bonds: [{ from: 'O', to: 'H1', order: 1 }, { from: 'O', to: 'H2', order: 1 }],
    },
  },
  {
    geometry: 'trigonal_planar', name: 'Trigonal Planar', electronGeometry: 'Trigonal Planar',
    bondingPairs: 3, lonePairs: 0, bondAngles: '120°', hybridization: 'sp²', example: 'BF₃, SO₃',
    structure: {
      name: 'BF₃', formula: 'BF3', charge: 0, total_valence_electrons: 24,
      geometry: 'trigonal_planar', notes: '', steps: [],
      atoms: [
        { id: 'B',  element: 'B', lone_pairs: 0, formal_charge: 0 },
        { id: 'F1', element: 'F', lone_pairs: 3, formal_charge: 0 },
        { id: 'F2', element: 'F', lone_pairs: 3, formal_charge: 0 },
        { id: 'F3', element: 'F', lone_pairs: 3, formal_charge: 0 },
      ],
      bonds: [
        { from: 'B', to: 'F1', order: 1 },
        { from: 'B', to: 'F2', order: 1 },
        { from: 'B', to: 'F3', order: 1 },
      ],
    },
  },
  {
    geometry: 'trigonal_pyramidal', name: 'Trigonal Pyramidal', electronGeometry: 'Tetrahedral',
    bondingPairs: 3, lonePairs: 1, bondAngles: '≈107°', hybridization: 'sp³', example: 'NH₃, PCl₃',
    structure: {
      name: 'NH₃', formula: 'NH3', charge: 0, total_valence_electrons: 8,
      geometry: 'trigonal_pyramidal', notes: '', steps: [],
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
  },
  {
    geometry: 'tetrahedral', name: 'Tetrahedral', electronGeometry: 'Tetrahedral',
    bondingPairs: 4, lonePairs: 0, bondAngles: '109.5°', hybridization: 'sp³', example: 'CH₄, SiH₄',
    structure: {
      name: 'CH₄', formula: 'CH4', charge: 0, total_valence_electrons: 8,
      geometry: 'tetrahedral', notes: '', steps: [],
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
  },
  {
    geometry: 'see_saw', name: 'See-Saw', electronGeometry: 'Trigonal Bipyramidal',
    bondingPairs: 4, lonePairs: 1, bondAngles: '≈90°, ≈120°', hybridization: 'sp³d', example: 'SF₄',
    structure: {
      name: 'SF₄', formula: 'SF4', charge: 0, total_valence_electrons: 34,
      geometry: 'see_saw', notes: '', steps: [],
      atoms: [
        { id: 'S',  element: 'S', lone_pairs: 1, formal_charge: 0 },
        { id: 'F1', element: 'F', lone_pairs: 3, formal_charge: 0 },
        { id: 'F2', element: 'F', lone_pairs: 3, formal_charge: 0 },
        { id: 'F3', element: 'F', lone_pairs: 3, formal_charge: 0 },
        { id: 'F4', element: 'F', lone_pairs: 3, formal_charge: 0 },
      ],
      bonds: [
        { from: 'S', to: 'F1', order: 1 }, { from: 'S', to: 'F2', order: 1 },
        { from: 'S', to: 'F3', order: 1 }, { from: 'S', to: 'F4', order: 1 },
      ],
    },
  },
  {
    geometry: 't_shaped', name: 'T-Shaped', electronGeometry: 'Trigonal Bipyramidal',
    bondingPairs: 3, lonePairs: 2, bondAngles: '90°, 180°', hybridization: 'sp³d', example: 'ClF₃',
    structure: {
      name: 'ClF₃', formula: 'ClF3', charge: 0, total_valence_electrons: 28,
      geometry: 't_shaped', notes: '', steps: [],
      atoms: [
        { id: 'Cl', element: 'Cl', lone_pairs: 2, formal_charge: 0 },
        { id: 'F1', element: 'F',  lone_pairs: 3, formal_charge: 0 },
        { id: 'F2', element: 'F',  lone_pairs: 3, formal_charge: 0 },
        { id: 'F3', element: 'F',  lone_pairs: 3, formal_charge: 0 },
      ],
      bonds: [
        { from: 'Cl', to: 'F1', order: 1 },
        { from: 'Cl', to: 'F2', order: 1 },
        { from: 'Cl', to: 'F3', order: 1 },
      ],
    },
  },
  {
    geometry: 'trigonal_bipyramidal', name: 'Trigonal Bipyramidal', electronGeometry: 'Trigonal Bipyramidal',
    bondingPairs: 5, lonePairs: 0, bondAngles: '90°, 120°', hybridization: 'sp³d', example: 'PCl₅',
    structure: {
      name: 'PCl₅', formula: 'PCl5', charge: 0, total_valence_electrons: 40,
      geometry: 'trigonal_bipyramidal', notes: '', steps: [],
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
  },
  {
    geometry: 'square_planar', name: 'Square Planar', electronGeometry: 'Octahedral',
    bondingPairs: 4, lonePairs: 2, bondAngles: '90°', hybridization: 'sp³d²', example: 'XeF₄',
    structure: {
      name: 'XeF₄', formula: 'XeF4', charge: 0, total_valence_electrons: 36,
      geometry: 'square_planar', notes: '', steps: [],
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
  },
  {
    geometry: 'square_pyramidal', name: 'Square Pyramidal', electronGeometry: 'Octahedral',
    bondingPairs: 5, lonePairs: 1, bondAngles: '90°', hybridization: 'sp³d²', example: 'BrF₅, IF₅',
    structure: {
      name: 'BrF₅', formula: 'BrF5', charge: 0, total_valence_electrons: 42,
      geometry: 'square_pyramidal', notes: '', steps: [],
      atoms: [
        { id: 'Br', element: 'Br', lone_pairs: 1, formal_charge: 0 },
        { id: 'F1', element: 'F',  lone_pairs: 3, formal_charge: 0 },
        { id: 'F2', element: 'F',  lone_pairs: 3, formal_charge: 0 },
        { id: 'F3', element: 'F',  lone_pairs: 3, formal_charge: 0 },
        { id: 'F4', element: 'F',  lone_pairs: 3, formal_charge: 0 },
        { id: 'F5', element: 'F',  lone_pairs: 3, formal_charge: 0 },
      ],
      bonds: [
        { from: 'Br', to: 'F1', order: 1 }, { from: 'Br', to: 'F2', order: 1 },
        { from: 'Br', to: 'F3', order: 1 }, { from: 'Br', to: 'F4', order: 1 },
        { from: 'Br', to: 'F5', order: 1 },
      ],
    },
  },
  {
    geometry: 'octahedral', name: 'Octahedral', electronGeometry: 'Octahedral',
    bondingPairs: 6, lonePairs: 0, bondAngles: '90°', hybridization: 'sp³d²', example: 'SF₆',
    structure: {
      name: 'SF₆', formula: 'SF6', charge: 0, total_valence_electrons: 48,
      geometry: 'octahedral', notes: '', steps: [],
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
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function VsepReference() {
  return (
    <div className="flex flex-col gap-8">

      {/* Concepts */}
      <div>
        <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-3">Concepts</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
            <h3 className="font-sans font-semibold text-bright">What is VSEPR?</h3>
            <p className="font-sans text-sm text-primary leading-relaxed">
              Valence Shell Electron Pair Repulsion (VSEPR) theory predicts molecular geometry by
              assuming that electron pairs around a central atom arrange themselves to minimise
              repulsion — they stay as far apart as possible.
            </p>
            <p className="font-sans text-sm text-primary leading-relaxed">
              Both bonding pairs and lone pairs count when determining the electron geometry.
              Lone pairs repel more strongly than bonding pairs, which compresses bond angles.
            </p>
          </div>

          <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
            <h3 className="font-sans font-semibold text-bright">Electron vs. Molecular Geometry</h3>
            <p className="font-sans text-sm text-primary leading-relaxed">
              The <span className="text-bright font-medium">electron geometry</span> counts all
              electron pairs (bonding + lone). The <span className="text-bright font-medium">molecular
              geometry</span> describes only the positions of atoms.
            </p>
            <p className="font-sans text-sm text-primary leading-relaxed">
              Example: H₂O has 4 electron pairs → tetrahedral electron geometry, but only 2 bonded
              atoms → bent molecular geometry.
            </p>
          </div>

          <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
            <h3 className="font-sans font-semibold text-bright">Hybridization</h3>
            <p className="font-sans text-sm text-primary leading-relaxed">
              The number of electron pairs around the central atom determines its hybridization:
            </p>
            <div className="font-mono text-sm flex flex-col gap-1 mt-1">
              {[['2 pairs', 'sp', '180°'],['3 pairs', 'sp²', '120°'],['4 pairs', 'sp³', '109.5°'],['5 pairs', 'sp³d', '90°/120°'],['6 pairs', 'sp³d²', '90°']].map(([p, h, a]) => (
                <div key={h} className="flex items-center gap-2">
                  <span className="text-dim w-14">{p}</span>
                  <span className="text-bright w-12">{h}</span>
                  <span className="text-secondary">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Geometry gallery */}
      <div>
        <p className="font-mono text-xs text-secondary uppercase tracking-widest mb-3">Geometry Reference</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {GEOMETRIES.map(g => (
            <div key={`${g.name}-${g.lonePairs}`}
              className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-3">

              {/* Diagram */}
              <VsepDiagram structure={g.structure} />

              {/* Name + example */}
              <div>
                <p className="font-sans font-semibold text-bright">{g.name}</p>
                <p className="font-mono text-xs text-secondary">{g.example}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <div>
                  <p className="font-mono text-dim">Bonding pairs</p>
                  <p className="font-mono text-primary">{g.bondingPairs}</p>
                </div>
                <div>
                  <p className="font-mono text-dim">Lone pairs</p>
                  <p className="font-mono text-primary">{g.lonePairs}</p>
                </div>
                <div>
                  <p className="font-mono text-dim">Bond angles</p>
                  <p className="font-mono text-primary">{g.bondAngles}</p>
                </div>
                <div>
                  <p className="font-mono text-dim">Hybridization</p>
                  <p className="font-mono text-primary">{g.hybridization}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-mono text-dim">Electron geometry</p>
                  <p className="font-mono text-primary">{g.electronGeometry}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
