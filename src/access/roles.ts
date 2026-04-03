import type { Access, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

type Role = 'admin' | 'editor' | 'staff' | 'customer'

export const hasRole = (user: User | null | undefined, roles: Role[]): boolean => {
  if (!user) return false
  return roles.includes((user.role as Role) ?? 'customer')
}

export const isAdmin: Access<User> = ({ req: { user } }) => {
  return hasRole(user, ['admin'])
}

export const isAdminOrEditor: Access<User> = ({ req: { user } }) => {
  return hasRole(user, ['admin', 'editor'])
}

export const canAccessAdmin: Access<User> = ({ req: { user } }) => {
  return hasRole(user, ['admin', 'editor', 'staff'])
}

export const staffReadOnly: Access<User> = ({ req: { user } }) => {
  return hasRole(user, ['admin', 'editor', 'staff'])
}

export const adminFieldAccess: FieldAccess<User> = ({ req: { user } }) => {
  return hasRole(user, ['admin'])
}

export const adminOrEditorFieldAccess: FieldAccess<User> = ({ req: { user } }) => {
  return hasRole(user, ['admin', 'editor'])
}
