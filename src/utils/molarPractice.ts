// ── Types ─────────────────────────────────────────────────────────────────────

export type MolarCalcType = 'moles' | 'molarity' | 'molality' | 'bpe' | 'fpd'
export type ProblemStyle  = 'arithmetic' | 'word'

export interface MolarProblem {
  type:       MolarCalcType
  style:      ProblemStyle
  question:   string
  /** Shown explicitly in arithmetic mode; embedded in word-problem text. */
  given:      { label: string; value: string; unit: string }[]
  solveFor:   string   // variable symbol, e.g. 'n'
  answerUnit: string
  answer:     number
  steps:      string[]
}

// ── Compound library ──────────────────────────────────────────────────────────

interface Compound {
  name:  string
  formula: string
  M:     number   // g/mol
  i:     number   // van't Hoff factor
}

const COMPOUNDS: Compound[] = [
  { name: 'sodium chloride',     formula: 'NaCl',           M:  58.44, i: 2 },
  { name: 'glucose',             formula: 'C₆H₁₂O₆',       M: 180.16, i: 1 },
  { name: 'sucrose',             formula: 'C₁₂H₂₂O₁₁',    M: 342.30, i: 1 },
  { name: 'sodium hydroxide',    formula: 'NaOH',           M:  40.00, i: 2 },
  { name: 'potassium chloride',  formula: 'KCl',            M:  74.55, i: 2 },
  { name: 'calcium chloride',    formula: 'CaCl₂',          M: 110.98, i: 3 },
  { name: 'methanol',            formula: 'CH₃OH',          M:  32.04, i: 1 },
  { name: 'ethanol',             formula: 'C₂H₅OH',         M:  46.07, i: 1 },
  { name: 'urea',                formula: 'CO(NH₂)₂',       M:  60.06, i: 1 },
  { name: 'acetic acid',         formula: 'CH₃COOH',        M:  60.05, i: 1 },
  { name: 'potassium nitrate',   formula: 'KNO₃',           M: 101.10, i: 2 },
  { name: 'copper(II) sulfate',  formula: 'CuSO₄',          M: 159.61, i: 2 },
  { name: 'magnesium chloride',  formula: 'MgCl₂',          M:  95.21, i: 3 },
  { name: 'ammonium chloride',   formula: 'NH₄Cl',          M:  53.49, i: 2 },
  { name: 'benzoic acid',        formula: 'C₇H₆O₂',        M: 122.12, i: 1 },
  { name: 'naphthalene',         formula: 'C₁₀H₈',         M: 128.17, i: 1 },
]

// ── Small helpers ─────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Round to n significant figures. */
function sig(x: number, n = 4): number {
  if (x === 0) return 0
  const d = Math.ceil(Math.log10(Math.abs(x)))
  const pow = 10 ** (n - d)
  return Math.round(x * pow) / pow
}

/** Format a number to exactly `dp` decimal places (preserving trailing zeros for sig fig clarity). */
function f(x: number, dp = 4): string {
  return x.toFixed(dp)
}

// ── Moles ─────────────────────────────────────────────────────────────────────

const NICE_MOLES  = [0.100, 0.250, 0.500, 0.750, 1.00, 1.50, 2.00, 2.50, 3.00, 4.00, 5.00]
const NICE_MASSES_G = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250, 500]

