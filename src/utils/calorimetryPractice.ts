// ── Types ─────────────────────────────────────────────────────────────────────

export type CalorimetryMode = 'mcdt' | 'cdt' | 'coffee' | 'bomb'
export type CalorimetryVar  = 'q' | 'm' | 'c' | 'dt' | 'C' | 'qrxn'

export interface CalorimetryProblem {
  mode:       CalorimetryMode
  question:   string
  given:      { label: string; value: string; unit: string }[]
  solveFor:   string        // display symbol, e.g. 'q', 'ΔT'
  answer:     number
  answerUnit: string
  steps:      string[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sf3(v: number): number { return parseFloat(v.toPrecision(3)) }
function sf(v: number, n = 4): string { return v.toPrecision(n) }

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

// ── Substance presets ─────────────────────────────────────────────────────────

const SUBSTANCES = [
  { name: 'water',    c: 4.184 },
  { name: 'aluminum', c: 0.897 },
  { name: 'copper',   c: 0.385 },
  { name: 'iron',     c: 0.449 },
  { name: 'silver',   c: 0.235 },
  { name: 'gold',     c: 0.129 },
  { name: 'ethanol',  c: 2.44  },
] as const

// ── q = mcΔT ──────────────────────────────────────────────────────────────────

type McdtVar = 'q' | 'm' | 'c' | 'dt'

function genMcdt(): CalorimetryProblem {
  const subst  = pick(SUBSTANCES)
  const solveFor = pick<McdtVar>(['q', 'm', 'c', 'dt'])

  const m  = sf3(rand(10, 400))   // g
  const c  = subst.c              // J/(g·°C)  — exact preset
  const dt = sf3(rand(5, 80) * (Math.random() < 0.4 ? -1 : 1))  // °C
  const q  = sf3(m * c * dt)      // J

  const fmtC = c.toString()

  switch (solveFor) {
    case 'q': {
      const ans = sf3(m * c * dt)
      return {
        mode: 'mcdt', solveFor: 'q', answer: ans, answerUnit: 'J',
        question: `A ${sf(m, 3)} g sample of ${subst.name} undergoes a temperature change of ${sf(dt, 3)} °C. Its specific heat capacity is ${fmtC} J/(g·°C). How much heat is transferred?`,
        given: [
          { label: 'm',  value: sf(m, 3),  unit: 'g'        },
          { label: 'c',  value: fmtC,      unit: 'J/(g·°C)' },
          { label: 'ΔT', value: sf(dt, 3), unit: '°C'       },
        ],
        steps: [
          'q = m × c × ΔT',
          `q = ${sf(m, 3)} g × ${fmtC} J/(g·°C) × ${sf(dt, 3)} °C`,
          `q = ${sf(ans, 3)} J`,
        ],
      }
    }
    case 'm': {
      const ans = sf3(q / (c * dt))
      return {
        mode: 'mcdt', solveFor: 'm', answer: ans, answerUnit: 'g',
        question: `${sf(q, 3)} J of heat is transferred to a sample of ${subst.name} (c = ${fmtC} J/(g·°C)), causing a temperature change of ${sf(dt, 3)} °C. What is the mass of the sample?`,
        given: [
          { label: 'q',  value: sf(q, 3),  unit: 'J'        },
          { label: 'c',  value: fmtC,      unit: 'J/(g·°C)' },
          { label: 'ΔT', value: sf(dt, 3), unit: '°C'       },
        ],
        steps: [
          'm = q / (c × ΔT)',
          `m = ${sf(q, 3)} J ÷ (${fmtC} J/(g·°C) × ${sf(dt, 3)} °C)`,
          `m = ${sf(ans, 3)} g`,
        ],
      }
    }
    case 'c': {
      const ans = sf3(q / (m * dt))
      return {
        mode: 'mcdt', solveFor: 'c', answer: ans, answerUnit: 'J/(g·°C)',
        question: `${sf(q, 3)} J of heat causes a ${sf(m, 3)} g metal sample to change temperature by ${sf(dt, 3)} °C. What is the specific heat capacity of the metal?`,
        given: [
          { label: 'q',  value: sf(q, 3),  unit: 'J'  },
          { label: 'm',  value: sf(m, 3),  unit: 'g'  },
          { label: 'ΔT', value: sf(dt, 3), unit: '°C' },
        ],
        steps: [
          'c = q / (m × ΔT)',
          `c = ${sf(q, 3)} J ÷ (${sf(m, 3)} g × ${sf(dt, 3)} °C)`,
          `c = ${sf(ans, 3)} J/(g·°C)`,
        ],
      }
    }
    case 'dt': {
      const ans = sf3(q / (m * c))
      return {
        mode: 'mcdt', solveFor: 'ΔT', answer: ans, answerUnit: '°C',
        question: `${sf(q, 3)} J of heat is transferred to a ${sf(m, 3)} g sample of ${subst.name} (c = ${fmtC} J/(g·°C)). What is the temperature change?`,
        given: [
          { label: 'q', value: sf(q, 3), unit: 'J'        },
          { label: 'm', value: sf(m, 3), unit: 'g'        },
          { label: 'c', value: fmtC,     unit: 'J/(g·°C)' },
        ],
        steps: [
          'ΔT = q / (m × c)',
          `ΔT = ${sf(q, 3)} J ÷ (${sf(m, 3)} g × ${fmtC} J/(g·°C))`,
          `ΔT = ${sf(ans, 3)} °C`,
        ],
      }
    }
  }
}

// ── q = CΔT ───────────────────────────────────────────────────────────────────

type CdtVar = 'q' | 'C' | 'dt'

function genCdt(): CalorimetryProblem {
  const solveFor = pick<CdtVar>(['q', 'C', 'dt'])

  const C  = sf3(rand(50, 1500))   // J/°C
  const dt = sf3(rand(3, 40) * (Math.random() < 0.35 ? -1 : 1))
  const q  = sf3(C * dt)

  switch (solveFor) {
    case 'q': {
      const ans = sf3(C * dt)
      return {
        mode: 'cdt', solveFor: 'q', answer: ans, answerUnit: 'J',
        question: `A calorimeter with heat capacity ${sf(C, 3)} J/°C undergoes a temperature change of ${sf(dt, 3)} °C. How much heat is absorbed by the calorimeter?`,
        given: [
          { label: 'C',  value: sf(C, 3),  unit: 'J/°C' },
          { label: 'ΔT', value: sf(dt, 3), unit: '°C'   },
        ],
        steps: [
          'q = C × ΔT',
          `q = ${sf(C, 3)} J/°C × ${sf(dt, 3)} °C`,
          `q = ${sf(ans, 3)} J`,
        ],
      }
    }
    case 'C': {
      const ans = sf3(q / dt)
      return {
        mode: 'cdt', solveFor: 'C', answer: ans, answerUnit: 'J/°C',
        question: `A calorimeter absorbs ${sf(q, 3)} J of heat and its temperature changes by ${sf(dt, 3)} °C. What is the heat capacity of the calorimeter?`,
        given: [
          { label: 'q',  value: sf(q, 3),  unit: 'J'  },
          { label: 'ΔT', value: sf(dt, 3), unit: '°C' },
        ],
        steps: [
          'C = q / ΔT',
          `C = ${sf(q, 3)} J ÷ ${sf(dt, 3)} °C`,
          `C = ${sf(ans, 3)} J/°C`,
        ],
      }
    }
    case 'dt': {
      const ans = sf3(q / C)
      return {
        mode: 'cdt', solveFor: 'ΔT', answer: ans, answerUnit: '°C',
        question: `A calorimeter with heat capacity ${sf(C, 3)} J/°C absorbs ${sf(q, 3)} J of heat. What is the temperature change of the calorimeter?`,
        given: [
          { label: 'q', value: sf(q, 3), unit: 'J'    },
          { label: 'C', value: sf(C, 3), unit: 'J/°C' },
        ],
        steps: [
          'ΔT = q / C',
          `ΔT = ${sf(q, 3)} J ÷ ${sf(C, 3)} J/°C`,
          `ΔT = ${sf(ans, 3)} °C`,
        ],
      }
    }
  }
}

// ── Coffee-cup calorimetry ────────────────────────────────────────────────────

function genCoffee(): CalorimetryProblem {
  const m  = sf3(rand(50, 300))       // g of solution (≈ water)
  const c  = 4.184                     // J/(g·°C) — water
  const ti = sf3(rand(15, 25))         // initial T
  const dt = sf3(rand(3, 20) * (Math.random() < 0.5 ? -1 : 1))
  const tf = sf3(ti + dt)
  const qsol = m * c * (tf - ti)
  const qrxn = sf3(-qsol)

  return {
    mode: 'coffee', solveFor: 'q_rxn', answer: qrxn, answerUnit: 'J',
    question: `In a coffee-cup calorimeter, ${sf(m, 3)} g of aqueous solution (c = 4.184 J/(g·°C)) has an initial temperature of ${sf(ti, 3)} °C and a final temperature of ${sf(tf, 3)} °C. Calculate q_rxn.`,
    given: [
      { label: 'm',  value: sf(m, 3),  unit: 'g'        },
      { label: 'c',  value: '4.184',   unit: 'J/(g·°C)' },
      { label: 'Tᵢ', value: sf(ti, 3), unit: '°C'       },
      { label: 'Tf', value: sf(tf, 3), unit: '°C'       },
    ],
    steps: [
      'q_sol = m × c × ΔT  (where ΔT = Tf − Ti)',
      `q_sol = ${sf(m, 3)} × 4.184 × (${sf(tf, 3)} − ${sf(ti, 3)})`,
      `q_sol = ${sf(qsol, 3)} J`,
      'q_rxn = −q_sol',
      `q_rxn = ${sf(qrxn, 3)} J`,
    ],
  }
}

// ── Bomb calorimetry ──────────────────────────────────────────────────────────

function genBomb(): CalorimetryProblem {
  const Ccal = sf3(rand(2, 15))        // kJ/°C
  const dt   = sf3(rand(1.5, 15))      // °C (always positive — exothermic combustion)
  const qrxn = sf3(-(Ccal * dt))       // kJ (negative — exothermic)

  return {
    mode: 'bomb', solveFor: 'q_rxn', answer: qrxn, answerUnit: 'kJ',
    question: `A bomb calorimeter with heat capacity ${sf(Ccal, 3)} kJ/°C shows a temperature increase of ${sf(dt, 3)} °C when a sample is combusted. Calculate q_rxn.`,
    given: [
      { label: 'C_cal', value: sf(Ccal, 3), unit: 'kJ/°C' },
      { label: 'ΔT',    value: sf(dt, 3),   unit: '°C'    },
    ],
    steps: [
      'q_rxn = −C_cal × ΔT',
      `q_rxn = −(${sf(Ccal, 3)} kJ/°C × ${sf(dt, 3)} °C)`,
      `q_rxn = ${sf(qrxn, 3)} kJ`,
    ],
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function genCalorimetryProblem(): CalorimetryProblem {
  const mode = pick<CalorimetryMode>(['mcdt', 'cdt', 'coffee', 'bomb'])
  switch (mode) {
    case 'mcdt':   return genMcdt()
    case 'cdt':    return genCdt()
    case 'coffee': return genCoffee()
    case 'bomb':   return genBomb()
  }
}

export function checkCalorimetryAnswer(problem: CalorimetryProblem, input: string): boolean {
  const val = parseFloat(input)
  if (isNaN(val)) return false
  if (problem.answer === 0) return Math.abs(val) < 0.001
  return Math.abs((val - problem.answer) / problem.answer) <= 0.02
}
