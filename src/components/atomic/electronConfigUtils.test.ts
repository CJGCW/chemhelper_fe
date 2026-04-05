import { describe, it, expect } from 'vitest'
import {
  computeConfig,
  getNobleGasCore,
  getAbbrConfig,
  orbitalStates,
  groupByShell,
  valenceElectrons,
  parseWrittenConfig,
  checkWrittenConfig,
  checkBoxDiagram,
} from './electronConfigUtils'

// ── computeConfig ─────────────────────────────────────────────────────────────

describe('computeConfig', () => {
  it('hydrogen (Z=1): 1s1', () => {
    const cfg = computeConfig(1)
    expect(cfg).toHaveLength(1)
    expect(cfg[0]).toMatchObject({ label: '1s', electrons: 1 })
  })

  it('helium (Z=2): 1s2', () => {
    const cfg = computeConfig(2)
    expect(cfg).toHaveLength(1)
    expect(cfg[0]).toMatchObject({ label: '1s', electrons: 2 })
  })

  it('carbon (Z=6): 1s2 2s2 2p2', () => {
    const cfg = computeConfig(6)
    const labels = cfg.map(s => s.label)
    expect(labels).toEqual(['1s', '2s', '2p'])
    expect(cfg.find(s => s.label === '2p')?.electrons).toBe(2)
  })

  it('neon (Z=10): fills through 2p6', () => {
    const cfg = computeConfig(10)
    expect(cfg.find(s => s.label === '2p')?.electrons).toBe(6)
    expect(cfg.reduce((n, s) => n + s.electrons, 0)).toBe(10)
  })

  it('calcium (Z=20): fills 4s before 3d', () => {
    const cfg = computeConfig(20)
    const labels = cfg.map(s => s.label)
    expect(labels).toContain('4s')
    expect(labels).not.toContain('3d')
    expect(cfg.find(s => s.label === '4s')?.electrons).toBe(2)
  })

  it('iron (Z=26): 3d6', () => {
    const cfg = computeConfig(26)
    expect(cfg.find(s => s.label === '3d')?.electrons).toBe(6)
  })

  it('total electrons always equal Z for regular elements', () => {
    for (const Z of [1, 5, 10, 18, 26, 36, 54]) {
      const cfg = computeConfig(Z)
      const total = cfg.reduce((n, s) => n + s.electrons, 0)
      expect(total).toBe(Z)
    }
  })

  // Exceptions
  it('chromium (Z=24): exception gives 3d5 4s1 not 3d4 4s2', () => {
    const cfg = computeConfig(24)
    expect(cfg.find(s => s.label === '3d')?.electrons).toBe(5)
    expect(cfg.find(s => s.label === '4s')?.electrons).toBe(1)
  })

  it('copper (Z=29): exception gives 3d10 4s1 not 3d9 4s2', () => {
    const cfg = computeConfig(29)
    expect(cfg.find(s => s.label === '3d')?.electrons).toBe(10)
    expect(cfg.find(s => s.label === '4s')?.electrons).toBe(1)
  })

  it('palladium (Z=46): exception gives 4d10 with no 5s electrons', () => {
    const cfg = computeConfig(46)
    expect(cfg.find(s => s.label === '4d')?.electrons).toBe(10)
    expect(cfg.find(s => s.label === '5s')?.electrons ?? 0).toBe(0)
  })

  it('forceAufbau ignores exceptions for Cr', () => {
    const cfg = computeConfig(24, true)
    expect(cfg.find(s => s.label === '3d')?.electrons).toBe(4)
    expect(cfg.find(s => s.label === '4s')?.electrons).toBe(2)
  })
})

// ── getNobleGasCore ───────────────────────────────────────────────────────────

