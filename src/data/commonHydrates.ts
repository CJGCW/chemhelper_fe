export interface HydrateElementEntry {
  symbol:    string
  count:     number
  molarMass: number
}

export interface HydrateData {
  formula:    string
  display:    string    // Unicode subscripts for display
  molarMass:  number    // g/mol of anhydrous salt
  realX:      number    // actual hydration number in nature
  elements:   HydrateElementEntry[]
}

export const COMMON_HYDRATES: HydrateData[] = [
  {
    formula: 'CuSO4', display: 'CuSO₄', molarMass: 159.61, realX: 5,
    elements: [
      { symbol: 'Cu', count: 1, molarMass: 63.55 },
      { symbol: 'S',  count: 1, molarMass: 32.07 },
      { symbol: 'O',  count: 4, molarMass: 16.00 },
    ],
  },
  {
    formula: 'MgSO4', display: 'MgSO₄', molarMass: 120.38, realX: 7,
    elements: [
      { symbol: 'Mg', count: 1, molarMass: 24.31 },
      { symbol: 'S',  count: 1, molarMass: 32.07 },
      { symbol: 'O',  count: 4, molarMass: 16.00 },
    ],
  },
  {
    formula: 'Na2CO3', display: 'Na₂CO₃', molarMass: 105.99, realX: 10,
    elements: [
      { symbol: 'Na', count: 2, molarMass: 22.99 },
      { symbol: 'C',  count: 1, molarMass: 12.01 },
      { symbol: 'O',  count: 3, molarMass: 16.00 },
    ],
  },
  {
    formula: 'CaCl2', display: 'CaCl₂', molarMass: 110.98, realX: 2,
    elements: [
      { symbol: 'Ca', count: 1, molarMass: 40.08 },
      { symbol: 'Cl', count: 2, molarMass: 35.45 },
    ],
  },
  {
    formula: 'FeCl3', display: 'FeCl₃', molarMass: 162.20, realX: 6,
    elements: [
      { symbol: 'Fe', count: 1, molarMass: 55.85 },
      { symbol: 'Cl', count: 3, molarMass: 35.45 },
    ],
  },
  {
    formula: 'Al2(SO4)3', display: 'Al₂(SO₄)₃', molarMass: 342.15, realX: 18,
    elements: [
      { symbol: 'Al', count: 2,  molarMass: 26.98 },
      { symbol: 'S',  count: 3,  molarMass: 32.07 },
      { symbol: 'O',  count: 12, molarMass: 16.00 },
    ],
  },
  {
    formula: 'CoCl2', display: 'CoCl₂', molarMass: 129.84, realX: 6,
    elements: [
      { symbol: 'Co', count: 1, molarMass: 58.93 },
      { symbol: 'Cl', count: 2, molarMass: 35.45 },
    ],
  },
  {
    formula: 'BaCl2', display: 'BaCl₂', molarMass: 208.23, realX: 2,
    elements: [
      { symbol: 'Ba', count: 1, molarMass: 137.33 },
      { symbol: 'Cl', count: 2, molarMass:  35.45 },
    ],
  },
  {
    formula: 'ZnSO4', display: 'ZnSO₄', molarMass: 161.45, realX: 7,
    elements: [
      { symbol: 'Zn', count: 1, molarMass: 65.38 },
      { symbol: 'S',  count: 1, molarMass: 32.07 },
      { symbol: 'O',  count: 4, molarMass: 16.00 },
    ],
  },
  {
    formula: 'Na2SO4', display: 'Na₂SO₄', molarMass: 142.05, realX: 10,
    elements: [
      { symbol: 'Na', count: 2, molarMass: 22.99 },
      { symbol: 'S',  count: 1, molarMass: 32.07 },
      { symbol: 'O',  count: 4, molarMass: 16.00 },
    ],
  },
  {
    formula: 'KAlSO42', display: 'KAl(SO₄)₂', molarMass: 258.21, realX: 12,
    elements: [
      { symbol: 'K',  count: 1, molarMass: 39.10 },
      { symbol: 'Al', count: 1, molarMass: 26.98 },
      { symbol: 'S',  count: 2, molarMass: 32.07 },
      { symbol: 'O',  count: 8, molarMass: 16.00 },
    ],
  },
]
