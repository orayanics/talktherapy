export interface LoginPayload {
  email: string
  password: string
}

export interface PatientRegisterPayload {
  name: string
  diagnosis_id: string
  email: string
  password: string
  password_confirmation: string
  consent: boolean
}

export interface ClinicianRegisterPayload {
  email: string
}

export interface AdminRegisterPayload {
  email: string
  abilities: string[]
}

export interface UpdateUserPayload {
  name?: string
}

export interface UpdatePasswordPayload {
  current_password: string
  new_password: string
  new_password_confirmation: string
}
