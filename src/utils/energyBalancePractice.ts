import {
  solvePartialMelting, solveEvaporativeCooling,
  type PartialMeltingSolution, type EvaporativeCoolingSolution,
} from '../chem/thermo'

export interface PartialMeltingProblem {
  inputs: {
    iceMass:        number   // g
    iceStartTemp:   number   // °C
    warmMass:       number   // g
    warmStartTemp:  number   // °C
  }
  scenario: string
  solution: PartialMeltingSolution
}

export interface EvaporativeCoolingProblem {
  inputs: {
    heatInputKJ:        number   // kJ (user-facing unit)
    bodyMass:           number   // g
    bodyTemp:           number   // °C
    heatOfVaporization: number   // J/g
  }
  scenario: string
  solution: EvaporativeCoolingSolution
}

const SCENARIOS = [
  (warmMass: number, warmTemp: number, iceMass: number) =>
    `A ${warmMass} g beverage at ${warmTemp}°C is poured into an insulated cup containing ${iceMass} g of ice at 0°C. ` +
    `Assume the beverage has the same specific heat as water (c = 4.184 J/g·°C) and ΔH\u2093\u1d64\u209b = 334 J/g.`,
  (warmMass: number, warmTemp: number, iceMass: number) =>
    `An insulated thermos contains ${iceMass} g of ice at 0°C. You pour in ${warmMass} g of water at ${warmTemp}°C. ` +
    `Use c = 4.184 J/g·°C and ΔH\u2093\u1d64\u209b = 334 J/g.`,
  (warmMass: number, warmTemp: number, iceMass: number) =>
    `${warmMass} g of coffee at ${warmTemp}°C is mixed with ${iceMass} g of ice cubes (0°C) in an insulated container. ` +
    `Treat the coffee as water: c = 4.184 J/g·°C, ΔH\u2093\u1d64\u209b = 334 J/g.`,
]

export function generatePartialMeltingProblem(): PartialMeltingProblem {
  for (let attempt = 0; attempt < 300; attempt++) {
    const iceMass       = 50  + Math.floor(Math.random() * 151)    // 50–200 g
    const warmMass      = 200 + Math.floor(Math.random() * 301)    // 200–500 g
    const warmStartTemp = 15  + Math.floor(Math.random() * 26)     // 15–40 °C
    const iceStartTemp  = 0

    const sol = solvePartialMelting({ iceMass, iceStartTemp, warmMass, warmStartTemp })
    if (sol.allIceMelts) continue
    const meltFraction = sol.massIceMelted / iceMass
    if (meltFraction < 0.30 || meltFraction > 0.90) continue

    const template = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]
    return {
      inputs: { iceMass, iceStartTemp, warmMass, warmStartTemp },
      scenario: template(warmMass, warmStartTemp, iceMass),
      solution: sol,
    }
  }

  // Guaranteed fallback — Chang 6.126 shape (partial melt, ~104 g of 150 g melts)
  const iceMass = 150, warmMass = 361, warmStartTemp = 23, iceStartTemp = 0
  return {
    inputs: { iceMass, iceStartTemp, warmMass, warmStartTemp },
    scenario: SCENARIOS[0](warmMass, warmStartTemp, iceMass),
    solution: solvePartialMelting({ iceMass, iceStartTemp, warmMass, warmStartTemp }),
  }
}

export function generateEvaporativeCoolingProblem(): EvaporativeCoolingProblem {
  const heatInputKJ        = 5000 + Math.floor(Math.random() * 10001)  // 5000–15000 kJ
  const bodyMass           = 50000 + Math.floor(Math.random() * 30001) // 50–80 kg (in g)
  const bodyTemp           = 36 + Math.floor(Math.random() * 3)        // 36–38 °C
  const heatOfVaporization = 2410                                       // J/g at body temp (Chang Table 6.1)

  const sol = solveEvaporativeCooling({
    heatInputJ: heatInputKJ * 1000,
    bodyMass,
    bodyTemp,
    heatOfVaporization,
  })

  const scenario =
    `A person generates ${heatInputKJ.toLocaleString()} kJ of metabolic heat. ` +
    `Assuming all of this heat is dissipated by evaporating sweat, how many grams of water must evaporate? ` +
    `Use ΔH\u1d65\u2090\u209a = ${heatOfVaporization} J/g (water at body temperature).`

  return {
    inputs: { heatInputKJ, bodyMass, bodyTemp, heatOfVaporization },
    scenario,
    solution: sol,
  }
}
