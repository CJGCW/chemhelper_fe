import { describe, it, expect } from 'vitest'
import {
  CHAIR_POOL,        generateChairProblem,
  NEWMAN_POOL,       generateNewmanProblem,
  HYBRIDIZATION_POOL, generateHybridizationProblem,
  AROMATICITY_POOL,  generateAromaticityProblem,
  RS_POOL,           generateRSProblem,
  EZ_POOL,           generateEZProblem,
  STEREO_POOL,       generateStereoisomerProblem,
  CONFORMATIONAL_POOL, generateConformationalProblem,
  CURVED_ARROW_POOL, generateCurvedArrowProblem,
  POLYMERIZATION_POOL, generatePolymerizationProblem,
  CONJUGATED_DIENE_POOL, generateConjugatedDieneProblem,
  FORMAL_CHARGE_POOL, generateFormalChargeProblem,
  RESONANCE_POOL,    generateResonanceProblem,
  MOST_ACIDIC_H_POOL, generateMostAcidicHProblem,
  RETRO_POOL,        generateRetroProblem,
  SYNTHESIS_ORDER_POOL, generateSynthesisOrderProblem,
  AMINO_ACID_PI_POOL, generateAminoAcidPIProblem,
  generateAminoAcidNameFromStructure,
  generateAminoAcidClass,
  generateAminoAcidNameAsOrgText,
  generateAminoAcidClassAsOrgText,
  checkAminoAcidNameAnswer,
  generateIRProblem,
  generateNMRProblem,
  generateMSProblem,
} from './organicTestGenerators'
import type { OrgTextProblem } from './organicTestGenerators'
import { AMINO_ACIDS } from '../data/aminoAcids'

// ── Shared helpers ────────────────────────────────────────────────────────────

function assertProblemShape(p: OrgTextProblem) {
  expect(p.question).toBeTruthy()
  expect(p.answer).toBeTruthy()
  expect(p.options).toBeInstanceOf(Array)
  expect(p.options.length).toBeGreaterThanOrEqual(2)
  expect(p.explanation).toBeTruthy()
}

function assertAnswerInOptions(p: OrgTextProblem) {
  expect(p.options).toContain(p.answer)
}

function assertUniqueOptions(p: OrgTextProblem) {
  const unique = new Set(p.options)
  expect(unique.size).toBe(p.options.length)
}

function poolSuite(
  name: string,
  pool: OrgTextProblem[],
  generate: () => OrgTextProblem,
  minSize = 4,
) {
  describe(name, () => {
    // ── Pool-level invariants ─────────────────────────────────────────────────
    describe(`${name} — pool integrity`, () => {
      it('every entry has required fields', () => {
        for (const p of pool) assertProblemShape(p)
      })
      it('every entry has answer in its options', () => {
        for (const p of pool) assertAnswerInOptions(p)
      })
      it('options are unique within each entry', () => {
        for (const p of pool) assertUniqueOptions(p)
      })
      it(`pool has at least ${minSize} problems`, () => {
        expect(pool.length).toBeGreaterThanOrEqual(minSize)
      })
    })

    // ── Generator output ──────────────────────────────────────────────────────
    describe(`${name} — generator`, () => {
      it('returns a problem with required fields', () => {
        assertProblemShape(generate())
      })
      it('answer is always one of the options (30 runs)', () => {
        for (let i = 0; i < 30; i++) assertAnswerInOptions(generate())
      })
      it('options are unique (30 runs)', () => {
        for (let i = 0; i < 30; i++) assertUniqueOptions(generate())
      })
      it('covers multiple distinct problems over many runs', () => {
        const seen = new Set<string>()
        for (let i = 0; i < 200; i++) seen.add(generate().question)
        expect(seen.size).toBeGreaterThan(1)
      })
    })
  })
}

// ── Structural / conformational ───────────────────────────────────────────────

poolSuite('CHAIR_POOL / generateChairProblem', CHAIR_POOL, generateChairProblem)
poolSuite('NEWMAN_POOL / generateNewmanProblem', NEWMAN_POOL, generateNewmanProblem)
poolSuite('CONFORMATIONAL_POOL / generateConformationalProblem', CONFORMATIONAL_POOL, generateConformationalProblem)

// ── Electronic / bonding ──────────────────────────────────────────────────────

poolSuite('HYBRIDIZATION_POOL / generateHybridizationProblem', HYBRIDIZATION_POOL, generateHybridizationProblem)
poolSuite('AROMATICITY_POOL / generateAromaticityProblem', AROMATICITY_POOL, generateAromaticityProblem)
poolSuite('FORMAL_CHARGE_POOL / generateFormalChargeProblem', FORMAL_CHARGE_POOL, generateFormalChargeProblem)
poolSuite('RESONANCE_POOL / generateResonanceProblem', RESONANCE_POOL, generateResonanceProblem)
poolSuite('CURVED_ARROW_POOL / generateCurvedArrowProblem', CURVED_ARROW_POOL, generateCurvedArrowProblem)

// ── Stereochemistry ───────────────────────────────────────────────────────────

