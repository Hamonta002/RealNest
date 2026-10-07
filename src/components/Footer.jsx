import { Link } from 'react-router-dom'
import '../styles/Footer.css'

/* ─────────────────────────────────────────
   Data
───────────────────────────────────────── */
const QUICK_LINKS = [
  { label: 'Home',          to: '/'             },
  { label: 'Browse Properties', to: '/properties'  },
  { label: 'Add Property',  to: '/add-property'  },
  { label: 'Login',         to: '/login'         },
  { label: 'Register',      to: '/register'      },
]

const PROPERTY_TYPES = [
  { label: 'Apartments',  to: '/properties?type=Apartment'  },
  { label: 'Villas',      to: '/properties?type=Villa'      },
  { label: 'Houses',      to: '/properties?type=House'      },
  { label: 'Studios',     to: '/properties?type=Studio'     },
  { label: 'Penthouses',  to: '/properties?type=Penthouse'  },
  { label: 'Commercial',  to: '/properties?type=Commercial' },
]

const CONTACT_ITEMS = [
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    text: 'Gulshan-2, Dhaka, Bangladesh',
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.67 16z"/>
      </svg>
    ),
    text: '+880 1711 000000',
    href: 'tel:+8801711000000',
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    text: 'hello@realnest.bd',
    href: 'mailto:hello@realnest.bd',
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    text: 'Mon – Sat, 9am – 6pm',
  },
]

/* Social media icon components — pure SVG, no font library */
const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    name: 'Twitter / X',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4l16 16M4 20L20 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#1e3a2f"/>
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    ),
  },
]

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="ft" role="contentinfo">

      {/* ══ TOP WAVE ══ */}
      <div className="ft__wave" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" fill="#1e3a2f"/>
        </svg>
      </div>

      {/* ══ MAIN FOOTER BODY ══ */}
      <div className="ft__body">
        <div className="ft__grid">

          {/* ── Col 1: Brand + Newsletter ── */}
          <div className="ft__brand-col">
            {/* Logo */}
            <Link to="/" className="ft__logo" aria-label="RealNest Home">
              <span className="ft__logo-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </span>
              <span className="ft__logo-text">RealNest</span>
            </Link>

            <p className="ft__tagline">
              Bangladesh's most trusted real estate platform. Find, list, and
              manage properties with ease — all in one place.
            </p>

            {/* Trust badges */}
            <div className="ft__trust">
              <div className="ft__trust-item">
                <span className="ft__trust-val">1,200+</span>
                <span className="ft__trust-label">Listings</span>
              </div>
              <div className="ft__trust-sep" />
              <div className="ft__trust-item">
                <span className="ft__trust-val">850+</span>
                <span className="ft__trust-label">Happy Clients</span>
              </div>
              <div className="ft__trust-sep" />
              <div className="ft__trust-item">
                <span className="ft__trust-val">15+</span>
                <span className="ft__trust-label">Cities</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="ft__newsletter">
              <p className="ft__newsletter-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Get new listings in your inbox
              </p>
              <div className="ft__newsletter-row">
                <input
                  type="email"
                  className="ft__newsletter-input"
                  placeholder="your@email.com"
                  aria-label="Email for newsletter"
                />
                <button className="ft__newsletter-btn" type="button">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* ── Col 2: Quick Links ── */}
          <div className="ft__col">
            <h3 className="ft__col-heading">
              <span className="ft__col-heading-line" />
              Quick Links
            </h3>
            <nav aria-label="Footer quick links">
              <ul className="ft__link-list">
                {QUICK_LINKS.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to} className="ft__link">
                      <svg className="ft__link-arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* ── Col 3: Property Types ── */}
          <div className="ft__col">
            <h3 className="ft__col-heading">
              <span className="ft__col-heading-line" />
              Property Types
            </h3>
            <nav aria-label="Property type links">
              <ul className="ft__link-list">
                {PROPERTY_TYPES.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="ft__link">
                      <svg className="ft__link-arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* ── Col 4: Contact ── */}
          <div className="ft__col">
            <h3 className="ft__col-heading">
              <span className="ft__col-heading-line" />
              Contact Us
            </h3>
            <address className="ft__contact">
              {CONTACT_ITEMS.map(({ icon, text, href }) => (
                <div key={text} className="ft__contact-row">
                  <span className="ft__contact-icon" aria-hidden="true">{icon}</span>
                  {href ? (
                    <a href={href} className="ft__contact-link">{text}</a>
                  ) : (
                    <span>{text}</span>
                  )}
                </div>
              ))}
            </address>

            {/* Social icons */}
            <div className="ft__social" role="list" aria-label="Social media links">
              {SOCIAL_LINKS.map(({ name, href, icon }) => (
                <a
                  key={name}
                  href={href}
                  className="ft__social-btn"
                  aria-label={name}
                  role="listitem"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ══ DIVIDER ══ */}
      <div className="ft__divider">
        <div className="ft__divider-inner" />
      </div>

      {/* ══ BOTTOM BAR ══ */}
      <div className="ft__bottom">
        <div className="ft__bottom-inner">

          <p className="ft__copyright">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <path d="M14.83 14.83A4 4 0 1 1 14.83 9.17"/>
            </svg>
            {year} RealNest. All rights reserved.
          </p>

          <nav className="ft__legal" aria-label="Legal links">
            <a href="#" className="ft__legal-link">Privacy Policy</a>
            <span className="ft__legal-dot" aria-hidden="true" />
            <a href="#" className="ft__legal-link">Terms of Service</a>
            <span className="ft__legal-dot" aria-hidden="true" />
            <a href="#" className="ft__legal-link">Cookie Policy</a>
          </nav>

          <p className="ft__built">
            Built with
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#e8a060" stroke="none" aria-label="love">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            for the University Project
          </p>

        </div>
      </div>

    </footer>
  )
}

export default Footer
