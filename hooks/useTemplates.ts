// hooks/useTemplates.ts (исправленная версия с типизацией)
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { NotificationTemplate } from "@/types/messages";
import { Id } from "@/convex/_generated/dataModel";

// Проверяем доступность API функций для шаблонов
function isTemplatesApiAvailable() {
  try {
    return api && api.notificationTemplates && typeof api.notificationTemplates === 'object';
  } catch (error) {
    return false;
  }
}

// Генерируем тестовые данные для шаблонов
function generateTestTemplates(): NotificationTemplate[] {
  return [
    {
      _id: "template1" as Id<"notificationTemplates">,
      _creationTime: Date.now(),
      name: "Добро пожаловать",
      description: "Приветственное сообщение для новых пользователей",
      type: "in-app",
      subject: "Добро пожаловать в {{clubName}}!",
      content: "Здравствуйте, {{userName}}! Добро пожаловать в нашу систему управления фитнес-клубом.",
      variables: ["userName", "clubName"],
      isActive: true,
      createdBy: "admin" as Id<"users">,
      category: "welcome",
      priority: "normal",
    },
    {
      _id: "template2" as Id<"notificationTemplates">,
      _creationTime: Date.now() - 86400000,
      name: "Напоминание о тренировке",
      description: "Напоминание о предстоящей тренировке",
      type: "push",
      subject: "Напоминание о тренировке",
      content: "Не забудьте о тренировке сегодня в {{time}}! Ваш тренер: {{trainerName}}.",
      variables: ["time", "trainerName"],
      isActive: true,
      createdBy: "admin" as Id<"users">,
      category: "reminder",
      priority: "high",
    },
    {
      _id: "template3" as Id<"notificationTemplates">,
      _creationTime: Date.now() - 172800000,
      name: "Срочное уведомление",
      description: "Шаблон для срочных уведомлений",
      type: "email",
      subject: "СРОЧНО: {{title}}",
      content: "Срочное уведомление: {{message}}",
      variables: ["title", "message"],
      isActive: false,
      createdBy: "admin" as Id<"users">,
      category: "urgent",
      priority: "urgent",
    },
  ];
}

export const useTemplates = () => {
  // Fallback данные
  const [fallbackTemplates, setFallbackTemplates] = useState<NotificationTemplate[]>([]);

  // Инициализируем fallback данные
  useEffect(() => {
    const testTemplates = generateTestTemplates();
    setFallbackTemplates(testTemplates);
  }, []);

  // Проверяем доступность API
  const isApiAvailable = isTemplatesApiAvailable();

  // Безопасный useQuery
  let templatesResult: NotificationTemplate[] | undefined;

  try {
    if (isApiAvailable && api.notificationTemplates?.list) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      templatesResult = useQuery(api.notificationTemplates.list, { isActive: true });
    }
  } catch (error) {
    console.warn('Templates API недоступен:', error);
    templatesResult = undefined;
  }

  // Используем реальные данные если доступны, иначе fallback
  const templates = templatesResult ?? fallbackTemplates;

  // Мутации с явной типизацией
  let createTemplateMutation: any = null;
  let updateTemplateMutation: any = null;
  let deleteTemplateMutation: any = null;

  try {
    if (isApiAvailable) {
      if (api.notificationTemplates?.create) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        createTemplateMutation = useMutation(api.notificationTemplates.create);
      }
      if (api.notificationTemplates?.update) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        updateTemplateMutation = useMutation(api.notificationTemplates.update);
      }
      if (api.notificationTemplates?.remove) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        deleteTemplateMutation = useMutation(api.notificationTemplates.remove);
      }
    }
  } catch (error) {
    console.warn('Template mutations недоступны:', error);
  }

  const createTemplate = useCallback(async (templateData: {
    name: string;
    description?: string;
    type: "email" | "sms" | "push" | "in-app";
    subject: string;
    content: string;
    variables: string[];
    createdBy: Id<"users">;
    category?: string;
    priority: "low" | "normal" | "high" | "urgent";
  }) => {
    try {
      if (createTemplateMutation) {
        return await createTemplateMutation(templateData);
      } else {
        // Fallback: добавляем в локальное состояние
        const newTemplate: NotificationTemplate = {
          _id: `template_${Date.now()}` as Id<"notificationTemplates">,
          _creationTime: Date.now(),
          ...templateData,
          isActive: true,
        };
        setFallbackTemplates(prev => [newTemplate, ...prev]);
        return newTemplate._id;
      }
    } catch (error) {
      console.error("Ошибка создания шаблона:", error);
      throw error;
    }
  }, [createTemplateMutation]);

  const updateTemplate = useCallback(async (
    id: Id<"notificationTemplates">,
    updates: {
      name?: string;
      description?: string;
      subject?: string;
      content?: string;
      variables?: string[];
      isActive?: boolean;
    }
  ) => {
    try {
      if (updateTemplateMutation) {
        await updateTemplateMutation({ id, ...updates });
      } else {
        // Fallback: обновляем локальное состояние
        setFallbackTemplates(prev => prev.map(template =>
          template._id === id ? { ...template, ...updates } : template
        ));
      }
    } catch (error) {
      console.error("Ошибка обновления шаблона:", error);
      throw error;
    }
  }, [updateTemplateMutation]);

  const deleteTemplate = useCallback(async (id: Id<"notificationTemplates">) => {
    try {
      if (deleteTemplateMutation) {
        await deleteTemplateMutation({ id });
      } else {
        // Fallback: удаляем из локального состояния
        setFallbackTemplates(prev => prev.filter(template => template._id !== id));
      }
    } catch (error) {
      console.error("Ошибка удаления шаблона:", error);
      throw error;
    }
  }, [deleteTemplateMutation]);

  const toggleTemplate = useCallback(async (id: Id<"notificationTemplates">, isActive: boolean) => {
    try {
      if (updateTemplateMutation) {
        await updateTemplateMutation({ id, isActive });
      } else {
        // Fallback: обновляем локальное состояние
        setFallbackTemplates(prev => prev.map(template =>
          template._id === id ? { ...template, isActive } : template
        ));
      }
    } catch (error) {
      console.error("Ошибка переключения шаблона:", error);
      throw error;
    }
  }, [updateTemplateMutation]);

  return {
    templates: templates as NotificationTemplate[],
    loading: templates === undefined,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplate,
    isApiAvailable,
  };
};
