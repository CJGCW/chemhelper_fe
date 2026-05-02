export default function LeChatelierReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">Le Chatelier's Principle</h3>
        <div className="rounded-sm p-4"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
          <p className="font-sans text-sm text-primary leading-relaxed italic">
            "If an external stress is applied to a system at equilibrium, the system adjusts in a way that partially
            offsets the stress."
          </p>
          <p className="font-mono text-xs text-secondary mt-2">— Henri Louis Le Chatelier, 1884</p>
        </div>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Three types of stress can shift an equilibrium: changes in <strong className="text-primary">concentration</strong>,
          changes in <strong className="text-primary">pressure/volume</strong> (for gas-phase reactions), and changes in{' '}
          <strong className="text-primary">temperature</strong>.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">1. Concentration Changes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { stress: 'Add a reactant', result: 'Shift forward \u2192 (to consume the added reactant)', color: 'rgb(34 197 94)' },
            { stress: 'Remove a reactant', result: 'Shift reverse \u2190 (to replenish the removed reactant)', color: 'rgb(239 68 68)' },
            { stress: 'Add a product', result: 'Shift reverse \u2190 (to consume the added product)', color: 'rgb(239 68 68)' },
            { stress: 'Remove a product', result: 'Shift forward \u2192 (to replenish the removed product)', color: 'rgb(34 197 94)' },
          ].map(({ stress, result, color }) => (
            <div key={stress} className="rounded-sm p-3 flex flex-col gap-1"
              style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
              <p className="font-sans text-sm font-medium text-primary">{stress}</p>
              <p className="font-sans text-xs leading-relaxed" style={{ color }}>{result}</p>
            </div>
          ))}
        </div>
        <p className="font-sans text-xs text-secondary">
          Note: Concentration changes do <strong>not</strong> change K — only temperature does.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">2. Pressure / Volume Changes (Gas-Phase Only)</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Increasing pressure (decreasing volume) shifts equilibrium toward the side with <strong className="text-primary">fewer moles of gas</strong>.
          Decreasing pressure shifts toward the side with <strong className="text-primary">more moles of gas</strong>.
        </p>
        <div className="rounded-sm p-4 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
          <p className="font-mono text-sm text-primary">N\u2082O\u2084(g) \u21cc 2NO\u2082(g)</p>
          <p className="font-sans text-sm text-secondary">\u0394n = 2 \u2212 1 = 1 (more moles on the right)</p>
          <p className="font-sans text-sm text-primary">Increasing pressure \u2192 shift <strong>left</strong> (fewer gas moles)</p>
          <p className="font-sans text-sm text-primary">Decreasing pressure \u2192 shift <strong>right</strong> (more gas moles)</p>
        </div>
        <div className="rounded-sm p-3 font-sans text-sm text-secondary"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          <strong className="text-primary">Special case:</strong> Adding an inert gas at constant volume has <em>no effect</em> on equilibrium —
          partial pressures of reacting gases are unchanged.
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">3. Temperature Changes</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          Temperature changes are unique: they <strong className="text-primary">change the value of K</strong>, not just the position of equilibrium.
          Treat heat as a reactant or product:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              type: 'Exothermic reaction (\u0394H < 0)',
              formula: 'A + B \u21cc C + D + heat',
              increase: 'Increase T \u2192 shift left (K decreases)',
              decrease: 'Decrease T \u2192 shift right (K increases)',
              color: 'rgb(251 146 60)',
            },
            {
              type: 'Endothermic reaction (\u0394H > 0)',
              formula: 'A + B + heat \u21cc C + D',
              increase: 'Increase T \u2192 shift right (K increases)',
              decrease: 'Decrease T \u2192 shift left (K decreases)',
              color: 'rgb(96 165 250)',
            },
          ].map(({ type, formula, increase, decrease, color }) => (
            <div key={type} className="rounded-sm p-3 flex flex-col gap-2"
              style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
              <p className="font-sans text-sm font-medium" style={{ color }}>{type}</p>
              <p className="font-mono text-xs text-primary">{formula}</p>
              <p className="font-sans text-xs text-secondary">{increase}</p>
              <p className="font-sans text-xs text-secondary">{decrease}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">Worked Example: Haber Process</h3>
        <div className="rounded-sm p-4 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
          <p className="font-mono text-sm text-primary">N\u2082(g) + 3H\u2082(g) \u21cc 2NH\u2083(g) &nbsp; \u0394H = \u2212 92 kJ/mol</p>
          <div className="mt-2 flex flex-col gap-1.5 font-sans text-sm text-secondary">
            <p><strong className="text-primary">Increase [N\u2082]:</strong> shift right \u2192 more NH\u2083 produced.</p>
            <p><strong className="text-primary">Increase pressure:</strong> \u0394n = 2 \u2212 4 = \u22122, shift right \u2192 favors NH\u2083.</p>
            <p><strong className="text-primary">Increase temperature:</strong> exothermic \u2192 shift left, K decreases \u2192 less NH\u2083.</p>
            <p className="text-xs text-dim italic">Industrial compromise: moderate T (400\u00b0C) for acceptable rate, high P (\u223c200 atm), with Fe catalyst.</p>
          </div>
        </div>
      </section>

    </div>
  )
}
