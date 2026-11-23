import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import LandingPreview, { FEATURES } from './LandingPreview'
import ValueButton from './ValueButton'

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
          <Link to="/register" preload={false} className="tt-text-link">
            Create a patient account <ArrowRight size={18} aria-hidden="true" />
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
            <ValueButton
              key={label}
              activeFeature={activeFeature}
              index={index}
              setActiveFeature={setActiveFeature}
              Icon={Icon}
              label={label}
              description={description}
            />
          ))}
        </div>
        <div className="tt-overview-visual" id="overview-preview">
          <div className="tt-overview-caption">
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
