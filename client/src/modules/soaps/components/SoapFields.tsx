import FormInput from '#/components/Form/FormInput'
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
      <FormInput
        htmlFor={id}
        key={name}
        label={<span className="text-xs font-mono text-gray-400">{label}</span>}
        error={errors[name]?.message}
      >
        {name === 'activity_plan' || name === 'session_type' ? (
          <input id={id} {...register(name)} className="input  w-full" />
        ) : (
          <textarea id={id} {...register(name)} className="textarea w-full" />
        )}
      </FormInput>
    )
  })
}
