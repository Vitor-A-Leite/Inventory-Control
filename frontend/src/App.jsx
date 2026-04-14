import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import RoleRoute from './components/RoleRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Products from './pages/Products'
import ProductForm from './pages/ProductForm'
import Batches from './pages/Batches'
import ConsumptionForm from './pages/ConsumptionForm'
import Scanner from './pages/Scanner'
import ConsumptionConfirm from './pages/ConsumptionConfirm'
import Users from './pages/Users'
import ConsumptionHistory from './pages/ConsumptionHistory'
import Alerts from './pages/Alerts'
import BatchForm from './pages/BatchForm'
import AuditLog from './pages/AuditLog'
import Catalog from './pages/Catalog'

function Private({ children }) {
  return (
    <PrivateRoute>
      <Layout>{children}</Layout>
    </PrivateRoute>
  )
}

function Restricted({ role, roles, children }) {
  return (
    <RoleRoute role={role} roles={roles}>
      <Layout>{children}</Layout>
    </RoleRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/produtos" element={<Private><Products /></Private>} />
          <Route path="/produtos/novo" element={<Private><ProductForm /></Private>} />
          <Route path="/produtos/:id/editar" element={<Private><ProductForm /></Private>} />
          <Route path="/lotes" element={<Private><Batches /></Private>} />
          <Route path="/lotes/novo" element={<Private><BatchForm /></Private>} />
          <Route path="/consumos/novo" element={<Private><ConsumptionForm /></Private>} />
          <Route path="/consumos/confirmar" element={<Private><ConsumptionConfirm /></Private>} />
          <Route path="/historico" element={<Private><ConsumptionHistory /></Private>} />
          <Route path="/alertas" element={<Private><Alerts /></Private>} />
          <Route path="/scanner" element={<Private><Scanner /></Private>} />
          <Route path="/catalogo" element={<Restricted roles={['ADMIN', 'MANAGER']}><Catalog /></Restricted>} />
          <Route path="/usuarios" element={<Restricted role="ADMIN"><Users /></Restricted>} />
          <Route path="/auditoria" element={<Restricted role="ADMIN"><AuditLog /></Restricted>} />
          <Route path="*" element={<Navigate to="/produtos" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
