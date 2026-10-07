import { Link } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import FeaturedProperties from '../components/FeaturedProperties'
import '../styles/Home.css'

/* ── "Why Choose Us" data ── */
const WHY_ITEMS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
    title: 'Smart Search',
    desc:  'Filter by location, price, type, and size to find exactly what you need in seconds.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Verified Agents',
    desc:  'Every listing agent is background-checked and trained to give you honest advice.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    title: 'Easy Online Booking',
    desc:  'Schedule a viewing or submit an offer from any device — no paperwork needed.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: 'Secure & Private',
    desc:  'Your data is fully encrypted. We never sell your information to third parties.',
  },
]

/* ── Testimonials ── */
const TESTIMONIALS = [
  {
    name:   'Farhan Islam',
    role:   'First-time Buyer',
    avatar: 'FI',
    stars:  5,
    text:   'RealNest made finding my first apartment incredibly easy. The search filters saved me hours and I found the perfect place in under a week.',
  },
  {
    name:   'Nusrat Jahan',
    role:   'Property Investor',
    avatar: 'NJ',
    stars:  5,
    text:   'I have listed three properties on RealNest and all three sold within the month. The platform is clean, fast, and reaches real buyers.',
  },
  {
    name:   'Karim Uddin',
    role:   'Rental Tenant',
    avatar: 'KU',
    stars:  4,
    text:   'Great selection of rental properties. The inquiry form worked perfectly and the agent replied within hours. Highly recommended.',
  },
]

function Home() {
  return (
    <div className="home-page">

      {/* 1 ── Hero */}
      <HeroSection />

      {/* 2 ── Featured properties */}
      <div className="home-page__section home-page__section--featured">
        <FeaturedProperties />
      </div>

      {/* 3 ── Why Choose Us */}
      <section className="why-section" aria-label="Why Choose Us">
        <div className="why-section__inner">
          <div className="why-section__intro">
            <p className="why-section__eyebrow">Why RealNest</p>
            <h2 className="why-section__title">Everything You Need,<br/>All in One Place</h2>
            <p className="why-section__body">
              From your first search to signing the final document, RealNest is
              with you every step of the way — transparent, simple, stress-free.
            </p>
            <Link to="/properties" className="why-section__cta">Start Searching →</Link>
          </div>

          <div className="why-section__cards">
            {WHY_ITEMS.map((item, i) => (
              <div key={item.title} className="why-card" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="why-card__icon">{item.icon}</div>
                <h3 className="why-card__title">{item.title}</h3>
                <p className="why-card__desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 ── Testimonials */}
      <section className="testimonials-section" aria-label="Testimonials">
        <p className="testimonials-section__eyebrow">What clients say</p>
        <h2 className="testimonials-section__title">Trusted by Thousands</h2>

        <div className="testimonials-section__grid">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="testimonial-card">
              <div className="testimonial-card__stars">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} className="testimonial-card__star">★</span>
                ))}
              </div>
              <p className="testimonial-card__text">"{t.text}"</p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">{t.avatar}</div>
                <div>
                  <p className="testimonial-card__name">{t.name}</p>
                  <p className="testimonial-card__role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5 ── CTA Banner */}
      <section className="home-cta" aria-label="Call to action">
        <div className="home-cta__bg" />
        <div className="home-cta__content">
          <p className="home-cta__eyebrow">Ready to get started?</p>
          <h2 className="home-cta__title">List Your Property Today</h2>
          <p className="home-cta__sub">
            Reach thousands of verified buyers and renters across Bangladesh.
            Free to sign up — no hidden fees.
          </p>
          <div className="home-cta__buttons">
            <Link to="/add-property" className="home-cta__btn home-cta__btn--primary">Add Your Property</Link>
            <Link to="/register"     className="home-cta__btn home-cta__btn--ghost">Create Free Account</Link>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home
