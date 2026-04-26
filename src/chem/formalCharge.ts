import { VALENCE_ELECTRONS } from '../data/valenceElectrons'

// Minimal structural interfaces — satisfied by CanvasAtom/CanvasBond and LewisAtom/LewisBond
// via TypeScript structural typing. Defined here to keep chem/ import-clean.

interface FCAtom {
  id:        string
  element:   string
  lonePairs: number   // number of lone pairs (each = 2 electrons)
}

interface FCBond {
  from:  string
  to:    string
  order: number
}

interface AuthoritativeAtom {
  id:            string
  formal_charge: number
}

/**
 * FC = valence_electrons − (lone_pair_electrons) − (sum of bond orders)
 * lone_pair_electrons = lonePairs × 2
 */
export function computeFormalCharge(atom: FCAtom, bonds: FCBond[]): number {
  const degree = bonds
    .filter(b => b.from === atom.id || b.to === atom.id)
    .reduce((s, b) => s + b.order, 0)
  return (VALENCE_ELECTRONS[atom.element] ?? 4) - atom.lonePairs * 2 - degree
}

/** Return a map from atom id → expected formal charge from authoritative structure data. */
export function expectedFormalCharges(atoms: AuthoritativeAtom[]): Record<string, number> {
  return Object.fromEntries(atoms.map(a => [a.id, a.formal_charge]))
}
