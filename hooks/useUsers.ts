// hooks/useUsers.ts (обновленная версия с правильными типами)
import { useState, useEffect } from 'react';
import { User, UserStats, CreateUserData, UpdateUserData } from "@/types/user";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/users/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
    }
  };

  const createUser = async (userData: CreateUserData) => {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    if (data.success) {
      await loadUsers();
      await loadStats();
    }
    return data;
  };

  const updateUser = async (id: string, updates: UpdateUserData) => {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    const data = await response.json();
    if (data.success) {
      await loadUsers();
      await loadStats();
    }
    return data;
  };

  const deleteUser = async (id: string) => {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    if (data.success) {
      await loadUsers();
      await loadStats();
    }
    return data;
  };

  const bulkAction = async (action: string, userIds: string[], updates?: any) => {
    const response = await fetch('/api/admin/users/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, userIds, updates })
    });
    
    const data = await response.json();
    if (data.success) {
      await loadUsers();
      await loadStats();
    }
    return data;
  };

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  return {
    users,
    loading,
    error,
    stats,
    loadUsers,
    loadStats,
    createUser,
    updateUser,
    deleteUser,
    bulkAction
  };
}
