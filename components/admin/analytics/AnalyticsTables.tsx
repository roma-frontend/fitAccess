// components/admin/analytics/AnalyticsTables.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalyticsData } from "./types";
import { TrendingUp, TrendingDown, Eye, Clock, Users } from "lucide-react";

interface AnalyticsTablesProps {
  data: AnalyticsData;
}

export function AnalyticsTables({ data }: AnalyticsTablesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Популярные страницы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.activity.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{page.page}</p>
                    <p className="text-sm text-gray-500">{page.views.toLocaleString()} просмотров</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {((page.views / data.activity.pageViews) * 100).toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Roles Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Распределение пользователей по ролям
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.users.byRole).map(([role, count], index) => {
              const roleNames = {
                'super-admin': 'Супер Администраторы',
                'admin': 'Администраторы',
                'manager': 'Менеджеры',
                'trainer': 'Тренеры',
                'member': 'Участники'
              };
              
              const roleColors = {
                'super-admin': 'bg-purple-100 text-purple-800',
                'admin': 'bg-red-100 text-red-800',
                'manager': 'bg-blue-100 text-blue-800',
                'trainer': 'bg-green-100 text-green-800',
                'member': 'bg-gray-100 text-gray-800'
              };

              const percentage = ((count / data.users.total) * 100).toFixed(1);

              return (
                <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className={roleColors[role as keyof typeof roleColors]}>
                      {roleNames[role as keyof typeof roleNames]}
                    </Badge>
                    <span className="text-sm text-gray-600">{count} пользователей</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{percentage}%</div>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Активность за последние 24 часа
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Новые регистрации</p>
                  <p className="text-sm text-gray-600">Пользователи присоединились</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">{data.users.new}</div>
                <TrendingUp className="h-4 w-4 text-green-500 ml-auto" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Активные сессии</p>
                  <p className="text-sm text-gray-600">Пользователи онлайн</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{data.activity.totalSessions}</div>
                <TrendingUp className="h-4 w-4 text-blue-500 ml-auto" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Продукты добавлены</p>
                  <p className="text-sm text-gray-600">Новые товары в каталоге</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">12</div>
                <TrendingUp className="h-4 w-4 text-purple-500 ml-auto" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Показатель отказов</p>
                  <p className="text-sm text-gray-600">Процент быстрых выходов</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-yellow-600">{data.activity.bounceRate}%</div>
                <TrendingDown className="h-4 w-4 text-red-500 ml-auto" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Структура выручки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Общая выручка</span>
                <span className="text-lg font-bold text-emerald-600">
                  {data.revenue.total.toLocaleString()} ₽
                </span>
              </div>
              <div className="text-xs text-gray-600">
                За весь период работы
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Месячная выручка</span>
                <span className="text-lg font-bold text-blue-600">
                  {data.revenue.monthly.toLocaleString()} ₽
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                +{data.revenue.growth}% к прошлому месяцу
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Топ товары по выручке:</h4>
              {data.revenue.byProduct.slice(0, 3).map((product, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600 truncate">{product.name}</span>
                  <span className="text-sm font-medium">{product.revenue.toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
