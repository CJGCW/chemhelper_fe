import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CATIONS, ANIONS, solLookup, buildFormula, SOL_LABEL, SOL_COLOR } from '../../utils/solubilityData'
import type { Sol } from '../../utils/solubilityData'

// ── Compound database ─────────────────────────────────────────────────────────
// Each entry represents a soluble ionic compound that can be typed as a reactant.

interface Compound {
  formula: string     // canonical display formula
  name: string
  catId: string
  aniId: string
}

function buildCompounds(): Compound[] {
  const out: Compound[] = []
  for (const cat of CATIONS) {
    for (const ani of ANIONS) {
      const { sol } = solLookup(cat.id, ani.id)
      if (sol === 'S' || sol === 'SS') {
        out.push({
          formula: buildFormula(cat, ani),
          name: `${cat.name} ${ani.name}`,
          catId: cat.id,
          aniId: ani.id,
        })
      }
    }
  }
  return out
}

const COMPOUNDS = buildCompounds()

// Search aliases — common input variants → canonical formula
const ALIASES: Record<string, string> = {
  'NaCl': 'NaCl', 'nacl': 'NaCl',
  'KCl': 'KCl', 'kcl': 'KCl',
  'AgNO3': 'AgNO₃', 'agno3': 'AgNO₃',
  'BaCl2': 'BaCl₂', 'bacl2': 'BaCl₂',
  'Na2SO4': 'Na₂SO₄', 'na2so4': 'Na₂SO₄',
  'K2SO4': 'K₂SO₄', 'k2so4': 'K₂SO₄',
  'CaCl2': 'CaCl₂', 'cacl2': 'CaCl₂',
  'MgCl2': 'MgCl₂', 'mgcl2': 'MgCl₂',
  'FeCl2': 'FeCl₂', 'fecl2': 'FeCl₂',
  'FeCl3': 'FeCl₃', 'fecl3': 'FeCl₃',
  'CuSO4': 'CuSO₄', 'cuso4': 'CuSO₄',
  'ZnSO4': 'ZnSO₄', 'znso4': 'ZnSO₄',
  'Pb(NO3)2': 'Pb(NO₃)₂', 'pb(no3)2': 'Pb(NO₃)₂',
  'AgCl': 'AgCl',
  'BaSO4': 'BaSO₄', 'baso4': 'BaSO₄',
  'Na2CO3': 'Na₂CO₃', 'na2co3': 'Na₂CO₃',
  'K2CO3': 'K₂CO₃', 'k2co3': 'K₂CO₃',
  'Na3PO4': 'Na₃PO₄', 'na3po4': 'Na₃PO₄',
  'K3PO4': 'K₃PO₄', 'k3po4': 'K₃PO₄',
  'NaOH': 'NaOH', 'naoh': 'NaOH',
  'KOH': 'KOH', 'koh': 'KOH',
  'NH4Cl': 'NH₄Cl', 'nh4cl': 'NH₄Cl',
  'NH4NO3': 'NH₄NO₃', 'nh4no3': 'NH₄NO₃',
  'Li2SO4': 'Li₂SO₄', 'li2so4': 'Li₂SO₄',
  'LiCl': 'LiCl', 'licl': 'LiCl',
  'SrCl2': 'SrCl₂', 'srcl2': 'SrCl₂',
}

// Reverse alias: canonical subscript formula → Compound
const FORMULA_TO_COMPOUND = new Map<string, Compound>()
for (const c of COMPOUNDS) {
  FORMULA_TO_COMPOUND.set(c.formula, c)
}

function resolveInput(raw: string): Compound | null {
  const trimmed = raw.trim()
  // Try exact alias first
  const alias = ALIASES[trimmed] ?? ALIASES[trimmed.toLowerCase()]
  if (alias) {
    const c = FORMULA_TO_COMPOUND.get(alias)
    if (c) return c
  }
  // Try direct lookup (user may have typed subscript already)
  return FORMULA_TO_COMPOUND.get(trimmed) ?? null
}

