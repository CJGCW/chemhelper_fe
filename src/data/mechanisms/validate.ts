// Dev-mode validation for reaction data. Console-warns on structural errors.
// Called at module load in index.ts — catches mistakes before they become silent rendering bugs.

import type { ReactionDef } from './types'

export function validateAllReactions(reactions: ReactionDef[]): void {
  // Skip in production
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD) return

  for (const reaction of reactions) {
    const { scene, steps } = reaction
    const atomIds = new Set(scene.atoms.map(a => a.id))
    const bondIds = new Set(scene.bonds.map(b => b.id))
    const w = (msg: string) => console.warn(`[validate:${reaction.id}] ${msg}`)

    // Off-canvas atoms
    for (const atom of scene.atoms) {
      if (atom.x < 0 || atom.x > scene.width || atom.y < 0 || atom.y > scene.height) {
        w(`atom '${atom.id}' off-canvas at (${atom.x},${atom.y}) — scene is ${scene.width}×${scene.height}`)
      }
    }

    // Overlapping atoms (likely placement error)
    for (let i = 0; i < scene.atoms.length; i++) {
      for (let j = i + 1; j < scene.atoms.length; j++) {
        const a = scene.atoms[i], b = scene.atoms[j]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < 25) w(`atoms '${a.id}' and '${b.id}' overlap (distance=${d.toFixed(1)}px)`)
      }
    }

    // Stereocenter without wedge/dash in inversion reactions
    if (reaction.stereochemistry === 'inversion') {
      const stereocenters = scene.atoms.filter(a =>
        a.role === 'alpha_carbon' || a.role === 'more_substituted' || a.role === 'less_substituted'
      )
      for (const center of stereocenters) {
        const attached = scene.bonds.filter(b => b.from === center.id || b.to === center.id)
        const hasWedgeDash = attached.some(b => b.style === 'wedge' || b.style === 'dash-wedge')
        if (!hasWedgeDash) {
          w(`stereocenter '${center.id}' in inversion reaction has no wedge/dash bonds — add 3D geometry`)
        }
      }
    }

    // Track atom positions as steps accumulate (for drift detection)
    const atomPos = new Map<string, { x: number; y: number }>(
      scene.atoms.map(a => [a.id, { x: a.x, y: a.y }])
    )

    for (const step of steps) {
      for (const anim of step.animations) {
        // Orphan atom references
        if (anim.targetId) {
          const atomOps = ['charge_appear', 'charge_disappear', 'atom_relabel', 'intermediate_glow', 'invert_stereocenter']
          if (atomOps.includes(anim.type) && !atomIds.has(anim.targetId)) {
            w(`step ${step.step}: '${anim.type}' references unknown atom '${anim.targetId}'`)
          }
          // Orphan bond references (allow derived "fromId-toId" new bonds)
          if (anim.type === 'bond_break' || anim.type === 'bond_style_change') {
            if (!bondIds.has(anim.targetId)) {
              w(`step ${step.step}: '${anim.type}' references unknown bond '${anim.targetId}'`)
            }
          }
        }

        // atom_translate: drift detection + missing targetId
        if (anim.type === 'atom_translate') {
          if (!anim.to) {
            w(`step ${step.step}: atom_translate has no 'to' coordinate`)
            continue
          }
          if (anim.targetId) {
            const pos = atomPos.get(anim.targetId)
            if (!pos) {
              w(`step ${step.step}: atom_translate references unknown atom '${anim.targetId}'`)
            } else {
              if (anim.from) {
                const drift = Math.hypot(pos.x - anim.from.x, pos.y - anim.from.y)
                if (drift > 5) w(`step ${step.step}: atom_translate '${anim.targetId}' drift=${drift.toFixed(1)}px (declared from=(${anim.from.x},${anim.from.y}), actual=(${pos.x},${pos.y}))`)
              }
              atomPos.set(anim.targetId, { x: anim.to.x, y: anim.to.y })
            }
          } else if (!anim.from) {
            w(`step ${step.step}: atom_translate has neither targetId nor from coordinates`)
          } else {
            // Distance-based: find the atom it would match
            let minDist = Infinity, closestId = ''
            for (const [id, pos] of atomPos) {
              const d = Math.hypot(pos.x - anim.from.x, pos.y - anim.from.y)
              if (d < minDist) { minDist = d; closestId = id }
            }
            if (minDist >= 50) {
              w(`step ${step.step}: atom_translate from=(${anim.from.x},${anim.from.y}) — no atom within 50px (closest '${closestId}' at ${minDist.toFixed(1)}px). Add targetId.`)
            } else {
              atomPos.set(closestId, { x: anim.to.x, y: anim.to.y })
            }
          }
        }
      }
    }
  }
}
