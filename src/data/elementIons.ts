// Common ions indexed by atomic number.
// Elements with no entry form no stable ionic compounds (noble gases, etc.).

export interface IonEntry {
  charge: number
  note: string
  common?: boolean   // most stable / frequently encountered form
}

export const IONS: Record<number, IonEntry[]> = {
  // ── Period 1 ──────────────────────────────────────────────────────────────
  1: [
    { charge: +1, note: 'Loses its only electron; the bare proton (H⁺) is the basis of acid–base chemistry', common: true },
    { charge: -1, note: 'Gains 1 electron to fill the 1s orbital; hydride ion in reactive metal compounds' },
  ],

  // ── Period 2 ──────────────────────────────────────────────────────────────
  3:  [{ charge: +1, note: 'Loses its 2s¹ valence electron, achieving the stable [He] core', common: true }],
  4:  [{ charge: +2, note: 'Loses both 2s² valence electrons, achieving the stable [He] core', common: true }],
  5:  [{ charge: +3, note: 'Loses all 3 valence electrons (2s² 2p¹); mostly forms covalent bonds in practice' }],
  // C (6): covalent; no practical simple ion
  7: [
    { charge: -3, note: 'Gains 3 electrons to complete the 2p subshell; nitride N³⁻ found in metal nitrides', common: true },
    { charge: +3, note: 'Loses 3 electrons; found in nitrogen oxides and nitrite (NO₂⁻)' },
    { charge: +5, note: 'Loses 5 valence electrons; found in nitrate (NO₃⁻) and HNO₃' },
  ],
  8: [
    { charge: -2, note: 'Gains 2 electrons to complete the 2p subshell; oxide O²⁻ is the most common anion in minerals', common: true },
    { charge: -1, note: 'Superoxide O⁻: gains 1 electron, leaving an unpaired electron' },
  ],
  9:  [{ charge: -1, note: 'Gains 1 electron to fill the 2p subshell; the most electronegative element', common: true }],

  // ── Period 3 ──────────────────────────────────────────────────────────────
  11: [{ charge: +1, note: 'Loses its 3s¹ valence electron, achieving the stable [Ne] core', common: true }],
  12: [{ charge: +2, note: 'Loses both 3s² valence electrons, achieving the stable [Ne] core', common: true }],
  13: [{ charge: +3, note: 'Loses all 3 valence electrons (3s² 3p¹), achieving the stable [Ne] core', common: true }],
  14: [{ charge: +4, note: 'Loses 4 valence electrons; Si⁴⁺ exists in some ceramics — mostly forms covalent compounds' }],
  15: [
    { charge: -3, note: 'Gains 3 electrons to complete the 3p subshell; phosphide P³⁻ found in metal phosphides', common: true },
    { charge: +3, note: 'Loses 3 electrons; found in phosphorous acid derivatives (H₃PO₃)' },
    { charge: +5, note: 'Loses all 5 valence electrons; found in phosphate (PO₄³⁻) and phosphoric acid' },
  ],
  16: [
    { charge: -2, note: 'Gains 2 electrons to complete the 3p subshell; sulfide S²⁻ found in many minerals', common: true },
    { charge: +4, note: 'Loses 4 electrons (2 lone pairs remain); found in SO₂ and sulfite (SO₃²⁻)' },
    { charge: +6, note: 'Loses all 6 valence electrons; found in sulfate (SO₄²⁻) and H₂SO₄' },
  ],
  17: [
    { charge: -1, note: 'Gains 1 electron to complete the 3p subshell; chloride Cl⁻ is the most common halide', common: true },
    { charge: +1, note: 'Loses 1 electron; found in hypochlorite (ClO⁻)' },
    { charge: +3, note: 'Loses 3 electrons; found in chlorite (ClO₂⁻)' },
    { charge: +5, note: 'Loses 5 electrons; found in chlorate (ClO₃⁻)' },
    { charge: +7, note: 'Loses all 7 valence electrons; found in perchlorate (ClO₄⁻)' },
  ],

  // ── Period 4 — main group ──────────────────────────────────────────────────
  19: [{ charge: +1, note: 'Loses its 4s¹ valence electron, achieving the stable [Ar] core', common: true }],
  20: [{ charge: +2, note: 'Loses both 4s² valence electrons, achieving the stable [Ar] core', common: true }],

  // ── Period 4 — first transition series ────────────────────────────────────
  21: [{ charge: +3, note: 'Loses 2 electrons from 4s and 1 from 3d, achieving the stable [Ar] core', common: true }],
  22: [
    { charge: +4, note: 'Loses all 4 valence electrons (4s² 3d²); most stable in solid compounds such as TiO₂', common: true },
    { charge: +3, note: 'Loses 3 electrons; [Ar] 3d¹, common purple Ti³⁺ ion in solution' },
    { charge: +2, note: 'Loses 2 electrons; [Ar] 3d², less stable' },
  ],
  23: [
    { charge: +5, note: 'Loses all 5 valence electrons; found in vanadate (VO₄³⁻)' },
    { charge: +4, note: 'Loses 4 electrons; [Ar] 3d¹, blue vanadyl ion VO²⁺', common: true },
    { charge: +3, note: 'Loses 3 electrons; [Ar] 3d², green V³⁺ ion' },
    { charge: +2, note: 'Loses 2 electrons; [Ar] 3d³, violet V²⁺ ion' },
  ],
  24: [
    { charge: +3, note: 'Loses 3 electrons; [Ar] 3d³ — the most stable and commonly encountered form', common: true },
    { charge: +6, note: 'Loses 6 electrons; found in chromate (CrO₄²⁻) and dichromate (Cr₂O₇²⁻); strongly oxidising' },
    { charge: +2, note: 'Loses 2 electrons; [Ar] 3d⁴, a strong reducing agent' },
  ],
  25: [
    { charge: +2, note: 'Loses 2 electrons from 4s; [Ar] 3d⁵ half-filled shell — extra stability', common: true },
    { charge: +3, note: 'Loses 3 electrons; [Ar] 3d⁴, found in MnO(OH)' },
    { charge: +4, note: 'Loses 4 electrons; [Ar] 3d³, found in MnO₂' },
    { charge: +7, note: 'Loses all 7 valence electrons; permanganate MnO₄⁻, a powerful oxidiser' },
  ],
  26: [
    { charge: +2, note: 'Loses 2 electrons from 4s; [Ar] 3d⁶ — ferrous Fe²⁺, common in FeCl₂ and FeS', common: true },
    { charge: +3, note: 'Loses 3 electrons; [Ar] 3d⁵ half-filled shell — ferric Fe³⁺, slightly more stable', common: true },
  ],
  27: [
    { charge: +2, note: 'Loses 2 electrons from 4s; [Ar] 3d⁷ — cobaltous Co²⁺, most stable in solution', common: true },
    { charge: +3, note: 'Loses 3 electrons; [Ar] 3d⁶ — cobaltic, stable in complexes like Co(NH₃)₆³⁺' },
  ],
  28: [
    { charge: +2, note: 'Loses 2 electrons from 4s; [Ar] 3d⁸ — nickel almost exclusively forms Ni²⁺', common: true },
    { charge: +3, note: 'Loses 3 electrons; [Ar] 3d⁷, found in nickel batteries (NiOOH)' },
  ],
  29: [
    { charge: +2, note: 'Loses 2 electrons; [Ar] 3d⁹ — cupric Cu²⁺, most common in aqueous solution', common: true },
    { charge: +1, note: 'Loses 1 electron; achieves filled [Ar] 3d¹⁰ — cuprous Cu⁺, stable in solids and complexes' },
  ],
  30: [{ charge: +2, note: 'Loses 2 electrons from 4s; achieves fully-filled [Ar] 3d¹⁰ — only oxidation state', common: true }],
  31: [{ charge: +3, note: 'Loses all 3 valence electrons (4s² 4p¹), achieving the stable [Ar] 3d¹⁰ core', common: true }],
  32: [
    { charge: +4, note: 'Loses all 4 valence electrons; Ge⁴⁺ in GeO₂ and GeF₄', common: true },
    { charge: +2, note: 'Loses 2 electrons; Ge²⁺ found in GeO and GeS' },
  ],
  33: [
    { charge: -3, note: 'Gains 3 electrons to complete the 4p subshell; arsenide As³⁻ in metal arsenides' },
    { charge: +3, note: 'Loses 3 electrons; found in arsenious acid and arsenite (AsO₃³⁻)', common: true },
    { charge: +5, note: 'Loses 5 electrons; found in arsenate (AsO₄³⁻)' },
  ],
  34: [
    { charge: -2, note: 'Gains 2 electrons to complete the 4p subshell; selenide Se²⁻ in metal selenides', common: true },
    { charge: +4, note: 'Loses 4 electrons; found in selenious acid (H₂SeO₃)' },
    { charge: +6, note: 'Loses all 6 valence electrons; found in selenate (SeO₄²⁻)' },
  ],
  35: [
    { charge: -1, note: 'Gains 1 electron to complete the 4p subshell; bromide Br⁻ is the most common form', common: true },
    { charge: +1, note: 'Loses 1 electron; found in hypobromite (BrO⁻)' },
    { charge: +5, note: 'Loses 5 electrons; found in bromate (BrO₃⁻)' },
  ],

  // ── Period 5 — main group ──────────────────────────────────────────────────
  37: [{ charge: +1, note: 'Loses its 5s¹ valence electron, achieving the stable [Kr] core', common: true }],
  38: [{ charge: +2, note: 'Loses both 5s² valence electrons, achieving the stable [Kr] core', common: true }],

  // ── Period 5 — second transition series ───────────────────────────────────
  39: [{ charge: +3, note: 'Loses 2 electrons from 5s and 1 from 4d, achieving the stable [Kr] core', common: true }],
  40: [{ charge: +4, note: 'Loses all 4 valence electrons (5s² 4d²); Zr⁴⁺ is the only stable ionic form', common: true }],
  41: [
    { charge: +5, note: 'Loses all 5 valence electrons; most stable — found in niobate (NbO₃⁻)', common: true },
    { charge: +3, note: 'Loses 3 electrons; [Kr] 4d², less common' },
  ],
  42: [
    { charge: +6, note: 'Loses all 6 valence electrons; most stable — found in molybdate (MoO₄²⁻)', common: true },
    { charge: +4, note: 'Loses 4 electrons; [Kr] 4d², found in MoS₂' },
    { charge: +3, note: 'Loses 3 electrons; [Kr] 4d³' },
    { charge: +2, note: 'Loses 2 electrons; [Kr] 4d⁴, forms Mo₂⁴⁺ cluster compounds' },
  ],
  43: [
    { charge: +7, note: 'Loses all 7 valence electrons; found in pertechnetate (TcO₄⁻)', common: true },
    { charge: +4, note: 'Loses 4 electrons; found in TcO₂' },
  ],
  44: [
    { charge: +3, note: 'Loses 3 electrons; most common ionic form', common: true },
    { charge: +4, note: 'Loses 4 electrons; found in RuO₂' },
    { charge: +8, note: 'Loses 8 electrons; highest oxidation state in volatile RuO₄' },
  ],
  45: [{ charge: +3, note: 'Loses 3 electrons; almost exclusively forms Rh³⁺', common: true }],
  46: [
    { charge: +2, note: 'Loses 2 electrons; [Kr] 4d⁸ — most common form in palladium catalysis', common: true },
    { charge: +4, note: 'Loses 4 electrons; [Kr] 4d⁶, found in PdF₄' },
  ],
  47: [
    { charge: +1, note: 'Loses 1 electron; achieves filled [Kr] 4d¹⁰ — silver(I) is the most common form', common: true },
    { charge: +2, note: 'Loses 2 electrons; [Kr] 4d⁹, found in AgF₂' },
  ],
  48: [{ charge: +2, note: 'Loses 2 electrons from 5s; achieves fully-filled [Kr] 4d¹⁰ — only stable oxidation state', common: true }],
  49: [{ charge: +3, note: 'Loses all 3 valence electrons (5s² 5p¹); In³⁺ is the most stable form', common: true }],
  50: [
    { charge: +4, note: 'Loses all 4 valence electrons; stannic Sn⁴⁺, most stable in higher oxidation state compounds', common: true },
    { charge: +2, note: 'Loses 2 electrons from 5s; stannous Sn²⁺, common in SnCl₂' },
  ],
  51: [
    { charge: +3, note: 'Loses 3 electrons; Sb³⁺ is the most common ionic form', common: true },
    { charge: +5, note: 'Loses 5 electrons; found in antimonate (SbO₄³⁻)' },
    { charge: -3, note: 'Gains 3 electrons; stibide Sb³⁻, found in some metal alloys' },
  ],
  52: [
    { charge: -2, note: 'Gains 2 electrons to complete the 5p subshell; telluride Te²⁻ in metal tellurides', common: true },
    { charge: +4, note: 'Loses 4 electrons; found in TeO₂' },
    { charge: +6, note: 'Loses all 6 valence electrons; found in tellurate (TeO₄²⁻)' },
  ],
  53: [
    { charge: -1, note: 'Gains 1 electron to complete the 5p subshell; iodide I⁻ is the most common form', common: true },
    { charge: +1, note: 'Loses 1 electron; found in hypoiodite (IO⁻)' },
    { charge: +5, note: 'Loses 5 electrons; found in iodate (IO₃⁻)' },
    { charge: +7, note: 'Loses all 7 valence electrons; found in periodate (IO₄⁻)' },
  ],

  // ── Period 6 — main group & post-transition ────────────────────────────────
  55: [{ charge: +1, note: 'Loses its 6s¹ valence electron, achieving the stable [Xe] core', common: true }],
  56: [{ charge: +2, note: 'Loses both 6s² valence electrons, achieving the stable [Xe] core', common: true }],

  // ── Lanthanides (57–71) ────────────────────────────────────────────────────
  57: [{ charge: +3, note: 'Loses 3 electrons (6s² 5d¹); [Xe] 4f⁰ core — La³⁺ has no f electrons', common: true }],
  58: [
    { charge: +3, note: 'Loses 3 electrons; [Xe] 4f¹ — most common in solution', common: true },
    { charge: +4, note: 'Loses 4 electrons; [Xe] 4f⁰ — Ce⁴⁺ achieves the stable Xe core; used as an oxidant' },
  ],
  59: [
    { charge: +3, note: 'Loses 3 electrons; [Xe] 4f², most stable form', common: true },
    { charge: +4, note: 'Loses 4 electrons; found in PrO₂' },
  ],
  60: [{ charge: +3, note: 'Loses 3 electrons; [Xe] 4f³ — the most common lanthanide oxidation state', common: true }],
  61: [{ charge: +3, note: 'Loses 3 electrons; all isotopes are radioactive, no stable compounds', common: true }],
  62: [
    { charge: +3, note: 'Loses 3 electrons; [Xe] 4f⁵, most common form', common: true },
    { charge: +2, note: 'Loses 2 electrons; [Xe] 4f⁶ — approaching half-filled 4f provides some stability' },
  ],
  63: [
    { charge: +3, note: 'Loses 3 electrons; [Xe] 4f⁴, most common form', common: true },
    { charge: +2, note: 'Loses 2 electrons; [Xe] 4f⁷ — half-filled 4f shell gives extra stability' },
  ],
  64: [{ charge: +3, note: 'Loses 3 electrons; [Xe] 4f⁷ — half-filled 4f shell provides extra stability', common: true }],
  65: [
    { charge: +3, note: 'Loses 3 electrons; [Xe] 4f⁸, most common form', common: true },
    { charge: +4, note: 'Loses 4 electrons; found in TbO₂' },
  ],
  66: [{ charge: +3, note: 'Loses 3 electrons; [Xe] 4f⁹, standard lanthanide oxidation state', common: true }],
  67: [{ charge: +3, note: 'Loses 3 electrons; [Xe] 4f¹⁰, standard lanthanide oxidation state', common: true }],
  68: [{ charge: +3, note: 'Loses 3 electrons; [Xe] 4f¹¹, standard lanthanide oxidation state', common: true }],
  69: [
    { charge: +3, note: 'Loses 3 electrons; [Xe] 4f¹², most common form', common: true },
    { charge: +2, note: 'Loses 2 electrons; [Xe] 4f¹³, found in some compounds' },
  ],
  70: [
    { charge: +3, note: 'Loses 3 electrons; [Xe] 4f¹³, most common form', common: true },
    { charge: +2, note: 'Loses 2 electrons; [Xe] 4f¹⁴ — fully-filled 4f provides stability' },
  ],
  71: [{ charge: +3, note: 'Loses 3 electrons (6s² 5d¹); [Xe] 4f¹⁴ — only one stable oxidation state', common: true }],

  // ── Period 6 — third transition series ────────────────────────────────────
  72: [{ charge: +4, note: 'Loses all 4 valence electrons (6s² 5d²); Hf⁴⁺ is the only stable ionic form', common: true }],
  73: [
    { charge: +5, note: 'Loses all 5 valence electrons; most stable — found in tantalate (TaO₄³⁻)', common: true },
    { charge: +3, note: 'Loses 3 electrons; less common' },
  ],
  74: [
    { charge: +6, note: 'Loses all 6 valence electrons; most stable — found in tungstate (WO₄²⁻)', common: true },
    { charge: +4, note: 'Loses 4 electrons; found in WO₂' },
  ],
  75: [
    { charge: +7, note: 'Loses all 7 valence electrons; found in perrhenate (ReO₄⁻)', common: true },
    { charge: +4, note: 'Loses 4 electrons; found in ReO₂' },
  ],
  76: [
    { charge: +4, note: 'Loses 4 electrons; most stable ionic form', common: true },
    { charge: +8, note: 'Loses 8 electrons; highest oxidation state in volatile OsO₄' },
    { charge: +3, note: 'Loses 3 electrons; less common' },
  ],
  77: [
    { charge: +3, note: 'Loses 3 electrons; most stable and commonly encountered form', common: true },
    { charge: +4, note: 'Loses 4 electrons; found in IrO₂ and octahedral complexes' },
  ],
  78: [
    { charge: +2, note: 'Loses 2 electrons; [Xe] 4f¹⁴ 5d⁸ — most common in coordination compounds (e.g. cisplatin)', common: true },
    { charge: +4, note: 'Loses 4 electrons; [Xe] 4f¹⁴ 5d⁶, found in PtF₄' },
  ],
  79: [
    { charge: +3, note: 'Loses 3 electrons; [Xe] 4f¹⁴ 5d⁸ — auric Au³⁺, most common in solution', common: true },
    { charge: +1, note: 'Loses 1 electron; achieves filled [Xe] 4f¹⁴ 5d¹⁰ — aurous Au⁺, stable in solid compounds' },
  ],
  80: [
    { charge: +2, note: 'Loses 2 electrons from 6s; [Xe] 4f¹⁴ 5d¹⁰ — mercuric Hg²⁺, most common', common: true },
    { charge: +1, note: 'Exists as the dimeric mercurous ion Hg₂²⁺ where both Hg atoms share one electron' },
  ],
  81: [
    { charge: +1, note: 'Loses only the 6p¹ electron; inert pair effect stabilises the 6s² pair — most common', common: true },
    { charge: +3, note: 'Loses all 3 valence electrons; thallium(III) is less stable due to the inert pair effect' },
  ],
  82: [
    { charge: +2, note: 'Loses 2 electrons from 6p; inert pair effect stabilises 6s² — plumbous Pb²⁺, most common', common: true },
    { charge: +4, note: 'Loses all 4 valence electrons; plumbic Pb⁴⁺, a strong oxidising agent' },
  ],
  83: [
    { charge: +3, note: 'Loses 3 electrons from 6p (inert pair keeps 6s²); Bi³⁺ is the most stable form', common: true },
    { charge: +5, note: 'Loses all 5 valence electrons; powerful oxidant; inert pair effect makes it uncommon' },
  ],
  84: [
    { charge: +2, note: 'Loses 2 electrons; Po²⁺ exists in acidic solution', common: true },
    { charge: +4, note: 'Loses 4 electrons; found in PoO₂' },
  ],
  85: [{ charge: -1, note: 'Gains 1 electron to complete the 6p subshell; astatide At⁻', common: true }],

  // ── Period 7 ──────────────────────────────────────────────────────────────
  87: [{ charge: +1, note: 'Loses its 7s¹ valence electron; highly radioactive element', common: true }],
  88: [{ charge: +2, note: 'Loses both 7s² valence electrons, achieving the stable [Rn] core', common: true }],

  // ── Actinides ─────────────────────────────────────────────────────────────
  89: [{ charge: +3, note: 'Loses 3 electrons (7s² 6d¹); Ac³⁺ is the only stable oxidation state', common: true }],
  90: [{ charge: +4, note: 'Loses all 4 valence electrons (7s² 6d²); Th⁴⁺ is the only stable form', common: true }],
  91: [
    { charge: +5, note: 'Loses all 5 valence electrons; Pa⁵⁺ is most stable', common: true },
    { charge: +4, note: 'Loses 4 electrons; less stable' },
  ],
  92: [
    { charge: +6, note: 'Loses all 6 valence electrons; found as uranyl ion UO₂²⁺ and in UF₆', common: true },
    { charge: +4, note: 'Loses 4 electrons; [Rn] 5f², found in UCl₄ and nuclear fuel contexts' },
    { charge: +5, note: 'Loses 5 electrons; found as UO₂⁺ but disproportionates in solution' },
    { charge: +3, note: 'Loses 3 electrons; a strong reducing agent in aqueous solution' },
  ],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const SUP: Record<string, string> = {
  '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
}

function toSup(n: number): string {
  return String(n).split('').map(c => SUP[c] ?? c).join('')
}

/** Returns the formatted ion formula, e.g. "Fe²⁺", "Cl⁻", "H⁺" */
export function ionFormula(symbol: string, charge: number): string {
  if (charge === 0) return symbol
  const abs = Math.abs(charge)
  const num = abs === 1 ? '' : toSup(abs)
  const sign = charge > 0 ? '⁺' : '⁻'
  return symbol + num + sign
}
