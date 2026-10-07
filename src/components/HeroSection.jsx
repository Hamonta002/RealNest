import { Link } from 'react-router-dom'
import SearchBar from './SearchBar'
import '../styles/HeroSection.css'

const QUICK_LINKS = [
  { label: '🏢 Apartments', type: 'Apartment' },
  { label: '🏠 Houses',     type: 'House'     },
  { label: '🏰 Villas',     type: 'Villa'     },
  { label: '🏗 Commercial', type: 'Commercial' },
  { label: '🛋 Studios',    type: 'Studio'    },
]

const TRUST_BADGES = [
  { value: '1,200+', label: 'Listings'       },
  { value: '850+',   label: 'Happy Clients'  },
  { value: '15+',    label: 'Cities'         },
  { value: '98%',    label: 'Satisfaction'   },
]

function HeroSection() {
  return (
    <section className="hero-section" aria-label="Hero">

      {/* ── Background layers ── */}
      <div className="hero-section__bg">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=85&auto=format&fit=crop"
          alt="Beautiful modern home"
          className="hero-section__bg-img"
        />
        {/* dark gradient overlay so text is legible */}
        <div className="hero-section__overlay" />
        {/* coloured tint coming from the left */}
        <div className="hero-section__tint" />
      </div>

      {/* ── Content ── */}
      <div className="hero-section__content">

        {/* Eye-brow label */}
        <div className="hero-section__eyebrow">
          <span className="hero-section__dot" />
          <span>Bangladesh's #1 Real Estate Platform</span>
        </div>

        {/* Main heading */}
        <h1 className="hero-section__heading">
          Find Your Dream<br />
          <em className="hero-section__heading-em">Property</em>
        </h1>

        {/* Sub-heading */}
        <p className="hero-section__subheading">
          Search apartments, houses, and land easily.<br />
          Thousands of verified listings across every city.
        </p>

        {/* ── Search bar ── */}
        <div className="hero-section__search-wrap">
          <SearchBar variant="hero" />
        </div>

        {/* Quick-type links */}
        <div className="hero-section__quick">
          <span className="hero-section__quick-label">Browse by type:</span>
          <div className="hero-section__quick-links">
            {QUICK_LINKS.map(({ label, type }) => (
              <Link
                key={type}
                to={`/properties?type=${type}`}
                className="hero-section__quick-link"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* CTA button — visible on mobile where search btn collapses */}
        <Link to="/properties" className="hero-section__browse-btn">
          Browse All Properties
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>

      {/* ── Trust bar ── */}
      <div className="hero-section__trust">
        {TRUST_BADGES.map(({ value, label }) => (
          <div key={label} className="hero-section__trust-item">
            <span className="hero-section__trust-value">{value}</span>
            <span className="hero-section__trust-label">{label}</span>
          </div>
        ))}
      </div>

    </section>
  )
}

export default HeroSection
