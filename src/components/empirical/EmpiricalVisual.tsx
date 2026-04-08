import { useMemo, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useElementStore } from '../../stores/elementStore'
import { buildMolarMasses, parseFormula } from '../../utils/empiricalFormula'

// ── Presets ───────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: 'CH₄',     formula: 'CH4'      },
  { label: 'H₂O',     formula: 'H2O'      },
  { label: 'CO₂',     formula: 'CO2'      },
  { label: 'NH₃',     formula: 'NH3'      },
  { label: 'NaCl',    formula: 'NaCl'     },
  { label: 'Fe₂O₃',  formula: 'Fe2O3'    },
  { label: 'C₆H₆',   formula: 'C6H6'     },
  { label: 'Glucose', formula: 'C6H12O6' },
]

// ── Colors ────────────────────────────────────────────────────────────────────

const PALETTE: Record<string, string> = {
  H:  '#60a5fa', C:  '#9ca3af', N:  '#818cf8', O:  '#ef4444',
  Na: '#fbbf24', Mg: '#2dd4bf', Cl: '#4ade80', Ca: '#f472b6',
  Fe: '#f97316', Cu: '#f59e0b', S:  '#facc15', P:  '#fb923c',
  K:  '#d946ef', Al: '#94a3b8', Si: '#84cc16', Br: '#e8622e',
}
const FALLBACK = '#818cf8'
function elColor(sym: string) { return PALETTE[sym] ?? FALLBACK }

