import { describe, it, expect } from 'vitest'
import {
  calcDeltaS,
  calcDeltaG_method1,
  calcDeltaG_method2,
  deltaGtoK,
  kToDeltaG,
  deltaGNonStandard,
  spontaneityAnalysis,
  predictDeltaSSign,
} from '../thermodynamics'

// ── calcDeltaS ─────────────────────────────────────────────────────────────────

describe('calcDeltaS', () => {
  it('Chang Ex 17.4: CaCO₃(s) → CaO(s) + CO₂(g)', () => {
    // ΔS° = [39.8 + 213.6] - [92.9] = 160.5 J/(mol·K)
    const r = calcDeltaS(
      [{ formula: 'CaO', state: 's', coefficient: 1 }, { formula: 'CO₂', state: 'g', coefficient: 1 }],
      [{ formula: 'CaCO₃', state: 's', coefficient: 1 }],
    )
    expect(r.deltaS).toBeCloseTo(160.5, 0)
  })

  it('H₂(g) + ½O₂(g) → H₂O(l): ΔS° should be negative (gas → liquid)', () => {
    // ΔS° = 69.9 - [130.7 + 0.5×205.0] = 69.9 - 233.2 = -163.3
    const r = calcDeltaS(
      [{ formula: 'H₂O', state: 'l', coefficient: 1 }],
      [{ formula: 'H₂', state: 'g', coefficient: 1 }, { formula: 'O₂', state: 'g', coefficient: 0.5 }],
    )
    expect(r.deltaS).toBeCloseTo(-163.3, 0)
    expect(r.deltaS).toBeLessThan(0)
  })

  it('N₂(g) + 3H₂(g) → 2NH₃(g)', () => {
    // ΔS° = 2×192.3 - [191.5 + 3×130.7] = 384.6 - [191.5 + 392.1] = 384.6 - 583.6 = -199.0
    const r = calcDeltaS(
      [{ formula: 'NH₃', state: 'g', coefficient: 2 }],
      [{ formula: 'N₂', state: 'g', coefficient: 1 }, { formula: 'H₂', state: 'g', coefficient: 3 }],
    )
    expect(r.deltaS).toBeCloseTo(-199.0, 0)
  })

  it('returns step-by-step strings', () => {
    const r = calcDeltaS(
      [{ formula: 'CO₂', state: 'g', coefficient: 1 }],
      [{ formula: 'C', state: 's', coefficient: 1 }, { formula: 'O₂', state: 'g', coefficient: 1 }],
    )
    expect(r.steps.length).toBeGreaterThan(3)
    expect(r.steps.some(s => s.includes('ΔS°rxn'))).toBe(true)
  })

  it('throws for unknown species', () => {
    expect(() => calcDeltaS(
      [{ formula: 'UnknownMolecule', state: 'g', coefficient: 1 }],
      [],
    )).toThrow()
  })
})

// ── calcDeltaG_method1 ────────────────────────────────────────────────────────

describe('calcDeltaG_method1', () => {
  it('ΔH=-100kJ, ΔS=-50 J/K, T=298 → ΔG = -100 - 298×(-0.050) = -85.1 kJ', () => {
    const r = calcDeltaG_method1(-100, -50, 298)
    expect(r.deltaG).toBeCloseTo(-85.1, 1)
  })

  it('unit conversion: ΔS in J/K converted to kJ/K in formula', () => {
    const r = calcDeltaG_method1(0, 1000, 100)
    // ΔG = 0 - 100 × (1000/1000) = -100 kJ
    expect(r.deltaG).toBeCloseTo(-100, 3)
    expect(r.steps.some(s => s.includes('/1000'))).toBe(true)
  })

  it('ΔH>0, ΔS>0, high T → ΔG < 0', () => {
    // ΔG = 100 - 1000×(200/1000) = 100 - 200 = -100 kJ
    const r = calcDeltaG_method1(100, 200, 1000)
    expect(r.deltaG).toBeCloseTo(-100, 3)
  })

  it('ΔH<0, ΔS<0, high T → ΔG > 0 (non-spontaneous)', () => {
    // ΔG = -50 - 1000×(-200/1000) = -50 + 200 = +150 kJ
    const r = calcDeltaG_method1(-50, -200, 1000)
    expect(r.deltaG).toBeCloseTo(150, 3)
  })

  it('returns steps with unit conversion note', () => {
    const r = calcDeltaG_method1(-285.8, -163.3, 298)
    expect(r.steps.some(s => s.includes('J/(mol·K)'))).toBe(true)
    expect(r.steps.some(s => s.includes('kJ/mol'))).toBe(true)
  })
})

