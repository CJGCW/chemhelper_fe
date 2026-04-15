const R = 8.314  // J/(mol·K)

interface SubData {
  name: string
  formula: string
  dHvap: number  // J/mol at normal bp
  bp: number     // K
}

const SUBSTANCES: SubData[] = [
  { name: 'water',                formula: 'H₂O',         dHvap: 40700, bp: 373.15 },
  { name: 'ethanol',              formula: 'C₂H₅OH',      dHvap: 38600, bp: 351.55 },
  { name: 'methanol',             formula: 'CH₃OH',        dHvap: 35300, bp: 337.85 },
  { name: 'benzene',              formula: 'C₆H₆',         dHvap: 30700, bp: 353.25 },
  { name: 'diethyl ether',        formula: '(C₂H₅)₂O',    dHvap: 27100, bp: 307.75 },
  { name: 'acetone',              formula: '(CH₃)₂CO',     dHvap: 31300, bp: 329.25 },
  { name: 'chloroform',           formula: 'CHCl₃',        dHvap: 31400, bp: 334.35 },
  { name: 'ammonia',              formula: 'NH₃',          dHvap: 23350, bp: 239.75 },
  { name: 'cyclohexane',          formula: 'C₆H₁₂',       dHvap: 29900, bp: 353.85 },
  { name: 'acetic acid',          formula: 'CH₃COOH',      dHvap: 51600, bp: 391.05 },
  { name: 'toluene',              formula: 'C₇H₈',         dHvap: 33200, bp: 383.75 },
  { name: 'carbon tetrachloride', formula: 'CCl₄',         dHvap: 29800, bp: 349.95 },
  { name: 'hexane',               formula: 'C₆H₁₄',       dHvap: 28900, bp: 341.85 },
  { name: 'isopropanol',          formula: '(CH₃)₂CHOH',  dHvap: 39900, bp: 355.75 },
  { name: 'acetonitrile',         formula: 'CH₃CN',        dHvap: 33200, bp: 354.75 },
]

// ── Utilities ──────────────────────────────────────────────────────────────────

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
function rs(x: number, n = 3) {
  if (x === 0 || !isFinite(x)) return '0'
  const p = Math.pow(10, n - Math.floor(Math.log10(Math.abs(x))) - 1)
  return (Math.round(x * p) / p).toPrecision(n)
}
function fmtP(P_Pa: number, u: 'Pa' | 'kPa' | 'atm' | 'mmHg'): string {
  switch (u) {
    case 'Pa':   return `${Math.round(P_Pa).toLocaleString()} Pa`
    case 'kPa':  return `${rs(P_Pa / 1e3)} kPa`
    case 'atm':  return `${rs(P_Pa / 101325)} atm`
    case 'mmHg': return `${rs(P_Pa / 133.322)} mmHg`
  }
}
function fmtT(T_K: number, u: 'K' | '°C'): string {
  return u === 'K' ? `${T_K.toFixed(2)} K` : `${(T_K - 273.15).toFixed(1)} °C`
}
function dInvTStr(T2: number, T1: number) {
  return (1 / T2 - 1 / T1).toExponential(4)
}

// ── Problem type ───────────────────────────────────────────────────────────────

export type CCSolveFor = 'P1' | 'P2' | 'T1' | 'T2' | 'dHvap'

export interface ClausiusClapeyronProblem {
  solveFor: CCSolveFor
  question: string
  given: string[]
  answer: string       // human-readable full answer
  steps: string[]
  numericAnswer: number  // answer in canonical unit for grading
  answerUnit: string     // 'kPa', 'K', or 'kJ/mol'
  solveLabel: string     // e.g. 'P₂', 'T₁'
}

// ── Generators ────────────────────────────────────────────────────────────────