function lighten(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.min(255, r + 80)},${Math.min(255, g + 80)},${Math.min(255, b + 80)})`
}

// ── Sizing math ───────────────────────────────────────────────────────────────
//
// Box area (px²) = BOX_SCALE × molarMass
// Atom area (px²) = π × r²  where r = ATOM_SCALE × √(atomicMass)
// ⟹ totalAtomArea = π × ATOM_SCALE² × molarMass
// ⟹ packing fraction = π × ATOM_SCALE² / BOX_SCALE  (target ≈ 0.65)
// ⟹ ATOM_SCALE = √(BOX_SCALE × 0.65 / π)
//
const BOX_SCALE  = 900
const ATOM_SCALE = Math.sqrt((BOX_SCALE * 0.65) / Math.PI) // ≈ 13.7

// ── Packing ───────────────────────────────────────────────────────────────────

interface PlacedAtom {
  key: string
  cx: number
  cy: number
  r: number
  symbol: string
  color: string
  atomMass: number
  idx: number
}

function packAtoms(
  elems: { symbol: string; count: number; atomMass: number; color: string }[],
  boxW: number,
  sizeScale: number,
  gap = 4,
  pad = 10,
): { atoms: PlacedAtom[]; neededH: number } {
  const all: { symbol: string; r: number; atomMass: number; color: string }[] = []
  for (const el of elems) {
    const r = Math.max(ATOM_SCALE * Math.sqrt(el.atomMass) * sizeScale, 6)
    for (let i = 0; i < el.count; i++) {
      all.push({ symbol: el.symbol, r, atomMass: el.atomMass, color: el.color })
    }
  }
  // Largest first so big atoms anchor each row
  all.sort((a, b) => b.r - a.r)

  const placed: PlacedAtom[] = []
  let x = pad, y = pad, rowMaxR = 0

  for (let i = 0; i < all.length; i++) {
    const { symbol, r, atomMass, color } = all[i]
    if (i > 0 && x + r * 2 > boxW - pad) {
      y += rowMaxR * 2 + gap
      x = pad
      rowMaxR = 0
    }
    placed.push({ key: `${symbol}-${i}`, cx: x + r, cy: y + r, r, symbol, color, atomMass, idx: i })
    x += r * 2 + gap
    rowMaxR = Math.max(rowMaxR, r)
  }

  return { atoms: placed, neededH: y + rowMaxR * 2 + pad }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EmpiricalVisual() {
  const { elements, loadElements } = useElementStore()
  const molarMasses = useMemo(() => buildMolarMasses(elements), [elements])

  const [formula, setFormula]     = useState('CH4')
  const [draft, setDraft]         = useState('CH4')
  const [error, setError]         = useState('')
  const [hoveredSeg, setHoveredSeg] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const [maxW, setMaxW] = useState(560)

  useEffect(() => { loadElements() }, [loadElements])

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(e => setMaxW(e[0].contentRect.width))
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // ── Build visual data ──────────────────────────────────────────────────────

  const visual = useMemo(() => {
    if (!elements.length) return null
    const counts = parseFormula(formula)
    if (!counts) return null

    const elems = Object.entries(counts)
      .filter(([sym]) => sym in molarMasses)
      .map(([sym, count]) => ({
        symbol:   sym,
        count,
        atomMass: molarMasses[sym],
        color:    elColor(sym),
      }))
    if (!elems.length) return null

    const molarMass = elems.reduce((s, e) => s + e.count * e.atomMass, 0)

    // Box width from molar mass; cap at container
    const rawW      = Math.sqrt(BOX_SCALE * molarMass)
    const capW      = Math.min(rawW, maxW - 4)
    const sizeScale = capW / rawW          // < 1 only when capped
    const boxW      = capW

    const { atoms, neededH } = packAtoms(elems, boxW, sizeScale)
    // Height: at minimum same as width (square = proportional area); expand if atoms overflow
    const boxH = Math.max(boxW, neededH)

    return { elems, molarMass, boxW, boxH, atoms, rawW, capW }
  }, [formula, elements, molarMasses, maxW])

  // ── Formula submission ────────────────────────────────────────────────────

  function submitFormula(raw: string) {
    const f = raw.trim()
    if (!f) return
    const counts = parseFormula(f)
    if (!counts) { setError('Cannot parse formula'); return }
    const unknowns = Object.keys(counts).filter(s => !(s in molarMasses))
    if (unknowns.length) { setError(`Unknown element${unknowns.length > 1 ? 's' : ''}: ${unknowns.join(', ')}`); return }
    setError('')
    setFormula(f)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="flex flex-col gap-5">

      {/* Preset pills */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => {
          const active = formula === p.formula
          return (
            <button
              key={p.formula}
              onClick={() => { setFormula(p.formula); setDraft(p.formula); setError('') }}
              className="px-3 py-1 rounded-full font-mono text-xs transition-all duration-150"
              style={{
                border:     active ? '1px solid var(--c-halogen)' : '1px solid #1c1f2e',
                background: active ? 'color-mix(in srgb, var(--c-halogen) 14%, #0a0c12)' : '#0d0f18',
                color:      active ? 'var(--c-halogen)' : '#7b82a0',
              }}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      {/* Custom formula input */}
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { submitFormula(draft) } }}
          placeholder="e.g. C6H12O6"
          className="flex-1 bg-transparent border border-border rounded-sm px-3 py-1.5 font-mono text-sm text-bright
                     placeholder:text-dim focus:outline-none focus:border-[var(--c-halogen)] transition-colors"
          style={{ maxWidth: 200 }}
          spellCheck={false}
        />
        <button
          onClick={() => submitFormula(draft)}
          className="px-3 py-1.5 rounded-sm font-mono text-xs text-secondary border border-border
                     hover:border-[var(--c-halogen)] hover:text-[var(--c-halogen)] transition-all duration-150"
        >
          Draw
        </button>
        {error && <span className="font-mono text-xs" style={{ color: '#f87171' }}>{error}</span>}
      </div>

      {/* Loading */}
      {!elements.length && (
        <p className="font-mono text-xs text-dim animate-pulse">Loading element data…</p>
      )}

      {/* Visualization */}
      {visual && (
        <AnimatePresence mode="wait">
          <motion.div
            key={formula}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* Mass % stacked bar — one segment per atom */}
            {(() => {
              let cumPct = 0
              const groups = visual.elems.map(el => {
                const perAtomPct = (el.atomMass / visual.molarMass) * 100
                const totalPct   = perAtomPct * el.count
                const startPct   = cumPct
                cumPct += totalPct
                return { ...el, perAtomPct, totalPct, startPct }
              })

              let segIdx = 0
              const atomSegments: { symbol: string; color: string; pct: number; key: string; idx: number }[] = []
              for (const el of visual.elems) {
                const pct = (el.atomMass / visual.molarMass) * 100
                for (let i = 0; i < el.count; i++) {
                  atomSegments.push({ symbol: el.symbol, color: el.color, pct, key: `${el.symbol}-${i}`, idx: segIdx++ })
                }
              }

              return (
                <div className="flex flex-col gap-1">
                  <div className="font-mono text-xs text-secondary uppercase tracking-widest">Mass composition</div>

                  {/* Brackets */}
                  <div style={{ position: 'relative', height: 32 }}>
                    {groups.map(group => (
                      <div
                        key={group.symbol}
                        style={{
                          position:      'absolute',
                          left:          `${group.startPct}%`,
                          width:         `${group.totalPct}%`,
                          display:       'flex',
                          flexDirection: 'column',
                          alignItems:    'center',
                          paddingInline: 2,
                          boxSizing:     'border-box',
                        }}
                      >
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize:   12,
                          fontWeight: 600,
                          color:      group.color,
                          whiteSpace: 'nowrap',
                          lineHeight: 1.4,
                        }}>
                          {group.totalPct.toFixed(1)}%
                        </span>
                        <div style={{
                          width:       '100%',
                          height:      9,
                          borderLeft:  `1.5px solid ${group.color}`,
                          borderRight: `1.5px solid ${group.color}`,
                          borderBottom:`1.5px solid ${group.color}`,
                          opacity:     0.5,
                          boxSizing:   'border-box',
                        }} />
                      </div>
                    ))}
                  </div>

                  {/* Bar + floating tooltip wrapper */}
                  <div style={{ position: 'relative' }}>
                    {/* Floating tooltip — sits above the bar, never clipped */}
                    <AnimatePresence>
                      {hoveredSeg !== null && (() => {
                        const seg = atomSegments[hoveredSeg]
                        const leftPct = atomSegments
                          .slice(0, hoveredSeg)
                          .reduce((s, a) => s + a.pct, 0) + seg.pct / 2
                        return (
                          <motion.div
                            key="tip"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.1 }}
                            style={{
                              position:     'absolute',
                              bottom:       '100%',
                              left:         `${leftPct}%`,
                              transform:    'translateX(-50%)',
                              marginBottom: 5,
                              background:   '#13161f',
                              border:       `1px solid ${seg.color}66`,
                              borderRadius: 4,
                              padding:      '2px 7px',
                              fontFamily:   'monospace',
                              fontSize:     12,
                              fontWeight:   600,
                              color:        seg.color,
                              whiteSpace:   'nowrap',
                              zIndex:       20,
                              pointerEvents:'none',
                            }}
                          >
                            {seg.pct.toFixed(2)}%
                          </motion.div>
                        )
                      })()}
                    </AnimatePresence>

                    {/* Bar — flex: N proportional sizing so no overflow from gaps */}
                    <div className="flex rounded-sm overflow-hidden" style={{ height: 52 }}>
                      {atomSegments.map((seg, i) => {
                        const isHovered = hoveredSeg === seg.idx
                        return (
                          <motion.div
                            key={seg.key}
                            onMouseEnter={() => setHoveredSeg(seg.idx)}
                            onMouseLeave={() => setHoveredSeg(null)}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: i * 0.06, duration: 0.3, ease: 'easeOut' }}
                            style={{
                              flex:            seg.pct,
                              minWidth:        0,
                              background:      seg.color,
                              opacity:         isHovered ? 1 : 0.85,
                              transformOrigin: 'left center',
                              display:         'flex',
                              alignItems:      'center',
                              justifyContent:  'center',
                              overflow:        'hidden',
                              cursor:          'default',
                              transition:      'opacity 0.12s',
                              borderRight:     i < atomSegments.length - 1
                                                 ? '1px solid rgba(7,9,14,0.45)'
                                                 : 'none',
                            }}
                          >
                            <span style={{
                              fontFamily: 'monospace',
                              fontSize:   13,
                              fontWeight: 700,
                              color:      '#07090e',
                              userSelect: 'none',
                            }}>
                              {seg.symbol}
                            </span>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Per-element breakdown */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    {groups.map(group => (
                      <div key={group.symbol} className="flex items-center gap-1.5 font-mono text-xs">
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: group.color, flexShrink: 0 }} />
                        <span className="text-bright">{group.symbol}</span>
                        {group.count > 1 ? (
                          <>
                            <span className="text-dim">×{group.count}</span>
                            <span style={{ color: '#4a4f6a' }}>({group.perAtomPct.toFixed(2)}% each)</span>
                            <span className="font-semibold" style={{ color: group.color }}>{group.totalPct.toFixed(1)}% total</span>
                          </>
                        ) : (
                          <span className="font-semibold" style={{ color: group.color }}>{group.totalPct.toFixed(1)}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* SVG box */}
            <svg
              width={visual.boxW}
              height={visual.boxH}
              style={{ display: 'block', overflow: 'visible' }}
            >
              <defs>
                {visual.elems.map(el => (
                  <radialGradient key={el.symbol} id={`rg-${el.symbol}`} cx="35%" cy="30%" r="65%">
                    <stop offset="0%"   stopColor={lighten(el.color)} />
                    <stop offset="100%" stopColor={el.color} />
                  </radialGradient>
                ))}
              </defs>

              {/* Box */}
              <rect
                x={0} y={0}
                width={visual.boxW} height={visual.boxH}
                fill="#07090e"
                stroke="#1c1f2e"
                strokeWidth={1.5}
                rx={8}
              />

              {/* Corner label: molar mass */}
              <text
                x={visual.boxW - 8} y={visual.boxH - 8}
                textAnchor="end"
                fontSize={11}
                fontFamily="monospace"
                fill="#2e3352"
              >
                {visual.molarMass.toFixed(2)} g/mol
              </text>

              {/* Area label */}
              <text
                x={8} y={visual.boxH - 8}
                textAnchor="start"
                fontSize={11}
                fontFamily="monospace"
                fill="#2e3352"
              >
                area ∝ {visual.molarMass.toFixed(0)} u
              </text>

              {/* Atoms */}
              {visual.atoms.map((atom) => (
                <motion.g
                  key={atom.key}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay:     atom.idx * 0.04,
                    type:      'spring',
                    stiffness: 300,
                    damping:   20,
                  }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                >
                  <circle
                    cx={atom.cx} cy={atom.cy} r={atom.r}
                    fill={`url(#rg-${atom.symbol})`}
                    style={{ filter: `drop-shadow(0 1px 5px ${atom.color}55)` }}
                  />
                  {atom.r >= 7 && (
                    <text
                      x={atom.cx} y={atom.cy}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={Math.max(10, atom.r * 0.55)}
                      fontFamily="monospace"
                      fontWeight="700"
                      fill="#fff"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {atom.symbol}
                    </text>
                  )}
                </motion.g>
              ))}
            </svg>

            {/* Caption */}
            <p className="font-sans text-sm text-secondary italic">
              Each atom's area is proportional to its atomic mass.
              The box area is proportional to the compound's molar mass.
            </p>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
