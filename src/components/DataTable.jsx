import { useState, useMemo } from 'react'
import './DataTable.css'

export default function DataTable({
  columns,
  data,
  pageSize = 20,
  searchable = true,
  exportFileName,
  height,
}) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let rows = data
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter((r) =>
        Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q))
      )
    }
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        if (av == null && bv == null) return 0
        if (av == null) return 1
        if (bv == null) return -1
        const an = parseFloat(av)
        const bn = parseFloat(bv)
        if (!isNaN(an) && !isNaN(bn)) return sortDir === 'asc' ? an - bn : bn - an
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av))
      })
    }
    return rows
  }, [data, search, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageData = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const exportCSV = () => {
    const headers = columns.map((c) => `"${c.label}"`).join(',')
    const rows = filtered.map((r) =>
      columns
        .map((c) => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportFileName || 'export'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="dt-wrapper" style={height ? { height } : {}}>
      <div className="dt-toolbar">
        {searchable && (
          <input
            className="dt-search"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        )}
        <span className="dt-count">
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
        {exportFileName && (
          <button className="dt-export-btn" onClick={exportCSV}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export CSV
          </button>
        )}
      </div>

      <div className="dt-scroll">
        <table className="dt-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={col.sortable !== false ? 'sortable' : ''}
                  style={col.width ? { minWidth: col.width } : {}}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="sort-arrow">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr key={i} className={i % 2 !== 0 ? 'dt-alt' : ''}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ textAlign: col.align || 'left' }}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
            {pageData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="dt-empty">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="dt-pagination">
          <button onClick={() => setPage(1)} disabled={safePage === 1}>«</button>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>‹</button>
          <span className="dt-page-info">
            Page {safePage} of {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>›</button>
          <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>»</button>
        </div>
      )}
    </div>
  )
}
