export default function StereochemistryReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">Key Vocabulary</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { term: 'Chiral center (stereocenter)', def: 'A carbon bonded to 4 different groups. Also called a stereogenic center.' },
            { term: 'Chirality', def: 'Property of a molecule that is non-superimposable on its mirror image (like left and right hands).' },
            { term: 'Enantiomers', def: 'Non-superimposable mirror images. Opposite configuration at ALL stereocenters.' },
            { term: 'Diastereomers', def: 'Stereoisomers that are NOT mirror images — differ at SOME (but not all) stereocenters.' },
            { term: 'Meso compound', def: 'Has stereocenters but is achiral due to an internal plane of symmetry (mirror plane through the molecule).' },
            { term: 'Racemic mixture', def: 'A 50:50 mixture of two enantiomers. Optically inactive (rotations cancel).' },
            { term: 'Optical activity', def: 'A chiral compound rotates plane-polarized light. (+) = dextrorotatory, (−) = levorotatory.' },
            { term: 'Specific rotation [α]', def: '[α] = α / (l · c), where α = observed rotation (°), l = path length (dm), c = concentration (g/mL).' },
            { term: 'Enantiomeric excess (ee)', def: 'ee = |% major – % minor|. A racemic mixture has ee = 0%; a pure enantiomer has ee = 100%.' },
            { term: 'Resolution', def: 'Separation of a racemic mixture into pure enantiomers, typically using a chiral resolving agent.' },
          ].map(({ term, def }) => (
            <div key={term} className="p-3 rounded-sm border border-border bg-surface">
              <p className="font-mono text-xs font-semibold text-primary mb-1">{term}</p>
              <p className="font-sans text-sm text-secondary leading-relaxed">{def}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">The 2ⁿ Rule</h3>
        <p className="font-sans text-sm text-secondary leading-relaxed">
          A molecule with <em>n</em> stereocenters has at most 2ⁿ stereoisomers. The actual number may be
          less if any are meso compounds.
        </p>
        <div className="overflow-x-auto">
          <table className="font-mono text-xs border-collapse w-full max-w-md">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 pr-6 text-dim font-normal">Stereocenters (n)</th>
                <th className="text-right py-1.5 pr-6 text-dim font-normal">Max stereoisomers (2ⁿ)</th>
                <th className="text-left py-1.5 text-dim font-normal">Example</th>
              </tr>
            </thead>
            <tbody className="text-secondary">
              {[
                [1, 2, 'R- and S-2-bromobutane'],
                [2, 4, '2,3-dibromobutane (+ meso = 3 actual)'],
                [3, 8, 'Aldohexoses have 4 stereocenters → 16'],
                [4, 16, 'Glucose (one of 16 aldohexoses)'],
              ].map(([n, max, ex]) => (
                <tr key={String(n)} className="border-b border-border/50">
                  <td className="py-1.5 pr-6 text-center">{n}</td>
                  <td className="py-1.5 pr-6 text-right" style={{ color: 'var(--c-halogen)' }}>{max}</td>
                  <td className="py-1.5 text-dim text-[11px]">{ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">CIP Priority Rules (Cahn-Ingold-Prelog)</h3>
        <ol className="font-sans text-sm text-secondary flex flex-col gap-2 list-decimal list-inside leading-relaxed">
          <li><strong className="text-primary">Atomic number first:</strong> Higher atomic number = higher priority. I &gt; Br &gt; Cl &gt; S &gt; O &gt; N &gt; C &gt; H.</li>
          <li><strong className="text-primary">Tie-breaking — look further along the chain:</strong> Compare atoms one bond out, then two bonds out, etc.</li>
          <li><strong className="text-primary">Double bonds = phantom atoms:</strong> A C=O is treated as C(O)(O) on the carbon side and O(C)(C) on the oxygen side.</li>
          <li><strong className="text-primary">Triple bonds:</strong> C≡N counts as C(N)(N)(N) and N(C)(C)(C).</li>
          <li><strong className="text-primary">Isotopes:</strong> Higher mass isotope wins (D &gt; H, ¹³C &gt; ¹²C).</li>
        </ol>

        <div className="p-3 rounded-sm border border-border bg-surface">
          <p className="font-mono text-xs text-dim uppercase tracking-wider mb-2">Assigning R or S</p>
          <ol className="font-sans text-sm text-secondary flex flex-col gap-1 list-decimal list-inside">
            <li>Assign priorities 1 (highest) → 4 (lowest) to the four substituents.</li>
            <li>Orient the molecule so that priority 4 points away from you (or use the correction below).</li>
            <li>Trace 1→2→3: <strong className="text-primary">clockwise = R</strong>, <strong className="text-primary">counterclockwise = S</strong>.</li>
            <li>Correction: if priority 4 points toward you, flip R↔S.</li>
          </ol>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-xs tracking-widest uppercase text-secondary">Stereoisomer Relationships</h3>
        <div className="overflow-x-auto">
          <table className="font-mono text-xs border-collapse w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 pr-4 text-dim font-normal">Relationship</th>
                <th className="text-left py-1.5 pr-4 text-dim font-normal">Definition</th>
                <th className="text-left py-1.5 text-dim font-normal">Same physical props?</th>
              </tr>
            </thead>
            <tbody className="text-secondary text-sm">
              {[
                ['Enantiomers', 'Mirror images, all stereocenters inverted', 'Yes (except optical rotation)'],
                ['Diastereomers', 'Not mirror images, some stereocenters differ', 'No (different mp, bp, Rf, etc.)'],
                ['Meso compound', 'Chiral centers + internal mirror plane → achiral', 'Same as itself; diastereomer of enantiomers'],
                ['Constitutional isomers', 'Different connectivity (not stereoisomers)', 'No'],
              ].map(([rel, def, same]) => (
                <tr key={rel} className="border-b border-border/50">
                  <td className="py-1.5 pr-4 text-primary font-semibold">{rel}</td>
                  <td className="py-1.5 pr-4">{def}</td>
                  <td className="py-1.5 text-dim text-[11px]">{same}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}
