// components/admin/users/UserCard.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Crown, Shield, Settings, Dumbbell, User, 
  Edit, Trash2, UserCheck, UserX, MoreVertical 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type UserRole = 'super-admin' | 'admin' | 'manager' | 'trainer' | 'member';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: number;
  createdBy?: string;
  isActive: boolean;
  avatar?: string;
  lastLogin?: number;
}

interface UserCardProps {
  user: User;
  currentUserRole: UserRole;
  onEdit: (user: User) => void;
  onDelete: (id: string, name: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

export function UserCard({ user, currentUserRole, onEdit, onDelete, onToggleStatus }: UserCardProps) {
  const getRoleIcon = (role: UserRole) => {
    const icons = {
      'super-admin': Crown,
      'admin': Shield,
      'manager': Settings,
      'trainer': Dumbbell,
      'member': User,
    };
    const Icon = icons[role];
    return <Icon className="h-4 w-4" />;
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      'super-admin': 'bg-purple-100 text-purple-800 border-purple-200',
      'admin': 'bg-red-100 text-red-800 border-red-200',
      'manager': 'bg-blue-100 text-blue-800 border-blue-200',
      'trainer': 'bg-green-100 text-green-800 border-green-200',
      'member': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[role];
  };

  const getRoleDisplayName = (role: UserRole) => {
    const names = {
      'super-admin': 'Супер Админ',
      'admin': 'Администратор',
      'manager': 'Менеджер',
      'trainer': 'Тренер',
      'member': 'Участник',
    };
    return names[role];
  };

  const canManageUser = user.role !== 'super-admin';
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Avatar */}
            <div className="relative">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {getInitials(user.name)}
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                user.isActive ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                <Badge className={`${getRoleBadgeColor(user.role)} flex items-center gap-1`}>
                  {getRoleIcon(user.role)}
                  {getRoleDisplayName(user.role)}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 truncate mb-2">{user.email}</p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>Создан: {new Date(user.createdAt).toLocaleDateString()}</span>
                {user.lastLogin && (
                  <span>Вход: {new Date(user.lastLogin).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
              {user.isActive ? 'Активен' : 'Неактивен'}
            </Badge>

            {canManageUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(user)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleStatus(user.id, !user.isActive)}>
                    {user.isActive ? (
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        Деактивировать
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Активировать
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(user.id, user.name)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {user.role === 'super-admin' && (
              <Badge className="bg-purple-100 text-purple-800 text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Защищен
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
