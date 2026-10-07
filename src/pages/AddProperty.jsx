import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/AddProperty.css'
import { createProperty } from '../lib/api'

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const PROPERTY_TYPES   = ['Apartment', 'Villa', 'House', 'Studio', 'Penthouse', 'Commercial', 'Land']
const LISTING_STATUSES = ['For Sale', 'For Rent']
const AMENITY_OPTIONS  = [
  'Parking', 'Gym', 'Swimming Pool', 'Security', 'Elevator',
  'Balcony', 'Garden', 'Garage', 'Wi-Fi', 'Furnished',
  'AC', 'Generator', 'Solar', 'CCTV', 'Pet Friendly',
]

const INITIAL_FORM = {
  title:       '',
  type:        'Apartment',
  status:      'For Sale',
  location:    '',
  city:        '',
  price:       '',
  bedrooms:    '',
  bathrooms:   '',
  area:        '',
  description: '',
  amenities:   [],
  image:       '',
  agentName:   '',
  agentPhone:  '',
  agentEmail:  '',
}

/* ─────────────────────────────────────────────
   Validation — returns { field: 'message' }
───────────────────────────────────────────── */
function validate(form) {
  const e = {}

  if (!form.title.trim())
    e.title = 'Property title is required.'
  else if (form.title.trim().length < 6)
    e.title = 'Title must be at least 6 characters.'

  if (!form.location.trim())
    e.location = 'Full address is required.'

  if (!form.city.trim())
    e.city = 'City is required.'

  if (!form.price || Number(form.price) <= 0)
    e.price = 'Enter a valid price greater than 0.'

  if (form.bedrooms !== '' && Number(form.bedrooms) < 0)
    e.bedrooms = 'Cannot be negative.'

  if (form.bathrooms !== '' && Number(form.bathrooms) < 0)
    e.bathrooms = 'Cannot be negative.'

  if (form.area !== '' && Number(form.area) <= 0)
    e.area = 'Must be greater than 0.'

  if (!form.description.trim())
    e.description = 'Description is required.'
  else if (form.description.trim().split(/\s+/).length < 15)
    e.description = 'Please write at least 15 words.'

  if (form.image.trim() && !/^https?:\/\/.+\..+/.test(form.image.trim()))
    e.image = 'Enter a valid URL starting with http:// or https://.'

  if (form.agentEmail.trim() && !/\S+@\S+\.\S+/.test(form.agentEmail.trim()))
    e.agentEmail = 'Enter a valid email address.'

  return e
}