poolSuite('RS_POOL / generateRSProblem', RS_POOL, generateRSProblem)
poolSuite('EZ_POOL / generateEZProblem', EZ_POOL, generateEZProblem)
poolSuite('STEREO_POOL / generateStereoisomerProblem', STEREO_POOL, generateStereoisomerProblem)

// ── Organic reactivity ────────────────────────────────────────────────────────

poolSuite('CONJUGATED_DIENE_POOL / generateConjugatedDieneProblem', CONJUGATED_DIENE_POOL, generateConjugatedDieneProblem)
poolSuite('POLYMERIZATION_POOL / generatePolymerizationProblem', POLYMERIZATION_POOL, generatePolymerizationProblem)
poolSuite('MOST_ACIDIC_H_POOL / generateMostAcidicHProblem', MOST_ACIDIC_H_POOL, generateMostAcidicHProblem)
poolSuite('RETRO_POOL / generateRetroProblem', RETRO_POOL, generateRetroProblem)
poolSuite('SYNTHESIS_ORDER_POOL / generateSynthesisOrderProblem', SYNTHESIS_ORDER_POOL, generateSynthesisOrderProblem)

// ── Biomolecules ──────────────────────────────────────────────────────────────

poolSuite('AMINO_ACID_PI_POOL / generateAminoAcidPIProblem', AMINO_ACID_PI_POOL, generateAminoAcidPIProblem)

describe('generateAminoAcidNameFromStructure', () => {

  it('returns required fields', () => {
    const p = generateAminoAcidNameFromStructure()
    expect(p.type).toBe('amino-acid-name-from-structure')
    expect(p.prompt).toBeTruthy()
    expect(p.visualType).toBe('compound-display')
    expect(p.smiles).toBeTruthy()
    expect(p.answer.name).toBeTruthy()
    expect(p.answer.three).toHaveLength(3)
    expect(p.answer.one).toHaveLength(1)
    expect(p.answerFormat).toBe('text')
  })

  it('smiles matches fullSmiles for picked amino acid (100 runs)', () => {
    for (let i = 0; i < 100; i++) {
      const p = generateAminoAcidNameFromStructure()
      const aa = AMINO_ACIDS.find(a => a.name === p.answer.name)
      expect(aa).toBeDefined()
      expect(p.smiles).toBe(aa!.fullSmiles)
    }
  })

  it('covers a reasonable spread over 100 runs', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 100; i++) seen.add(generateAminoAcidNameFromStructure().answer.name)
    expect(seen.size).toBeGreaterThan(5)
  })

  it('no amino acid dominates (frequency < 3× expected across 100 runs)', () => {
    const counts: Record<string, number> = {}
    for (let i = 0; i < 100; i++) {
      const name = generateAminoAcidNameFromStructure().answer.name
      counts[name] = (counts[name] ?? 0) + 1
    }
    const expectedPerAA = 100 / 20
    for (const count of Object.values(counts)) {
      expect(count).toBeLessThan(expectedPerAA * 3)
    }
  })
})

describe('generateAminoAcidClass', () => {
  const VALID_CLASSES = ['nonpolar', 'aromatic', 'polar', 'acidic', 'basic']

  it('returns required fields', () => {
    const p = generateAminoAcidClass()
    expect(p.type).toBe('amino-acid-class')
    expect(p.visualType).toBe('compound-display')
    expect(p.smiles).toBeTruthy()
    expect(VALID_CLASSES).toContain(p.answer)
    expect(p.answerFormat).toBe('multiple-choice')
    expect(p.options).toEqual(VALID_CLASSES)
  })

  it('answer is always one of the five valid classes (100 runs)', () => {
    for (let i = 0; i < 100; i++) {
      const p = generateAminoAcidClass()
      expect(VALID_CLASSES).toContain(p.answer)
    }
  })

  it('smiles matches fullSmiles for picked amino acid (100 runs)', () => {
    for (let i = 0; i < 100; i++) {
      const p = generateAminoAcidClass()
      const aa = AMINO_ACIDS.find(a => a.fullSmiles === p.smiles)
      expect(aa).toBeDefined()
      expect(aa!.class).toBe(p.answer)
    }
  })

  it('covers a reasonable spread over 100 runs', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 100; i++) seen.add(generateAminoAcidClass().smiles)
    expect(seen.size).toBeGreaterThan(5)
  })
})

describe('generateAminoAcidNameAsOrgText', () => {
  it('returns OrgTextProblem shape', () => {
    const p = generateAminoAcidNameAsOrgText()
    expect(p.question).toBeTruthy()
    expect(p.answer).toBeTruthy()
    expect(p.options).toBeInstanceOf(Array)
    expect(p.options.length).toBeGreaterThanOrEqual(2)
    expect(p.options).toContain(p.answer)
    expect(p.explanation).toBeTruthy()
  })
  it('options are unique (30 runs)', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateAminoAcidNameAsOrgText()
      expect(new Set(p.options).size).toBe(p.options.length)
    }
  })
})

