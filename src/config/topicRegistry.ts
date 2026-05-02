// Single source of truth for the app's topic hierarchy: Unit → Section → Topic.
// Each Topic carries the URL tab/param values that belong to it, enabling tab-level
// visibility control without duplicating routing logic here.

export type UnitId =
  | 'measurement'
  | 'molar'
  | 'stoichiometry'
  | 'empirical'
  | 'ideal-gas'
  | 'thermochemistry'
  | 'atomic'
  | 'bonding'
  | 'redox'
  | 'kinetics'
  | 'equilibrium'
  | 'acid-base'
  | 'buffers-ksp'
  | 'thermodynamics'
  | 'nuclear'
  | 'organic'

export type SectionId =
  | 'math-tools'
  | 'molar-basics'
  | 'molar-colligative'
  | 'stoich-basics'
  | 'stoich-core'
  | 'stoich-advanced'
  | 'formula-types'
  | 'gas-laws'
  | 'real-gas'
  | 'thermo-energy'
  | 'thermo-heat-phase'
  | 'thermo-phase-behavior'
  | 'electron-config'
  | 'atomic-properties'
  | 'lewis-bonding'
  | 'molecular-geometry'
  | 'redox-reactions'
  | 'electrochemistry'
  | 'rate-laws'
  | 'integrated-rates'
  | 'equilibrium-basics'
  | 'equilibrium-calculations'
  | 'ph-basics'
  | 'weak-acid-base'
  | 'salt-hydrolysis'
  | 'buffer-systems'
  | 'titration-curves'
  | 'solubility-product'
  | 'entropy'
  | 'gibbs-energy'
  | 'nuclear-reactions'
  | 'nuclear-applications'
  | 'hydrocarbons'
  | 'functional-groups'

export interface Unit {
  id: UnitId
  label: string
  route: string
  sections: SectionId[]
}

export interface Section {
  id: SectionId
  label: string
  unitId: UnitId
}

export interface Topic {
  id: string
  label: string
  sectionId: SectionId
  // URL tab/topic param values that map to this topic. A value listed in
  // multiple topics means "visible if ANY owner is visible" (see isTabHidden).
  tabs: string[]
}

// ── Units ─────────────────────────────────────────────────────────────────────

export const UNITS: Unit[] = [
  {
    id: 'measurement',
    label: 'Measurement & Math',
    route: '/base-calculations',
    sections: ['math-tools'],
  },
  {
    id: 'molar',
    label: 'Molar Calculations',
    route: '/molar',
    sections: ['molar-basics', 'molar-colligative'],
  },
  {
    id: 'stoichiometry',
    label: 'Stoichiometry',
    route: '/stoichiometry',
    sections: ['stoich-basics', 'stoich-core', 'stoich-advanced'],
  },
  {
    id: 'empirical',
    label: 'Empirical Formulas',
    route: '/empirical',
    sections: ['formula-types'],
  },
  {
    id: 'ideal-gas',
    label: 'Ideal Gas Laws',
    route: '/ideal-gas',
    sections: ['gas-laws', 'real-gas'],
  },
  {
    id: 'thermochemistry',
    label: 'Thermochemistry',
    route: '/thermochemistry',
    sections: ['thermo-energy', 'thermo-heat-phase', 'thermo-phase-behavior'],
  },
  {
    id: 'atomic',
    label: 'Atomic Structure',
    route: '/electron-config',
    sections: ['electron-config', 'atomic-properties'],
  },
  {
    id: 'bonding',
    label: 'Chemical Bonding',
    route: '/structures',
    sections: ['lewis-bonding', 'molecular-geometry'],
  },
  {
    id: 'redox',
    label: 'Redox & Electrochemistry',
    route: '/redox',
    sections: ['redox-reactions', 'electrochemistry'],
  },
  {
    id: 'kinetics',
    label: 'Chemical Kinetics',
    route: '/kinetics',
    sections: ['rate-laws', 'integrated-rates'],
  },
  {
    id: 'equilibrium',
    label: 'Chemical Equilibrium',
    route: '/equilibrium',
    sections: ['equilibrium-basics', 'equilibrium-calculations'],
  },
  {
    id: 'acid-base',
    label: 'Acids & Bases',
    route: '/acid-base',
    sections: ['ph-basics', 'weak-acid-base', 'salt-hydrolysis'],
  },
  {
    id: 'buffers-ksp',
    label: 'Buffers & Solubility',
    route: '/buffers',
    sections: ['buffer-systems', 'titration-curves', 'solubility-product'],
  },
  {
    id: 'thermodynamics',
    label: 'Thermodynamics',
    route: '/thermodynamics',
    sections: ['entropy', 'gibbs-energy'],
  },
  {
    id: 'nuclear',
    label: 'Nuclear Chemistry',
    route: '/nuclear',
    sections: ['nuclear-reactions', 'nuclear-applications'],
  },
  {
    id: 'organic',
    label: 'Organic Chemistry',
    route: '/organic',
    sections: ['hydrocarbons', 'functional-groups'],
  },
]

