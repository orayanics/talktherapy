export interface Permissions {
  'users:create': boolean
  'users:read': boolean
  'users:update': boolean
  'users:delete': boolean
  'content:create': boolean
  'content:read': boolean
  'content:update': boolean
  'content:delete': boolean
  'system:maintenance': boolean
}

export enum PermissionKey {
  USERS_CREATE = 'users:create',
  USERS_READ = 'users:read',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',
  CONTENT_CREATE = 'content:create',
  CONTENT_READ = 'content:read',
  CONTENT_UPDATE = 'content:update',
  CONTENT_DELETE = 'content:delete',
  SYSTEM_MAINTENANCE = 'system:maintenance',
}

// map permission keys to human readable labels
export const PermissionLabels: Record<PermissionKey, string> = {
  [PermissionKey.USERS_CREATE]: 'Create Users',
  [PermissionKey.USERS_READ]: 'Read Users',
  [PermissionKey.USERS_UPDATE]: 'Update Users',
  [PermissionKey.USERS_DELETE]: 'Delete Users',
  [PermissionKey.CONTENT_CREATE]: 'Create Content',
  [PermissionKey.CONTENT_READ]: 'Read Content',
  [PermissionKey.CONTENT_UPDATE]: 'Update Content',
  [PermissionKey.CONTENT_DELETE]: 'Delete Content',
  [PermissionKey.SYSTEM_MAINTENANCE]: 'System Maintenance',
}
