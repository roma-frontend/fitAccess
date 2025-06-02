// app/admin/users/providers/UsersPageProvider.tsx (полная версия)
"use client";

import { createContext, useContext, useReducer, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole, CreateUserData, UpdateUserData } from "@/types/user";
import { canCreateUsers, canUpdateUsers, canDeleteUsers, canManageUser } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/use-confirm";
import { Trash2, UserX, UserCheck } from "lucide-react";

// ✅ Состояние страницы пользователей
interface UsersPageState {
  users: User[];
  loading: boolean;
  userRole: UserRole;
  editingUser: User | null;
  showCreateDialog: boolean;
  searchTerm: string;
  roleFilter: UserRole | 'all';
  statusFilter: 'all' | 'active' | 'inactive';
  selectedUsers: string[];
  bulkActionLoading: boolean;
  error: string | null;
  lastSync: Date | null;
}

// ✅ Действия для reducer
type UsersPageAction = 
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER_ROLE'; payload: UserRole }
  | { type: 'SET_EDITING_USER'; payload: User | null }
  | { type: 'SET_SHOW_CREATE_DIALOG'; payload: boolean }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_ROLE_FILTER'; payload: UserRole | 'all' }
  | { type: 'SET_STATUS_FILTER'; payload: 'all' | 'active' | 'inactive' }
  | { type: 'SET_SELECTED_USERS'; payload: string[] }
  | { type: 'TOGGLE_USER_SELECTION'; payload: string }
  | { type: 'SELECT_ALL_USERS'; payload: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_BULK_ACTION_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: { id: string; updates: Partial<User> } }
  | { type: 'REMOVE_USER'; payload: string }
  | { type: 'BULK_UPDATE_USERS'; payload: { userIds: string[]; updates: Partial<User> } };

// ✅ Reducer функция
const usersPageReducer = (state: UsersPageState, action: UsersPageAction): UsersPageState => {
  switch (action.type) {
    case 'SET_USERS':
      return { ...state, users: action.payload, error: null };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_USER_ROLE':
      return { ...state, userRole: action.payload };
    
    case 'SET_EDITING_USER':
      return { ...state, editingUser: action.payload };
    
    case 'SET_SHOW_CREATE_DIALOG':
      return { ...state, showCreateDialog: action.payload };
    
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    
    case 'SET_ROLE_FILTER':
      return { ...state, roleFilter: action.payload };
    
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload };
    
    case 'SET_SELECTED_USERS':
      return { ...state, selectedUsers: action.payload };
    
    case 'TOGGLE_USER_SELECTION':
      const userId = action.payload;
      const isSelected = state.selectedUsers.includes(userId);
      return {
        ...state,
        selectedUsers: isSelected
          ? state.selectedUsers.filter(id => id !== userId)
          : [...state.selectedUsers, userId]
      };
    
    case 'SELECT_ALL_USERS':
      return { ...state, selectedUsers: action.payload };
    
    case 'CLEAR_SELECTION':
      return { ...state, selectedUsers: [] };
    
    case 'SET_BULK_ACTION_LOADING':
      return { ...state, bulkActionLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload, loading: false };
    
    case 'ADD_USER':
      return { 
        ...state, 
        users: [...state.users, action.payload],
        error: null 
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id 
            ? { ...user, ...action.payload.updates }
            : user
        ),
        error: null
      };
    
    case 'REMOVE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        selectedUsers: state.selectedUsers.filter(id => id !== action.payload),
        error: null
      };
    
    case 'BULK_UPDATE_USERS':
      return {
        ...state,
        users: state.users.map(user => 
          action.payload.userIds.includes(user.id)
            ? { ...user, ...action.payload.updates }
            : user
        ),
        selectedUsers: [],
        error: null
      };
    
    default:
      return state;
  }
};

// ✅ Начальное состояние
const initialState: UsersPageState = {
  users: [],
  loading: true,
  userRole: 'member',
  editingUser: null,
  showCreateDialog: false,
  searchTerm: '',
  roleFilter: 'all',
  statusFilter: 'all',
  selectedUsers: [],
  bulkActionLoading: false,
  error: null,
  lastSync: null
};

// ✅ Типы для контекста
interface UsersPageContextType {
  // Состояние
  state: UsersPageState;
  
