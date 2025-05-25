// components/admin/users/QuickActions.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Users, 
  UserCheck, 
  UserX, 
  Download, 
  Upload,
  Zap,
  AlertTriangle
} from "lucide-react";
import { User, UserRole } from "./UserCard";

interface QuickActionsProps {
  users: User[];
  userRole: UserRole;
  onBulkAction: (action: string, userIds: string[]) => void;
}

export function QuickActions({ users, userRole, onBulkAction }: QuickActionsProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const inactiveUsers = users.filter(u => !u.isActive);
  const recentUsers = users.filter(u => 
    Date.now() - u.createdAt < 7 * 24 * 60 * 60 * 1000 // Last 7 days
  );

  const quickActions = [
    {
      title: "Активировать всех неактивных",
      description: `${inactiveUsers.length} пользователей`,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      action: () => onBulkAction('activate', inactiveUsers.map(u => u.id)),
      disabled: inactiveUsers.length === 0
    },
    {
      title: "Экспорт пользователей",
      description: "Скачать CSV файл",
      icon: Download,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      action: () => onBulkAction('export', users.map(u => u.id)),
      disabled: users.length === 0
    },
    {
      title: "Массовая рассылка",
      description: "Отправить уведомление",
      icon: Zap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      action: () => onBulkAction('notify', users.filter(u => u.isActive).map(u => u.id)),
      disabled: users.filter(u => u.isActive).length === 0
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Быстрые действия
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Recent Activity */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900">Недавняя активность</h4>
              <Badge variant="secondary">{recentUsers.length} новых</Badge>
            </div>
            <p className="text-sm text-blue-700">
              {recentUsers.length > 0 
                ? `${recentUsers.length} пользователей зарегистрировано за последние 7 дней`
                : 'Нет новых регистраций за последние 7 дней'
              }
            </p>
          </div>

          {/* Warning for inactive users */}
          {inactiveUsers.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">Требует внимания</h4>
              </div>
              <p className="text-sm text-yellow-700">
                {inactiveUsers.length} неактивных пользователей требуют проверки
              </p>
            </div>
          )}

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <div 
                  key={action.title}
                  className={`${action.bgColor} ${action.borderColor} border rounded-lg p-4 transition-all hover:shadow-md`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className={`h-5 w-5 ${action.color}`} />
                    <h5 className="font-medium text-gray-900">{action.title}</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={action.disabled}
                    onClick={action.action}
                    className="w-full"
                  >
                    Выполнить
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
