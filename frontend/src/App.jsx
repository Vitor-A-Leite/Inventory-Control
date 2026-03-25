import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/produtos"
            element={
              <PrivateRoute>
                <Products />
              </PrivateRoute>
            }
          />
          <Route
            path="/produtos/novo"
            element={
              <PrivateRoute>
                <ProductForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/lotes"
            element={
              <PrivateRoute>
                <Batches />
              </PrivateRoute>
            }
          />
          <Route
            path="/consumos/novo"
            element={
              <PrivateRoute>
                <ConsumptionForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/scanner"
            element={
              <PrivateRoute>
                <Scanner />
              </PrivateRoute>
            }
          />
          <Route
            path="/consumos/confirmar"
            element={
              <PrivateRoute>
                <ConsumptionConfirm />
              </PrivateRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/lotes/novo"
            element={
              <PrivateRoute>
                <BatchForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/alertas"
            element={
              <PrivateRoute>
                <Alerts />
              </PrivateRoute>
            }
          />
          <Route
            path="/historico"
            element={
              <PrivateRoute>
                <ConsumptionHistory />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/produtos" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
