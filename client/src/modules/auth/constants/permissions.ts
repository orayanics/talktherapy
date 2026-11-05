export enum PermissionKey {
  USERS_CREATE = 'user.create',
  USERS_READ = 'user.read',
  USERS_UPDATE = 'user.update',
  USERS_DELETE = 'user.delete',
  CONTENT_CREATE = 'content.create',
  CONTENT_READ = 'content.read',
  CONTENT_UPDATE = 'content.update',
  CONTENT_DELETE = 'content.delete',
  SYSTEM_MAINTENANCE = 'system.audit',
}

export type Permissions = Record<PermissionKey, boolean>

export const PermissionLabels: Record<PermissionKey, string> = {
  [PermissionKey.USERS_CREATE]: 'Create Users',
  [PermissionKey.USERS_READ]: 'Read Users',
  [PermissionKey.USERS_UPDATE]: 'Update Users',
  [PermissionKey.USERS_DELETE]: 'Delete Users',
  [PermissionKey.CONTENT_CREATE]: 'Create Content',
  [PermissionKey.CONTENT_READ]: 'Read Content',
  [PermissionKey.CONTENT_UPDATE]: 'Update Content',
  [PermissionKey.CONTENT_DELETE]: 'Delete Content',
  [PermissionKey.SYSTEM_MAINTENANCE]: 'System Audit',
}
