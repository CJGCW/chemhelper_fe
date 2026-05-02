export function percentError(experimental: number, accepted: number): number {
  if (accepted === 0) throw new Error('Accepted value cannot be zero.')
  return (Math.abs(experimental - accepted) / Math.abs(accepted)) * 100
}

export interface PercentErrorProblem {
  scenario: string
  experimental: number
  accepted: number
  answer: number
  steps: string[]
  isDynamic?: boolean
}

interface Context {
  property: string
  accepted: number
  unit: string
  errorRange: [number, number]
}

const CONTEXTS: Context[] = [
  { property: 'density of copper',        accepted: 8.96,    unit: 'g/cm³',           errorRange: [0.02, 0.15] },
  { property: 'density of aluminum',      accepted: 2.70,    unit: 'g/cm³',           errorRange: [0.03, 0.20] },
  { property: 'specific heat of iron',    accepted: 0.449,   unit: 'J/(g·°C)',        errorRange: [0.01, 0.08] },
  { property: 'boiling point of ethanol', accepted: 78.37,   unit: '°C',              errorRange: [0.5,  3.0]  },
  { property: 'molar mass of NaCl',       accepted: 58.44,   unit: 'g/mol',           errorRange: [0.5,  4.0]  },
  { property: 'ΔH of NaOH dissolution',  accepted: -44.5,   unit: 'kJ/mol',          errorRange: [1.0,  8.0]  },
  { property: 'gas constant R',           accepted: 0.08206, unit: 'L·atm/(mol·K)',   errorRange: [0.001, 0.008] },
  { property: 'density of water at 25°C', accepted: 0.997,  unit: 'g/mL',            errorRange: [0.005, 0.03] },
]

function randBetween(lo: number, hi: number): number {
  return lo + Math.random() * (hi - lo)
}

function round(n: number, dp: number): number {
  return parseFloat(n.toFixed(dp))
}

function decimalPlaces(n: number): number {
  const s = n.toString()
  const dot = s.indexOf('.')
  return dot === -1 ? 0 : s.length - dot - 1
}

export function generatePercentErrorProblem(): PercentErrorProblem {
  const ctx = CONTEXTS[Math.floor(Math.random() * CONTEXTS.length)]
  const magnitude = Math.abs(ctx.accepted)
  const dp = decimalPlaces(ctx.accepted) + 1

  // Add or subtract random error from accepted; keep sign consistent with accepted
  const errorMag = round(randBetween(...ctx.errorRange), dp)
  const sign = Math.random() < 0.5 ? 1 : -1
  const experimental = round(ctx.accepted + sign * errorMag, dp)

  const absDiff = Math.abs(experimental - ctx.accepted)
  const answer = round((absDiff / magnitude) * 100, 2)

  const steps = [
    `Error = |experimental − accepted| = |${experimental} − ${ctx.accepted}| = ${round(absDiff, dp + 1)}`,
    `% error = (${round(absDiff, dp + 1)} / ${magnitude}) × 100`,
    `% error = ${answer}%`,
  ]

  const scenario =
    `A student measured the ${ctx.property} and obtained ${experimental} ${ctx.unit}. ` +
    `The accepted value is ${ctx.accepted} ${ctx.unit}. Calculate the percent error.`

  return { scenario, experimental, accepted: ctx.accepted, answer, steps }
}

// ── Dynamic generator ─────────────────────────────────────────────────────────

const DYNAMIC_PROPERTIES = [
  { property: 'boiling point of water', unit: '°C',   template: 'boiling-point measurement' },
  { property: 'density of iron',        unit: 'g/cm³', template: 'density measurement' },
  { property: 'molar mass of glucose',  unit: 'g/mol', template: 'molar mass determination' },
  { property: 'specific heat of water', unit: 'J/(g·°C)', template: 'calorimetry experiment' },
  { property: 'atomic mass of carbon',  unit: 'g/mol', template: 'mass spectrometry reading' },
  { property: 'melting point of ice',   unit: '°C',   template: 'melting-point measurement' },
]

/**
 * Generates a dynamic percent error problem with a random theoretical value
 * (10–1000) and a measured value offset by 1–25% random error.
 */
export function generateDynamicPercentErrorProblem(): PercentErrorProblem {
  const prop = DYNAMIC_PROPERTIES[Math.floor(Math.random() * DYNAMIC_PROPERTIES.length)]

  // Theoretical value: integer in 10–1000
  const theoretical = Math.floor(10 + Math.random() * 991)

  // Error magnitude: 1–25% of theoretical, rounded to 2 dp
  const errorPct = 1 + Math.random() * 24
  const errorMag = round(theoretical * errorPct / 100, 2)
  const sign = Math.random() < 0.5 ? 1 : -1
  const measured = round(theoretical + sign * errorMag, 2)

  const absDiff = round(Math.abs(measured - theoretical), 2)
  const answer = round((absDiff / theoretical) * 100, 2)

  const steps = [
    `Error = |experimental − accepted| = |${measured} − ${theoretical}| = ${absDiff}`,
    `% error = (${absDiff} / ${theoretical}) × 100`,
    `% error = ${answer}%`,
  ]

  const scenario =
    `A student performed a ${prop.template} and obtained ${measured} ${prop.unit} for the ` +
    `${prop.property}. The accepted value is ${theoretical} ${prop.unit}. Calculate the percent error.`

  return { scenario, experimental: measured, accepted: theoretical, answer, steps, isDynamic: true }
}
