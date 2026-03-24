import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Products from './pages/Products'
import ProductForm from './pages/ProductForm'
import Batches from './pages/Batches'
import ConsumptionForm from './pages/ConsumptionForm'

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
          <Route path="*" element={<Navigate to="/produtos" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