function genFindP2(sub: SubData): ClausiusClapeyronProblem {
  const T1 = sub.bp, P1 = 101325
  let deltaT: number
  do { deltaT = randInt(-11, 13) * 5 } while (T1 + deltaT < 220 || deltaT === 0)
  const T2 = T1 + deltaT
  const P2 = P1 * Math.exp((-sub.dHvap / R) * (1 / T2 - 1 / T1))

  const tUnit = pick<'K' | '°C'>(['°C', '°C', 'K'])
  const dH_kJ = (sub.dHvap / 1000).toFixed(1)
  const exp_val = (-sub.dHvap / R) * (1 / T2 - 1 / T1)
  const factor  = Math.exp(exp_val)

  const contexts = [
    `What is the vapor pressure of ${sub.name} at ${fmtT(T2, '°C')}?`,
    `Calculate the vapor pressure of ${sub.name} (${sub.formula}) at ${fmtT(T2, tUnit)}.`,
    `${sub.name} has a normal boiling point of ${fmtT(T1, '°C')} at 1.00 atm. Determine its vapor pressure at ${fmtT(T2, tUnit)}.`,
    `A sealed flask contains ${sub.name}. At ${fmtT(T2, '°C')}, what is the equilibrium vapor pressure?`,
  ]

  return {
    solveFor: 'P2',
    solveLabel: 'P₂',
    question: pick(contexts),
    given: [
      `P₁ = 101,325 Pa (1.00 atm)  at  T₁ = ${fmtT(T1, '°C')} = ${fmtT(T1, 'K')}`,
      `T₂ = ${fmtT(T2, '°C')} = ${fmtT(T2, 'K')}`,
      `ΔH_vap = ${dH_kJ} kJ/mol`,
    ],
    answer: `P₂ = ${fmtP(P2, 'kPa')}   (also: ${fmtP(P2, 'Pa')}, ${fmtP(P2, 'atm')})`,
    numericAnswer: P2 / 1000,
    answerUnit: 'kPa',
    steps: [
      `P₂ = P₁ × exp[−(ΔH_vap/R) × (1/T₂ − 1/T₁)]`,
      `1/T₂ − 1/T₁ = 1/${T2.toFixed(2)} − 1/${T1.toFixed(2)} = ${dInvTStr(T2, T1)} K⁻¹`,
      `Exponent = −(${sub.dHvap}/8.314) × ${dInvTStr(T2, T1)} = ${exp_val.toFixed(4)}`,
      `e^(${exp_val.toFixed(4)}) = ${factor.toFixed(5)}`,
      `P₂ = 101325 × ${factor.toFixed(5)} = ${Math.round(P2).toLocaleString()} Pa = ${fmtP(P2, 'kPa')}`,
    ],
  }
}

function genFindT2(sub: SubData): ClausiusClapeyronProblem {
  const T1 = sub.bp, P1 = 101325
  const scenarios = [
    { label: 'high-altitude cooking',  P2_atm: pick([0.55, 0.60, 0.65, 0.70, 0.75, 0.80]) },
    { label: 'vacuum distillation',    P2_atm: pick([0.05, 0.10, 0.15, 0.20, 0.25, 0.30]) },
    { label: 'mild reduced pressure',  P2_atm: pick([0.40, 0.45, 0.50]) },
    { label: 'pressure cooker',        P2_atm: pick([1.5, 2.0, 2.5, 3.0]) },
    { label: 'pressurized vessel',     P2_atm: pick([1.2, 1.5, 2.0]) },
  ]
  const sc = pick(scenarios)
  const P2 = sc.P2_atm * 101325
  const inv = 1 / T1 - (R * Math.log(P2 / P1)) / sub.dHvap
  const T2 = 1 / inv
  const pDisp = fmtP(P2, 'atm')
  const pDispkPa = fmtP(P2, 'kPa')
  const dH_kJ = (sub.dHvap / 1000).toFixed(1)
  const lnR   = Math.log(P2 / P1)

  const contexts = [
    `At what temperature does ${sub.name} boil under ${pDisp} (${pDispkPa})?`,
    `${sub.name} is distilled under reduced pressure of ${pDisp}. At what temperature does it boil?`,
    `A ${sc.label} environment maintains a pressure of ${pDisp}. What is the boiling point of ${sub.name} at this pressure?`,
    `Find the boiling point of ${sub.name} when the external pressure is ${pDispkPa}.`,
  ]

  return {
    solveFor: 'T2',
    solveLabel: 'T₂',
    question: pick(contexts),
    given: [
      `P₁ = 101,325 Pa (1.00 atm)  at  T₁ = ${fmtT(T1, '°C')} = ${fmtT(T1, 'K')}`,
      `P₂ = ${pDisp} = ${pDispkPa}`,
      `ΔH_vap = ${dH_kJ} kJ/mol`,
    ],
    answer: `T₂ = ${T2.toFixed(2)} K  (${(T2 - 273.15).toFixed(1)} °C)`,
    numericAnswer: T2,
    answerUnit: 'K',
    steps: [
      `1/T₂ = 1/T₁ − (R/ΔH_vap) × ln(P₂/P₁)`,
      `ln(P₂/P₁) = ln(${fmtP(P2, 'Pa').replace(/,/g, '')} / 101325) = ${lnR.toFixed(4)}`,
      `1/T₂ = 1/${T1.toFixed(2)} − (8.314/${sub.dHvap}) × ${lnR.toFixed(4)}`,
      `1/T₂ = ${(1 / T1).toFixed(6)} − ${((R / sub.dHvap) * lnR).toExponential(4)} = ${inv.toExponential(5)} K⁻¹`,
      `T₂ = ${T2.toFixed(2)} K = ${(T2 - 273.15).toFixed(1)} °C`,
    ],
  }
}

