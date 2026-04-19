import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ─────────────────────────────────────────────────────────────────────

type WaterRxn = 'cold_violent' | 'cold' | 'hot' | 'steam' | 'acid_only' | 'none'

interface ActivityMetal {
  symbol: string
  name: string
  rank: number       // 1 = most active; lower = more active
  charge: string     // e.g. '+2'
  ion: string        // display, e.g. 'Fe²⁺'
  waterRxn: WaterRxn
  aboveH2: boolean   // reacts with dilute acids to produce H₂
  waterEq?: string   // representative water reaction
  acidEq?: string    // representative acid reaction (with HCl)
  displaceEq?: string  // example displacement (with a salt of a less active metal)
  note?: string
}

interface ActivityHalogen {
  formula: string   // e.g. 'Cl₂'
  ion: string       // e.g. 'Cl⁻'
  name: string
  rank: number      // 1 = most active
}

// ── Data ─────────────────────────────────────────────────────────────────────

const METALS: ActivityMetal[] = [
  {
    symbol: 'Li', name: 'Lithium',   rank: 1,  charge: '+1', ion: 'Li⁺',
    waterRxn: 'cold_violent', aboveH2: true,
    waterEq:  '2Li(s) + 2H₂O(l) → 2LiOH(aq) + H₂(g)',
    acidEq:   '2Li(s) + 2HCl(aq) → 2LiCl(aq) + H₂(g)',
  },
  {
    symbol: 'K',  name: 'Potassium', rank: 2,  charge: '+1', ion: 'K⁺',
    waterRxn: 'cold_violent', aboveH2: true,
    waterEq:  '2K(s) + 2H₂O(l) → 2KOH(aq) + H₂(g)',
    acidEq:   '2K(s) + 2HCl(aq) → 2KCl(aq) + H₂(g)',
  },
  {
    symbol: 'Ba', name: 'Barium',    rank: 3,  charge: '+2', ion: 'Ba²⁺',
    waterRxn: 'cold', aboveH2: true,
    waterEq:  'Ba(s) + 2H₂O(l) → Ba(OH)₂(aq) + H₂(g)',
    acidEq:   'Ba(s) + 2HCl(aq) → BaCl₂(aq) + H₂(g)',
  },
  {
    symbol: 'Ca', name: 'Calcium',   rank: 4,  charge: '+2', ion: 'Ca²⁺',
    waterRxn: 'cold', aboveH2: true,
    waterEq:  'Ca(s) + 2H₂O(l) → Ca(OH)₂(aq) + H₂(g)',
    acidEq:   'Ca(s) + 2HCl(aq) → CaCl₂(aq) + H₂(g)',
  },
  {
    symbol: 'Na', name: 'Sodium',    rank: 5,  charge: '+1', ion: 'Na⁺',
    waterRxn: 'cold_violent', aboveH2: true,
    waterEq:  '2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂(g)',
    acidEq:   '2Na(s) + 2HCl(aq) → 2NaCl(aq) + H₂(g)',
  },
  {
    symbol: 'Mg', name: 'Magnesium', rank: 6,  charge: '+2', ion: 'Mg²⁺',
    waterRxn: 'hot', aboveH2: true,
    waterEq:  'Mg(s) + 2H₂O(l) → Mg(OH)₂(aq) + H₂(g)  [hot water]',
    acidEq:   'Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)',
    displaceEq: 'Mg(s) + ZnSO₄(aq) → MgSO₄(aq) + Zn(s)',
  },
  {
    symbol: 'Al', name: 'Aluminum',  rank: 7,  charge: '+3', ion: 'Al³⁺',
    waterRxn: 'steam', aboveH2: true,
    waterEq:  '2Al(s) + 6H₂O(g) → 2Al(OH)₃ + 3H₂(g)  [steam]',
    acidEq:   '2Al(s) + 6HCl(aq) → 2AlCl₃(aq) + 3H₂(g)',
    displaceEq: '2Al(s) + 3FeSO₄(aq) → Al₂(SO₄)₃(aq) + 3Fe(s)',
  },
  {
    symbol: 'Mn', name: 'Manganese', rank: 8,  charge: '+2', ion: 'Mn²⁺',
    waterRxn: 'steam', aboveH2: true,
    acidEq:   'Mn(s) + 2HCl(aq) → MnCl₂(aq) + H₂(g)',
  },
  {
    symbol: 'Zn', name: 'Zinc',      rank: 9,  charge: '+2', ion: 'Zn²⁺',
    waterRxn: 'steam', aboveH2: true,
    waterEq:  'Zn(s) + H₂O(g) → ZnO(s) + H₂(g)  [steam]',
    acidEq:   'Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)',
    displaceEq: 'Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)',
  },
  {
    symbol: 'Cr', name: 'Chromium',  rank: 10, charge: '+3', ion: 'Cr³⁺',
    waterRxn: 'steam', aboveH2: true,
    acidEq:   '2Cr(s) + 6HCl(aq) → 2CrCl₃(aq) + 3H₂(g)',
  },
  {
    symbol: 'Fe', name: 'Iron',      rank: 11, charge: '+2', ion: 'Fe²⁺',
    waterRxn: 'steam', aboveH2: true,
    waterEq:  '3Fe(s) + 4H₂O(g) → Fe₃O₄(s) + 4H₂(g)  [steam]',
    acidEq:   'Fe(s) + 2HCl(aq) → FeCl₂(aq) + H₂(g)',
    displaceEq: 'Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)',
  },
  {
    symbol: 'Ni', name: 'Nickel',    rank: 12, charge: '+2', ion: 'Ni²⁺',
    waterRxn: 'acid_only', aboveH2: true,
    acidEq:   'Ni(s) + 2HCl(aq) → NiCl₂(aq) + H₂(g)',
    displaceEq: 'Ni(s) + CuSO₄(aq) → NiSO₄(aq) + Cu(s)',
  },
  {
    symbol: 'Sn', name: 'Tin',       rank: 13, charge: '+2', ion: 'Sn²⁺',
    waterRxn: 'acid_only', aboveH2: true,
    acidEq:   'Sn(s) + 2HCl(aq) → SnCl₂(aq) + H₂(g)',
  },
  {
    symbol: 'Pb', name: 'Lead',      rank: 14, charge: '+2', ion: 'Pb²⁺',
    waterRxn: 'acid_only', aboveH2: true,
    acidEq:   'Pb(s) + 2HCl(aq) → PbCl₂(s) + H₂(g)',
    note: 'PbCl₂ is slightly soluble; reaction slows as it coats the surface.',
  },
  // H₂ divider at rank 15
  {
    symbol: 'Cu', name: 'Copper',    rank: 16, charge: '+2', ion: 'Cu²⁺',
    waterRxn: 'none', aboveH2: false,
    displaceEq: 'Cu(s) + 2AgNO₃(aq) → Cu(NO₃)₂(aq) + 2Ag(s)',
    note: 'Does not react with dilute HCl or H₂SO₄. Reacts with oxidizing acids (HNO₃, hot conc. H₂SO₄).',
  },
  {
    symbol: 'Ag', name: 'Silver',    rank: 17, charge: '+1', ion: 'Ag⁺',
    waterRxn: 'none', aboveH2: false,
    note: 'Does not react with water or dilute acids. Dissolves in HNO₃.',
  },
  {
    symbol: 'Hg', name: 'Mercury',   rank: 18, charge: '+2', ion: 'Hg²⁺',
    waterRxn: 'none', aboveH2: false,
  },
  {
    symbol: 'Pt', name: 'Platinum',  rank: 19, charge: '+2', ion: 'Pt²⁺',
    waterRxn: 'none', aboveH2: false,
    note: 'Dissolves only in aqua regia (mixture of HNO₃ and HCl).',
  },
  {
    symbol: 'Au', name: 'Gold',      rank: 20, charge: '+3', ion: 'Au³⁺',
    waterRxn: 'none', aboveH2: false,
    note: 'Least reactive common metal. Dissolves only in aqua regia.',
  },
]

