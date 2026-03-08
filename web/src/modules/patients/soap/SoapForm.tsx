import MDEditor from '@uiw/react-md-editor'
import useAddSoap from '../useAddSoap'

export default function SoapForm({ patientId }: { patientId: string }) {
  const { form, setField, errors, isLoading, handleSubmit } =
    useAddSoap(patientId)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <p className="font-bold uppercase text-primary">SOAP Note</p>

      {errors && (
        <div className="my-2 text-sm text-error">{errors.message}</div>
      )}

      <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
        <div className="flex flex-row justify-between gap-2">
          <p className="font-bold">
            Session Type <span className="text-error">*</span>
          </p>
          <input
            type="text"
            name="session_type"
            list="session-types"
            className="input input-bordered w-40"
            required
            value={form.session_type}
            onChange={(e) => setField('session_type', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bold">
            Activity Plan <span className="text-error">*</span>
          </p>
          <MDEditor
            value={form.activity_plan}
            onChange={(val) => setField('activity_plan', val ?? '')}
            height={200}
            preview="edit"
            commandsFilter={(cmd) =>
              !['preview', 'live'].includes(cmd.name as string) && cmd
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bold">
            Subjective Notes <span className="text-error">*</span>
          </p>
          <MDEditor
            value={form.subjective_notes}
            onChange={(val) => setField('subjective_notes', val ?? '')}
            height={200}
            preview="edit"
            commandsFilter={(cmd) =>
              !['preview', 'live'].includes(cmd.name as string) && cmd
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bold">
            Objective Notes <span className="text-error">*</span>
          </p>
          <MDEditor
            value={form.objective_notes}
            onChange={(val) => setField('objective_notes', val ?? '')}
            height={200}
            preview="edit"
            commandsFilter={(cmd) =>
              !['preview', 'live'].includes(cmd.name as string) && cmd
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bold">
            Assessment <span className="text-error">*</span>
          </p>
          <MDEditor
            value={form.assessment}
            onChange={(val) => setField('assessment', val ?? '')}
            height={200}
            preview="edit"
            commandsFilter={(cmd) =>
              !['preview', 'live'].includes(cmd.name as string) && cmd
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bold">
            Recommendation <span className="text-error">*</span>
          </p>
          <MDEditor
            value={form.recommendation}
            onChange={(val) => setField('recommendation', val ?? '')}
            height={200}
            preview="edit"
            commandsFilter={(cmd) =>
              !['preview', 'live'].includes(cmd.name as string) && cmd
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-bold">Comments</p>
          <MDEditor
            value={form.comments ?? ''}
            onChange={(val) => setField('comments', val ?? '')}
            height={150}
            preview="edit"
            commandsFilter={(cmd) =>
              !['preview', 'live'].includes(cmd.name as string) && cmd
            }
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save SOAP Note'}
        </button>
      </div>
    </form>
  )
}
