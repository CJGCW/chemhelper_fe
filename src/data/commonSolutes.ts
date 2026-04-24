export interface Solute {
  formula:            string
  displayName:        string
  molarMass:          number
  exampleDeltaHsoln?: number   // kJ/mol; used by practice generator to back-solve ΔT
}

export const COMMON_SOLUTES: Solute[] = [
  { formula: 'NH4NO3', displayName: 'NH₄NO₃ (ammonium nitrate)', molarMass:  80.04, exampleDeltaHsoln: +25.7 },
  { formula: 'KCl',    displayName: 'KCl (potassium chloride)',   molarMass:  74.55, exampleDeltaHsoln: +17.2 },
  { formula: 'NaCl',   displayName: 'NaCl (sodium chloride)',     molarMass:  58.44, exampleDeltaHsoln:  +3.9 },
  { formula: 'NaOH',   displayName: 'NaOH (sodium hydroxide)',    molarMass:  40.00, exampleDeltaHsoln: -44.5 },
  { formula: 'CaCl2',  displayName: 'CaCl₂ (calcium chloride)',  molarMass: 110.98, exampleDeltaHsoln: -82.8 },
  { formula: 'LiCl',   displayName: 'LiCl (lithium chloride)',    molarMass:  42.39, exampleDeltaHsoln: -37.0 },
  { formula: 'NaNO3',  displayName: 'NaNO₃ (sodium nitrate)',    molarMass:  84.99, exampleDeltaHsoln: +20.5 },
  { formula: 'KNO3',   displayName: 'KNO₃ (potassium nitrate)',  molarMass: 101.10, exampleDeltaHsoln: +34.9 },
]
