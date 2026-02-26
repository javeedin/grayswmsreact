import { useNavigate } from 'react-router-dom'
import './Home.css'

const MODULES = [
  {
    id: 'wms',
    title: 'WMS',
    subtitle: 'Warehouse Management',
    description: 'Manage warehouse operations, bin locations, putaway, and picking workflows.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    color: '#1e3a5f',
    bg: '#eef2f8',
    path: '/wms',
    stats: [{ label: 'Locations', value: '1,248' }, { label: 'Active Tasks', value: '34' }],
  },
  {
    id: 'orders',
    title: 'Order Management',
    subtitle: 'Sales & Purchase Orders',
    description: 'Process sales orders, purchase orders, returns, and fulfilment tracking.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="2"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
    color: '#1a7340',
    bg: '#edf7f0',
    path: '/orders',
    stats: [{ label: 'Open Orders', value: '127' }, { label: 'Pending', value: '18' }],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    subtitle: 'Stock & Product Control',
    description: 'Monitor stock levels, cycle counts, adjustments, and product catalogues.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
        <path d="M7 8h2M7 12h2M11 8h6M11 12h6"/>
      </svg>
    ),
    color: '#7b3fa0',
    bg: '#f5eefb',
    path: '/inventory',
    stats: [{ label: 'SKUs', value: '4,509' }, { label: 'Low Stock', value: '22' }],
  },
  {
    id: 'shipping',
    title: 'Shipping & Receiving',
    subtitle: 'Inbound & Outbound',
    description: 'Track shipments, manage carriers, GRNs, and delivery confirmations.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 5v4h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    color: '#b05c14',
    bg: '#fef3e8',
    path: '/shipping',
    stats: [{ label: 'Shipments Today', value: '56' }, { label: 'In Transit', value: '143' }],
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    subtitle: 'Insights & Dashboards',
    description: 'View performance dashboards, export reports, and analyse warehouse KPIs.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <path d="M2 20h20"/>
      </svg>
    ),
    color: '#0e6fa3',
    bg: '#e8f4fc',
    path: '/reports',
    stats: [{ label: 'Reports', value: '38' }, { label: 'Scheduled', value: '7' }],
  },
  {
    id: 'users',
    title: 'User Management',
    subtitle: 'Roles & Permissions',
    description: 'Manage users, assign roles, configure permissions and access levels.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    color: '#c0392b',
    bg: '#fdecea',
    path: '/users',
    stats: [{ label: 'Users', value: '24' }, { label: 'Active Now', value: '8' }],
  },
]

const SUMMARY_STATS = [
  { label: 'Total Orders Today', value: '183', change: '+12%', up: true },
  { label: 'Items Picked', value: '2,341', change: '+8%', up: true },
  { label: 'Shipments Out', value: '56', change: '-3%', up: false },
  { label: 'Stock Alerts', value: '22', change: '+5', up: false },
]

export default function Home() {
  const navigate = useNavigate()
  const user = JSON.parse(sessionStorage.getItem('wms_user') || '{}')

  return (
    <div className="home-page">
      {/* Welcome header */}
      <div className="home-welcome">
        <div>
          <h1>Welcome back, {user.username || 'User'}</h1>
          <p>Here's an overview of your warehouse operations today.</p>
        </div>
        <div className="home-date">
          {new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Summary stats */}
      <div className="summary-grid">
        {SUMMARY_STATS.map((s) => (
          <div key={s.label} className="summary-card">
            <p className="summary-label">{s.label}</p>
            <p className="summary-value">{s.value}</p>
            <span className={`summary-change ${s.up ? 'up' : 'down'}`}>{s.change} vs yesterday</span>
          </div>
        ))}
      </div>

      {/* Module grid */}
      <h2 className="modules-heading">Modules</h2>
      <div className="modules-grid">
        {MODULES.map((mod) => (
          <button
            key={mod.id}
            className="module-card"
            onClick={() => navigate(mod.path)}
          >
            <div className="module-icon" style={{ background: mod.bg, color: mod.color }}>
              {mod.icon}
            </div>
            <div className="module-body">
              <h3 className="module-title">{mod.title}</h3>
              <p className="module-subtitle">{mod.subtitle}</p>
              <p className="module-desc">{mod.description}</p>
              <div className="module-stats">
                {mod.stats.map((st) => (
                  <div key={st.label} className="module-stat">
                    <span className="stat-value" style={{ color: mod.color }}>{st.value}</span>
                    <span className="stat-label">{st.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="module-arrow" style={{ color: mod.color }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
