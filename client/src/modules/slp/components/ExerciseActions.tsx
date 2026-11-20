import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api/client'
import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import ModalConfirm from '#/components/Modal/ModalConfirm'
import Modal from '#/components/Modal/Modal'
import {
  useArchiveSlpExerciseMutation,
  useUpdateSlpExerciseMutation,
} from '../hooks/useExerciseMutations'
import type { SlpExercise } from '../api/exercises'
import CreateSlpExercisePage from './CreateSlpExercisePage'
import ExercisePreview from './ExercisePreview'

export default function ExerciseActions({
  exercise,
}: {
  exercise: SlpExercise
}) {
  const { role } = useAuthGuard()
  const client = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [preview, setPreview] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const update = useUpdateSlpExerciseMutation(exercise.id)
  const remove = useArchiveSlpExerciseMutation(exercise.id)
  const version = exercise.latest_version
  const refresh = () =>
    client.invalidateQueries({ queryKey: ['slp-exercises'] })
  const review = useMutation({
    mutationFn: () =>
      api(`/api/v1/slp/exercise-versions/${version?.id}/review`, {
        method: 'POST',
      }),
    onSuccess: refresh,
  })
  const publish = useMutation({
    mutationFn: () =>
      api(`/api/v1/slp/exercise-versions/${version?.id}/publish`, {
        method: 'POST',
      }),
    onSuccess: refresh,
  })
  const isAdmin = role === 'admin' || role === 'superadmin'
  return (
    <div className="space-y-3">
      {exercise.can_manage && (
        <label className="flex min-h-12 items-center gap-2">
          <input
            type="checkbox"
            className="checkbox"
            checked={exercise.is_hidden}
            disabled={update.isPending}
            onChange={(event) =>
              update.mutate({ is_hidden: event.target.checked })
            }
          />
          Hide exercise
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {exercise.can_manage && (
          <>
            <button className="btn" onClick={() => setEditing(!editing)}>
              {editing ? 'Close editor' : 'Edit'}
            </button>
            <button className="btn" onClick={() => setDeleting(true)}>
              Delete
            </button>
          </>
        )}
        <button className="btn" onClick={() => setPreview(!preview)}>
          {preview ? 'Close preview' : 'Speech preview'}
        </button>
        {version?.status === 'draft' && (exercise.can_manage || isAdmin) && (
          <button
            className="btn"
            disabled={review.isPending}
            onClick={() => review.mutate()}
          >
            Review for publishing
          </button>
        )}
        {version?.status === 'reviewed' && isAdmin && (
          <button
            className="btn"
            disabled={publish.isPending}
            onClick={() => publish.mutate()}
          >
            Publish to patients
          </button>
        )}
      </div>
      {(update.isError ||
        remove.isError ||
        review.isError ||
        publish.isError) && (
        <p role="alert">Could not save the change. Please try again.</p>
      )}
      <Modal
        isOpen={editing}
        title="Edit exercise"
        onClose={() => setEditing(false)}
      >
        <CreateSlpExercisePage
          exercise={exercise}
          onSaved={() => setEditing(false)}
        />
      </Modal>
      <Modal
        isOpen={preview}
        title="Speech preview"
        onClose={() => setPreview(false)}
      >
        <ExercisePreview exercise={exercise} />
      </Modal>
      <ModalConfirm
        isOpen={deleting}
        title="Delete exercise?"
        description="This archives the exercise and preserves its revision history."
        confirmText="Delete exercise"
        cancelText="Cancel"
        states={{ isLoading: remove.isPending }}
        onConfirm={() => remove.mutate()}
        onCancel={() => setDeleting(false)}
      />
    </div>
  )
}
