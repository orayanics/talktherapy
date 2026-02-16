export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  created_at: string;
  updated_at: string;
  account_status?: string;
  account_role?: string;
  account_type?: string;
  account_json?: string;
  created_by?: string;
  updated_by?: string;
  deleted_at?: string;
}
export interface Sudo {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}
export interface Admin {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}
export interface Patient {
  id: string;
  user_id: string;
  diagnosis_id?: string;
  consent?: string;
  created_at: string;
  updated_at: string;
}
export interface Clinician {
  id: string;
  user_id: string;
  diagnosis_id?: string;
  created_at: string;
  updated_at: string;
}
