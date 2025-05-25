// components/admin/users/UserFilters.tsx
"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Users } from "lucide-react";
import { UserRole } from "./UserCard";

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  roleFilter: UserRole | 'all';
  onRoleFilterChange: (role: UserRole | 'all') => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusFilterChange: (status: 'all' | 'active' | 'inactive') => void;
  totalUsers: number;
  filteredUsers: number;
}

export function UserFilters({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  totalUsers,
  filteredUsers
}: UserFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    onSearchChange('');
    onRoleFilterChange('all');
    onStatusFilterChange('all');
  };

  const hasActiveFilters = searchTerm || roleFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск по имени или email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 transition-all focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Фильтры
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                {[searchTerm, roleFilter !== 'all', statusFilter !== 'all'].filter(Boolean).length}
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Роль</label>
              <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Все роли" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  <SelectItem value="super-admin">Супер Администратор</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="manager">Менеджер</SelectItem>
                  <SelectItem value="trainer">Тренер</SelectItem>
                  <SelectItem value="member">Участник</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Статус</label>
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>
            Показано {filteredUsers} из {totalUsers} пользователей
          </span>
        </div>
        {hasActiveFilters && (
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            Фильтры применены
          </Badge>
        )}
      </div>
    </div>
  );
}
