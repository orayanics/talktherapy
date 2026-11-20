import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import {
  fetchSlpAssignments,
  mutateUnassignSlpAssignment,
} from '../api/workflow'
import type { SlpAssignment } from '../api/workflow'
import PatientAssignmentDeck from './PatientAssignmentDeck'
import { Root, Tala, useCalmMotion } from './PracticeRewards'
import './practice.css'

export default function SlpAssignments() {
  const { is } = useAuthGuard()
  const calm = useCalmMotion(false)
  const queryClient = useQueryClient()
  const { data, isPending, isError } = useQuery(fetchSlpAssignments())
  const unassign = useMutation({
    mutationFn: mutateUnassignSlpAssignment,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['slp-workflow', 'assignments'],
      }),
  })
  const clinicianRows = new Map<
    string,
    {
      name: string
      collections: Map<
        string,
        { title: string; exercises: { id: string; prompt: string }[] }
      >
    }
  >()

  data?.data.forEach((item: SlpAssignment) => {
    const patientId = item.patient?.id ?? item.patient_id
    const patient = clinicianRows.get(patientId) ?? {
      name: item.patient?.name ?? patientId,
      collections: new Map(),
    }
    const collection = item.version?.exercise?.collection
    const collectionId = collection?.id ?? 'standalone'
    const group = patient.collections.get(collectionId) ?? {
      title: collection?.title ?? 'Standalone exercises',
      exercises: [],
    }
    group.exercises.push({
      id: item.id,
      prompt: item.version?.prompt_text ?? 'Assigned exercise',
    })
    patient.collections.set(collectionId, group)
    clinicianRows.set(patientId, patient)
  })

  if (isPending)
    return is('clinician') ? (
      <section className="space-y-4" aria-busy="true">
        <p className="text-sm text-slate-600">Loading assigned practice...</p>
      </section>
    ) : (
      <Root calm={calm}>
        <section
          className="slp-practice slp-assigned-practice"
          data-theme="light"
          aria-busy="true"
        >
          <p className="slp-section-label">Loading your practice...</p>
        </section>
      </Root>
    )

  if (isError)
    return is('clinician') ? (
      <section className="space-y-4" role="alert">
        <p className="text-sm text-red-700">
          Could not load assigned practice.
        </p>
      </section>
    ) : (
      <Root calm={calm}>
        <section
          className="slp-practice slp-assigned-practice"
          data-theme="light"
          role="alert"
        >
          <p className="slp-section-label">
            Could not load your practice assignments.
          </p>
        </section>
      </Root>
    )

  if (is('clinician'))
    return (
      <section className="space-y-5" aria-labelledby="slp-assignment-heading">
        <header>
          <h2 id="slp-assignment-heading" className="text-2xl font-semibold">
            Patient assignments
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Review which collections and exercises are assigned to each patient.
          </p>
        </header>
        {!clinicianRows.size ? (
          <p
            className="border border-base-300 p-4 text-sm text-slate-600"
            role="status"
          >
            No patient assignments yet.
          </p>
        ) : (
          <div className="overflow-x-auto border border-base-300">
            <table className="table w-full">
              <thead>
                <tr>
                  <th scope="col">Patient</th>
                  <th scope="col">Assigned collections and exercises</th>
                </tr>
              </thead>
              <tbody>
                {[...clinicianRows].map(([patientId, patient]) => (
                  <tr key={patientId}>
                    <th scope="row" className="align-top font-medium">
                      {patient.name}
                    </th>
                    <td>
                      <ul className="space-y-3">
                        {[...patient.collections.values()].map((collection) => (
                          <li key={collection.title}>
                            <p className="font-medium">{collection.title}</p>
                            <ul className="list-disc pl-5 text-sm text-slate-600">
                              {collection.exercises.map((exercise) => (
                                <li
                                  key={exercise.id}
                                  className="flex items-center justify-between gap-3"
                                >
                                  <span>{exercise.prompt}</span>
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-xs text-error"
                                    disabled={unassign.isPending}
                                    onClick={() => unassign.mutate(exercise.id)}
                                  >
                                    Unassign
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {unassign.isError && (
          <p className="text-sm text-red-700" role="alert">
            Could not unassign that exercise.
          </p>
        )}
      </section>
    )

  return (
    <Root calm={calm}>
      <section
        className="slp-practice slp-assigned-practice mx-auto"
        data-theme="light"
        aria-labelledby="slp-assignment-heading"
      >
        <header className="slp-assignment-header">
          <Tala mood="cheer" size={64} />
          <div>
            <h2 id="slp-assignment-heading">My assignments</h2>
            <p className="mt-1 text-sm">
              Pick a card and record your word. Your clinician will listen.
            </p>
          </div>
        </header>
        {!data.data.length && (
          <div className="tt-card" role="status">
            <h3 className="text-lg font-bold">No practice yet</h3>
            <p className="mt-1 text-sm text-slate-600">
              Your clinician will add an exercise here when one is ready.
            </p>
          </div>
        )}
        {!!data.data.length && (
          <PatientAssignmentDeck assignments={data.data} />
        )}
      </section>
    </Root>
  )
}
