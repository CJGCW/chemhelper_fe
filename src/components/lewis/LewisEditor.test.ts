import { describe, it, expect } from 'vitest'
import { distributeElectrons, totalElectrons } from './LewisEditor'
import type { ElectronSlots } from './EditorAtomNode'

// ── distributeElectrons ───────────────────────────────────────────────────────

describe('distributeElectrons', () => {
  it('returns all zeros for 0 electrons', () => {
    expect(distributeElectrons(0)).toEqual([0, 0, 0, 0])
  })

  it('places 1 electron in first slot', () => {
    expect(distributeElectrons(1)).toEqual([1, 0, 0, 0])
  })

  it('fills first slot before moving to second', () => {
    expect(distributeElectrons(2)).toEqual([2, 0, 0, 0])
    expect(distributeElectrons(3)).toEqual([2, 1, 0, 0])
  })

  it('fills all 4 slots with 8 electrons (max)', () => {
    expect(distributeElectrons(8)).toEqual([2, 2, 2, 2])
  })

  it('caps at 8 electrons even when given more', () => {
    expect(distributeElectrons(10)).toEqual([2, 2, 2, 2])
  })

  it('handles carbon — 4 valence electrons → half-filled lone pair slots', () => {
    // Carbon has 4 valence e−; distributeElectrons(4) used for lone electrons
    expect(distributeElectrons(4)).toEqual([2, 2, 0, 0])
  })

  it('handles nitrogen — 5 valence electrons', () => {
    expect(distributeElectrons(5)).toEqual([2, 2, 1, 0])
  })

  it('handles oxygen — 6 valence electrons', () => {
    expect(distributeElectrons(6)).toEqual([2, 2, 2, 0])
  })

  it('handles chlorine — 7 valence electrons', () => {
    expect(distributeElectrons(7)).toEqual([2, 2, 2, 1])
  })

  // Lone pairs (electrons not used in bonds): oxygen with 2 lone pairs = 4 electrons
  it('models oxygen lone pairs (4 lone electrons)', () => {
    expect(distributeElectrons(4)).toEqual([2, 2, 0, 0])
  })
})

// ── totalElectrons ────────────────────────────────────────────────────────────

describe('totalElectrons', () => {
  it('returns 0 for empty slots', () => {
    const slots: ElectronSlots = [0, 0, 0, 0]
    expect(totalElectrons(slots)).toBe(0)
  })

  it('sums all four slots', () => {
    const slots: ElectronSlots = [2, 1, 2, 1]
    expect(totalElectrons(slots)).toBe(6)
  })

  it('returns 8 for a fully filled octet', () => {
    const slots: ElectronSlots = [2, 2, 2, 2]
    expect(totalElectrons(slots)).toBe(8)
  })

  it('handles a single electron in one slot', () => {
    const slots: ElectronSlots = [1, 0, 0, 0]
    expect(totalElectrons(slots)).toBe(1)
  })

  it('matches the output of distributeElectrons round-trip', () => {
    for (const n of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
      const slots = distributeElectrons(n)
      const total = totalElectrons(slots)
      expect(total).toBe(Math.min(n, 8))
    }
  })
})

// ── Formal charge formula ─────────────────────────────────────────────────────
// FC = valence − totalElectrons(slots) − bondOrderSum
// These tests verify the formula used in recomputeFormalCharges and
// EditorBondEdge without needing React Flow context.

describe('formal charge calculation (inline)', () => {
  const VALENCE: Record<string, number> = {
    H: 1, C: 4, N: 5, O: 6, F: 7, Cl: 7, S: 6, P: 5, B: 3,
  }

  function fc(element: string, slots: ElectronSlots, bondOrderSum: number): number {
    return (VALENCE[element] ?? 4) - totalElectrons(slots) - bondOrderSum
  }

  it('neutral water oxygen: 6 − 4(lone) − 2(bonds) = 0', () => {
    // O in H2O: 2 lone pairs (4 electrons), 2 single bonds
    const slots = distributeElectrons(4) // [2,2,0,0]
    expect(fc('O', slots, 2)).toBe(0)
  })

  it('neutral carbon in CH4: 4 − 0(lone) − 4(bonds) = 0', () => {
    const slots: ElectronSlots = [0, 0, 0, 0]
    expect(fc('C', slots, 4)).toBe(0)
  })

  it('neutral nitrogen in NH3: 5 − 2(lone pair) − 3(bonds) = 0', () => {
    const slots: ElectronSlots = [2, 0, 0, 0]
    expect(fc('N', slots, 3)).toBe(0)
  })

  it('neutral chlorine: 7 − 6(3 lone pairs) − 1(bond) = 0', () => {
    const slots = distributeElectrons(6) // [2,2,2,0]
    expect(fc('Cl', slots, 1)).toBe(0)
  })

  it('oxide ion O2−: 6 − 8(4 lone pairs) − 0(bonds) = −2', () => {
    const slots: ElectronSlots = [2, 2, 2, 2]
    expect(fc('O', slots, 0)).toBe(-2)
  })

  it('ammonium N+: 5 − 0(lone) − 4(bonds) = +1', () => {
    const slots: ElectronSlots = [0, 0, 0, 0]
    expect(fc('N', slots, 4)).toBe(1)
  })

  it('hydroxide O−: 6 − 6(3 lone pairs) − 1(bond) = −1', () => {
    const slots: ElectronSlots = [2, 2, 2, 0]
    expect(fc('O', slots, 1)).toBe(-1)
  })
})
