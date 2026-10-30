import { useQuery } from '@tanstack/react-query'
import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import { fetchSlpAssignments } from '../api/workflow'
import AssignedExercise from './AssignedExercise'

export default function SlpAssignments() {
  const { is, role } = useAuthGuard()
  const { data, isPending, isError } = useQuery(fetchSlpAssignments())
  if (isPending) return <div>Loading assignments…</div>
  if (isError) return <div role="alert">Could not load assignments.</div>
  return <section className="space-y-4">
    <div><h1 className="text-xl font-semibold">Speech practice assignments</h1><p className="text-sm text-slate-600">Recording results remain clinician-reviewed data.</p></div>
    {!data?.data.length && <p>No exercises have been assigned yet.</p>}
    <ul className="space-y-2">{data?.data.map((item) => <li key={item.id} className="rounded border border-slate-200 bg-white p-4"><div className="font-medium">{item.version?.prompt_text ?? 'Assigned exercise'}</div><div className="text-sm text-slate-500">{item.version?.task_type} · {item.version?.language} · {item.status}</div>{is('clinician') && <div className="text-xs text-slate-500">Patient: {item.patient_id}</div>}{role === 'patient' && item.status === 'active' && <AssignedExercise assignmentId={item.id} />}</li>)}</ul>
  </section>
}