const HALOGENS: ActivityHalogen[] = [
  { formula: 'F₂',  ion: 'F⁻',  name: 'Fluorine',  rank: 1 },
  { formula: 'Cl₂', ion: 'Cl⁻', name: 'Chlorine',  rank: 2 },
  { formula: 'Br₂', ion: 'Br⁻', name: 'Bromine',   rank: 3 },
  { formula: 'I₂',  ion: 'I⁻',  name: 'Iodine',    rank: 4 },
]

const HALOGEN_EXAMPLES: Partial<Record<string, string[]>> = {
  'F₂':  ['F₂(g) + 2Cl⁻(aq) → 2F⁻(aq) + Cl₂(g)', 'F₂(g) + 2Br⁻(aq) → 2F⁻(aq) + Br₂(l)', 'F₂(g) + 2I⁻(aq) → 2F⁻(aq) + I₂(s)'],
  'Cl₂': ['Cl₂(g) + 2Br⁻(aq) → 2Cl⁻(aq) + Br₂(l)', 'Cl₂(g) + 2I⁻(aq) → 2Cl⁻(aq) + I₂(s)'],
  'Br₂': ['Br₂(l) + 2I⁻(aq) → 2Br⁻(aq) + I₂(s)'],
  'I₂':  [],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const WATER_RXN_META: Record<WaterRxn, { label: string; color: string }> = {
  cold_violent: { label: 'Cold water (violent)', color: '#f87171' },
  cold:         { label: 'Cold water',           color: '#fb923c' },
  hot:          { label: 'Hot water / steam',    color: '#fbbf24' },
  steam:        { label: 'Steam only',           color: '#a3e635' },
  acid_only:    { label: 'Acid only — not water', color: '#60a5fa' },
  none:         { label: 'No reaction',           color: '#6b7280' },
}

function metalColor(metal: ActivityMetal, selected: ActivityMetal | null): string {
  if (!selected) return 'rgba(var(--overlay),0.72)'
  if (metal.symbol === selected.symbol) return 'var(--c-halogen)'
  if (metal.rank < selected.rank) return '#fbbf24'   // amber  — more active, can displace selected
  return '#4ade80'                                    // green  — less active, selected can displace this
}

function halogenColor(h: ActivityHalogen, selected: ActivityHalogen | null): string {
  if (!selected) return 'rgba(var(--overlay),0.72)'
  if (h.formula === selected.formula) return 'var(--c-halogen)'
  if (h.rank < selected.rank) return '#fbbf24'
  return '#4ade80'
}

// ── Series row ────────────────────────────────────────────────────────────────

function MetalRow({ metal, selected, onClick }: {
  metal: ActivityMetal
  selected: ActivityMetal | null
  onClick: () => void
}) {
  const isSelected = selected?.symbol === metal.symbol
  const color = metalColor(metal, selected)
  const waterMeta = WATER_RXN_META[metal.waterRxn]

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-left transition-colors group"
      style={isSelected ? {
        background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
        border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
      } : {
        border: '1px solid transparent',
      }}
    >
      {/* Rank */}
      <span className="font-mono text-xs text-secondary w-4 text-right shrink-0">{metal.rank}</span>

      {/* Symbol */}
      <span className="font-mono text-sm font-semibold w-6 shrink-0 transition-colors" style={{ color }}>
        {metal.symbol}
      </span>

      {/* Name */}
      <span className="font-sans text-xs text-secondary flex-1 text-left">{metal.name}</span>

      {/* Ion */}
      <span className="font-mono text-xs text-secondary w-10 text-right shrink-0">{metal.ion}</span>

      {/* Water reactivity dot */}
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: waterMeta.color, opacity: 0.7 }}
        title={waterMeta.label}
      />
    </button>
  )
}

