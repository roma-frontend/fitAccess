// hooks/usePermissions.ts
"use client";

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  hasPermission, 
  canManageRole, 
  getCreatableRoles,
  filterDataByPermissions,
  canAccessObject,
  UserRole, 
  Resource, 
  Action,
  ROLE_HIERARCHY,
  PERMISSIONS 
} from '@/lib/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    const userRole = user?.role as UserRole | undefined;
    const userId = user?.id;

    return {
      // Базовые проверки прав
      can: (resource: Resource, action: Action) => 
        hasPermission(userRole, resource, action),

      // Проверка доступа к объекту
      canAccess: (objectOwnerId: string | undefined, resource: Resource, action: Action) =>
        canAccessObject(userRole, userId, objectOwnerId, resource, action),

      // Управление ролями
      canManage: (targetRole: UserRole) => 
        canManageRole(userRole, targetRole),

      // hooks/usePermissions.ts (продолжение)
      creatableRoles: getCreatableRoles(userRole),

      // Фильтрация данных
      filterData: <T extends { role?: string; trainerId?: string; clientId?: string; ownerId?: string }>(
        data: T[], 
        resource: Resource
      ) => filterDataByPermissions(data, userRole, userId, resource),

      // Проверка уровня доступа
      hasHigherRole: (targetRole: UserRole) => {
        if (!userRole) return false;
        return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole];
      },

      // Проверка равного уровня доступа
      hasEqualRole: (targetRole: UserRole) => {
        if (!userRole) return false;
        return ROLE_HIERARCHY[userRole] === ROLE_HIERARCHY[targetRole];
      },

      // Получение уровня пользователя
      getUserLevel: () => userRole ? ROLE_HIERARCHY[userRole] : 0,

      // Проверка на роли (исправлено для существующих ролей)
      isAdmin: () => userRole === 'admin',
      isManager: () => userRole === 'manager',
      isTrainer: () => userRole === 'trainer',
      isClient: () => userRole === 'client',

      // Текущая роль и ID пользователя
      currentRole: userRole,
      currentUserId: userId,

      // Проверка множественных прав
      canAny: (checks: Array<{ resource: Resource; action: Action }>) =>
        checks.some(({ resource, action }) => hasPermission(userRole, resource, action)),

      canAll: (checks: Array<{ resource: Resource; action: Action }>) =>
        checks.every(({ resource, action }) => hasPermission(userRole, resource, action)),

      // Получение всех прав для ресурса
      getResourcePermissions: (resource: Resource) => {
        if (!userRole) return [];
        const permissions = PERMISSIONS[userRole];
        return permissions[resource] || [];
      },

      // Проверка на владельца объекта
      isOwner: (objectOwnerId: string | undefined) => objectOwnerId === userId,

      // Проверка на персонал
      isStaff: () => userRole ? ['admin', 'manager', 'trainer'].includes(userRole) : false,

      // Проверка на управленческие роли
      isManagement: () => userRole ? ['admin', 'manager'].includes(userRole) : false
    };
  }, [user?.role, user?.id]);

  return permissions;
};

// Специализированные хуки для конкретных ресурсов
export const useUserPermissions = () => {
  const permissions = usePermissions();
  
  return {
    canCreateUser: permissions.can('users', 'create'),
    canEditUser: permissions.can('users', 'update'),
    canDeleteUser: permissions.can('users', 'delete'),
    canViewUsers: permissions.can('users', 'read'),
    canExportUsers: permissions.can('users', 'export'),
    canImportUsers: permissions.can('users', 'import'),
    creatableRoles: permissions.creatableRoles,
    canManageRole: permissions.canManage,
    canEditOwnProfile: (userId: string) => 
      permissions.isOwner(userId) || permissions.isManagement()
  };
};

export const useTrainerPermissions = () => {
  const permissions = usePermissions();
  
  return {
    canCreateTrainer: permissions.can('trainers', 'create'),
    canEditTrainer: permissions.can('trainers', 'update'),
    canDeleteTrainer: permissions.can('trainers', 'delete'),
    canViewTrainers: permissions.can('trainers', 'read'),
    canExportTrainers: permissions.can('trainers', 'export'),
    canEditOwnProfile: (trainerId: string) => 
      permissions.isTrainer() && permissions.isOwner(trainerId),
    canViewTrainerDetails: (trainerId: string) =>
      permissions.isManagement() || permissions.isOwner(trainerId)
  };
};

export const useClientPermissions = () => {
  const permissions = usePermissions();
  
  return {
    canCreateClient: permissions.can('clients', 'create'),
    canEditClient: permissions.can('clients', 'update'),
    canDeleteClient: permissions.can('clients', 'delete'),
    canViewClients: permissions.can('clients', 'read'),
    canExportClients: permissions.can('clients', 'export'),
    canEditOwnProfile: (clientId: string) => 
      permissions.isClient() && permissions.isOwner(clientId),
    canViewClientDetails: (clientId: string) =>
      permissions.isManagement() || 
      permissions.isTrainer() || 
      permissions.isOwner(clientId)
  };
};

