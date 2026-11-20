import { Link, useMatches } from '@tanstack/react-router'

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
            <li key={crumb.id}>
              <Link
                to={crumb.staticData.bcLink}
                aria-current={current ? 'page' : undefined}
                className={
                  current
                    ? 'font-semibold text-base-content'
                    : 'text-base-content/70'
                }
              >
                {crumb.staticData.page?.title}
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
