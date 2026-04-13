import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  content: ["create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

// Must have all permissions
export const superadmin = ac.newRole({
  ...adminAc.statements,
  content: ["create", "share", "update", "delete"],
});

// Admin can manage users and content, but cannot impersonate or manage sessions
export const admin = ac.newRole({
  user: ["create", "list", "set-role", "ban", "delete", "set-password"],
  content: ["create", "share", "update", "delete"],
});

// Clinician and patient can only read content, no other permissions
export const clinician = ac.newRole({
  content: ["share"],
});

export const patient = ac.newRole({
  content: ["share"],
});
