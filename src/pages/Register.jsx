import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Auth.css'
import { register } from '../lib/api'

/* ─────────────────────────────────────────────────────
   Register.jsx
   - Name, Email, Password, Confirm Password inputs
   - All managed with useState
   - Full client-side validation on every field
   - Password strength meter (5-bar visual)
   - Password match indicator
   - Show / hide password toggles
   - Role selection (Customer / Agent)
   - Account type selector
   - Success screen → redirect to Login
   - Link to Login page
───────────────────────────────────────────────────── */

/* Eye icons for show/hide password */
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

/* ── Password strength calculator ── */
function calcStrength(pw) {
  if (!pw) return { score: 0, label: '', color: 'var(--color-border)' }
  let score = 0
  if (pw.length >= 8)              score++ // length
  if (pw.length >= 12)             score++ // longer
  if (/[A-Z]/.test(pw))           score++ // uppercase
  if (/[0-9]/.test(pw))           score++ // number
  if (/[^A-Za-z0-9]/.test(pw))    score++ // symbol

  if (score <= 1) return { score: 1, label: 'Weak',        color: '#d94f4f' }
  if (score <= 2) return { score: 2, label: 'Fair',        color: '#e8903a' }
  if (score <= 3) return { score: 3, label: 'Good',        color: '#f0c040' }
  if (score <= 4) return { score: 4, label: 'Strong',      color: '#2d7a50' }
  return               { score: 5, label: 'Very Strong',   color: '#1e3a2f' }
}

/* Password requirement list */
const PW_RULES = [
  { test: pw => pw.length >= 8,          label: 'At least 8 characters'  },
  { test: pw => /[A-Z]/.test(pw),        label: 'One uppercase letter'   },
  { test: pw => /[0-9]/.test(pw),        label: 'One number'             },
  { test: pw => /[^A-Za-z0-9]/.test(pw), label: 'One special character'  },
]