function genMoles(style: ProblemStyle): MolarProblem {
  const c   = pick(COMPOUNDS)
  const sub = pick(['n', 'm'] as const)

  if (sub === 'n') {
    // Given m and M, find n
    const m = pick(NICE_MASSES_G)
    const M = c.M
    const n = sig(m / M, 4)

    const wordTemplates = [
      `A student weighs out ${f(m, 1)} g of ${c.name} (${c.formula}, M = ${f(M, 2)} g/mol) to prepare a solution. How many moles are present?`,
      `A pharmacist measures ${f(m, 1)} g of ${c.name} (${c.formula}). Given its molar mass is ${f(M, 2)} g/mol, calculate the amount in moles.`,
      `A ${f(m, 1)} g sample of ${c.name} (M = ${f(M, 2)} g/mol) is dissolved in water for a titration. How many moles of ${c.formula} are present?`,
      `To run an experiment, a technician dissolves ${f(m, 1)} g of ${c.name} (${c.formula}, M = ${f(M, 2)} g/mol). What quantity (in mol) is this?`,
    ]
    return {
      type: 'moles', style,
      question: style === 'word' ? pick(wordTemplates)
        : `Given m = ${f(m, 1)} g, M = ${f(M, 2)} g/mol. Find n.`,
      given: [
        { label: 'm', value: f(m, 1), unit: 'g'     },
        { label: 'M', value: f(M, 2), unit: 'g/mol' },
      ],
      solveFor: 'n', answerUnit: 'mol', answer: n,
      steps: [
        'n = m / M',
        `n = ${f(m, 1)} g ÷ ${f(M, 2)} g/mol`,
        `n = ${f(n, 4)} mol`,
      ],
    }
  } else {
    // Given n and M, find m
    const n = pick(NICE_MOLES)
    const M = c.M
    const m = sig(n * M, 4)

    const wordTemplates = [
      `A reaction calls for ${f(n, 3)} mol of ${c.name} (${c.formula}, M = ${f(M, 2)} g/mol). What mass should be weighed out?`,
      `How many grams of ${c.name} (${c.formula}, M = ${f(M, 2)} g/mol) are needed to obtain ${f(n, 3)} mol?`,
      `A chemist needs exactly ${f(n, 3)} mol of ${c.name} (M = ${f(M, 2)} g/mol). Calculate the required mass in grams.`,
      `To prepare a standard solution, you require ${f(n, 3)} mol of ${c.name} (${c.formula}, M = ${f(M, 2)} g/mol). What mass do you measure?`,
    ]
    return {
      type: 'moles', style,
      question: style === 'word' ? pick(wordTemplates)
        : `Given n = ${f(n, 3)} mol, M = ${f(M, 2)} g/mol. Find m.`,
      given: [
        { label: 'n', value: f(n, 3), unit: 'mol'   },
        { label: 'M', value: f(M, 2), unit: 'g/mol' },
      ],
      solveFor: 'm', answerUnit: 'g', answer: m,
      steps: [
        'm = n × M',
        `m = ${f(n, 3)} mol × ${f(M, 2)} g/mol`,
        `m = ${f(m, 4)} g`,
      ],
    }
  }
}

// ── Molarity ──────────────────────────────────────────────────────────────────

const NICE_CONC  = [0.100, 0.250, 0.500, 1.00, 1.50, 2.00, 2.50, 3.00]
const NICE_VOL_ML = [50, 100, 150, 200, 250, 500, 750, 1000]
const NICE_MOLES_SMALL = [0.0500, 0.100, 0.150, 0.200, 0.250, 0.500, 0.750, 1.00]

