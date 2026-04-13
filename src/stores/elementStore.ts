import { create } from 'zustand'
import type { Element } from '../types'
import { fetchAllElements } from '../api/elements'

export type TrendMode = 'none' | 'electronegativity' | 'radius' | 'ie1' | 'ea' | 'ionicRadius'

interface ElementState {
  elements: Element[]
  loading: boolean
  error: string | null
  selectedElement: Element | null
  hoveredGroup: string | null
  hoveredColumnGroup: number | null
  searchQuery: string
  trendMode: TrendMode
  footnoteVisible: boolean
  compareMode: boolean
  compareElements: [Element | null, Element | null]

  loadElements: () => Promise<void>
  selectElement: (element: Element | null) => void
  setHoveredGroup: (group: string | null) => void
  setHoveredColumnGroup: (group: number | null) => void
  setSearchQuery: (query: string) => void
  setTrendMode: (mode: TrendMode) => void
  toggleFootnote: () => void
  setCompareMode: (mode: boolean) => void
  addToCompare: (element: Element) => void
  clearCompare: () => void
}

export const useElementStore = create<ElementState>((set, get) => ({
  elements: [],
  loading: false,
  error: null,
  selectedElement: null,
  hoveredGroup: null,
  hoveredColumnGroup: null,
  searchQuery: '',
  trendMode: 'none',
  footnoteVisible: false,
  compareMode: false,
  compareElements: [null, null],

  loadElements: async () => {
    if (get().elements.length > 0) return
    set({ loading: true, error: null })
    try {
      const elements = await fetchAllElements()
      set({ elements, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },

  selectElement: (element) => set({ selectedElement: element }),
  setHoveredGroup: (group) => set({ hoveredGroup: group }),
  setHoveredColumnGroup: (group) => set({ hoveredColumnGroup: group }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTrendMode: (mode) => set({ trendMode: mode }),
  toggleFootnote: () => set(s => ({ footnoteVisible: !s.footnoteVisible })),
  setCompareMode: (mode) => set(s => ({
    compareMode: mode,
    compareElements: mode ? s.compareElements : [null, null],
  })),
  addToCompare: (element) => {
    const [a, b] = get().compareElements
    if (!a) return set({ compareElements: [element, null] })
    if (a.atomicNumber === element.atomicNumber) return
    if (!b) return set({ compareElements: [a, element] })
    if (b.atomicNumber === element.atomicNumber) return
    // Both filled: shift — drop A, B becomes new A, new element becomes B
    set({ compareElements: [b, element] })
  },
  clearCompare: () => set({ compareElements: [null, null] }),
}))
