// app/admin/users/page.tsx (обновите импорты и используйте систему разрешений)

"use client";

import { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart3, Zap, Sparkles } from "lucide-react";

// Импорт типов
import { User, UserRole, CreateUserData, UpdateUserData } from "@/types/user";

// Импорт функций разрешений
import { 
  canCreateUsers, 
  canUpdateUsers, 
  canDeleteUsers,
  canManageUser,
  getCreatableRoles 
} from "@/lib/permissions";

// Импорт всех компонентов
import { UserStats } from "@/components/admin/users/UserStats";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UserGrid } from "@/components/admin/users/UserGrid";
import { CreateUserDialog } from "@/components/admin/users/CreateUserDialog";
import { RoleHierarchy } from "@/components/admin/users/RoleHierarchy";
import { QuickActions } from "@/components/admin/users/QuickActions";
import { UserAnalytics } from "@/components/admin/users/UserAnalytics";
import { useRouter } from 'next/navigation';
import { AdminSecondHeader, MobileActionGroup } from '@/components/admin/users/AdminSecondHeader';

export default function UsersManagementPage() {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('member');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const router = useRouter();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Проверка разрешений
  const canCreate = canCreateUsers(userRole);
  const canUpdate = canUpdateUsers(userRole);
  const canDelete = canDeleteUsers(userRole);

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);


  


  useEffect(() => {
  const checkAuthAndLoadUsers = async () => {
    // Сначала проверяем авторизацию
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
      setUserRole(authData.user.role);
      
      // Теперь загружаем пользователей
      await loadUsers();
    } catch (error) {
      console.error('❌ Ошибка проверки авторизации:', error);
      router.push('/login');
    }
  };

  checkAuthAndLoadUsers();
}, []);




  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
        setUserRole(data.userRole);
      } else {
        alert('Ошибка загрузки пользователей: ' + data.error);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      alert('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchTerm || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Handlers
  const handleCreateUser = async (userData: CreateUserData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadUsers();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Ошибка создания пользователя' };
      }
    } catch (error) {
      console.error('Ошибка создания пользователя:', error);
      return { success: false, error: 'Ошибка создания пользователя' };
    }
  };

