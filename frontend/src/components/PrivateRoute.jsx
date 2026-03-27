import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function isTokenValid() {
  const token = localStorage.getItem('access_token')
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export default function PrivateRoute({ children }) {
  const { user } = useAuth()
  if (!user || !isTokenValid()) return <Navigate to="/login" replace />
  return children
}
