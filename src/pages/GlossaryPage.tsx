import { useState, useMemo } from 'react'
import PageShell from '../components/Layout/PageShell'

interface Term {
  term: string
  formula?: string
  category: string
  definition: string
}

const TERMS: Term[] = [
  // Atomic Structure
  { term: 'Atomic Number',         formula: 'Z',         category: 'Atomic Structure',   definition: 'Number of protons in the nucleus of an atom; defines the element.' },
  { term: 'Mass Number',           formula: 'A',         category: 'Atomic Structure',   definition: 'Total number of protons and neutrons (nucleons) in a nucleus.' },
  { term: 'Isotope',               category: 'Atomic Structure',   definition: 'Atoms of the same element with different numbers of neutrons.' },
  { term: 'Electron Configuration',category: 'Atomic Structure',   definition: 'Arrangement of electrons in an atom\'s orbitals (e.g. 1s²2s²2p⁶).' },
  { term: 'Effective Nuclear Charge', formula: 'Z_eff',  category: 'Atomic Structure',   definition: 'Net positive charge experienced by an electron after accounting for shielding by inner electrons.' },
  { term: 'Ionization Energy',     formula: 'IE',        category: 'Atomic Structure',   definition: 'Energy required to remove an electron from a gaseous atom or ion.' },
  { term: 'Electron Affinity',     formula: 'EA',        category: 'Atomic Structure',   definition: 'Energy change when a gaseous atom gains an electron.' },
  { term: 'Electronegativity',     formula: 'χ',         category: 'Atomic Structure',   definition: 'Measure of an atom\'s tendency to attract electrons in a chemical bond (Pauling scale).' },
  // Bonding
  { term: 'Ionic Bond',            category: 'Bonding',  definition: 'Electrostatic attraction between oppositely charged ions formed by electron transfer.' },
  { term: 'Covalent Bond',         category: 'Bonding',  definition: 'Bond formed by sharing one or more pairs of electrons between atoms.' },
  { term: 'Sigma Bond',            formula: 'σ',         category: 'Bonding',  definition: 'Bond formed by head-on orbital overlap; every single bond is a σ bond.' },
  { term: 'Pi Bond',               formula: 'π',         category: 'Bonding',  definition: 'Bond formed by side-on orbital overlap; present in double and triple bonds alongside σ.' },
  { term: 'Bond Order',            category: 'Bonding',  definition: 'Number of bonding electron pairs between two atoms; single = 1, double = 2, triple = 3.' },
  { term: 'Polar Covalent Bond',   category: 'Bonding',  definition: 'Covalent bond where electrons are shared unequally due to electronegativity difference (0.4–1.7 Δχ).' },
  { term: 'Dipole Moment',         formula: 'μ',         category: 'Bonding',  definition: 'Measure of bond polarity: μ = q·d, expressed in debyes (D).' },
  { term: 'Lewis Structure',       category: 'Bonding',  definition: 'Diagram showing bonding electron pairs and lone pairs for a molecule or ion.' },
  { term: 'Formal Charge',         category: 'Bonding',  definition: 'Hypothetical charge on an atom assuming equal sharing: FC = V − L − B/2.' },
  { term: 'Resonance',             category: 'Bonding',  definition: 'Representation of a molecule as two or more Lewis structures (resonance structures) that together describe delocalized electrons.' },
  { term: 'VSEPR',                 category: 'Bonding',  definition: 'Valence Shell Electron Pair Repulsion theory: electron domains arrange to minimize repulsion, determining molecular geometry.' },
  { term: 'Hybridization',         category: 'Bonding',  definition: 'Mixing of atomic orbitals to form hybrid orbitals (sp, sp², sp³, sp³d, sp³d²).' },
  // Stoichiometry
  { term: 'Mole',                  formula: 'mol',       category: 'Stoichiometry', definition: 'SI unit for amount of substance; 1 mol = 6.022 × 10²³ particles (Avogadro\'s number).' },
  { term: 'Molar Mass',            formula: 'M',         category: 'Stoichiometry', definition: 'Mass of one mole of a substance, numerically equal to the atomic/molecular weight in g/mol.' },
  { term: 'Empirical Formula',     category: 'Stoichiometry', definition: 'Simplest whole-number ratio of atoms in a compound.' },
  { term: 'Molecular Formula',     category: 'Stoichiometry', definition: 'Actual number of each type of atom in one molecule.' },
  { term: 'Limiting Reagent',      category: 'Stoichiometry', definition: 'Reactant that is completely consumed first, limiting the amount of product formed.' },
  { term: 'Theoretical Yield',     category: 'Stoichiometry', definition: 'Maximum mass of product calculated from stoichiometry assuming complete reaction.' },
  { term: 'Percent Yield',         formula: '%Y',        category: 'Stoichiometry', definition: '(Actual yield / Theoretical yield) × 100%; measures efficiency of a reaction.' },
  { term: 'Stoichiometric Coefficient', category: 'Stoichiometry', definition: 'Number preceding a formula in a balanced equation; gives the mole ratio between substances.' },
  // Solutions
  { term: 'Molarity',              formula: 'M = n/V',   category: 'Solutions', definition: 'Concentration expressed as moles of solute per liter of solution.' },
  { term: 'Molality',              formula: 'm = n/kg',  category: 'Solutions', definition: 'Concentration expressed as moles of solute per kilogram of solvent.' },
  { term: 'Solubility',            category: 'Solutions', definition: 'Maximum amount of solute that dissolves in a given amount of solvent at a specified temperature.' },
  { term: 'Dilution',              formula: 'C₁V₁=C₂V₂', category: 'Solutions', definition: 'Process of reducing concentration by adding solvent; moles of solute remain constant.' },
  { term: 'Electrolyte',           category: 'Solutions', definition: 'Substance that dissociates into ions in solution, conducting electricity. Strong electrolytes fully dissociate; weak ones partially.' },
  { term: 'Colligative Property',  category: 'Solutions', definition: 'Property that depends on the number of solute particles, not their identity (e.g. BP elevation, FP depression, osmotic pressure).' },
  { term: 'Boiling Point Elevation', formula: 'ΔTb = Kb·m', category: 'Solutions', definition: 'Increase in boiling point of a solvent caused by dissolving a non-volatile solute.' },
  { term: 'Freezing Point Depression', formula: 'ΔTf = Kf·m', category: 'Solutions', definition: 'Decrease in freezing point of a solvent caused by dissolving a solute.' },
  // Thermochemistry
  { term: 'Enthalpy',              formula: 'H',         category: 'Thermochemistry', definition: 'Thermodynamic quantity equal to internal energy plus pressure-volume work: H = U + PV.' },
  { term: 'Enthalpy of Reaction',  formula: 'ΔHrxn',    category: 'Thermochemistry', definition: 'Heat exchanged at constant pressure: ΔH = H(products) − H(reactants).' },
  { term: 'Hess\'s Law',           category: 'Thermochemistry', definition: 'The total enthalpy change is independent of path; ΔH can be summed from steps.' },
  { term: 'Standard Enthalpy of Formation', formula: 'ΔH°f', category: 'Thermochemistry', definition: 'Enthalpy change when 1 mol of a compound forms from its elements in standard states.' },
  { term: 'Specific Heat Capacity', formula: 'c',        category: 'Thermochemistry', definition: 'Heat required to raise the temperature of 1 g of a substance by 1°C: q = mcΔT.' },
  { term: 'Calorimetry',           category: 'Thermochemistry', definition: 'Experimental technique for measuring heat exchanged in a reaction by monitoring temperature change.' },
  { term: 'Activation Energy',     formula: 'Ea',        category: 'Thermochemistry', definition: 'Minimum energy required for a reaction to proceed; corresponds to the energy of the transition state.' },
  { term: 'Exothermic',            category: 'Thermochemistry', definition: 'Reaction that releases heat to the surroundings; ΔH < 0.' },
  { term: 'Endothermic',           category: 'Thermochemistry', definition: 'Reaction that absorbs heat from the surroundings; ΔH > 0.' },
  { term: 'Entropy',               formula: 'S',         category: 'Thermochemistry', definition: 'Measure of disorder or randomness in a system; increases in spontaneous processes.' },
  { term: 'Gibbs Free Energy',     formula: 'G = H−TS',  category: 'Thermochemistry', definition: 'Thermodynamic potential predicting spontaneity: ΔG = ΔH − TΔS; reaction is spontaneous if ΔG < 0.' },
  // Gas Laws
  { term: 'Ideal Gas Law',         formula: 'PV = nRT',  category: 'Gas Laws', definition: 'Equation of state relating pressure, volume, moles, and temperature for an ideal gas.' },
  { term: 'Boyle\'s Law',          formula: 'P₁V₁=P₂V₂', category: 'Gas Laws', definition: 'At constant T and n, pressure and volume are inversely proportional.' },
  { term: 'Charles\'s Law',        formula: 'V₁/T₁=V₂/T₂', category: 'Gas Laws', definition: 'At constant P and n, volume is directly proportional to absolute temperature.' },
  { term: 'Avogadro\'s Law',       formula: 'V∝n',       category: 'Gas Laws', definition: 'At constant T and P, volume is directly proportional to moles of gas.' },
  { term: 'Dalton\'s Law',         formula: 'Ptot=ΣPi',  category: 'Gas Laws', definition: 'Total pressure of a gas mixture equals the sum of partial pressures of each component.' },
  { term: 'Graham\'s Law',         formula: 'r∝1/√M',    category: 'Gas Laws', definition: 'Rate of effusion/diffusion of a gas is inversely proportional to the square root of its molar mass.' },
  { term: 'Molar Volume',          formula: 'Vm',        category: 'Gas Laws', definition: 'Volume occupied by one mole of an ideal gas; 22.414 L at STP (0°C, 1 atm).' },
  // Equilibrium
  { term: 'Chemical Equilibrium',  category: 'Equilibrium', definition: 'State where forward and reverse reaction rates are equal and concentrations remain constant.' },
  { term: 'Equilibrium Constant',  formula: 'K',         category: 'Equilibrium', definition: 'Ratio of product to reactant concentrations at equilibrium, each raised to their stoichiometric coefficient.' },
  { term: 'Le Chatelier\'s Principle', category: 'Equilibrium', definition: 'A system at equilibrium subjected to a stress shifts to partially counteract that stress.' },
  { term: 'Reaction Quotient',     formula: 'Q',         category: 'Equilibrium', definition: 'Ratio of product to reactant concentrations at any point; compare to K to predict direction.' },
  { term: 'Ksp',                   category: 'Equilibrium', definition: 'Solubility product constant: equilibrium constant for the dissolution of a sparingly soluble ionic compound.' },
  { term: 'Ka',                    category: 'Equilibrium', definition: 'Acid dissociation constant; larger Ka = stronger acid.' },
  { term: 'Kb',                    category: 'Equilibrium', definition: 'Base dissociation constant; larger Kb = stronger base.' },
  // Acids & Bases
  { term: 'Arrhenius Acid',        category: 'Acids & Bases', definition: 'Substance that produces H⁺ (or H₃O⁺) ions in aqueous solution.' },
  { term: 'Brønsted–Lowry Acid',   category: 'Acids & Bases', definition: 'Proton (H⁺) donor in a reaction.' },
  { term: 'Lewis Acid',            category: 'Acids & Bases', definition: 'Electron-pair acceptor.' },
  { term: 'pH',                    formula: 'pH = −log[H⁺]', category: 'Acids & Bases', definition: 'Measure of hydrogen ion concentration; pH < 7 is acidic, pH = 7 is neutral, pH > 7 is basic.' },
  { term: 'pOH',                   formula: 'pOH = −log[OH⁻]', category: 'Acids & Bases', definition: 'Measure of hydroxide ion concentration; pH + pOH = 14 at 25°C.' },
  { term: 'Buffer',                category: 'Acids & Bases', definition: 'Solution that resists pH changes; typically a weak acid and its conjugate base (or vice versa).' },
  { term: 'Conjugate Acid–Base Pair', category: 'Acids & Bases', definition: 'Two species differing by one H⁺; donor becomes the conjugate base and acceptor becomes the conjugate acid.' },
  { term: 'Neutralization',        category: 'Acids & Bases', definition: 'Reaction between an acid and a base producing water and a salt.' },
  // Redox
  { term: 'Oxidation',             category: 'Redox', definition: 'Loss of electrons or increase in oxidation state.' },
  { term: 'Reduction',             category: 'Redox', definition: 'Gain of electrons or decrease in oxidation state.' },
  { term: 'Oxidation State',       category: 'Redox', definition: 'Hypothetical charge an atom would have if electrons were transferred completely; used to track redox changes.' },
  { term: 'Oxidizing Agent',       category: 'Redox', definition: 'Species that accepts electrons and is itself reduced.' },
  { term: 'Reducing Agent',        category: 'Redox', definition: 'Species that donates electrons and is itself oxidized.' },
  { term: 'Half-Reaction',         category: 'Redox', definition: 'Separated oxidation or reduction component of a redox reaction.' },
  { term: 'Standard Reduction Potential', formula: 'E°', category: 'Redox', definition: 'Tendency of a species to be reduced at standard conditions; higher E° = stronger oxidizing agent.' },
  { term: 'Cell Potential',        formula: 'E°cell',    category: 'Redox', definition: 'E°cell = E°cathode − E°anode; positive value indicates a spontaneous electrochemical cell.' },
  { term: 'Nernst Equation',       category: 'Redox', definition: 'E = E° − (RT/nF)lnQ; relates cell potential to concentration at non-standard conditions.' },
  // Kinetics
  { term: 'Reaction Rate',         category: 'Kinetics', definition: 'Change in concentration of a reactant or product per unit time.' },
  { term: 'Rate Law',              formula: 'r = k[A]ⁿ', category: 'Kinetics', definition: 'Expression relating reaction rate to concentrations; determined experimentally.' },
  { term: 'Rate Constant',         formula: 'k',         category: 'Kinetics', definition: 'Proportionality constant in the rate law; temperature-dependent.' },
  { term: 'Reaction Order',        category: 'Kinetics', definition: 'Sum of exponents in the rate law; describes how rate depends on concentration.' },
  { term: 'Half-Life',             formula: 't½',        category: 'Kinetics', definition: 'Time for the concentration of a reactant to decrease by half.' },
  { term: 'Arrhenius Equation',    formula: 'k=Ae^(−Ea/RT)', category: 'Kinetics', definition: 'Relates rate constant to activation energy and temperature.' },
  { term: 'Catalyst',              category: 'Kinetics', definition: 'Substance that increases reaction rate by providing an alternative pathway with lower activation energy; not consumed.' },
  // Nuclear
  { term: 'Radioactive Decay',     category: 'Nuclear', definition: 'Spontaneous transformation of an unstable nucleus, emitting radiation (α, β, or γ).' },
  { term: 'Alpha Decay',           formula: 'α',         category: 'Nuclear', definition: 'Emission of a helium-4 nucleus (²⁴He); decreases Z by 2 and A by 4.' },
  { term: 'Beta Decay',            formula: 'β',         category: 'Nuclear', definition: 'Emission of an electron (β⁻) or positron (β⁺) from the nucleus.' },
  { term: 'Gamma Radiation',       formula: 'γ',         category: 'Nuclear', definition: 'High-energy electromagnetic radiation emitted alongside α or β decay; no change in Z or A.' },
  { term: 'Nuclear Binding Energy',category: 'Nuclear', definition: 'Energy holding nucleons together in a nucleus; related to mass defect by E = mc².' },
]