// ── calcDeltaG_method2 ────────────────────────────────────────────────────────

describe('calcDeltaG_method2', () => {
  it('C(graphite) + O₂(g) → CO₂(g): ΔG° from formation values', () => {
    // ΔG° = -394.4 - [0 + 0] = -394.4 kJ/mol
    const r = calcDeltaG_method2(
      [{ formula: 'CO₂', state: 'g', coefficient: 1 }],
      [{ formula: 'C', state: 's', coefficient: 1 }, { formula: 'O₂', state: 'g', coefficient: 1 }],
    )
    expect(r.deltaG).toBeCloseTo(-394.4, 1)
  })

  it('2H₂(g) + O₂(g) → 2H₂O(l)', () => {
    // ΔG° = 2×(-237.1) - 0 = -474.2 kJ/mol
    const r = calcDeltaG_method2(
      [{ formula: 'H₂O', state: 'l', coefficient: 2 }],
      [{ formula: 'H₂', state: 'g', coefficient: 2 }, { formula: 'O₂', state: 'g', coefficient: 1 }],
    )
    expect(r.deltaG).toBeCloseTo(-474.2, 1)
  })

  it('throws for unknown species', () => {
    expect(() => calcDeltaG_method2(
      [{ formula: 'XYZ', state: 'g', coefficient: 1 }],
      [],
    )).toThrow()
  })
})

// ── deltaGtoK ─────────────────────────────────────────────────────────────────

describe('deltaGtoK', () => {
  it('ΔG°=0 → K=1', () => {
    const r = deltaGtoK(0, 298)
    expect(r.K).toBeCloseTo(1, 6)
  })

  it('ΔG°≈-5.705 kJ/mol at 298 K → K≈10', () => {
    // ΔG° = -RT ln K → K = exp(5705 / (8.314 × 298)) = exp(2.3026) = 10
    const r = deltaGtoK(-5.705, 298)
    expect(r.K).toBeCloseTo(10, 0)
  })

  it('ΔG° large negative → K >> 1', () => {
    const r = deltaGtoK(-50, 298)
    expect(r.K).toBeGreaterThan(1e8)
  })

  it('ΔG° large positive → K << 1', () => {
    const r = deltaGtoK(50, 298)
    expect(r.K).toBeLessThan(1e-8)
  })

  it('returns steps', () => {
    const r = deltaGtoK(-10, 298)
    expect(r.steps.length).toBeGreaterThan(2)
  })
})

// ── kToDeltaG ─────────────────────────────────────────────────────────────────

describe('kToDeltaG', () => {
  it('K=1 → ΔG°=0', () => {
    const r = kToDeltaG(1, 298)
    expect(r.deltaG).toBeCloseTo(0, 6)
  })

  it('K=10 at 298 K → ΔG° ≈ -5.705 kJ/mol', () => {
    const r = kToDeltaG(10, 298)
    expect(r.deltaG).toBeCloseTo(-5.705, 0)
  })

  it('K>>1 → ΔG° < 0 (product-favored)', () => {
    const r = kToDeltaG(1e6, 298)
    expect(r.deltaG).toBeLessThan(0)
  })

  it('K<<1 → ΔG° > 0 (reactant-favored)', () => {
    const r = kToDeltaG(1e-6, 298)
    expect(r.deltaG).toBeGreaterThan(0)
  })

  it('round-trips with deltaGtoK', () => {
    const deltaG_in = -20
    const { K } = deltaGtoK(deltaG_in, 500)
    const { deltaG } = kToDeltaG(K, 500)
    expect(deltaG).toBeCloseTo(deltaG_in, 4)
  })
})

