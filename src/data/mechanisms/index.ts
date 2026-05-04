import type { ReactionDef, MechanismFilter, MechanismCategory } from './types'
import { SN_E_REACTIONS } from './snE'
import { validateAllReactions } from './validate'
export { CATEGORY_LABELS, CATEGORY_ORDER } from './types'
export type { ReactionDef, ReactionSummary, MechanismFilter, MechanismCategory, ReactionType, Regiochemistry, Stereochemistry }  from './types'

export const ALL_REACTIONS: ReactionDef[] = [
  ...SN_E_REACTIONS,
  // Future: ...ALKENE_REACTIONS, ...ALKYNE_REACTIONS, ...AROMATIC_REACTIONS, etc.
]

// Runs in dev mode at module load — console-warns on coordinate drift, orphan refs, overlaps, etc.
validateAllReactions(ALL_REACTIONS)

export const TOTAL_REACTION_COUNT = ALL_REACTIONS.length

// ── Lookup maps (built once at module load) ───────────────────────────────────

const _byId = new Map<string, ReactionDef>(ALL_REACTIONS.map(r => [r.id, r]))

const _byCategory = new Map<MechanismCategory, ReactionDef[]>()
for (const r of ALL_REACTIONS) {
  const arr = _byCategory.get(r.category) ?? []
  arr.push(r)
  _byCategory.set(r.category, arr)
}

// ── Getters ───────────────────────────────────────────────────────────────────

export function getReactionById(id: string): ReactionDef | undefined {
  return _byId.get(id)
}

export function getReactionsByCategory(cat: MechanismCategory): ReactionDef[] {
  return _byCategory.get(cat) ?? []
}

export function getRelatedReactions(reaction: ReactionDef): ReactionDef[] {
  return reaction.relatedReactions.flatMap(id => {
    const r = _byId.get(id)
    return r ? [r] : []
  })
}

// ── Filter ────────────────────────────────────────────────────────────────────

export function filterReactions(filter: MechanismFilter): ReactionDef[] {
  return ALL_REACTIONS.filter(r => {
    if (filter.category !== 'all' && r.category !== filter.category) return false
    if (filter.reactionType !== 'all' && r.reactionType !== filter.reactionType) return false
    if (filter.regiochemistry !== 'all' && r.regiochemistry !== filter.regiochemistry) return false
    if (filter.stereochemistry !== 'all' && r.stereochemistry !== filter.stereochemistry) return false
    if (filter.search) {
      const q = filter.search.toLowerCase()
      const text = [
        r.name, r.summary, r.reactants, r.products, r.conditions,
        r.intermediate ?? '',
        ...r.importantInfo,
        ...r.tags,
      ].join(' ').toLowerCase()
      if (!text.includes(q)) return false
    }
    return true
  })
}

// ── Counts ────────────────────────────────────────────────────────────────────

export function getCategoryCounts(): Record<MechanismCategory, number> {
  const counts = {} as Record<MechanismCategory, number>
  for (const r of ALL_REACTIONS) {
    counts[r.category] = (counts[r.category] ?? 0) + 1
  }
  return counts
}
