import { Link } from '@tanstack/react-router'
import {
  ArrowDown,
  ArrowRight,
  MessageCircle,
  Sparkles,
  Speech,
} from 'lucide-react'
import { useState } from 'react'
import '../landing.css'
import LandingPreview, { FEATURES } from './LandingPreview'
import Values from './Values'
import LandingFeatureButton from './LandingFeatureButton'

const operator = import.meta.env.VITE_PUBLIC_OPERATOR
const privacyUrl = import.meta.env.VITE_PUBLIC_PRIVACY_URL
const supportUrl = import.meta.env.VITE_PUBLIC_SUPPORT_URL

export default function Landing() {
  const [activeFeature, setActiveFeature] = useState(0)

  return (
    <div className="tt-landing">
      <a className="tt-skip" href="#landing-main">
        Skip to content
      </a>

      <header className="tt-nav">
        <Link to="/" className="tt-wordmark" aria-label="TalkTherapy home">
          <Speech aria-hidden="true" />
          talktherapy<span>.</span>
        </Link>
        <nav aria-label="Main navigation" className="tt-nav-links">
          <a href="#get-to-know">Our platform</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="tt-nav-actions">
          <Link to="/login" preload={false}>
            Log in
          </Link>
          <Link to="/register" preload={false} className="btn tt-cta">
            Create a patient account <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>
      <main id="landing-main">
        <section className="tt-hero" aria-labelledby="hero-title">
          <div className="tt-hero-copy">
            <h1 id="hero-title">
              Speech therapy appointments and <span>practice in one place</span>
            </h1>
            <p className="tt-lead">
              TalkTherapy helps patients and families request speech therapy
              appointments, find exercises for speech practice, and access
              resources and care records.
            </p>
            <Link
              to="/register"
              preload={false}
              className="btn tt-cta tt-cta-large"
            >
              Create a patient account{' '}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <p className="tt-hero-note">
              <a href="#how-it-works" className="tt-text-link">
                How it works
              </a>
            </p>
          </div>
          <section className="tt-showcase" aria-labelledby="preview-title">
            <h2 id="preview-title" className="sr-only">
              TalkTherapy feature preview
            </h2>
            <div className="tt-doodle tt-doodle-left" aria-hidden="true">
              <MessageCircle />
              <span>hello!</span>
              <Sparkles />
            </div>
            <div className="tt-doodle tt-doodle-right" aria-hidden="true">
              <Speech />
              <span>
                One word
                <br />
                at a time.
              </span>
            </div>
            <div
              className="tt-feature-picker"
              role="group"
              aria-label="Explore platform features"
            >
              {FEATURES.map(({ label, icon: Icon }, index) => (
                <LandingFeatureButton
                  key={label}
                  activeFeature={activeFeature}
                  index={index}
                  setActiveFeature={setActiveFeature}
                  Icon={Icon}
                  label={label}
                />
              ))}
            </div>
            <div className="tt-preview-frame" id="hero-preview">
              <LandingPreview feature={activeFeature} />
              <a href="#get-to-know" className="tt-preview-footer">
                <span>
                  <ArrowDown size={17} aria-hidden="true" />
                </span>
                Get to know TalkTherapy
              </a>
            </div>
          </section>
        </section>
        <Values />
        <section
          className="tt-info"
          id="how-it-works"
          aria-labelledby="onboarding-title"
        >
          <h2 id="onboarding-title">How it works</h2>
          <ol>
            <li>
              <h3>Create and verify your account</h3>
              <p>Create a patient account, verify your email, and log in.</p>
            </li>
            <li>
              <h3>Request an appointment</h3>
              <p>
                After intake, eligible patients can request an available
                appointment. The appointment is confirmed when the clinician
                accepts it.
              </p>
            </li>
            <li>
              <h3>Find speech exercises</h3>
              <p>
                Open Speech practice after signing in to find exercises
                available to you, including exercises your clinician assigns.
              </p>
            </li>
          </ol>
        </section>
        <section className="tt-info" aria-labelledby="clinician-title">
          <h2 id="clinician-title">For clinicians</h2>
          <p>
            Manage appointment requests, assign speech exercises, and keep
            patient care records together.
          </p>
          <Link to="/login" preload={false} className="tt-text-link">
            Log in <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </main>
      <footer className="tt-footer">
        <span className="tt-wordmark">
          <Speech aria-hidden="true" />
          talktherapy.
        </span>
        {operator && <p>Operated by {operator}</p>}
        <nav aria-label="Footer navigation" className="tt-footer-links">
          {privacyUrl && <a href={privacyUrl}>Privacy notice</a>}
          {supportUrl && <a href={supportUrl}>Contact support</a>}
          <Link to="/login" preload={false}>
            Log in
          </Link>
        </nav>
      </footer>
    </div>
  )
}
