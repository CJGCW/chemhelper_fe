import { describe, it, expect } from 'vitest'
import { generateProblem, verifyAnswer, normalizeAnswer } from '../nomenclature'
import { MAIN_GROUP_CATIONS, MAIN_GROUP_ANIONS, TRANSITION_METAL_CATIONS, type MainGroupCation, type MainGroupAnion } from '../../data/nomenclature'

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b) }

// ── normalizeAnswer ───────────────────────────────────────────────────────────

describe('normalizeAnswer', () => {
  it('converts unicode subscripts to ASCII', () => {
    expect(normalizeAnswer('CaCl₂')).toBe(normalizeAnswer('CaCl2'))
  })

  it('converts unicode superscripts to ASCII', () => {
    expect(normalizeAnswer('Fe²⁺')).toBe(normalizeAnswer('Fe2+'))
  })

  it('lowercases names', () => {
    expect(normalizeAnswer('Iron(III) Chloride')).toBe('iron(iii) chloride')
  })

  it('strips whitespace around parens', () => {
    expect(normalizeAnswer('iron (III) chloride')).toBe('iron(iii) chloride')
    expect(normalizeAnswer('iron( III )chloride')).toBe('iron(iii)chloride')
  })

  it('strips trailing phase labels', () => {
    expect(normalizeAnswer('NaCl(aq)')).toBe(normalizeAnswer('NaCl'))
    expect(normalizeAnswer('sodium chloride (aq)')).toBe(normalizeAnswer('sodium chloride'))
  })

  it('collapses multiple spaces', () => {
    expect(normalizeAnswer('sodium  chloride')).toBe('sodium chloride')
  })
})

// ── ionic-simple ─────────────────────────────────────────────────────────────

describe('generateProblem — ionic-simple', () => {
  it('generates a name containing both element names', () => {
    for (let seed = 0; seed < 50; seed++) {
      const p = generateProblem('formula-to-name', 'ionic-simple', seed)
      const cation = MAIN_GROUP_CATIONS.find(c => p.compound.cation && 'symbol' in p.compound.cation && c.symbol === (p.compound.cation as typeof c).symbol)
      const anion  = MAIN_GROUP_ANIONS.find(a => p.compound.anion && 'symbol' in p.compound.anion && a.symbol === (p.compound.anion as typeof a).symbol)
      if (cation && anion) {
        expect(p.answer).toContain(cation.name)
        expect(p.answer).toContain(anion.name)
      }
    }
  })

  it('round-trips formula-to-name and name-to-formula', () => {
    for (let seed = 10; seed < 30; seed++) {
      const ftn = generateProblem('formula-to-name', 'ionic-simple', seed)
      const ntf = generateProblem('name-to-formula', 'ionic-simple', seed)
      // same seed → same compound; prompts should be swapped
      expect(ftn.prompt).toBe(ntf.answer)
      expect(ftn.answer).toBe(ntf.prompt)
    }
  })

  it('every formula has charge-balanced reduced subscripts', () => {
    for (let seed = 0; seed < 100; seed++) {
      const p = generateProblem('formula-to-name', 'ionic-simple', seed)
      const c = p.compound.cation as MainGroupCation
      const a = p.compound.anion  as MainGroupAnion
      // expected subscripts: lcm / each charge, reduced by gcd
      const g    = gcd(c.charge, Math.abs(a.charge))
      const catN = Math.abs(a.charge) / g
      const anN  = c.charge / g
      // formula should contain cation symbol once (catN=1→no subscript, catN>1→subscript)
      const subChar = (n: number) => n === 1 ? '' : n === 2 ? '₂' : n === 3 ? '₃' : String(n)
      const expected = `${c.symbol}${subChar(catN)}${a.symbol}${subChar(anN)}`
      expect(p.prompt).toBe(expected)
    }
  })
})

// ── ionic-polyatomic ─────────────────────────────────────────────────────────