// ── Sections ──────────────────────────────────────────────────────────────────

export const SECTIONS: Section[] = [
  { id: 'math-tools',           label: 'Math Tools',        unitId: 'measurement'   },
  { id: 'molar-basics',         label: 'Molar Basics',      unitId: 'molar'         },
  { id: 'molar-colligative',    label: 'Colligative Props', unitId: 'molar'         },
  { id: 'stoich-basics',        label: 'Basics',            unitId: 'stoichiometry' },
  { id: 'stoich-core',          label: 'Stoichiometry',     unitId: 'stoichiometry' },
  { id: 'stoich-advanced',      label: 'Advanced',          unitId: 'stoichiometry' },
  { id: 'formula-types',        label: 'Formula Types',     unitId: 'empirical'     },
  { id: 'gas-laws',             label: 'Gas Laws',          unitId: 'ideal-gas'     },
  { id: 'real-gas',             label: 'Real Gas',          unitId: 'ideal-gas'     },
  { id: 'thermo-energy',        label: 'Energy',            unitId: 'thermochemistry' },
  { id: 'thermo-heat-phase',    label: 'Heat & Phase',      unitId: 'thermochemistry' },
  { id: 'thermo-phase-behavior', label: 'Phase Behavior',   unitId: 'thermochemistry' },
  { id: 'electron-config',      label: 'Electron Config',   unitId: 'atomic'        },
  { id: 'atomic-properties',    label: 'Atomic Properties', unitId: 'atomic'        },
  { id: 'lewis-bonding',        label: 'Lewis & Bonding',   unitId: 'bonding'       },
  { id: 'molecular-geometry',   label: 'Geometry & Solids', unitId: 'bonding'       },
  { id: 'redox-reactions',      label: 'Reactions',         unitId: 'redox'         },
  { id: 'electrochemistry',     label: 'Electrochemistry',  unitId: 'redox'         },
  { id: 'rate-laws',                label: 'Rate Laws',         unitId: 'kinetics'      },
  { id: 'integrated-rates',        label: 'Integrated Rates',  unitId: 'kinetics'      },
  { id: 'equilibrium-basics',       label: 'Concepts',          unitId: 'equilibrium'   },
  { id: 'equilibrium-calculations', label: 'Calculations',      unitId: 'equilibrium'   },
  { id: 'ph-basics',          label: 'pH Fundamentals',    unitId: 'acid-base'   },
  { id: 'weak-acid-base',    label: 'Weak Acid / Base',   unitId: 'acid-base'   },
  { id: 'salt-hydrolysis',   label: 'Salts & Polyprotic', unitId: 'acid-base'   },
  { id: 'buffer-systems',     label: 'Buffers',            unitId: 'buffers-ksp' },
  { id: 'titration-curves',   label: 'Titration Curves',   unitId: 'buffers-ksp' },
  { id: 'solubility-product', label: 'Solubility (Ksp)',   unitId: 'buffers-ksp' },
  { id: 'entropy',            label: 'Entropy',            unitId: 'thermodynamics' },
  { id: 'gibbs-energy',       label: 'Gibbs Energy',       unitId: 'thermodynamics' },
  { id: 'nuclear-reactions',    label: 'Nuclear Reactions', unitId: 'nuclear' },
  { id: 'nuclear-applications', label: 'Applications',      unitId: 'nuclear' },
  { id: 'hydrocarbons',         label: 'Hydrocarbons',      unitId: 'organic' },
  { id: 'functional-groups',    label: 'Functional Groups', unitId: 'organic' },
]

