import { describe, it, expect } from 'vitest'
import {
  filterTabGroups,
  filterFlatTabs,
  filterThermoGroups,
  filterTopicGroups,
} from './topicFilter'
import type { TabGroup, FlatTab, ThermoGroup, TopicGroup } from './topicFilter'

const ALL_VISIBLE = () => true
const NONE_VISIBLE = () => false

// ── filterTabGroups ───────────────────────────────────────────────────────────

describe('filterTabGroups', () => {
  const groups: TabGroup[] = [
    { id: 'g1', label: 'Group 1', pills: [
      { id: 'tab-a', label: 'A', formula: 'f1' },
      { id: 'tab-b', label: 'B', formula: 'f2' },
    ]},
    { id: 'g2', label: 'Group 2', pills: [
      { id: 'tab-c', label: 'C', formula: 'f3' },
    ]},
  ]

  it('returns all groups when all tabs are visible', () => {
    const result = filterTabGroups(groups, ALL_VISIBLE)
    expect(result).toHaveLength(2)
    expect(result[0].pills).toHaveLength(2)
    expect(result[1].pills).toHaveLength(1)
  })

  it('returns empty array when no tabs are visible', () => {
    expect(filterTabGroups(groups, NONE_VISIBLE)).toHaveLength(0)
  })

  it('removes hidden pills but keeps group if some pills remain', () => {
    const result = filterTabGroups(groups, id => id === 'tab-a')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('g1')
    expect(result[0].pills).toHaveLength(1)
    expect(result[0].pills[0].id).toBe('tab-a')
  })

  it('removes the whole group when all its pills are hidden', () => {
    const result = filterTabGroups(groups, id => id === 'tab-c')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('g2')
  })

  it('does not mutate the original groups array', () => {
    const copy = JSON.stringify(groups)
    filterTabGroups(groups, () => false)
    expect(JSON.stringify(groups)).toBe(copy)
  })

  it('handles unknown tab ids gracefully (always excluded)', () => {
    const result = filterTabGroups(groups, id => id === 'nonexistent')
    expect(result).toHaveLength(0)
  })

  it('handles empty groups array', () => {
    expect(filterTabGroups([], ALL_VISIBLE)).toHaveLength(0)
  })

  it('handles groups with empty pills arrays', () => {
    const empty: TabGroup[] = [{ id: 'g', label: 'G', pills: [] }]
    expect(filterTabGroups(empty, ALL_VISIBLE)).toHaveLength(0)
  })
})

// ── filterFlatTabs ────────────────────────────────────────────────────────────

describe('filterFlatTabs', () => {
  const tabs: FlatTab[] = [
    { id: 'ref-a', label: 'A', formula: '' },
    { id: 'ref-b', label: 'B', formula: '' },
    { id: 'ref-c', label: 'C', formula: '' },
  ]

  it('returns all tabs when all are visible', () => {
    expect(filterFlatTabs(tabs, ALL_VISIBLE)).toHaveLength(3)
  })

  it('returns empty when none are visible', () => {
    expect(filterFlatTabs(tabs, NONE_VISIBLE)).toHaveLength(0)
  })

  it('preserves order of visible tabs', () => {
    const result = filterFlatTabs(tabs, id => id !== 'ref-b')
    expect(result.map(t => t.id)).toEqual(['ref-a', 'ref-c'])
  })

  it('handles generic objects with id field', () => {
    const items = [{ id: 'x', extra: 1 }, { id: 'y', extra: 2 }]
    const result = filterFlatTabs(items, id => id === 'x')
    expect(result).toHaveLength(1)
    expect(result[0].extra).toBe(1)
  })

  it('handles empty array', () => {
    expect(filterFlatTabs([], ALL_VISIBLE)).toHaveLength(0)
  })
})

// ── filterThermoGroups ────────────────────────────────────────────────────────

describe('filterThermoGroups', () => {
  const groups: ThermoGroup[] = [
    { id: 'g1', label: 'Thermo', sections: [
      { heading: 'Enthalpy', tabs: [{ id: 'enthalpy', label: 'Enthalpy' }] },
      { heading: 'Entropy',  tabs: [{ id: 'entropy',  label: 'Entropy'  }] },
    ]},
    { id: 'g2', label: 'Other', sections: [
      { heading: 'Gibbs', tabs: [{ id: 'gibbs', label: 'Gibbs' }] },
    ]},
  ]

  it('returns all when all visible', () => {
    const result = filterThermoGroups(groups, ALL_VISIBLE)
    expect(result).toHaveLength(2)
    expect(result[0].sections).toHaveLength(2)
  })

  it('removes empty sections', () => {
    const result = filterThermoGroups(groups, id => id === 'entropy')
    expect(result).toHaveLength(1)
    expect(result[0].sections).toHaveLength(1)
    expect(result[0].sections[0].heading).toBe('Entropy')
  })

  it('removes group when all sections are empty', () => {
    const result = filterThermoGroups(groups, id => id === 'gibbs')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('g2')
  })

  it('returns empty array when nothing visible', () => {
    expect(filterThermoGroups(groups, NONE_VISIBLE)).toHaveLength(0)
  })

  it('handles empty sections array', () => {
    const g: ThermoGroup[] = [{ id: 'g', label: 'G', sections: [] }]
    expect(filterThermoGroups(g, ALL_VISIBLE)).toHaveLength(0)
  })
})

// ── filterTopicGroups ─────────────────────────────────────────────────────────

describe('filterTopicGroups', () => {
  const groups: TopicGroup[] = [
    { label: 'Atomic', topics: [
      { id: 'atomic-config', label: 'Config', subtitle: 'Electron config' },
      { id: 'atomic-trends', label: 'Trends', subtitle: 'Periodic trends' },
    ]},
    { label: 'Molecular', topics: [
      { id: 'mol-shape', label: 'Shape', subtitle: 'VSEPR' },
    ]},
  ]

  it('returns all when all visible', () => {
    const result = filterTopicGroups(groups, ALL_VISIBLE)
    expect(result).toHaveLength(2)
  })

  it('removes hidden topics from groups', () => {
    const result = filterTopicGroups(groups, id => id === 'atomic-config')
    expect(result).toHaveLength(1)
    expect(result[0].topics).toHaveLength(1)
    expect(result[0].topics[0].id).toBe('atomic-config')
  })

  it('removes groups that become empty', () => {
    const result = filterTopicGroups(groups, id => id === 'mol-shape')
    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('Molecular')
  })

  it('returns empty array when nothing visible', () => {
    expect(filterTopicGroups(groups, NONE_VISIBLE)).toHaveLength(0)
  })

  it('handles unknown topic ids — they are excluded', () => {
    const result = filterTopicGroups(groups, id => id === 'nonexistent-id')
    expect(result).toHaveLength(0)
  })
})