  // Вычисляемые значения
  filteredUsers: User[];
  permissions: {
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  
  // Действия
  actions: {
    // Загрузка данных
    loadUsers: () => Promise<void>;
    refreshUsers: () => Promise<void>;
    
    // CRUD операции
    createUser: (userData: CreateUserData) => Promise<{ success: boolean; error?: string }>;
    updateUser: (userData: CreateUserData) => Promise<{ success: boolean; error?: string }>;
    deleteUser: (id: string, userName: string) => Promise<void>;
    toggleUserStatus: (id: string, isActive: boolean) => Promise<void>;
    
    // Массовые операции
    bulkAction: (action: string, userIds: string[]) => Promise<void>;
    
    // UI состояние
    setEditingUser: (user: User | null) => void;
    setShowCreateDialog: (show: boolean) => void;
    
    // Фильтры
    setSearchTerm: (term: string) => void;
    setRoleFilter: (role: UserRole | 'all') => void;
    setStatusFilter: (status: 'all' | 'active' | 'inactive') => void;
    
    // Выбор пользователей
    toggleUserSelection: (userId: string) => void;
    selectAllUsers: () => void;
    clearSelection: () => void;
    
    // Утилиты
    clearError: () => void;
    canEditUser: (user: User) => boolean;
  };
}

// ✅ Создание контекста
const UsersPageContext = createContext<UsersPageContextType | undefined>(undefined);

// ✅ Провайдер
export const UsersPageProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(usersPageReducer, initialState);
  const router = useRouter();
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  // Проверка авторизации и загрузка пользователей
  const checkAuthAndLoadUsers = useCallback(async () => {
    try {
      console.log('🔍 Проверяем авторизацию...');
      const authResponse = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (!authResponse.ok) {
        console.log('❌ Не авторизован, перенаправляем на логин');
        router.push('/login');
        return;
      }
      
      const authData = await authResponse.json();
      console.log('✅ Авторизован как:', authData.user);
      dispatch({ type: 'SET_USER_ROLE', payload: authData.user.role });
      
      await loadUsers();
    } catch (error) {
      console.error('❌ Ошибка проверки авторизации:', error);
      toast({
        variant: "destructive",
        title: "Ошибка авторизации",
        description: "Не удалось проверить авторизацию"
      });
      router.push('/login');
    }
  }, [router, toast]);

