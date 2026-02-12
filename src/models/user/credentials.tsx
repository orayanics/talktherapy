export interface LoginPayload {
  email: string;
  password: string;
}

export interface PatientRegisterPayload {
  name: string;
  diagnosis_id: string;
  email: string;
  password: string;
  password_confirmation: string;
  consent: boolean;
}
