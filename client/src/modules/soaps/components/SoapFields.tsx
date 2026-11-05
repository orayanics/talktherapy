import RowError from '#/components/Table/RowError'
import type useCreateSoapForm from '../hooks/useCreateSoapForm'
import type useUpdateSoapForm from '../hooks/useUpdateSoapForm'

type SoapFieldsProps = (
  | Pick<ReturnType<typeof useCreateSoapForm>, 'register' | 'errors'>
  | Pick<ReturnType<typeof useUpdateSoapForm>, 'register' | 'errors'>
) & { idPrefix: string }

const FIELDS = [
  ['activity_plan', 'Activity Plan'],
  ['session_type', 'Session Type'],
  ['subjective_notes', 'Subjective Notes'],
  ['objective_notes', 'Objective Notes'],
  ['assessment', 'Assessment'],
  ['recommendation', 'Recommendation'],
  ['comments', 'Comments'],
] as const

export default function SoapFields({
  register,
  errors,
  idPrefix,
}: SoapFieldsProps) {
  return FIELDS.map(([name, label]) => {
    const id = `${idPrefix}-${name.replaceAll('_', '-')}`
    return (
      <div key={name}>
        <label htmlFor={id}>
          <span className="text-xs font-mono text-gray-400">{label}</span>
          {name === 'activity_plan' || name === 'session_type' ? (
            <input
              id={id}
              {...register(name)}
              className="input shadow-sm w-full"
            />
          ) : (
            <textarea id={id} {...register(name)} className="textarea w-full" />
          )}
        </label>
        <RowError message={errors[name]?.message} />
      </div>
    )
  })
}
