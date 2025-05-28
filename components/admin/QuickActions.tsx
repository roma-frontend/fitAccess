// components/admin/QuickActions.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePersonalizedActions } from '@/hooks/usePersonalizedActions';
import { useAuth } from '@/hooks/useAuth';
import { useRoleTexts } from '@/lib/roleTexts';
import {
  Zap,
  Plus,
  BarChart3,
  Settings,
  MessageSquare,
  ChevronRight,
  Star,
  Clock,
  Users,
  Calendar,
  Target,
  Activity,
  UserPlus,
  FileText,
  TrendingUp,
  CreditCard,
  Shield,
  AlertTriangle,
  DollarSign,
  CalendarPlus
} from "lucide-react";

// Маппинг иконок
const iconMap = {
  Shield,
  Activity,
  BarChart3,
  AlertTriangle,
  UserPlus,
  DollarSign,
  CreditCard,
  TrendingUp,
  Calendar,
  Users,
  Settings,
  MessageSquare,
  CalendarPlus,
  FileText,
  Target,
  Clock,
  Plus,
  Star
};

interface QuickActionsProps {
  variant?: 'compact' | 'expanded';
  showCategories?: boolean;
  maxActions?: number;
}

export function QuickActions({ 
  variant = 'expanded', 
  showCategories = true,
  maxActions = 6 
}: QuickActionsProps) {
  const { user } = useAuth(); // Используем user вместо userRole
  const userRole = user?.role; // Получаем роль из user
  const roleTexts = useRoleTexts(userRole);
  const { actions, actionsByCategory, recommendedActions, executeAction } = usePersonalizedActions();
  const [selectedCategory, setSelectedCategory] = useState<string>('create');

  // Получаем иконку по названию
  const getIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Plus;
  };

  // Получаем цвет для категории
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'create':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'manage':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'analyze':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'communicate':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Получаем название категории
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'create':
        return 'Создание';
      case 'manage':
        return 'Управление';
      case 'analyze':
        return 'Аналитика';
      case 'communicate':
        return 'Общение';
      default:
        return 'Другое';
    }
  };

  // Получаем приоритетный цвет
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // Если пользователь не загружен
  if (!user || !userRole) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm">Загрузка действий...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Быстрые действия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {recommendedActions.slice(0, maxActions).map((action) => {
              const Icon = getIcon(action.icon);
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={() => executeAction(action.id)}
                >
                  <Icon className="h-5 w-5 text-blue-600" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {action.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          {roleTexts.quickActionsTitle || 'Быстрые действия'}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Персонализированные действия для вашей роли
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Рекомендуемые действия */}
        {recommendedActions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-yellow-500" />
              <h3 className="font-medium text-gray-900">Рекомендуемые</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recommendedActions.map((action) => {
                const Icon = getIcon(action.icon);
                return (
                  <div
                    key={action.id}
                    className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer group"
                    onClick={() => executeAction(action.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Icon className="h-5 w-5 text-yellow-600" />
                      <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300">
                        Важно
                      </Badge>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1 group-hover:text-yellow-800">
                      {action.label}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {action.description}
                    </p>
                    <div className="flex items-center justify-end mt-3">
                      <ChevronRight className="h-4 w-4 text-yellow-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Действия по категориям */}
        {showCategories && Object.keys(actionsByCategory).length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Все действия</h3>
            
            {/* Переключатель категорий */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(actionsByCategory).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`${selectedCategory === category ? '' : getCategoryColor(category)}`}
                >
                  {getCategoryName(category)}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {actionsByCategory[category].length}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Действия выбранной категории */}
            {actionsByCategory[selectedCategory] && (
              <div className="space-y-3">
                {actionsByCategory[selectedCategory].map((action) => {
                  const Icon = getIcon(action.icon);
                  return (
                    <div
                      key={action.id}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => executeAction(action.id)}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(selectedCategory)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                            {action.label}
                          </h4>
                          {action.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">
                              Приоритет
                            </Badge>
                          )}
                          {action.roleSpecific && (
                            <Badge variant="outline" className="text-xs">
                              Для {roleTexts.roleDisplayName}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {action.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(action.priority)}`} />
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Если нет доступных действий */}
        {actions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Нет доступных действий</h3>
            <p className="text-sm">
              Действия появятся в зависимости от ваших прав доступа и текущего контекста
            </p>
          </div>
        )}

        {/* Дополнительная информация для пользователя */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span>Доступно действий: {actions.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Обновлено только что</span>
            </div>
          </div>
        </div>

        {/* Персонализированные подсказки */}
        {userRole && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Star className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 mb-1">
                  Совет для {roleTexts.roleDisplayName}
                </div>
                <div className="text-blue-700">
                  {userRole === 'super-admin' && 'Регулярно проверяйте системные логи и создавайте резервные копии'}
                  {userRole === 'admin' && 'Отслеживайте финансовые показатели и анализируйте отзывы клиентов'}
                  {userRole === 'manager' && 'Оптимизируйте расписание и следите за эффективностью команды'}
                  {userRole === 'trainer' && 'Обновляйте программы тренировок и поддерживайте связь с клиентами'}
                  {userRole === 'member' && 'Записывайтесь на новые занятия и отслеживайте свой прогресс'}
                  {userRole === 'client' && 'Обсуждайте цели с тренером и ведите дневник тренировок'}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
