import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '#/lib/api/client'
import { useDiagnosisActions } from '#/modules/diagnoses/hooks/useDiagnosisActions'
import type { DiagnosisItem } from '#/modules/diagnoses/types/diagnosis'
import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import Modal from '#/components/Modal/Modal'
import { TableBase } from '#/components/Table/TableBase'
import Pagination from '#/components/Page/Pagination'
import FormInput from '#/components/Form/FormInput'

const EMPTY_DRAFT = { id: '', label: '', value: '' }
const PAGE_SIZE = 10

export default function DiagnosisAdmin() {
  const query = useQuery({
    queryKey: ['admin-diagnoses'],
    queryFn: async () =>
      (await api<{ data: DiagnosisItem[] }>('/api/v1/admin/diagnoses')).data,
  })
  const { create, update, archive } = useDiagnosisActions()
  const [editing, setEditing] = useState<DiagnosisItem | null>(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [page, setPage] = useState(1)
  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setDraft(EMPTY_DRAFT)
  }
  const save = async () => {
    const label = draft.label.trim()
    const value = draft.value.trim()
    if (!label || !value) return
    if (editing) await update.mutateAsync({ id: editing.id, label, value })
    else
      await create.mutateAsync({
        id: draft.id.trim() || value.toLowerCase().replace(/\s+/g, '-'),
        label,
        value,
      })
    closeModal()
  }
  if (query.isPending) return <StateLoading />
  if (query.isError) return <StateError />

  const lastPage = Math.max(1, Math.ceil(query.data.length / PAGE_SIZE))
  const currentPage = Math.min(page, lastPage)
  const meta = {
    current_page: currentPage,
    last_page: lastPage,
    total: query.data.length,
    from: query.data.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0,
    to: Math.min(currentPage * PAGE_SIZE, query.data.length),
  }
  const diagnoses = query.data.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          className="btn btn-neutral"
          onClick={() => {
            setEditing(null)
            setDraft(EMPTY_DRAFT)
            setModalOpen(true)
          }}
        >
          Add Diagnosis
        </button>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Diagnosis' : 'Create Diagnosis'}
        description="Add a diagnosis label and value for users to select."
        onSubmit={() => void save()}
        submitLabel={editing ? 'Save' : 'Create'}
        isDisabled={create.isPending || update.isPending}
      >
        <div className="flex flex-col gap-2">
          <FormInput htmlFor="diagnosis-id" label="ID (optional)">
            <input
              id="diagnosis-id"
              className="input input-bordered w-full"
              placeholder="ID (optional)"
              value={draft.id}
              onChange={(event) =>
                setDraft({ ...draft, id: event.target.value })
              }
              disabled={Boolean(editing)}
            />
          </FormInput>
          <FormInput htmlFor="diagnosis-label" label="Label" required>
            <input
              id="diagnosis-label"
              className="input input-bordered w-full"
              placeholder="Label"
              required
              value={draft.label}
              onChange={(event) =>
                setDraft({ ...draft, label: event.target.value })
              }
            />
          </FormInput>
          <FormInput htmlFor="diagnosis-value" label="Value" required>
            <input
              id="diagnosis-value"
              className="input input-bordered w-full"
              placeholder="Value"
              required
              value={draft.value}
              onChange={(event) =>
                setDraft({ ...draft, value: event.target.value })
              }
            />
          </FormInput>
        </div>
      </Modal>
      <div className="overflow-hidden rounded-box border border-border">
        <TableBase
          data={diagnoses}
          keyExtractor={(diagnosis) => diagnosis.id}
          columns={[
            { header: 'Label', accessor: 'label' },
            { header: 'Value', accessor: 'value' },
            {
              header: 'Status',
              render: (diagnosis) =>
                diagnosis.active === false ? 'Archived' : 'Active',
            },
            {
              header: '',
              className: 'text-right',
              render: (diagnosis) => (
                <div className="flex gap-2 justify-end">
                  <button
                    className="btn btn-xs btn-neutral"
                    onClick={() => {
                      setEditing(diagnosis)
                      setDraft({
                        id: diagnosis.id,
                        label: diagnosis.label,
                        value: diagnosis.value,
                      })
                      setModalOpen(true)
                    }}
                  >
                    Edit
                  </button>
                  {diagnosis.active === false ? (
                    <button
                      className="btn btn-xs text-success"
                      disabled={update.isPending}
                      onClick={() =>
                        update.mutate({
                          id: diagnosis.id,
                          label: diagnosis.label,
                          value: diagnosis.value,
                          active: true,
                        })
                      }
                    >
                      Unarchive
                    </button>
                  ) : (
                    <button
                      className="btn btn-xs btn-error"
                      disabled={archive.isPending}
                      onClick={() => archive.mutate(diagnosis.id)}
                    >
                      Archive
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
        <Pagination
          page={currentPage}
          meta={meta}
          updateSearch={({ page: nextPage }) => setPage(nextPage)}
        />
      </div>
    </div>
  )
}
