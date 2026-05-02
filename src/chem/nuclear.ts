// Nuclear chemistry domain logic.
// Pure TypeScript — no React, no utils, no other chem imports.
// Data imports from '../data/' are allowed per the chem/ purity rule.

import { NEUTRON_MASS, AMU_TO_MEV } from '../data/nuclearData'

// ── Element symbol lookup ─────────────────────────────────────────────────────

const ELEMENT_SYMBOLS: Record<number, string> = {
  1: 'H',  2: 'He', 3: 'Li', 4: 'Be', 5: 'B',  6: 'C',  7: 'N',  8: 'O',  9: 'F',  10: 'Ne',
  11: 'Na', 12: 'Mg', 13: 'Al', 14: 'Si', 15: 'P',  16: 'S',  17: 'Cl', 18: 'Ar', 19: 'K',  20: 'Ca',
  21: 'Sc', 22: 'Ti', 23: 'V',  24: 'Cr', 25: 'Mn', 26: 'Fe', 27: 'Co', 28: 'Ni', 29: 'Cu', 30: 'Zn',
  31: 'Ga', 32: 'Ge', 33: 'As', 34: 'Se', 35: 'Br', 36: 'Kr', 37: 'Rb', 38: 'Sr', 39: 'Y',  40: 'Zr',
  41: 'Nb', 42: 'Mo', 43: 'Tc', 44: 'Ru', 45: 'Rh', 46: 'Pd', 47: 'Ag', 48: 'Cd', 49: 'In', 50: 'Sn',
  51: 'Sb', 52: 'Te', 53: 'I',  54: 'Xe', 55: 'Cs', 56: 'Ba', 57: 'La', 58: 'Ce', 59: 'Pr', 60: 'Nd',
  61: 'Pm', 62: 'Sm', 63: 'Eu', 64: 'Gd', 65: 'Tb', 66: 'Dy', 67: 'Ho', 68: 'Er', 69: 'Tm', 70: 'Yb',
  71: 'Lu', 72: 'Hf', 73: 'Ta', 74: 'W',  75: 'Re', 76: 'Os', 77: 'Ir', 78: 'Pt', 79: 'Au', 80: 'Hg',
  81: 'Tl', 82: 'Pb', 83: 'Bi', 84: 'Po', 85: 'At', 86: 'Rn', 87: 'Fr', 88: 'Ra', 89: 'Ac', 90: 'Th',
  91: 'Pa', 92: 'U',  93: 'Np', 94: 'Pu', 95: 'Am', 96: 'Cm', 97: 'Bk', 98: 'Cf', 99: 'Es', 100: 'Fm',
}

const ELEMENT_NAMES: Record<number, string> = {
  1: 'Hydrogen',    2: 'Helium',      3: 'Lithium',     4: 'Beryllium',   5: 'Boron',
  6: 'Carbon',      7: 'Nitrogen',    8: 'Oxygen',      9: 'Fluorine',    10: 'Neon',
  11: 'Sodium',     12: 'Magnesium',  13: 'Aluminum',   14: 'Silicon',    15: 'Phosphorus',
  16: 'Sulfur',     17: 'Chlorine',   18: 'Argon',      19: 'Potassium',  20: 'Calcium',
  21: 'Scandium',   22: 'Titanium',   23: 'Vanadium',   24: 'Chromium',   25: 'Manganese',
  26: 'Iron',       27: 'Cobalt',     28: 'Nickel',     29: 'Copper',     30: 'Zinc',
  31: 'Gallium',    32: 'Germanium',  33: 'Arsenic',    34: 'Selenium',   35: 'Bromine',
  36: 'Krypton',    37: 'Rubidium',   38: 'Strontium',  39: 'Yttrium',    40: 'Zirconium',
  41: 'Niobium',    42: 'Molybdenum', 43: 'Technetium', 44: 'Ruthenium',  45: 'Rhodium',
  46: 'Palladium',  47: 'Silver',     48: 'Cadmium',    49: 'Indium',     50: 'Tin',
  51: 'Antimony',   52: 'Tellurium',  53: 'Iodine',     54: 'Xenon',      55: 'Cesium',
  56: 'Barium',     57: 'Lanthanum',  58: 'Cerium',     59: 'Praseodymium', 60: 'Neodymium',
  61: 'Promethium', 62: 'Samarium',   63: 'Europium',   64: 'Gadolinium', 65: 'Terbium',
  66: 'Dysprosium', 67: 'Holmium',    68: 'Erbium',     69: 'Thulium',    70: 'Ytterbium',
  71: 'Lutetium',   72: 'Hafnium',    73: 'Tantalum',   74: 'Tungsten',   75: 'Rhenium',
  76: 'Osmium',     77: 'Iridium',    78: 'Platinum',   79: 'Gold',       80: 'Mercury',
  81: 'Thallium',   82: 'Lead',       83: 'Bismuth',    84: 'Polonium',   85: 'Astatine',
  86: 'Radon',      87: 'Francium',   88: 'Radium',     89: 'Actinium',   90: 'Thorium',
  91: 'Protactinium', 92: 'Uranium',  93: 'Neptunium',  94: 'Plutonium',  95: 'Americium',
  96: 'Curium',     97: 'Berkelium',  98: 'Californium', 99: 'Einsteinium', 100: 'Fermium',
}