// ── Topics ────────────────────────────────────────────────────────────────────
// tabs[] lists every URL tab/topic param value that belongs to this topic.
// Shared tab values (e.g. 'practice', 'ref-reaction-types') appear in multiple
// topics — a tab is visible if ANY of its owning topics is visible.

export const TOPICS: Topic[] = [

  // ── Measurement & Math ────────────────────────────────────────────────────
  { id: 'sig-figs',           label: 'Significant Figures',  sectionId: 'math-tools', tabs: ['sig-figs'] },
  { id: 'unit-conversions',   label: 'Unit Conversions',     sectionId: 'math-tools', tabs: ['conversions'] },
  { id: 'scientific-notation', label: 'Scientific Notation', sectionId: 'math-tools', tabs: ['sci-notation'] },
  { id: 'percent-error',      label: 'Percent Error',        sectionId: 'math-tools', tabs: ['percent-error'] },

  // ── Molar Basics ─────────────────────────────────────────────────────────
  // 'practice' is the shared problems-tab entry point for moles/molarity/molality/molar-volume/colligative
  { id: 'moles-calc',   label: 'Moles',         sectionId: 'molar-basics', tabs: ['moles',    'ref-moles',    'practice'] },
  { id: 'molarity',     label: 'Molarity',      sectionId: 'molar-basics', tabs: ['molarity', 'ref-molarity', 'practice'] },
  { id: 'molality',     label: 'Molality',      sectionId: 'molar-basics', tabs: ['molality', 'ref-molality', 'practice'] },
  { id: 'molar-volume', label: 'Molar Volume',  sectionId: 'molar-basics', tabs: ['molar-volume', 'ref-molar-volume', 'practice'] },
  // 'ref-other' is shared by conc-converter and percent-comp; 'conc-practice' shared by dilution and conc-converter
  { id: 'dilution',      label: 'Dilution',        sectionId: 'molar-basics', tabs: ['dilution',      'ref-dilution', 'conc-practice'] },
  { id: 'conc-converter', label: 'Conc. Converter', sectionId: 'molar-basics', tabs: ['conc-converter', 'ref-other',   'conc-practice'] },
  { id: 'percent-comp',  label: 'Percent Composition', sectionId: 'molar-basics', tabs: ['percent-comp', 'ref-other', 'perc-comp-practice'] },

  // ── Colligative Properties ────────────────────────────────────────────────
  { id: 'colligative-bpe', label: 'BP Elevation',   sectionId: 'molar-colligative', tabs: ['colligative-bpe', 'ref-colligative-bpe', 'practice'] },
  { id: 'colligative-fpd', label: 'FP Depression',  sectionId: 'molar-colligative', tabs: ['colligative-fpd', 'ref-colligative-fpd', 'practice'] },

  // ── Stoichiometry Basics ──────────────────────────────────────────────────
  { id: 'percent-yield', label: 'Percent Yield',    sectionId: 'stoich-basics', tabs: ['percent', 'percent-problems', 'ref-percent'] },
  { id: 'balancing',     label: 'Balancing Equations', sectionId: 'stoich-basics', tabs: ['balance-practice', 'balance', 'ref-balance'] },

  // ── Stoichiometry Core ────────────────────────────────────────────────────
  // 'practice' is also used as the stoich problems tab; shared with molar 'practice' above
  { id: 'stoich-calc',      label: 'Stoichiometry',      sectionId: 'stoich-core', tabs: ['stoich', 'practice', 'ref-stoich'] },
  { id: 'limiting-reagent', label: 'Limiting Reagent',   sectionId: 'stoich-core', tabs: ['limiting', 'limiting-problems', 'ref-limiting'] },
  { id: 'theoretical-yield', label: 'Theoretical Yield', sectionId: 'stoich-core', tabs: ['theoretical', 'theoretical-problems', 'ref-theoretical'] },
  { id: 'mol-diagram',      label: 'Molecular Diagrams', sectionId: 'stoich-core', tabs: ['mol-diagram', 'mol-diagram-problems'] },

  // ── Stoichiometry Advanced ────────────────────────────────────────────────
  { id: 'advanced-percent',  label: 'Advanced % Yield',   sectionId: 'stoich-advanced', tabs: ['adv-percent', 'adv-percent-problems', 'ref-adv-percent'] },
  { id: 'chained-yield',     label: 'Chained Yield',      sectionId: 'stoich-advanced', tabs: ['chained-yield', 'chained-yield-problems', 'ref-chained-yield'] },
  { id: 'solution-stoich',   label: 'Solution Stoich',    sectionId: 'stoich-advanced', tabs: ['solution', 'solution-practice', 'ref-solution'] },
  // 'gas-stoich' appears in both StoichiometryPage (problems) and IdealGasPage (problems)
  { id: 'gas-stoich-topic',  label: 'Gas Stoichiometry',  sectionId: 'stoich-advanced', tabs: ['gas-stoich-practice', 'gas-stoich', 'ref-gas-stoich'] },

  // ── Empirical Formulas ────────────────────────────────────────────────────
  { id: 'empirical-formula', label: 'Empirical / Molecular', sectionId: 'formula-types', tabs: ['empirical'] },
  { id: 'hydrate',           label: 'Hydrates',              sectionId: 'formula-types', tabs: ['hydrate'] },

  // ── Gas Laws ─────────────────────────────────────────────────────────────
  // 'gas-stoich' shared with gas-stoich-topic above; 'ref-combined' is the combined gas law reference
  { id: 'ideal-gas-law',     label: 'Ideal Gas Law (PV=nRT)', sectionId: 'gas-laws', tabs: ['solver', 'pvnrt-problems', 'gas-stoich', 'ref-combined'] },
  { id: 'daltons-law',       label: "Dalton's Law",           sectionId: 'gas-laws', tabs: ['daltons', 'daltons-problems', 'ref-daltons'] },
  { id: 'grahams-law',       label: "Graham's Law",           sectionId: 'gas-laws', tabs: ['grahams', 'grahams-problems', 'ref-grahams'] },
  { id: 'gas-density',       label: 'Gas Density',            sectionId: 'gas-laws', tabs: ['gas-density', 'density-problems', 'ref-density'] },

  // ── Real Gas ─────────────────────────────────────────────────────────────
  { id: 'van-der-waals',       label: 'Van der Waals',       sectionId: 'real-gas', tabs: ['vdw', 'vdw-problems', 'ref-vdw'] },
  { id: 'maxwell-boltzmann',   label: 'Maxwell-Boltzmann',   sectionId: 'real-gas', tabs: ['ref-maxwell'] },

  // ── Thermochemistry Energy ────────────────────────────────────────────────
  { id: 'calorimetry',    label: 'Calorimetry',         sectionId: 'thermo-energy', tabs: ['calorimetry',    'calorimetry-practice',  'calorimetry-reference']  },
  { id: 'enthalpy-rxn',   label: 'Enthalpy of Reaction', sectionId: 'thermo-energy', tabs: ['enthalpy',      'enthalpy-practice',     'enthalpy-reference']     },
  { id: 'hess-law',       label: "Hess's Law",           sectionId: 'thermo-energy', tabs: ['hess',          'hess-practice',         'hess-reference']         },
  { id: 'bond-enthalpy',  label: 'Bond Enthalpy',        sectionId: 'thermo-energy', tabs: ['bond',          'bond-practice',         'bond-reference']         },
  { id: 'expansion-work', label: 'Expansion Work',       sectionId: 'thermo-energy', tabs: ['expansion-work', 'expansion-work-reference'] },

  // ── Heat & Phase Changes ──────────────────────────────────────────────────
  { id: 'reaction-profiles', label: 'Reaction Profiles', sectionId: 'thermo-heat-phase', tabs: ['profile', 'profile-reference', 'profile-practice', 'profile-problems'] },
  { id: 'heat-transfer',     label: 'Heat Transfer',     sectionId: 'thermo-heat-phase', tabs: ['heattransfer', 'heattransfer-practice', 'heattransfer-reference'] },
  { id: 'heating-curves',    label: 'Heating Curves',    sectionId: 'thermo-heat-phase', tabs: ['heating-curve', 'heating-curve-problems', 'heating-curve-reference', 'energy-balance', 'energy-balance-problems'] },

  // ── Phase Behavior ────────────────────────────────────────────────────────
  { id: 'phase-diagrams',     label: 'Phase Diagrams',    sectionId: 'thermo-phase-behavior', tabs: ['phase-diagram', 'phase-diagram-problems', 'phase-diagram-reference', 'liquid-props'] },
  { id: 'vapor-pressure',     label: 'Vapor Pressure',    sectionId: 'thermo-phase-behavior', tabs: ['vapor-pressure', 'vapor-pressure-reference'] },
  { id: 'clausius-clapeyron', label: 'Clausius-Clapeyron', sectionId: 'thermo-phase-behavior', tabs: ['cc', 'cc-practice', 'cc-reference'] },

  // ── Electron Configuration ────────────────────────────────────────────────
  // ElectronConfigPage uses ?topic= param; values use underscores
  { id: 'electron-configuration', label: 'Electron Config',  sectionId: 'electron-config', tabs: ['electron_config'] },
  { id: 'quantum-numbers',        label: 'Quantum Numbers',  sectionId: 'electron-config', tabs: ['quantum_numbers'] },
  { id: 'energy-levels',          label: 'Energy Levels',    sectionId: 'electron-config', tabs: ['energy_levels']   },
  { id: 'multi-electron',         label: 'Multi-Electron',   sectionId: 'electron-config', tabs: ['multi_electron']  },

  // ── Atomic Properties ─────────────────────────────────────────────────────
  { id: 'periodic-trends',   label: 'Periodic Trends',    sectionId: 'atomic-properties', tabs: ['periodic_trends'] },
  { id: 'isoelectronic',     label: 'Isoelectronic',      sectionId: 'atomic-properties', tabs: ['isoelectronic']   },
  { id: 'em-spectrum',       label: 'EM Spectrum',        sectionId: 'atomic-properties', tabs: ['em_spectrum']     },
  { id: 'isotope-abundance', label: 'Isotope Abundance',  sectionId: 'atomic-properties', tabs: ['isotopes']        },
  { id: 'nomenclature',      label: 'Naming Rules',       sectionId: 'atomic-properties', tabs: ['naming']          },

  // ── Lewis & Bonding ───────────────────────────────────────────────────────
  // 'lewis' reference tab is shared by lewis-structures and formal-charge
  { id: 'lewis-structures', label: 'Lewis Structures', sectionId: 'lewis-bonding', tabs: ['lewis', 'lewis-practice', 'lewis-draw'] },
  { id: 'formal-charge',    label: 'Formal Charge',    sectionId: 'lewis-bonding', tabs: ['lewis', 'formal-charge', 'formal-charge-problems'] },
  { id: 'sigma-pi',         label: 'σ / π Bonds',      sectionId: 'lewis-bonding', tabs: ['sigma-pi-ref', 'sigma-pi', 'sigma-pi-problems'] },

  // ── Molecular Geometry & Solids ───────────────────────────────────────────
  { id: 'vsepr',       label: 'VSEPR',        sectionId: 'molecular-geometry', tabs: ['vsepr', 'vsepr-practice', 'vsepr-draw'] },
  { id: 'solid-types', label: 'Solid Types',  sectionId: 'molecular-geometry', tabs: ['solid-types', 'solid-types-practice', 'solid-types-problems'] },
  { id: 'unit-cell',   label: 'Unit Cell',    sectionId: 'molecular-geometry', tabs: ['unit-cell', 'unit-cell-practice', 'unit-cell-problems'] },

  // ── Redox Reactions ───────────────────────────────────────────────────────
  // 'ref-reaction-types' shared by rxn-classifier, net-ionic, rxn-predictor
  { id: 'rxn-classifier',   label: 'Rxn Classifier',    sectionId: 'redox-reactions', tabs: ['classifier', 'classifier-problems', 'ref-reaction-types'] },
  { id: 'net-ionic',        label: 'Net Ionic',          sectionId: 'redox-reactions', tabs: ['net-ionic',  'net-ionic-problems',  'ref-reaction-types'] },
  { id: 'rxn-predictor',    label: 'Rxn Predictor',      sectionId: 'redox-reactions', tabs: ['predictor',  'rxn-practice',        'ref-reaction-types'] },
  { id: 'activity-series',  label: 'Activity Series',    sectionId: 'redox-reactions', tabs: ['activity',   'activity-problems',   'ref-activity']       },
  { id: 'oxidation-states', label: 'Oxidation States',   sectionId: 'redox-reactions', tabs: ['ref-oxidation']   },
  { id: 'acids-bases',      label: 'Acids & Bases',      sectionId: 'redox-reactions', tabs: ['ref-acids-bases'] },

  // ── Electrochemistry ─────────────────────────────────────────────────────
  // 'practice' is the redox problems-tab entry; shared across pages but non-confusable in context
  { id: 'redox-balance',      label: 'Redox (Balancing)',   sectionId: 'electrochemistry', tabs: ['redox-practice', 'practice', 'ref-redox-concepts'] },
  { id: 'ecell-nernst',       label: 'E°cell / Nernst',    sectionId: 'electrochemistry', tabs: ['ecell', 'ecell-practice', 'ref-ecell'] },
  { id: 'electrolyte',        label: 'Electrolytes',        sectionId: 'electrochemistry', tabs: ['electrolyte', 'electrolyte-problems'] },
  { id: 'titration',          label: 'Titration',           sectionId: 'electrochemistry', tabs: ['titration', 'titration-problems', 'ref-titration'] },
  { id: 'delta-g-ecell-k',    label: 'ΔG°-E°-K Triangle',  sectionId: 'electrochemistry', tabs: ['dg-e-k', 'dg-e-k-practice', 'dg-e-k-problems', 'ref-dg-e-k'] },
  { id: 'electrolysis',       label: 'Electrolysis',        sectionId: 'electrochemistry', tabs: ['electrolysis', 'electrolysis-practice', 'electrolysis-problems', 'ref-electrolysis'] },
  { id: 'concentration-cell', label: 'Concentration Cells', sectionId: 'electrochemistry', tabs: ['conc-cell', 'conc-cell-practice', 'ref-conc-cell'] },

  // ── Chemical Kinetics ─────────────────────────────────────────────────────
  { id: 'rate-law',        label: 'Rate Law (Initial Rates)', sectionId: 'rate-laws',        tabs: ['rate-law', 'rate-law-practice', 'rate-law-problems', 'ref-rate-law'] },
  { id: 'arrhenius',       label: 'Arrhenius Equation',       sectionId: 'rate-laws',        tabs: ['arrhenius', 'arrhenius-practice', 'arrhenius-problems', 'ref-arrhenius'] },
  { id: 'integrated-rate', label: 'Integrated Rate Laws',     sectionId: 'integrated-rates', tabs: ['integrated', 'integrated-practice', 'integrated-problems', 'ref-integrated'] },
  { id: 'half-life',       label: 'Half-Life',                sectionId: 'integrated-rates', tabs: ['half-life', 'half-life-practice', 'half-life-problems', 'ref-half-life'] },
  { id: 'mechanisms',      label: 'Reaction Mechanisms',      sectionId: 'integrated-rates', tabs: ['mechanisms', 'mechanisms-practice', 'ref-mechanisms'] },

  // ── Chemical Equilibrium ──────────────────────────────────────────────────
  { id: 'keq-expression', label: 'K Expression',   sectionId: 'equilibrium-basics',       tabs: ['keq-expression', 'keq-practice', 'keq-problems', 'ref-keq'] },
  { id: 'q-vs-k',         label: 'Q vs K',          sectionId: 'equilibrium-basics',       tabs: ['q-vs-k', 'q-vs-k-practice', 'q-vs-k-problems', 'ref-q-vs-k'] },
  { id: 'le-chatelier',   label: "Le Chatelier's",  sectionId: 'equilibrium-basics',       tabs: ['le-chatelier', 'le-chatelier-practice', 'ref-le-chatelier'] },
  { id: 'ice-table',      label: 'ICE Table',        sectionId: 'equilibrium-calculations', tabs: ['ice-table', 'ice-table-practice', 'ice-table-problems', 'ref-ice-table'] },
  { id: 'kp-kc',          label: 'Kp \u2194 Kc',    sectionId: 'equilibrium-calculations', tabs: ['kp-kc', 'kp-kc-practice', 'kp-kc-problems', 'ref-kp-kc'] },

  // ── Acids & Bases ────────────────────────────────────────────────────────────
  // ── Buffers & Solubility ─────────────────────────────────────────────────────
  { id: 'buffer-ph',       label: 'Buffer pH',          sectionId: 'buffer-systems',     tabs: ['buffer', 'buffer-practice', 'buffer-problems', 'ref-buffer'] },
  { id: 'buffer-capacity', label: 'Buffer Capacity',    sectionId: 'buffer-systems',     tabs: ['buffer-capacity', 'buffer-cap-practice', 'ref-buffer-cap'] },
  { id: 'titration-curve', label: 'Titration Curves',   sectionId: 'titration-curves',   tabs: ['titration-curve', 'titration-curve-practice', 'ref-titration-curve'] },
  { id: 'ksp',             label: 'Solubility Product', sectionId: 'solubility-product', tabs: ['ksp', 'ksp-practice', 'ksp-problems', 'ref-ksp'] },
  { id: 'common-ion',      label: 'Common Ion Effect',  sectionId: 'solubility-product', tabs: ['common-ion', 'common-ion-practice', 'ref-common-ion'] },
  { id: 'precipitation',   label: 'Precipitation',      sectionId: 'solubility-product', tabs: ['precipitation', 'precipitation-practice', 'precipitation-problems', 'ref-precipitation'] },

  // ── Acids & Bases ────────────────────────────────────────────────────────────
  // ── Thermodynamics (Entropy & Gibbs) ─────────────────────────────────────────
  { id: 'entropy-calc',      label: 'ΔS° Calculation',   sectionId: 'entropy',      tabs: ['entropy', 'entropy-practice', 'entropy-problems', 'ref-entropy'] },
  { id: 'spontaneity',       label: 'Spontaneity',        sectionId: 'entropy',      tabs: ['spontaneity', 'spontaneity-practice', 'ref-spontaneity'] },
  { id: 'gibbs-calc',        label: 'ΔG° Calculation',    sectionId: 'gibbs-energy', tabs: ['gibbs', 'gibbs-practice', 'gibbs-problems', 'ref-gibbs'] },
  { id: 'gibbs-equilibrium', label: 'ΔG° ↔ K',           sectionId: 'gibbs-energy', tabs: ['gibbs-k', 'gibbs-k-practice', 'gibbs-k-problems', 'ref-gibbs-k'] },
  { id: 'gibbs-temperature', label: 'ΔG vs Temperature',  sectionId: 'gibbs-energy', tabs: ['gibbs-temp', 'gibbs-temp-practice', 'ref-gibbs-temp'] },

  // ── Acids & Bases ────────────────────────────────────────────────────────────
  { id: 'ph-calculator', label: 'pH Calculator',    sectionId: 'ph-basics',       tabs: ['ph-calc', 'ph-problems', 'ref-ph'] },
  { id: 'ka-kb',         label: 'Ka / Kb',          sectionId: 'ph-basics',       tabs: ['ka-kb', 'ka-kb-problems', 'ref-ka-kb'] },
  { id: 'weak-acid',     label: 'Weak Acid pH',     sectionId: 'weak-acid-base',  tabs: ['weak-acid', 'weak-acid-problems', 'ref-weak-acid'] },
  { id: 'weak-base',     label: 'Weak Base pH',     sectionId: 'weak-acid-base',  tabs: ['weak-base', 'weak-base-problems', 'ref-weak-base'] },
  { id: 'salt-ph',       label: 'Salt pH',          sectionId: 'salt-hydrolysis', tabs: ['salt-ph', 'salt-ph-problems', 'ref-salt-ph'] },
  { id: 'polyprotic',    label: 'Polyprotic Acids', sectionId: 'salt-hydrolysis', tabs: ['polyprotic', 'ref-polyprotic'] },

  // ── Nuclear Chemistry ──────────────────────────────────────────────────────
  { id: 'nuclear-decay',     label: 'Nuclear Decay',      sectionId: 'nuclear-reactions',    tabs: ['decay', 'decay-problems', 'ref-decay']                          },
  { id: 'nuclear-half-life', label: 'Half-Life',           sectionId: 'nuclear-reactions',    tabs: ['nuclear-half-life', 'nuclear-hl-problems', 'ref-nuclear-hl']    },
  { id: 'binding-energy',    label: 'Binding Energy',      sectionId: 'nuclear-applications', tabs: ['binding', 'binding-problems', 'ref-binding']                    },
  { id: 'nuclear-dating',    label: 'Radiometric Dating',  sectionId: 'nuclear-applications', tabs: ['dating', 'dating-problems', 'ref-dating']                       },

  // ── Organic Chemistry ──────────────────────────────────────────────────────
  { id: 'alkanes-alkenes',     label: 'Alkanes / Alkenes / Alkynes', sectionId: 'hydrocarbons',      tabs: ['hydrocarbons', 'hydrocarbons-problems', 'ref-hydrocarbons'] },
  { id: 'isomers',             label: 'Isomers',                     sectionId: 'hydrocarbons',      tabs: ['isomers', 'isomers-problems', 'ref-isomers']                },
  { id: 'organic-naming',      label: 'IUPAC Naming',                sectionId: 'hydrocarbons',      tabs: ['organic-naming', 'naming-problems', 'ref-organic-naming']  },
  { id: 'functional-group-id', label: 'Functional Groups',           sectionId: 'functional-groups', tabs: ['func-groups', 'func-groups-problems', 'ref-func-groups']   },
  { id: 'organic-reactions',   label: 'Common Reactions',            sectionId: 'functional-groups', tabs: ['organic-rxn', 'organic-rxn-problems', 'ref-organic-rxn']   },
]

