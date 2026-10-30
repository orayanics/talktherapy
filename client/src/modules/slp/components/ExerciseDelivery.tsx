import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api/client'
import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import { fetchClinicianPatients } from '#/modules/patients/api/patients'
import type { SlpExercise } from '../api/exercises'

export default function ExerciseDelivery({ exercise }: { exercise: SlpExercise }) {
  const { role } = useAuthGuard()
  const client = useQueryClient()
  const [patient, setPatient] = useState('')
  const patients = useQuery({ ...fetchClinicianPatients(), enabled: role === 'clinician' })
  const version = exercise.latest_version
  const visible = version?.configuration?.patient_visible === true
  const toggle = useMutation({ mutationFn: () => api(`/api/v1/slp/exercise-versions/${version?.id}/visibility`, { method: 'PATCH', data: { visible: !visible } }), onSuccess: () => client.invalidateQueries({ queryKey: ['slp-exercises'] }) })
  const assign = useMutation({ mutationFn: () => api('/api/v1/slp/assignments', { method: 'POST', data: { patient_id: patient, exercise_version_id: version?.id } }), onSuccess: () => client.invalidateQueries({ queryKey: ['slp-workflow'] }) })
  if (!version) return null
  return <div className="mt-3 space-y-2">
    <button className="btn btn-sm" disabled={toggle.isPending} onClick={() => toggle.mutate()}>{visible ? 'Hide from patients' : 'Enable patient testing'}</button>
    {role === 'clinician' && visible && <div className="flex gap-2"><label>Patient<select className="select" value={patient} onChange={(e) => setPatient(e.target.value)}><option value="">Select a patient</option>{patients.data?.data.map((p) => <option key={p.patientId} value={p.patientId}>{p.patient.name}</option>)}</select></label><button className="btn" disabled={!patient || assign.isPending} onClick={() => assign.mutate()}>Assign exercise</button></div>}
    {assign.isSuccess && <p role="status">Exercise assigned.</p>}
    {(toggle.isError || assign.isError || patients.isError) && <p role="alert">Could not complete this action. Check access and try again.</p>}
  </div>
}
