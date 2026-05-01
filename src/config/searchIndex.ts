// Search index for the nav sidebar.
// TOPIC_SEARCH_ITEMS are filtered by topic visibility from the preferences store.
// TOOL_SEARCH_ITEMS are always shown (tools, standalone pages not tied to a registry topic).

export interface SearchItem {
  label: string
  formula: string
  section: string
  path: string
  keywords?: string
  /** Registry tab/topic param value — undefined means always shown */
  topicTabId?: string
}

export const TOPIC_SEARCH_ITEMS: SearchItem[] = [
  // Base Calculations
  { label: 'Sig Figs',          formula: 'sf',        section: 'Base Calculations',  path: '/base-calculations?tab=sig-figs',      keywords: 'significant figures precision',                                                         topicTabId: 'sig-figs'           },
  { label: 'Sci Notation',      formula: '×10ⁿ',      section: 'Base Calculations',  path: '/base-calculations?tab=sci-notation',  keywords: 'scientific notation powers of ten',                                                     topicTabId: 'sci-notation'       },
  { label: 'Unit Conversions',  formula: '↔',         section: 'Base Calculations',  path: '/base-calculations?tab=conversions',   keywords: 'unit conversion factor label',                                                          topicTabId: 'conversions'        },
  { label: 'Percent Error',     formula: '%err',       section: 'Base Calculations',  path: '/base-calculations?tab=percent-error', keywords: 'percent error experimental error lab error accuracy literature value',                   topicTabId: 'percent-error'      },
  { label: 'Empirical Formula', formula: '⌬',         section: 'Base Calculations',  path: '/empirical',                           keywords: 'empirical molecular formula percent composition combustion analysis burn CO2 H2O',        topicTabId: 'empirical'          },
  { label: 'Hydrate Analysis',  formula: '·nH₂O',    section: 'Base Calculations',  path: '/empirical?tab=hydrate',               keywords: 'hydrate water crystallization formula empirical anhydrous',                              topicTabId: 'hydrate'            },
  // Ideal Gas
  { label: 'Combined Gas Law',  formula: 'P₁V₁/T₁',  section: 'Ideal Gas Law',      path: '/ideal-gas?tab=ref-combined',          keywords: 'boyles charles gay-lussac combined gas law PVT',                                        topicTabId: 'ref-combined'       },
  { label: "Dalton's Law",      formula: 'Ptot',      section: 'Ideal Gas Law',      path: '/ideal-gas?tab=ref-daltons',           keywords: 'dalton partial pressure mixture',                                                       topicTabId: 'ref-daltons'        },
  { label: "Graham's Law",      formula: '√M',        section: 'Ideal Gas Law',      path: '/ideal-gas?tab=ref-grahams',           keywords: 'graham effusion diffusion molar mass rate',                                             topicTabId: 'ref-grahams'        },
  { label: 'Gas Density',       formula: 'ρ=MP/RT',   section: 'Ideal Gas Law',      path: '/ideal-gas?tab=ref-density',           keywords: 'gas density molar mass',                                                                topicTabId: 'ref-density'        },
  { label: 'Van der Waals',     formula: 'vdW',       section: 'Ideal Gas Law',      path: '/ideal-gas?tab=ref-vdw',               keywords: 'van der waals real gas correction a b',                                                 topicTabId: 'ref-vdw'            },
  { label: 'Maxwell-Boltzmann', formula: 'f(v)',      section: 'Ideal Gas Law',      path: '/ideal-gas?tab=ref-maxwell',           keywords: 'maxwell boltzmann speed distribution kinetic',                                          topicTabId: 'ref-maxwell'        },
  // Molar Calculations
  { label: 'Moles',             formula: 'n = m/M',   section: 'Molar Calculations', path: '/calculations?tab=ref-moles',          keywords: 'moles mass molar mass n m M',                                                           topicTabId: 'ref-moles'          },
  { label: 'Molarity',          formula: 'C = n/V',   section: 'Molar Calculations', path: '/calculations?tab=ref-molarity',       keywords: 'molarity concentration solution moles per liter',                                       topicTabId: 'ref-molarity'       },
  { label: 'Molality',          formula: 'b = n/m',   section: 'Molar Calculations', path: '/calculations?tab=ref-molality',       keywords: 'molality concentration moles per kg solvent',                                           topicTabId: 'ref-molality'       },
  { label: 'Molar Volume',      formula: 'Vm',        section: 'Molar Calculations', path: '/calculations?tab=ref-molar-volume',   keywords: 'molar volume STP gas 22.4',                                                             topicTabId: 'ref-molar-volume'   },
  { label: 'Dilution',          formula: 'C₁V₁',     section: 'Molar Calculations', path: '/calculations?tab=ref-dilution',       keywords: 'dilution C1V1 C2V2 concentration volume',                                               topicTabId: 'ref-dilution'       },
  { label: 'BP Elevation',      formula: 'ΔTb',       section: 'Molar Calculations', path: '/calculations?tab=ref-colligative-bpe',keywords: 'boiling point elevation colligative kb',                                                topicTabId: 'ref-colligative-bpe'},
  { label: 'FP Depression',     formula: 'ΔTf',       section: 'Molar Calculations', path: '/calculations?tab=ref-colligative-fpd',keywords: 'freezing point depression colligative kf',                                              topicTabId: 'ref-colligative-fpd'},
  // Atomic / Periodic Table
  { label: 'Electron Config',   formula: 'e⁻',        section: 'Periodic Table',     path: '/electron-config?topic=electron_config', keywords: 'electron configuration orbital spdf paramagnetic diamagnetic unpaired electrons',      topicTabId: 'electron_config'    },
  { label: 'Quantum Numbers',   formula: 'QN',        section: 'Periodic Table',     path: '/electron-config?topic=quantum_numbers', keywords: 'quantum numbers n l ml ms spin',                                                      topicTabId: 'quantum_numbers'    },
  { label: 'Energy Levels',     formula: 'Eₙ',        section: 'Periodic Table',     path: '/electron-config?topic=energy_levels',   keywords: 'energy levels hydrogen Bohr Rydberg',                                                 topicTabId: 'energy_levels'      },
  { label: 'Multi-Electron',    formula: 'Zeff',      section: 'Periodic Table',     path: '/electron-config?topic=multi_electron',  keywords: 'multi electron effective nuclear charge shielding zeff',                              topicTabId: 'multi_electron'     },
  { label: 'Periodic Trends',   formula: '↗',         section: 'Periodic Table',     path: '/electron-config?topic=periodic_trends', keywords: 'periodic trends atomic radius ionization energy electronegativity electron affinity',  topicTabId: 'periodic_trends'    },
  { label: 'Isoelectronic',     formula: '≡',         section: 'Periodic Table',     path: '/electron-config?topic=isoelectronic',   keywords: 'isoelectronic same electrons ions',                                                   topicTabId: 'isoelectronic'      },
  { label: 'EM Spectrum',       formula: 'λf',        section: 'Periodic Table',     path: '/electron-config?topic=em_spectrum',     keywords: 'electromagnetic spectrum wavelength frequency light',                                  topicTabId: 'em_spectrum'        },
  { label: 'Isotope Abundance', formula: 'Ā=Σmf',    section: 'Periodic Table',     path: '/electron-config?topic=isotopes',                keywords: 'isotope abundance weighted average atomic mass natural percent',               topicTabId: 'isotopes'           },
  { label: 'Reverse Isotope',   formula: 'f=?',      section: 'Periodic Table',     path: '/electron-config?topic=isotopes&mode=practice',  keywords: 'reverse isotope find abundance from atomic mass two isotopes',               topicTabId: 'isotopes'           },
  { label: 'Isotope Problems',  formula: '✎',        section: 'Periodic Table',     path: '/electron-config?topic=isotopes&mode=problems',  keywords: 'isotope abundance practice problems weighted average mass forward reverse',   topicTabId: 'isotopes'           },
  { label: 'Naming Reference',  formula: 'Nm',        section: 'Periodic Table',     path: '/electron-config?topic=naming',                    keywords: 'naming compounds ionic covalent acids nomenclature polyatomic ions',         topicTabId: 'naming'             },
  { label: 'Nomenclature',      formula: '⚗',         section: 'Periodic Table',     path: '/electron-config?topic=naming&mode=problems',      keywords: 'nomenclature naming practice compound name formula from name ionic covalent', topicTabId: 'naming'           },
  // Reactions / Redox
  { label: 'Rxn Classifier',    formula: '⇄',         section: 'Reactions / Redox',  path: '/redox?tab=classifier',                keywords: 'reaction classifier type synthesis decomposition single double displacement combustion', topicTabId: 'classifier'       },
  { label: 'Net Ionic',         formula: '⇌',         section: 'Reactions / Redox',  path: '/redox?tab=net-ionic',                 keywords: 'net ionic equation spectator ions',                                                     topicTabId: 'net-ionic'          },
  { label: 'Rxn Predictor',     formula: '→',         section: 'Reactions / Redox',  path: '/redox?tab=predictor',                 keywords: 'reaction predictor precipitation solubility product',                                   topicTabId: 'predictor'          },
  { label: 'Activity Series',   formula: '↕',         section: 'Reactions / Redox',  path: '/redox?tab=activity',                  keywords: 'activity series reactivity metals displacement',                                        topicTabId: 'activity'           },
  { label: 'Electrolyte',       formula: '⚡',         section: 'Reactions / Redox',  path: '/redox?tab=electrolyte',               keywords: 'electrolyte strong weak nonelectrolyte',                                                topicTabId: 'electrolyte'        },
  { label: 'Redox',             formula: 'e⁻',        section: 'Reactions / Redox',  path: '/redox?tab=redox-practice',            keywords: 'redox oxidation reduction electron transfer oxidation state',                           topicTabId: 'redox-practice'     },
  { label: 'E°cell / Nernst',   formula: 'E°',        section: 'Reactions / Redox',  path: '/redox?tab=ecell',                     keywords: 'cell potential Nernst equation reduction potential electrochemistry',                   topicTabId: 'ecell'              },
  { label: 'Titration',         formula: 'MₐVₐ=MᵦVᵦ', section: 'Reactions / Redox', path: '/redox?tab=titration',          keywords: 'acid base redox titration neutralization equivalence point molarity volume',                topicTabId: 'titration'          },
  { label: 'Titration Problems', formula: '✎',          section: 'Reactions / Redox', path: '/redox?tab=titration-problems', keywords: 'titration practice problems acid base redox neutralization volume molarity',                topicTabId: 'titration-problems' },
  // Stoichiometry
  { label: 'Stoichiometry',     formula: 'g↔mol',     section: 'Stoichiometry',      path: '/stoichiometry?tab=stoich',            keywords: 'stoichiometry mole ratio conversion grams moles',                                       topicTabId: 'stoich'             },
  { label: 'Limiting Reagent',  formula: 'LR',        section: 'Stoichiometry',      path: '/stoichiometry?tab=limiting',          keywords: 'limiting reagent reactant excess',                                                      topicTabId: 'limiting'           },
  { label: 'Theoretical Yield', formula: 'T.Y.',      section: 'Stoichiometry',      path: '/stoichiometry?tab=theoretical',       keywords: 'theoretical yield maximum product',                                                     topicTabId: 'theoretical'        },
  { label: 'Percent Yield',     formula: '%Y',        section: 'Stoichiometry',      path: '/stoichiometry?tab=percent',           keywords: 'percent yield actual theoretical',                                                      topicTabId: 'percent'            },
  { label: 'Solution Stoich',   formula: 'M·V',       section: 'Stoichiometry',      path: '/stoichiometry?tab=solution',          keywords: 'solution stoichiometry molarity volume',                                                topicTabId: 'solution'           },
  { label: 'Gas Stoich',        formula: 'PV',        section: 'Stoichiometry',      path: '/stoichiometry?tab=gas-stoich-practice',keywords: 'gas stoichiometry PV=nRT',                                                            topicTabId: 'gas-stoich-practice'},
  { label: 'Adv Percent Yield', formula: 'TY→%',      section: 'Stoichiometry',      path: '/stoichiometry?tab=adv-percent',        keywords: 'advanced percent yield theoretical actual limiting',                                   topicTabId: 'adv-percent'        },
  { label: 'Chained Yield',     formula: 'm→%Y',      section: 'Stoichiometry',      path: '/stoichiometry?tab=chained-yield',       keywords: 'chained yield industrial mass to percent yield step by step',                         topicTabId: 'chained-yield'      },
  { label: 'Balance',           formula: '_□_',       section: 'Stoichiometry',      path: '/stoichiometry?tab=balance-practice',   keywords: 'balance equations balancing coefficients',                                            topicTabId: 'balance-practice'   },
  { label: 'Molecular Diagrams', formula: '●○',       section: 'Stoichiometry',      path: '/stoichiometry?tab=mol-diagram',        keywords: 'molecular diagram limiting reagent particle box conceptual spheres pictorial',        topicTabId: 'mol-diagram'        },
  // Structures
  { label: 'Lewis Structures',  formula: '⌬',         section: 'Structures',         path: '/structures?tab=lewis',                keywords: 'lewis structure dot diagram electron pairs bonds',                                      topicTabId: 'lewis'              },
  { label: 'VSEPR',             formula: '⬡',         section: 'Structures',         path: '/structures?tab=vsepr',                keywords: 'VSEPR geometry molecular shape electron domain',                                        topicTabId: 'vsepr'              },
  { label: 'Formal Charge',     formula: 'FC',        section: 'Structures',         path: '/structures?tab=formal-charge',        keywords: 'formal charge lewis structure practice assign drill',                                   topicTabId: 'formal-charge'      },
  { label: 'Solid Types',       formula: '4 types',   section: 'Structures',         path: '/structures?tab=solid-types',          keywords: 'solid types ionic metallic covalent molecular',                                         topicTabId: 'solid-types'        },
  { label: 'Unit Cell',         formula: 'SC/BCC/FCC',section: 'Structures',         path: '/structures?tab=unit-cell',            keywords: 'unit cell simple cubic BCC FCC packing',                                               topicTabId: 'unit-cell'          },
  // Thermochemistry
  { label: 'Calorimetry',       formula: 'q',         section: 'Thermochemistry',    path: '/thermochemistry?tab=calorimetry-reference', keywords: 'calorimetry q=mcΔT heat capacity specific heat',                                topicTabId: 'calorimetry-reference' },
  { label: 'Enthalpy ΔHrxn',    formula: 'ΔH',        section: 'Thermochemistry',    path: '/thermochemistry?tab=enthalpy-reference',    keywords: 'enthalpy delta H reaction standard formation',                                  topicTabId: 'enthalpy-reference'    },
  { label: "Hess's Law",        formula: 'ΣΔH',       section: 'Thermochemistry',    path: '/thermochemistry?tab=hess-reference',        keywords: 'hess law enthalpy path independent sum',                                        topicTabId: 'hess-reference'        },
  { label: 'Bond Enthalpy',     formula: 'BE',        section: 'Thermochemistry',    path: '/thermochemistry?tab=bond-reference',        keywords: 'bond enthalpy energy dissociation broken formed',                               topicTabId: 'bond-reference'        },
  { label: 'Reaction Profiles', formula: '⇀',         section: 'Thermochemistry',    path: '/thermochemistry?tab=profile',               keywords: 'reaction profile energy diagram activation energy Ea exothermic endothermic',   topicTabId: 'profile'               },
  { label: 'Heat Transfer',     formula: 'q₁=−q₂',   section: 'Thermochemistry',    path: '/thermochemistry?tab=heattransfer-reference', keywords: 'heat transfer calorimetry q1 q2',                                              topicTabId: 'heattransfer-reference' },
  { label: 'Heating Curves',    formula: 'q/T',       section: 'Thermochemistry',    path: '/thermochemistry?tab=heating-curve-reference',keywords: 'heating curve phase change melting boiling temperature',                       topicTabId: 'heating-curve-reference'},
  { label: 'Phase Diagrams',    formula: 'P-T',       section: 'Thermochemistry',    path: '/thermochemistry?tab=phase-diagram-reference',keywords: 'phase diagram solid liquid gas triple critical point',                         topicTabId: 'phase-diagram-reference'},
  { label: 'Liquid Props',      formula: 'γ/η',       section: 'Thermochemistry',    path: '/thermochemistry?tab=liquid-props',           keywords: 'liquid properties surface tension viscosity vapor pressure',                    topicTabId: 'liquid-props'           },
  { label: 'Clausius-Clap.',    formula: 'ln P',      section: 'Thermochemistry',    path: '/thermochemistry?tab=cc-reference',           keywords: 'clausius clapeyron vapor pressure temperature enthalpy vaporization',          topicTabId: 'cc-reference'           },
  { label: 'Vapor Pressure',    formula: 'P_vap',    section: 'Thermochemistry',    path: '/thermochemistry?tab=vapor-pressure',         keywords: 'vapor pressure temperature boiling liquid clausius clapeyron',                  topicTabId: 'vapor-pressure-reference'},
  { label: 'Expansion Work',    formula: 'w=−PΔV',   section: 'Thermochemistry',    path: '/thermochemistry?tab=expansion-work',         keywords: 'expansion work PV irreversible compression w=-PextDeltaV surroundings',        topicTabId: 'expansion-work'         },
  { label: 'Energy Balance',    formula: 'q₁+q₂=0', section: 'Thermochemistry',    path: '/thermochemistry?tab=energy-balance',         keywords: 'energy balance partial melting ice drink evaporative cooling sweat',            topicTabId: 'energy-balance'         },
]

