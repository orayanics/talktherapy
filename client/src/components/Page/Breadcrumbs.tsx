import { useMatches } from '@tanstack/react-router'
import BreadcrumbItem from './BreadcrumbItem'

export default function Breadcrumbs() {
  const crumbs = useMatches({
    select: (matches) => matches.filter((match) => match.staticData.page),
  })

  if (crumbs.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumbs"
      className="breadcrumbs min-w-0 flex-1 overflow-x-auto text-sm"
    >
      <ol role="list" className="whitespace-nowrap px-0!">
        {crumbs.map((crumb, index) => {
          const current = index === crumbs.length - 1

          return (
            <BreadcrumbItem
              key={crumb.id}
              to={crumb.staticData.bcLink}
              title={crumb.staticData.page?.title ?? ''}
              current={current}
            />
          )
        })}
      </ol>
    </nav>
  )
}
