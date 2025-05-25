// components/admin/users/CreateUserDialog.tsx
"use client";

import { useState } from 'react';
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, User, Mail, Lock, Shield } from "lucide-react";
import { UserRole } from "./UserCard";

interface RoleOption {
  value: UserRole;
  label: string;
}

interface CreateUserDialogProps {
  userRole: UserRole;
  onCreateUser: (userData: {
    email: string;
    password: string;
    role: UserRole;
    name: string;
  }) => Promise<void>;
}

export function CreateUserDialog({ userRole, onCreateUser }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'member' as UserRole,
    name: ''
  });

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
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    try {
      await onCreateUser(newUser);
      setNewUser({ email: '', password: '', role: 'member', name: '' });
      setOpen(false);
    } catch (error) {
      console.error('Ошибка создания пользователя:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Добавить пользователя
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Создать нового пользователя
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Полное имя
              </Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                placeholder="Введите полное имя"
                className="transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email адрес
              </Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="user@example.com"
                                className="transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Пароль
              </Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="Введите надежный пароль"
                className="transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Роль пользователя
              </Label>
              <Select 
                value={newUser.role} 
                onValueChange={(value: UserRole) => setNewUser({...newUser, role: value})}
              >
                <SelectTrigger className="transition-all focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Выберите роль" />
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
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? 'Создание...' : 'Создать пользователя'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
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

