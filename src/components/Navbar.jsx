import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import '../styles/Navbar.css'

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/properties', label: 'Properties', end: false },
  { to: '/add-property', label: 'Add Property', end: false },
]
const navCls = ({ isActive }) => ['nb__link', isActive ? 'nb__link--active' : ''].filter(Boolean).join(' ')
const drawerCls = ({ isActive }) => ['nb__drawer-link', isActive ? 'nb__drawer-link--active' : ''].filter(Boolean).join(' ')

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } })
  const lastScrollY = useRef(0)
  const drawerRef = useRef(null)
  const location = useLocation()
  const syncUser = useCallback(() => { try { setUser(JSON.parse(localStorage.getItem('user'))) } catch { setUser(null) } }, [])
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); setProfileOpen(false); window.dispatchEvent(new Event('auth-changed')); window.location.href = '/' }

  useEffect(() => { setOpen(false); setProfileOpen(false) }, [location.pathname])
  useEffect(() => { window.addEventListener('auth-changed', syncUser); window.addEventListener('storage', syncUser); return () => { window.removeEventListener('auth-changed', syncUser); window.removeEventListener('storage', syncUser) } }, [syncUser])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [open])
  useEffect(() => { const onScroll = () => { const y = window.scrollY; setScrolled(y > 10); setVisible(y < lastScrollY.current || y < 60); lastScrollY.current = y }; window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll) }, [])
  const handleOverlayClick = useCallback(() => setOpen(false), [])
  useEffect(() => { const onKey = event => { if (event.key === 'Escape') { setOpen(false); setProfileOpen(false) } }; document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey) }, [])
  const toggle = () => setOpen(previous => !previous)
  const visibleLinks = NAV_LINKS.filter(link => link.to !== '/add-property' || user?.role === 'agent')

  return <>
    <header className={['nb', scrolled ? 'nb--scrolled' : '', !visible ? 'nb--hidden' : '', open ? 'nb--open' : ''].filter(Boolean).join(' ')} role="banner">
      <div className="nb__inner">
        <Link to="/" className="nb__brand" aria-label="RealNest — go to homepage"><span className="nb__brand-icon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span><span className="nb__brand-name">RealNest</span></Link>
        <nav className="nb__nav" aria-label="Main navigation">{visibleLinks.map(({ to, label, end }) => <NavLink key={to} to={to} end={end} className={navCls}>{label}</NavLink>)}{user?.role === 'admin' && <NavLink to="/admin" className={navCls}>Admin</NavLink>}</nav>
        <div className="nb__auth" role="group" aria-label="Account actions">{user ? <div className="nb__profile"><button className="nb__profile-trigger" onClick={() => setProfileOpen(value => !value)} aria-expanded={profileOpen} aria-haspopup="menu">{user.avatar_url ? <img src={user.avatar_url} alt="" className="nb__avatar" /> : <span className="nb__avatar">{user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}</span>}<span className="nb__profile-copy"><strong>{user.name?.split(' ')[0] || 'Account'}</strong><small>{user.role === 'admin' ? 'Administrator' : user.role === 'agent' ? 'Agent account' : 'Customer account'}</small></span><svg className="nb__profile-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg></button>{profileOpen && <div className="nb__profile-menu" role="menu"><div className="nb__profile-menu-head"><span>Signed in as</span><strong>{user.email}</strong></div>{user.role === 'admin' && <Link to="/admin" className="nb__profile-menu-item" onClick={() => setProfileOpen(false)}><span>⌘</span> Admin dashboard</Link>}{user.role === 'agent' && <Link to="/add-property" className="nb__profile-menu-item" onClick={() => setProfileOpen(false)}><span>＋</span> List a property</Link>}<button className="nb__profile-menu-item nb__profile-menu-item--danger" onClick={handleLogout}><span>↪</span> Sign out</button></div>}</div> : <><NavLink to="/login" className="nb__auth-btn nb__auth-btn--ghost">Login</NavLink><NavLink to="/register" className="nb__auth-btn nb__auth-btn--solid">Register</NavLink></>}</div>
        <button className={['nb__hamburger', open ? 'nb__hamburger--open' : ''].filter(Boolean).join(' ')} onClick={toggle} aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="nb-drawer"><span className="nb__ham-box" aria-hidden="true"><span className="nb__ham-line nb__ham-line--top"/><span className="nb__ham-line nb__ham-line--middle"/><span className="nb__ham-line nb__ham-line--bottom"/></span></button>
      </div>
    </header>
    <div className={['nb__overlay', open ? 'nb__overlay--visible' : ''].filter(Boolean).join(' ')} onClick={handleOverlayClick} aria-hidden="true" />
    <nav id="nb-drawer" ref={drawerRef} className={['nb__drawer', open ? 'nb__drawer--open' : ''].filter(Boolean).join(' ')} aria-label="Mobile navigation" aria-hidden={!open}>
      <div className="nb__drawer-head"><Link to="/" className="nb__drawer-brand" onClick={() => setOpen(false)}><span className="nb__brand-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span><span className="nb__brand-name">RealNest</span></Link><button className="nb__drawer-close" onClick={() => setOpen(false)} aria-label="Close menu">×</button></div>
      <div className="nb__drawer-nav"><p className="nb__drawer-section">Navigation</p>{visibleLinks.map(({ to, label, end }, i) => <NavLink key={to} to={to} end={end} className={drawerCls} style={{ animationDelay: `${i * 50}ms` }} onClick={() => setOpen(false)}><span>{label}</span><span className="nb__drawer-arrow">›</span></NavLink>)}{user?.role === 'admin' && <NavLink to="/admin" className={drawerCls} onClick={() => setOpen(false)}><span>Admin dashboard</span><span className="nb__drawer-arrow">›</span></NavLink>}</div>
      <div className="nb__drawer-auth"><p className="nb__drawer-section">Account</p>{user ? <><div className="nb__drawer-user"><span className="nb__avatar">{user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}</span><div><strong>{user.name}</strong><small>{user.role === 'admin' ? 'Administrator' : user.role === 'agent' ? 'Agent account' : 'Customer account'}</small></div></div><button type="button" className="nb__drawer-link nb__drawer-logout" onClick={handleLogout}><span>↪</span><span>Sign out</span></button></> : <><NavLink to="/login" className={drawerCls} onClick={() => setOpen(false)}><span>Login</span><span className="nb__drawer-arrow">›</span></NavLink><Link to="/register" className="nb__drawer-cta" onClick={() => setOpen(false)}>Create Free Account</Link></>}</div>
      <div className="nb__drawer-foot"><p>© {new Date().getFullYear()} RealNest. All rights reserved.</p></div>
    </nav>
  </>
}
export default Navbar
