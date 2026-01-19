// Common user model definition:
export interface UserClient {
  id: string;
  username: string;
  email: string;
  information: {
    firstName: string;
    lastName: string;
    profileUrl?: string;
  };
  accountStatus: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

// Extended user model for super admin view:
export interface UserSuperAdmin extends UserClient {}

// Extended user model for admin view:
export interface UserAdmin extends UserClient {
  permissions: string[];
}

// Use UserClient as base
export interface UserPatient extends UserClient {
  information: UserClient["information"] & {
    dateOfBirth: Date;
  };

  diagnosis: string;
  consent: boolean;
  bookmarkedContent?: string[];
}

// Extended user model for clinician view:
export interface UserClinician extends UserClient {
  specialty: string;
}

// Account creation fields
export interface UserAccountCreation {
  username: string;
  email: string;
  password: string;
}
