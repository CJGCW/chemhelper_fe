import { useState, useEffect, useMemo } from 'react'
import { useElementStore } from '../../stores/elementStore'
import { IE1, EA } from '../../data/periodicTrends'
import type { Element } from '../../types'

type Property = 'atomicRadius' | 'ionizationEnergy' | 'electronegativity' | 'electronAffinity'

interface Pool {
  prop: Property
  label: string
  unit: string
  direction: 'asc' | 'desc'
  dirLabel: string
  zNums: number[]
}

const POOLS: Pool[] = [
  // Atomic radius — group trends only (vdW period trends are too irregular)
  { prop: 'atomicRadius', label: 'Atomic Radius', unit: 'pm', direction: 'asc', dirLabel: 'smallest → largest', zNums: [1, 3, 11, 19] },   // H Li Na K
  { prop: 'atomicRadius', label: 'Atomic Radius', unit: 'pm', direction: 'asc', dirLabel: 'smallest → largest', zNums: [9, 17, 35, 53] },  // F Cl Br I
  { prop: 'atomicRadius', label: 'Atomic Radius', unit: 'pm', direction: 'asc', dirLabel: 'smallest → largest', zNums: [2, 10, 18, 36] },  // He Ne Ar Kr
  { prop: 'atomicRadius', label: 'Atomic Radius', unit: 'pm', direction: 'asc', dirLabel: 'smallest → largest', zNums: [4, 12, 20, 38] },  // Be Mg Ca Sr
  // Ionization energy — period trends (anomalies at B and O skipped)
  { prop: 'ionizationEnergy', label: 'Ionization Energy', unit: 'kJ/mol', direction: 'asc', dirLabel: 'lowest → highest', zNums: [3, 6, 7, 10] },   // Li C N Ne
  { prop: 'ionizationEnergy', label: 'Ionization Energy', unit: 'kJ/mol', direction: 'asc', dirLabel: 'lowest → highest', zNums: [11, 14, 17, 18] }, // Na Si Cl Ar
  // Ionization energy — group trends (decreasing down group)
  { prop: 'ionizationEnergy', label: 'Ionization Energy', unit: 'kJ/mol', direction: 'desc', dirLabel: 'highest → lowest', zNums: [3, 11, 19, 37] }, // Li Na K Rb
  { prop: 'ionizationEnergy', label: 'Ionization Energy', unit: 'kJ/mol', direction: 'desc', dirLabel: 'highest → lowest', zNums: [9, 17, 35, 53] }, // F Cl Br I
  // Electronegativity — period trends
  { prop: 'electronegativity', label: 'Electronegativity', unit: 'Pauling', direction: 'asc', dirLabel: 'lowest → highest', zNums: [3, 4, 5, 6] },    // Li Be B C
  { prop: 'electronegativity', label: 'Electronegativity', unit: 'Pauling', direction: 'asc', dirLabel: 'lowest → highest', zNums: [11, 12, 13, 14] }, // Na Mg Al Si
  // Electronegativity — group trend
  { prop: 'electronegativity', label: 'Electronegativity', unit: 'Pauling', direction: 'desc', dirLabel: 'highest → lowest', zNums: [9, 17, 35, 53] },  // F Cl Br I
  { prop: 'electronegativity', label: 'Electronegativity', unit: 'Pauling', direction: 'desc', dirLabel: 'highest → lowest', zNums: [3, 11, 19, 55] },  // Li Na K Cs
]

