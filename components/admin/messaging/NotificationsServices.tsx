import { ScheduleEvent } from "../schedule/types";
import { Message } from "./types";

// components/messaging/NotificationService.ts
export class NotificationService {
  // Автоматические уведомления для событий
  static async sendEventNotifications(event: ScheduleEvent, type: 'created' | 'updated' | 'cancelled' | 'reminder') {
    const notifications: Message[] = [];

    switch (type) {
      case 'created':
        // Уведомление тренеру
        notifications.push({
          _id: Date.now().toString(),
          type: 'notification',
          subject: 'Новое событие в расписании',
          content: `Для вас запланировано новое событие: "${event.title}" на ${new Date(event.startTime).toLocaleString('ru')}`,
          senderId: 'system',
          senderName: 'Система',
          senderRole: 'system',
          recipientIds: [event.trainerId],
          recipientNames: [event.trainerName],
          priority: 'normal',
          status: 'sent',
          relatedTo: {
            type: 'event',
            id: event._id,
            title: event.title
          },
          createdAt: new Date().toISOString(),
          isArchived: false
        });

        // Уведомление клиенту (если есть)
        if (event.clientId && event.clientName) {
          notifications.push({
            _id: (Date.now() + 1).toString(),
            type: 'notification',
            subject: 'Подтверждение записи',
            content: `Вы записаны на "${event.title}" ${new Date(event.startTime).toLocaleString('ru')} с тренером ${event.trainerName}`,
            senderId: 'system',
            senderName: 'Система',
            senderRole: 'system',
            recipientIds: [event.clientId],
            recipientNames: [event.clientName],
            priority: 'high',
            status: 'sent',
            relatedTo: {
              type: 'event',
              id: event._id,
              title: event.title
            },
            createdAt: new Date().toISOString(),
            isArchived: false
          });
        }
        break;

      case 'reminder':
        // Напоминание за 24 часа
        const reminderTime = new Date(event.startTime);
        reminderTime.setHours(reminderTime.getHours() - 24);

        if (new Date() >= reminderTime) {
          notifications.push({
            _id: Date.now().toString(),
            type: 'notification',
            subject: 'Напоминание о тренировке',
            content: `Напоминаем о предстоящей тренировке "${event.title}" завтра в ${new Date(event.startTime).toLocaleTimeString('ru')}`,
            senderId: 'system',
            senderName: 'Система',
            senderRole: 'system',
            recipientIds: event.clientId ? [event.clientId] : [],
            recipientNames: event.clientName ? [event.clientName] : [],
            priority: 'normal',
            status: 'sent',
            relatedTo: {
              type: 'event',
              id: event._id,
              title: event.title
            },
            createdAt: new Date().toISOString(),
            isArchived: false
          });
        }
        break;
    }

    return notifications;
  }

  // Отправка SMS
  static async sendSMS(phoneNumber: string, message: string) {
    // Интеграция с SMS-провайдером
    console.log(`SMS to ${phoneNumber}: ${message}`);
  }

  // Отправка Email
  static async sendEmail(email: string, subject: string, content: string) {
    // Интеграция с email-провайдером
    console.log(`Email to ${email}: ${subject}`);
  }

  // Push-уведомления
  static async sendPushNotification(userId: string, title: string, body: string) {
    // Интеграция с push-сервисом
    console.log(`Push to ${userId}: ${title} - ${body}`);
  }
}
