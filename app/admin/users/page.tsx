// app/admin/users/page.tsx (финальная версия)
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, BarChart3, Zap } from "lucide-react";

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

export default function UsersManagementPage() {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('member');
  const [canCreate, setCanCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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

  // Handlers
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка пользователей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/admin'}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Управление пользователями</h1>
                  <p className="text-sm text-gray-600">Создание и управление учетными записями</p>
                </div>
              </div>
            </div>
            
            {canCreate && (
              <CreateUserDialog 
                userRole={userRole}
                onCreateUser={handleCreateUser}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8">
          <UserStats users={users} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Действия
            </TabsTrigger>
            <TabsTrigger value="hierarchy" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Роли
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
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
          <TabsContent value="analytics" className="space-y-6">
            <UserAnalytics users={users} />
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <QuickActions
              users={users}
              userRole={userRole}
              onBulkAction={handleBulkAction}
            />
          </TabsContent>

          {/* Role Hierarchy Tab */}
          <TabsContent value="hierarchy" className="space-y-6">
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

