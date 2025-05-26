// app/api/system/import/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';
import { mockTrainers, mockClients } from '@/lib/mock-data';

// POST /api/system/import/validate - Валидация данных перед импортом
export const POST = withPermissions(
  { resource: 'system', action: 'import' },
  async (req: AuthenticatedRequest) => {
    try {
      console.log('🔍 API: валидация данных перед импортом');

      const body = await req.json();
      const { data, entity } = body;

      if (!data || !entity) {
        return NextResponse.json(
          { success: false, error: 'Не указаны данные или тип сущности для валидации' },
          { status: 400 }
        );
      }

      const validationResults = {
        valid: 0,
        invalid: 0,
        duplicates: 0,
        errors: [] as Array<{
          row: number;
          field: string;
          value: any;
          error: string;
        }>
      };

      // Валидация в зависимости от типа сущности
      switch (entity) {
        case 'trainers':
          validateTrainers(data, validationResults);
          break;
        case 'clients':
          validateClients(data, validationResults);
          break;
        case 'sessions':
          validateSessions(data, validationResults);
          break;
        default:
          return NextResponse.json(
            { success: false, error: 'Неподдерживаемый тип сущности' },
            { status: 400 }
          );
      }

      const isValid = validationResults.errors.length === 0;

      return NextResponse.json({
        success: isValid,
        data: validationResults,
        message: isValid 
          ? `Валидация прошла успешно. ${validationResults.valid} записей готовы к импорту`
          : `Найдено ${validationResults.errors.length} ошибок валидации`
      });

    } catch (error: any) {
      console.error('💥 API: ошибка валидации данных:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации данных' },
        { status: 500 }
      );
    }
  }
);

// Функции валидации
function validateTrainers(data: any[], results: any) {
  const existingEmails = mockTrainers.map(t => t.email.toLowerCase());
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  data.forEach((trainer, index) => {
    let hasErrors = false;

    // Проверка обязательных полей
    if (!trainer.name) {
      results.errors.push({
        row: index + 1,
        field: 'name',
        value: trainer.name,
        error: 'Обязательное поле'
      });
      hasErrors = true;
    }

    if (!trainer.email) {
      results.errors.push({
        row: index + 1,
        field: 'email',
        value: trainer.email,
        error: 'Обязательное поле'
      });
      hasErrors = true;
    } else {
      // Валидация формата email
      if (!emailRegex.test(trainer.email)) {
        results.errors.push({
          row: index + 1,
          field: 'email',
          value: trainer.email,
          error: 'Некорректный формат email'
        });
        hasErrors = true;
      }

      // Проверка дубликатов
      if (existingEmails.includes(trainer.email.toLowerCase())) {
        results.errors.push({
          row: index + 1,
          field: 'email',
          value: trainer.email,
          error: 'Email уже существует в системе'
        });
        results.duplicates++;
        hasErrors = true;
      }
    }

    // Валидация роли
    if (trainer.role && !['trainer', 'admin', 'manager'].includes(trainer.role)) {
            results.errors.push({
        row: index + 1,
        field: 'role',
        value: trainer.role,
        error: 'Допустимые значения: trainer, admin, manager'
      });
      hasErrors = true;
    }

    // Валидация статуса
    if (trainer.status && !['active', 'inactive', 'suspended'].includes(trainer.status)) {
      results.errors.push({
        row: index + 1,
        field: 'status',
        value: trainer.status,
        error: 'Допустимые значения: active, inactive, suspended'
      });
      hasErrors = true;
    }

    // Валидация телефона
    if (trainer.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(trainer.phone.replace(/\s/g, ''))) {
      results.errors.push({
        row: index + 1,
        field: 'phone',
        value: trainer.phone,
        error: 'Некорректный формат телефона'
      });
      hasErrors = true;
    }

    // Валидация числовых полей
    if (trainer.experience !== undefined && (isNaN(trainer.experience) || trainer.experience < 0)) {
      results.errors.push({
        row: index + 1,
        field: 'experience',
        value: trainer.experience,
        error: 'Должно быть положительным числом'
      });
      hasErrors = true;
    }

    if (trainer.rating !== undefined && (isNaN(trainer.rating) || trainer.rating < 0 || trainer.rating > 5)) {
      results.errors.push({
        row: index + 1,
        field: 'rating',
        value: trainer.rating,
        error: 'Должно быть числом от 0 до 5'
      });
      hasErrors = true;
    }

    if (!hasErrors) {
      results.valid++;
    } else {
      results.invalid++;
    }
  });
}