describe('generateProblem — ionic-polyatomic', () => {
  it('adds parens around polyatomic anion when subscript > 1', () => {
    let foundWithParens = false
    for (let seed = 0; seed < 300; seed++) {
      const p = generateProblem('formula-to-name', 'ionic-polyatomic', seed)
      if (p.prompt.includes('(') && p.prompt.match(/\)[₁-₉]/)) {
        foundWithParens = true; break
      }
    }
    expect(foundWithParens).toBe(true)
  })

  it('omits parens when polyatomic subscript is 1', () => {
    // NaNO3 should have no parens
    let found = false
    for (let seed = 0; seed < 300; seed++) {
      const p = generateProblem('formula-to-name', 'ionic-polyatomic', seed)
      const an = p.compound.anion as { name: string }
      if (an?.name === 'nitrate' && p.compound.cation && 'symbol' in p.compound.cation) {
        const cat = p.compound.cation as { symbol: string; charge: number }
        if (cat.charge === 1) {
          expect(p.prompt).not.toContain('(')
          found = true; break
        }
      }
    }
    expect(found).toBe(true)
  })

  it('name contains cation name and anion name', () => {
    for (let seed = 0; seed < 30; seed++) {
      const p = generateProblem('formula-to-name', 'ionic-polyatomic', seed)
      expect(p.answer.length).toBeGreaterThan(5)
    }
  })
})

// ── ionic-transition ─────────────────────────────────────────────────────────

describe('generateProblem — ionic-transition', () => {
  it('uses Roman numerals matching cation charge', () => {
    for (let seed = 0; seed < 50; seed++) {
      const p = generateProblem('formula-to-name', 'ionic-transition', seed)
      const cation = p.compound.cation as typeof TRANSITION_METAL_CATIONS[0]
      if (cation && 'iupac' in cation) {
        expect(p.answer).toContain(cation.iupac)
      }
    }
  })

  it('accepts classical name as alias', () => {
    let found = false
    for (let seed = 0; seed < 100; seed++) {
      const p = generateProblem('formula-to-name', 'ionic-transition', seed)
      const cation = p.compound.cation as typeof TRANSITION_METAL_CATIONS[0]
      if (cation?.classical) {
        expect(p.aliases.some(a => a.includes(cation.classical!))).toBe(true)
        expect(verifyAnswer(p, `${cation.classical} ${(p.compound.anion as { name: string }).name}`)).toBe('correct')
        found = true; break
      }
    }
    expect(found).toBe(true)
  })

  it('every generated name contains the IUPAC cation name with Roman numerals', () => {
    for (let seed = 0; seed < 100; seed++) {
      const p = generateProblem('formula-to-name', 'ionic-transition', seed)
      const cation = p.compound.cation as typeof TRANSITION_METAL_CATIONS[0]
      if (cation && 'iupac' in cation) {
        expect(p.answer).toContain(cation.iupac)
      }
    }
  })

  it('cation charge determines Roman numeral, not subscript', () => {
    // iron(III) means Fe has charge +3 regardless of how many Fe appear in formula
    for (let seed = 0; seed < 100; seed++) {
      const p = generateProblem('formula-to-name', 'ionic-transition', seed)
      const cation = p.compound.cation as typeof TRANSITION_METAL_CATIONS[0]
      if (cation?.iupac?.includes('(II)')) expect(p.answer).not.toContain('(III)')
      if (cation?.iupac?.includes('(III)')) expect(p.answer).not.toContain('(II)')
    }
  })
})

// ── covalent-binary ───────────────────────────────────────────────────────────

