import { Link } from '@tanstack/react-router'
import { ArrowLeft, MessageCircle, Speech } from 'lucide-react'
import type { ReactNode } from 'react'
import './auth-layout.css'

export default function AuthLayout({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="tt-auth">
      <header className="tt-auth-nav">
        <Link to="/" className="tt-auth-brand" aria-label="TalkTherapy home">
          <Speech aria-hidden="true" />
          talktherapy<span>.</span>
        </Link>
        <Link to="/" className="tt-auth-back">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to home
        </Link>
      </header>
      <main className="tt-auth-main">
        <div className="tt-auth-intro">
          <span className="tt-auth-eyebrow">
            <MessageCircle size={16} aria-hidden="true" />
            Speech support, connected
          </span>
          <h2>
            Your voice matters.
            <br />
            Every word, <span>yours.</span>
          </h2>
          <p>
            A place for patients, families, and clinicians. One conversation at
            a time.
          </p>
          <Speech className="tt-auth-art" aria-hidden="true" />
        </div>
        <section className="tt-auth-card" aria-labelledby="auth-title">
          <div className="tt-auth-heading">
            <h1 id="auth-title">{title}</h1>
            <p>{description}</p>
          </div>
          {children}
        </section>
      </main>
      <footer className="tt-auth-footer">Every voice has a place here.</footer>
    </div>
  )
}
