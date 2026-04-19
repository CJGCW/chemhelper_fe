export default function HeatTransferReference() {
  const labelCls = 'font-mono text-xs text-secondary tracking-widest uppercase'

  const SPECIFIC_HEATS = [
    { substance: 'Water (l)',  formula: 'H₂O (l)', c: '4.184' },
    { substance: 'Water (s)',  formula: 'H₂O (s)', c: '2.09'  },
    { substance: 'Water (g)',  formula: 'H₂O (g)', c: '2.01'  },
    { substance: 'Aluminum',   formula: 'Al',       c: '0.897' },
    { substance: 'Copper',     formula: 'Cu',       c: '0.385' },
    { substance: 'Iron',       formula: 'Fe',       c: '0.449' },
    { substance: 'Lead',       formula: 'Pb',       c: '0.128' },
    { substance: 'Silver',     formula: 'Ag',       c: '0.235' },
    { substance: 'Gold',       formula: 'Au',       c: '0.129' },
    { substance: 'Ethanol',    formula: 'C₂H₅OH',  c: '2.44'  },
    { substance: 'Glass',      formula: 'SiO₂',    c: '0.84'  },
  ]

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      {/* Main formula */}
      <div className="rounded-sm border border-border bg-surface p-5 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-2xl text-bright tracking-tight">
            q<sub>gained</sub> = −q<sub>lost</sub>
          </p>
          <p className="font-mono text-sm text-secondary">
            m₁c₁(T_f − T₁) + m₂c₂(T_f − T₂) = 0
          </p>
        </div>
        <div className="h-px bg-border" />
        <p className="font-sans text-sm text-secondary leading-relaxed">
          When two objects at different temperatures are brought into contact in an isolated system,
          heat flows from the hotter object to the cooler one until both reach the same final temperature.
          Energy is conserved: all heat lost by the hot object is gained by the cold object.
        </p>
      </div>

      {/* Rearrangements */}
      <div className="flex flex-col gap-2">
        <span className={labelCls}>Solving for each unknown</span>
        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          {[
            {
              lhs: 'T_f =',
              rhs: '(m₁c₁T₁ + m₂c₂T₂) / (m₁c₁ + m₂c₂)',
              label: 'final (equilibrium) temperature',
            },
            {
              lhs: 'T₁ =',
              rhs: 'T_f + m₂c₂(T_f − T₂) / (m₁c₁)',
              label: 'initial temperature of object 1',
            },
            {
              lhs: 'm₁ =',
              rhs: '−m₂c₂(T_f − T₂) / [c₁(T_f − T₁)]',
              label: 'mass of object 1',
            },
          ].map(row => (
            <div key={row.lhs}
              className="grid grid-cols-[5rem_1fr_1fr] gap-x-3 items-baseline px-4 py-2.5 border-b border-border last:border-b-0">
              <span className="font-mono text-sm text-primary">{row.lhs}</span>
              <span className="font-mono text-sm text-bright">{row.rhs}</span>
              <span className="font-sans text-xs text-secondary">{row.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Variable definitions */}
      <div className="flex flex-col gap-2">
        <span className={labelCls}>Variables</span>
        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          {[
            { sym: 'm₁, m₂',   def: 'Mass of each object (g)' },
            { sym: 'c₁, c₂',   def: 'Specific heat capacity of each object (J/g·°C)' },
            { sym: 'T₁, T₂',   def: 'Initial temperature of each object (°C)' },
            { sym: 'T_f',       def: 'Final equilibrium temperature (°C)' },
            { sym: 'q',         def: 'Heat transferred (J); positive = absorbed, negative = released' },
          ].map(row => (
            <div key={row.sym}
              className="grid grid-cols-[8rem_1fr] gap-x-4 items-baseline px-4 py-2.5 border-b border-border last:border-b-0">
              <span className="font-mono text-sm text-primary">{row.sym}</span>
              <span className="font-sans text-sm text-secondary">{row.def}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-step */}
      <div className="flex flex-col gap-2">
        <span className={labelCls}>How to Solve</span>
        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          {[
            { n: '1', text: 'Identify the two objects, their masses, specific heats, and initial temperatures.' },
            { n: '2', text: 'Write q₁ + q₂ = 0 where q = mcΔT and ΔT = T_f − T_initial for each object.' },
            { n: '3', text: 'Substitute all known values.' },
            { n: '4', text: 'Solve algebraically for the unknown. For T_f: factor it out and divide.' },
            { n: '5', text: 'Check: T_f must fall between the two initial temperatures.' },
          ].map(step => (
            <div key={step.n}
              className="flex items-start gap-4 px-4 py-3 border-b border-border last:border-b-0">
              <span className="font-mono text-xs text-dim shrink-0 w-4">{step.n}.</span>
              <span className="font-sans text-sm text-secondary">{step.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sign convention */}
      <div className="flex flex-col gap-2">
        <span className={labelCls}>Sign Convention</span>
        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          {[
            { sign: 'q > 0', label: 'Object gains heat',   note: 'T_f > T_initial (temperature rises)' },
            { sign: 'q < 0', label: 'Object loses heat',   note: 'T_f < T_initial (temperature drops)' },
            { sign: 'q = 0', label: 'No heat transferred', note: 'Object already at T_f'               },
          ].map(row => (
            <div key={row.sign}
              className="grid grid-cols-[5rem_8rem_1fr] gap-x-4 items-baseline px-4 py-2.5 border-b border-border last:border-b-0">
              <span className="font-mono text-sm text-primary">{row.sign}</span>
              <span className="font-sans text-sm text-secondary">{row.label}</span>
              <span className="font-mono text-xs text-dim">{row.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Specific heat table */}
      <div className="flex flex-col gap-2">
        <span className={labelCls}>Common Specific Heats</span>
        <div className="rounded-sm border border-border bg-surface overflow-hidden">
          <div className="grid grid-cols-3 px-4 py-2 border-b border-border">
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">Substance</span>
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">Formula</span>
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">c (J/g·°C)</span>
          </div>
          {SPECIFIC_HEATS.map(row => (
            <div key={row.substance}
              className="grid grid-cols-3 px-4 py-2.5 border-b border-border last:border-b-0 hover:bg-raised transition-colors">
              <span className="font-sans text-sm text-secondary">{row.substance}</span>
              <span className="font-mono text-sm text-primary">{row.formula}</span>
              <span className="font-mono text-sm text-bright">{row.c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Assumption note */}
      <div className="rounded-sm border px-4 py-3"
        style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 20%, transparent)', background: 'color-mix(in srgb, var(--c-halogen) 5%, rgb(var(--color-surface)))' }}>
        <p className="font-mono text-xs text-secondary leading-relaxed">
          <span className="text-primary font-semibold">Assumption:</span> These calculations assume a perfectly insulated (calorimeter) system with no heat loss to the surroundings, no phase changes, and constant specific heats over the temperature range.
        </p>
      </div>

    </div>
  )
}
