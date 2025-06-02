// components/messages/NotificationManager.tsx
import React, { memo, useState, useEffect, useCallback } from "react";
import { NotificationToast } from "./NotificationToast";
import { Message } from "@/types/messages";

interface NotificationManagerProps {
  currentUserId: string;
  onMessageView: (messageId: string) => void;
  onMessageReply: (messageId: string) => void;
}

interface ActiveNotification {
  id: string;
  message: Message;
  timestamp: number;
}

export const NotificationManager = memo(({
  currentUserId,
  onMessageView,
  onMessageReply
}: NotificationManagerProps) => {
  const [notifications, setNotifications] = useState<ActiveNotification[]>([]);

  // Подписка на новые сообщения (в реальном приложении через Convex)
  useEffect(() => {
    // Здесь будет подписка на новые сообщения
    // const unsubscribe = api.messages.subscribe({
    //   recipientId: currentUserId,
    //   onNewMessage: handleNewMessage
    // });
    
    // return unsubscribe;
  }, [currentUserId]);

  const handleNewMessage = useCallback((message: Message) => {
    // Проверяем, что сообщение для текущего пользователя
    if (!message.recipientIds.includes(currentUserId)) return;
    
    // Проверяем, что уведомление еще не показано
    if (notifications.some(n => n.message._id === message._id)) return;

    const notification: ActiveNotification = {
      id: `${message._id}-${Date.now()}`,
      message,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, notification]);

    // Автоматически скрываем через 10 секунд
    setTimeout(() => {
      removeNotification(notification.id);
    }, 10000);
  }, [currentUserId, notifications]);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const handleView = useCallback((notification: ActiveNotification) => {
    onMessageView(notification.message._id);
    removeNotification(notification.id);
  }, [onMessageView, removeNotification]);

  const handleReply = useCallback((notification: ActiveNotification) => {
    onMessageReply(notification.message._id);
    removeNotification(notification.id);
  }, [onMessageReply, removeNotification]);

  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="flex flex-col gap-2 p-4 pointer-events-auto">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{ 
              transform: `translateY(${index * 10}px)`,
              zIndex: 50 - index 
            }}
          >
            <NotificationToast
              message={notification.message}
              onClose={() => removeNotification(notification.id)}
              onView={() => handleView(notification)}
              onReply={() => handleReply(notification)}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

NotificationManager.displayName = "NotificationManager";
