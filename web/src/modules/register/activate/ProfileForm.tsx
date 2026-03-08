import React, { useState } from 'react'
import { useBlocker } from '@tanstack/react-router'

import type { DiagnosisItem, RegisterProfileForm } from '~/models/public'

import ModalBlockNavigation from '~/components/Modal/ModalBlockNavigation'
import { fieldError } from '~/utils/errors'

export default function ProfileForm(props: RegisterProfileForm) {
  const {
    form,
    data,
    errors,
    isLoading,
    accountRole,
    onChange,
    onSubmit,
    onBack,
  } = props
  const [formIsDirty, setFormIsDirty] = useState(false)

  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => formIsDirty,
    enableBeforeUnload: formIsDirty,
    withResolver: true,
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (!formIsDirty) setFormIsDirty(true)
    onChange(e)
  }

  return (
    <div className="mx-auto w-full">
      {status === 'blocked' && (
        <ModalBlockNavigation isOpen onProceed={proceed} onReset={reset}>
          <p className="text-gray-700 mb-6">
            You have unsaved changes. Are you sure you want to leave this page?
          </p>
        </ModalBlockNavigation>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="flex flex-col gap-1 lg:gap-4"
      >
        <div className="flex flex-col gap-1 lg:gap-4">
          <h1 className="font-semibold">Personal Information</h1>
          <div>
            <input
              className="input w-full"
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleInputChange}
            />
            {fieldError(errors, 'name') && (
              <span className="mt-2 text-sm text-error">
                {fieldError(errors, 'name')}
              </span>
            )}
          </div>
          {accountRole === 'clinician' && (
            <div>
              <select
                className="select w-full"
                name="diagnosis_id"
                value={form.diagnosis_id ?? ''}
                onChange={handleInputChange}
              >
                <option value="">Select Diagnosis</option>
                {data.map((diagnosis: DiagnosisItem) => (
                  <option key={diagnosis.id} value={diagnosis.id}>
                    {diagnosis.label}
                  </option>
                ))}
              </select>
              {fieldError(errors, 'diagnosis_id') && (
                <span className="mt-2 text-sm text-error">
                  {fieldError(errors, 'diagnosis_id')}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 lg:gap-4">
          <h1 className="font-semibold">Account</h1>
          <div className="flex flex-col gap-4">
            <input
              className="input w-full"
              type="email"
              value={form.email}
              placeholder="Email"
              readOnly
              disabled
            />
            <div>
              <input
                className="input w-full"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleInputChange}
              />
              {fieldError(errors, 'password') && (
                <span className="mt-2 text-sm text-error">
                  {fieldError(errors, 'password')}
                </span>
              )}
            </div>
            <div>
              <input
                className="input w-full"
                type="password"
                name="password_confirmation"
                placeholder="Confirm Password"
                value={form.password_confirmation}
                onChange={handleInputChange}
              />
              {fieldError(errors, 'password_confirmation') && (
                <span className="mt-2 text-sm text-error">
                  {fieldError(errors, 'password_confirmation')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            className="btn btn-ghost flex-1"
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'Activating...' : 'Activate Account'}
          </button>
        </div>
      </form>
    </div>
  )
}
