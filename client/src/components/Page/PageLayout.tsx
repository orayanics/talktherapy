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
    <div className="min-h-full bg-base-100">
      <header className="p-6 border-b border-border">
        <h1 className="text-2xl font-semibold mb-0">{title}</h1>
        {description != null && (
          <div className="text-base-content/70">{description}</div>
        )}
      </header>

      <div
        className={`${paddedCh ? 'p-6' : undefined}
      ${classNameCh ? classNameCh : undefined}
      `}
      >
        {children}
      </div>
    </div>
  )
}
