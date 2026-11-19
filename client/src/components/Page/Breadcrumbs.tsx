import { Link, useMatches } from '@tanstack/react-router'

export default function Breadcrumbs() {
  const crumbs = useMatches({
    select: (matches) => matches.filter((match) => match.staticData.crumb),
  })

  if (crumbs.length === 0) return null

  return (
    <nav aria-label="Breadcrumbs" className="breadcrumbs w-100">
      <ol role="list">
        {crumbs.map((crumb, index) => {
          const current = index === crumbs.length - 1

          return (
            <li key={crumb.id}>
              <Link
                to={crumb.staticData.bcLink}
                aria-current={current ? 'page' : undefined}
                className={`
                  ${
                    current
                      ? 'font-semibold text-base-content'
                      : 'text-base-content/70'
                  }`}
              >
                {crumb.staticData.crumb}
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
