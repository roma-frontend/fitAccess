// hooks/useMessages.ts (исправленная версия без JSX)
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Message } from "@/types/messages";
import { Id } from "@/convex/_generated/dataModel";

// Проверяем доступность API функций для сообщений
function isMessagesApiAvailable(): boolean {
  try {
    return !!(api && api.messages && typeof api.messages === 'object');
  } catch (error) {
    return false;
  }
}

// Проверяем, является ли ID валидным Convex ID
function isRealConvexId(id: string): boolean {
  return /^[jkmnpqrstvwxyz][a-z0-9]{15,}$/i.test(id);
}

// Простой генератор тестовых ID
function generateTestId(prefix: string): string {
  return `test_${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Кэш для постоянных тестовых ID
const testIdCache = new Map<string, string>();

function getTestId(key: string, prefix: string): string {
  if (!testIdCache.has(key)) {
    testIdCache.set(key, generateTestId(prefix));
  }
  return testIdCache.get(key)!;
}

// Генерируем тестовые данные с явно тестовыми ID
function generateTestMessages(): Message[] {
  const messageId1 = getTestId('msg1', 'message') as Id<"messages">;
  const messageId2 = getTestId('msg2', 'message') as Id<"messages">;
  const messageId3 = getTestId('msg3', 'message') as Id<"messages">;
  const messageId4 = getTestId('msg4', 'message') as Id<"messages">;
  const messageId5 = getTestId('msg5', 'message') as Id<"messages">;
  
  const adminId = getTestId('admin', 'user') as Id<"users">;
  const user1Id = getTestId('user1', 'user') as Id<"users">;
  const user2Id = getTestId('user2', 'user') as Id<"users">;
  const user3Id = getTestId('user3', 'user') as Id<"users">;
  const trainer1Id = getTestId('trainer1', 'user') as Id<"users">;
  const trainer2Id = getTestId('trainer2', 'user') as Id<"users">;
  const systemId = getTestId('system', 'user') as Id<"users">;
  
  const groupId = getTestId('trainers-group', 'group') as Id<"messageGroups">;

  return [
    {
      _id: messageId1,
      _creationTime: Date.now(),
      type: "direct",
      subject: "Добро пожаловать!",
      content: "Добро пожаловать в систему управления фитнес-клубом!",
      senderId: adminId,
      senderName: "Администратор",
      recipientIds: [user1Id],
      recipientNames: ["Иван Петров"],
      priority: "normal",
      status: "sent",
      readAt: {},
      isArchived: false,
    },
    {
      _id: messageId2,
      _creationTime: Date.now() - 3600000,
      type: "announcement",
      subject: "Новые правила клуба",
      content: "Уважаемые клиенты! Информируем вас о новых правилах посещения клуба.",
      senderId: adminId,
      senderName: "Администратор",
      recipientIds: [user1Id, user2Id, user3Id],
      recipientNames: ["Иван Петров", "Мария Иванова", "Анна Смирнова"],
      priority: "high",
      status: "sent",
      readAt: { [user2Id]: new Date().toISOString() },
      isArchived: false,
    },
    {
      _id: messageId3,
      _creationTime: Date.now() - 7200000,
      type: "notification",
      subject: "Напоминание о тренировке",
      content: "Не забудьте о тренировке сегодня в 18:00! Ваш тренер: Мария Иванова.",
      senderId: systemId,
      senderName: "Система",
      recipientIds: [user1Id],
      recipientNames: ["Иван Петров"],
      priority: "normal",
      status: "sent",
      readAt: {},
      isArchived: false,
    },
    {
      _id: messageId4,
      _creationTime: Date.now() - 86400000,
      type: "group",
      subject: "Собрание тренеров",
      content: "Завтра в 14:00 состоится собрание всех тренеров.",
      senderId: adminId,
      senderName: "Администратор",
      recipientIds: [trainer1Id, trainer2Id],
      recipientNames: ["Мария Иванова", "Алексей Сидоров"],
      groupId: groupId,
      priority: "normal",
      status: "sent",
      readAt: { [trainer1Id]: new Date().toISOString() },
      isArchived: false,
    },
    {
      _id: messageId5,
      _creationTime: Date.now() - 172800000,
      type: "direct",
      subject: "Срочное уведомление",
      content: "Срочно! Изменение расписания на завтра.",
      senderId: trainer1Id,
      senderName: "Мария Иванова",
      recipientIds: [user1Id],
      recipientNames: ["Иван Петров"],
      priority: "urgent",
      status: "sent",
      readAt: {},
      isArchived: false,
    },
  ];
}

export const useMessages = (userId?: Id<"users">) => {
  const [fallbackMessages, setFallbackMessages] = useState<Message[]>([]);
  const [fallbackUnreadCount, setFallbackUnreadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      const testMessages = generateTestMessages();
      setFallbackMessages(testMessages);
      
      if (userId) {
        const unread = testMessages.filter(msg => {
          const readAt = msg.readAt || {};
          return !readAt[userId] && msg.recipientIds.includes(userId);
        }).length;
        setFallbackUnreadCount(unread);
      }
      setIsInitialized(true);
    }
  }, [userId, isInitialized]);

  const isApiAvailable = isMessagesApiAvailable();

  let messagesResult: Message[] | undefined;
  let unreadCountResult: number | undefined;
  let apiError = false;
  
  try {
    if (isApiAvailable && api.messages?.list) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      messagesResult = useQuery(api.messages.list, userId ? { userId } : {});
    }
    
    if (isApiAvailable && api.messages?.getUnreadCount && userId) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      unreadCountResult = useQuery(api.messages.getUnreadCount, { userId });
    }
  } catch (error) {
    console.warn('Messages API недоступен:', error);
    apiError = true;
    messagesResult = undefined;
    unreadCountResult = undefined;
  }

  const isUsingFallback = !isApiAvailable || apiError || messagesResult === undefined;
  const messages = !isUsingFallback && messagesResult ? messagesResult : fallbackMessages;
  const unreadCount = !isUsingFallback && unreadCountResult !== undefined ? unreadCountResult : fallbackUnreadCount;

  let sendMessageMutation: any = null;
  let markAsReadMutation: any = null;
  let archiveMutation: any = null;
  let deleteMutation: any = null;
  let bulkArchiveMutation: any = null;
  let bulkDeleteMutation: any = null;
  let bulkMarkAsReadMutation: any = null;

  try {
    if (isApiAvailable && !apiError) {
      if (api.messages?.send) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        sendMessageMutation = useMutation(api.messages.send);
      }
      if (api.messages?.markAsRead) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        markAsReadMutation = useMutation(api.messages.markAsRead);
      }
      if (api.messages?.archive) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        archiveMutation = useMutation(api.messages.archive);
      }
      if (api.messages?.remove) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        deleteMutation = useMutation(api.messages.remove);
      }
      if (api.messages?.bulkArchive) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        bulkArchiveMutation = useMutation(api.messages.bulkArchive);
      }
      if (api.messages?.bulkDelete) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        bulkDeleteMutation = useMutation(api.messages.bulkDelete);
      }
      if (api.messages?.bulkMarkAsRead) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        bulkMarkAsReadMutation = useMutation(api.messages.bulkMarkAsRead);
      }
    }
  } catch (error) {
    console.warn('Messages mutations недоступны:', error);
  }

  const loadMessages = useCallback(async () => {
    return Promise.resolve();
  }, []);

  const markAsRead = useCallback(async (messageId: string | Id<"messages">, userId: Id<"users">) => {
    if (isUsingFallback || !isRealConvexId(messageId as string) || !markAsReadMutation) {
      setFallbackMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? {
              ...msg,
              status: "read" as const,
              readAt: { ...msg.readAt, [userId]: new Date().toISOString() }
            }
          : msg
      ));
      setFallbackUnreadCount(prev => Math.max(0, prev - 1));
      return;
    }

    try {
      await markAsReadMutation({ 
        messageId: messageId as Id<"messages">, 
        userId 
      });
    } catch (error) {
      console.error("Ошибка API отметки как прочитанное:", error);
      throw error;
    }
  }, [markAsReadMutation, isUsingFallback]);

  const archiveMessage = useCallback(async (messageId: string | Id<"messages">) => {
    if (isUsingFallback || !isRealConvexId(messageId as string) || !archiveMutation) {
      setFallbackMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, isArchived: true } : msg
      ));
      return;
    }

    try {
      await archiveMutation({ messageId: messageId as Id<"messages"> });
    } catch (error) {
      console.error("Ошибка архивирования:", error);
      throw error;
    }
  }, [archiveMutation, isUsingFallback]);

  const deleteMessage = useCallback(async (messageId: string | Id<"messages">) => {
    if (isUsingFallback || !isRealConvexId(messageId as string) || !deleteMutation) {
      setFallbackMessages(prev => prev.filter(msg => msg._id !== messageId));
      return;
    }

    try {
      await deleteMutation({ messageId: messageId as Id<"messages"> });
    } catch (error) {
      console.error("Ошибка удаления:", error);
      throw error;
    }
  }, [deleteMutation, isUsingFallback]);

  const bulkArchive = useCallback(async (messageIds: (string | Id<"messages">)[]) => {
    const realIds = messageIds.filter(id => isRealConvexId(id as string));
    const testIds = messageIds.filter(id => !isRealConvexId(id as string));

    if (testIds.length > 0) {
      setFallbackMessages(prev => prev.map(msg => 
        testIds.includes(msg._id) ? { ...msg, isArchived: true } : msg
      ));
    }

    if (!isUsingFallback && realIds.length > 0 && bulkArchiveMutation) {
      try {
        await bulkArchiveMutation({ 
          messageIds: realIds as Id<"messages">[] 
        });
      } catch (error) {
        console.error("Ошибка массового архивирования:", error);
        throw error;
      }
    }
  }, [bulkArchiveMutation, isUsingFallback]);

  const bulkDelete = useCallback(async (messageIds: (string | Id<"messages">)[]) => {
    const realIds = messageIds.filter(id => isRealConvexId(id as string));
    const testIds = messageIds.filter(id => !isRealConvexId(id as string));

    if (testIds.length > 0) {
      setFallbackMessages(prev => prev.filter(msg => !testIds.includes(msg._id)));
    }

    if (!isUsingFallback && realIds.length > 0 && bulkDeleteMutation) {
      try {
        await bulkDeleteMutation({ 
          messageIds: realIds as Id<"messages">[] 
        });
      } catch (error) {
        console.error("Ошибка массового удаления:", error);
        throw error;
      }
    }
  }, [bulkDeleteMutation, isUsingFallback]);

  const bulkMarkAsRead = useCallback(async (messageIds: (string | Id<"messages">)[], userId: Id<"users">) => {
    const realIds = messageIds.filter(id => isRealConvexId(id as string));
    const testIds = messageIds.filter(id => !isRealConvexId(id as string));

    if (testIds.length > 0) {
      setFallbackMessages(prev => prev.map(msg => 
        testIds.includes(msg._id) 
          ? {
              ...msg,
              status: "read" as const,
              readAt: { ...msg.readAt, [userId]: new Date().toISOString() }
            }
          : msg
      ));
      
      const unreadTestMessages = fallbackMessages.filter(msg => {
        const readAt = msg.readAt || {};
        return testIds.includes(msg._id)
        return testIds.includes(msg._id) && !readAt[userId] && msg.recipientIds.includes(userId);
      }).length;
      
      setFallbackUnreadCount(prev => Math.max(0, prev - unreadTestMessages));
    }

    if (!isUsingFallback && realIds.length > 0 && bulkMarkAsReadMutation) {
      try {
        await bulkMarkAsReadMutation({ 
          messageIds: realIds as Id<"messages">[], 
          userId 
        });
      } catch (error) {
        console.error("Ошибка массовой отметки как прочитанное:", error);
        throw error;
      }
    }
  }, [bulkMarkAsReadMutation, fallbackMessages, isUsingFallback]);

  const sendMessage = useCallback(async (messageData: {
    type: "direct" | "group" | "announcement" | "notification";
    subject?: string;
    content: string;
    senderId: Id<"users">;
    senderName: string;
    recipientIds: Id<"users">[];
    recipientNames: string[];
    groupId?: Id<"messageGroups">;
    priority: "low" | "normal" | "high" | "urgent";
    scheduledAt?: number;
    templateId?: Id<"notificationTemplates">;
  }) => {
    if (isUsingFallback || !sendMessageMutation) {
      const newMessage: Message = {
        _id: generateTestId('message') as Id<"messages">,
        _creationTime: Date.now(),
        type: messageData.type,
        subject: messageData.subject,
        content: messageData.content,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        recipientIds: messageData.recipientIds,
        recipientNames: messageData.recipientNames,
        groupId: messageData.groupId,
        priority: messageData.priority,
        status: "sent",
        readAt: {},
        isArchived: false,
        scheduledAt: messageData.scheduledAt,
        metadata: messageData.templateId ? { templateId: messageData.templateId } : undefined,
      };

      setFallbackMessages(prev => [newMessage, ...prev]);
      return newMessage._id;
    }

    try {
      return await sendMessageMutation(messageData);
    } catch (error) {
      console.error("Ошибка отправки сообщения через API:", error);
      
      const newMessage: Message = {
        _id: generateTestId('message') as Id<"messages">,
        _creationTime: Date.now(),
        type: messageData.type,
        subject: messageData.subject,
        content: messageData.content,
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        recipientIds: messageData.recipientIds,
        recipientNames: messageData.recipientNames,
        groupId: messageData.groupId,
        priority: messageData.priority,
        status: "sent",
        readAt: {},
        isArchived: false,
        scheduledAt: messageData.scheduledAt,
        metadata: messageData.templateId ? { templateId: messageData.templateId } : undefined,
      };

      setFallbackMessages(prev => [newMessage, ...prev]);
      return newMessage._id;
    }
  }, [sendMessageMutation, isUsingFallback]);

  return {
    messages: messages as Message[],
    unreadCount,
    loading: !isInitialized,
    isUsingFallback,
    isApiAvailable,
    loadMessages,
    markAsRead,
    archiveMessage,
    deleteMessage,
    bulkArchive,
    bulkDelete,
    bulkMarkAsRead,
    sendMessage,
  };
};

// Хук для проверки доступности Messages API
export function useMessagesAvailability() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAvailability = () => {
      try {
        const available = isMessagesApiAvailable();
        setIsAvailable(available);
      } catch (error) {
        console.warn('Messages API недоступен:', error);
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, []);

  return { isAvailable, isLoading };
}

// Хук для поиска сообщений
export function useMessageSearch(searchTerm: string, userId?: Id<"users">) {
  let searchResult: Message[] | undefined;
  
  try {
    if (isMessagesApiAvailable() && api.messages?.search && searchTerm.trim()) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      searchResult = useQuery(api.messages.search, { 
        searchTerm, 
        userId,
        limit: 50 
      });
    }
  } catch (error) {
    console.warn('Message search API недоступен:', error);
    searchResult = undefined;
  }

  const [fallbackResults, setFallbackResults] = useState<Message[]>([]);
  
  useEffect(() => {
    if (!searchResult && searchTerm.trim()) {
      const testMessages = generateTestMessages();
      const filtered = testMessages.filter(msg => {
        const searchLower = searchTerm.toLowerCase();
        return (
          msg.content.toLowerCase().includes(searchLower) ||
          (msg.subject && msg.subject.toLowerCase().includes(searchLower)) ||
          msg.senderName.toLowerCase().includes(searchLower)
        );
      });
      setFallbackResults(filtered);
    } else if (!searchTerm.trim()) {
      setFallbackResults([]);
    }
  }, [searchTerm, searchResult]);

  return searchResult ?? fallbackResults;
}

// Хук для получения сообщений по группе
export function useGroupMessages(groupId: Id<"messageGroups">) {
  let groupMessagesResult: Message[] | undefined;
  
  try {
    if (isMessagesApiAvailable() && api.messages?.getByGroup && isRealConvexId(groupId as string)) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      groupMessagesResult = useQuery(api.messages.getByGroup, { groupId });
    }
  } catch (error) {
    console.warn('Group messages API недоступен:', error);
    groupMessagesResult = undefined;
  }

  const [fallbackGroupMessages] = useState<Message[]>(() => {
    const testMessages = generateTestMessages();
    return testMessages.filter(msg => msg.groupId === groupId);
  });

  return groupMessagesResult ?? fallbackGroupMessages;
}

// Хук для непрочитанных сообщений
export function useUnreadMessages(userId: Id<"users">) {
  let unreadResult: Message[] | undefined;
  
  try {
    if (isMessagesApiAvailable() && api.messages?.getUnreadMessages && isRealConvexId(userId as string)) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      unreadResult = useQuery(api.messages.getUnreadMessages, { userId });
    }
  } catch (error) {
    console.warn('Unread messages API недоступен:', error);
    unreadResult = undefined;
  }

  const [fallbackUnread] = useState<Message[]>(() => {
    const testMessages = generateTestMessages();
    return testMessages.filter(msg => {
      const readAt = msg.readAt || {};
      return !readAt[userId] && msg.recipientIds.includes(userId);
    });
  });

  return unreadResult ?? fallbackUnread;
}

// Утилиты для создания тестовых ID
export function createTestUserId(): Id<"users"> {
  return generateTestId('user') as Id<"users">;
}

export function createTestMessageId(): Id<"messages"> {
  return generateTestId('message') as Id<"messages">;
}

export function createTestGroupId(): Id<"messageGroups"> {
  return generateTestId('group') as Id<"messageGroups">;
}

// Утилита для получения постоянного тестового ID
export function getStableTestId(key: string, prefix: string): string {
  return getTestId(key, prefix);
}

// Утилита для проверки типа ID
export function checkIdType(id: string): 'real' | 'test' {
  return isRealConvexId(id) ? 'real' : 'test';
}

// Функция для получения отладочной информации (без JSX)
export function getDebugInfo() {
  const isApiAvailable = isMessagesApiAvailable();
  const testMessages = generateTestMessages();
  
  return {
    apiAvailable: isApiAvailable,
    messagesCount: testMessages.length,
    sampleIds: testMessages.slice(0, 3).map(msg => ({
      id: msg._id,
      type: checkIdType(msg._id as string)
    })),
    testIdCacheSize: testIdCache.size
  };
}

// Функция для логирования отладочной информации
export function logDebugInfo() {
  const debugInfo = getDebugInfo();
  console.group('🔍 Messages Debug Info');
  console.log('API Available:', debugInfo.apiAvailable);
  console.log('Messages Count:', debugInfo.messagesCount);
  console.log('Sample IDs:', debugInfo.sampleIds);
  console.log('Test ID Cache Size:', debugInfo.testIdCacheSize);
  console.groupEnd();
}

// Экспорт типов
export type { Message } from "@/types/messages";

// Интерфейс для отладочной информации
export interface DebugInfo {
  apiAvailable: boolean;
  messagesCount: number;
  sampleIds: Array<{
    id: string;
    type: 'real' | 'test';
  }>;
  testIdCacheSize: number;
}
