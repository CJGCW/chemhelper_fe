import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTopicFilter } from '../utils/topicFilter'
import ExplanationModal, { type ExplanationContent } from '../components/calculations/ExplanationModal'
import HydrocarbonReference from '../components/organic/HydrocarbonReference'
import HydrocarbonPractice from '../components/organic/HydrocarbonPractice'
import IsomerReference from '../components/organic/IsomerReference'
import IsomerPractice from '../components/organic/IsomerPractice'
import OrganicNamingReference from '../components/organic/OrganicNamingReference'
import OrganicNamingTool from '../components/organic/OrganicNamingTool'
import OrganicNamingPractice from '../components/organic/OrganicNamingPractice'
import FunctionalGroupReference from '../components/organic/FunctionalGroupReference'
import FunctionalGroupPractice from '../components/organic/FunctionalGroupPractice'
import OrganicReactionReference from '../components/organic/OrganicReactionReference'
import OrganicReactionPractice from '../components/organic/OrganicReactionPractice'
import ConformationalReference from '../components/organic/ConformationalReference'
import ConformationalPractice from '../components/organic/ConformationalPractice'
import StereochemistryReference from '../components/organic/StereochemistryReference'
import RSAssignmentPractice from '../components/organic/RSAssignmentPractice'
import StereoisomerClassifier from '../components/organic/StereoisomerClassifier'
import EZPractice from '../components/organic/EZPractice'
import FischerReference from '../components/organic/FischerReference'
import AromaticityReference from '../components/organic/AromaticityReference'
import AromaticityClassifier from '../components/organic/AromaticityClassifier'
import DirectingEffectsReference from '../components/organic/DirectingEffectsReference'
import ConjugatedDieneReference from '../components/organic/ConjugatedDieneReference'
import OrganicPKaTable from '../components/organic/OrganicPKaTable'
import AcidityFactorsReference from '../components/organic/AcidityFactorsReference'
import MostAcidicHPractice from '../components/organic/MostAcidicHPractice'
import EquilibriumPredictor from '../components/organic/EquilibriumPredictor'
import ResonanceStructures from '../components/organic/ResonanceStructures'
import HybridizationAssigner from '../components/organic/HybridizationAssigner'
import FormalChargeOrganic from '../components/organic/FormalChargeOrganic'
import CurvedArrowReference from '../components/organic/CurvedArrowReference'
import MonosaccharideReference from '../components/organic/MonosaccharideReference'
import FischerHaworthConverter from '../components/organic/FischerHaworthConverter'
import AnomersAndMutarotation from '../components/organic/AnomersAndMutarotation'
import SugarReactions from '../components/organic/SugarReactions'
import FunctionalGroupInterconversion from '../components/organic/FunctionalGroupInterconversion'
import SynthesisFillInPractice from '../components/organic/SynthesisFillInPractice'
import SynthesisOrderingPractice from '../components/organic/SynthesisOrderingPractice'
import RetroDisconnectionPractice from '../components/organic/RetroDisconnectionPractice'
import TransformDrill from '../components/organic/TransformDrill'
import AminoAcidSynthesis from '../components/organic/AminoAcidSynthesis'
import AminoAcidTable from '../components/organic/AminoAcidTable'
import PeptideBondReference from '../components/organic/PeptideBondReference'
import ZwitterionAndPI from '../components/organic/ZwitterionAndPI'
import FattyAcidsReference from '../components/organic/FattyAcidsReference'
import TriglyceridesReference from '../components/organic/TriglyceridesReference'
import PhospholipidsReference from '../components/organic/PhospholipidsReference'
import TerpenesAndSteroids from '../components/organic/TerpenesAndSteroids'
import PolymerizationMechanisms from '../components/organic/PolymerizationMechanisms'
import CommonPolymersTable from '../components/organic/CommonPolymersTable'
import PolymerizationPractice from '../components/organic/PolymerizationPractice'
import NucleobasesReference from '../components/organic/NucleobasesReference'
import NucleotidesReference from '../components/organic/NucleotidesReference'
import DNAStructureReference from '../components/organic/DNAStructureReference'
import LipidIdentificationPractice from '../components/organic/LipidIdentificationPractice'
import NucleicAcidPractice from '../components/organic/NucleicAcidPractice'
import CrossCouplingPractice from '../components/organic/CrossCouplingPractice'
import PredictProductPractice from '../components/organic/PredictProductPractice'
import PageShell from '../components/Layout/PageShell'

