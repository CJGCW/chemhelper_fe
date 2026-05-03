import { useEffect, useState } from 'react'
import PrintBuilder, { type PrintTopicDef } from '../components/print/PrintBuilder'
import NamingReference        from '../components/reference/NamingReference'
import SolubilityReference    from '../components/reference/SolubilityReference'
import EnergyLevelsReference  from '../components/atomic/EnergyLevelsReference'
import QuantumNumbersReference from '../components/atomic/QuantumNumbersReference'
import IsotopeAbundanceReference from '../components/atomic/IsotopeAbundanceReference'
import PeriodicTrendsReference from '../components/atomic/PeriodicTrendsReference'
import LewisReference         from '../components/lewis/LewisReference'
import SigmaPiReference       from '../components/lewis/SigmaPiReference'
import VsepReference          from '../components/vsepr/VsepReference'
import SolidTypesReference    from '../components/structures/SolidTypesReference'
import UnitCellReference      from '../components/structures/UnitCellReference'
import MolarReference         from '../components/calculations/MolarReference'
import EmpiricalReference     from '../components/empirical/EmpiricalReference'
import HydrateReference       from '../components/empirical/HydrateReference'
import StoichReference        from '../components/stoichiometry/StoichReference'
import AdvPercentYieldReference from '../components/stoichiometry/AdvPercentYieldReference'
import ChainedYieldReference  from '../components/stoichiometry/ChainedYieldReference'
import IdealGasReference      from '../components/idealgas/IdealGasReference'
import DaltonsLawReference    from '../components/idealgas/DaltonsLawReference'
import GrahamsLawReference    from '../components/idealgas/GrahamsLawReference'
import GasDensityReference    from '../components/idealgas/GasDensityReference'
import VanDerWaalsReference   from '../components/idealgas/VanDerWaalsReference'
import MaxwellBoltzmann       from '../components/idealgas/MaxwellBoltzmann'
import RedoxReference         from '../components/redox/RedoxReference'
import EcellReference         from '../components/redox/EcellReference'
import TitrationReference     from '../components/redox/TitrationReference'
import CalorimetryReference   from '../components/thermo/CalorimetryReference'
import HeatTransferReference  from '../components/thermo/HeatTransferReference'
import EnthalpyReference      from '../components/thermo/EnthalpyReference'
import HessReference          from '../components/thermo/HessReference'
import BondEnthalpyReference  from '../components/thermo/BondEnthalpyReference'
import ClausiusClapeyronReference from '../components/thermo/ClausiusClapeyronReference'
import HeatingCurveReference  from '../components/thermo/HeatingCurveReference'
import PhaseDiagramReference  from '../components/thermo/PhaseDiagramReference'
import ReactionProfileReference from '../components/thermo/ReactionProfileReference'
import ExpansionWorkReference from '../components/thermo/ExpansionWorkReference'
import VaporPressureReference from '../components/thermo/VaporPressureReference'
// ── Kinetics ──────────────────────────────────────────────────────────────────
import RateLawReference       from '../components/kinetics/RateLawReference'
import ArrheniusReference     from '../components/kinetics/ArrheniusReference'
import IntegratedRateReference from '../components/kinetics/IntegratedRateReference'
import KineticsHalfLifeReference from '../components/kinetics/HalfLifeReference'
import MechanismReference     from '../components/kinetics/MechanismReference'
// ── Equilibrium ───────────────────────────────────────────────────────────────
import KExpressionReference   from '../components/equilibrium/KExpressionReference'
import QvsKReference          from '../components/equilibrium/QvsKReference'
import ICETableReference      from '../components/equilibrium/ICETableReference'
import KpKcReference          from '../components/equilibrium/KpKcReference'
import LeChatelierReference   from '../components/equilibrium/LeChatelierReference'
// ── Acid-Base ─────────────────────────────────────────────────────────────────
import PhCalculatorReference  from '../components/acid-base/PhCalculatorReference'
import KaKbReference          from '../components/acid-base/KaKbReference'
import WeakAcidReference      from '../components/acid-base/WeakAcidReference'
import WeakBaseReference      from '../components/acid-base/WeakBaseReference'
import SaltPhReference        from '../components/acid-base/SaltPhReference'
import PolyproticReference    from '../components/acid-base/PolyproticReference'
// ── Buffers & Ksp ─────────────────────────────────────────────────────────────
import BufferReference        from '../components/buffers/BufferReference'
import KspReference           from '../components/buffers/KspReference'
import PrecipitationReference from '../components/buffers/PrecipitationReference'
import BufferCapacityReference from '../components/buffers/BufferCapacityReference'
import CommonIonReference     from '../components/buffers/CommonIonReference'
import TitrationCurveReference from '../components/buffers/TitrationCurveReference'
// ── Thermodynamics ────────────────────────────────────────────────────────────
import EntropyReference       from '../components/thermodynamics/EntropyReference'
import SpontaneityReference   from '../components/thermodynamics/SpontaneityReference'
import GibbsReference         from '../components/thermodynamics/GibbsReference'
import GibbsEquilibriumReference from '../components/thermodynamics/GibbsEquilibriumReference'
import GibbsTempReference     from '../components/thermodynamics/GibbsTempReference'
import TriangleReference      from '../components/redox/TriangleReference'
import ElectrolysisReference  from '../components/redox/ElectrolysisReference'
import ConcentrationCellReference from '../components/redox/ConcentrationCellReference'
// ── Nuclear ───────────────────────────────────────────────────────────────────
import NuclearDecayReference  from '../components/nuclear/NuclearDecayReference'
import NuclearHalfLifeReference from '../components/nuclear/HalfLifeReference'
import BindingEnergyReference from '../components/nuclear/BindingEnergyReference'
import DatingReference        from '../components/nuclear/DatingReference'
// ── Organic ───────────────────────────────────────────────────────────────────
import HydrocarbonReference   from '../components/organic/HydrocarbonReference'
import IsomerReference        from '../components/organic/IsomerReference'
import OrganicNamingReference from '../components/organic/OrganicNamingReference'
import FunctionalGroupReference from '../components/organic/FunctionalGroupReference'
import OrganicReactionReference from '../components/organic/OrganicReactionReference'
import PageShell from '../components/Layout/PageShell'

