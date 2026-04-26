import type { LewisStructure } from '../pages/LewisPage'

export interface FormalChargeExercise {
  id:         string
  name:       string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  structure:  LewisStructure
  notes?:     string
}

export const FORMAL_CHARGE_EXERCISES: FormalChargeExercise[] = [

  // ── Basic ─────────────────────────────────────────────────────────────────────
  // All formal charges are zero; builds student confidence in the counting method.

  {
    id: 'h2o',
    name: 'Water (H₂O)',
    difficulty: 'basic',
    structure: {
      name: 'Water', formula: 'H2O', charge: 0, total_valence_electrons: 8,
      geometry: 'bent', steps: [], notes: '',
      atoms: [
        { id: 'O1', element: 'O',  lone_pairs: 2, formal_charge: 0 },
        { id: 'H1', element: 'H',  lone_pairs: 0, formal_charge: 0 },
        { id: 'H2', element: 'H',  lone_pairs: 0, formal_charge: 0 },
      ],
      bonds: [
        { from: 'O1', to: 'H1', order: 1 },
        { from: 'O1', to: 'H2', order: 1 },
      ],
    },
    notes: 'O: 6 − 4(2 LP) − 2(bonds) = 0. H: 1 − 0 − 1 = 0. All atoms satisfy the octet (H duet) with zero formal charge.',
  },

  {
    id: 'co2',
    name: 'Carbon dioxide (CO₂)',
    difficulty: 'basic',
    structure: {
      name: 'Carbon dioxide', formula: 'CO2', charge: 0, total_valence_electrons: 16,
      geometry: 'linear', steps: [], notes: '',
      atoms: [
        { id: 'C1', element: 'C', lone_pairs: 0, formal_charge: 0 },
        { id: 'O1', element: 'O', lone_pairs: 2, formal_charge: 0 },
        { id: 'O2', element: 'O', lone_pairs: 2, formal_charge: 0 },
      ],
      bonds: [
        { from: 'C1', to: 'O1', order: 2 },
        { from: 'C1', to: 'O2', order: 2 },
      ],
    },
    notes: 'C: 4 − 0 − 4 = 0. Each O: 6 − 4 − 2 = 0. Double bonds give all atoms zero FC — the preferred structure.',
  },

  {
    id: 'nh3',
    name: 'Ammonia (NH₃)',
    difficulty: 'basic',
    structure: {
      name: 'Ammonia', formula: 'NH3', charge: 0, total_valence_electrons: 8,
      geometry: 'trigonal_pyramidal', steps: [], notes: '',
      atoms: [
        { id: 'N1', element: 'N', lone_pairs: 1, formal_charge: 0 },
        { id: 'H1', element: 'H', lone_pairs: 0, formal_charge: 0 },
        { id: 'H2', element: 'H', lone_pairs: 0, formal_charge: 0 },
        { id: 'H3', element: 'H', lone_pairs: 0, formal_charge: 0 },
      ],
      bonds: [
        { from: 'N1', to: 'H1', order: 1 },
        { from: 'N1', to: 'H2', order: 1 },
        { from: 'N1', to: 'H3', order: 1 },
      ],
    },
    notes: 'N: 5 − 2(1 LP) − 3(bonds) = 0. H: 1 − 0 − 1 = 0. The lone pair on N makes NH₃ a Lewis base.',
  },

  {
    id: 'hocl',
    name: 'Hypochlorous acid (HOCl)',
    difficulty: 'basic',
    structure: {
      name: 'Hypochlorous acid', formula: 'HOCl', charge: 0, total_valence_electrons: 14,
      geometry: 'bent', steps: [], notes: '',
      atoms: [
        { id: 'O1',  element: 'O',  lone_pairs: 2, formal_charge: 0 },
        { id: 'H1',  element: 'H',  lone_pairs: 0, formal_charge: 0 },
        { id: 'Cl1', element: 'Cl', lone_pairs: 3, formal_charge: 0 },
      ],
      bonds: [
        { from: 'H1',  to: 'O1',  order: 1 },
        { from: 'O1',  to: 'Cl1', order: 1 },
      ],
    },
    notes: 'O: 6 − 4 − 2 = 0. Cl: 7 − 6 − 1 = 0. H: 0. Despite three different elements, all FCs are zero.',
  },

  {
    id: 'ch2o',
    name: 'Formaldehyde (CH₂O)',
    difficulty: 'basic',
    structure: {
      name: 'Formaldehyde', formula: 'CH2O', charge: 0, total_valence_electrons: 12,
      geometry: 'trigonal_planar', steps: [], notes: '',
      atoms: [
        { id: 'C1', element: 'C', lone_pairs: 0, formal_charge: 0 },
        { id: 'O1', element: 'O', lone_pairs: 2, formal_charge: 0 },
        { id: 'H1', element: 'H', lone_pairs: 0, formal_charge: 0 },
        { id: 'H2', element: 'H', lone_pairs: 0, formal_charge: 0 },
      ],
      bonds: [
        { from: 'C1', to: 'O1', order: 2 },
        { from: 'C1', to: 'H1', order: 1 },
        { from: 'C1', to: 'H2', order: 1 },
      ],
    },
    notes: 'C: 4 − 0 − 4 = 0. O: 6 − 4 − 2 = 0. The C=O double bond gives all atoms zero FC.',
  },

  {
    id: 'hcn',
    name: 'Hydrogen cyanide (HCN)',
    difficulty: 'basic',
    structure: {
      name: 'Hydrogen cyanide', formula: 'HCN', charge: 0, total_valence_electrons: 10,
      geometry: 'linear', steps: [], notes: '',
      atoms: [
        { id: 'C1', element: 'C', lone_pairs: 0, formal_charge: 0 },
        { id: 'N1', element: 'N', lone_pairs: 1, formal_charge: 0 },
        { id: 'H1', element: 'H', lone_pairs: 0, formal_charge: 0 },
      ],
      bonds: [
        { from: 'H1', to: 'C1', order: 1 },
        { from: 'C1', to: 'N1', order: 3 },
      ],
    },
    notes: 'C: 4 − 0 − (1+3) = 0. N: 5 − 2 − 3 = 0. Triple bonds look intimidating but FC counting is the same formula.',
  },

  // ── Intermediate ──────────────────────────────────────────────────────────────
  // One or two non-zero formal charges.

  {
    id: 'oh-',
    name: 'Hydroxide ion (OH⁻)',
    difficulty: 'intermediate',
    structure: {
      name: 'Hydroxide', formula: 'OH', charge: -1, total_valence_electrons: 8,
      geometry: 'diatomic', steps: [], notes: '',
      atoms: [
        { id: 'O1', element: 'O', lone_pairs: 3, formal_charge: -1 },
        { id: 'H1', element: 'H', lone_pairs: 0, formal_charge:  0 },
      ],
      bonds: [{ from: 'O1', to: 'H1', order: 1 }],
    },
    notes: 'O: 6 − 6(3 LP) − 1(bond) = −1. H: 0. The extra electron from the −1 charge sits on O as a lone pair.',
  },

  {
    id: 'nh4+',
    name: 'Ammonium ion (NH₄⁺)',
    difficulty: 'intermediate',
    structure: {
      name: 'Ammonium', formula: 'NH4', charge: 1, total_valence_electrons: 8,
      geometry: 'tetrahedral', steps: [], notes: '',
      atoms: [
        { id: 'N1', element: 'N', lone_pairs: 0, formal_charge: 1 },
        { id: 'H1', element: 'H', lone_pairs: 0, formal_charge: 0 },
        { id: 'H2', element: 'H', lone_pairs: 0, formal_charge: 0 },
        { id: 'H3', element: 'H', lone_pairs: 0, formal_charge: 0 },
        { id: 'H4', element: 'H', lone_pairs: 0, formal_charge: 0 },
      ],
      bonds: [
        { from: 'N1', to: 'H1', order: 1 },
        { from: 'N1', to: 'H2', order: 1 },
        { from: 'N1', to: 'H3', order: 1 },
        { from: 'N1', to: 'H4', order: 1 },
      ],
    },
    notes: 'N: 5 − 0(no LP) − 4(bonds) = +1. NH₄⁺ vs NH₃: adding H⁺ removes N\'s lone pair, raising FC by +1.',
  },

  {
    id: 'cn-',
    name: 'Cyanide ion (CN⁻)',
    difficulty: 'intermediate',
    structure: {
      name: 'Cyanide', formula: 'CN', charge: -1, total_valence_electrons: 10,
      geometry: 'diatomic', steps: [], notes: '',
      atoms: [
        { id: 'C1', element: 'C', lone_pairs: 1, formal_charge: -1 },
        { id: 'N1', element: 'N', lone_pairs: 1, formal_charge:  0 },
      ],
      bonds: [{ from: 'C1', to: 'N1', order: 3 }],
    },
    notes: 'C: 4 − 2(1 LP) − 3(triple bond) = −1. N: 5 − 2 − 3 = 0. The negative charge resides on the less electronegative atom (C), which is unusual — this is why CN⁻ bonds through C in metal complexes.',
  },

  {
    id: 'clo-',
    name: 'Hypochlorite ion (ClO⁻)',
    difficulty: 'intermediate',
    structure: {
      name: 'Hypochlorite', formula: 'ClO', charge: -1, total_valence_electrons: 14,
      geometry: 'diatomic', steps: [], notes: '',
      atoms: [
        { id: 'Cl1', element: 'Cl', lone_pairs: 3, formal_charge:  0 },
        { id: 'O1',  element: 'O',  lone_pairs: 3, formal_charge: -1 },
      ],
      bonds: [{ from: 'Cl1', to: 'O1', order: 1 }],
    },
    notes: 'Cl: 7 − 6 − 1 = 0. O: 6 − 6 − 1 = −1. The extra electron from the charge sits on O, the more electronegative atom.',
  },

  {
    id: 'no2-',
    name: 'Nitrite ion (NO₂⁻)',
    difficulty: 'intermediate',
    structure: {
      name: 'Nitrite', formula: 'NO2', charge: -1, total_valence_electrons: 18,
      geometry: 'bent', steps: [], notes: '',
      atoms: [
        { id: 'N1', element: 'N', lone_pairs: 1, formal_charge:  0 },
        { id: 'O1', element: 'O', lone_pairs: 2, formal_charge:  0 },
        { id: 'O2', element: 'O', lone_pairs: 3, formal_charge: -1 },
      ],
      bonds: [
        { from: 'N1', to: 'O1', order: 2 },
        { from: 'N1', to: 'O2', order: 1 },
      ],
    },
    notes: 'N: 5 − 2 − (2+1) = 0. O(double): 6 − 4 − 2 = 0. O(single): 6 − 6 − 1 = −1. Two resonance structures exist; each has one O with FC = −1.',
  },

  {
    id: 'co3-2',
    name: 'Carbonate ion (CO₃²⁻)',
    difficulty: 'intermediate',
    structure: {
      name: 'Carbonate', formula: 'CO3', charge: -2, total_valence_electrons: 24,
      geometry: 'trigonal_planar', steps: [], notes: '',
      atoms: [
        { id: 'C1', element: 'C', lone_pairs: 0, formal_charge:  0 },
        { id: 'O1', element: 'O', lone_pairs: 2, formal_charge:  0 },
        { id: 'O2', element: 'O', lone_pairs: 3, formal_charge: -1 },
        { id: 'O3', element: 'O', lone_pairs: 3, formal_charge: -1 },
      ],
      bonds: [
        { from: 'C1', to: 'O1', order: 2 },
        { from: 'C1', to: 'O2', order: 1 },
        { from: 'C1', to: 'O3', order: 1 },
      ],
    },
    notes: 'C: 4 − 0 − 4 = 0. =O: 6 − 4 − 2 = 0. −O (×2): 6 − 6 − 1 = −1 each. This is one resonance form; the true structure has all three C−O bonds equivalent.',
  },

  {
    id: 'no3-',
    name: 'Nitrate ion (NO₃⁻)',
    difficulty: 'intermediate',
    structure: {
      name: 'Nitrate', formula: 'NO3', charge: -1, total_valence_electrons: 24,
      geometry: 'trigonal_planar', steps: [], notes: '',
      atoms: [
        { id: 'N1', element: 'N', lone_pairs: 0, formal_charge:  1 },
        { id: 'O1', element: 'O', lone_pairs: 2, formal_charge:  0 },
        { id: 'O2', element: 'O', lone_pairs: 3, formal_charge: -1 },
        { id: 'O3', element: 'O', lone_pairs: 3, formal_charge: -1 },
      ],
      bonds: [
        { from: 'N1', to: 'O1', order: 2 },
        { from: 'N1', to: 'O2', order: 1 },
        { from: 'N1', to: 'O3', order: 1 },
      ],
    },
    notes: 'N: 5 − 0 − (2+1+1) = +1. =O: 6 − 4 − 2 = 0. −O (×2): 6 − 6 − 1 = −1. Net: +1−1−1 = −1 ✓. The positive FC on N is characteristic of nitrogen oxyanions.',
  },

  {
    id: 'bf4-',
    name: 'Tetrafluoroborate (BF₄⁻)',
    difficulty: 'intermediate',
    structure: {
      name: 'Tetrafluoroborate', formula: 'BF4', charge: -1, total_valence_electrons: 32,
      geometry: 'tetrahedral', steps: [], notes: '',
      atoms: [
        { id: 'B1', element: 'B', lone_pairs: 0, formal_charge: -1 },
        { id: 'F1', element: 'F', lone_pairs: 3, formal_charge:  0 },
        { id: 'F2', element: 'F', lone_pairs: 3, formal_charge:  0 },
        { id: 'F3', element: 'F', lone_pairs: 3, formal_charge:  0 },
        { id: 'F4', element: 'F', lone_pairs: 3, formal_charge:  0 },
      ],
      bonds: [
        { from: 'B1', to: 'F1', order: 1 },
        { from: 'B1', to: 'F2', order: 1 },
        { from: 'B1', to: 'F3', order: 1 },
        { from: 'B1', to: 'F4', order: 1 },
      ],
    },
    notes: 'B: 3 − 0 − 4 = −1. Each F: 7 − 6 − 1 = 0. BF₃ (neutral, FC = 0 on B) gains F⁻ to form BF₄⁻, placing the negative charge on B.',
  },

  // ── Advanced ──────────────────────────────────────────────────────────────────
  // Multiple non-zero FCs, expanded octets, or same-element charge separation.

  {
    id: 'so2',
    name: 'Sulfur dioxide (SO₂)',
    difficulty: 'advanced',
    structure: {
      name: 'Sulfur dioxide', formula: 'SO2', charge: 0, total_valence_electrons: 18,
      geometry: 'bent', steps: [], notes: '',
      atoms: [
        { id: 'S1', element: 'S', lone_pairs: 1, formal_charge:  1 },
        { id: 'O1', element: 'O', lone_pairs: 2, formal_charge:  0 },
        { id: 'O2', element: 'O', lone_pairs: 3, formal_charge: -1 },
      ],
      bonds: [
        { from: 'S1', to: 'O1', order: 2 },
        { from: 'S1', to: 'O2', order: 1 },
      ],
    },
    notes: 'S: 6 − 2(1 LP) − (2+1) = +1. =O: 0. −O: 6 − 6 − 1 = −1. Net: 0 ✓. An alternative structure with S expanded octet (2 double bonds) gives S FC = 0 and is also valid.',
  },

  {
    id: 'ozone',
    name: 'Ozone (O₃)',
    difficulty: 'advanced',
    structure: {
      name: 'Ozone', formula: 'O3', charge: 0, total_valence_electrons: 18,
      geometry: 'bent', steps: [], notes: '',
      atoms: [
        { id: 'O1', element: 'O', lone_pairs: 2, formal_charge:  0 },
        { id: 'O2', element: 'O', lone_pairs: 1, formal_charge:  1 },
        { id: 'O3', element: 'O', lone_pairs: 3, formal_charge: -1 },
      ],
      bonds: [
        { from: 'O1', to: 'O2', order: 2 },
        { from: 'O2', to: 'O3', order: 1 },
      ],
    },
    notes: 'O1 (terminal, double bond): 6 − 4 − 2 = 0. Central O2: 6 − 2(1 LP) − (2+1) = +1. O3 (terminal, single bond): 6 − 6 − 1 = −1. Key insight: same element, different FCs — due to different bonding environments.',
  },

  {
    id: 'so4-2',
    name: 'Sulfate ion (SO₄²⁻)',
    difficulty: 'advanced',
    structure: {
      name: 'Sulfate', formula: 'SO4', charge: -2, total_valence_electrons: 32,
      geometry: 'tetrahedral', steps: [], notes: '',
      atoms: [
        { id: 'S1', element: 'S', lone_pairs: 0, formal_charge:  0 },
        { id: 'O1', element: 'O', lone_pairs: 2, formal_charge:  0 },
        { id: 'O2', element: 'O', lone_pairs: 2, formal_charge:  0 },
        { id: 'O3', element: 'O', lone_pairs: 3, formal_charge: -1 },
        { id: 'O4', element: 'O', lone_pairs: 3, formal_charge: -1 },
      ],
      bonds: [
        { from: 'S1', to: 'O1', order: 2 },
        { from: 'S1', to: 'O2', order: 2 },
        { from: 'S1', to: 'O3', order: 1 },
        { from: 'S1', to: 'O4', order: 1 },
      ],
    },
    notes: 'S (expanded octet, 2 double + 2 single bonds): 6 − 0 − 6 = 0. =O: 0. −O (×2): −1. Net: −2 ✓. Chang uses this expanded-octet form. A simpler form (all single bonds) gives S FC = +2.',
  },

  {
    id: 'clf4-',
    name: 'Tetrafluorochloride ion (ClF₄⁻)',
    difficulty: 'advanced',
    structure: {
      name: 'Tetrafluorochloride', formula: 'ClF4', charge: -1, total_valence_electrons: 36,
      geometry: 'square_planar', steps: [], notes: '',
      atoms: [
        { id: 'Cl1', element: 'Cl', lone_pairs: 2, formal_charge: -1 },
        { id: 'F1',  element: 'F',  lone_pairs: 3, formal_charge:  0 },
        { id: 'F2',  element: 'F',  lone_pairs: 3, formal_charge:  0 },
        { id: 'F3',  element: 'F',  lone_pairs: 3, formal_charge:  0 },
        { id: 'F4',  element: 'F',  lone_pairs: 3, formal_charge:  0 },
      ],
      bonds: [
        { from: 'Cl1', to: 'F1', order: 1 },
        { from: 'Cl1', to: 'F2', order: 1 },
        { from: 'Cl1', to: 'F3', order: 1 },
        { from: 'Cl1', to: 'F4', order: 1 },
      ],
    },
    notes: 'Cl (expanded octet, 4 bonds + 2 LP): 7 − 4 − 4 = −1. F: 7 − 6 − 1 = 0. The extra electron from the −1 charge goes onto Cl. Chang 9.47.',
  },

  {
    id: 'pcl5',
    name: 'Phosphorus pentachloride (PCl₅)',
    difficulty: 'advanced',
    structure: {
      name: 'Phosphorus pentachloride', formula: 'PCl5', charge: 0, total_valence_electrons: 40,
      geometry: 'trigonal_bipyramidal', steps: [], notes: '',
      atoms: [
        { id: 'P1',  element: 'P',  lone_pairs: 0, formal_charge: 0 },
        { id: 'Cl1', element: 'Cl', lone_pairs: 3, formal_charge: 0 },
        { id: 'Cl2', element: 'Cl', lone_pairs: 3, formal_charge: 0 },
        { id: 'Cl3', element: 'Cl', lone_pairs: 3, formal_charge: 0 },
        { id: 'Cl4', element: 'Cl', lone_pairs: 3, formal_charge: 0 },
        { id: 'Cl5', element: 'Cl', lone_pairs: 3, formal_charge: 0 },
      ],
      bonds: [
        { from: 'P1', to: 'Cl1', order: 1 },
        { from: 'P1', to: 'Cl2', order: 1 },
        { from: 'P1', to: 'Cl3', order: 1 },
        { from: 'P1', to: 'Cl4', order: 1 },
        { from: 'P1', to: 'Cl5', order: 1 },
      ],
    },
    notes: 'P (5 bonds, expanded octet): 5 − 0 − 5 = 0. Each Cl: 7 − 6 − 1 = 0. All zeros, but the expanded octet on P (10 electrons) is the key concept. Only period 3+ atoms can exceed 8 electrons.',
  },

  {
    id: 'po4-3',
    name: 'Phosphate ion (PO₄³⁻)',
    difficulty: 'advanced',
    structure: {
      name: 'Phosphate', formula: 'PO4', charge: -3, total_valence_electrons: 32,
      geometry: 'tetrahedral', steps: [], notes: '',
      atoms: [
        { id: 'P1', element: 'P', lone_pairs: 0, formal_charge:  1 },
        { id: 'O1', element: 'O', lone_pairs: 3, formal_charge: -1 },
        { id: 'O2', element: 'O', lone_pairs: 3, formal_charge: -1 },
        { id: 'O3', element: 'O', lone_pairs: 3, formal_charge: -1 },
        { id: 'O4', element: 'O', lone_pairs: 3, formal_charge: -1 },
      ],
      bonds: [
        { from: 'P1', to: 'O1', order: 1 },
        { from: 'P1', to: 'O2', order: 1 },
        { from: 'P1', to: 'O3', order: 1 },
        { from: 'P1', to: 'O4', order: 1 },
      ],
    },
    notes: 'P (4 single bonds, no LP): 5 − 0 − 4 = +1. Each O: 6 − 6 − 1 = −1. Net: +1 + 4(−1) = −3 ✓. An expanded-octet form with one P=O gives P FC = 0 and is also drawn by some texts.',
  },

  {
    id: 'bf3',
    name: 'Boron trifluoride (BF₃)',
    difficulty: 'advanced',
    structure: {
      name: 'Boron trifluoride', formula: 'BF3', charge: 0, total_valence_electrons: 24,
      geometry: 'trigonal_planar', steps: [], notes: '',
      atoms: [
        { id: 'B1', element: 'B', lone_pairs: 0, formal_charge: 0 },
        { id: 'F1', element: 'F', lone_pairs: 3, formal_charge: 0 },
        { id: 'F2', element: 'F', lone_pairs: 3, formal_charge: 0 },
        { id: 'F3', element: 'F', lone_pairs: 3, formal_charge: 0 },
      ],
      bonds: [
        { from: 'B1', to: 'F1', order: 1 },
        { from: 'B1', to: 'F2', order: 1 },
        { from: 'B1', to: 'F3', order: 1 },
      ],
    },
    notes: 'B: 3 − 0 − 3 = 0. F: 7 − 6 − 1 = 0. Despite all FCs being zero, B only has 6 electrons (incomplete octet) — a common Lewis acid. Contrast with BF₄⁻ where B gains a 4th bond.',
  },
]
