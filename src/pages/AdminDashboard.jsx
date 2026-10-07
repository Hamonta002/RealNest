import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAdminOverview, updateAdminUserRole, removeAdminUser, updateAdminListingStatus } from '../lib/api'
import '../styles/AdminDashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState({ stats: {}, users: [], pendingListings: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const currentUser = (() => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } })()

  const load = useCallback(async () => {
    try { setLoading(true); setError(''); setData(await getAdminOverview()) }
    catch (err) { setError(err.message); if (err.message.includes('Admin access')) navigate('/') }
    finally { setLoading(false) }
  }, [navigate])

  useEffect(() => { if (currentUser?.role !== 'admin') { navigate('/'); return }; load() }, [currentUser?.role, load, navigate])

  const decide = async (id, approval_status) => {
    try { setBusy(`listing-${id}`); await updateAdminListingStatus(id, { approval_status }); await load() }
    catch (err) { setError(err.message) } finally { setBusy('') }
  }
  const changeRole = async (id, role) => {
    try { setBusy(`user-${id}`); await updateAdminUserRole(id, { role }); await load() }
    catch (err) { setError(err.message) } finally { setBusy('') }
  }
  const removeUser = async (id) => {
    if (!window.confirm('Remove this user account?')) return
    try { setBusy(`user-${id}`); await removeAdminUser(id); await load() }
    catch (err) { setError(err.message) } finally { setBusy('') }
  }

  if (currentUser?.role !== 'admin') return null
  const stats = data.stats || {}

  return (
    <div className="admin-page">
      <header className="admin-header"><div><p className="admin-eyebrow">RealNest control center</p><h1>Admin dashboard</h1><p>Keep the marketplace trusted, organized, and ready for every customer.</p></div><Link to="/properties" className="admin-header-link">View marketplace →</Link></header>
      <main className="admin-main">
        {error && <div className="admin-alert">{error}<button onClick={() => setError('')}>×</button></div>}
        <section className="admin-stat-grid" aria-label="Platform overview">
          {[['totalUsers', 'Total users', '👥'], ['agents', 'Agents', '🤝'], ['customers', 'Customers', '🏠'], ['pendingListings', 'Pending listings', '⏳']].map(([key, label, icon]) => <article className={`admin-stat admin-stat--${key}`} key={key}><span>{icon}</span><div><strong>{loading ? '—' : stats[key] ?? 0}</strong><small>{label}</small></div></article>)}
        </section>
        <div className="admin-content-grid">
          <section className="admin-panel admin-panel--wide"><div className="admin-panel-head"><div><p className="admin-eyebrow">Review queue</p><h2>Pending property listings</h2></div><span className="admin-count">{data.pendingListings.length}</span></div>
            {loading ? <div className="admin-empty">Loading listings…</div> : data.pendingListings.length === 0 ? <div className="admin-empty"><strong>All clear</strong><span>No listings are waiting for review.</span></div> : <div className="admin-listings">{data.pendingListings.map(property => <article className="admin-listing" key={property.id}><img src={property.image_url} alt="" /><div className="admin-listing-info"><div className="admin-listing-top"><div><h3>{property.title}</h3><p>{property.location}</p></div><span className="admin-badge admin-badge--pending">Pending</span></div><div className="admin-listing-meta"><span>{property.type}</span><span>{property.bedrooms} bed · {property.bathrooms} bath</span><strong>${Number(property.price).toLocaleString()}</strong></div><p className="admin-listing-description">{property.description}</p><div className="admin-actions"><button disabled={busy === `listing-${property.id}`} onClick={() => decide(property.id, 'approved')} className="admin-action admin-action--approve">Approve</button><button disabled={busy === `listing-${property.id}`} onClick={() => decide(property.id, 'rejected')} className="admin-action admin-action--reject">Reject</button></div></div></article>)}</div>}
          </section>
          <section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-eyebrow">Account directory</p><h2>Agents & customers</h2></div><span className="admin-count">{data.users.length}</span></div>
            {loading ? <div className="admin-empty">Loading users…</div> : <div className="admin-users">{data.users.map(user => <article className="admin-user" key={user.id}><span className="admin-user-avatar">{user.name?.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}</span><div className="admin-user-main"><strong>{user.name}</strong><small>{user.email}</small><div className="admin-user-controls"><select value={user.role} disabled={busy === `user-${user.id}`} onChange={event => changeRole(user.id, event.target.value)} aria-label={`Role for ${user.name}`}><option value="customer">Customer</option><option value="agent">Agent</option></select><button className="admin-remove" disabled={busy === `user-${user.id}`} onClick={() => removeUser(user.id)}>Remove</button></div></div></article>)}</div>}
          </section>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
