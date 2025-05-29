// components/admin/users/CreateUserDialog.tsx
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, UserPlus, Upload, X } from "lucide-react";
import { User, UserRole, CreateUserData } from "@/types/user";
import { 
  getCreatableRoles, 
  canManageUser, 
  canCreateUserWithRole,
  getManageableRoles 
} from "@/lib/permissions";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";

interface CreateUserDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreateUser: (userData: CreateUserData) => Promise<{ success: boolean; error?: string }>;
  editingUser?: User | null;
  currentUserRole: UserRole;
}

const roleLabels = {
  'super-admin': 'Супер Админ',
  'admin': 'Администратор', 
  'manager': 'Менеджер',
  'trainer': 'Тренер',
  'member': 'Участник',
  'client': 'Клиент'
};

export function CreateUserDialog({ 
  open, 
  setOpen, 
  onCreateUser, 
  editingUser, 
  currentUserRole 
}: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member' as UserRole,
    isActive: true,
    photoUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Cloudinary hook
  const { upload, isUploading, error: uploadError } = useCloudinaryUpload();

  // Используем функции из permissions.ts
  const availableRoles = (): UserRole[] => {
    return getCreatableRoles(currentUserRole);
  };

  const canEditUser = (): boolean => {
    if (!editingUser) return true;
    return canManageUser(currentUserRole, editingUser.role);
  };

  const getEditableRoles = (): UserRole[] => {
    if (!editingUser) {
      return availableRoles();
    }
    return getCreatableRoles(currentUserRole);
  };

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        password: '',
        role: editingUser.role,
        isActive: editingUser.isActive,
        photoUrl: editingUser.photoUrl || ''
      });
      setPreviewUrl(editingUser.photoUrl || '');
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'member',
        isActive: true,
        photoUrl: ''
      });
      setPreviewUrl('');
    }
    setErrors({});
  }, [editingUser, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    if (!editingUser && !formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (!editingUser && formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (!formData.role) {
      newErrors.role = 'Роль обязательна';
    } else if (!canCreateUserWithRole(currentUserRole, formData.role)) {
      newErrors.role = 'У вас нет прав для создания пользователя с этой ролью';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    console.log('🚀 CreateUserDialog: начинаем отправку формы');
    console.log('📝 Данные формы:', formData);

    setLoading(true);
    setErrors({});

    try {
      const userData: CreateUserData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        isActive: formData.isActive
      };

      if (formData.photoUrl) {
        userData.photoUrl = formData.photoUrl;
      }

      console.log('📤 Отправляем данные:', userData);
      
      const result = await onCreateUser(userData);
      console.log('📥 Результат от родителя:', result);

      if (result.success) {
        console.log('✅ Успешно обновлено');
        setOpen(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'member',
          isActive: true,
          photoUrl: ''
        });
        setPreviewUrl('');
      } else {
        console.log('❌ Ошибка от сервера:', result.error);
        setErrors({ submit: result.error || 'Произошла ошибка' });
      }
    } catch (error) {
      console.error('❌ Исключение в CreateUserDialog:', error);
      setErrors({ submit: 'Произошла ошибка при создании пользователя' });
    } finally {
      setLoading(false);
    }
  };

const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    setErrors({ ...errors, photo: 'Размер файла не должен превышать 5MB' });
    return;
  }

  if (!file.type.startsWith('image/')) {
    setErrors({ ...errors, photo: 'Можно загружать только изображения' });
    return;
  }

  setErrors({ ...errors, photo: '' });

  try {
    console.log('📤 Загружаем фото...');
    
    // Используем hook для загрузки
    const cloudinaryUrl = await upload(file);

    if (cloudinaryUrl) {
      console.log('✅ Фото загружено:', cloudinaryUrl);
      
      // Обновляем состояние
      setFormData(prev => ({ ...prev, photoUrl: cloudinaryUrl }));
      setPreviewUrl(cloudinaryUrl);
      
      console.log('✅ Аватарка обновлена в форме');
    } else {
      setErrors(prev => ({ ...prev, photo: uploadError || 'Ошибка загрузки файла' }));
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки:', error);
    setErrors(prev => ({ ...prev, photo: 'Ошибка загрузки файла' }));
  }
};

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photoUrl: '' }));
    setPreviewUrl('');
  };

  const rolesToShow = getEditableRoles();
  const canEdit = canEditUser();
  const isRoleDisabled = !canEdit;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? 'Редактировать пользователя' : 'Создать нового пользователя'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Фото */}
          <div className="space-y-2">
            <Label htmlFor="photo">Фото профиля</Label>
            <div className="flex items-center gap-4">
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1">
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {isUploading && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Загрузка в Cloudinary...
                  </div>
                )}
              </div>
            </div>
            {errors.photo && (
              <p className="text-sm text-red-600">{errors.photo}</p>
            )}
            {uploadError && (
              <p className="text-sm text-red-600">{uploadError}</p>
            )}
          </div>

          {/* Имя */}
          <div className="space-y-2">
            <Label htmlFor="name">Полное имя</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Введите полное имя"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Введите email"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Пароль */}
          <div className="space-y-2">
            <Label htmlFor="password">
              {editingUser ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder={editingUser ? 'Новый пароль' : 'Введите пароль'}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Роль и Статус */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Роль</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
                disabled={isRoleDisabled}
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
              {isRoleDisabled && (
                <p className="text-xs text-gray-500">
                  У вас нет прав для изменения роли этого пользователя
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <div className="flex items-center space-x-2 h-10">
                <Switch
                  id="status"
                  checked={formData.isActive}
                  onCheckedChange={(checked: boolean) => {
                    setFormData(prev => ({ ...prev, isActive: checked }));
                  }}
                />
                <span className="text-sm text-gray-600">
                  {formData.isActive ? 'Активен' : 'Неактивен'}
                </span>
              </div>
            </div>
          </div>

          {/* Ошибки */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading || isUploading}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingUser ? 'Сохранение...' : 'Создание...'}
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {editingUser ? 'Сохранить' : 'Создать'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

