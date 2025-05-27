// components/admin/users/UserCard.tsx (обновленная версия с красивым дизайном)
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Crown, Shield, Settings, Dumbbell, User, 
  Edit, Trash2, UserCheck, UserX, MoreVertical, 
  Calendar, Clock, Sparkles 
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

  const getRoleConfig = (role: UserRole) => {
    const configs = {
      'super-admin': {
        color: 'bg-gradient-to-r from-purple-500 to-pink-500',
        textColor: 'text-white',
        bgColor: 'from-purple-50 to-pink-50',
        borderColor: 'border-purple-200',
        name: 'Супер Админ'
      },
      'admin': {
        color: 'bg-gradient-to-r from-red-500 to-orange-500',
        textColor: 'text-white',
        bgColor: 'from-red-50 to-orange-50',
        borderColor: 'border-red-200',
        name: 'Администратор'
      },
      'manager': {
        color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        textColor: 'text-white',
        bgColor: 'from-blue-50 to-cyan-50',
        borderColor: 'border-blue-200',
        name: 'Менеджер'
      },
      'trainer': {
        color: 'bg-gradient-to-r from-green-500 to-emerald-500',
        textColor: 'text-white',
        bgColor: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-200',
        name: 'Тренер'
      },
      'member': {
        color: 'bg-gradient-to-r from-gray-500 to-slate-500',
        textColor: 'text-white',
        bgColor: 'from-gray-50 to-slate-50',
        borderColor: 'border-gray-200',
        name: 'Участник'
      },
    };
    return configs[role];
  };

  const roleConfig = getRoleConfig(user.role);
  const canManageUser = user.role !== 'super-admin';
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm overflow-hidden relative">
            {/* Gradient border effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${roleConfig.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      <div className="absolute inset-[1px] bg-white rounded-lg"></div>
      
      {/* Content */}
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Avatar */}
            <div className="relative">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                />
              ) : (
                <div className={`w-14 h-14 rounded-2xl ${roleConfig.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {getInitials(user.name)}
                </div>
              )}
              
              {/* Status indicator */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white shadow-lg ${
                user.isActive ? 'bg-emerald-500' : 'bg-gray-400'
              }`}>
                {user.isActive && (
                  <div className="w-full h-full bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-bold text-gray-900 truncate text-lg">{user.name}</h3>
                <Badge className={`${roleConfig.color} ${roleConfig.textColor} flex items-center gap-1 px-3 py-1 shadow-md`}>
                  {getRoleIcon(user.role)}
                  {roleConfig.name}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 truncate mb-3 font-medium">{user.email}</p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Создан {formatDate(user.createdAt)}</span>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Вход {formatDate(user.lastLogin)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Badge 
              variant={user.isActive ? "default" : "secondary"} 
              className={`text-xs font-medium px-3 py-1 ${
                user.isActive 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              {user.isActive ? 'Активен' : 'Неактивен'}
            </Badge>

            {canManageUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-100 rounded-xl h-9 w-9 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <DropdownMenuItem 
                    onClick={() => onEdit(user)}
                    className="flex items-center gap-3 py-3 px-4 hover:bg-blue-50 transition-colors"
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Редактировать</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onToggleStatus(user.id, !user.isActive)}
                    className="flex items-center gap-3 py-3 px-4 hover:bg-green-50 transition-colors"
                  >
                    {user.isActive ? (
                      <>
                        <UserX className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">Деактивировать</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Активировать</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(user.id, user.name)}
                    className="flex items-center gap-3 py-3 px-4 hover:bg-red-50 text-red-600 focus:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="font-medium">Удалить</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {user.role === 'super-admin' && (
              <Badge className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 border border-purple-200">
                <Crown className="h-3 w-3 mr-1" />
                Защищен
              </Badge>
            )}
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
      </CardContent>
    </Card>
  );
}

