import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowDown,
  ArrowRight,
  MessageCircle,
  Sparkles,
  Speech,
} from 'lucide-react'
import Values from './Values'
import LandingPreview, { FEATURES } from './LandingPreview'
import '../landing.css'

export default function Landing() {
  const [activeFeature, setActiveFeature] = useState(0)

  return (
    <div className="tt-landing">
      <a className="tt-skip" href="#landing-main">
        Skip to content
      </a>
      <div className="tt-announcement">
        A little practice. A meaningful connection. Your next step starts here.
        <Sparkles size={15} aria-hidden="true" />
      </div>
      <header className="tt-nav">
        <Link to="/" className="tt-wordmark" aria-label="TalkTherapy home">
          <Speech aria-hidden="true" />
          talktherapy<span>.</span>
        </Link>
        <nav aria-label="Main navigation" className="tt-nav-links">
          <a href="#get-to-know">Our platform</a>
          <a href="#explore-platform">How it works</a>
        </nav>
        <div className="tt-nav-actions">
          <Link to="/login">Log in</Link>
          <Link to="/register" className="btn tt-cta">
            Get started <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>
      <main id="landing-main">
        <section className="tt-hero" aria-labelledby="hero-title">
          <div className="tt-hero-copy">
            <a className="tt-eyebrow" href="#get-to-know">
              Speech support, connected{' '}
              <ArrowRight size={14} aria-hidden="true" />
            </a>
            <h1 id="hero-title">
              Your voice matters.
              <br />
              Every word, <span>yours.</span>
            </h1>
            <p className="tt-lead">
              Connect with a therapist, make time for practice, and keep your
              care together. Speech and language support, one conversation at a
              time.
            </p>
            <Link to="/register" className="btn tt-cta tt-cta-large">
              Start your journey <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <p className="tt-hero-note">
              <MessageCircle size={16} aria-hidden="true" /> A place for
              patients, families, and clinicians.
            </p>
          </div>
          <div id="explore-platform" className="tt-showcase">
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
                <button
                  key={label}
                  type="button"
                  aria-pressed={activeFeature === index}
                  aria-controls="hero-preview"
                  onClick={() => setActiveFeature(index)}
                >
                  <Icon size={17} aria-hidden="true" />
                  {label}
                </button>
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
          </div>
          <div className="tt-audience">
            <p>From your first appointment to everyday practice.</p>
            <div>
              <span>Patients & families</span>
              <span>Therapists & clinicians</span>
              <span>Care that connects</span>
            </div>
          </div>
        </section>
        <Values />
      </main>
      <footer className="tt-footer">
        <span className="tt-wordmark">
          <Speech aria-hidden="true" />
          talktherapy.
        </span>
        <p>Every voice has a place here.</p>
        <Link to="/login">
          Log in <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </footer>
    </div>
  )
}