type Tab =
  // reference
  | 'ref-hydrocarbons' | 'ref-isomers' | 'ref-organic-naming' | 'ref-func-groups' | 'ref-organic-rxn'
  | 'ref-newman' | 'ref-chair'
  | 'ref-stereochem' | 'ref-fischer'
  | 'ref-aromaticity' | 'ref-directing' | 'ref-conjugation'
  // practice
  | 'hydrocarbons' | 'isomers' | 'organic-naming' | 'func-groups' | 'organic-rxn'
  | 'newman-practice' | 'chair-practice'
  | 'rs-practice' | 'stereoisomer-practice' | 'ez-practice'
  | 'aromaticity-practice' | 'directing-practice' | 'conjugation-practice'
  // problems
  | 'hydrocarbons-problems' | 'isomers-problems' | 'naming-problems' | 'func-groups-problems' | 'organic-rxn-problems'
  | 'newman-problems' | 'chair-problems'
  | 'rs-problems' | 'stereoisomer-problems' | 'ez-problems'
  | 'aromaticity-problems' | 'directing-problems' | 'conjugation-problems'
  // acid-base tabs
  | 'ref-acid-base' | 'pka-table' | 'acid-base-practice' | 'acidity-factors' | 'acid-base-problems'
  // bonding tabs
  | 'ref-resonance' | 'ref-hybridization' | 'ref-curved-arrow'
  | 'resonance-practice' | 'hybridization-practice' | 'formal-charge-practice'
  | 'resonance-problems' | 'hybridization-problems' | 'formal-charge-problems'
  // carbohydrate tabs
  | 'ref-sugars' | 'fischer-haworth' | 'anomers-mutarotation' | 'sugar-reactions' | 'sugars-problems'
  // synthesis tabs
  | 'ref-fgi' | 'synthesis-fillin' | 'synthesis-ordering' | 'retro-disconnection' | 'transform-drill'
  | 'synthesis-problems'
  // amino acid tabs
  | 'ref-amino-acids' | 'amino-acid-table' | 'peptide-bonds' | 'zwitterions-pi' | 'amino-acid-problems'
  // lipid tabs
  | 'ref-fatty-acids' | 'ref-triglycerides' | 'ref-phospholipids' | 'ref-terpenes-steroids'
  | 'lipids-practice' | 'lipids-problems'
  // polymer tabs
  | 'ref-polymerization' | 'ref-common-polymers' | 'polymerization-practice' | 'polymerization-problems'
  // nucleic acid tabs
  | 'ref-nucleobases' | 'ref-nucleotides' | 'ref-dna-rna'
  | 'nucleic-acid-practice' | 'nucleic-acid-problems'
  // cross-coupling tabs
  | 'cross-coupling-practice' | 'cross-coupling-problems'
  // predict-product tabs
  | 'predict-practice' | 'predict-problems'

type Mode = 'reference' | 'practice' | 'problems'

type TabPill = { id: Tab; label: string; formula: string }
type TabGroup = { id: string; label: string; pills: TabPill[] }

const REFERENCE_GROUPS: TabGroup[] = [
  {
    id: 'rg1',
    label: 'Hydrocarbons',
    pills: [
      { id: 'ref-hydrocarbons',  label: 'Hydrocarbons', formula: 'CₙH'  },
      { id: 'ref-isomers',       label: 'Isomers',       formula: 'C₄H₁₀' },
      { id: 'ref-organic-naming', label: 'IUPAC Naming', formula: 'IUPAC' },
    ],
  },
  {
    id: 'rg2',
    label: 'Functional Groups',
    pills: [
      { id: 'ref-func-groups', label: 'Functional Groups', formula: 'R-OH' },
      { id: 'ref-organic-rxn', label: 'Common Reactions',  formula: 'rxn'  },
    ],
  },
  {
    id: 'rg3',
    label: 'Conformational Analysis',
    pills: [
      { id: 'ref-newman', label: 'Newman Projections', formula: 'φ'   },
      { id: 'ref-chair',  label: 'Chair Conformations', formula: '⬡'  },
    ],
  },
  {
    id: 'rg4',
    label: 'Stereochemistry',
    pills: [
      { id: 'ref-stereochem', label: 'Stereochemistry', formula: 'R/S' },
      { id: 'ref-fischer',    label: 'Fischer / D–L',   formula: 'D/L' },
    ],
  },
  {
    id: 'rg5',
    label: 'Aromaticity & Conjugation',
    pills: [
      { id: 'ref-aromaticity', label: 'Aromaticity',       formula: '4n+2'  },
      { id: 'ref-directing',   label: 'Directing Effects',  formula: 'o/p/m' },
      { id: 'ref-conjugation', label: 'Conjugated Dienes',  formula: '1,4'   },
    ],
  },
  {
    id: 'rg6',
    label: 'Acid-Base',
    pills: [
      { id: 'ref-acid-base', label: 'pKₐ Table',         formula: 'pKₐ'  },
    ],
  },
  {
    id: 'rg7',
    label: 'Structure & Bonding',
    pills: [
      { id: 'ref-resonance',      label: 'Resonance',      formula: '↔'    },
      { id: 'ref-hybridization',  label: 'Hybridization',  formula: 'sp³'  },
      { id: 'ref-curved-arrow',   label: 'Curved Arrows',  formula: '⟶'   },
    ],
  },
  {
    id: 'rg8',
    label: 'Carbohydrates',
    pills: [
      { id: 'ref-sugars', label: 'Monosaccharides', formula: 'C₆H₁₂O₆' },
    ],
  },
  {
    id: 'rg9',
    label: 'Synthesis',
    pills: [
      { id: 'ref-fgi', label: 'FGI Table', formula: 'FGI' },
    ],
  },
  {
    id: 'rg10',
    label: 'Amino Acids',
    pills: [
      { id: 'ref-amino-acids',  label: 'AA Synthesis',  formula: 'AA'   },
      { id: 'amino-acid-table', label: 'AA Table',       formula: '20'   },
      { id: 'peptide-bonds',    label: 'Peptide Bonds',  formula: 'C-N'  },
    ],
  },
  {
    id: 'rg11',
    label: 'Lipids',
    pills: [
      { id: 'ref-fatty-acids',       label: 'Fatty Acids',     formula: 'FA'   },
      { id: 'ref-triglycerides',     label: 'Triglycerides',   formula: '3×FA' },
      { id: 'ref-phospholipids',     label: 'Phospholipids',   formula: 'PL'   },
      { id: 'ref-terpenes-steroids', label: 'Terpenes',        formula: 'C₅n'  },
    ],
  },
  {
    id: 'rg12',
    label: 'Polymers',
    pills: [
      { id: 'ref-polymerization',  label: 'Mechanisms',      formula: 'Mn'   },
      { id: 'ref-common-polymers', label: 'Common Polymers', formula: 'list' },
    ],
  },
  {
    id: 'rg13',
    label: 'Nucleic Acids',
    pills: [
      { id: 'ref-nucleobases', label: 'Nucleobases', formula: 'ACGT' },
      { id: 'ref-nucleotides', label: 'Nucleotides', formula: '5′P'  },
      { id: 'ref-dna-rna',     label: 'DNA / RNA',   formula: 'helix'},
    ],
  },
]

