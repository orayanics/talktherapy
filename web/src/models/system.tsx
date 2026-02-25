export interface LogsClient {
  id: string;
  timestamp: Date;
  userId: string; // Reference to user table
  action: string;
  details?: string;
}

export interface NotificationClient {
  id: string;
  showTo: {
    users?: string[]; // Array of user IDs
  };
  title: string;
  message: string;
  type: "info" | "warning" | "alert";
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Laravel API Response
export interface ResponseData {
  data: string[];
}

export interface ErrorResponse {
  message?: string | { code: number; response: string };
  errors?: Record<string, string[]>;
}

export interface TableResponse<T = unknown> {
  current_page?: number;
  data: T[];
  total?: number;
  last_page?: number;
  from?: number | null;
  to?: number | null;
  per_page?: number;
}

export type UsersParams = {
  search?: string;
  account_status?: string[];
  account_role?: string[];
  page?: number;
  perPage?: number;
};

export type UsersTableProps = {
  data: TableResponse | null;
  page: number;
  perPage: number;
  status: string[];
  role: string[];
  search: string;
  isLoading: boolean;
  isAdmin: boolean;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onStatusChange: (status: string[]) => void;
  onRoleChange: (role: string[]) => void;
  onSearchChange: (search: string) => void;
  onClearFilters: () => void;
};

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  account_status: "active" | "inactive" | "pending" | "suspended";
  account_role: "sudo" | "admin" | "clinician" | "patient";
  account_permissions: string[] | null;
  account_icon: string | null;
  created_by: string;
  updated_by: string | null;
  deleted_at: string | null;
}
