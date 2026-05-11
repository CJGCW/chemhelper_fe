export interface RankingCompound {
  id: string
  smiles: string
  label: string
  pka: string
  correctRank: number   // 0 = most acidic
}

export interface RankingProblem {
  id: string
  prompt: string
  compounds: RankingCompound[]
  factors: string[]
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export const ACIDITY_RANKING_PROBLEMS: RankingProblem[] = [
  // ── Easy ──────────────────────────────────────────────────────────────────

  {
    id: 'haloacid-en-trend',
    prompt: 'Rank these acids from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'OC(=O)CF',   label: 'Fluoroacetic acid',  pka: '2.6', correctRank: 0 },
      { id: 'b', smiles: 'OC(=O)CCl',  label: 'Chloroacetic acid',  pka: '2.9', correctRank: 1 },
      { id: 'c', smiles: 'OC(=O)CBr',  label: 'Bromoacetic acid',   pka: '2.9', correctRank: 2 },
      { id: 'd', smiles: 'CC(=O)O',    label: 'Acetic acid',        pka: '4.8', correctRank: 3 },
    ],
    factors: ['Inductive effect', 'Electronegativity'],
    explanation: 'F is most electronegative, so fluoroacetic acid stabilizes the carboxylate most via induction. Cl and Br are similar in electronegativity; both are weaker inductors than F. Acetic acid lacks halogen induction entirely and is the weakest.',
    difficulty: 'easy',
  },

