import { useState } from 'react'
import { HF_DATA } from '../../utils/enthalpyData'

function SectionHead({ label }: { label: string }) {
  return <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">{label}</h3>
}

// Group the compound data for the reference table
const GROUPS = [
  {
    label: 'Elements (standard state)',
    formulas: ['H2','O2','N2','C','S','Cl2','Br2','I2','F2','Na','K','Ca','Mg','Al','Fe','Cu','Zn'],
  },
  {
    label: 'Water & Hydrogen Compounds',
    formulas: ['H2O(l)','H2O(g)','H2O2','H2S','HF','HCl','HBr','HI'],
  },
  {
    label: 'Oxides & Acids',
    formulas: ['CO','CO2','SO2','SO3','NO','NO2','N2O','N2O4','H2SO4','HNO3'],
  },
  {
    label: 'Sodium / Calcium Compounds',
    formulas: ['NaCl','NaOH','Na2O','Na2CO3','NaHCO3','KCl','KOH','CaO','Ca(OH)2','CaCO3','MgO','Mg(OH)2'],
  },
  {
    label: 'Metal Oxides',
    formulas: ['Al2O3','Fe2O3','Fe3O4','CuO','ZnO','SiO2','PbO'],
  },
  {
    label: 'Hydrocarbons',
    formulas: ['CH4','C2H2','C2H4','C2H6','C3H8','C4H10','C6H6','C8H18'],
  },
  {
    label: 'Oxygenated Organics',
    formulas: ['CH3OH','C2H5OH','HCHO','CH3CHO','HCOOH','CH3COOH','C6H12O6','C12H22O11'],
  },
]

// Build a quick lookup from formula(state) → entry
const ENTRY_MAP = new Map(
  HF_DATA.map(e => [`${e.formula}(${e.state})`, e])
)
// Also allow lookup by formula only (first match)
const FORMULA_MAP = new Map(
  HF_DATA.map(e => [e.formula, e])
)

function lookupEntry(key: string) {
  return ENTRY_MAP.get(key) ?? FORMULA_MAP.get(key)
}

