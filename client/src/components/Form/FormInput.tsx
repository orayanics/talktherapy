import type { ReactNode } from 'react'
import RowError from '#/components/Table/RowError'

type FormInputProps = {
  htmlFor: string
  label: ReactNode
  children: ReactNode
  error?: string
  errorId?: string
  required?: boolean
  className?: string
}

export default function FormInput({
  label,
  htmlFor,
  children,
  error,
  errorId,
  required = false,
  className,
}: FormInputProps) {
  return (
    <fieldset className={`fieldset ${className ?? ''}`}>
      <legend className="fieldset-legend text-base font-normal">
        <label htmlFor={htmlFor}>{label}</label>
        {required && (
          <span className="text-error" aria-hidden="true">
            *
          </span>
        )}
      </legend>
      {children}
      <RowError id={errorId} message={error} />
    </fieldset>
  )
}
