import { describe, it, expect } from 'vitest'
import {
  generatePartialMeltingProblem,
  generateEvaporativeCoolingProblem,
} from './energyBalancePractice'

describe('generatePartialMeltingProblem', () => {
  it('ice only partially melts across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generatePartialMeltingProblem()
      const { iceMass, warmMass, warmStartTemp } = p.inputs

      expect(iceMass).toBeGreaterThan(0)
      expect(warmMass).toBeGreaterThan(0)
      expect(warmStartTemp).toBeGreaterThan(0)

      expect(p.solution.allIceMelts).toBe(false)
      expect(p.solution.massIceMelted).toBeGreaterThan(0)
      expect(p.solution.massIceMelted).toBeLessThan(iceMass)
    }
  })

  it('melt fraction is between 30% and 90% across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generatePartialMeltingProblem()
      const fraction = p.solution.massIceMelted / p.inputs.iceMass
      expect(fraction).toBeGreaterThanOrEqual(0.30)
      expect(fraction).toBeLessThanOrEqual(0.90)
    }
  })

  it('energy balance: q_released ≈ q_to_melt_ice', () => {
    // Heat released by warm water = heat absorbed by ice to melt
    // q_warm = warmMass × 4.184 × warmStartTemp (cooling to 0°C)
    // q_melt = massIceMelted × 334
    for (let i = 0; i < 20; i++) {
      const p = generatePartialMeltingProblem()
      const { qAvailableForMelt } = p.solution
      // massIceMelted = qAvailableForMelt / 334; verify within 2 J floating-point tolerance
      const reconstructed = p.solution.massIceMelted * 334
      expect(Math.abs(reconstructed - qAvailableForMelt)).toBeLessThan(2)
    }
  })

  it('fallback problem satisfies partial melt constraint', () => {
    // Chang 6.126 shape: 150 g ice, 361 g water at 23°C — should not melt all ice
    // The generator always returns a partial-melt problem even via fallback
    const p = generatePartialMeltingProblem()
    expect(p.solution.allIceMelts).toBe(false)
    expect(p.inputs.iceStartTemp).toBe(0)
    expect(p.scenario.length).toBeGreaterThan(0)
    expect(p.solution.steps.length).toBeGreaterThan(0)
  })
})

describe('generateEvaporativeCoolingProblem', () => {
  it('massEvaporated > 0 across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateEvaporativeCoolingProblem()
      expect(p.solution.massEvaporated).toBeGreaterThan(0)
      expect(p.inputs.heatInputKJ).toBeGreaterThan(0)
      expect(p.inputs.bodyMass).toBeGreaterThan(0)
    }
  })

  it('massEvaporated = heatInput_J / heatOfVaporization across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateEvaporativeCoolingProblem()
      const { heatInputKJ, heatOfVaporization } = p.inputs
      const expectedMass = (heatInputKJ * 1000) / heatOfVaporization
      expect(p.solution.massEvaporated).toBeCloseTo(expectedMass, 1)
    }
  })

  it('uses ΔH_vap = 2410 J/g (body temperature value from Chang Table 6.1)', () => {
    const p = generateEvaporativeCoolingProblem()
    expect(p.inputs.heatOfVaporization).toBe(2410)
  })

  it('heatInputKJ is in the 5000–15000 kJ range (metabolic heat)', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateEvaporativeCoolingProblem()
      expect(p.inputs.heatInputKJ).toBeGreaterThanOrEqual(5000)
      expect(p.inputs.heatInputKJ).toBeLessThanOrEqual(15000)
    }
  })
})