const PRACTICE_GROUPS: TabGroup[] = [
  {
    id: 'pg1',
    label: 'Hydrocarbons',
    pills: [
      { id: 'hydrocarbons',   label: 'Classify Hydrocarbons', formula: 'CₙH'  },
      { id: 'isomers',        label: 'Isomers',                formula: '≡'    },
      { id: 'organic-naming', label: 'IUPAC Naming',           formula: 'IUPAC'},
    ],
  },
  {
    id: 'pg2',
    label: 'Functional Groups',
    pills: [
      { id: 'func-groups',    label: 'Functional Groups', formula: 'R-OH' },
      { id: 'organic-rxn',   label: 'Reactions',          formula: 'rxn'  },
      { id: 'predict-practice', label: 'Predict Product', formula: '→?'   },
    ],
  },
  {
    id: 'pg3',
    label: 'Conformational Analysis',
    pills: [
      { id: 'newman-practice', label: 'Newman Projections', formula: 'φ'  },
      { id: 'chair-practice',  label: 'Chair Conformations', formula: '⬡' },
    ],
  },
  {
    id: 'pg4',
    label: 'Stereochemistry',
    pills: [
      { id: 'rs-practice',           label: 'R/S Assignment',  formula: 'R/S' },
      { id: 'stereoisomer-practice', label: 'Stereoisomers',    formula: '≡?'  },
      { id: 'ez-practice',           label: 'E/Z Nomenclature', formula: 'E/Z' },
    ],
  },
  {
    id: 'pg5',
    label: 'Aromaticity & Conjugation',
    pills: [
      { id: 'aromaticity-practice', label: 'Aromaticity',      formula: '4n+2'  },
      { id: 'directing-practice',   label: 'Directing Effects', formula: 'o/p/m' },
      { id: 'conjugation-practice', label: 'Conjugated Dienes', formula: '1,4'   },
    ],
  },
  {
    id: 'pg6',
    label: 'Acid-Base',
    pills: [
      { id: 'pka-table',          label: 'pKₐ Lookup',         formula: 'pKₐ'  },
      { id: 'acid-base-practice', label: 'Most Acidic H',      formula: 'H⁺'   },
      { id: 'acidity-factors',    label: 'Equilibrium Pred.',  formula: '⇌'    },
    ],
  },
  {
    id: 'pg7',
    label: 'Structure & Bonding',
    pills: [
      { id: 'resonance-practice',      label: 'Resonance',     formula: '↔'   },
      { id: 'hybridization-practice',  label: 'Hybridization', formula: 'sp³' },
      { id: 'formal-charge-practice',  label: 'Formal Charge', formula: 'FC'  },
    ],
  },
  {
    id: 'pg8',
    label: 'Carbohydrates',
    pills: [
      { id: 'fischer-haworth',      label: 'Fischer→Haworth',  formula: 'D/L'  },
      { id: 'anomers-mutarotation', label: 'Anomers',          formula: 'α/β'  },
      { id: 'sugar-reactions',      label: 'Sugar Reactions',  formula: 'rxn'  },
    ],
  },
  {
    id: 'pg9',
    label: 'Synthesis',
    pills: [
      { id: 'synthesis-fillin',    label: 'Fill-In Reagents', formula: '→?'   },
      { id: 'synthesis-ordering',  label: 'Step Ordering',    formula: '1→2'  },
      { id: 'retro-disconnection', label: 'Retrosynthesis',   formula: '⟸'   },
      { id: 'transform-drill',     label: 'Transform Drill',  formula: 'A→B'  },
    ],
  },
  {
    id: 'pg10',
    label: 'Amino Acids',
    pills: [
      { id: 'zwitterions-pi', label: 'Zwitterions & pI', formula: 'pI' },
    ],
  },
  {
    id: 'pg11',
    label: 'Polymers',
    pills: [
      { id: 'polymerization-practice', label: 'Polymerization', formula: 'type?' },
    ],
  },
  {
    id: 'pg12',
    label: 'Lipids',
    pills: [
      { id: 'lipids-practice', label: 'Lipid Classification', formula: 'class?' },
    ],
  },
  {
    id: 'pg13',
    label: 'Nucleic Acids',
    pills: [
      { id: 'nucleic-acid-practice', label: 'Nucleic Acids', formula: 'A↔T' },
    ],
  },
  {
    id: 'pg14',
    label: 'Cross-Coupling',
    pills: [
      { id: 'cross-coupling-practice', label: 'Cross-Coupling', formula: 'Pd' },
    ],
  },
]

