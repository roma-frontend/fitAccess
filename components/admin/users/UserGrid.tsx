// components/admin/users/UserGrid.tsx (исправленная версия)
"use client";

import { User, UserRole } from "@/types/user";
import { UserCard } from "./UserCard";

interface UserGridProps {
  users: User[];
  currentUserRole: UserRole;
  onEdit: (user: User) => void;
  onDelete: (id: string, userName: string) => Promise<void>;
  onToggleStatus: (id: string, isActive: boolean) => Promise<void>;
}

export function UserGrid({ 
  users, 
  currentUserRole, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: UserGridProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Пользователи не найдены</div>
        <div className="text-gray-400 text-sm mt-2">
          Попробуйте изменить фильтры поиска
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          currentUserRole={currentUserRole}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}
