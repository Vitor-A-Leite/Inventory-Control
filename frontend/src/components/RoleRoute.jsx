import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RoleRoute({ role, roles, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const allowed = roles ?? (role ? [role] : [])
  if (!allowed.includes(user.role)) return <Navigate to="/produtos" replace />
  return children
}
