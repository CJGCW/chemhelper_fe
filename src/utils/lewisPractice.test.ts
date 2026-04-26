import { describe, it, expect } from 'vitest'
import { checkLewisProblem, checkVseprProblem } from './lewisPractice'
import type { LewisProblem, VseprProblem } from './lewisPractice'

// Note: generateLewisProblem / generateVseprProblem require a live backend API and
// are not tested here. Tests cover the synchronous checkLewisProblem / checkVseprProblem
// functions which contain all the answer-matching logic.

function makeLewisProblem(answer: string, isText: boolean): LewisProblem {
  return { compound: 'test', question: '', answer, answerUnit: '', isTextAnswer: isText, steps: [] }
}

function makeVseprProblem(answer: string, isText: boolean): VseprProblem {
  return { compound: 'test', question: '', answer, answerUnit: '', isTextAnswer: isText, steps: [] }
}

describe('checkLewisProblem — numeric', () => {
  it('correct numeric answer passes', () => {
    const p = makeLewisProblem('8', false)
    expect(checkLewisProblem('8', p)).toBe(true)
  })

  it('H₂O total valence electrons = 8', () => {
    const p = makeLewisProblem('8', false)
    expect(checkLewisProblem('8', p)).toBe(true)
    expect(checkLewisProblem('6', p)).toBe(false)
  })

  it('CO₂ total valence electrons = 16', () => {
    const p = makeLewisProblem('16', false)
    expect(checkLewisProblem('16', p)).toBe(true)
    expect(checkLewisProblem('14', p)).toBe(false)
  })

  it('rejects empty string', () => {
    const p = makeLewisProblem('8', false)
    expect(checkLewisProblem('', p)).toBe(false)
  })

  it('accepts within 1% tolerance for numeric answers', () => {
    const p = makeLewisProblem('100', false)
    expect(checkLewisProblem('100.9', p)).toBe(true)
    expect(checkLewisProblem('101.1', p)).toBe(false)
  })
})

describe('checkLewisProblem — text geometry', () => {
  it('exact match', () => {
    const p = makeLewisProblem('Bent', true)
    expect(checkLewisProblem('Bent', p)).toBe(true)
    expect(checkLewisProblem('bent', p)).toBe(true) // case-insensitive
  })

  it('alias: vshape/vshaped/angular → bent', () => {
    const p = makeLewisProblem('Bent', true)
    // normalizeText strips underscores and spaces but not hyphens
    expect(checkLewisProblem('vshape', p)).toBe(true)
    expect(checkLewisProblem('vshaped', p)).toBe(true)
    expect(checkLewisProblem('angular', p)).toBe(true)
  })

  it('alias: diatomic → linear', () => {
    const p = makeLewisProblem('Linear', true)
    expect(checkLewisProblem('diatomic', p)).toBe(true)
    expect(checkLewisProblem('linear', p)).toBe(true)
  })

  it('wrong geometry fails', () => {
    const p = makeLewisProblem('Tetrahedral', true)
    expect(checkLewisProblem('Bent', p)).toBe(false)
    expect(checkLewisProblem('Linear', p)).toBe(false)
  })

  it('ignores spaces and underscores', () => {
    const p = makeLewisProblem('Trigonal Planar', true)
    expect(checkLewisProblem('trigonal_planar', p)).toBe(true)
    expect(checkLewisProblem('trigonalplanar', p)).toBe(true)
  })
})

describe('checkVseprProblem', () => {
  it('hybridization: sp3 matches sp3', () => {
    const p = makeVseprProblem('sp³', true)
    expect(checkVseprProblem('sp3', p)).toBe(true) // superscript stripped
    expect(checkVseprProblem('sp³', p)).toBe(true)
    expect(checkVseprProblem('sp2', p)).toBe(false)
  })

  it('electron count: bonding pairs exact match', () => {
    const p = makeVseprProblem('4', false)
    expect(checkVseprProblem('4', p)).toBe(true)
    expect(checkVseprProblem('3', p)).toBe(false)
  })

  it('rejects empty input', () => {
    const p = makeVseprProblem('Tetrahedral', true)
    expect(checkVseprProblem('', p)).toBe(false)
  })
})
