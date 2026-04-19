import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ─────────────────────────────────────────────────────────────────────

type RxnCategory = 'precipitation' | 'acid_base' | 'gas_forming' | 'redox'

/** A single term in the complete ionic equation, e.g. "2Na⁺(aq)" */
interface IonicChunk {
  text: string
  spectator: boolean
}

interface Reaction {
  id: string
  category: RxnCategory
  title: string
  molecular: string
  reactantChunks: IonicChunk[]
  productChunks: IonicChunk[]
  spectatorIons: string[]
  netIonic: string
  note?: string
}

// ── Reaction database ─────────────────────────────────────────────────────────

const REACTIONS: Reaction[] = [

  // ── Precipitation ───────────────────────────────────────────────────────────
  {
    id: 'AgNO3+NaCl',
    category: 'precipitation',
    title: 'AgNO₃ + NaCl',
    molecular: 'AgNO₃(aq) + NaCl(aq) → AgCl(s) + NaNO₃(aq)',
    reactantChunks: [
      { text: 'Ag⁺(aq)',   spectator: false },
      { text: 'NO₃⁻(aq)', spectator: true  },
      { text: 'Na⁺(aq)',   spectator: true  },
      { text: 'Cl⁻(aq)',   spectator: false },
    ],
    productChunks: [
      { text: 'AgCl(s)',   spectator: false },
      { text: 'Na⁺(aq)',   spectator: true  },
      { text: 'NO₃⁻(aq)', spectator: true  },
    ],
    spectatorIons: ['Na⁺(aq)', 'NO₃⁻(aq)'],
    netIonic: 'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)',
    note: 'White precipitate. Classic test for chloride ions.',
  },
  {
    id: 'Pb(NO3)2+KI',
    category: 'precipitation',
    title: 'Pb(NO₃)₂ + 2KI',
    molecular: 'Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s) + 2KNO₃(aq)',
    reactantChunks: [
      { text: 'Pb²⁺(aq)',   spectator: false },
      { text: '2NO₃⁻(aq)', spectator: true  },
      { text: '2K⁺(aq)',    spectator: true  },
      { text: '2I⁻(aq)',    spectator: false },
    ],
    productChunks: [
      { text: 'PbI₂(s)',    spectator: false },
      { text: '2K⁺(aq)',    spectator: true  },
      { text: '2NO₃⁻(aq)', spectator: true  },
    ],
    spectatorIons: ['K⁺(aq)', 'NO₃⁻(aq)'],
    netIonic: 'Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s)',
    note: 'Bright yellow precipitate of lead(II) iodide.',
  },
  {
    id: 'BaCl2+Na2SO4',
    category: 'precipitation',
    title: 'BaCl₂ + Na₂SO₄',
    molecular: 'BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s) + 2NaCl(aq)',
    reactantChunks: [
      { text: 'Ba²⁺(aq)',  spectator: false },
      { text: '2Cl⁻(aq)', spectator: true  },
      { text: '2Na⁺(aq)', spectator: true  },
      { text: 'SO₄²⁻(aq)',spectator: false },
    ],
    productChunks: [
      { text: 'BaSO₄(s)',  spectator: false },
      { text: '2Na⁺(aq)', spectator: true  },
      { text: '2Cl⁻(aq)', spectator: true  },
    ],
    spectatorIons: ['Na⁺(aq)', 'Cl⁻(aq)'],
    netIonic: 'Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)',
    note: 'White precipitate. Confirms presence of sulfate or barium ions.',
  },
  {
    id: 'CaCl2+Na2CO3',
    category: 'precipitation',
    title: 'CaCl₂ + Na₂CO₃',
    molecular: 'CaCl₂(aq) + Na₂CO₃(aq) → CaCO₃(s) + 2NaCl(aq)',
    reactantChunks: [
      { text: 'Ca²⁺(aq)',  spectator: false },
      { text: '2Cl⁻(aq)', spectator: true  },
      { text: '2Na⁺(aq)', spectator: true  },
      { text: 'CO₃²⁻(aq)',spectator: false },
    ],
    productChunks: [
      { text: 'CaCO₃(s)',  spectator: false },
      { text: '2Na⁺(aq)', spectator: true  },
      { text: '2Cl⁻(aq)', spectator: true  },
    ],
    spectatorIons: ['Na⁺(aq)', 'Cl⁻(aq)'],
    netIonic: 'Ca²⁺(aq) + CO₃²⁻(aq) → CaCO₃(s)',
    note: 'White precipitate of calcium carbonate (limestone/chalk).',
  },
  {
    id: '2AgNO3+K2CrO4',
    category: 'precipitation',
    title: '2AgNO₃ + K₂CrO₄',
    molecular: '2AgNO₃(aq) + K₂CrO₄(aq) → Ag₂CrO₄(s) + 2KNO₃(aq)',
    reactantChunks: [
      { text: '2Ag⁺(aq)',   spectator: false },
      { text: '2NO₃⁻(aq)', spectator: true  },
      { text: '2K⁺(aq)',    spectator: true  },
      { text: 'CrO₄²⁻(aq)',spectator: false },
    ],
    productChunks: [
      { text: 'Ag₂CrO₄(s)', spectator: false },
      { text: '2K⁺(aq)',     spectator: true  },
      { text: '2NO₃⁻(aq)',  spectator: true  },
    ],
    spectatorIons: ['K⁺(aq)', 'NO₃⁻(aq)'],
    netIonic: '2Ag⁺(aq) + CrO₄²⁻(aq) → Ag₂CrO₄(s)',
    note: 'Brick-red precipitate. Used in the Mohr titration method.',
  },
  {
    id: 'FeCl3+3NaOH',
    category: 'precipitation',
    title: 'FeCl₃ + 3NaOH',
    molecular: 'FeCl₃(aq) + 3NaOH(aq) → Fe(OH)₃(s) + 3NaCl(aq)',
    reactantChunks: [
      { text: 'Fe³⁺(aq)',  spectator: false },
      { text: '3Cl⁻(aq)', spectator: true  },
      { text: '3Na⁺(aq)', spectator: true  },
      { text: '3OH⁻(aq)', spectator: false },
    ],
    productChunks: [
      { text: 'Fe(OH)₃(s)', spectator: false },
      { text: '3Na⁺(aq)',   spectator: true  },
      { text: '3Cl⁻(aq)',   spectator: true  },
    ],
    spectatorIons: ['Na⁺(aq)', 'Cl⁻(aq)'],
    netIonic: 'Fe³⁺(aq) + 3OH⁻(aq) → Fe(OH)₃(s)',
    note: 'Rust-orange/brown precipitate of iron(III) hydroxide.',
  },
  {
    id: 'CuSO4+2NaOH',
    category: 'precipitation',
    title: 'CuSO₄ + 2NaOH',
    molecular: 'CuSO₄(aq) + 2NaOH(aq) → Cu(OH)₂(s) + Na₂SO₄(aq)',
    reactantChunks: [
      { text: 'Cu²⁺(aq)',  spectator: false },
      { text: 'SO₄²⁻(aq)',spectator: true  },
      { text: '2Na⁺(aq)', spectator: true  },
      { text: '2OH⁻(aq)', spectator: false },
    ],
    productChunks: [
      { text: 'Cu(OH)₂(s)', spectator: false },
      { text: '2Na⁺(aq)',   spectator: true  },
      { text: 'SO₄²⁻(aq)', spectator: true  },
    ],
    spectatorIons: ['Na⁺(aq)', 'SO₄²⁻(aq)'],
    netIonic: 'Cu²⁺(aq) + 2OH⁻(aq) → Cu(OH)₂(s)',
    note: 'Pale blue gelatinous precipitate.',
  },
  {
    id: 'Pb(NO3)2+Na2SO4',
    category: 'precipitation',
    title: 'Pb(NO₃)₂ + Na₂SO₄',
    molecular: 'Pb(NO₃)₂(aq) + Na₂SO₄(aq) → PbSO₄(s) + 2NaNO₃(aq)',
    reactantChunks: [
      { text: 'Pb²⁺(aq)',   spectator: false },
      { text: '2NO₃⁻(aq)', spectator: true  },
      { text: '2Na⁺(aq)',   spectator: true  },
      { text: 'SO₄²⁻(aq)', spectator: false },
    ],
    productChunks: [
      { text: 'PbSO₄(s)',   spectator: false },
      { text: '2Na⁺(aq)',   spectator: true  },
      { text: '2NO₃⁻(aq)', spectator: true  },
    ],
    spectatorIons: ['Na⁺(aq)', 'NO₃⁻(aq)'],
    netIonic: 'Pb²⁺(aq) + SO₄²⁻(aq) → PbSO₄(s)',
    note: 'White precipitate of lead(II) sulfate.',
  },

  // ── Acid-Base ───────────────────────────────────────────────────────────────
  {
    id: 'HCl+NaOH',
    category: 'acid_base',
    title: 'HCl + NaOH  (strong + strong)',
    molecular: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
    reactantChunks: [
      { text: 'H⁺(aq)',  spectator: false },
      { text: 'Cl⁻(aq)', spectator: true  },
      { text: 'Na⁺(aq)', spectator: true  },
      { text: 'OH⁻(aq)', spectator: false },
    ],
    productChunks: [
      { text: 'Na⁺(aq)', spectator: true  },
      { text: 'Cl⁻(aq)', spectator: true  },
      { text: 'H₂O(l)',  spectator: false },
    ],
    spectatorIons: ['Na⁺(aq)', 'Cl⁻(aq)'],
    netIonic: 'H⁺(aq) + OH⁻(aq) → H₂O(l)',
    note: 'All strong acid + strong base neutralizations share this same net ionic equation.',
  },
  {
    id: 'H2SO4+2KOH',
    category: 'acid_base',
    title: 'H₂SO₄ + 2KOH  (strong + strong)',
    molecular: 'H₂SO₄(aq) + 2KOH(aq) → K₂SO₄(aq) + 2H₂O(l)',
    reactantChunks: [
      { text: '2H⁺(aq)',  spectator: false },
      { text: 'SO₄²⁻(aq)',spectator: true  },
      { text: '2K⁺(aq)',  spectator: true  },
      { text: '2OH⁻(aq)', spectator: false },
    ],
    productChunks: [
      { text: '2K⁺(aq)',  spectator: true  },
      { text: 'SO₄²⁻(aq)',spectator: true  },
      { text: '2H₂O(l)',  spectator: false },
    ],
    spectatorIons: ['K⁺(aq)', 'SO₄²⁻(aq)'],
    netIonic: 'H⁺(aq) + OH⁻(aq) → H₂O(l)',
    note: 'Coefficients balance to 2H⁺ + 2OH⁻ → 2H₂O, which simplifies to the same H⁺ + OH⁻ → H₂O.',
  },
  {
    id: 'HNO3+Ca(OH)2',
    category: 'acid_base',
    title: '2HNO₃ + Ca(OH)₂  (strong + strong)',
    molecular: '2HNO₃(aq) + Ca(OH)₂(aq) → Ca(NO₃)₂(aq) + 2H₂O(l)',
    reactantChunks: [
      { text: '2H⁺(aq)',   spectator: false },
      { text: '2NO₃⁻(aq)', spectator: true  },
      { text: 'Ca²⁺(aq)',  spectator: true  },
      { text: '2OH⁻(aq)',  spectator: false },
    ],
    productChunks: [
      { text: 'Ca²⁺(aq)',   spectator: true  },
      { text: '2NO₃⁻(aq)', spectator: true  },
      { text: '2H₂O(l)',    spectator: false },
    ],
    spectatorIons: ['Ca²⁺(aq)', 'NO₃⁻(aq)'],
    netIonic: 'H⁺(aq) + OH⁻(aq) → H₂O(l)',
  },
  {
    id: 'CH3COOH+NaOH',
    category: 'acid_base',
    title: 'CH₃COOH + NaOH  (weak + strong)',
    molecular: 'CH₃COOH(aq) + NaOH(aq) → CH₃COONa(aq) + H₂O(l)',
    reactantChunks: [
      { text: 'CH₃COOH(aq)', spectator: false },
      { text: 'Na⁺(aq)',      spectator: true  },
      { text: 'OH⁻(aq)',      spectator: false },
    ],
    productChunks: [
      { text: 'Na⁺(aq)',      spectator: true  },
      { text: 'CH₃COO⁻(aq)', spectator: false },
      { text: 'H₂O(l)',       spectator: false },
    ],
    spectatorIons: ['Na⁺(aq)'],
    netIonic: 'CH₃COOH(aq) + OH⁻(aq) → CH₃COO⁻(aq) + H₂O(l)',
    note: 'Weak acid stays molecular (not split). The conjugate base CH₃COO⁻ is the product, not a spectator.',
  },
  {
    id: 'HF+NaOH',
    category: 'acid_base',
    title: 'HF + NaOH  (weak + strong)',
    molecular: 'HF(aq) + NaOH(aq) → NaF(aq) + H₂O(l)',
    reactantChunks: [
      { text: 'HF(aq)',   spectator: false },
      { text: 'Na⁺(aq)', spectator: true  },
      { text: 'OH⁻(aq)', spectator: false },
    ],
    productChunks: [
      { text: 'Na⁺(aq)', spectator: true  },
      { text: 'F⁻(aq)',  spectator: false },
      { text: 'H₂O(l)',  spectator: false },
    ],
    spectatorIons: ['Na⁺(aq)'],
    netIonic: 'HF(aq) + OH⁻(aq) → F⁻(aq) + H₂O(l)',
    note: 'HF is a weak acid — it does not split into H⁺ and F⁻ in the ionic equation.',
  },
  {
    id: 'HCN+KOH',
    category: 'acid_base',
    title: 'HCN + KOH  (weak + strong)',
    molecular: 'HCN(aq) + KOH(aq) → KCN(aq) + H₂O(l)',
    reactantChunks: [
      { text: 'HCN(aq)', spectator: false },
      { text: 'K⁺(aq)',  spectator: true  },
      { text: 'OH⁻(aq)', spectator: false },
    ],
    productChunks: [
      { text: 'K⁺(aq)',  spectator: true  },
      { text: 'CN⁻(aq)', spectator: false },
      { text: 'H₂O(l)',  spectator: false },
    ],
    spectatorIons: ['K⁺(aq)'],
    netIonic: 'HCN(aq) + OH⁻(aq) → CN⁻(aq) + H₂O(l)',
  },
  {
    id: 'HCl+NH3',
    category: 'acid_base',
    title: 'HCl + NH₃  (strong + weak)',
    molecular: 'HCl(aq) + NH₃(aq) → NH₄Cl(aq)',
    reactantChunks: [
      { text: 'H⁺(aq)',  spectator: false },
      { text: 'Cl⁻(aq)', spectator: true  },
      { text: 'NH₃(aq)', spectator: false },
    ],
    productChunks: [
      { text: 'NH₄⁺(aq)', spectator: false },
      { text: 'Cl⁻(aq)',  spectator: true  },
    ],
    spectatorIons: ['Cl⁻(aq)'],
    netIonic: 'H⁺(aq) + NH₃(aq) → NH₄⁺(aq)',
    note: 'NH₃ is a weak base — stays molecular. The product NH₄⁺ is soluble so no precipitate forms.',
  },
  {
    id: 'HNO3+NH3',
    category: 'acid_base',
    title: 'HNO₃ + NH₃  (strong + weak)',
    molecular: 'HNO₃(aq) + NH₃(aq) → NH₄NO₃(aq)',
    reactantChunks: [
      { text: 'H⁺(aq)',   spectator: false },
      { text: 'NO₃⁻(aq)', spectator: true  },
      { text: 'NH₃(aq)',  spectator: false },
    ],
    productChunks: [
      { text: 'NH₄⁺(aq)',  spectator: false },
      { text: 'NO₃⁻(aq)', spectator: true  },
    ],
    spectatorIons: ['NO₃⁻(aq)'],
    netIonic: 'H⁺(aq) + NH₃(aq) → NH₄⁺(aq)',
  },

  // ── Gas-Forming ─────────────────────────────────────────────────────────────
  {
    id: 'Na2CO3+2HCl',
    category: 'gas_forming',
    title: 'Na₂CO₃ + 2HCl  (CO₂)',
    molecular: 'Na₂CO₃(aq) + 2HCl(aq) → 2NaCl(aq) + H₂O(l) + CO₂(g)',
    reactantChunks: [
      { text: '2Na⁺(aq)',  spectator: true  },
      { text: 'CO₃²⁻(aq)', spectator: false },
      { text: '2H⁺(aq)',   spectator: false },
      { text: '2Cl⁻(aq)',  spectator: true  },
    ],
    productChunks: [
      { text: '2Na⁺(aq)', spectator: true  },
      { text: '2Cl⁻(aq)', spectator: true  },
      { text: 'H₂O(l)',   spectator: false },
      { text: 'CO₂(g)',   spectator: false },
    ],
    spectatorIons: ['Na⁺(aq)', 'Cl⁻(aq)'],
    netIonic: 'CO₃²⁻(aq) + 2H⁺(aq) → H₂O(l) + CO₂(g)',
    note: 'Effervescence (bubbling) observed. CO₂ gas produced via H₂CO₃ decomposition.',
  },
  {
    id: 'CaCO3+2HCl',
    category: 'gas_forming',
    title: 'CaCO₃(s) + 2HCl  (CO₂)',
    molecular: 'CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)',
    reactantChunks: [
      { text: 'CaCO₃(s)', spectator: false },
      { text: '2H⁺(aq)',  spectator: false },
      { text: '2Cl⁻(aq)', spectator: true  },
    ],
    productChunks: [
      { text: 'Ca²⁺(aq)', spectator: false },
      { text: '2Cl⁻(aq)', spectator: true  },
      { text: 'H₂O(l)',   spectator: false },
      { text: 'CO₂(g)',   spectator: false },
    ],
    spectatorIons: ['Cl⁻(aq)'],
    netIonic: 'CaCO₃(s) + 2H⁺(aq) → Ca²⁺(aq) + H₂O(l) + CO₂(g)',
    note: 'Insoluble CaCO₃ stays intact until the acid dissolves it. Classic "vinegar on chalk" reaction.',
  },
  {
    id: 'NaHCO3+HCl',
    category: 'gas_forming',
    title: 'NaHCO₃ + HCl  (CO₂)',
    molecular: 'NaHCO₃(aq) + HCl(aq) → NaCl(aq) + H₂O(l) + CO₂(g)',
    reactantChunks: [
      { text: 'Na⁺(aq)',   spectator: true  },
      { text: 'HCO₃⁻(aq)', spectator: false },
      { text: 'H⁺(aq)',    spectator: false },
      { text: 'Cl⁻(aq)',   spectator: true  },
    ],
    productChunks: [
      { text: 'Na⁺(aq)', spectator: true  },
      { text: 'Cl⁻(aq)', spectator: true  },
      { text: 'H₂O(l)',  spectator: false },
      { text: 'CO₂(g)',  spectator: false },
    ],
    spectatorIons: ['Na⁺(aq)', 'Cl⁻(aq)'],
    netIonic: 'HCO₃⁻(aq) + H⁺(aq) → H₂O(l) + CO₂(g)',
    note: 'Baking soda reacting with acid — same reaction as in baking powder.',
  },
  {
    id: 'Na2S+2HCl',
    category: 'gas_forming',
    title: 'Na₂S + 2HCl  (H₂S)',
    molecular: 'Na₂S(aq) + 2HCl(aq) → 2NaCl(aq) + H₂S(g)',
    reactantChunks: [
      { text: '2Na⁺(aq)', spectator: true  },
      { text: 'S²⁻(aq)',  spectator: false },
      { text: '2H⁺(aq)',  spectator: false },
      { text: '2Cl⁻(aq)', spectator: true  },
    ],
    productChunks: [
      { text: '2Na⁺(aq)', spectator: true  },
      { text: '2Cl⁻(aq)', spectator: true  },
      { text: 'H₂S(g)',   spectator: false },
    ],
    spectatorIons: ['Na⁺(aq)', 'Cl⁻(aq)'],
    netIonic: 'S²⁻(aq) + 2H⁺(aq) → H₂S(g)',
    note: 'Rotten-egg odor of H₂S gas is the observable sign.',
  },
  {
    id: 'NH4Cl+NaOH',
    category: 'gas_forming',
    title: 'NH₄Cl + NaOH  (NH₃)',
    molecular: 'NH₄Cl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l) + NH₃(g)',
    reactantChunks: [
      { text: 'NH₄⁺(aq)', spectator: false },
      { text: 'Cl⁻(aq)',  spectator: true  },
      { text: 'Na⁺(aq)',  spectator: true  },
      { text: 'OH⁻(aq)',  spectator: false },
    ],
    productChunks: [
      { text: 'Na⁺(aq)', spectator: true  },
      { text: 'Cl⁻(aq)', spectator: true  },
      { text: 'H₂O(l)',  spectator: false },
      { text: 'NH₃(g)',  spectator: false },
    ],
    spectatorIons: ['Na⁺(aq)', 'Cl⁻(aq)'],
    netIonic: 'NH₄⁺(aq) + OH⁻(aq) → H₂O(l) + NH₃(g)',
    note: 'Pungent ammonia gas released. Turns moist red litmus paper blue.',
  },
  {
    id: 'Na2SO3+2HCl',
    category: 'gas_forming',
    title: 'Na₂SO₃ + 2HCl  (SO₂)',
    molecular: 'Na₂SO₃(aq) + 2HCl(aq) → 2NaCl(aq) + H₂O(l) + SO₂(g)',
    reactantChunks: [
      { text: '2Na⁺(aq)',  spectator: true  },
      { text: 'SO₃²⁻(aq)', spectator: false },
      { text: '2H⁺(aq)',   spectator: false },
      { text: '2Cl⁻(aq)',  spectator: true  },
    ],
    productChunks: [
      { text: '2Na⁺(aq)', spectator: true  },
      { text: '2Cl⁻(aq)', spectator: true  },
      { text: 'H₂O(l)',   spectator: false },
      { text: 'SO₂(g)',   spectator: false },
    ],
    spectatorIons: ['Na⁺(aq)', 'Cl⁻(aq)'],
    netIonic: 'SO₃²⁻(aq) + 2H⁺(aq) → H₂O(l) + SO₂(g)',
    note: 'Sharp, pungent odor of SO₂ gas.',
  },

  // ── Redox ───────────────────────────────────────────────────────────────────
  {
    id: 'Zn+H2SO4',
    category: 'redox',
    title: 'Zn + H₂SO₄  (metal + acid)',
    molecular: 'Zn(s) + H₂SO₄(aq) → ZnSO₄(aq) + H₂(g)',
    reactantChunks: [
      { text: 'Zn(s)',     spectator: false },
      { text: '2H⁺(aq)',  spectator: false },
      { text: 'SO₄²⁻(aq)',spectator: true  },
    ],
    productChunks: [
      { text: 'Zn²⁺(aq)',  spectator: false },
      { text: 'SO₄²⁻(aq)', spectator: true  },
      { text: 'H₂(g)',     spectator: false },
    ],
    spectatorIons: ['SO₄²⁻(aq)'],
    netIonic: 'Zn(s) + 2H⁺(aq) → Zn²⁺(aq) + H₂(g)',
    note: 'Zn is oxidized (0 → +2); H⁺ is reduced (+1 → 0). Bubbling H₂ gas observed.',
  },
  {
    id: 'Mg+2HCl',
    category: 'redox',
    title: 'Mg + 2HCl  (metal + acid)',
    molecular: 'Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)',
    reactantChunks: [
      { text: 'Mg(s)',     spectator: false },
      { text: '2H⁺(aq)',  spectator: false },
      { text: '2Cl⁻(aq)', spectator: true  },
    ],
    productChunks: [
      { text: 'Mg²⁺(aq)', spectator: false },
      { text: '2Cl⁻(aq)', spectator: true  },
      { text: 'H₂(g)',    spectator: false },
    ],
    spectatorIons: ['Cl⁻(aq)'],
    netIonic: 'Mg(s) + 2H⁺(aq) → Mg²⁺(aq) + H₂(g)',
    note: 'Vigorous reaction; Mg is a more active metal than Zn. Same net ionic as all metal + strong acid reactions of this type.',
  },
  {
    id: 'Fe+CuSO4',
    category: 'redox',
    title: 'Fe + CuSO₄  (displacement)',
    molecular: 'Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)',
    reactantChunks: [
      { text: 'Fe(s)',      spectator: false },
      { text: 'Cu²⁺(aq)',  spectator: false },
      { text: 'SO₄²⁻(aq)', spectator: true  },
    ],
    productChunks: [
      { text: 'Fe²⁺(aq)',  spectator: false },
      { text: 'SO₄²⁻(aq)', spectator: true  },
      { text: 'Cu(s)',      spectator: false },
    ],
    spectatorIons: ['SO₄²⁻(aq)'],
    netIonic: 'Fe(s) + Cu²⁺(aq) → Fe²⁺(aq) + Cu(s)',
    note: 'Fe is oxidized (0 → +2); Cu²⁺ is reduced (+2 → 0). Copper metal plates out; solution turns from blue to pale green.',
  },
  {
    id: 'Zn+2AgNO3',
    category: 'redox',
    title: 'Zn + 2AgNO₃  (displacement)',
    molecular: 'Zn(s) + 2AgNO₃(aq) → Zn(NO₃)₂(aq) + 2Ag(s)',
    reactantChunks: [
      { text: 'Zn(s)',      spectator: false },
      { text: '2Ag⁺(aq)',   spectator: false },
      { text: '2NO₃⁻(aq)', spectator: true  },
    ],
    productChunks: [
      { text: 'Zn²⁺(aq)',   spectator: false },
      { text: '2NO₃⁻(aq)', spectator: true  },
      { text: '2Ag(s)',      spectator: false },
    ],
    spectatorIons: ['NO₃⁻(aq)'],
    netIonic: 'Zn(s) + 2Ag⁺(aq) → Zn²⁺(aq) + 2Ag(s)',
    note: 'Silver metal deposits on the zinc surface. Zn is higher on the activity series than Ag.',
  },
  {
    id: '2Na+2H2O',
    category: 'redox',
    title: '2Na + 2H₂O  (active metal + water)',
    molecular: '2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂(g)',
    reactantChunks: [
      { text: '2Na(s)',  spectator: false },
      { text: '2H₂O(l)', spectator: false },
    ],
    productChunks: [
      { text: '2Na⁺(aq)', spectator: false },
      { text: '2OH⁻(aq)', spectator: false },
      { text: 'H₂(g)',    spectator: false },
    ],
    spectatorIons: [],
    netIonic: '2Na(s) + 2H₂O(l) → 2Na⁺(aq) + 2OH⁻(aq) + H₂(g)',
    note: 'No spectator ions — the molecular and net ionic equations are identical. Violent reaction; Na floats and ignites.',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<RxnCategory, { label: string; color: string }> = {
  precipitation: { label: 'Precipitation',          color: '#60a5fa' },
  acid_base:     { label: 'Acid-Base',               color: '#4ade80' },
  gas_forming:   { label: 'Gas-Forming',             color: '#fbbf24' },
  redox:         { label: 'Redox',                   color: '#f472b6' },
}

type Filter = 'all' | RxnCategory

// ── Ionic equation renderer ───────────────────────────────────────────────────

function IonicEquation({ reactants, products, highlight }: {
  reactants: IonicChunk[]
  products: IonicChunk[]
  highlight: boolean
}) {
  function renderSide(chunks: IonicChunk[]) {
    return chunks.map((chunk, i) => (
      <span key={i} className="flex items-center gap-1">
        {i > 0 && <span className="font-mono text-sm text-dim mx-1">+</span>}
        <span
          className="font-mono text-sm transition-all"
          style={chunk.spectator
            ? { color: 'rgba(var(--overlay),0.22)', textDecoration: 'line-through', textDecorationColor: 'rgba(var(--overlay),0.18)' }
            : { color: highlight ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.85)' }
          }
        >
          {chunk.text}
        </span>
      </span>
    ))
  }
  return (
    <div className="flex flex-wrap items-center gap-1 font-mono text-sm">
      {renderSide(reactants)}
      <span className="font-mono text-sm text-dim mx-2">→</span>
      {renderSide(products)}
    </div>
  )
}

// ── Rules reference ───────────────────────────────────────────────────────────

const SPLIT_RULES = [
  { label: 'Strong acids',   examples: 'HCl, HBr, HI, HNO₃, H₂SO₄, HClO₄',   split: true },
  { label: 'Strong bases',   examples: 'NaOH, KOH, Ca(OH)₂, Ba(OH)₂',          split: true },
  { label: 'Soluble ionic salts', examples: 'NaCl, KNO₃, Na₂SO₄, CaCl₂, …',   split: true },
  { label: 'Weak acids',     examples: 'HF, CH₃COOH, HCN, H₂CO₃, HNO₂, …',   split: false },
  { label: 'Weak bases',     examples: 'NH₃, pyridine, …',                      split: false },
  { label: 'Water',          examples: 'H₂O(l)',                                 split: false },
  { label: 'Gases',          examples: 'CO₂(g), H₂S(g), SO₂(g), NH₃(g), H₂(g)', split: false },
  { label: 'Precipitates',   examples: 'AgCl(s), BaSO₄(s), CaCO₃(s), …',       split: false },
  { label: 'Insoluble solids / metals', examples: 'Fe(s), Zn(s), Cu(s), …',    split: false },
]

// ── Main component ────────────────────────────────────────────────────────────

export default function NetIonicTool() {
  const [filter, setFilter]       = useState<Filter>('all')
  const [selected, setSelected]   = useState<Reaction | null>(null)
  const [showRules, setShowRules] = useState(false)

  const visible = filter === 'all'
    ? REACTIONS
    : REACTIONS.filter(r => r.category === filter)

  const color = selected ? CATEGORY_META[selected.category].color : 'var(--c-halogen)'

  return (
    <div className="flex flex-col gap-8 max-w-4xl">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="font-sans font-semibold text-bright text-xl">Net Ionic Equation Generator</h2>
        <p className="font-sans text-base text-secondary">
          Select a reaction to see the full molecular → complete ionic → net ionic step-by-step.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1 p-1 rounded-sm self-start"
        style={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))' }}>
        {(['all', 'precipitation', 'acid_base', 'gas_forming', 'redox'] as Filter[]).map(f => {
          const isActive = filter === f
          const meta = f === 'all' ? null : CATEGORY_META[f]
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="relative flex-shrink-0 px-3 py-1.5 rounded-sm font-sans text-sm font-medium transition-colors"
              style={{ color: isActive ? (meta?.color ?? 'var(--c-halogen)') : 'rgba(var(--overlay),0.4)' }}>
              {isActive && (
                <motion.div layoutId="net-ionic-pill" className="absolute inset-0 rounded-sm"
                  style={{
                    background: `color-mix(in srgb, ${meta?.color ?? 'var(--c-halogen)'} 12%, rgb(var(--color-raised)))`,
                    border: `1px solid color-mix(in srgb, ${meta?.color ?? 'var(--c-halogen)'} 30%, transparent)`,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative z-10">
                {f === 'all' ? 'All' : CATEGORY_META[f].label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-row gap-6">

        {/* Reaction list */}
        <div className="flex flex-col gap-1 w-64 shrink-0 overflow-y-auto max-h-[600px]">
          {visible.map(rxn => {
            const meta = CATEGORY_META[rxn.category]
            const isSelected = selected?.id === rxn.id
            return (
              <button key={rxn.id} onClick={() => setSelected(isSelected ? null : rxn)}
                className="flex flex-col gap-0.5 px-3 py-2.5 rounded-sm text-left transition-colors"
                style={isSelected ? {
                  background: `color-mix(in srgb, ${meta.color} 10%, rgb(var(--color-raised)))`,
                  border: `1px solid color-mix(in srgb, ${meta.color} 30%, transparent)`,
                } : {
                  border: '1px solid transparent',
                  background: 'rgba(var(--overlay),0.03)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color }} />
                  <span className="font-mono text-sm" style={{ color: isSelected ? meta.color : 'rgba(var(--overlay),0.8)' }}>
                    {rxn.title}
                  </span>
                </div>
                <span className="font-mono text-xs text-secondary pl-4 leading-relaxed truncate">
                  {rxn.netIonic}
                </span>
              </button>
            )
          })}
        </div>

        {/* Detail panel */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
                className="flex flex-col gap-5 rounded-sm border bg-surface p-5"
                style={{ borderColor: `color-mix(in srgb, ${color} 28%, transparent)` }}
              >
                {/* Title + badge */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-sans text-base font-semibold text-bright">{selected.title}</span>
                  <span className="px-2 py-0.5 rounded-sm font-mono text-xs"
                    style={{
                      background: `color-mix(in srgb, ${color} 15%, rgb(var(--color-raised)))`,
                      border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
                      color,
                    }}>
                    {CATEGORY_META[selected.category].label}
                  </span>
                </div>

                {/* Step 1 */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-xs text-secondary tracking-widest uppercase">
                    Step 1 — Molecular Equation
                  </span>
                  <div className="rounded-sm border border-border bg-raised px-4 py-3">
                    <span className="font-mono text-base" style={{ color: 'rgba(var(--overlay),0.75)' }}>
                      {selected.molecular}
                    </span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-secondary tracking-widest uppercase">
                      Step 2 — Complete Ionic Equation
                    </span>
                    {selected.spectatorIons.length > 0 && (
                      <span className="font-mono text-xs text-secondary">
                        (spectators struck through)
                      </span>
                    )}
                  </div>
                  <div className="rounded-sm border border-border bg-raised px-4 py-3 overflow-x-auto">
                    <IonicEquation
                      reactants={selected.reactantChunks}
                      products={selected.productChunks}
                      highlight={false}
                    />
                  </div>
                </div>

                {/* Spectator ions */}
                {selected.spectatorIons.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-xs text-secondary tracking-widest uppercase">
                      Spectator Ions — cancelled from both sides
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selected.spectatorIons.map(ion => (
                        <span key={ion}
                          className="px-2.5 py-1 rounded-sm font-mono text-sm border border-border text-secondary"
                          style={{ textDecoration: 'line-through', textDecorationColor: 'rgba(var(--overlay),0.3)' }}>
                          {ion}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-sm border border-border bg-raised px-3 py-2">
                    <span className="font-mono text-sm text-secondary">No spectator ions — molecular and net ionic equations are identical.</span>
                  </div>
                )}

                {/* Step 3 */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-xs tracking-widest uppercase" style={{ color }}>
                    Step 3 — Net Ionic Equation
                  </span>
                  <div className="rounded-sm border px-4 py-3 overflow-x-auto"
                    style={{
                      borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
                      background: `color-mix(in srgb, ${color} 6%, rgb(var(--color-raised)))`,
                    }}>
                    <span className="font-mono text-base font-semibold" style={{ color }}>
                      {selected.netIonic}
                    </span>
                  </div>
                </div>

                {/* Note */}
                {selected.note && (
                  <p className="font-sans text-base text-secondary leading-relaxed border-t border-border pt-4">
                    {selected.note}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center justify-center rounded-sm border border-border bg-surface h-40 lg:h-full"
              >
                <span className="font-mono text-base text-secondary">Select a reaction to see the breakdown.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Rules reference */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowRules(v => !v)}
          className="flex items-center gap-2 font-mono text-sm text-secondary hover:text-primary transition-colors self-start"
        >
          <motion.span animate={{ rotate: showRules ? 90 : 0 }} transition={{ duration: 0.15 }}
            className="text-xs">▶</motion.span>
          What gets split into ions vs. kept molecular?
        </button>
        <AnimatePresence initial={false}>
          {showRules && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className="rounded-sm border border-border overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 px-4 py-2 bg-raised border-b border-border">
                  <span className="font-mono text-xs text-secondary tracking-widest uppercase">Compound type</span>
                  <span className="font-mono text-xs text-secondary tracking-widest uppercase">Examples</span>
                  <span className="font-mono text-xs text-secondary tracking-widest uppercase">In ionic eq.</span>
                </div>
                {SPLIT_RULES.map(r => (
                  <div key={r.label}
                    className="grid grid-cols-[auto_1fr_auto] gap-x-4 items-center px-4 py-2.5 border-b border-border last:border-b-0 bg-surface">
                    <span className="font-sans text-base text-primary w-44 shrink-0">{r.label}</span>
                    <span className="font-mono text-sm text-secondary">{r.examples}</span>
                    <span className="font-mono text-sm shrink-0 ml-4"
                      style={{ color: r.split ? '#4ade80' : '#f87171' }}>
                      {r.split ? 'Split → ions' : 'Keep molecular'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="font-mono text-xs text-secondary">
        Spectator ions appear identically on both sides of the complete ionic equation and are removed to give the net ionic equation.
      </p>
    </div>
  )
}