// Always shown — tools and standalone pages not tied to a registry topic
export const TOOL_SEARCH_ITEMS: SearchItem[] = [
  { label: 'Periodic Table',  formula: '⬡',   section: 'Periodic Table', path: '/table',                    keywords: 'periodic table elements'                  },
  { label: 'Solubility',      formula: 'S/I', section: 'Reference',      path: '/reference?tab=solubility', keywords: 'solubility rules soluble insoluble precipitate' },
  { label: 'Test Generator',  formula: '✎',   section: 'Practice',       path: '/test',                     keywords: 'test generator practice problems worksheet' },
  { label: 'Print Reference', formula: '⎙',   section: 'Practice',       path: '/print',                    keywords: 'print reference sheet cheat sheet'          },
  { label: 'Ketcher Editor',  formula: '✎',   section: 'Tools',          path: '/tools?tool=ketcher',       keywords: 'ketcher structure editor draw molecule'     },
  { label: 'Compound',        formula: '◈',   section: 'Tools',          path: '/compound',                 keywords: 'compound lookup molecular weight formula'   },
  { label: 'Glossary',        formula: 'A–Z', section: 'Tools',          path: '/glossary',                 keywords: 'glossary definitions terms vocabulary chemistry' },
  { label: 'Settings',        formula: '⚙',   section: 'Tools',          path: '/settings',                 keywords: 'settings preferences visibility topics hide show' },
]
