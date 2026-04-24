export interface RedoxTitrationPair {
  oxidizer: {
    formula:          string
    ascii:            string
    electronsPerMole: number   // electrons accepted per formula unit
  }
  reducer: {
    formula:          string
    ascii:            string
    electronsPerMole: number   // electrons donated per formula unit
  }
  conditions: 'acidic' | 'basic'
  equation:   string
  moleRatio: { oxidizer: number; reducer: number }
}

export const REDOX_PAIRS: RedoxTitrationPair[] = [
  {
    oxidizer: { formula: 'KMnO₄',    ascii: 'KMnO4',    electronsPerMole: 5 },
    reducer:  { formula: 'Fe²⁺',     ascii: 'Fe2+',     electronsPerMole: 1 },
    conditions: 'acidic',
    equation: 'MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O',
    moleRatio: { oxidizer: 1, reducer: 5 },
  },
  {
    oxidizer: { formula: 'K₂Cr₂O₇', ascii: 'K2Cr2O7',  electronsPerMole: 6 },
    reducer:  { formula: 'Fe²⁺',     ascii: 'Fe2+',     electronsPerMole: 1 },
    conditions: 'acidic',
    equation: 'Cr₂O₇²⁻ + 6 Fe²⁺ + 14 H⁺ → 2 Cr³⁺ + 6 Fe³⁺ + 7 H₂O',
    moleRatio: { oxidizer: 1, reducer: 6 },
  },
  {
    oxidizer: { formula: 'I₂',       ascii: 'I2',       electronsPerMole: 2 },
    reducer:  { formula: 'S₂O₃²⁻',  ascii: 'S2O3 2-',  electronsPerMole: 1 },
    conditions: 'basic',
    equation: 'I₂ + 2 S₂O₃²⁻ → 2 I⁻ + S₄O₆²⁻',
    moleRatio: { oxidizer: 1, reducer: 2 },
  },
  {
    oxidizer: { formula: 'KMnO₄',    ascii: 'KMnO4',    electronsPerMole: 5 },
    reducer:  { formula: 'H₂O₂',     ascii: 'H2O2',     electronsPerMole: 2 },
    conditions: 'acidic',
    equation: '2 MnO₄⁻ + 5 H₂O₂ + 6 H⁺ → 2 Mn²⁺ + 5 O₂ + 8 H₂O',
    moleRatio: { oxidizer: 2, reducer: 5 },
  },
  {
    oxidizer: { formula: 'KMnO₄',    ascii: 'KMnO4',    electronsPerMole: 5 },
    reducer:  { formula: 'C₂O₄²⁻',  ascii: 'C2O4 2-',  electronsPerMole: 2 },
    conditions: 'acidic',
    equation: '2 MnO₄⁻ + 5 C₂O₄²⁻ + 16 H⁺ → 2 Mn²⁺ + 10 CO₂ + 8 H₂O',
    moleRatio: { oxidizer: 2, reducer: 5 },
  },
  {
    oxidizer: { formula: 'I₂',       ascii: 'I2',       electronsPerMole: 2 },
    reducer:  { formula: 'Sn²⁺',     ascii: 'Sn2+',    electronsPerMole: 2 },
    conditions: 'acidic',
    equation: 'I₂ + Sn²⁺ → 2 I⁻ + Sn⁴⁺',
    moleRatio: { oxidizer: 1, reducer: 1 },
  },
]
