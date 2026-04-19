import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CATIONS, ANIONS, solLookup, buildFormula,
  SOL_LABEL, SOL_COLOR, SOL_BG,
  type Sol,
} from '../../utils/solubilityData'

// ── Interactive lookup ─────────────────────────────────────────────────────────

function InteractiveLookup() {
  const [catId, setCatId] = useState<string | null>(null)
  const [aniId, setAniId] = useState<string | null>(null)

  const cat = CATIONS.find(c => c.id === catId) ?? null
  const ani = ANIONS.find(a => a.id === aniId) ?? null
  const result = cat && ani ? solLookup(catId!, aniId!) : null

  function ionBtn(formula: string, isActive: boolean, onClick: () => void) {
    return (
      <button
        onClick={onClick}
        className="px-2.5 py-1.5 rounded-sm font-mono text-sm transition-colors"
        style={isActive ? {
          background: 'color-mix(in srgb, var(--c-halogen) 15%, #141620)',
          border: '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)',
          color: 'var(--c-halogen)',
        } : {
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.45)',
        }}
      >{formula}</button>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Cation</span>
          <div className="flex flex-wrap gap-1.5">
            {CATIONS.map(c => ionBtn(c.formula, catId === c.id, () => setCatId(catId === c.id ? null : c.id)))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Anion</span>
          <div className="flex flex-wrap gap-1.5">
            {ANIONS.map(a => ionBtn(a.formula, aniId === a.id, () => setAniId(aniId === a.id ? null : a.id)))}
          </div>
        </div>
      </div>

      {result ? (
        <motion.div
          key={`${catId}-${aniId}`}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="rounded-sm border p-5 flex flex-col gap-3"
          style={{
            background: SOL_BG[result.sol],
            borderColor: `color-mix(in srgb, ${SOL_COLOR[result.sol]} 35%, transparent)`,
          }}
        >
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-mono text-2xl font-bold text-bright">
              {buildFormula(cat!, ani!)}
            </span>
            <span className="px-2.5 py-1 rounded-sm font-mono text-sm font-bold"
              style={{
                color: SOL_COLOR[result.sol],
                background: `color-mix(in srgb, ${SOL_COLOR[result.sol]} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${SOL_COLOR[result.sol]} 30%, transparent)`,
              }}>
              {SOL_LABEL[result.sol]}
            </span>
          </div>
          <p className="font-sans text-sm text-secondary">
            <span className="text-dim text-xs mr-2">Rule:</span>{result.rule}
          </p>
          <p className="font-mono text-xs text-dim">
            {cat!.formula} ({cat!.name}) + {ani!.formula} ({ani!.name})
          </p>
        </motion.div>
      ) : (
        <div className="rounded-sm border border-border bg-surface px-5 py-4">
          <p className="font-mono text-sm text-dim">
            {!catId && !aniId ? 'Select a cation and an anion above to look up solubility.'
              : !catId ? 'Now select a cation.'
              : 'Now select an anion.'}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Interactive solubility table ───────────────────────────────────────────────

function SolubilityTable() {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const [selectedAni, setSelectedAni] = useState<string | null>(null)

  const ani = ANIONS.find(a => a.id === selectedAni) ?? null

  // Bucket cations by solubility for the selected anion
  const summary = ani
    ? (['S', 'SS', 'I'] as Sol[]).map(sol => ({
        sol,
        cations: CATIONS.filter(c => solLookup(c.id, ani.id).sol === sol),
      })).filter(g => g.cations.length > 0)
    : []

  return (
    <div className="flex flex-col gap-3">
      {/* Legend */}
      <div className="flex items-center gap-5 print:hidden">
        {(['S','SS','I'] as Sol[]).map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-sm" style={{
              background: SOL_BG[s],
              border: `1px solid color-mix(in srgb, ${SOL_COLOR[s]} 35%, transparent)`,
            }} />
            <span className="font-mono text-xs text-secondary">{SOL_LABEL[s]}</span>
          </div>
        ))}
        {selectedAni && (
          <button
            onClick={() => setSelectedAni(null)}
            className="font-mono text-[10px] text-dim hover:text-primary transition-colors ml-auto"
          >
            clear selection
          </button>
        )}
      </div>

      {/* Print-only legend */}
      <div className="hidden print:flex print:gap-6 print:mb-1">
        {(['S','SS','I'] as Sol[]).map(s => (
          <span key={s} className="font-mono text-xs text-gray-600">{s} = {SOL_LABEL[s]}</span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-sm border border-border print:border-gray-300">
        <table className="border-collapse text-center w-full">
          <thead>
            <tr className="bg-raised print:bg-gray-100">
              <th className="sticky left-0 z-10 bg-raised print:bg-gray-100 px-3 py-2 text-left
                             font-mono text-[10px] text-dim tracking-widest uppercase
                             border-b border-r border-border print:border-gray-300 min-w-[90px]">
                ↓ Anion / Cation →
              </th>
              {CATIONS.map(c => (
                <th key={c.id}
                  className="px-2 py-2 font-mono text-xs border-b border-r border-border
                             print:border-gray-300 last:border-r-0 min-w-[52px] transition-opacity"
                  style={{
                    color: selectedAni ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)',
                  }}>
                  {c.formula}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ANIONS.map((a, ri) => {
              const isSelected = selectedAni === a.id
              const isDimmed = selectedAni !== null && !isSelected
              return (
                <tr
                  key={a.id}
                  style={{ opacity: isDimmed ? 0.18 : 1, transition: 'opacity 0.15s' }}
                >
                  {/* Anion label — clickable */}
                  <td
                    onClick={() => setSelectedAni(isSelected ? null : a.id)}
                    className={`sticky left-0 z-10 px-3 py-2 text-left font-mono text-xs
                                border-b border-r border-border print:border-gray-300
                                ${ri % 2 === 0 ? 'bg-surface' : 'bg-raised'} print:bg-white
                                cursor-pointer select-none transition-colors`}
                    style={{
                      color: isSelected ? 'var(--c-halogen)' : 'rgba(255,255,255,0.6)',
                      background: isSelected
                        ? 'color-mix(in srgb, var(--c-halogen) 10%, #141620)'
                        : undefined,
                    }}
                    title={`Click to highlight ${a.name} (${a.formula}) solubility pairings`}
                  >
                    {a.formula}
                  </td>

                  {/* Cells */}
                  {CATIONS.map(cat => {
                    const { sol } = solLookup(cat.id, a.id)
                    const label = `${buildFormula(cat, a)} — ${SOL_LABEL[sol]}`
                    return (
                      <td
                        key={cat.id}
                        className="px-1.5 py-1.5 font-mono font-bold
                                   border-b border-r border-border print:border-gray-300 last:border-r-0
                                   transition-all cursor-default"
                        style={{
                          fontSize: isSelected ? '13px' : '11px',
                          background: SOL_BG[sol],
                          color: isSelected ? SOL_COLOR[sol] : `color-mix(in srgb, ${SOL_COLOR[sol]} 70%, transparent)`,
                        }}
                        onMouseEnter={e => {
                          const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                          setTooltip({ text: label, x: r.left + r.width / 2, y: r.top })
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        {sol}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Summary panel for selected anion */}
      <AnimatePresence>
        {ani && summary.length > 0 && (
          <motion.div
            key={ani.id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="rounded-sm border p-4 flex flex-col gap-3"
            style={{
              borderColor: 'color-mix(in srgb, var(--c-halogen) 25%, rgba(255,255,255,0.08))',
              background: '#0e1016',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>
                {ani.formula}
              </span>
              <span className="font-mono text-xs text-dim">({ani.name}) pairings</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {summary.map(({ sol, cations }) => (
                <div key={sol} className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] tracking-widest uppercase"
                    style={{ color: SOL_COLOR[sol] }}>
                    {SOL_LABEL[sol]}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cations.map(c => (
                      <span
                        key={c.id}
                        className="font-mono text-xs px-1.5 py-0.5 rounded-sm"
                        style={{
                          background: SOL_BG[sol],
                          color: SOL_COLOR[sol],
                          border: `1px solid color-mix(in srgb, ${SOL_COLOR[sol]} 25%, transparent)`,
                        }}
                        title={buildFormula(c, ani)}
                      >
                        {c.formula}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="font-mono text-[10px] text-dim">
              Rule: {solLookup(CATIONS.find(c => solLookup(c.id, ani.id).sol !== 'S')?.id ?? 'Na', ani.id).rule}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click hint */}
      {!selectedAni && (
        <p className="font-mono text-[10px] text-dim print:hidden">
          Click any anion row label to highlight its solubility pairings.
        </p>
      )}

      {/* Custom tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-1.5 rounded-sm
                     font-mono text-sm text-bright border border-border"
          style={{
            background: '#1c1f2e',
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}

// ── Quick rules summary ────────────────────────────────────────────────────────

function RulesSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
      <div className="rounded-sm border border-border bg-surface p-4 print:bg-white print:border-gray-300">
        <p className="font-mono text-[10px] tracking-widest uppercase mb-2"
          style={{ color: SOL_COLOR.S }}>Generally Soluble (exceptions noted)</p>
        <ul className="flex flex-col gap-1.5">
          {[
            ['Group I  (Li⁺, Na⁺, K⁺…)',  'No exceptions'],
            ['NH₄⁺ salts',                  'No exceptions'],
            ['NO₃⁻  nitrates',              'No exceptions'],
            ['C₂H₃O₂⁻  acetates',           'No exceptions'],
            ['ClO₄⁻  perchlorates',          'No exceptions'],
            ['Cl⁻, Br⁻, I⁻  halides',      'Except Ag⁺, Pb²⁺, Hg₂²⁺'],
            ['SO₄²⁻  sulfates',             'Except Ba²⁺, Pb²⁺, Hg₂²⁺ (ins.); Ca²⁺, Sr²⁺, Ag⁺ (sl.)'],
          ].map(([ion, note]) => (
            <li key={ion} className="flex gap-2 text-xs">
              <span className="font-mono text-primary print:text-gray-800 shrink-0 min-w-[140px]">{ion}</span>
              <span className="font-sans text-dim print:text-gray-500">{note}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-sm border border-border bg-surface p-4 print:bg-white print:border-gray-300">
        <p className="font-mono text-[10px] tracking-widest uppercase mb-2"
          style={{ color: SOL_COLOR.I }}>Generally Insoluble (exceptions noted)</p>
        <ul className="flex flex-col gap-1.5">
          {[
            ['OH⁻  hydroxides',   'Except Group I, Ba²⁺; Ca²⁺/Sr²⁺ slightly'],
            ['CO₃²⁻  carbonates', 'Except Group I and NH₄⁺'],
            ['PO₄³⁻  phosphates', 'Except Group I and NH₄⁺'],
            ['S²⁻  sulfides',     'Except Group I; Group II slightly'],
            ['SO₃²⁻  sulfites',   'Except Group I and NH₄⁺'],
            ['CrO₄²⁻  chromates', 'Except Group I, NH₄⁺; insol. Ag⁺, Ba²⁺, Pb²⁺, Hg₂²⁺'],
          ].map(([ion, note]) => (
            <li key={ion} className="flex gap-2 text-xs">
              <span className="font-mono text-primary print:text-gray-800 shrink-0 min-w-[140px]">{ion}</span>
              <span className="font-sans text-dim print:text-gray-500">{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function SolubilityReference() {
  const [view, setView] = useState<'lookup' | 'table'>('lookup')

  return (
    <div className="flex flex-col gap-6">


      {/* View toggle */}
      <div className="flex items-center gap-2 print:hidden">
        <div className="flex items-center gap-1 p-1 rounded-sm"
          style={{ background: '#0e1016', border: '1px solid #1c1f2e' }}>
          {([['lookup','⊕ Lookup'],['table','⊞ Table']] as const).map(([v, label]) => {
          const isActive = view === v
          return (
            <button key={v} onClick={() => setView(v)}
              className="relative px-3.5 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
              style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(255,255,255,0.4)' }}>
              {isActive && (
                <motion.div layoutId="sol-view-pill" className="absolute inset-0 rounded-sm"
                  style={{
                    background: 'color-mix(in srgb, var(--c-halogen) 12%, #141620)',
                    border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          )
        })}
        </div>
      </div>

      <div className={`${view === 'lookup' ? '' : 'hidden'} print:hidden`}>
        <InteractiveLookup />
      </div>

      <div className={view === 'table' ? '' : 'hidden print:block'}>
        <SolubilityTable />
      </div>

      <div>
        <h3 className="font-mono text-xs text-secondary tracking-widest uppercase mb-3">Quick Rules</h3>
        <RulesSummary />
      </div>
    </div>
  )
}