function getValue(el: Element, prop: Property): number | null {
  if (prop === 'atomicRadius')      return el.vanDerWaalsRadiusPm > 0 ? el.vanDerWaalsRadiusPm : null
  if (prop === 'ionizationEnergy')  return IE1[el.atomicNumber] ?? null
  if (prop === 'electronegativity') return el.electronegativity > 0 ? el.electronegativity : null
  if (prop === 'electronAffinity')  return EA[el.atomicNumber] !== undefined ? EA[el.atomicNumber] : null
  return null
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickPool(exclude?: number): number {
  let idx = Math.floor(Math.random() * POOLS.length)
  if (exclude !== undefined && POOLS.length > 1) {
    while (idx === exclude) idx = Math.floor(Math.random() * POOLS.length)
  }
  return idx
}

export default function PeriodicTrendsPractice() {
  const { elements, loadElements } = useElementStore()
  useEffect(() => { loadElements() }, [loadElements])

  const [poolIdx,  setPoolIdx]  = useState<number>(() => pickPool())
  const [display,  setDisplay]  = useState<number[]>([])  // shuffled Z order for card display
  const [ranking,  setRanking]  = useState<number[]>([])  // student's ranked Zs (index 0 = rank 1)
  const [checked,  setChecked]  = useState(false)
  const [streak,   setStreak]   = useState(0)

  const pool = POOLS[poolIdx]

  // Recompute display order whenever pool or elements change
  useEffect(() => {
    if (elements.length === 0) return
    setDisplay(shuffle(pool.zNums))
    setRanking([])
    setChecked(false)
  }, [poolIdx, elements])

  const elMap = useMemo(() => {
    const m: Record<number, Element> = {}
    for (const el of elements) m[el.atomicNumber] = el
    return m
  }, [elements])

  const correctOrder = useMemo(() => {
    if (elements.length === 0) return []
    return [...pool.zNums].sort((a, b) => {
      const va = getValue(elMap[a], pool.prop) ?? 0
      const vb = getValue(elMap[b], pool.prop) ?? 0
      return pool.direction === 'asc' ? va - vb : vb - va
    })
  }, [pool, elMap, elements])

  function handleClick(z: number) {
    if (checked) return
    setRanking(prev => {
      const idx = prev.indexOf(z)
      if (idx !== -1) {
        // deselect: remove this element (don't shift others)
        return prev.filter(x => x !== z)
      }
      if (prev.length >= 4) return prev
      return [...prev, z]
    })
  }

  function handleCheck() {
    if (ranking.length < 4) return
    setChecked(true)
    const allCorrect = ranking.every((z, i) => z === correctOrder[i])
    if (allCorrect) setStreak(s => s + 1)
    else setStreak(0)
  }

  function handleNext() {
    const next = pickPool(poolIdx)
    setPoolIdx(next)
    // display/ranking reset is handled by the poolIdx useEffect
  }

  if (elements.length === 0) {
    return <p className="font-mono text-sm text-dim">Loading element data…</p>
  }

  const rankOf = (z: number) => ranking.indexOf(z)  // -1 if unranked
  const allRanked = ranking.length === 4

  return (
    <div className="flex flex-col gap-6 max-w-xl">

      {/* Streak */}
      {streak > 0 && (
        <div className="font-mono text-xs text-secondary">
          Streak: <span style={{ color: 'var(--c-halogen)' }}>{streak}</span>
        </div>
      )}

      {/* Question */}
      <div className="flex flex-col gap-1.5">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Rank these elements</p>
        <p className="font-sans text-base text-bright">
          Order by <span style={{ color: 'var(--c-halogen)' }}>{pool.label}</span>
          {' '}— <span className="text-secondary">{pool.dirLabel}</span>
        </p>
        <p className="font-mono text-xs text-dim">Click elements in order · click again to deselect</p>
      </div>

      {/* Element cards */}
      <div className="grid grid-cols-4 gap-3">
        {display.map(z => {
          const el = elMap[z]
          if (!el) return null
          const rank = rankOf(z)
          const isRanked = rank !== -1
          const val = getValue(el, pool.prop)

          // Feedback colors when checked
          let cardStyle: React.CSSProperties = {}
          let borderColor = 'rgb(var(--color-border))'
          let bgColor = 'rgb(var(--color-surface))'

          if (checked) {
            const correctPos = correctOrder.indexOf(z)
            const isCorrect = ranking[correctPos] === z
            if (isCorrect) {
              borderColor = 'rgb(74 222 128 / 0.6)'
              bgColor = 'rgb(20 83 45 / 0.2)'
            } else {
              borderColor = 'rgb(248 113 113 / 0.6)'
              bgColor = 'rgb(127 29 29 / 0.15)'
            }
          } else if (isRanked) {
            borderColor = 'color-mix(in srgb, var(--c-halogen) 40%, transparent)'
            bgColor = 'color-mix(in srgb, var(--c-halogen) 10%, rgb(var(--color-raised)))'
          }

          cardStyle = {
            border: `1px solid ${borderColor}`,
            background: bgColor,
            cursor: checked ? 'default' : 'pointer',
            transition: 'border-color 0.15s, background 0.15s',
          }

          return (
            <button
              key={z}
              onClick={() => handleClick(z)}
              className="relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-sm"
              style={cardStyle}
            >
              {/* Rank badge */}
              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{
                  background: isRanked ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.08)',
                  transition: 'background 0.12s',
                }}>
                <span className="font-mono text-[9px] font-bold"
                  style={{ color: isRanked ? 'rgb(var(--color-base))' : 'rgba(var(--overlay),0.2)' }}>
                  {isRanked ? rank + 1 : '·'}
                </span>
              </div>

              {/* Symbol */}
              <span className="font-mono text-xl font-semibold text-bright leading-none">
                {el.symbol}
              </span>
              <span className="font-mono text-[9px] text-dim text-center leading-tight">
                {el.name}
              </span>

              {/* Revealed value */}
              {checked && val !== null && (
                <span className="font-mono text-[10px] font-medium" style={{ color: 'var(--c-halogen)' }}>
                  {typeof val === 'number' ? val.toFixed(val < 10 ? 2 : 0) : val}
                  {' '}{pool.unit === 'Pauling' ? '' : pool.unit.split(' ')[0]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Ranking display — ordered slots */}
      {!checked && (
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map(i => {
            const z = ranking[i]
            const el = z ? elMap[z] : null
            const isFirst = pool.dirLabel.startsWith('lowest') || pool.dirLabel.startsWith('smallest')
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="w-12 h-8 rounded-sm border flex items-center justify-center"
                  style={{
                    borderColor: el ? 'color-mix(in srgb, var(--c-halogen) 40%, transparent)' : 'rgb(var(--color-border))',
                    background: el ? 'color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-raised)))' : 'rgb(var(--color-surface))',
                  }}>
                  <span className="font-mono text-sm text-bright">{el?.symbol ?? ''}</span>
                </div>
                <span className="font-mono text-[9px] text-dim">
                  {i === 0 ? (isFirst ? 'low' : 'high') : i === 3 ? (isFirst ? 'high' : 'low') : String(i + 1)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Correct order reveal */}
      {checked && (
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-xs text-secondary tracking-widest uppercase">Correct Order</p>
          <div className="flex items-center gap-2">
            {correctOrder.map((z, i) => {
              const el = elMap[z]
              const val = getValue(el, pool.prop)
              const studentRank = ranking.indexOf(z)
              const isCorrect = studentRank === i
              return (
                <div key={z} className="flex flex-col items-center gap-0.5">
                  <div className="w-14 rounded-sm border px-1 py-1.5 flex flex-col items-center gap-0.5"
                    style={{
                      borderColor: isCorrect ? 'rgb(74 222 128 / 0.5)' : 'rgb(248 113 113 / 0.5)',
                      background: isCorrect ? 'rgb(20 83 45 / 0.15)' : 'rgb(127 29 29 / 0.1)',
                    }}>
                    <span className="font-mono text-sm font-semibold text-bright">{el?.symbol}</span>
                    {val !== null && (
                      <span className="font-mono text-[9px]" style={{ color: 'var(--c-halogen)' }}>
                        {typeof val === 'number' ? val.toFixed(val < 10 ? 2 : 0) : val}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[9px] text-dim">{i + 1}</span>
                </div>
              )
            })}
            <span className="font-mono text-xs text-dim ml-1">{pool.unit}</span>
          </div>
          {ranking.every((z, i) => z === correctOrder[i]) && (
            <p className="font-mono text-xs" style={{ color: 'rgb(74 222 128)' }}>Correct!</p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {!checked && (
          <button onClick={handleCheck} disabled={!allRanked}
            className="px-5 py-2 rounded-sm font-sans text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-raised)))',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            }}>
            Check Answer
          </button>
        )}
        <button onClick={handleNext}
          className="px-4 py-2 rounded-sm font-mono text-xs border border-border text-secondary hover:text-bright transition-colors">
          {checked ? 'Next Question ↺' : 'Skip ↺'}
        </button>
      </div>

      <p className="font-mono text-xs text-dim">{pool.label} · {pool.direction === 'asc' ? 'increases →' : 'decreases →'}</p>
    </div>
  )
}