function matchCompounds(query: string): Compound[] {
  if (query.length < 2) return []
  const q = query.toLowerCase()
  return COMPOUNDS.filter(c =>
    c.formula.toLowerCase().includes(q) ||
    c.name.toLowerCase().includes(q) ||
    Object.keys(ALIASES).some(k => k.toLowerCase().startsWith(q) && ALIASES[k] === c.formula)
  ).slice(0, 8)
}

// ── Prediction logic ──────────────────────────────────────────────────────────

interface ProductInfo {
  formula: string
  name: string
  sol: Sol
  rule: string
}

interface PredictionResult {
  type: 'double_displacement'
  reactant1: string
  reactant2: string
  product1: ProductInfo
  product2: ProductInfo
  hasReaction: boolean   // true if at least one product is insoluble
  netIonic?: string
}

function predict(a: Compound, b: Compound): PredictionResult {
  const cat1 = CATIONS.find(c => c.id === a.catId)!
  const ani1 = ANIONS.find(x => x.id === a.aniId)!
  const cat2 = CATIONS.find(c => c.id === b.catId)!
  const ani2 = ANIONS.find(x => x.id === b.aniId)!

  // Exchange partners: cat1+ani2 and cat2+ani1
  const p1 = buildFormula(cat1, ani2)
  const p2 = buildFormula(cat2, ani1)
  const r1 = solLookup(cat1.id, ani2.id)
  const r2 = solLookup(cat2.id, ani1.id)

  const pi1: ProductInfo = { formula: p1, name: `${cat1.name} ${ani2.name}`, sol: r1.sol, rule: r1.rule }
  const pi2: ProductInfo = { formula: p2, name: `${cat2.name} ${ani1.name}`, sol: r2.sol, rule: r2.rule }

  const hasReaction = r1.sol === 'I' || r2.sol === 'I'

  // Build simplified net ionic if there's a precipitate
  let netIonic: string | undefined
  if (r1.sol === 'I') {
    netIonic = `${cat1.formula} + ${ani2.formula} → ${p1}(s)  ↓`
  } else if (r2.sol === 'I') {
    netIonic = `${cat2.formula} + ${ani1.formula} → ${p2}(s)  ↓`
  }

  return {
    type: 'double_displacement',
    reactant1: a.formula,
    reactant2: b.formula,
    product1: pi1,
    product2: pi2,
    hasReaction,
    netIonic,
  }
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function Autocomplete({
  query, onSelect,
}: {
  query: string
  onSelect: (c: Compound) => void
}) {
  const matches = useMemo(() => matchCompounds(query), [query])
  if (!matches.length || !query) return null

  return (
    <div
      className="absolute top-full left-0 right-0 mt-1 rounded-sm border border-border z-30 overflow-hidden"
      style={{ background: 'rgb(var(--color-surface))' }}
    >
      {matches.map(c => (
        <button
          key={c.formula}
          onMouseDown={e => { e.preventDefault(); onSelect(c) }}
          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-raised transition-colors"
        >
          <span className="font-mono text-sm text-primary">{c.formula}</span>
          <span className="font-sans text-xs text-dim">{c.name}</span>
        </button>
      ))}
    </div>
  )
}

function ProductCard({ p }: { p: ProductInfo }) {
  const color = SOL_COLOR[p.sol]
  return (
    <div
      className="flex-1 rounded-sm border p-3 flex flex-col gap-1.5"
      style={{ borderColor: `color-mix(in srgb, ${color} 35%, transparent)`, background: `color-mix(in srgb, ${color} 8%, rgb(var(--color-surface)))` }}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="font-mono text-lg font-semibold text-primary">{p.formula}</span>
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-sm"
          style={{ color, background: `color-mix(in srgb, ${color} 18%, rgb(var(--color-raised)))`, border: `1px solid color-mix(in srgb, ${color} 30%, transparent)` }}>
          {SOL_LABEL[p.sol]}
          {p.sol === 'I' && ' ↓'}
        </span>
      </div>
      <span className="font-sans text-xs text-secondary">{p.name}</span>
      <span className="font-mono text-xs text-secondary leading-snug">{p.rule}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ReactionPredictor() {
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')
  const [focus1, setFocus1] = useState(false)
  const [focus2, setFocus2] = useState(false)
  const [compound1, setCompound1] = useState<Compound | null>(null)
  const [compound2, setCompound2] = useState<Compound | null>(null)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function pickCompound1(c: Compound) {
    setCompound1(c)
    setQ1(c.formula)
    setFocus1(false)
  }

  function pickCompound2(c: Compound) {
    setCompound2(c)
    setQ2(c.formula)
    setFocus2(false)
  }

  function handlePredict() {
    setError(null)
    setResult(null)

    const a = compound1 ?? resolveInput(q1)
    const b = compound2 ?? resolveInput(q2)

    if (!a) { setError(`"${q1}" not recognized. Try a formula like NaCl, CuSO4, or Pb(NO3)2.`); return }
    if (!b) { setError(`"${q2}" not recognized. Try a formula like NaCl, CuSO4, or Pb(NO3)2.`); return }
    if (a.catId === b.catId && a.aniId === b.aniId) { setError('Both compounds are the same.'); return }

    setResult(predict(a, b))
  }

  // Examples for quick fill
  const EXAMPLES: [string, string][] = [
    ['AgNO3',    'NaCl'   ],
    ['BaCl2',    'Na2SO4' ],
    ['Pb(NO3)2', 'KI'     ],
    ['CuSO4',    'NaOH'   ],
    ['FeCl3',    'NaOH'   ],
    ['Ca(OH)2',  'Na2CO3' ],
  ]

  function loadExample(a: string, b: string) {
    const ca = resolveInput(a)
    const cb = resolveInput(b)
    if (!ca || !cb) return
    setQ1(ca.formula); setCompound1(ca)
    setQ2(cb.formula); setCompound2(cb)
    setError(null)
    setResult(predict(ca, cb))
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Input row */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">

          {/* Reactant 1 */}
          <div className="relative flex-1 min-w-36">
            <input
              type="text"
              value={q1}
              onChange={e => { setQ1(e.target.value); setCompound1(null); setResult(null) }}
              onFocus={() => setFocus1(true)}
              onBlur={() => setTimeout(() => setFocus1(false), 120)}
              onKeyDown={e => e.key === 'Enter' && handlePredict()}
              placeholder="e.g. AgNO3"
              className="w-full font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2.5
                         text-primary placeholder-dim focus:outline-none transition-colors"
              style={{ borderColor: compound1 ? 'color-mix(in srgb, var(--c-halogen) 40%, transparent)' : undefined }}
            />
            {focus1 && <Autocomplete query={q1} onSelect={pickCompound1} />}
          </div>

          <span className="font-mono text-secondary shrink-0">+</span>

          {/* Reactant 2 */}
          <div className="relative flex-1 min-w-36">
            <input
              type="text"
              value={q2}
              onChange={e => { setQ2(e.target.value); setCompound2(null); setResult(null) }}
              onFocus={() => setFocus2(true)}
              onBlur={() => setTimeout(() => setFocus2(false), 120)}
              onKeyDown={e => e.key === 'Enter' && handlePredict()}
              placeholder="e.g. NaCl"
              className="w-full font-mono text-sm bg-raised border border-border rounded-sm px-3 py-2.5
                         text-primary placeholder-dim focus:outline-none transition-colors"
              style={{ borderColor: compound2 ? 'color-mix(in srgb, var(--c-halogen) 40%, transparent)' : undefined }}
            />
            {focus2 && <Autocomplete query={q2} onSelect={pickCompound2} />}
          </div>

          <button
            onClick={handlePredict}
            disabled={!q1.trim() || !q2.trim()}
            className="shrink-0 px-5 py-2.5 rounded-sm font-sans font-medium text-sm transition-all disabled:opacity-40"
            style={{
              background: 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))',
              border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
              color: 'var(--c-halogen)',
            }}
          >
            Predict
          </button>
        </div>

        {/* Examples */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-xs text-secondary">Try:</span>
          {EXAMPLES.map(([a, b]) => (
            <button
              key={`${a}+${b}`}
              onClick={() => loadExample(a, b)}
              className="font-mono text-[11px] px-2 py-0.5 rounded-sm border border-border
                         text-secondary hover:text-primary hover:border-muted transition-colors"
            >
              {(resolveInput(a)?.formula ?? a)} + {(resolveInput(b)?.formula ?? b)}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      {/* Result */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={`${result.reactant1}+${result.reactant2}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-4"
          >
            {/* Reaction type badge */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs tracking-widest uppercase text-secondary">Type</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-sm border border-border text-secondary">
                Double Displacement
              </span>
              {result.hasReaction ? (
                <span className="font-mono text-xs px-2 py-0.5 rounded-sm"
                  style={{
                    color: '#4ade80',
                    background: 'color-mix(in srgb, #4ade80 12%, rgb(var(--color-raised)))',
                    border: '1px solid color-mix(in srgb, #4ade80 30%, transparent)',
                  }}>
                  Reaction occurs ✓
                </span>
              ) : (
                <span className="font-mono text-xs px-2 py-0.5 rounded-sm"
                  style={{
                    color: 'rgba(var(--overlay),0.35)',
                    background: 'rgb(var(--color-raised))',
                    border: '1px solid rgb(var(--color-border))',
                  }}>
                  No reaction (NR)
                </span>
              )}
            </div>

            {/* Molecular equation */}
            <div
              className="rounded-sm border border-border px-4 py-3 font-mono text-sm text-primary overflow-x-auto"
              style={{ background: 'rgb(var(--color-base))' }}
            >
              {result.reactant1}(aq) + {result.reactant2}(aq) →{' '}
              {result.product1.formula}{result.product1.sol === 'I' ? '(s)' : '(aq)'}
              {' '}+{' '}
              {result.product2.formula}{result.product2.sol === 'I' ? '(s)' : '(aq)'}
            </div>

            {/* Products */}
            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
              <ProductCard p={result.product1} />
              <ProductCard p={result.product2} />
            </div>

            {/* Net ionic */}
            {result.netIonic && (
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs tracking-widest uppercase text-secondary">Net Ionic Equation</span>
                <div
                  className="rounded-sm border px-4 py-3 font-mono text-sm text-primary overflow-x-auto"
                  style={{
                    background: 'rgb(var(--color-base))',
                    borderColor: 'color-mix(in srgb, #4ade80 25%, transparent)',
                  }}
                >
                  {result.netIonic}
                </div>
              </div>
            )}

            {/* No-reaction explanation */}
            {!result.hasReaction && (
              <p className="font-mono text-xs text-dim">
                Both products are soluble — all ions remain in solution and no net reaction occurs.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supported compounds hint */}
      {!result && !error && (
        <p className="font-mono text-xs text-secondary leading-relaxed">
          Precipitation reactions only (double displacement between two soluble ionic compounds).
          Supports common cations (Na⁺, K⁺, Ca²⁺, Cu²⁺, Fe²⁺/³⁺, Ag⁺, Pb²⁺…) and anions (Cl⁻, SO₄²⁻, OH⁻, CO₃²⁻, NO₃⁻, PO₄³⁻…).
          For acid-base neutralization or gas-forming reactions, use the Reaction Classifier tab.
        </p>
      )}
    </div>
  )
}
