import type { ReactionDef, MechanismFrame, AtomPosition, BondPosition, CurvedArrowOverlay } from './types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function mk(
  id: string, symbol: string, x: number, y: number,
  extras: Partial<Pick<AtomPosition, 'charge' | 'label' | 'role' | 'glow'>> = {}
): AtomPosition {
  return { id, symbol, x, y, ...extras }
}

function bd(
  id: string, from: string, to: string,
  order: 1 | 2 | 3 = 1, style: BondPosition['style'] = 'solid'
): BondPosition {
  return { id, from, to, order, style }
}

// ── Benzene ring atoms (center 350,175, radius 60) ────────────────────────────
// b1(350,115)=top/ipso, b2(402,145), b3(402,205), b4(350,235)=bottom/para
// b5(298,205), b6(298,145)

type RingOverride = Partial<Pick<AtomPosition, 'charge' | 'glow' | 'label' | 'role'>>

function ringAtoms(ov: Record<string, RingOverride> = {}): AtomPosition[] {
  const base: AtomPosition[] = [
    mk('b1', 'C', 350, 115),
    mk('b2', 'C', 402, 145),
    mk('b3', 'C', 402, 205),
    mk('b4', 'C', 350, 235),
    mk('b5', 'C', 298, 205),
    mk('b6', 'C', 298, 145),
  ]
  return base.map(a => ov[a.id] ? { ...a, ...ov[a.id] } : a)
}

// Kekulé benzene: b1-b2 double, b3-b4 double, b5-b6 double
function aromaticBonds(): BondPosition[] {
  return [
    bd('b1-b2', 'b1', 'b2', 2),
    bd('b2-b3', 'b2', 'b3', 1),
    bd('b3-b4', 'b3', 'b4', 2),
    bd('b4-b5', 'b4', 'b5', 1),
    bd('b5-b6', 'b5', 'b6', 2),
    bd('b6-b1', 'b6', 'b1', 1),
  ]
}

// Arenium ion: b1 sp³ → all single bonds from b1; delocalization in b2–b6
function areniumBonds(): BondPosition[] {
  return [
    bd('b1-b2', 'b1', 'b2', 1),
    bd('b2-b3', 'b2', 'b3', 2),
    bd('b3-b4', 'b3', 'b4', 1),
    bd('b4-b5', 'b4', 'b5', 2),
    bd('b5-b6', 'b5', 'b6', 1),
    bd('b6-b1', 'b6', 'b1', 1),
  ]
}

// ── EAS frame builders ────────────────────────────────────────────────────────
// Electrophile attacks b1 (top). h_ipso at (350,45). E approaches from right.
// Arenium: E bonded to b1 at (430,55); + charge on b4 (para).

const H_IPSO = { x: 350, y: 45 }
const E_APPROACH = { x: 530, y: 100 }
const E_BONDED   = { x: 430, y: 55 }
const E_PRODUCT  = { x: 350, y: 20 }

function easReactant(
  eId: string, eSymbol: string, eCharge: string | undefined,
  description: string, shortLabel: string
): MechanismFrame {
  return {
    atoms: [
      ...ringAtoms(),
      mk('h_ipso', 'H', H_IPSO.x, H_IPSO.y),
      mk(eId, eSymbol, E_APPROACH.x, E_APPROACH.y, { charge: eCharge, role: 'electrophile' }),
    ],
    bonds: [...aromaticBonds(), bd('b1-h_ipso', 'b1', 'h_ipso')],
    arrows: [{
      from: { kind: 'bond', id: 'b6-b1' },
      to:   { kind: 'atom', id: eId },
      color: 'var(--c-alkali)',
    }],
    description, shortLabel,
  }
}

function easArenium(
  eId: string, eSymbol: string,
  description: string, shortLabel: string
): MechanismFrame {
  return {
    atoms: [
      ...ringAtoms({ b4: { charge: '+', glow: true } }),
      mk('h_ipso', 'H', H_IPSO.x, H_IPSO.y),
      mk(eId, eSymbol, E_BONDED.x, E_BONDED.y, { role: 'electrophile' }),
    ],
    bonds: [
      ...areniumBonds(),
      bd('b1-h_ipso', 'b1', 'h_ipso'),
      bd(`b1-${eId}`, 'b1', eId),
    ],
    arrows: [{
      from: { kind: 'bond', id: 'b1-h_ipso' },
      to:   { kind: 'atom', id: 'b6' },
      color: 'var(--c-halogen)',
    }],
    description, shortLabel,
  }
}

function easProduct(
  eId: string, eSymbol: string,
  description: string, shortLabel: string
): MechanismFrame {
  return {
    atoms: [...ringAtoms(), mk(eId, eSymbol, E_PRODUCT.x, E_PRODUCT.y)],
    bonds: [...aromaticBonds(), bd(`b1-${eId}`, 'b1', eId)],
    arrows: [],
    description, shortLabel,
  }
}

// ── Aryl carbonyl helpers (for Clemmensen, Wolff-Kishner) ─────────────────────
// Ph at (200,160), c_car at (340,160), o_car at (340,55), r at (480,160)

function arylCarbonylFrame(description: string, shortLabel: string, extra: AtomPosition[] = []): MechanismFrame {
  return {
    atoms: [
      mk('ph',    'Ph', 200, 160),
      mk('c_car', 'C',  340, 160, { role: 'carbonyl_carbon' }),
      mk('o_car', 'O',  340,  55, { role: 'carbonyl_oxygen' }),
      mk('r',     'R',  480, 160, { role: 'r_group' }),
      ...extra,
    ],
    bonds: [
      bd('ph-c',   'ph',    'c_car', 1),
      bd('c-o',    'c_car', 'o_car', 2),
      bd('c-r',    'c_car', 'r',     1),
    ],
    arrows: [],
    description, shortLabel,
  }
}

function arylMethyleneFrame(description: string, shortLabel: string): MechanismFrame {
  return {
    atoms: [
      mk('ph',   'Ph',  200, 160),
      mk('c_ch2','CH₂', 340, 160),
      mk('r',    'R',   480, 160, { role: 'r_group' }),
    ],
    bonds: [
      bd('ph-c', 'ph',   'c_ch2', 1),
      bd('c-r',  'c_ch2','r',     1),
    ],
    arrows: [],
    description, shortLabel,
  }
}

// ── Reactions ─────────────────────────────────────────────────────────────────

