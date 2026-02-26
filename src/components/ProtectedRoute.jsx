import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const user = sessionStorage.getItem('wms_user')
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}
