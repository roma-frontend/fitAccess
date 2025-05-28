// app/admin/users/page.tsx (обновленная версия с улучшенным дизайном)
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, BarChart3, Zap, Sparkles } from "lucide-react";

// Импорт всех компонентов
import { UserStats } from "@/components/admin/users/UserStats";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UserGrid } from "@/components/admin/users/UserGrid";
import { CreateUserDialog } from "@/components/admin/users/CreateUserDialog";
import { EditUserDialog } from "@/components/admin/users/EditUserDialog";
import { RoleHierarchy } from "@/components/admin/users/RoleHierarchy";
import { QuickActions } from "@/components/admin/users/QuickActions";
import { UserAnalytics } from "@/components/admin/users/UserAnalytics";
import { User, UserRole } from "@/components/admin/users/UserCard";
import { useRouter } from 'next/navigation';
import { AdminSecondHeader, MobileActionGroup } from '@/components/admin/users/AdminSecondHeader';

export default function UsersManagementPage() {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('member');
  const [canCreate, setCanCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const router = useRouter()

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
        setUserRole(data.userRole);
        setCanCreate(data.canCreate);
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

  // Handlers (остаются те же)
  const handleCreateUser = async (userData: {
    email: string;
    password: string;
    role: UserRole;
    name: string;
  }) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Пользователь создан успешно!');
        loadUsers();
      } else {
        alert('Ошибка создания пользователя: ' + data.error);
      }
    } catch (error) {
      console.error('Ошибка создания пользователя:', error);
      alert('Ошибка создания пользователя');
    }
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Пользователь обновлен успешно!');
        loadUsers();
      } else {
        alert('Ошибка обновления пользователя: ' + data.error);
      }
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
      alert('Ошибка обновления пользователя');
    }
  };

  const handleDeleteUser = async (id: string, userName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя ${userName}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Пользователь удален успешно!');
        loadUsers();
      } else {
        alert('Ошибка удаления пользователя: ' + data.error);
      }
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
      alert('Ошибка удаления пользователя');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    await handleUpdateUser(id, { isActive });
  };

  const handleBulkAction = async (action: string, userIds: string[]) => {
    switch (action) {
      case 'activate':
        for (const id of userIds) {
          await handleUpdateUser(id, { isActive: true });
        }
        break;
      case 'export':
        // Implement CSV export
        const csvData = users.map(user => ({
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
        a.download = 'users.csv';
        a.click();
        break;
      case 'notify':
        alert(`Уведомление отправлено ${userIds.length} пользователям`);
        break;
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

      {/* Header - упрощенный в едином стиле */}
      <AdminSecondHeader
        title="Управление пользователями"
        icon={Users}
        actions={
          canCreate ? (
            <MobileActionGroup>
              <CreateUserDialog 
                userRole={userRole}
                onCreateUser={handleCreateUser}
              />
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
              onEdit={setEditingUser}
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

            {/* Edit Dialog */}
            <EditUserDialog
        user={editingUser}
        userRole={userRole}
        onClose={() => setEditingUser(null)}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
}

      
