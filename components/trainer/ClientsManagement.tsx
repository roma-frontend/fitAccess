// components/trainer/ClientsManagement.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTrainer } from '@/contexts/TrainerContext';
import { 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar, 
  ChevronRight,
  Edit,
  Trash2,
  MoreVertical
} from "lucide-react";
import AddClientModal from './modals/AddClientModal';
import EditClientModal from './modals/EditClientModal';
import DeleteConfirmModal from './modals/DeleteConfirmModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ClientsManagement() {
  const { clients, deleteClient } = useTrainer();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showAddClient, setShowAddClient] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [deletingClient, setDeletingClient] = useState<string | null>(null);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || client.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'trial': return 'Пробный';
      case 'inactive': return 'Неактивный';
      default: return status;
    }
  };

  const handleDeleteClient = (clientId: string) => {
    deleteClient(clientId);
    setDeletingClient(null);
  };

  return (
    <div className="space-y-6">
      {/* Поиск и фильтры */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Поиск клиентов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все статусы</option>
                <option value="active">Активные</option>
                <option value="trial">Пробные</option>
                <option value="inactive">Неактивные</option>
              </select>
              <Button onClick={() => setShowAddClient(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить клиента
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список клиентов */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={client.avatar} />
                      <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{client.name}</h3>
                      <p className="text-sm text-gray-600">{client.currentProgram}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(client.status)}>
                      {getStatusText(client.status)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingClient(client.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletingClient(client.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Прогресс:</span>
                    <span className="font-medium">{client.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${client.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Тренировок:</span>
                    <span className="font-medium">{client.totalWorkouts}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {client.goals.map((goal, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {goal}
                      </Badge>
                    ))}
                  </div>

                  {client.notes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Заметки:</strong> {client.notes}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button size="sm" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Написать
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Тренировка
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingClient(client.id)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Клиенты не найдены</h3>
            <p className="text-gray-500 mb-4">Попробуйте изменить параметры поиска</p>
            <Button onClick={() => setShowAddClient(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить первого клиента
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Модальные окна */}
      <AddClientModal 
        isOpen={showAddClient} 
        onClose={() => setShowAddClient(false)} 
      />
      
      {editingClient && (
        <EditClientModal 
          isOpen={!!editingClient}
          clientId={editingClient}
          onClose={() => setEditingClient(null)} 
        />
      )}

      {deletingClient && (
        <DeleteConfirmModal
          isOpen={!!deletingClient}
          title="Удалить клиента"
          message={`Вы уверены, что хотите удалить клиента ${clients.find(c => c.id === deletingClient)?.name}? Это действие нельзя отменить.`}
          onConfirm={() => handleDeleteClient(deletingClient)}
          onClose={() => setDeletingClient(null)}
        />
      )}
    </div>
  );
}

