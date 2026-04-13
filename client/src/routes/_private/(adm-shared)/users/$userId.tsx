import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchUser } from '@/api/users'
import { ArrowLeft, Mail, Calendar } from 'lucide-react'

import { formatDate } from '@/utils/useDate'
import StateError from '@/components/State/StateError'
import StateLoading from '@/components/State/StateLoading'
import StatusPill from '@/components/Decorator/StatusPill'
import RolePill from '@/components/Decorator/RolePill'

export const Route = createFileRoute('/_private/(adm-shared)/users/$userId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { userId } = Route.useParams()
  const { data, isPending, isError } = useQuery(fetchUser(userId))

  return (
    <div className="w-full mx-auto flex flex-col gap-6 ">
      <div className="flex items-center justify-between">
        <Link
          to="/users"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 flex gap-1.5"
        >
          <ArrowLeft size={16} /> Users
        </Link>
      </div>

      {isPending ? (
        <StateLoading />
      ) : isError ? (
        <StateError />
      ) : (
        <div className="bg-white w-100 border border-slate-300 rounded-lg p-6">
          <div className="space-y-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold font-serif text-3xl text-slate-900 tracking-tight">
                  {data.name}
                </p>{' '}
                <StatusPill status={data.status} />
              </div>
              <p className="text-slate-500 font-medium text-sm flex items-center gap-1.5">
                <Mail size={14} /> {data.email}
              </p>

              <p className="text-slate-500 font-medium text-sm flex items-center gap-1.5">
                <Calendar size={14} /> {formatDate(data.createdAt)}
              </p>
            </div>
          </div>

          <div className="divider" />

          <div className="space-y-2">
            <RolePill role={data.role} />
          </div>
        </div>
      )}
    </div>
  )
}
