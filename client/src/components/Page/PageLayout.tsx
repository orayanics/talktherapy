import type { ReactNode } from 'react'

interface PageLayoutProps {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
}

export default function PageLayout({
  title,
  description,
  children,
}: PageLayoutProps) {
  return (
    <div className="card card-border bg-base-100">
      <div className="card-body gap-4">
        <header>
          <h1 className="card-title text-2xl">{title}</h1>
          {description != null && (
            <p className="mt-1 text-base-content/70">{description}</p>
          )}
        </header>
        {children}
      </div>
    </div>
  )
}
