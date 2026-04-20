import { useEffect, useState } from 'react'
import PrintBuilder, { type PrintTopicDef } from '../components/print/PrintBuilder'
import NamingReference        from '../components/reference/NamingReference'
import SolubilityReference    from '../components/reference/SolubilityReference'
import EnergyLevelsReference  from '../components/atomic/EnergyLevelsReference'
import QuantumNumbersReference from '../components/atomic/QuantumNumbersReference'
import LewisReference         from '../components/lewis/LewisReference'
import VsepReference          from '../components/vsepr/VsepReference'
import SolidTypesReference    from '../components/structures/SolidTypesReference'
import MolarReference         from '../components/calculations/MolarReference'
import EmpiricalReference     from '../components/empirical/EmpiricalReference'
import StoichReference        from '../components/stoichiometry/StoichReference'
import IdealGasReference      from '../components/idealgas/IdealGasReference'
import DaltonsLawReference    from '../components/idealgas/DaltonsLawReference'
import GrahamsLawReference    from '../components/idealgas/GrahamsLawReference'
import GasDensityReference    from '../components/idealgas/GasDensityReference'
import VanDerWaalsReference   from '../components/idealgas/VanDerWaalsReference'
import MaxwellBoltzmann       from '../components/idealgas/MaxwellBoltzmann'
import RedoxReference         from '../components/redox/RedoxReference'
import CalorimetryReference   from '../components/thermo/CalorimetryReference'
import HeatTransferReference  from '../components/thermo/HeatTransferReference'
import EnthalpyReference      from '../components/thermo/EnthalpyReference'
import HessReference          from '../components/thermo/HessReference'
import BondEnthalpyReference  from '../components/thermo/BondEnthalpyReference'
import ClausiusClapeyronReference from '../components/thermo/ClausiusClapeyronReference'
import HeatingCurveReference  from '../components/thermo/HeatingCurveReference'
import PhaseDiagramReference  from '../components/thermo/PhaseDiagramReference'

// ── Reference component router ────────────────────────────────────────────────

function ReferenceSection({ id }: { id: string }) {
  switch (id) {
    case 'naming':             return <NamingReference />
    case 'solubility':         return <SolubilityReference />
    case 'energy-levels':      return <EnergyLevelsReference />
    case 'quantum-numbers':    return <QuantumNumbersReference />
    case 'lewis':              return <LewisReference />
    case 'vsepr':              return <VsepReference />
    case 'solid-types':        return <SolidTypesReference />
    case 'molar':              return <MolarReference section="guide" />
    case 'empirical':          return <EmpiricalReference />
    case 'stoich':             return <StoichReference />
    case 'ideal-gas':          return <IdealGasReference />
    case 'daltons':            return <DaltonsLawReference />
    case 'grahams':            return <GrahamsLawReference />
    case 'gas-density':        return <GasDensityReference />
    case 'vdw':                return <VanDerWaalsReference />
    case 'maxwell':            return <MaxwellBoltzmann />
    case 'redox':              return <RedoxReference />
    case 'calorimetry':        return <CalorimetryReference />
    case 'heat-transfer':      return <HeatTransferReference />
    case 'enthalpy':           return <EnthalpyReference />
    case 'hess':               return <HessReference />
    case 'bond-enthalpy':      return <BondEnthalpyReference />
    case 'clausius-clapeyron': return <ClausiusClapeyronReference />
    case 'heating-curve':      return <HeatingCurveReference />
    case 'phase-diagram':      return <PhaseDiagramReference />
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
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">
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
    </div>
  )
}