function validateClients(data: any[], results: any) {
  const existingEmails = [...mockTrainers, ...mockClients].map(u => u.email.toLowerCase());
  const existingTrainerIds = mockTrainers.map(t => t.id);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  data.forEach((client, index) => {
    let hasErrors = false;

    // Проверка обязательных полей
    if (!client.name) {
      results.errors.push({
        row: index + 1,
        field: 'name',
        value: client.name,
        error: 'Обязательное поле'
      });
      hasErrors = true;
    }

    if (!client.email) {
      results.errors.push({
        row: index + 1,
        field: 'email',
        value: client.email,
        error: 'Обязательное поле'
      });
      hasErrors = true;
    } else {
      // Валидация формата email
      if (!emailRegex.test(client.email)) {
        results.errors.push({
          row: index + 1,
          field: 'email',
          value: client.email,
          error: 'Некорректный формат email'
        });
        hasErrors = true;
      }

      // Проверка дубликатов
      if (existingEmails.includes(client.email.toLowerCase())) {
        results.errors.push({
          row: index + 1,
          field: 'email',
          value: client.email,
          error: 'Email уже существует в системе'
        });
        results.duplicates++;
        hasErrors = true;
      }
    }

    // Валидация тренера
    if (client.trainerId && !existingTrainerIds.includes(client.trainerId)) {
      results.errors.push({
        row: index + 1,
        field: 'trainerId',
        value: client.trainerId,
        error: 'Тренер с указанным ID не найден'
      });
      hasErrors = true;
    }

    // Валидация статуса
    if (client.status && !['active', 'inactive', 'suspended'].includes(client.status)) {
      results.errors.push({
        row: index + 1,
        field: 'status',
        value: client.status,
        error: 'Допустимые значения: active, inactive, suspended'
      });
      hasErrors = true;
    }

    // Валидация типа членства
    if (client.membershipType && !['basic', 'premium', 'vip'].includes(client.membershipType)) {
      results.errors.push({
        row: index + 1,
        field: 'membershipType',
        value: client.membershipType,
        error: 'Допустимые значения: basic, premium, vip'
      });
      hasErrors = true;
    }

    // Валидация даты рождения
    if (client.birthDate) {
      const birthDate = new Date(client.birthDate);
      const now = new Date();
      const age = now.getFullYear() - birthDate.getFullYear();
      
      if (isNaN(birthDate.getTime()) || age < 16 || age > 100) {
        results.errors.push({
          row: index + 1,
          field: 'birthDate',
          value: client.birthDate,
          error: 'Некорректная дата рождения (возраст должен быть от 16 до 100 лет)'
        });
        hasErrors = true;
      }
    }

    // Валидация даты присоединения
    if (client.joinDate) {
      const joinDate = new Date(client.joinDate);
      if (isNaN(joinDate.getTime())) {
        results.errors.push({
          row: index + 1,
          field: 'joinDate',
          value: client.joinDate,
          error: 'Некорректный формат даты (используйте YYYY-MM-DD)'
        });
        hasErrors = true;
      }
    }

    // Валидация телефона
    if (client.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(client.phone.replace(/\s/g, ''))) {
      results.errors.push({
        row: index + 1,
        field: 'phone',
        value: client.phone,
        error: 'Некорректный формат телефона'
      });
      hasErrors = true;
    }

    if (!hasErrors) {
      results.valid++;
    } else {
      results.invalid++;
    }
  });
}

