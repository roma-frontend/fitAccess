// components/admin/analytics/Charts.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsData } from "./types";

interface ChartsProps {
  data: AnalyticsData;
}

export function Charts({ data }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Users Registration Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Регистрации пользователей</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 40}
                  x2="400"
                  y2={i * 40}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              ))}

              {/* Data line */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                points={data.users.registrationTrend
                  .map((point, index) => {
                    const x = (index / (data.users.registrationTrend.length - 1)) * 400;
                    const maxValue = Math.max(...data.users.registrationTrend.map((d) => d.count));
                    const y = 200 - (point.count / (maxValue || 1)) * 180;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />

              {/* Data points */}
              {data.users.registrationTrend.map((point, index) => {
                const x = (index / (data.users.registrationTrend.length - 1)) * 400;
                const maxValue = Math.max(...data.users.registrationTrend.map((d) => d.count));
                const y = 200 - (point.count / (maxValue || 1)) * 180;
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#3b82f6"
                      className="hover:r-6 transition-all cursor-pointer"
                    />
                    <title>{`${point.date}: ${point.count} регистраций`}</title>
                  </g>
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Динамика выручки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 40}
                  x2="400"
                  y2={i * 40}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              ))}

              {/* Area gradient */}
              <defs>
                <linearGradient id="revenueAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <polygon
                fill="url(#revenueAreaGradient)"
                points={`0,200 ${data.revenue.trend
                  .map((point, index) => {
                    const x = (index / (data.revenue.trend.length - 1)) * 400;
                    const maxValue = Math.max(...data.revenue.trend.map((d) => d.amount));
                    const y = 200 - (point.amount / (maxValue || 1)) * 180;
                    return `${x},${y}`;
                  })
                  .join(" ")} 400,200`}
              />

              {/* Data line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                points={data.revenue.trend
                  .map((point, index) => {
                    const x = (index / (data.revenue.trend.length - 1)) * 400;
                    const maxValue = Math.max(...data.revenue.trend.map((d) => d.amount));
                    const y = 200 - (point.amount / (maxValue || 1)) * 180;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />

              {/* Data points */}
              {data.revenue.trend.map((point, index) => {
                const x = (index / (data.revenue.trend.length - 1)) * 400;
                const maxValue = Math.max(...data.revenue.trend.map((d) => d.amount));
                const y = 200 - (point.amount / (maxValue || 1)) * 180;
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#10b981"
                      className="hover:r-6 transition-all cursor-pointer"
                    />
                    <title>{`${point.date}: ${point.amount.toLocaleString()} ₽`}</title>
                  </g>
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Product Sales Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Продажи продуктов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 40}
                  x2="400"
                  y2={i * 40}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              ))}

              {/* Sales line */}
              <polyline
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3"
                points={data.products.salesTrend
                  .map((point, index) => {
                    const x = (index / (data.products.salesTrend.length - 1)) * 400;
                    const maxValue = Math.max(...data.products.salesTrend.map((d) => d.sales));
                    const y = 200 - (point.sales / (maxValue || 1)) * 180;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />

              {/* Data points */}
              {data.products.salesTrend.map((point, index) => {
                const x = (index / (data.products.salesTrend.length - 1)) * 400;
                const maxValue = Math.max(...data.products.salesTrend.map((d) => d.sales));
                const y = 200 - (point.sales / (maxValue || 1)) * 180;
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#8b5cf6"
                      className="hover:r-6 transition-all cursor-pointer"
                    />
                    <title>{`${point.date}: ${point.sales} продаж, ${point.revenue.toLocaleString()} ₽`}</title>
                  </g>
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* User Roles Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Распределение пользователей</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {(() => {
                const total = Object.values(data.users.byRole).reduce((sum, count) => sum + count, 0);
                const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
                let currentAngle = 0;
                
                return Object.entries(data.users.byRole).map(([role, count], index) => {
                  const percentage = count / total;
                  const angle = percentage * 360;
                  const startAngle = currentAngle;
                  const endAngle = currentAngle + angle;
                  
                  // Convert to radians
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;
                  
                  // Calculate path
                  const largeArcFlag = angle > 180 ? 1 : 0;
                  const x1 = 100 + 80 * Math.cos(startRad);
                  const y1 = 100 + 80 * Math.sin(startRad);
                  const x2 = 100 + 80 * Math.cos(endRad);
                  const y2 = 100 + 80 * Math.sin(endRad);
                  
                  const pathData = [
                    `M 100 100`,
                    `L ${x1} ${y1}`,
                    `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    `Z`
                  ].join(' ');
                  
                  currentAngle += angle;
                  
                  return (
                    <g key={role}>
                      <path
                        d={pathData}
                        fill={colors[index % colors.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                      <title>{`${role}: ${count} (${(percentage * 100).toFixed(1)}%)`}</title>
                    </g>
                  );
                });
              })()}
            </svg>
          </div>
          
          {/* Legend */}
          <div className="mt-4 space-y-2">
            {Object.entries(data.users.byRole).map(([role, count], index) => {
              const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
              const roleNames = {
                "super-admin": "Супер Админы",
                admin: "Админы",
                manager: "Менеджеры",
                trainer: "Тренеры",
                member: "Участники",
              };
              
              return (
                <div key={role} className="flex items-center space-x-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span>{roleNames[role as keyof typeof roleNames] || role}: {count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