export default function EnthalpyReference() {
  const [search, setSearch] = useState('')
  const [activeGroup, setActiveGroup] = useState<string | null>(null)

  const searchResults = search.trim()
    ? HF_DATA.filter(e =>
        e.formula.toLowerCase().includes(search.toLowerCase()) ||
        e.name.toLowerCase().includes(search.toLowerCase())
      )
    : null

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Main formula */}
      <div className="rounded-sm border border-border bg-raised px-6 py-5 flex flex-col gap-4">
        <p className="font-mono text-2xl font-bold text-bright">
          ΔH<sub>rxn</sub> = ΣΔHf°(products) − ΣΔHf°(reactants)
        </p>
        <div className="flex flex-col gap-2 pt-3 border-t border-border">
          <p className="font-mono text-sm text-primary">
            ΔH<sub>rxn</sub> = Σ [n × ΔHf°(product)] − Σ [m × ΔHf°(reactant)]
          </p>
          <p className="font-mono text-xs text-secondary">
            where n and m are the stoichiometric coefficients in the balanced equation
          </p>
        </div>
      </div>

      {/* Variables */}
      <div className="flex flex-col gap-2">
        <SectionHead label="Terms" />
        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          {[
            { sym: 'ΔHrxn',    name: 'Enthalpy of reaction',           note: 'negative = exothermic  |  positive = endothermic' },
            { sym: 'ΔHf°',     name: 'Standard enthalpy of formation', note: 'energy to form 1 mol of compound from elements in standard states' },
            { sym: 'n, m',     name: 'Stoichiometric coefficients',     note: 'from the balanced equation' },
            { sym: 'Σ',        name: 'Sum over all species',           note: 'each term = coefficient × ΔHf° for that species' },
          ].map(r => (
            <div key={r.sym}
              className="grid grid-cols-[5rem_1fr] gap-x-4 items-start px-4 py-2.5 border-b border-border last:border-b-0">
              <span className="font-mono text-base font-bold pt-0.5" style={{ color: 'var(--c-halogen)' }}>{r.sym}</span>
              <div className="flex flex-col gap-0.5">
                <span className="font-sans text-sm text-primary">{r.name}</span>
                <span className="font-mono text-xs text-secondary">{r.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sign convention + standard state */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <SectionHead label="Sign Convention" />
          <div className="rounded-sm border border-border bg-surface overflow-hidden">
            {[
              { sign: 'ΔHrxn < 0', label: 'Exothermic', note: 'heat is released to surroundings' },
              { sign: 'ΔHrxn > 0', label: 'Endothermic', note: 'heat is absorbed from surroundings' },
              { sign: 'ΔHf° = 0',  label: 'Standard state element', note: 'e.g. H₂(g), O₂(g), C(s), Fe(s)' },
            ].map(r => (
              <div key={r.sign} className="px-4 py-2.5 border-b border-border last:border-b-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>{r.sign}</span>
                  <span className="font-sans text-sm text-primary">→ {r.label}</span>
                </div>
                <p className="font-mono text-xs text-secondary mt-0.5">{r.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SectionHead label="Steps for Calculation" />
          <div className="rounded-sm border border-border bg-surface px-4 py-3 flex flex-col gap-2">
            {[
              'Write the balanced equation',
              'Look up ΔHf° for each species',
              'Multiply each ΔHf° by its stoichiometric coefficient',
              'Sum all product terms',
              'Sum all reactant terms',
              'Subtract: ΔHrxn = ΣΔHf°(prod) − ΣΔHf°(react)',
            ].map((s, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className="font-mono text-xs text-secondary shrink-0 w-4 pt-0.5">{i + 1}.</span>
                <span className="font-sans text-xs text-secondary">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ΔHf° table with search */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <SectionHead label="Standard Enthalpies of Formation (298 K)" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="search formula or name…"
            className="w-48 bg-raised border border-border rounded-sm px-3 py-1.5 font-mono text-xs text-bright
                       placeholder:text-dim/50 focus:outline-none focus:border-muted"
          />
        </div>

        {searchResults ? (
          // Search results
          <div className="rounded-sm border border-border bg-surface overflow-hidden">
            <div className="grid grid-cols-[5rem_1fr_4rem_5rem] gap-x-3 px-4 py-2 bg-raised border-b border-border">
              <span className="font-mono text-xs text-secondary">Formula</span>
              <span className="font-mono text-xs text-secondary">Name</span>
              <span className="font-mono text-xs text-secondary">State</span>
              <span className="font-mono text-xs text-secondary text-right">ΔHf° (kJ/mol)</span>
            </div>
            {searchResults.length === 0 ? (
              <p className="px-4 py-3 font-mono text-xs text-dim">No matches found.</p>
            ) : searchResults.map((e, i) => (
              <div key={i} className="grid grid-cols-[5rem_1fr_4rem_5rem] gap-x-3 px-4 py-2 border-b border-border last:border-b-0">
                <span className="font-mono text-sm font-semibold text-bright">{e.formula}</span>
                <span className="font-sans text-sm text-primary">{e.name}</span>
                <span className="font-mono text-sm text-secondary">({e.state})</span>
                <span className="font-mono text-sm text-right" style={{ color: e.dhf === 0 ? 'rgba(255,255,255,0.35)' : e.dhf < 0 ? '#34d399' : '#f87171' }}>
                  {e.dhf === 0 ? '0' : e.dhf}
                </span>
              </div>
            ))}
          </div>
        ) : (
          // Grouped tables
          <div className="flex flex-col gap-4">
            {GROUPS.map(group => {
              const entries = group.formulas
                .map(k => lookupEntry(k))
                .filter((e): e is NonNullable<typeof e> => e !== undefined)
              if (entries.length === 0) return null
              const isOpen = activeGroup === null || activeGroup === group.label
              return (
                <div key={group.label} className="rounded-sm border border-border overflow-hidden">
                  <button
                    onClick={() => setActiveGroup(activeGroup === group.label ? null : group.label)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-raised hover:bg-raised/80 transition-colors"
                  >
                    <span className="font-mono text-xs text-secondary tracking-widest uppercase">{group.label}</span>
                    <span className="font-mono text-xs text-secondary">{isOpen ? '▲' : '▼'}</span>
                  </button>
                  {isOpen && (
                    <div>
                      {entries.map((e, i) => (
                        <div key={i}
                          className="grid grid-cols-[5rem_1fr_4rem_5rem] gap-x-3 px-4 py-2 border-t border-border bg-surface">
                          <span className="font-mono text-sm font-semibold text-bright">{e.formula}</span>
                          <span className="font-sans text-sm text-primary">{e.name}</span>
                          <span className="font-mono text-sm text-secondary">({e.state})</span>
                          <span className="font-mono text-sm text-right"
                            style={{ color: e.dhf === 0 ? 'rgba(255,255,255,0.35)' : e.dhf < 0 ? '#34d399' : '#f87171' }}>
                            {e.dhf === 0 ? '0' : e.dhf}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <p className="font-mono text-xs text-secondary">
          Values in kJ/mol at 298 K, 1 atm.{' '}
          <span style={{ color: '#34d399' }}>Green</span> = negative (stable),{' '}
          <span style={{ color: '#f87171' }}>Red</span> = positive (unstable relative to elements).
        </p>
      </div>

    </div>
  )
}