function genMolarity(style: ProblemStyle): MolarProblem {
  const c   = pick(COMPOUNDS)
  const sub = pick(['C', 'n', 'V'] as const)

  if (sub === 'C') {
    const V_mL = pick(NICE_VOL_ML)
    const V_L  = V_mL / 1000
    const n    = pick(NICE_MOLES_SMALL)
    const m    = sig(n * c.M, 4)
    const C    = sig(n / V_L, 4)

    const wordTemplates = [
      `${f(m, 3)} g of ${c.name} (${c.formula}, M = ${f(c.M, 2)} g/mol) is dissolved in water to give a total volume of ${V_mL} mL. What is the molarity of the solution?`,
      `A chemist dissolves ${f(m, 3)} g of ${c.name} (M = ${f(c.M, 2)} g/mol) and dilutes to ${V_mL} mL in a volumetric flask. Calculate the concentration in mol/L.`,
      `${f(n, 4)} mol of ${c.name} is dissolved in water and made up to ${V_mL} mL of solution. What is the molarity?`,
    ]
    return {
      type: 'molarity', style,
      question: style === 'word' ? pick(wordTemplates)
        : `Given n = ${f(n, 4)} mol, V = ${V_mL} mL. Find C.`,
      given: [
        { label: 'n', value: f(n, 4), unit: 'mol' },
        { label: 'V', value: String(V_mL),  unit: 'mL'  },
      ],
      solveFor: 'C', answerUnit: 'mol/L', answer: C,
      steps: [
        'C = n / V',
        `V = ${V_mL} mL ÷ 1000 = ${f(V_L, 4)} L`,
        `C = ${f(n, 4)} mol ÷ ${f(V_L, 4)} L`,
        `C = ${f(C, 4)} mol/L`,
      ],
    }
  } else if (sub === 'n') {
    const C    = pick(NICE_CONC)
    const V_mL = pick(NICE_VOL_ML)
    const V_L  = V_mL / 1000
    const n    = sig(C * V_L, 4)

    const wordTemplates = [
      `How many moles of ${c.name} (${c.formula}) are present in ${V_mL} mL of a ${f(C, 3)} mol/L solution?`,
      `A student measures out ${V_mL} mL of a ${f(C, 3)} M ${c.name} solution. How many moles of solute does this contain?`,
      `Calculate the number of moles of ${c.formula} in a ${V_mL} mL sample of a ${f(C, 3)} mol/L ${c.name} solution.`,
    ]
    return {
      type: 'molarity', style,
      question: style === 'word' ? pick(wordTemplates)
        : `Given C = ${f(C, 3)} mol/L, V = ${V_mL} mL. Find n.`,
      given: [
        { label: 'C', value: f(C, 3), unit: 'mol/L' },
        { label: 'V', value: String(V_mL),   unit: 'mL'    },
      ],
      solveFor: 'n', answerUnit: 'mol', answer: n,
      steps: [
        'n = C × V',
        `V = ${V_mL} mL ÷ 1000 = ${f(V_L, 4)} L`,
        `n = ${f(C, 3)} mol/L × ${f(V_L, 4)} L`,
        `n = ${f(n, 4)} mol`,
      ],
    }
  } else {
    const C = pick(NICE_CONC)
    const n = pick(NICE_MOLES_SMALL)
    const V_L  = sig(n / C, 4)
    const V_mL = sig(V_L * 1000, 4)

    const wordTemplates = [
      `What volume of a ${f(C, 3)} mol/L ${c.name} solution contains ${f(n, 4)} mol of ${c.formula}?`,
      `A student needs ${f(n, 4)} mol of ${c.name}. The available solution has a concentration of ${f(C, 3)} M. What volume (in mL) must be measured out?`,
      `How many mL of a ${f(C, 3)} mol/L ${c.name} solution are required to obtain ${f(n, 4)} mol of ${c.formula}?`,
    ]
    return {
      type: 'molarity', style,
      question: style === 'word' ? pick(wordTemplates)
        : `Given C = ${f(C, 3)} mol/L, n = ${f(n, 4)} mol. Find V in mL.`,
      given: [
        { label: 'C', value: f(C, 3), unit: 'mol/L' },
        { label: 'n', value: f(n, 4), unit: 'mol'   },
      ],
      solveFor: 'V', answerUnit: 'mL', answer: V_mL,
      steps: [
        'V = n / C',
        `V = ${f(n, 4)} mol ÷ ${f(C, 3)} mol/L = ${f(V_L, 4)} L`,
        `V = ${f(V_L, 4)} L × 1000 = ${f(V_mL, 2)} mL`,
      ],
    }
  }
}

// ── Molality ──────────────────────────────────────────────────────────────────

const NICE_MOLAL = [0.100, 0.250, 0.500, 1.00, 1.50, 2.00, 2.50, 3.00]
const NICE_SOLVENT_G = [100, 150, 200, 250, 500, 750, 1000]

