import { Link } from '@tanstack/react-router'

import PageTitle from '~/components/Page/PageTitle'
import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import TablePagination from '~/components/Table/TablePagination'

export default function ContentOverview() {
  return (
    <>
      <PageTitle
        heading="Content Media"
        subheading="View all available speech therapy exercises in the system."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4">
          <Table />
        </GridItem>
      </Grid>
    </>
  )
}

export const MEDIA_ITEMS = [
  {
    id: '1',
    title: 'Getting Started with TypeScript',
    description: 'An introduction to TypeScript and its core features.',
    body: '## TypeScript Basics\n\nTypeScript is a typed superset of JavaScript...',
    authorId: 'author-001',
    createdAt: '2025-01-18T11:10:00Z',
    updatedAt: '2025-01-18T11:10:00Z',
    category: 'Programming',
    tags: ['typescript', 'javascript', 'basics', 'node'],
  },
  {
    id: '2',
    title: 'Understanding React Hooks',
    description:
      'A deep dive into React Hooks and how to use them effectively.',
    body: '## React Hooks\n\nHooks let you use state and other React features...',
    authorId: 'author-002',
    createdAt: '2025-01-18T11:10:00Z',
    updatedAt: '2025-01-18T11:10:00Z',
    category: 'Frontend',
    tags: ['react', 'hooks'],
  },
  {
    id: '3',
    title: 'Markdown Tips & Tricks',
    description: 'Improve your writing with advanced Markdown techniques.',
    body: '## Markdown Tips\n\nYou can use **bold**, _italic_, and `code`...',
    authorId: 'author-001',
    createdAt: '2025-01-18T11:10:00Z',
    updatedAt: '2025-01-18T11:10:00Z',
    category: 'Writing',
    tags: ['markdown', 'documentation'],
  },
  {
    id: '4',
    title: 'Node.js Performance Optimization',
    description: 'Learn how to optimize Node.js applications for performance.',
    body: '## Performance\n\nUse clustering, caching, and async patterns...',
    authorId: 'author-003',
    createdAt: '2025-01-18T11:10:00Z',
    updatedAt: '2025-01-18T11:10:00Z',
    category: 'Backend',
    tags: ['nodejs', 'performance'],
  },
  {
    id: '5',
    title: 'Design Systems 101',
    description: 'An overview of building and maintaining design systems.',
    body: '## Design Systems\n\nA design system is a collection of reusable components...',
    authorId: 'author-004',
    createdAt: '2025-01-18T11:10:00Z',
    updatedAt: '2025-01-18T11:10:00Z',
    category: 'Design',
    tags: ['design', 'ui', 'ux'],
  },
  {
    id: '6',
    title: 'SEO Basics for Developers',
    description: 'Essential SEO concepts every developer should know.',
    body: '## SEO Basics\n\nSearch Engine Optimization helps your content get discovered...',
    authorId: 'author-002',
    createdAt: '2025-01-18T11:10:00Z',
    updatedAt: '2025-01-18T11:10:00Z',
    category: 'Marketing',
    tags: ['seo', 'web'],
  },
]

function Table() {
  return (
    <>
      <div className="flex justify-between gap-2">
        {/* table headings */}
        {/* search */}
        <label className="input">
          <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input type="search" required placeholder="Search" />
        </label>

        {/* filters */}
      </div>

      <div className="bg-white rounded-lg">
        <Grid cols={12} gap={2}>
          {MEDIA_ITEMS.map((item) => {
            const { id, title, description, authorId, category, tags } = item
            return (
              <GridItem key={id} colSpan={12} className="lg:col-span-3">
                <Link
                  to="/content/$contentId"
                  params={{
                    contentId: id,
                  }}
                  className="grid grid-cols-12 gap-2 rounded-lg bg-base-100 shadow-sm"
                >
                  <figure className="col-span-4 lg:col-span-12">
                    <img
                      src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                      alt="Shoes"
                      className="h-full object-cover rounded-s-lg lg:rounded-b-none lg:rounded-t-lg"
                    />
                  </figure>
                  <div className="col-span-8 lg:col-span-12 p-4">
                    <h1 className="card-title truncate">{title}</h1>
                    <p className="text-gray-600 truncate">{description}</p>
                    <p>{authorId}</p>
                  </div>
                </Link>
              </GridItem>
            )
          })}
        </Grid>
      </div>

      <div>
        <TablePagination
          page={1}
          perPage={10}
          total={MEDIA_ITEMS.length}
          onPageChange={() => {}}
          onPerPageChange={() => {}}
        />
      </div>
    </>
  )
}
