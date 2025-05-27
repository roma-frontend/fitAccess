// components/admin/users/UserGrid.tsx (обновленная версия)
"use client";

import { UserCard, User as UserType, UserRole } from "./UserCard";
import { Users, SearchX, Sparkles } from "lucide-react";

interface UserGridProps {
  users: UserType[];
  currentUserRole: UserRole;
  onEdit: (user: UserType) => void;
  onDelete: (id: string, name: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

export function UserGrid({ users, currentUserRole, onEdit, onDelete, onToggleStatus }: UserGridProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative mx-auto mb-8">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          
          {/* Icon container */}
          <div className="relative w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <SearchX className="w-12 h-12 text-gray-400" />
            </div>
            
            {/* Floating sparkles */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-blue-400 animate-bounce" />
            <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-purple-400 animate-bounce delay-300" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">Пользователи не найдены</h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            Попробуйте изменить параметры поиска или создайте нового пользователя, 
            чтобы начать работу с системой
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-6">
            <Users className="h-4 w-4" />
            <span>Система готова к добавлению пользователей</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Список пользователей ({users.length})
        </h3>
      </div>

      {/* User cards grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {users.map((user, index) => (
          <div
            key={user.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <UserCard
              user={user}
              currentUserRole={currentUserRole}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          </div>
        ))}
      </div>

      {/* Grid footer */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">
          Отображено {users.length} пользователей
        </p>
      </div>
    </div>
  );
}
