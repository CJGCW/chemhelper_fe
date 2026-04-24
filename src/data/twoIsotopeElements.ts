export interface TwoIsotopeElement {
  symbol:  string
  name:    string
  Z:       number
  avgMass: number
  iso1:    { A: number; mass: number; abundance: number }
  iso2:    { A: number; mass: number; abundance: number }
}

// Elements where exactly two isotopes account for ≥ 99% of natural abundance.
// Masses are exact atomic masses (u); averages match IUPAC standard atomic weights.
export const TWO_ISOTOPE_ELEMENTS: TwoIsotopeElement[] = [
  {
    symbol: 'H', name: 'Hydrogen', Z: 1, avgMass: 1.008,
    iso1: { A: 1,   mass: 1.007825,   abundance: 99.9885 },
    iso2: { A: 2,   mass: 2.014102,   abundance:  0.0115 },
  },
  {
    symbol: 'Li', name: 'Lithium', Z: 3, avgMass: 6.941,
    iso1: { A: 6,   mass: 6.015123,   abundance:  7.59   },
    iso2: { A: 7,   mass: 7.016003,   abundance: 92.41   },
  },
  {
    symbol: 'B', name: 'Boron', Z: 5, avgMass: 10.811,
    iso1: { A: 10,  mass: 10.012937,  abundance: 19.9    },
    iso2: { A: 11,  mass: 11.009305,  abundance: 80.1    },
  },
  {
    symbol: 'N', name: 'Nitrogen', Z: 7, avgMass: 14.007,
    iso1: { A: 14,  mass: 14.003074,  abundance: 99.632  },
    iso2: { A: 15,  mass: 15.000109,  abundance:  0.368  },
  },
  {
    symbol: 'Cl', name: 'Chlorine', Z: 17, avgMass: 35.453,
    iso1: { A: 35,  mass: 34.968853,  abundance: 75.77   },
    iso2: { A: 37,  mass: 36.965903,  abundance: 24.23   },
  },
  {
    symbol: 'Cu', name: 'Copper', Z: 29, avgMass: 63.546,
    iso1: { A: 63,  mass: 62.929601,  abundance: 69.15   },
    iso2: { A: 65,  mass: 64.927794,  abundance: 30.85   },
  },
  {
    symbol: 'Ga', name: 'Gallium', Z: 31, avgMass: 69.723,
    iso1: { A: 69,  mass: 68.925581,  abundance: 60.11   },
    iso2: { A: 71,  mass: 70.924705,  abundance: 39.89   },
  },
  {
    symbol: 'Br', name: 'Bromine', Z: 35, avgMass: 79.904,
    iso1: { A: 79,  mass: 78.918338,  abundance: 50.69   },
    iso2: { A: 81,  mass: 80.916291,  abundance: 49.31   },
  },
  {
    symbol: 'Ag', name: 'Silver', Z: 47, avgMass: 107.868,
    iso1: { A: 107, mass: 106.905097, abundance: 51.839  },
    iso2: { A: 109, mass: 108.904752, abundance: 48.161  },
  },
  {
    symbol: 'Tl', name: 'Thallium', Z: 81, avgMass: 204.383,
    iso1: { A: 203, mass: 202.972344, abundance: 29.52   },
    iso2: { A: 205, mass: 204.974428, abundance: 70.48   },
  },
]
