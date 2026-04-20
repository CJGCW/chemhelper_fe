export type SciNotationProblemType = 'to_sci' | 'from_sci' | 'multiply' | 'divide'

export interface SciNotationProblem {
  type: SciNotationProblemType
  prompt: string
  inputDisplay: string
  correctAnswer: string
  hint: string
  sigfigs: number
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randCoeff(sf: number): number {
  const lo = Math.pow(10, sf - 1)
  const hi = Math.pow(10, sf) - 1
  return randInt(lo, hi) / Math.pow(10, sf - 1)
}

function formatSci(coeff: number, exp: number): string {
  const expStr = exp < 0 ? `10⁻${superscript(Math.abs(exp))}` : `10${superscript(exp)}`
  return `${coeff} × ${expStr}`
}

function superscript(n: number): string {
  return String(n).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]).join('')
}

function formatStandard(coeff: number, exp: number): string {
  const val = coeff * Math.pow(10, exp)
  if (exp >= 0) {
    return val.toLocaleString('en-US', { maximumFractionDigits: 10 }).replace(/,/g, ',')
  }
  return val.toPrecision(String(coeff).replace('.', '').length)
}

function makeSciAnswer(coeff: number, exp: number): string {
  const expStr = exp < 0 ? `-${Math.abs(exp)}` : String(exp)
  return `${coeff}e${expStr}`
}

