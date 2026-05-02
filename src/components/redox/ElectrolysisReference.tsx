import { ELECTROLYSIS_REACTIONS } from '../../data/reductionPotentials'

export default function ElectrolysisReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Electrolysis</p>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Electrolysis uses electrical energy to drive a non-spontaneous redox reaction. It is the reverse
          of a galvanic cell — an external power source forces electrons to flow from anode (oxidation) to
          cathode (reduction). Faraday's law quantifies how much material is deposited or consumed per unit
          of charge passed.
        </p>
      </div>

      {/* Faraday's Law */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Faraday's Law</p>
        <div className="rounded-sm border border-border px-4 py-3"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-mono text-base text-primary">m = (I × t × M) / (n × F)</p>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1">
            {[
              ['m', 'mass deposited (g)'],
              ['I', 'current (A = C/s)'],
              ['t', 'time (s)'],
              ['M', 'molar mass (g/mol)'],
              ['n', 'electrons per ion (mol e⁻/mol ion)'],
              ['F', 'Faraday constant = 96,485 C/mol'],
            ].map(([sym, desc]) => (
              <div key={sym} className="flex items-start gap-2">
                <span className="font-mono text-xs text-primary w-4 shrink-0">{sym}</span>
                <span className="font-mono text-xs text-secondary">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rearrangements */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widets uppercase">Rearrangements</p>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Solve for current (A)', formula: 'I = (m × n × F) / (t × M)' },
            { label: 'Solve for time (s)',    formula: 't = (m × n × F) / (I × M)' },
            { label: 'Charge passed (C)',      formula: 'q = I × t' },
            { label: 'Moles of electrons',     formula: 'mol e⁻ = q / F = I × t / F' },
          ].map(r => (
            <div key={r.label} className="rounded-sm border border-border px-4 py-2 flex items-center gap-4"
              style={{ background: 'rgb(var(--color-base))' }}>
              <span className="font-sans text-xs text-secondary w-40 shrink-0">{r.label}</span>
              <span className="font-mono text-sm text-primary">{r.formula}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key constants */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Key Constants</p>
        <div className="overflow-x-auto rounded-sm border border-border" style={{ background: 'rgb(var(--color-base))' }}>
          <table className="w-full border-collapse text-xs font-mono">
            <thead>
              <tr style={{ background: 'rgba(var(--overlay),0.03)' }}>
                <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">Quantity</th>
                <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">Value</th>
                <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">Unit</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Faraday constant (F)', value: '96,485', unit: 'C/mol e⁻' },
                { name: '1 Ampere',              value: '1',      unit: 'C/s' },
                { name: '1 Coulomb',             value: '1',      unit: 'A·s' },
                { name: '1 Faraday',             value: '96,485', unit: 'C (charge of 1 mol e⁻)' },
              ].map(r => (
                <tr key={r.name} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-secondary">{r.name}</td>
                  <td className="px-4 py-2 text-primary font-semibold">{r.value}</td>
                  <td className="px-4 py-2 text-dim">{r.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Common electrolysis reactions */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Common Electrolysis Applications</p>
        <div className="overflow-x-auto rounded-sm border border-border" style={{ background: 'rgb(var(--color-base))' }}>
          <table className="w-full border-collapse text-xs font-mono">
            <thead>
              <tr style={{ background: 'rgba(var(--overlay),0.03)' }}>
                <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">Process</th>
                <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">Cathode</th>
                <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">M (g/mol)</th>
                <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">n</th>
                <th className="px-4 py-2 text-left text-xs tracking-widest text-secondary uppercase border-b border-border">Application</th>
              </tr>
            </thead>
            <tbody>
              {ELECTROLYSIS_REACTIONS.map(rxn => (
                <tr key={rxn.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-primary whitespace-nowrap">{rxn.name}</td>
                  <td className="px-4 py-2 text-secondary">{rxn.cathodeReaction}</td>
                  <td className="px-4 py-2 text-secondary text-right">{rxn.molarMass}</td>
                  <td className="px-4 py-2 text-secondary text-right">{rxn.n}</td>
                  <td className="px-4 py-2 text-dim">{rxn.application}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worked example */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Worked Example — Chang Ex 18.8</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-sans text-sm text-secondary">
            A 3.00 A current is passed through a CuSO₄(aq) solution for 1.00 hour. How many grams of Cu
            are deposited at the cathode?  (M(Cu) = 63.55 g/mol, n = 2)
          </p>
          <div className="flex flex-col gap-1 pl-3 border-l-2 border-border mt-1">
            <p className="font-mono text-xs text-secondary">Charge = I × t = 3.00 A × 3600 s = 10,800 C</p>
            <p className="font-mono text-xs text-secondary">Moles e⁻ = 10,800 / 96,485 = 0.1119 mol</p>
            <p className="font-mono text-xs text-secondary">Moles Cu = 0.1119 / 2 = 0.05596 mol</p>
            <p className="font-mono text-xs text-secondary">m = (I × t × M) / (n × F) = (3.00 × 3600 × 63.55) / (2 × 96,485)</p>
            <p className="font-mono text-xs text-primary font-semibold">m ≈ 3.56 g  Cu deposited</p>
          </div>
        </div>
      </div>

      <p className="font-sans text-xs text-dim">
        Chang 14e Section 18.8 (Faraday's Law). F = 96,485 C/mol e⁻.
      </p>
    </div>
  )
}
