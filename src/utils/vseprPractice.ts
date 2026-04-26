// Pure VSEPR data and derived-property logic — no React, no Ketcher imports.

export interface VseprEntry {
  formula:   string
  central:   string
  bonds:     number
  lonePairs: number
  geometry:  string  // molecular geometry key (e.g. 'bent', 'trigonal planar')
  charge:    number
}

export const PROBLEMS: VseprEntry[] = [
  // LINEAR (AB₂)
  { formula: 'CO₂',    central: 'C',  bonds: 2, lonePairs: 0, geometry: 'linear',               charge:  0 },
  { formula: 'BeCl₂',  central: 'Be', bonds: 2, lonePairs: 0, geometry: 'linear',               charge:  0 },
  { formula: 'HgBr₂',  central: 'Hg', bonds: 2, lonePairs: 0, geometry: 'linear',               charge:  0 },
  { formula: 'CS₂',    central: 'C',  bonds: 2, lonePairs: 0, geometry: 'linear',               charge:  0 },

  // TRIGONAL PLANAR (AB₃)
  { formula: 'BF₃',    central: 'B',  bonds: 3, lonePairs: 0, geometry: 'trigonal planar',      charge:  0 },
  { formula: 'BCl₃',   central: 'B',  bonds: 3, lonePairs: 0, geometry: 'trigonal planar',      charge:  0 },
  { formula: 'AlCl₃',  central: 'Al', bonds: 3, lonePairs: 0, geometry: 'trigonal planar',      charge:  0 },
  { formula: 'SO₃',    central: 'S',  bonds: 3, lonePairs: 0, geometry: 'trigonal planar',      charge:  0 },
  { formula: 'NO₃⁻',   central: 'N',  bonds: 3, lonePairs: 0, geometry: 'trigonal planar',      charge: -1 },
  { formula: 'CO₃²⁻',  central: 'C',  bonds: 3, lonePairs: 0, geometry: 'trigonal planar',      charge: -2 },

  // BENT from trigonal planar (AB₂E)
  { formula: 'SO₂',    central: 'S',  bonds: 2, lonePairs: 1, geometry: 'bent',                 charge:  0 },
  { formula: 'NO₂⁻',   central: 'N',  bonds: 2, lonePairs: 1, geometry: 'bent',                 charge: -1 },
  { formula: 'O₃',     central: 'O',  bonds: 2, lonePairs: 1, geometry: 'bent',                 charge:  0 },

  // TETRAHEDRAL (AB₄)
  { formula: 'CH₄',    central: 'C',  bonds: 4, lonePairs: 0, geometry: 'tetrahedral',          charge:  0 },
  { formula: 'SiH₄',   central: 'Si', bonds: 4, lonePairs: 0, geometry: 'tetrahedral',          charge:  0 },
  { formula: 'SiCl₄',  central: 'Si', bonds: 4, lonePairs: 0, geometry: 'tetrahedral',          charge:  0 },
  { formula: 'CBr₄',   central: 'C',  bonds: 4, lonePairs: 0, geometry: 'tetrahedral',          charge:  0 },
  { formula: 'NH₄⁺',   central: 'N',  bonds: 4, lonePairs: 0, geometry: 'tetrahedral',          charge:  1 },
  { formula: 'BF₄⁻',   central: 'B',  bonds: 4, lonePairs: 0, geometry: 'tetrahedral',          charge: -1 },
  { formula: 'AlCl₄⁻', central: 'Al', bonds: 4, lonePairs: 0, geometry: 'tetrahedral',          charge: -1 },

  // TRIGONAL PYRAMIDAL (AB₃E)
  { formula: 'NH₃',    central: 'N',  bonds: 3, lonePairs: 1, geometry: 'trigonal pyramidal',   charge:  0 },
  { formula: 'NF₃',    central: 'N',  bonds: 3, lonePairs: 1, geometry: 'trigonal pyramidal',   charge:  0 },
  { formula: 'PCl₃',   central: 'P',  bonds: 3, lonePairs: 1, geometry: 'trigonal pyramidal',   charge:  0 },
  { formula: 'H₃O⁺',   central: 'O',  bonds: 3, lonePairs: 1, geometry: 'trigonal pyramidal',   charge:  1 },

  // BENT from tetrahedral (AB₂E₂)
  { formula: 'H₂O',    central: 'O',  bonds: 2, lonePairs: 2, geometry: 'bent',                 charge:  0 },
  { formula: 'H₂S',    central: 'S',  bonds: 2, lonePairs: 2, geometry: 'bent',                 charge:  0 },
  { formula: 'H₂Se',   central: 'Se', bonds: 2, lonePairs: 2, geometry: 'bent',                 charge:  0 },
  { formula: 'SCl₂',   central: 'S',  bonds: 2, lonePairs: 2, geometry: 'bent',                 charge:  0 },

  // TRIGONAL BIPYRAMIDAL (AB₅)
  { formula: 'PCl₅',   central: 'P',  bonds: 5, lonePairs: 0, geometry: 'trigonal bipyramidal', charge:  0 },

  // SEESAW (AB₄E)
  { formula: 'SF₄',    central: 'S',  bonds: 4, lonePairs: 1, geometry: 'seesaw',               charge:  0 },
  { formula: 'SeF₄',   central: 'Se', bonds: 4, lonePairs: 1, geometry: 'seesaw',               charge:  0 },
  { formula: 'TeCl₄',  central: 'Te', bonds: 4, lonePairs: 1, geometry: 'seesaw',               charge:  0 },

  // T-SHAPED (AB₃E₂)
  { formula: 'ClF₃',   central: 'Cl', bonds: 3, lonePairs: 2, geometry: 't-shaped',             charge:  0 },
  { formula: 'ICl₃',   central: 'I',  bonds: 3, lonePairs: 2, geometry: 't-shaped',             charge:  0 },

  // LINEAR from trigonal bipyramidal (AB₂E₃)
  { formula: 'I₃⁻',    central: 'I',  bonds: 2, lonePairs: 3, geometry: 'linear',               charge: -1 },
  { formula: 'ICl₂⁻',  central: 'I',  bonds: 2, lonePairs: 3, geometry: 'linear',               charge: -1 },
  { formula: 'XeF₂',   central: 'Xe', bonds: 2, lonePairs: 3, geometry: 'linear',               charge:  0 },

  // OCTAHEDRAL (AB₆)
  { formula: 'SF₆',    central: 'S',  bonds: 6, lonePairs: 0, geometry: 'octahedral',           charge:  0 },
  { formula: 'SbF₆⁻',  central: 'Sb', bonds: 6, lonePairs: 0, geometry: 'octahedral',           charge: -1 },

  // SQUARE PYRAMIDAL (AB₅E)
  { formula: 'BrF₅',   central: 'Br', bonds: 5, lonePairs: 1, geometry: 'square pyramidal',     charge:  0 },

  // SQUARE PLANAR (AB₄E₂)
  { formula: 'XeF₄',   central: 'Xe', bonds: 4, lonePairs: 2, geometry: 'square planar',        charge:  0 },
  { formula: 'ICl₄⁻',  central: 'I',  bonds: 4, lonePairs: 2, geometry: 'square planar',        charge: -1 },
]