  {
    id: 'multi-f-acetic',
    prompt: 'Rank these fluorinated acetic acids from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'OC(=O)C(F)(F)F', label: 'Trifluoroacetic acid',   pka: '0.5', correctRank: 0 },
      { id: 'b', smiles: 'OC(=O)C(F)F',    label: 'Difluoroacetic acid',    pka: '1.2', correctRank: 1 },
      { id: 'c', smiles: 'OC(=O)CF',       label: 'Fluoroacetic acid',      pka: '2.6', correctRank: 2 },
      { id: 'd', smiles: 'CC(=O)O',        label: 'Acetic acid',            pka: '4.8', correctRank: 3 },
    ],
    factors: ['Inductive effect', 'Additive EWG effects'],
    explanation: 'Each F atom withdraws electron density through induction. Three fluorines withdraw much more than two, which withdraw more than one. Three F atoms on CF3COOH make it almost as strong as mineral acids (pKa 0.5). Each additional F halves the pKa roughly. This is a clear case of additive inductive effects.',
    difficulty: 'easy',
  },

  {
    id: 'multi-cl-acetic',
    prompt: 'Rank these chlorinated acetic acids from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'OC(=O)C(Cl)(Cl)Cl', label: 'Trichloroacetic acid',   pka: '0.7', correctRank: 0 },
      { id: 'b', smiles: 'OC(=O)C(Cl)Cl',     label: 'Dichloroacetic acid',    pka: '1.5', correctRank: 1 },
      { id: 'c', smiles: 'OC(=O)CCl',         label: 'Chloroacetic acid',      pka: '2.9', correctRank: 2 },
      { id: 'd', smiles: 'CC(=O)O',           label: 'Acetic acid',            pka: '4.8', correctRank: 3 },
    ],
    factors: ['Inductive effect', 'Additive EWG effects'],
    explanation: 'Chlorine is less electronegative than F but still strongly withdrawing. Each additional Cl adds another inductive pull on the carboxylate. Three Cl atoms on CCl3COOH make trichloroacetic acid as strong as many mineral acids (pKa 0.7). The effects are additive.',
    difficulty: 'easy',
  },

  {
    id: 'functional-group-rank',
    prompt: 'Rank these compounds from most to least acidic (O-H or N-H acidity).',
    compounds: [
      { id: 'a', smiles: 'CS(=O)(=O)O',  label: 'Methanesulfonic acid',  pka: '-1.2', correctRank: 0 },
      { id: 'b', smiles: 'CC(=O)O',      label: 'Acetic acid',           pka: '4.8',  correctRank: 1 },
      { id: 'c', smiles: 'Oc1ccccc1',    label: 'Phenol',                pka: '10',   correctRank: 2 },
      { id: 'd', smiles: 'CCO',          label: 'Ethanol',               pka: '16',   correctRank: 3 },
    ],
    factors: ['Functional group identity', 'Resonance stabilization'],
    explanation: 'Sulfonic acids are superacids (pKa −1) — three oxygens stabilize the sulfonate anion via resonance and induction. Carboxylic acids (pKa ~5) have two-oxygen resonance stabilization. Phenols (pKa 10) get partial resonance into the aromatic ring but not as complete. Aliphatic alcohols (pKa 16) have no resonance stabilization at all.',
    difficulty: 'easy',
  },

  {
    id: 'formic-acetic-propionic',
    prompt: 'Rank these carboxylic acids from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'OC=O',     label: 'Formic acid',    pka: '3.7', correctRank: 0 },
      { id: 'b', smiles: 'CC(=O)O',  label: 'Acetic acid',    pka: '4.8', correctRank: 1 },
      { id: 'c', smiles: 'CCC(=O)O', label: 'Propanoic acid', pka: '4.9', correctRank: 2 },
      { id: 'd', smiles: 'CCCC(=O)O', label: 'Butanoic acid', pka: '4.8', correctRank: 3 },
    ],
    factors: ['Inductive effect', 'Electron donation by alkyl groups'],
    explanation: 'Alkyl groups are electron-donating inductively, which destabilizes the carboxylate anion. Formic acid (no alkyl group) is the most acidic. As the chain grows from methyl to ethyl, electron donation increases slightly, weakening the acid. The effect plateaus quickly — acetic, propanoic, and butanoic are nearly identical.',
    difficulty: 'easy',
  },

  {
    id: 'alcohol-substitution-inductive',
    prompt: 'Rank these alcohols from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'CO',          label: 'Methanol',           pka: '15.5', correctRank: 0 },
      { id: 'b', smiles: 'CCO',         label: 'Ethanol',            pka: '16',   correctRank: 1 },
      { id: 'c', smiles: 'CC(C)O',      label: 'Isopropanol',        pka: '17',   correctRank: 2 },
      { id: 'd', smiles: 'CC(C)(C)O',   label: 'tert-Butanol',       pka: '19',   correctRank: 3 },
    ],
    factors: ['Inductive effect', 'Electron donation by alkyl groups'],
    explanation: 'Each additional methyl group donates electron density to the oxygen, destabilizing the alkoxide anion. Methanol (no alkyl, pKa 15.5) is most acidic. tert-Butanol has three electron-donating methyls on the β-carbon, making it the weakest acid. The trend parallels the alkyl group trend in carboxylic acids but is more pronounced.',
    difficulty: 'easy',
  },

  {
    id: 'phenol-vs-alcohol',
    prompt: 'Rank these phenols and alcohols from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'Oc1ccccc1',   label: 'Phenol',         pka: '10', correctRank: 0 },
      { id: 'b', smiles: 'OCC c1ccccc1', label: 'Benzyl alcohol', pka: '15', correctRank: 1 },
      { id: 'c', smiles: 'CCO',          label: 'Ethanol',        pka: '16', correctRank: 2 },
      { id: 'd', smiles: 'CC(C)(C)O',    label: 'tert-Butanol',   pka: '19', correctRank: 3 },
    ],
    factors: ['Resonance stabilization', 'Inductive effect'],
    explanation: 'Phenol\'s conjugate base (phenoxide) is resonance-stabilized by delocalization into the benzene ring — five resonance structures. This drops the pKa to 10, dramatically more acidic than alkyl alcohols. Benzyl alcohol has the ring one carbon away from OH, so phenoxide resonance is not available; pKa is close to ethanol. tert-Butanol is least acidic due to three electron-donating methyls.',
    difficulty: 'easy',
  },

  {
    id: 'oxalic-malonic-succinic',
    prompt: 'Rank these dicarboxylic acids from most to least acidic (first pKa).',
    compounds: [
      { id: 'a', smiles: 'OC(=O)C(=O)O',         label: 'Oxalic acid',    pka: '1.2', correctRank: 0 },
      { id: 'b', smiles: 'OC(=O)CC(=O)O',        label: 'Malonic acid',   pka: '2.8', correctRank: 1 },
      { id: 'c', smiles: 'OC(=O)CCC(=O)O',       label: 'Succinic acid',  pka: '4.2', correctRank: 2 },
      { id: 'd', smiles: 'OC(=O)CCCC(=O)O',      label: 'Glutaric acid',  pka: '4.3', correctRank: 3 },
    ],
    factors: ['Inductive effect', 'Distance dependence'],
    explanation: 'In dicarboxylic acids, the second –COOH group acts as an electron-withdrawing inductive substituent. Oxalic acid has the two COOH groups directly bonded — maximum inductive effect (pKa 1.2). Malonic acid has one CH2 spacer (pKa 2.8). Succinic and glutaric have longer chains, reducing the inductive effect to near zero. Same factor as halogen-distance effects.',
    difficulty: 'easy',
  },

  // ── Medium ────────────────────────────────────────────────────────────────

  {
    id: 'distance-inductive',
    prompt: 'Rank these acids from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'OC(=O)CCl',   label: 'Chloroacetic acid (α-Cl)',       pka: '2.9', correctRank: 0 },
      { id: 'b', smiles: 'OC(=O)CCCl',  label: '3-Chloropropanoic acid (β-Cl)',  pka: '4.0', correctRank: 1 },
      { id: 'c', smiles: 'OC(=O)CCCCl', label: '4-Chlorobutanoic acid (γ-Cl)',   pka: '4.5', correctRank: 2 },
      { id: 'd', smiles: 'CC(C)C(=O)O', label: 'Isobutyric acid (no Cl)',        pka: '4.9', correctRank: 3 },
    ],
    factors: ['Inductive effect', 'Distance dependence'],
    explanation: 'Inductive effects fall off rapidly with distance (roughly 1/r³). Chlorine α to the carboxyl group (one bond away) strongly stabilizes the conjugate base. β-Cl (two bonds away) is about half as effective, γ-Cl (three bonds) barely measurable — similar to isobutyric acid with no halogen. The through-bond distance is the key variable.',
    difficulty: 'medium',
  },

  {
    id: 'phenol-vs-cyclohexanol',
    prompt: 'Rank these alcohols and acids by acidity.',
    compounds: [
      { id: 'a', smiles: 'OC(=O)c1ccccc1', label: 'Benzoic acid',   pka: '4.2', correctRank: 0 },
      { id: 'b', smiles: 'CC(=O)O',        label: 'Acetic acid',    pka: '4.8', correctRank: 1 },
      { id: 'c', smiles: 'Oc1ccccc1',      label: 'Phenol',         pka: '10',  correctRank: 2 },
      { id: 'd', smiles: 'OCC',            label: 'Ethanol',        pka: '16',  correctRank: 3 },
    ],
    factors: ['Resonance stabilization', 'Functional group identity'],
    explanation: 'Carboxylic acids (pKa ~5) are dramatically more acidic than alcohols (pKa ~16) because the carboxylate has resonance stabilization across two oxygens. Benzoic acid is slightly more acidic than acetic because the phenyl ring withdraws electrons inductively. Phenol (pKa 10) sits between — its phenoxide is resonance-stabilized into the ring, but less effectively than the carboxylate.',
    difficulty: 'medium',
  },

  {
    id: 'hybridization-c-h',
    prompt: 'Rank these C–H acids from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'CC#C',  label: 'Propyne (sp C–H)',   pka: '25', correctRank: 0 },
      { id: 'b', smiles: 'CC=C',  label: 'Propene (sp² C–H)',  pka: '44', correctRank: 1 },
      { id: 'c', smiles: 'CCC',   label: 'Propane (sp³ C–H)',  pka: '50', correctRank: 2 },
    ],
    factors: ['Hybridization', 's-character'],
    explanation: 'Higher s-character holds the lone pair closer to the nucleus, stabilizing the conjugate base carbanion. sp carbon = 50% s-character, sp² = 33%, sp³ = 25%. The acetylide anion (from propyne) is the most stable carbanion. Each step down in s-character raises the pKa by 6–20 units.',
    difficulty: 'medium',
  },

  {
    id: 'aromatic-substituents',
    prompt: 'Rank these substituted phenols by acidity.',
    compounds: [
      { id: 'a', smiles: 'Oc1ccc([N+](=O)[O-])cc1', label: '4-Nitrophenol',    pka: '7.1',  correctRank: 0 },
      { id: 'b', smiles: 'Oc1ccc(Cl)cc1',           label: '4-Chlorophenol',   pka: '9.4',  correctRank: 1 },
      { id: 'c', smiles: 'Oc1ccccc1',               label: 'Phenol',           pka: '10',   correctRank: 2 },
      { id: 'd', smiles: 'Oc1ccc(OC)cc1',           label: '4-Methoxyphenol',  pka: '10.2', correctRank: 3 },
      { id: 'e', smiles: 'Oc1ccc(C)cc1',            label: '4-Methylphenol',   pka: '10.3', correctRank: 4 },
    ],
    factors: ['Resonance withdrawal', 'Inductive effect', 'Resonance donation'],
    explanation: 'Para-nitro withdraws via both resonance (NO2 accepts electron density from ring) and induction — dramatic stabilization of phenoxide (pKa 7.1). Para-chloro withdraws only inductively; smaller effect (pKa 9.4). Para-methyl donates electrons inductively, slightly destabilizing phenoxide (pKa 10.3). Para-methoxy is an electron donor by resonance (stronger than inductive withdrawal), netting a slight destabilization similar to methyl.',
    difficulty: 'hard',
  },

  {
    id: 'ortho-meta-para-nitrobenzoic',
    prompt: 'Rank these nitrobenzoic acids from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'OC(=O)c1ccccc1[N+](=O)[O-]', label: '2-Nitrobenzoic acid',  pka: '2.2', correctRank: 0 },
      { id: 'b', smiles: 'OC(=O)c1cccc([N+](=O)[O-])c1', label: '3-Nitrobenzoic acid', pka: '3.5', correctRank: 1 },
      { id: 'c', smiles: 'OC(=O)c1ccc([N+](=O)[O-])cc1', label: '4-Nitrobenzoic acid', pka: '3.4', correctRank: 2 },
      { id: 'd', smiles: 'OC(=O)c1ccccc1',               label: 'Benzoic acid',         pka: '4.2', correctRank: 3 },
    ],
    factors: ['Inductive effect', 'Resonance withdrawal', 'Ortho effect'],
    explanation: 'Ortho-nitro is the most acidic despite ortho-effects usually being complex: NO2 is close to COOH both inductively AND sterically forces the COOH out of the ring plane, disrupting resonance delocalization and concentrating electron density on the OH. Meta-NO2 acts only by induction. Para-NO2 acts by resonance + induction, similar to meta in net effect on pKa. All three are more acidic than unsubstituted benzoic.',
    difficulty: 'medium',
  },

  {
    id: 'meta-phenol-series',
    prompt: 'Rank these meta-substituted phenols by acidity.',
    compounds: [
      { id: 'a', smiles: 'Oc1cccc([N+](=O)[O-])c1', label: '3-Nitrophenol',   pka: '8.4', correctRank: 0 },
      { id: 'b', smiles: 'Oc1cccc(Cl)c1',           label: '3-Chlorophenol',  pka: '9.0', correctRank: 1 },
      { id: 'c', smiles: 'Oc1ccccc1',               label: 'Phenol',          pka: '10',  correctRank: 2 },
      { id: 'd', smiles: 'Oc1cccc(C)c1',            label: '3-Methylphenol',  pka: '10.1', correctRank: 3 },
    ],
    factors: ['Inductive effect', 'Meta position (induction only)'],
    explanation: 'At the meta position, substituents can only act by induction (no resonance path to meta from the OH site). NO2 is a stronger inductive withdrawer than Cl, so 3-nitrophenol is more acidic. Methyl donates inductively, slightly raising the pKa above phenol. This cleanly tests inductive strength without the complication of resonance.',
    difficulty: 'medium',
  },

  {
    id: 'extended-inductive',
    prompt: 'Rank these trifluoro-substituted acids from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'OC(=O)C(F)(F)F',     label: 'Trifluoroacetic acid',          pka: '0.5', correctRank: 0 },
      { id: 'b', smiles: 'OC(=O)CC(F)(F)F',    label: '3,3,3-Trifluoropropanoic acid', pka: '3.1', correctRank: 1 },
      { id: 'c', smiles: 'OC(=O)CCC(F)(F)F',   label: '4,4,4-Trifluorobutanoic acid',  pka: '4.2', correctRank: 2 },
      { id: 'd', smiles: 'CC(=O)O',             label: 'Acetic acid',                   pka: '4.8', correctRank: 3 },
    ],
    factors: ['Inductive effect', 'Distance dependence', 'Additive EWG effects'],
    explanation: 'CF3 is one of the strongest electron-withdrawing groups by induction. When directly attached to COOH, pKa = 0.5. One CH2 spacer raises pKa to 3.1. Two CH2 spacers gives pKa 4.2, barely more acidic than unfluorinated acetic acid. The CF3 group, despite being three fluorines, loses effectiveness very quickly with chain length — same 1/r³ falloff as single halogens.',
    difficulty: 'medium',
  },

  {
    id: 'alpha-h-stabilization',
    prompt: 'Rank these α-hydrogens (on the carbon next to carbonyl) from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'CC(=O)CC(=O)C',    label: '2,4-Pentanedione α-H',   pka: '9',  correctRank: 0 },
      { id: 'b', smiles: 'CCOC(=O)CC(=O)C',  label: 'Ethyl acetoacetate α-H', pka: '11', correctRank: 1 },
      { id: 'c', smiles: 'CCOC(=O)CC(=O)OCC', label: 'Diethyl malonate α-H',  pka: '13', correctRank: 2 },
      { id: 'd', smiles: 'CC(C)=O',           label: 'Acetone α-H',            pka: '20', correctRank: 3 },
      { id: 'e', smiles: 'CCOC(=O)C',         label: 'Ethyl acetate α-H',      pka: '25', correctRank: 4 },
    ],
    factors: ['Resonance stabilization', 'Number of EWGs', 'Carbonyl identity'],
    explanation: 'α-Hydrogens flanked by TWO carbonyls are dramatically more acidic. 2,4-Pentanedione (1,3-diketone, pKa 9) has the most stabilized enolate — two ketone carbonyls. Ethyl acetoacetate (β-keto ester, pKa 11) has one ketone and one ester; ester is a weaker EWG. Diethyl malonate (pKa 13) has two esters. Single-carbonyl: acetone (ketone, pKa 20) is more acidic than ethyl acetate (ester, pKa 25) because ester O-lone-pair donation makes the ester a weaker C=O acceptor.',
    difficulty: 'hard',
  },

  // ── Hard ──────────────────────────────────────────────────────────────────

  {
    id: 'alpha-hydroxy-acids',
    prompt: 'Rank these α-hydroxy acids from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'OC(=O)C(O)c1ccccc1', label: 'Mandelic acid (Ph-CHOH-COOH)', pka: '3.4', correctRank: 0 },
      { id: 'b', smiles: 'OC(=O)CO',           label: 'Glycolic acid (HOCH₂COOH)',    pka: '3.8', correctRank: 1 },
      { id: 'c', smiles: 'OC(=O)C(O)C',        label: 'Lactic acid (Me-CHOH-COOH)',   pka: '3.9', correctRank: 2 },
      { id: 'd', smiles: 'CC(=O)O',            label: 'Acetic acid',                  pka: '4.8', correctRank: 3 },
    ],
    factors: ['Inductive effect', 'Electronegativity of oxygen', 'Phenyl vs alkyl'],
    explanation: 'The α-OH group is electron-withdrawing by induction (oxygen is electronegative), stabilizing the carboxylate and increasing acidity versus acetic acid. Mandelic acid is most acidic because the phenyl group also withdraws electrons. Glycolic (no methyl) is more acidic than lactic (with methyl, EDG) — the methyl counters the OH effect slightly.',
    difficulty: 'hard',
  },

  {
    id: 'phenyl-alkyl-benzoic',
    prompt: 'Rank these arylacetic acids from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'OC(=O)c1ccccc1',     label: 'Benzoic acid',       pka: '4.2', correctRank: 0 },
      { id: 'b', smiles: 'OC(=O)Cc1ccccc1',    label: 'Phenylacetic acid',  pka: '4.3', correctRank: 1 },
      { id: 'c', smiles: 'OC(=O)CCc1ccccc1',   label: 'Hydrocinnamic acid', pka: '4.7', correctRank: 2 },
      { id: 'd', smiles: 'CCC(=O)O',           label: 'Propanoic acid',     pka: '4.9', correctRank: 3 },
    ],
    factors: ['Inductive effect', 'Distance from aromatic ring'],
    explanation: 'Phenyl is a weak inductive electron withdrawer (the sp2 carbons are more electronegative than sp3). When directly attached to COOH (benzoic), the effect is strongest. One CH2 spacer (phenylacetic) attenuates the effect slightly. Two CH2 spacers (hydrocinnamic) nearly eliminates it. At three bonds distance, the phenyl ring\'s inductive effect is indistinguishable from a simple alkyl chain.',
    difficulty: 'hard',
  },

  {
    id: 'ch-acidity-aromatic',
    prompt: 'Rank these C–H acids from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'C1C=CC=C1',             label: '1,3-Cyclopentadiene (allylic CH₂)', pka: '16', correctRank: 0 },
      { id: 'b', smiles: 'C1c2ccccc2Cc3ccccc31',  label: 'Fluorene (sp³ CH₂)',               pka: '23', correctRank: 1 },
      { id: 'c', smiles: 'Cc1ccccc1',             label: 'Toluene (benzylic CH₃)',            pka: '43', correctRank: 2 },
      { id: 'd', smiles: 'CCC',                   label: 'Propane (alkyl C–H)',               pka: '50', correctRank: 3 },
    ],
    factors: ['Aromatic stabilization', 'Conjugation', 'Hybridization context'],
    explanation: 'Cyclopentadienyl anion (from cyclopentadiene) is aromatic with 6π electrons in five sp2 carbons — exceptional stability (pKa 16, far more acidic than expected for a sp3 C–H). Fluorenyl anion is stabilized by two flanking aromatic rings (pKa 23). Toluene\'s benzylic proton gives a carbanion resonance-stabilized by one ring. Propane has no stabilization of any kind.',
    difficulty: 'hard',
  },

  {
    id: 'para-benzoic-ewg-edg',
    prompt: 'Rank these para-substituted benzoic acids from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'OC(=O)c1ccc([N+](=O)[O-])cc1', label: '4-Nitrobenzoic acid',   pka: '3.4', correctRank: 0 },
      { id: 'b', smiles: 'OC(=O)c1ccccc1',               label: 'Benzoic acid',           pka: '4.2', correctRank: 1 },
      { id: 'c', smiles: 'OC(=O)c1ccc(O)cc1',            label: '4-Hydroxybenzoic acid',  pka: '4.5', correctRank: 2 },
      { id: 'd', smiles: 'OC(=O)c1ccc(OC)cc1',           label: '4-Methoxybenzoic acid',  pka: '4.5', correctRank: 3 },
    ],
    factors: ['Resonance withdrawal', 'Resonance donation', 'Para position effects'],
    explanation: '4-NO2 withdraws by both resonance (into the ring, then toward COOH) and induction — stronger acid. 4-OH and 4-OMe are electron donors by resonance (lone pairs into ring), which destabilizes the carboxylate anion — weaker acids. The net effect of –OH and –OMe is similar because both are strong resonance donors despite –OH being slightly less electron-rich than –OMe.',
    difficulty: 'hard',
  },

  {
    id: 'n-h-acidity',
    prompt: 'Rank these N–H acids from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'c1ccc[nH]1',   label: 'Pyrrole (aromatic N–H)',  pka: '17', correctRank: 0 },
      { id: 'b', smiles: 'CC(N)=O',      label: 'Acetamide (amide N–H)',   pka: '25', correctRank: 1 },
      { id: 'c', smiles: 'Nc1ccccc1',    label: 'Aniline (aryl amine)',    pka: '27', correctRank: 2 },
      { id: 'd', smiles: 'CCNCC',        label: 'Diethylamine (alkyl)',    pka: '35', correctRank: 3 },
    ],
    factors: ['Resonance stabilization', 'Hybridization of nitrogen'],
    explanation: 'Pyrrole N–H is the most acidic because the nitrogen lone pair is part of the aromatic π-system — removing H gives a delocalized anion. Acetamide N–H is acidic because the carbonyl can accept the electron pair from the anion (resonance). Aniline N–H is partially resonance-stabilized into the ring. Diethylamine (sp3 N) has no resonance stabilization; the anion is a pure localized carbanion analog.',
    difficulty: 'hard',
  },

  {
    id: 'gem-dihalide',
    prompt: 'Rank these dihalogenated acetic acids from most to least acidic.',
    compounds: [
      { id: 'a', smiles: 'OC(=O)C(F)F',        label: 'Difluoroacetic acid (CHF₂COOH)',       pka: '1.2', correctRank: 0 },
      { id: 'b', smiles: 'OC(=O)C(F)Cl',       label: 'Fluorochloroacetic acid (CHFClCOOH)',   pka: '1.5', correctRank: 1 },
      { id: 'c', smiles: 'OC(=O)C(Cl)(Cl)',     label: 'Dichloroacetic acid (CHCl₂COOH)',       pka: '1.5', correctRank: 2 },
      { id: 'd', smiles: 'OC(=O)C(Br)Br',      label: 'Dibromoacetic acid (CHBr₂COOH)',        pka: '1.4', correctRank: 3 },
    ],
    factors: ['Electronegativity', 'Inductive effect', 'Additive EWG effects'],
    explanation: 'Two halogens on the same carbon are more effective than one because the effects add approximately linearly. CHF2COOH is the most acidic because F is most electronegative. CHFClCOOH and CHCl2COOH are nearly identical (mixed halogens vs two chlorines). CHBr2COOH has bromine, which is less electronegative than chlorine but larger — the pKa is very close to dichloroacetic.',
    difficulty: 'hard',
  },

  {
    id: 'charge-effect-phosphoric',
    prompt: 'Rank these phosphate species from most to least acidic (successive pKa values).',
    compounds: [
      { id: 'a', smiles: 'OP(=O)(O)O',        label: 'H₃PO₄ (pKa1)',   pka: '2.1', correctRank: 0 },
      { id: 'b', smiles: 'OP(=O)([O-])O',     label: 'H₂PO₄⁻ (pKa2)',  pka: '7.2', correctRank: 1 },
      { id: 'c', smiles: 'OP(=O)([O-])[O-]',  label: 'HPO₄²⁻ (pKa3)',  pka: '12.4', correctRank: 2 },
    ],
    factors: ['Charge effect', 'Electrostatic repulsion'],
    explanation: 'Each protonation of phosphoric acid removes a negative charge from the anion. H3PO4 (neutral) readily donates a proton (pKa 2.1). H2PO4⁻ already carries one negative charge; removing H⁺ creates a doubly charged anion — requires overcoming electrostatic repulsion (pKa 7.2). HPO4²⁻ is doubly charged; the third deprotonation creates a 3⁻ charge — even harder (pKa 12.4). Negative charge destabilizes further deprotonation.',
    difficulty: 'medium',
  },
]
