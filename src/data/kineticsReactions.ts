// Chemical Kinetics data — rate law reactions, integrated rate examples, Arrhenius data.
// Values from Chang Chemistry 14e Chapter 13 unless otherwise noted.

export interface RateDataTrial {
  concentrations: Record<string, number>
  initialRate: number  // mol/(L·s)
}

export interface RateLawReaction {
  id: string
  equation: string
  species: string[]
  trials: RateDataTrial[]
  orders: Record<string, number>
  rateConstant: number
  rateConstantUnit: string
}

export const RATE_LAW_REACTIONS: RateLawReaction[] = [
  {
    id: 'no-o2',
    equation: '2NO(g) + O₂(g) → 2NO₂(g)',
    species: ['NO', 'O₂'],
    trials: [
      { concentrations: { 'NO': 0.0050, 'O₂': 0.0050 }, initialRate: 3.0e-5 },
      { concentrations: { 'NO': 0.010,  'O₂': 0.0050 }, initialRate: 1.2e-4 },
      { concentrations: { 'NO': 0.0050, 'O₂': 0.010  }, initialRate: 6.0e-5 },
    ],
    orders: { 'NO': 2, 'O₂': 1 },
    rateConstant: 240,
    rateConstantUnit: 'L²/(mol²·s)',
  },
  {
    id: 'bro3-br-h',
    equation: 'BrO₃⁻ + 5Br⁻ + 6H⁺ → 3Br₂ + 3H₂O',
    species: ['BrO₃⁻', 'Br⁻', 'H⁺'],
    trials: [
      { concentrations: { 'BrO₃⁻': 0.10, 'Br⁻': 0.10, 'H⁺': 0.10 }, initialRate: 1.21e-3 },
      { concentrations: { 'BrO₃⁻': 0.20, 'Br⁻': 0.10, 'H⁺': 0.10 }, initialRate: 2.42e-3 },
      { concentrations: { 'BrO₃⁻': 0.10, 'Br⁻': 0.30, 'H⁺': 0.10 }, initialRate: 3.63e-3 },
      { concentrations: { 'BrO₃⁻': 0.10, 'Br⁻': 0.10, 'H⁺': 0.20 }, initialRate: 4.84e-3 },
    ],
    orders: { 'BrO₃⁻': 1, 'Br⁻': 1, 'H⁺': 2 },
    rateConstant: 1.21e3,
    rateConstantUnit: 'L⁴/(mol⁴·s)',
  },
  {
    id: 's2o8-i',
    equation: 'S₂O₈²⁻ + 2I⁻ → I₂ + 2SO₄²⁻',
    species: ['S₂O₈²⁻', 'I⁻'],
    trials: [
      { concentrations: { 'S₂O₈²⁻': 0.080, 'I⁻': 0.034 }, initialRate: 3.34e-4 },
      { concentrations: { 'S₂O₈²⁻': 0.080, 'I⁻': 0.017 }, initialRate: 1.67e-4 },
      { concentrations: { 'S₂O₈²⁻': 0.16,  'I⁻': 0.034 }, initialRate: 6.68e-4 },
    ],
    orders: { 'S₂O₈²⁻': 1, 'I⁻': 1 },
    rateConstant: 0.123,
    rateConstantUnit: 'L/(mol·s)',
  },
  {
    id: 'h2o2-decomp',
    equation: '2H₂O₂ → 2H₂O + O₂',
    species: ['H₂O₂'],
    trials: [
      { concentrations: { 'H₂O₂': 0.100 }, initialRate: 7.30e-5 },
      { concentrations: { 'H₂O₂': 0.200 }, initialRate: 1.46e-4 },
      { concentrations: { 'H₂O₂': 0.050 }, initialRate: 3.65e-5 },
    ],
    orders: { 'H₂O₂': 1 },
    rateConstant: 7.30e-4,
    rateConstantUnit: 's⁻¹',
  },
  {
    id: 'chcl3-cl2',
    equation: 'CHCl₃(g) + Cl₂(g) → CCl₄(g) + HCl(g)',
    species: ['CHCl₃', 'Cl₂'],
    trials: [
      { concentrations: { 'CHCl₃': 0.010, 'Cl₂': 0.010 }, initialRate: 1.00e-5 },
      { concentrations: { 'CHCl₃': 0.020, 'Cl₂': 0.010 }, initialRate: 2.00e-5 },
      { concentrations: { 'CHCl₃': 0.010, 'Cl₂': 0.040 }, initialRate: 2.00e-5 },
    ],
    orders: { 'CHCl₃': 1, 'Cl₂': 0.5 },
    rateConstant: 0.100,
    rateConstantUnit: 'L^0.5/(mol^0.5·s)',
  },
  {
    id: 'acetone-iodination',
    equation: 'CH₃COCH₃ + I₂ → CH₃COCH₂I + HI (acid-catalyzed)',
    species: ['acetone', 'acid', 'I₂'],
    trials: [
      { concentrations: { 'acetone': 0.30, 'acid': 0.10, 'I₂': 0.0050 }, initialRate: 5.7e-5 },
      { concentrations: { 'acetone': 0.60, 'acid': 0.10, 'I₂': 0.0050 }, initialRate: 1.14e-4 },
      { concentrations: { 'acetone': 0.30, 'acid': 0.20, 'I₂': 0.0050 }, initialRate: 1.14e-4 },
      { concentrations: { 'acetone': 0.30, 'acid': 0.10, 'I₂': 0.010  }, initialRate: 5.7e-5 },
    ],
    orders: { 'acetone': 1, 'acid': 1, 'I₂': 0 },
    rateConstant: 1.9e-3,
    rateConstantUnit: 'L/(mol·s)',
  },
  {
    id: 'nh4-no2',
    equation: 'NH₄⁺ + NO₂⁻ → N₂ + 2H₂O',
    species: ['NH₄⁺', 'NO₂⁻'],
    trials: [
      { concentrations: { 'NH₄⁺': 0.0100, 'NO₂⁻': 0.200 }, initialRate: 5.4e-7 },
      { concentrations: { 'NH₄⁺': 0.0200, 'NO₂⁻': 0.200 }, initialRate: 1.08e-6 },
      { concentrations: { 'NH₄⁺': 0.0200, 'NO₂⁻': 0.400 }, initialRate: 2.16e-6 },
    ],
    orders: { 'NH₄⁺': 1, 'NO₂⁻': 1 },
    rateConstant: 2.7e-4,
    rateConstantUnit: 'L/(mol·s)',
  },
  {
    id: 'no2-decomp',
    equation: '2NO₂ → 2NO + O₂',
    species: ['NO₂'],
    trials: [
      { concentrations: { 'NO₂': 0.010 }, initialRate: 5.4e-5 },
      { concentrations: { 'NO₂': 0.020 }, initialRate: 2.16e-4 },
      { concentrations: { 'NO₂': 0.030 }, initialRate: 4.86e-4 },
    ],
    orders: { 'NO₂': 2 },
    rateConstant: 0.54,
    rateConstantUnit: 'L/(mol·s)',
  },
]

