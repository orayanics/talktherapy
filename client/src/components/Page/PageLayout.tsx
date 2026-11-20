import type { ReactNode } from 'react'

interface PageLayoutProps {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  paddedCh?: boolean
  classNameCh?: string
}

export default function PageLayout({
  title,
  description,
  children,
  paddedCh = false,
  classNameCh = '',
}: PageLayoutProps) {
  return (
    <div className="app-page min-h-full">
      <header className="app-page-header space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight leading-tight wrap-break-word">
          {title}
        </h1>
        {description != null && (
          <div className="max-w-prose text-sm leading-relaxed text-muted">
            {description}
          </div>
        )}
      </header>

      <div className={`${paddedCh ? 'app-page-content' : ''} ${classNameCh}`}>
        {children}
      </div>
    </div>
  )
}
