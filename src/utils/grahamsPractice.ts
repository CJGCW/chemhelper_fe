// Graham's Law of Effusion practice problem generator
// r₁/r₂ = √(M₂/M₁)   and   t₁/t₂ = √(M₁/M₂)

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function rand(min: number, max: number, dp: number): number {
  return parseFloat((min + Math.random() * (max - min)).toFixed(dp))
}

function sig(n: number, sf = 4): string {
  return parseFloat(n.toPrecision(sf)).toString()
}

const GASES = [
  { name: 'H₂',  M: 2.016  },
  { name: 'He',  M: 4.003  },
  { name: 'CH₄', M: 16.04  },
  { name: 'NH₃', M: 17.03  },
  { name: 'Ne',  M: 20.18  },
  { name: 'N₂',  M: 28.01  },
  { name: 'O₂',  M: 32.00  },
  { name: 'Ar',  M: 39.95  },
  { name: 'CO₂', M: 44.01  },
  { name: 'Cl₂', M: 70.90  },
] as const

function twoDifferentGases() {
  const shuffled = [...GASES].sort(() => Math.random() - 0.5)
  return [shuffled[0], shuffled[1]] as const
}

export interface GrahamsProblem {
  question: string
  answer: number
  unit: string
  steps: string[]
}

type ProblemType = 'find-ratio' | 'find-rate' | 'find-molar-mass' | 'find-time'

export function generateGrahamsProblem(): GrahamsProblem {
  const type = pick<ProblemType>(['find-ratio', 'find-rate', 'find-molar-mass', 'find-time'])

  const [g1, g2] = twoDifferentGases()

  if (type === 'find-ratio') {
    // r(g1)/r(g2) = √(M2/M1)
    const ratio = Math.sqrt(g2.M / g1.M)
    const question = `What is the ratio of effusion rates of ${g1.name} (M = ${g1.M} g/mol) to ${g2.name} (M = ${g2.M} g/mol)?`
    const steps = [
      `r(${g1.name}) / r(${g2.name}) = √(M(${g2.name}) / M(${g1.name}))`,
      `= √(${g2.M} / ${g1.M})`,
      `= √${sig(g2.M / g1.M, 5)}`,
      `= ${sig(ratio)}`,
    ]
    return { question, answer: parseFloat(sig(ratio)), unit: '', steps }
  }

  if (type === 'find-rate') {
    // Given r1 and both M, find r2
    const r1 = rand(1.0, 8.0, 2)
    const r2 = r1 * Math.sqrt(g1.M / g2.M)
    const question = `${g1.name} effuses at ${r1} mL/s. What is the effusion rate of ${g2.name} under the same conditions? (M(${g1.name}) = ${g1.M} g/mol, M(${g2.name}) = ${g2.M} g/mol)`
    const steps = [
      `r(${g1.name}) / r(${g2.name}) = √(M(${g2.name}) / M(${g1.name}))`,
      `r(${g2.name}) = r(${g1.name}) × √(M(${g1.name}) / M(${g2.name}))`,
      `= ${r1} × √(${g1.M} / ${g2.M})`,
      `= ${r1} × ${sig(Math.sqrt(g1.M / g2.M))}`,
      `= ${sig(r2)} mL/s`,
    ]
    return { question, answer: parseFloat(sig(r2)), unit: 'mL/s', steps }
  }

  if (type === 'find-molar-mass') {
    // ratio = r_unknown / r(g2) = √(M2 / M_unknown), so M_unknown = M2 / ratio²
    // We'll say the unknown effuses faster than g2, ratio > 1, meaning M_unknown < M2
    // Pick g1 as the "unknown" (lighter), g2 as the known
    const ratio = parseFloat(Math.sqrt(g2.M / g1.M).toPrecision(3))
    const question = `An unknown gas effuses ${ratio} times faster than ${g2.name} (M = ${g2.M} g/mol). What is the molar mass of the unknown gas?`
    const Munknown = g2.M / (ratio * ratio)
    const steps = [
      `r_unknown / r(${g2.name}) = √(M(${g2.name}) / M_unknown)`,
      `${ratio} = √(${g2.M} / M_unknown)`,
      `${ratio}² = ${g2.M} / M_unknown`,
      `M_unknown = ${g2.M} / ${sig(ratio * ratio)}`,
      `M_unknown = ${sig(Munknown)} g/mol`,
    ]
    return { question, answer: parseFloat(sig(Munknown)), unit: 'g/mol', steps }
  }

  // find-time: t2 = t1 × √(M2/M1)
  const t1 = rand(10, 90, 1)
  const t2 = t1 * Math.sqrt(g2.M / g1.M)
  const question = `${g1.name} (M = ${g1.M} g/mol) takes ${t1} s to effuse through a small hole. How long does ${g2.name} (M = ${g2.M} g/mol) take under identical conditions?`
  const steps = [
    `t(${g1.name}) / t(${g2.name}) = √(M(${g1.name}) / M(${g2.name}))`,
    `t(${g2.name}) = t(${g1.name}) × √(M(${g2.name}) / M(${g1.name}))`,
    `= ${t1} × √(${g2.M} / ${g1.M})`,
    `= ${t1} × ${sig(Math.sqrt(g2.M / g1.M))}`,
    `= ${sig(t2)} s`,
  ]
  return { question, answer: parseFloat(sig(t2)), unit: 's', steps }
}

export function checkGrahamsAnswer(raw: string, problem: GrahamsProblem): boolean {
  const val = parseFloat(raw)
  if (isNaN(val)) return false
  const tol = Math.max(Math.abs(problem.answer) * 0.02, 0.001)
  return Math.abs(val - problem.answer) <= tol
}