// ── Build-time Maps ───────────────────────────────────────────────────────────

const _unitMap    = new Map<UnitId, Unit>(UNITS.map(u => [u.id, u]))
const _sectionMap = new Map<SectionId, Section>(SECTIONS.map(s => [s.id, s]))
const _topicMap   = new Map<string, Topic>(TOPICS.map(t => [t.id, t]))

// tab value → Set of topicIds that own it (a tab may belong to multiple topics)
const _topicTabSet = new Map<string, Set<string>>()
for (const topic of TOPICS) {
  for (const tab of topic.tabs) {
    let set = _topicTabSet.get(tab)
    if (!set) { set = new Set(); _topicTabSet.set(tab, set) }
    set.add(topic.id)
  }
}

// ── Public Getters ────────────────────────────────────────────────────────────

export function getUnit(id: UnitId): Unit | undefined { return _unitMap.get(id) }
export function getSection(id: SectionId): Section | undefined { return _sectionMap.get(id) }
export function getTopic(id: string): Topic | undefined { return _topicMap.get(id) }

export function getTopicsForSection(sectionId: SectionId): Topic[] {
  return TOPICS.filter(t => t.sectionId === sectionId)
}

export function getSectionsForUnit(unitId: UnitId): Section[] {
  return SECTIONS.filter(s => s.unitId === unitId)
}

export function getTopicsForUnit(unitId: UnitId): Topic[] {
  const sectionIds = new Set(getSectionsForUnit(unitId).map(s => s.id))
  return TOPICS.filter(t => sectionIds.has(t.sectionId))
}

// ── Visibility Helper ─────────────────────────────────────────────────────────

/**
 * Returns true only if every topic that owns `tabValue` is in `hiddenTopics`.
 * Returns false for unknown tab values (safe default: show unknown tabs).
 */
export function isTabHidden(tabValue: string, hiddenTopics: Set<string>): boolean {
  const owners = _topicTabSet.get(tabValue)
  if (!owners || owners.size === 0) return false
  for (const topicId of owners) {
    if (!hiddenTopics.has(topicId)) return false
  }
  return true
}

/** All topic IDs that own the given tab value. */
export function getTopicsForTab(tabValue: string): Set<string> {
  return _topicTabSet.get(tabValue) ?? new Set()
}
