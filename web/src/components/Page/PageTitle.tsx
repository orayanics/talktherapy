import type { PageTitleProps } from '~/models/components'

export default function PageTitle(props: PageTitleProps) {
  const { heading, subheading, brow } = props
  return (
    <header>
      <div className="border-b mb-4">
        {brow && (
          <p className="text-sm font-mono text-primary mb-1 tracking-wide uppercase font-bold">
            {brow}
          </p>
        )}
        <h1
          className={`font-bold text-2xl col-span-12 ${!subheading ? 'mb-4' : ''}`}
        >
          {heading}
        </h1>
        {subheading && (
          <p className="col-span-12 mb-2 text-gray-600">{subheading}</p>
        )}
      </div>
    </header>
  )
}
