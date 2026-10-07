import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

import '../styles/PropertyDetails.css'
import { getProperty, createInquiry } from '../lib/api'

/* ── Icon helpers (inline SVG so zero deps) ── */
const Icon = ({ d, size = 18, vb = '0 0 24 24', fill = 'none', sw = 2 }) => (
  <svg width={size} height={size} viewBox={vb} fill={fill} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
)

/* Spec tile data builder */
function buildSpecs(p) {
  return [
    { icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', label: 'Type',      value: p.type },
    ...(p.bedrooms > 0 ? [{ icon: 'M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8|M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4|M12 4v6', label: 'Bedrooms',  value: p.bedrooms }] : []),
    { icon: 'M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5|M10 5 8 7|M2 12h20', label: 'Bathrooms', value: p.bathrooms },
    { icon: 'M3 3h18v18H3z|M3 9h18|M9 21V9', label: 'Area',      value: `${p.area?.toLocaleString()} sqft` },
    { icon: 'M8 6h13|M8 12h13|M8 18h13|M3 6h.01|M3 12h.01|M3 18h.01', label: 'Listed',    value: p.listed ? new Date(p.listed).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A' },
    { icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', label: 'Rating',    value: p.rating ? `${p.rating} / 5 (${p.reviews} reviews)` : 'No ratings yet', fill: '#f5a623', sw: 0 },
  ]
}

/* Amenity icon map */
const AMENITY_ICONS = {
  'Gym':            'M18 8h1a4 4 0 0 1 0 8h-1|M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z|M6 1v3|M10 1v3|M14 1v3',
  'Pool':           'M2 12h20|M2 20h20|M6 12v-1.5a6 6 0 0 1 12 0V12',
  'Parking':        'M13 17H5V5h6a4 4 0 0 1 0 8h-2',
  'Security':       'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  'Elevator':       'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3|M3 9v10a2 2 0 0 0 2 2h3m13-3v3a2 2 0 0 0-2 2h-3|M9 9h6|M9 15h6',
  'Balcony':        'M3 7h18|M5 7v14|M19 7v14|M5 14h14',
  'Garden':         'M7 20s4-6 4-11a7 7 0 0 0-7 0|M17 20s-4-6-4-11a7 7 0 0 1 7 0',
  'Garage':         'M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3|M9 17H7|M13 17h-2|M16 7v10a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2z',
  'Smart Home':     'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z|M9 22V12h6v10',
  'Wi-Fi':          'M5 12.55a11 11 0 0 1 14.08 0|M1.42 9a16 16 0 0 1 21.16 0|M8.53 16.11a6 6 0 0 1 6.95 0|M12 20h.01',
  'Furnished':      'M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3|M2 11v9h20v-9a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z|M10 20v-9|M14 20v-9',
  'AC':             'M8 16H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4|M12 16v6|M8 22h8',
  'Bills Included': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z|M9 12l2 2 4-4',
  'Sea View':       'M2 12h20|M2 18h20|M6 12c0-4 3-8 6-10 3 2 6 6 6 10',
  'Forest View':    'M17 8l4 4-4 4|M3 12h18|M12 2v4|M12 18v4',
  'Deck':           'M3 7h18|M5 7v14|M19 7v14|M5 14h14',
  'Solar':          'M12 1v2|M12 21v2|M4.22 4.22l1.42 1.42|M18.36 18.36l1.42 1.42|M1 12h2|M21 12h2|M4.22 19.78l1.42-1.42|M18.36 5.64l1.42-1.42|M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z',
  'Rainwater':      'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
  'Mezzanine':      'M3 7h18|M5 7v14|M19 7v14|M3 14h18',
  'Exposed Brick':  'M3 4h18v4H3z|M3 12h18v4H3z|M3 20h18v4H3z|M9 4v4|M15 4v4|M9 12v4|M15 12v4|M9 20v4|M15 20v4',
  'Pet Friendly':   'M20.25 8.11a.75.75 0 0 0-.06-.11|M9 12.75a3 3 0 0 0 6 0|M15.75 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0|M8.25 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0|M5.25 18a3.75 3.75 0 1 0 7.5 0 3.75 3.75 0 0 0-7.5 0',
  'Lake View':      'M2 12h20|M2 18h20|M6 12c0-4 3-8 6-10 3 2 6 6 6 10',
  'Sky Lounge':     'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'Fitness Center': 'M6.5 6.5h11|M6.5 17.5h11|M4 12h16|M2 9v6|M22 9v6',
  'Concierge':      'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2|M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  'Home Theatre':   'M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z|M10 21h4|M12 17v4',
  'Wine Cellar':    'M8 22h8|M7 10h10|M12 15v7|M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5z',
  'Private Elevator':'M8 3H5a2 2 0 0 0-2 2v3|M3 9v10a2 2 0 0 0 2 2h3|M21 3h-3a2 2 0 0 0-2 2v3|M21 9v10a2 2 0 0 0-2 2h-3|M9 9h6|M9 15h6',
  'Rooftop':        'M3 9l9-7 9 7|M9 21V12h6v9',
  'Fibre Internet': 'M5 12.55a11 11 0 0 1 14.08 0|M1.42 9a16 16 0 0 1 21.16 0|M8.53 16.11a6 6 0 0 1 6.95 0|M12 20h.01',
  'Generator':      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  'CCTV':           'M23 7l-7 5 7 5V7z|M1 5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1z',
  'Jetty':          'M2 12h20|M6 12V6|M18 12V6',
  'Guest Cottage':  'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z|M9 22V12h6v10',
}
const defaultAmenityIcon = 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'

function getAmenityIcon(name) {
  return AMENITY_ICONS[name] || defaultAmenityIcon
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
function PropertyDetails() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [property, setProperty] = useState(null)
  const [fetchLoading, setFetchLoading] = useState(true)

  useEffect(() => {
    getProperty(id)
      .then(data => {
        setProperty(data)
        setFetchLoading(false)
      })
      .catch(() => setFetchLoading(false))
  }, [id])

  const [inquiryForm, setInquiryForm]   = useState({ name: '', email: '', phone: '', message: '' })
  const [formSent,    setFormSent]       = useState(false)
  const [formErrors,  setFormErrors]     = useState({})
  const [saved,       setSaved]          = useState(false)

  /* ── 404 ── */
  if (fetchLoading) {
    return <div className="pd-notfound"><h2 className="pd-notfound__title">Loading property…</h2></div>
  }
  if (!property) {
    return (
      <div className="pd-notfound">
        <div className="pd-notfound__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <h2 className="pd-notfound__title">Property Not Found</h2>
        <p className="pd-notfound__sub">The listing you're looking for doesn't exist or has been removed.</p>
        <div className="pd-notfound__actions">
          <button className="pd-notfound__back" onClick={() => navigate(-1)}>← Go Back</button>
          <Link to="/properties" className="pd-notfound__browse">Browse All Properties</Link>
        </div>
      </div>
    )
  }
  const {
    title, location, price, status,
    bedrooms, bathrooms, area, description,
    image_url, created_at,
  } = property
  const image       = image_url || null
  const type        = property.type || 'Property'
  const city        = location || ''
  const agent       = property.agent || 'RealNest Agent'
  const agentPhone  = property.agentPhone || null
  const listed      = created_at || null
  const amenities   = property.amenities || []
  const rating      = property.rating || null
  const reviews     = property.reviews || 0
  const displayStatus = status === 'sale' ? 'For Sale' : status === 'rent' ? 'For Rent' : (status || 'For Sale')
  const isRent   = displayStatus === 'For Rent'
  const specs    = buildSpecs({ ...property, listed, rating, reviews, type })

  /* Related: same type or city, not current */
  const related = []

  /* Inquiry form handlers */
  const handleChange = e => {
    const { name, value } = e.target
    setInquiryForm(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateInquiry = () => {
    const e = {}
    if (!inquiryForm.name.trim())  e.name  = 'Name is required.'
    if (!inquiryForm.email.trim()) e.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(inquiryForm.email)) e.email = 'Enter a valid email.'
    return e
  }

  const handleInquiry = async e => {
    e.preventDefault()
    const errs = validateInquiry()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    try {
      await createInquiry({ propertyId: property.id, ...inquiryForm })
      setFormSent(true)
    } catch (error) {
      setFormErrors({ form: error.message })
    }
  }

  return (
    <div className="pd">

      {/* ══ TOP NAV BAR ══ */}
      <div className="pd__topbar">
        <div className="pd__topbar-inner">
          {/* Breadcrumb */}
          <nav className="pd__breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="pd__breadcrumb-sep">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </span>
            <Link to="/properties">Properties</Link>
            <span className="pd__breadcrumb-sep">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </span>
            <span className="pd__breadcrumb-current">{title}</span>
          </nav>

          {/* Action buttons */}
          <div className="pd__topbar-actions">
            <button
              className={`pd__action-btn ${saved ? 'pd__action-btn--saved' : ''}`}
              onClick={() => setSaved(s => !s)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {saved ? 'Saved' : 'Save'}
            </button>
            <button
              className="pd__action-btn"
              onClick={() => navigator.share?.({ title, url: window.location.href }) || alert('Link copied!')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share
            </button>
            <button className="pd__back-btn" onClick={() => navigate(-1)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back
            </button>
          </div>
        </div>
      </div>

      {/* ══ HERO IMAGE ══ */}
      <div className="pd__hero">
        <img src={image} alt={title} className="pd__hero-img" />
        <div className="pd__hero-overlay" />

        {/* Status + type tags */}
        <div className="pd__hero-tags">
          <span className={`pd__tag pd__tag--${isRent ? 'rent' : 'sale'}`}>{displayStatus}</span>
          <span className="pd__tag pd__tag--type">{type}</span>
        </div>

        {/* Price floating over image (desktop) */}
        <div className="pd__hero-price-float">
          <span className="pd__hero-price-val">${Number(price || 0).toLocaleString()}</span>
          <span className="pd__hero-price-note">{isRent ? '/ month' : 'total price'}</span>
        </div>
      </div>

      {/* ══ MAIN CONTENT AREA ══ */}
      <div className="pd__wrap">
        <div className="pd__layout">

          {/* ── LEFT / MAIN column ── */}
          <div className="pd__main">

            {/* ── Title block ── */}
            <div className="pd__title-block">
              <div className="pd__title-left">
                <h1 className="pd__title">{title}</h1>
                <p className="pd__location">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {location}
                </p>

                {/* Star rating */}
                <div className="pd__rating">
                  <div className="pd__stars">
                    {[1,2,3,4,5].map(n => (
                      <svg key={n} width="14" height="14" viewBox="0 0 24 24" fill={n <= Math.round(rating) ? '#f5a623' : 'none'} stroke="#f5a623" strokeWidth="1.5">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="pd__rating-val">{rating}</span>
                  <span className="pd__rating-count">({reviews} reviews)</span>
                </div>
              </div>

              {/* Price (mobile / tablet — always visible here) */}
              <div className="pd__price-block">
                <span className="pd__price">${Number(price || 0).toLocaleString()}</span>
                <span className="pd__price-note">{isRent ? '/ month' : 'total'}</span>
              </div>
            </div>

            {/* ── Key Specs ── */}
            <section className="pd__section" aria-label="Key specifications">
              <h2 className="pd__section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                Key Details
              </h2>
              <div className="pd__specs-grid">
                {specs.map(spec => (
                  <div key={spec.label} className="pd__spec-tile">
                    <div className="pd__spec-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24"
                        fill={spec.fill || 'none'}
                        stroke={spec.fill ? 'none' : 'currentColor'}
                        strokeWidth={spec.sw ?? 2}
                        strokeLinecap="round" strokeLinejoin="round"
                      >
                        {(Array.isArray(spec.icon) ? spec.icon : spec.icon.split('|')).map((d, i) => (
                          <path key={i} d={d} />
                        ))}
                      </svg>
                    </div>
                    <div>
                      <p className="pd__spec-label">{spec.label}</p>
                      <p className="pd__spec-value">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Description ── */}
            <section className="pd__section" aria-label="Description">
              <h2 className="pd__section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                About This Property
              </h2>
              <p className="pd__description">{description}</p>
              <p className="pd__description" style={{ marginTop: '1rem' }}>
                Located in {city}, this {type.toLowerCase()} is {isRent ? 'available for rent' : 'on the market'} at an asking price of ${Number(price || 0).toLocaleString()}{isRent ? ' per month' : ''}. The property spans {area?.toLocaleString()} sq ft{bedrooms > 0 ? ` with ${bedrooms} bedroom${bedrooms > 1 ? 's' : ''}` : ''} and {bathrooms} bathroom{bathrooms > 1 ? 's' : ''}, making it ideal for {type === 'Commercial' ? 'businesses and office use' : bedrooms >= 4 ? 'large families' : bedrooms >= 2 ? 'couples or small families' : 'individuals or couples'}.
              </p>
            </section>

            {/* ── Amenities ── */}
            {amenities.length > 0 && (
              <section className="pd__section" aria-label="Amenities">
                <h2 className="pd__section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Amenities &amp; Features
                </h2>
                <div className="pd__amenities">
                  {amenities.map(a => (
                    <div key={a} className="pd__amenity">
                      <div className="pd__amenity-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          {getAmenityIcon(a).split('|').map((d, i) => <path key={i} d={d} />)}
                        </svg>
                      </div>
                      <span className="pd__amenity-label">{a}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Location Info ── */}
            <section className="pd__section" aria-label="Location">
              <h2 className="pd__section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Location &amp; Neighbourhood
              </h2>
              <div className="pd__location-card">
                <div className="pd__location-map-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <p>Map view for {location}</p>
                  <span>Interactive map coming soon</span>
                </div>
                <div className="pd__location-details">
                  <div className="pd__location-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <strong>Full Address:</strong> {location}
                  </div>
                  <div className="pd__location-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    <strong>City:</strong> {city}
                  </div>
                  <div className="pd__location-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <strong>Listed On:</strong> {new Date(listed).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Related Properties ── */}
            {related.length > 0 && (
              <section className="pd__section pd__section--related" aria-label="Related properties">
                <h2 className="pd__section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Similar Properties
                </h2>
                <div className="pd__related-grid">
                  {related.map(r => (
                    <Link key={r.id} to={`/properties/${r.id}`} className="pd__related-card">
                      <div className="pd__related-img-wrap">
                        <img src={r.image} alt={r.title} className="pd__related-img" loading="lazy" />
                        <span className={`pd__related-badge pd__related-badge--${r.status === 'For Rent' ? 'rent' : 'sale'}`}>{r.status}</span>
                      </div>
                      <div className="pd__related-body">
                        <h4 className="pd__related-title">{r.title}</h4>
                        <p className="pd__related-loc">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {r.location}
                        </p>
                        <p className="pd__related-price">${r.Number(price || 0).toLocaleString()}{r.status === 'For Rent' ? '/mo' : ''}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── Bottom back button ── */}
            <div className="pd__bottom-nav">
              <button className="pd__bottom-back" onClick={() => navigate(-1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Back to results
              </button>
              <Link to="/properties" className="pd__browse-all">Browse All Properties →</Link>
            </div>

          </div>{/* end pd__main */}

          {/* ── RIGHT / SIDEBAR ── */}
          <aside className="pd__sidebar">

            {/* Price card */}
            <div className="pd__price-card">
              <div className="pd__price-card-top">
                <div>
                  <span className="pd__price-card-val">${Number(price || 0).toLocaleString()}</span>
                  <span className="pd__price-card-note">{isRent ? '/ month' : 'asking price'}</span>
                </div>
                <span className={`pd__price-card-badge pd__price-card-badge--${isRent ? 'rent' : 'sale'}`}>{displayStatus}</span>
              </div>
              <div className="pd__price-card-specs">
                {bedrooms > 0 && <span className="pd__price-card-spec">🛏 {bedrooms} Beds</span>}
                <span className="pd__price-card-spec">🚿 {bathrooms} Baths</span>
                <span className="pd__price-card-spec">📐 {area?.toLocaleString()} sqft</span>
              </div>
            </div>

            {/* Agent card */}
            <div className="pd__agent-card">
              <div className="pd__agent-avatar">
                {agent.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="pd__agent-info">
                <h3 className="pd__agent-name">{agent}</h3>
                <p className="pd__agent-role">Verified Listing Agent</p>
                <div className="pd__agent-stars">
                  {[1,2,3,4,5].map(n => (
                    <svg key={n} width="12" height="12" viewBox="0 0 24 24" fill="#f5a623" stroke="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                  <span>5.0</span>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="pd__contact-info">
              <h3 className="pd__contact-title">Contact Information</h3>
              <a href={`tel:${agentPhone}`} className="pd__contact-row pd__contact-row--link">
                <div className="pd__contact-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.67 16z"/></svg>
                </div>
                <div>
                  <span className="pd__contact-label">Phone</span>
                  <span className="pd__contact-value">{agentPhone}</span>
                </div>
              </a>
              <div className="pd__contact-row">
                <div className="pd__contact-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div>
                  <span className="pd__contact-label">Email</span>
                  <span className="pd__contact-value">{agent.toLowerCase().replace(' ', '.') }@realnest.bd</span>
                </div>
              </div>
              <div className="pd__contact-row">
                <div className="pd__contact-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <span className="pd__contact-label">Available</span>
                  <span className="pd__contact-value">Mon – Sat, 9am – 6pm</span>
                </div>
              </div>
            </div>

            {/* Inquiry form */}
            <div className="pd__inquiry">
              <h3 className="pd__inquiry-title">
                {formSent ? '✅ Message Sent!' : 'Send an Inquiry'}
              </h3>

              {formSent ? (
                <div className="pd__inquiry-success">
                  <p>Thank you! <strong>{agent}</strong> will get back to you shortly.</p>
                  <button className="pd__inquiry-again" onClick={() => { setFormSent(false); setInquiryForm({ name:'', email:'', phone:'', message:'' }) }}>
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="pd__inquiry-form" onSubmit={handleInquiry} noValidate>
                  <div className="pd__field">
                    <label className="pd__field-label">Full Name <span>*</span></label>
                    <input
                      type="text"
                      name="name"
                      className={`pd__field-input ${formErrors.name ? 'pd__field-input--err' : ''}`}
                      placeholder="Your full name"
                      value={inquiryForm.name}
                      onChange={handleChange}
                    />
                    {formErrors.name && <p className="pd__field-err">{formErrors.name}</p>}
                  </div>

                  <div className="pd__field">
                    <label className="pd__field-label">Email Address <span>*</span></label>
                    <input
                      type="email"
                      name="email"
                      className={`pd__field-input ${formErrors.email ? 'pd__field-input--err' : ''}`}
                      placeholder="you@example.com"
                      value={inquiryForm.email}
                      onChange={handleChange}
                    />
                    {formErrors.email && <p className="pd__field-err">{formErrors.email}</p>}
                  </div>

                  <div className="pd__field">
                    <label className="pd__field-label">Phone <span className="pd__field-opt">(optional)</span></label>
                    <input
                      type="tel"
                      name="phone"
                      className="pd__field-input"
                      placeholder="+880 1XXX XXXXXX"
                      value={inquiryForm.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="pd__field">
                    <label className="pd__field-label">Message</label>
                    <textarea
                      name="message"
                      className="pd__field-input pd__field-textarea"
                      rows="4"
                      value={inquiryForm.message || `Hi, I am interested in "${title}". Please contact me.`}
                      onChange={handleChange}
                    />
                  </div>

                  <button type="submit" className="pd__inquiry-submit">
                    Send Message
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </form>
              )}
            </div>

          </aside>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetails



