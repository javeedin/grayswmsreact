import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Please enter username and password.')
      return
    }
    setLoading(true)
    // Simulate auth — replace with real API call
    setTimeout(() => {
      if (form.username === 'admin' && form.password === 'admin') {
        sessionStorage.setItem('wms_user', JSON.stringify({ username: form.username, role: 'Admin' }))
        navigate('/')
      } else {
        setError('Invalid username or password.')
        setLoading(false)
      }
    }, 800)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">W</div>
          <div className="logo-text">
            <span className="logo-grays">Grays</span>
            <span className="logo-wms"> WMS</span>
          </div>
        </div>

        <h2 className="login-title">Welcome back</h2>
        <p className="login-sub">Sign in to your account to continue</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="login-hint">Demo: <strong>admin / admin</strong></p>
      </div>

      <div className="login-bg-panel">
        <div className="login-bg-content">
          <h1>Warehouse Management System</h1>
          <p>Streamline your warehouse operations with real-time visibility across inventory, orders, shipping, and more.</p>
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-dot" />
              Inventory Tracking &amp; Control
            </div>
            <div className="feature-item">
              <span className="feature-dot" />
              Order Management
            </div>
            <div className="feature-item">
              <span className="feature-dot" />
              Shipping &amp; Receiving
            </div>
            <div className="feature-item">
              <span className="feature-dot" />
              Real-time Reports &amp; Analytics
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