export const AROMATIC_REACTIONS: ReactionDef[] = [

  // ── 1. EAS Halogenation ─────────────────────────────────────────────────────
  {
    id: 'eas-halogenation',
    category: 'aromatic',
    name: 'EAS: Halogenation (Br₂/AlBr₃)',
    summary: 'AlBr₃ activates Br₂ to generate a powerful electrophile (Br⁺/Br–AlBr₃⁻). The electrophile attacks the aromatic ring, forming an arenium ion. Loss of H⁺ restores aromaticity.',
    reactants: 'Arene + Br₂, AlBr₃',
    products: 'Aryl bromide',
    conditions: 'Br₂, AlBr₃ (Lewis acid); anhydrous; room temperature; FeBr₃ also works',
    reactantSpecies: {
      text: 'Arene + Br₂, AlBr₃',
      species: [
        { smiles: 'c1ccccc1', label: 'Benzene' },
        { smiles: 'BrBr', label: 'Br₂' },
      ],
    },
    productSpecies: {
      text: 'Aryl bromide',
      species: [
        { smiles: 'Brc1ccccc1', label: 'Bromobenzene' },
      ],
    },
    conditionSpecies: {
      text: 'Br₂, AlBr₃ (Lewis acid); anhydrous; room temperature; FeBr₃ also works',
      species: [
        { smiles: 'BrBr', label: 'Br₂' },
        { smiles: 'BrAlBr', label: 'AlBr₃', catalyst: true },
      ],
    },
    reactionType: 'eas',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'AlBr₃ (Lewis acid) coordinates to Br₂: Br–Br → δ⁺Br–Br–AlBr₃⁻ (electrophilic Br⁺ equivalent)',
      'Halogen is the ONLY EAS group that deactivates the ring but directs ortho/para',
      'Lone pair on Cl/Br donates into ring by resonance (ortho/para activation) but electron-withdrawing by induction (deactivation)',
      'Iodination is sluggish — requires oxidizing agent (HNO₃ or H₂O₂) to activate I₂',
      'Fluorination is too exothermic (uncontrolled); F must be added by special methods',
    ],
    brownRef: 'Ch 22.2',
    relatedReactions: ['eas-nitration', 'eas-fc-acylation'],
    tags: ['EAS', 'halogenation', 'Br₂', 'AlBr₃', 'ortho-para', 'aryl bromide'],
    positionDirector: 'ortho_para',
    activatingEffect: 'weak_deactivator',
    frames: [
      easReactant('e_br', 'Br⁺', '+',
        'AlBr₃ polarizes Br₂ → electrophilic Br⁺ equivalent. The ring π electrons (curved arrow) will attack the electrophilic Br.',
        'Reactants'),
      easArenium('e_br', 'Br',
        'Br attacks the ipso carbon (b1). Arenium ion (σ-complex, Wheland intermediate) forms: b1 is sp³, + charge delocalized at ortho/para (shown on b4). The C–H bond will break to restore aromaticity.',
        'Arenium ion'),
      easProduct('e_br', 'Br',
        'Base (AlBr₄⁻) removes ipso H⁺. C–H electrons reform the π system. Aromaticity fully restored. AlBr₃ regenerated.',
        'Aryl bromide'),
    ],
    energyDiagram: [
      { label: 'Reactants',   energy: 45 },
      { label: 'TS₁',         energy: 88, isTransitionState: true },
      { label: 'Arenium ion', energy: 65 },
      { label: 'TS₂',         energy: 70, isTransitionState: true },
      { label: 'Products',    energy: 15 },
    ],
  },

  // ── 2. EAS Nitration ────────────────────────────────────────────────────────
  {
    id: 'eas-nitration',
    category: 'aromatic',
    name: 'EAS: Nitration',
    summary: 'H₂SO₄ protonates HNO₃ to generate the nitronium ion (NO₂⁺), a strong electrophile. NO₂⁺ attacks the ring; loss of H⁺ gives the nitroarene.',
    reactants: 'Arene + HNO₃, H₂SO₄',
    products: 'Nitroarene (ArNO₂)',
    conditions: 'Conc. HNO₃ + conc. H₂SO₄ (mixed acid); 0–50 °C; T controls mono vs poly nitration',
    reactantSpecies: {
      text: 'Arene + HNO₃/H₂SO₄',
      species: [
        { smiles: 'c1ccccc1', label: 'Benzene' },
        { smiles: 'O[N+](=O)[O-]', label: 'HNO₃' },
      ],
    },
    productSpecies: {
      text: 'Nitrobenzene',
      species: [
        { smiles: 'O=[N+]([O-])c1ccccc1', label: 'Nitrobenzene' },
      ],
    },
    conditionSpecies: {
      text: 'Conc. HNO₃ + conc. H₂SO₄ (mixed acid); 0–50 °C; T controls mono vs poly nitration',
      species: [
        { smiles: 'O[N+](=O)[O-]', label: 'HNO₃' },
        { smiles: 'OS(=O)(=O)O', label: 'H₂SO₄', catalyst: true },
      ],
    },
    reactionType: 'eas',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'H₂SO₄ protonates HNO₃: H₂SO₄ + HNO₃ → H₂NO₃⁺ → NO₂⁺ + H₂O (nitronium ion formed)',
      'NO₂⁺ is a powerful electrophile — reacts readily with deactivated rings',
      'NO₂ group is a strong EAS deactivator AND meta director (withdraws electrons by both resonance and induction)',
      'Nitration is key: NO₂ → NH₂ (by reduction) → N₂⁺ (diazonium) → many substituents',
      'Temperature control prevents poly-nitration; > 2 NO₂ groups → explosives (TNT)',
    ],
    brownRef: 'Ch 22.3',
    relatedReactions: ['eas-halogenation', 'nitro-to-amine', 'diazonium-formation'],
    tags: ['EAS', 'nitration', 'NO₂⁺', 'nitroarene', 'meta', 'H₂SO₄'],
    positionDirector: 'meta',
    activatingEffect: 'strong_deactivator',
    frames: [
      easReactant('e_no2', 'NO₂⁺', '+',
        'H₂SO₄ + HNO₃ → NO₂⁺ + H₂O + HSO₄⁻. The nitronium ion (linear electrophile) approaches the ring π system.',
        'Reactants'),
      easArenium('e_no2', 'NO₂',
        'NO₂⁺ attacks ipso carbon (b1). Arenium ion (Wheland intermediate) forms: b1 sp³, + charge at ortho/para (b4). HSO₄⁻ will remove the ipso H⁺.',
        'Arenium ion'),
      easProduct('e_no2', 'NO₂',
        'HSO₄⁻ removes ipso H⁺. Aromaticity restored. H₂SO₄ regenerated. NO₂ is a meta director in subsequent EAS reactions.',
        'Nitroarene'),
    ],
    energyDiagram: [
      { label: 'Reactants',   energy: 50 },
      { label: 'TS₁',         energy: 95, isTransitionState: true },
      { label: 'Arenium ion', energy: 72 },
      { label: 'TS₂',         energy: 78, isTransitionState: true },
      { label: 'Products',    energy: 20 },
    ],
  },

  // ── 3. EAS Sulfonation ──────────────────────────────────────────────────────
  {
    id: 'eas-sulfonation',
    category: 'aromatic',
    name: 'EAS: Sulfonation',
    summary: 'SO₃ (from fuming H₂SO₄) adds to an aromatic ring. Sulfonation is the ONLY reversible EAS reaction — heating with dilute H₂SO₄ removes the SO₃H group.',
    reactants: 'Arene + fuming H₂SO₄ (H₂S₂O₇)',
    products: 'Arylsulfonic acid (ArSO₃H)',
    conditions: 'Fuming H₂SO₄ (oleum); heat; reversible with dil. H₂SO₄/steam',
    reactantSpecies: {
      text: 'Arene + fuming H₂SO₄',
      species: [
        { smiles: 'c1ccccc1', label: 'Benzene' },
        { smiles: 'OS(=O)(=O)O', label: 'H₂SO₄ (oleum)' },
      ],
    },
    productSpecies: {
      text: 'Arylsulfonic acid',
      species: [
        { smiles: 'OS(=O)(=O)c1ccccc1', label: 'Benzenesulfonic acid' },
      ],
    },
    conditionSpecies: {
      text: 'Fuming H₂SO₄ (oleum); heat; reversible with dil. H₂SO₄/steam',
      species: [
        { smiles: 'OS(=O)(=O)O', label: 'Oleum (H₂SO₄)', catalyst: true },
      ],
    },
    reactionType: 'eas',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'ONLY reversible EAS: SO₃H added under strong acid; removed by dilute H₂SO₄ + steam (desulfonation)',
      'Reversibility makes SO₃H useful as a blocking group (protects a position, then remove later)',
      'SO₃H is a strong EAS deactivator (meta director) — similar electronic effect to NO₂',
      'SO₃ is the electrophilic species (Lewis acid, electrophilic S center)',
      'Product (ArSO₃H) is a strong acid (water-soluble): used in dyes, detergents, saccharin',
    ],
    brownRef: 'Ch 22.4',
    relatedReactions: ['eas-nitration', 'eas-fc-acylation'],
    tags: ['EAS', 'sulfonation', 'SO₃', 'reversible', 'blocking group', 'meta'],
    positionDirector: 'meta',
    activatingEffect: 'strong_deactivator',
    reversible: true,
    frames: [
      easReactant('e_so3', 'SO₃', undefined,
        'SO₃ (electrophilic sulfur, Lewis acid) approaches the ring π system. The double-headed arrow shows this reaction is reversible (desulfonation occurs with dil. H₂SO₄/steam).',
        'Reactants'),
      easArenium('e_so3', 'SO₃',
        'SO₃ attacks ipso carbon → arenium ion. + charge on para carbon (b4). SO₃H is meta-directing in any subsequent EAS on the product.',
        'Arenium ion'),
      easProduct('e_so3', 'SO₃H',
        'H⁺ lost from ipso carbon. Aromaticity restored. Product is arylsulfonic acid (ArSO₃H). Reversible: dilute H₂SO₄ + steam removes SO₃H (desulfonation).',
        'Arylsulfonic acid'),
    ],
    energyDiagram: [
      { label: 'Reactants',   energy: 48 },
      { label: 'TS₁',         energy: 85, isTransitionState: true },
      { label: 'Arenium ion', energy: 60 },
      { label: 'TS₂',         energy: 65, isTransitionState: true },
      { label: 'Products',    energy: 45 },
    ],
  },

  // ── 4. Friedel-Crafts Alkylation ────────────────────────────────────────────
  {
    id: 'eas-fc-alkylation',
    category: 'aromatic',
    name: 'Friedel-Crafts Alkylation',
    summary: 'AlCl₃ converts an alkyl halide to a carbocation electrophile, which attacks the ring. The product is an alkylbenzene. Rearrangements and poly-alkylation are major limitations.',
    reactants: 'Arene + R-Cl, AlCl₃',
    products: 'Alkylbenzene',
    conditions: 'AlCl₃ (Lewis acid), RX, anhydrous; mild temperature',
    reactantSpecies: {
      text: 'Arene + RX, AlCl₃',
      species: [
        { smiles: 'c1ccccc1', label: 'Benzene' },
        { smiles: '[R]Cl', label: 'Alkyl halide (RX)' },
      ],
    },
    productSpecies: {
      text: 'Alkylbenzene',
      species: [
        { smiles: '[R]c1ccccc1', label: 'Alkylbenzene' },
      ],
    },
    conditionSpecies: {
      text: 'AlCl₃ (Lewis acid), RX, anhydrous; mild temperature',
      species: [
        { smiles: '[Al](Cl)(Cl)Cl', label: 'AlCl₃', catalyst: true },
      ],
    },
    reactionType: 'eas',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: 'Carbocation',
    importantInfo: [
      'AlCl₃ abstracts X⁻ from R-X → R⁺ (or R–X–AlCl₃, highly polarized)',
      'PROBLEM 1: Rearrangements — carbocation can rearrange before attacking (hydride/alkyl shifts)',
      'PROBLEM 2: Poly-alkylation — alkylbenzene is MORE reactive than benzene, reacts again',
      'Does NOT work on rings deactivated by NO₂, SO₃H, or C=O (ring too electron-poor)',
      'Friedel-Crafts ACYLATION avoids both rearrangement and poly-acylation problems',
    ],
    brownRef: 'Ch 22.5',
    relatedReactions: ['eas-fc-acylation', 'eas-halogenation'],
    tags: ['EAS', 'Friedel-Crafts', 'alkylation', 'carbocation', 'rearrangement', 'poly-alkylation'],
    positionDirector: 'ortho_para',
    activatingEffect: 'weak_activator',
    rearrangementPossible: true,
    frames: [
      easReactant('e_r', 'R⁺', '+',
        'AlCl₃ + RCl → R⁺AlCl₄⁻ (carbocation or polarized complex). Rearrangements can occur here. R⁺ approaches the ring π system.',
        'Reactants'),
      easArenium('e_r', 'R',
        'R⁺ attacks ipso carbon → arenium ion (Wheland intermediate). + charge delocalized at ortho/para. AlCl₄⁻ will remove ipso H⁺.',
        'Arenium ion'),
      easProduct('e_r', 'R',
        'AlCl₄⁻ removes H⁺. Aromaticity restored. AlCl₃ regenerated. The alkylbenzene product is MORE activated → risk of poly-alkylation.',
        'Alkylbenzene'),
    ],
    energyDiagram: [
      { label: 'Reactants',   energy: 40 },
      { label: 'TS₁',         energy: 82, isTransitionState: true },
      { label: 'Arenium ion', energy: 58 },
      { label: 'TS₂',         energy: 63, isTransitionState: true },
      { label: 'Products',    energy: 12 },
    ],
  },

  // ── 5. Friedel-Crafts Acylation ─────────────────────────────────────────────
  {
    id: 'eas-fc-acylation',
    category: 'aromatic',
    name: 'Friedel-Crafts Acylation',
    summary: 'AlCl₃ converts an acyl chloride to a resonance-stabilized acylium cation (RCO⁺), which attacks the ring. No rearrangement. The product aryl ketone deactivates the ring, preventing poly-acylation.',
    reactants: 'Arene + RCOCl, AlCl₃',
    products: 'Aryl ketone (Ar–COR)',
    conditions: 'AlCl₃ (1 equiv or excess), RCOCl, anhydrous CH₂Cl₂ or CS₂',
    reactantSpecies: {
      text: 'Arene + RCOCl, AlCl₃',
      species: [
        { smiles: 'c1ccccc1', label: 'Benzene' },
        { smiles: '[R]C(=O)Cl', label: 'Acyl chloride' },
      ],
    },
    productSpecies: {
      text: 'Aryl ketone',
      species: [
        { smiles: '[R]C(=O)c1ccccc1', label: 'Aryl ketone' },
      ],
    },
    conditionSpecies: {
      text: 'AlCl₃ (1 equiv or excess), RCOCl, anhydrous CH₂Cl₂ or CS₂',
      species: [
        { smiles: '[Al](Cl)(Cl)Cl', label: 'AlCl₃', catalyst: true },
        { smiles: '[R]C(=O)Cl', label: 'RCOCl' },
      ],
    },
    reactionType: 'eas',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'Acylium ion (RCO⁺) is resonance-stabilized: R–C≡O⁺ — does NOT rearrange (unlike alkyl carbocations)',
      'Product aryl ketone deactivates the ring → NO poly-acylation (self-limiting)',
      'The aryl ketone C=O can be removed: Clemmensen (Zn/Hg, HCl) or Wolff-Kishner (NH₂NH₂, KOH)',
      'Allows synthesis of chain extensions without rearrangement: acylate then reduce = net Friedel-Crafts alkylation',
      'Does not work on deactivated rings (NO₂, SO₃H substituents)',
    ],
    brownRef: 'Ch 22.6',
    relatedReactions: ['eas-fc-alkylation', 'clemmensen-reduction', 'wolff-kishner-reduction'],
    tags: ['EAS', 'Friedel-Crafts', 'acylation', 'acylium', 'ketone', 'no rearrangement'],
    positionDirector: 'meta',
    activatingEffect: 'strong_deactivator',
    frames: [
      easReactant('e_ac', 'RCO⁺', '+',
        'AlCl₃ + RCOCl → RCO⁺AlCl₄⁻. Acylium ion is resonance-stabilized (R–C≡O⁺) and does NOT rearrange.',
        'Reactants'),
      easArenium('e_ac', 'RCO',
        'Acylium carbon attacks ipso carbon → arenium ion. + charge at ortho/para. AlCl₄⁻ will remove ipso H⁺.',
        'Arenium ion'),
      easProduct('e_ac', 'COR',
        'H⁺ removed. Aromaticity restored. Aryl ketone product DEACTIVATES the ring → no poly-acylation. Acylation then reduction = net alkylation without rearrangement.',
        'Aryl ketone'),
    ],
    energyDiagram: [
      { label: 'Reactants',   energy: 42 },
      { label: 'TS₁',         energy: 86, isTransitionState: true },
      { label: 'Arenium ion', energy: 62 },
      { label: 'TS₂',         energy: 68, isTransitionState: true },
      { label: 'Products',    energy: 18 },
    ],
  },

  // ── 6. Clemmensen Reduction ─────────────────────────────────────────────────
  {
    id: 'clemmensen-reduction',
    category: 'aromatic',
    name: 'Clemmensen Reduction',
    summary: 'Zn(Hg)/HCl converts a ketone carbonyl (C=O) to a methylene (–CH₂–) under acidic conditions. Used on aryl ketones after Friedel-Crafts acylation.',
    reactants: 'Aryl ketone',
    products: 'Alkylbenzene (C=O → CH₂)',
    conditions: 'Zn(Hg) amalgam, conc. HCl; reflux; acidic conditions required',
    reactantSpecies: {
      text: 'Aryl ketone + Zn(Hg), HCl',
      species: [
        { smiles: '[R]C(=O)c1ccccc1', label: 'Aryl ketone' },
        { smiles: '[H][H]', label: 'H₂ (equiv)' },
      ],
    },
    productSpecies: {
      text: 'Alkylbenzene',
      species: [
        { smiles: '[R]Cc1ccccc1', label: 'Alkylbenzene' },
      ],
    },
    conditionSpecies: {
      text: 'Zn(Hg) amalgam, conc. HCl; reflux; acidic conditions required',
      species: [
        { smiles: '[Zn]', label: 'Zn(Hg) amalgam', catalyst: true },
        { smiles: 'Cl', label: 'conc. HCl' },
      ],
    },
    reactionType: 'reduction',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'Converts C=O directly to CH₂ — skips the alcohol stage (not reduced to alcohol first)',
      'Requires ACIDIC conditions: use Clemmensen for acid-stable substrates',
      'Complementary to Wolff-Kishner (BASIC conditions, same result)',
      'Combined with Friedel-Crafts acylation → net alkylation without rearrangement',
      'Does not reduce isolated C=C double bonds or C≡C triple bonds',
    ],
    brownRef: 'Ch 22.6',
    relatedReactions: ['wolff-kishner-reduction', 'eas-fc-acylation'],
    tags: ['reduction', 'Clemmensen', 'Zn/Hg', 'ketone', 'methylene', 'acidic'],
    frames: [
      arylCarbonylFrame(
        'Aryl ketone: Ph–C(=O)–R. Zn(Hg)/HCl (acidic) will reduce the carbonyl directly to CH₂.',
        'Aryl ketone',
        [mk('zn', 'Zn(Hg)', 340, 260, { label: 'Zn(Hg)/HCl' })]
      ),
      arylMethyleneFrame(
        'Zn(Hg)/HCl reduces C=O → CH₂ via surface mechanism. Both oxygen atoms leave as water. Result: alkylbenzene.',
        'Alkylbenzene',
      ),
    ],
    energyDiagram: [
      { label: 'Ketone',       energy: 45 },
      { label: 'TS',           energy: 75, isTransitionState: true },
      { label: 'Alkylbenzene', energy: 15 },
    ],
  },

  // ── 7. Wolff-Kishner Reduction ──────────────────────────────────────────────
  {
    id: 'wolff-kishner-reduction',
    category: 'aromatic',
    name: 'Wolff-Kishner Reduction',
    summary: 'NH₂NH₂ and KOH convert a ketone C=O to CH₂ under strongly basic conditions via a hydrazone intermediate. Complementary to Clemmensen (acidic conditions).',
    reactants: 'Aryl ketone',
    products: 'Alkylbenzene (C=O → CH₂)',
    conditions: 'NH₂NH₂ (hydrazine), KOH, ethylene glycol; 200 °C (Huang Minlon) or sealed tube',
    reactantSpecies: {
      text: 'Aryl ketone + N₂H₄, KOH',
      species: [
        { smiles: '[R]C(=O)c1ccccc1', label: 'Aryl ketone' },
        { smiles: 'NN', label: 'N₂H₄ (hydrazine)' },
      ],
    },
    productSpecies: {
      text: 'Alkylbenzene',
      species: [
        { smiles: '[R]Cc1ccccc1', label: 'Alkylbenzene' },
      ],
    },
    conditionSpecies: {
      text: 'NH₂NH₂ (hydrazine), KOH, ethylene glycol; 200 °C (Huang Minlon) or sealed tube',
      species: [
        { smiles: 'NN', label: 'N₂H₄' },
        { smiles: '[OH-].[K+]', label: 'KOH' },
      ],
    },
    reactionType: 'reduction',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'Step 1: hydrazine adds to C=O → hydrazone (C=N-NH₂) + H₂O',
      'Step 2: KOH + heat decomposes the hydrazone → N₂ leaves, C-H bonds form',
      'Requires BASIC conditions: use Wolff-Kishner for base-stable substrates',
      'Complementary to Clemmensen (acidic, Zn(Hg)/HCl), same net transformation',
      'The Huang Minlon modification uses ethylene glycol as solvent (higher bp, fewer steps)',
    ],
    brownRef: 'Ch 22.6',
    relatedReactions: ['clemmensen-reduction', 'eas-fc-acylation'],
    tags: ['reduction', 'Wolff-Kishner', 'hydrazone', 'NH₂NH₂', 'KOH', 'basic', 'methylene'],
    frames: [
      arylCarbonylFrame(
        'Aryl ketone: Ph–C(=O)–R. NH₂NH₂ will add to the carbonyl carbon.',
        'Aryl ketone',
        [mk('hyd', 'NH₂NH₂', 340, 265, { role: 'nucleophile' })]
      ),
      {
        atoms: [
          mk('ph',    'Ph',    200, 160),
          mk('c_car', 'C',     340, 160, { role: 'carbonyl_carbon', glow: true }),
          mk('hzone', 'N-NH₂', 340,  55),
          mk('r',     'R',     480, 160, { role: 'r_group' }),
        ],
        bonds: [
          bd('ph-c',   'ph',    'c_car', 1),
          bd('c-nn',   'c_car', 'hzone', 2),
          bd('c-r',    'c_car', 'r',     1),
        ],
        arrows: [],
        description: 'Hydrazone (C=N-NH₂) intermediate. NH₂NH₂ added to carbonyl; H₂O lost. KOH + heat will decompose the hydrazone.',
        shortLabel: 'Hydrazone',
      },
      arylMethyleneFrame(
        'KOH + heat: hydrazone loses N₂ gas (excellent driving force). Carbanion is protonated by solvent. Net: C=O → CH₂. Same result as Clemmensen but under basic conditions.',
        'Alkylbenzene',
      ),
    ],
    energyDiagram: [
      { label: 'Ketone',       energy: 45 },
      { label: 'Hydrazone',    energy: 35 },
      { label: 'TS',           energy: 72, isTransitionState: true },
      { label: 'Alkylbenzene', energy: 15 },
    ],
  },

  // ── 8. NBS Benzylic Bromination ─────────────────────────────────────────────
  {
    id: 'nbs-bromination',
    category: 'aromatic',
    name: 'NBS Bromination (Benzylic)',
    summary: 'NBS (N-bromosuccinimide) with radical initiator selectively brominates the benzylic position via a radical mechanism. The benzylic radical is stabilized by resonance with the ring.',
    reactants: 'Alkylbenzene + NBS',
    products: 'Benzylic bromide',
    conditions: 'NBS, hν (light) or ROOR (peroxide initiator); CCl₄ solvent; 80 °C',
    reactantSpecies: {
      text: 'Alkylbenzene + NBS, hν',
      species: [
        { smiles: '[R]Cc1ccccc1', label: 'Alkylbenzene' },
        { smiles: 'O=C1CCC(=O)N1Br', label: 'NBS' },
      ],
    },
    productSpecies: {
      text: 'Benzylic bromide',
      species: [
        { smiles: '[R]C(Br)c1ccccc1', label: 'Benzylic bromide' },
      ],
    },
    conditionSpecies: {
      text: 'NBS, hν (light) or ROOR (peroxide initiator); CCl₄ solvent; 80 °C',
      species: [
        { smiles: 'O=C1CCC(=O)N1Br', label: 'NBS' },
        { smiles: 'ClC(Cl)(Cl)Cl', label: 'CCl₄', catalyst: true },
      ],
    },
    reactionType: 'radical',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'NBS acts as a Br• source; the succinimidyl radical abstracts H to generate Br• in situ',
      'Benzylic radical is highly stabilized by resonance with the aromatic ring',
      'Selectivity: only the benzylic C–H is abstracted (more stable radical than allylic or alkyl)',
      'Radical chain mechanism: initiation (hν), propagation (H abstraction then Br• addition), termination',
      'Does NOT brominate the ring (that needs Lewis acid) or non-benzylic positions',
    ],
    brownRef: 'Ch 10.6',
    relatedReactions: ['eas-halogenation', 'diazonium-formation'],
    tags: ['radical', 'NBS', 'benzylic', 'bromination', 'selective', 'radical chain'],
    frames: [
      {
        atoms: [
          mk('ph',     'Ph',    185, 160),
          mk('c_benz', 'C',     330, 160, { role: 'alpha_carbon' }),
          mk('h_a',    'H',     330,  55),
          mk('r',      'R',     475, 160, { role: 'r_group' }),
          mk('nbs',    'NBS',   490,  95, { label: 'N-bromosuccinimide', role: 'electrophile' }),
        ],
        bonds: [
          bd('ph-cb', 'ph',     'c_benz', 1),
          bd('cb-ha', 'c_benz', 'h_a',    1),
          bd('cb-r',  'c_benz', 'r',      1),
        ],
        arrows: [{
          from: { kind: 'atom', id: 'nbs' },
          to:   { kind: 'bond', id: 'cb-ha' },
          color: 'var(--c-halogen)',
          style: 'fishhook',
        } as CurvedArrowOverlay],
        description: 'hν or peroxide initiator generates Br•. Br• abstracts the benzylic H• (homolytic cleavage). The benzylic position is most reactive: the resulting radical is resonance-stabilized by the aromatic ring.',
        shortLabel: 'Alkylbenzene + NBS',
      },
      {
        atoms: [
          mk('ph',     'Ph',    185, 160),
          mk('c_benz', 'C',     330, 160, { role: 'alpha_carbon', charge: '•', glow: true }),
          mk('r',      'R',     475, 160, { role: 'r_group' }),
        ],
        bonds: [
          bd('ph-cb', 'ph',     'c_benz', 1),
          bd('cb-r',  'c_benz', 'r',      1),
        ],
        arrows: [],
        description: 'Benzylic radical intermediate. Stabilized by resonance with the π system of the ring (radical delocalized onto ortho and para ring carbons). Br• will now add to this carbon.',
        shortLabel: 'Benzylic radical',
      },
      {
        atoms: [
          mk('ph',     'Ph',    185, 160),
          mk('c_benz', 'C',     330, 160, { role: 'alpha_carbon' }),
          mk('br',     'Br',    330,  55),
          mk('r',      'R',     475, 160, { role: 'r_group' }),
        ],
        bonds: [
          bd('ph-cb', 'ph',     'c_benz', 1),
          bd('cb-br', 'c_benz', 'br',     1),
          bd('cb-r',  'c_benz', 'r',      1),
        ],
        arrows: [],
        description: 'Benzylic radical abstracts Br from NBS → benzylic bromide product. The succinimidyl radical continues the chain. Racemic product if the benzylic C becomes a stereocenter.',
        shortLabel: 'Benzylic bromide',
      },
    ],
    energyDiagram: [
      { label: 'Reactants',        energy: 45 },
      { label: 'TS (H abstract.)',  energy: 72, isTransitionState: true },
      { label: 'Benzylic radical', energy: 50 },
      { label: 'TS (Br add.)',     energy: 58, isTransitionState: true },
      { label: 'Products',         energy: 25 },
    ],
  },

  // ── 9. Side-Chain Oxidation ─────────────────────────────────────────────────
  {
    id: 'sidechain-oxidation',
    category: 'aromatic',
    name: 'Side-Chain Oxidation (KMnO₄)',
    summary: 'KMnO₄ oxidizes any alkyl side chain bearing at least one benzylic H all the way to a carboxylic acid (benzoic acid). The ring is NOT oxidized.',
    reactants: 'Alkylbenzene',
    products: 'Benzoic acid (ArCOOH)',
    conditions: 'Hot conc. KMnO₄, H₂O (acidify workup); or Na₂Cr₂O₇/H₂SO₄',
    reactantSpecies: {
      text: 'Alkylbenzene + KMnO₄',
      species: [
        { smiles: '[R]Cc1ccccc1', label: 'Alkylbenzene' },
        { smiles: '[O-][Mn](=O)(=O)=O.[K+]', label: 'KMnO₄' },
      ],
    },
    productSpecies: {
      text: 'Benzoic acid',
      species: [
        { smiles: 'OC(=O)c1ccccc1', label: 'Benzoic acid' },
      ],
    },
    conditionSpecies: {
      text: 'Hot conc. KMnO₄, H₂O (acidify workup); or Na₂Cr₂O₇/H₂SO₄',
      species: [
        { smiles: '[O-][Mn](=O)(=O)=O.[K+]', label: 'KMnO₄' },
      ],
    },
    reactionType: 'oxidation',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'Oxidizes any alkyl chain at the benzylic position — entire chain converted to COOH',
      'Requires ≥ 1 benzylic H: tert-butylbenzene (no benzylic H) is NOT oxidized',
      'The ring itself is NOT affected: benzene ring is stable to KMnO₄ under these conditions',
      'Useful for identifying positions of substituents by degrading to known benzoic acids',
      'Over-oxidation: nothing stops at aldehyde — all the way to COOH',
    ],
    brownRef: 'Ch 22.8',
    relatedReactions: ['eas-fc-acylation', 'alcohol-oxidation'],
    tags: ['oxidation', 'KMnO₄', 'side chain', 'benzoic acid', 'COOH', 'benzylic'],
    frames: [
      {
        atoms: [
          mk('ph',     'Ph',    165, 160),
          mk('c_benz', 'CH₂',   305, 160, { role: 'alpha_carbon' }),
          mk('c2',     'CH₃',   445, 160, { role: 'r_group' }),
          mk('ox',     'KMnO₄', 380, 255, { label: 'oxidant' }),
        ],
        bonds: [
          bd('ph-cb', 'ph',     'c_benz', 1),
          bd('cb-c2', 'c_benz', 'c2',     1),
        ],
        arrows: [{
          from: { kind: 'atom', id: 'ox' },
          to:   { kind: 'atom', id: 'c_benz' },
          color: 'var(--c-halogen)',
        }],
        description: 'Hot KMnO₄ oxidizes the benzylic C–H. The entire side chain is degraded. Any carbon bonded to the ring with ≥ 1 H is converted all the way to COOH.',
        shortLabel: 'Alkylbenzene + KMnO₄',
      },
      {
        atoms: [
          mk('ph',   'Ph',   165, 160),
          mk('cooh', 'COOH', 305, 160),
        ],
        bonds: [bd('ph-cooh', 'ph', 'cooh', 1)],
        arrows: [],
        description: 'Benzoic acid product. The ring is intact — benzene ring is not oxidized under these conditions. Note: tert-butylbenzene (no benzylic H) survives KMnO₄.',
        shortLabel: 'Benzoic acid',
      },
    ],
    energyDiagram: [
      { label: 'Alkylbenzene', energy: 55 },
      { label: 'TS',           energy: 80, isTransitionState: true },
      { label: 'Benzoic acid', energy: 15 },
    ],
  },

  // ── 10. Diazonium Formation ─────────────────────────────────────────────────
  {
    id: 'diazonium-formation',
    category: 'aromatic',
    name: 'Diazonium Salt Formation',
    summary: 'ArNH₂ is diazotized at 0 °C with NaNO₂/HCl to give ArN₂⁺Cl⁻. The diazonium group is a versatile "gateway" to many aromatic substituents via Sandmeyer and related reactions.',
    reactants: 'Arylamine (ArNH₂)',
    products: 'Aryldiazonium salt (ArN₂⁺)',
    conditions: 'NaNO₂, HCl, 0–5 °C (must stay cold — diazonium decomposes above 5 °C)',
    reactantSpecies: {
      text: 'ArNH₂ + NaNO₂, HCl, 0–5 °C',
      species: [
        { smiles: 'Nc1ccccc1', label: 'Aniline (ArNH₂)' },
        { smiles: 'N=O.[Na+].[Cl-]', label: 'NaNO₂/HCl' },
      ],
    },
    productSpecies: {
      text: 'Arenediazonium salt (ArN₂⁺)',
      species: [
        { smiles: '[N+]#Nc1ccccc1', label: 'Benzenediazonium' },
      ],
    },
    conditionSpecies: {
      text: 'NaNO₂, HCl, 0–5 °C (must stay cold — diazonium decomposes above 5 °C)',
      species: [
        { smiles: '[Na+].[O-]N=O', label: 'NaNO₂' },
        { smiles: 'Cl', label: 'HCl' },
      ],
    },
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'Temperature critical: keep at 0–5 °C. Above 10 °C the diazonium salt decomposes.',
      'From ArN₂⁺ you can access: CuCl→ArCl, CuBr→ArBr, CuCN→ArCN (Sandmeyer)',
      'Also: KI→ArI (no Cu needed), HBF₄→ArF (Balz-Schiemann), H₂O/Δ→ArOH',
      'H₃PO₂ reduces ArN₂⁺ → ArH (removes the amine group entirely — very useful in synthesis)',
      'Azo coupling: ArN₂⁺ + activated ring → Ar–N=N–Ar (azo dye, weakly electrophilic)',
    ],
    brownRef: 'Ch 23.7',
    relatedReactions: ['diazonium-transformation', 'nitro-to-amine', 'azo-coupling'],
    tags: ['diazonium', 'diazotization', 'NaNO₂', 'Sandmeyer', 'ArN₂⁺', 'amine'],
    frames: [
      {
        atoms: [
          mk('ph',    'Ph',      185, 160),
          mk('nh2',   'NH₂',     330, 160, { role: 'nucleophile' }),
          mk('nano2', 'NaNO₂',   490, 115, { label: 'diazotizing agent' }),
          mk('hcl',   'HCl',     490, 205, { label: 'acid' }),
        ],
        bonds: [bd('ph-n', 'ph', 'nh2', 1)],
        arrows: [{
          from: { kind: 'atom', id: 'nh2' },
          to:   { kind: 'atom', id: 'nano2' },
          color: 'var(--c-alkali)',
        }],
        description: 'ArNH₂ + NaNO₂/HCl at 0–5 °C. HCl converts NaNO₂ to nitrous acid (HNO₂). The amine nitrogen attacks the electrophilic N of HNO₂. After proton transfers and dehydration, the diazonium forms.',
        shortLabel: 'ArNH₂',
      },
      {
        atoms: [
          mk('ph', 'Ph',    185, 160),
          mk('n2', 'N₂⁺',  330, 160, { charge: '+', glow: true }),
        ],
        bonds: [bd('ph-n2', 'ph', 'n2', 1)],
        arrows: [],
        description: 'Aryldiazonium salt (ArN₂⁺Cl⁻). Must stay at 0–5 °C. The N₂⁺ group is a "gateway" to Cl, Br, I, F, OH, CN, or H (via Sandmeyer, Balz-Schiemann, and related reactions).',
        shortLabel: 'ArN₂⁺',
      },
    ],
    energyDiagram: [
      { label: 'ArNH₂',  energy: 40 },
      { label: 'TS',      energy: 65, isTransitionState: true },
      { label: 'ArN₂⁺',  energy: 55 },
    ],
  },

  // ── 11. Diazonium Transformation ────────────────────────────────────────────
  {
    id: 'diazonium-transformation',
    category: 'aromatic',
    name: 'Diazonium Replacement Reactions',
    summary: 'The N₂⁺ group in aryldiazonium salts is an outstanding leaving group. Nucleophilic substitution replaces it with Cl, Br, I, F, OH, CN, or even H.',
    reactants: 'ArN₂⁺ + nucleophile',
    products: 'Ar-Nu (Nu = Cl, Br, I, F, OH, CN, H)',
    conditions: 'Various: CuX (Sandmeyer), KI, HBF₄, H₂O, H₃PO₂; 0 °C → warm depending on reaction',
    reactantSpecies: {
      text: 'ArN₂⁺ Cl⁻ (diazonium salt)',
      species: [
        { smiles: '[N+]#Nc1ccccc1', label: 'Diazonium salt (ArN₂⁺)' },
      ],
    },
    productSpecies: {
      text: 'ArX (Ar-F, Ar-Cl, Ar-Br, Ar-I, Ar-CN, Ar-OH)',
      species: [
        { smiles: 'Brc1ccccc1', label: 'Aryl bromide (Sandmeyer)' },
      ],
    },
    conditionSpecies: {
      text: 'Various: CuX (Sandmeyer), KI, HBF₄, H₂O, H₃PO₂; 0 °C → warm depending on reaction',
      species: [
        { smiles: 'Br[Cu]Br', label: 'CuBr (Sandmeyer)', catalyst: true },
      ],
    },
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'Sandmeyer: CuCl→ArCl, CuBr→ArBr, CuCN→ArCN (Cu(I) catalysis, radical mechanism)',
      'KI (no Cu): ArN₂⁺ + I⁻ → ArI + N₂ (I⁻ is a good reductant/nucleophile)',
      'Balz-Schiemann: ArN₂⁺BF₄⁻ → ArF + N₂ + BF₃ (pyrolysis, only practical route to ArF)',
      'ArN₂⁺ + H₂O/Δ → ArOH + N₂ + H⁺ (phenol synthesis)',
      'H₃PO₂: ArN₂⁺ → ArH + N₂ (deamination — removes amine from ring, useful in synthesis)',
    ],
    brownRef: 'Ch 23.7',
    relatedReactions: ['diazonium-formation', 'nitro-to-amine'],
    tags: ['diazonium', 'Sandmeyer', 'substitution', 'N₂⁺', 'ArCl', 'ArBr', 'ArI', 'ArF'],
    frames: [
      {
        atoms: [
          mk('ph', 'Ph',    185, 160),
          mk('n2', 'N₂⁺',  330, 160, { charge: '+', role: 'leaving_group' }),
          mk('nu', 'Nu',   515, 160, { charge: '−', role: 'nucleophile' }),
        ],
        bonds: [bd('ph-n2', 'ph', 'n2', 1)],
        arrows: [{
          from: { kind: 'atom', id: 'nu' },
          to:   { kind: 'atom', id: 'n2' },
          color: 'var(--c-alkali)',
        }],
        description: 'N₂⁺ is an excellent leaving group (N₂ gas). Nucleophile (Cu-mediated or direct) attacks the ipso carbon as N₂ departs. Sandmeyer: CuCl, CuBr, CuCN; also KI, HBF₄, H₂O.',
        shortLabel: 'ArN₂⁺ + Nu⁻',
      },
      {
        atoms: [
          mk('ph', 'Ph', 185, 160),
          mk('nu', 'Nu', 330, 160),
        ],
        bonds: [bd('ph-nu', 'ph', 'nu', 1)],
        arrows: [],
        description: 'N₂ gas leaves (excellent driving force). Nu bonds to the ring ipso carbon. Product Ar–Nu. This is the key step that converts arylamines (from nitration/reduction) into virtually any aryl substituent.',
        shortLabel: 'Ar–Nu',
      },
    ],
    energyDiagram: [
      { label: 'ArN₂⁺ + Nu', energy: 55 },
      { label: 'TS',          energy: 72, isTransitionState: true },
      { label: 'Ar-Nu + N₂', energy: 10 },
    ],
  },

  // ── 12. Nitro to Amine ──────────────────────────────────────────────────────
  {
    id: 'nitro-to-amine',
    category: 'aromatic',
    name: 'Reduction of Nitro to Amine',
    summary: 'ArNO₂ is reduced to ArNH₂ by H₂/Pd or Sn/HCl. This is the standard route to aromatic amines — used after EAS nitration to install the amine group.',
    reactants: 'Nitroarene (ArNO₂)',
    products: 'Arylamine (ArNH₂)',
    conditions: 'H₂/Pd-C or Sn/HCl (Fe/HCl also works); acidic workup gives salt, then NaOH to free amine',
    reactantSpecies: {
      text: 'Nitrobenzene + H₂/Pd-C',
      species: [
        { smiles: 'O=[N+]([O-])c1ccccc1', label: 'Nitrobenzene' },
        { smiles: '[H][H]', label: 'H₂' },
      ],
    },
    productSpecies: {
      text: 'Aniline (ArNH₂)',
      species: [
        { smiles: 'Nc1ccccc1', label: 'Aniline' },
      ],
    },
    conditionSpecies: {
      text: 'H₂/Pd-C or Sn/HCl (Fe/HCl also works); acidic workup gives salt, then NaOH to free amine',
      species: [
        { smiles: '[Pd]', label: 'Pd/C', catalyst: true },
        { smiles: '[H][H]', label: 'H₂' },
      ],
    },
    reactionType: 'reduction',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'H₂/Pd (catalytic hydrogenation) is cleanest method; mild, functional-group tolerant',
      'Sn/HCl or Fe/HCl are classical methods (Baeyer 1868); give amine hydrochloride salt',
      'Sequence: EAS nitration → ArNO₂ → reduction → ArNH₂ → diazotization → any substituent',
      'NEVER add NO₂ to a ring that already has NH₂ — the amine will dominate and poly-nitration is not controlled',
      'The NH₂ group is one of the strongest EAS activators (o/p director, powerful lone pair donation)',
    ],
    brownRef: 'Ch 23.6',
    relatedReactions: ['eas-nitration', 'diazonium-formation'],
    tags: ['reduction', 'nitro', 'amine', 'H₂/Pd', 'Sn/HCl', 'ArNH₂', 'ArNO₂'],
    frames: [
      {
        atoms: [
          mk('ph',    'Ph',    185, 160),
          mk('no2',   'NO₂',   330, 160),
          mk('h2pd', 'H₂/Pd', 490, 160, { label: 'reducing agent', role: 'nucleophile' }),
        ],
        bonds: [bd('ph-no2', 'ph', 'no2', 1)],
        arrows: [{
          from: { kind: 'atom', id: 'h2pd' },
          to:   { kind: 'atom', id: 'no2' },
          color: 'var(--c-alkali)',
        }],
        description: 'H₂/Pd (or Sn/HCl) donates electrons and protons to ArNO₂. Intermediates include nitroso (ArNO) and hydroxylamine (ArNHOH). Net: –NO₂ + 3H₂ → –NH₂ + 2H₂O.',
        shortLabel: 'ArNO₂',
      },
      {
        atoms: [
          mk('ph',  'Ph',   185, 160),
          mk('nh2', 'NH₂',  330, 160, { glow: true }),
        ],
        bonds: [bd('ph-nh2', 'ph', 'nh2', 1)],
        arrows: [],
        description: 'Arylamine (ArNH₂) product. NH₂ is a powerful ortho/para director for EAS. Next step is usually diazotization → Sandmeyer to install any desired substituent on the ring.',
        shortLabel: 'ArNH₂',
      },
    ],
    energyDiagram: [
      { label: 'ArNO₂',  energy: 55 },
      { label: 'ArNO',   energy: 42 },
      { label: 'ArNHOH', energy: 30 },
      { label: 'ArNH₂',  energy: 15 },
    ],
  },

  // ── 13. Azo Coupling ────────────────────────────────────────────────────────
  {
    id: 'azo-coupling',
    category: 'aromatic',
    name: 'Azo Coupling',
    summary: 'An aryldiazonium ion (weak electrophile) couples with a highly activated aromatic ring (phenol or aniline) at the para position. The azo product (Ar–N=N–Ar′) is intensely colored.',
    reactants: 'ArN₂⁺ + activated Ar′H (phenol or aniline)',
    products: 'Azo compound Ar–N=N–Ar′',
    conditions: 'Near-neutral pH (4–9); 0–5 °C; para position preferred; dye synthesis',
    reactantSpecies: {
      text: 'ArN₂⁺ + activated arene',
      species: [
        { smiles: '[N+]#Nc1ccccc1', label: 'Diazonium ion (ArN₂⁺)' },
        { smiles: 'Nc1ccccc1', label: 'Activated arene (e.g. aniline)' },
      ],
    },
    productSpecies: {
      text: 'Azo compound (Ar-N=N-Ar)',
      species: [
        { smiles: 'c1ccc(/N=N/c2ccccc2)cc1', label: 'Azo dye' },
      ],
    },
    conditionSpecies: {
      text: 'Near-neutral pH (4–9); 0–5 °C; para position preferred; dye synthesis',
      species: [
        { smiles: '[H+]', label: 'pH 4–9 buffer', catalyst: true },
      ],
    },
    reactionType: 'eas',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'Diazonium is a WEAK electrophile — only reacts with highly activated rings (phenols, anilines)',
      'Para position preferred; ortho if para is blocked',
      'Azo dyes: intensely colored because the Ar–N=N–Ar chromophore absorbs visible light',
      'pH matters: pH too low → protonates the phenol or denaturing amine (less reactive); pH too high → diazonium decomposes to phenol',
      'Historic importance: coal tar dyes, modern food colorings, indicator dyes (methyl orange)',
    ],
    brownRef: 'Ch 23.7',
    relatedReactions: ['diazonium-formation', 'eas-halogenation'],
    tags: ['EAS', 'azo coupling', 'diazonium', 'azo dye', 'phenol', 'aniline', 'color'],
    frames: [
      {
        atoms: [
          mk('ar1',    'Ar',     175, 160),
          mk('n2plus', 'N₂⁺',   305, 160, { charge: '+', role: 'electrophile' }),
          mk('ar2',    'Ar-OH',  530, 160, { label: 'activated ring', role: 'nucleophile' }),
        ],
        bonds: [bd('ar1-n2', 'ar1', 'n2plus', 1)],
        arrows: [{
          from: { kind: 'atom', id: 'ar2' },
          to:   { kind: 'atom', id: 'n2plus' },
          color: 'var(--c-alkali)',
        }],
        description: 'ArN₂⁺ is a weak electrophile — only reacts with highly activated rings (phenol, aniline). The activated ring attacks the terminal N at the para position. An arenium ion forms briefly, then H⁺ is lost.',
        shortLabel: 'ArN₂⁺ + Ar′H',
      },
      {
        atoms: [
          mk('ar1', 'Ar',  160, 160),
          mk('nn',  'N=N', 315, 160, { glow: true }),
          mk('ar2', 'Ar',  490, 160),
        ],
        bonds: [
          bd('ar1-nn', 'ar1', 'nn', 1),
          bd('nn-ar2', 'nn',  'ar2', 1),
        ],
        arrows: [],
        description: 'Azo compound (Ar–N=N–Ar′). The N=N chromophore absorbs visible light → intensely colored product (azo dye). Para product is kinetically and thermodynamically preferred.',
        shortLabel: 'Azo product',
      },
    ],
    energyDiagram: [
      { label: 'Reactants',    energy: 48 },
      { label: 'TS',           energy: 75, isTransitionState: true },
      { label: 'Azo compound', energy: 20 },
    ],
  },

  // ── 14. SNAr (Meisenheimer) ─────────────────────────────────────────────────
  {
    id: 'snar',
    category: 'aromatic',
    name: 'Nucleophilic Aromatic Substitution (SNAr)',
    summary: 'A nucleophile adds to an electron-poor arene bearing a leaving group. An anionic Meisenheimer complex intermediate forms, then the leaving group departs. Requires EWG ortho/para to the leaving group.',
    reactants: 'Activated arene + Nu⁻',
    products: 'Ar-Nu',
    conditions: 'EWG (NO₂, CN) at ortho or para to leaving group; strong nucleophile (OH⁻, NH₃, RO⁻); polar aprotic or protic solvent',
    reactantSpecies: {
      text: 'Activated aryl halide + strong nucleophile',
      species: [
        { smiles: 'O=[N+]([O-])c1ccc(Cl)cc1', label: '4-Chloronitrobenzene' },
        { smiles: '[OH-]', label: 'Nu⁻ (e.g. OH⁻)', showLonePairs: true },
      ],
    },
    productSpecies: {
      text: 'Substituted arene (Nu replaces LG)',
      species: [
        { smiles: 'O=[N+]([O-])c1ccc(O)cc1', label: '4-Nitrophenol' },
      ],
    },
    conditionSpecies: {
      text: 'EWG (NO₂, CN) at ortho or para to leaving group; strong nucleophile (OH⁻, NH₃, RO⁻); polar aprotic or protic solvent',
      species: [
        { smiles: '[OH-]', label: 'OH⁻ (nucleophile)', showLonePairs: true },
      ],
    },
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'Rate-determining step = ADDITION of Nu to ring (opposite to EAS where loss of H is fast)',
      'Meisenheimer complex: anionic σ-complex, ring is no longer aromatic (sp³ carbon)',
      'EWG ortho/para stabilize the negative charge in the Meisenheimer complex (resonance)',
      'F is the best leaving group (not I!) — F leaves faster because C–F is strong but the C is most δ⁺',
      'Requires strongly electron-withdrawing substituents; plain benzene does NOT undergo SNAr',
    ],
    brownRef: 'Ch 22.10',
    relatedReactions: ['sn2', 'benzyne'],
    tags: ['SNAr', 'Meisenheimer', 'nucleophilic aromatic', 'addition-elimination', 'EWG', 'F'],
    frames: [
      // b1(top)=C-F, b4(bottom)=C-NO₂; Nu approaches from the left toward b1
      {
        atoms: [
          ...ringAtoms(),
          mk('f',    'F',    350,  45, { role: 'leaving_group' }),
          mk('no2',  'NO₂',  350, 295, { role: 'electrophile' }),
          mk('nu',   'OH⁻',  185, 115, { charge: '−', role: 'nucleophile' }),
        ],
        bonds: [
          ...aromaticBonds(),
          bd('b1-f',   'b1', 'f',   1),
          bd('b4-no2', 'b4', 'no2', 1),
        ],
        arrows: [{
          from: { kind: 'atom', id: 'nu' },
          to:   { kind: 'atom', id: 'b1' },
          color: 'var(--c-alkali)',
        }],
        description: 'Activated arene: F at b1 (leaving group), NO₂ at b4 (para, EWG stabilizes Meisenheimer). OH⁻ approaches b1. Rate-determining step is ADDITION (not LG departure as in aliphatic SN2).',
        shortLabel: 'Activated arene + Nu',
      },
      {
        atoms: [
          ...ringAtoms({ b4: { charge: '−', glow: true } }),
          mk('f',   'F',    350,  45, { role: 'leaving_group' }),
          mk('no2', 'NO₂',  350, 295),
          mk('nu',  'OH',   225, 115, { role: 'nucleophile' }),
        ],
        bonds: [
          ...areniumBonds(),
          bd('b1-f',   'b1', 'f',  1),
          bd('b4-no2', 'b4', 'no2',1),
          bd('b1-nu',  'b1', 'nu', 1),
        ],
        arrows: [{
          from: { kind: 'atom', id: 'f' },
          to:   { kind: 'atom', id: 'b2' },
          color: 'var(--c-halogen)',
        }],
        description: 'Meisenheimer complex (anionic σ-complex). b1 is now sp³ — bonded to F, Nu (OH), b2, and b6. Negative charge delocalized onto NO₂ (para, shown at b4). F⁻ will depart in the next step.',
        shortLabel: 'Meisenheimer complex',
      },
      {
        atoms: [
          ...ringAtoms(),
          mk('no2', 'NO₂',  350, 295),
          mk('nu',  'OH',   350,  45),
        ],
        bonds: [
          ...aromaticBonds(),
          bd('b4-no2', 'b4', 'no2', 1),
          bd('b1-nu',  'b1', 'nu',  1),
        ],
        arrows: [],
        description: 'F⁻ leaves (excellent LG in SNAr — C–F strong, but C is most electrophilic when F attached). Aromaticity restored. OH replaces F. Note: F is best LG here, not I (opposite of SN2).',
        shortLabel: 'Ar–Nu',
      },
    ],
    energyDiagram: [
      { label: 'Reactants',    energy: 50 },
      { label: 'TS₁',          energy: 90, isTransitionState: true },
      { label: 'Meisenheimer', energy: 68 },
      { label: 'TS₂',          energy: 74, isTransitionState: true },
      { label: 'Products',     energy: 18 },
    ],
  },

  // ── 15. Benzyne Mechanism ───────────────────────────────────────────────────
  {
    id: 'benzyne',
    category: 'aromatic',
    name: 'Benzyne (Aryne) Mechanism',
    summary: 'Strong base (NaNH₂) removes a ring H adjacent to a leaving group, generating benzyne — a strained triple bond in the ring. Nucleophiles add to either end of the triple bond, giving a mixture of regioisomers.',
    reactants: 'Halobenzene + NaNH₂',
    products: 'Aniline (mixture of regioisomers if substituted)',
    conditions: 'NaNH₂ (sodamide), liquid NH₃ or THF; very strong base required',
    reactantSpecies: {
      text: 'Halobenzene + NaNH₂',
      species: [
        { smiles: 'Clc1ccccc1', label: 'Chlorobenzene' },
        { smiles: '[NH2-].[Na+]', label: 'NaNH₂', showLonePairs: true },
      ],
    },
    productSpecies: {
      text: 'Aniline (mixture of regioisomers if substituted)',
      species: [
        { smiles: 'Nc1ccccc1', label: 'Aniline' },
      ],
    },
    conditionSpecies: {
      text: 'NaNH₂ (sodamide), liquid NH₃ or THF; very strong base required',
      species: [
        { smiles: '[NH2-].[Na+]', label: 'NaNH₂' },
        { smiles: 'N', label: 'liq. NH₃', catalyst: true },
      ],
    },
    reactionType: 'substitution',
    regiochemistry: null,
    stereochemistry: null,
    intermediate: null,
    importantInfo: [
      'Benzyne (1,2-didehydrobenzene): 6-membered ring with a formal triple bond — extremely reactive',
      'The ortho H adjacent to LG is removed first (E2-like elimination)',
      'Then LG leaves, generating the strained triple bond',
      'Nucleophile (NH₂⁻) can add to either end of the triple bond → 2 products (regioisomers) if the ring is unsymmetrical',
      'Evidence: isotope labeling shows scrambling when using ArF (50/50 addition)',
    ],
    brownRef: 'Ch 22.11',
    relatedReactions: ['snar', 'e2'],
    tags: ['benzyne', 'aryne', 'NaNH₂', 'elimination', 'triple bond', 'regioisomers'],
    frames: [
      // Cl on b1 (top), H on b6 (upper-left), base (NaNH₂) approaching b6
      {
        atoms: [
          ...ringAtoms(),
          mk('cl',   'Cl',      350,  45, { role: 'leaving_group' }),
          mk('h_b6', 'H',       232, 100),
          mk('base', 'NaNH₂',  140, 145, { role: 'base' }),
        ],
        bonds: [
          ...aromaticBonds(),
          bd('b1-cl',  'b1', 'cl',  1),
          bd('b6-h',   'b6', 'h_b6',1),
        ],
        arrows: [{
          from: { kind: 'atom', id: 'base' },
          to:   { kind: 'bond', id: 'b6-h' },
          color: 'var(--c-halogen)',
        }],
        description: 'Halobenzene: Cl at b1, H at b6 (ortho). NaNH₂ (very strong base) removes the ortho H adjacent to the leaving group (E2-like concerted process). Cl will depart simultaneously.',
        shortLabel: 'Halobenzene + base',
      },
      {
        atoms: ringAtoms(),
        bonds: [
          ...aromaticBonds().filter(b => b.id !== 'b6-b1'),
          bd('b6-b1', 'b6', 'b1', 3),
        ],
        arrows: [{
          from: { kind: 'atom', id: 'b6' },
          to:   { kind: 'atom', id: 'b5' },
          color: 'var(--c-alkali)',
          bow: 1,
        }],
        description: 'Benzyne (1,2-didehydrobenzene): an extremely reactive strained intermediate with a formal b6–b1 triple bond inside the ring. NH₂⁻ can add to EITHER end → mixture of regioisomers on unsymmetrical benzynes.',
        shortLabel: 'Benzyne',
      },
      {
        atoms: [
          ...ringAtoms(),
          mk('nh2', 'NH₂', 232, 100),
        ],
        bonds: [
          ...aromaticBonds(),
          bd('b6-nh2', 'b6', 'nh2', 1),
        ],
        arrows: [],
        description: 'NH₂⁻ adds to b6 end of the triple bond (could also add to b1 → 50/50 scrambling on symmetrical benzyne). Aromaticity restored. Product: aniline. Isotope-labeling experiments confirmed the benzyne mechanism.',
        shortLabel: 'Aniline',
      },
    ],
    energyDiagram: [
      { label: 'Reactants', energy: 45 },
      { label: 'Benzyne',   energy: 100 },
      { label: 'Products',  energy: 15 },
    ],
  },

  // ── 16. Diels-Alder ─────────────────────────────────────────────────────────
  {
    id: 'diels-alder',
    category: 'pericyclic',
    name: 'Diels-Alder Reaction',
    summary: 'A [4+2] cycloaddition: an electron-rich diene in s-cis conformation reacts with an electron-poor dienophile in a concerted, one-step process. Forms a 6-membered ring with predictable stereo- and regiochemistry.',
    reactants: 'Diene (s-cis) + dienophile',
    products: '6-membered ring (cyclohexene derivative)',
    conditions: 'Typically heat; electron-poor dienophile (EWG on C=C); diene must adopt s-cis; may use Lewis acid catalyst',
    reactantSpecies: {
      text: 'Diene (s-cis) + dienophile',
      species: [
        { smiles: 'C=CC=C', label: 'Diene (s-cis)' },
        { smiles: 'C=CC=O', label: 'Dienophile (with EWG)' },
      ],
    },
    productSpecies: {
      text: 'Cyclohexene (bicyclic if cyclic diene)',
      species: [
        { smiles: 'C1=CCCCC1', label: 'Cyclohexene' },
      ],
    },
    conditionSpecies: {
      text: 'Typically heat; electron-poor dienophile (EWG on C=C); diene must adopt s-cis; may use Lewis acid catalyst',
      species: [
        { smiles: '[Al](Cl)(Cl)Cl', label: 'AlCl₃ (optional Lewis acid)', catalyst: true },
      ],
    },
    reactionType: 'pericyclic',
    regiochemistry: null,
    stereochemistry: 'syn',
    intermediate: null,
    importantInfo: [
      'Concerted [4+2]: all bonds form/break simultaneously (no intermediates, no radicals)',
      's-cis conformation required: locked dienes (cyclopentadiene) react faster',
      'Electron-rich diene + electron-poor dienophile (normal demand DA): EWG on dienophile accelerates',
      'Syn addition to BOTH components: endo/exo and cis/trans relationships are predictable',
      'Endo rule: kinetically preferred; EWG on dienophile orients endo (toward diene in TS)',
      'Reversible: retro-Diels-Alder at high T; used to release strained alkene intermediates',
    ],
    brownRef: 'Ch 20.3',
    relatedReactions: [],
    tags: ['pericyclic', 'Diels-Alder', '[4+2]', 'cycloaddition', 'concerted', 'endo', 'syn', 'ring formation'],
    reversible: true,
    frames: [
      // Diene s-cis above, dienophile below, facing each other
      {
        atoms: [
          // Diene (s-cis): c1=c2-c3=c4 arched above dienophile
          mk('c1', 'C', 155, 215, { role: 'alpha_carbon' }),
          mk('c2', 'C', 240, 150),
          mk('c3', 'C', 340, 150),
          mk('c4', 'C', 425, 215, { role: 'alpha_carbon' }),
          mk('hd1','H', 100, 245),
          mk('hd4','H', 480, 245),
          // Dienophile: ca=cb + EWG
          mk('ca', 'C', 240, 295),
          mk('cb', 'C', 340, 295),
          mk('ewg','CHO',410, 265, { label: 'EWG', role: 'electrophile' }),
        ],
        bonds: [
          bd('c1-c2',  'c1', 'c2', 2),
          bd('c2-c3',  'c2', 'c3', 1),
          bd('c3-c4',  'c3', 'c4', 2),
          bd('c1-hd1', 'c1', 'hd1',1),
          bd('c4-hd4', 'c4', 'hd4',1),
          bd('ca-cb',  'ca', 'cb', 2),
          bd('cb-ewg', 'cb', 'ewg',1),
        ],
        arrows: [
          { from: { kind: 'bond', id: 'c1-c2' }, to: { kind: 'atom', id: 'ca' }, color: 'var(--c-alkali)' },
          { from: { kind: 'bond', id: 'c3-c4' }, to: { kind: 'atom', id: 'cb' }, color: 'var(--c-alkali)', bow: 1 },
        ],
        description: 'Diene in s-cis conformation (required geometry) faces the dienophile. Curved arrows show the concerted electron flow: both terminal diene carbons (c1, c4) simultaneously form new bonds to the dienophile.',
        shortLabel: 'Diene + dienophile',
      },
      // Cyclohexene product ring
      {
        atoms: [
          mk('c2', 'C',  235, 178),
          mk('c3', 'C',  330, 140),
          mk('c4', 'C',  425, 178),
          mk('cb', 'C',  425, 265),
          mk('ca', 'C',  330, 300),
          mk('c1', 'C',  235, 265),
          mk('ewg','CHO',505, 235, { label: 'EWG' }),
        ],
        bonds: [
          bd('c2-c3', 'c2', 'c3', 2),
          bd('c3-c4', 'c3', 'c4', 1),
          bd('c4-cb', 'c4', 'cb', 1),
          bd('cb-ca', 'cb', 'ca', 1),
          bd('ca-c1', 'ca', 'c1', 1),
          bd('c1-c2', 'c1', 'c2', 1),
          bd('cb-ewg','cb', 'ewg',1),
        ],
        arrows: [],
        description: 'Cyclohexene product. The [4+2] is concerted — no intermediate. New bonds: c1–ca and c4–cb (σ). The diene c2=c3 central bond becomes the ring double bond. Syn addition: all stereochemistry is predictable.',
        shortLabel: 'Cyclohexene',
      },
    ],
    energyDiagram: [
      { label: 'Diene + dienophile', energy: 55 },
      { label: 'TS ([4+2])',         energy: 78, isTransitionState: true },
      { label: 'Cyclohexene',        energy: 15 },
    ],
  },
]