function genMolality(style: ProblemStyle): MolarProblem {
  const c   = pick(COMPOUNDS)
  const sub = pick(['b', 'm_solute'] as const)

  if (sub === 'b') {
    const m_solvent_g  = pick(NICE_SOLVENT_G)
    const m_solvent_kg = m_solvent_g / 1000
    const n            = pick(NICE_MOLES_SMALL)
    const m_solute_g   = sig(n * c.M, 4)
    const b            = sig(n / m_solvent_kg, 4)

    const wordTemplates = [
      `${f(m_solute_g, 3)} g of ${c.name} (${c.formula}, M = ${f(c.M, 2)} g/mol) is dissolved in ${m_solvent_g} g of water. Calculate the molality of the solution.`,
      `A solution is prepared by dissolving ${f(m_solute_g, 3)} g of ${c.name} in ${m_solvent_g} g of water. Given M = ${f(c.M, 2)} g/mol, what is the molality?`,
      `What is the molality of a solution made by dissolving ${f(m_solute_g, 3)} g of ${c.name} (M = ${f(c.M, 2)} g/mol) in ${m_solvent_g} g of water?`,
    ]
    return {
      type: 'molality', style,
      question: style === 'word' ? pick(wordTemplates)
        : `Given m_solute = ${f(m_solute_g, 3)} g, M = ${f(c.M, 2)} g/mol, m_solvent = ${m_solvent_g} g. Find b.`,
      given: [
        { label: 'm (solute)',  value: f(m_solute_g, 3), unit: 'g'     },
        { label: 'M',           value: f(c.M, 2),        unit: 'g/mol' },
        { label: 'm (solvent)', value: String(m_solvent_g), unit: 'g'  },
      ],
      solveFor: 'b', answerUnit: 'mol/kg', answer: b,
      steps: [
        'b = n / m_solvent(kg)',
        `n = ${f(m_solute_g, 3)} g ÷ ${f(c.M, 2)} g/mol = ${f(n, 4)} mol`,
        `m_solvent = ${m_solvent_g} g ÷ 1000 = ${f(m_solvent_kg, 4)} kg`,
        `b = ${f(n, 4)} mol ÷ ${f(m_solvent_kg, 4)} kg`,
        `b = ${f(b, 4)} mol/kg`,
      ],
    }
  } else {
    const b            = pick(NICE_MOLAL)
    const m_solvent_g  = pick(NICE_SOLVENT_G)
    const m_solvent_kg = m_solvent_g / 1000
    const n            = sig(b * m_solvent_kg, 4)
    const m_solute_g   = sig(n * c.M, 4)

    const wordTemplates = [
      `What mass of ${c.name} (${c.formula}, M = ${f(c.M, 2)} g/mol) must be dissolved in ${m_solvent_g} g of water to give a molality of ${f(b, 3)} mol/kg?`,
      `A ${f(b, 3)} mol/kg ${c.name} solution is needed using ${m_solvent_g} g of water as solvent. What mass of ${c.formula} (M = ${f(c.M, 2)} g/mol) is required?`,
      `Calculate the mass of ${c.name} (M = ${f(c.M, 2)} g/mol) needed to prepare a ${f(b, 3)} mol/kg solution with ${m_solvent_g} g of water.`,
    ]
    return {
      type: 'molality', style,
      question: style === 'word' ? pick(wordTemplates)
        : `Given b = ${f(b, 3)} mol/kg, M = ${f(c.M, 2)} g/mol, m_solvent = ${m_solvent_g} g. Find m_solute.`,
      given: [
        { label: 'b',           value: f(b, 3),          unit: 'mol/kg' },
        { label: 'M',           value: f(c.M, 2),        unit: 'g/mol'  },
        { label: 'm (solvent)', value: String(m_solvent_g), unit: 'g'   },
      ],
      solveFor: 'm', answerUnit: 'g', answer: m_solute_g,
      steps: [
        'm_solute = b × m_solvent(kg) × M',
        `m_solvent = ${m_solvent_g} g ÷ 1000 = ${f(m_solvent_kg, 4)} kg`,
        `n = ${f(b, 3)} mol/kg × ${f(m_solvent_kg, 4)} kg = ${f(n, 4)} mol`,
        `m_solute = ${f(n, 4)} mol × ${f(c.M, 2)} g/mol`,
        `m_solute = ${f(m_solute_g, 4)} g`,
      ],
    }
  }
}

// ── BPE / FPD ─────────────────────────────────────────────────────────────────

const Kb_WATER = 0.512   // °C·kg/mol
const Kf_WATER = 1.86    // °C·kg/mol