function parseAnswer(s: string): { coeff: number; exp: number } | null {
  const clean = s.trim().toLowerCase().replace(/\s/g, '').replace(/×10\^?/g, 'e').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, c => '0123456789'['⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)])
  const eIdx = clean.lastIndexOf('e')
  if (eIdx === -1) return null
  const coeff = parseFloat(clean.slice(0, eIdx))
  const exp   = parseInt(clean.slice(eIdx + 1), 10)
  if (!isFinite(coeff) || !isFinite(exp)) return null
  return { coeff, exp }
}

export function checkSciAnswer(userInput: string, problem: SciNotationProblem): 'correct' | 'wrong' | 'format_error' {
  const clean = userInput.trim()
  if (!clean) return 'wrong'

  if (problem.type === 'to_sci') {
    const parsed = parseAnswer(clean)
    if (!parsed) {
      // Try matching the correct answer string loosely
      const correct = parseAnswer(problem.correctAnswer)
      if (!correct) return 'format_error'
      const userNum = parseFloat(clean)
      if (!isFinite(userNum)) return 'format_error'
      const correctNum = correct.coeff * Math.pow(10, correct.exp)
      return Math.abs(userNum - correctNum) / Math.abs(correctNum) < 1e-9 ? 'correct' : 'wrong'
    }
    const correct = parseAnswer(problem.correctAnswer)!
    const userVal = parsed.coeff * Math.pow(10, parsed.exp)
    const correctVal = correct.coeff * Math.pow(10, correct.exp)
    if (Math.abs(userVal - correctVal) / Math.abs(correctVal) > 1e-9) return 'wrong'
    if (parsed.coeff < 1 || parsed.coeff >= 10) return 'wrong'
    return 'correct'
  }

  if (problem.type === 'from_sci') {
    const userNum = parseFloat(clean.replace(/,/g, ''))
    const correctNum = parseFloat(problem.correctAnswer.replace(/,/g, ''))
    if (!isFinite(userNum) || !isFinite(correctNum)) return 'format_error'
    return Math.abs(userNum - correctNum) / (Math.abs(correctNum) || 1) < 1e-9 ? 'correct' : 'wrong'
  }

  // multiply / divide
  const parsed = parseAnswer(clean)
  if (!parsed) {
    const userNum = parseFloat(clean)
    if (!isFinite(userNum)) return 'format_error'
    const correctNum = parseFloat(problem.correctAnswer)
    return Math.abs(userNum - correctNum) / (Math.abs(correctNum) || 1) < 1e-6 ? 'correct' : 'wrong'
  }
  const correct = parseAnswer(problem.correctAnswer)!
  const userVal = parsed.coeff * Math.pow(10, parsed.exp)
  const correctVal = correct.coeff * Math.pow(10, correct.exp)
  if (Math.abs(userVal - correctVal) / (Math.abs(correctVal) || 1) > 1e-6) return 'wrong'
  return 'correct'
}

function makeToSci(): SciNotationProblem {
  const sf   = randInt(2, 4)
  const exp  = randInt(-6, 6)
  const coeff = randCoeff(sf)
  const std  = formatStandard(coeff, exp)
  const sci  = makeSciAnswer(coeff, exp)
  const expDisplay = exp < 0 ? `−${Math.abs(exp)}` : String(exp)
  return {
    type: 'to_sci',
    prompt: 'Convert to scientific notation.',
    inputDisplay: std,
    correctAnswer: sci,
    hint: `Move the decimal point so the coefficient is between 1 and 10. The exponent is ${expDisplay}.`,
    sigfigs: sf,
  }
}

function makeFromSci(): SciNotationProblem {
  const sf   = randInt(2, 3)
  const exp  = randInt(-5, 5)
  const coeff = randCoeff(sf)
  const val  = coeff * Math.pow(10, exp)
  const std  = exp < 0
    ? val.toPrecision(sf)
    : parseFloat(val.toPrecision(sf)).toString()
  return {
    type: 'from_sci',
    prompt: 'Write in standard (decimal) notation.',
    inputDisplay: formatSci(coeff, exp),
    correctAnswer: std,
    hint: `Shift the decimal ${Math.abs(exp)} place${Math.abs(exp) !== 1 ? 's' : ''} to the ${exp > 0 ? 'right' : 'left'}.`,
    sigfigs: sf,
  }
}

function makeMultiply(): SciNotationProblem {
  const a = randCoeff(2), expA = randInt(-4, 4)
  const b = randCoeff(2), expB = randInt(-4, 4)
  const rawCoeff = a * b
  const rawExp   = expA + expB
  let coeff = rawCoeff, exp = rawExp
  if (coeff >= 10) { coeff /= 10; exp += 1 }
  const ans = makeSciAnswer(parseFloat(coeff.toPrecision(2)), exp)
  return {
    type: 'multiply',
    prompt: 'Multiply. Express in scientific notation.',
    inputDisplay: `(${formatSci(a, expA)}) × (${formatSci(b, expB)})`,
    correctAnswer: ans,
    hint: `Multiply coefficients (${a} × ${b} = ${parseFloat((a * b).toPrecision(2))}), add exponents (${expA} + ${expB} = ${expA + expB}).`,
    sigfigs: 2,
  }
}

function makeDivide(): SciNotationProblem {
  const a = randCoeff(2), expA = randInt(-2, 4)
  const b = randCoeff(2), expB = randInt(-2, 4)
  const rawCoeff = a / b
  const rawExp   = expA - expB
  let coeff = rawCoeff, exp = rawExp
  while (coeff >= 10) { coeff /= 10; exp += 1 }
  while (coeff < 1)   { coeff *= 10; exp -= 1 }
  const ans = makeSciAnswer(parseFloat(coeff.toPrecision(2)), exp)
  return {
    type: 'divide',
    prompt: 'Divide. Express in scientific notation.',
    inputDisplay: `(${formatSci(a, expA)}) ÷ (${formatSci(b, expB)})`,
    correctAnswer: ans,
    hint: `Divide coefficients (${a} ÷ ${b} ≈ ${parseFloat((a / b).toPrecision(2))}), subtract exponents (${expA} − ${expB} = ${expA - expB}).`,
    sigfigs: 2,
  }
}

const MAKERS = [makeToSci, makeToSci, makeFromSci, makeFromSci, makeMultiply, makeDivide]

export function genSciNotationProblems(count = 8): SciNotationProblem[] {
  const problems: SciNotationProblem[] = []
  const types = [...MAKERS]
  for (let i = 0; i < count; i++) {
    problems.push(types[i % types.length]())
  }
  return problems
}
