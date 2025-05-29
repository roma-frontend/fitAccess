// components/admin/users/UserCard.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import { User, UserRole } from "@/types/user";
import { canManageUser, canDeleteUser } from "@/lib/permissions";

interface UserCardProps {
  user: User;
  currentUserRole: UserRole;
  onEdit: (user: User) => void;
  onDelete: (id: string, name: string) => Promise<void>;
  onToggleStatus: (id: string, isActive: boolean) => Promise<void>;
}

const roleColors: Record<UserRole, string> = {
  'super-admin': 'bg-red-100 text-red-800 border-red-200',
  'admin': 'bg-purple-100 text-purple-800 border-purple-200',
  'manager': 'bg-blue-100 text-blue-800 border-blue-200',
  'trainer': 'bg-green-100 text-green-800 border-green-200',
  'member': 'bg-gray-100 text-gray-800 border-gray-200',
  'client': 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

const roleLabels: Record<UserRole, string> = {
  'super-admin': 'Супер Админ',
  'admin': 'Администратор',
  'manager': 'Менеджер',
  'trainer': 'Тренер',
  'member': 'Участник',
  'client': 'Клиент'
};

export function UserCard({ user, currentUserRole, onEdit, onDelete, onToggleStatus }: UserCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageError, setImageError] = useState(false);

  const canEdit = (): boolean => {
    return canManageUser(currentUserRole, user.role);
  };

  const canDelete = (): boolean => {
    return canDeleteUser(currentUserRole, user.role);
  };

  const handleStatusToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await onToggleStatus(user.id, checked);
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(user.id, user.name);
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatLastLogin = (timestamp?: number) => {
    if (!timestamp) return 'Никогда';
    
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дн. назад`;
    if (days < 30) return `${Math.floor(days / 7)} нед. назад`;
    
    return formatDate(timestamp);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
              {user.photoUrl && !imageError ? (
                <AvatarImage 
                  src={user.photoUrl} 
                  alt={user.name}
                  onError={handleImageError}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {user.name}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {canEdit() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(user)}
                className="h-8 w-8 p-0 hover:bg-blue-100"
                title="Редактировать"
              >
                <Edit className="h-4 w-4 text-blue-600" />
              </Button>
            )}

            {(canEdit() || canDelete()) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                    title="Дополнительные действия"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {canEdit() && (
                    <>
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleStatusToggle(!user.isActive)}
                        disabled={isUpdating}
                      >
                        {user.isActive ? (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Деактивировать
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Активировать
                          </>
                        )}
                      </DropdownMenuItem>
                    </>
                  )}
                  {canDelete() && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleDelete}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Role and Status */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${roleColors[user.role]} border`}>
            <Shield className="h-3 w-3 mr-1" />
            {roleLabels[user.role]}
          </Badge>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {user.isActive ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs font-medium ${
                user.isActive ? 'text-green-600' : 'text-red-600'
              }`}>
                {user.isActive ? 'Активен' : 'Неактивен'}
              </span>
            </div>
            
            {canEdit() && (
              <div className="scale-75">
                <Switch
                  checked={user.isActive}
                  onCheckedChange={handleStatusToggle}
                  disabled={isUpdating}
                />
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Создан: {formatDate(user.createdAt)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Вход: {formatLastLogin(user.lastLogin)}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {canEdit() && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(user)}
                className="flex-1 h-8 text-xs"
              >
                <Edit className="h-3 w-3 mr-1" />
                Редактировать
              </Button>
              
              {user.isActive ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusToggle(false)}
                  disabled={isUpdating}
                  className="h-8 text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  {isUpdating ? 'Обновление...' : 'Деактивировать'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusToggle(true)}
                  disabled={isUpdating}
                  className="h-8 text-xs text-green-600 border-green-200 hover:bg-green-50"
                >
                  {isUpdating ? 'Обновление...' : 'Активировать'}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