describe('getNobleGasCore', () => {
  it('returns null for hydrogen (no preceding noble gas)', () => {
    expect(getNobleGasCore(1)).toBeNull()
  })

  it('returns null for helium itself', () => {
    expect(getNobleGasCore(2)).toBeNull()
  })

  it('returns He for lithium (Z=3)', () => {
    expect(getNobleGasCore(3)).toMatchObject({ symbol: 'He', coreZ: 2 })
  })

  it('returns Ne for sodium (Z=11)', () => {
    expect(getNobleGasCore(11)).toMatchObject({ symbol: 'Ne', coreZ: 10 })
  })

  it('returns Ar for potassium (Z=19)', () => {
    expect(getNobleGasCore(19)).toMatchObject({ symbol: 'Ar', coreZ: 18 })
  })

  it('returns Kr for rubidium (Z=37)', () => {
    expect(getNobleGasCore(37)).toMatchObject({ symbol: 'Kr', coreZ: 36 })
  })
})

// ── getAbbrConfig ─────────────────────────────────────────────────────────────

describe('getAbbrConfig', () => {
  it('hydrogen has no core label', () => {
    const { coreLabel } = getAbbrConfig(1)
    expect(coreLabel).toBeNull()
  })

  it('sodium: core is [Ne], subshells only contain 3s', () => {
    const { coreLabel, subshells } = getAbbrConfig(11)
    expect(coreLabel).toBe('[Ne]')
    expect(subshells).toHaveLength(1)
    expect(subshells[0]).toMatchObject({ label: '3s', electrons: 1 })
  })

  it('iron: core is [Ar], subshells are 3d and 4s', () => {
    const { coreLabel, subshells } = getAbbrConfig(26)
    expect(coreLabel).toBe('[Ar]')
    const labels = subshells.map(s => s.label)
    expect(labels).toContain('4s')
    expect(labels).toContain('3d')
  })
})

// ── orbitalStates ─────────────────────────────────────────────────────────────

describe('orbitalStates', () => {
  it('0 electrons in 3 orbitals: all empty', () => {
    const states = orbitalStates(0, 3)
    expect(states).toEqual([
      { up: false, down: false },
      { up: false, down: false },
      { up: false, down: false },
    ])
  })

  it('1 electron in 1 orbital (1s1): spin-up only', () => {
    expect(orbitalStates(1, 1)).toEqual([{ up: true, down: false }])
  })

  it('2 electrons in 1 orbital (1s2): paired', () => {
    expect(orbitalStates(2, 1)).toEqual([{ up: true, down: true }])
  })

  it('2 electrons in 3 p orbitals (Hund): two singly filled', () => {
    const states = orbitalStates(2, 3)
    expect(states[0]).toEqual({ up: true, down: false })
    expect(states[1]).toEqual({ up: true, down: false })
    expect(states[2]).toEqual({ up: false, down: false })
  })

  it('3 electrons in 3 p orbitals: all singly filled', () => {
    const states = orbitalStates(3, 3)
    expect(states.every(s => s.up && !s.down)).toBe(true)
  })

  it('4 electrons in 3 p orbitals: one paired, two singly filled', () => {
    const states = orbitalStates(4, 3)
    expect(states[0]).toEqual({ up: true, down: true })
    expect(states[1]).toEqual({ up: true, down: false })
    expect(states[2]).toEqual({ up: true, down: false })
  })

  it('6 electrons in 3 p orbitals: all paired', () => {
    const states = orbitalStates(6, 3)
    expect(states.every(s => s.up && s.down)).toBe(true)
  })
})

// ── groupByShell ──────────────────────────────────────────────────────────────

describe('groupByShell', () => {
  it('groups carbon subshells into n=1 and n=2', () => {
    const cfg = computeConfig(6) // 1s2 2s2 2p2
    const grouped = groupByShell(cfg)
    expect(grouped).toHaveLength(2)
    expect(grouped[0][0]).toBe(1)
    expect(grouped[1][0]).toBe(2)
  })

  it('within n=2, sorts s before p (by l)', () => {
    const cfg = computeConfig(10) // 1s2 2s2 2p6
    const grouped = groupByShell(cfg)
    const n2 = grouped.find(([n]) => n === 2)![1]
    expect(n2[0].label).toBe('2s')
    expect(n2[1].label).toBe('2p')
  })

  it('returns empty array for no subshells', () => {
    expect(groupByShell([])).toEqual([])
  })
})

