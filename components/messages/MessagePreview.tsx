// components/messages/MessagePreview.tsx
import React, { memo } from "react";
import { Message } from "@/types/messages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";

interface MessagePreviewProps {
  isOpen: boolean;
  message: {
    type: Message["type"];
    subject: string;
    content: string;
    priority: Message["priority"];
    recipientCount: number;
    groupName?: string;
  };
  onClose: () => void;
  onConfirmSend: () => void;
}

export const MessagePreview = memo(({
  isOpen,
  message,
  onClose,
  onConfirmSend
}: MessagePreviewProps) => {
  if (!isOpen) return null;

  const getPriorityColor = (priority: Message["priority"]) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      normal: "bg-blue-100 text-blue-800", 
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority];
  };

  const getTypeLabel = (type: Message["type"]) => {
    const labels = {
      direct: "Личное сообщение",
      group: "Групповое сообщение",
      announcement: "Объявление",
      notification: "Уведомление"
    };
    return labels[type];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Предпросмотр сообщения
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Метаданные */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
              <Badge variant="outline">
                {getTypeLabel(message.type)}
              </Badge>
              <Badge className={getPriorityColor(message.priority)}>
                {message.priority === "low" && "Низкий приоритет"}
                {message.priority === "normal" && "Обычный приоритет"}
                {message.priority === "high" && "Высокий приоритет"}
                {message.priority === "urgent" && "Срочно"}
              </Badge>
              <span className="text-sm text-gray-600">
                {message.type === "announcement" 
                  ? "Всем пользователям"
                  : message.groupName 
                    ? `Группа: ${message.groupName}`
                    : `${message.recipientCount} получателей`
                }
              </span>
            </div>

            {/* Тема */}
            <div>
              <h3 className="font-medium text-lg mb-2">
                {message.subject || "Без темы"}
              </h3>
            </div>

            {/* Содержимое */}
            <div className="p-4 bg-white border rounded-lg">
              <div className="whitespace-pre-wrap text-gray-900">
                {message.content}
              </div>
            </div>

            {/* Действия */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-600">
                Проверьте сообщение перед отправкой
              </p>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={onClose}>
                  Редактировать
                </Button>
                <Button onClick={onConfirmSend}>
                  Отправить сообщение
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

MessagePreview.displayName = "MessagePreview";
