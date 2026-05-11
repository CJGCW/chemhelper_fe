export default function NucleobasesReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Nucleobases</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          The five heterocyclic bases used in DNA and RNA. Each base pairs specifically with its complement
          via hydrogen bonds. Brown Ch. 28.
        </p>
      </div>

      {/* Mnemonics */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Mnemonics</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
          <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-semibold text-primary mb-1">&quot;Pyrimidines are CUT&quot;</p>
            <p className="text-secondary"><strong>C</strong>ytosine, <strong>U</strong>racil, <strong>T</strong>hymine are all pyrimidines (single 6-membered ring). CUT like scissors — pyrimidines are the smaller, single-ring bases.</p>
          </div>
          <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-semibold text-primary mb-1">&quot;Pure As Gold&quot;</p>
            <p className="text-secondary"><strong>Pur</strong>ines: <strong>A</strong>denine and <strong>G</strong>uanine are purines (bicyclic: pyrimidine fused to imidazole). Purines are the larger, double-ring bases.</p>
          </div>
        </div>
      </section>

      {/* Purines */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Purines (Bicyclic — 2 rings fused)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              name: 'Adenine (A)',
              iupac: '6-aminopurine',
              presence: 'Both DNA and RNA',
              pairs: 'T (DNA) or U (RNA) — 2 hydrogen bonds',
              structure: 'Purine ring (6-membered pyrimidine + 5-membered imidazole fused). NH₂ at position 6.',
              note: 'Part of ATP, NAD⁺, FAD — central to energy metabolism. N9 connects to sugar.',
            },
            {
              name: 'Guanine (G)',
              iupac: '2-amino-6-oxopurine',
              presence: 'Both DNA and RNA',
              pairs: 'C — 3 hydrogen bonds (G-C pair is stronger than A-T)',
              structure: 'Purine ring with C=O at position 6 (keto form) and NH₂ at position 2.',
              note: 'G-C content determines thermal stability of DNA. High GC% → higher melting temperature. N9 connects to sugar.',
            },
          ].map(b => (
            <div key={b.name} className="rounded-sm border border-border p-4" style={{ background: 'rgb(var(--color-raised))' }}>
              <p className="font-sans text-sm font-semibold text-primary mb-1">{b.name}</p>
              <p className="font-mono text-xs text-secondary mb-2">{b.iupac}</p>
              <div className="flex flex-col gap-1 text-xs font-sans text-secondary">
                <p><span className="font-semibold text-primary">Present in:</span> {b.presence}</p>
                <p><span className="font-semibold text-primary">Base pair:</span> {b.pairs}</p>
                <p><span className="font-semibold text-primary">Structure:</span> {b.structure}</p>
                <p className="italic mt-1">{b.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pyrimidines */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Pyrimidines (Monocyclic — 1 six-membered ring)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              name: 'Cytosine (C)',
              iupac: '4-amino-2-oxopyrimidine',
              presence: 'Both DNA and RNA',
              pairs: 'G — 3 H-bonds',
              note: 'NH₂ at C4, C=O at C2. N1 connects to sugar. Deaminated by nitrous acid → uracil (C→U mutation).',
            },
            {
              name: 'Thymine (T)',
              iupac: '5-methyl-2,4-dioxopyrimidine',
              presence: 'DNA only',
              pairs: 'A — 2 H-bonds',
              note: 'Has a methyl group at C5 (unlike uracil). Only base unique to DNA. UV light can cause thymine dimers between adjacent T residues.',
            },
            {
              name: 'Uracil (U)',
              iupac: '2,4-dioxopyrimidine',
              presence: 'RNA only (replaces T)',
              pairs: 'A — 2 H-bonds',
              note: 'Thymine without the C5 methyl group. Lacks the methyl group — energetically cheaper to make, consistent with RNA\'s transient role.',
            },
          ].map(b => (
            <div key={b.name} className="rounded-sm border border-border p-4" style={{ background: 'rgb(var(--color-raised))' }}>
              <p className="font-sans text-sm font-semibold text-primary mb-1">{b.name}</p>
              <p className="font-mono text-xs text-secondary mb-2">{b.iupac}</p>
              <div className="flex flex-col gap-1 text-xs font-sans text-secondary">
                <p><span className="font-semibold text-primary">In:</span> {b.presence}</p>
                <p><span className="font-semibold text-primary">Pairs:</span> {b.pairs}</p>
                <p className="italic mt-1">{b.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tautomerism */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Tautomerism — Why Keto Form Matters</h4>
        <div className="rounded-sm border border-border p-4 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="text-secondary mb-2">
            Bases exist in equilibrium between <strong className="text-primary">keto</strong> (major) and <strong className="text-primary">enol</strong> tautomers.
            For amino groups: <strong className="text-primary">amino</strong> (major) vs <strong className="text-primary">imino</strong> tautomers.
          </p>
          <p className="text-secondary mb-2">
            In DNA, the keto/amino form predominates and gives correct base pairing (G-C, A-T).
            The rare enol/imino tautomer has different H-bond donor/acceptor geometry — it can misbase-pair:
          </p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <p className="font-semibold text-primary mb-1">Tautomer mispairings</p>
              <p className="text-secondary">Enol-G pairs with T instead of C.</p>
              <p className="text-secondary">Enol-T pairs with G instead of A.</p>
              <p className="text-secondary">Imino-A pairs with C instead of T.</p>
              <p className="text-secondary">Imino-C pairs with A instead of G.</p>
            </div>
            <div>
              <p className="font-semibold text-primary mb-1">Consequence</p>
              <p className="text-secondary">Rare tautomers during replication can introduce point mutations (transition mutations). This is one mechanism of spontaneous mutagenesis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Base pair summary */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Watson-Crick Base Pairs</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-sm border border-border p-3 text-center" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-mono text-xl font-bold text-primary">A – T</p>
            <p className="font-sans text-xs text-secondary mt-1">2 hydrogen bonds (in DNA)</p>
            <p className="font-sans text-xs text-secondary">A – U in RNA</p>
          </div>
          <div className="rounded-sm border border-border p-3 text-center" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-mono text-xl font-bold text-primary">G – C</p>
            <p className="font-sans text-xs text-secondary mt-1">3 hydrogen bonds</p>
            <p className="font-sans text-xs text-secondary">Stronger pair → higher melting T</p>
          </div>
        </div>
      </section>
    </div>
  )
}