function Register() {
  const navigate = useNavigate()

  /* ── Form data — all controlled ── */
  const [form, setForm] = useState({
    name:     '',    // full name
    email:    '',    // email address
    phone:    '',    // phone (optional)
    role:     'customer', // 'customer' | 'agent'
    password: '',    // new password
    confirm:  '',    // repeated password
    terms:    false, // accepted terms checkbox
  })

  /* ── UI state ── */
  const [errors,   setErrors]   = useState({})    // per-field error messages
  const [loading,  setLoading]  = useState(false)  // submit in progress
  const [success,  setSuccess]  = useState(false)  // account created
  const [showPass, setShowPass] = useState(false)  // show password text
  const [showConf, setShowConf] = useState(false)  // show confirm text

  const strength = calcStrength(form.password)
  const passwordsMatch = form.password && form.confirm && form.password === form.confirm

  /* ── Generic field change handler ── */
  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Remove the error for this field as the user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  /* ── Full form validation ── */
  const validate = () => {
    const errs = {}

    // Name
    if (!form.name.trim()) {
      errs.name = 'Full name is required.'
    } else if (form.name.trim().split(' ').filter(Boolean).length < 2) {
      errs.name = 'Please enter both your first and last name.'
    }

    // Email
    if (!form.email.trim()) {
      errs.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address.'
    }

    // Phone (optional but must be valid if provided)
    if (form.phone && !/^[+\d\s()\-]{7,15}$/.test(form.phone)) {
      errs.phone = 'Enter a valid phone number.'
    }

    // Password
    if (!form.password) {
      errs.password = 'Password is required.'
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.'
    } else if (strength.score < 2) {
      errs.password = 'Please choose a stronger password.'
    }

    // Confirm password
    if (!form.confirm) {
      errs.confirm = 'Please confirm your password.'
    } else if (form.password !== form.confirm) {
      errs.confirm = 'Passwords do not match.'
    }

    // Terms
    if (!form.terms) {
      errs.terms = 'You must accept the Terms of Service to continue.'
    }

    return errs
  }

  /* ── Submit ── */
  const handleSubmit = async e => {
    e.preventDefault()

    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      // Scroll to top of form so user sees errors
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: form.role })

      setLoading(false)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ email: 'Network error. Is the backend running?' })
      setLoading(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  /* ─────────────────────────────────────────────
     SUCCESS SCREEN
  ───────────────────────────────────────────── */
  if (success) {
    return (
      <div className="auth-page auth-page--success">
        <div className="auth-success">
          <div className="auth-success__circle">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 className="auth-success__title">Account Created!</h2>
          <p className="auth-success__sub">
            Welcome to RealNest, <strong>{form.name.split(' ')[0]}</strong>!
            <br/>Redirecting you to the login page…
          </p>
          <div className="auth-success__bar">
            <div className="auth-success__bar-fill" />
          </div>
          <Link to="/login" className="auth-success__link">
            Go to login now →
          </Link>
        </div>
      </div>
    )
  }

  /* ─────────────────────────────────────────────
     MAIN FORM
  ───────────────────────────────────────────── */
  return (
    <div className="auth-page auth-page--register">

      {/* ══════════════════════════════════════════
          LEFT — VISUAL PANEL
      ══════════════════════════════════════════ */}
      <div className="auth-panel auth-panel--visual auth-panel--visual-left">
        <div className="auth-visual__bg" />
        <div className="auth-visual__glow auth-visual__glow--right" />
        <div className="auth-visual__body">

          <div className="auth-visual__headline">
            <p className="auth-visual__eyebrow">Join 850+ happy clients</p>
            <h2 className="auth-visual__title">
              Start Your<br />Real Estate<br />Journey Today
            </h2>
            <p className="auth-visual__desc">
              Create a free account and unlock access to thousands of verified
              property listings across Bangladesh.
            </p>
          </div>

          {/* Benefit cards */}
          <div className="auth-benefits">
            {[
              { icon: '🔍', title: 'Smart Search', desc: 'Filter by price, type, and location.' },
              { icon: '🤝', title: 'Verified Agents', desc: 'Chat with trusted, background-checked agents.' },
              { icon: '🔒', title: 'Secure & Free', desc: 'Your data is encrypted. No hidden fees.' },
            ].map(b => (
              <div key={b.title} className="auth-benefit">
                <span className="auth-benefit__icon">{b.icon}</span>
                <div>
                  <p className="auth-benefit__title">{b.title}</p>
                  <p className="auth-benefit__desc">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stat row */}
          <div className="auth-stats">
            {[
              { val: '1,200+', label: 'Listings'   },
              { val: '850+',   label: 'Clients'    },
              { val: '15+',    label: 'Cities'     },
            ].map(s => (
              <div key={s.label} className="auth-stats__item">
                <span className="auth-stats__val">{s.val}</span>
                <span className="auth-stats__label">{s.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT — FORM PANEL
      ══════════════════════════════════════════ */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-panel__inner">

          {/* Brand */}
          <Link to="/" className="auth-brand">
            <span className="auth-brand__icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
            <span className="auth-brand__name">RealNest</span>
          </Link>

          {/* Heading */}
          <div className="auth-heading">
            <h1 className="auth-heading__title">Create your account</h1>
            <p className="auth-heading__sub">Free forever — no credit card required</p>
          </div>

          {/* ══ FORM ══ */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {/* ── Full Name ── */}
            <div className={`auth-field ${errors.name ? 'auth-field--error' : form.name && !errors.name ? 'auth-field--ok' : ''}`}>
              <label className="auth-field__label" htmlFor="reg-name">
                Full Name <span className="auth-field__required">*</span>
              </label>
              <div className="auth-field__control">
                <span className="auth-field__icon auth-field__icon--left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  className="auth-field__input"
                  placeholder="e.g. Farhan Islam"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  disabled={loading}
                  aria-invalid={!!errors.name}
                />
                {form.name && !errors.name && (
                  <span className="auth-field__icon auth-field__icon--right auth-field__icon--check">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                )}
              </div>
              {errors.name && (
                <p className="auth-field__error" role="alert">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.name}
                </p>
              )}
            </div>

            {/* ── Email ── */}
            <div className={`auth-field ${errors.email ? 'auth-field--error' : form.email && !errors.email ? 'auth-field--ok' : ''}`}>
              <label className="auth-field__label" htmlFor="reg-email">
                Email Address <span className="auth-field__required">*</span>
              </label>
              <div className="auth-field__control">
                <span className="auth-field__icon auth-field__icon--left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  className="auth-field__input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                  aria-invalid={!!errors.email}
                />
                {form.email && !errors.email && (
                  <span className="auth-field__icon auth-field__icon--right auth-field__icon--check">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                )}
              </div>
              {errors.email && (
                <p className="auth-field__error" role="alert">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* ── Phone (optional) ── */}
            <div className={`auth-field ${errors.phone ? 'auth-field--error' : ''}`}>
              <label className="auth-field__label" htmlFor="reg-phone">
                Phone Number{' '}
                <span className="auth-field__optional">(optional)</span>
              </label>
              <div className="auth-field__control">
                <span className="auth-field__icon auth-field__icon--left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 18z"/>
                  </svg>
                </span>
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  className="auth-field__input"
                  placeholder="+880 1XXX XXXXXX"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  disabled={loading}
                />
              </div>
              {errors.phone && (
                <p className="auth-field__error" role="alert">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* ── Account Role ── */}
            <div className="auth-field">
              <label className="auth-field__label">Account Type</label>
              <div className="auth-role-toggle">
                <button
                  type="button"
                  className={`auth-role-btn ${form.role === 'customer' ? 'auth-role-btn--on' : ''}`}
                  aria-pressed={form.role === 'customer'}
                  onClick={() => setForm(p => ({ ...p, role: 'customer' }))}
                >
                  <span className="auth-role-btn__icon">🏠</span>
                  <span className="auth-role-btn__label">Customer</span>
                  <span className="auth-role-btn__sub">Browse &amp; book</span>
                </button>
                <button
                  type="button"
                  className={`auth-role-btn ${form.role === 'agent' ? 'auth-role-btn--on' : ''}`}
                  aria-pressed={form.role === 'agent'}
                  onClick={() => setForm(p => ({ ...p, role: 'agent' }))}
                >
                  <span className="auth-role-btn__icon">🤝</span>
                  <span className="auth-role-btn__label">Agent</span>
                  <span className="auth-role-btn__sub">List properties</span>
                </button>
              </div>
            </div>

            {/* ── Password ── */}
            <div className={`auth-field ${errors.password ? 'auth-field--error' : ''}`}>
              <label className="auth-field__label" htmlFor="reg-password">
                Password <span className="auth-field__required">*</span>
              </label>
              <div className="auth-field__control">
                <span className="auth-field__icon auth-field__icon--left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="auth-field__input"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                  aria-invalid={!!errors.password}
                />
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

              {/* Password strength meter */}
              {form.password && (
                <div className="auth-strength">
                  <div className="auth-strength__bars">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div
                        key={n}
                        className="auth-strength__bar"
                        style={{
                          background: n <= strength.score
                            ? strength.color
                            : 'var(--color-border)',
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="auth-strength__label"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </span>
                </div>
              )}

              {/* Password requirement hints */}
              {form.password && (
                <ul className="auth-hints">
                  {PW_RULES.map(rule => {
                    const ok = rule.test(form.password)
                    return (
                      <li
                        key={rule.label}
                        className={`auth-hints__item ${ok ? 'auth-hints__item--ok' : ''}`}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          {ok
                            ? <polyline points="20 6 9 17 4 12"/>
                            : <circle cx="12" cy="12" r="10"/>
                          }
                        </svg>
                        {rule.label}
                      </li>
                    )
                  })}
                </ul>
              )}

              {errors.password && (
                <p className="auth-field__error" role="alert">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* ── Confirm Password ── */}
            <div className={`auth-field ${errors.confirm ? 'auth-field--error' : passwordsMatch ? 'auth-field--ok' : ''}`}>
              <label className="auth-field__label" htmlFor="reg-confirm">
                Confirm Password <span className="auth-field__required">*</span>
              </label>
              <div className="auth-field__control">
                <span className="auth-field__icon auth-field__icon--left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="reg-confirm"
                  type={showConf ? 'text' : 'password'}
                  name="confirm"
                  className="auth-field__input"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                  aria-invalid={!!errors.confirm}
                />
                <button
                  type="button"
                  className="auth-field__icon auth-field__icon--right auth-field__toggle"
                  onClick={() => setShowConf(s => !s)}
                  tabIndex={-1}
                  aria-label={showConf ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConf ? <EyeOpen /> : <EyeClosed />}
                </button>
              </div>

              {/* "Passwords match" confirmation */}
              {passwordsMatch && !errors.confirm && (
                <p className="auth-field__match">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Passwords match!
                </p>
              )}

              {errors.confirm && (
                <p className="auth-field__error" role="alert">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.confirm}
                </p>
              )}
            </div>

            {/* ── Terms checkbox ── */}
            <div className={`auth-terms ${errors.terms ? 'auth-terms--error' : ''}`}>
              <button
                type="button"
                className={`auth-check__box ${form.terms ? 'auth-check__box--on' : ''}`}
                onClick={() => {
                  setForm(p => ({ ...p, terms: !p.terms }))
                  if (errors.terms) setErrors(p => ({ ...p, terms: '' }))
                }}
                role="checkbox"
                aria-checked={form.terms}
                aria-label="Accept terms and conditions"
              >
                {form.terms && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
              <span className="auth-terms__text">
                I agree to the{' '}
                <a href="#" className="auth-terms__link">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="auth-terms__link">Privacy Policy</a>
              </span>
            </div>

            {errors.terms && (
              <p className="auth-field__error auth-field__error--block" role="alert">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {errors.terms}
              </p>
            )}

            {/* ── Submit button ── */}
            <button
              type="submit"
              className={`auth-submit ${loading ? 'auth-submit--loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  Creating Account…
                </>
              ) : (
                <>
                  Create Account
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* ── Switch to Login ── */}
          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-switch__link">Sign in →</Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Register