function genColligative(type: 'bpe' | 'fpd', style: ProblemStyle): MolarProblem {
  const K    = type === 'bpe' ? Kb_WATER : Kf_WATER
  const Ksym = type === 'bpe' ? 'Kb'     : 'Kf'
  const DTsym = type === 'bpe' ? 'ΔTb'   : 'ΔTf'
  const prop = type === 'bpe' ? 'boiling point elevation' : 'freezing point depression'

  // Exclude water itself; prefer compounds with simple i for clarity
  const pool = COMPOUNDS.filter(c => c.name !== 'water')
  const c    = pick(pool)
  const sub  = pick(['DT', 'b'] as const)

  if (sub === 'DT') {
    const b  = pick(NICE_MOLAL.filter(x => x <= 2.0))
    const DT = sig(c.i * K * b, 4)

    const wordTemplates = [
      `Calculate the ${prop} when ${f(b, 3)} mol/kg of ${c.name} (${c.formula}, i = ${c.i}) is dissolved in water. (${Ksym}(water) = ${K} °C·kg/mol)`,
      `A solution of ${c.name} (i = ${c.i}) in water has a molality of ${f(b, 3)} mol/kg. What is the ${prop}? (${Ksym} = ${K} °C·kg/mol)`,
      `${c.name} (${c.formula}, i = ${c.i}) is dissolved in water at a concentration of ${f(b, 3)} mol/kg. By how many °C is the ${type === 'bpe' ? 'boiling' : 'freezing'} point shifted? (${Ksym} = ${K} °C·kg/mol)`,
    ]
    return {
      type, style,
      question: style === 'word' ? pick(wordTemplates)
        : `Given b = ${f(b, 3)} mol/kg, i = ${c.i}, ${Ksym} = ${K} °C·kg/mol. Find ${DTsym}.`,
      given: [
        { label: 'b',   value: f(b, 3),      unit: 'mol/kg'    },
        { label: 'i',   value: String(c.i),  unit: '—'         },
        { label: Ksym,  value: String(K),     unit: '°C·kg/mol' },
      ],
      solveFor: DTsym, answerUnit: '°C', answer: DT,
      steps: [
        `${DTsym} = i · ${Ksym} · b`,
        `${DTsym} = ${c.i} × ${K} × ${f(b, 3)}`,
        `${DTsym} = ${f(DT, 4)} °C`,
      ],
    }
  } else {
    const DT = sig(pick([0.186, 0.372, 0.512, 0.744, 0.930, 1.02, 1.86, 2.00, 2.50, 3.00, 3.72]), 4)
    const b  = sig(DT / (c.i * K), 4)

    const wordTemplates = [
      `A solution of ${c.name} (i = ${c.i}) in water shows a ${prop} of ${f(DT, 3)} °C. What is the molality? (${Ksym} = ${K} °C·kg/mol)`,
      `The ${type === 'bpe' ? 'boiling' : 'freezing'} point of a ${c.name} (i = ${c.i}) solution in water is shifted by ${f(DT, 3)} °C. Calculate the molality of the solution. (${Ksym} = ${K} °C·kg/mol)`,
      `A ${c.name} (${c.formula}, i = ${c.i}) aqueous solution has a ${prop} of ${f(DT, 3)} °C. Find the molality. (${Ksym} = ${K} °C·kg/mol)`,
    ]
    return {
      type, style,
      question: style === 'word' ? pick(wordTemplates)
        : `Given ${DTsym} = ${f(DT, 3)} °C, i = ${c.i}, ${Ksym} = ${K} °C·kg/mol. Find b.`,
      given: [
        { label: DTsym, value: f(DT, 3),     unit: '°C'        },
        { label: 'i',   value: String(c.i),  unit: '—'         },
        { label: Ksym,  value: String(K),     unit: '°C·kg/mol' },
      ],
      solveFor: 'b', answerUnit: 'mol/kg', answer: b,
      steps: [
        `b = ${DTsym} / (i · ${Ksym})`,
        `b = ${f(DT, 3)} / (${c.i} × ${K})`,
        `b = ${f(b, 4)} mol/kg`,
      ],
    }
  }
}

// ── Public entry point ────────────────────────────────────────────────────────

export function generateMolarProblem(
  type: MolarCalcType,
  style: ProblemStyle,
): MolarProblem {
  switch (type) {
    case 'moles':    return genMoles(style)
    case 'molarity': return genMolarity(style)
    case 'molality': return genMolality(style)
    case 'bpe':      return genColligative('bpe', style)
    case 'fpd':      return genColligative('fpd', style)
  }
}
