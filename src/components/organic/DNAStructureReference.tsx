export default function DNAStructureReference() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl print:max-w-none">
      <div>
        <h3 className="font-sans font-semibold text-base text-primary mb-1">DNA Structure & Nucleic Acid Chemistry</h3>
        <p className="font-sans text-xs text-secondary leading-relaxed">
          DNA encodes genetic information in a double helix held together by complementary base pairs.
          RNA differs in sugar and one base. Brown Ch. 28.
        </p>
      </div>

      {/* Primary structure */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Primary Structure</h4>
        <div className="rounded-sm border border-border p-4 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="text-secondary mb-2">The sequence of nucleotides (phosphodiester backbone + bases).</p>
          <p className="text-secondary mb-1">• Chains run <strong className="text-primary">5′→3′</strong> by convention (written left to right)</p>
          <p className="text-secondary mb-1">• <strong className="text-primary">Phosphodiester bond:</strong> phosphate links 3′-OH of one sugar to 5′-carbon of next — covalent, strong backbone</p>
          <p className="text-secondary mb-1">• The backbone is negatively charged at pH 7 (phosphate pKa ~1) — DNA is a polyanion</p>
          <p className="text-secondary">• Each phosphodiester bond is formed with release of pyrophosphate (PPᵢ) from NTP substrate, then PPᵢ is hydrolyzed → thermodynamic driving force</p>
        </div>
      </section>

      {/* Watson-Crick double helix */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Watson-Crick Double Helix (Secondary Structure)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
          {[
            {
              title: 'Two antiparallel strands',
              body: 'One strand runs 5′→3′, the complementary strand runs 3′→5′ (antiparallel). The strands are held together by hydrogen bonds between complementary bases (A-T and G-C).',
            },
            {
              title: 'Right-handed helix (B-DNA)',
              body: 'The most common form in cells. The helix rises ~3.4 Å per base pair, with ~10.5 bp per turn (pitch ~34 Å). Bases stack inside the helix (stacking interactions add stability).',
            },
            {
              title: 'Bases on the inside',
              body: 'The sugar-phosphate backbone runs on the outside; bases point inward. This maximizes hydrophobic base stacking and protects bases from water. Grooves: major groove and minor groove (where proteins bind).',
            },
            {
              title: 'H-bond geometry',
              body: 'A-T: 2 hydrogen bonds. G-C: 3 hydrogen bonds. G-C pairs are individually stronger, so DNA with higher %GC has a higher melting temperature (Tm). Tm is measured experimentally to determine GC content.',
            },
          ].map(item => (
            <div key={item.title} className="rounded-sm border border-border p-3" style={{ background: 'rgb(var(--color-raised))' }}>
              <p className="font-semibold text-primary mb-1">{item.title}</p>
              <p className="text-secondary leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Chargaff's rules */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Chargaff&apos;s Rules</h4>
        <div className="rounded-sm border border-border p-4 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="text-secondary mb-2">Erwin Chargaff (1950): For any DNA sample, <strong className="text-primary">[A] = [T]</strong> and <strong className="text-primary">[G] = [C]</strong>, therefore <strong className="text-primary">[purines] = [pyrimidines]</strong>.</p>
          <p className="text-secondary mb-2">This ratio holds regardless of the organism, though the ratio [A+T]/[G+C] varies between species. These observations were a crucial clue to Watson and Crick in deducing the double-helical structure.</p>
          <p className="text-secondary">Consequence: if you know one strand sequence, you know the complementary strand. For a single strand, [A] ≠ [T] and [G] ≠ [C] — Chargaff&apos;s rules apply only to double-stranded DNA.</p>
        </div>
      </section>

      {/* DNA vs RNA */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">DNA vs RNA</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-secondary font-semibold">Feature</th>
                <th className="text-left py-2 pr-4 text-secondary font-semibold">DNA</th>
                <th className="text-left py-2 text-secondary font-semibold">RNA</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Sugar', dna: '2′-Deoxyribose (no 2′-OH)', rna: 'Ribose (has 2′-OH)' },
                { feature: 'Unique base', dna: 'Thymine (T)', rna: 'Uracil (U)' },
                { feature: 'Strands', dna: 'Double-stranded', rna: 'Usually single-stranded' },
                { feature: 'Stability', dna: 'Very stable (no 2′-OH → no intramolecular hydrolysis)', rna: 'Less stable (2′-OH enables alkaline hydrolysis)' },
                { feature: 'Function', dna: 'Information storage (genome)', rna: 'mRNA (message), tRNA (adaptor), rRNA (ribosome), etc.' },
                { feature: 'Location', dna: 'Nucleus (eukaryotes), also mitochondria/chloroplast', rna: 'Nucleus, cytoplasm, ribosomes' },
              ].map(r => (
                <tr key={r.feature} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-semibold text-primary">{r.feature}</td>
                  <td className="py-2 pr-4 text-secondary">{r.dna}</td>
                  <td className="py-2 text-secondary">{r.rna}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Central dogma */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Central Dogma (Brief)</h4>
        <div className="rounded-sm border border-border p-4 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
          <p className="font-mono text-primary text-sm mb-2">DNA → DNA → RNA → Protein</p>
          <p className="text-secondary mb-1"><strong className="text-primary">Replication (DNA→DNA):</strong> Semi-conservative — each strand serves as template. DNA polymerase adds nucleotides 5′→3′.</p>
          <p className="text-secondary mb-1"><strong className="text-primary">Transcription (DNA→RNA):</strong> RNA polymerase synthesizes mRNA 5′→3′ using the antisense DNA strand as template. mRNA sequence matches the sense (coding) strand.</p>
          <p className="text-secondary"><strong className="text-primary">Translation (RNA→Protein):</strong> Ribosome reads mRNA codons (triplets) with tRNAs carrying amino acids. 64 codons, 20 amino acids → genetic code is redundant. AUG = start; UAA, UAG, UGA = stop.</p>
        </div>
      </section>

      {/* Reactions / Chemistry */}
      <section className="flex flex-col gap-3">
        <h4 className="font-sans font-semibold text-sm text-primary">Reactions of Nucleic Acids</h4>
        <div className="flex flex-col gap-3">
          {[
            {
              title: 'Hydrolysis',
              body: 'Phosphodiester bonds hydrolyzed by strong acid, strong base, or nucleases (enzymes). N-glycosidic bonds hydrolyzed by acid (depurination faster than depyrimidination). Alkaline hydrolysis cleaves RNA at every nucleotide (via 2′-OH internal attack on phosphate) but does NOT cleave DNA (no 2′-OH).',
            },
            {
              title: 'Tautomerism & Mutagenesis',
              body: 'Rare enol/imino tautomers of bases allow mispairing during replication → transition mutations (purine↔purine or pyrimidine↔pyrimidine substitution). These are spontaneous point mutations.',
            },
            {
              title: 'Nitrous acid (HNO₂)',
              body: 'Deaminates bases: converts cytosine → uracil (C→U), adenine → hypoxanthine (H, which pairs like G → A→G mutation), guanine → xanthine. A potent chemical mutagen — causes transition mutations.',
            },
            {
              title: 'Alkylating agents',
              body: 'Nitrogen mustards, EMS (ethyl methanesulfonate), MNNG: methylate or alkylate bases, most commonly at N7 of guanine. O6-methylguanine mispairs with T instead of C → G-C to A-T transitions. Used in cancer chemotherapy (damage DNA of rapidly dividing cells) and as mutagens in forward genetics screens.',
            },
            {
              title: 'UV radiation — thymine dimers',
              body: 'UV (254 nm) causes [2+2] cycloaddition between adjacent thymine residues on the same strand → cyclobutane thymine dimer (CPD). Distorts the helix, blocks replication and transcription. Repaired by photolyase (direct reversal), nucleotide excision repair (NER), or translesion synthesis polymerases.',
            },
          ].map(item => (
            <div key={item.title} className="rounded-sm border border-border p-3 text-xs font-sans" style={{ background: 'rgb(var(--color-raised))' }}>
              <p className="font-semibold text-primary mb-1">{item.title}</p>
              <p className="text-secondary leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
