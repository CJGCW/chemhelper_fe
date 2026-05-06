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
})
