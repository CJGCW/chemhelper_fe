export default function ExpansionWorkReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Expansion Work</p>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          When a gas expands or is compressed against an external pressure, it does (or has done on it)
          mechanical work. At constant external pressure, this pressure–volume work is:
        </p>
        <div className="rounded-sm border border-border px-4 py-3"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-mono text-base text-primary">w = −P<sub>ext</sub> × ΔV</p>
        </div>
      </div>

      {/* Sign convention */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Sign Convention</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              case: 'Expansion  (ΔV > 0)',
              sign: 'w < 0',
              meaning: 'System does work on surroundings — system loses energy.',
              color: '#f87171',
            },
            {
              case: 'Compression  (ΔV < 0)',
              sign: 'w > 0',
              meaning: 'Surroundings do work on system — system gains energy.',
              color: '#4ade80',
            },
          ].map(r => (
            <div key={r.case} className="flex flex-col gap-2 p-3 rounded-sm border border-border"
              style={{ background: 'rgb(var(--color-surface))' }}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-sans text-xs font-medium text-primary">{r.case}</span>
                <span className="font-mono text-sm font-bold" style={{ color: r.color }}>{r.sign}</span>
              </div>
              <p className="font-sans text-xs text-secondary leading-relaxed">{r.meaning}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Units */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Units</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-1"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-mono text-xs text-secondary">P in atm, V in L → w in L·atm</p>
          <p className="font-mono text-xs text-secondary">Convert: 1 L·atm = 101.325 J</p>
          <p className="font-mono text-xs text-secondary">P in Pa, V in m³ → w in J  (no conversion needed)</p>
        </div>
      </div>

      {/* First law connection */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">First Law of Thermodynamics</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-mono text-sm text-primary">ΔU = q + w</p>
          <p className="font-mono text-xs text-secondary mt-1">q = heat absorbed by the system (+) or released (−)</p>
          <p className="font-mono text-xs text-secondary">w = work done on the system (+) or by the system (−)</p>
          <p className="font-mono text-xs text-secondary mt-1">At constant pressure: ΔH = q<sub>p</sub> = ΔU − w = ΔU + PΔV</p>
        </div>
      </div>

      {/* Worked example */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs text-secondary tracking-widest uppercase">Worked Example</p>
        <div className="rounded-sm border border-border px-4 py-3 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-base))' }}>
          <p className="font-sans text-sm text-primary">
            A gas expands from 2.00 L to 5.00 L against a constant external pressure of 1.50 atm. Calculate w.
          </p>
          <div className="flex flex-col gap-1 pl-3 border-l-2 border-border mt-1">
            <p className="font-mono text-xs text-secondary">ΔV = 5.00 − 2.00 = 3.00 L</p>
            <p className="font-mono text-xs text-secondary">w = −P<sub>ext</sub> × ΔV = −(1.50 atm)(3.00 L) = −4.50 L·atm</p>
            <p className="font-mono text-xs text-secondary">Convert: −4.50 L·atm × 101.325 J/L·atm</p>
            <p className="font-mono text-xs text-primary font-semibold">w = −456 J</p>
          </div>
          <p className="font-sans text-xs text-dim mt-1">Negative sign: gas did work on surroundings (expansion).</p>
        </div>
      </div>

    </div>
  )
}
