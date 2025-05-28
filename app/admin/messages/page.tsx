// app/admin/messages/page.tsx
"use client";

import { useState, useEffect } from "react";
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
  Mail,
  Filter,
  MoreHorizontal,
  Eye,
  Reply,
  Forward,
  Trash2,
  Settings,
  ArrowLeft,
  RefreshCw,
  Router,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import {
  AdminSecondHeader,
  MobileActionGroup,
  ResponsiveButton,
} from "@/components/admin/users/AdminSecondHeader";

// Типы для сообщений
interface Message {
  _id: string;
  type: "direct" | "group" | "announcement" | "notification";
  subject?: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientIds: string[];
  recipientNames: string[];
  groupId?: string;
  groupName?: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "draft" | "sent" | "delivered" | "read";
  attachments?: MessageAttachment[];
  relatedTo?: {
    type: "event" | "user" | "payment" | "membership";
    id: string;
    title: string;
  };
  createdAt: string;
  readAt?: Record<string, string>;
  isArchived: boolean;
  tags?: string[];
}

interface MessageAttachment {
  _id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface NotificationTemplate {
  _id: string;
  name: string;
  type: "email" | "sms" | "push" | "in-app";
  trigger:
    | "manual"
    | "event_reminder"
    | "payment_due"
    | "membership_expiry"
    | "new_member";
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
}

interface MessageGroup {
  _id: string;
  name: string;
  description?: string;
  type: "trainers" | "members" | "staff" | "custom";
  memberIds: string[];
  memberNames: string[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [groups, setGroups] = useState<MessageGroup[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [currentUserId] = useState("current-user");
  const [currentUserRole] = useState("super-admin");
  const router = useRouter();

  // Состояние для создания нового сообщения
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessage, setNewMessage] = useState({
    type: "direct" as Message["type"],
    subject: "",
    content: "",
    recipientIds: [] as string[],
    priority: "normal" as Message["priority"],
    groupId: "",
  });

  useEffect(() => {
    loadMessages();
    loadGroups();
    loadTemplates();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      // Имитация API запроса
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockMessages: Message[] = [
        {
          _id: "1",
          type: "notification",
          subject: "Новое событие в расписании",
          content:
            "Для вас запланирована персональная тренировка на завтра в 15:00. Тренер: Иван Петров. Место: Зал 1.",
          senderId: "system",
          senderName: "Система",
          senderRole: "system",
          recipientIds: [currentUserId],
          recipientNames: ["Текущий пользователь"],
          priority: "high",
          status: "delivered",
          relatedTo: {
            type: "event",
            id: "event1",
            title: "Персональная тренировка",
          },
          createdAt: new Date().toISOString(),
          isArchived: false,
        },
        {
          _id: "2",
          type: "direct",
          subject: "Вопрос по тренировке",
          content:
            "Здравствуйте! Можно ли перенести завтрашнюю тренировку на час позже? У меня появились неотложные дела.",
          senderId: "client1",
          senderName: "Анна Смирнова",
          senderRole: "member",
          recipientIds: [currentUserId],
          recipientNames: ["Текущий пользователь"],
          priority: "normal",
          status: "delivered",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isArchived: false,
        },
        {
          _id: "3",
          type: "group",
          subject: "Еженедельная планерка",
          content:
            "Напоминаю о еженедельной планерке завтра в 10:00. Повестка дня: обсуждение новых программ тренировок и график на следующую неделю.",
          senderId: "admin1",
          senderName: "Администратор",
          senderRole: "admin",
          recipientIds: ["trainer1", "trainer2", "trainer3"],
          recipientNames: ["Иван Петров", "Мария Иванова", "Алексей Сидоров"],
          groupId: "group1",
          groupName: "Все тренеры",
          priority: "normal",
          status: "sent",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          isArchived: false,
        },
        {
          _id: "4",
          type: "announcement",
          subject: "Обновление расписания работы",
          content:
            "С понедельника фитнес-центр будет работать по новому расписанию: пн-пт 6:00-23:00, сб-вс 8:00-22:00.",
          senderId: "admin1",
          senderName: "Администратор",
          senderRole: "admin",
          recipientIds: ["all"],
          recipientNames: ["Все пользователи"],
          priority: "high",
          status: "sent",
          createdAt: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isArchived: false,
        },
        {
          _id: "5",
          type: "direct",
          subject: "Отзыв о тренировке",
          content:
            "Спасибо за отличную тренировку! Очень довольна результатом. Когда можно записаться на следующую?",
          senderId: "client2",
          senderName: "Елена Васильева",
          senderRole: "member",
          recipientIds: [currentUserId],
          recipientNames: ["Текущий пользователь"],
          priority: "normal",
          status: "read",
          readAt: {
            [currentUserId]: new Date(
              Date.now() - 30 * 60 * 1000
            ).toISOString(),
          },
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          isArchived: false,
        },
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error("Ошибка загрузки сообщений:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    const mockGroups: MessageGroup[] = [
      {
        _id: "1",
        name: "Все тренеры",
        description: "Группа для общения всех тренеров",
        type: "trainers",
        memberIds: ["trainer1", "trainer2", "trainer3"],
        memberNames: ["Иван Петров", "Мария Иванова", "Алексей Сидоров"],
        createdBy: "admin",
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        _id: "2",
        name: "Активные участники",
        description: "Группа активных участников фитнес-центра",
        type: "members",
        memberIds: ["member1", "member2", "member3"],
        memberNames: ["Анна Смирнова", "Петр Козлов", "Елена Васильева"],
        createdBy: "admin",
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        _id: "3",
        name: "Персонал",
        description: "Административный персонал",
        type: "staff",
        memberIds: ["admin1", "manager1", "reception1"],
        memberNames: ["Администратор", "Менеджер", "Администратор"],
        createdBy: "admin",
        createdAt: new Date().toISOString(),
        isActive: true,
      },
    ];
    setGroups(mockGroups);
  };

  const loadTemplates = async () => {
    const mockTemplates: NotificationTemplate[] = [
      {
        _id: "1",
        name: "Напоминание о тренировке",
        type: "in-app",
        trigger: "event_reminder",
        subject: "Напоминание о тренировке",
        content:
          'Напоминаем о предстоящей тренировке "{{eventTitle}}" {{eventDate}} в {{eventTime}}',
        variables: ["eventTitle", "eventDate", "eventTime"],
        isActive: true,
      },
      {
        _id: "2",
        name: "Добро пожаловать",
        type: "email",
        trigger: "new_member",
        subject: "Добро пожаловать в FitAccess!",
        content:
          "Здравствуйте, {{userName}}! Добро пожаловать в наш фитнес-центр. Ваш номер участника: {{memberNumber}}",
        variables: ["userName", "memberNumber"],
        isActive: true,
      },
      {
        _id: "3",
        name: "Напоминание об оплате",
        type: "sms",
        trigger: "payment_due",
        subject: "Напоминание об оплате",
        content:
          "Напоминаем об оплате абонемента до {{dueDate}}. Сумма: {{amount}} руб.",
        variables: ["dueDate", "amount"],
        isActive: true,
      },
    ];
    setTemplates(mockTemplates);
  };

  const sendMessage = async () => {
    if (!newMessage.content.trim()) return;

    const message: Message = {
      _id: Date.now().toString(),
      ...newMessage,
      senderId: currentUserId,
      senderName: "Текущий пользователь",
      senderRole: currentUserRole,
      recipientNames: [], // Заполнить из базы пользователей
      status: "sent",
      createdAt: new Date().toISOString(),
      isArchived: false,
    };

    setMessages((prev) => [message, ...prev]);
    setNewMessage({
      type: "direct",
      subject: "",
      content: "",
      recipientIds: [],
      priority: "normal",
      groupId: "",
    });
    setShowNewMessage(false);
    alert("Сообщение отправлено!");
  };

  const markAsRead = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId
          ? {
              ...msg,
              status: "read" as const,
              readAt: {
                ...msg.readAt,
                [currentUserId]: new Date().toISOString(),
              },
            }
          : msg
      )
    );
  };

