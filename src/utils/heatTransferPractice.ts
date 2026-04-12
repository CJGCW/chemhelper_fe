// ── Types ─────────────────────────────────────────────────────────────────────

export interface HeatTransferProblem {
  description:   string
  question:      string
  given:         { label: string; value: string }[]
  solveFor:      string   // display symbol
  answer:        number
  answerUnit:    string
  solutionSteps: string[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 1): string {
  return n.toFixed(decimals)
}

function buildStepsTf(
  m1: number, c1: number, T1: number, name1: string,
  m2: number, c2: number, T2: number, name2: string,
  Tf: number,
): string[] {
  const mc1 = m1 * c1
  const mc2 = m2 * c2
  return [
    'Apply conservation of energy:',
    '  q_gained + q_lost = 0',
    '  m₁c₁(Tf − T₁) + m₂c₂(Tf − T₂) = 0',
    '',
    `Substitute (${name1} = object 1, ${name2} = object 2):`,
    `  (${m1})(${c1})(Tf − ${T1}) + (${m2})(${c2})(Tf − ${T2}) = 0`,
    `  ${fmt(mc1, 3)}(Tf − ${T1}) + ${fmt(mc2, 3)}(Tf − ${T2}) = 0`,
    `  ${fmt(mc1, 3)}·Tf − ${fmt(mc1 * T1, 2)} + ${fmt(mc2, 3)}·Tf − ${fmt(mc2 * T2, 2)} = 0`,
    `  ${fmt(mc1 + mc2, 3)}·Tf = ${fmt(mc1 * T1 + mc2 * T2, 2)}`,
    `  Tf = ${fmt(mc1 * T1 + mc2 * T2, 2)} / ${fmt(mc1 + mc2, 3)}`,
    `  Tf ≈ ${fmt(Tf)} °C`,
  ]
}

function buildStepsTHot(
  m1: number, c1: number, name1: string,
  m2: number, c2: number, T2: number, name2: string,
  Tf: number, T_hot: number,
): string[] {
  const mc1 = m1 * c1
  const mc2 = m2 * c2
  const q2  = mc2 * (Tf - T2)
  return [
    'Apply conservation of energy:',
    '  q_hot + q_cold = 0',
    '  m_hot · c_hot · (Tf − T_hot) = −m_cold · c_cold · (Tf − T_cold)',
    '',
    `Substitute (${name1} = hot, ${name2} = cold):`,
    `  (${m1})(${c1})(${Tf} − T_hot) = −(${m2})(${c2})(${Tf} − ${T2})`,
    `  ${fmt(mc1, 3)}(${Tf} − T_hot) = −${fmt(mc2, 3)} × ${fmt(Tf - T2, 1)}`,
    `  ${fmt(mc1, 3)}(${Tf} − T_hot) = ${fmt(-q2, 2)}`,
    `  ${Tf} − T_hot = ${fmt(-q2 / mc1, 3)}`,
    `  T_hot = ${Tf} − (${fmt(-q2 / mc1, 3)})`,
    `  T_hot ≈ ${fmt(T_hot)} °C`,
  ]
}

function buildStepsMCold(
  m1: number, c1: number, T1: number, name1: string,
  c2: number, T2: number, name2: string,
  Tf: number, m_cold: number,
): string[] {
  const mc1 = m1 * c1
  const q1  = mc1 * (Tf - T1)
  return [
    'Apply conservation of energy:',
    '  q_hot + q_cold = 0',
    '  m_hot · c_hot · (Tf − T_hot) + m_cold · c_cold · (Tf − T_cold) = 0',
    '',
    `Solve for m_cold (${name2}):`,
    `  m_cold = −m_hot · c_hot · (Tf − T_hot) / [c_cold · (Tf − T_cold)]`,
    '',
    `Substitute (${name1} = hot, ${name2} = cold):`,
    `  m_cold = −(${m1})(${c1})(${Tf} − ${T1}) / [(${c2})(${Tf} − ${T2})]`,
    `  m_cold = −${fmt(mc1, 3)} × (${fmt(Tf - T1, 1)}) / [${c2} × ${fmt(Tf - T2, 1)}]`,
    `  m_cold = ${fmt(-q1, 2)} / ${fmt(c2 * (Tf - T2), 4)}`,
    `  m_cold ≈ ${fmt(m_cold, 0)} g`,
  ]
}

// ── Problem database ──────────────────────────────────────────────────────────

const PROBLEMS: HeatTransferProblem[] = [

  // P1: 100 g Cu at 95°C → 250 g H₂O at 22°C  →  Tf ≈ 24.6°C
  (() => {
    const m1 = 100, c1 = 0.385, T1 = 95
    const m2 = 250, c2 = 4.184, T2 = 22
    const Tf = parseFloat(((m1*c1*T1 + m2*c2*T2) / (m1*c1 + m2*c2)).toFixed(1))
    return {
      description: 'copper block in water',
      question: `A 100 g copper block at 95.0 °C is dropped into 250 g of water at 22.0 °C. What is the final equilibrium temperature?`,
      given: [
        { label: 'm_Cu',  value: '100 g'          },
        { label: 'c_Cu',  value: '0.385 J/(g·°C)' },
        { label: 'T_Cu',  value: '95.0 °C'        },
        { label: 'm_H₂O', value: '250 g'          },
        { label: 'c_H₂O', value: '4.184 J/(g·°C)' },
        { label: 'T_H₂O', value: '22.0 °C'        },
      ],
      solveFor: 'T_final', answer: Tf, answerUnit: '°C',
      solutionSteps: buildStepsTf(m1, c1, T1, 'copper', m2, c2, T2, 'water', Tf),
    }
  })(),

  // P2: 150 g Fe at 85°C → 200 g H₂O at 18°C  →  Tf ≈ 23.0°C
  (() => {
    const m1 = 150, c1 = 0.449, T1 = 85
    const m2 = 200, c2 = 4.184, T2 = 18
    const Tf = parseFloat(((m1*c1*T1 + m2*c2*T2) / (m1*c1 + m2*c2)).toFixed(1))
    return {
      description: 'iron into water',
      question: `A 150 g iron bar at 85.0 °C is submerged in 200 g of water at 18.0 °C. Find the final temperature when thermal equilibrium is reached.`,
      given: [
        { label: 'm_Fe',  value: '150 g'          },
        { label: 'c_Fe',  value: '0.449 J/(g·°C)' },
        { label: 'T_Fe',  value: '85.0 °C'        },
        { label: 'm_H₂O', value: '200 g'          },
        { label: 'c_H₂O', value: '4.184 J/(g·°C)' },
        { label: 'T_H₂O', value: '18.0 °C'        },
      ],
      solveFor: 'T_final', answer: Tf, answerUnit: '°C',
      solutionSteps: buildStepsTf(m1, c1, T1, 'iron', m2, c2, T2, 'water', Tf),
    }
  })(),

  // P3: 50 g Al at 120°C → 300 g H₂O at 20°C  →  Tf ≈ 23.5°C
  (() => {
    const m1 = 50,  c1 = 0.897, T1 = 120
    const m2 = 300, c2 = 4.184, T2 = 20
    const Tf = parseFloat(((m1*c1*T1 + m2*c2*T2) / (m1*c1 + m2*c2)).toFixed(1))
    return {
      description: 'aluminum into water',
      question: `A 50.0 g aluminum sample at 120 °C is placed into 300 g of water at 20.0 °C in an insulated container. What is the final temperature?`,
      given: [
        { label: 'm_Al',  value: '50.0 g'         },
        { label: 'c_Al',  value: '0.897 J/(g·°C)' },
        { label: 'T_Al',  value: '120 °C'         },
        { label: 'm_H₂O', value: '300 g'          },
        { label: 'c_H₂O', value: '4.184 J/(g·°C)' },
        { label: 'T_H₂O', value: '20.0 °C'        },
      ],
      solveFor: 'T_final', answer: Tf, answerUnit: '°C',
      solutionSteps: buildStepsTf(m1, c1, T1, 'aluminum', m2, c2, T2, 'water', Tf),
    }
  })(),

  // P4: 200 g Pb at 200°C → 500 g H₂O at 25°C  →  Tf ≈ 27.1°C
  (() => {
    const m1 = 200, c1 = 0.128, T1 = 200
    const m2 = 500, c2 = 4.184, T2 = 25
    const Tf = parseFloat(((m1*c1*T1 + m2*c2*T2) / (m1*c1 + m2*c2)).toFixed(1))
    return {
      description: 'lead shot in water',
      question: `200 g of lead shot at 200 °C is poured into 500 g of water at 25.0 °C. Assuming no heat loss to the surroundings, find the final temperature.`,
      given: [
        { label: 'm_Pb',  value: '200 g'          },
        { label: 'c_Pb',  value: '0.128 J/(g·°C)' },
        { label: 'T_Pb',  value: '200 °C'         },
        { label: 'm_H₂O', value: '500 g'          },
        { label: 'c_H₂O', value: '4.184 J/(g·°C)' },
        { label: 'T_H₂O', value: '25.0 °C'        },
      ],
      solveFor: 'T_final', answer: Tf, answerUnit: '°C',
      solutionSteps: buildStepsTf(m1, c1, T1, 'lead', m2, c2, T2, 'water', Tf),
    }
  })(),

  // P5: 75 g Ag at 80°C → 150 g H₂O at 15°C  →  Tf ≈ 16.8°C
  (() => {
    const m1 = 75,  c1 = 0.235, T1 = 80
    const m2 = 150, c2 = 4.184, T2 = 15
    const Tf = parseFloat(((m1*c1*T1 + m2*c2*T2) / (m1*c1 + m2*c2)).toFixed(1))
    return {
      description: 'silver in water',
      question: `A 75.0 g silver coin at 80.0 °C is dropped into 150 g of water at 15.0 °C. Calculate the final equilibrium temperature.`,
      given: [
        { label: 'm_Ag',  value: '75.0 g'         },
        { label: 'c_Ag',  value: '0.235 J/(g·°C)' },
        { label: 'T_Ag',  value: '80.0 °C'        },
        { label: 'm_H₂O', value: '150 g'          },
        { label: 'c_H₂O', value: '4.184 J/(g·°C)' },
        { label: 'T_H₂O', value: '15.0 °C'        },
      ],
      solveFor: 'T_final', answer: Tf, answerUnit: '°C',
      solutionSteps: buildStepsTf(m1, c1, T1, 'silver', m2, c2, T2, 'water', Tf),
    }
  })(),

  // P6: 60 g Cu at 200°C + 90 g Cu at 50°C  →  Tf = 110°C (exact)
  (() => {
    const m1 = 60, c1 = 0.385, T1 = 200
    const m2 = 90, c2 = 0.385, T2 = 50
    const Tf = parseFloat(((m1*c1*T1 + m2*c2*T2) / (m1*c1 + m2*c2)).toFixed(1))
    return {
      description: 'two copper pieces',
      question: `A 60.0 g copper piece at 200 °C is mixed with a 90.0 g copper piece at 50.0 °C in an insulated container. What is the final temperature?`,
      given: [
        { label: 'm₁ (Cu)', value: '60.0 g'         },
        { label: 'c (Cu)',  value: '0.385 J/(g·°C)' },
        { label: 'T₁',      value: '200 °C'         },
        { label: 'm₂ (Cu)', value: '90.0 g'         },
        { label: 'T₂',      value: '50.0 °C'        },
      ],
      solveFor: 'T_final', answer: Tf, answerUnit: '°C',
      solutionSteps: buildStepsTf(m1, c1, T1, 'hot copper', m2, c2, T2, 'cold copper', Tf),
    }
  })(),

  // P7: Find T_hot: 80 g Fe, c=0.449 → 200 g H₂O at 20°C, Tf=29°C → T_hot≈238.6°C
  (() => {
    const m1 = 80, c1 = 0.449
    const m2 = 200, c2 = 4.184, T2 = 20
    const Tf = 29
    const T_hot = parseFloat((Tf + m2*c2*(Tf - T2)/(m1*c1)).toFixed(1))
    // T_hot = Tf - (m2*c2*(Tf-T2))/(m1*c1)  ... wait
    // m1c1*(Tf - T_hot) = -m2c2*(Tf - T2)
    // Tf - T_hot = -m2c2*(Tf-T2)/(m1c1)
    // T_hot = Tf + m2c2*(Tf-T2)/(m1c1)
    return {
      description: 'find initial temp of hot iron',
      question: `An iron sample is heated and dropped into 200 g of water at 20.0 °C. The final temperature is 29.0 °C. If the iron sample has a mass of 80.0 g, what was its initial temperature?`,
      given: [
        { label: 'm_Fe',   value: '80.0 g'         },
        { label: 'c_Fe',   value: '0.449 J/(g·°C)' },
        { label: 'm_H₂O',  value: '200 g'          },
        { label: 'c_H₂O',  value: '4.184 J/(g·°C)' },
        { label: 'T_H₂O',  value: '20.0 °C'        },
        { label: 'T_final', value: '29.0 °C'       },
      ],
      solveFor: 'T_initial (iron)', answer: T_hot, answerUnit: '°C',
      solutionSteps: buildStepsTHot(m1, c1, 'iron', m2, c2, T2, 'water', Tf, T_hot),
    }
  })(),

  // P8: Find m_cold: 250 g Au at 100°C → water at 22°C, Tf=23.5°C → m_water≈393 g
  (() => {
    const m1 = 250, c1 = 0.129, T1 = 100
    const c2 = 4.184, T2 = 22
    const Tf = 23.5
    const m_cold = parseFloat((-(m1*c1*(Tf-T1)) / (c2*(Tf-T2))).toFixed(0))
    return {
      description: 'find mass of water',
      question: `A 250 g gold sample at 100 °C is added to water at 22.0 °C. When equilibrium is reached, the temperature is 23.5 °C. What was the mass of the water?`,
      given: [
        { label: 'm_Au',    value: '250 g'          },
        { label: 'c_Au',    value: '0.129 J/(g·°C)' },
        { label: 'T_Au',    value: '100 °C'         },
        { label: 'c_H₂O',   value: '4.184 J/(g·°C)' },
        { label: 'T_H₂O',   value: '22.0 °C'        },
        { label: 'T_final', value: '23.5 °C'        },
      ],
      solveFor: 'm_water', answer: m_cold, answerUnit: 'g',
      solutionSteps: buildStepsMCold(m1, c1, T1, 'gold', c2, T2, 'water', Tf, m_cold),
    }
  })(),

  // P9: 200 g Al at 80°C → 300 g H₂O at 15°C  →  Tf ≈ 23.1°C
  (() => {
    const m1 = 200, c1 = 0.897, T1 = 80
    const m2 = 300, c2 = 4.184, T2 = 15
    const Tf = parseFloat(((m1*c1*T1 + m2*c2*T2) / (m1*c1 + m2*c2)).toFixed(1))
    return {
      description: 'large aluminum piece in water',
      question: `A 200 g aluminum block at 80.0 °C is transferred to 300 g of water at 15.0 °C in a thermally insulated vessel. Determine the final temperature.`,
      given: [
        { label: 'm_Al',  value: '200 g'          },
        { label: 'c_Al',  value: '0.897 J/(g·°C)' },
        { label: 'T_Al',  value: '80.0 °C'        },
        { label: 'm_H₂O', value: '300 g'          },
        { label: 'c_H₂O', value: '4.184 J/(g·°C)' },
        { label: 'T_H₂O', value: '15.0 °C'        },
      ],
      solveFor: 'T_final', answer: Tf, answerUnit: '°C',
      solutionSteps: buildStepsTf(m1, c1, T1, 'aluminum', m2, c2, T2, 'water', Tf),
    }
  })(),

  // P10: 120 g Cu at 150°C → 400 g ethanol at 10°C  →  Tf ≈ 16.3°C
  (() => {
    const m1 = 120, c1 = 0.385, T1 = 150
    const m2 = 400, c2 = 2.44,  T2 = 10
    const Tf = parseFloat(((m1*c1*T1 + m2*c2*T2) / (m1*c1 + m2*c2)).toFixed(1))
    return {
      description: 'copper in ethanol',
      question: `A 120 g copper rod at 150 °C is placed into 400 g of ethanol at 10.0 °C. Find the final equilibrium temperature (c_ethanol = 2.44 J/(g·°C)).`,
      given: [
        { label: 'm_Cu',     value: '120 g'          },
        { label: 'c_Cu',     value: '0.385 J/(g·°C)' },
        { label: 'T_Cu',     value: '150 °C'         },
        { label: 'm_EtOH',   value: '400 g'          },
        { label: 'c_EtOH',   value: '2.44 J/(g·°C)'  },
        { label: 'T_EtOH',   value: '10.0 °C'        },
      ],
      solveFor: 'T_final', answer: Tf, answerUnit: '°C',
      solutionSteps: buildStepsTf(m1, c1, T1, 'copper', m2, c2, T2, 'ethanol', Tf),
    }
  })(),
]

// ── Public API ────────────────────────────────────────────────────────────────

export function genHeatTransferProblem(): HeatTransferProblem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

export function checkHeatTransferAnswer(problem: HeatTransferProblem, input: string): boolean {
  const val = parseFloat(input)
  if (isNaN(val)) return false
  const { answer } = problem
  if (answer === 0) return Math.abs(val) < 0.5
  return Math.abs((val - answer) / answer) <= 0.02 || Math.abs(val - answer) <= 0.5
}

export { PROBLEMS as HEAT_TRANSFER_PROBLEMS }
