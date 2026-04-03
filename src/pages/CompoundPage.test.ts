import { describe, it, expect } from 'vitest'
import { detectInputType } from './CompoundPage'

// ── detectInputType ───────────────────────────────────────────────────────────

describe('detectInputType', () => {
  // CID — plain integers
  it('detects integer as cid', () => {
    expect(detectInputType('962')).toBe('cid')
    expect(detectInputType('5234')).toBe('cid')
  })

  // InChI
  it('detects InChI= prefix as inchi', () => {
    expect(detectInputType('InChI=1S/H2O/h1H2')).toBe('inchi')
  })
  it('detects uppercase INCHI= prefix as inchi', () => {
    expect(detectInputType('INCHI=1S/H2O/h1H2')).toBe('inchi')
  })

  // InChIKey
  it('detects 27-char InChIKey pattern', () => {
    expect(detectInputType('XLYOFNOQVPJJNP-UHFFFAOYSA-N')).toBe('inchikey') // water
    expect(detectInputType('LFQSCWFLJHTTHZ-UHFFFAOYSA-N')).toBe('inchikey') // ethanol
    expect(detectInputType('RYYVLZVUVIJVGH-UHFFFAOYSA-N')).toBe('inchikey') // caffeine
  })

  // SMILES with special characters
  it('detects = as smiles', () => {
    expect(detectInputType('O=C=O')).toBe('smiles')
    expect(detectInputType('CC(=O)O')).toBe('smiles')
  })
  it('detects # as smiles', () => {
    expect(detectInputType('C#N')).toBe('smiles')
  })
  it('detects [ as smiles', () => {
    expect(detectInputType('[Na+].[Cl-]')).toBe('smiles')
  })
  it('detects / as smiles', () => {
    expect(detectInputType('C/C=C/C')).toBe('smiles')
  })
  it('detects ( with lowercase aromatic atom as smiles', () => {
    expect(detectInputType('c1(O)ccccc1')).toBe('smiles')
  })

  // Plain organic SMILES — no special chars, only SMILES atom letters
  it('detects CCO (ethanol SMILES) as smiles', () => {
    expect(detectInputType('CCO')).toBe('smiles')
  })
  it('detects CC (ethane SMILES) as smiles', () => {
    expect(detectInputType('CC')).toBe('smiles')
  })
  it('detects C (methane SMILES) as smiles', () => {
    expect(detectInputType('C')).toBe('smiles')
  })
  it('detects N (ammonia SMILES) as smiles', () => {
    expect(detectInputType('N')).toBe('smiles')
  })
  it('detects O (water SMILES) as smiles', () => {
    expect(detectInputType('O')).toBe('smiles')
  })
  it('detects CCCl as smiles', () => {
    expect(detectInputType('CCCl')).toBe('smiles')
  })
  it('detects CBr as smiles', () => {
    expect(detectInputType('CBr')).toBe('smiles')
  })

  // Aromatic SMILES with ring closure digits
  it('detects c1ccccc1 (benzene) as smiles', () => {
    expect(detectInputType('c1ccccc1')).toBe('smiles')
  })
  it('detects c1ccncc1 (pyridine) as smiles', () => {
    expect(detectInputType('c1ccncc1')).toBe('smiles')
  })

  // Names
  it('detects common name as name', () => {
    expect(detectInputType('water')).toBe('name')
    expect(detectInputType('ethanol')).toBe('name')
    expect(detectInputType('caffeine')).toBe('name')
    expect(detectInputType('acetic acid')).toBe('name')
  })

  // Molecular formulas with digits → name
  it('detects formula with digits as name', () => {
    expect(detectInputType('H2O')).toBe('name')
    expect(detectInputType('C6H12O6')).toBe('name')
    expect(detectInputType('CH4')).toBe('name')
    expect(detectInputType('CO2')).toBe('name')
  })

  // 2-letter element formulas — 'a' in NaCl is not an organic SMILES char
  it('detects NaCl as name (not smiles)', () => {
    expect(detectInputType('NaCl')).toBe('name')
  })

  // Edge cases
  it('returns name for empty string', () => {
    expect(detectInputType('')).toBe('name')
  })
  it('returns name for whitespace-only string', () => {
    expect(detectInputType('   ')).toBe('name')
  })
  it('trims whitespace before classifying', () => {
    expect(detectInputType('  962  ')).toBe('cid')
    expect(detectInputType('  CCO  ')).toBe('smiles')
  })
})
