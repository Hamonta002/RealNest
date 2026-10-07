import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Auth.css'
import { login } from '../lib/api'
import GoogleSignInButton from '../components/GoogleSignInButton'

/* ─────────────────────────────────────────────────────
   Login.jsx
   - Email + password inputs with useState
   - Client-side validation on every field
   - Show / hide password toggle
   - Remember-me checkbox
   - Loading spinner → success state → redirect
   - "Or continue with" social buttons (UI only)
   - Link to Register page
───────────────────────────────────────────────────── */

/* Eye icon used for show/hide password */
const EyeOpen = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeClosed = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

/* Dummy credentials for demo */
const DEMO_EMAIL    = 'demo@realnest.bd'
const DEMO_PASSWORD = 'demo123'

function Login() {
  const navigate = useNavigate()

  /* ── Form data ── */
  const [form, setForm] = useState({
    email:    '',
    password: '',
  })

  /* ── UI state ── */
  const [errors,   setErrors]   = useState({})   // field error messages
  const [loading,  setLoading]  = useState(false) // spinner while "fetching"
  const [success,  setSuccess]  = useState(false) // green state after login
  const [showPass, setShowPass] = useState(false) // plain-text password toggle
  const [remember, setRemember] = useState(false) // remember-me tick

  /* ── Update a single field and clear its error ── */
  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear the error for this field as the user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  /* ── Validate all fields; return object of error strings ── */
  const validate = () => {
    const errs = {}

    if (!form.email.trim()) {
      errs.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address.'
    }

    if (!form.password) {
      errs.password = 'Password is required.'
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.'
    }

    return errs
  }

  /* ── Submit handler ── */
  const handleSubmit = async e => {
    e.preventDefault()

    // Run validation
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const data = await login(form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.dispatchEvent(new Event('auth-changed'))
      setLoading(false)
      setSuccess(true)
      setTimeout(() => navigate('/'), 1200)
    } catch (error) {
      setLoading(false)
      setErrors({ form: error.message })
    }
  }

  const handleGoogleSuccess = useCallback(() => {
    setSuccess(true)
    setTimeout(() => navigate('/'), 900)
  }, [navigate])
  const handleGoogleError = useCallback(error => setErrors({ form: error.message }), [])

  /* ── Fill demo credentials ── */
  const fillDemo = () => {
    setForm({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
    setErrors({})
  }

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div className="auth-page">

      {/* ══════════════════════════════════════════
          LEFT — FORM PANEL
      ══════════════════════════════════════════ */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-panel__inner">

          {/* Brand logo */}
          <Link to="/" className="auth-brand">
            <span className="auth-brand__icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
            <span className="auth-brand__name">RealNest</span>
          </Link>

          {/* Page heading */}
          <div className="auth-heading">
            <h1 className="auth-heading__title">Welcome back</h1>
            <p className="auth-heading__sub">Sign in to your account to continue</p>
          </div>

          {/* Demo hint */}
          <div className="auth-demo-hint">
            <span>Try the demo:</span>
            <button type="button" className="auth-demo-btn" onClick={fillDemo}>
              Fill demo credentials
            </button>
          </div>

          {/* ── Success banner ── */}
          {success && (
            <div className="auth-alert auth-alert--success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Signed in successfully! Redirecting…
            </div>
          )}

          {/* ══ FORM ══ */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {errors.form && <div className="auth-alert auth-alert--error" role="alert">{errors.form}</div>}

            {/* ── Email field ── */}
            <div className={`auth-field ${errors.email ? 'auth-field--error' : form.email && !errors.email ? 'auth-field--ok' : ''}`}>
              <label className="auth-field__label" htmlFor="login-email">
                Email Address
              </label>

              <div className="auth-field__control">
                {/* Left icon */}
                <span className="auth-field__icon auth-field__icon--left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>

                <input
                  id="login-email"
                  type="email"
                  name="email"
                  className="auth-field__input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading || success}
                  aria-describedby={errors.email ? 'login-email-error' : undefined}
                  aria-invalid={!!errors.email}
                />

                {/* Green tick when valid */}
                {form.email && !errors.email && (
                  <span className="auth-field__icon auth-field__icon--right auth-field__icon--check">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                )}
              </div>

              {/* Error message */}
              {errors.email && (
                <p id="login-email-error" className="auth-field__error" role="alert">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* ── Password field ── */}
            <div className={`auth-field ${errors.password ? 'auth-field--error' : ''}`}>
              <div className="auth-field__label-row">
                <label className="auth-field__label" htmlFor="login-password">Password</label>
                <a href="#" className="auth-field__forgot" tabIndex={-1}>Forgot password?</a>
              </div>

              <div className="auth-field__control">
                <span className="auth-field__icon auth-field__icon--left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>

                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="auth-field__input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading || success}
                  aria-describedby={errors.password ? 'login-pass-error' : undefined}
                  aria-invalid={!!errors.password}
                />

                {/* Show / hide toggle */}
                <button
                  type="button"
                  className="auth-field__icon auth-field__icon--right auth-field__toggle"
                  onClick={() => setShowPass(s => !s)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOpen /> : <EyeClosed />}
                </button>
              </div>

              {errors.password && (
                <p id="login-pass-error" className="auth-field__error" role="alert">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* ── Remember me ── */}
            <div className="auth-form__row--between">
              <label className="auth-check">
                <button
                  type="button"
                  className={`auth-check__box ${remember ? 'auth-check__box--on' : ''}`}
                  onClick={() => setRemember(r => !r)}
                  role="checkbox"
                  aria-checked={remember}
                >
                  {remember && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
                <span className="auth-check__label">Remember me for 30 days</span>
              </label>
            </div>

            {/* ── Submit button ── */}
            <button
              type="submit"
              className={`auth-submit ${loading ? 'auth-submit--loading' : ''} ${success ? 'auth-submit--success' : ''}`}
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  Signing in…
                </>
              ) : success ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Signed In!
                </>
              ) : (
                <>
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-divider"><span>or continue with</span></div>
          <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

          {/* ── Switch to Register ── */}
          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-switch__link">
              Create one for free →
            </Link>
          </p>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT — VISUAL PANEL
      ══════════════════════════════════════════ */}
      <div className="auth-panel auth-panel--visual">
        {/* Background */}
        <div className="auth-visual__bg" />
        <div className="auth-visual__glow" />

        <div className="auth-visual__body">
          {/* Headline */}
          <div className="auth-visual__headline">
            <p className="auth-visual__eyebrow">Trusted by 850+ clients</p>
            <h2 className="auth-visual__title">
              Bangladesh's #1<br/>Real Estate Platform
            </h2>
            <p className="auth-visual__desc">
              Find, list, and manage properties — all in one place.
            </p>
          </div>

          {/* Feature checklist */}
          <ul className="auth-features">
            {[
              '1,200+ verified listings',
              'Trusted agents across Bangladesh',
              'Secure & private transactions',
              'Free to create an account',
            ].map(f => (
              <li key={f} className="auth-features__item">
                <span className="auth-features__icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>

          {/* Testimonial card */}
          <div className="auth-testimonial">
            <p className="auth-testimonial__quote">
              "RealNest helped me find my dream apartment in under a week.
              The experience was completely seamless."
            </p>
            <div className="auth-testimonial__author">
              <div className="auth-testimonial__avatar">FI</div>
              <div>
                <p className="auth-testimonial__name">Farhan Islam</p>
                <p className="auth-testimonial__role">First-time Buyer, Dhaka</p>
              </div>
            </div>
          </div>

          {/* Stat row */}
          <div className="auth-stats">
            {[
              { val: '1,200+', label: 'Listings' },
              { val: '850+',   label: 'Clients'  },
              { val: '15+',    label: 'Cities'   },
            ].map(s => (
              <div key={s.label} className="auth-stats__item">
                <span className="auth-stats__val">{s.val}</span>
                <span className="auth-stats__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

export default Login
