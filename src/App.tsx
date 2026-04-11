import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/Layout/AppLayout'
import TablePage from './pages/TablePage'
import CalculationsPage from './pages/calculations/CalculationsPage'
import BaseCalculationsPage from './pages/BaseCalculationsPage'
import StructuresPage from './pages/StructuresPage'
import CompoundPage from './pages/CompoundPage'
import ElectronConfigPage from './pages/ElectronConfigPage'
import PlaceholderPage from './pages/PlaceholderPage'
import EmpiricalPage from './pages/EmpiricalPage'
import TestPage from './pages/TestPage'
import StoichiometryPage from './pages/StoichiometryPage'
import ReferencePage from './pages/ReferencePage'
import ClassifierPage from './pages/ClassifierPage'
import ElectrolytePage from './pages/ElectrolytePage'
import NetIonicPage from './pages/NetIonicPage'
import ActivitySeriesPage from './pages/ActivitySeriesPage'
import RedoxPage from './pages/RedoxPage'
import RedoxPracticePage from './pages/RedoxPracticePage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/table" replace />} />
        <Route path="/table" element={<TablePage />} />
        <Route path="/stoichiometry" element={<StoichiometryPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/calculations" element={<CalculationsPage />} />
        <Route path="/base-calculations" element={<BaseCalculationsPage />} />
        <Route path="/structures" element={<StructuresPage />} />
        {/* Legacy redirects */}
        <Route path="/lewis"                 element={<Navigate to="/structures?tab=lewis" replace />} />
        <Route path="/calculations/moles"    element={<Navigate to="/calculations" replace />} />
        <Route path="/calculations/molarity" element={<Navigate to="/calculations" replace />} />
        <Route path="/calculations/molality" element={<Navigate to="/calculations" replace />} />
        <Route path="/calculations/bpe"      element={<PlaceholderPage />} />
        <Route path="/calculations/fpd"      element={<PlaceholderPage />} />
        <Route path="/compound"              element={<CompoundPage />} />
        <Route path="/electron-config"       element={<ElectronConfigPage />} />
        <Route path="/empirical"             element={<EmpiricalPage />} />
        <Route path="/reference"             element={<ReferencePage />} />
        <Route path="/classifier"            element={<ClassifierPage />} />
        <Route path="/electrolyte"           element={<ElectrolytePage />} />
        <Route path="/net-ionic"             element={<NetIonicPage />} />
        <Route path="/activity-series"       element={<ActivitySeriesPage />} />
        <Route path="/redox"                 element={<RedoxPage />} />
        <Route path="/redox-practice"        element={<RedoxPracticePage />} />
        <Route path="*" element={<Navigate to="/table" replace />} />
      </Route>
    </Routes>
  )
}
