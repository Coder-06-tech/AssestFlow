export const ROLES = {
  ADMIN: 'ADMIN',
  ASSET_MANAGER: 'ASSET_MANAGER',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  EMPLOYEE: 'EMPLOYEE'
};

export const PERMISSIONS = {
  VIEW_ORG_SETUP: [ROLES.ADMIN],
  MANAGE_ORG_SETUP: [ROLES.ADMIN],
  PROMOTE_EMPLOYEES: [ROLES.ADMIN],
  VIEW_ANALYTICS: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD],
  MANAGE_ASSETS: [ROLES.ADMIN, ROLES.ASSET_MANAGER],
  BOOK_ASSETS: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE]
};

/**
 * Checks if a given user role is permitted to perform an action.
 * @param {string} userRole 
 * @param {string} permission 
 * @returns {boolean}
 */
export const hasPermission = (userRole, permission) => {
  if (!userRole) return false;
  if (userRole === ROLES.ADMIN) return true; // Admin overrides everything

  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
};
