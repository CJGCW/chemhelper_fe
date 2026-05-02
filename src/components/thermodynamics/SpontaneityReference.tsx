export default function SpontaneityReference() {
  const cases = [
    {
      dH: '< 0', dS: '> 0',
      result: 'Always spontaneous',
      note: 'Exothermic + entropy increase — ΔG < 0 at all T',
      color: 'text-emerald-400',
    },
    {
      dH: '> 0', dS: '< 0',
      result: 'Never spontaneous',
      note: 'Endothermic + entropy decrease — ΔG > 0 at all T',
      color: 'text-red-400',
    },
    {
      dH: '< 0', dS: '< 0',
      result: 'Spontaneous at low T',
      note: 'Enthalpy dominates at low T. T < ΔH/ΔS (crossover)',
      color: 'text-amber-400',
    },
    {
      dH: '> 0', dS: '> 0',
      result: 'Spontaneous at high T',
      note: 'Entropy dominates at high T. T > ΔH/ΔS (crossover)',
      color: 'text-amber-400',
    },
  ]

  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      {/* Criterion */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Spontaneity Criterion</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          A process is spontaneous when <span className="font-mono text-primary">ΔG &lt; 0</span>.
          At constant T and P: <span className="font-mono text-primary">ΔG° = ΔH° − T·ΔS°</span>.
          Spontaneity depends on the balance between enthalpy (ΔH) and entropy (ΔS) at temperature T.
        </p>
        <div className="grid grid-cols-3 gap-2 p-4 rounded-sm border border-border bg-raised font-mono text-sm">
          <div className="text-center">
            <p className="text-secondary text-xs mb-1">ΔG &lt; 0</p>
            <p style={{ color: 'var(--c-halogen)' }}>Spontaneous</p>
          </div>
          <div className="text-center">
            <p className="text-secondary text-xs mb-1">ΔG = 0</p>
            <p className="text-secondary">Equilibrium</p>
          </div>
          <div className="text-center">
            <p className="text-secondary text-xs mb-1">ΔG &gt; 0</p>
            <p className="text-red-400">Non-spontaneous</p>
          </div>
        </div>
      </section>

      {/* Four Cases */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">The Four ΔH / ΔS Cases</h3>
        <div className="flex flex-col gap-3">
          {cases.map((c, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-sm border border-border bg-raised">
              <div className="flex gap-4 shrink-0">
                <div className="flex flex-col items-center">
                  <span className="font-mono text-xs text-secondary">ΔH°</span>
                  <span className="font-mono text-sm text-primary">{c.dH}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-mono text-xs text-secondary">ΔS°</span>
                  <span className="font-mono text-sm text-primary">{c.dS}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className={`font-sans text-sm font-semibold ${c.color}`}>{c.result}</p>
                <p className="font-sans text-xs text-secondary mt-0.5">{c.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Crossover Temperature */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Crossover Temperature</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          For the mixed-sign cases (low-T / high-T), the reaction becomes non-spontaneous above or below a crossover temperature
          T<sub>c</sub> where ΔG° = 0:
        </p>
        <div className="p-4 rounded-sm border border-border bg-raised font-mono text-sm text-primary text-center">
          T<sub>c</sub> = ΔH° / ΔS°&nbsp;&nbsp;&nbsp;(convert ΔH° to J: T<sub>c</sub> = ΔH°(kJ) × 1000 / ΔS°(J/K))
        </div>
        <p className="font-sans text-xs text-secondary">
          Note: both ΔH° and ΔS° must carry the same sign for a crossover to exist at T &gt; 0 K.
        </p>
      </section>

      {/* Decision Chart */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Decision Flowchart</h3>
        <div className="p-4 rounded-sm border border-border bg-raised font-mono text-xs flex flex-col gap-2 text-secondary">
          <p>1. Determine sign of ΔH° (exo: −, endo: +) and ΔS° (+ or −)</p>
          <p className="pl-4">├─ ΔH° &lt; 0, ΔS° &gt; 0 → <span className="text-emerald-400">Always spontaneous</span></p>
          <p className="pl-4">├─ ΔH° &gt; 0, ΔS° &lt; 0 → <span className="text-red-400">Never spontaneous</span></p>
          <p className="pl-4">├─ ΔH° &lt; 0, ΔS° &lt; 0 → <span className="text-amber-400">Spontaneous at T &lt; Tc</span></p>
          <p className="pl-4">└─ ΔH° &gt; 0, ΔS° &gt; 0 → <span className="text-amber-400">Spontaneous at T &gt; Tc</span></p>
          <p>2. If mixed signs: Tc = ΔH°(J) / ΔS° and check whether T is above or below Tc</p>
        </div>
      </section>
    </div>
  )
}
