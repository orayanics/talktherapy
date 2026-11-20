import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import LandingPreview, { FEATURES } from './LandingPreview'

export default function Values() {
  const [activeFeature, setActiveFeature] = useState(0)
  return (
    <section
      id="get-to-know"
      className="tt-overview"
      aria-labelledby="overview-title"
    >
      <div className="tt-overview-heading">
        <h2 id="overview-title">
          Get to know
          <br />
          TalkTherapy<span>.</span>
        </h2>
        <div>
          <p>
            Bring your appointments, speech practice, and care resources into
            one place. More connection, with a little less to keep track of.
          </p>
          <Link to="/register" className="tt-text-link">
            Explore your next step <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="tt-overview-body">
        <div
          className="tt-feature-list"
          role="group"
          aria-label="Get to know our features"
        >
          {FEATURES.map(({ label, description, icon: Icon }, index) => (
            <button
              key={label}
              type="button"
              aria-pressed={activeFeature === index}
              aria-controls="overview-preview"
              onClick={() => setActiveFeature(index)}
            >
              <span className="tt-feature-row">
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
                <ArrowRight size={19} aria-hidden="true" />
              </span>
              {activeFeature === index && (
                <span className="tt-feature-description">{description}</span>
              )}
            </button>
          ))}
        </div>
        <div className="tt-overview-visual" id="overview-preview">
          <div className="tt-overview-caption">
            <span>YOUR CARE, CONNECTED</span>
            <h3>{FEATURES[activeFeature].headline}</h3>
          </div>
          <div className="tt-preview-frame">
            <LandingPreview feature={activeFeature} compact />
          </div>
        </div>
      </div>
    </section>
  )
}