// ── deltaGNonStandard ─────────────────────────────────────────────────────────

describe('deltaGNonStandard', () => {
  it('Q=K → ΔG=0 regardless of ΔG°', () => {
    // When Q=K, system is at equilibrium, ΔG=0
    const { K } = deltaGtoK(-20, 298)
    const r = deltaGNonStandard(-20, K, 298)
    expect(r.deltaG).toBeCloseTo(0, 3)
  })

  it('Q < K → ΔG < 0 (reaction proceeds forward)', () => {
    const r = deltaGNonStandard(-10, 0.001, 298)
    // ΔG° < 0 and Q very small → strongly forward
    expect(r.deltaG).toBeLessThan(0)
  })

  it('Q=1 at T=298 K: ΔG = ΔG° + 0', () => {
    const r = deltaGNonStandard(-10, 1, 298)
    // ln(1) = 0 → ΔG = ΔG°
    expect(r.deltaG).toBeCloseTo(-10, 3)
  })
})

// ── spontaneityAnalysis ───────────────────────────────────────────────────────

describe('spontaneityAnalysis', () => {
  it('ΔH<0, ΔS>0 → always spontaneous, no crossover T', () => {
    const r = spontaneityAnalysis(-100, 200)
    expect(r.classification).toBe('always')
    expect(r.crossoverT).toBeUndefined()
  })

  it('ΔH>0, ΔS<0 → never spontaneous', () => {
    const r = spontaneityAnalysis(100, -200)
    expect(r.classification).toBe('never')
    expect(r.crossoverT).toBeUndefined()
  })

  it('ΔH>0, ΔS>0 → high-T, crossover T = ΔH/ΔS', () => {
    const r = spontaneityAnalysis(100, 200)
    expect(r.classification).toBe('high-T')
    // crossover T = (100 × 1000) / 200 = 500 K
    expect(r.crossoverT).toBeCloseTo(500, 0)
  })

  it('ΔH<0, ΔS<0 → low-T case', () => {
    const r = spontaneityAnalysis(-100, -200)
    expect(r.classification).toBe('low-T')
    // crossover T = (-100000) / (-200) = 500 K
    expect(r.crossoverT).toBeCloseTo(500, 0)
  })

  it('crossover T matches ΔG=0 point', () => {
    const deltaH = 80
    const deltaS = 150
    const { crossoverT } = spontaneityAnalysis(deltaH, deltaS)
    expect(crossoverT).toBeDefined()
    // At crossover T, ΔG should equal 0
    const { deltaG } = calcDeltaG_method1(deltaH, deltaS, crossoverT!)
    expect(deltaG).toBeCloseTo(0, 3)
  })

  it('returns non-empty explanation and steps', () => {
    const r = spontaneityAnalysis(-50, 100)
    expect(r.explanation.length).toBeGreaterThan(10)
    expect(r.steps.length).toBeGreaterThan(1)
  })
})

// ── predictDeltaSSign ─────────────────────────────────────────────────────────

describe('predictDeltaSSign', () => {
  it('CaCO₃ → CaO + CO₂: Δn(gas)=+1 → positive', () => {
    const r = predictDeltaSSign(
      [{ formula: 'CaO', state: 's', coefficient: 1 }, { formula: 'CO₂', state: 'g', coefficient: 1 }],
      [{ formula: 'CaCO₃', state: 's', coefficient: 1 }],
    )
    expect(r.prediction).toBe('positive')
  })

  it('N₂ + 3H₂ → 2NH₃: Δn(gas)=-2 → negative', () => {
    const r = predictDeltaSSign(
      [{ formula: 'NH₃', state: 'g', coefficient: 2 }],
      [{ formula: 'N₂', state: 'g', coefficient: 1 }, { formula: 'H₂', state: 'g', coefficient: 3 }],
    )
    expect(r.prediction).toBe('negative')
  })
})