const handleUserUpdate = async (userData: CreateUserData): Promise<{ success: boolean; error?: string }> => {
  console.log('🔄 handleUserUpdate: НАЧАЛО обновления');
  console.log('👤 Редактируемый пользователь:', editingUser);
  
  if (!editingUser) {
    console.log('❌ Редактируемый пользователь не найден');
    return { success: false, error: 'Пользователь для редактирования не найден' };
  }

  try {
    const updateData: UpdateUserData = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      isActive: userData.isActive,
      photoUrl: userData.photoUrl
    };

    if (userData.password && userData.password.trim()) {
      updateData.password = userData.password;
    }

    console.log('📝 Данные для обновления:', updateData);
    console.log('🎯 URL запроса:', `/api/admin/users/${editingUser.id}`);
    
    // Проверяем куки перед запросом
    console.log('🍪 ВСЕ куки перед PUT запросом:', document.cookie);
    
    // Проверяем конкретно session_id
    const sessionIdCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('session_id='));
    console.log('🔑 Session ID cookie найден:', !!sessionIdCookie);
    if (sessionIdCookie) {
      const sessionId = sessionIdCookie.split('=')[1];
      console.log('🔑 Session ID значение:', sessionId.substring(0, 20) + '...');
    }
    
    // Также проверим debug cookie
    const debugCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('session_id_debug='));
    console.log('🐛 Debug cookie найден:', !!debugCookie);
    
    console.log('📡 Отправляем PUT запрос...');
    
    const response = await fetch(`/api/admin/users/${editingUser.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Важно для передачи куки
      body: JSON.stringify(updateData)
    });
    
    console.log('📡 Статус ответа PUT:', response.status);
    console.log('📡 Заголовки ответа PUT:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📄 Данные ответа PUT:', data);
    
    if (data.success) {
      console.log('✅ Пользователь обновлен успешно');
      await loadUsers();
      return { success: true };
    } else {
      console.log('❌ Ошибка от API:', data.error);
      return { success: false, error: data.error || 'Ошибка обновления пользователя' };
    }
  } catch (error) {
    console.error('❌ Исключение в handleUserUpdate:', error);
    return { success: false, error: 'Ошибка обновления пользователя' };
  }
};

const handleCreateOrUpdate = async (userData: CreateUserData): Promise<{ success: boolean; error?: string }> => {
  console.log('🔀 handleCreateOrUpdate: определяем тип операции');
  console.log('📝 Данные:', userData);
  console.log('👤 editingUser:', editingUser?.name || 'null');
  
  if (editingUser) {
    console.log('✏️ Режим редактирования');
    return await handleUserUpdate(userData);
  } else {
    console.log('➕ Режим создания');
    return await handleCreateUser(userData);
  }
};
  
  const handleDeleteUser = async (id: string, userName: string): Promise<void> => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя ${userName}?`)) {
      return;
    }
  
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Пользователь удален успешно!');
        await loadUsers();
      } else {
        alert('Ошибка удаления пользователя: ' + data.error);
      }
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
      alert('Ошибка удаления пользователя');
    }
  };
  
  const handleBulkAction = async (action: string, userIds: string[]): Promise<void> => {
    if (userIds.length === 0) {
      alert('Выберите пользователей для выполнения операции');
      return;
    }
  
    let confirmMessage = '';
    switch (action) {
      case 'activate':
        confirmMessage = `Активировать ${userIds.length} пользователей?`;
        break;
      case 'deactivate':
        confirmMessage = `Деактивировать ${userIds.length} пользователей?`;
        break;
      case 'delete':
        confirmMessage = `УДАЛИТЬ ${userIds.length} пользователей? Это действие нельзя отменить!`;
        break;
      case 'export':
        const csvData = users
          .filter(user => userIds.includes(user.id))
          .map(user => ({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.isActive ? 'Активен' : 'Неактивен',
            created: new Date(user.createdAt).toLocaleDateString()
          }));
        
        const csv = [
          ['Имя', 'Email', 'Роль', 'Статус', 'Создан'],
          ...csvData.map(row => Object.values(row))
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        return;
      default:
        alert('Неизвестное действие');
        return;
    }
  
    if (!confirm(confirmMessage)) return;
  
    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userIds })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        await loadUsers();
      } else {
        alert('Ошибка: ' + data.error);
      }
    } catch (error) {
      console.error('Ошибка массовой операции:', error);
      alert('Ошибка выполнения операции');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean): Promise<void> => {
    try {
      const updateData: UpdateUserData = { isActive };
      
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadUsers();
      } else {
        alert('Ошибка изменения статуса: ' + data.error);
      }
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      alert('Ошибка изменения статуса');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">Загрузка пользователей</h3>
            <p className="text-gray-500">Подготавливаем данные для вас...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <AdminSecondHeader
        title="Управление пользователями"
        icon={Users}
        actions={
          canCreate ? (
            <MobileActionGroup>
              <Button 
                onClick={() => {
                  setEditingUser(null);
                  setShowCreateDialog(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Users className="h-4 w-4 mr-2" />
                Создать пользователя
              </Button>
            </MobileActionGroup>
          ) : undefined
        }
      />

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8">
          <UserStats users={users} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <TabsList className="grid w-full grid-cols-4 bg-transparent gap-2">
              <TabsTrigger 
                value="users" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Пользователи</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Аналитика</span>
              </TabsTrigger>
              <TabsTrigger 
                value="actions" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
              >
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Действия</span>
              </TabsTrigger>
              <TabsTrigger 
                value="hierarchy" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all duration-200"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Роли</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-8">
            <UserFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              totalUsers={users.length}
              filteredUsers={filteredUsers.length}
            />

            <UserGrid
              users={filteredUsers}
              currentUserRole={userRole}
              onEdit={(user) => {
                // Проверяем, может ли текущий пользователь редактировать этого пользователя
                if (canManageUser(userRole, user.role)) {
                  setEditingUser(user);
                  setShowCreateDialog(true);
                } else {
                  alert('У вас нет прав для редактирования этого пользователя');
                }
              }}
              onDelete={handleDeleteUser}
              onToggleStatus={handleToggleStatus}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <UserAnalytics users={users} />
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="actions" className="space-y-8">
            <QuickActions
              users={users}
              userRole={userRole}
              onBulkAction={handleBulkAction}
            />
          </TabsContent>

          {/* Role Hierarchy Tab */}
          <TabsContent value="hierarchy" className="space-y-8">
            <RoleHierarchy />
          </TabsContent>
        </Tabs>
      </main>

      {/* Create/Edit Dialog */}
      <CreateUserDialog
        open={showCreateDialog}
        setOpen={setShowCreateDialog}
        onCreateUser={handleCreateOrUpdate}
        editingUser={editingUser}
        currentUserRole={userRole}
      />
    </div>
  );
}