  // Загрузка пользователей
  const loadUsers = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'SET_USERS', payload: data.users });
        dispatch({ type: 'SET_USER_ROLE', payload: data.userRole });
        dispatch({ type: 'SET_LAST_SYNC', payload: new Date() });
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Ошибка загрузки пользователей' });
        toast({
          variant: "destructive",
          title: "Ошибка загрузки",
          description: data.error || 'Ошибка загрузки пользователей'
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      const errorMessage = 'Ошибка загрузки пользователей';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [toast]);

  // Обновление пользователей
  const refreshUsers = useCallback(async () => {
    console.log('🔄 Обновление списка пользователей...');
    await loadUsers();
  }, [loadUsers]);

  // ✅ Создание пользователя с toast
  const createUser = useCallback(async (userData: CreateUserData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'ADD_USER', payload: data.user });
        toast({
          title: "Успех!",
          description: "Пользователь создан успешно"
        });
        return { success: true };
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка создания",
          description: data.error || 'Ошибка создания пользователя'
        });
        return { success: false, error: data.error || 'Ошибка создания пользователя' };
      }
    } catch (error) {
      console.error('Ошибка создания пользователя:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: 'Ошибка создания пользователя'
      });
      return { success: false, error: 'Ошибка создания пользователя' };
    }
  }, [toast]);

  // ✅ Обновление пользователя с toast
  const updateUser = useCallback(async (userData: CreateUserData): Promise<{ success: boolean; error?: string }> => {
    if (!state.editingUser) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: 'Пользователь для редактирования не найден'
      });
      return { success: false, error: 'Пользователь для редактирования не найден' };
    }

    try {
      const updateData: UpdateUserData = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isActive: userData.isActive,
        photoUrl: userData.photoUrl,
        phone: userData.phone,
        bio: userData.bio,
        specializations: userData.specializations,
        experience: userData.experience,
        hourlyRate: userData.hourlyRate
      };

      if (userData.password && userData.password.trim()) {
        updateData.password = userData.password;
      }

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: state.editingUser.id,
          updates: updateData
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch({ 
          type: 'UPDATE_USER', 
          payload: { id: state.editingUser.id, updates: data.user } 
        });
        toast({
          title: "Успех!",
          description: "Пользователь обновлен успешно"
        });
        return { success: true };
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка обновления",
          description: data.error || 'Ошибка обновления пользователя'
        });
        return { success: false, error: data.error || 'Ошибка обновления пользователя' };
      }
    } catch (error) {
      console.error('❌ Ошибка обновления пользователя:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: 'Ошибка обновления пользователя'
      });
      return { success: false, error: 'Ошибка обновления пользователя' };
    }
  }, [state.editingUser, toast]);

  // ✅ Удаление пользователя с красивым диалогом
  const deleteUser = useCallback(async (id: string, userName: string): Promise<void> => {
    const confirmed = await confirm({
      title: "Удаление пользователя",
      description: `Вы уверены, что хотите удалить пользователя "${userName}"?`,
      confirmText: "Удалить",
      cancelText: "Отмена",
      variant: "destructive",
      icon: <Trash2 className="h-5 w-5 text-red-600" />
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'REMOVE_USER', payload: id });
        toast({
          title: "Успех!",
          description: `Пользователь ${userName} удален успешно`
        });
      } else {
        console.error('❌ Ошибка удаления:', data.error);
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Ошибка удаления пользователя' });
        toast({
          variant: "destructive",
          title: "Ошибка удаления",
          description: data.error || 'Ошибка удаления пользователя'
        });
      }
    } catch (error) {
      console.error('❌ Ошибка удаления пользователя:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Ошибка удаления пользователя' });
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: 'Ошибка удаления пользователя'
      });
    }
  }, [toast, confirm]);

  // ✅ Переключение статуса пользователя с toast
  const toggleUserStatus = useCallback(async (id: string, isActive: boolean): Promise<void> => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: id,
          updates: { isActive }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch({ 
          type: 'UPDATE_USER', 
          payload: { id, updates: { isActive } } 
        });
        toast({
          title: "Успех!",
          description: `Пользователь ${isActive ? 'активирован' : 'деактивирован'} успешно`
        });
      } else {
        console.error('❌ Ошибка изменения статуса:', data.error);
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Ошибка изменения статуса' });
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: data.error || 'Ошибка изменения статуса'
        });
      }
    } catch (error) {
      console.error('❌ Ошибка изменения статуса:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Ошибка изменения статуса' });
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: 'Ошибка изменения статуса'
      });
    }
  }, [toast]);

  // ✅ Массовые операции с красивыми диалогами
  const bulkAction = useCallback(async (action: string, userIds: string[]): Promise<void> => {
    if (userIds.length === 0) {
      toast({
        title: "Внимание",
        description: 'Выберите пользователей для выполнения операции'
      });
      return;
    }

    let confirmOptions: any;
    let actionText = '';
    
    switch (action) {
      case 'activate':
        confirmOptions = {
          title: "Активация пользователей",
          description: `Активировать ${userIds.length} пользователей?`,
          confirmText: "Активировать",
          cancelText: "Отмена",
          variant: "default",
          icon: <UserCheck className="h-5 w-5 text-green-600" />
        };
        actionText = 'активация';
        break;
      case 'deactivate':
        confirmOptions = {
          title: "Деактивация пользователей",
          description: `Деактивировать ${userIds.length} пользователей?`,
          confirmText: "Деактивировать",
          cancelText: "Отмена",
          variant: "warning",
          icon: <UserX className="h-5 w-5 text-yellow-600" />
        };
        actionText = 'деактивация';
        break;
      case 'delete':
        confirmOptions = {
          title: "Удаление пользователей",
          description: `Удалить ${userIds.length} пользователей?`,
          confirmText: "Удалить всех",
          cancelText: "Отмена",
          variant: "destructive",
          icon: <Trash2 className="h-5 w-5 text-red-600" />
        };
        actionText = 'удаление';
        break;
      case 'export':
        // Экспорт без подтверждения
        const csvData = state.users
          .filter((user: User) => userIds.includes(user.id))
          .map((user: User) => ({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.isActive ? 'Активен' : 'Неактивен',
            created: new Date(user.createdAt).toLocaleDateString()
          }));
        
        const csv = [
          ['Имя', 'Email', 'Роль', 'Статус', 'Создан'],
          ...csvData.map((row: any) => Object.values(row))
        ].map((row: any) => row.join(',')).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        dispatch({ type: 'CLEAR_SELECTION' });
        toast({
          title: "Экспорт завершен",
          description: `Экспортировано ${userIds.length} пользователей`
        });
        return;
      default:
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: 'Неизвестное действие'
        });
        return;
    }

    const confirmed = await confirm(confirmOptions);
    if (!confirmed) return;

    try {
      dispatch({ type: 'SET_BULK_ACTION_LOADING', payload: true });
      
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, userIds })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Обновляем локальное состояние в зависимости от действия
        switch (action) {
          case 'activate':
            dispatch({ 
              type: 'BULK_UPDATE_USERS', 
              payload: { userIds, updates: { isActive: true } } 
            });
            break;
          case 'deactivate':
            dispatch({ 
              type: 'BULK_UPDATE_USERS', 
              payload: { userIds, updates: { isActive: false } } 
            });
            break;
          case 'delete':
            userIds.forEach(id => {
              dispatch({ type: 'REMOVE_USER', payload: id });
            });
            break;
        }
        toast({
          title: "Операция завершена",
          description: data.message || 'Операция выполнена успешно'
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error || 'Ошибка выполнения операции' });
        toast({
          variant: "destructive",
          title: "Ошибка операции",
          description: data.error || 'Ошибка выполнения операции'
        });
      }
    } catch (error) {
      console.error('Ошибка массовой операции:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Ошибка выполнения операции' });
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: 'Ошибка выполнения операции'
      });
    } finally {
      dispatch({ type: 'SET_BULK_ACTION_LOADING', payload: false });
    }
  }, [state.users, toast, confirm]);

  // Мемоизированные UI действия
  const uiActions = useMemo(() => ({
    setEditingUser: (user: User | null) => {
      dispatch({ type: 'SET_EDITING_USER', payload: user });
    },
    
    setShowCreateDialog: (show: boolean) => {
      dispatch({ type: 'SET_SHOW_CREATE_DIALOG', payload: show });
    },
    
    setSearchTerm: (term: string) => {
      dispatch({ type: 'SET_SEARCH_TERM', payload: term });
    },
    
    setRoleFilter: (role: UserRole | 'all') => {
      dispatch({ type: 'SET_ROLE_FILTER', payload: role });
    },
    
    setStatusFilter: (status: 'all' | 'active' | 'inactive') => {
      dispatch({ type: 'SET_STATUS_FILTER', payload: status });
    },
    
    toggleUserSelection: (userId: string) => {
      dispatch({ type: 'TOGGLE_USER_SELECTION', payload: userId });
    },
    
    selectAllUsers: () => {
      const allUserIds = state.users.map((user: User) => user.id);
      dispatch({ type: 'SELECT_ALL_USERS', payload: allUserIds });
    },
    
    clearSelection: () => {
      dispatch({ type: 'CLEAR_SELECTION' });
    },
    
    clearError: () => {
      dispatch({ type: 'SET_ERROR', payload: null });
    },
    
    canEditUser: (user: User) => {
      return canManageUser(state.userRole, user.role);
    }
  }), [state.users, state.userRole]);

  // Вычисляемые значения
  const filteredUsers = useMemo(() => {
    return state.users.filter((user: User) => {
      const matchesSearch = !state.searchTerm || 
        user.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(state.searchTerm.toLowerCase());
      
      const matchesRole = state.roleFilter === 'all' || user.role === state.roleFilter;
      
      const matchesStatus = state.statusFilter === 'all' || 
        (state.statusFilter === 'active' && user.isActive) ||
        (state.statusFilter === 'inactive' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [state.users, state.searchTerm, state.roleFilter, state.statusFilter]);

  const permissions = useMemo(() => ({
    canCreate: canCreateUsers(state.userRole),
    canUpdate: canUpdateUsers(state.userRole),
    canDelete: canDeleteUsers(state.userRole)
  }), [state.userRole]);

  // Инициализация
  useEffect(() => {
    checkAuthAndLoadUsers();
  }, [checkAuthAndLoadUsers]);

  // Мемоизированное значение контекста
  const contextValue = useMemo<UsersPageContextType>(() => ({
    state,
    filteredUsers,
    permissions,
    actions: {
      loadUsers,
      refreshUsers,
      createUser,
      updateUser,
      deleteUser,
      toggleUserStatus,
      bulkAction,
      ...uiActions
    }
  }), [
    state,
    filteredUsers,
    permissions,
    loadUsers,
    refreshUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    bulkAction,
    uiActions
  ]);

  return (
    <UsersPageContext.Provider value={contextValue}>
      {children}
      <ConfirmDialog />
    </UsersPageContext.Provider>
  );
};

// ✅ Хук для использования контекста
export const useUsersPage = () => {
  const context = useContext(UsersPageContext);
  if (!context) {
    throw new Error('useUsersPage must be used within UsersPageProvider');
  }
  return context;
};

