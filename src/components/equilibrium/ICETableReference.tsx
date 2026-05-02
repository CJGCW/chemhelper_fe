import ICETable from '../shared/ICETable'
import type { ICERow } from '../../chem/equilibrium'

const exampleRows: ICERow[] = [
  { species: 'N\u2082O\u2084', coefficient: 1, side: 'reactant', initial: 0.0400, change: '-x', changeCoeff: -1, equilibrium: '0.0400 - x \u2248 0.0338' },
  { species: 'NO\u2082',  coefficient: 2, side: 'product',  initial: 0,      change: '+2x', changeCoeff: 2, equilibrium: '2x \u2248 0.0124' },
]

export default function ICETableReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">The ICE Table Method</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          ICE stands for <strong className="text-primary">Initial, Change, Equilibrium</strong>. It is a systematic way
          to find equilibrium concentrations when K and initial concentrations are known.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { letter: 'I', name: 'Initial', desc: 'Starting concentrations before any reaction occurs.' },
            { letter: 'C', name: 'Change', desc: 'Amount each species changes by x (negative for reactants, positive for products).' },
            { letter: 'E', name: 'Equilibrium', desc: 'Final concentrations: I + C = equilibrium expression in terms of x.' },
          ].map(({ letter, name, desc }) => (
            <div key={letter} className="rounded-sm p-3 flex flex-col gap-1"
              style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
              <p className="font-mono text-lg font-bold" style={{ color: 'var(--c-halogen)' }}>{letter}</p>
              <p className="font-sans text-sm font-medium text-primary">{name}</p>
              <p className="font-sans text-xs text-secondary leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">Worked Example (Chang Ex 14.5)</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          N₂O₄(g) ⇌ 2NO₂(g) &nbsp; K<sub>c</sub> = 4.63 × 10<sup>-3</sup> at 25°C.
          Initial: [N₂O₄]₀ = 0.0400 M, [NO₂]₀ = 0.
        </p>

        <ICETable rows={exampleRows} />

        <div className="rounded-sm p-4 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
          <p className="font-mono text-sm text-secondary">Write K in terms of x:</p>
          <p className="font-mono text-sm text-primary">K = (2x)\u00b2 / (0.0400 - x) = 4x\u00b2 / (0.0400 - x)</p>
          <p className="font-mono text-sm text-secondary mt-1">Try 5% approximation: x \u2248 \u221a(K \u00d7 0.0400/4) = \u221a(4.63\u00d710\u207b\u00b3 \u00d7 0.01) \u2248 0.00680</p>
          <p className="font-mono text-sm text-secondary">Check: 0.00680/0.0400 = 17% &gt; 5% \u2192 use exact quadratic</p>
          <p className="font-mono text-sm text-secondary mt-1">4x\u00b2 + 4.63\u00d710\u207b\u00b3x - 1.852\u00d710\u207b\u2074 = 0</p>
          <p className="font-mono text-sm text-primary">x \u2248 0.00620 M</p>
          <p className="font-mono text-sm text-secondary mt-1">
            [N₂O₄]<sub>eq</sub> = 0.0400 - 0.00620 = 0.0338 M
          </p>
          <p className="font-mono text-sm text-secondary">
            [NO₂]<sub>eq</sub> = 2(0.00620) = 0.0124 M
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">The 5% Rule (Approximation)</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          When K is small, x is small relative to the initial concentration. You can simplify by assuming
          <span className="font-mono text-primary"> x &lt;&lt; [A]₀</span>, so <span className="font-mono text-primary">[A]₀ - x ≈ [A]₀</span>.
        </p>
        <div className="rounded-sm p-4 flex flex-col gap-1"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
          <p className="font-mono text-sm text-primary">Check: (x / [A]₀) × 100% ≤ 5% → approximation valid</p>
          <p className="font-mono text-sm text-secondary">If &gt;5%, solve the full quadratic equation.</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">General Steps</h3>
        <ol className="flex flex-col gap-2 font-sans text-sm text-secondary leading-relaxed list-none">
          {[
            'Identify all active species (omit solids and liquids).',
            'Fill in the Initial row with given concentrations.',
            'Define x as the change. Reactants decrease by coeff\u00b7x, products increase by coeff\u00b7x.',
            'Write Equilibrium = Initial + Change for each species.',
            'Substitute into the K expression and solve for x.',
            'Check the 5% approximation; use quadratic if it fails.',
            'Back-calculate all equilibrium concentrations.',
            'Verify by substituting back into K.',
          ].map((step, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-mono text-primary shrink-0">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

    </div>
  )
}
