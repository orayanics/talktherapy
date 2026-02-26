// User Properties shared across all user types
export type UserType = 'sudo' | 'admin' | 'clinician' | 'patient'
export type User = UserSuperAdmin | UserAdmin | UserClinician | UserPatient
export type ISODateString = string

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
  PENDING = 'pending',
}

export type Permission =
  | 'users:create'
  | 'users:read'
  | 'users:update'
  | 'users:delete'
  | 'content:create'
  | 'content:read'
  | 'system:maintenance'

export interface UserInformation {
  firstName: string
  lastName: string
  profileUrl?: string
}

// Base User Client Interface
export interface UserBase {
  id: string
  email: string
  status: AccountStatus
  information: UserInformation
  createdAt: ISODateString
  updatedAt: ISODateString
  lastLogin?: ISODateString

  // audit
  deletedAt?: ISODateString // soft delete
  createdBy?: string // user id or system
  updatedBy?: string // user id or system
}

// Extended user model for super admin view:
export interface UserSuperAdmin extends UserBase {
  superAdminCode: string
}

// Extended user model for admin view:
export interface UserAdmin extends UserBase {
  permissions: Permission[]
}

// Use UserBase as base
export interface UserPatient extends UserBase {
  information: UserBase['information'] & {
    dateOfBirth: ISODateString
  }

  diagnosisId: string // links to diagnosis table
  consent: boolean
  bookmarkedContent?: string[]
}

// Extended user model for clinician view:
export interface UserClinician extends UserBase {
  specialtyId: string // links to specialty table
  assignedPatients?: string[] // Array of patient user IDs
}
