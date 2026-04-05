import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/Layout/AppLayout'
import TablePage from './pages/TablePage'
import CalculationsPage from './pages/calculations/CalculationsPage'
import BaseCalculationsPage from './pages/BaseCalculationsPage'
import StructuresPage from './pages/StructuresPage'
import CompoundPage from './pages/CompoundPage'
import ElectronConfigPage from './pages/ElectronConfigPage'
import PlaceholderPage from './pages/PlaceholderPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/table" replace />} />
        <Route path="/table" element={<TablePage />} />
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
        <Route path="*" element={<Navigate to="/table" replace />} />
      </Route>
    </Routes>
  )
}
