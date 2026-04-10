import { useState } from 'react'
import { motion } from 'framer-motion'

// ── Types & Data ───────────────────────────────────────────────────────────────

type Sol = 'S' | 'I' | 'SS'

interface CationDef { id: string; formula: string; base: string; name: string; charge: number }
interface AnionDef  { id: string; formula: string; base: string; name: string; charge: number; poly: boolean }

const CATIONS: CationDef[] = [
  { id:'Li',  formula:'Li⁺',   base:'Li',  name:'Lithium',     charge:1 },
  { id:'Na',  formula:'Na⁺',   base:'Na',  name:'Sodium',      charge:1 },
  { id:'K',   formula:'K⁺',    base:'K',   name:'Potassium',   charge:1 },
  { id:'NH4', formula:'NH₄⁺',  base:'NH₄', name:'Ammonium',    charge:1 },
  { id:'Mg',  formula:'Mg²⁺',  base:'Mg',  name:'Magnesium',   charge:2 },
  { id:'Ca',  formula:'Ca²⁺',  base:'Ca',  name:'Calcium',     charge:2 },
  { id:'Sr',  formula:'Sr²⁺',  base:'Sr',  name:'Strontium',   charge:2 },
  { id:'Ba',  formula:'Ba²⁺',  base:'Ba',  name:'Barium',      charge:2 },
  { id:'Ag',  formula:'Ag⁺',   base:'Ag',  name:'Silver',      charge:1 },
  { id:'Fe2', formula:'Fe²⁺',  base:'Fe',  name:'Iron(II)',    charge:2 },
  { id:'Fe3', formula:'Fe³⁺',  base:'Fe',  name:'Iron(III)',   charge:3 },
  { id:'Cu',  formula:'Cu²⁺',  base:'Cu',  name:'Copper(II)', charge:2 },
  { id:'Zn',  formula:'Zn²⁺',  base:'Zn',  name:'Zinc',       charge:2 },
  { id:'Mn',  formula:'Mn²⁺',  base:'Mn',  name:'Manganese',  charge:2 },
  { id:'Pb',  formula:'Pb²⁺',  base:'Pb',  name:'Lead(II)',   charge:2 },
  { id:'Hg2', formula:'Hg₂²⁺', base:'Hg₂', name:'Mercury(I)', charge:2 },
  { id:'Al',  formula:'Al³⁺',  base:'Al',  name:'Aluminum',   charge:3 },
]

const ANIONS: AnionDef[] = [
  { id:'NO3',  formula:'NO₃⁻',    base:'NO₃',    name:'Nitrate',     charge:-1, poly:true  },
  { id:'OAc',  formula:'C₂H₃O₂⁻', base:'C₂H₃O₂', name:'Acetate',     charge:-1, poly:true  },
  { id:'ClO4', formula:'ClO₄⁻',   base:'ClO₄',   name:'Perchlorate', charge:-1, poly:true  },
  { id:'Cl',   formula:'Cl⁻',     base:'Cl',     name:'Chloride',    charge:-1, poly:false },
  { id:'Br',   formula:'Br⁻',     base:'Br',     name:'Bromide',     charge:-1, poly:false },
  { id:'I',    formula:'I⁻',      base:'I',      name:'Iodide',      charge:-1, poly:false },
  { id:'SO4',  formula:'SO₄²⁻',   base:'SO₄',    name:'Sulfate',     charge:-2, poly:true  },
  { id:'OH',   formula:'OH⁻',     base:'OH',     name:'Hydroxide',   charge:-1, poly:true  },
  { id:'CO3',  formula:'CO₃²⁻',   base:'CO₃',    name:'Carbonate',   charge:-2, poly:true  },
  { id:'PO4',  formula:'PO₄³⁻',   base:'PO₄',    name:'Phosphate',   charge:-3, poly:true  },
  { id:'S2',   formula:'S²⁻',     base:'S',      name:'Sulfide',     charge:-2, poly:false },
  { id:'SO3',  formula:'SO₃²⁻',   base:'SO₃',    name:'Sulfite',     charge:-2, poly:true  },
  { id:'CrO4', formula:'CrO₄²⁻',  base:'CrO₄',   name:'Chromate',    charge:-2, poly:true  },
]

