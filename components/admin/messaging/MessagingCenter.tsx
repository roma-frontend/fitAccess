// components/messaging/MessageCenter.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Send, 
  Users, 
  Bell, 
  Search,
  Plus,
  Archive,
  Star,
  Paperclip,
  Phone,
  Mail
} from "lucide-react";
import { Message, MessageGroup, NotificationTemplate } from "./types";

interface MessageCenterProps {
  currentUserId: string;
  currentUserRole: string;
}

export function MessageCenter({ currentUserId, currentUserRole }: MessageCenterProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [groups, setGroups] = useState<MessageGroup[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState({
    type: 'direct' as Message['type'],
    subject: '',
    content: '',
    recipientIds: [] as string[],
    priority: 'normal' as Message['priority']
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMessages();
    loadGroups();
    loadTemplates();
  }, []);

  const loadMessages = async () => {
    // Загрузка сообщений из API
    const mockMessages: Message[] = [
      {
        _id: '1',
        type: 'notification',
        subject: 'Новое событие в расписании',
        content: 'Для вас запланирована персональная тренировка на завтра в 15:00',
        senderId: 'system',
        senderName: 'Система',
        senderRole: 'system',
        recipientIds: [currentUserId],
        recipientNames: ['Текущий пользователь'],
        priority: 'high',
        status: 'delivered',
        relatedTo: {
          type: 'event',
          id: 'event1',
          title: 'Персональная тренировка'
        },
        createdAt: new Date().toISOString(),
        isArchived: false
      },
      {
        _id: '2',
        type: 'direct',
        subject: 'Вопрос по тренировке',
        content: 'Здравствуйте! Можно ли перенести завтрашнюю тренировку на час позже?',
        senderId: 'client1',
        senderName: 'Анна Смирнова',
        senderRole: 'member',
        recipientIds: [currentUserId],
        recipientNames: ['Текущий пользователь'],
        priority: 'normal',
        status: 'delivered',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isArchived: false
      }
    ];
    setMessages(mockMessages);
  };

  const loadGroups = async () => {
    const mockGroups: MessageGroup[] = [
      {
        _id: '1',
        name: 'Все тренеры',
        description: 'Группа для общения всех тренеров',
        type: 'trainers',
        memberIds: ['trainer1', 'trainer2', 'trainer3'],
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        _id: '2',
        name: 'Активные участники',
        description: 'Группа активных участников фитнес-центра',
        type: 'members',
        memberIds: ['member1', 'member2', 'member3'],
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ];
    setGroups(mockGroups);
  };

  const loadTemplates = async () => {
    const mockTemplates: NotificationTemplate[] = [
      {
        _id: '1',
        name: 'Напоминание о тренировке',
        type: 'in-app',
        trigger: 'event_reminder',
        subject: 'Напоминание о тренировке',
        content: 'Напоминаем о предстоящей тренировке "{{eventTitle}}" {{eventDate}} в {{eventTime}}',
        variables: ['eventTitle', 'eventDate', 'eventTime'],
        isActive: true
      },
      {
        _id: '2',
        name: 'Добро пожаловать',
        type: 'email',
        trigger: 'new_member',
        subject: 'Добро пожаловать в FitAccess!',
        content: 'Здравствуйте, {{userName}}! Добро пожаловать в наш фитнес-центр. Ваш номер участника: {{memberNumber}}',
        variables: ['userName', 'memberNumber'],
        isActive: true
      }
    ];
    setTemplates(mockTemplates);
  };

  const sendMessage = async () => {
    if (!newMessage.content.trim()) return;

    const message: Message = {
      _id: Date.now().toString(),
      ...newMessage,
      senderId: currentUserId,
      senderName: 'Текущий пользователь',
      senderRole: currentUserRole,
      recipientNames: [], // Заполнить из базы пользователей
      status: 'sent',
      createdAt: new Date().toISOString(),
      isArchived: false
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage({
      type: 'direct',
      subject: '',
      content: '',
      recipientIds: [],
      priority: 'normal'
    });
  };

  const filteredMessages = messages.filter(message =>
    message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.senderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = messages.filter(m => 
    m.recipientIds.includes(currentUserId) && 
    !m.readAt?.[currentUserId]
  ).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Центр сообщений
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </h1>
        <p className="text-gray-600">Управление сообщениями и уведомлениями</p>
      </div>

      <Tabs defaultValue="messages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Сообщения
          </TabsTrigger>
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Написать
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Группы
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Шаблоны
          </TabsTrigger>
        </TabsList>

        {/* Список сообщений */}
        <TabsContent value="messages">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Список сообщений */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Входящие</CardTitle>
                    <Button size="sm" variant="outline">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                                            placeholder="Поиск сообщений..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredMessages.map(message => {
                      const isUnread = !message.readAt?.[currentUserId];
                      const isSelected = selectedMessage?._id === message._id;
                      
                      return (
                        <div
                          key={message._id}
                          onClick={() => setSelectedMessage(message)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-blue-100 border-blue-200' 
                              : isUnread 
                                ? 'bg-yellow-50 hover:bg-yellow-100' 
                                : 'hover:bg-gray-50'
                          } ${isUnread ? 'border-l-4 border-l-blue-500' : ''}`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${isUnread ? 'font-semibold' : 'font-medium'}`}>
                                {message.senderName}
                              </span>
                              {message.priority === 'high' && (
                                <Star className="h-3 w-3 text-orange-500" />
                              )}
                              {message.priority === 'urgent' && (
                                <Badge variant="destructive" className="text-xs">
                                  Срочно
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(message.createdAt).toLocaleDateString('ru')}
                            </span>
                          </div>
                          
                          <div className={`text-sm mb-1 ${isUnread ? 'font-medium' : ''}`}>
                            {message.subject || 'Без темы'}
                          </div>
                          
                          <div className="text-xs text-gray-600 truncate">
                            {message.content}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant={message.type === 'notification' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {message.type === 'direct' && 'Личное'}
                              {message.type === 'group' && 'Группа'}
                              {message.type === 'announcement' && 'Объявление'}
                              {message.type === 'notification' && 'Уведомление'}
                            </Badge>
                            
                            {message.attachments && message.attachments.length > 0 && (
                              <Paperclip className="h-3 w-3 text-gray-400" />
                            )}
                            
                            {message.relatedTo && (
                              <Badge variant="outline" className="text-xs">
                                {message.relatedTo.type === 'event' && '📅'}
                                {message.relatedTo.type === 'user' && '👤'}
                                {message.relatedTo.type === 'payment' && '💳'}
                                {message.relatedTo.type === 'membership' && '🏃'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Просмотр сообщения */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {selectedMessage.subject || 'Без темы'}
                          {selectedMessage.priority === 'urgent' && (
                            <Badge variant="destructive">Срочно</Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <span>От: {selectedMessage.senderName}</span>
                          <span>
                            {new Date(selectedMessage.createdAt).toLocaleString('ru')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Связанный объект */}
                      {selectedMessage.relatedTo && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 text-blue-800">
                            <span className="text-sm font-medium">
                              Связано с: {selectedMessage.relatedTo.title}
                            </span>
                            <Badge variant="outline" className="text-blue-600">
                              {selectedMessage.relatedTo.type === 'event' && 'Событие'}
                              {selectedMessage.relatedTo.type === 'user' && 'Пользователь'}
                              {selectedMessage.relatedTo.type === 'payment' && 'Платеж'}
                              {selectedMessage.relatedTo.type === 'membership' && 'Абонемент'}
                            </Badge>
                          </div>
                        </div>
                      )}
                      
                      {/* Содержимое сообщения */}
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-gray-900">
                          {selectedMessage.content}
                        </div>
                      </div>
                      
                      {/* Вложения */}
                      {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Вложения:</h4>
                          <div className="space-y-2">
                            {selectedMessage.attachments.map(attachment => (
                              <div key={attachment._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <Paperclip className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{attachment.name}</span>
                                <span className="text-xs text-gray-500">
                                  ({(attachment.size / 1024).toFixed(1)} KB)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Быстрые действия */}
                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            Ответить
                          </Button>
                          
                          {selectedMessage.senderRole === 'member' && (
                            <>
                              <Button size="sm" variant="outline" className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Позвонить
                              </Button>
                              <Button size="sm" variant="outline" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Выберите сообщение для просмотра</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Создание сообщения */}
        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Новое сообщение</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Тип сообщения</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={newMessage.type}
                      onChange={(e) => setNewMessage({...newMessage, type: e.target.value as Message['type']})}
                    >
                      <option value="direct">Личное сообщение</option>
                      <option value="group">Группе</option>
                      <option value="announcement">Объявление</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Приоритет</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={newMessage.priority}
                      onChange={(e) => setNewMessage({...newMessage, priority: e.target.value as Message['priority']})}
                    >
                      <option value="low">Низкий</option>
                      <option value="normal">Обычный</option>
                      <option value="high">Высокий</option>
                      <option value="urgent">Срочный</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Получатели</label>
                  <Input 
                    placeholder="Выберите получателей..."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Тема</label>
                  <Input 
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                    placeholder="Введите тему сообщения"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Сообщение</label>
                  <Textarea 
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                    placeholder="Введите текст сообщения..."
                    rows={6}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button onClick={sendMessage} className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Отправить
                  </Button>
                  <Button variant="outline">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Прикрепить файл
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Группы */}
        <TabsContent value="groups">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
              <Card key={group._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {group.name}
                  </CardTitle>
                  <Badge variant="outline">
                    {group.memberIds.length} участников
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {group.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Написать группе
                    </Button>
                    <Button size="sm" variant="outline">
                      Управление
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Кнопка создания новой группы */}
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center h-full">
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Создать группу
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Шаблоны */}
        <TabsContent value="templates">
          <div className="space-y-4">
            {templates.map(template => (
              <Card key={template._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      {template.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={template.isActive ? 'default' : 'secondary'}>
                        {template.isActive ? 'Активен' : 'Неактивен'}
                      </Badge>
                      <Badge variant="outline">
                        {template.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Тема:</h4>
                      <p className="text-sm text-gray-600">{template.subject}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Триггер:</h4>
                      <p className="text-sm text-gray-600">
                        {template.trigger === 'event_reminder' && 'Напоминание о событии'}
                        {template.trigger === 'payment_due' && 'Напоминание об оплате'}
                        {template.trigger === 'membership_expiry' && 'Истечение абонемента'}
                        {template.trigger === 'new_member' && 'Новый участник'}
                                                {template.trigger === 'manual' && 'Ручная отправка'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Содержимое:</h4>
                    <div className="p-3 bg-gray-50 rounded text-sm">
                      {template.content}
                    </div>
                  </div>
                  
                  {template.variables.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Переменные:</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.variables.map(variable => (
                          <Badge key={variable} variant="outline" className="text-xs">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      Редактировать
                    </Button>
                    <Button size="sm" variant="outline">
                      Тестировать
                    </Button>
                    <Button 
                      size="sm" 
                      variant={template.isActive ? "destructive" : "default"}
                    >
                      {template.isActive ? 'Деактивировать' : 'Активировать'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


