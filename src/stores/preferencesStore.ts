import { create } from 'zustand'
import {
  UNITS, SECTIONS, TOPICS,
  getSectionsForUnit, getTopicsForUnit, getTopicsForSection, getUnitsByLevel,
  isTabHidden as registryIsTabHidden,
} from '../config/topicRegistry'
import type { UnitId, SectionId } from '../config/topicRegistry'

const STORAGE_KEY = 'chemhelper-prefs'
const CURRENT_VERSION = 1

interface PersistedPrefs {
  version: number
  hiddenUnits: string[]
  hiddenSections: string[]
  hiddenTopics: string[]
  showAnswers: boolean
}

interface PreferencesState {
  hiddenUnits: Set<string>
  hiddenSections: Set<string>
  hiddenTopics: Set<string>
  showAnswers: boolean

  // Unit cascades to all its sections and their topics
  toggleUnit: (id: UnitId) => void
  // Section cascades to all its topics
  toggleSection: (id: SectionId) => void
  // Topic only — no cascade
  toggleTopic: (id: string) => void

  // Derived visibility
  isUnitVisible: (id: string) => boolean
  isSectionVisible: (id: string) => boolean
  isTopicVisible: (id: string) => boolean
  isUnitFullyVisible: (id: string) => boolean
  isSectionFullyVisible: (id: string) => boolean
  isTabVisible: (tabValue: string) => boolean

  // Bulk
  showAll: () => void
  hideAll: () => void
  resetToDefaults: () => void
  setGenChemPreset: (level: 1 | 2) => void

  setShowAnswers: (v: boolean) => void
}

// ── Persistence ───────────────────────────────────────────────────────────────

function persist(state: Pick<PreferencesState, 'hiddenUnits' | 'hiddenSections' | 'hiddenTopics' | 'showAnswers'>) {
  try {
    const data: PersistedPrefs = {
      version: CURRENT_VERSION,
      hiddenUnits: Array.from(state.hiddenUnits),
      hiddenSections: Array.from(state.hiddenSections),
      hiddenTopics: Array.from(state.hiddenTopics),
      showAnswers: state.showAnswers,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage unavailable (SSR, private browsing)
  }
}

function loadPersistedPrefs(): Partial<PersistedPrefs> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw) as PersistedPrefs
    if (data.version !== CURRENT_VERSION) return {}
    return data
  } catch {
    return {}
  }
}

const saved = loadPersistedPrefs()

// ── Store ─────────────────────────────────────────────────────────────────────