// ── Reference component router ────────────────────────────────────────────────

function ReferenceSection({ id }: { id: string }) {
  switch (id) {
    case 'naming':             return <NamingReference />
    case 'solubility':         return <SolubilityReference />
    case 'energy-levels':      return <EnergyLevelsReference />
    case 'quantum-numbers':    return <QuantumNumbersReference />
    case 'isotope-abundance':  return <IsotopeAbundanceReference />
    case 'periodic-trends':    return <PeriodicTrendsReference />
    case 'lewis':              return <LewisReference />
    case 'vsepr':              return <VsepReference />
    case 'solid-types':        return <SolidTypesReference />
    case 'sigma-pi':           return <SigmaPiReference />
    case 'unit-cell':          return <UnitCellReference />
    case 'molar':              return <MolarReference section="guide" />
    case 'empirical':          return <EmpiricalReference />
    case 'stoich':             return <StoichReference />
    case 'hydrate':            return <HydrateReference />
    case 'adv-percent-yield':  return <AdvPercentYieldReference />
    case 'chained-yield':      return <ChainedYieldReference />
    case 'ideal-gas':          return <IdealGasReference />
    case 'daltons':            return <DaltonsLawReference />
    case 'grahams':            return <GrahamsLawReference />
    case 'gas-density':        return <GasDensityReference />
    case 'vdw':                return <VanDerWaalsReference />
    case 'maxwell':            return <MaxwellBoltzmann />
    case 'redox':              return <RedoxReference />
    case 'ecell':              return <EcellReference />
    case 'titration':          return <TitrationReference />
    case 'calorimetry':        return <CalorimetryReference />
    case 'heat-transfer':      return <HeatTransferReference />
    case 'enthalpy':           return <EnthalpyReference />
    case 'hess':               return <HessReference />
    case 'bond-enthalpy':      return <BondEnthalpyReference />
    case 'clausius-clapeyron': return <ClausiusClapeyronReference />
    case 'heating-curve':      return <HeatingCurveReference />
    case 'phase-diagram':      return <PhaseDiagramReference />
    case 'reaction-profile':   return <ReactionProfileReference />
    case 'expansion-work':     return <ExpansionWorkReference />
    case 'vapor-pressure':     return <VaporPressureReference />
    // kinetics
    case 'rate-law':           return <RateLawReference />
    case 'arrhenius':          return <ArrheniusReference />
    case 'integrated-rate':    return <IntegratedRateReference />
    case 'half-life-k':        return <KineticsHalfLifeReference />
    case 'mechanisms':         return <MechanismReference />
    // equilibrium
    case 'keq-expression':     return <KExpressionReference />
    case 'q-vs-k':             return <QvsKReference />
    case 'ice-table':          return <ICETableReference />
    case 'kp-kc':              return <KpKcReference />
    case 'le-chatelier':       return <LeChatelierReference />
    // acid-base
    case 'ph-calculator':      return <PhCalculatorReference />
    case 'ka-kb':              return <KaKbReference />
    case 'weak-acid-ref':      return <WeakAcidReference />
    case 'weak-base-ref':      return <WeakBaseReference />
    case 'salt-ph':            return <SaltPhReference />
    case 'polyprotic':         return <PolyproticReference />
    // buffers & ksp
    case 'buffer-ph':          return <BufferReference />
    case 'ksp':                return <KspReference />
    case 'precipitation':      return <PrecipitationReference />
    case 'buffer-capacity':    return <BufferCapacityReference />
    case 'common-ion':         return <CommonIonReference />
    case 'titration-curve':    return <TitrationCurveReference />
    // thermodynamics (102)
    case 'entropy':            return <EntropyReference />
    case 'spontaneity':        return <SpontaneityReference />
    case 'gibbs':              return <GibbsReference />
    case 'gibbs-equilibrium':  return <GibbsEquilibriumReference />
    case 'gibbs-temperature':  return <GibbsTempReference />
    case 'delta-g-ecell-k':   return <TriangleReference />
    case 'electrolysis':       return <ElectrolysisReference />
    case 'concentration-cell': return <ConcentrationCellReference />
    // nuclear
    case 'nuclear-decay':      return <NuclearDecayReference />
    case 'nuclear-half-life':  return <NuclearHalfLifeReference />
    case 'binding-energy':     return <BindingEnergyReference />
    case 'nuclear-dating':     return <DatingReference />
    // organic
    case 'hydrocarbons':       return <HydrocarbonReference />
    case 'isomers':            return <IsomerReference />
    case 'organic-naming':     return <OrganicNamingReference />
    case 'functional-groups':  return <FunctionalGroupReference />
    case 'organic-reactions':  return <OrganicReactionReference />
    default: return null
  }
}