// ── valenceElectrons ──────────────────────────────────────────────────────────

describe('valenceElectrons', () => {
  it('returns 0 for empty config', () => {
    expect(valenceElectrons([])).toBe(0)
  })

  it('hydrogen: 1 valence electron', () => {
    expect(valenceElectrons(computeConfig(1))).toBe(1)
  })

  it('carbon: 4 valence electrons (2s2 2p2)', () => {
    expect(valenceElectrons(computeConfig(6))).toBe(4)
  })

  it('oxygen: 6 valence electrons', () => {
    expect(valenceElectrons(computeConfig(8))).toBe(6)
  })

  it('chlorine: 7 valence electrons', () => {
    expect(valenceElectrons(computeConfig(17))).toBe(7)
  })

  it('sodium: 1 valence electron (3s1)', () => {
    expect(valenceElectrons(computeConfig(11))).toBe(1)
  })
})

// ── parseWrittenConfig ────────────────────────────────────────────────────────

describe('parseWrittenConfig', () => {
  it('returns null for empty input', () => {
    expect(parseWrittenConfig('')).toBeNull()
    expect(parseWrittenConfig('   ')).toBeNull()
  })

  it('parses "1s2 2s2 2p6" for neon', () => {
    const map = parseWrittenConfig('1s2 2s2 2p6')!
    expect(map.get('1s')).toBe(2)
    expect(map.get('2s')).toBe(2)
    expect(map.get('2p')).toBe(6)
  })

  it('parses noble gas shorthand "[Ar] 4s2 3d6" for iron', () => {
    const map = parseWrittenConfig('[Ar] 4s2 3d6')!
    // Argon core
    expect(map.get('1s')).toBe(2)
    expect(map.get('3p')).toBe(6)
    // Post-core
    expect(map.get('4s')).toBe(2)
    expect(map.get('3d')).toBe(6)
  })

  it('is case-insensitive for orbital labels', () => {
    const map = parseWrittenConfig('1S2 2S2 2P6')!
    expect(map.get('1s')).toBe(2)
    expect(map.get('2p')).toBe(6)
  })

  it('returns null for unrecognised noble gas symbol', () => {
    expect(parseWrittenConfig('[Xy] 4s2')).toBeNull()
  })

  it('returns null when no orbital tokens found and no noble gas prefix', () => {
    expect(parseWrittenConfig('random text')).toBeNull()
  })

  it('parses "4f14" correctly (high electron count)', () => {
    const map = parseWrittenConfig('1s2 4f14')!
    expect(map.get('4f')).toBe(14)
  })
})

// ── checkWrittenConfig ────────────────────────────────────────────────────────

describe('checkWrittenConfig', () => {
  const neon = computeConfig(10) // 1s2 2s2 2p6

  it('returns correct: true for perfect match', () => {
    const map = parseWrittenConfig('1s2 2s2 2p6')!
    const result = checkWrittenConfig(map, neon)
    expect(result.correct).toBe(true)
    expect(result.wrongSubshells).toHaveLength(0)
    expect(result.missingSubshells).toHaveLength(0)
    expect(result.extraSubshells).toHaveLength(0)
  })

  it('flags wrong electron count', () => {
    const map = parseWrittenConfig('1s2 2s2 2p5')! // 2p5 instead of 2p6
    const result = checkWrittenConfig(map, neon)
    expect(result.correct).toBe(false)
    expect(result.wrongSubshells).toContainEqual({ label: '2p', expected: 6, got: 5 })
  })

  it('flags missing subshell', () => {
    const map = parseWrittenConfig('1s2 2s2')! // missing 2p
    const result = checkWrittenConfig(map, neon)
    expect(result.correct).toBe(false)
    expect(result.missingSubshells).toContain('2p')
  })

  it('flags extra subshell not in correct config', () => {
    const map = parseWrittenConfig('1s2 2s2 2p6 3s1')! // 3s1 should not be here
    const result = checkWrittenConfig(map, neon)
    expect(result.correct).toBe(false)
    expect(result.extraSubshells).toContain('3s')
  })

  it('returns correct: true for chromium exception config', () => {
    const crConfig = computeConfig(24)
    const map = parseWrittenConfig('[Ar] 3d5 4s1')!
    const result = checkWrittenConfig(map, crConfig)
    expect(result.correct).toBe(true)
  })
})

