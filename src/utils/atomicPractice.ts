// ── Types ─────────────────────────────────────────────────────────────────────

export type AtomicSubtopic = 'electron_config' | 'quantum_numbers' | 'energy_levels'

export interface AtomicProblem {
  subtopic:    AtomicSubtopic
  question:    string
  answer:      string    // always a string; numeric answers are stringified
  answerUnit:  string
  isTextAnswer: boolean  // true → text compare; false → ±1% numeric
  steps:       string[]
  hint?:       string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function rnd(lo: number, hi: number) { return Math.floor(Math.random() * (hi - lo + 1)) + lo }
function fmtSig(n: number, sf = 3): string { return parseFloat(n.toPrecision(sf)).toString() }

// ── 1. Electron Configuration ─────────────────────────────────────────────────

interface ElementConfig {
  Z:       number
  symbol:  string
  name:    string
  config:  string   // normalized: "1s22s22p63s1" (no spaces, superscripts not used)
  display: string   // display: "1s² 2s² 2p⁶ 3s¹" (Unicode superscripts)
  unpaired: number  // unpaired electrons (for paramagnetism)
  note?:   string   // for exceptions like Cr, Cu
}

// configs stored as compact strings ("1s22s22p6…")
// Transition metal exceptions noted
const ELEMENTS: ElementConfig[] = [
  { Z:  1, symbol: 'H',  name: 'hydrogen',    config: '1s1',                                    display: '1s¹',                                    unpaired: 1 },
  { Z:  2, symbol: 'He', name: 'helium',       config: '1s2',                                    display: '1s²',                                    unpaired: 0 },
  { Z:  3, symbol: 'Li', name: 'lithium',      config: '1s22s1',                                 display: '1s² 2s¹',                                unpaired: 1 },
  { Z:  4, symbol: 'Be', name: 'beryllium',    config: '1s22s2',                                 display: '1s² 2s²',                                unpaired: 0 },
  { Z:  5, symbol: 'B',  name: 'boron',        config: '1s22s22p1',                              display: '1s² 2s² 2p¹',                            unpaired: 1 },
  { Z:  6, symbol: 'C',  name: 'carbon',       config: '1s22s22p2',                              display: '1s² 2s² 2p²',                            unpaired: 2 },
  { Z:  7, symbol: 'N',  name: 'nitrogen',     config: '1s22s22p3',                              display: '1s² 2s² 2p³',                            unpaired: 3 },
  { Z:  8, symbol: 'O',  name: 'oxygen',       config: '1s22s22p4',                              display: '1s² 2s² 2p⁴',                            unpaired: 2 },
  { Z:  9, symbol: 'F',  name: 'fluorine',     config: '1s22s22p5',                              display: '1s² 2s² 2p⁵',                            unpaired: 1 },
  { Z: 10, symbol: 'Ne', name: 'neon',         config: '1s22s22p6',                              display: '1s² 2s² 2p⁶',                            unpaired: 0 },
  { Z: 11, symbol: 'Na', name: 'sodium',       config: '1s22s22p63s1',                           display: '1s² 2s² 2p⁶ 3s¹',                       unpaired: 1 },
  { Z: 12, symbol: 'Mg', name: 'magnesium',    config: '1s22s22p63s2',                           display: '1s² 2s² 2p⁶ 3s²',                       unpaired: 0 },
  { Z: 13, symbol: 'Al', name: 'aluminum',     config: '1s22s22p63s23p1',                        display: '1s² 2s² 2p⁶ 3s² 3p¹',                   unpaired: 1 },
  { Z: 14, symbol: 'Si', name: 'silicon',      config: '1s22s22p63s23p2',                        display: '1s² 2s² 2p⁶ 3s² 3p²',                   unpaired: 2 },
  { Z: 15, symbol: 'P',  name: 'phosphorus',   config: '1s22s22p63s23p3',                        display: '1s² 2s² 2p⁶ 3s² 3p³',                   unpaired: 3 },
  { Z: 16, symbol: 'S',  name: 'sulfur',       config: '1s22s22p63s23p4',                        display: '1s² 2s² 2p⁶ 3s² 3p⁴',                   unpaired: 2 },
  { Z: 17, symbol: 'Cl', name: 'chlorine',     config: '1s22s22p63s23p5',                        display: '1s² 2s² 2p⁶ 3s² 3p⁵',                   unpaired: 1 },
  { Z: 18, symbol: 'Ar', name: 'argon',        config: '1s22s22p63s23p6',                        display: '1s² 2s² 2p⁶ 3s² 3p⁶',                   unpaired: 0 },
  { Z: 19, symbol: 'K',  name: 'potassium',    config: '1s22s22p63s23p64s1',                     display: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹',               unpaired: 1 },
  { Z: 20, symbol: 'Ca', name: 'calcium',      config: '1s22s22p63s23p64s2',                     display: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s²',               unpaired: 0 },
  { Z: 24, symbol: 'Cr', name: 'chromium',     config: '1s22s22p63s23p63d54s1',                  display: '1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁵ 4s¹',           unpaired: 6, note: 'Exception: half-filled 3d (3d⁵4s¹) is more stable than expected 3d⁴4s².' },
  { Z: 26, symbol: 'Fe', name: 'iron',         config: '1s22s22p63s23p63d64s2',                  display: '1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁶ 4s²',           unpaired: 4 },
  { Z: 29, symbol: 'Cu', name: 'copper',       config: '1s22s22p63s23p63d104s1',                 display: '1s² 2s² 2p⁶ 3s² 3p⁶ 3d¹⁰ 4s¹',          unpaired: 1, note: 'Exception: full 3d (3d¹⁰4s¹) is more stable than expected 3d⁹4s².' },
  { Z: 30, symbol: 'Zn', name:'zinc',         config: '1s22s22p63s23p63d104s2',                 display: '1s² 2s² 2p⁶ 3s² 3p⁶ 3d¹⁰ 4s²',          unpaired: 0 },
  { Z: 35, symbol: 'Br', name: 'bromine',      config: '1s22s22p63s23p63d104s24p5',              display: '1s² 2s² 2p⁶ 3s² 3p⁶ 3d¹⁰ 4s² 4p⁵',     unpaired: 1 },
  { Z: 36, symbol: 'Kr', name: 'krypton',      config: '1s22s22p63s23p63d104s24p6',              display: '1s² 2s² 2p⁶ 3s² 3p⁶ 3d¹⁰ 4s² 4p⁶',     unpaired: 0 },
]

function normalizeConfig(s: string): string {
  // Accepts "1s2 2s2 2p6", "1s²2s²2p⁶", etc.
  // Strip whitespace, superscript chars → digits, lowercase
  return s
    .replace(/\s+/g, '')
    .replace(/⁰/g,'0').replace(/¹/g,'1').replace(/²/g,'2').replace(/³/g,'3')
    .replace(/⁴/g,'4').replace(/⁵/g,'5').replace(/⁶/g,'6').replace(/⁷/g,'7')
    .replace(/⁸/g,'8').replace(/⁹/g,'9').replace(/¹⁰/g,'10')
    .toLowerCase()
}

function genElectronConfig(): AtomicProblem {
  const el = pick(ELEMENTS)
  const subtype = pick(['write', 'identify_unpaired'] as const)

  if (subtype === 'identify_unpaired') {
    return {
      subtopic: 'electron_config',
      question: `How many unpaired electrons does ${el.name} (${el.symbol}) have?`,
      answer: String(el.unpaired),
      answerUnit: 'unpaired electrons',
      isTextAnswer: false,
      steps: [
        `Electron configuration: ${el.display}`,
        `Fill subshells using Hund's rule (one electron per orbital before pairing)`,
        `Unpaired electrons: ${el.unpaired}`,
      ],
      hint: el.note,
    }
  }

  return {
    subtopic: 'electron_config',
    question: `Write the full electron configuration for ${el.name} (${el.symbol}, Z = ${el.Z}).`,
    answer: el.config,
    answerUnit: '',
    isTextAnswer: true,
    steps: [
      `Fill orbitals in order of increasing energy: 1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p…`,
      `${el.symbol} has ${el.Z} electrons`,
      `Configuration: ${el.display}`,
      ...(el.note ? [el.note] : []),
    ],
    hint: el.note ? 'Note: this element is a known exception.' : undefined,
  }
}

// ── 2. Quantum Numbers ────────────────────────────────────────────────────────

const SUBSHELL_L: Record<string, number> = { s: 0, p: 1, d: 2, f: 3 }
const L_SUBSHELL: Record<number, string> = { 0: 's', 1: 'p', 2: 'd', 3: 'f' }

function genQuantumNumbers(): AtomicProblem {
  const kind = pick([
    'electrons_in_shell',
    'orbitals_in_shell',
    'electrons_in_subshell',
    'l_value',
    'max_ml',
    'valid_set',
  ] as const)

  if (kind === 'electrons_in_shell') {
    const n = rnd(1, 4)
    const answer = 2 * n * n
    return {
      subtopic: 'quantum_numbers',
      question: `What is the maximum number of electrons that can occupy the n = ${n} shell?`,
      answer: String(answer), answerUnit: 'electrons', isTextAnswer: false,
      steps: [
        `Maximum electrons in shell n = 2n²`,
        `2 × ${n}² = 2 × ${n*n} = ${answer}`,
      ],
    }
  }

  if (kind === 'orbitals_in_shell') {
    const n = rnd(1, 4)
    const answer = n * n
    return {
      subtopic: 'quantum_numbers',
      question: `How many orbitals are in the n = ${n} shell?`,
      answer: String(answer), answerUnit: 'orbitals', isTextAnswer: false,
      steps: [
        `Number of orbitals in shell n = n²`,
        `${n}² = ${answer}`,
      ],
    }
  }

  if (kind === 'electrons_in_subshell') {
    const l = rnd(0, 3)
    const sub = L_SUBSHELL[l]
    const answer = 2 * (2 * l + 1)
    return {
      subtopic: 'quantum_numbers',
      question: `What is the maximum number of electrons in a ${sub} subshell (l = ${l})?`,
      answer: String(answer), answerUnit: 'electrons', isTextAnswer: false,
      steps: [
        `Number of orbitals in subshell = 2l + 1 = 2(${l}) + 1 = ${2*l+1}`,
        `Each orbital holds 2 electrons → ${2*l+1} × 2 = ${answer}`,
      ],
    }
  }

  if (kind === 'l_value') {
    const sub = pick(['s', 'p', 'd', 'f'] as const)
    const answer = SUBSHELL_L[sub]
    return {
      subtopic: 'quantum_numbers',
      question: `What is the angular momentum quantum number (l) for a ${sub} subshell?`,
      answer: String(answer), answerUnit: '', isTextAnswer: false,
      steps: [
        `s → l = 0`,
        `p → l = 1`,
        `d → l = 2`,
        `f → l = 3`,
        `Answer: l = ${answer}`,
      ],
    }
  }

  if (kind === 'max_ml') {
    const l = rnd(0, 3)
    const answer = l
    return {
      subtopic: 'quantum_numbers',
      question: `What is the maximum value of mₗ for l = ${l}?`,
      answer: String(answer), answerUnit: '', isTextAnswer: false,
      steps: [
        `mₗ ranges from −l to +l in integer steps`,
        `For l = ${l}: mₗ = −${l}, ..., 0, ..., +${l}`,
        `Maximum mₗ = ${answer}`,
      ],
    }
  }

  // valid_set: check if a set is valid
  const valid = pick([true, false])
  let n: number, l: number, ml: number, ms: string, reason: string

  if (valid) {
    n  = rnd(2, 4)
    l  = rnd(0, n - 1)
    ml = rnd(-l, l)
    ms = pick(['+1/2', '−1/2'])
    reason = 'All quantum numbers satisfy the rules.'
  } else {
    // Pick an invalid case
    const fault = pick(['l_too_large', 'ml_too_large', 'n_zero'] as const)
    if (fault === 'l_too_large') {
      n = rnd(2, 3); l = n; ml = 0; ms = '+1/2'
      reason = `l must be 0 to n−1. Here l = n = ${n}, which is invalid.`
    } else if (fault === 'ml_too_large') {
      n = rnd(2, 4); l = rnd(1, n-1); ml = l + 1; ms = '+1/2'
      reason = `mₗ must be between −l and +l. Here mₗ = ${ml} but l = ${l}, so mₗ max = ${l}.`
    } else {
      n = 0; l = 0; ml = 0; ms = '+1/2'
      reason = 'n must be a positive integer (n ≥ 1). n = 0 is invalid.'
    }
  }

  return {
    subtopic: 'quantum_numbers',
    question: `Is the quantum number set (n = ${n}, l = ${l}, mₗ = ${ml}, ms = ${ms}) valid? Enter 1 for yes, 0 for no.`,
    answer: valid ? '1' : '0', answerUnit: '', isTextAnswer: false,
    steps: [
      `Rules: n ≥ 1; l = 0 to n−1; mₗ = −l to +l; ms = ±1/2`,
      reason,
      `Answer: ${valid ? 'Valid (1)' : 'Invalid (0)'}`,
    ],
  }
}

// ── 3. Energy Levels (Bohr model) ─────────────────────────────────────────────

const E_RYDBERG_EV = 13.6     // eV
const HC_EV_NM    = 1240      // eV·nm  (hc = 1240 eV·nm)

function genEnergyLevels(): AtomicProblem {
  const kind = pick(['level_energy', 'transition_energy', 'transition_wavelength'] as const)

  if (kind === 'level_energy') {
    const n = rnd(1, 5)
    const E = -E_RYDBERG_EV / (n * n)
    const Efmt = fmtSig(E, 3)
    return {
      subtopic: 'energy_levels',
      question: `Calculate the energy of the n = ${n} level in a hydrogen atom. (Use E = −13.6/n² eV)`,
      answer: Efmt,
      answerUnit: 'eV',
      isTextAnswer: false,
      steps: [
        `E_n = −13.6 / n² eV`,
        `E_${n} = −13.6 / ${n}² = −13.6 / ${n*n}`,
        `E_${n} = ${Efmt} eV`,
      ],
    }
  }

  if (kind === 'transition_energy') {
    const ni = rnd(3, 6)
    const nf = rnd(1, ni - 1)
    const Ei = -E_RYDBERG_EV / (ni * ni)
    const Ef = -E_RYDBERG_EV / (nf * nf)
    const dE = Math.abs(Ef - Ei)
    const dEfmt = fmtSig(dE, 3)
    return {
      subtopic: 'energy_levels',
      question: `What is the energy of the photon emitted when an electron in hydrogen drops from n = ${ni} to n = ${nf}? (Use E = −13.6/n² eV)`,
      answer: dEfmt,
      answerUnit: 'eV',
      isTextAnswer: false,
      steps: [
        `E_${ni} = −13.6 / ${ni*ni} = ${fmtSig(Ei,3)} eV`,
        `E_${nf} = −13.6 / ${nf*nf} = ${fmtSig(Ef,3)} eV`,
        `|ΔE| = |${fmtSig(Ef,3)} − (${fmtSig(Ei,3)})| = ${dEfmt} eV`,
      ],
    }
  }

  // transition_wavelength
  const ni = rnd(3, 6)
  const nf = rnd(1, ni - 1)
  const Ei = -E_RYDBERG_EV / (ni * ni)
  const Ef = -E_RYDBERG_EV / (nf * nf)
  const dE = Math.abs(Ef - Ei)
  const lambda = HC_EV_NM / dE
  const lambdaFmt = fmtSig(lambda, 3)
  return {
    subtopic: 'energy_levels',
    question: `Calculate the wavelength of the photon emitted for the n = ${ni} → n = ${nf} transition in hydrogen. (E = −13.6/n² eV; λ = 1240 eV·nm / |ΔE|)`,
    answer: lambdaFmt,
    answerUnit: 'nm',
    isTextAnswer: false,
    steps: [
      `E_${ni} = −13.6 / ${ni*ni} = ${fmtSig(Ei,3)} eV`,
      `E_${nf} = −13.6 / ${nf*nf} = ${fmtSig(Ef,3)} eV`,
      `|ΔE| = ${fmtSig(dE,3)} eV`,
      `λ = 1240 eV·nm / ${fmtSig(dE,3)} eV = ${lambdaFmt} nm`,
    ],
  }
}

// ── Public entry ──────────────────────────────────────────────────────────────

const SUBTOPIC_POOL: AtomicSubtopic[] = [
  'electron_config', 'electron_config',   // weighted higher
  'quantum_numbers', 'quantum_numbers',
  'energy_levels',
]

export function generateAtomicProblem(subtopic?: AtomicSubtopic): AtomicProblem {
  const s = subtopic ?? pick(SUBTOPIC_POOL)
  if (s === 'electron_config') return genElectronConfig()
  if (s === 'quantum_numbers') return genQuantumNumbers()
  return genEnergyLevels()
}

// ── Answer checker ────────────────────────────────────────────────────────────

export function checkAtomicAnswer(input: string, problem: AtomicProblem): boolean {
  if (problem.isTextAnswer) {
    // Electron config: normalize and compare
    return normalizeConfig(input) === normalizeConfig(problem.answer)
  }
  const userVal = parseFloat(input)
  const correctVal = parseFloat(problem.answer)
  if (isNaN(userVal) || isNaN(correctVal)) return false
  // Integer answers (quantum numbers): exact match
  if (Number.isInteger(correctVal)) return Math.round(userVal) === correctVal
  // Numeric answers: ±1%
  if (correctVal === 0) return Math.abs(userVal) < 0.001
  return Math.abs((userVal - correctVal) / correctVal) <= 0.01
}
