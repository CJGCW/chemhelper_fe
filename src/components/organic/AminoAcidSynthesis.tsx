export default function AminoAcidSynthesis() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">Amino Acids — Overview & Synthesis</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          The 20 standard α-amino acids share a common backbone (NH₂ on the α-carbon, COOH on the α-carbon) and
          differ only in the R group (side chain). Brown Ch. 27.
        </p>
      </div>

      {/* Structure */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">General Structure</h4>
        <div className="rounded-sm border border-border p-4 font-mono text-xs text-secondary leading-relaxed" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="mb-2">All α-amino acids:</p>
          <p className="text-primary font-semibold">H₂N — CHR — COOH</p>
          <p className="mt-2">• α-carbon is chiral (except Gly, where R = H)</p>
          <p>• Naturally occurring amino acids are L-configuration (S at α-C, except Cys)</p>
          <p>• At physiological pH (~7.4): zwitterion form predominates (NH₃⁺ / COO⁻)</p>
        </div>
      </section>

      {/* D/L Configuration */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">D / L Configuration</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-sans text-xs font-semibold text-primary mb-2">L-amino acid (natural)</p>
            <p className="font-mono text-xs text-secondary">Fischer projection: NH₂ on LEFT at α-C</p>
            <p className="font-mono text-xs text-secondary mt-1">Same side as in L-glyceraldehyde (OH left)</p>
            <p className="font-sans text-xs text-secondary mt-2">All 20 standard amino acids are L-configuration. Ribosomes are stereospecific — D-amino acids don't assemble into proteins.</p>
          </div>
          <div className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-sans text-xs font-semibold text-primary mb-2">D-amino acid (rare/bacterial)</p>
            <p className="font-mono text-xs text-secondary">Fischer projection: NH₂ on RIGHT at α-C</p>
            <p className="font-mono text-xs text-secondary mt-1">Found in some bacterial cell walls (D-Ala) and antibiotics.</p>
            <p className="font-sans text-xs text-secondary mt-2">Lab synthesis gives racemic mixtures (equal D and L) unless an enantioselective method is used.</p>
          </div>
        </div>
      </section>

      {/* Lab Synthesis Methods */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Laboratory Synthesis</h4>
        <p className="font-sans text-xs text-secondary">All classical methods give racemic (±) α-amino acids. Resolution is required to obtain pure enantiomers.</p>

        <div className="flex flex-col gap-3">
          {/* Strecker */}
          <div className="rounded-sm border border-border p-4" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-sans text-sm font-semibold text-primary mb-2">1. Strecker Synthesis</p>
            <div className="font-mono text-xs text-secondary leading-relaxed mb-3">
              <p>RCHO + NH₃ + HCN → α-amino nitrile</p>
              <p>α-amino nitrile + H₃O⁺/Δ → α-amino acid (racemic)</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
              <div>
                <p className="font-semibold text-primary mb-1">Mechanism</p>
                <p className="text-secondary">NH₃ condenses with aldehyde → imine. HCN adds to imine (nucleophilic addition) → α-amino nitrile. Acidic hydrolysis of CN → COOH.</p>
              </div>
              <div>
                <p className="font-semibold text-primary mb-1">Key points</p>
                <p className="text-secondary">Simplest general route. Works for most R groups. Product is racemic — needs resolution. HCN is very toxic.</p>
              </div>
            </div>
          </div>

          {/* Gabriel-Malonic */}
          <div className="rounded-sm border border-border p-4" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-sans text-sm font-semibold text-primary mb-2">2. Gabriel Malonic Ester Synthesis</p>
            <div className="font-mono text-xs text-secondary leading-relaxed mb-3">
              <p>Phthalimide + malonate ester → N-phthalimido malonate</p>
              <p>Alkylation with R-X → N-phthalimido-R-malonate</p>
              <p>Hydrolysis + decarboxylation → α-amino acid (racemic)</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
              <div>
                <p className="font-semibold text-primary mb-1">Why it works</p>
                <p className="text-secondary">Phthalimide nitrogen is masked (protects NH₂). The malonate anion is alkylated (SN2 with R-X). The two COO⁻ groups activate the α-H. Hydrolysis and decarboxylation reveal the amino acid.</p>
              </div>
              <div>
                <p className="font-semibold text-primary mb-1">Key points</p>
                <p className="text-secondary">SN2 step limits to primary R-X (secondary R-X → too much E2). Product is racemic. Historically important — demonstrates NH₂ protection strategy.</p>
              </div>
            </div>
          </div>

          {/* Reductive Amination */}
          <div className="rounded-sm border border-border p-4" style={{ background: 'rgb(var(--color-raised))' }}>
            <p className="font-sans text-sm font-semibold text-primary mb-2">3. Reductive Amination of α-Keto Acids</p>
            <div className="font-mono text-xs text-secondary leading-relaxed mb-3">
              <p>α-keto acid + NH₃ → α-imino acid (imine)</p>
              <p>Imine + [H] (NaBH₄, H₂/Pd) → α-amino acid (racemic)</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
              <div>
                <p className="font-semibold text-primary mb-1">Biochemical relevance</p>
                <p className="text-secondary">Biological transamination uses the same principle but with pyridoxal phosphate (PLP) as cofactor and is enantioselective — gives only L-amino acids.</p>
              </div>
              <div>
                <p className="font-semibold text-primary mb-1">Key points</p>
                <p className="text-secondary">Lab version with NaBH₄ gives racemic product. Clean, widely applicable. α-keto acids are easy to make from carbonyl chemistry.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resolution note */}
      <section className="flex flex-col gap-2">
        <h4 className="font-sans font-semibold text-sm text-primary">Resolution of Racemic Mixtures</h4>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          Classical resolution: treat the racemic amino acid with a chiral acid or base (e.g., tartaric acid) → forms
          two diastereomeric salts → separate by crystallization → individual enantiomers. Modern methods use chiral HPLC
          or enzymatic resolution (enzyme selectively transforms only L-form, leaving D-form unreacted).
        </p>
      </section>
    </div>
  )
}
