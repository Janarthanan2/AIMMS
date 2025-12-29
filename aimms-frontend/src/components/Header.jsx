import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Header() {
  const role = localStorage.getItem('role') || 'USER';
  const dashboardLink = ['ADMIN', 'SUB_ADMIN'].includes(role) ? '/admin' : '/dashboard';

  const handleSignOut = () => {
    // Clear any stored authentication data
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to login or home page
    window.location.href = '/';
  };

  return (
    <header className="glass-strong border-b border-white/20 p-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-display font-semibold text-white">
          Welcome to AIMMS
        </div>
        <div className="flex items-center gap-6">
          {/* Navbar Navigation */}
          <nav className="flex items-center gap-4 mr-4">
            <NavLink
              to={dashboardLink}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${isActive ? 'bg-white/20 text-white shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <span className="text-lg">📊</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-medium ${isActive ? 'bg-white/20 text-white shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <span className="text-lg">🔔</span>
              <span>Notifications</span>
            </NavLink>
          </nav>

          <button
            onClick={handleSignOut}
            className="btn-vibrant text-sm px-4 py-2"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
