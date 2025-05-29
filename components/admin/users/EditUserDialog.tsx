// components/admin/users/EditUserDialog.tsx (исправленная версия)
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User, Mail, Shield, Camera, Loader2 } from "lucide-react";
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';

// Импортируем типы из общего файла
import { User as UserType, UserRole, UpdateUserData } from "@/types/user";
import { 
  getCreatableRoles, 
  canManageUser, 
  canCreateUserWithRole 
} from "@/lib/permissions";

interface EditUserDialogProps {
  user: UserType | null;
  userRole: UserRole;
  onClose: () => void;
  onUpdateUser: (id: string, updates: UpdateUserData) => Promise<void>;
}

export function EditUserDialog({ user, userRole, onClose, onUpdateUser }: EditUserDialogProps) {
  const [formData, setFormData] = useState<UpdateUserData>({
    name: '',
    email: '',
    role: 'member',
    isActive: true,
    photoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { upload, isUploading } = useCloudinaryUpload();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        photoUrl: user.photoUrl || ''
      });
      setErrors({});
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Имя обязательно';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    if (!formData.role) {
      newErrors.role = 'Роль обязательна';
    } else if (!canCreateUserWithRole(userRole, formData.role)) {
      newErrors.role = 'У вас нет прав для назначения этой роли';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user || !validateForm()) return;

  setLoading(true);
  console.log('Отправка данных:', {
    userId: user.id,
    updateData: formData,
    currentUserRole: userRole
  });

  try {
    await onUpdateUser(user.id, formData);
    onClose();
  } catch (error) {
    console.error('Ошибка обновления:', error);
    setErrors({ submit: 'Ошибка обновления пользователя' });
  } finally {
    setLoading(false);
  }
};

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const photoUrl = await upload(file, {
        folder: 'users',
        uploadPreset: 'user_photos'
      });

      if (photoUrl) {
        setFormData(prev => ({ ...prev, photoUrl }));
      }
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      setErrors({ photo: 'Ошибка загрузки фотографии' });
    }
  };

  // Используем функции из permissions.ts
  const canEditUser = (): boolean => {
    if (!user) return false;
    return canManageUser(userRole, user.role);
  };

  const availableRoles = (): UserRole[] => {
    return getCreatableRoles(userRole);
  };

  // Обновленные метки ролей с правильными ключами
  const roleLabels: Record<UserRole, string> = {
    'super-admin': 'Супер Админ',
    'admin': 'Администратор',
    'manager': 'Менеджер',
    'trainer': 'Тренер',
    'member': 'Участник',
    'client': 'Клиент'
  };

  if (!user) return null;

  const canEdit = canEditUser();
  const rolesToShow = availableRoles();

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Редактировать пользователя
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Фото профиля */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.photoUrl} />
              <AvatarFallback>
                {formData.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading || !canEdit}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                disabled={isUploading || !canEdit}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {isUploading ? 'Загрузка...' : 'Изменить фото'}
              </Button>
            </div>
            {errors.photo && (
              <p className="text-sm text-red-600">{errors.photo}</p>
            )}
          </div>

          {/* Основная информация */}
          <div className="grid grid-cols-1 gap-4">
            {/* Имя */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Имя
              </Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Введите имя"
                className={errors.name ? 'border-red-500' : ''}
                disabled={!canEdit}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Введите email"
                className={errors.email ? 'border-red-500' : ''}
                disabled={!canEdit}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Роль */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Роль
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
                disabled={!canEdit || rolesToShow.length === 0}
              >
                <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  {rolesToShow.map((role) => (
                    <SelectItem key={role} value={role}>
                      {roleLabels[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-600">{errors.role}</p>
              )}
              {!canEdit && (
                <p className="text-sm text-gray-500">
                  У вас нет прав для редактирования этого пользователя
                </p>
              )}
              {canEdit && rolesToShow.length === 0 && (
                <p className="text-sm text-gray-500">
                  Нет доступных ролей для назначения
                </p>
              )}
              
              {/* Отладочная информация */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-400">
                  Доступные роли: {rolesToShow.join(', ')}
                </div>
              )}
            </div>

            {/* Статус активности */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Активный пользователь</Label>
                <p className="text-sm text-gray-500">
                  Активные пользователи могут входить в систему
                </p>
              </div>
              <Switch
                checked={formData.isActive ?? true}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isActive: checked }))
                }
                disabled={!canEdit}
              />
            </div>
          </div>

          {/* Отладочная информация */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <div>Редактируемый пользователь: {user.name}</div>
              <div>Роль редактируемого: {user.role}</div>
              <div>Текущая роль: {userRole}</div>
              <div>Может редактировать: {canEdit ? 'Да' : 'Нет'}</div>
              <div>Доступные роли: {rolesToShow.join(', ')}</div>
            </div>
          )}

          {/* Ошибки */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading || isUploading || !canEdit}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <User className="h-4 w-4" />
              )}
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
