import { useNavigate } from 'react-router-dom'
import ModulePlaceholder from './ModulePlaceholder'

const icon = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

export default function WMS() {
  const navigate = useNavigate()

  const sections = [
    {
      title: 'Trip Management',
      description: 'View delivery trips, filter by date and lorry, monitor order details and auto-print PDFs.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/>
          <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
      live: true,
      onOpen: () => navigate('/wms/trips'),
    },
    {
      title: 'Bin Locations',
      description: 'View and manage all warehouse bin locations, zones, and aisles.',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    },
    {
      title: 'Putaway',
      description: 'Assign stock to warehouse locations following putaway rules.',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
    },
    {
      title: 'Picking',
      description: 'Generate and manage pick lists for outbound orders.',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    },
    {
      title: 'Cycle Counts',
      description: 'Schedule and perform bin-level cycle counting for inventory accuracy.',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
    },
    {
      title: 'Wave Management',
      description: 'Create and release picking waves for efficient order fulfilment.',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    },
  ]

  return (
    <ModulePlaceholder
      title="Warehouse Management System"
      subtitle="Manage bin locations, putaway, picking, and warehouse operations"
      icon={icon}
      color="#1e3a5f"
      bg="#eef2f8"
      sections={sections}
    />
  )
}