function validateSessions(data: any[], results: any) {
  const existingTrainerIds = mockTrainers.map(t => t.id);
  const existingClientIds = mockClients.map(c => c.id);

  data.forEach((session, index) => {
    let hasErrors = false;

    // Проверка обязательных полей
    const requiredFields = ['trainerId', 'clientId', 'date', 'startTime', 'endTime'];
    requiredFields.forEach(field => {
      if (!session[field]) {
        results.errors.push({
          row: index + 1,
          field,
          value: session[field],
          error: 'Обязательное поле'
        });
        hasErrors = true;
      }
    });

    // Валидация существования тренера
    if (session.trainerId && !existingTrainerIds.includes(session.trainerId)) {
      results.errors.push({
        row: index + 1,
        field: 'trainerId',
        value: session.trainerId,
        error: 'Тренер с указанным ID не найден'
      });
      hasErrors = true;
    }

    // Валидация существования клиента
    if (session.clientId && !existingClientIds.includes(session.clientId)) {
      results.errors.push({
        row: index + 1,
        field: 'clientId',
        value: session.clientId,
        error: 'Клиент с указанным ID не найден'
      });
      hasErrors = true;
    }

    // Валидация даты
    if (session.date) {
      const sessionDate = new Date(session.date);
      if (isNaN(sessionDate.getTime())) {
        results.errors.push({
          row: index + 1,
          field: 'date',
          value: session.date,
          error: 'Некорректный формат даты (используйте YYYY-MM-DD)'
        });
        hasErrors = true;
      }
    }

    // Валидация времени
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (session.startTime && !timeRegex.test(session.startTime)) {
      results.errors.push({
        row: index + 1,
        field: 'startTime',
        value: session.startTime,
        error: 'Некорректный формат времени (используйте HH:MM)'
      });
      hasErrors = true;
    }

    if (session.endTime && !timeRegex.test(session.endTime)) {
      results.errors.push({
        row: index + 1,
        field: 'endTime',
        value: session.endTime,
        error: 'Некорректный формат времени (используйте HH:MM)'
      });
      hasErrors = true;
    }

    // Валидация логики времени
    if (session.startTime && session.endTime && timeRegex.test(session.startTime) && timeRegex.test(session.endTime)) {
      const startMinutes = timeToMinutes(session.startTime);
      const endMinutes = timeToMinutes(session.endTime);
      
      if (endMinutes <= startMinutes) {
        results.errors.push({
          row: index + 1,
          field: 'endTime',
          value: session.endTime,
          error: 'Время окончания должно быть позже времени начала'
        });
        hasErrors = true;
      }

      if (endMinutes - startMinutes > 180) { // Максимум 3 часа
        results.errors.push({
          row: index + 1,
          field: 'endTime',
          value: session.endTime,
          error: 'Продолжительность сессии не может превышать 3 часа'
        });
        hasErrors = true;
      }
    }

    // Валидация типа сессии
    if (session.type && !['personal', 'group', 'consultation'].includes(session.type)) {
      results.errors.push({
        row: index + 1,
        field: 'type',
        value: session.type,
        error: 'Допустимые значения: personal, group, consultation'
      });
      hasErrors = true;
    }

    // Валидация статуса сессии
    if (session.status && !['scheduled', 'completed', 'cancelled', 'no-show'].includes(session.status)) {
      results.errors.push({
        row: index + 1,
        field: 'status',
        value: session.status,
        error: 'Допустимые значения: scheduled, completed, cancelled, no-show'
      });
      hasErrors = true;
    }

    if (!hasErrors) {
      results.valid++;
    } else {
      results.invalid++;
    }
  });
}

// Вспомогательная функция для конвертации времени в минуты
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

