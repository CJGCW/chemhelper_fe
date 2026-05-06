import { describe, it, expect, vi } from 'vitest'
import { ALL_REACTIONS } from './index'
import { validateAllReactions } from './validate'

describe('mechanism validator', () => {
  it('emits zero warnings across all reactions', () => {
    const warnings: string[] = []
    const spy = vi.spyOn(console, 'warn').mockImplementation((msg) => {
      warnings.push(String(msg))
    })
    validateAllReactions(ALL_REACTIONS)
    spy.mockRestore()
    expect(warnings).toEqual([])
  })

  it('every reaction has reactantSpecies with at least one species', () => {
    for (const r of ALL_REACTIONS) {
      expect(r.reactantSpecies, `${r.id} missing reactantSpecies`).toBeDefined()
      expect(r.reactantSpecies!.species.length, `${r.id} reactantSpecies empty`).toBeGreaterThan(0)
    }
  })

  it('every reaction has productSpecies with at least one species', () => {
    for (const r of ALL_REACTIONS) {
      expect(r.productSpecies, `${r.id} missing productSpecies`).toBeDefined()
      expect(r.productSpecies!.species.length, `${r.id} productSpecies empty`).toBeGreaterThan(0)
    }
  })

  it('every reaction has conditionSpecies defined', () => {
    for (const r of ALL_REACTIONS) {
      expect(r.conditionSpecies, `${r.id} missing conditionSpecies`).toBeDefined()
    }
  })
})