const PROBLEMS_GROUPS: TabGroup[] = [
  {
    id: 'pg1',
    label: 'Hydrocarbons',
    pills: [
      { id: 'hydrocarbons-problems', label: 'Classify Hydrocarbons', formula: 'CₙH'  },
      { id: 'isomers-problems',      label: 'Isomers',                formula: '≡'    },
      { id: 'naming-problems',       label: 'IUPAC Naming',           formula: 'IUPAC'},
    ],
  },
  {
    id: 'pg2',
    label: 'Functional Groups',
    pills: [
      { id: 'func-groups-problems', label: 'Functional Groups', formula: 'R-OH' },
      { id: 'organic-rxn-problems', label: 'Reactions',          formula: 'rxn'  },
      { id: 'predict-problems',     label: 'Predict Product',    formula: '→?'   },
    ],
  },
  {
    id: 'pg3',
    label: 'Conformational Analysis',
    pills: [
      { id: 'newman-problems', label: 'Newman Projections', formula: 'φ'  },
      { id: 'chair-problems',  label: 'Chair Conformations', formula: '⬡' },
    ],
  },
  {
    id: 'pg4',
    label: 'Stereochemistry',
    pills: [
      { id: 'rs-problems',           label: 'R/S Assignment',  formula: 'R/S' },
      { id: 'stereoisomer-problems', label: 'Stereoisomers',    formula: '≡?'  },
      { id: 'ez-problems',           label: 'E/Z Nomenclature', formula: 'E/Z' },
    ],
  },
  {
    id: 'pg5',
    label: 'Aromaticity & Conjugation',
    pills: [
      { id: 'aromaticity-problems', label: 'Aromaticity',      formula: '4n+2'  },
      { id: 'directing-problems',   label: 'Directing Effects', formula: 'o/p/m' },
      { id: 'conjugation-problems', label: 'Conjugated Dienes', formula: '1,4'   },
    ],
  },
  {
    id: 'pp6',
    label: 'Acid-Base',
    pills: [
      { id: 'acid-base-problems', label: 'Most Acidic H', formula: 'H⁺' },
    ],
  },
  {
    id: 'pp7',
    label: 'Structure & Bonding',
    pills: [
      { id: 'resonance-problems',     label: 'Resonance',     formula: '↔'   },
      { id: 'hybridization-problems', label: 'Hybridization', formula: 'sp³' },
      { id: 'formal-charge-problems', label: 'Formal Charge', formula: 'FC'  },
    ],
  },
  {
    id: 'pp8',
    label: 'Carbohydrates',
    pills: [
      { id: 'sugars-problems', label: 'Carbohydrates', formula: 'C₆H₁₂O₆' },
    ],
  },
  {
    id: 'pp9',
    label: 'Synthesis',
    pills: [
      { id: 'synthesis-problems', label: 'Synthesis', formula: '→' },
    ],
  },
  {
    id: 'pp10',
    label: 'Amino Acids',
    pills: [
      { id: 'amino-acid-problems', label: 'Amino Acids', formula: 'pI?' },
    ],
  },
  {
    id: 'pp11',
    label: 'Polymers',
    pills: [
      { id: 'polymerization-problems', label: 'Polymers', formula: 'type?' },
    ],
  },
  {
    id: 'pp12',
    label: 'Lipids',
    pills: [
      { id: 'lipids-problems', label: 'Lipid Classification', formula: 'class?' },
    ],
  },
  {
    id: 'pp13',
    label: 'Nucleic Acids',
    pills: [
      { id: 'nucleic-acid-problems', label: 'Nucleic Acids', formula: 'A↔T' },
    ],
  },
  {
    id: 'pp14',
    label: 'Cross-Coupling',
    pills: [
      { id: 'cross-coupling-problems', label: 'Cross-Coupling', formula: 'Pd' },
    ],
  },
]

const TAB_TO_TOPIC: Partial<Record<Tab, string>> = {
  'ref-hydrocarbons':   'alkanes-alkenes',    'hydrocarbons':   'alkanes-alkenes',    'hydrocarbons-problems': 'alkanes-alkenes',
  'ref-isomers':        'isomers',            'isomers':        'isomers',            'isomers-problems':      'isomers',
  'ref-organic-naming': 'organic-naming',     'organic-naming': 'organic-naming',     'naming-problems':       'organic-naming',
  'ref-func-groups':    'functional-group-id','func-groups':    'functional-group-id','func-groups-problems':  'functional-group-id',
  'ref-organic-rxn':    'organic-reactions',  'organic-rxn':    'organic-reactions',  'organic-rxn-problems':  'organic-reactions',
  'ref-newman':         'newman-projection',  'newman-practice':'newman-projection',  'newman-problems':       'newman-projection',
  'ref-chair':          'chair-conformation', 'chair-practice': 'chair-conformation', 'chair-problems':        'chair-conformation',
  'ref-stereochem':     'stereochemistry',    'ref-fischer':    'stereochemistry',
  'rs-practice':        'rs-assignment',      'rs-problems':    'rs-assignment',
  'stereoisomer-practice':'stereoisomer',     'stereoisomer-problems':'stereoisomer',
  'ez-practice':        'ez-nomenclature',    'ez-problems':    'ez-nomenclature',
  'ref-aromaticity':    'aromaticity',        'aromaticity-practice':'aromaticity',   'aromaticity-problems':  'aromaticity',
  'ref-directing':      'directing-effects',  'directing-practice':  'directing-effects', 'directing-problems': 'directing-effects',
  'ref-conjugation':    'conjugated-diene',   'conjugation-practice':'conjugated-diene',  'conjugation-problems':'conjugated-diene',
  'ref-acid-base':      'organic-acid-base',  'pka-table':          'organic-acid-base',  'acid-base-practice':   'organic-acid-base',
  'acidity-factors':    'organic-acid-base',  'acid-base-problems': 'organic-acid-base',
  'ref-resonance':      'organic-resonance',  'resonance-practice': 'organic-resonance',  'resonance-problems':   'organic-resonance',
  'ref-hybridization':  'organic-hybridization', 'hybridization-practice': 'organic-hybridization', 'hybridization-problems': 'organic-hybridization',
  'ref-curved-arrow':   'organic-formal-charge', 'formal-charge-practice': 'organic-formal-charge', 'formal-charge-problems': 'organic-formal-charge',
  'ref-sugars':         'carbohydrates',      'fischer-haworth':    'carbohydrates',      'anomers-mutarotation': 'carbohydrates',
  'sugar-reactions':    'carbohydrates',      'sugars-problems':    'carbohydrates',
  'ref-fgi':            'organic-synthesis',  'synthesis-fillin':   'organic-synthesis',  'synthesis-ordering': 'organic-synthesis',
  'retro-disconnection': 'organic-synthesis', 'transform-drill':   'organic-synthesis',  'synthesis-problems': 'organic-synthesis',
  'ref-amino-acids': 'amino-acids', 'amino-acid-table': 'amino-acids', 'peptide-bonds': 'amino-acids', 'zwitterions-pi': 'amino-acids', 'amino-acid-problems': 'amino-acids',
  'ref-fatty-acids': 'lipids', 'ref-triglycerides': 'lipids', 'ref-phospholipids': 'lipids', 'ref-terpenes-steroids': 'lipids',
  'lipids-practice': 'lipids', 'lipids-problems': 'lipids',
  'ref-polymerization': 'polymers', 'ref-common-polymers': 'polymers', 'polymerization-practice': 'polymers', 'polymerization-problems': 'polymers',
  'ref-nucleobases': 'nucleic-acids', 'ref-nucleotides': 'nucleic-acids', 'ref-dna-rna': 'nucleic-acids',
  'nucleic-acid-practice': 'nucleic-acids', 'nucleic-acid-problems': 'nucleic-acids',
  'cross-coupling-practice': 'cross-coupling', 'cross-coupling-problems': 'cross-coupling',
  'predict-practice': 'predict-product', 'predict-problems': 'predict-product',
}

