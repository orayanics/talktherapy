import MDEditor from '@uiw/react-md-editor'
import useAddSoap from '../useAddSoap'
import GridItem from '~/components/Page/GridItem'

import { fieldError, hasOnlyMessage } from '~/utils/errors'

export default function SoapForm({ patientId }: { patientId: string }) {
  const { form, setField, errors, isLoading, handleSubmit } =
    useAddSoap(patientId)

  return (
    <>
      <GridItem colSpan={12} className="lg:col-span-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <p className="font-bold uppercase text-primary">SOAP Note</p>

          {hasOnlyMessage(errors) && (
            <p className="text-error text-center text-sm mt-1">
              {errors!.message}
            </p>
          )}

          <div className="[&>div]:py-4 [&>div]:border-y [&>div]:border-gray-100 [&>div]:border-dashed">
            <div>
              <div className="flex flex-row justify-between gap-2">
                <p className="font-bold">
                  Session Type <span className="text-error">*</span>
                </p>
                <input
                  type="text"
                  name="session_type"
                  list="session-types"
                  className="input input-bordered w-40"
                  value={form.session_type}
                  onChange={(e) => setField('session_type', e.target.value)}
                />
              </div>
              {fieldError(errors, 'session_type') && (
                <p className="text-error text-sm mt-1">
                  {fieldError(errors, 'session_type')}
                </p>
              )}
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
                highlightEnable={false}
                commandsFilter={(cmd) =>
                  !['preview', 'live'].includes(cmd.name as string) && cmd
                }
              />
              {fieldError(errors, 'activity_plan') && (
                <p className="text-error text-sm mt-1">
                  {fieldError(errors, 'activity_plan')}
                </p>
              )}
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
                highlightEnable={false}
                commandsFilter={(cmd) =>
                  !['preview', 'live'].includes(cmd.name as string) && cmd
                }
              />
              {fieldError(errors, 'subjective_notes') && (
                <p className="text-error text-sm mt-1">
                  {fieldError(errors, 'subjective_notes')}
                </p>
              )}
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
                highlightEnable={false}
                commandsFilter={(cmd) =>
                  !['preview', 'live'].includes(cmd.name as string) && cmd
                }
              />
              {fieldError(errors, 'objective_notes') && (
                <p className="text-error text-sm mt-1">
                  {fieldError(errors, 'objective_notes')}
                </p>
              )}
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
                highlightEnable={false}
                commandsFilter={(cmd) =>
                  !['preview', 'live'].includes(cmd.name as string) && cmd
                }
              />
              {fieldError(errors, 'assessment') && (
                <p className="text-error text-sm mt-1">
                  {fieldError(errors, 'assessment')}
                </p>
              )}
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
                highlightEnable={false}
                commandsFilter={(cmd) =>
                  !['preview', 'live'].includes(cmd.name as string) && cmd
                }
              />
              {fieldError(errors, 'recommendation') && (
                <p className="text-error text-sm mt-1">
                  {fieldError(errors, 'recommendation')}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-bold">Comments</p>
              <MDEditor
                value={form.comments ?? ''}
                onChange={(val) => setField('comments', val ?? '')}
                height={150}
                preview="edit"
                highlightEnable={false}
                commandsFilter={(cmd) =>
                  !['preview', 'live'].includes(cmd.name as string) && cmd
                }
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save SOAP Note'}
            </button>
          </div>
        </form>
      </GridItem>

      <GridItem colSpan={12} className="lg:col-span-6">
        <div className="flex flex-col gap-2 p-4 ">
          <p className="font-bold uppercase text-primary">SOAP Note Preview</p>
          <span className="text-gray-400 text-sm">
            Output will be visible with the changes you make.
          </span>
          <div className="flex flex-col border rounded-lg">
            {[
              'activity_plan',
              'subjective_notes',
              'objective_notes',
              'assessment',
              'recommendation',
              'comments',
            ].map(
              (field) =>
                form[field as keyof typeof form] && (
                  <div key={field} className="p-4">
                    <p className="text-sm font-mono font-semibold uppercase text-primary">
                      {field.replace(/_/g, ' ')}
                    </p>
                    <div className="prose prose-sm max-w-none text-gray-800 bg-white border border-dashed border-gray-200 rounded-lg p-3">
                      <MDEditor.Markdown
                        source={form[field as keyof typeof form] || ''}
                      />
                    </div>
                  </div>
                ),
            )}
          </div>
        </div>
      </GridItem>
    </>
  )
}
