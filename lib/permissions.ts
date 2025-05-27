// lib/permissions.ts

// Определяем типы ролей пользователей
export type UserRole = 'super-admin' | 'admin' | 'manager' | 'trainer' | 'member' | 'client';

// Определяем ресурсы системы
export type Resource = 
  | 'users' 
  | 'trainers' 
  | 'clients' 
  | 'schedule' 
  | 'analytics' 
  | 'notifications' 
  | 'settings' 
  | 'billing' 
  | 'reports'
  | 'system';

// Определяем возможные действия
export type Action = 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'manage' | 'maintenance';

// Иерархия ролей (чем больше число, тем выше роль)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'client': 1,
  'member': 1,
  'trainer': 2,
  'manager': 3,
  'admin': 4,
  'super-admin': 5
};

// Матрица разрешений для каждой роли
export const permissions: Record<UserRole, Record<Resource, Action[]>> = {
  'super-admin': {
    users: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import'],
    trainers: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import'],
    clients: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import'],
    schedule: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import'],
    analytics: ['read', 'export', 'import', 'manage'],
    notifications: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import'],
    settings: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import'],
    billing: ['create', 'read', 'update', 'delete', 'export', 'import', 'manage'],
    reports: ['create', 'read', 'export', 'import', 'manage'],
    system: ['maintenance', 'manage', 'export', 'import']
  },
  admin: {
    users: ['create', 'read', 'update', 'delete', 'export', 'import'],
    trainers: ['create', 'read', 'update', 'delete', 'export', 'import'],
    clients: ['create', 'read', 'update', 'delete', 'export', 'import'],
    schedule: ['create', 'read', 'update', 'delete', 'export', 'import'],
    analytics: ['read', 'export', 'import'],
    notifications: ['create', 'read', 'update', 'delete', 'export', 'import'],
    settings: ['read', 'update', 'export', 'import'],
    billing: ['read', 'update', 'export', 'import'],
    reports: ['create', 'read', 'export', 'import'],
    system: ['maintenance', 'export', 'import']
  },
  manager: {
    users: ['read', 'export'],
    trainers: ['read', 'update', 'export'],
    clients: ['create', 'read', 'update', 'export', 'import'],
    schedule: ['create', 'read', 'update', 'delete', 'export', 'import'],
    analytics: ['read', 'export'],
    notifications: ['create', 'read', 'export'],
    settings: ['read', 'export'],
    billing: ['read', 'export'],
    reports: ['read', 'export'],
    system: ['export']
  },
  trainer: {
    users: [],
    trainers: ['read', 'export'],
    clients: ['read', 'update', 'export'],
    schedule: ['read', 'update', 'export'],
    analytics: [],
    notifications: ['read'],
    settings: ['read'],
    billing: [],
    reports: ['read', 'export'],
    system: []
  },
  member: {
    users: [],
    trainers: ['read'],
    clients: ['read', 'export'],
    schedule: ['read', 'export'],
    analytics: [],
    notifications: ['read'],
    settings: ['read', 'export'],
    billing: ['read', 'export'],
    reports: [],
    system: []
  },
  client: {
    users: [],
    trainers: ['read'],
    clients: ['read', 'export'],
    schedule: ['read', 'export'],
    analytics: [],
    notifications: ['read'],
    settings: ['read', 'export'],
    billing: ['read', 'export'],
    reports: [],
    system: []
  }
};

// Экспорт PERMISSIONS как алиас для permissions (для совместимости)
export const PERMISSIONS = permissions;

// Функция для проверки разрешений с проверкой на undefined
export const hasPermission = (
  userRole: UserRole | undefined, 
  resource: Resource, 
  action: Action
): boolean => {
  if (!userRole) return false;
  
  const rolePermissions = permissions[userRole];
  if (!rolePermissions) return false;
  
  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;
  
  return resourcePermissions.includes(action);
};

// Функция для проверки доступа к объектам с учетом владения
export const canAccessObject = (
  userRole: UserRole | undefined,
  userId: string | undefined,
  ownerId: string | undefined,
  resource: Resource,
  action: Action
): boolean => {
  if (!userRole || !userId) return false;
  
  // Супер-админы и админы имеют доступ ко всему
  if (userRole === 'super-admin' || userRole === 'admin') {
    return hasPermission(userRole, resource, action);
  }
  
  // Если нет владельца, проверяем только базовые права
  if (!ownerId) {
    return hasPermission(userRole, resource, action);
  }
  
  // Проверяем, является ли пользователь владельцем объекта
  const isOwner = userId === ownerId;
  
  // Если пользователь владелец, разрешаем операции чтения, обновления и экспорта
  if (isOwner && (action === 'read' || action === 'update' || action === 'export')) {
    return true;
  }
  
  // Для остальных случаев проверяем базовые права
  return hasPermission(userRole, resource, action);
};

// Функция для проверки возможности управления ролью
export const canManageRole = (
  userRole: UserRole | undefined,
  targetRole: UserRole
): boolean => {
  if (!userRole) return false;
  
  // Супер-админ может управлять всеми ролями
  if (userRole === 'super-admin') return true;
  
  // Админ может управлять всеми кроме супер-админа
  if (userRole === 'admin' && targetRole !== 'super-admin') return true;
  
  // Менеджер может управлять тренерами и клиентами
  if (userRole === 'manager' && ['trainer', 'client', 'member'].includes(targetRole)) return true;
  
  return false;
};