const CATEGORIES = Array.from(new Set(TERMS.map(t => t.category))).sort()

export default function GlossaryPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return TERMS.filter(t => {
      const matchesQuery = !q ||
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        (t.formula ?? '').toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      const matchesCategory = !activeCategory || t.category === activeCategory
      return matchesQuery && matchesCategory
    }).sort((a, b) => a.term.localeCompare(b.term))
  }, [query, activeCategory])

  const pillStyle = (active: boolean) => ({
    background: active ? 'color-mix(in srgb, var(--c-halogen) 18%, rgb(var(--color-surface)))' : 'transparent',
    border: active
      ? '1px solid color-mix(in srgb, var(--c-halogen) 40%, transparent)'
      : '1px solid rgba(var(--overlay),0.1)',
    color: active ? 'var(--c-halogen)' : 'rgba(var(--overlay),0.4)',
  })

  return (
    <PageShell>
      <div>
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Chemistry Glossary</h2>
        <p className="font-mono text-xs text-secondary mt-0.5">{TERMS.length} terms across {CATEGORIES.length} categories</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search terms, definitions, formulas…"
          className="w-full max-w-sm font-mono text-sm px-3 py-2 rounded-sm border border-border bg-raised text-primary placeholder-dim focus:outline-none focus:border-accent/40 transition-colors"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory(null)}
            className="font-mono text-[11px] px-2.5 py-0.5 rounded-sm transition-colors"
            style={pillStyle(activeCategory === null)}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(c => c === cat ? null : cat)}
              className="font-mono text-[11px] px-2.5 py-0.5 rounded-sm transition-colors"
              style={pillStyle(activeCategory === cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Term list */}
      {filtered.length === 0 ? (
        <p className="font-mono text-sm text-dim">No terms match "{query}".</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {filtered.map(t => (
            <div key={t.term} className="py-3 flex gap-4">
              <div className="shrink-0 w-20 text-right">
                {t.formula && (
                  <span className="font-mono text-xs" style={{ color: 'var(--c-halogen)' }}>{t.formula}</span>
                )}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-sans font-semibold text-sm text-bright">{t.term}</span>
                  <span className="font-mono text-[9px] text-dim uppercase tracking-widest">{t.category}</span>
                </div>
                <p className="font-sans text-sm text-secondary leading-relaxed">{t.definition}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="font-mono text-xs text-secondary">{filtered.length} term{filtered.length !== 1 ? 's' : ''} shown</p>
    </PageShell>
  )
}
