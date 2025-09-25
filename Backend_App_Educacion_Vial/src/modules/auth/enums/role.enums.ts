// Re-export Role enum from Prisma to maintain consistency with database schema
import { RolesEnum } from '@prisma/client';
export { RolesEnum as Role };

// Utility function for runtime role validation and type narrowing
export const isValidRole = (role: string): role is RolesEnum => {
  return Object.values(RolesEnum).includes(role as RolesEnum);
};

// Role hierarchy for authorization logic (optional)
export const ROLE_HIERARCHY = {
  [RolesEnum.ADMIN]: 2,
  [RolesEnum.CHILD]: 1,
} as const;

// Helper to check if a role has sufficient permissions
export const hasMinimumRole = (
  userRole: RolesEnum,
  requiredRole: RolesEnum,
): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};