// ── Solubility rules ───────────────────────────────────────────────────────────

const G1_NH4 = new Set(['Li','Na','K','Rb','Cs','NH4'])
const G2 = new Set(['Mg','Ca','Sr','Ba'])

interface LookupResult { sol: Sol; rule: string }

function solLookup(cId: string, aId: string): LookupResult {
  if (G1_NH4.has(cId))
    return { sol:'S',  rule:'All Group I and ammonium salts are soluble' }
  if (aId === 'NO3')
    return { sol:'S',  rule:'All nitrates (NO₃⁻) are soluble' }
  if (aId === 'OAc')
    return { sol:'S',  rule:'All acetates (C₂H₃O₂⁻) are soluble' }
  if (aId === 'ClO4')
    return { sol:'S',  rule:'All perchlorates (ClO₄⁻) are soluble' }

  if (aId === 'Cl' || aId === 'Br' || aId === 'I') {
    if (cId === 'Ag' || cId === 'Pb' || cId === 'Hg2')
      return { sol:'I',  rule:'Cl⁻, Br⁻, and I⁻ salts are insoluble with Ag⁺, Pb²⁺, and Hg₂²⁺' }
    return { sol:'S',  rule:'Most chlorides, bromides, and iodides are soluble' }
  }

  if (aId === 'SO4') {
    if (cId === 'Ba' || cId === 'Pb' || cId === 'Hg2')
      return { sol:'I',  rule:'Sulfates of Ba²⁺, Pb²⁺, and Hg₂²⁺ are insoluble' }
    if (cId === 'Ca' || cId === 'Sr' || cId === 'Ag')
      return { sol:'SS', rule:'Sulfates of Ca²⁺, Sr²⁺, and Ag⁺ are slightly soluble' }
    return { sol:'S',  rule:'Most sulfates are soluble' }
  }

  if (aId === 'OH') {
    if (cId === 'Ba')
      return { sol:'S',  rule:'Ba(OH)₂ is soluble' }
    if (cId === 'Sr' || cId === 'Ca')
      return { sol:'SS', rule:'Ca(OH)₂ and Sr(OH)₂ are slightly soluble' }
    return { sol:'I',  rule:'Most hydroxides are insoluble — exceptions: Group I, Ba²⁺; slightly Ca²⁺/Sr²⁺' }
  }

  if (aId === 'CO3')
    return { sol:'I',  rule:'Most carbonates are insoluble — exceptions: Group I and NH₄⁺' }
  if (aId === 'PO4')
    return { sol:'I',  rule:'Most phosphates are insoluble — exceptions: Group I and NH₄⁺' }

  if (aId === 'S2') {
    if (G2.has(cId)) return { sol:'SS', rule:'Group II sulfides are slightly soluble' }
    return { sol:'I',  rule:'Most sulfides are insoluble — exceptions: Group I; Group II slightly' }
  }

  if (aId === 'SO3')
    return { sol:'I',  rule:'Most sulfites are insoluble — exceptions: Group I and NH₄⁺' }

  if (aId === 'CrO4') {
    if (cId === 'Ag' || cId === 'Ba' || cId === 'Pb' || cId === 'Hg2')
      return { sol:'I',  rule:'Chromates of Ag⁺, Ba²⁺, Pb²⁺, Hg₂²⁺ are insoluble' }
    if (cId === 'Ca')
      return { sol:'SS', rule:'CaCrO₄ is slightly soluble' }
    return { sol:'S',  rule:'Most chromates are soluble' }
  }

  return { sol:'S', rule:'No specific rule — generally assumed soluble' }
}

// ── Formula builder ────────────────────────────────────────────────────────────

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b) }

const SUB: Record<number,string> = { 1:'', 2:'₂', 3:'₃', 4:'₄', 6:'₆' }
const sub = (n: number) => SUB[n] ?? String(n)

