import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/SearchBar.css'

const PROPERTY_TYPES = ['All Types', 'Apartment', 'Villa', 'House', 'Studio', 'Commercial', 'Penthouse']
const PRICE_RANGES   = ['Any Price', 'Under $50k', '$50k–$150k', '$150k–$300k', '$300k+']

function SearchBar({ variant = 'hero' }) {
  const navigate = useNavigate()
  const [keyword,  setKeyword]  = useState('')
  const [propType, setPropType] = useState('All Types')
  const [price,    setPrice]    = useState('Any Price')
  const [status,   setStatus]   = useState('any')

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('search', keyword.trim())
    if (propType !== 'All Types') params.set('type', propType)
    if (status !== 'any') params.set('status', status)
    navigate(`/properties?${params.toString()}`)
  }

  return (
    <form
      className={`searchbar searchbar--${variant}`}
      onSubmit={handleSearch}
      noValidate
    >
      {/* ── Toggle: Sale / Rent ── */}
      <div className="searchbar__toggle">
        <button
          type="button"
          className={`searchbar__toggle-btn ${status === 'any' || status === 'sale' ? 'searchbar__toggle-btn--active' : ''}`}
          onClick={() => setStatus(status === 'sale' ? 'any' : 'sale')}
        >
          For Sale
        </button>
        <button
          type="button"
          className={`searchbar__toggle-btn ${status === 'rent' ? 'searchbar__toggle-btn--active' : ''}`}
          onClick={() => setStatus(status === 'rent' ? 'any' : 'rent')}
        >
          For Rent
        </button>
      </div>

      {/* ── Inputs row ── */}
      <div className="searchbar__row">

        {/* Keyword */}
        <div className="searchbar__field searchbar__field--keyword">
          <label className="searchbar__label">Location / Keyword</label>
          <div className="searchbar__input-wrap">
            <span className="searchbar__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input
              type="text"
              className="searchbar__input"
              placeholder="City, area, or address…"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="searchbar__divider" />

        {/* Type */}
        <div className="searchbar__field searchbar__field--select">
          <label className="searchbar__label">Property Type</label>
          <div className="searchbar__input-wrap">
            <span className="searchbar__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </span>
            <select
              className="searchbar__select"
              value={propType}
              onChange={e => setPropType(e.target.value)}
            >
              {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Divider */}
        <div className="searchbar__divider" />

        {/* Price */}
        <div className="searchbar__field searchbar__field--select">
          <label className="searchbar__label">Price Range</label>
          <div className="searchbar__input-wrap">
            <span className="searchbar__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </span>
            <select
              className="searchbar__select"
              value={price}
              onChange={e => setPrice(e.target.value)}
            >
              {PRICE_RANGES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="searchbar__submit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span>Search</span>
        </button>
      </div>
    </form>
  )
}

export default SearchBar
