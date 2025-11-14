import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Portals
import VendorPortal from './VendorPortal.jsx'
import EmployeePortal from './EmployeePortal.jsx'
import SuperAdminPortal from './SuperAdminPortal.jsx'

// Simple URL-based portal selection
function resolvePortal() {
  const path = (window.location.pathname || '').toLowerCase()
  const hash = (window.location.hash || '').toLowerCase()
  const params = new URLSearchParams(window.location.search)
  const portalParam = (params.get('portal') || '').toLowerCase()

  // Priority: explicit portal param > hash > path
  if (portalParam === 'superadmin' || hash.includes('superadmin') || path.includes('/superadmin') || path.includes('/adminx')) {
    return SuperAdminPortal
  }
  if (portalParam === 'admin' || hash.includes('admin') || path.includes('/admin')) {
    return EmployeePortal
  }
  // default vendor portal
  return VendorPortal
}

const AppComponent = resolvePortal()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>,
)