function genFindDHvap(sub: SubData): ClausiusClapeyronProblem {
  const T1_K = sub.bp + randInt(-8, -2) * 10
  const T2_K = sub.bp + randInt(2, 8) * 10
  const P_ref = 101325
  const P1 = P_ref * Math.exp((-sub.dHvap / R) * (1 / T1_K - 1 / sub.bp))
  const P2 = P_ref * Math.exp((-sub.dHvap / R) * (1 / T2_K - 1 / sub.bp))
  const pUnit = pick<'kPa' | 'mmHg' | 'atm'>(['kPa', 'kPa', 'mmHg', 'atm'])
  const lnR   = Math.log(P2 / P1)
  const dIT   = 1 / T2_K - 1 / T1_K
  const result = -R * lnR / dIT

  const anonymous = Math.random() < 0.5
  const subLabel = anonymous
    ? 'An unknown liquid'
    : `${sub.name[0].toUpperCase()}${sub.name.slice(1)} (${sub.formula})`

  const divisor = pUnit === 'kPa' ? 1e3 : pUnit === 'atm' ? 101325 : 133.322

  return {
    solveFor: 'dHvap',
    solveLabel: 'ΔH_vap',
    question: `${subLabel} has a vapor pressure of ${fmtP(P1, pUnit)} at ${fmtT(T1_K, '°C')} and ${fmtP(P2, pUnit)} at ${fmtT(T2_K, '°C')}. Calculate the molar enthalpy of vaporization.`,
    given: [
      `P₁ = ${fmtP(P1, pUnit)}  at  T₁ = ${fmtT(T1_K, '°C')} = ${fmtT(T1_K, 'K')}`,
      `P₂ = ${fmtP(P2, pUnit)}  at  T₂ = ${fmtT(T2_K, '°C')} = ${fmtT(T2_K, 'K')}`,
      `Note: pressure units cancel in the ratio — ${pUnit} works directly`,
    ],
    answer: `ΔH_vap = ${(result / 1000).toFixed(1)} kJ/mol`,
    numericAnswer: result / 1000,
    answerUnit: 'kJ/mol',
    steps: [
      `ΔH_vap = −R × ln(P₂/P₁) / (1/T₂ − 1/T₁)`,
      `ln(P₂/P₁) = ln(${rs(P2 / divisor, 4)} / ${rs(P1 / divisor, 4)}) = ${lnR.toFixed(4)}`,
      `1/T₂ − 1/T₁ = 1/${T2_K.toFixed(2)} − 1/${T1_K.toFixed(2)} = ${dIT.toExponential(4)} K⁻¹`,
      `ΔH_vap = −8.314 × ${lnR.toFixed(4)} / ${dIT.toExponential(4)} = ${result.toFixed(0)} J/mol`,
      `ΔH_vap = ${(result / 1000).toFixed(2)} kJ/mol`,
    ],
  }
}