function symbolFor(Z: number): string {
  return ELEMENT_SYMBOLS[Z] ?? `Z${Z}`
}

function nameFor(Z: number): string {
  return ELEMENT_NAMES[Z] ?? `Element-${Z}`
}

function superscript(n: number): string {
  const map: Record<string, string> = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻','+':'⁺' }
  return String(n).split('').map(c => map[c] ?? c).join('')
}

function subscript(n: number): string {
  const map: Record<string, string> = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','-':'₋' }
  return String(n).split('').map(c => map[c] ?? c).join('')
}

function nuclideStr(A: number, Z: number, sym: string): string {
  return `${superscript(A)}${subscript(Z)}${sym}`
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type DecayType = 'alpha' | 'beta' | 'beta+' | 'gamma' | 'ec'

export interface DecayProduct {
  symbol: string   // element symbol like 'Th'
  name: string     // element name like 'Thorium'
  Z: number
  A: number
  particle: string // displayed particle string
}

// ── Nuclear Decay ──────────────────────────────────────────────────────────────

/**
 * Compute daughter nuclide from parent (Z, A) and decay type.
 *   Alpha: Z-2, A-4, emits ⁴He
 *   Beta⁻: Z+1, A same, emits e⁻
 *   Beta⁺: Z-1, A same, emits e⁺
 *   Gamma: Z same, A same (nuclear isomer transition)
 *   EC (electron capture): Z-1, A same
 */
export function nuclearDecay(
  parentZ: number,
  parentA: number,
  type: DecayType,
): {
  daughter: DecayProduct
  equation: string
  steps: string[]
} {
  const parentSym = symbolFor(parentZ)

  let daughterZ: number
  let daughterA: number
  let particleStr: string
  let particleLabel: string
  let steps: string[]

  switch (type) {
    case 'alpha':
      daughterZ = parentZ - 2
      daughterA = parentA - 4
      particleStr = `${superscript(4)}${subscript(2)}He`
      particleLabel = 'alpha particle (⁴₂He)'
      steps = [
        `Alpha decay: Z decreases by 2, A decreases by 4`,
        `Parent: ${nuclideStr(parentA, parentZ, parentSym)} (Z=${parentZ}, A=${parentA})`,
        `Daughter Z = ${parentZ} - 2 = ${daughterZ}  →  ${nameFor(daughterZ)} (${symbolFor(daughterZ)})`,
        `Daughter A = ${parentA} - 4 = ${daughterA}`,
        `Emitted particle: ${particleLabel}`,
      ]
      break

    case 'beta':
      daughterZ = parentZ + 1
      daughterA = parentA
      particleStr = `${superscript(0)}${subscript(-1)}e`
      particleLabel = 'beta particle / electron (⁰₋₁e)'
      steps = [
        `Beta-minus (β⁻) decay: a neutron converts to a proton + electron + antineutrino`,
        `Z increases by 1, A stays the same`,
        `Parent: ${nuclideStr(parentA, parentZ, parentSym)} (Z=${parentZ}, A=${parentA})`,
        `Daughter Z = ${parentZ} + 1 = ${daughterZ}  →  ${nameFor(daughterZ)} (${symbolFor(daughterZ)})`,
        `Daughter A = ${parentA} (unchanged)`,
        `Emitted particle: ${particleLabel}`,
      ]
      break

    case 'beta+':
      daughterZ = parentZ - 1
      daughterA = parentA
      particleStr = `${superscript(0)}${subscript(1)}e`
      particleLabel = 'positron (⁰₊₁e)'
      steps = [
        `Beta-plus (β⁺) decay / positron emission: a proton converts to a neutron + positron + neutrino`,
        `Z decreases by 1, A stays the same`,
        `Parent: ${nuclideStr(parentA, parentZ, parentSym)} (Z=${parentZ}, A=${parentA})`,
        `Daughter Z = ${parentZ} - 1 = ${daughterZ}  →  ${nameFor(daughterZ)} (${symbolFor(daughterZ)})`,
        `Daughter A = ${parentA} (unchanged)`,
        `Emitted particle: ${particleLabel}`,
      ]
      break

    case 'gamma':
      daughterZ = parentZ
      daughterA = parentA
      particleStr = `${superscript(0)}${subscript(0)}γ`
      particleLabel = 'gamma photon (⁰₀γ)'
      steps = [
        `Gamma decay: nucleus releases energy as a high-energy photon`,
        `Z and A do not change — same element, lower energy state`,
        `Parent: ${nuclideStr(parentA, parentZ, parentSym)} (excited state)`,
        `Daughter: ${nuclideStr(daughterA, daughterZ, symbolFor(daughterZ))} (ground state)`,
        `Emitted particle: ${particleLabel}`,
      ]
      break

    case 'ec':
      daughterZ = parentZ - 1
      daughterA = parentA
      particleStr = `${superscript(0)}${subscript(-1)}e (captured)`
      particleLabel = 'inner-shell electron (EC)'
      steps = [
        `Electron capture (EC): nucleus absorbs an inner-shell electron`,
        `A proton converts to a neutron; Z decreases by 1, A unchanged`,
        `Parent: ${nuclideStr(parentA, parentZ, parentSym)} (Z=${parentZ}, A=${parentA})`,
        `Daughter Z = ${parentZ} - 1 = ${daughterZ}  →  ${nameFor(daughterZ)} (${symbolFor(daughterZ)})`,
        `Daughter A = ${parentA} (unchanged)`,
        `Process: ${particleLabel}`,
      ]
      break

    default:
      throw new Error(`Unknown decay type: ${type}`)
  }

  const daughterSym  = symbolFor(daughterZ)
  const daughterName = nameFor(daughterZ)

  const equation = type === 'gamma'
    ? `${nuclideStr(parentA, parentZ, parentSym)}* → ${nuclideStr(daughterA, daughterZ, daughterSym)} + ${particleStr}`
    : `${nuclideStr(parentA, parentZ, parentSym)} → ${nuclideStr(daughterA, daughterZ, daughterSym)} + ${particleStr}`

  return {
    daughter: { symbol: daughterSym, name: daughterName, Z: daughterZ, A: daughterA, particle: particleStr },
    equation,
    steps,
  }
}

// ── Balance Nuclear Equation ───────────────────────────────────────────────────

/**
 * Balance a nuclear equation: given known particles, find the unknown.
 * Conservation: sum of Z and sum of A must balance on each side.
 */
export function balanceNuclearEquation(
  known: Array<{ Z: number; A: number; side: 'reactant' | 'product' }>,
): { Z: number; A: number; identity: string; steps: string[] } {
  const reactantZ = known.filter(p => p.side === 'reactant').reduce((s, p) => s + p.Z, 0)
  const reactantA = known.filter(p => p.side === 'reactant').reduce((s, p) => s + p.A, 0)
  const productZ  = known.filter(p => p.side === 'product').reduce((s, p) => s + p.Z, 0)
  const productA  = known.filter(p => p.side === 'product').reduce((s, p) => s + p.A, 0)

  const unknownZ = reactantZ - productZ
  const unknownA = reactantA - productA

  const sym = unknownZ > 0 ? symbolFor(unknownZ) : (unknownZ === 0 ? (unknownA === 0 ? 'γ' : 'n') : 'e')
  const identity = unknownZ > 0
    ? `${superscript(unknownA)}${subscript(unknownZ)}${sym} (${nameFor(unknownZ)}-${unknownA})`
    : unknownZ === 0 && unknownA === 1
    ? `${superscript(1)}${subscript(0)}n (neutron)`
    : unknownZ === 0 && unknownA === 0
    ? `${superscript(0)}${subscript(0)}γ (gamma)`
    : `${superscript(unknownA)}${subscript(unknownZ)}${sym}`

  const steps = [
    `Conservation of mass number (A): reactants total = ${reactantA}, products total = ${productA}`,
    `Unknown A = ${reactantA} - ${productA} = ${unknownA}`,
    `Conservation of atomic number (Z): reactants total = ${reactantZ}, products total = ${productZ}`,
    `Unknown Z = ${reactantZ} - ${productZ} = ${unknownZ}`,
    `Identity of unknown: ${identity}`,
  ]

  return { Z: unknownZ, A: unknownA, identity, steps }
}

// ── Half-Life Solver ──────────────────────────────────────────────────────────

export interface HalfLifeInput {
  solveFor: 'N' | 't' | 'halfLife' | 'N0' | 'fractionRemaining'
  N0?: number
  N?: number
  t?: number
  halfLife?: number
}

/**
 * N = N₀ × (1/2)^(t/t½)
 * Solved for any of the five variables.
 */
export function solveHalfLife(input: HalfLifeInput): {
  answer: number
  answerLabel: string
  answerUnit: string
  steps: string[]
} {
  const { solveFor, N0, N, t, halfLife } = input

  function fmt(n: number): string {
    if (Math.abs(n) >= 1e4 || (Math.abs(n) < 1e-3 && n !== 0)) {
      return n.toExponential(4)
    }
    return parseFloat(n.toPrecision(5)).toString()
  }

  switch (solveFor) {
    case 'N': {
      if (N0 === undefined || t === undefined || halfLife === undefined)
        throw new Error('N requires N0, t, and halfLife')
      const exponent  = t / halfLife
      const answer    = N0 * Math.pow(0.5, exponent)
      return {
        answer,
        answerLabel: 'Remaining amount (N)',
        answerUnit: 'same units as N₀',
        steps: [
          `Formula: N = N₀ × (1/2)^(t / t½)`,
          `t / t½ = ${fmt(t)} / ${fmt(halfLife)} = ${fmt(exponent)}`,
          `(1/2)^${fmt(exponent)} = ${fmt(Math.pow(0.5, exponent))}`,
          `N = ${fmt(N0)} × ${fmt(Math.pow(0.5, exponent))} = ${fmt(answer)}`,
        ],
      }
    }

    case 'fractionRemaining': {
      if (t === undefined || halfLife === undefined)
        throw new Error('fractionRemaining requires t and halfLife')
      const exponent = t / halfLife
      const answer   = Math.pow(0.5, exponent)
      return {
        answer,
        answerLabel: 'Fraction remaining (N/N₀)',
        answerUnit: '',
        steps: [
          `Formula: N/N₀ = (1/2)^(t / t½)`,
          `t / t½ = ${fmt(t)} / ${fmt(halfLife)} = ${fmt(exponent)}`,
          `N/N₀ = (1/2)^${fmt(exponent)} = ${fmt(answer)}`,
          `= ${fmt(answer * 100)}% remaining`,
        ],
      }
    }

    case 't': {
      if (N0 === undefined || N === undefined || halfLife === undefined)
        throw new Error('t requires N0, N, and halfLife')
      if (N <= 0 || N0 <= 0) throw new Error('N and N0 must be positive')
      const ratio  = N / N0
      const answer = halfLife * Math.log(ratio) / Math.log(0.5)
      return {
        answer,
        answerLabel: 'Time elapsed (t)',
        answerUnit: 'same units as t½',
        steps: [
          `Formula: t = (t½ / ln2) × ln(N₀ / N)`,
          `N / N₀ = ${fmt(N)} / ${fmt(N0)} = ${fmt(ratio)}`,
          `ln(N₀ / N) = ln(${fmt(1 / ratio)}) = ${fmt(Math.log(1 / ratio))}`,
          `t = (${fmt(halfLife)} / ${fmt(Math.LN2)}) × ${fmt(Math.log(1 / ratio))}`,
          `t = ${fmt(answer)}`,
        ],
      }
    }

    case 'halfLife': {
      if (N0 === undefined || N === undefined || t === undefined)
        throw new Error('halfLife requires N0, N, and t')
      if (N <= 0 || N0 <= 0) throw new Error('N and N0 must be positive')
      const ratio  = N / N0
      const answer = t * Math.LN2 / Math.log(N0 / N)
      return {
        answer,
        answerLabel: 'Half-life (t½)',
        answerUnit: 'same units as t',
        steps: [
          `Formula: t½ = t × ln2 / ln(N₀ / N)`,
          `N / N₀ = ${fmt(N)} / ${fmt(N0)} = ${fmt(ratio)}`,
          `ln(N₀ / N) = ln(${fmt(1 / ratio)}) = ${fmt(Math.log(1 / ratio))}`,
          `t½ = ${fmt(t)} × ${fmt(Math.LN2)} / ${fmt(Math.log(1 / ratio))}`,
          `t½ = ${fmt(answer)}`,
        ],
      }
    }

    case 'N0': {
      if (N === undefined || t === undefined || halfLife === undefined)
        throw new Error('N0 requires N, t, and halfLife')
      const exponent = t / halfLife
      const answer   = N / Math.pow(0.5, exponent)
      return {
        answer,
        answerLabel: 'Initial amount (N₀)',
        answerUnit: 'same units as N',
        steps: [
          `Formula: N₀ = N / (1/2)^(t / t½)`,
          `t / t½ = ${fmt(t)} / ${fmt(halfLife)} = ${fmt(exponent)}`,
          `(1/2)^${fmt(exponent)} = ${fmt(Math.pow(0.5, exponent))}`,
          `N₀ = ${fmt(N)} / ${fmt(Math.pow(0.5, exponent))} = ${fmt(answer)}`,
        ],
      }
    }
  }
}

// ── Binding Energy ────────────────────────────────────────────────────────────

/**
 * Mass defect Δm = Z × m_p + (A-Z) × m_n - m_atom
 * BE = Δm × 931.5 MeV/amu
 * Note: ELECTRON_MASS not imported here — we use atomic mass (includes electrons)
 * and proton mass includes the corresponding electron.
 */
export function bindingEnergy(
  Z: number,
  A: number,
  atomicMass: number,
): {
  massDefect: number    // amu
  totalBE: number       // MeV
  bePerNucleon: number  // MeV/nucleon
  steps: string[]
} {
  const N          = A - Z                              // number of neutrons
  const massH      = 1.007825                           // mass of hydrogen atom (¹H) in amu
  const massParts  = Z * massH + N * NEUTRON_MASS       // sum of constituent masses
  const massDefect = massParts - atomicMass             // Δm in amu
  const totalBE    = massDefect * AMU_TO_MEV            // MeV
  const bePerNucleon = totalBE / A                      // MeV/nucleon

  function fmt4(n: number): string { return parseFloat(n.toPrecision(6)).toString() }

  const steps = [
    `Z = ${Z} (protons), N = A - Z = ${A} - ${Z} = ${N} (neutrons)`,
    `Mass of ${Z} H atoms: ${Z} × ${massH} = ${fmt4(Z * massH)} amu`,
    `Mass of ${N} neutrons: ${N} × ${NEUTRON_MASS} = ${fmt4(N * NEUTRON_MASS)} amu`,
    `Sum of parts: ${fmt4(massParts)} amu`,
    `Atomic mass of nuclide: ${atomicMass} amu`,
    `Mass defect Δm = ${fmt4(massParts)} - ${atomicMass} = ${fmt4(massDefect)} amu`,
    `Total BE = Δm × 931.5 MeV/amu = ${fmt4(massDefect)} × 931.5 = ${fmt4(totalBE)} MeV`,
    `BE per nucleon = ${fmt4(totalBE)} / ${A} = ${fmt4(bePerNucleon)} MeV/nucleon`,
  ]

  return { massDefect, totalBE, bePerNucleon, steps }
}

// ── Carbon-14 Dating ──────────────────────────────────────────────────────────

/**
 * Carbon-14 dating: t = (t½ / ln2) × ln(N₀ / N)
 * Default half-life = 5730 years.
 */
export function carbonDating(
  currentActivity: number,
  originalActivity: number,
  halfLifeYr = 5730,
): {
  age: number     // years
  steps: string[]
} {
  if (currentActivity <= 0 || originalActivity <= 0)
    throw new Error('Activities must be positive')
  if (currentActivity > originalActivity)
    throw new Error('Current activity cannot exceed original activity')

  const ratio = currentActivity / originalActivity
  const age   = (halfLifeYr / Math.LN2) * Math.log(1 / ratio)

  function fmt(n: number): string { return parseFloat(n.toPrecision(5)).toString() }

  const steps = [
    `Formula: t = (t½ / ln2) × ln(N₀ / N)`,
    `t½ = ${halfLifeYr} years,  ln2 = ${fmt(Math.LN2)}`,
    `N / N₀ = ${fmt(currentActivity)} / ${fmt(originalActivity)} = ${fmt(ratio)}`,
    `ln(N₀ / N) = ln(${fmt(1 / ratio)}) = ${fmt(Math.log(1 / ratio))}`,
    `t = (${halfLifeYr} / ${fmt(Math.LN2)}) × ${fmt(Math.log(1 / ratio))}`,
    `t = ${fmt(halfLifeYr / Math.LN2)} × ${fmt(Math.log(1 / ratio))}`,
    `t ≈ ${fmt(age)} years`,
  ]

  return { age, steps }
}
