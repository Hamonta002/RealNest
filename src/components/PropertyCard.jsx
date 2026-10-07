import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/PropertyCard.css'

/* ═══════════════════════════════════════════════
   PropertyCard
   Props
     property  – single property object
     featured  – bool  (larger image, agent strip)
     view      – 'grid' | 'list'
═══════════════════════════════════════════════ */
function PropertyCard({ property, featured = false, view = 'grid' }) {
  const {
    id, title, location, price, type,
    bedrooms, bathrooms, area, image_url,
    status, description, agent, rating, reviews,
  } = property
  const image = image_url || 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=85&auto=format&fit=crop'
  const displayStatus = status === "sale" ? "For Sale" : status === "rent" ? "For Rent" : (status || "For Sale")

  const [saved,     setSaved]     = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError,  setImgError]  = useState(false)

  const isRent = displayStatus === 'For Rent'
  const isList = view === 'list'

  /* ── Spec definitions ── */
  const specs = [
    bedrooms > 0 && {
      key: 'beds',
      value: `${bedrooms} Bed${bedrooms !== 1 ? 's' : ''}`,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/>
          <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/>
          <line x1="12" y1="4" x2="12" y2="10"/>
        </svg>
      ),
    },
    {
      key: 'baths',
      value: `${bathrooms ?? 0} Bath${bathrooms !== 1 ? 's' : ''}`,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>
          <line x1="10" y1="5" x2="8" y2="7"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
        </svg>
      ),
    },
    {
      key: 'area',
      value: `${area?.toLocaleString()} ft²`,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
      ),
    },
  ].filter(Boolean)

  return (
    <article
      className={[
        'pc',
        `pc--${isList ? 'list' : 'grid'}`,
        featured ? 'pc--featured' : '',
      ].filter(Boolean).join(' ')}
    >

      {/* ════════ IMAGE ZONE ════════ */}
      <div className="pc__img-zone">

        {/* Skeleton shimmer while loading */}
        {!imgLoaded && !imgError && (
          <div className="pc__skeleton" aria-hidden="true">
            <div className="pc__skeleton-shimmer" />
          </div>
        )}

        {/* Property image */}
        {!imgError ? (
          <img
            src={image}
            alt={title}
            className={`pc__img ${imgLoaded ? 'pc__img--loaded' : ''}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="pc__img-error" aria-label="Image unavailable">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Image unavailable</span>
          </div>
        )}

        {/* Gradient veil over image bottom */}
        <div className="pc__veil" aria-hidden="true" />

        {/* Hover colour tint overlay */}
        <div className="pc__tint" aria-hidden="true" />

        {/* Status badge — top left */}
        <span className={`pc__badge pc__badge--${isRent ? 'rent' : 'sale'}`}>
          {isRent ? (
            <>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/></svg>
              For Rent
            </>
          ) : (
            <>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              For Sale
            </>
          )}
        </span>

        {/* Type chip — bottom left */}
        <span className="pc__type-chip">{type}</span>

        {/* Rating chip — bottom right */}
        {rating && (
          <div className="pc__rating-chip">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#f5a623" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>{rating}</span>
            {reviews && <span className="pc__rating-reviews">({reviews})</span>}
          </div>
        )}

        {/* Save / heart — top right */}
        <button
          className={`pc__save ${saved ? 'pc__save--on' : ''}`}
          onClick={e => { e.preventDefault(); setSaved(s => !s) }}
          aria-label={saved ? 'Remove from saved' : 'Save property'}
          aria-pressed={saved}
        >
          <svg
            width="15" height="15"
            viewBox="0 0 24 24"
            fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

      </div>{/* /pc__img-zone */}

      {/* ════════ BODY ════════ */}
      <div className="pc__body">

        {/* Title + location */}
        <div className="pc__title-block">
          <h3 className="pc__title">{title}</h3>
          <p className="pc__location">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{location}</span>
          </p>
        </div>

        {/* Description — always visible in list, revealed on hover in grid */}
        <p className="pc__desc">{description}</p>

        {/* Spec pills */}
        <ul className="pc__specs" aria-label="Property specs">
          {specs.map(({ key, icon, value }) => (
            <li key={key} className="pc__spec">
              <span className="pc__spec-icon" aria-hidden="true">{icon}</span>
              <span className="pc__spec-val">{value}</span>
            </li>
          ))}
        </ul>

        {/* Separator */}
        <div className="pc__sep" role="separator" aria-hidden="true" />

        {/* Price + CTA */}
        <div className="pc__footer">
          <div className="pc__price-block">
            <span className="pc__price-label">{isRent ? 'Monthly Rent' : 'Asking Price'}</span>
            <div className="pc__price-row">
              <span className="pc__currency">$</span>
              <span className="pc__price">{Number(price || 0).toLocaleString()}</span>
              {isRent && <span className="pc__per">/mo</span>}
            </div>
          </div>

          <Link
            to={`/properties/${id}`}
            className="pc__cta"
            aria-label={`View details for ${title}`}
          >
            <span>View Details</span>
            <span className="pc__cta-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </Link>
        </div>

        {/* Agent strip — shown in featured or list mode */}
        {(featured || isList) && agent && (
          <div className="pc__agent">
            <div className="pc__agent-av" aria-hidden="true">
              {agent.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="pc__agent-info">
              <span className="pc__agent-name">{agent}</span>
              <span className="pc__agent-role">Listing Agent</span>
            </div>
            <a
              href={`mailto:${agent.toLowerCase().replace(/\s+/g, '.')}@realnest.bd`}
              className="pc__agent-mail"
              aria-label={`Email ${agent}`}
              onClick={e => e.stopPropagation()}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </a>
          </div>
        )}

      </div>{/* /pc__body */}

    </article>
  )
}

export default PropertyCard


