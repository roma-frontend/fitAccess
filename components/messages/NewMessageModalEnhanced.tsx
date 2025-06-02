// components/messages/NewMessageModalEnhanced.tsx
import React, { memo, useState, useMemo, useCallback } from "react";
import { Message, MessageGroup, NotificationTemplate } from "@/types/messages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Send, 
  Paperclip, 
  X, 
  Check, 
  ChevronsUpDown, 
  Calendar,
  Clock,
  FileText,
  Image as ImageIcon,
  Smile
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface EnhancedNewMessageModalProps {
  isOpen: boolean;
  newMessage: {
    type: Message["type"];
    subject: string;
    content: string;
    recipientIds: string[];
    priority: Message["priority"];
    groupId: string;
    scheduledAt?: string;
    attachments?: File[];
    useTemplate?: boolean;
    templateId?: string;
  };
  groups: MessageGroup[];
  templates: NotificationTemplate[];
  onClose: () => void;
  onSend: () => void;
  onSaveDraft: () => void;
  onMessageChange: (updates: Partial<EnhancedNewMessageModalProps['newMessage']>) => void;
}

// Подкомпонент выбора типа и приоритета
const MessageTypeAndPriority = memo(({
  type,
  priority,
  onTypeChange,
  onPriorityChange
}: {
  type: Message["type"];
  priority: Message["priority"];
  onTypeChange: (type: Message["type"]) => void;
  onPriorityChange: (priority: Message["priority"]) => void;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="text-sm font-medium">Тип сообщения</label>
      <Select value={type} onValueChange={onTypeChange}>
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
      <Select value={priority} onValueChange={onPriorityChange}>
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
));

// Подкомпонент выбора получателей
const RecipientSelector = memo(({
  messageType,
  groupId,
  groups,
  selectedRecipients,
  onGroupChange,
  onRecipientsChange
}: {
  messageType: Message["type"];
  groupId: string;
  groups: MessageGroup[];
  selectedRecipients: string[];
  onGroupChange: (groupId: string) => void;
  onRecipientsChange: (recipientIds: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Мок данные пользователей (в реальном приложении загружать из API/Convex)
  const users: User[] = [
    { _id: "1", name: "Иван Петров", email: "ivan@example.com", role: "trainer" },
    { _id: "2", name: "Мария Иванова", email: "maria@example.com", role: "trainer" },
    { _id: "3", name: "Анна Смирнова", email: "anna@example.com", role: "member" },
    { _id: "4", name: "Петр Козлов", email: "petr@example.com", role: "member" },
    { _id: "5", name: "Елена Васильева", email: "elena@example.com", role: "member" },
    { _id: "6", name: "Алексей Сидоров", email: "alexey@example.com", role: "trainer" },
    { _id: "7", name: "Ольга Николаева", email: "olga@example.com", role: "member" },
    { _id: "8", name: "Дмитрий Волков", email: "dmitry@example.com", role: "admin" },
  ];

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const selectedUsers = users.filter(user => selectedRecipients.includes(user._id));

  const handleSelectUser = (userId: string) => {
    if (selectedRecipients.includes(userId)) {
      onRecipientsChange(selectedRecipients.filter(id => id !== userId));
    } else {
      onRecipientsChange([...selectedRecipients, userId]);
    }
  };

  const removeRecipient = (userId: string) => {
    onRecipientsChange(selectedRecipients.filter(id => id !== userId));
  };

  const getRoleLabel = (role: string) => {
    const roleLabels = {
      trainer: "Тренер",
      member: "Участник", 
      admin: "Админ",
      staff: "Персонал"
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  // Для групповых сообщений
  if (messageType === "group") {
    return (
      <div>
        <label className="text-sm font-medium">Группа</label>
        <Select value={groupId} onValueChange={onGroupChange}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Выберите группу" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group._id} value={group._id}>
                <div className="flex items-center justify-between w-full">
                  <span>{group.name}</span>
                  <Badge variant="outline" className="ml-2">
                    {group.memberIds.length} участников
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Показать участников выбранной группы */}
        {groupId && (
          <div className="mt-2 p-2 bg-gray-50 rounded border">
            {(() => {
              const selectedGroup = groups.find(g => g._id === groupId);
              return selectedGroup ? (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Участники группы:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedGroup.memberNames.slice(0, 5).map((name, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {name}
                      </Badge>
                    ))}
                    {selectedGroup.memberNames.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedGroup.memberNames.length - 5} еще
                      </Badge>
                    )}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>
    );
  }

  // Для объявлений
  if (messageType === "announcement") {
    return (
      <div>
        <label className="text-sm font-medium">Получатели</label>
        <div className="mt-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-800">
            <span className="text-sm font-medium">
              Объявление будет отправлено всем пользователям
            </span>
            <Badge variant="outline" className="text-blue-600">
              Все пользователи
            </Badge>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Включает всех тренеров, участников и персонал
          </p>
        </div>
      </div>
    );
  }

  // Для личных сообщений
  return (
    <div>
      <label className="text-sm font-medium">Получатели</label>
      
      {/* Выбранные получатели */}
      {selectedUsers.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <Badge
              key={user._id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span>{user.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeRecipient(user._id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Поиск и выбор получателей */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between mt-2"
          >
            {selectedUsers.length > 0
              ? `Выбрано: ${selectedUsers.length}`
              : "Выберите получателей..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Поиск пользователей..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty>Пользователи не найдены.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              {filteredUsers.map((user) => (
                <CommandItem
                  key={user._id}
                  value={user._id}
                  onSelect={() => handleSelectUser(user._id)}
                  className="flex items-center space-x-2"
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedRecipients.includes(user._id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getRoleLabel(user.role)}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <p className="text-xs text-gray-500 mt-1">
        Выберите одного или нескольких получателей
      </p>
    </div>
  );
});

export const EnhancedNewMessageModal = memo(({
  isOpen,
  newMessage,
  groups,
  templates,
  onClose,
  onSend,
  onSaveDraft,
  onMessageChange
}: EnhancedNewMessageModalProps) => {
  const [showScheduler, setShowScheduler] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    onMessageChange({ 
      attachments: [...(newMessage.attachments || []), ...files] 
    });
  }, [newMessage.attachments, onMessageChange]);

  const removeAttachment = useCallback((index: number) => {
    const newAttachments = [...(newMessage.attachments || [])];
    newAttachments.splice(index, 1);
    onMessageChange({ attachments: newAttachments });
  }, [newMessage.attachments, onMessageChange]);

  const applyTemplate = useCallback((template: NotificationTemplate) => {
    onMessageChange({
      subject: template.subject,
      content: template.content,
      templateId: template._id,
      useTemplate: true
    });
    setShowTemplates(false);
  }, [onMessageChange]);

  const canSend = newMessage.content.trim() && (
    newMessage.type === "announcement" ||
    (newMessage.type === "group" && newMessage.groupId) ||
    (newMessage.type === "direct" && newMessage.recipientIds.length > 0)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[95vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Новое сообщение</CardTitle>
            <div className="flex items-center gap-2">
              {newMessage.useTemplate && (
                <Badge variant="outline" className="text-xs">
                  Использует шаблон
                </Badge>
              )}
             // components/messages/NewMessageModalEnhanced.tsx (продолжение)

              {newMessage.scheduledAt && (
                <Badge variant="outline" className="text-xs">
                  Запланировано
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Основная форма */}
            <div className="lg:col-span-2 space-y-4">
              <MessageTypeAndPriority
                type={newMessage.type}
                priority={newMessage.priority}
                onTypeChange={(type) => onMessageChange({ type })}
                onPriorityChange={(priority) => onMessageChange({ priority })}
              />

              <RecipientSelector
                messageType={newMessage.type}
                groupId={newMessage.groupId}
                groups={groups}
                selectedRecipients={newMessage.recipientIds}
                onGroupChange={(groupId) => onMessageChange({ groupId })}
                onRecipientsChange={(recipientIds) => onMessageChange({ recipientIds })}
              />

              <div>
                <label className="text-sm font-medium">Тема</label>
                <Input
                  value={newMessage.subject}
                  onChange={(e) => onMessageChange({ subject: e.target.value })}
                  placeholder="Введите тему сообщения"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Сообщение</label>
                <Textarea
                  value={newMessage.content}
                  onChange={(e) => onMessageChange({ content: e.target.value })}
                  placeholder="Введите текст сообщения..."
                  rows={8}
                  className="mt-1"
                />
                
                {/* Счетчик символов */}
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {newMessage.content.length} символов
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Вложения */}
              {newMessage.attachments && newMessage.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Вложения</label>
                  <div className="mt-2 space-y-2">
                    {newMessage.attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm flex-1">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Планировщик */}
              {showScheduler && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-blue-900">
                      Запланировать отправку
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowScheduler(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="schedule-date">Дата</Label>
                      <Input
                        id="schedule-date"
                        type="date"
                        className="mt-1"
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => onMessageChange({ scheduledAt: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="schedule-time">Время</Label>
                      <Input
                        id="schedule-time"
                        type="time"
                        className="mt-1"
                        onChange={(e) => {
                          const currentDate = newMessage.scheduledAt || new Date().toISOString().split('T')[0];
                          onMessageChange({ scheduledAt: `${currentDate}T${e.target.value}` });
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Сообщение будет отправлено автоматически в указанное время
                  </p>
                </div>
              )}
            </div>

            {/* Боковая панель с инструментами */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Инструменты</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Шаблоны */}
                  <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Шаблоны ({templates.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Выберите шаблон</DialogTitle>
                        <DialogDescription>
                          Выберите готовый шаблон для быстрого создания сообщения
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-3 max-h-96 overflow-y-auto">
                        {templates.length > 0 ? (
                          templates.map((template) => (
                            <div
                              key={template._id}
                              className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => applyTemplate(template)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{template.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {template.type === "email" && "📧 Email"}
                                  {template.type === "sms" && "📱 SMS"}
                                  {template.type === "push" && "🔔 Push"}
                                  {template.type === "in-app" && "💬 Приложение"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2 font-medium">
                                {template.subject}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {template.content}
                              </p>
                              {template.variables.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {template.variables.slice(0, 3).map((variable) => (
                                    <Badge key={variable} variant="outline" className="text-xs">
                                      {`{{${variable}}}`}
                                    </Badge>
                                  ))}
                                  {template.variables.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{template.variables.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>Шаблоны не найдены</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Вложения */}
                  <div>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.pptx"
                    />
                    <Label htmlFor="file-upload">
                      <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                        <div>
                          <Paperclip className="h-4 w-4 mr-2" />
                          Прикрепить файл
                          {newMessage.attachments && newMessage.attachments.length > 0 && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {newMessage.attachments.length}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    </Label>
                  </div>

                  {/* Планировщик */}
                  <Button
                    variant={showScheduler ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setShowScheduler(!showScheduler)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {showScheduler ? "Скрыть планировщик" : "Запланировать"}
                  </Button>
                </CardContent>
              </Card>

              {/* Настройки */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Настройки доставки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="read-receipt" className="text-sm">
                      Уведомление о прочтении
                    </Label>
                    <Switch id="read-receipt" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="delivery-receipt" className="text-sm">
                      Уведомление о доставке
                    </Label>
                    <Switch id="delivery-receipt" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-archive" className="text-sm">
                      Автоархивирование
                    </Label>
                    <Switch id="auto-archive" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-priority" className="text-sm">
                      Высокий приоритет
                    </Label>
                    <Switch 
                      id="high-priority" 
                      checked={newMessage.priority === "high" || newMessage.priority === "urgent"}
                      onCheckedChange={(checked) => 
                        onMessageChange({ priority: checked ? "high" : "normal" })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Предпросмотр получателей */}
              {(newMessage.recipientIds.length > 0 || newMessage.groupId || newMessage.type === "announcement") && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Получатели</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">
                      {newMessage.type === "announcement" && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-blue-600">
                            Все пользователи
                          </Badge>
                          <span>Объявление для всех</span>
                        </div>
                      )}
                      {newMessage.type === "group" && newMessage.groupId && (
                        (() => {
                          const group = groups.find(g => g._id === newMessage.groupId);
                          return group ? (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{group.name}</Badge>
                                <span className="text-xs">
                                  {group.memberIds.length} участников
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {group.description}
                              </p>
                            </div>
                          ) : (
                            <span className="text-red-600">Группа не найдена</span>
                          );
                        })()
                      )}
                      {newMessage.type === "direct" && (
                        <div>
                          <Badge variant="outline">
                            {newMessage.recipientIds.length} получателей
                          </Badge>
                          {newMessage.recipientIds.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Личное сообщение
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Статистика сообщения */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Статистика</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Символов:</span>
                    <span className="font-medium">{newMessage.content.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Слов:</span>
                    <span className="font-medium">
                      {newMessage.content.trim() ? newMessage.content.trim().split(/\s+/).length : 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Вложений:</span>
                    <span className="font-medium">
                      {newMessage.attachments?.length || 0}
                    </span>
                  </div>
                  {newMessage.attachments && newMessage.attachments.length > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Размер файлов:</span>
                      <span className="font-medium">
                        {(newMessage.attachments.reduce((sum, file) => sum + file.size, 0) / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Действия */}
          <div className="flex items-center justify-between pt-6 border-t mt-6">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={onSaveDraft}
                disabled={!newMessage.content.trim()}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Сохранить черновик
              </Button>
              
              {newMessage.scheduledAt && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(newMessage.scheduledAt).toLocaleString("ru", {
                    day: "2-digit",
                    month: "2-digit", 
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </Badge>
              )}

              {newMessage.useTemplate && (
                <Badge variant="outline" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Шаблон применен
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Отмена
              </Button>
              
              <Button 
                onClick={onSend} 
                disabled={!canSend}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {newMessage.scheduledAt ? "Запланировать" : "Отправить"}
                {newMessage.type === "announcement" && " всем"}
                {newMessage.type === "group" && newMessage.groupId && (
                  ` (${groups.find(g => g._id === newMessage.groupId)?.memberIds.length || 0})`
                )}
                {newMessage.type === "direct" && newMessage.recipientIds.length > 0 && (
                  ` (${newMessage.recipientIds.length})`
                )}
              </Button>
            </div>
          </div>

          {/* Предупреждения и подсказки */}
          {!canSend && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <div className="text-sm">
                  {!newMessage.content.trim() && "Введите текст сообщения"}
                  {newMessage.content.trim() && newMessage.type === "direct" && newMessage.recipientIds.length === 0 && "Выберите получателей"}
                  {newMessage.content.trim() && newMessage.type === "group" && !newMessage.groupId && "Выберите группу"}
                </div>
              </div>
            </div>
          )}

          {/* Подсказки по использованию */}
          {newMessage.content.length > 1000 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                💡 <strong>Совет:</strong> Длинные сообщения лучше разделить на несколько частей или использовать вложения.
              </div>
            </div>
          )}

          {newMessage.type === "announcement" && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-sm text-purple-800">
                📢 <strong>Объявление:</strong> Это сообщение получат все пользователи системы. Убедитесь, что информация актуальна для всех.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

// Добавляем displayName для всех компонентов
MessageTypeAndPriority.displayName = "MessageTypeAndPriority";
RecipientSelector.displayName = "RecipientSelector";
EnhancedNewMessageModal.displayName = "EnhancedNewMessageModal";