function genFindT1(sub: SubData): ClausiusClapeyronProblem {
  const T2 = sub.bp, P2 = 101325
  const P1_atm = pick([0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50, 0.60, 0.70, 0.75])
  const P1 = P1_atm * 101325
  const inv = 1 / T2 + (R * Math.log(P2 / P1)) / sub.dHvap
  const T1 = 1 / inv
  const pUnit = pick<'kPa' | 'atm' | 'mmHg'>(['kPa', 'atm', 'mmHg'])
  const lnR   = Math.log(P2 / P1)
  const dH_kJ = (sub.dHvap / 1000).toFixed(1)

  return {
    solveFor: 'T1',
    solveLabel: 'T₁',
    question: `${sub.name[0].toUpperCase() + sub.name.slice(1)} (${sub.formula}, ΔH_vap = ${dH_kJ} kJ/mol) boils at ${fmtT(T2, '°C')} under 1.00 atm. At what temperature is its vapor pressure ${fmtP(P1, pUnit)}?`,
    given: [
      `P₂ = 101,325 Pa (1.00 atm)  at  T₂ = ${fmtT(T2, '°C')} = ${fmtT(T2, 'K')}`,
      `P₁ = ${fmtP(P1, pUnit)} = ${fmtP(P1, 'Pa')}`,
      `ΔH_vap = ${dH_kJ} kJ/mol`,
    ],
    answer: `T₁ = ${T1.toFixed(2)} K  (${(T1 - 273.15).toFixed(1)} °C)`,
    numericAnswer: T1,
    answerUnit: 'K',
    steps: [
      `1/T₁ = 1/T₂ + (R/ΔH_vap) × ln(P₂/P₁)`,
      `ln(P₂/P₁) = ln(101325/${Math.round(P1)}) = ${lnR.toFixed(4)}`,
      `1/T₁ = 1/${T2.toFixed(2)} + (8.314/${sub.dHvap}) × ${lnR.toFixed(4)}`,
      `1/T₁ = ${(1 / T2).toFixed(6)} + ${((R / sub.dHvap) * lnR).toExponential(4)} = ${inv.toExponential(5)} K⁻¹`,
      `T₁ = ${T1.toFixed(2)} K = ${(T1 - 273.15).toFixed(1)} °C`,
    ],
  }
}

function genFindP1(sub: SubData): ClausiusClapeyronProblem {
  const T2 = sub.bp, P2 = 101325
  let deltaT: number
  do { deltaT = randInt(-12, -3) * 5 } while (T2 + deltaT < 200)
  const T1 = T2 + deltaT
  const P1 = P2 / Math.exp((-sub.dHvap / R) * (1 / T2 - 1 / T1))
  const dH_kJ = (sub.dHvap / 1000).toFixed(1)
  const exp_val = (-sub.dHvap / R) * (1 / T2 - 1 / T1)
  const factor  = Math.exp(exp_val)

  return {
    solveFor: 'P1',
    solveLabel: 'P₁',
    question: `${sub.name[0].toUpperCase() + sub.name.slice(1)} boils at ${fmtT(T2, '°C')} under 1.00 atm. Given ΔH_vap = ${dH_kJ} kJ/mol, what is the vapor pressure of ${sub.name} at ${fmtT(T1, '°C')}?`,
    given: [
      `P₂ = 101,325 Pa (1.00 atm)  at  T₂ = ${fmtT(T2, '°C')} = ${fmtT(T2, 'K')}`,
      `T₁ = ${fmtT(T1, '°C')} = ${fmtT(T1, 'K')}`,
      `ΔH_vap = ${dH_kJ} kJ/mol`,
    ],
    answer: `P₁ = ${fmtP(P1, 'kPa')}   (also: ${fmtP(P1, 'Pa')}, ${fmtP(P1, 'atm')})`,
    numericAnswer: P1 / 1000,
    answerUnit: 'kPa',
    steps: [
      `P₁ = P₂ / exp[−(ΔH_vap/R) × (1/T₂ − 1/T₁)]`,
      `1/T₂ − 1/T₁ = 1/${T2.toFixed(2)} − 1/${T1.toFixed(2)} = ${dInvTStr(T2, T1)} K⁻¹`,
      `Exponent = −(${sub.dHvap}/8.314) × ${dInvTStr(T2, T1)} = ${exp_val.toFixed(4)}`,
      `P₁ = 101325 / e^(${exp_val.toFixed(4)}) = 101325 / ${factor.toFixed(5)}`,
      `P₁ = ${Math.round(P1).toLocaleString()} Pa = ${fmtP(P1, 'kPa')}`,
    ],
  }
}

const GENERATORS = [genFindP2, genFindP2, genFindT2, genFindT2, genFindDHvap, genFindT1, genFindP1]

export function genClausiusClapeyronProblem(): ClausiusClapeyronProblem {
  const sub = pick(SUBSTANCES)
  const gen = pick(GENERATORS)
  return gen(sub)
}

export function checkCCAnswer(problem: ClausiusClapeyronProblem, userAnswer: string): boolean {
  const val = parseFloat(userAnswer)
  if (isNaN(val)) return false
  const correct = problem.numericAnswer
  if (correct === 0) return Math.abs(val) < 0.001
  return Math.abs((val - correct) / correct) <= 0.02
}