export const usePreferencesStore = create<PreferencesState>((set, get) => {
  const initial = {
    hiddenUnits:    new Set<string>(saved.hiddenUnits    ?? []),
    hiddenSections: new Set<string>(saved.hiddenSections ?? []),
    hiddenTopics:   new Set<string>(saved.hiddenTopics   ?? []),
    showAnswers:    saved.showAnswers ?? true,
  }

  function mutate(
    updater: (state: PreferencesState) => Partial<Pick<PreferencesState, 'hiddenUnits' | 'hiddenSections' | 'hiddenTopics' | 'showAnswers'>>
  ) {
    set(state => {
      const patch = updater(state)
      const next = { ...state, ...patch }
      persist(next)
      return patch
    })
  }

  return {
    ...initial,

    // ── Toggles ─────────────────────────────────────────────────────────────

    toggleUnit(id) {
      mutate(state => {
        const next = new Set(state.hiddenUnits)
        const nextSections = new Set(state.hiddenSections)
        const nextTopics   = new Set(state.hiddenTopics)

        const unitSectionIds = getSectionsForUnit(id as UnitId).map(s => s.id)
        const unitTopicIds   = getTopicsForUnit(id as UnitId).map(t => t.id)

        if (next.has(id)) {
          // Showing: remove unit + its sections + their topics from hidden
          next.delete(id)
          unitSectionIds.forEach(s => nextSections.delete(s))
          unitTopicIds.forEach(t => nextTopics.delete(t))
        } else {
          // Hiding: add unit + its sections + their topics to hidden
          next.add(id)
          unitSectionIds.forEach(s => nextSections.add(s))
          unitTopicIds.forEach(t => nextTopics.add(t))
        }
        return { hiddenUnits: next, hiddenSections: nextSections, hiddenTopics: nextTopics }
      })
    },

    toggleSection(id) {
      mutate(state => {
        const next         = new Set(state.hiddenSections)
        const nextTopics   = new Set(state.hiddenTopics)
        const sectionTopicIds = getTopicsForSection(id as SectionId).map(t => t.id)

        if (next.has(id)) {
          next.delete(id)
          sectionTopicIds.forEach(t => nextTopics.delete(t))
        } else {
          next.add(id)
          sectionTopicIds.forEach(t => nextTopics.add(t))
        }
        return { hiddenSections: next, hiddenTopics: nextTopics }
      })
    },

    toggleTopic(id) {
      mutate(state => {
        const next = new Set(state.hiddenTopics)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return { hiddenTopics: next }
      })
    },

    // ── Derived Visibility ──────────────────────────────────────────────────

    isUnitVisible: (id) => !get().hiddenUnits.has(id),
    isSectionVisible: (id) => !get().hiddenSections.has(id),
    isTopicVisible: (id) => !get().hiddenTopics.has(id),

    isUnitFullyVisible(id) {
      const { hiddenUnits, hiddenSections, hiddenTopics } = get()
      if (hiddenUnits.has(id)) return false
      const unitSections = getSectionsForUnit(id as UnitId)
      if (unitSections.some(s => hiddenSections.has(s.id))) return false
      const unitTopics = getTopicsForUnit(id as UnitId)
      return !unitTopics.some(t => hiddenTopics.has(t.id))
    },

    isSectionFullyVisible(id) {
      const { hiddenSections, hiddenTopics } = get()
      if (hiddenSections.has(id)) return false
      const topics = getTopicsForSection(id as SectionId)
      return !topics.some(t => hiddenTopics.has(t.id))
    },

    isTabVisible(tabValue) {
      return !registryIsTabHidden(tabValue, get().hiddenTopics)
    },

    // ── Bulk Operations ─────────────────────────────────────────────────────

    showAll() {
      mutate(() => ({
        hiddenUnits:    new Set(),
        hiddenSections: new Set(),
        hiddenTopics:   new Set(),
      }))
    },

    hideAll() {
      mutate(() => ({
        hiddenUnits:    new Set(UNITS.map(u => u.id)),
        hiddenSections: new Set(SECTIONS.map(s => s.id)),
        hiddenTopics:   new Set(TOPICS.map(t => t.id)),
      }))
    },

    resetToDefaults() {
      mutate(() => ({
        hiddenUnits:    new Set(),
        hiddenSections: new Set(),
        hiddenTopics:   new Set(),
        showAnswers:    true,
      }))
    },

    setGenChemPreset(level: 1 | 2) {
      mutate(state => {
        const nextUnits    = new Set(state.hiddenUnits)
        const nextSections = new Set(state.hiddenSections)
        const nextTopics   = new Set(state.hiddenTopics)

        const show = (unitIds: UnitId[]) => {
          unitIds.forEach(id => {
            nextUnits.delete(id)
            getSectionsForUnit(id).forEach(s => {
              nextSections.delete(s.id)
              getTopicsForSection(s.id as SectionId).forEach(t => nextTopics.delete(t.id))
            })
          })
        }
        const hide = (unitIds: UnitId[]) => {
          unitIds.forEach(id => {
            nextUnits.add(id)
            getSectionsForUnit(id).forEach(s => {
              nextSections.add(s.id)
              getTopicsForSection(s.id as SectionId).forEach(t => nextTopics.add(t.id))
            })
          })
        }

        const gc1 = getUnitsByLevel(1).map(u => u.id as UnitId)
        const gc2 = getUnitsByLevel(2).map(u => u.id as UnitId)

        if (level === 1) {
          show(gc1)
          hide(gc2)
        } else {
          hide(gc1)
          show(gc2)
        }

        return { hiddenUnits: nextUnits, hiddenSections: nextSections, hiddenTopics: nextTopics }
      })
    },

    setShowAnswers(v) {
      mutate(state => ({ showAnswers: v, hiddenUnits: state.hiddenUnits, hiddenSections: state.hiddenSections, hiddenTopics: state.hiddenTopics }))
    },
  }
})

// ── Convenience Hooks ─────────────────────────────────────────────────────────

export function useShowAnswers(): boolean {
  return usePreferencesStore(s => s.showAnswers)
}

/** Returns a function that checks whether a tab value should be visible. */
export function useTabFilter(): (tabValue: string) => boolean {
  return usePreferencesStore(s => s.isTabVisible)
}
