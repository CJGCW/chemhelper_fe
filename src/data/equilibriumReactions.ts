// Equilibrium reaction data for Chemical Equilibrium tools.
// Values from Chang's Chemistry 14e.

export interface EquilibriumSpecies {
  formula: string
  coefficient: number
  state: 'g' | 'l' | 's' | 'aq'
}

export interface EquilibriumReaction {
  id: string
  equation: string
  products: EquilibriumSpecies[]
  reactants: EquilibriumSpecies[]
  K: number
  T: number  // Kelvin
  kType: 'Kc' | 'Kp'
}

export const EQUILIBRIUM_REACTIONS: EquilibriumReaction[] = [
  {
    id: 'n2o4-no2',
    equation: 'N\u2082O\u2084(g) \u21cc 2NO\u2082(g)',
    reactants: [{ formula: 'N\u2082O\u2084', coefficient: 1, state: 'g' }],
    products:  [{ formula: 'NO\u2082',  coefficient: 2, state: 'g' }],
    K: 4.63e-3,
    T: 298,
    kType: 'Kc',
  },
  {
    id: 'h2-i2-hi',
    equation: 'H\u2082(g) + I\u2082(g) \u21cc 2HI(g)',
    reactants: [
      { formula: 'H\u2082', coefficient: 1, state: 'g' },
      { formula: 'I\u2082', coefficient: 1, state: 'g' },
    ],
    products: [{ formula: 'HI', coefficient: 2, state: 'g' }],
    K: 54.3,
    T: 698,
    kType: 'Kc',
  },
  {
    id: 'co-cl2-cocl2',
    equation: 'CO(g) + Cl\u2082(g) \u21cc COCl\u2082(g)',
    reactants: [
      { formula: 'CO',   coefficient: 1, state: 'g' },
      { formula: 'Cl\u2082', coefficient: 1, state: 'g' },
    ],
    products: [{ formula: 'COCl\u2082', coefficient: 1, state: 'g' }],
    K: 4.57e9,
    T: 373,
    kType: 'Kc',
  },
  {
    id: 'n2-h2-nh3',
    equation: 'N\u2082(g) + 3H\u2082(g) \u21cc 2NH\u2083(g)',
    reactants: [
      { formula: 'N\u2082', coefficient: 1, state: 'g' },
      { formula: 'H\u2082', coefficient: 3, state: 'g' },
    ],
    products: [{ formula: 'NH\u2083', coefficient: 2, state: 'g' }],
    K: 9.6,
    T: 300,
    kType: 'Kc',
  },
  {
    id: 'so2-o2-so3',
    equation: '2SO\u2082(g) + O\u2082(g) \u21cc 2SO\u2083(g)',
    reactants: [
      { formula: 'SO\u2082', coefficient: 2, state: 'g' },
      { formula: 'O\u2082',  coefficient: 1, state: 'g' },
    ],
    products: [{ formula: 'SO\u2083', coefficient: 2, state: 'g' }],
    K: 280,
    T: 1000,
    kType: 'Kp',
  },
  {
    id: 'fe3-scn-fescn',
    equation: 'Fe\u00b3\u207a(aq) + SCN\u207b(aq) \u21cc FeSCN\u00b2\u207a(aq)',
    reactants: [
      { formula: 'Fe\u00b3\u207a', coefficient: 1, state: 'aq' },
      { formula: 'SCN\u207b',     coefficient: 1, state: 'aq' },
    ],
    products: [{ formula: 'FeSCN\u00b2\u207a', coefficient: 1, state: 'aq' }],
    K: 1.1e3,
    T: 298,
    kType: 'Kc',
  },
  {
    id: 'pcl5-pcl3-cl2',
    equation: 'PCl\u2085(g) \u21cc PCl\u2083(g) + Cl\u2082(g)',
    reactants: [{ formula: 'PCl\u2085', coefficient: 1, state: 'g' }],
    products: [
      { formula: 'PCl\u2083', coefficient: 1, state: 'g' },
      { formula: 'Cl\u2082',  coefficient: 1, state: 'g' },
    ],
    K: 1.80,
    T: 523,
    kType: 'Kc',
  },
  {
    id: 'water-gas-shift',
    equation: 'CO(g) + H\u2082O(g) \u21cc CO\u2082(g) + H\u2082(g)',
    reactants: [
      { formula: 'CO',     coefficient: 1, state: 'g' },
      { formula: 'H\u2082O', coefficient: 1, state: 'g' },
    ],
    products: [
      { formula: 'CO\u2082', coefficient: 1, state: 'g' },
      { formula: 'H\u2082',  coefficient: 1, state: 'g' },
    ],
    K: 1.9,
    T: 1000,
    kType: 'Kc',
  },
  {
    id: 'caco3-cao-co2',
    equation: 'CaCO\u2083(s) \u21cc CaO(s) + CO\u2082(g)',
    reactants: [{ formula: 'CaCO\u2083', coefficient: 1, state: 's' }],
    products: [
      { formula: 'CaO',  coefficient: 1, state: 's' },
      { formula: 'CO\u2082', coefficient: 1, state: 'g' },
    ],
    K: 0.220,
    T: 1173,
    kType: 'Kp',
  },
  {
    id: 'ch4-h2o-co-h2',
    equation: 'CH\u2084(g) + H\u2082O(g) \u21cc CO(g) + 3H\u2082(g)',
    reactants: [
      { formula: 'CH\u2084',  coefficient: 1, state: 'g' },
      { formula: 'H\u2082O', coefficient: 1, state: 'g' },
    ],
    products: [
      { formula: 'CO',    coefficient: 1, state: 'g' },
      { formula: 'H\u2082', coefficient: 3, state: 'g' },
    ],
    K: 26.0,
    T: 900,
    kType: 'Kc',
  },
  {
    id: 'hf-h2-f2',
    equation: '2HF(g) \u21cc H\u2082(g) + F\u2082(g)',
    reactants: [{ formula: 'HF', coefficient: 2, state: 'g' }],
    products: [
      { formula: 'H\u2082', coefficient: 1, state: 'g' },
      { formula: 'F\u2082', coefficient: 1, state: 'g' },
    ],
    K: 1e-13,
    T: 298,
    kType: 'Kc',
  },
  {
    id: 'no-o2-no2',
    equation: '2NO(g) + O\u2082(g) \u21cc 2NO\u2082(g)',
    reactants: [
      { formula: 'NO',   coefficient: 2, state: 'g' },
      { formula: 'O\u2082', coefficient: 1, state: 'g' },
    ],
    products: [{ formula: 'NO\u2082', coefficient: 2, state: 'g' }],
    K: 2.0e12,
    T: 298,
    kType: 'Kc',
  },
  {
    id: 'nocl-no-cl2',
    equation: '2NOCl(g) \u21cc 2NO(g) + Cl\u2082(g)',
    reactants: [{ formula: 'NOCl', coefficient: 2, state: 'g' }],
    products: [
      { formula: 'NO',   coefficient: 2, state: 'g' },
      { formula: 'Cl\u2082', coefficient: 1, state: 'g' },
    ],
    K: 4.7e-4,
    T: 298,
    kType: 'Kc',
  },
  {
    id: 'so2cl2-so2-cl2',
    equation: 'SO\u2082Cl\u2082(g) \u21cc SO\u2082(g) + Cl\u2082(g)',
    reactants: [{ formula: 'SO\u2082Cl\u2082', coefficient: 1, state: 'g' }],
    products: [
      { formula: 'SO\u2082', coefficient: 1, state: 'g' },
      { formula: 'Cl\u2082',  coefficient: 1, state: 'g' },
    ],
    K: 2.05,
    T: 648,
    kType: 'Kp',
  },
  {
    id: 'i2-cl2-icl',
    equation: 'I\u2082(g) + Cl\u2082(g) \u21cc 2ICl(g)',
    reactants: [
      { formula: 'I\u2082',  coefficient: 1, state: 'g' },
      { formula: 'Cl\u2082', coefficient: 1, state: 'g' },
    ],
    products: [{ formula: 'ICl', coefficient: 2, state: 'g' }],
    K: 82.0,
    T: 298,
    kType: 'Kc',
  },
  {
    id: 'br2-cl2-brcl',
    equation: 'Br\u2082(g) + Cl\u2082(g) \u21cc 2BrCl(g)',
    reactants: [
      { formula: 'Br\u2082', coefficient: 1, state: 'g' },
      { formula: 'Cl\u2082', coefficient: 1, state: 'g' },
    ],
    products: [{ formula: 'BrCl', coefficient: 2, state: 'g' }],
    K: 7.0,
    T: 298,
    kType: 'Kc',
  },
  {
    id: 'h2s-h2-s2',
    equation: '2H\u2082S(g) \u21cc 2H\u2082(g) + S\u2082(g)',
    reactants: [{ formula: 'H\u2082S', coefficient: 2, state: 'g' }],
    products: [
      { formula: 'H\u2082', coefficient: 2, state: 'g' },
      { formula: 'S\u2082',  coefficient: 1, state: 'g' },
    ],
    K: 0.020,
    T: 1338,
    kType: 'Kc',
  },
  {
    id: 'i2aq-i-i3',
    equation: 'I\u2082(aq) + I\u207b(aq) \u21cc I\u2083\u207b(aq)',
    reactants: [
      { formula: 'I\u2082',  coefficient: 1, state: 'aq' },
      { formula: 'I\u207b',  coefficient: 1, state: 'aq' },
    ],
    products: [{ formula: 'I\u2083\u207b', coefficient: 1, state: 'aq' }],
    K: 723,
    T: 298,
    kType: 'Kc',
  },
]