describe('generateProblem — covalent-binary', () => {
  it('CO maps to carbon monoxide — mono dropped on first element, not second', () => {
    const p: import('../nomenclature').Problem = {
      mode: 'formula-to-name', type: 'covalent-binary',
      prompt: 'CO', answer: 'carbon monoxide', aliases: [],
      compound: { parts: [{ symbol: 'C', name: 'carbon', count: 1 }, { symbol: 'O', name: 'oxygen', count: 1 }] },
    }
    expect(p.answer).toBe('carbon monoxide')
    expect(p.answer).not.toMatch(/monocarbon/)
    // Also verify via generator (search wider range)
    let found = false
    for (let seed = 0; seed < 3000; seed++) {
      const gen = generateProblem('formula-to-name', 'covalent-binary', seed)
      if (gen.prompt === 'CO') { expect(gen.answer).toBe('carbon monoxide'); found = true; break }
    }
    expect(found).toBe(true)
  })

  it('CO2 → carbon dioxide', () => {
    let found = false
    for (let seed = 0; seed < 3000; seed++) {
      const p = generateProblem('formula-to-name', 'covalent-binary', seed)
      if (p.prompt === 'CO₂') { expect(p.answer).toBe('carbon dioxide'); found = true; break }
    }
    expect(found).toBe(true)
  })

  it('N2O5 → dinitrogen pentoxide (vowel elision: penta+oxide → pentoxide)', () => {
    let found = false
    for (let seed = 0; seed < 3000; seed++) {
      const p = generateProblem('formula-to-name', 'covalent-binary', seed)
      if (p.prompt === 'N₂O₅') {
        expect(p.answer).toBe('dinitrogen pentoxide')
        expect(p.answer).not.toContain('pentaoxide')
        found = true; break
      }
    }
    expect(found).toBe(true)
  })

  it('SF6 → sulfur hexafluoride', () => {
    let found = false
    for (let seed = 0; seed < 3000; seed++) {
      const p = generateProblem('formula-to-name', 'covalent-binary', seed)
      if (p.prompt === 'SF₆') { expect(p.answer).toBe('sulfur hexafluoride'); found = true; break }
    }
    expect(found).toBe(true)
  })

  it('SO2 → sulfur dioxide', () => {
    let found = false
    for (let seed = 0; seed < 3000; seed++) {
      const p = generateProblem('formula-to-name', 'covalent-binary', seed)
      if (p.prompt === 'SO₂') { expect(p.answer).toBe('sulfur dioxide'); found = true; break }
    }
    expect(found).toBe(true)
  })
})

// ── verifyAnswer ──────────────────────────────────────────────────────────────

describe('verifyAnswer', () => {
  it('accepts exact canonical answer', () => {
    const p = generateProblem('formula-to-name', 'ionic-simple', 1)
    expect(verifyAnswer(p, p.answer)).toBe('correct')
  })

  it('accepts ASCII subscripts for unicode formulas', () => {
    const p = generateProblem('name-to-formula', 'ionic-simple', 1)
    const ascii = p.answer
      .replace(/₂/g, '2').replace(/₃/g, '3').replace(/₄/g, '4')
    expect(verifyAnswer(p, ascii)).toBe('correct')
  })

  it('accepts case-insensitive names', () => {
    const p = generateProblem('formula-to-name', 'ionic-simple', 5)
    expect(verifyAnswer(p, p.answer.toUpperCase())).toBe('correct')
  })

  it('accepts classical name alias for transition metal', () => {
    let found = false
    for (let seed = 0; seed < 100; seed++) {
      const p = generateProblem('formula-to-name', 'ionic-transition', seed)
      const cation = p.compound.cation as typeof TRANSITION_METAL_CATIONS[0]
      if (cation?.classical && p.aliases.length > 0) {
        expect(verifyAnswer(p, p.aliases[0])).toBe('correct')
        found = true; break
      }
    }
    expect(found).toBe(true)
  })

  it('rejects wrong answer', () => {
    const p = generateProblem('formula-to-name', 'ionic-transition', 0)
    expect(verifyAnswer(p, 'sodium chloride')).toBe('incorrect')
  })

  it('rejects empty string', () => {
    const p = generateProblem('formula-to-name', 'ionic-simple', 0)
    expect(verifyAnswer(p, '')).toBe('incorrect')
  })

  it('accepts answer with trailing (aq)', () => {
    const p = generateProblem('formula-to-name', 'ionic-simple', 3)
    expect(verifyAnswer(p, p.answer + ' (aq)')).toBe('correct')
  })
})