  const archiveMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? { ...msg, isArchived: true } : msg
      )
    );
  };

  const deleteMessage = (messageId: string) => {
    if (confirm("Вы уверены, что хотите удалить это сообщение?")) {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    }
  };

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.senderName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || message.type === filterType;
    const matchesStatus =
      filterStatus === "all" || message.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus && !message.isArchived;
  });

  const unreadCount = messages.filter(
    (m) =>
      m.recipientIds.includes(currentUserId) &&
      !m.readAt?.[currentUserId] &&
      !m.isArchived
  ).length;

  const getMessageTypeIcon = (type: Message["type"]) => {
    const icons = {
      direct: MessageSquare,
      group: Users,
      announcement: Bell,
      notification: Bell,
    };
    return icons[type];
  };

  const getMessageTypeColor = (type: Message["type"]) => {
    const colors = {
      direct: "bg-blue-100 text-blue-800",
      group: "bg-green-100 text-green-800",
      announcement: "bg-purple-100 text-purple-800",
      notification: "bg-orange-100 text-orange-800",
    };
    return colors[type];
  };

  const getPriorityColor = (priority: Message["priority"]) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      normal: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка сообщений...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <AdminSecondHeader
        title={
          <div className="flex items-center gap-2">
            <span>Сообщения</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
        }
        description="Управление сообщениями"
        icon={MessageSquare}
        actions={
          <MobileActionGroup>
            <ResponsiveButton
              variant="outline"
              onClick={loadMessages}
              hideTextOnMobile
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sm:ml-2">Обновить</span>
            </ResponsiveButton>

            <ResponsiveButton
              onClick={() => setShowNewMessage(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4" />
              <span className="sm:ml-2">Новое</span>
            </ResponsiveButton>
          </MobileActionGroup>
        }
      />

      <Tabs defaultValue="messages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Сообщения ({filteredMessages.length})
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Группы ({groups.length})
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Шаблоны ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Настройки
          </TabsTrigger>
        </TabsList>

        {/* Сообщения */}
        <TabsContent value="messages">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Список сообщений */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Входящие</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Archive className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Filter className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setFilterType("all")}
                          >
                            Все типы
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setFilterType("direct")}
                          >
                            Личные
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setFilterType("group")}
                          >
                            Групповые
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setFilterType("notification")}
                          >
                            Уведомления
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Поиск сообщений..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Тип" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все типы</SelectItem>
                          <SelectItem value="direct">Личные</SelectItem>
                          <SelectItem value="group">Групповые</SelectItem>
                          <SelectItem value="announcement">
                            Объявления
                          </SelectItem>
                          <SelectItem value="notification">
                            Уведомления
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Статус" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все статусы</SelectItem>
                          <SelectItem value="sent">Отправлено</SelectItem>
                          <SelectItem value="delivered">Доставлено</SelectItem>
                          <SelectItem value="read">Прочитано</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {filteredMessages.map((message) => {
                      const isUnread = !message.readAt?.[currentUserId];
                      const isSelected = selectedMessage?._id === message._id;
                      const MessageTypeIcon = getMessageTypeIcon(message.type);

                      return (
                        <div
                          key={message._id}
                          onClick={() => {
                            setSelectedMessage(message);
                            if (isUnread) markAsRead(message._id);
                          }}
                          className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                            isSelected
                              ? "bg-blue-100 border-blue-200"
                              : isUnread
                                ? "bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
                                : "hover:bg-gray-50 border-gray-200"
                          } ${isUnread ? "border-l-4 border-l-blue-500" : ""}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <MessageTypeIcon className="h-4 w-4 text-gray-500" />
                              <span
                                className={`text-sm ${isUnread ? "font-semibold" : "font-medium"}`}
                              >
                                {message.senderName}
                              </span>
                              {message.priority === "high" && (
                                <Star className="h-3 w-3 text-orange-500" />
                              )}
                              {message.priority === "urgent" && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Срочно
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(message.createdAt).toLocaleDateString(
                                "ru"
                              )}
                            </span>
                          </div>

                          <div
                            className={`text-sm mb-1 ${isUnread ? "font-medium" : ""}`}
                          >
                            {message.subject || "Без темы"}
                          </div>

                          <div className="text-xs text-gray-600 truncate mb-2">
                            {message.content}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getMessageTypeColor(message.type)}`}
                              >
                                {message.type === "direct" && "Личное"}
                                {message.type === "group" && "Группа"}
                                {message.type === "announcement" &&
                                  "Объявление"}
                                {message.type === "notification" &&
                                  "Уведомление"}
                              </Badge>

                              {message.attachments &&
                                message.attachments.length > 0 && (
                                  <Paperclip className="h-3 w-3 text-gray-400" />
                                )}

                              {message.relatedTo && (
                                <Badge variant="outline" className="text-xs">
                                  {message.relatedTo.type === "event" && "📅"}
                                  {message.relatedTo.type === "user" && "👤"}
                                  {message.relatedTo.type === "payment" && "💳"}
                                  {message.relatedTo.type === "membership" &&
                                    "🏃"}
                                </Badge>
                              )}
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(message._id);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Отметить как прочитанное
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    archiveMessage(message._id);
                                  }}
                                >
                                  <Archive className="h-4 w-4 mr-2" />
                                  Архивировать
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMessage(message._id);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Удалить
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}

                    {filteredMessages.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>Сообщений не найдено</p>
                      </div>
                    )}
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
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 mb-2">
                          {selectedMessage.subject || "Без темы"}
                          {selectedMessage.priority === "urgent" && (
                            <Badge variant="destructive">Срочно</Badge>
                          )}
                          {selectedMessage.priority === "high" && (
                            <Badge
                              className={getPriorityColor(
                                selectedMessage.priority
                              )}
                            >
                              Высокий приоритет
                            </Badge>
                          )}
                        </CardTitle>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            От: <strong>{selectedMessage.senderName}</strong>
                          </span>
                          <span>
                            {new Date(selectedMessage.createdAt).toLocaleString(
                              "ru"
                            )}
                          </span>
                          {selectedMessage.groupName && (
                            <span>
                              Группа:{" "}
                              <strong>{selectedMessage.groupName}</strong>
                            </span>
                          )}
                        </div>

                        {selectedMessage.recipientNames.length > 0 && (
                          <div className="text-sm text-gray-600 mt-1">
                            Кому: {selectedMessage.recipientNames.join(", ")}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Reply className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Forward className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Archive className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Star className="h-4 w-4 mr-2" />
                              Добавить в избранное
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                              {selectedMessage.relatedTo.type === "event" &&
                                "Событие"}
                              {selectedMessage.relatedTo.type === "user" &&
                                "Пользователь"}
                              {selectedMessage.relatedTo.type === "payment" &&
                                "Платеж"}
                              {selectedMessage.relatedTo.type ===
                                "membership" && "Абонемент"}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Содержимое сообщения */}
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-gray-900 p-4 bg-gray-50 rounded-lg border">
                          {selectedMessage.content}
                        </div>
                      </div>

                      {/* Вложения */}
                      {selectedMessage.attachments &&
                        selectedMessage.attachments.length > 0 && (
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Вложения:
                            </h4>
                            <div className="space-y-2">
                              {selectedMessage.attachments.map((attachment) => (
                                <div
                                  key={attachment._id}
                                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                                >
                                  <Paperclip className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">
                                    {attachment.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({(attachment.size / 1024).toFixed(1)} KB)
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="ml-auto"
                                  >
                                    Скачать
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Быстрые действия */}
                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="flex items-center gap-2">
                            <Reply className="h-4 w-4" />
                            Ответить
                          </Button>

                          {selectedMessage.senderRole === "member" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <Phone className="h-4 w-4" />
                                Позвонить
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <Mail className="h-4 w-4" />
                                Email
                              </Button>
                            </>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Forward className="h-4 w-4" />
                            Переслать
                          </Button>
                        </div>
                      </div>

                      {/* Информация о прочтении */}
                      {selectedMessage.readAt &&
                        Object.keys(selectedMessage.readAt).length > 0 && (
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Информация о прочтении:
                            </h4>
                            <div className="text-sm text-gray-600">
                              Прочитано:{" "}
                              {new Date(
                                selectedMessage.readAt[currentUserId] || ""
                              ).toLocaleString("ru")}
                            </div>
                          </div>
                        )}
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

        {/* Группы */}
        <TabsContent value="groups">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {group.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {group.memberIds.length} участников
                    </Badge>
                    <Badge variant={group.isActive ? "default" : "secondary"}>
                      {group.isActive ? "Активна" : "Неактивна"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {group.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Участники:</h4>
                      <div className="flex flex-wrap gap-1">
                        {group.memberNames.slice(0, 3).map((name, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {name}
                          </Badge>
                        ))}
                        {group.memberNames.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{group.memberNames.length - 3} еще
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Написать группе
                      </Button>
                      <Button size="sm" variant="outline">
                        Управление
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Кнопка создания новой группы */}
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center h-full min-h-[200px]">
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
            {templates.map((template) => (
              <Card key={template._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      {template.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={template.isActive ? "default" : "secondary"}
                      >
                        {template.isActive ? "Активен" : "Неактивен"}
                      </Badge>
                      <Badge variant="outline">
                        {template.type === "email" && "📧 Email"}
                        {template.type === "sms" && "📱 SMS"}
                        {template.type === "push" && "🔔 Push"}
                        {template.type === "in-app" && "💬 В приложении"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Тема:</h4>
                      <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                        {template.subject}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Триггер:</h4>
                      <p className="text-sm text-gray-600">
                        {template.trigger === "event_reminder" &&
                          "Напоминание о событии"}
                        {template.trigger === "payment_due" &&
                          "Напоминание об оплате"}
                        {template.trigger === "membership_expiry" &&
                          "Истечение абонемента"}
                        {template.trigger === "new_member" && "Новый участник"}
                        {template.trigger === "manual" && "Ручная отправка"}
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
                        {template.variables.map((variable) => (
                          <Badge
                            key={variable}
                            variant="outline"
                            className="text-xs"
                          >
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
                      {template.isActive ? "Деактивировать" : "Активировать"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center h-32">
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Создать шаблон
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Настройки */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Уведомления</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email уведомления</h4>
                    <p className="text-sm text-gray-600">
                      Получать уведомления на email
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Включено
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS уведомления</h4>
                    <p className="text-sm text-gray-600">
                      Получать SMS уведомления
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Выключено
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push уведомления</h4>
                    <p className="text-sm text-gray-600">
                      Получать push уведомления
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Включено
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Автоматические сообщения</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Напоминания о тренировках</h4>
                    <p className="text-sm text-gray-600">
                      За 24 часа до тренировки
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Включено
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Напоминания об оплате</h4>
                    <p className="text-sm text-gray-600">
                      За 3 дня до истечения абонемента
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Включено
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Приветственные сообщения</h4>
                    <p className="text-sm text-gray-600">Новым участникам</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Включено
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Модальное окно создания нового сообщения */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Новое сообщение</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Тип сообщения</label>
                    <Select
                      value={newMessage.type}
                      onValueChange={(value: Message["type"]) =>
                        setNewMessage({ ...newMessage, type: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct">Личное сообщение</SelectItem>
                        <SelectItem value="group">Группе</SelectItem>
                        <SelectItem value="announcement">Объявление</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Приоритет</label>
                    <Select
                      value={newMessage.priority}
                      onValueChange={(value: Message["priority"]) =>
                        setNewMessage({ ...newMessage, priority: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Низкий</SelectItem>
                        <SelectItem value="normal">Обычный</SelectItem>
                        <SelectItem value="high">Высокий</SelectItem>
                        <SelectItem value="urgent">Срочный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newMessage.type === "group" ? (
                  <div>
                    <label className="text-sm font-medium">Группа</label>
                    <Select
                      value={newMessage.groupId}
                      onValueChange={(value) =>
                        setNewMessage({ ...newMessage, groupId: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Выберите группу" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group._id} value={group._id}>
                            {group.name} ({group.memberIds.length} участников)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium">Получатели</label>
                    <Input
                      placeholder="Выберите получателей..."
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Введите имена или выберите из списка контактов
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Тема</label>
                  <Input
                    value={newMessage.subject}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, subject: e.target.value })
                    }
                    placeholder="Введите тему сообщения"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Сообщение</label>
                  <Textarea
                    value={newMessage.content}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, content: e.target.value })
                    }
                    placeholder="Введите текст сообщения..."
                    rows={6}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Прикрепить файл
                  </Button>
                  <Button variant="outline">Использовать шаблон</Button>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    onClick={sendMessage}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Отправить
                  </Button>
                  <Button variant="outline">Сохранить как черновик</Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewMessage(false)}
                    className="ml-auto"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
