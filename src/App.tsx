import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/Layout/AppLayout'
import TablePage from './pages/TablePage'
import CalculationsPage from './pages/calculations/CalculationsPage'
import LewisPage from './pages/LewisPage'
import CompoundPage from './pages/CompoundPage'
import PlaceholderPage from './pages/PlaceholderPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/table" replace />} />
        <Route path="/table" element={<TablePage />} />
        <Route path="/calculations" element={<CalculationsPage />} />
        <Route path="/lewis" element={<LewisPage />} />
        {/* Legacy redirects */}
        <Route path="/calculations/moles"    element={<Navigate to="/calculations" replace />} />
        <Route path="/calculations/molarity" element={<Navigate to="/calculations" replace />} />
        <Route path="/calculations/molality" element={<Navigate to="/calculations" replace />} />
        <Route path="/calculations/bpe"      element={<PlaceholderPage />} />
        <Route path="/calculations/fpd"      element={<PlaceholderPage />} />
        <Route path="/compound"              element={<CompoundPage />} />
        <Route path="*" element={<Navigate to="/table" replace />} />
      </Route>
    </Routes>
  )
}
