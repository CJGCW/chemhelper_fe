export default function BufferCapacityReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Buffer Capacity</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Buffer capacity (β) is a quantitative measure of how much strong acid or base a buffer can
          absorb before its pH changes significantly (by 1 unit). A larger buffer capacity means the
          buffer is more resistant to pH changes.
        </p>
        <div className="p-4 rounded-sm border border-border bg-raised flex flex-col gap-2">
          <p className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>
            Acid capacity ≈ moles of A⁻ that can absorb H⁺ before pH drops 1 unit
          </p>
          <p className="font-mono text-sm" style={{ color: 'var(--c-halogen)' }}>
            Base capacity ≈ moles of HA that can absorb OH⁻ before pH rises 1 unit
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Factors Affecting Capacity</h3>
        <ul className="flex flex-col gap-2">
          {[
            'Higher concentration → greater capacity (more moles available to react).',
            'Larger volume → greater capacity (total moles = C × V).',
            'When [HA] = [A⁻], the buffer has equal acid and base capacity.',
            'The maximum capacity occurs at pH = pKa (equal concentrations).',
            'Capacity decreases as pH moves away from pKa (one component is depleted).',
          ].map((point, i) => (
            <li key={i} className="flex items-start gap-2 font-sans text-sm text-secondary">
              <span className="font-mono text-xs mt-0.5" style={{ color: 'var(--c-halogen)' }}>▸</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Example</h3>
        <div className="p-4 rounded-sm border border-border bg-raised flex flex-col gap-3">
          <p className="font-sans text-sm text-primary">
            A 500 mL buffer contains 0.20 M acetic acid and 0.20 M sodium acetate. How much NaOH (in moles)
            can be added before the pH rises more than 1 unit above the buffer pH (4.74)?
          </p>
          <div className="flex flex-col gap-1.5 pl-3 border-l-2" style={{ borderColor: 'color-mix(in srgb, var(--c-halogen) 35%, transparent)' }}>
            {[
              'Moles HA = 0.20 M × 0.500 L = 0.100 mol',
              'At pH = pKa + 1 = 5.74: [A⁻]/[HA] = 10',
              'Need: (mol A⁻ + x) / (mol HA − x) = 10  →  x = (10×0.100 − 0.100) / 11 ≈ 0.082 mol',
              'Base capacity ≈ 0.082 mol NaOH',
            ].map((step, i) => (
              <p key={i} className="font-mono text-sm text-primary">{step}</p>
            ))}
          </div>
          <p className="font-mono text-sm font-semibold" style={{ color: 'var(--c-halogen)' }}>
            ∴ Up to ~0.082 mol NaOH before the buffer fails
          </p>
        </div>
      </section>
    </div>
  )
}
