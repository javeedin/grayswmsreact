import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import WMS from './pages/modules/WMS'
import OrderManagement from './pages/modules/OrderManagement'
import Inventory from './pages/modules/Inventory'
import Shipping from './pages/modules/Shipping'
import Reports from './pages/modules/Reports'
import UserManagement from './pages/modules/UserManagement'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="wms" element={<WMS />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
