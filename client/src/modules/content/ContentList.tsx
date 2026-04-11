import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { fetchContentList } from '@/api/content'

import StateError from '@/components/State/StateError'
import StateLoading from '@/components/State/StateLoading'
import StateNull from '@/components/State/StateNull'
import ContentFilters from './ContentFilters'
import Pagination from '@/components/Page/Pagination'
import { useAuthGuard } from '@/hooks/useAuth'

import ContentCard from './ContentCard'

export default function ContentList() {
  const { is, can } = useAuthGuard()
  const isAdmin = is('ADMIN')
  const canCreate = can('content.create')

  const search = useSearch({ from: '/_private/(shared)/content/' })
  const navigate = useNavigate({ from: '/content/' })

  const page = search.page ?? 1
  const searchTerm = search.search ?? ''
  const diagnosis = search.diagnosis
    ? Array.isArray(search.diagnosis)
      ? search.diagnosis
      : [search.diagnosis]
    : []
  const sort = search.sort ?? 'desc'
  const is_bookmarked = search.is_bookmarked

  const updateSearch = <T extends Record<string, unknown>>(
    next: Partial<T>,
  ) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...next,
      }),
    })
  }

  const { data, isPending, isError } = useQuery(
    fetchContentList(
      { page },
      { search: searchTerm || undefined, diagnosis, sort, is_bookmarked },
    ),
  )

  const contents = data?.data ?? []
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    total: 0,
    from: null,
    to: null,
    per_page: 0,
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <ContentFilters
          searchTerm={searchTerm}
          diagnosis={diagnosis}
          sort={sort}
          is_bookmarked={is_bookmarked}
          updateSearch={updateSearch}
        />

        {isAdmin && canCreate && (
          <Link to="/content/create" className="btn btn-neutral">
            Add Content
          </Link>
        )}
      </div>

      {isPending ? (
        <StateLoading />
      ) : isError ? (
        <StateError />
      ) : data.data.length == 0 ? (
        <StateNull />
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {contents.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      )}

      <Pagination
        meta={meta}
        page={page}
        updateSearch={(next) => updateSearch({ page: next.page })}
      />
    </div>
  )
}
