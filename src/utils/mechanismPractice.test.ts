import { describe, it, expect } from 'vitest'
import { generateMechanismProblem, checkMechanismAnswer } from './mechanismPractice'
import { REACTIONS_BY_ID } from '../data/mechanismData'

describe('generateMechanismProblem', () => {

  it('produces structurally valid problems across 25 runs', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateMechanismProblem()
      expect(p.scenario.length).toBeGreaterThan(0)
      expect(p.question.length).toBeGreaterThan(0)
      expect(p.choices.length).toBeGreaterThanOrEqual(2)
      expect(p.answer.length).toBeGreaterThan(0)
      expect(p.steps.length).toBeGreaterThan(0)
      expect(p.explanation.length).toBeGreaterThan(0)
    }
  })

  it('answer is always present in choices', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateMechanismProblem()
      expect(p.choices).toContain(p.answer)
    }
  })

  it('choices are unique within each problem', () => {
    for (let i = 0; i < 25; i++) {
      const p = generateMechanismProblem()
      const unique = new Set(p.choices)
      expect(unique.size).toBe(p.choices.length)
    }
  })

  it('classify-mechanism problems reference valid reactions with correct abbr', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateMechanismProblem()
      if (p.type === 'classify-mechanism') {
        const r = REACTIONS_BY_ID[p.reactionId]
        expect(r).toBeDefined()
        expect(p.answer).toBe(r.abbr)
        expect(p.choices).toContain(r.abbr)
      }
    }
  })

  it('predict-stereo problems have matching stereo outcomes', () => {
    const EXPECTED: Record<string, string> = {
      'sn2':               'Complete inversion of configuration',
      'sn1':               'Racemization (mixture of both enantiomers)',
      'e2':                'Anti-periplanar elimination; predominantly trans (E) alkene',
      'e1':                'Non-stereospecific; mixture of cis/trans alkenes',
      'hx-addition':       'Racemization at the new stereocenter',
      'acid-hydration':    'Racemization at the new stereocenter',
      'alkene-halogenation': 'Anti addition — two halogens on opposite faces',
      'hydroboration':     'Syn addition — H and OH delivered to the same face',
      'epoxidation':       'Syn addition — O inserts from one face; alkene geometry preserved',
    }
    for (let i = 0; i < 50; i++) {
      const p = generateMechanismProblem()
      if (p.type === 'predict-stereo') {
        const expected = EXPECTED[p.reactionId]
        expect(expected).toBeDefined()
        expect(p.answer).toBe(expected)
        expect(p.choices).toContain(expected)
      }
    }
  })

  it('no NaN or undefined in scenario, question, or steps', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateMechanismProblem()
      expect(p.scenario).not.toMatch(/NaN|undefined/)
      expect(p.question).not.toMatch(/NaN|undefined/)
      p.steps.forEach(s => {
        expect(s.length).toBeGreaterThan(0)
        expect(s).not.toMatch(/NaN|undefined/)
      })
    }
  })

  it('hardcoded SN2 classify problem matches expected data', () => {
    let found = null
    for (let i = 0; i < 150; i++) {
      const p = generateMechanismProblem()
      if (p.reactionId === 'sn2' && p.type === 'classify-mechanism') { found = p; break }
    }
    expect(found).not.toBeNull()
    if (!found) return
    expect(found.answer).toBe('SN2')
    expect(found.choices).toContain('SN2')
    expect(found.scenario).toContain('1°R-X')
    expect(found.steps.length).toBeGreaterThan(0)
    expect(found.steps[0]).toContain('SN2')
  })

  it('hardcoded alkene halogenation stereo problem matches expected data', () => {
    let found = null
    for (let i = 0; i < 150; i++) {
      const p = generateMechanismProblem()
      if (p.reactionId === 'alkene-halogenation' && p.type === 'predict-stereo') { found = p; break }
    }
    expect(found).not.toBeNull()
    if (!found) return
    expect(found.answer).toBe('Anti addition — two halogens on opposite faces')
    expect(found.choices).toContain('Anti addition — two halogens on opposite faces')
  })

  it('checkMechanismAnswer returns true for correct, false for wrong', () => {
    for (let i = 0; i < 20; i++) {
      const p = generateMechanismProblem()
      expect(checkMechanismAnswer(p, p.answer)).toBe(true)
      const wrong = p.choices.find(c => c !== p.answer)
      if (wrong) expect(checkMechanismAnswer(p, wrong)).toBe(false)
    }
  })

  it('produces both question types over many runs', () => {
    const types = new Set<string>()
    for (let i = 0; i < 100; i++) {
      types.add(generateMechanismProblem().type)
    }
    expect(types.has('classify-mechanism')).toBe(true)
    expect(types.has('predict-stereo')).toBe(true)
  })

})