// Функция для получения ролей, которые пользователь может создавать
export const getCreatableRoles = (userRole: UserRole | undefined): UserRole[] => {
  if (!userRole) return [];
  
  switch (userRole) {
    case 'super-admin':
      return ['admin', 'manager', 'trainer', 'client', 'member'];
    case 'admin':
      return ['manager', 'trainer', 'client', 'member'];
    case 'manager':
      return ['trainer', 'client', 'member'];
    default:
      return [];
  }
};

// Функция для фильтрации данных по правам доступа
export const filterDataByPermissions = <T extends { 
  role?: string; 
  trainerId?: string; 
  clientId?: string; 
  ownerId?: string;
}>(
  data: T[], 
  userRole: UserRole | undefined, 
  userId: string | undefined, 
  resource: Resource
): T[] => {
  if (!userRole || !userId) return [];
  
  // Супер-админы и админы видят все
  if (userRole === 'super-admin' || userRole === 'admin') {
    return data;
  }
  
  return data.filter(item => {
    // Менеджеры видят все кроме админов
    if (userRole === 'manager') {
      if (item.role && ['super-admin', 'admin'].includes(item.role)) {
        return false;
      }
      return true;
    }
    
    // Тренеры видят только своих клиентов и свои данные
    if (userRole === 'trainer') {
      if (item.trainerId === userId || item.ownerId === userId) {
        return true;
      }
      // Тренеры могут видеть других тренеров (для справочной информации)
      if (resource === 'trainers') {
        return true;
      }
      return false;
    }
    
    // Клиенты и участники видят только свои данные
    if (userRole === 'client' || userRole === 'member') {
      return item.ownerId === userId || item.clientId === userId;
    }
    
    return false;
  });
};

// Функция для получения всех разрешений пользователя
export const getUserPermissions = (userRole: UserRole | undefined): Record<Resource, Action[]> => {
  if (!userRole) return {} as Record<Resource, Action[]>;
  return permissions[userRole] || {} as Record<Resource, Action[]>;
};

// Функция для проверки, является ли пользователь администратором
export const isAdmin = (userRole: UserRole | undefined): boolean => {
  return userRole === 'super-admin' || userRole === 'admin';
};

// Функция для проверки, является ли пользователь супер-администратором
export const isSuperAdmin = (userRole: UserRole | undefined): boolean => {
  return userRole === 'super-admin';
};

// Функция для проверки, может ли пользователь управлять другими пользователями
export const canManageUsers = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'users', 'create') || 
         hasPermission(userRole, 'users', 'update') || 
         hasPermission(userRole, 'users', 'delete');
};

// Функция для проверки, может ли пользователь видеть аналитику
export const canViewAnalytics = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'analytics', 'read');
};

// Функция для проверки, может ли пользователь управлять расписанием
export const canManageSchedule = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'schedule', 'create') || 
         hasPermission(userRole, 'schedule', 'update') || 
         hasPermission(userRole, 'schedule', 'delete');
};

// Функция для проверки системного доступа
export const canPerformMaintenance = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'system', 'maintenance');
};

// Функция для проверки прав на импорт/экспорт
export const canExportData = (userRole: UserRole | undefined, resource: Resource): boolean => {
  return hasPermission(userRole, resource, 'export');
};

export const canImportData = (userRole: UserRole | undefined, resource: Resource): boolean => {
  return hasPermission(userRole, resource, 'import');
};

// Функция для проверки системного импорта/экспорта
export const canExportSystemData = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'system', 'export');
};

export const canImportSystemData = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'system', 'import');
};

// Функция для получения уровня доступа пользователя (для UI)
export const getAccessLevel = (userRole: UserRole | undefined): 'full' | 'limited' | 'read-only' | 'none' => {
  if (!userRole) return 'none';
  
  switch (userRole) {
    case 'super-admin':
      return 'full';
    case 'admin':
      return 'full';
    case 'manager':
      return 'limited';
    case 'trainer':
      return 'read-only';
    case 'member':
    case 'client':
      return 'read-only';
    default:
      return 'none';
  }
};

// Константы для проверки ролей
export const ADMIN_ROLES: UserRole[] = ['super-admin', 'admin'];
export const STAFF_ROLES: UserRole[] = ['super-admin', 'admin', 'manager', 'trainer'];
export const CLIENT_ROLES: UserRole[] = ['member', 'client'];

// Функции для проверки категорий ролей
export const isStaff = (userRole: UserRole | undefined): boolean => {
  return userRole ? STAFF_ROLES.includes(userRole) : false;
};

export const isClient = (userRole: UserRole | undefined): boolean => {
  return userRole ? CLIENT_ROLES.includes(userRole) : false;
};

// Экспорт для использования в middleware
export const checkPermission = (userRole: UserRole | undefined, resource: Resource, action: Action) => {
  return hasPermission(userRole, resource, action);
};

// Функция для проверки доступа к конкретному ресурсу с учетом владения
export const checkResourceAccess = (
  userRole: UserRole | undefined,
  userId: string | undefined,
  resource: Resource,
  action: Action,
  resourceOwnerId?: string
): boolean => {
  // Проверяем базовые права
  if (!hasPermission(userRole, resource, action)) {
    return false;
  }
  
  // Если нет информации о владельце, разрешаем доступ
  if (!resourceOwnerId) {
    return true;
  }
  
  // Используем функцию canAccessObject
  return canAccessObject(userRole, userId, resourceOwnerId, resource, action);
};

// Функция для получения ресурсов, к которым пользователь имеет доступ
export const getAccessibleResources = (userRole: UserRole | undefined): Resource[] => {
  if (!userRole) return [];
  
  const userPermissions = getUserPermissions(userRole);
  return Object.keys(userPermissions).filter(resource => 
    userPermissions[resource as Resource].length > 0
  ) as Resource[];
};

// Функция для проверки, может ли пользователь выполнить действие над рес