function HalogenRow({ halogen, selected, onClick }: {
  halogen: ActivityHalogen
  selected: ActivityHalogen | null
  onClick: () => void
}) {
  const isSelected = selected?.formula === halogen.formula
  const color = halogenColor(halogen, selected)
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-left transition-colors"
      style={isSelected ? {
        background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
        border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
      } : {
        border: '1px solid transparent',
      }}
    >
      <span className="font-mono text-sm font-semibold w-6 shrink-0 transition-colors" style={{ color }}>
        {halogen.formula}
      </span>
      <span className="font-sans text-xs text-secondary flex-1">{halogen.name}</span>
      <span className="font-mono text-xs text-secondary">{halogen.ion}</span>
    </button>
  )
}

// ── H₂ divider ────────────────────────────────────────────────────────────────

function H2Divider() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <div className="w-4 shrink-0" />
      <span className="font-mono text-xs font-semibold text-dim">H₂</span>
      <div className="flex-1 border-t border-dashed border-border" />
      <span className="font-mono text-xs text-secondary shrink-0">reference</span>
    </div>
  )
}

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend({ show }: { show: boolean }) {
  if (!show) return (
    <div className="flex items-center gap-4 px-3 py-1">
      <span className="font-mono text-xs text-secondary">Click any element to explore displacement</span>
    </div>
  )
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-1">
      {[
        { color: '#fbbf24', label: 'More active — displaces the selected' },
        { color: 'var(--c-halogen)', label: 'Selected' },
        { color: '#4ade80', label: 'Less active — displaced by the selected' },
      ].map(e => (
        <div key={e.label} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: e.color }} />
          <span className="font-mono text-xs text-secondary">{e.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Detail panel ──────────────────────────────────────────────────────────────

function MetalDetail({ metal, all }: { metal: ActivityMetal; all: ActivityMetal[] }) {
  const canDisplace   = all.filter(m => m.rank > metal.rank)
  const displacedBy   = all.filter(m => m.rank < metal.rank)
  const waterMeta     = WATER_RXN_META[metal.waterRxn]

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-xl font-bold" style={{ color: 'var(--c-halogen)' }}>{metal.symbol}</span>
        <span className="font-sans text-sm text-secondary">{metal.name}</span>
        <span className="font-mono text-xs text-dim ml-auto">Ion: {metal.ion}</span>
      </div>

      {/* Displacement */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Displacement</span>
        <div className="flex flex-col gap-1.5 rounded-sm border border-border bg-raised px-4 py-3">
          {canDisplace.length > 0 ? (
            <div className="flex items-start gap-2">
              <span className="font-mono text-xs shrink-0" style={{ color: '#4ade80' }}>Can displace</span>
              <div className="flex flex-wrap gap-1">
                {canDisplace.map(m => (
                  <span key={m.symbol} className="font-mono text-xs px-1.5 py-0.5 rounded-sm border"
                    style={{ borderColor: 'rgba(74,222,128,0.3)', color: '#4ade80', background: 'rgba(74,222,128,0.08)' }}>
                    {m.symbol}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <span className="font-mono text-xs text-dim">Cannot displace any metal in this series</span>
          )}
          {displacedBy.length > 0 && (
            <div className="flex items-start gap-2 mt-1">
              <span className="font-mono text-xs shrink-0" style={{ color: '#fbbf24' }}>Displaced by</span>
              <div className="flex flex-wrap gap-1">
                {displacedBy.map(m => (
                  <span key={m.symbol} className="font-mono text-xs px-1.5 py-0.5 rounded-sm border"
                    style={{ borderColor: 'rgba(251,191,36,0.3)', color: '#fbbf24', background: 'rgba(251,191,36,0.08)' }}>
                    {m.symbol}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reactivity badges */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border bg-raised">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: waterMeta.color }} />
          <span className="font-sans text-xs text-secondary">Water: </span>
          <span className="font-mono text-xs" style={{ color: waterMeta.color }}>{waterMeta.label}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border bg-raised">
          <span className="w-2 h-2 rounded-full shrink-0"
            style={{ background: metal.aboveH2 ? '#4ade80' : '#6b7280' }} />
          <span className="font-sans text-xs text-secondary">Dilute acid: </span>
          <span className="font-mono text-xs"
            style={{ color: metal.aboveH2 ? '#4ade80' : '#6b7280' }}>
            {metal.aboveH2 ? 'Reacts → H₂(g)' : 'No reaction'}
          </span>
        </div>
      </div>

      {/* Example equations */}
      {(metal.waterEq || metal.acidEq || metal.displaceEq) && (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Example Reactions</span>
          <div className="flex flex-col rounded-sm border border-border overflow-hidden">
            {[
              metal.waterEq    && { label: 'Water',       eq: metal.waterEq },
              metal.acidEq     && { label: 'Acid (HCl)',  eq: metal.acidEq },
              metal.displaceEq && { label: 'Displacement',eq: metal.displaceEq },
            ].filter(Boolean).map((row: any) => (
              <div key={row.label}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-4 py-2.5 border-b border-border last:border-b-0 bg-surface">
                <span className="font-mono text-xs text-secondary uppercase tracking-widest sm:w-24 shrink-0">{row.label}</span>
                <span className="font-mono text-xs text-bright">{row.eq}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {metal.note && (
        <p className="font-sans text-sm text-secondary leading-relaxed border-t border-border pt-3">
          {metal.note}
        </p>
      )}
    </div>
  )
}

function HalogenDetail({ halogen, all }: { halogen: ActivityHalogen; all: ActivityHalogen[] }) {
  const canDisplace = all.filter(h => h.rank > halogen.rank)
  const displacedBy = all.filter(h => h.rank < halogen.rank)
  const examples = HALOGEN_EXAMPLES[halogen.formula] ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-xl font-bold" style={{ color: 'var(--c-halogen)' }}>{halogen.formula}</span>
        <span className="font-sans text-sm text-secondary">{halogen.name}</span>
        <span className="font-mono text-xs text-dim ml-auto">Ion: {halogen.ion}</span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Displacement</span>
        <div className="flex flex-col gap-1.5 rounded-sm border border-border bg-raised px-4 py-3">
          {canDisplace.length > 0 ? (
            <div className="flex items-start gap-2">
              <span className="font-mono text-xs shrink-0" style={{ color: '#4ade80' }}>Displaces ion</span>
              <div className="flex flex-wrap gap-1">
                {canDisplace.map(h => (
                  <span key={h.formula} className="font-mono text-xs px-1.5 py-0.5 rounded-sm border"
                    style={{ borderColor: 'rgba(74,222,128,0.3)', color: '#4ade80', background: 'rgba(74,222,128,0.08)' }}>
                    {h.ion}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <span className="font-mono text-xs text-dim">Cannot displace any halide ion in this series</span>
          )}
          {displacedBy.length > 0 && (
            <div className="flex items-start gap-2 mt-1">
              <span className="font-mono text-xs shrink-0" style={{ color: '#fbbf24' }}>Ion displaced by</span>
              <div className="flex flex-wrap gap-1">
                {displacedBy.map(h => (
                  <span key={h.formula} className="font-mono text-xs px-1.5 py-0.5 rounded-sm border"
                    style={{ borderColor: 'rgba(251,191,36,0.3)', color: '#fbbf24', background: 'rgba(251,191,36,0.08)' }}>
                    {h.formula}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {examples.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Example Reactions</span>
          <div className="flex flex-col rounded-sm border border-border overflow-hidden">
            {examples.map(eq => (
              <div key={eq} className="px-4 py-2.5 border-b border-border last:border-b-0 bg-surface">
                <span className="font-mono text-xs text-bright">{eq}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {halogen.formula === 'I₂' && (
        <p className="font-sans text-sm text-secondary leading-relaxed border-t border-border pt-3">
          I₂ is the least reactive halogen and cannot displace any halide ion from solution under standard conditions.
        </p>
      )}
      {halogen.formula === 'F₂' && (
        <p className="font-sans text-sm text-secondary leading-relaxed border-t border-border pt-3">
          F₂ is the most reactive halogen and the most powerful oxidizing agent among them. It displaces all other halide ions.
        </p>
      )}
    </div>
  )
}

// ── Displacement checker ──────────────────────────────────────────────────────

function DisplacementChecker() {
  const [metalA, setMetalA] = useState<string>('')
  const [metalB, setMetalB] = useState<string>('')

  const mA = METALS.find(m => m.symbol === metalA) ?? null
  const mB = METALS.find(m => m.symbol === metalB) ?? null

  const canReact = mA && mB && mA.symbol !== mB.symbol
  const displaces = canReact && mA!.rank < mB!.rank

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">Displacement Checker</h3>
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-sm border border-border bg-surface">
        <select
          value={metalA}
          onChange={e => setMetalA(e.target.value)}
          className="px-3 py-1.5 rounded-sm font-mono text-sm bg-raised border border-border text-primary"
        >
          <option value="">Select Metal A</option>
          {METALS.map(m => <option key={m.symbol} value={m.symbol}>{m.symbol} — {m.name}</option>)}
        </select>

        <span className="font-mono text-sm text-dim">+</span>

        <select
          value={metalB}
          onChange={e => setMetalB(e.target.value)}
          className="px-3 py-1.5 rounded-sm font-mono text-sm bg-raised border border-border text-primary"
        >
          <option value="">Select Metal B salt</option>
          {METALS.map(m => <option key={m.symbol} value={m.symbol}>{m.symbol} — {m.name}</option>)}
        </select>

        <span className="font-mono text-sm text-dim">→ ?</span>
      </div>

      <AnimatePresence mode="wait">
        {canReact && mA && mB && mA.symbol !== mB.symbol && (
          <motion.div key={`${metalA}-${metalB}`}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="flex items-start gap-3 rounded-sm border px-4 py-3"
            style={{
              borderColor: displaces ? 'rgba(74,222,128,0.35)' : 'rgba(248,113,113,0.35)',
              background:  displaces ? 'rgba(74,222,128,0.06)'  : 'rgba(248,113,113,0.06)',
            }}
          >
            <span className="font-mono text-lg mt-0.5" style={{ color: displaces ? '#4ade80' : '#f87171' }}>
              {displaces ? '✓' : '✗'}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-sm font-semibold" style={{ color: displaces ? '#4ade80' : '#f87171' }}>
                {displaces
                  ? `${mA.symbol} displaces ${mB.symbol}`
                  : `${mA.symbol} does NOT displace ${mB.symbol}`}
              </span>
              <span className="font-sans text-xs text-secondary">
                {displaces
                  ? `${mA.name} (rank ${mA.rank}) is more active than ${mB.name} (rank ${mB.rank}). ${mA.symbol}(s) + ${mB.symbol}-salt(aq) → ${mA.symbol}-salt(aq) + ${mB.symbol}(s)`
                  : `${mA.name} (rank ${mA.rank}) is less active than ${mB.name} (rank ${mB.rank}). A less active metal cannot displace a more active one from solution.`}
              </span>
            </div>
          </motion.div>
        )}
        {canReact && mA && mB && mA.symbol === mB.symbol && (
          <motion.div key="same" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="font-mono text-sm text-dim px-1">
            Select two different metals.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ActivitySeries() {
  const [selectedMetal,   setSelectedMetal]   = useState<ActivityMetal | null>(null)
  const [selectedHalogen, setSelectedHalogen] = useState<ActivityHalogen | null>(null)
  const [_activeSection,  setActiveSection]   = useState<'metals' | 'halogens'>('metals')

  function toggleMetal(m: ActivityMetal) {
    setSelectedMetal(prev => prev?.symbol === m.symbol ? null : m)
    setActiveSection('metals')
    setSelectedHalogen(null)
  }

  function toggleHalogen(h: ActivityHalogen) {
    setSelectedHalogen(prev => prev?.formula === h.formula ? null : h)
    setActiveSection('halogens')
    setSelectedMetal(null)
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl">

      <div className="flex flex-col gap-1">
        <h2 className="font-sans font-semibold text-bright text-xl">Activity Series</h2>
        <p className="font-sans text-sm text-secondary">
          Single-displacement reference. Click any element to see what it can and cannot displace.
        </p>
      </div>

      {/* Metals + detail */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">Metal Activity Series</h3>
          <span className="font-mono text-xs text-secondary">— most active at top</span>
        </div>

        <Legend show={!!selectedMetal} />

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Series list */}
          <div className="flex flex-col rounded-sm border border-border bg-surface overflow-hidden lg:w-72 shrink-0">
            {/* Header */}
            <div className="flex items-center gap-3 px-3 py-2 bg-raised border-b border-border">
              <span className="font-mono text-xs text-secondary w-4 text-right shrink-0">#</span>
              <span className="font-mono text-xs text-secondary tracking-widest uppercase w-6 shrink-0">El.</span>
              <span className="font-mono text-xs text-secondary tracking-widest uppercase flex-1">Name</span>
              <span className="font-mono text-xs text-secondary w-10 text-right shrink-0">Ion</span>
              <span className="font-mono text-xs text-secondary w-2 shrink-0" title="Water reactivity">H₂O</span>
            </div>

            {METALS.map(m => (
              <div key={m.symbol}>
                {m.rank === 16 && <H2Divider />}
                <MetalRow metal={m} selected={selectedMetal} onClick={() => toggleMetal(m)} />
              </div>
            ))}
          </div>

          {/* Detail panel */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {selectedMetal ? (
                <motion.div key={selectedMetal.symbol}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
                  className="rounded-sm border border-border bg-surface p-5"
                  style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 28%, transparent)' }}
                >
                  <MetalDetail metal={selectedMetal} all={METALS} />
                </motion.div>
              ) : (
                <motion.div key="metal-empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center justify-center rounded-sm border border-border bg-surface h-40 lg:h-full"
                >
                  <span className="font-mono text-sm text-dim">Select a metal to see displacement details.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Water reactivity legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-1">
          {(Object.entries(WATER_RXN_META) as [WaterRxn, typeof WATER_RXN_META[WaterRxn]][]).map(([, meta]) => (
            <div key={meta.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color, opacity: 0.7 }} />
              <span className="font-mono text-xs text-secondary">{meta.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Halogens */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">Halogen Activity Series</h3>
          <span className="font-mono text-xs text-secondary">— most active at top</span>
        </div>

        <Legend show={!!selectedHalogen} />

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col rounded-sm border border-border bg-surface overflow-hidden lg:w-72 shrink-0">
            <div className="flex items-center gap-3 px-3 py-2 bg-raised border-b border-border">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase w-6 shrink-0">El.</span>
              <span className="font-mono text-xs text-secondary tracking-widest uppercase flex-1">Name</span>
              <span className="font-mono text-xs text-secondary">Ion form</span>
            </div>
            {HALOGENS.map(h => (
              <HalogenRow key={h.formula} halogen={h} selected={selectedHalogen} onClick={() => toggleHalogen(h)} />
            ))}
          </div>

          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {selectedHalogen ? (
                <motion.div key={selectedHalogen.formula}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
                  className="rounded-sm border border-border bg-surface p-5"
                  style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 28%, transparent)' }}
                >
                  <HalogenDetail halogen={selectedHalogen} all={HALOGENS} />
                </motion.div>
              ) : (
                <motion.div key="hal-empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center justify-center rounded-sm border border-border bg-surface h-32"
                >
                  <span className="font-mono text-sm text-dim">Select a halogen to see displacement details.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Displacement checker */}
      <DisplacementChecker />

      <p className="font-mono text-xs text-secondary">
        Rule: A more active metal (higher on the series) displaces a less active metal ion from aqueous solution.
        Metals above H₂ also displace hydrogen gas from dilute acids.
      </p>
    </div>
  )
}
