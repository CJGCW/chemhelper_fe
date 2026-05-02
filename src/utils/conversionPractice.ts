// ── Types ─────────────────────────────────────────────────────────────────────

export interface ConversionProblem {
  category:   'mass' | 'volume' | 'temperature'
  fromValue:  number
  fromUnit:   string
  toUnit:     string
  question:   string
  answer:     number
  answerUnit: string
  steps:      string[]
  isDynamic?: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

function fmt(n: number): string {
  // Show up to 6 sig figs, strip trailing zeros
  return parseFloat(n.toPrecision(6)).toString()
}

// ── Mass ──────────────────────────────────────────────────────────────────────

type MassUnit = 'g' | 'kg' | 'mg'

const MASS_TO_G: Record<MassUnit, number> = { g: 1, kg: 1000, mg: 0.001 }

const MASS_CONTEXTS = [
  (val: number, from: string, to: string) => `A sample has a mass of ${fmt(val)} ${from}. Convert to ${to}.`,
  (val: number, from: string, to: string) => `A student weighs ${fmt(val)} ${from} of reagent. What is this mass in ${to}?`,
  (val: number, from: string, to: string) => `A flask contains ${fmt(val)} ${from} of compound. Express the mass in ${to}.`,
]

const MASS_PAIRS: [MassUnit, MassUnit, number[]][] = [
  ['g',  'kg', [10, 25, 50, 100, 250, 500, 750, 1000, 1500, 2000]],
  ['kg', 'g',  [0.5, 1, 1.5, 2, 5, 10]],
  ['g',  'mg', [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]],
  ['mg', 'g',  [100, 250, 500, 1000, 2500, 5000]],
  ['kg', 'mg', [0.001, 0.01, 0.1, 0.5, 1, 2]],
  ['mg', 'kg', [100, 500, 1000, 5000, 10000]],
]

function genMass(): ConversionProblem {
  const [from, to, pool] = pick(MASS_PAIRS)
  const val = pick(pool)
  const answer = parseFloat(fmt((val * MASS_TO_G[from]) / MASS_TO_G[to]))
  const context = pick(MASS_CONTEXTS)(val, from, to)

  let step: string
  if (from === 'g' && to === 'kg')  step = `${fmt(val)} g ÷ 1000 = ${fmt(answer)} kg`
  else if (from === 'kg' && to === 'g')  step = `${fmt(val)} kg × 1000 = ${fmt(answer)} g`
  else if (from === 'g' && to === 'mg')  step = `${fmt(val)} g × 1000 = ${fmt(answer)} mg`
  else if (from === 'mg' && to === 'g')  step = `${fmt(val)} mg ÷ 1000 = ${fmt(answer)} g`
  else if (from === 'kg' && to === 'mg') step = `${fmt(val)} kg × 1,000,000 = ${fmt(answer)} mg`
  else step = `${fmt(val)} mg ÷ 1,000,000 = ${fmt(answer)} kg`

  return {
    category: 'mass', fromValue: val, fromUnit: from, toUnit: to,
    question: context, answer, answerUnit: to,
    steps: [
      `Conversion factor: 1 kg = 1000 g = 1,000,000 mg`,
      step,
    ],
  }
}

// ── Volume ────────────────────────────────────────────────────────────────────

type VolumeUnit = 'L' | 'mL'

const VOL_CONTEXTS = [
  (val: number, from: string, to: string) => `A solution has a volume of ${fmt(val)} ${from}. Convert to ${to}.`,
  (val: number, from: string, to: string) => `A volumetric flask contains ${fmt(val)} ${from} of solution. Express the volume in ${to}.`,
  (val: number, from: string, to: string) => `A titration uses ${fmt(val)} ${from} of titrant. What volume is this in ${to}?`,
]

const VOL_PAIRS: [VolumeUnit, VolumeUnit, number[]][] = [
  ['L',  'mL', [0.025, 0.05, 0.1, 0.25, 0.5, 1, 1.5, 2, 2.5, 5]],
  ['mL', 'L',  [25, 50, 100, 150, 200, 250, 500, 750, 1000, 2000]],
]

function genVolume(): ConversionProblem {
  const [from, to, pool] = pick(VOL_PAIRS)
  const val = pick(pool)
  const answer = from === 'L' ? val * 1000 : val / 1000
  const context = pick(VOL_CONTEXTS)(val, from, to)

  const step = from === 'L'
    ? `${fmt(val)} L × 1000 mL/L = ${fmt(answer)} mL`
    : `${fmt(val)} mL ÷ 1000 = ${fmt(answer)} L`

  return {
    category: 'volume', fromValue: val, fromUnit: from, toUnit: to,
    question: context, answer: parseFloat(fmt(answer)), answerUnit: to,
    steps: ['1 L = 1000 mL', step],
  }
}

// ── Temperature ───────────────────────────────────────────────────────────────

type TempUnit = '°C' | '°F' | 'K'

interface TempConversion {
  from: TempUnit; to: TempUnit
  values: number[]
  convert: (v: number) => number
  formula: string
  stepFn: (v: number, r: number) => string
}

const TEMP_CONTEXTS = [
  (val: number, from: string, to: string) => `A reaction is carried out at ${fmt(val)} ${from}. Convert to ${to}.`,
  (val: number, from: string, to: string) => `The temperature of a solution is ${fmt(val)} ${from}. What is this in ${to}?`,
  (val: number, from: string, to: string) => `A heating block is set to ${fmt(val)} ${from}. Express this temperature in ${to}.`,
]

const TEMP_CONVERSIONS: TempConversion[] = [
  {
    from: '°C', to: 'K',
    values: [-40, -10, 0, 20, 25, 37, 100, 150, 200, 300],
    convert: v => v + 273.15,
    formula: 'K = °C + 273.15',
    stepFn: (v, r) => `K = ${fmt(v)} + 273.15 = ${fmt(r)}`,
  },
  {
    from: 'K', to: '°C',
    values: [233.15, 263.15, 273.15, 298.15, 310.15, 373.15, 423.15, 473.15],
    convert: v => v - 273.15,
    formula: '°C = K − 273.15',
    stepFn: (v, r) => `°C = ${fmt(v)} − 273.15 = ${fmt(r)}`,
  },
  {
    from: '°C', to: '°F',
    values: [-40, -10, 0, 20, 25, 37, 100],
    convert: v => v * 9 / 5 + 32,
    formula: '°F = °C × 9/5 + 32',
    stepFn: (v, r) => `°F = ${fmt(v)} × 9/5 + 32 = ${fmt(v * 9 / 5)} + 32 = ${fmt(r)}`,
  },
  {
    from: '°F', to: '°C',
    values: [-40, 14, 32, 68, 98.6, 212],
    convert: v => (v - 32) * 5 / 9,
    formula: '°C = (°F − 32) × 5/9',
    stepFn: (v, r) => `°C = (${fmt(v)} − 32) × 5/9 = ${fmt(v - 32)} × 5/9 = ${fmt(r)}`,
  },
  {
    from: '°F', to: 'K',
    values: [32, 68, 98.6, 212],
    convert: v => (v - 32) * 5 / 9 + 273.15,
    formula: 'K = (°F − 32) × 5/9 + 273.15',
    stepFn: (v, r) => `K = (${fmt(v)} − 32) × 5/9 + 273.15 = ${fmt(r)}`,
  },
  {
    from: 'K', to: '°F',
    values: [233.15, 273.15, 298.15, 373.15],
    convert: v => (v - 273.15) * 9 / 5 + 32,
    formula: '°F = (K − 273.15) × 9/5 + 32',
    stepFn: (v, r) => `°F = (${fmt(v)} − 273.15) × 9/5 + 32 = ${fmt(r)}`,
  },
]

function genTemperature(): ConversionProblem {
  const conv = pick(TEMP_CONVERSIONS)
  const val  = pick(conv.values)
  const raw  = conv.convert(val)
  const answer = parseFloat(parseFloat(raw.toFixed(4)).toString())
  const context = pick(TEMP_CONTEXTS)(val, conv.from, conv.to)

  return {
    category: 'temperature', fromValue: val, fromUnit: conv.from, toUnit: conv.to,
    question: context, answer, answerUnit: conv.to,
    steps: [conv.formula, conv.stepFn(val, answer)],
  }
}

// ── Public entry ──────────────────────────────────────────────────────────────

export function generateConversionProblem(): ConversionProblem {
  const sub = pick(['mass', 'volume', 'temperature'] as const)
  if (sub === 'mass')        return genMass()
  if (sub === 'volume')      return genVolume()
  return genTemperature()
}

// ── Dynamic generators (random numeric values within realistic ranges) ─────────

/** Ranges (inclusive) for each unit when generating a random fromValue. */
const DYNAMIC_MASS_RANGES: Record<MassUnit, [number, number]> = {
  g:  [1, 500],
  kg: [0.1, 50],
  mg: [50, 10000],
}

const DYNAMIC_VOL_RANGES: Record<VolumeUnit, [number, number]> = {
  L:  [0.05, 50],
  mL: [5, 2000],
}

/** Temperature ranges that keep converted results physically sensible. */
const DYNAMIC_TEMP_RANGES: Record<string, [number, number]> = {
  '°C': [-40, 300],
  K:    [233, 573],
  '°F': [-40, 572],
}

function randFloat(lo: number, hi: number, dp: number): number {
  const raw = lo + Math.random() * (hi - lo)
  return parseFloat(raw.toFixed(dp))
}

function genDynamicMass(): ConversionProblem {
  const [from, to] = pick(MASS_PAIRS.map(([f, t]) => [f, t] as [MassUnit, MassUnit]))
  const [lo, hi] = DYNAMIC_MASS_RANGES[from]
  const val = randFloat(lo, hi, from === 'mg' ? 0 : 2)
  const answer = parseFloat(fmt((val * MASS_TO_G[from]) / MASS_TO_G[to]))
  const context = pick(MASS_CONTEXTS)(val, from, to)

  let step: string
  if (from === 'g'  && to === 'kg') step = `${fmt(val)} g ÷ 1000 = ${fmt(answer)} kg`
  else if (from === 'kg' && to === 'g')  step = `${fmt(val)} kg × 1000 = ${fmt(answer)} g`
  else if (from === 'g'  && to === 'mg') step = `${fmt(val)} g × 1000 = ${fmt(answer)} mg`
  else if (from === 'mg' && to === 'g')  step = `${fmt(val)} mg ÷ 1000 = ${fmt(answer)} g`
  else if (from === 'kg' && to === 'mg') step = `${fmt(val)} kg × 1,000,000 = ${fmt(answer)} mg`
  else step = `${fmt(val)} mg ÷ 1,000,000 = ${fmt(answer)} kg`

  return {
    category: 'mass', fromValue: val, fromUnit: from, toUnit: to,
    question: context, answer, answerUnit: to,
    steps: ['Conversion factor: 1 kg = 1000 g = 1,000,000 mg', step],
    isDynamic: true,
  }
}

function genDynamicVolume(): ConversionProblem {
  const [from, to] = pick(VOL_PAIRS.map(([f, t]) => [f, t] as [VolumeUnit, VolumeUnit]))
  const [lo, hi] = DYNAMIC_VOL_RANGES[from]
  const val = randFloat(lo, hi, from === 'L' ? 3 : 1)
  const answer = from === 'L' ? parseFloat(fmt(val * 1000)) : parseFloat(fmt(val / 1000))
  const context = pick(VOL_CONTEXTS)(val, from, to)

  const step = from === 'L'
    ? `${fmt(val)} L × 1000 mL/L = ${fmt(answer)} mL`
    : `${fmt(val)} mL ÷ 1000 = ${fmt(answer)} L`

  return {
    category: 'volume', fromValue: val, fromUnit: from, toUnit: to,
    question: context, answer, answerUnit: to,
    steps: ['1 L = 1000 mL', step],
    isDynamic: true,
  }
}

function genDynamicTemperature(): ConversionProblem {
  const conv = pick(TEMP_CONVERSIONS)
  const [lo, hi] = DYNAMIC_TEMP_RANGES[conv.from] ?? [-40, 300]
  // Round to 1 decimal for °F/°C, whole number for K
  const dp = conv.from === 'K' ? 0 : 1
  const val = randFloat(lo, hi, dp)
  const raw = conv.convert(val)
  const answer = parseFloat(parseFloat(raw.toFixed(4)).toString())
  const context = pick(TEMP_CONTEXTS)(val, conv.from, conv.to)

  return {
    category: 'temperature', fromValue: val, fromUnit: conv.from, toUnit: conv.to,
    question: context, answer, answerUnit: conv.to,
    steps: [conv.formula, conv.stepFn(val, answer)],
    isDynamic: true,
  }
}

export function generateDynamicConversionProblem(): ConversionProblem {
  const sub = pick(['mass', 'volume', 'temperature'] as const)
  if (sub === 'mass')   return genDynamicMass()
  if (sub === 'volume') return genDynamicVolume()
  return genDynamicTemperature()
}

export function checkConversionAnswer(input: string, problem: ConversionProblem): boolean {
  const val = parseFloat(input)
  if (isNaN(val)) return false
  const ans = problem.answer
  if (ans === 0) return Math.abs(val) < 0.001
  return Math.abs((val - ans) / ans) <= 0.01
}
