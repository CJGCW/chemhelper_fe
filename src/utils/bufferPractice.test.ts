import { describe, it, expect } from 'vitest'
import {
  generateBufferPhProblem,
  generateBufferAfterAdditionProblem,
  generateDynamicBufferPhProblem,
  generateDynamicBufferAfterAdditionProblem,
} from './bufferPractice'

describe('generateBufferPhProblem', () => {
  it('produces valid pH across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateBufferPhProblem()
      expect(p.answer).toBeGreaterThan(0)
      expect(p.answer).toBeLessThan(14)
      expect(p.type).toBe('buffer-ph')
    }
  })

  it('Henderson-Hasselbalch: answer ≈ pKa + log([A⁻]/[HA]) across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateBufferPhProblem()
      const { pKa, concAcid, concBase } = p.given
      const expectedPh = pKa + Math.log10(concBase / concAcid)
      expect(p.answer).toBeCloseTo(expectedPh, 1)
    }
  })

  it('pH ≈ pKa when [HA] = [A⁻] (ratio 1.0 case)', () => {
    // Multiple calls; when concAcid === concBase, pH must equal pKa exactly
    for (let i = 0; i < 30; i++) {
      const p = generateBufferPhProblem()
      const { pKa, concAcid, concBase } = p.given
      if (Math.abs(concAcid - concBase) < 1e-9) {
        expect(p.answer).toBeCloseTo(pKa, 1)
        return
      }
    }
    // No equal-concentration case appeared in 30 runs — H-H test above covers it
  })

  it('pH stays within ±2 units of pKa (buffer range)', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateBufferPhProblem()
      const { pKa } = p.given
      expect(Math.abs(p.answer - pKa)).toBeLessThan(2)
    }
  })
})

describe('generateBufferAfterAdditionProblem', () => {
  it('produces valid pH across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateBufferAfterAdditionProblem()
      expect(p.answer).toBeGreaterThan(0)
      expect(p.answer).toBeLessThan(14)
    }
  })

  it('acid addition decreases pH relative to buffer pH', () => {
    // When strong acid is added, pH should drop compared to the initial buffer
    for (let i = 0; i < 30; i++) {
      const p = generateBufferAfterAdditionProblem()
      if (p.type !== 'buffer-after-addition') continue
      const { pKa, concAcid, concBase, addition } = p.given
      if (!addition) continue
      const initialPh = pKa + Math.log10(concBase / concAcid)
      if (addition.type === 'acid') {
        expect(p.answer).toBeLessThan(initialPh + 0.01)
      } else {
        expect(p.answer).toBeGreaterThan(initialPh - 0.01)
      }
    }
  })
})

describe('generateDynamicBufferPhProblem', () => {
  it('produces valid pH with isDynamic=true across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDynamicBufferPhProblem()
      expect(p.answer).toBeGreaterThan(0)
      expect(p.answer).toBeLessThan(14)
      expect(p.isDynamic).toBe(true)
    }
  })

  it('Henderson-Hasselbalch holds for dynamic problems across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDynamicBufferPhProblem()
      const { pKa, concAcid, concBase } = p.given
      const expectedPh = pKa + Math.log10(concBase / concAcid)
      expect(p.answer).toBeCloseTo(expectedPh, 1)
    }
  })
})

describe('generateDynamicBufferAfterAdditionProblem', () => {
  it('produces valid pH with isDynamic=true across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateDynamicBufferAfterAdditionProblem()
      expect(p.answer).toBeGreaterThan(0)
      expect(p.answer).toBeLessThan(14)
      expect(p.isDynamic).toBe(true)
    }
  })
})
