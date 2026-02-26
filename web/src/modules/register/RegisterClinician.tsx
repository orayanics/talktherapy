import { useState } from 'react'
import { Link, useBlocker } from '@tanstack/react-router'
import ModalBlockNavigation from '~/components/Modal/ModalBlockNavigation'

export default function RegisterClinician() {
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleVerification() {
    // async simulation
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsLoading(false)
    setIsVerified(true)
  }

  return (
    <div className="container flex flex-col items-center gap-4 mx-auto">
      {isVerified ? <ClinicianForm /> : <ClinicianVerification />}

      {!isVerified && (
        <button
          className="btn btn-primary w-full mt-4"
          onClick={handleVerification}
          disabled={isLoading || isVerified}
        >
          Simulate Verification
        </button>
      )}
      <Link to="/login">
        I already have an account.{' '}
        <span className="link link-hover">Login here.</span>
      </Link>
    </div>
  )
}

function ClinicianVerification() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-semibold">Clinician Verification</h1>
      <p>
        Enter the 6-digit verification code sent to your email to continue to
        clinician account creation.
      </p>
      <div className="flex flex-row justify-center gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            className="input w-full h-11 text-center text-md lg:text-xl"
          />
        ))}
      </div>
    </div>
  )
}

function ClinicianForm() {
  const [formIsDirty, setFormIsDirty] = useState(false)

  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => formIsDirty,
    enableBeforeUnload: formIsDirty,
    withResolver: true,
  })

  const handleInputChange = () => {
    if (!formIsDirty) {
      setFormIsDirty(true)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert('Form submitted!')
    setFormIsDirty(false)
  }

  return (
    <div className="mx-auto w-full">
      {status === 'blocked' && (
        <ModalBlockNavigation isOpen={true} onProceed={proceed} onReset={reset}>
          <p className="text-gray-700 mb-6">
            You have unsaved changes. Exiting will require you to have another
            activation code. Are you sure you want to leave this page?
          </p>
        </ModalBlockNavigation>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-1 lg:gap-4">
        <ClinicianPersonalForm onChange={handleInputChange} />
        <ClinicianAccountForm onChange={handleInputChange} />
        <button type="submit" className="btn btn-primary mt-4">
          Submit
        </button>
      </form>
    </div>
  )
}

function ClinicianPersonalForm({ onChange }: { onChange: VoidFunction }) {
  const SPECIALTY_OPTIONS = [
    'Psychologist',
    'Psychiatrist',
    'Therapist',
    'Counselor',
    'Social Worker',
    'Other',
  ]

  return (
    <div className="flex flex-col gap-1 lg:gap-4">
      <h1 className="font-semibold">Personal Information</h1>
      <div className="flex flex-col gap-4">
        <input
          className="input w-full"
          type="text"
          placeholder="Full Name"
          onChange={onChange}
        />

        <select className="input w-full" defaultValue="" onChange={onChange}>
          <option value="" disabled>
            Select Specialty
          </option>
          {SPECIALTY_OPTIONS.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function ClinicianAccountForm({ onChange }: { onChange: VoidFunction }) {
  return (
    <div className="flex flex-col gap-1 lg:gap-4">
      <h1 className="font-semibold">Account</h1>
      <div className="flex flex-col gap-4">
        <input
          className="input w-full "
          type="email"
          placeholder="Email"
          onChange={onChange}
        />
        <input
          className="input w-full"
          type="password"
          placeholder="Password"
          onChange={onChange}
        />
        <input
          className="input w-full"
          type="password"
          placeholder="Confirm Password"
          onChange={onChange}
        />
      </div>
    </div>
  )
}