// ── Integrated Rate Law Reactions ─────────────────────────────────────────────

export interface IntegratedRateReaction {
  id: string
  equation: string
  order: 0 | 1 | 2
  k: number
  kUnit: string
  A0: number
  halfLife: number
}

export const INTEGRATED_RATE_REACTIONS: IntegratedRateReaction[] = [
  {
    id: 'n2o5-decomp',
    equation: '2N₂O₅ → 4NO₂ + O₂',
    order: 1,
    k: 5.1e-4,
    kUnit: 's⁻¹',
    A0: 0.0200,
    halfLife: Math.LN2 / 5.1e-4,  // ≈ 1359 s
  },
  {
    id: 'no2-2nd',
    equation: '2NO₂ → 2NO + O₂',
    order: 2,
    k: 0.54,
    kUnit: 'L/(mol·s)',
    A0: 0.010,
    halfLife: 1 / (0.54 * 0.010),  // ≈ 185 s
  },
  {
    id: 'so2cl2-decomp',
    equation: 'SO₂Cl₂ → SO₂ + Cl₂',
    order: 1,
    k: 2.2e-5,
    kUnit: 's⁻¹',
    A0: 0.0500,
    halfLife: Math.LN2 / 2.2e-5,  // ≈ 31507 s
  },
  {
    id: 'ch3cho-decomp',
    equation: 'CH₃CHO → CH₄ + CO',
    order: 2,
    k: 0.334,
    kUnit: 'L/(mol·s)',
    A0: 0.100,
    halfLife: 1 / (0.334 * 0.100),  // ≈ 30 s
  },
  {
    id: 'h2o2-1st',
    equation: '2H₂O₂ → 2H₂O + O₂',
    order: 1,
    k: 7.3e-4,
    kUnit: 's⁻¹',
    A0: 0.100,
    halfLife: Math.LN2 / 7.3e-4,  // ≈ 950 s
  },
  {
    id: 'sucrose-pseudo',
    equation: 'C₁₂H₂₂O₁₁ + H₂O → 2C₆H₁₂O₆ (pseudo-1st order)',
    order: 1,
    k: 6.2e-5,
    kUnit: 's⁻¹',
    A0: 0.500,
    halfLife: Math.LN2 / 6.2e-5,  // ≈ 11183 s
  },
  {
    id: 'cyclopropane',
    equation: 'cyclo-C₃H₆ → CH₂=CHCH₃',
    order: 1,
    k: 9.2e-3,
    kUnit: 's⁻¹',
    A0: 0.0500,
    halfLife: Math.LN2 / 9.2e-3,  // ≈ 75 s
  },
  {
    id: 'nh3-surface-zero',
    equation: 'NH₃(g) → N₂ + H₂ (surface, 0th order)',
    order: 0,
    k: 2.5e-4,
    kUnit: 'M/s',
    A0: 0.100,
    halfLife: 0.100 / (2 * 2.5e-4),  // ≈ 200 s
  },
  {
    id: 'enzyme-zero',
    equation: 'Enzyme-catalyzed reaction (0th order in substrate)',
    order: 0,
    k: 1.0e-3,
    kUnit: 'M/s',
    A0: 0.500,
    halfLife: 0.500 / (2 * 1.0e-3),  // = 250 s
  },
]

