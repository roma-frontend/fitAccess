// components/admin/analytics/Charts.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsData } from "./types";

interface ChartsProps {
  data: AnalyticsData;
}

export function Charts({ data }: ChartsProps) {
  // Простая реализация графика без внешних библиотек
  const LineChart = ({ data, title, color = "blue" }: { 
    data: Array<{ date: string; value: number }>, 
    title: string,
    color?: string 
  }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map(i => (
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
                stroke={color === "blue" ? "#3b82f6" : color === "green" ? "#10b981" : "#8b5cf6"}
                strokeWidth="2"
                points={data.map((point, index) => {
                  const x = (index / (data.length - 1)) * 400;
                  const y = 200 - ((point.value - minValue) / range) * 180;
                  return `${x},${y}`;
                }).join(' ')}
              />
              
              {/* Data points */}
              {data.map((point, index) => {
                const x = (index / (data.length - 1)) * 400;
                const y = 200 - ((point.value - minValue) / range) * 180;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={color === "blue" ? "#3b82f6" : color === "green" ? "#10b981" : "#8b5cf6"}
                  />
                );
              })}
            </svg>
            
            {/* Y-axis labels */}
            <div className="absolute left-5 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
              <span>{maxValue}</span>
              <span>{Math.round(maxValue * 0.75)}</span>
              <span>{Math.round(maxValue * 0.5)}</span>
              <span>{Math.round(maxValue * 0.25)}</span>
              <span>{minValue}</span>
            </div>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 -mb-6">
              {data.map((point, index) => (
                index % Math.ceil(data.length / 5) === 0 && (
                  <span key={index}>{new Date(point.date).toLocaleDateString('ru', { month: 'short', day: 'numeric' })}</span>
                )
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const BarChart = ({ data, title }: { 
    data: Array<{ name: string; value: number }>, 
    title: string 
  }) => {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-20 text-sm text-gray-600 truncate">{item.name}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
                <div className="w-16 text-sm font-medium text-gray-900 text-right">
                  {item.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Подготовка данных для графиков
  const userTrendData = data.users.registrationTrend.map(item => ({
    date: item.date,
    value: item.count
  }));

  const revenueTrendData = data.revenue.trend.map(item => ({
    date: item.date,
    value: item.amount
  }));

  const categoryData = Object.entries(data.products.byCategory).map(([name, value]) => ({
    name: name === 'supplements' ? 'Добавки' : 
          name === 'drinks' ? 'Напитки' :
          name === 'snacks' ? 'Снеки' : 'Мерч',
    value
  }));

  // Исправление: преобразуем revenue в value
  const topProductsData = data.revenue.byProduct.slice(0, 5).map(product => ({
    name: product.name,
    value: product.revenue // Преобразуем revenue в value
  }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <LineChart 
        data={userTrendData} 
        title="Регистрации пользователей" 
        color="blue"
      />
      
      <LineChart 
        data={revenueTrendData} 
        title="Динамика выручки" 
        color="green"
      />
      
      <BarChart 
        data={categoryData} 
        title="Продукты по категориям"
      />
      
      <BarChart 
        data={topProductsData} 
        title="Топ продукты по выручке"
      />
    </div>
  );
}
