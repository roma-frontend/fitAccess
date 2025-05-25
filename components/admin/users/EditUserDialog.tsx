// components/admin/users/EditUserDialog.tsx
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
import { Edit, User, Mail, Shield, UserCheck } from "lucide-react";
import { User as UserType, UserRole } from "./UserCard";

interface RoleOption {
  value: UserRole;
  label: string;
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
    switch (userRole) {
      case 'super-admin':
        return [
          { value: 'admin', label: 'Администратор' },
          { value: 'manager', label: 'Менеджер' },
          { value: 'trainer', label: 'Тренер' },
          { value: 'member', label: 'Участник' }
        ];
      case 'admin':
        return [
          { value: 'manager', label: 'Менеджер' },
          { value: 'trainer', label: 'Тренер' },
          { value: 'member', label: 'Участник' }
        ];
      case 'manager':
        return [
          { value: 'trainer', label: 'Тренер' },
          { value: 'member', label: 'Участник' }
        ];
      default:
        return [{ value: 'member', label: 'Участник' }];
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Редактировать пользователя
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Полное имя
              </Label>
              <Input
                id="edit-name"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                className="transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email адрес
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({...editData, email: e.target.value})}
                className="transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Роль пользователя
              </Label>
              <Select 
                value={editData.role} 
                onValueChange={(value: UserRole) => setEditData({...editData, role: value})}
              >
                <SelectTrigger className="transition-all focus:ring-2 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRoles().map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-gray-600" />
                <Label htmlFor="edit-active" className="text-sm font-medium">
                  Активный пользователь
                </Label>
              </div>
              <Switch
                id="edit-active"
                checked={editData.isActive}
                onCheckedChange={(checked) => setEditData({...editData, isActive: checked})}
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
