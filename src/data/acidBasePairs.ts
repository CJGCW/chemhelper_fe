export interface AcidBasePair {
  acid: {
    formula:     string
    ascii:       string
    equivalents: number   // H⁺ per formula unit
  }
  base: {
    formula:     string
    ascii:       string
    equivalents: number   // OH⁻ per formula unit
  }
  equation:    string
  waterPerAcid: number
}

export const ACID_BASE_PAIRS: AcidBasePair[] = [
  {
    acid: { formula: 'HCl',     ascii: 'HCl',     equivalents: 1 },
    base: { formula: 'NaOH',   ascii: 'NaOH',    equivalents: 1 },
    equation: 'HCl + NaOH → NaCl + H₂O',
    waterPerAcid: 1,
  },
  {
    acid: { formula: 'HNO₃',   ascii: 'HNO3',    equivalents: 1 },
    base: { formula: 'KOH',    ascii: 'KOH',     equivalents: 1 },
    equation: 'HNO₃ + KOH → KNO₃ + H₂O',
    waterPerAcid: 1,
  },
  {
    acid: { formula: 'H₂SO₄',  ascii: 'H2SO4',   equivalents: 2 },
    base: { formula: 'NaOH',   ascii: 'NaOH',    equivalents: 1 },
    equation: 'H₂SO₄ + 2 NaOH → Na₂SO₄ + 2 H₂O',
    waterPerAcid: 2,
  },
  {
    acid: { formula: 'HCl',    ascii: 'HCl',     equivalents: 1 },
    base: { formula: 'Ba(OH)₂', ascii: 'Ba(OH)2', equivalents: 2 },
    equation: '2 HCl + Ba(OH)₂ → BaCl₂ + 2 H₂O',
    waterPerAcid: 1,
  },
  {
    acid: { formula: 'H₃PO₄',  ascii: 'H3PO4',   equivalents: 3 },
    base: { formula: 'NaOH',   ascii: 'NaOH',    equivalents: 1 },
    equation: 'H₃PO₄ + 3 NaOH → Na₃PO₄ + 3 H₂O',
    waterPerAcid: 3,
  },
  {
    acid: { formula: 'HCl',    ascii: 'HCl',     equivalents: 1 },
    base: { formula: 'KOH',    ascii: 'KOH',     equivalents: 1 },
    equation: 'HCl + KOH → KCl + H₂O',
    waterPerAcid: 1,
  },
  {
    acid: { formula: 'HClO₄',  ascii: 'HClO4',   equivalents: 1 },
    base: { formula: 'NaOH',   ascii: 'NaOH',    equivalents: 1 },
    equation: 'HClO₄ + NaOH → NaClO₄ + H₂O',
    waterPerAcid: 1,
  },
  {
    acid: { formula: 'H₂SO₄',  ascii: 'H2SO4',   equivalents: 2 },
    base: { formula: 'Ba(OH)₂', ascii: 'Ba(OH)2', equivalents: 2 },
    equation: 'H₂SO₄ + Ba(OH)₂ → BaSO₄↓ + 2 H₂O',
    waterPerAcid: 2,
  },
  {
    acid: { formula: 'HBr',    ascii: 'HBr',     equivalents: 1 },
    base: { formula: 'LiOH',   ascii: 'LiOH',    equivalents: 1 },
    equation: 'HBr + LiOH → LiBr + H₂O',
    waterPerAcid: 1,
  },
]
