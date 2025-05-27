// components/admin/users/CreateUserDialog.tsx (обновленная версия)
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
import { Plus, User, Mail, Lock, Shield, Sparkles, UserPlus } from "lucide-react";
import { UserRole } from "./UserCard";

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
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
        <Button className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <UserPlus className="h-4 w-4 mr-2" />
          <span className="font-medium">Добавить пользователя</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-lg"></div>
        <div className="relative">
          <DialogHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Создать пользователя
            </DialogTitle>
            <p className="text-gray-600 mt-2">Добавьте нового пользователя в систему</p>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 text-blue-500" />
                  Полное имя
                </Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Введите полное имя"
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 bg-white/50"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="h-4 w-4 text-blue-500" />
                  Email адрес
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="user@example.com"
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 bg-white/50"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Lock className="h-4 w-4 text-blue-500" />
                  Пароль
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Введите надежный пароль"
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 bg-white/50"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="role" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Роль пользователя
                </Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value: UserRole) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 bg-white/50">
                    <SelectValue placeholder="Выберите роль" />
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
            </div>

            <div className="flex space-x-4 pt-6">
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Создание...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Создать пользователя
                  </div>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
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
