// Dalton's Law of Partial Pressures — practice problem generator

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function rand(min: number, max: number, dp: number): number {
  return parseFloat((min + Math.random() * (max - min)).toFixed(dp))
}

function sig(n: number, sf = 4): string {
  return parseFloat(n.toPrecision(sf)).toString()
}

const GAS_NAMES = ['N₂', 'O₂', 'CO₂', 'H₂', 'Ar', 'CH₄', 'He', 'NH₃', 'Ne', 'H₂O'] as const

export interface DaltonsProblem {
  question: string
  answer: number
  unit: string
  steps: string[]
}

type ProblemType = 'find-total' | 'find-partial' | 'find-from-moles' | 'find-mole-fraction'

export function generateDaltonsProblem(): DaltonsProblem {
  const type = pick<ProblemType>(['find-total', 'find-partial', 'find-from-moles', 'find-mole-fraction'])

  if (type === 'find-total') {
    const n = pick([2, 3] as const)
    const names = [...GAS_NAMES].sort(() => Math.random() - 0.5).slice(0, n)
    const pressures = names.map(() => rand(0.05, 0.80, 3))
    const total = pressures.reduce((a, b) => a + b, 0)

    const parts = names.map((g, i) => `P(${g}) = ${pressures[i]} atm`)
    const question = `A container holds a mixture of gases: ${parts.join(', ')}. What is the total pressure?`

    const steps = [
      `P_total = ${names.map((g, i) => `P(${g})`).join(' + ')}`,
      `P_total = ${pressures.join(' + ')} atm`,
      `P_total = ${sig(total)} atm`,
    ]
    return { question, answer: total, unit: 'atm', steps }
  }

  if (type === 'find-partial') {
    const names = [...GAS_NAMES].sort(() => Math.random() - 0.5).slice(0, 2)
    const p1 = rand(0.20, 0.60, 3)
    const total = rand(p1 + 0.20, p1 + 1.00, 3)
    const p2 = total - p1
    if (p2 <= 0) return generateDaltonsProblem()

    const question = `A gas mixture has a total pressure of ${total} atm. The partial pressure of ${names[0]} is ${p1} atm. What is the partial pressure of ${names[1]}?`
    const steps = [
      `P_total = P(${names[0]}) + P(${names[1]})`,
      `P(${names[1]}) = P_total − P(${names[0]})`,
      `P(${names[1]}) = ${total} − ${p1} = ${sig(p2)} atm`,
    ]
    return { question, answer: p2, unit: 'atm', steps }
  }

  if (type === 'find-from-moles') {
    const names = [...GAS_NAMES].sort(() => Math.random() - 0.5).slice(0, 2)
    const n1 = rand(0.50, 3.00, 2)
    const n2 = rand(0.50, 3.00, 2)
    const total = rand(1.00, 2.50, 3)
    const nTotal = n1 + n2
    const chi1 = n1 / nTotal
    const p1 = chi1 * total

    const question = `A mixture contains ${n1} mol ${names[0]} and ${n2} mol ${names[1]} at a total pressure of ${total} atm. What is the partial pressure of ${names[0]}?`
    const steps = [
      `n_total = ${n1} + ${n2} = ${sig(nTotal)} mol`,
      `χ(${names[0]}) = ${n1} / ${sig(nTotal)} = ${sig(chi1)}`,
      `P(${names[0]}) = χ × P_total = ${sig(chi1)} × ${total} = ${sig(p1)} atm`,
    ]
    return { question, answer: p1, unit: 'atm', steps }
  }

  // find-mole-fraction
  const name = pick(GAS_NAMES)
  const partial = rand(0.15, 0.80, 3)
  const total = rand(partial + 0.20, partial + 1.00, 3)
  const chi = partial / total

  const question = `The partial pressure of ${name} in a gas mixture is ${partial} atm. The total pressure is ${total} atm. What is the mole fraction of ${name}?`
  const steps = [
    `χ(${name}) = P(${name}) / P_total`,
    `χ(${name}) = ${partial} / ${total}`,
    `χ(${name}) = ${sig(chi)}`,
  ]
  return { question, answer: chi, unit: '', steps }
}

export function checkDaltonsAnswer(raw: string, problem: DaltonsProblem): boolean {
  const val = parseFloat(raw)
  if (isNaN(val)) return false
  const tol = Math.max(Math.abs(problem.answer) * 0.02, 0.001)
  return Math.abs(val - problem.answer) <= tol
}
