import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import { getProperties } from '../lib/api'
import '../styles/Properties.css'

const TYPES    = ['All', 'Apartment', 'Villa', 'Studio', 'House', 'Commercial', 'Penthouse']
const STATUSES = ['All', 'sale', 'rent'] // updated for db enum
const SORT_OPTIONS = [
  { value: 'latest',     label: 'Newest First'      },
  { value: 'price-asc',  label: 'Price: Low   High' },
  { value: 'price-desc', label: 'Price: High   Low' },
  { value: 'rating',     label: 'Top Rated'         },
  { value: 'area-desc',  label: 'Largest First'     },
]

function Properties() {
  const [searchParams] = useSearchParams()

  const [properties, setProperties] = useState([])
  const [loadingProps, setLoadingProps] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    getProperties()
      .then(data => {
        setProperties(data)
        setLoadingProps(false)
      })
      .catch(err => {
        console.error('Failed to fetch properties:', err)
        setLoadError('We could not load listings right now. Please try again.')
        setLoadingProps(false)
      })
  }, [])

  const CITIES = ['All Cities', ...Array.from(new Set(properties.map(p => p.city || p.location))).sort()]

  const [search,    setSearch]    = useState(searchParams.get('search') || '')
  const [type,      setType]      = useState(searchParams.get('type')   || 'All')
  const [status,    setStatus]    = useState(searchParams.get('status') || 'All')
  const [city,      setCity]      = useState('All Cities')
  const [maxPrice,  setMaxPrice]  = useState(50000000)
  const [minBeds,   setMinBeds]   = useState(0)
  const [sortBy,    setSortBy]    = useState('latest')
  const [view,      setView]      = useState('grid')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filtered = useMemo(() => {
    let result = [...properties]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      )
    }
    if (type !== 'All')          result = result.filter(p => p.type === type)
    if (status !== 'All')        result = result.filter(p => p.status === status)
    if (city   !== 'All Cities') result = result.filter(p => (p.city || p.location) === city)
    result = result.filter(p => p.price <= maxPrice)
    if (minBeds > 0) result = result.filter(p => p.bedrooms >= minBeds)

    const sorted = [...result]
    if (sortBy === 'price-asc')  sorted.sort((a, b) => a.price  - b.price)
    if (sortBy === 'price-desc') sorted.sort((a, b) => b.price  - a.price)
    if (sortBy === 'latest')     sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    if (sortBy === 'area-desc')  sorted.sort((a, b) => b.area   - a.area)
    return sorted
  }, [search, type, status, city, maxPrice, minBeds, sortBy, properties])

  const resetAll = () => {
    setSearch(''); setType('All'); setStatus('All'); setCity('All Cities')
    setMaxPrice(50000000); setMinBeds(0); setSortBy('latest')
  }

  const activeCount = [
    search.trim(), type !== 'All', status !== 'All',
    city !== 'All Cities', maxPrice < 50000000, minBeds > 0,
  ].filter(Boolean).length

  return (
    <div className="prop-page">

      {/* ── Page Hero ── */}
      <div className="prop-page__hero">
        <div className="prop-page__hero-bg" />
        <div className="prop-page__hero-content">
          <nav className="prop-page__breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            <span>Properties</span>
          </nav>
          <h1 className="prop-page__hero-title">Browse Properties</h1>
          <p className="prop-page__hero-sub">
            {properties.length} verified listings across Bangladesh — find your perfect match.
          </p>
          <div className="prop-page__hero-stats">
            <span className="prop-page__hero-stat">{properties.filter(p => p.status === 'sale').length} For Sale</span>
            <span className="prop-page__hero-stat-sep" />
            <span className="prop-page__hero-stat">{properties.filter(p => p.status === 'rent').length} For Rent</span>
            <span className="prop-page__hero-stat-sep" />
            <span className="prop-page__hero-stat">{new Set(properties.map(p => p.city || p.location)).size} Cities</span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="prop-page__body">

        {/* Mobile bar */}
        <div className="prop-page__mobile-bar">
          <button className="prop-page__filter-btn" onClick={() => setSidebarOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Filters {activeCount > 0 && `(${activeCount})`}
          </button>
          <span className="prop-page__mobile-count">{filtered.length} results</span>
        </div>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="prop-sidebar__overlay" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="prop-page__layout">

          {/* ── Sidebar ── */}
          <aside className={`prop-sidebar ${sidebarOpen ? 'prop-sidebar--open' : ''}`}>
            <div className="prop-sidebar__head">
              <h2 className="prop-sidebar__title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/>
                  <line x1="11" y1="18" x2="13" y2="18"/>
                </svg>
                Filters
                {activeCount > 0 && <span className="prop-sidebar__badge">{activeCount}</span>}
              </h2>
              <div className="prop-sidebar__head-right">
                {activeCount > 0 && (
                  <button className="prop-sidebar__clear" onClick={resetAll}>Clear all</button>
                )}
                <button className="prop-sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Close filters">✕</button>
              </div>
            </div>

            {/* Keyword */}
            <div className="prop-sidebar__group">
              <label className="prop-sidebar__label">Keyword</label>
              <div className="prop-sidebar__input-wrap">
                <svg className="prop-sidebar__input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  type="text"
                  className="prop-sidebar__input"
                  placeholder="Title, area, keyword…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && <button className="prop-sidebar__input-clear" onClick={() => setSearch('')}>✕</button>}
              </div>
            </div>

            {/* Status */}
            <div className="prop-sidebar__group">
              <label className="prop-sidebar__label">Listing Type</label>
              <div className="prop-sidebar__tabs">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    className={`prop-sidebar__tab ${status === s ? 'prop-sidebar__tab--active' : ''}`}
                    onClick={() => setStatus(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div className="prop-sidebar__group">
              <label className="prop-sidebar__label">Property Type</label>
              <div className="prop-sidebar__chips">
                {TYPES.map(t => (
                  <button
                    key={t}
                    className={`prop-sidebar__chip ${type === t ? 'prop-sidebar__chip--on' : ''}`}
                    onClick={() => setType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* City */}
            <div className="prop-sidebar__group">
              <label className="prop-sidebar__label">City</label>
              <div className="prop-sidebar__select-wrap">
                <select
                  className="prop-sidebar__select"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                >
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <svg className="prop-sidebar__select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>

            {/* Max Price */}
            <div className="prop-sidebar__group">
              <label className="prop-sidebar__label">
                Max Price <span className="prop-sidebar__label-val">${maxPrice.toLocaleString()}</span>
              </label>
              <input
                type="range"
                className="prop-sidebar__range"
                min={20000} max={500000} step={5000}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
              />
              <div className="prop-sidebar__range-labels"><span>$20k</span><span>$500k</span></div>
            </div>

            {/* Min Bedrooms */}
            <div className="prop-sidebar__group">
              <label className="prop-sidebar__label">Min. Bedrooms</label>
              <div className="prop-sidebar__bed-row">
                {[0, 1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    className={`prop-sidebar__bed-btn ${minBeds === n ? 'prop-sidebar__bed-btn--on' : ''}`}
                    onClick={() => setMinBeds(n)}
                  >
                    {n === 0 ? 'Any' : `${n}+`}
                  </button>
                ))}
              </div>
            </div>

            <button className="prop-sidebar__reset" onClick={resetAll}>Reset All Filters</button>
          </aside>

          {/* ── Results ── */}
          <div className="prop-page__results">

            {/* Toolbar */}
            <div className="prop-page__toolbar">
              <p className="prop-page__count">
                <strong>{filtered.length}</strong> {filtered.length === 1 ? 'property' : 'properties'} found
                {activeCount > 0 && (
                  <button className="prop-page__clear-inline" onClick={resetAll}>Clear filters ✕</button>
                )}
              </p>
              <div className="prop-page__toolbar-right">
                <div className="prop-page__sort-wrap">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
                  <select
                    className="prop-page__sort"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="prop-page__view-toggle" role="group" aria-label="View mode">
                  <button
                    className={`prop-page__view-btn ${view === 'grid' ? 'prop-page__view-btn--on' : ''}`}
                    onClick={() => setView('grid')}
                    title="Grid view"
                    aria-pressed={view === 'grid'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  </button>
                  <button
                    className={`prop-page__view-btn ${view === 'list' ? 'prop-page__view-btn--on' : ''}`}
                    onClick={() => setView('list')}
                    title="List view"
                    aria-pressed={view === 'list'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="3" rx="1"/><rect x="3" y="10.5" width="18" height="3" rx="1"/><rect x="3" y="17" width="18" height="3" rx="1"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter tags */}
            {activeCount > 0 && (
              <div className="prop-page__active-filters">
                {search.trim() && <span className="prop-page__tag">🔍 "{search}" <button onClick={() => setSearch('')}>✕</button></span>}
                {type   !== 'All'        && <span className="prop-page__tag">🏠 {type}   <button onClick={() => setType('All')}>✕</button></span>}
                {status !== 'All'        && <span className="prop-page__tag">📋 {status} <button onClick={() => setStatus('All')}>✕</button></span>}
                {city   !== 'All Cities' && <span className="prop-page__tag">📍 {city}   <button onClick={() => setCity('All Cities')}>✕</button></span>}
                {maxPrice < 500000 && <span className="prop-page__tag">💰 Max ${maxPrice.toLocaleString()} <button onClick={() => setMaxPrice(500000)}>✕</button></span>}
                {minBeds > 0       && <span className="prop-page__tag">🛏 {minBeds}+ beds <button onClick={() => setMinBeds(0)}>✕</button></span>}
              </div>
            )}

            {/* Cards */}
            {loadError ? (
              <div className="prop-page__empty">
                <h3 className="prop-page__empty-title">Unable to load listings</h3>
                <p>{loadError}</p>
                <button className="prop-page__empty-btn" onClick={() => window.location.reload()}>Try again</button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="prop-page__empty">
                <div className="prop-page__empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <h3 className="prop-page__empty-title">No properties found</h3>
                <p className="prop-page__empty-sub">Try broadening your filters — we have {properties.length} listings in total.</p>
                <button className="prop-page__empty-reset" onClick={resetAll}>Reset All Filters</button>
              </div>
            ) : (
              <div className={`prop-page__grid prop-page__grid--${view}`}>
                {filtered.map((property, i) => (
                  <div
                    key={property.id}
                    className="prop-page__card-wrap"
                    style={{ animationDelay: `${Math.min(i, 8) * 55}ms` }}
                  >
                    <PropertyCard property={property} view={view} />
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            {filtered.length > 0 && (
              <div className="prop-page__footer">
                <p className="prop-page__footer-text">Showing {filtered.length} of {properties.length} properties</p>
                <Link to="/add-property" className="prop-page__footer-cta">+ List Your Property</Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default Properties
