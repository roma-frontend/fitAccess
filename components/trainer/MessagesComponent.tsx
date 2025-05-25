// components/trainer/MessagesComponent.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTrainer } from '@/contexts/TrainerContext';
import { 
  MessageSquare, 
  Send,
  Search,
  Clock
} from "lucide-react";

export default function MessagesComponent() {
  const { clients, messages, sendMessage, markAsRead } = useTrainer();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientMessages = messages.filter(m => m.clientId === selectedClientId);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUnreadCount = (clientId: string) => {
    return messages.filter(m => m.clientId === clientId && !m.read && !m.isFromTrainer).length;
  };

  const getLastMessage = (clientId: string) => {
    const clientMsgs = messages.filter(m => m.clientId === clientId);
    return clientMsgs[clientMsgs.length - 1];
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedClientId) {
      sendMessage(selectedClientId, newMessage.trim());
      setNewMessage('');
    }
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    // Отмечаем сообщения как прочитанные
    messages
      .filter(m => m.clientId === clientId && !m.read && !m.isFromTrainer)
      .forEach(m => markAsRead(m.id));
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  };

  // Быстрые ответы
  const quickReplies = [
    "Напоминаю о завтрашней тренировке в {time}. Увидимся!",
    "К сожалению, нужно отменить тренировку. Можем перенести?",
    "Отличная работа на тренировке! Продолжаем в том же духе 💪",
    "Не забудьте взять воду и полотенце на тренировку",
    "Как самочувствие после вчерашней тренировки?"
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Список чатов */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Чаты
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Поиск клиентов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filteredClients.map((client) => {
                const unreadCount = getUnreadCount(client.id);
                const lastMessage = getLastMessage(client.id);
                const isSelected = selectedClientId === client.id;

                return (
                  <div 
                    key={client.id} 
                    onClick={() => handleSelectClient(client.id)}
                    className={`p-4 cursor-pointer border-b last:border-b-0 transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={client.avatar} />
                        <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{client.name}</p>
                          {unreadCount > 0 && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                        {lastMessage && (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-600 truncate">
                              {lastMessage.isFromTrainer ? 'Вы: ' : ''}
                              {lastMessage.content}
                            </p>
                            <p className="text-xs text-gray-500 ml-2">
                              {formatTime(lastMessage.timestamp)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Окно чата */}
        <Card className="lg:col-span-2">
          {selectedClient ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedClient.avatar} />
                    <AvatarFallback>{selectedClient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedClient.name}</CardTitle>
                    <p className="text-sm text-gray-600">{selectedClient.currentProgram}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* Сообщения */}
                <div className="h-96 p-4 overflow-y-auto space-y-4">
                  {clientMessages.length > 0 ? (
                    clientMessages.map((message, index) => {
                      const showDate = index === 0 || 
                        formatDate(message.timestamp) !== formatDate(clientMessages[index - 1].timestamp);

                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="text-center my-4">
                              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                          )}
                          
                          <div className={`flex ${message.isFromTrainer ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.isFromTrainer 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.isFromTrainer ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Начните общение с {selectedClient.name}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Поле ввода */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Введите сообщение..." 
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Выберите чат</h3>
                <p className="text-gray-500">Выберите клиента из списка, чтобы начать общение</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Быстрые ответы */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые ответы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickReplies.map((reply, index) => (
              <Button 
                key={index}
                variant="outline" 
                className="justify-start h-auto p-4 text-left"
                onClick={() => selectedClientId && sendMessage(selectedClientId, reply)}
                disabled={!selectedClientId}
              >
                <div>
                  <p className="font-medium text-sm mb-1">Шаблон {index + 1}</p>
                  <p className="text-xs text-gray-600">{reply}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
