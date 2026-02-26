import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../../components/DataTable'
import { fetchTrips } from '../../services/tripApi'
import './TripManagement.css'

// ─── helpers ───────────────────────────────────────────────────────────────

const g = (row, ...keys) => {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k]
  }
  return ''
}

const getTripId    = (r) => g(r, 'TRIP_ID', 'trip_id')
const getLorry     = (r) => g(r, 'TRIP_LORRY', 'trip_lorry')
const getOrderNum  = (r) => g(r, 'ORDER_NUMBER', 'order_number')
const getAccNum    = (r) => g(r, 'ACCOUNT_NUMBER', 'account_number')
const getAccName   = (r) => g(r, 'ACCOUNT_NAME', 'account_name')
const getPicker    = (r) => g(r, 'PICKER', 'picker')
const getPriority  = (r) => g(r, 'TRIP_PRIORITY', 'trip_priority', 'PRIORITY') || 'Medium'
const getQty       = (r) => parseFloat(g(r, 'QUANTITY', 'quantity') || 0)
const getWeight    = (r) => parseFloat(g(r, 'WEIGHT', 'weight') || 0)
const getProduct   = (r) => g(r, 'PRODUCT_NAME', 'ITEM_NAME', 'item_name')
const getTripDate  = (r) => {
  for (const k of Object.keys(r)) {
    const lk = k.toLowerCase()
    if (lk === 'order_date' || lk === 'orderdate' || lk === 'trip_date' || lk === 'tripdate' || lk === 'shipment_date') {
      const v = r[k]
      if (v) return String(v).split(' ')[0]
    }
  }
  return ''
}

function formatDate(str) {
  if (!str) return '-'
  try {
    return new Date(str).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return str
  }
}

function toInputDate(d) {
  const date = d instanceof Date ? d : new Date(d)
  return date.toISOString().slice(0, 10)
}

