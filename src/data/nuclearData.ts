// Nuclear chemistry data: nuclides, masses, half-lives.
// Pure data — no logic, no React, no imports.

export interface Nuclide {
  symbol: string      // e.g. '¹⁴C'
  name: string        // e.g. 'Carbon-14'
  Z: number           // atomic number
  A: number           // mass number
  atomicMass: number  // amu
  halfLife?: number   // seconds (undefined = stable)
  halfLifeUnit?: string  // display unit ('yr', 'days', 'hr')
  decayMode?: 'alpha' | 'beta' | 'beta+' | 'gamma' | 'ec' | 'stable'
}

// Half-life conversion constants
const YR_TO_S  = 365.25 * 24 * 3600
const DAY_TO_S = 24 * 3600
const HR_TO_S  = 3600

export const COMMON_NUCLIDES: Nuclide[] = [
  // Hydrogen isotopes
  { symbol: '¹H',     name: 'Hydrogen-1 (Protium)',   Z: 1,  A: 1,   atomicMass: 1.007825,   decayMode: 'stable'  },
  { symbol: '²H',     name: 'Hydrogen-2 (Deuterium)',  Z: 1,  A: 2,   atomicMass: 2.014102,   decayMode: 'stable'  },
  { symbol: '³H',     name: 'Tritium',                 Z: 1,  A: 3,   atomicMass: 3.016049,   halfLife: 12.32 * YR_TO_S,  halfLifeUnit: 'yr',   decayMode: 'beta'   },

  // Carbon isotopes
  { symbol: '¹²C',    name: 'Carbon-12',               Z: 6,  A: 12,  atomicMass: 12.000000,  decayMode: 'stable'  },
  { symbol: '¹⁴C',    name: 'Carbon-14',               Z: 6,  A: 14,  atomicMass: 14.003241,  halfLife: 5730 * YR_TO_S,   halfLifeUnit: 'yr',   decayMode: 'beta'   },

  // Oxygen
  { symbol: '¹⁶O',    name: 'Oxygen-16',               Z: 8,  A: 16,  atomicMass: 15.994915,  decayMode: 'stable'  },

  // Potassium
  { symbol: '⁴⁰K',    name: 'Potassium-40',            Z: 19, A: 40,  atomicMass: 39.963998,  halfLife: 1.28e9 * YR_TO_S, halfLifeUnit: 'yr',   decayMode: 'beta'   },

  // Iron
  { symbol: '⁵⁶Fe',   name: 'Iron-56',                 Z: 26, A: 56,  atomicMass: 55.934938,  decayMode: 'stable'  },

  // Cobalt
  { symbol: '⁶⁰Co',   name: 'Cobalt-60',               Z: 27, A: 60,  atomicMass: 59.933820,  halfLife: 5.271 * YR_TO_S,  halfLifeUnit: 'yr',   decayMode: 'beta'   },

  // Technetium
  { symbol: '⁹⁹ᵐTc',  name: 'Technetium-99m',          Z: 43, A: 99,  atomicMass: 98.906255,  halfLife: 6.01 * HR_TO_S,   halfLifeUnit: 'hr',   decayMode: 'gamma'  },

  // Iodine
  { symbol: '¹³¹I',   name: 'Iodine-131',              Z: 53, A: 131, atomicMass: 130.906127, halfLife: 8.02 * DAY_TO_S,  halfLifeUnit: 'days', decayMode: 'beta'   },

  // Cesium
  { symbol: '¹³⁷Cs',  name: 'Cesium-137',              Z: 55, A: 137, atomicMass: 136.907085, halfLife: 30.17 * YR_TO_S,  halfLifeUnit: 'yr',   decayMode: 'beta'   },

  // Radium
  { symbol: '²²⁶Ra',  name: 'Radium-226',              Z: 88, A: 226, atomicMass: 226.025410, halfLife: 1600 * YR_TO_S,   halfLifeUnit: 'yr',   decayMode: 'alpha'  },

  // Polonium
  { symbol: '²¹⁰Po',  name: 'Polonium-210',            Z: 84, A: 210, atomicMass: 209.982874, halfLife: 138.4 * DAY_TO_S, halfLifeUnit: 'days', decayMode: 'alpha'  },

  // Thorium
  { symbol: '²³²Th',  name: 'Thorium-232',             Z: 90, A: 232, atomicMass: 232.038051, halfLife: 1.405e10 * YR_TO_S, halfLifeUnit: 'yr', decayMode: 'alpha'  },

  // Uranium
  { symbol: '²³⁵U',   name: 'Uranium-235',             Z: 92, A: 235, atomicMass: 235.043928, halfLife: 7.04e8 * YR_TO_S, halfLifeUnit: 'yr',   decayMode: 'alpha'  },
  { symbol: '²³⁸U',   name: 'Uranium-238',             Z: 92, A: 238, atomicMass: 238.050788, halfLife: 4.468e9 * YR_TO_S, halfLifeUnit: 'yr',  decayMode: 'alpha'  },
]

// Physical constants (amu)
export const PROTON_MASS   = 1.007276  // amu
export const NEUTRON_MASS  = 1.008665  // amu
export const ELECTRON_MASS = 0.000549  // amu
export const AMU_TO_MEV    = 931.5     // MeV per amu