describe('generateAminoAcidClassAsOrgText', () => {
  it('returns OrgTextProblem shape', () => {
    const p = generateAminoAcidClassAsOrgText()
    expect(p.question).toBeTruthy()
    expect(p.answer).toBeTruthy()
    expect(p.options).toBeInstanceOf(Array)
    expect(p.options.length).toBeGreaterThanOrEqual(2)
    expect(p.options).toContain(p.answer)
    expect(p.explanation).toBeTruthy()
  })
  it('answer is always in options (30 runs)', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateAminoAcidClassAsOrgText()
      expect(p.options).toContain(p.answer)
    }
  })
})

describe('checkAminoAcidNameAnswer', () => {
  const answer = { name: 'Alanine', three: 'Ala', one: 'A' }

  it('accepts full name (case-insensitive)', () => {
    expect(checkAminoAcidNameAnswer('alanine', answer)).toBe(true)
    expect(checkAminoAcidNameAnswer('Alanine', answer)).toBe(true)
    expect(checkAminoAcidNameAnswer('ALANINE', answer)).toBe(true)
  })
  it('accepts 3-letter code (case-insensitive)', () => {
    expect(checkAminoAcidNameAnswer('ala', answer)).toBe(true)
    expect(checkAminoAcidNameAnswer('Ala', answer)).toBe(true)
  })
  it('accepts 1-letter code (case-sensitive)', () => {
    expect(checkAminoAcidNameAnswer('A', answer)).toBe(true)
  })
  it('rejects wrong answers', () => {
    expect(checkAminoAcidNameAnswer('Glycine', answer)).toBe(false)
    expect(checkAminoAcidNameAnswer('Gly', answer)).toBe(false)
    expect(checkAminoAcidNameAnswer('a', answer)).toBe(false)
  })
  it('rejects whitespace-only input', () => {
    expect(checkAminoAcidNameAnswer('   ', answer)).toBe(false)
  })
})

// ── Spectroscopy — generator output + visual payload ─────────────────────────

describe('generateIRProblem', () => {
  it('returns required fields', () => assertProblemShape(generateIRProblem()))
  it('answer is in options (30 runs)', () => {
    for (let i = 0; i < 30; i++) assertAnswerInOptions(generateIRProblem())
  })
  it('options are unique (30 runs)', () => {
    for (let i = 0; i < 30; i++) assertUniqueOptions(generateIRProblem())
  })
  it('attaches a spectrum visual payload', () => {
    const p = generateIRProblem()
    expect(p.visual).toBeDefined()
    expect(p.visual?.kind).toBe('spectrum')
    expect(p.visual?.spectrumType).toBe('ir')
    expect(p.visual?.peaks).toBeInstanceOf(Array)
    expect(p.visual!.peaks.length).toBeGreaterThan(0)
  })
  it('each IR peak has x > 0 and a label (30 runs)', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateIRProblem()
      for (const peak of p.visual!.peaks) {
        expect(peak.x).toBeGreaterThan(0)
        expect(peak.label).toBeTruthy()
      }
    }
  })
})

describe('generateNMRProblem', () => {
  it('returns required fields', () => assertProblemShape(generateNMRProblem()))
  it('answer is in options (30 runs)', () => {
    for (let i = 0; i < 30; i++) assertAnswerInOptions(generateNMRProblem())
  })
  it('options are unique (30 runs)', () => {
    for (let i = 0; i < 30; i++) assertUniqueOptions(generateNMRProblem())
  })
  it('attaches a 1H NMR spectrum visual payload', () => {
    const p = generateNMRProblem()
    expect(p.visual).toBeDefined()
    expect(p.visual?.kind).toBe('spectrum')
    expect(p.visual?.spectrumType).toBe('1h_nmr')
    expect(p.visual?.peaks).toBeInstanceOf(Array)
    expect(p.visual!.peaks.length).toBeGreaterThan(0)
  })
  it('each NMR peak has a finite x and a label (30 runs)', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateNMRProblem()
      for (const peak of p.visual!.peaks) {
        expect(Number.isFinite(peak.x)).toBe(true)
        expect(peak.label).toBeTruthy()
      }
    }
  })
})

describe('generateMSProblem', () => {
  it('returns required fields', () => assertProblemShape(generateMSProblem()))
  it('answer is in options (30 runs)', () => {
    for (let i = 0; i < 30; i++) assertAnswerInOptions(generateMSProblem())
  })
  it('options are unique (30 runs)', () => {
    for (let i = 0; i < 30; i++) assertUniqueOptions(generateMSProblem())
  })
  it('attaches a mass-spec spectrum visual payload', () => {
    const p = generateMSProblem()
    expect(p.visual).toBeDefined()
    expect(p.visual?.kind).toBe('spectrum')
    expect(p.visual?.spectrumType).toBe('mass_spec')
    expect(p.visual?.peaks).toBeInstanceOf(Array)
    expect(p.visual!.peaks.length).toBeGreaterThan(0)
  })
  it('each MS peak has x > 0 and a label (30 runs)', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateMSProblem()
      for (const peak of p.visual!.peaks) {
        expect(peak.x).toBeGreaterThan(0)
        expect(peak.label).toBeTruthy()
      }
    }
  })
})
