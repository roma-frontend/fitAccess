// components/admin/TrainersManagement.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  MessageSquare,
  Calendar,
  TrendingUp,
  Star,
  Clock,
  Target,
  Phone,
  Mail,
  MoreVertical,
  Activity
} from "lucide-react";
// components/admin/TrainersManagement.tsx (продолжение)
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSuperAdmin, type TrainerData, type ClientData } from '@/contexts/SuperAdminContext';
import { useSchedule } from '@/contexts/ScheduleContext';

interface TrainersManagementProps {
  onQuickMessage: (recipients: Array<{
    id: string;
    name: string;
    role: string;
    phone?: string;
    email?: string;
  }>) => void;
}

export default function TrainersManagement({ onQuickMessage }: TrainersManagementProps) {
  const { trainers, getTrainerStats, getTrainerClients } = useSuperAdmin();
  const { events } = useSchedule();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);

  const filteredTrainers = trainers.filter((trainer: TrainerData) => {
    const matchesSearch = trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainer.specializations.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || trainer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 70) return 'text-orange-600';
    if (rate >= 50) return 'text-green-600';
    return 'text-blue-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleViewTrainer = (trainerId: string) => {
    setSelectedTrainer(trainerId);
  };

  const handleMessageTrainer = (trainer: TrainerData) => {
    onQuickMessage([{
      id: trainer.id,
      name: trainer.name,
      role: trainer.role,
      phone: trainer.phone,
      email: trainer.email
    }]);
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Управление тренерами</h2>
          <p className="text-gray-600">
            {filteredTrainers.length} из {trainers.length} тренеров
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск тренеров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
          </select>

          <Button 
            onClick={() => onQuickMessage(trainers.map(t => ({
              id: t.id,
              name: t.name,
              role: t.role,
              phone: t.phone,
              email: t.email
            })))}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Написать всем
          </Button>
        </div>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTrainers.map(trainer => {
          const stats = getTrainerStats(trainer.id);
          const trainerEvents = events.filter(e => e.trainerId === trainer.id);
          const clients = getTrainerClients(trainer.id);
          
          // Вычисляем загрузку (примерная формула)
          const utilizationRate = Math.min(Math.round((stats.thisWeekEvents / 40) * 100), 100);
          
          return (
            <Card key={trainer.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={trainer.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {trainer.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{trainer.name}</h3>
                      <p className="text-sm text-gray-600">{trainer.role}</p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewTrainer(trainer.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Подробности
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMessageTrainer(trainer)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Написать
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="h-4 w-4 mr-2" />
                        Расписание
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(trainer.status)}>
                    {trainer.status === 'active' ? 'Активен' : 
                     trainer.status === 'inactive' ? 'Неактивен' : 'Заблокирован'}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{trainer.rating}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Specializations */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Специализации:</p>
                  <div className="flex flex-wrap gap-1">
                    {trainer.specializations.map((spec: string) => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">{trainer.activeClients}</p>
                    <p className="text-xs text-gray-600">Активных клиентов</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">{stats.thisWeekEvents}</p>
                    <p className="text-xs text-gray-600">Тренировок в неделю</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-lg font-bold text-purple-600">{trainer.totalWorkouts}</p>
                    <p className="text-xs text-gray-600">Всего тренировок</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-lg font-bold text-orange-600">
                      {(trainer.monthlyRevenue / 1000).toFixed(0)}К
                    </p>
                    <p className="text-xs text-gray-600">Выручка в месяц</p>
                  </div>
                </div>

                {/* Utilization */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Загрузка</span>
                    <span className={`font-medium ${getUtilizationColor(utilizationRate)}`}>
                      {utilizationRate}%
                    </span>
                  </div>
                  <Progress value={utilizationRate} className="h-2" />
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-3 w-3" />
                    <span>{trainer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{trainer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>
                      {trainer.workingHours.start} - {trainer.workingHours.end}
                    </span>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Activity className="h-3 w-3" />
                    <span>
                      Последняя активность: {new Date(trainer.lastActivity).toLocaleString('ru')}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleViewTrainer(trainer.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Подробнее
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleMessageTrainer(trainer)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Связаться
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trainer Details Modal */}
      {selectedTrainer && (
        <TrainerDetailsModal
          trainerId={selectedTrainer}
          isOpen={!!selectedTrainer}
          onClose={() => setSelectedTrainer(null)}
        />
      )}
    </div>
  );
}

// Компонент модального окна с подробностями тренера
function TrainerDetailsModal({ 
  trainerId, 
  isOpen, 
  onClose 
}: { 
  trainerId: string; 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const { trainers, getTrainerStats, getTrainerClients } = useSuperAdmin();
  const { events } = useSchedule();
  
  const trainer = trainers.find(t => t.id === trainerId);
  const stats = getTrainerStats(trainerId);
  const trainerEvents = events.filter(e => e.trainerId === trainerId);
  const clients = getTrainerClients(trainerId);

  if (!trainer) return null;

  const upcomingEvents = trainerEvents
    .filter(e => 
      new Date(e.startTime) > new Date() && 
      e.status !== 'cancelled'
    )
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={trainer.avatar} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                    {trainer.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{trainer.name}</CardTitle>
                  <p className="text-gray-600">{trainer.role}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(trainer.status)}>
                      {trainer.status === 'active' ? 'Активен' : 'Неактивен'}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{trainer.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={onClose}>
                Закрыть
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{trainer.activeClients}</p>
                <p className="text-sm text-gray-600">Активных клиентов</p>
                <p className="text-xs text-gray-500">из {trainer.totalClients} всего</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.thisWeekEvents}</p>
                <p className="text-sm text-gray-600">Тренировок в неделю</p>
                <p className="text-xs text-gray-500">{stats.thisMonthEvents} в месяце</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{trainer.totalWorkouts}</p>
                <p className="text-sm text-gray-600">Всего тренировок</p>
                <p className="text-xs text-gray-500">{stats.completedEvents} завершено</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {(trainer.monthlyRevenue / 1000).toFixed(0)}К ₽
                </p>
                <p className="text-sm text-gray-600">Выручка в месяц</p>
                <p className="text-xs text-gray-500">средний чек</p>
              </div>
            </div>

            {/* Contact and Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Контактная информация</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{trainer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{trainer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>В команде с {new Date(trainer.joinDate).toLocaleDateString('ru')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Рабочие часы</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{trainer.workingHours.start} - {trainer.workingHours.end}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {trainer.workingHours.days.map((day: number) => {
                        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
                        return days[day];
                      }).join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div>
              <h4 className="font-semibold mb-3">Специализации</h4>
              <div className="flex flex-wrap gap-2">
                {trainer.specializations.map((spec: string) => (
                  <Badge key={spec} variant="outline">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div>
              <h4 className="font-semibold mb-3">Предстоящие тренировки</h4>
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Предстоящих тренировок нет</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map(event => (
                    <div key={event._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(event.startTime).toLocaleString('ru')}
                          {event.clientName && ` • ${event.clientName}`}
                        </p>
                      </div>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Clients */}
            <div>
              <h4 className="font-semibold mb-3">Клиенты ({clients.length})</h4>
              {clients.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Клиентов нет</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {clients.slice(0, 6).map((client: ClientData) => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-gray-600">{client.currentProgram}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{client.progress}%</p>
                        <Badge variant="outline" className="text-xs">
                          {client.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {clients.length > 6 && (
                    <div className="col-span-2 text-center text-sm text-gray-500">
                      +{clients.length - 6} клиентов
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


