import { IUPAC_PREFIXES } from '../../data/functionalGroups'

export default function OrganicNamingReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">IUPAC Naming System</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          IUPAC (International Union of Pure and Applied Chemistry) names provide an unambiguous, systematic way to
          name organic compounds. The name encodes the carbon count, degree of unsaturation, and substituents.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Naming Straight-Chain Alkanes</h3>
        <div className="flex flex-col gap-2 p-4 rounded-sm border border-border bg-surface">
          <p className="font-sans text-sm font-semibold text-primary mb-2">Rule: [prefix] + -ane</p>
          <div className="flex flex-col gap-1.5">
            {[
              'Count the longest carbon chain to get n.',
              'Look up the IUPAC prefix for that n (see table below).',
              'Add the suffix -ane (for saturated, single bonds only).',
            ].map((rule, i) => (
              <div key={i} className="flex gap-3">
                <span className="font-mono text-xs text-dim shrink-0 mt-0.5">{i+1}.</span>
                <p className="font-sans text-sm text-secondary">{rule}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1 pl-3 border-l-2 border-border">
            <p className="font-mono text-xs text-dim uppercase tracking-wider mb-1">Examples</p>
            <p className="font-sans text-sm text-secondary">CH₄ → n=1 → meth + ane → <strong className="text-primary">methane</strong></p>
            <p className="font-sans text-sm text-secondary">C₄H₁₀ → n=4 → but + ane → <strong className="text-primary">butane</strong></p>
            <p className="font-sans text-sm text-secondary">C₈H₁₈ → n=8 → oct + ane → <strong className="text-primary">octane</strong></p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Naming Alkenes (C=C Double Bond)</h3>
        <div className="flex flex-col gap-2 p-4 rounded-sm border border-border bg-surface">
          <p className="font-sans text-sm font-semibold text-primary mb-2">Rule: [prefix] + -ene (add position number if needed)</p>
          <div className="flex flex-col gap-1.5">
            {[
              'Identify the longest carbon chain containing the double bond.',
              'Number the chain from the end nearest the double bond (lowest locant rule).',
              'Name: [n-prefix]-ene. For n ≥ 4, include position: 1-butene, 2-butene.',
              'Ethene (n=2) and propene (n=3) have only one possible double-bond position — no number needed.',
            ].map((rule, i) => (
              <div key={i} className="flex gap-3">
                <span className="font-mono text-xs text-dim shrink-0 mt-0.5">{i+1}.</span>
                <p className="font-sans text-sm text-secondary">{rule}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1 pl-3 border-l-2 border-border">
            <p className="font-mono text-xs text-dim uppercase tracking-wider mb-1">Examples</p>
            <p className="font-sans text-sm text-secondary">C₂H₄ → <strong className="text-primary">ethene</strong></p>
            <p className="font-sans text-sm text-secondary">C₃H₆ → <strong className="text-primary">propene</strong></p>
            <p className="font-sans text-sm text-secondary">C₄H₈ with double bond at C1 → <strong className="text-primary">1-butene</strong></p>
            <p className="font-sans text-sm text-secondary">C₄H₈ with double bond at C2 → <strong className="text-primary">2-butene</strong></p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Naming Alkynes (C≡C Triple Bond)</h3>
        <div className="flex flex-col gap-2 p-4 rounded-sm border border-border bg-surface">
          <p className="font-sans text-sm font-semibold text-primary mb-2">Rule: [prefix] + -yne (add position number if needed)</p>
          <div className="flex flex-col gap-1.5">
            {[
              'Same as alkene naming, but use suffix -yne instead of -ene.',
              'Number to give the triple bond the lowest locant.',
              'Ethyne (n=2) and propyne (n=3) have only one possible position — no number needed.',
            ].map((rule, i) => (
              <div key={i} className="flex gap-3">
                <span className="font-mono text-xs text-dim shrink-0 mt-0.5">{i+1}.</span>
                <p className="font-sans text-sm text-secondary">{rule}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1 pl-3 border-l-2 border-border">
            <p className="font-mono text-xs text-dim uppercase tracking-wider mb-1">Examples</p>
            <p className="font-sans text-sm text-secondary">C₂H₂ → <strong className="text-primary">ethyne</strong> (also called acetylene)</p>
            <p className="font-sans text-sm text-secondary">C₃H₄ → <strong className="text-primary">propyne</strong></p>
            <p className="font-sans text-sm text-secondary">C₄H₆ with triple bond at C1 → <strong className="text-primary">1-butyne</strong></p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">IUPAC Prefix Table</h3>
        <div className="overflow-x-auto">
          <table className="font-sans text-sm border-collapse w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-6 font-mono text-xs text-secondary uppercase">n</th>
                <th className="text-left py-2 pr-6 font-mono text-xs text-secondary uppercase">Prefix</th>
                <th className="text-left py-2 pr-6 font-mono text-xs text-secondary uppercase">Alkane</th>
                <th className="text-left py-2 pr-6 font-mono text-xs text-secondary uppercase">Alkene</th>
                <th className="text-left py-2 font-mono text-xs text-secondary uppercase">Alkyne</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(IUPAC_PREFIXES).map(([n, prefix]) => {
                const num = parseInt(n)
                const alkaneName = `${prefix}ane`
                const alkeneName = num === 2 ? 'ethene' : num === 3 ? 'propene' : `1-${prefix}ene`
                const alkyneName = num === 2 ? 'ethyne' : num === 3 ? 'propyne' : num >= 2 ? `1-${prefix}yne` : '—'
                return (
                  <tr key={n} className="border-b border-border/30">
                    <td className="py-1.5 pr-6 font-mono text-bright font-medium">{n}</td>
                    <td className="py-1.5 pr-6 font-mono text-primary">{prefix}-</td>
                    <td className="py-1.5 pr-6 font-sans text-secondary">{alkaneName}</td>
                    <td className="py-1.5 pr-6 font-sans text-secondary">{num >= 2 ? alkeneName : '—'}</td>
                    <td className="py-1.5 font-sans text-secondary">{num >= 2 ? alkyneName : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-widest text-secondary uppercase">Suffix Summary</h3>
        <div className="flex flex-col gap-2">
          {[
            { suffix: '-ane', meaning: 'Alkane — all single bonds (saturated)' },
            { suffix: '-ene', meaning: 'Alkene — contains one C=C double bond' },
            { suffix: '-yne', meaning: 'Alkyne — contains one C≡C triple bond' },
            { suffix: '-ol',  meaning: 'Alcohol — contains –OH group' },
            { suffix: '-al',  meaning: 'Aldehyde — terminal C=O' },
            { suffix: '-one', meaning: 'Ketone — internal C=O' },
          ].map(row => (
            <div key={row.suffix} className="flex gap-4 items-baseline">
              <span className="font-mono text-sm text-primary font-semibold w-14 shrink-0">{row.suffix}</span>
              <span className="font-sans text-sm text-secondary">{row.meaning}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
