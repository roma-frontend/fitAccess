// components/ProgramsPageHeader.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Dumbbell, 
  Users, 
  Target,
  Heart,
  Clock,
  Menu,
  X,
  Search,
  Filter,
  Star
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProgramsPageHeaderProps {
  totalPrograms: number;
  categoriesCount: number;
  filteredCount: number;
  averageRating?: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  categories: string[];
  onCategoryChange: (category: string) => void;
}

export default function ProgramsPageHeader({ 
  totalPrograms, 
  categoriesCount, 
  filteredCount,
  averageRating = 4.8,
  searchTerm,
  onSearchChange,
  selectedCategory,
  categories,
  onCategoryChange
}: ProgramsPageHeaderProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const quickActions = [
    { href: "/trainers", label: "Тренеры", icon: Users },
  ];

  return (
    <>
      {/* Основной header */}
      <header className="bg-gradient-to-r from-blue-600 to-green-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Логотип и навигация назад */}
            <div className="flex items-center gap-3">
              
              <Link 
                href="/" 
                className="flex items-center gap-3 transition-all duration-200 hover:scale-105"
              >
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <div className="text-white">
                  <div className="text-xl font-bold">FitAccess</div>
                  <div className="text-xs text-blue-100 hidden sm:block">
                    Программы тренировок
                  </div>
                </div>
              </Link>
            </div>

            {/* Быстрые действия для десктопа */}
            <nav className="hidden md:flex items-center space-x-1">
              {quickActions.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Правая часть header */}
            <div className="flex items-center gap-4">
              {/* Статистика для десктопа */}
              <div className="hidden lg:flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4" />
                  <span>{totalPrograms} программ</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-300" />
                  <span>{averageRating}</span>
                </div>
                {filteredCount !== totalPrograms && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    Найдено: {filteredCount}
                  </Badge>
                )}
              </div>

              {/* Мобильное меню */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Мобильная навигация */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-white/20 py-4">
              <nav className="space-y-2">
                {quickActions.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
                
                {/* Статистика для мобильных */}
                <div className="pt-4 border-t border-white/20 space-y-2">
                  <div className="flex justify-between items-center px-4 py-2 text-white/90">
                    <span className="text-sm">Всего программ:</span>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {totalPrograms}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2 text-white/90">
                    <span className="text-sm">Средний рейтинг:</span>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {averageRating}
                    </Badge>
                  </div>
                  {filteredCount !== totalPrograms && (
                    <div className="flex justify-between items-center px-4 py-2 text-white/90">
                      <span className="text-sm">Найдено:</span>
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        {filteredCount}
                      </Badge>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Секция поиска и фильтров */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Hero текст */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Фитнес-программы
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {" "}для всех
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Выберите программу тренировок, которая подходит именно вам
            </p>
          </div>

          {/* Поиск */}
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Поиск программ..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Фильтры по категориям */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 hover:border-gray-400"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Статистические карточки */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-blue-600 mr-2" />
                <div className="text-2xl font-bold text-blue-600">{totalPrograms}</div>
              </div>
              <div className="text-sm text-gray-600">Всего программ</div>
            </Card>

            <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-green-600 mr-2" />
                <div className="text-2xl font-bold text-green-600">{categoriesCount}</div>
              </div>
              <div className="text-sm text-gray-600">Категорий</div>
            </Card>

            <Card className="p-4 text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-yellow-600 mr-2" />
                <div className="text-2xl font-bold text-yellow-600">{averageRating}</div>
              </div>
              <div className="text-sm text-gray-600">Средний рейтинг</div>
            </Card>

            <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-5 w-5 text-purple-600 mr-2" />
                <div className="text-2xl font-bold text-purple-600">{filteredCount}</div>
              </div>
              <div className="text-sm text-gray-600">
                {filteredCount === totalPrograms ? 'Доступно' : 'Найдено'}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
