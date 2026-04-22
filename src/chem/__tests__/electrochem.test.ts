import { describe, it, expect } from 'vitest'
import { calcEcell, calcNernstE, calcDeltaGFromEcell } from '../electrochem'

describe('calcEcell', () => {
  it('E°cell = E°cathode − E°anode', () => {
    expect(calcEcell(+0.337, -0.763)).toBeCloseTo(1.100, 3)
  })
})

describe('calcNernstE', () => {
  it('E = E° − (0.05916/n)·log₁₀Q at Q=1 gives E = E°', () => {
    expect(calcNernstE(1.1, 2, 1)).toBeCloseTo(1.1, 5)
  })
  it('E at Q=100, n=2: reduction by (0.05916/2)×2 = 0.05916', () => {
    const E = calcNernstE(1.1, 2, 100)
    expect(E).toBeCloseTo(1.1 - (0.05916 / 2) * 2, 5)
  })
})

describe('calcDeltaGFromEcell', () => {
  it('ΔG° = −nFE° in kJ/mol: n=2, E°=1.1V → −nFE° = −212.3 kJ/mol', () => {
    const dG = calcDeltaGFromEcell(2, 1.1)
    expect(dG).toBeCloseTo(-(2 * 96485 * 1.1) / 1000, 1)
  })
  it('positive E° gives negative ΔG° (spontaneous)', () => {
    expect(calcDeltaGFromEcell(2, 1.1)).toBeLessThan(0)
  })
})
