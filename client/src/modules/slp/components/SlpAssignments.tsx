import { useQuery } from '@tanstack/react-query'
import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import { fetchSlpAssignments } from '../api/workflow'
import AssignedExercise from './AssignedExercise'
import { Root, Tala, useCalmMotion } from './PracticeRewards'
import './practice.css'

export default function SlpAssignments() {
  const { is, role } = useAuthGuard()
  const calm = useCalmMotion(false)
  const { data, isPending, isError } = useQuery(fetchSlpAssignments())
  if (isPending)
    return (
      <Root calm={calm}>
        <section className="slp-practice" aria-busy="true">
          <p className="slp-section-label">Loading your practice…</p>
        </section>
      </Root>
    )
  if (isError)
    return (
      <Root calm={calm}>
        <section className="slp-practice" role="alert">
          <p className="slp-section-label">
            Could not load your practice assignments.
          </p>
        </section>
      </Root>
    )
  return (
    <Root calm={calm}>
      <section
        className="slp-practice mx-auto max-w-4xl space-y-5"
        aria-labelledby="slp-assignment-heading"
      >
        <header className="flex items-center gap-4">
          <Tala mood="cheer" size={64} />
          <div>
            <h1 id="slp-assignment-heading" className="text-2xl font-bold">
              Your speech practice
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Try each activity at your own pace. Your clinician reviews
              recordings.
            </p>
          </div>
        </header>
        {!data.data.length && (
          <div className="tt-card" role="status">
            <h2 className="text-lg font-bold">No practice yet</h2>
            <p className="mt-1 text-sm text-slate-600">
              Your clinician will add an exercise here when one is ready.
            </p>
          </div>
        )}
        <ul className="grid gap-4">
          {data.data.map((item, index) => (
            <li key={item.id} className="tt-card">
              <div className="flex items-start gap-3">
                <span className="tt-node now" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-lg font-bold">
                    {item.version?.prompt_text ?? 'Assigned exercise'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.version?.task_type ?? 'Speech activity'} ·{' '}
                    {item.version?.language ?? 'English'}
                  </p>
                  {is('clinician') && (
                    <p className="mt-1 text-xs text-slate-500">
                      Patient: {item.patient_id} · {item.status}
                    </p>
                  )}
                </div>
              </div>
              {role === 'patient' && item.status === 'active' && (
                <AssignedExercise assignmentId={item.id} />
              )}
            </li>
          ))}
        </ul>
      </section>
    </Root>
  )
}
