export default function BufferReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Henderson-Hasselbalch Equation</h3>
        <div className="p-4 rounded-sm border border-border bg-raised">
          <p className="font-mono text-lg text-center" style={{ color: 'var(--c-halogen)' }}>
            pH = pK<sub>a</sub> + log([A⁻]/[HA])
          </p>
        </div>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Buffers are solutions that resist changes in pH when small amounts of acid or base are added.
          They consist of a weak acid (HA) and its conjugate base (A⁻), or a weak base and its conjugate acid.
          The Henderson-Hasselbalch equation relates the pH of a buffer to the pKa of the weak acid and
          the ratio of conjugate base to weak acid concentrations.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Key Points</h3>
        <ul className="flex flex-col gap-2">
          {[
            'When [A⁻] = [HA], pH = pKa (half-equivalence point of a titration).',
            'Buffers work best when pH is within 1 unit of pKa (ratio between 0.1 and 10).',
            'Adding strong acid: H⁺ + A⁻ → HA  (conjugate base is consumed).',
            'Adding strong base: OH⁻ + HA → A⁻ + H₂O  (weak acid is consumed).',
            'Buffer capacity is the amount of acid/base a buffer can absorb before the pH changes by 1 unit.',
          ].map((point, i) => (
            <li key={i} className="flex items-start gap-2 font-sans text-sm text-secondary">
              <span className="font-mono text-xs mt-0.5" style={{ color: 'var(--c-halogen)' }}>▸</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Worked Example (Chang 16.3)</h3>
        <div className="p-4 rounded-sm border border-border bg-raised flex flex-col gap-3">
          <p className="font-sans text-sm text-primary">
            Calculate the pH of a buffer that is 0.10 M in acetic acid (CH₃COOH, pKa = 4.74) and
            0.10 M in sodium acetate (CH₃COONa).
          </p>
          <div className="flex flex-col gap-1.5 pl-3 border-l-2" style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 35%, transparent)' }}>
            {[
              'pH = pKa + log([CH₃COO⁻]/[CH₃COOH])',
              'pH = 4.74 + log(0.10/0.10)',
              'pH = 4.74 + log(1.00)',
              'pH = 4.74 + 0 = 4.74',
            ].map((step, i) => (
              <p key={i} className="font-mono text-sm text-primary">{step}</p>
            ))}
          </div>
          <p className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>
            ∴ pH = 4.74
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Buffer Region</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          The buffer region is the range of pH values over which a buffer effectively resists pH changes.
          It spans approximately pKa ± 1. Outside this range, the buffer loses effectiveness because
          either the weak acid or conjugate base is nearly depleted.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-secondary font-normal">Acid</th>
                <th className="text-left py-2 pr-4 text-secondary font-normal">pKa</th>
                <th className="text-left py-2 text-secondary font-normal">Buffer Range</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Acetic acid / acetate',      pKa: 4.74  },
                { name: 'Hydrofluoric / fluoride',    pKa: 3.17  },
                { name: 'Formic / formate',           pKa: 3.77  },
                { name: 'Hypochlorous / hypochlorite', pKa: 7.52  },
                { name: 'Carbonic / bicarbonate',     pKa: 6.38  },
                { name: 'Ammonia / ammonium',         pKa: 9.26  },
                { name: 'Boric / borate',             pKa: 9.24  },
              ].map((row) => (
                <tr key={row.name} className="border-b border-border/50">
                  <td className="py-1.5 pr-4 text-primary">{row.name}</td>
                  <td className="py-1.5 pr-4" style={{ color: 'var(--c-halogen)' }}>{row.pKa.toFixed(2)}</td>
                  <td className="py-1.5 text-secondary">{(row.pKa - 1).toFixed(2)} – {(row.pKa + 1).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
