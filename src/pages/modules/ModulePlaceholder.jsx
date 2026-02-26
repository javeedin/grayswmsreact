import { useNavigate } from 'react-router-dom'
import './ModulePlaceholder.css'

export default function ModulePlaceholder({ title, subtitle, icon, color, bg, sections }) {
  const navigate = useNavigate()

  return (
    <div className="module-page">
      <div className="module-page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </button>
        <div className="module-page-title-wrap">
          <div className="module-page-icon" style={{ background: bg, color }}>
            {icon}
          </div>
          <div>
            <h1 className="module-page-title">{title}</h1>
            <p className="module-page-sub">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="module-sections-grid">
        {sections.map((sec) => (
          <div key={sec.title} className={`module-section-card ${sec.live ? 'live' : ''}`}>
            <div className="section-card-icon" style={{ color }}>
              {sec.icon}
            </div>
            <h3>
              {sec.title}
              {sec.live && <span className="live-badge">Live</span>}
            </h3>
            <p>{sec.description}</p>
            <button
              className="section-btn"
              style={{ background: color }}
              onClick={sec.onOpen}
            >
              Open
            </button>
          </div>
        ))}
      </div>

      <div className="coming-soon-banner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Full module functionality coming soon. Connect your backend API to activate.
      </div>
    </div>
  )
}
