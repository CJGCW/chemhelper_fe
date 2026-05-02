import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/Layout/AppLayout'
import TablePage from './pages/TablePage'
import MolarCalculationsPage from './pages/calculations/MolarCalculationsPage'
import BaseCalculationsPage from './pages/BaseCalculationsPage'
import CompoundPage from './pages/CompoundPage'
import ElectronConfigPage from './pages/ElectronConfigPage'
import EmpiricalPage from './pages/EmpiricalPage'
import TestPage from './pages/TestPage'
import PrintPage from './pages/PrintPage'
import StoichiometryPage from './pages/StoichiometryPage'
import ReferencePage from './pages/ReferencePage'
import StructuresPage from './pages/StructuresPage'
import ToolsPage from './pages/ToolsPage'
import RedoxPage from './pages/RedoxPage'
import IdealGasPage from './pages/IdealGasPage'
import ThermochemistryPage from './pages/ThermochemistryPage'
import GlossaryPage from './pages/GlossaryPage'
import SettingsPage from './pages/SettingsPage'
import KineticsPage from './pages/KineticsPage'
import EquilibriumPage from './pages/EquilibriumPage'
import AcidBasePage from './pages/AcidBasePage'
import BuffersPage from './pages/BuffersPage'
import ThermodynamicsPage from './pages/ThermodynamicsPage'
import NuclearPage from './pages/NuclearPage'
import OrganicPage from './pages/OrganicPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/table" replace />} />
        <Route path="/table"           element={<TablePage />} />
        <Route path="/stoichiometry"   element={<StoichiometryPage />} />
        <Route path="/calculations"    element={<MolarCalculationsPage />} />
        <Route path="/base-calculations" element={<BaseCalculationsPage />} />
        <Route path="/structures"      element={<StructuresPage />} />
        <Route path="/tools"           element={<ToolsPage />} />
        <Route path="/redox"           element={<RedoxPage />} />
        <Route path="/ideal-gas"       element={<IdealGasPage />} />
        <Route path="/thermochemistry" element={<ThermochemistryPage />} />
        <Route path="/empirical"       element={<EmpiricalPage />} />
        <Route path="/compound"        element={<CompoundPage />} />
        <Route path="/electron-config" element={<ElectronConfigPage />} />
        <Route path="/reference"       element={<ReferencePage />} />
        <Route path="/glossary"        element={<GlossaryPage />} />
        <Route path="/settings"        element={<SettingsPage />} />
        <Route path="/kinetics"        element={<KineticsPage />} />
        <Route path="/equilibrium"     element={<EquilibriumPage />} />
        <Route path="/acid-base"       element={<AcidBasePage />} />
        <Route path="/buffers"         element={<BuffersPage />} />
        <Route path="/thermodynamics"  element={<ThermodynamicsPage />} />
        <Route path="/nuclear"         element={<NuclearPage />} />
        <Route path="/organic"         element={<OrganicPage />} />
        <Route path="/test"            element={<TestPage />} />
        <Route path="/print"           element={<PrintPage />} />
        <Route path="*" element={<Navigate to="/table" replace />} />
      </Route>
    </Routes>
  )
}