export const GEO_DISPLAY: Record<string, string> = {
  'linear':               'Linear',
  'trigonal planar':      'Trigonal Planar',
  'bent':                 'Bent',
  'tetrahedral':          'Tetrahedral',
  'trigonal pyramidal':   'Trigonal Pyramidal',
  'trigonal bipyramidal': 'Trigonal Bipyramidal',
  'seesaw':               'See-Saw',
  't-shaped':             'T-Shaped',
  'octahedral':           'Octahedral',
  'square pyramidal':     'Square Pyramidal',
  'square planar':        'Square Planar',
}

export function molGeo(e: VseprEntry): string {
  return GEO_DISPLAY[e.geometry.toLowerCase()] ?? e.geometry
}

export function elecGeo(e: VseprEntry): string {
  const d = e.bonds + e.lonePairs
  if (d === 2) return 'Linear'
  if (d === 3) return 'Trigonal Planar'
  if (d === 4) return 'Tetrahedral'
  if (d === 5) return 'Trigonal Bipyramidal'
  if (d === 6) return 'Octahedral'
  return '?'
}

export function hybrid(e: VseprEntry): string {
  const d = e.bonds + e.lonePairs
  if (d === 2) return 'sp'
  if (d === 3) return 'sp²'
  if (d === 4) return 'sp³'
  if (d === 5) return 'sp³d'
  if (d === 6) return 'sp³d²'
  return '?'
}

export function bondAngles(e: VseprEntry): string {
  const g = e.geometry.toLowerCase()
  if (g === 'linear')               return '180°'
  if (g === 'trigonal planar')      return '120°'
  if (g === 'bent')                 return e.lonePairs === 1 ? '≈120°' : '≈104.5°'
  if (g === 'tetrahedral')          return '≈109.5°'
  if (g === 'trigonal pyramidal')   return '≈107°'
  if (g === 'trigonal bipyramidal') return '90°, 120°'
  if (g === 'seesaw')               return '≈90°, ≈120°'
  if (g === 't-shaped')             return '90°, 180°'
  if (g === 'octahedral')           return '90°'
  if (g === 'square pyramidal')     return '90°'
  if (g === 'square planar')        return '90°'
  return '?'
}