const TOPIC_MODE_TAB: Record<string, Partial<Record<Mode, Tab>>> = {
  'alkanes-alkenes':     { reference: 'ref-hydrocarbons',   practice: 'hydrocarbons',   problems: 'hydrocarbons-problems' },
  'isomers':             { reference: 'ref-isomers',        practice: 'isomers',        problems: 'isomers-problems'      },
  'organic-naming':      { reference: 'ref-organic-naming', practice: 'organic-naming', problems: 'naming-problems'       },
  'functional-group-id': { reference: 'ref-func-groups',    practice: 'func-groups',    problems: 'func-groups-problems'  },
  'organic-reactions':   { reference: 'ref-organic-rxn',    practice: 'organic-rxn',    problems: 'organic-rxn-problems'  },
  'newman-projection':   { reference: 'ref-newman',         practice: 'newman-practice', problems: 'newman-problems'      },
  'chair-conformation':  { reference: 'ref-chair',          practice: 'chair-practice',  problems: 'chair-problems'       },
  'stereochemistry':     { reference: 'ref-stereochem',     practice: 'rs-practice',     problems: 'rs-problems'          },
  'rs-assignment':       { reference: 'ref-stereochem',     practice: 'rs-practice',     problems: 'rs-problems'          },
  'stereoisomer':        { reference: 'ref-stereochem',     practice: 'stereoisomer-practice', problems: 'stereoisomer-problems' },
  'ez-nomenclature':     { reference: 'ref-stereochem',     practice: 'ez-practice',     problems: 'ez-problems'          },
  'aromaticity':         { reference: 'ref-aromaticity',    practice: 'aromaticity-practice', problems: 'aromaticity-problems' },
  'directing-effects':   { reference: 'ref-directing',      practice: 'directing-practice',   problems: 'directing-problems'   },
  'conjugated-diene':       { reference: 'ref-conjugation',   practice: 'conjugation-practice',   problems: 'conjugation-problems'    },
  'organic-acid-base':      { reference: 'ref-acid-base',     practice: 'acid-base-practice',     problems: 'acid-base-problems'      },
  'organic-resonance':      { reference: 'ref-resonance',     practice: 'resonance-practice',     problems: 'resonance-problems'      },
  'organic-hybridization':  { reference: 'ref-hybridization', practice: 'hybridization-practice', problems: 'hybridization-problems'  },
  'organic-formal-charge':  { reference: 'ref-curved-arrow',  practice: 'formal-charge-practice', problems: 'formal-charge-problems'  },
  'carbohydrates':          { reference: 'ref-sugars',        practice: 'fischer-haworth',        problems: 'sugars-problems'         },
  'organic-synthesis':      { reference: 'ref-fgi',           practice: 'synthesis-fillin',       problems: 'synthesis-problems'      },
  'amino-acids':            { reference: 'ref-amino-acids',   practice: 'zwitterions-pi',         problems: 'amino-acid-problems'     },
  'lipids':                 { reference: 'ref-fatty-acids',   practice: 'lipids-practice',          problems: 'lipids-problems'            },
  'polymers':               { reference: 'ref-polymerization', practice: 'polymerization-practice', problems: 'polymerization-problems' },
  'nucleic-acids':          { reference: 'ref-nucleobases',   practice: 'nucleic-acid-practice',    problems: 'nucleic-acid-problems'    },
  'cross-coupling':         { practice: 'cross-coupling-practice',                                  problems: 'cross-coupling-problems'  },
  'predict-product':        { practice: 'predict-practice',                                           problems: 'predict-problems'          },
}

const MODE_DEFAULT: Record<Mode, Tab> = {
  reference: 'ref-hydrocarbons',
  practice:  'hydrocarbons',
  problems:  'hydrocarbons-problems',
}

const PAGE_EXPLANATION: ExplanationContent = {
  title: 'Organic Chemistry',
  formula: 'CₙH · IUPAC · R-OH · rxn',
  formulaVars: [
    { symbol: 'alkane', meaning: 'CₙH₂ₙ₊₂, all single bonds', unit: 'sp³' },
    { symbol: 'alkene', meaning: 'CₙH₂ₙ, one C=C double bond', unit: 'sp²' },
    { symbol: 'alkyne', meaning: 'CₙH₂ₙ₋₂, one C≡C triple bond', unit: 'sp' },
    { symbol: 'R-OH', meaning: 'Alcohol functional group', unit: '-ol suffix' },
  ],
  description:
    'Organic Chemistry introduces hydrocarbons, functional groups, and IUPAC naming. ' +
    'These topics appear in the final chapter of most Gen Chem courses. ' +
    'Start with the Reference tab to review the hydrocarbon families and functional group patterns.',
}

