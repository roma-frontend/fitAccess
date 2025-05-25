// components/admin/users/UserGrid.tsx
"use client";

import { UserCard, User as UserType, UserRole } from "./UserCard";

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
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Пользователи не найдены</h3>
        <p className="text-gray-500">Попробуйте изменить параметры поиска или создайте нового пользователя</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
