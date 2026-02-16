export interface Otp {
  id: number;
  user_id: string;
  otp_code?: string;
  purpose?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}
