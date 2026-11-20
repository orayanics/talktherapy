import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import {
  fetchSlpReports,
  mutateReleaseSlpReport,
  type SlpReport,
} from '../api/workflow'

export default function SlpReports() {
  const { role } = useAuthGuard()
  const client = useQueryClient()
  const query = useQuery(fetchSlpReports())
  const release = useMutation({
    mutationFn: mutateReleaseSlpReport,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ['slp-workflow', 'reports'] }),
  })
  if (query.isPending) return <StateLoading />
  if (query.isError) return <StateError />
  if (!query.data.data.length) {
    return (
      <p role="status">
        {role === 'patient'
          ? 'No clinician reports have been released yet.'
          : 'No approved reports are available.'}
      </p>
    )
  }

  return (
    <div className="grid gap-4">
      {query.data.data.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          canRelease={role === 'clinician' && report.status === 'approved'}
          releasing={release.isPending && release.variables === report.id}
          onRelease={() => release.mutate(report.id)}
        />
      ))}
      {release.isError && (
        <p role="alert">Could not release the report. Please try again.</p>
      )}
    </div>
  )
}

function ReportCard({
  report,
  canRelease,
  releasing,
  onRelease,
}: {
  report: SlpReport
  canRelease: boolean
  releasing: boolean
  onRelease: () => void
}) {
  const annotations = report.snapshot.annotations ?? []
  return (
    <article className="rounded-box border border-base-300 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            {report.exercise.prompt_text}
          </h2>
          <p className="text-sm text-base-content/70">
            {report.exercise.task_type.replaceAll('_', ' ')} ·{' '}
            {report.exercise.language}
            {report.patient?.name ? ` · ${report.patient.name}` : ''}
          </p>
        </div>
        <span className="badge badge-outline">{report.status}</span>
      </div>
      {annotations.length > 0 && (
        <div className="mt-4 rounded-box bg-base-200 p-3">
          <h3 className="font-medium">Clinician notes</h3>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {annotations.map((item, index) => (
              <li key={index}>{String(item.text ?? '')}</li>
            ))}
          </ul>
        </div>
      )}
      {canRelease && (
        <button
          type="button"
          className="btn btn-primary mt-4"
          disabled={releasing}
          onClick={onRelease}
        >
          {releasing ? 'Releasing…' : 'Release to patient'}
        </button>
      )}
      {report.released_at && (
        <p className="mt-3 text-xs text-base-content/60">
          Released {new Date(report.released_at).toLocaleString()}
        </p>
      )}
    </article>
  )
}
