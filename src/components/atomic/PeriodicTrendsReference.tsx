import { useState, useMemo, useEffect, useCallback, type CSSProperties } from 'react'
import { useElementStore } from '../../stores/elementStore'
import { IE1, EA } from '../../data/periodicTrends'
import type { Element } from '../../types'

type Property = 'atomicRadius' | 'ionizationEnergy' | 'electronegativity' | 'electronAffinity'

const PROPERTIES: { id: Property; label: string; unit: string; desc: string; trend: string }[] = [
  {
    id: 'atomicRadius',
    label: 'Atomic Radius',
    unit: 'pm (vdW)',
    desc: 'Van der Waals radius. Increases down a group as additional electron shells are added. Decreases across a period because rising nuclear charge (Zeff) pulls electrons inward. Largest: Cs; Smallest: He.',
    trend: '↑ increases down groups · ← increases toward left in period',
  },
  {
    id: 'ionizationEnergy',
    label: 'Ionization Energy',
    unit: 'kJ/mol',
    desc: 'Energy required to remove the outermost electron (IE₁). Decreases down a group (electrons farther, more shielded). Increases across a period (higher Zeff). Notable exceptions: B < Be (2p above 2s) and O < N (paired 2p repulsion destabilizes).',
    trend: '↑ increases up groups · → increases across periods (exceptions at B and O)',
  },
  {
    id: 'electronegativity',
    label: 'Electronegativity',
    unit: 'Pauling scale',
    desc: 'Tendency of an atom to attract bonding electrons toward itself. Increases across periods (higher Zeff, smaller radius) and up groups (less shielding). Highest: F (3.98). Lowest: Fr/Cs (~0.7–0.8). Noble gases typically excluded.',
    trend: '↑ increases toward top-right of the main table',
  },
  {
    id: 'electronAffinity',
    label: 'Electron Affinity',
    unit: 'kJ/mol',
    desc: 'Energy released when a neutral atom gains one electron. Positive = exothermic (stable anion). Variable trend with many exceptions. Group 2, 5, and noble gas values are near zero or negative due to electron configuration stability. Halogens are largest.',
    trend: 'Halogens highest · Group 2, 5, 18 near zero or negative (closed/half-filled shells)',
  },
]

function getValue(el: Element, prop: Property): number | null {
  if (prop === 'atomicRadius')     return el.vanDerWaalsRadiusPm > 0 ? el.vanDerWaalsRadiusPm : null
  if (prop === 'ionizationEnergy') return IE1[el.atomicNumber] ?? null
  if (prop === 'electronegativity') return el.electronegativity > 0 ? el.electronegativity : null
  if (prop === 'electronAffinity') return EA[el.atomicNumber] !== undefined ? EA[el.atomicNumber] : null
  return null
}