// ── Arrhenius Data ────────────────────────────────────────────────────────────

export interface ArrheniusData {
  id: string
  equation: string
  Ea: number   // kJ/mol
  A: number
  kUnit: string
  pairs: { T: number; k: number }[]
}

export const ARRHENIUS_REACTIONS: ArrheniusData[] = [
  {
    id: 'n2o5-arrhenius',
    equation: '2N₂O₅ → 4NO₂ + O₂',
    Ea: 88,
    A: 4.3e13,
    kUnit: 's⁻¹',
    pairs: [
      { T: 298, k: 1.35e-5 },
      { T: 308, k: 2.67e-5 },
      { T: 318, k: 5.11e-5 },
      { T: 328, k: 9.52e-5 },
      { T: 338, k: 5.1e-4  },
    ],
  },
  {
    id: 'h2-i2',
    equation: 'H₂(g) + I₂(g) → 2HI(g)',
    Ea: 163,
    A: 5.4e10,
    kUnit: 'L/(mol·s)',
    pairs: [
      { T: 599, k: 2.53e-2 },
      { T: 683, k: 0.879   },
      { T: 769, k: 13.9    },
    ],
  },
  {
    id: 'sucrose-arrhenius',
    equation: 'Sucrose hydrolysis (acid-catalyzed)',
    Ea: 108,
    A: 3.0e13,
    kUnit: 's⁻¹',
    pairs: [
      { T: 298, k: 6.2e-5  },
      { T: 308, k: 1.85e-4 },
      { T: 318, k: 5.4e-4  },
    ],
  },
  {
    id: 'no2-decomp-arr',
    equation: '2NO₂ → 2NO + O₂',
    Ea: 111,
    A: 2.0e9,
    kUnit: 'L/(mol·s)',
    pairs: [
      { T: 573, k: 0.54  },
      { T: 623, k: 3.7   },
      { T: 673, k: 18.2  },
    ],
  },
  {
    id: 'ch3nc-isomerization',
    equation: 'CH₃NC → CH₃CN (isomerization)',
    Ea: 160,
    A: 3.98e13,
    kUnit: 's⁻¹',
    pairs: [
      { T: 472, k: 2.52e-5 },
      { T: 488, k: 8.65e-5 },
      { T: 515, k: 6.30e-4 },
      { T: 543, k: 3.16e-3 },
    ],
  },
  {
    id: 'nh3-decomp-arr',
    equation: '2NH₃ → N₂ + 3H₂ (surface)',
    Ea: 76,
    A: 1.0e8,
    kUnit: 's⁻¹',
    pairs: [
      { T: 700, k: 4.0e-3  },
      { T: 800, k: 0.12    },
      { T: 900, k: 1.9     },
    ],
  },
]
