import { useState } from 'react'
import { BOND_DATA, BOND_CATEGORIES } from '../../utils/bondEnthalpyData'

export default function BondEnthalpyReference() {
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = searchTerm.trim()
    ? BOND_DATA.filter(b => b.bond.toLowerCase().includes(searchTerm.toLowerCase()))
    : null

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Main formula */}
      <div className="rounded-sm border border-border bg-surface p-5 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xl text-bright tracking-tight">
            ΔH ≈ Σ BE<sub>broken</sub> − Σ BE<sub>formed</sub>
          </p>
          <p className="font-mono text-xs text-secondary">
            where BE = average bond enthalpy (kJ/mol)
          </p>
        </div>
        <div className="h-px bg-border" />
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Breaking bonds requires energy (endothermic); forming bonds releases energy (exothermic).
          The net ΔH is the difference between total energy absorbed (bonds broken) and total energy released (bonds formed).
        </p>
      </div>

      {/* Variable definitions */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Variables</span>
        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          {[
            { sym: 'ΔH',        def: 'Enthalpy change of reaction (kJ)' },
            { sym: 'BE',        def: 'Average bond enthalpy (kJ/mol)' },
            { sym: 'Σ BEbroken', def: 'Sum of bond energies for all bonds broken in reactants' },
            { sym: 'Σ BEformed', def: 'Sum of bond energies for all bonds formed in products' },
          ].map(row => (
            <div key={row.sym}
              className="grid grid-cols-[9rem_1fr] gap-x-4 items-baseline px-4 py-2.5 border-b border-border last:border-b-0">
              <span className="font-mono text-sm text-primary">{row.sym}</span>
              <span className="font-sans text-sm text-secondary">{row.def}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sign / direction */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Sign Convention</span>
        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          {[
            { cond: 'ΔH < 0', label: 'Exothermic', note: 'More energy released forming bonds than absorbed breaking them' },
            { cond: 'ΔH > 0', label: 'Endothermic', note: 'More energy required to break bonds than is released forming them' },
          ].map(row => (
            <div key={row.cond}
              className="grid grid-cols-[6rem_8rem_1fr] gap-x-4 items-baseline px-4 py-2.5 border-b border-border last:border-b-0">
              <span className="font-mono text-sm"
                style={{ color: row.cond.includes('<') ? '#34d399' : '#f87171' }}>{row.cond}</span>
              <span className="font-sans text-sm text-primary font-medium">{row.label}</span>
              <span className="font-sans text-sm text-secondary">{row.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Solving steps */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs text-secondary tracking-widest uppercase">Steps to Solve</span>
        <div className="rounded-sm border border-border bg-surface p-4 flex flex-col gap-2">
          {[
            'Identify all bonds broken in the reactants (with counts).',
            'Identify all bonds formed in the products (with counts).',
            'Multiply each bond count by its average bond enthalpy.',
            'Sum all broken-bond contributions → Σ BE(broken).',
            'Sum all formed-bond contributions → Σ BE(formed).',
            'Calculate ΔH ≈ Σ BE(broken) − Σ BE(formed).',
            'Interpret the sign: negative = exothermic, positive = endothermic.',
          ].map((s, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="font-mono text-xs text-dim shrink-0 mt-0.5">{i + 1}.</span>
              <span className="font-sans text-sm text-secondary">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Approximation note */}
      <div className="rounded-sm border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col gap-1">
        <span className="font-mono text-xs text-amber-400/80 tracking-widest uppercase">Approximation Note</span>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Bond enthalpies are <em>average</em> values across many molecules. The calculated ΔH will differ from
          the exact thermodynamic value (from ΔHf° data) because actual bond strengths vary by molecular environment.
          This method is useful for estimation and understanding trends, not for precise calculations.
        </p>
      </div>

      {/* Bond energy table */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-secondary tracking-widest uppercase flex-1">Average Bond Enthalpies</span>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="search bond…"
            className="bg-raised border border-border rounded-sm px-3 py-1 font-mono text-xs text-bright
                       placeholder:text-dim/50 focus:outline-none focus:border-muted w-36 print:hidden"
          />
        </div>

        {filtered ? (
          <div className="rounded-sm border border-border bg-surface overflow-hidden">
            <div className="grid grid-cols-[1fr_6rem] px-4 py-1.5 bg-raised border-b border-border">
              <span className="font-mono text-xs text-secondary uppercase">Bond</span>
              <span className="font-mono text-xs text-secondary uppercase text-right">BE (kJ/mol)</span>
            </div>
            {filtered.length === 0 ? (
              <p className="px-4 py-3 font-mono text-xs text-dim">No matching bonds.</p>
            ) : (
              filtered.map(b => (
                <div key={b.bond} className="grid grid-cols-[1fr_6rem] px-4 py-2 border-b border-border last:border-b-0 items-baseline">
                  <span className="font-mono text-sm text-primary">{b.bond}</span>
                  <span className="font-mono text-sm text-right text-secondary">{b.energy}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          BOND_CATEGORIES.map(cat => (
            <div key={cat} className="flex flex-col gap-1">
              <span className="font-mono text-xs text-secondary tracking-widest uppercase">{cat}</span>
              <div className="rounded-sm border border-border bg-surface overflow-hidden">
                <div className="grid grid-cols-[1fr_6rem] px-4 py-1.5 bg-raised border-b border-border">
                  <span className="font-mono text-xs text-secondary uppercase">Bond</span>
                  <span className="font-mono text-xs text-secondary uppercase text-right">BE (kJ/mol)</span>
                </div>
                {BOND_DATA.filter(b => b.category === cat).map(b => (
                  <div key={b.bond}
                    className="grid grid-cols-[1fr_6rem] px-4 py-2 border-b border-border last:border-b-0 items-baseline">
                    <span className="font-mono text-sm text-primary">{b.bond}</span>
                    <span className="font-mono text-sm text-right text-secondary">{b.energy}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}