function StatusBadge({ value }) {
  const safeClass = String(value || '')
    .toLowerCase()
    .replace(/,/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'unknown'
  return <span className={`status-badge status-${safeClass}`}>{value || '-'}</span>
}

// ─── sub-components ────────────────────────────────────────────────────────

function MultiSelectDropdown({ label, options, selected, onChange, allLabel }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const allSelected = selected.size === 0 || selected.size === options.length
  const buttonText = allSelected
    ? allLabel
    : selected.size <= 3
    ? [...selected].join(', ')
    : `${selected.size} selected`

  const toggle = (val) => {
    const next = new Set(selected)
    if (next.has(val)) next.delete(val)
    else next.add(val)
    onChange(next)
  }

  const selectAll = () => onChange(new Set())
  const clearAll = () => onChange(new Set(options))

  return (
    <div className="msd-wrap" ref={ref}>
      <label className="filter-label">{label}</label>
      <button className="msd-btn" onClick={() => setOpen((o) => !o)}>
        <span>{buttonText}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="msd-dropdown">
          <div className="msd-actions">
            <button onClick={selectAll}>All</button>
            <button onClick={clearAll}>None</button>
          </div>
          {options.map((opt) => {
            const checked = selected.size === 0 || !selected.has(opt)
            return (
              <label key={opt} className="msd-option">
                <input type="checkbox" checked={checked} onChange={() => toggle(opt)} />
                {opt}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SummaryStats({ data, onTabOpen }) {
  const totalOrders   = data.length
  const customers     = new Set(data.map(getAccName).filter(Boolean)).size
  const lorries       = new Set(data.map(getLorry).filter(Boolean)).size
  const pickers       = new Set(data.map(getPicker).filter(Boolean)).size
  const distinctTrips = new Set(data.map(getTripId).filter(Boolean)).size

  const stats = [
    { label: 'Total Orders',    value: totalOrders,   tab: 'orders' },
    { label: 'Total Customers', value: customers,      tab: 'customers' },
    { label: 'Total Lorries',   value: lorries,        tab: 'lorries' },
    { label: 'Total Pickers',   value: pickers,        tab: 'pickers' },
    { label: 'Total Trips',     value: distinctTrips,  tab: 'trips' },
  ]

  return (
    <div className="tm-summary-grid">
      {stats.map((s) => (
        <button key={s.tab} className="tm-stat-card" onClick={() => onTabOpen(s.tab)}>
          <div className="tm-stat-value">{s.value.toLocaleString()}</div>
          <div className="tm-stat-label">{s.label}</div>
        </button>
      ))}
    </div>
  )
}

function AllTripsTab({ data }) {
  const uniqueLorries = useMemo(() => [...new Set(data.map(getLorry).filter(Boolean))].sort(), [data])
  const uniqueDates   = useMemo(() => [...new Set(data.map(getTripDate).filter(Boolean))].sort(), [data])

  const [excludedLorries, setExcludedLorries] = useState(new Set())
  const [excludedDates,   setExcludedDates]   = useState(new Set())

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (excludedLorries.size > 0 && excludedLorries.has(getLorry(r))) return false
      if (excludedDates.size > 0 && excludedDates.has(getTripDate(r))) return false
      return true
    })
  }, [data, excludedLorries, excludedDates])

  const columns = useMemo(() => {
    if (!data.length) return []
    return Object.keys(data[0]).map((key) => ({
      key,
      label: key.replace(/_/g, ' '),
      sortable: true,
      render: (val) => {
        if (key === 'LINE_STATUS') return <StatusBadge value={val} />
        if (key.endsWith('_WEIGHT') || key === 'WEIGHT' || key === 'weight')
          return val != null ? Number(val).toFixed(2) : '-'
        return val != null ? String(val) : ''
      },
    }))
  }, [data])

  const clearFilters = () => {
    setExcludedLorries(new Set())
    setExcludedDates(new Set())
  }

  return (
    <div className="tab-section">
      <div className="filter-bar">
        <MultiSelectDropdown
          label="Filter Lorries"
          options={uniqueLorries}
          selected={excludedLorries}
          onChange={setExcludedLorries}
          allLabel="All Lorries"
        />
        <MultiSelectDropdown
          label="Filter Dates"
          options={uniqueDates}
          selected={excludedDates}
          onChange={setExcludedDates}
          allLabel="All Dates"
        />
        <button className="btn-clear-filters" onClick={clearFilters}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Clear Filters
        </button>
      </div>
      <div className="tab-grid-header">
        <span className="grid-title">All Trips Data</span>
        <span className="grid-count">{filtered.length} rows</span>
      </div>
      <DataTable columns={columns} data={filtered} exportFileName="all-trips" height="520px" />
    </div>
  )
}

function AggregateTab({ type, data }) {
  const { columns, aggregated } = useMemo(() => {
    switch (type) {
      case 'orders': {
        const map = {}
        data.forEach((r) => {
          const key = getOrderNum(r) || 'Unknown'
          if (!map[key]) map[key] = {
            ORDER_DATE: getTripDate(r),
            ORDER_NUMBER: key,
            ACCOUNT_NUMBER: getAccNum(r),
            ACCOUNT_NAME: getAccName(r),
            ORDER_TYPE: g(r, 'ORDER_TYPE', 'order_type'),
            TOTAL_LINES: 0,
          }
          map[key].TOTAL_LINES++
        })
        return {
          aggregated: Object.values(map),
          columns: [
            { key: 'ORDER_DATE',     label: 'Order Date' },
            { key: 'ORDER_NUMBER',   label: 'Order Number', render: (v) => <strong style={{ color: '#6366f1' }}>{v}</strong> },
            { key: 'ACCOUNT_NUMBER', label: 'Account No.' },
            { key: 'ACCOUNT_NAME',   label: 'Customer Name' },
            { key: 'ORDER_TYPE',     label: 'Order Type' },
            { key: 'TOTAL_LINES',    label: 'Lines', align: 'right' },
          ],
        }
      }
      case 'customers': {
        const map = {}
        data.forEach((r) => {
          const key = getAccName(r) || 'Unknown'
          if (!map[key]) map[key] = { CUSTOMER_NAME: key, ACCOUNT_NUMBER: getAccNum(r), ORDER_COUNT: 0 }
          map[key].ORDER_COUNT++
        })
        return {
          aggregated: Object.values(map).sort((a, b) => b.ORDER_COUNT - a.ORDER_COUNT),
          columns: [
            { key: 'CUSTOMER_NAME',  label: 'Customer Name' },
            { key: 'ACCOUNT_NUMBER', label: 'Account No.' },
            { key: 'ORDER_COUNT',    label: 'Orders', align: 'right' },
          ],
        }
      }
      case 'lorries': {
        const map = {}
        data.forEach((r) => {
          const key = getLorry(r) || 'Unknown'
          if (!map[key]) map[key] = { LORRY_NAME: key, TOTAL_ORDERS: 0, customers: new Set() }
          map[key].TOTAL_ORDERS++
          const cust = getAccName(r)
          if (cust) map[key].customers.add(cust)
        })
        return {
          aggregated: Object.values(map).map((l) => ({
            LORRY_NAME:      l.LORRY_NAME,
            TOTAL_ORDERS:    l.TOTAL_ORDERS,
            TOTAL_CUSTOMERS: l.customers.size,
          })).sort((a, b) => b.TOTAL_ORDERS - a.TOTAL_ORDERS),
          columns: [
            { key: 'LORRY_NAME',      label: 'Lorry' },
            { key: 'TOTAL_ORDERS',    label: 'Orders',    align: 'right' },
            { key: 'TOTAL_CUSTOMERS', label: 'Customers', align: 'right' },
          ],
        }
      }
      case 'pickers': {
        const map = {}
        data.forEach((r) => {
          const key = getPicker(r) || 'Unknown'
          if (!map[key]) map[key] = { PICKER_NAME: key, ORDER_COUNT: 0 }
          map[key].ORDER_COUNT++
        })
        return {
          aggregated: Object.values(map).sort((a, b) => b.ORDER_COUNT - a.ORDER_COUNT),
          columns: [
            { key: 'PICKER_NAME', label: 'Picker' },
            { key: 'ORDER_COUNT', label: 'Orders', align: 'right' },
          ],
        }
      }
      default:
        return { aggregated: [], columns: [] }
    }
  }, [type, data])

  return (
    <div className="tab-section">
      <DataTable columns={columns} data={aggregated} exportFileName={type} height="520px" />
    </div>
  )
}

function TripCard({ trip, onViewDetails, onAutoPrintToggle }) {
  const [autoPrint, setAutoPrint] = useState(false)
  const priorityClass =
    trip.PRIORITY.toLowerCase().includes('high') ? 'priority-high' :
    trip.PRIORITY.toLowerCase().includes('low')  ? 'priority-low'  : 'priority-medium'

  const handleToggle = (e) => {
    const enabled = e.target.checked
    setAutoPrint(enabled)
    onAutoPrintToggle(trip.TRIP_ID, trip.TRIP_DATE, enabled)
  }

  return (
    <div className="trip-card">
      <div className="trip-card-header">
        <span className="trip-card-id">{trip.TRIP_ID}</span>
        <span className={`trip-priority ${priorityClass}`}>{trip.PRIORITY}</span>
      </div>
      <div className="trip-card-body">
        <div className="trip-field">
          <span className="trip-field-label">Trip Date</span>
          <span className="trip-field-value">{formatDate(trip.TRIP_DATE)}</span>
        </div>
        <div className="trip-field">
          <span className="trip-field-label">Lorry</span>
          <span className="trip-field-value">{trip.LORRY_NUMBER || '-'}</span>
        </div>
        <div className="trip-field">
          <span className="trip-field-label">Orders</span>
          <span className="trip-field-value trip-field-value--bold">{trip.TOTAL_ORDERS}</span>
        </div>
      </div>
      <div className="trip-card-autoprint">
        <div className="autoprint-info">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          <div>
            <strong>Auto Print</strong>
            <p>Auto download &amp; print</p>
          </div>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" checked={autoPrint} onChange={handleToggle} />
          <span className="toggle-slider" />
        </label>
      </div>
      <div className="trip-card-footer">
        <button className="btn-view-details" onClick={() => onViewDetails(trip)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          View Details
        </button>
      </div>
    </div>
  )
}

function TripsTab({ data, onViewDetails, onAutoPrintToggle }) {
  const tripMap = useMemo(() => {
    const map = {}
    data.forEach((r) => {
      const id = getTripId(r)
      if (!map[id]) {
        map[id] = {
          TRIP_ID:      id,
          TRIP_DATE:    getTripDate(r),
          LORRY_NUMBER: getLorry(r),
          PRIORITY:     getPriority(r),
          TOTAL_ORDERS: 0,
        }
      }
      map[id].TOTAL_ORDERS++
    })
    return map
  }, [data])

  const trips = useMemo(() => {
    const priorityOrder = { High: 1, Medium: 2, Low: 3 }
    return Object.values(tripMap).sort((a, b) => {
      if (a.TRIP_DATE !== b.TRIP_DATE) return b.TRIP_DATE.localeCompare(a.TRIP_DATE)
      return (priorityOrder[a.PRIORITY] || 2) - (priorityOrder[b.PRIORITY] || 2)
    })
  }, [tripMap])

  const uniqueDates = useMemo(() => [...new Set(trips.map((t) => t.TRIP_DATE).filter(Boolean))].sort().reverse(), [trips])
  const [activeDates, setActiveDates] = useState(new Set(uniqueDates))

  useEffect(() => { setActiveDates(new Set(uniqueDates)) }, [uniqueDates.join(',')])

  const toggleDate = (date) => {
    setActiveDates((prev) => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

  const filtered = useMemo(() =>
    trips.filter((t) => activeDates.size === 0 || activeDates.has(t.TRIP_DATE)),
    [trips, activeDates]
  )

  return (
    <div className="tab-section">
      <div className="date-chip-bar">
        <span className="date-chip-label">Filter by Date:</span>
        <div className="date-chips">
          {uniqueDates.map((d) => (
            <button
              key={d}
              className={`date-chip ${activeDates.has(d) ? 'active' : ''}`}
              onClick={() => toggleDate(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <button className="chip-ctrl" onClick={() => setActiveDates(new Set(uniqueDates))}>Select All</button>
        <button className="chip-ctrl" onClick={() => setActiveDates(new Set())}>Clear</button>
      </div>
      <div className="trips-grid-header">
        Showing <strong>{filtered.length}</strong> of {trips.length} trips
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state-inner">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
            <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/>
            <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <p>No trips for selected dates</p>
        </div>
      ) : (
        <div className="trip-cards-grid">
          {filtered.map((trip) => (
            <TripCard
              key={trip.TRIP_ID}
              trip={trip}
              onViewDetails={onViewDetails}
              onAutoPrintToggle={onAutoPrintToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TripDetailTab({ tripId, data }) {
  const tripData = useMemo(() =>
    data.filter((r) => getTripId(r).toString().toLowerCase() === tripId.toString().toLowerCase()),
    [tripId, data]
  )

  const first = tripData[0] || {}
  const tripDate    = getTripDate(first)
  const lorry       = getLorry(first)
  const priority    = getPriority(first)
  const totalOrders = new Set(tripData.map(getOrderNum)).size
  const customers   = new Set(tripData.map(getAccName).filter(Boolean)).size
  const products    = new Set(tripData.map(getProduct).filter(Boolean)).size
  const totalQty    = tripData.reduce((s, r) => s + getQty(r), 0)
  const totalWeight = tripData.reduce((s, r) => s + getWeight(r), 0)

  const kpis = [
    { label: 'Trip Date',     value: formatDate(tripDate), color: '#6366f1' },
    { label: 'Lorry',         value: lorry || '-',          color: '#10b981' },
    { label: 'Orders',        value: totalOrders,           color: '#f59e0b' },
    { label: 'Customers',     value: customers,             color: '#3b82f6' },
    { label: 'Products',      value: products,              color: '#8b5cf6' },
    { label: 'Total Qty',     value: totalQty.toLocaleString(), color: '#ec4899' },
    { label: 'Total Weight',  value: totalWeight.toFixed(2),     color: '#14b8a6' },
    { label: 'Priority',      value: priority,              color: '#f97316' },
  ]

  const columns = useMemo(() => {
    if (!tripData.length) return []
    return Object.keys(tripData[0]).map((key) => ({
      key,
      label: key.replace(/_/g, ' '),
      sortable: true,
      render: (val) => {
        if (key === 'LINE_STATUS') return <StatusBadge value={val} />
        if (key.endsWith('_WEIGHT') || key === 'WEIGHT' || key === 'weight')
          return val != null ? Number(val).toFixed(2) : '-'
        return val != null ? String(val) : ''
      },
    }))
  }, [tripData])

  return (
    <div className="tab-section">
      <div className="trip-detail-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
          <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
        </svg>
        <div>
          <h2>Trip: {tripId}</h2>
          <p>Complete order details for this trip</p>
        </div>
      </div>
      <div className="trip-kpi-grid">
        {kpis.map((k) => (
          <div key={k.label} className="trip-kpi-card" style={{ borderTopColor: k.color }}>
            <div className="trip-kpi-label">{k.label}</div>
            <div className="trip-kpi-value" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>
      <DataTable columns={columns} data={tripData} exportFileName={`trip-${tripId}`} height="480px" />
    </div>
  )
}

function AutoPrintModal({ open, onClose }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
          </svg>
          <h3>Auto-Print</h3>
        </div>
        <div className="modal-body">
          <p>Auto-print requires the <strong>Grays WMS Desktop Application</strong> running on Windows.</p>
          <p style={{ marginTop: 8, color: '#64748b', fontSize: 13 }}>
            This feature uses the C# WebView2 bridge to communicate with the Windows print spooler and Oracle Fusion PDF download service. It is not available in the web browser.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-modal-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ─── main page ─────────────────────────────────────────────────────────────

const today     = new Date()
const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
const tomorrow  = new Date(today); tomorrow.setDate(today.getDate() + 1)

const FIXED_TABS = [{ id: 'all-trips', label: 'All Trips', closeable: false }]

export default function TripManagement() {
  const navigate = useNavigate()

  // filter state
  const [instance,  setInstance]  = useState('PROD')
  const [dateFrom,  setDateFrom]  = useState(toInputDate(yesterday))
  const [dateTo,    setDateTo]    = useState(toInputDate(tomorrow))
  const [collapsed, setCollapsed] = useState(false)

  // data state
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [data,    setData]    = useState([])

  // tab state
  const [tabs,      setTabs]      = useState(FIXED_TABS)
  const [activeTab, setActiveTab] = useState('all-trips')

  // auto-print modal
  const [autoPrintModal, setAutoPrintModal] = useState(false)

  // fetch
  const handleFetch = async () => {
    if (!dateFrom || !dateTo) return alert('Please select both dates.')
    if (new Date(dateFrom) > new Date(dateTo)) return alert('From Date cannot be after To Date.')

    setLoading(true)
    setError(null)
    try {
      const rows = await fetchTrips({ dateFrom, dateTo, instance })
      setData(rows)
      // reset to all-trips tab
      setTabs(FIXED_TABS)
      setActiveTab('all-trips')
    } catch (e) {
      setError(e.message)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  // open a tab (summary stat click)
  const openTab = useCallback((tabType) => {
    const exists = tabs.find((t) => t.id === tabType)
    if (exists) { setActiveTab(tabType); return }
    const labels = { orders: 'Orders', customers: 'Customers', lorries: 'Lorries', pickers: 'Pickers', trips: 'Trips' }
    setTabs((prev) => [...prev, { id: tabType, label: labels[tabType] || tabType, closeable: true }])
    setActiveTab(tabType)
  }, [tabs])

  // open trip detail tab
  const openTripDetail = useCallback((trip) => {
    const tabId = `trip-detail-${trip.TRIP_ID}`
    const exists = tabs.find((t) => t.id === tabId)
    if (exists) { setActiveTab(tabId); return }
    setTabs((prev) => [...prev, { id: tabId, label: `Trip: ${trip.TRIP_ID}`, closeable: true }])
    setActiveTab(tabId)
  }, [tabs])

  // close a tab
  const closeTab = (tabId, e) => {
    e.stopPropagation()
    setTabs((prev) => prev.filter((t) => t.id !== tabId))
    if (activeTab === tabId) setActiveTab('all-trips')
  }

  // auto-print handler
  const handleAutoPrint = (tripId, tripDate, enabled) => {
    if (enabled) setAutoPrintModal(true)
  }

  // render tab content
  const renderTabContent = () => {
    if (!data.length && activeTab !== 'all-trips') return null

    if (activeTab === 'all-trips') {
      if (!data.length) return (
        <div className="tm-empty">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1">
            <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/>
            <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <h3>No trips loaded</h3>
          <p>Select a date range and click <strong>Fetch Trips</strong> to get started.</p>
        </div>
      )
      return <AllTripsTab data={data} />
    }

    if (activeTab === 'trips') return (
      <TripsTab data={data} onViewDetails={openTripDetail} onAutoPrintToggle={handleAutoPrint} />
    )

    if (['orders', 'customers', 'lorries', 'pickers'].includes(activeTab)) return (
      <AggregateTab type={activeTab} data={data} />
    )

    if (activeTab.startsWith('trip-detail-')) {
      const tripId = activeTab.replace('trip-detail-', '')
      return <TripDetailTab tripId={tripId} data={data} />
    }

    return null
  }

  return (
    <div className="tm-page">
      {/* back button */}
      <button className="tm-back" onClick={() => navigate('/')}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Dashboard
      </button>

      {/* page title */}
      <div className="tm-page-title">
        <div className="tm-page-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/>
            <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        </div>
        <div>
          <h1>Trip Management</h1>
          <p>View and manage delivery trips, orders, and print jobs</p>
        </div>
      </div>

      {/* filter panel */}
      <div className="tm-filter-panel">
        <button className="tm-filter-toggle" onClick={() => setCollapsed((c) => !c)}>
          <span>Query Parameters</span>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {!collapsed && (
          <div className="tm-filter-body">
            <div className="tm-filter-field">
              <label>Instance Name</label>
              <select value={instance} onChange={(e) => setInstance(e.target.value)}>
                <option value="PROD">PROD</option>
                <option value="TEST">TEST</option>
                <option value="DEV">DEV</option>
              </select>
            </div>
            <div className="tm-filter-field">
              <label>From Date</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="tm-filter-field">
              <label>To Date</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <button className="tm-fetch-btn" onClick={handleFetch} disabled={loading}>
              {loading ? (
                <span className="spinner" />
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              )}
              {loading ? 'Fetching...' : 'Fetch Trips'}
            </button>
          </div>
        )}
      </div>

      {/* error banner */}
      {error && (
        <div className="tm-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <strong>Error fetching trips:</strong> {error}
          {error.toLowerCase().includes('cors') || error.toLowerCase().includes('failed to fetch') ? (
            <span> — CORS restriction detected. The Oracle APEX API must allow requests from this origin, or use the Desktop application.</span>
          ) : null}
        </div>
      )}

      {/* summary stats */}
      {data.length > 0 && <SummaryStats data={data} onTabOpen={openTab} />}

      {/* tabs */}
      <div className="tm-grid-container">
        <div className="tm-tab-bar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tm-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.closeable && (
                <span className="tab-close" onClick={(e) => closeTab(tab.id, e)}>×</span>
              )}
            </button>
          ))}
        </div>
        <div className="tm-tab-content">{renderTabContent()}</div>
      </div>

      <AutoPrintModal open={autoPrintModal} onClose={() => setAutoPrintModal(false)} />
    </div>
  )
}