export default function OrganicPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showExplanation, setShowExplanation] = useState(false)

  const activeTab = (searchParams.get('tab') as Tab) ?? 'ref-hydrocarbons'

  function setTab(tab: Tab) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tab', tab)
      return next
    })
  }

  const { isTabVisible } = useTopicFilter()

  const visibleReferenceGroups = REFERENCE_GROUPS
    .map(g => ({ ...g, pills: g.pills.filter(p => isTabVisible(p.id)) }))
    .filter(g => g.pills.length > 0)
  const visiblePracticeGroups = PRACTICE_GROUPS
    .map(g => ({ ...g, pills: g.pills.filter(p => isTabVisible(p.id)) }))
    .filter(g => g.pills.length > 0)
  const visibleProblemsGroups = PROBLEMS_GROUPS
    .map(g => ({ ...g, pills: g.pills.filter(p => isTabVisible(p.id)) }))
    .filter(g => g.pills.length > 0)

  const visiblePracticeTabIds = new Set<Tab>(visiblePracticeGroups.flatMap(g => g.pills.map(p => p.id)))
  const visibleProblemsTabIds = new Set<Tab>(visibleProblemsGroups.flatMap(g => g.pills.map(p => p.id)))

  const allVisibleTabIds = [
    ...visibleReferenceGroups.flatMap(g => g.pills.map(p => p.id)),
    ...visiblePracticeTabIds,
    ...visibleProblemsTabIds,
  ]
  const firstVisibleTab = allVisibleTabIds[0] as Tab | undefined
  const tabIsVisible = isTabVisible(activeTab)

  useEffect(() => {
    if (!tabIsVisible && firstVisibleTab !== undefined) setTab(firstVisibleTab)
  }, [tabIsVisible, firstVisibleTab])

  const activeMode: Mode = visibleProblemsTabIds.has(activeTab) ? 'problems'
    : visiblePracticeTabIds.has(activeTab) ? 'practice'
    : 'reference'

  function setMode(mode: Mode) {
    if (mode === activeMode) return
    const topic = TAB_TO_TOPIC[activeTab]
    const next = (topic ? TOPIC_MODE_TAB[topic]?.[mode] : undefined) ?? MODE_DEFAULT[mode]
    setTab(next)
  }

  const activeGroups = activeMode === 'problems' ? visibleProblemsGroups
    : activeMode === 'practice' ? visiblePracticeGroups
    : visibleReferenceGroups

  return (
    <PageShell>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 print:hidden">
          <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Organic Chemistry</h2>
          {activeMode === 'reference' && (
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-1 rounded-sm font-sans text-sm border border-border
                         text-secondary hover:text-primary hover:border-muted transition-colors"
            >
              <span>⎙</span>
              <span>Print</span>
            </button>
          )}
          <button
            onClick={() => setShowExplanation(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-border
                       font-sans text-xs text-secondary hover:text-primary hover:border-muted transition-colors"
          >
            <span className="font-mono">?</span>
            <span>What is this</span>
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-full self-start print:hidden"
          style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
          {(['reference', 'practice', 'problems'] as Mode[]).map(m => {
            const isActive = activeMode === m
            return (
              <button key={m} onClick={() => setMode(m)}
                className="relative px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-colors capitalize"
                style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.35)' }}>
                {isActive && (
                  <motion.div layoutId="organic-mode-switch" className="absolute inset-0 rounded-full"
                    style={{
                      background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))',
                      border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
                <span className="relative z-10">{m}</span>
              </button>
            )
          })}
        </div>

        {/* Sub-tab groups */}
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:gap-x-6 md:gap-y-3 print:hidden">
          {activeGroups.map(group => (
            <div key={group.id} className="flex flex-col gap-2 px-3 py-2 rounded-sm"
              style={{ background: 'rgb(var(--color-base))', border: '1px solid rgb(var(--color-border))' }}>
              <p className="font-mono text-xs text-secondary tracking-widest uppercase">{group.label}</p>
              <div className="flex items-center gap-1 flex-wrap">
                {group.pills.map(pill => {
                  const isActive = activeTab === pill.id
                  return (
                    <button
                      key={pill.id}
                      onClick={() => setTab(pill.id)}
                      className="relative px-4 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
                      style={{ color: isActive ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)' }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="organic-tab-pill"
                          className="absolute inset-0 rounded-sm"
                          style={{ background: 'color-mix(in srgb, var(--c-halogen) 12%, rgb(var(--color-raised)))', border: '1px solid color-mix(in srgb, var(--c-halogen) 30%, transparent)' }}
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10">{pill.label}</span>
                      <span className="relative z-10 font-mono text-[10px] ml-1.5 opacity-50">{pill.formula}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {allVisibleTabIds.length === 0 && (
        <p className="font-sans text-sm text-dim py-8 text-center">
          No topics enabled —{' '}
          <Link to="/settings" className="text-secondary underline">visit Settings to configure</Link>.
        </p>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'ref-hydrocarbons' && (
          <motion.div key="ref-hydrocarbons"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <HydrocarbonReference />
          </motion.div>
        )}
        {activeTab === 'ref-isomers' && (
          <motion.div key="ref-isomers"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <IsomerReference />
          </motion.div>
        )}
        {activeTab === 'ref-organic-naming' && (
          <motion.div key="ref-organic-naming"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <OrganicNamingReference />
          </motion.div>
        )}
        {activeTab === 'ref-func-groups' && (
          <motion.div key="ref-func-groups"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <FunctionalGroupReference />
          </motion.div>
        )}
        {activeTab === 'ref-organic-rxn' && (
          <motion.div key="ref-organic-rxn"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <OrganicReactionReference />
          </motion.div>
        )}
        {activeTab === 'hydrocarbons' && (
          <motion.div key="hydrocarbons"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <HydrocarbonPractice allowCustom={true} />
          </motion.div>
        )}
        {activeTab === 'isomers' && (
          <motion.div key="isomers"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <IsomerPractice allowCustom={true} />
          </motion.div>
        )}
        {activeTab === 'organic-naming' && (
          <motion.div key="organic-naming"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <OrganicNamingTool />
          </motion.div>
        )}
        {activeTab === 'func-groups' && (
          <motion.div key="func-groups"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <FunctionalGroupPractice allowCustom={true} />
          </motion.div>
        )}
        {activeTab === 'organic-rxn' && (
          <motion.div key="organic-rxn"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <OrganicReactionPractice allowCustom={true} />
          </motion.div>
        )}
        {activeTab === 'hydrocarbons-problems' && (
          <motion.div key="hydrocarbons-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <HydrocarbonPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'isomers-problems' && (
          <motion.div key="isomers-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <IsomerPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'naming-problems' && (
          <motion.div key="naming-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <OrganicNamingPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'func-groups-problems' && (
          <motion.div key="func-groups-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <FunctionalGroupPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'organic-rxn-problems' && (
          <motion.div key="organic-rxn-problems"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <OrganicReactionPractice allowCustom={false} />
          </motion.div>
        )}
        {activeTab === 'ref-newman' && (
          <motion.div key="ref-newman"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ConformationalReference />
          </motion.div>
        )}
        {activeTab === 'ref-chair' && (
          <motion.div key="ref-chair"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ConformationalReference />
          </motion.div>
        )}
        {(activeTab === 'newman-practice' || activeTab === 'newman-problems') && (
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ConformationalPractice allowCustom={activeTab === 'newman-practice'} />
          </motion.div>
        )}
        {(activeTab === 'chair-practice' || activeTab === 'chair-problems') && (
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ConformationalPractice allowCustom={activeTab === 'chair-practice'} />
          </motion.div>
        )}
        {activeTab === 'ref-stereochem' && (
          <motion.div key="ref-stereochem"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <StereochemistryReference />
          </motion.div>
        )}
        {activeTab === 'ref-fischer' && (
          <motion.div key="ref-fischer"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <FischerReference />
          </motion.div>
        )}
        {(activeTab === 'rs-practice' || activeTab === 'rs-problems') && (
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <RSAssignmentPractice allowCustom={activeTab === 'rs-practice'} />
          </motion.div>
        )}
        {(activeTab === 'stereoisomer-practice' || activeTab === 'stereoisomer-problems') && (
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <StereoisomerClassifier allowCustom={activeTab === 'stereoisomer-practice'} />
          </motion.div>
        )}
        {(activeTab === 'ez-practice' || activeTab === 'ez-problems') && (
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <EZPractice allowCustom={activeTab === 'ez-practice'} />
          </motion.div>
        )}
        {activeTab === 'ref-aromaticity' && (
          <motion.div key="ref-aromaticity"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <AromaticityReference />
          </motion.div>
        )}
        {(activeTab === 'aromaticity-practice' || activeTab === 'aromaticity-problems') && (
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <AromaticityClassifier allowCustom={activeTab === 'aromaticity-practice'} />
          </motion.div>
        )}
        {(activeTab === 'ref-directing' || activeTab === 'directing-practice' || activeTab === 'directing-problems') && (
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <DirectingEffectsReference allowCustom={activeTab !== 'directing-problems'} />
          </motion.div>
        )}
        {(activeTab === 'ref-conjugation' || activeTab === 'conjugation-practice' || activeTab === 'conjugation-problems') && (
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ConjugatedDieneReference allowCustom={activeTab !== 'conjugation-problems'} />
          </motion.div>
        )}

        {/* ── Acid-Base ──────────────────────────────────────────────────── */}
        {activeTab === 'ref-acid-base' && (
          <motion.div key="ref-acid-base" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <OrganicPKaTable />
            <div className="mt-8">
              <AcidityFactorsReference />
            </div>
          </motion.div>
        )}
        {activeTab === 'pka-table' && (
          <motion.div key="pka-table" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <OrganicPKaTable />
          </motion.div>
        )}
        {(activeTab === 'acid-base-practice' || activeTab === 'acid-base-problems') && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <MostAcidicHPractice allowCustom={activeTab === 'acid-base-practice'} />
          </motion.div>
        )}
        {activeTab === 'acidity-factors' && (
          <motion.div key="acidity-factors" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <EquilibriumPredictor />
          </motion.div>
        )}

        {/* ── Structure & Bonding ────────────────────────────────────────── */}
        {(activeTab === 'ref-resonance' || activeTab === 'resonance-practice' || activeTab === 'resonance-problems') && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ResonanceStructures allowCustom={activeTab !== 'resonance-problems'} />
          </motion.div>
        )}
        {(activeTab === 'ref-hybridization' || activeTab === 'hybridization-practice' || activeTab === 'hybridization-problems') && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <HybridizationAssigner allowCustom={activeTab !== 'hybridization-problems'} />
          </motion.div>
        )}
        {activeTab === 'ref-curved-arrow' && (
          <motion.div key="ref-curved-arrow" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <CurvedArrowReference />
          </motion.div>
        )}
        {(activeTab === 'formal-charge-practice' || activeTab === 'formal-charge-problems') && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <FormalChargeOrganic allowCustom={activeTab === 'formal-charge-practice'} />
          </motion.div>
        )}

        {/* ── Carbohydrates ──────────────────────────────────────────────── */}
        {activeTab === 'ref-sugars' && (
          <motion.div key="ref-sugars" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <MonosaccharideReference />
          </motion.div>
        )}
        {(activeTab === 'fischer-haworth' || activeTab === 'sugars-problems') && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <FischerHaworthConverter />
          </motion.div>
        )}
        {activeTab === 'anomers-mutarotation' && (
          <motion.div key="anomers-mutarotation" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <AnomersAndMutarotation allowCustom={true} />
          </motion.div>
        )}
        {activeTab === 'sugar-reactions' && (
          <motion.div key="sugar-reactions" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SugarReactions allowCustom={true} />
          </motion.div>
        )}

        {/* ── Synthesis ──────────────────────────────────────────────────────── */}
        {activeTab === 'ref-fgi' && (
          <motion.div key="ref-fgi" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <FunctionalGroupInterconversion />
          </motion.div>
        )}
        {activeTab === 'synthesis-fillin' && (
          <motion.div key="synthesis-fillin" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SynthesisFillInPractice allowCustom={true} />
          </motion.div>
        )}
        {activeTab === 'synthesis-ordering' && (
          <motion.div key="synthesis-ordering" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SynthesisOrderingPractice allowCustom={true} />
          </motion.div>
        )}
        {activeTab === 'retro-disconnection' && (
          <motion.div key="retro-disconnection" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <RetroDisconnectionPractice allowCustom={true} />
          </motion.div>
        )}
        {activeTab === 'transform-drill' && (
          <motion.div key="transform-drill" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <TransformDrill allowCustom={true} />
          </motion.div>
        )}
        {activeTab === 'synthesis-problems' && (
          <motion.div key="synthesis-problems" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <SynthesisFillInPractice allowCustom={false} />
          </motion.div>
        )}

        {/* ── Amino Acids ────────────────────────────────────────────────────── */}
        {activeTab === 'ref-amino-acids' && (
          <motion.div key="ref-amino-acids" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <AminoAcidSynthesis />
          </motion.div>
        )}
        {activeTab === 'amino-acid-table' && (
          <motion.div key="amino-acid-table" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <AminoAcidTable />
          </motion.div>
        )}
        {activeTab === 'peptide-bonds' && (
          <motion.div key="peptide-bonds" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <PeptideBondReference />
          </motion.div>
        )}
        {(activeTab === 'zwitterions-pi' || activeTab === 'amino-acid-problems') && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <ZwitterionAndPI allowCustom={activeTab === 'zwitterions-pi'} />
          </motion.div>
        )}

        {/* ── Lipids ────────────────────────────────────────────────────────── */}
        {activeTab === 'ref-fatty-acids' && (
          <motion.div key="ref-fatty-acids" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <FattyAcidsReference />
          </motion.div>
        )}
        {activeTab === 'ref-triglycerides' && (
          <motion.div key="ref-triglycerides" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <TriglyceridesReference />
          </motion.div>
        )}
        {activeTab === 'ref-phospholipids' && (
          <motion.div key="ref-phospholipids" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <PhospholipidsReference />
          </motion.div>
        )}
        {activeTab === 'ref-terpenes-steroids' && (
          <motion.div key="ref-terpenes-steroids" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <TerpenesAndSteroids />
          </motion.div>
        )}
        {(activeTab === 'lipids-practice' || activeTab === 'lipids-problems') && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <LipidIdentificationPractice allowCustom={activeTab === 'lipids-practice'} />
          </motion.div>
        )}

        {/* ── Polymers ──────────────────────────────────────────────────────── */}
        {activeTab === 'ref-polymerization' && (
          <motion.div key="ref-polymerization" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <PolymerizationMechanisms />
          </motion.div>
        )}
        {activeTab === 'ref-common-polymers' && (
          <motion.div key="ref-common-polymers" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <CommonPolymersTable />
          </motion.div>
        )}
        {(activeTab === 'polymerization-practice' || activeTab === 'polymerization-problems') && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <PolymerizationPractice allowCustom={activeTab === 'polymerization-practice'} />
          </motion.div>
        )}

        {/* ── Nucleic Acids ─────────────────────────────────────────────────── */}
        {activeTab === 'ref-nucleobases' && (
          <motion.div key="ref-nucleobases" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <NucleobasesReference />
          </motion.div>
        )}
        {activeTab === 'ref-nucleotides' && (
          <motion.div key="ref-nucleotides" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <NucleotidesReference />
          </motion.div>
        )}
        {activeTab === 'ref-dna-rna' && (
          <motion.div key="ref-dna-rna" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <DNAStructureReference />
          </motion.div>
        )}
        {(activeTab === 'nucleic-acid-practice' || activeTab === 'nucleic-acid-problems') && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <NucleicAcidPractice allowCustom={activeTab === 'nucleic-acid-practice'} />
          </motion.div>
        )}

        {/* ── Predict Product ────────────────────────────────────────────────── */}
        {(activeTab === 'predict-practice' || activeTab === 'predict-problems') && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <PredictProductPractice allowCustom={activeTab === 'predict-practice'} />
          </motion.div>
        )}

        {/* ── Cross-Coupling ────────────────────────────────────────────────── */}
        {(activeTab === 'cross-coupling-practice' || activeTab === 'cross-coupling-problems') && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <CrossCouplingPractice allowCustom={activeTab === 'cross-coupling-practice'} />
          </motion.div>
        )}
      </AnimatePresence>

      <ExplanationModal
        content={PAGE_EXPLANATION}
        open={showExplanation}
        onClose={() => setShowExplanation(false)}
      />
    </PageShell>
  )
}
