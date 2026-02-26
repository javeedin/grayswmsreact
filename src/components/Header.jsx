import { useLocation } from 'react-router-dom'
import './Header.css'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/wms': 'Warehouse Management System',
  '/orders': 'Order Management',
  '/inventory': 'Inventory',
  '/shipping': 'Shipping & Receiving',
  '/reports': 'Reports & Analytics',
  '/users': 'User Management',
}

export default function Header() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'Grays WMS'
  const user = JSON.parse(sessionStorage.getItem('wms_user') || '{}')

  return (
    <header className="app-header">
      <div className="header-title">{title}</div>
      <div className="header-right">
        <div className="header-notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="notif-badge">3</span>
        </div>
        <div className="header-user">
          <div className="header-avatar">
            {(user.username || 'U')[0].toUpperCase()}
          </div>
          <div className="header-user-info">
            <span className="header-username">{user.username || 'User'}</span>
            <span className="header-role">{user.role || 'Staff'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