// ── checkBoxDiagram ───────────────────────────────────────────────────────────

describe('checkBoxDiagram', () => {
  it('all-empty boxes fail for any non-zero config', () => {
    const cfg = computeConfig(6) // 1s2 2s2 2p2
    const boxes: Record<string, number[]> = {
      '1s': [0],
      '2s': [0],
      '2p': [0, 0, 0],
    }
    const results = checkBoxDiagram(boxes, cfg)
    expect(results.every(r => r.electronCountCorrect)).toBe(false)
  })

  it('correct paired 1s2: [2] passes both checks', () => {
    const cfg = computeConfig(2) // He: 1s2
    const boxes = { '1s': [2] }
    const results = checkBoxDiagram(boxes, cfg)
    expect(results[0].electronCountCorrect).toBe(true)
    expect(results[0].hundCorrect).toBe(true)
  })

  it('1s1 (H): [1] correct, [2] wrong count', () => {
    const cfg = computeConfig(1)
    expect(checkBoxDiagram({ '1s': [1] }, cfg)[0].electronCountCorrect).toBe(true)
    expect(checkBoxDiagram({ '1s': [2] }, cfg)[0].electronCountCorrect).toBe(false)
  })

  it('carbon 2p2: Hund — any order of two singly-filled boxes is correct', () => {
    const cfg = computeConfig(6).filter(s => s.label === '2p')
    // [1,1,0], [1,0,1], [0,1,1] all valid (order-independent multiset)
    expect(checkBoxDiagram({ '2p': [1, 1, 0] }, cfg)[0].hundCorrect).toBe(true)
    expect(checkBoxDiagram({ '2p': [1, 0, 1] }, cfg)[0].hundCorrect).toBe(true)
    expect(checkBoxDiagram({ '2p': [0, 1, 1] }, cfg)[0].hundCorrect).toBe(true)
  })

  it('carbon 2p2: [2,0,0] violates Hund (paired before singly-filled)', () => {
    const cfg = computeConfig(6).filter(s => s.label === '2p')
    const result = checkBoxDiagram({ '2p': [2, 0, 0] }, cfg)[0]
    expect(result.electronCountCorrect).toBe(true)   // count is right (2)
    expect(result.hundCorrect).toBe(false)            // but Hund violated
  })

  it('oxygen 2p4: one paired + two singly-filled is correct', () => {
    const cfg = computeConfig(8).filter(s => s.label === '2p')
    // Expected: [2,1,1] multiset
    expect(checkBoxDiagram({ '2p': [2, 1, 1] }, cfg)[0].hundCorrect).toBe(true)
    expect(checkBoxDiagram({ '2p': [1, 2, 1] }, cfg)[0].hundCorrect).toBe(true)
  })

  it('oxygen 2p4: [2,2,0] violates Hund', () => {
    const cfg = computeConfig(8).filter(s => s.label === '2p')
    expect(checkBoxDiagram({ '2p': [2, 2, 0] }, cfg)[0].hundCorrect).toBe(false)
  })

  it('missing boxes default to all zeros (treated as empty)', () => {
    const cfg = computeConfig(2) // 1s2
    const results = checkBoxDiagram({}, cfg) // no boxes provided
    expect(results[0].electronCountCorrect).toBe(false)
    expect(results[0].gotElectrons).toBe(0)
    expect(results[0].expectedElectrons).toBe(2)
  })
})
