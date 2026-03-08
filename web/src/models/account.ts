export type ACCOUNT_STATUS =
  | 'active'
  | 'pending'
  | 'suspended'
  | 'deactivated'
  | 'inactive'

export type ACCOUNT_ROLE = 'patient' | 'clinician' | 'admin' | 'sudo'

export type ACCOUNT_PERMISSIONS =
  | 'users:create'
  | 'users:read'
  | 'users:update'
  | 'users:delete'
  | 'content:create'
  | 'content:read'
  | 'content:update'
  | 'content:delete'
  | 'system:maintenance'
export type ACCOUNT_PERMISSIONS_ARRAY = Array<ACCOUNT_PERMISSIONS>