function buildFormula(cat: CationDef, ani: AnionDef): string {
  const c = cat.charge, a = Math.abs(ani.charge)
  const d = gcd(c, a)
  const nc = a / d, na = c / d
  const cPart = `${cat.base}${sub(nc)}`
  const aPart = na === 1 ? ani.base : ani.poly ? `(${ani.base})${sub(na)}` : `${ani.base}${sub(na)}`
  return cPart + aPart
}

// ── Style helpers ──────────────────────────────────────────────────────────────

const SOL_LABEL: Record<Sol,string> = { S:'Soluble', I:'Insoluble', SS:'Slightly Soluble' }
const SOL_COLOR: Record<Sol,string> = { S:'var(--c-halogen)', I:'#e05050', SS:'#f5c518' }
const SOL_BG:    Record<Sol,string> = {
  S:  'color-mix(in srgb, var(--c-halogen) 13%, #141620)',
  I:  'color-mix(in srgb, #e05050 13%, #141620)',
  SS: 'color-mix(in srgb, #f5c518 10%, #141620)',
}

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
        {/* Cation picker */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Cation</span>
          <div className="flex flex-wrap gap-1.5">
            {CATIONS.map(c => ionBtn(c.formula, catId === c.id, () => setCatId(catId === c.id ? null : c.id)))}
          </div>
        </div>

        {/* Anion picker */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">Anion</span>
          <div className="flex flex-wrap gap-1.5">
            {ANIONS.map(a => ionBtn(a.formula, aniId === a.id, () => setAniId(aniId === a.id ? null : a.id)))}
          </div>
        </div>
      </div>

      {/* Result */}
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

// ── Solubility table ───────────────────────────────────────────────────────────

function SolubilityTable() {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

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
                  className="px-2 py-2 font-mono text-xs text-secondary print:text-gray-700
                             border-b border-r border-border print:border-gray-300 last:border-r-0 min-w-[52px]">
                  {c.formula}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ANIONS.map((ani, ri) => (
              <tr key={ani.id}>
                <td className={`sticky left-0 z-10 px-3 py-2 text-left font-mono text-xs text-secondary
                                print:text-gray-700 border-b border-r border-border print:border-gray-300
                                ${ri % 2 === 0 ? 'bg-surface' : 'bg-raised'} print:bg-white`}>
                  {ani.formula}
                </td>
                {CATIONS.map(cat => {
                  const { sol } = solLookup(cat.id, ani.id)
                  const label = `${buildFormula(cat, ani)} — ${SOL_LABEL[sol]}`
                  return (
                    <td
                      key={cat.id}
                      className="px-1.5 py-1.5 font-mono text-xs font-bold
                                 border-b border-r border-border print:border-gray-300 last:border-r-0
                                 transition-colors cursor-default"
                      style={{ background: SOL_BG[sol], color: SOL_COLOR[sol] }}
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
            ))}
          </tbody>
        </table>
      </div>

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

      {/* Print-only title */}
      <div className="hidden print:block print:mb-2">
        <h2 className="font-sans font-bold text-2xl text-gray-900">Solubility Rules — Reference Sheet</h2>
        <p className="font-mono text-sm text-gray-500 mt-1">ChemHelper</p>
        <hr className="border-gray-300 mt-3" />
      </div>

      {/* View toggle + print button */}
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
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-1.5 rounded-sm font-sans text-sm border border-border
                     text-secondary hover:text-primary hover:border-muted transition-colors"
        >
          <span>⎙</span>
          <span>Print</span>
        </button>
      </div>

      {/* Interactive lookup — hidden on print */}
      <div className={`${view === 'lookup' ? '' : 'hidden'} print:hidden`}>
        <InteractiveLookup />
      </div>

      {/* Table — always visible on print, conditional on screen */}
      <div className={view === 'table' ? '' : 'hidden print:block'}>
        <SolubilityTable />
      </div>

      {/* Rules summary — always shown */}
      <div>
        <h3 className="font-mono text-xs text-secondary tracking-widest uppercase mb-3">Quick Rules</h3>
        <RulesSummary />
      </div>
    </div>
  )
}