function useTableSize() {
  const measure = useCallback(() => {
    const w = window.innerWidth
    if (w >= 1280) return { CW: 42, CH: 35, G: 3, FS: 11 }
    if (w >= 1024) return { CW: 36, CH: 30, G: 2, FS: 10 }
    return { CW: 30, CH: 26, G: 2, FS: 9 }
  }, [])

  const [size, setSize] = useState(measure)
  useEffect(() => {
    const handler = () => setSize(measure())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [measure])
  return size
}

function formatV(v: number | null | undefined): string {
  if (v == null) return ''
  return v < 10 ? v.toFixed(2) : String(Math.round(v))
}

const PRINT_STYLES = `
@media print {
  .pt-heatmap {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    filter: saturate(2.2) brightness(0.78);
  }
  .pt-cell {
    height: auto !important;
    min-height: 38px !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 1px !important;
    padding: 2px 1px !important;
  }
  .pt-val { display: block !important; }
  .pt-tooltip { display: none !important; }
  .pt-cell span { color: #000 !important; }
}
`

export default function PeriodicTrendsReference() {
  const { elements, loadElements } = useElementStore()
  const { CW, CH, G, FS } = useTableSize()
  const [prop, setProp]       = useState<Property>('atomicRadius')
  const [hoveredZ, setHoveredZ] = useState<number | null>(null)

  useEffect(() => { loadElements() }, [loadElements])

  const { values, min, max } = useMemo(() => {
    const values: Record<number, number | null> = {}
    let min = Infinity, max = -Infinity
    for (const el of elements) {
      const v = getValue(el, prop)
      values[el.atomicNumber] = v
      if (v !== null && isFinite(v)) {
        if (v > max) max = v
        if (v < min) min = v
      }
    }
    return { values, min: isFinite(min) ? min : 0, max: isFinite(max) ? max : 1 }
  }, [elements, prop])

  function normalize(z: number): number | null {
    const v = values[z]
    if (v === null || v === undefined) return null
    return max === min ? 0.5 : (v - min) / (max - min)
  }

  function cellStyle(z: number): CSSProperties {
    const n = normalize(z)
    if (n === null) {
      return {
        background: 'rgba(var(--overlay),0.03)',
        borderColor: 'rgba(var(--overlay),0.08)',
      }
    }
    const pct = Math.round(8 + n * 67)
    return {
      background: `color-mix(in srgb, var(--c-halogen) ${pct}%, rgb(var(--color-base)))`,
      borderColor: `color-mix(in srgb, var(--c-halogen) ${Math.round(pct * 0.7)}%, transparent)`,
    }
  }

  function symbolColor(z: number): string {
    const n = normalize(z)
    if (n === null) return 'rgba(var(--overlay),0.25)'
    return n > 0.55 ? 'rgba(var(--overlay),0.95)' : 'rgba(var(--overlay),0.65)'
  }

  const mainEls    = elements.filter(el => !(el.atomicNumber >= 57 && el.atomicNumber <= 71)
                                        && !(el.atomicNumber >= 89 && el.atomicNumber <= 103)
                                        && el.group > 0)
  const lanthanides = elements.filter(el => el.atomicNumber >= 57 && el.atomicNumber <= 71)
                               .sort((a, b) => a.atomicNumber - b.atomicNumber)
  const actinides   = elements.filter(el => el.atomicNumber >= 89 && el.atomicNumber <= 103)
                               .sort((a, b) => a.atomicNumber - b.atomicNumber)

  const hoveredEl  = hoveredZ !== null ? elements.find(e => e.atomicNumber === hoveredZ) : null
  const hoveredVal = hoveredZ !== null ? values[hoveredZ] : null
  const propInfo   = PROPERTIES.find(p => p.id === prop)!

  if (elements.length === 0) {
    return <p className="font-mono text-sm text-dim">Loading element data…</p>
  }

  const fBlockOffset = 2 * (CW + G)  // align f-block under column 3

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <style>{PRINT_STYLES}</style>

      {/* Print-only heading */}
      <div className="hidden print:block">
        <p className="font-sans font-semibold text-bright text-base">
          Periodic Trends — {propInfo.label}
          <span className="font-mono text-xs font-normal text-secondary ml-2">({propInfo.unit})</span>
        </p>
      </div>

      {/* Property selector */}
      <div className="flex flex-wrap gap-1.5 print:hidden">
        {PROPERTIES.map(p => {
          const active = prop === p.id
          return (
            <button key={p.id} onClick={() => setProp(p.id)}
              className="relative px-4 py-1.5 rounded-full font-sans text-sm font-medium transition-colors"
              style={{ color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.45)' }}>
              {active && (
                <span className="absolute inset-0 rounded-full" style={{
                  background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                  border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                }} />
              )}
              <span className="relative z-10">{p.label}</span>
            </button>
          )
        })}
      </div>

      {/* Description */}
      <p className="font-sans text-sm text-secondary leading-relaxed max-w-2xl">{propInfo.desc}</p>

      {/* Hover tooltip */}
      <div className="pt-tooltip" style={{ minHeight: 28 }}>
        {hoveredEl ? (
          <div className="font-mono text-xs text-secondary px-3 py-1.5 rounded-sm border border-border bg-raised inline-block">
            <span style={{ color: 'var(--c-halogen)' }}>{hoveredEl.symbol}</span>
            {' '}— {hoveredEl.name} (Z={hoveredEl.atomicNumber})
            {hoveredVal !== null
              ? <> · <span className="text-bright">{typeof hoveredVal === 'number' ? hoveredVal.toFixed(hoveredVal < 10 ? 2 : 0) : hoveredVal}</span> {propInfo.unit}</>
              : <span className="text-dim"> · no data</span>}
          </div>
        ) : (
          <p className="font-mono text-xs text-dim italic print:hidden">hover an element to see its value</p>
        )}
      </div>

      {/* Color legend */}
      <div className="flex items-center gap-3 max-w-xs">
        <span className="font-mono text-[10px] text-secondary whitespace-nowrap">{min.toFixed(min < 10 ? 1 : 0)}</span>
        <div className="flex-1 h-3 rounded-full" style={{
          background: `linear-gradient(to right,
            color-mix(in srgb, var(--c-halogen) 8%, rgb(var(--color-base))),
            color-mix(in srgb, var(--c-halogen) 75%, rgb(var(--color-base))))`,
        }} />
        <span className="font-mono text-[10px] text-secondary whitespace-nowrap">{max.toFixed(max < 10 ? 1 : 0)}</span>
        <span className="font-mono text-[10px] text-dim">{propInfo.unit.split(' ')[0]}</span>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto pb-2">
        <div className="pt-heatmap" style={{ display: 'flex', flexDirection: 'column', gap: G, width: 18 * CW + 17 * G }}>

          {/* Main table: rows 1–7 */}
          {([1,2,3,4,5,6,7] as const).map(period => {
            const rowEls = mainEls.filter(el => el.period === period)
            return (
              <div key={period} style={{
                display: 'grid',
                gridTemplateColumns: `repeat(18, ${CW}px)`,
                gap: G,
              }}>
                {rowEls.map(el => (
                  <div key={el.atomicNumber}
                    className="pt-cell"
                    onMouseEnter={() => setHoveredZ(el.atomicNumber)}
                    onMouseLeave={() => setHoveredZ(null)}
                    style={{
                      gridColumn: el.group,
                      width: CW, height: CH,
                      borderRadius: 2,
                      border: '1px solid',
                      cursor: 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      outline: hoveredZ === el.atomicNumber ? '2px solid rgba(var(--overlay),0.4)' : 'none',
                      outlineOffset: 1,
                      transition: 'outline 0.05s',
                      ...cellStyle(el.atomicNumber),
                    }}
                  >
                    <span style={{ fontFamily: 'monospace', fontSize: FS, color: symbolColor(el.atomicNumber), userSelect: 'none' }}>
                      {el.symbol}
                    </span>
                    <span className="pt-val" style={{ display: 'none', fontFamily: 'monospace', fontSize: Math.round(FS * 0.65), color: symbolColor(el.atomicNumber) }}>
                      {formatV(values[el.atomicNumber])}
                    </span>
                  </div>
                ))}

                {/* Footnote placeholder */}
                {(period === 6 || period === 7) && (
                  <div style={{
                    gridColumn: 3,
                    width: CW, height: CH,
                    border: '1px dashed rgba(var(--overlay),0.15)',
                    borderRadius: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 7, color: 'rgba(var(--overlay),0.3)' }}>
                      {period === 6 ? '*' : '**'}
                    </span>
                  </div>
                )}
              </div>
            )
          })}

          {/* Gap between main table and f-block */}
          <div style={{ height: 8 }} />

          {/* Lanthanides (*) */}
          <div style={{ display: 'flex', gap: G, paddingLeft: fBlockOffset }}>
            {lanthanides.map(el => (
              <div key={el.atomicNumber}
                className="pt-cell"
                onMouseEnter={() => setHoveredZ(el.atomicNumber)}
                onMouseLeave={() => setHoveredZ(null)}
                style={{
                  width: CW, height: CH,
                  borderRadius: 2,
                  border: '1px solid',
                  cursor: 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  outline: hoveredZ === el.atomicNumber ? '2px solid rgba(var(--overlay),0.4)' : 'none',
                  outlineOffset: 1,
                  transition: 'outline 0.05s',
                  ...cellStyle(el.atomicNumber),
                }}
              >
                <span style={{ fontFamily: 'monospace', fontSize: FS, color: symbolColor(el.atomicNumber), userSelect: 'none' }}>
                  {el.symbol}
                </span>
                <span className="pt-val" style={{ display: 'none', fontFamily: 'monospace', fontSize: Math.round(FS * 0.65), color: symbolColor(el.atomicNumber) }}>
                  {formatV(values[el.atomicNumber])}
                </span>
              </div>
            ))}
          </div>

          {/* Actinides (**) */}
          <div style={{ display: 'flex', gap: G, paddingLeft: fBlockOffset }}>
            {actinides.map(el => (
              <div key={el.atomicNumber}
                className="pt-cell"
                onMouseEnter={() => setHoveredZ(el.atomicNumber)}
                onMouseLeave={() => setHoveredZ(null)}
                style={{
                  width: CW, height: CH,
                  borderRadius: 2,
                  border: '1px solid',
                  cursor: 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  outline: hoveredZ === el.atomicNumber ? '2px solid rgba(var(--overlay),0.4)' : 'none',
                  outlineOffset: 1,
                  transition: 'outline 0.05s',
                  ...cellStyle(el.atomicNumber),
                }}
              >
                <span style={{ fontFamily: 'monospace', fontSize: FS, color: symbolColor(el.atomicNumber), userSelect: 'none' }}>
                  {el.symbol}
                </span>
                <span className="pt-val" style={{ display: 'none', fontFamily: 'monospace', fontSize: Math.round(FS * 0.65), color: symbolColor(el.atomicNumber) }}>
                  {formatV(values[el.atomicNumber])}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="font-mono text-xs text-secondary">{propInfo.trend}</p>
    </div>
  )
}
