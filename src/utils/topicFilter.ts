// Generic filter functions for removing hidden topics from page tab arrays.
// Each function corresponds to one of the 5 tab-definition patterns in the codebase.
// All functions are pure — pass isTabVisible from useTopicFilter() or directly
// from the preferences store.

import { usePreferencesStore } from '../stores/preferencesStore'

// ── Pattern 1: TabGroup[] with pills ─────────────────────────────────────────
// Used by: StoichiometryPage, IdealGasPage, RedoxPage, MolarCalculationsPage

export interface TabPill {
  id: string
  label: string
  formula: string
}

export interface TabGroup {
  id: string
  label: string
  pills: TabPill[]
}

/**
 * Removes hidden pills from each group, then removes groups that become empty.
 */
export function filterTabGroups(
  groups: TabGroup[],
  isTabVisible: (tabValue: string) => boolean,
): TabGroup[] {
  return groups
    .map(g => ({ ...g, pills: g.pills.filter(p => isTabVisible(p.id)) }))
    .filter(g => g.pills.length > 0)
}

// ── Pattern 2: Flat Tab[] array ───────────────────────────────────────────────
// Used by: StructuresPage (REFERENCE_TABS, PRACTICE_TABS, PROBLEMS_TABS)

export interface FlatTab {
  id: string
  label: string
  formula: string
}

/**
 * Removes hidden entries from a flat tab array.
 */
export function filterFlatTabs<T extends { id: string }>(
  tabs: T[],
  isTabVisible: (tabValue: string) => boolean,
): T[] {
  return tabs.filter(t => isTabVisible(t.id))
}

// ── Pattern 3: Nested Group > Section > Tab ───────────────────────────────────
// Used by: ThermochemistryPage

export interface ThermoTab {
  id: string
  label: string
}

export interface ThermoSection {
  heading: string
  tabs: ThermoTab[]
}

export interface ThermoGroup {
  id: string
  label: string
  sections: ThermoSection[]
}

/**
 * Removes hidden tabs from each section, then empty sections, then empty groups.
 */
export function filterThermoGroups(
  groups: ThermoGroup[],
  isTabVisible: (tabValue: string) => boolean,
): ThermoGroup[] {
  return groups
    .map(g => ({
      ...g,
      sections: g.sections
        .map(s => ({ ...s, tabs: s.tabs.filter(t => isTabVisible(t.id)) }))
        .filter(s => s.tabs.length > 0),
    }))
    .filter(g => g.sections.length > 0)
}

// ── Pattern 4: TOPIC_GROUPS with topics arrays ────────────────────────────────
// Used by: ElectronConfigPage

export interface TopicEntry {
  id: string
  label: string
  subtitle: string
}

export interface TopicGroup {
  label: string
  topics: TopicEntry[]
}

/**
 * Removes hidden topics from each group, then removes groups that become empty.
 * ElectronConfigPage uses ?topic= param values, which are the topic entry ids.
 */
export function filterTopicGroups(
  groups: TopicGroup[],
  isTabVisible: (tabValue: string) => boolean,
): TopicGroup[] {
  return groups
    .map(g => ({ ...g, topics: g.topics.filter(t => isTabVisible(t.id)) }))
    .filter(g => g.topics.length > 0)
}

// ── Pattern 5: Simple string tabs ─────────────────────────────────────────────
// Used by: BaseCalculationsPage (tab is a bare string from ?tab= param)
// Pages check isTabVisible(tab) directly; no array helper needed.
// The hook below provides isTabVisible for this use case.

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface TopicFilterTools {
  isTabVisible: (tabValue: string) => boolean
  isSectionVisible: (id: string) => boolean
  isTopicVisible: (id: string) => boolean
  showAnswers: boolean
  filterTabGroups: (groups: TabGroup[]) => TabGroup[]
  filterFlatTabs: <T extends { id: string }>(tabs: T[]) => T[]
  filterThermoGroups: (groups: ThermoGroup[]) => ThermoGroup[]
  filterTopicGroups: (groups: TopicGroup[]) => TopicGroup[]
}

/**
 * Reads visibility state from the preferences store and returns all filter
 * functions pre-bound to the current isTabVisible predicate.
 */
export function useTopicFilter(): TopicFilterTools {
  const isTabVisible    = usePreferencesStore(s => s.isTabVisible)
  const isSectionVisible = usePreferencesStore(s => s.isSectionVisible)
  const isTopicVisible  = usePreferencesStore(s => s.isTopicVisible)
  const showAnswers     = usePreferencesStore(s => s.showAnswers)

  return {
    isTabVisible,
    isSectionVisible,
    isTopicVisible,
    showAnswers,
    filterTabGroups:    (groups) => filterTabGroups(groups, isTabVisible),
    filterFlatTabs:     (tabs)   => filterFlatTabs(tabs, isTabVisible),
    filterThermoGroups: (groups) => filterThermoGroups(groups, isTabVisible),
    filterTopicGroups:  (groups) => filterTopicGroups(groups, isTabVisible),
  }
}
