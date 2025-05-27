// components/admin/users/EditUserDialog.tsx (обновленная версия)
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Edit, User, Mail, Shield, UserCheck, Save, Sparkles } from "lucide-react";
import { User as UserType, UserRole } from "./UserCard";

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface EditUserDialogProps {
  user: UserType | null;
  userRole: UserRole;
  onClose: () => void;
  onUpdateUser: (id: string, updates: Partial<UserType>) => Promise<void>;
}

export function EditUserDialog({ user, userRole, onClose, onUpdateUser }: EditUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    role: 'member' as UserRole,
    isActive: true
  });

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });
    }
  }, [user]);

  const getAvailableRoles = (): RoleOption[] => {
    const allRoles = [
      { 
        value: 'admin' as UserRole, 
        label: 'Администратор', 
        description: 'Полный доступ к системе',
        icon: Shield,
        color: 'text-red-600'
      },
      { 
        value: 'manager' as UserRole, 
        label: 'Менеджер', 
        description: 'Управление операциями',
        icon: User,
        color: 'text-blue-600'
      },
      { 
        value: 'trainer' as UserRole, 
        label: 'Тренер', 
        description: 'Ведение тренировок',
        icon: User,
        color: 'text-green-600'
      },
      { 
        value: 'member' as UserRole, 
        label: 'Участник', 
        description: 'Базовые функции',
        icon: User,
        color: 'text-gray-600'
      }
    ];

    switch (userRole) {
      case 'super-admin':
        return allRoles;
      case 'admin':
        return allRoles.filter(r => r.value !== 'admin');
      case 'manager':
        return allRoles.filter(r => !['admin', 'manager'].includes(r.value));
      default:
        return allRoles.filter(r => r.value === 'member');
    }
  };

  const handleSubmit = async () => {
    if (!user || !editData.name || !editData.email) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    try {
      await onUpdateUser(user.id, editData);
      onClose();
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-lg"></div>
        <div className="relative">
          <DialogHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Edit className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Редактировать пользователя
            </DialogTitle>
            <p className="text-gray-600 mt-2">Обновите информацию о пользователе {user.name}</p>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <Label htmlFor="edit-name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 text-green-500" />
                  Полное имя
                </Label>
                <Input
                  id="edit-name"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200 bg-white/50"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="edit-email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="h-4 w-4 text-green-500" />
                  Email адрес
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200 bg-white/50"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="edit-role" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Shield className="h-4 w-4 text-green-500" />
                  Роль пользователя
                </Label>
                <Select 
                  value={editData.role} 
                  onValueChange={(value: UserRole) => setEditData({...editData, role: value})}
                >
                  <SelectTrigger className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200 bg-white/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/20">
                    {getAvailableRoles().map((role) => {
                      const Icon = role.icon;
                      return (
                        <SelectItem key={role.value} value={role.value} className="py-3">
                          <div className="flex items-center gap-3">
                            <Icon className={`h-4 w-4 ${role.color}`} />
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-xs text-gray-500">{role.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5 text-gray-600" />
                    <div>
                      <Label htmlFor="edit-active" className="text-sm font-medium text-gray-900">
                        Активный пользователь
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        Активные пользователи могут входить в систему
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="edit-active"
                    checked={editData.isActive}
                    onCheckedChange={(checked) => setEditData({...editData, isActive: checked})}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-6">
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex-1 h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Сохранение...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Сохранить изменения
                  </div>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 h-12 border-gray-200 hover:bg-gray-50 transition-all duration-200"
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

