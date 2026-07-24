import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Button from '../common/Button'
import { authNavLinks, guestNavLinks } from '../../config/navigation'
import './Navbar.css'

function Navbar({ isLoggedIn, onLogout, theme, onToggleTheme, activeUser }) {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const links = isLoggedIn ? authNavLinks : guestNavLinks

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const token = localStorage.getItem('placement-jwt-token')
  const isDemoMode = token && (token.startsWith('mock-jwt-token-') || token.startsWith('mock-token-'))

  return (
    <>
      {isDemoMode && (
        <div className="demo-mode-banner">
          <span>⚠️ Running in Demo Mode (Offline Fallback - Backend Unreachable). Database changes are local to this browser.</span>
        </div>
      )}
      <header className="navbar">
        <div className="navbar__brand">
          <p className="navbar__eyebrow">Placement Intelligence</p>
          <h1>Placement Eligibility Predictor</h1>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="navbar__links desktop-only" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <div className="navbar__mobile-toggle mobile-only">
          <button
            type="button"
            className="hamburger-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle Navigation Menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        <div className="navbar__actions desktop-only">
          {activeUser ? (
            <div className="navbar__user">
              <img
                src={activeUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeUser.displayName || 'User')}`}
                alt="Profile Avatar"
                className="navbar__avatar"
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeUser.displayName || 'User')}`
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span>Hi, {activeUser.displayName}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {activeUser.role === 'admin' ? '🛡️ Admin' : '🎓 Student'}
                </span>
              </div>
            </div>
          ) : null}
          <button className="theme-toggle" type="button" onClick={onToggleTheme}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          {isLoggedIn ? (
            <Button
              label="Logout"
              variant="secondary"
              onClick={() => {
                onLogout()
                navigate('/login')
              }}
            />
          ) : (
            <Button label="Get Started" variant="secondary" onClick={() => navigate('/register')} />
          )}
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen ? (
          <div className="navbar__mobile-drawer mobile-only">
            <nav className="mobile-nav-links">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={closeMobileMenu}
                  className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="mobile-drawer-actions">
              {activeUser ? (
                <div className="navbar__user mobile-user">
                  <img
                    src={activeUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeUser.displayName || 'User')}`}
                    alt="Profile Avatar"
                    className="navbar__avatar"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeUser.displayName || 'User')}`
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                    <span>Hi, {activeUser.displayName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {activeUser.role === 'admin' ? '🛡️ Admin Account' : '🎓 Student Account'}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="mobile-button-group">
                <button className="theme-toggle full-width" type="button" onClick={onToggleTheme}>
                  {theme === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
                </button>

                {isLoggedIn ? (
                  <Button
                    label="Logout"
                    variant="secondary"
                    onClick={() => {
                      closeMobileMenu()
                      onLogout()
                      navigate('/login')
                    }}
                  />
                ) : (
                  <Button
                    label="Get Started"
                    variant="primary"
                    onClick={() => {
                      closeMobileMenu()
                      navigate('/register')
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        ) : null}
      </header>
    </>
  )
}

export default Navbar
