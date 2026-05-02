import ICETable from '../shared/ICETable'
import type { ICERow } from '../../chem/equilibrium'

const exampleRows: ICERow[] = [
  { species: 'N\u2082O\u2084', coefficient: 1, side: 'reactant', initial: 0.0400, change: '-x', changeCoeff: -1, equilibrium: '0.0400 - x' },
  { species: 'NO\u2082',  coefficient: 2, side: 'product',  initial: 0,      change: '+2x', changeCoeff: 2, equilibrium: '2x' },
]

export default function KExpressionReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">The Equilibrium Constant Expression</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          For a general reaction <span className="font-mono text-primary">aA + bB \u21cc cC + dD</span>, the equilibrium
          constant expression is:
        </p>
        <div className="rounded-sm p-4 font-mono text-base text-center text-primary"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
          K<sub>c</sub> = [C]<sup>c</sup>[D]<sup>d</sup> / [A]<sup>a</sup>[B]<sup>b</sup>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-sans font-medium text-primary">Rules for Writing K</h4>
          <ul className="flex flex-col gap-2 font-sans text-sm text-secondary leading-relaxed list-none">
            <li className="flex gap-2">
              <span className="text-primary font-mono mt-0.5">1.</span>
              <span><strong className="text-primary">Products over reactants</strong> — products in the numerator, reactants in the denominator.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-mono mt-0.5">2.</span>
              <span><strong className="text-primary">Coefficients become exponents</strong> — the stoichiometric coefficient of each species becomes the power of its concentration.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-mono mt-0.5">3.</span>
              <span><strong className="text-primary">Omit pure solids and liquids</strong> — their concentrations are constant and are absorbed into K. Only gases (g) and dissolved species (aq) appear.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-mono mt-0.5">4.</span>
              <span><strong className="text-primary">K<sub>c</sub> uses molar concentrations [M]</strong>; K<sub>p</sub> uses partial pressures (atm) for gas-phase reactions.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-mono mt-0.5">5.</span>
              <span>K is dimensionless and depends only on temperature.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">Worked Example</h3>
        <p className="font-sans text-sm text-secondary">
          Write K<sub>c</sub> for <span className="font-mono text-primary">N\u2082O\u2084(g) \u21cc 2NO\u2082(g)</span>
        </p>
        <div className="rounded-sm p-4 flex flex-col gap-2"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
          <p className="font-mono text-sm text-secondary">Step 1: Products over reactants</p>
          <p className="font-mono text-sm text-primary">K<sub>c</sub> = [NO\u2082] / [N\u2082O\u2084]</p>
          <p className="font-mono text-sm text-secondary mt-1">Step 2: Apply coefficients as exponents</p>
          <p className="font-mono text-sm text-primary">K<sub>c</sub> = [NO\u2082]<sup>2</sup> / [N\u2082O\u2084]</p>
          <p className="font-mono text-sm text-secondary mt-1">K<sub>c</sub> = 4.63 \u00d7 10<sup>-3</sup> at 25\u00b0C (Chang, Table 14.2)</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">Heterogeneous Equilibria — Omitting Solids & Liquids</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          For <span className="font-mono text-primary">CaCO\u2083(s) \u21cc CaO(s) + CO\u2082(g)</span>:
        </p>
        <div className="rounded-sm p-4 font-mono text-sm text-primary"
          style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
          <p>CaCO\u2083 and CaO are pure solids \u2192 <em>omit them</em></p>
          <p className="mt-2">K<sub>p</sub> = P(CO\u2082) &nbsp;&nbsp; (only CO\u2082 appears)</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">Interpreting K</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { range: 'K >> 1', meaning: 'Equilibrium lies far to the right — mostly products.', color: 'rgb(34 197 94)' },
            { range: 'K \u2248 1', meaning: 'Significant amounts of both products and reactants at equilibrium.', color: 'var(--c-halogen)' },
            { range: 'K << 1', meaning: 'Equilibrium lies far to the left — mostly reactants.', color: 'rgb(239 68 68)' },
          ].map(({ range, meaning, color }) => (
            <div key={range} className="rounded-sm p-3 flex flex-col gap-1"
              style={{ background: 'rgb(var(--color-raised))', border: '1px solid rgb(var(--color-border))' }}>
              <p className="font-mono text-sm font-bold" style={{ color }}>{range}</p>
              <p className="font-sans text-xs text-secondary leading-relaxed">{meaning}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-sans font-semibold text-primary text-lg">ICE Table Preview</h3>
        <p className="font-sans text-sm text-secondary">
          K expressions are solved using ICE tables. Here is the structure for N\u2082O\u2084 \u21cc 2NO\u2082:
        </p>
        <ICETable rows={exampleRows} />
      </section>

    </div>
  )
}
