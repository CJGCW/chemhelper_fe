import { describe, it, expect } from 'vitest'
import { computeFormalCharge, expectedFormalCharges } from '../formalCharge'
import { FORMAL_CHARGE_EXERCISES } from '../../data/formalChargeExercises'

// ── computeFormalCharge unit tests ─────────────────────────────────────────────

describe('computeFormalCharge', () => {

  // N in NH₃ — FC = 5 − 2 − 3 = 0
  it('N in NH₃ → FC = 0', () => {
    const atom = { id: 'N1', element: 'N', lonePairs: 1 }
    const bonds = [
      { from: 'N1', to: 'H1', order: 1 },
      { from: 'N1', to: 'H2', order: 1 },
      { from: 'N1', to: 'H3', order: 1 },
    ]
    expect(computeFormalCharge(atom, bonds)).toBe(0)
  })

  // N in NH₄⁺ — FC = 5 − 0 − 4 = +1
  it('N in NH₄⁺ → FC = +1', () => {
    const atom = { id: 'N1', element: 'N', lonePairs: 0 }
    const bonds = [
      { from: 'N1', to: 'H1', order: 1 },
      { from: 'N1', to: 'H2', order: 1 },
      { from: 'N1', to: 'H3', order: 1 },
      { from: 'N1', to: 'H4', order: 1 },
    ]
    expect(computeFormalCharge(atom, bonds)).toBe(1)
  })

  // O in OH⁻ — FC = 6 − 6 − 1 = -1
  it('O in OH⁻ → FC = -1', () => {
    const atom = { id: 'O1', element: 'O', lonePairs: 3 }
    const bonds = [{ from: 'O1', to: 'H1', order: 1 }]
    expect(computeFormalCharge(atom, bonds)).toBe(-1)
  })

  // Central O in O₃ — FC = 6 − 2 − (2+1) = +1
  it('central O in O₃ → FC = +1', () => {
    const atom = { id: 'O2', element: 'O', lonePairs: 1 }
    const bonds = [
      { from: 'O1', to: 'O2', order: 2 },
      { from: 'O2', to: 'O3', order: 1 },
    ]
    expect(computeFormalCharge(atom, bonds)).toBe(1)
  })

  // Terminal O= in O₃ — FC = 6 − 4 − 2 = 0
  it('terminal double-bond O in O₃ → FC = 0', () => {
    const atom = { id: 'O1', element: 'O', lonePairs: 2 }
    const bonds = [{ from: 'O1', to: 'O2', order: 2 }]
    expect(computeFormalCharge(atom, bonds)).toBe(0)
  })

  // Terminal O— in O₃ — FC = 6 − 6 − 1 = -1
  it('terminal single-bond O in O₃ → FC = -1', () => {
    const atom = { id: 'O3', element: 'O', lonePairs: 3 }
    const bonds = [{ from: 'O2', to: 'O3', order: 1 }]
    expect(computeFormalCharge(atom, bonds)).toBe(-1)
  })

  // C in CO₂ — FC = 4 − 0 − (2+2) = 0
  it('C in CO₂ → FC = 0', () => {
    const atom = { id: 'C1', element: 'C', lonePairs: 0 }
    const bonds = [
      { from: 'C1', to: 'O1', order: 2 },
      { from: 'C1', to: 'O2', order: 2 },
    ]
    expect(computeFormalCharge(atom, bonds)).toBe(0)
  })

  // S in SO₄²⁻ central atom — FC = 6 − 0 − (2+2+1+1) = 0 (expanded octet)
  it('S in SO₄²⁻ (2 double + 2 single bonds, 0 LP) → FC = 0', () => {
    const atom = { id: 'S1', element: 'S', lonePairs: 0 }
    const bonds = [
      { from: 'S1', to: 'O1', order: 2 },
      { from: 'S1', to: 'O2', order: 2 },
      { from: 'S1', to: 'O3', order: 1 },
      { from: 'S1', to: 'O4', order: 1 },
    ]
    expect(computeFormalCharge(atom, bonds)).toBe(0)
  })

})

// ── expectedFormalCharges ──────────────────────────────────────────────────────

describe('expectedFormalCharges', () => {
  it('builds a record keyed by atom id', () => {
    const atoms = [
      { id: 'N1', formal_charge: 1 },
      { id: 'H1', formal_charge: 0 },
    ]
    const map = expectedFormalCharges(atoms)
    expect(map['N1']).toBe(1)
    expect(map['H1']).toBe(0)
  })
})

// ── All 22 exercises: FCs sum to molecular charge ────────────────────────────

describe('FORMAL_CHARGE_EXERCISES — FC sum equals molecular charge', () => {
  for (const ex of FORMAL_CHARGE_EXERCISES) {
    it(`${ex.id}: sum of formal_charges === ${ex.structure.charge}`, () => {
      const sum = ex.structure.atoms.reduce((acc, a) => acc + a.formal_charge, 0)
      expect(sum).toBe(ex.structure.charge)
    })
  }
})

// ── All 22 exercises: computeFormalCharge agrees with stored formal_charge ─────

describe('FORMAL_CHARGE_EXERCISES — computeFormalCharge matches stored FC', () => {
  for (const ex of FORMAL_CHARGE_EXERCISES) {
    it(`${ex.id}: computed FC matches stored for all atoms`, () => {
      for (const atom of ex.structure.atoms) {
        const computed = computeFormalCharge(
          { id: atom.id, element: atom.element, lonePairs: atom.lone_pairs },
          ex.structure.bonds,
        )
        expect(computed).toBe(atom.formal_charge)
      }
    })
  }
})
