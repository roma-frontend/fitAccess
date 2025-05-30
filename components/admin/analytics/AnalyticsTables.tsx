// components/admin/analytics/AnalyticsTables.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalyticsData } from "./types";

interface AnalyticsTablesProps {
  data: AnalyticsData;
}

export function AnalyticsTables({ data }: AnalyticsTablesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Products by Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Топ продукты по выручке</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.revenue.byProduct.slice(0, 10).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      {((product.revenue / data.revenue.total) * 100).toFixed(1)}% от общей выручки
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-emerald-600">
                    {product.revenue.toLocaleString()} ₽
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Топ {index + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Pages by Views */}
      <Card>
        <CardHeader>
          <CardTitle>Популярные страницы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.activity.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 font-mono text-sm">
                      {page.page}
                    </div>
                    <div className="text-sm text-gray-500">
                      {((page.views / data.activity.pageViews) * 100).toFixed(1)}% от всех просмотров
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">
                    {page.views.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">просмотров</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Categories Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Категории продуктов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(data.products.byCategory)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count], index) => {
                const categoryNames = {
                  supplements: "Добавки",
                  drinks: "Напитки",
                  snacks: "Снеки",
                  merchandise: "Мерч",
                };
                
                const percentage = ((count / data.products.total) * 100).toFixed(1);
                const colors = ["bg-purple-100 text-purple-600", "bg-blue-100 text-blue-600", "bg-green-100 text-green-600", "bg-yellow-100 text-yellow-600"];
                
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${colors[index % colors.length]}`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {categoryNames[category as keyof typeof categoryNames] || category}
                        </div>
                        <div className="text-sm text-gray-500">{percentage}% от всех продуктов</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-700">{count}</div>
                      <div className="text-xs text-gray-500">продуктов</div>
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
          <CardTitle>Сводка активности</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {data.activity.totalSessions}
                </div>
                <div className="text-sm text-gray-600">Всего сессий</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(data.activity.averageSessionTime / 60)}м
                </div>
                <div className="text-sm text-gray-600">Среднее время</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {data.activity.pageViews.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Просмотры</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {data.activity.bounceRate}%
                </div>
                <div className="text-sm text-gray-600">Отказы</div>
              </div>
            </div>

            {/* Registration Trend Mini Chart */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Регистрации за неделю</div>
              <div className="flex items-end space-x-1 h-16">
                {data.users.registrationTrend.map((day, index) => {
                  const maxValue = Math.max(...data.users.registrationTrend.map(d => d.count));
                  const height = maxValue > 0 ? (day.count / maxValue) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                        style={{ height: `${height}%`, minHeight: day.count > 0 ? '4px' : '2px' }}
                        title={`${day.date}: ${day.count} регистраций`}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(day.date).toLocaleDateString('ru', { weekday: 'short' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