/* ─────────────────────────────────────────────
   Reusable field wrapper
───────────────────────────────────────────── */
function Field({ label, required, optional, hint, error, children }) {
  return (
    <div className={`apf-field ${error ? 'apf-field--err' : ''}`}>
      <label className="apf-label">
        {label}
        {required && <span className="apf-req" aria-hidden="true"> *</span>}
        {optional && <span className="apf-opt"> (optional)</span>}
      </label>
      {hint && <p className="apf-hint">{hint}</p>}
      {children}
      {error && (
        <p className="apf-error" role="alert">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Live image preview
───────────────────────────────────────────── */
function ImagePreview({ url }) {
  const [imgState, setImgState] = useState('idle')

  const isValid = url && /^https?:\/\/.+\..+/.test(url.trim())
  if (!isValid) return null

  return (
    <div className="apf-img-preview">
      <p className="apf-img-preview__label">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        Live Preview
      </p>
      <div className={`apf-img-preview__frame apf-img-preview__frame--${imgState}`}>
        {imgState === 'error' ? (
          <div className="apf-img-preview__fail">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Could not load image — check the URL</span>
          </div>
        ) : (
          <img
            key={url}
            src={url}
            alt="Property preview"
            className="apf-img-preview__img"
            onLoad={() => setImgState('ok')}
            onError={() => setImgState('error')}
          />
        )}
        {imgState === 'ok' && (
          <span className="apf-img-preview__tick">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Image loaded
          </span>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Progress bar (scroll-linked via completion %)
───────────────────────────────────────────── */
function FormProgress({ form, errors }) {
  const required = ['title', 'location', 'city', 'price', 'description']
  const filled   = required.filter(k => String(form[k]).trim() !== '').length
  const pct      = Math.round((filled / required.length) * 100)

  return (
    <div className="apf-progress">
      <div className="apf-progress__bar">
        <div className="apf-progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="apf-progress__label">{pct}% complete</span>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
function AddProperty() {
  const navigate   = useNavigate()
  const topRef     = useRef(null)
  const [currentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  const [form,       setForm]       = useState(INITIAL_FORM)
  const [errors,     setErrors]     = useState({})
  const [touched,    setTouched]    = useState({})
  const [submitted,  setSubmitted]  = useState(false)
  const [submitting, setSubmitting] = useState(false)

  /* ── Handle input change ── */
  const handleChange = e => {
    const { name, value, type, checked } = e.target

    if (name === 'amenities') {
      setForm(prev => ({
        ...prev,
        amenities: checked
          ? [...prev.amenities, value]
          : prev.amenities.filter(a => a !== value),
      }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }

    // Clear error on change
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  /* ── Validate on blur ── */
  const handleBlur = e => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const all = validate(form)
    if (all[name]) setErrors(prev => ({ ...prev, [name]: all[name] }))
    else           setErrors(prev => ({ ...prev, [name]: '' }))
  }

  /* ── Get error only if touched ── */
  const err = name => (touched[name] || submitted) ? errors[name] : ''

  /* ── Submit ── */
  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitted(true)

    const all = validate(form)
    setErrors(all)

    // Mark all fields as touched
    const t = {}
    Object.keys(INITIAL_FORM).forEach(k => { t[k] = true })
    setTouched(t)

    if (Object.keys(all).length > 0) {
      // Scroll to first error
      const firstErrEl = document.querySelector('.apf-field--err')
      firstErrEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    try {
      await createProperty({
        title: form.title, description: form.description, price: form.price,
        location: form.location, city: form.city, type: form.type, status: form.status,
        bedrooms: form.bedrooms, bathrooms: form.bathrooms, area: form.area,
        amenities: form.amenities, image_url: form.image,
        agent: form.agentName, agentPhone: form.agentPhone, agentEmail: form.agentEmail,
      })

      setSubmitting(false)
      setSubmitted(false)
      navigateToSuccess()
    } catch (error) {
      console.error('Add Property error:', error)
      alert('Network error. Is the backend running?')
      setSubmitting(false)
    }
  }

  const [success, setSuccess] = useState(false)
  const navigateToSuccess = () => setSuccess(true)

  if (currentUser?.role !== 'agent') {
    return (
      <section className="apf-page apf-page--access-denied">
        <div className="apf-access-card">
          <div className="apf-access-icon" aria-hidden="true">🔒</div>
          <p className="apf-eyebrow">Agent access only</p>
          <h1 className="apf-access-title">Only agents can list properties</h1>
          <p className="apf-access-copy">Create an agent account to publish and manage property listings on RealNest. Customers can still browse properties and contact agents.</p>
          <div className="apf-access-actions">
            <Link to="/register" className="apf-access-btn apf-access-btn--primary">Create agent account</Link>
            <Link to="/properties" className="apf-access-btn apf-access-btn--secondary">Browse properties</Link>
          </div>
        </div>
      </section>
    )
  }

  const handleReset = () => {
    setForm(INITIAL_FORM)
    setErrors({})
    setTouched({})
    setSubmitted(false)
    setSuccess(false)
    topRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  /* ──────────────────────────────────────────
     SUCCESS SCREEN
  ─────────────────────────────────────────── */
  if (success) {
    return (
      <div className="apf-page">
        <div className="apf-success">
          <div className="apf-success__circle">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 className="apf-success__title">Property Listed!</h2>
          <p className="apf-success__sub">
            <strong>"{form.title}"</strong> has been submitted successfully.
            Our team will review and publish it within 24 hours.
          </p>
          <div className="apf-success__meta">
            <span>📍 {form.location}</span>
            <span>💰 ${Number(form.price).toLocaleString()}{form.status === 'For Rent' ? '/mo' : ''}</span>
            <span>🏠 {form.type} · {form.status}</span>
          </div>
          <div className="apf-success__actions">
            <button className="apf-success__new" onClick={handleReset}>
              + Add Another Property
            </button>
            <Link to="/properties" className="apf-success__browse">
              Browse All Properties →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* ──────────────────────────────────────────
     FORM
  ─────────────────────────────────────────── */
  return (
    <div className="apf-page" ref={topRef}>

      {/* ══ PAGE HEADER ══ */}
      <div className="apf-page__header">
        <div className="apf-page__header-bg" />
        <div className="apf-page__header-content">
          <nav className="apf-breadcrumb">
            <Link to="/">Home</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            <Link to="/properties">Properties</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            <span>Add Property</span>
          </nav>
          <h1 className="apf-page__title">List Your Property</h1>
          <p className="apf-page__sub">
            Fill in the details below to publish your property on RealNest.
            Fields marked <span className="apf-req">*</span> are required.
          </p>
        </div>
      </div>

      {/* ══ FORM BODY ══ */}
      <div className="apf-body">
        <div className="apf-layout">

          {/* ── LEFT: main form ── */}
          <div className="apf-main">
            <FormProgress form={form} errors={errors} />

            <form onSubmit={handleSubmit} noValidate className="apf-form">

              {/* ════════════════════════════════
                  CARD 1 — Basic Information
              ════════════════════════════════ */}
              <div className="apf-card" id="section-basic">
                <div className="apf-card__header">
                  <div className="apf-card__icon apf-card__icon--1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="apf-card__title">Basic Information</h2>
                    <p className="apf-card__sub">Tell us about the property</p>
                  </div>
                </div>

                <div className="apf-card__body">

                  {/* Title */}
                  <Field label="Property Title" required error={err('title')}>
                    <div className="apf-input-wrap">
                      <svg className="apf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      <input
                        type="text"
                        name="title"
                        className={`apf-input apf-input--icon ${err('title') ? 'apf-input--err' : ''}`}
                        placeholder="e.g. Modern 3BR Apartment in Gulshan"
                        value={form.title}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={100}
                      />
                      <span className="apf-char">{form.title.length}/100</span>
                    </div>
                  </Field>

                  {/* Type & Status row */}
                  <div className="apf-row">
                    <Field label="Property Type" required>
                      <div className="apf-select-wrap">
                        <svg className="apf-select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                        <select
                          name="type"
                          className="apf-select"
                          value={form.type}
                          onChange={handleChange}
                        >
                          {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                        <svg className="apf-select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </Field>

                    <Field label="Listing Status" required>
                      <div className="apf-toggle-row">
                        {LISTING_STATUSES.map(s => (
                          <label key={s} className={`apf-toggle-opt ${form.status === s ? 'apf-toggle-opt--on' : ''}`}>
                            <input
                              type="radio"
                              name="status"
                              value={s}
                              checked={form.status === s}
                              onChange={handleChange}
                              className="apf-sr-only"
                            />
                            {s === 'For Sale' ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                            )}
                            {s}
                          </label>
                        ))}
                      </div>
                    </Field>
                  </div>

                  {/* Location */}
                  <Field label="Full Address" required error={err('location')}
                    hint="Street name, area, neighbourhood">
                    <div className="apf-input-wrap">
                      <svg className="apf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      <input
                        type="text"
                        name="location"
                        className={`apf-input apf-input--icon ${err('location') ? 'apf-input--err' : ''}`}
                        placeholder="e.g. House 12, Road 5, Gulshan-2"
                        value={form.location}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>
                  </Field>

                  {/* City */}
                  <Field label="City" required error={err('city')}>
                    <div className="apf-input-wrap">
                      <svg className="apf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      <input
                        type="text"
                        name="city"
                        className={`apf-input apf-input--icon ${err('city') ? 'apf-input--err' : ''}`}
                        placeholder="e.g. Dhaka"
                        value={form.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>
                  </Field>

                </div>
              </div>

              {/* ════════════════════════════════
                  CARD 2 — Pricing & Specs
              ════════════════════════════════ */}
              <div className="apf-card" id="section-pricing">
                <div className="apf-card__header">
                  <div className="apf-card__icon apf-card__icon--2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="apf-card__title">Pricing &amp; Specifications</h2>
                    <p className="apf-card__sub">Set the price and property details</p>
                  </div>
                </div>

                <div className="apf-card__body">

                  {/* Price */}
                  <Field label="Price (USD)" required error={err('price')}>
                    <div className="apf-input-wrap">
                      <span className="apf-input-prefix">$</span>
                      <input
                        type="number"
                        name="price"
                        className={`apf-input apf-input--prefix ${err('price') ? 'apf-input--err' : ''}`}
                        placeholder="0"
                        min="0"
                        value={form.price}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {form.status === 'For Rent' && (
                        <span className="apf-input-suffix">/mo</span>
                      )}
                    </div>
                    {form.price && Number(form.price) > 0 && (
                      <p className="apf-price-display">
                        ${Number(form.price).toLocaleString()}
                        {form.status === 'For Rent' ? ' per month' : ' total'}
                      </p>
                    )}
                  </Field>

                  {/* Beds / Baths / Area */}
                  <div className="apf-row apf-row--three">
                    <Field label="Bedrooms" optional error={err('bedrooms')}>
                      <div className="apf-input-wrap">
                        <svg className="apf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><line x1="12" y1="4" x2="12" y2="10"/></svg>
                        <input
                          type="number"
                          name="bedrooms"
                          className={`apf-input apf-input--icon ${err('bedrooms') ? 'apf-input--err' : ''}`}
                          placeholder="e.g. 3"
                          min="0"
                          max="20"
                          value={form.bedrooms}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </div>
                    </Field>

                    <Field label="Bathrooms" optional error={err('bathrooms')}>
                      <div className="apf-input-wrap">
                        <svg className="apf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" y1="5" x2="8" y2="7"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                        <input
                          type="number"
                          name="bathrooms"
                          className={`apf-input apf-input--icon ${err('bathrooms') ? 'apf-input--err' : ''}`}
                          placeholder="e.g. 2"
                          min="0"
                          max="20"
                          value={form.bathrooms}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </div>
                    </Field>

                    <Field label="Area (sqft)" optional error={err('area')}>
                      <div className="apf-input-wrap">
                        <svg className="apf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                        <input
                          type="number"
                          name="area"
                          className={`apf-input apf-input--icon ${err('area') ? 'apf-input--err' : ''}`}
                          placeholder="e.g. 1400"
                          min="0"
                          value={form.area}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </div>
                    </Field>
                  </div>

                </div>
              </div>

              {/* ════════════════════════════════
                  CARD 3 — Description
              ════════════════════════════════ */}
              <div className="apf-card" id="section-desc">
                <div className="apf-card__header">
                  <div className="apf-card__icon apf-card__icon--3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="8" y1="6" x2="21" y2="6"/>
                      <line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/>
                      <line x1="3" y1="12" x2="3.01" y2="12"/>
                      <line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="apf-card__title">Description</h2>
                    <p className="apf-card__sub">Describe the property in detail (min. 15 words)</p>
                  </div>
                </div>

                <div className="apf-card__body">

                  <Field label="Property Description" required error={err('description')}>
                    <div className="apf-textarea-wrap">
                      <textarea
                        name="description"
                        className={`apf-textarea ${err('description') ? 'apf-input--err' : ''}`}
                        placeholder="Describe the property — layout, condition, views, nearby amenities, what makes it special…"
                        rows={6}
                        maxLength={2000}
                        value={form.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <div className="apf-textarea-footer">
                        <span className="apf-word-count">
                          {form.description.trim().split(/\s+/).filter(Boolean).length} words
                        </span>
                        <span className={`apf-char ${form.description.length > 1800 ? 'apf-char--warn' : ''}`}>
                          {form.description.length}/2000
                        </span>
                      </div>
                    </div>
                  </Field>

                  {/* Amenities */}
                  <Field label="Amenities &amp; Features" optional
                    hint="Select all that apply">
                    <div className="apf-amenities">
                      {AMENITY_OPTIONS.map(a => (
                        <label
                          key={a}
                          className={`apf-amenity ${form.amenities.includes(a) ? 'apf-amenity--on' : ''}`}
                        >
                          <input
                            type="checkbox"
                            name="amenities"
                            value={a}
                            checked={form.amenities.includes(a)}
                            onChange={handleChange}
                            className="apf-sr-only"
                          />
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                          </svg>
                          {a}
                        </label>
                      ))}
                    </div>
                    {form.amenities.length > 0 && (
                      <p className="apf-amenities-count">
                        {form.amenities.length} selected
                      </p>
                    )}
                  </Field>

                </div>
              </div>

              {/* ════════════════════════════════
                  CARD 4 — Image URL
              ════════════════════════════════ */}
              <div className="apf-card" id="section-photo">
                <div className="apf-card__header">
                  <div className="apf-card__icon apf-card__icon--4">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="apf-card__title">Property Image</h2>
                    <p className="apf-card__sub">Add a photo URL for your listing</p>
                  </div>
                </div>

                <div className="apf-card__body">

                  <Field label="Image URL" optional error={err('image')}
                    hint="Paste a direct link to a property photo (JPG, PNG, WebP)">
                    <div className="apf-input-wrap">
                      <svg className="apf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      <input
                        type="url"
                        name="image"
                        className={`apf-input apf-input--icon ${err('image') ? 'apf-input--err' : ''}`}
                        placeholder="https://example.com/property-photo.jpg"
                        value={form.image}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {form.image && (
                        <button
                          type="button"
                          className="apf-input-clear"
                          onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                          aria-label="Clear image URL"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      )}
                    </div>
                  </Field>

                  {/* Live image preview */}
                  <ImagePreview url={form.image} />

                  {/* Suggested sources */}
                  <div className="apf-img-tips">
                    <p className="apf-img-tips__title">💡 Need a free image?</p>
                    <div className="apf-img-tips__links">
                      {[
                        { label: 'Unsplash', url: 'https://unsplash.com/s/photos/apartment' },
                        { label: 'Pexels',   url: 'https://www.pexels.com/search/real%20estate/' },
                      ].map(s => (
                        <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="apf-img-tips__link">
                          {s.label} ↗
                        </a>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* ════════════════════════════════
                  CARD 5 — Contact Information
              ════════════════════════════════ */}
              <div className="apf-card" id="section-contact">
                <div className="apf-card__header">
                  <div className="apf-card__icon apf-card__icon--5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="apf-card__title">Contact Information</h2>
                    <p className="apf-card__sub">How buyers or renters can reach you</p>
                  </div>
                  <span className="apf-card__badge">Optional</span>
                </div>

                <div className="apf-card__body">

                  <Field label="Your Name / Agent Name" optional>
                    <div className="apf-input-wrap">
                      <svg className="apf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <input
                        type="text"
                        name="agentName"
                        className="apf-input apf-input--icon"
                        placeholder="e.g. Rafi Ahmed"
                        value={form.agentName}
                        onChange={handleChange}
                      />
                    </div>
                  </Field>

                  <div className="apf-row">
                    <Field label="Phone Number" optional>
                      <div className="apf-input-wrap">
                        <svg className="apf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.67 16z"/></svg>
                        <input
                          type="tel"
                          name="agentPhone"
                          className="apf-input apf-input--icon"
                          placeholder="+880 1XXX XXXXXX"
                          value={form.agentPhone}
                          onChange={handleChange}
                        />
                      </div>
                    </Field>

                    <Field label="Email Address" optional error={err('agentEmail')}>
                      <div className="apf-input-wrap">
                        <svg className="apf-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        <input
                          type="email"
                          name="agentEmail"
                          className={`apf-input apf-input--icon ${err('agentEmail') ? 'apf-input--err' : ''}`}
                          placeholder="you@example.com"
                          value={form.agentEmail}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </div>
                    </Field>
                  </div>

                </div>
              </div>

              {/* ════════════════════════════════
                  FORM ACTIONS
              ════════════════════════════════ */}
              <div className="apf-actions">
                <button
                  type="button"
                  className="apf-actions__cancel"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="apf-actions__reset"
                  onClick={handleReset}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.4"/></svg>
                  Reset
                </button>
                <button
                  type="submit"
                  className={`apf-actions__submit ${submitting ? 'apf-actions__submit--loading' : ''}`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="apf-spinner" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      Publish Listing
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* ── RIGHT: sticky tips sidebar ── */}
          <aside className="apf-sidebar">

            {/* Tips card */}
            <div className="apf-tips">
              <h3 className="apf-tips__title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Listing Tips
              </h3>
              <ul className="apf-tips__list">
                {[
                  { icon: '✏️', tip: 'Use a specific, descriptive title — include bedrooms and location.' },
                  { icon: '💰', tip: 'Research similar listings nearby to price competitively.' },
                  { icon: '📝', tip: 'Write at least 3–4 sentences covering layout, condition, and unique features.' },
                  { icon: '📸', tip: 'Listings with photos get 3× more inquiries. Use a bright, high-res image.' },
                  { icon: '✅', tip: 'Select every amenity that applies — buyers filter by these.' },
                ].map((item, i) => (
                  <li key={i} className="apf-tips__item">
                    <span className="apf-tips__icon">{item.icon}</span>
                    <span>{item.tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required fields card */}
            <div className="apf-checklist">
              <h3 className="apf-checklist__title">Required Fields</h3>
              {[
                { key: 'title',       label: 'Property Title' },
                { key: 'location',    label: 'Address'        },
                { key: 'city',        label: 'City'           },
                { key: 'price',       label: 'Price'          },
                { key: 'description', label: 'Description'    },
              ].map(({ key, label }) => {
                const done = String(form[key]).trim().length > 0 && !validate(form)[key]
                return (
                  <div key={key} className={`apf-checklist__item ${done ? 'apf-checklist__item--done' : ''}`}>
                    <span className="apf-checklist__dot">
                      {done
                        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        : <span className="apf-checklist__empty" />
                      }
                    </span>
                    {label}
                  </div>
                )
              })}
            </div>

            {/* Help card */}
            <div className="apf-help">
              <p className="apf-help__q">Need help listing?</p>
              <p className="apf-help__body">Our team is here Mon–Sat 9am–6pm.</p>
              <a href="tel:+8801711000000" className="apf-help__call">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.67 16z"/></svg>
                Call Support
              </a>
            </div>

          </aside>
        </div>
      </div>
    </div>
  )
}

export default AddProperty
