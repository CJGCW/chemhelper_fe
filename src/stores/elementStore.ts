import { create } from 'zustand'
import type { Element } from '../types'
import { fetchAllElements } from '../api/elements'

interface ElementState {
  elements: Element[]
  loading: boolean
  error: string | null
  selectedElement: Element | null
  hoveredGroup: string | null
  searchQuery: string

  loadElements: () => Promise<void>
  selectElement: (element: Element | null) => void
  setHoveredGroup: (group: string | null) => void
  setSearchQuery: (query: string) => void
}

export const useElementStore = create<ElementState>((set, get) => ({
  elements: [],
  loading: false,
  error: null,
  selectedElement: null,
  hoveredGroup: null,
  searchQuery: '',

  loadElements: async () => {
    if (get().elements.length > 0) return // already loaded
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
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