export const useSchedulePermissions = () => {
  const permissions = usePermissions();
  
  return {
    canCreateEvent: permissions.can('schedule', 'create'),
    canEditEvent: permissions.can('schedule', 'update'),
    canDeleteEvent: permissions.can('schedule', 'delete'),
    canViewSchedule: permissions.can('schedule', 'read'),
    canExportSchedule: permissions.can('schedule', 'export'),
    canEditOwnEvents: (trainerId: string) => 
      permissions.isTrainer() && permissions.isOwner(trainerId),
    canViewAllSchedule: () => permissions.isManagement(),
    canBookSession: () => permissions.isClient(),
    canCancelSession: (ownerId: string) => 
      permissions.isOwner(ownerId) || permissions.isManagement()
  };
};

export const useAnalyticsPermissions = () => {
  const permissions = usePermissions();
  
  return {
    canViewAnalytics: permissions.can('analytics', 'read'),
    canExportAnalytics: permissions.can('analytics', 'export'),
    canViewOwnAnalytics: () => true, // Все могут видеть свою аналитику
    canViewTeamAnalytics: () => permissions.isStaff(),
    canViewAllAnalytics: () => permissions.isManagement()
  };
};

export const useSystemPermissions = () => {
  const permissions = usePermissions();
  
  return {
    canMaintainSystem: permissions.can('system', 'maintenance'),
    canManageSystem: permissions.can('system', 'manage'),
    canViewSettings: permissions.can('settings', 'read'),
    canEditSettings: permissions.can('settings', 'update'),
    canManageSettings: permissions.can('settings', 'manage'),
    canBackupData: () => permissions.isAdmin(),
    canRestoreData: () => permissions.isAdmin(),
    canViewLogs: () => permissions.isManagement()
  };
};

export const useReportPermissions = () => {
  const permissions = usePermissions();
  
  return {
    canCreateReport: permissions.can('reports', 'create'),
    canViewReports: permissions.can('reports', 'read'),
    canExportReports: permissions.can('reports', 'export'),
    canViewOwnReports: () => true, // Все могут видеть свои отчеты
    canViewAllReports: () => permissions.isManagement(),
    canGenerateSystemReports: () => permissions.isManagement()
  };
};

export const useNotificationPermissions = () => {
  const permissions = usePermissions();
  
  return {
    canCreateNotification: permissions.can('notifications', 'create'),
    canViewNotifications: permissions.can('notifications', 'read'),
    canEditNotifications: permissions.can('notifications', 'update'),
    canDeleteNotifications: permissions.can('notifications', 'delete'),
    canSendBulkNotifications: () => permissions.isManagement(),
    canManageNotificationSettings: () => permissions.isStaff()
  };
};

// Хук для проверки доступа к конкретным страницам
export const usePagePermissions = () => {
  const permissions = usePermissions();
  
  return {
    canAccessAdminPanel: () => permissions.isAdmin(),
    canAccessManagerPanel: () => permissions.isManagement(),
    canAccessTrainerPanel: () => permissions.isStaff(),
    canAccessUserManagement: () => permissions.can('users', 'read'),
    canAccessAnalytics: () => permissions.can('analytics', 'read'),
    canAccessSystemSettings: () => permissions.can('system', 'manage'),
    canAccessReports: () => permissions.can('reports', 'read'),
    canAccessScheduleManagement: () => permissions.can('schedule', 'manage')
  };
};

// Хук для получения отфильтрованных данных
export const useFilteredData = <T extends { 
  role?: string; 
  trainerId?: string; 
  clientId?: string;
  ownerId?: string;
}>(data: T[], resource: Resource) => {
  const permissions = usePermissions();
  
  return useMemo(() => {
    return permissions.filterData(data, resource);
  }, [data, resource, permissions]);
};

// Хук для проверки доступа к объекту
export const useObjectAccess = (
  objectOwnerId: string | undefined, 
  resource: Resource, 
  action: Action
) => {
  const permissions = usePermissions();
  
  return useMemo(() => {
    return permissions.canAccess(objectOwnerId, resource, action);
  }, [objectOwnerId, resource, action, permissions]);
};

// Хук для получения доступных действий для ресурса
export const useAvailableActions = (resource: Resource) => {
  const permissions = usePermissions();
  
  return useMemo(() => {
    const actions: Action[] = ['create', 'read', 'update', 'delete', 'export', 'import'];
    return actions.filter(action => permissions.can(resource, action));
  }, [resource, permissions]);
};

