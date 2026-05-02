// Ksp data from Chang's Chemistry 14e, Appendix.
// Values match Chang for student consistency with homework assignments.

export interface KspEntry {
  formula: string
  name: string
  Ksp: number
  cation: { formula: string; charge: number; count: number }
  anion:  { formula: string; charge: number; count: number }
}

export const KSP_TABLE: KspEntry[] = [
  {
    formula: 'AgCl',
    name: 'Silver chloride',
    Ksp: 1.8e-10,
    cation: { formula: 'Ag⁺',   charge: 1,  count: 1 },
    anion:  { formula: 'Cl⁻',   charge: -1, count: 1 },
  },
  {
    formula: 'AgBr',
    name: 'Silver bromide',
    Ksp: 5.0e-13,
    cation: { formula: 'Ag⁺',   charge: 1,  count: 1 },
    anion:  { formula: 'Br⁻',   charge: -1, count: 1 },
  },
  {
    formula: 'AgI',
    name: 'Silver iodide',
    Ksp: 8.3e-17,
    cation: { formula: 'Ag⁺',   charge: 1,  count: 1 },
    anion:  { formula: 'I⁻',    charge: -1, count: 1 },
  },
  {
    formula: 'Ag₂CrO₄',
    name: 'Silver chromate',
    Ksp: 1.2e-12,
    cation: { formula: 'Ag⁺',    charge: 1,  count: 2 },
    anion:  { formula: 'CrO₄²⁻', charge: -2, count: 1 },
  },
  {
    formula: 'BaSO₄',
    name: 'Barium sulfate',
    Ksp: 1.1e-10,
    cation: { formula: 'Ba²⁺',  charge: 2,  count: 1 },
    anion:  { formula: 'SO₄²⁻', charge: -2, count: 1 },
  },
  {
    formula: 'CaF₂',
    name: 'Calcium fluoride',
    Ksp: 3.9e-11,
    cation: { formula: 'Ca²⁺',  charge: 2,  count: 1 },
    anion:  { formula: 'F⁻',    charge: -1, count: 2 },
  },
  {
    formula: 'CaCO₃',
    name: 'Calcium carbonate',
    Ksp: 3.3e-9,
    cation: { formula: 'Ca²⁺',  charge: 2,  count: 1 },
    anion:  { formula: 'CO₃²⁻', charge: -2, count: 1 },
  },
  {
    formula: 'CaC₂O₄',
    name: 'Calcium oxalate',
    Ksp: 2.3e-9,
    cation: { formula: 'Ca²⁺',   charge: 2,  count: 1 },
    anion:  { formula: 'C₂O₄²⁻', charge: -2, count: 1 },
  },
  {
    formula: 'PbI₂',
    name: 'Lead(II) iodide',
    Ksp: 7.1e-9,
    cation: { formula: 'Pb²⁺',  charge: 2,  count: 1 },
    anion:  { formula: 'I⁻',    charge: -1, count: 2 },
  },
  {
    formula: 'PbCl₂',
    name: 'Lead(II) chloride',
    Ksp: 1.6e-5,
    cation: { formula: 'Pb²⁺',  charge: 2,  count: 1 },
    anion:  { formula: 'Cl⁻',   charge: -1, count: 2 },
  },
  {
    formula: 'PbSO₄',
    name: 'Lead(II) sulfate',
    Ksp: 6.3e-7,
    cation: { formula: 'Pb²⁺',  charge: 2,  count: 1 },
    anion:  { formula: 'SO₄²⁻', charge: -2, count: 1 },
  },
  {
    formula: 'Fe(OH)₃',
    name: 'Iron(III) hydroxide',
    Ksp: 4.0e-38,
    cation: { formula: 'Fe³⁺',  charge: 3,  count: 1 },
    anion:  { formula: 'OH⁻',   charge: -1, count: 3 },
  },
  {
    formula: 'Fe(OH)₂',
    name: 'Iron(II) hydroxide',
    Ksp: 8.0e-16,
    cation: { formula: 'Fe²⁺',  charge: 2,  count: 1 },
    anion:  { formula: 'OH⁻',   charge: -1, count: 2 },
  },
  {
    formula: 'Mg(OH)₂',
    name: 'Magnesium hydroxide',
    Ksp: 1.8e-11,
    cation: { formula: 'Mg²⁺',  charge: 2,  count: 1 },
    anion:  { formula: 'OH⁻',   charge: -1, count: 2 },
  },
  {
    formula: 'Mn(OH)₂',
    name: 'Manganese(II) hydroxide',
    Ksp: 1.9e-13,
    cation: { formula: 'Mn²⁺',  charge: 2,  count: 1 },
    anion:  { formula: 'OH⁻',   charge: -1, count: 2 },
  },
  {
    formula: 'Cu(OH)₂',
    name: 'Copper(II) hydroxide',
    Ksp: 2.2e-20,
    cation: { formula: 'Cu²⁺',  charge: 2,  count: 1 },
    anion:  { formula: 'OH⁻',   charge: -1, count: 2 },
  },
  {
    formula: 'Al(OH)₃',
    name: 'Aluminum hydroxide',
    Ksp: 1.8e-33,
    cation: { formula: 'Al³⁺',  charge: 3,  count: 1 },
    anion:  { formula: 'OH⁻',   charge: -1, count: 3 },
  },
  {
    formula: 'Zn(OH)₂',
    name: 'Zinc hydroxide',
    Ksp: 3.0e-17,
    cation: { formula: 'Zn²⁺',  charge: 2,  count: 1 },
    anion:  { formula: 'OH⁻',   charge: -1, count: 2 },
  },
  {
    formula: 'SrSO₄',
    name: 'Strontium sulfate',
    Ksp: 3.2e-7,
    cation: { formula: 'Sr²⁺',  charge: 2,  count: 1 },
    anion:  { formula: 'SO₄²⁻', charge: -2, count: 1 },
  },
  {
    formula: 'BaCO₃',
    name: 'Barium carbonate',
    Ksp: 2.6e-9,
    cation: { formula: 'Ba²⁺',  charge: 2,  count: 1 },
    anion:  { formula: 'CO₃²⁻', charge: -2, count: 1 },
  },
  {
    formula: 'MgCO₃',
    name: 'Magnesium carbonate',
    Ksp: 6.8e-6,
    cation: { formula: 'Mg²⁺',  charge: 2,  count: 1 },
    anion:  { formula: 'CO₃²⁻', charge: -2, count: 1 },
  },
  {
    formula: 'NiS',
    name: 'Nickel(II) sulfide',
    Ksp: 4.0e-20,
    cation: { formula: 'Ni²⁺',  charge: 2,  count: 1 },
    anion:  { formula: 'S²⁻',   charge: -2, count: 1 },
  },
]
