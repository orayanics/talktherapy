import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'

export default function BreadcrumbItem({
  to,
  title,
  current,
}: {
  to: LinkProps['to']
  title: string
  current: boolean
}) {
  return (
    <li>
      <Link
        to={to}
        aria-current={current ? 'page' : undefined}
        className={
          current ? 'font-semibold text-base-content' : 'text-base-content/70'
        }
      >
        {title}
      </Link>
    </li>
  )
}
