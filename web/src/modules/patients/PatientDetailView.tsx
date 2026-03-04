import { format } from 'date-fns/format'
import { useQuery } from '@tanstack/react-query'

import useAddSoap from './useAddSoap'
import type {
  ClinicianPatientDetailAppointmentDto,
  ClinicianPatientDetailDto,
  SoapDto,
} from '~/models/booking'
import type { ClinicianPatientDetailParams } from '~/models/params'

import {
  clinicianPatientDetailQuery,
  clinicianPatientSoapsQuery,
} from '~/api/clinician'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import SkeletonError from '~/components/Skeleton/SkeletonError'

interface PatientDetailViewProps {
  patientId: string
  initialPatientDetail: ClinicianPatientDetailDto
  initialSoaps: Array<SoapDto>
  search: ClinicianPatientDetailParams & { page: number; perPage: number }
  onPageChange: (page: number) => void
}

export default function PatientDetailView({
  patientId,
  initialPatientDetail,
  initialSoaps,
  search,
  onPageChange,
}: PatientDetailViewProps) {
  // Reactive — re-fetches when page/date filters change; uses loader cache as initial value
  const { data: patientDetail = initialPatientDetail, isError } = useQuery(
    clinicianPatientDetailQuery(patientId, search),
  )

  const { data: soaps = initialSoaps } = useQuery(
    clinicianPatientSoapsQuery(patientId),
  )

  const {
    form,
    setField,
    errors: soapErrors,
    isLoading: isSoapSaving,
    handleSubmit: submitSoap,
  } = useAddSoap(patientId)

  const { patient, appointments } = patientDetail

  function handlePageChange(page: number) {
    onPageChange(page)
  }

  if (isError) return <SkeletonError />

  return (
    <Grid cols={12} gap={6}>
      {/* ── Patient Info ─────────────────────────────────── */}
      <GridItem colSpan={12}>
        <div className="card bg-base-100 shadow-sm border border-base-200 p-4">
          <h2 className="text-lg font-semibold mb-3">Patient Information</h2>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-base-content/50">Name</dt>
              <dd className="font-medium">{patient.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-base-content/50">Email</dt>
              <dd className="font-medium">{patient.email}</dd>
            </div>
            <div>
              <dt className="text-base-content/50">Diagnosis</dt>
              <dd className="font-medium">{patient.diagnosis ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-base-content/50">First Completed</dt>
              <dd className="font-medium">
                {format(new Date(patient.first_completed_at), 'MMM d, yyyy')}
              </dd>
            </div>
          </dl>
        </div>
      </GridItem>

      {/* ── Appointment History ──────────────────────────── */}
      <GridItem colSpan={12} className="lg:col-span-7">
        <div className="card bg-base-100 shadow-sm border border-base-200 p-4">
          <h2 className="text-lg font-semibold mb-3">Appointment History</h2>

          {appointments.data.length === 0 ? (
            <p className="text-sm text-base-content/50">
              No appointments found.
            </p>
          ) : (
            <table className="table table-sm w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Chief Complaint</th>
                </tr>
              </thead>
              <tbody>
                {appointments.data.map(
                  (appt: ClinicianPatientDetailAppointmentDto) => (
                    <tr key={appt.id}>
                      <td>
                        {format(new Date(appt.slot.starts_at), 'MMM d, yyyy')}
                      </td>
                      <td>
                        <span className="badge badge-sm badge-success">
                          {appt.status}
                        </span>
                      </td>
                      <td>{appt.encounter?.chief_complaint ?? '—'}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {appointments.meta.page_count > 1 && (
            <div className="flex justify-between items-center mt-3 text-sm">
              <span className="text-base-content/50">
                {appointments.meta.from}–{appointments.meta.to} of{' '}
                {appointments.meta.total}
              </span>
              <div className="flex gap-1">
                <button
                  className="btn btn-xs btn-ghost"
                  disabled={appointments.meta.page <= 1}
                  onClick={() => handlePageChange(appointments.meta.page - 1)}
                >
                  ‹
                </button>
                <span className="btn btn-xs btn-ghost pointer-events-none">
                  {appointments.meta.page} / {appointments.meta.page_count}
                </span>
                <button
                  className="btn btn-xs btn-ghost"
                  disabled={
                    appointments.meta.page >= appointments.meta.page_count
                  }
                  onClick={() => handlePageChange(appointments.meta.page + 1)}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </GridItem>

      {/* ── SOAP Notes ───────────────────────────────────── */}
      <GridItem colSpan={12} className="lg:col-span-5">
        <div className="card bg-base-100 shadow-sm border border-base-200 p-4">
          <h2 className="text-lg font-semibold mb-3">
            SOAP Notes ({soaps.length})
          </h2>

          {soaps.length === 0 ? (
            <p className="text-sm text-base-content/50 mb-3">
              No SOAP notes yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2 mb-4">
              {soaps.map((soap) => (
                <li
                  key={soap.id}
                  className="border border-base-200 rounded-lg p-3 text-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="badge badge-sm badge-outline">
                      {soap.session_type}
                    </span>
                    <span className="text-xs text-base-content/40">
                      {format(new Date(soap.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="font-medium">{soap.assessment}</p>
                  {soap.comments && (
                    <p className="text-base-content/60 mt-1">{soap.comments}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Add SOAP form */}
          <details className="collapse collapse-arrow border border-base-200 rounded-lg">
            <summary className="collapse-title text-sm font-medium">
              + Add SOAP Note
            </summary>
            <div className="collapse-content flex flex-col gap-2 pt-2">
              {soapErrors && (
                <p className="text-error text-xs">{soapErrors.message}</p>
              )}

              {(
                [
                  ['activity_plan', 'Activity Plan'],
                  ['session_type', 'Session Type'],
                  ['subjective_notes', 'Subjective Notes'],
                  ['objective_notes', 'Objective Notes'],
                  ['assessment', 'Assessment'],
                  ['recommendation', 'Recommendation'],
                  ['comments', 'Comments (optional)'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="form-control w-full">
                  <div className="label">
                    <span className="label-text text-xs">{label}</span>
                  </div>
                  <textarea
                    className="textarea textarea-bordered textarea-sm w-full"
                    rows={2}
                    value={form[key] ?? ''}
                    onChange={(e) => setField(key, e.target.value)}
                  />
                </label>
              ))}

              <button
                className="btn btn-primary btn-sm mt-1"
                disabled={isSoapSaving}
                onClick={submitSoap}
              >
                {isSoapSaving ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  'Save SOAP Note'
                )}
              </button>
            </div>
          </details>
        </div>
      </GridItem>
    </Grid>
  )
}