// ── Print sheet ───────────────────────────────────────────────────────────────

function PrintSheet({
  topics, title, onDone,
}: {
  topics: PrintTopicDef[]
  title: string
  onDone: () => void
}) {
  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => window.print()))
    const handler = () => onDone()
    window.addEventListener('afterprint', handler, { once: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('afterprint', handler)
    }
  }, [onDone])

  return (
    <div>
      {title && (
        <h1 className="font-sans font-bold text-2xl text-bright mb-6 pb-3 border-b border-border">
          {title}
        </h1>
      )}
      {topics.map((topic, i) => (
        <div key={topic.id} style={{ breakBefore: i > 0 || title ? 'page' : 'auto' }}>
          <h2 className="font-sans font-semibold text-lg text-bright mb-4 pb-2 border-b border-border">
            {topic.label}
            <span className="font-mono text-sm text-secondary ml-3 font-normal">{topic.formula}</span>
          </h2>
          <ReferenceSection id={topic.id} />
        </div>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PrintPage() {
  const [printState, setPrintState] = useState<{
    topics: PrintTopicDef[]
    title: string
  } | null>(null)

  return (
    <PageShell>
      <div className="print:hidden">
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Print Reference Sheets</h2>
        <p className="font-mono text-xs text-dim mt-1">
          Select topics to include and print a custom reference sheet.
        </p>
      </div>

      {printState === null ? (
        <PrintBuilder
          onPrint={(topics, title) => setPrintState({ topics, title })}
        />
      ) : (
        <PrintSheet
          topics={printState.topics}
          title={printState.title}
          onDone={() => setPrintState(null)}
        />
      )}
    </PageShell>
  )
}
