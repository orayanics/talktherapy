import type { ActivateAccountPayload } from './credentials'
import type { ParsedError } from './system'

export interface DiagnosisItem {
  id: string
  value: string
  label: string
}

export interface RegisterDiagnosis {
  data: Array<DiagnosisItem>
}

export type RegisterActivateStep = 'verify' | 'form'

export interface RegisterOtpForm {
  email: string
  otpCode: string
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onOtpChange: (digits: Array<string>) => void
  errors: ParsedError | null
}

export interface RegisterProfileForm {
  form: Pick<
    ActivateAccountPayload,
    'name' | 'email' | 'password' | 'password_confirmation' | 'diagnosis_id'
  >
  data: Array<DiagnosisItem>
  errors: ParsedError | null
  isLoading: boolean
  accountRole: string | null
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onSubmit: () => void
  onBack: () => void
}
