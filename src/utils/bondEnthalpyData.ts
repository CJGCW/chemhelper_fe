// ── Types ─────────────────────────────────────────────────────────────────────

export interface BondEntry {
  bond:     string   // e.g. "C-H"
  energy:   number   // kJ/mol (average)
  category: string
}

// ── Bond energy table (average values, kJ/mol) ────────────────────────────────

export const BOND_DATA: BondEntry[] = [
  // H-X
  { bond: 'H-H',   energy: 432, category: 'H–X' },
  { bond: 'H-F',   energy: 565, category: 'H–X' },
  { bond: 'H-Cl',  energy: 427, category: 'H–X' },
  { bond: 'H-Br',  energy: 363, category: 'H–X' },
  { bond: 'H-I',   energy: 295, category: 'H–X' },
  { bond: 'H-N',   energy: 391, category: 'H–X' },
  { bond: 'H-O',   energy: 463, category: 'H–X' },
  { bond: 'H-S',   energy: 339, category: 'H–X' },
  // C-X
  { bond: 'C-H',   energy: 413, category: 'C–X' },
  { bond: 'C-C',   energy: 347, category: 'C–X' },
  { bond: 'C=C',   energy: 614, category: 'C–X' },
  { bond: 'C≡C',   energy: 839, category: 'C–X' },
  { bond: 'C-N',   energy: 305, category: 'C–X' },
  { bond: 'C=N',   energy: 615, category: 'C–X' },
  { bond: 'C≡N',   energy: 891, category: 'C–X' },
  { bond: 'C-O',   energy: 358, category: 'C–X' },
  { bond: 'C=O',   energy: 745, category: 'C–X' },
  { bond: 'C-F',   energy: 485, category: 'C–X' },
  { bond: 'C-Cl',  energy: 339, category: 'C–X' },
  { bond: 'C-Br',  energy: 276, category: 'C–X' },
  { bond: 'C-I',   energy: 240, category: 'C–X' },
  { bond: 'C-S',   energy: 259, category: 'C–X' },
  // N-X
  { bond: 'N-N',   energy: 163, category: 'N–X' },
  { bond: 'N=N',   energy: 418, category: 'N–X' },
  { bond: 'N≡N',   energy: 945, category: 'N–X' },
  { bond: 'N-O',   energy: 201, category: 'N–X' },
  { bond: 'N=O',   energy: 607, category: 'N–X' },
  // O-X
  { bond: 'O-O',   energy: 146, category: 'O–X' },
  { bond: 'O=O',   energy: 498, category: 'O–X' },
  { bond: 'O-F',   energy: 190, category: 'O–X' },
  { bond: 'O-Cl',  energy: 203, category: 'O–X' },
  // Halogens
  { bond: 'F-F',   energy: 155, category: 'X–X' },
  { bond: 'Cl-Cl', energy: 242, category: 'X–X' },
  { bond: 'Br-Br', energy: 193, category: 'X–X' },
  { bond: 'I-I',   energy: 151, category: 'X–X' },
  // S-X
  { bond: 'S-S',   energy: 266, category: 'S–X' },
  { bond: 'S=O',   energy: 532, category: 'S–X' },
  // Si-X
  { bond: 'Si-H',  energy: 318, category: 'Si–X' },
  { bond: 'Si-Si', energy: 222, category: 'Si–X' },
  { bond: 'Si-O',  energy: 452, category: 'Si–X' },
  { bond: 'Si-Cl', energy: 381, category: 'Si–X' },
]

export const BOND_CATEGORIES = [...new Set(BOND_DATA.map(b => b.category))]

export function lookupBond(bond: string): number | undefined {
  return BOND_DATA.find(b => b.bond === bond)?.energy
}
