import type { ColorCategory, Element } from '../../types'

/** Map from color category name to its CSS variable */
export const GROUP_COLORS: Record<ColorCategory, string> = {
  hydrogen:         'var(--c-hydrogen)',
  alkali:           'var(--c-alkali)',
  alkaline:         'var(--c-alkaline)',
  transition:       'var(--c-transition)',
  'post-transition':'var(--c-post-transition)',
  metalloid:        'var(--c-metalloid)',
  carbon:           'var(--c-carbon)',
  pnictogen:        'var(--c-pnictogen)',
  chalcogen:        'var(--c-chalcogen)',
  halogen:          'var(--c-halogen)',
  noble:            'var(--c-noble)',
  lanthanide:       'var(--c-lanthanide)',
  actinide:         'var(--c-actinide)',
  unknown:          'var(--c-unknown)',
}

export const GROUP_LABELS: Record<ColorCategory, string> = {
  hydrogen:         'Hydrogen',
  alkali:           'Alkali Metals',
  alkaline:         'Alkaline Earth',
  transition:       'Transition Metals',
  'post-transition':'Post-Transition',
  metalloid:        'Metalloids',
  carbon:           'Carbon Group',
  pnictogen:        'Pnictogens',
  chalcogen:        'Chalcogens',
  halogen:          'Halogens',
  noble:            'Noble Gases',
  lanthanide:       'Lanthanides',
  actinide:         'Actinides',
  unknown:          'Unknown',
}

const METALLOID_Z = new Set([5, 14, 32, 33, 51, 52, 84, 85])

/** Derive the color category for an element */
export function getColorCategory(el: Element): ColorCategory {
  const n = el.atomicNumber
  if (n === 1) return 'hydrogen'
  if (n >= 57 && n <= 71) return 'lanthanide'
  if (n >= 89 && n <= 103) return 'actinide'
  if (METALLOID_Z.has(n)) return 'metalloid'

  switch (el.groupName) {
    case 'Alkali Metals':        return 'alkali'
    case 'Alkaline Earth Metals': return 'alkaline'
    case 'Carbon':               return 'carbon'
    case 'Pnictogens':           return 'pnictogen'
    case 'Chalcogens':           return 'chalcogen'
    case 'Halogens':             return 'halogen'
    case 'Noble Gases':          return 'noble'
    case 'Metals':
      // Transition metals: groups 3–12
      if (el.group >= 3 && el.group <= 12) return 'transition'
      return 'post-transition'
    default:
      return 'unknown'
  }
}

/** Check if an element matches the given search query */
export function matchesSearch(el: Element, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase().trim()
  const num = parseInt(q, 10)
  return (
    el.symbol.toLowerCase().startsWith(q) ||
    el.name.toLowerCase().includes(q) ||
    (!isNaN(num) && el.atomicNumber === num)
  )
}
