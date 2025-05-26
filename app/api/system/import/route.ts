// app/api/system/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';
import { mockTrainers, mockClients, mockSessions, Trainer, Client, Session } from '@/lib/mock-data';

// Интерфейсы для импорта
interface ImportData {
  trainers?: any[];
  clients?: any[];
  sessions?: any[];
}

interface ImportResults {
  trainers: { imported: number; skipped: number; errors: number };
  clients: { imported: number; skipped: number; errors: number };
  sessions: { imported: number; skipped: number; errors: number };
  validationErrors: Array<{
    entity: string;
    record: any;
    error: string;
  }>;
  startTime: string;
  endTime: string | null;
}

interface ValidationError {
  entity: string;
  record: any;
  error: string;
}

// POST /api/system/import - Импорт данных
export const POST = withPermissions(
  { resource: 'system', action: 'import' },
  async (req: AuthenticatedRequest) => {
    try {
      console.log('📥 API: импорт данных');

      const { user } = req;
      
      const body = await req.json();
      const { 
        data,
        mode = 'merge',
        validateOnly = false,
        skipDuplicates = true
      }: {
        data: ImportData;
        mode?: 'merge' | 'replace' | 'append';
        validateOnly?: boolean;
        skipDuplicates?: boolean;
      } = body;

      const importResults: ImportResults = {
        trainers: { imported: 0, skipped: 0, errors: 0 },
        clients: { imported: 0, skipped: 0, errors: 0 },
        sessions: { imported: 0, skipped: 0, errors: 0 },
        validationErrors: [],
        startTime: new Date().toISOString(),
        endTime: null
      };

      // Валидация входных данных
      if (!data || typeof data !== 'object') {
        return NextResponse.json(
          { success: false, error: 'Некорректные данные для импорта' },
          { status: 400 }
        );
      }

      // Валидация и импорт тренеров
      if (data.trainers && Array.isArray(data.trainers)) {
        for (const trainerData of data.trainers) {
          try {
            // Валидация обязательных полей
            if (!trainerData.name || !trainerData.email) {
              const error: ValidationError = {
                entity: 'trainer',
                record: trainerData,
                error: 'Отсутствуют обязательные поля (name, email)'
              };
              importResults.validationErrors.push(error);
              importResults.trainers.errors++;
              continue;
            }

            // Валидация email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trainerData.email)) {
              const error: ValidationError = {
                entity: 'trainer',
                record: trainerData,
                error: 'Некорректный формат email'
              };
              importResults.validationErrors.push(error);
              importResults.trainers.errors++;
              continue;
            }

            // Проверка дубликатов
            const existingTrainer = mockTrainers.find(t => t.email === trainerData.email);
            if (existingTrainer && skipDuplicates) {
              importResults.trainers.skipped++;
              continue;
            }

            // Валидация роли
            const validRoles = ['trainer', 'admin', 'manager'];
            if (trainerData.role && !validRoles.includes(trainerData.role)) {
              const error: ValidationError = {
                entity: 'trainer',
                record: trainerData,
                error: 'Некорректная роль'
              };
              importResults.validationErrors.push(error);
              importResults.trainers.errors++;
              continue;
            }

            // Валидация статуса
            const validStatuses = ['active', 'inactive', 'suspended'];
            if (trainerData.status && !validStatuses.includes(trainerData.status)) {
              const error: ValidationError = {
                entity: 'trainer',
                record: trainerData,
                error: 'Некорректный статус'
              };
              importResults.validationErrors.push(error);
              importResults.trainers.errors++;
              continue;
            }

            // Валидация рабочих часов
            if (trainerData.workingHours) {
              const workingHoursErrors = validateWorkingHours(trainerData.workingHours);
              if (workingHoursErrors.length > 0) {
                const error: ValidationError = {
                  entity: 'trainer',
                  record: trainerData,
                  error: `Некорректные рабочие часы: ${workingHoursErrors.join(', ')}`
                };
                importResults.validationErrors.push(error);
                importResults.trainers.errors++;
                continue;
              }
            }

            if (!validateOnly) {
              if (existingTrainer && mode === 'merge') {
                // Обновление существующего тренера
                const trainerIndex = mockTrainers.findIndex(t => t.id === existingTrainer.id);
                if (trainerIndex !== -1) {
                  mockTrainers[trainerIndex] = {
                    ...existingTrainer,
                    ...trainerData,
                    id: existingTrainer.id,
                    specialization: trainerData.specializations || trainerData.specialization || existingTrainer.specialization,
                    createdAt: existingTrainer.createdAt,
                    createdBy: existingTrainer.createdBy,
                    updatedAt: new Date().toISOString(),
                    updatedBy: user.id
                  };
                }
              } else {
                // Создание нового тренера
                const newTrainer: Trainer = {
                  id: trainerData.id || `trainer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  name: trainerData.name,
                  email: trainerData.email,
                  phone: trainerData.phone || '',
                  role: trainerData.role || 'trainer',
                  status: trainerData.status || 'active',
                  specialization: trainerData.specializations || trainerData.specialization || [],
                  experience: trainerData.experience || 0,
                  rating: trainerData.rating || 0,
                  activeClients: trainerData.activeClients || 0,
                  totalSessions: trainerData.totalSessions || 0,
                  hourlyRate: trainerData.hourlyRate || 0,
                  certifications: trainerData.certifications || [],
                  workingHours: trainerData.workingHours || createDefaultWorkingHours(),
                  createdAt: trainerData.createdAt || new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  createdBy: user.id,
                  updatedBy: user.id
                };
                mockTrainers.push(newTrainer);
              }
            }

            importResults.trainers.imported++;

          } catch (error: any) {
            const validationError: ValidationError = {
              entity: 'trainer',
              record: trainerData,
              error: error?.message || 'Неизвестная ошибка'
            };
            importResults.validationErrors.push(validationError);
            importResults.trainers.errors++;
          }
        }
      }

      // Валидация и импорт клиентов
      if (data.clients && Array.isArray(data.clients)) {
        for (const clientData of data.clients) {
          try {
            // Валидация обязательных полей
            if (!clientData.name || !clientData.email) {
              const error: ValidationError = {
                entity: 'client',
                record: clientData,
                error: 'Отсутствуют обязательные поля (name, email)'
              };
              importResults.validationErrors.push(error);
              importResults.clients.errors++;
              continue;
            }

            // Валидация email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(clientData.email)) {
              const error: ValidationError = {
                entity: 'client',
                record: clientData,
                error: 'Некорректный формат email'
              };
              importResults.validationErrors.push(error);
              importResults.clients.errors++;
              continue;
            }

            // Проверка существования тренера
            if (clientData.trainerId) {
              const trainer = mockTrainers.find(t => t.id === clientData.trainerId);
              if (!trainer) {
                const error: ValidationError = {
                  entity: 'client',
                  record: clientData,
                  error: `Тренер с ID ${clientData.trainerId} не найден`
                };
                importResults.validationErrors.push(error);
                importResults.clients.errors++;
                continue;
              }
            }

            // Валидация статуса
            const validStatuses = ['active', 'inactive', 'suspended', 'trial'];
            if (clientData.status && !validStatuses.includes(clientData.status)) {
              const error: ValidationError = {
                entity: 'client',
                record: clientData,
                error: 'Некорректный статус'
              };
              importResults.validationErrors.push(error);
              importResults.clients.errors++;
              continue;
            }

            // Валидация типа членства
            const validMembershipTypes = ['basic', 'premium', 'vip'];
            if (clientData.membershipType && !validMembershipTypes.includes(clientData.membershipType)) {
              const error: ValidationError = {
                entity: 'client',
                record: clientData,
                error: 'Некорректный тип членства'
              };
              importResults.validationErrors.push(error);
              importResults.clients.errors++;
              continue;
            }

            // Проверка дубликатов
            const existingClient = mockClients.find(c => c.email === clientData.email);
            if (existingClient && skipDuplicates) {
              importResults.clients.skipped++;
              continue;
            }

            if (!validateOnly) {
              if (existingClient && mode === 'merge') {
                // Обновление существующего клиента
                const clientIndex = mockClients.findIndex(c => c.id === existingClient.id);
                if (clientIndex !== -1) {
                  mockClients[clientIndex] = {
                    ...existingClient,
                    ...clientData,
                    id: existingClient.id,
                    createdAt: existingClient.createdAt,
                    createdBy: existingClient.createdBy,
                    updatedAt: new Date().toISOString(),
                    updatedBy: user.id
                  };
                }
              } else {
                // Создание нового клиента
                const newClient: Client = {
                  id: clientData.id || `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  name: clientData.name,
                  email: clientData.email,
                  phone: clientData.phone || '',
                  status: clientData.status || 'active',
                  trainerId: clientData.trainerId || undefined,
                  membershipType: clientData.membershipType || 'basic',
                  joinDate: clientData.joinDate || new Date().toISOString().split('T')[0],
                  totalSessions: clientData.totalSessions || 0,
                  createdAt: clientData.createdAt || new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  createdBy: user.id,
                  updatedBy: user.id
                };
                mockClients.push(newClient);
              }
            }

            importResults.clients.imported++;

          } catch (error: any) {
            const validationError: ValidationError = {
              entity: 'client',
              record: clientData,
              error: error?.message || 'Неизвестная ошибка'
            };
            importResults.validationErrors.push(validationError);
            importResults.clients.errors++;
          }
        }
      }

      // Валидация и импорт сессий
      if (data.sessions && Array.isArray(data.sessions)) {
        for (const sessionData of data.sessions) {
          try {
            // Валидация обязательных полей
            if (!sessionData.date || !sessionData.startTime || !sessionData.endTime || 
                !sessionData.trainerId || !sessionData.clientId) {
              const error: ValidationError = {
                entity: 'session',
                record: sessionData,
                error: 'Отсутствуют обязательные поля (date, startTime, endTime, trainerId, clientId)'
              };
              importResults.validationErrors.push(error);
              importResults.sessions.errors++;
              continue;
            }

            // Проверка существования тренера и клиента
            const trainer = mockTrainers.find(t => t.id === sessionData.trainerId);
            const client = mockClients.find(c => c.id === sessionData.clientId);

            if (!trainer) {
              const error: ValidationError = {
                entity: 'session',
                record: sessionData,
                error: `Тренер с ID ${sessionData.trainerId} не найден`
              };
              importResults.validationErrors.push(error);
              importResults.sessions.errors++;
              continue;
            }

            if (!client) {
              const error: ValidationError = {
                entity: 'session',
                record: sessionData,
                error: `Клиент с ID ${sessionData.clientId} не найден`
              };
              importResults.validationErrors.push(error);
              importResults.sessions.errors++;
              continue;
            }

            // Валидация статуса
            const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
            if (sessionData.status && !validStatuses.includes(sessionData.status)) {
              const error: ValidationError = {
                entity: 'session',
                record: sessionData,
                error: 'Некорректный статус сессии'
              };
              importResults.validationErrors.push(error);
              importResults.sessions.errors++;
              continue;
            }

            // Валидация типа сессии
            const validTypes = ['personal', 'group', 'consultation'];
            if (sessionData.type && !validTypes.includes(sessionData.type)) {
              const error: ValidationError = {
                entity: 'session',
                record: sessionData,
                error: 'Некорректный тип сессии'
              };
              importResults.validationErrors.push(error);
              importResults.sessions.errors++;
              continue;
            }

            // Проверка конфликтов времени
            const sessionDateTime = new Date(`${sessionData.date}T${sessionData.startTime}`);
            const sessionEndTime = new Date(`${sessionData.date}T${sessionData.endTime}`);

                        const conflictingSession = mockSessions.find(s => 
              s.trainerId === sessionData.trainerId &&
              s.status !== 'cancelled' &&
              s.id !== sessionData.id &&
              s.date === sessionData.date &&
              (
                (sessionDateTime >= new Date(`${s.date}T${s.startTime}`) && 
                 sessionDateTime < new Date(`${s.date}T${s.endTime}`)) ||
                (sessionEndTime > new Date(`${s.date}T${s.startTime}`) && 
                 sessionEndTime <= new Date(`${s.date}T${s.endTime}`))
              )
            );

            if (conflictingSession) {
              const error: ValidationError = {
                entity: 'session',
                record: sessionData,
                error: 'Конфликт времени с существующей сессией'
              };
              importResults.validationErrors.push(error);
              importResults.sessions.errors++;
              continue;
            }

            if (!validateOnly) {
              const existingSession = mockSessions.find(s => s.id === sessionData.id);
              
              if (existingSession && mode === 'merge') {
                // Обновление существующей сессии
                const sessionIndex = mockSessions.findIndex(s => s.id === existingSession.id);
                if (sessionIndex !== -1) {
                  mockSessions[sessionIndex] = {
                    ...existingSession,
                    ...sessionData,
                    id: existingSession.id,
                    createdAt: existingSession.createdAt,
                    createdBy: existingSession.createdBy,
                    updatedAt: new Date().toISOString(),
                    updatedBy: user.id
                  };
                }
              } else {
                // Создание новой сессии
                const newSession: Session = {
                  id: sessionData.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  trainerId: sessionData.trainerId,
                  clientId: sessionData.clientId,
                  date: sessionData.date,
                  startTime: sessionData.startTime,
                  endTime: sessionData.endTime,
                  type: sessionData.type || 'personal',
                  status: sessionData.status || 'scheduled',
                  notes: sessionData.notes || '',
                  createdAt: sessionData.createdAt || new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  createdBy: user.id,
                  updatedBy: user.id
                };
                mockSessions.push(newSession);
              }
            }

            importResults.sessions.imported++;

          } catch (error: any) {
            const validationError: ValidationError = {
              entity: 'session',
              record: sessionData,
              error: error?.message || 'Неизвестная ошибка'
            };
            importResults.validationErrors.push(validationError);
            importResults.sessions.errors++;
          }
        }
      }

      // Завершение импорта
      importResults.endTime = new Date().toISOString();

      const totalProcessed = importResults.trainers.imported + importResults.trainers.skipped + importResults.trainers.errors +
                            importResults.clients.imported + importResults.clients.skipped + importResults.clients.errors +
                            importResults.sessions.imported + importResults.sessions.skipped + importResults.sessions.errors;

      const hasErrors = importResults.validationErrors.length > 0;
      const hasImported = importResults.trainers.imported + importResults.clients.imported + importResults.sessions.imported > 0;

      // Обновление счетчиков после импорта
      if (!validateOnly && hasImported) {
        updateCountersAfterImport();
      }

      console.log(`${hasErrors ? '⚠️' : '✅'} API: импорт ${validateOnly ? 'валидирован' : 'завершен'} - ${totalProcessed} записей`);

      return NextResponse.json({
        success: !hasErrors || validateOnly,
        data: {
          ...importResults,
          summary: {
            totalProcessed,
            totalImported: importResults.trainers.imported + importResults.clients.imported + importResults.sessions.imported,
            totalSkipped: importResults.trainers.skipped + importResults.clients.skipped + importResults.sessions.skipped,
            totalErrors: importResults.trainers.errors + importResults.clients.errors + importResults.sessions.errors,
            mode,
            validateOnly,
            skipDuplicates
          }
        },
        message: validateOnly 
          ? `Валидация завершена. Обработано ${totalProcessed} записей. ${hasErrors ? `Найдено ${importResults.validationErrors.length} ошибок` : 'Ошибок не найдено'}`
          : `Импорт завершен. Обработано ${totalProcessed} записей. ${hasErrors ? `С ${importResults.validationErrors.length} ошибками` : 'Успешно'}`
      }, { status: hasErrors && !validateOnly ? 400 : 200 });

    } catch (error: any) {
      console.error('💥 API: ошибка импорта данных:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка импорта данных: ' + (error?.message || 'Неизвестная ошибка') },
        { status: 500 }
      );
    }
  }
);

// GET /api/system/import - Получение шаблона для импорта
export const GET = withPermissions(
  { resource: 'system', action: 'import' },
  async (req: AuthenticatedRequest) => {
    try {
      console.log('📋 API: получение шаблона импорта');

      const url = new URL(req.url);
      const format = url.searchParams.get('format') || 'json';
      const entity = url.searchParams.get('entity') || 'all';

      const templates = {
        trainer: {
          id: 'trainer_example',
          name: 'Иван Иванов',
          email: 'ivan.ivanov@example.com',
          phone: '+7 (999) 123-45-67',
          role: 'trainer',
          status: 'active',
          specialization: ['Силовые тренировки', 'Кардио'],
          experience: 5,
          rating: 4.8,
          activeClients: 15,
          totalSessions: 250,
          hourlyRate: 2500,
          certifications: ['Сертификат персонального тренера', 'Сертификат по фитнесу'],
          workingHours: {
            monday: { start: '09:00', end: '18:00', available: true },
            tuesday: { start: '09:00', end: '18:00', available: true },
            wednesday: { start: '09:00', end: '18:00', available: true },
            thursday: { start: '09:00', end: '18:00', available: true },
            friday: { start: '09:00', end: '18:00', available: true },
            saturday: { start: '10:00', end: '16:00', available: true },
            sunday: { start: '10:00', end: '16:00', available: false }
          }
        },
        client: {
          id: 'client_example',
          name: 'Анна Петрова',
          email: 'anna.petrova@example.com',
          phone: '+7 (999) 234-56-78',
          status: 'active',
          trainerId: 'trainer_example',
          membershipType: 'premium',
          joinDate: '2024-01-15',
          totalSessions: 20
        },
        session: {
          id: 'session_example',
          trainerId: 'trainer_example',
          clientId: 'client_example',
          date: '2024-01-20',
          startTime: '10:00',
          endTime: '11:00',
          type: 'personal',
          status: 'scheduled',
          notes: 'Первая тренировка'
        }
      };

      let responseData;

      switch (entity) {
        case 'trainers':
          responseData = { trainers: [templates.trainer] };
          break;
        case 'clients':
          responseData = { clients: [templates.client] };
          break;
        case 'sessions':
          responseData = { sessions: [templates.session] };
          break;
        default:
          responseData = {
            trainers: [templates.trainer],
            clients: [templates.client],
            sessions: [templates.session]
          };
      }

      if (format === 'csv') {
        const csvHeaders = {
          trainers: 'id,name,email,phone,role,status,specialization,experience,rating,activeClients,totalSessions,hourlyRate,certifications,workingHours',
          clients: 'id,name,email,phone,status,trainerId,membershipType,joinDate,totalSessions',
          sessions: 'id,trainerId,clientId,date,startTime,endTime,type,status,notes'
        };

        return new NextResponse(
          entity === 'all' 
            ? Object.values(csvHeaders).join('\n\n')
            : csvHeaders[entity as keyof typeof csvHeaders] || csvHeaders.trainers,
          {
            status: 200,
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="import_template_${entity}.csv"`
            }
          }
        );
      }

      return NextResponse.json({
        success: true,
        data: responseData,
        meta: {
          format,
          entity,
          description: 'Шаблон для импорта данных',
          instructions: {
            required_fields: {
              trainers: ['name', 'email'],
              clients: ['name', 'email'],
              sessions: ['trainerId', 'clientId', 'date', 'startTime', 'endTime']
            },
            valid_values: {
              trainer_roles: ['trainer', 'admin', 'manager'],
              statuses: ['active', 'inactive', 'suspended', 'trial'],
              membership_types: ['basic', 'premium', 'vip'],
              session_types: ['personal', 'group', 'consultation'],
              session_statuses: ['scheduled', 'completed', 'cancelled', 'no-show']
            },
            date_formats: {
              date: 'YYYY-MM-DD (например: 2024-01-20)',
              time: 'HH:MM (например: 10:00)',
              datetime: 'YYYY-MM-DDTHH:MM:SSZ (например: 2024-01-20T10:00:00Z)'
            },
            field_descriptions: {
              trainers: {
                specialization: 'Массив специализаций тренера',
                experience: 'Опыт работы в годах',
                rating: 'Рейтинг от 0 до 5',
                activeClients: 'Количество активных клиентов',
                totalSessions: 'Общее количество проведенных сессий',
                hourlyRate: 'Почасовая ставка в рублях',
                certifications: 'Массив сертификатов тренера',
                workingHours: 'Рабочие часы по дням недели'
              },
              clients: {
                trainerId: 'ID тренера (необязательно)',
                membershipType: 'Тип членства: basic, premium, vip',
                joinDate: 'Дата присоединения в формате YYYY-MM-DD',
                totalSessions: 'Общее количество сессий клиента',
                status: 'Статус: active, inactive, suspended, trial'
              },
              sessions: {
                trainerId: 'ID тренера (обязательно)',
                clientId: 'ID клиента (обязательно)',
                type: 'Тип сессии: personal, group, consultation',
                status: 'Статус: scheduled, completed, cancelled, no-show',
                notes: 'Дополнительные заметки'
              }
            },
            notes: [
              'Все поля с email должны быть уникальными',
              'trainerId и clientId должны существовать в системе',
              'Время сессий не должно пересекаться для одного тренера',
              'Валидация выполняется перед импортом',
              'Поле specialization для тренеров должно быть массивом строк',
              'При обновлении (режим merge) существующие записи будут изменены',
              'Статус клиента может быть: active, inactive, suspended, trial',
              'hourlyRate указывается в рублях',
              'certifications - массив строк с названиями сертификатов',
              'workingHours - объект с расписанием работы по дням недели'
            ]
          }
        }
      });

    } catch (error: any) {
      console.error('💥 API: ошибка получения шаблона импорта:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка получения шаблона импорта' },
        { status: 500 }
      );
    }
  }
);

// Вспомогательные функции

// Функция для валидации рабочих часов
function validateWorkingHours(workingHours: any): string[] {
  const errors: string[] = [];
  
  if (!workingHours || typeof workingHours !== 'object') {
    errors.push('workingHours должно быть объектом');
    return errors;
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

  days.forEach(day => {
    if (workingHours[day]) {
      const daySchedule = workingHours[day];
      
      if (typeof daySchedule !== 'object') {
        errors.push(`Расписание для ${day} должно быть объектом`);
        return;
      }

      if (typeof daySchedule.available !== 'boolean') {
        errors.push(`Поле available для ${day} должно быть булевым`);
      }

      if (daySchedule.available) {
        if (!daySchedule.start || !timeRegex.test(daySchedule.start)) {
          errors.push(`Некорректное время начала для ${day}`);
        }

        if (!daySchedule.end || !timeRegex.test(daySchedule.end)) {
          errors.push(`Некорректное время окончания для ${day}`);
        }

        if (daySchedule.start && daySchedule.end) {
          const start = new Date(`2000-01-01T${daySchedule.start}`);
          const end = new Date(`2000-01-01T${daySchedule.end}`);
          if (start >= end) {
            errors.push(`Время начала должно быть раньше времени окончания для ${day}`);
          }
        }
      }
    }
  });

  return errors;
}

// Функция для создания рабочих часов по умолчанию
function createDefaultWorkingHours(): any {
  return {
        monday: { start: '09:00', end: '18:00', available: true },
    tuesday: { start: '09:00', end: '18:00', available: true },
    wednesday: { start: '09:00', end: '18:00', available: true },
    thursday: { start: '09:00', end: '18:00', available: true },
    friday: { start: '09:00', end: '18:00', available: true },
    saturday: { start: '10:00', end: '16:00', available: true },
    sunday: { start: '10:00', end: '16:00', available: false }
  };
}

// Функция для обновления счетчиков после импорта
function updateCountersAfterImport() {
  try {
    // Обновляем счетчики активных клиентов у тренеров
    mockTrainers.forEach(trainer => {
      const activeClientsCount = mockClients.filter(
        client => client.trainerId === trainer.id && client.status === 'active'
      ).length;
      trainer.activeClients = activeClientsCount;

      // Обновляем общее количество сессий
      const trainerSessions = mockSessions.filter(
        session => session.trainerId === trainer.id
      ).length;
      trainer.totalSessions = trainerSessions;
    });

    // Обновляем счетчики сессий у клиентов
    mockClients.forEach(client => {
      const clientSessions = mockSessions.filter(
        session => session.clientId === client.id && session.status === 'completed'
      ).length;
      client.totalSessions = clientSessions;
    });

    console.log('✅ Счетчики обновлены после импорта');
  } catch (error) {
    console.error('⚠️ Ошибка обновления счетчиков:', error);
  }
}

// Функция для валидации формата данных
export function validateImportFormat(data: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Данные должны быть объектом');
    return { isValid: false, errors, warnings };
  }

  // Проверка структуры данных
  const validKeys = ['trainers', 'clients', 'sessions'];
  const providedKeys = Object.keys(data);
  
  const invalidKeys = providedKeys.filter(key => !validKeys.includes(key));
  if (invalidKeys.length > 0) {
    warnings.push(`Неизвестные ключи будут проигнорированы: ${invalidKeys.join(', ')}`);
  }

  if (providedKeys.length === 0) {
    errors.push('Не предоставлено данных для импорта');
    return { isValid: false, errors, warnings };
  }

  // Проверка типов данных
  providedKeys.forEach(key => {
    if (validKeys.includes(key) && !Array.isArray(data[key])) {
      errors.push(`Поле ${key} должно быть массивом`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Функция для предварительного анализа данных импорта
export function analyzeImportData(data: ImportData): {
  summary: {
    trainers: number;
    clients: number;
    sessions: number;
    total: number;
  };
  potentialIssues: Array<{
    type: 'warning' | 'error';
    message: string;
    count?: number;
  }>;
  recommendations: string[];
} {
  const summary = {
    trainers: data.trainers?.length || 0,
    clients: data.clients?.length || 0,
    sessions: data.sessions?.length || 0,
    total: (data.trainers?.length || 0) + (data.clients?.length || 0) + (data.sessions?.length || 0)
  };

  const potentialIssues: Array<{
    type: 'warning' | 'error';
    message: string;
    count?: number;
  }> = [];

  const recommendations: string[] = [];

  // Анализ тренеров
  if (data.trainers) {
    const duplicateEmails = findDuplicates(data.trainers, 'email');
    if (duplicateEmails.length > 0) {
      potentialIssues.push({
        type: 'error',
        message: 'Найдены дублирующиеся email у тренеров',
        count: duplicateEmails.length
      });
    }

    const trainersWithoutEmail = data.trainers.filter(t => !t.email).length;
    if (trainersWithoutEmail > 0) {
      potentialIssues.push({
        type: 'error',
        message: 'Тренеры без email адреса',
        count: trainersWithoutEmail
      });
    }

    const trainersWithInvalidRoles = data.trainers.filter(t => 
      t.role && !['trainer', 'admin', 'manager'].includes(t.role)
    ).length;
    if (trainersWithInvalidRoles > 0) {
      potentialIssues.push({
        type: 'warning',
        message: 'Тренеры с некорректными ролями',
        count: trainersWithInvalidRoles
      });
    }

    // Проверка рабочих часов
    const trainersWithInvalidWorkingHours = data.trainers.filter(t => {
      if (t.workingHours) {
        return validateWorkingHours(t.workingHours).length > 0;
      }
      return false;
    }).length;
    if (trainersWithInvalidWorkingHours > 0) {
      potentialIssues.push({
        type: 'warning',
        message: 'Тренеры с некорректными рабочими часами',
        count: trainersWithInvalidWorkingHours
      });
    }

    // Проверка почасовой ставки
    const trainersWithInvalidRate = data.trainers.filter(t => 
      t.hourlyRate !== undefined && (typeof t.hourlyRate !== 'number' || t.hourlyRate < 0)
    ).length;
    if (trainersWithInvalidRate > 0) {
      potentialIssues.push({
        type: 'warning',
        message: 'Тренеры с некорректной почасовой ставкой',
        count: trainersWithInvalidRate
      });
    }
  }

  // Анализ клиентов
  if (data.clients) {
    const duplicateClientEmails = findDuplicates(data.clients, 'email');
    if (duplicateClientEmails.length > 0) {
      potentialIssues.push({
        type: 'error',
        message: 'Найдены дублирующиеся email у клиентов',
        count: duplicateClientEmails.length
      });
    }

    const clientsWithoutEmail = data.clients.filter(c => !c.email).length;
    if (clientsWithoutEmail > 0) {
      potentialIssues.push({
        type: 'error',
        message: 'Клиенты без email адреса',
        count: clientsWithoutEmail
      });
    }

    const clientsWithInvalidTrainers = data.clients.filter(c => 
      c.trainerId && !data.trainers?.some(t => t.id === c.trainerId) && 
      !mockTrainers.some(t => t.id === c.trainerId)
    ).length;
    if (clientsWithInvalidTrainers > 0) {
      potentialIssues.push({
        type: 'warning',
        message: 'Клиенты с несуществующими тренерами',
        count: clientsWithInvalidTrainers
      });
    }
  }

  // Анализ сессий
  if (data.sessions) {
    const sessionsWithoutRequiredFields = data.sessions.filter(s => 
      !s.trainerId || !s.clientId || !s.date || !s.startTime || !s.endTime
    ).length;
    if (sessionsWithoutRequiredFields > 0) {
      potentialIssues.push({
        type: 'error',
        message: 'Сессии без обязательных полей',
        count: sessionsWithoutRequiredFields
      });
    }

    const sessionsWithInvalidTrainers = data.sessions.filter(s => 
      s.trainerId && !data.trainers?.some(t => t.id === s.trainerId) && 
      !mockTrainers.some(t => t.id === s.trainerId)
    ).length;
    if (sessionsWithInvalidTrainers > 0) {
      potentialIssues.push({
        type: 'warning',
        message: 'Сессии с несуществующими тренерами',
        count: sessionsWithInvalidTrainers
      });
    }

    const sessionsWithInvalidClients = data.sessions.filter(s => 
      s.clientId && !data.clients?.some(c => c.id === s.clientId) && 
      !mockClients.some(c => c.id === s.clientId)
    ).length;
    if (sessionsWithInvalidClients > 0) {
      potentialIssues.push({
        type: 'warning',
        message: 'Сессии с несуществующими клиентами',
        count: sessionsWithInvalidClients
      });
    }
  }

  // Генерация рекомендаций
  if (summary.total > 1000) {
    recommendations.push('Большой объем данных - рекомендуется импортировать частями');
  }

  if (potentialIssues.some(issue => issue.type === 'error')) {
    recommendations.push('Исправьте ошибки перед импортом');
    recommendations.push('Используйте режим "только валидация" для проверки');
  }

  if (data.sessions && data.sessions.length > 0) {
    recommendations.push('Проверьте конфликты времени сессий');
  }

  const duplicateEmails = data.trainers ? findDuplicates(data.trainers, 'email') : [];
  if (duplicateEmails.length > 0 || (data.clients && findDuplicates(data.clients, 'email').length > 0)) {
    recommendations.push('Включите опцию "Пропускать дубликаты" или используйте режим "merge"');
  }

  return {
    summary,
    potentialIssues,
    recommendations
  };
}

// Вспомогательная функция для поиска дубликатов
function findDuplicates(array: any[], field: string): any[] {
  const seen = new Set();
  const duplicates: any[] = [];

  for (const item of array) {
    const value = item[field];
    if (value && seen.has(value)) {
      duplicates.push(item);
    } else if (value) {
      seen.add(value);
    }
  }

  return duplicates;
}

// Функция для создания отчета об импорте
export function generateImportReport(results: ImportResults): {
  summary: string;
  details: Array<{
    category: string;
    imported: number;
    skipped: number;
    errors: number;
    total: number;
    successRate: number;
  }>;
  errorsByCategory: Record<string, number>;
  recommendations: string[];
} {
  const categories = [
    { name: 'Тренеры', key: 'trainers' as const },
    { name: 'Клиенты', key: 'clients' as const },
    { name: 'Сессии', key: 'sessions' as const }
  ];

  const details = categories.map(category => {
    const data = results[category.key];
    const total = data.imported + data.skipped + data.errors;
    const successRate = total > 0 ? Math.round((data.imported / total) * 100) : 0;

    return {
      category: category.name,
      imported: data.imported,
      skipped: data.skipped,
      errors: data.errors,
      total,
      successRate
    };
  });

  const totalImported = details.reduce((sum, d) => sum + d.imported, 0);
  const totalErrors = details.reduce((sum, d) => sum + d.errors, 0);
  const totalProcessed = details.reduce((sum, d) => sum + d.total, 0);

  const summary = `Импорт завершен: ${totalImported} записей импортировано из ${totalProcessed} обработанных (${totalErrors} ошибок)`;

  // Группировка ошибок по категориям
  const errorsByCategory: Record<string, number> = {};
  results.validationErrors.forEach(error => {
    errorsByCategory[error.entity] = (errorsByCategory[error.entity] || 0) + 1;
  });

  // Рекомендации
  const recommendations: string[] = [];
  
  if (totalErrors > 0) {
    recommendations.push('Проверьте и исправьте ошибки валидации');
  }

  if (results.trainers.skipped > 0 || results.clients.skipped > 0) {
    recommendations.push('Рассмотрите использование режима "merge" для обновления существующих записей');
  }

  const lowSuccessRateCategories = details.filter(d => d.successRate < 80 && d.total > 0);
  if (lowSuccessRateCategories.length > 0) {
    recommendations.push(`Низкий процент успеха для: ${lowSuccessRateCategories.map(c => c.category).join(', ')}`);
  }

  if (totalProcessed > 500) {
    recommendations.push('При больших объемах данных рекомендуется импортировать частями');
  }

  return {
    summary,
    details,
    errorsByCategory,
    recommendations
  };
}

// Функция для нормализации данных перед импортом
export function normalizeImportData(entity: 'trainer' | 'client' | 'session', data: any): any {
  const normalized = { ...data };

  switch (entity) {
    case 'trainer':
      // Нормализация специализации
      if (normalized.specializations && !normalized.specialization) {
        normalized.specialization = normalized.specializations;
        delete normalized.specializations;
      }
      
      // Нормализация email
      if (normalized.email) {
        normalized.email = normalized.email.toLowerCase().trim();
      }
      
      // Нормализация телефона
      if (normalized.phone) {
        normalized.phone = normalized.phone.replace(/[^\d+\-$\s]/g, '');
      }
      
      // Нормализация рейтинга
      if (normalized.rating) {
        normalized.rating = Math.min(5, Math.max(0, Number(normalized.rating)));
      }

      // Нормализация почасовой ставки
      if (normalized.hourlyRate) {
        normalized.hourlyRate = Math.max(0, Number(normalized.hourlyRate));
      }

            // Нормализация рабочих часов
      if (!normalized.workingHours) {
        normalized.workingHours = createDefaultWorkingHours();
      }

      // Нормализация сертификатов
      if (!normalized.certifications) {
        normalized.certifications = [];
      }
      break;

    case 'client':
      // Нормализация email
      if (normalized.email) {
        normalized.email = normalized.email.toLowerCase().trim();
      }
      
      // Нормализация телефона
      if (normalized.phone) {
        normalized.phone = normalized.phone.replace(/[^\d+\-$\s]/g, '');
      }
      
      // Нормализация даты присоединения
      if (normalized.joinDate && typeof normalized.joinDate === 'string') {
        const date = new Date(normalized.joinDate);
        if (!isNaN(date.getTime())) {
          normalized.joinDate = date.toISOString().split('T')[0];
        }
      }
      break;

    case 'session':
      // Нормализация времени
      if (normalized.startTime) {
        normalized.startTime = normalized.startTime.padStart(5, '0');
      }
      
      if (normalized.endTime) {
        normalized.endTime = normalized.endTime.padStart(5, '0');
      }
      
      // Нормализация даты
      if (normalized.date && typeof normalized.date === 'string') {
        const date = new Date(normalized.date);
        if (!isNaN(date.getTime())) {
          normalized.date = date.toISOString().split('T')[0];
        }
      }
      
      // Нормализация заметок
      if (normalized.notes) {
        normalized.notes = normalized.notes.trim();
      }
      break;
  }

  return normalized;
}

// Функция для создания резервной копии перед импортом
export function createBackup(): {
  trainers: Trainer[];
  clients: Client[];
  sessions: Session[];
  timestamp: string;
} {
  return {
    trainers: JSON.parse(JSON.stringify(mockTrainers)),
    clients: JSON.parse(JSON.stringify(mockClients)),
    sessions: JSON.parse(JSON.stringify(mockSessions)),
    timestamp: new Date().toISOString()
  };
}

// Функция для восстановления из резервной копии
export function restoreFromBackup(backup: {
  trainers: Trainer[];
  clients: Client[];
  sessions: Session[];
  timestamp: string;
}): boolean {
  try {
    mockTrainers.length = 0;
    mockTrainers.push(...backup.trainers);
    
    mockClients.length = 0;
    mockClients.push(...backup.clients);
    
    mockSessions.length = 0;
    mockSessions.push(...backup.sessions);
    
    console.log(`✅ Данные восстановлены из резервной копии от ${backup.timestamp}`);
    return true;
  } catch (error) {
    console.error('💥 Ошибка восстановления из резервной копии:', error);
    return false;
  }
}

// Функция для валидации связей между сущностями
export function validateEntityRelations(data: ImportData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Проверка связей клиент-тренер
  if (data.clients) {
    data.clients.forEach(client => {
      if (client.trainerId) {
        const trainerExists = data.trainers?.some(t => t.id === client.trainerId) ||
                             mockTrainers.some(t => t.id === client.trainerId);
        
        if (!trainerExists) {
          errors.push({
            entity: 'client',
            record: client,
            error: `Связанный тренер с ID ${client.trainerId} не найден`
          });
        }
      }
    });
  }

  // Проверка связей сессия-тренер-клиент
  if (data.sessions) {
    data.sessions.forEach(session => {
      // Проверка тренера
      const trainerExists = data.trainers?.some(t => t.id === session.trainerId) ||
                           mockTrainers.some(t => t.id === session.trainerId);
      
      if (!trainerExists) {
        errors.push({
          entity: 'session',
          record: session,
          error: `Тренер с ID ${session.trainerId} не найден`
        });
      }

      // Проверка клиента
      const clientExists = data.clients?.some(c => c.id === session.clientId) ||
                          mockClients.some(c => c.id === session.clientId);
      
      if (!clientExists) {
        errors.push({
          entity: 'session',
          record: session,
          error: `Клиент с ID ${session.clientId} не найден`
        });
      }

      // Проверка соответствия тренера клиента и тренера сессии
      const client = data.clients?.find(c => c.id === session.clientId) ||
                    mockClients.find(c => c.id === session.clientId);
      
      if (client && client.trainerId && client.trainerId !== session.trainerId) {
        errors.push({
          entity: 'session',
          record: session,
          error: `Тренер сессии (${session.trainerId}) не соответствует тренеру клиента (${client.trainerId})`
        });
      }
    });
  }

  return errors;
}

// Функция для валидации специфических полей
export function validateSpecificFields(entity: 'trainer' | 'client' | 'session', data: any): string[] {
  const errors: string[] = [];

  switch (entity) {
    case 'trainer':
      // Валидация специализации
      if (data.specialization && !Array.isArray(data.specialization)) {
        errors.push('Специализация должна быть массивом');
      }
      
      // Валидация опыта
      if (data.experience !== undefined && (typeof data.experience !== 'number' || data.experience < 0)) {
        errors.push('Опыт должен быть положительным числом');
      }
      
      // Валидация рейтинга
      if (data.rating !== undefined && (typeof data.rating !== 'number' || data.rating < 0 || data.rating > 5)) {
        errors.push('Рейтинг должен быть числом от 0 до 5');
      }

      // Валидация почасовой ставки
      if (data.hourlyRate !== undefined && (typeof data.hourlyRate !== 'number' || data.hourlyRate < 0)) {
        errors.push('Почасовая ставка должна быть положительным числом');
      }

      // Валидация сертификатов
      if (data.certifications && !Array.isArray(data.certifications)) {
        errors.push('Сертификаты должны быть массивом');
      }

      // Валидация рабочих часов
      if (data.workingHours) {
        errors.push(...validateWorkingHours(data.workingHours));
      }
      break;

    case 'client':
      // Валидация даты присоединения
      if (data.joinDate && isNaN(new Date(data.joinDate).getTime())) {
        errors.push('Некорректная дата присоединения');
      }
      
      // Валидация количества сессий
      if (data.totalSessions !== undefined && (typeof data.totalSessions !== 'number' || data.totalSessions < 0)) {
        errors.push('Количество сессий должно быть положительным числом');
      }
      break;

    case 'session':
      // Валидация времени
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (data.startTime && !timeRegex.test(data.startTime)) {
        errors.push('Некорректный формат времени начала (должен быть HH:MM)');
      }
      
      if (data.endTime && !timeRegex.test(data.endTime)) {
        errors.push('Некорректный формат времени окончания (должен быть HH:MM)');
      }
      
      // Валидация логики времени
      if (data.startTime && data.endTime) {
        const start = new Date(`2000-01-01T${data.startTime}`);
        const end = new Date(`2000-01-01T${data.endTime}`);
        if (start >= end) {
          errors.push('Время начала должно быть раньше времени окончания');
        }
      }
      
      // Валидация даты
      if (data.date && isNaN(new Date(data.date).getTime())) {
        errors.push('Некорректная дата сессии');
      }
      
      // Валидация даты в будущем для новых сессий
      if (data.date && data.status === 'scheduled') {
        const sessionDate = new Date(data.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (sessionDate < today) {
          errors.push('Дата запланированной сессии не может быть в прошлом');
        }
      }
      break;
  }

  return errors;
}

// Функция для пакетной обработки больших файлов
export async function processBatchImport(
  data: ImportData,
  batchSize: number = 100,
  onProgress?: (progress: { processed: number; total: number; entity: string }) => void
): Promise<ImportResults> {
  const results: ImportResults = {
    trainers: { imported: 0, skipped: 0, errors: 0 },
    clients: { imported: 0, skipped: 0, errors: 0 },
    sessions: { imported: 0, skipped: 0, errors: 0 },
    validationErrors: [],
    startTime: new Date().toISOString(),
    endTime: null
  };

  // Обработка тренеров пакетами
  if (data.trainers && data.trainers.length > 0) {
    const batches = Math.ceil(data.trainers.length / batchSize);
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, data.trainers.length);
      const batch = data.trainers.slice(start, end);
      
      // Здесь будет обработка пакета
      onProgress?.({
        processed: end,
        total: data.trainers.length,
        entity: 'trainers'
      });
      
      // Небольшая задержка для предотвращения блокировки UI
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  // Аналогично для клиентов
  if (data.clients && data.clients.length > 0) {
    const batches = Math.ceil(data.clients.length / batchSize);
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, data.clients.length);
      const batch = data.clients.slice(start, end);
      
      onProgress?.({
        processed: end,
        total: data.clients.length,
        entity: 'clients'
      });
      
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  // Аналогично для сессий
  if (data.sessions && data.sessions.length > 0) {
    const batches = Math.ceil(data.sessions.length / batchSize);
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, data.sessions.length);
      const batch = data.sessions.slice(start, end);
      
      onProgress?.({
        processed: end,
        total: data.sessions.length,
        entity: 'sessions'
      });
      
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  results.endTime = new Date().toISOString();
  return results;
}

// Функция для генерации статистики импорта
export function generateImportStatistics(results: ImportResults): {
  overview: {
    totalProcessed: number;
    totalImported: number;
    totalSkipped: number;
    totalErrors: number;
    successRate: number;
    duration: number;
  };
  byEntity: Record<string, {
    processed: number;
    imported: number;
    skipped: number;
    errors: number;
    successRate: number;
  }>;
  errorAnalysis: {
    mostCommonErrors: Array<{ error: string; count: number }>;
    errorsByEntity: Record<string, number>;
  };
} {
  const startTime = new Date(results.startTime);
  const endTime = results.endTime ? new Date(results.endTime) : new Date();
  const duration = endTime.getTime() - startTime.getTime();

  const totalProcessed = Object.values(results).reduce((sum, category) => {
    if (typeof category === 'object' && 'imported' in category) {
      return sum + category.imported + category.skipped + category.errors;
    }
    return sum;
  }, 0);

  const totalImported = results.trainers.imported + results.clients.imported + results.sessions.imported;
  const totalSkipped = results.trainers.skipped + results.clients.skipped + results.sessions.skipped;
  const totalErrors = results.trainers.errors + results.clients.errors + results.sessions.errors;

  const overview = {
    totalProcessed,
    totalImported,
    totalSkipped,
    totalErrors,
    successRate: totalProcessed > 0 ? Math.round((totalImported / totalProcessed) * 100) : 0,
    duration
  };

  const byEntity = {
    trainers: {
      processed: results.trainers.imported + results.trainers.skipped + results.trainers.errors,
      imported: results.trainers.imported,
      skipped: results.trainers.skipped,
      errors: results.trainers.errors,
      successRate: 0
    },
    clients: {
      processed: results.clients.imported + results.clients.skipped + results.clients.errors,
      imported: results.clients.imported,
      skipped: results.clients.skipped,
      errors: results.clients.errors,
      successRate: 0
    },
    sessions: {
      processed: results.sessions.imported + results.sessions.skipped + results.sessions.errors,
      imported: results.sessions.imported,
      skipped: results.sessions.skipped,
      errors: results.sessions.errors,
      successRate: 0
    }
  };

  // Расчет успешности по сущностям
  Object.keys(byEntity).forEach(entity => {
    const data = byEntity[entity as keyof typeof byEntity];
    data.successRate = data.processed > 0 ? Math.round((data.imported / data.processed) * 100) : 0;
  });

  // Анализ ошибок
  const errorCounts: Record<string, number> = {};
    const errorsByEntity: Record<string, number> = {};

  results.validationErrors.forEach(error => {
    errorCounts[error.error] = (errorCounts[error.error] || 0) + 1;
    errorsByEntity[error.entity] = (errorsByEntity[error.entity] || 0) + 1;
  });

  const mostCommonErrors = Object.entries(errorCounts)
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    overview,
    byEntity,
    errorAnalysis: {
      mostCommonErrors,
      errorsByEntity
    }
  };
}

// Функция для экспорта данных в различных форматах
export function exportDataTemplate(format: 'json' | 'csv' | 'xlsx', entity: 'trainers' | 'clients' | 'sessions' | 'all'): any {
  const templates = {
    trainer: {
      id: 'trainer_001',
      name: 'Иван Петров',
      email: 'ivan.petrov@gym.com',
      phone: '+7 (999) 123-45-67',
      role: 'trainer',
      status: 'active',
      specialization: ['Силовые тренировки', 'Функциональный тренинг'],
      experience: 3,
      rating: 4.5,
      activeClients: 12,
      totalSessions: 150,
      hourlyRate: 2500,
      certifications: ['Сертификат персонального тренера', 'Сертификат по фитнесу'],
      workingHours: createDefaultWorkingHours(),
      createdAt: '2024-01-01T00:00:00Z'
    },
    client: {
      id: 'client_001',
      name: 'Анна Смирнова',
      email: 'anna.smirnova@email.com',
      phone: '+7 (999) 234-56-78',
      status: 'active',
      trainerId: 'trainer_001',
      membershipType: 'premium',
      joinDate: '2024-01-15',
      totalSessions: 25,
      createdAt: '2024-01-15T00:00:00Z'
    },
    session: {
      id: 'session_001',
      trainerId: 'trainer_001',
      clientId: 'client_001',
      date: '2024-01-20',
      startTime: '10:00',
      endTime: '11:00',
      type: 'personal',
      status: 'completed',
      notes: 'Отличная тренировка, клиент показал прогресс',
      createdAt: '2024-01-20T09:00:00Z'
    }
  };

  switch (format) {
    case 'json':
      return entity === 'all' 
        ? { trainers: [templates.trainer], clients: [templates.client], sessions: [templates.session] }
        : { [entity]: [templates[entity.slice(0, -1) as keyof typeof templates]] };
    
    case 'csv':
      const csvData = {
        trainers: 'id,name,email,phone,role,status,specialization,experience,rating,activeClients,totalSessions,hourlyRate,certifications,workingHours,createdAt\n' +
                 'trainer_001,"Иван Петров",ivan.petrov@gym.com,"+7 (999) 123-45-67",trainer,active,"Силовые тренировки;Функциональный тренинг",3,4.5,12,150,2500,"Сертификат персонального тренера;Сертификат по фитнесу","{""monday"":{""start"":""09:00"",""end"":""18:00"",""available"":true}}",2024-01-01T00:00:00Z',
        clients: 'id,name,email,phone,status,trainerId,membershipType,joinDate,totalSessions,createdAt\n' +
                'client_001,"Анна Смирнова",anna.smirnova@email.com,"+7 (999) 234-56-78",active,trainer_001,premium,2024-01-15,25,2024-01-15T00:00:00Z',
        sessions: 'id,trainerId,clientId,date,startTime,endTime,type,status,notes,createdAt\n' +
                 'session_001,trainer_001,client_001,2024-01-20,10:00,11:00,personal,completed,"Отличная тренировка, клиент показал прогресс",2024-01-20T09:00:00Z'
      };
      return entity === 'all' ? Object.values(csvData).join('\n\n') : csvData[entity];
    
    default:
      return templates;
  }
}

// Функция для валидации CSV данных
export function validateCSVData(csvText: string, entity: 'trainers' | 'clients' | 'sessions'): {
  isValid: boolean;
  data: any[];
  errors: string[];
} {
  const errors: string[] = [];
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    errors.push('CSV файл должен содержать заголовки и хотя бы одну строку данных');
    return { isValid: false, data: [], errors };
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const requiredHeaders = {
    trainers: ['name', 'email'],
    clients: ['name', 'email'],
    sessions: ['trainerId', 'clientId', 'date', 'startTime', 'endTime']
  };

  const missingHeaders = requiredHeaders[entity].filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    errors.push(`Отсутствуют обязательные заголовки: ${missingHeaders.join(', ')}`);
    return { isValid: false, data: [], errors };
  }

  const data: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    
    if (values.length !== headers.length) {
      errors.push(`Строка ${i + 1}: количество значений не соответствует количеству заголовков`);
      continue;
    }

    const row: any = {};
    headers.forEach((header, index) => {
      let value = values[index];
      
      // Обработка специальных типов данных
      if (header === 'specialization' || header === 'certifications') {
        try {
          row[header] = value.split(';').filter(v => v.trim());
        } catch {
          row[header] = [value];
        }
      } else if (header === 'workingHours') {
        try {
          row[header] = JSON.parse(value);
        } catch {
          row[header] = createDefaultWorkingHours();
        }
      } else if (['experience', 'rating', 'activeClients', 'totalSessions', 'hourlyRate'].includes(header)) {
        row[header] = Number(value) || 0;
      } else if (['available'].includes(header)) {
        row[header] = value.toLowerCase() === 'true';
      } else {
        row[header] = value;
      }
    });

    data.push(row);
  }

  return {
    isValid: errors.length === 0,
    data,
    errors
  };
}

// Функция для конвертации JSON в CSV
export function convertJSONToCSV(data: any[], entity: 'trainers' | 'clients' | 'sessions'): string {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      let value = row[header];
      
      // Обработка специальных типов данных
      if (Array.isArray(value)) {
        value = value.join(';');
      } else if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      } else if (typeof value === 'string' && value.includes(',')) {
        value = `"${value}"`;
      }
      
      return value || '';
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

// Функция для очистки и подготовки данных импорта
export function sanitizeImportData(data: ImportData): ImportData {
  const sanitized: ImportData = {};

  if (data.trainers) {
    sanitized.trainers = data.trainers.map(trainer => ({
      ...trainer,
      email: trainer.email?.toLowerCase().trim(),
      phone: trainer.phone?.replace(/[^\d+\-$\s]/g, ''),
      specialization: Array.isArray(trainer.specialization) ? trainer.specialization : 
                     Array.isArray(trainer.specializations) ? trainer.specializations : [],
      certifications: Array.isArray(trainer.certifications) ? trainer.certifications : [],
      workingHours: trainer.workingHours || createDefaultWorkingHours(),
      hourlyRate: Number(trainer.hourlyRate) || 0,
      experience: Number(trainer.experience) || 0,
      rating: Math.min(5, Math.max(0, Number(trainer.rating) || 0)),
      activeClients: Number(trainer.activeClients) || 0,
      totalSessions: Number(trainer.totalSessions) || 0
    }));
  }

  if (data.clients) {
    sanitized.clients = data.clients.map(client => ({
      ...client,
      email: client.email?.toLowerCase().trim(),
      phone: client.phone?.replace(/[^\d+\-$\s]/g, ''),
      totalSessions: Number(client.totalSessions) || 0,
      joinDate: client.joinDate ? new Date(client.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));
  }

  if (data.sessions) {
    sanitized.sessions = data.sessions.map(session => ({
      ...session,
      date: session.date ? new Date(session.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      startTime: session.startTime?.padStart(5, '0'),
      endTime: session.endTime?.padStart(5, '0'),
      notes: session.notes?.trim() || ''
    }));
  }

  return sanitized;
}

// Функция для проверки целостности данных после импорта
export function validateDataIntegrity(): {
  isValid: boolean;
  issues: Array<{
    type: 'warning' | 'error';
    message: string;
    affectedRecords?: number;
  }>;
} {
  const issues: Array<{
    type: 'warning' | 'error';
    message: string;
    affectedRecords?: number;
  }> = [];

  // Проверка уникальности email у тренеров
  const trainerEmails = mockTrainers.map(t => t.email);
  const duplicateTrainerEmails = trainerEmails.filter((email, index) => trainerEmails.indexOf(email) !== index);
  if (duplicateTrainerEmails.length > 0) {
    issues.push({
      type: 'error',
      message: 'Найдены дублирующиеся email у тренеров',
      affectedRecords: duplicateTrainerEmails.length
    });
  }

  // Проверка уникальности email у клиентов
  const clientEmails = mockClients.map(c => c.email);
  const duplicateClientEmails = clientEmails.filter((email, index) => clientEmails.indexOf(email) !== index);
  if (duplicateClientEmails.length > 0) {
    issues.push({
      type: 'error',
      message: 'Найдены дублирующиеся email у клиентов',
      affectedRecords: duplicateClientEmails.length
    });
  }

  // Проверка связей клиент-тренер
  const clientsWithInvalidTrainers = mockClients.filter(client => 
    client.trainerId && !mockTrainers.some(trainer => trainer.id === client.trainerId)
  );
  if (clientsWithInvalidTrainers.length > 0) {
    issues.push({
      type: 'error',
      message: 'Клиенты с несуществующими тренерами',
      affectedRecords: clientsWithInvalidTrainers.length
    });
  }

  // Проверка связей сессий
  const sessionsWithInvalidTrainers = mockSessions.filter(session =>
    !mockTrainers.some(trainer => trainer.id === session.trainerId)
  );
  if (sessionsWithInvalidTrainers.length > 0) {
    issues.push({
      type: 'error',
      message: 'Сессии с несуществующими тренерами',
      affectedRecords: sessionsWithInvalidTrainers.length
    });
  }

  const sessionsWithInvalidClients = mockSessions.filter(session =>
    !mockClients.some(client => client.id === session.clientId)
  );
  if (sessionsWithInvalidClients.length > 0) {
    issues.push({
      type: 'error',
      message: 'Сессии с несуществующими клиентами',
      affectedRecords: sessionsWithInvalidClients.length
    });
  }

  // Проверка конфликтов времени сессий
  const timeConflicts = mockSessions.filter((session, index) => {
    return mockSessions.some((otherSession, otherIndex) => {
      if (index >= otherIndex || session.trainerId !== otherSession.trainerId || 
          session.date !== otherSession.date || session.status === 'cancelled' || 
          otherSession.status === 'cancelled') {
        return false;
      }

      const sessionStart = new Date(`${session.date}T${session.startTime}`);
      const sessionEnd = new Date(`${session.date}T${session.endTime}`);
      const otherStart = new Date(`${otherSession.date}T${otherSession.startTime}`);
      const otherEnd = new Date(`${otherSession.date}T${otherSession.endTime}`);

      return (sessionStart < otherEnd && sessionEnd > otherStart);
    });
  });

  if (timeConflicts.length > 0) {
    issues.push({
      type: 'warning',
      message: 'Найдены конфликты времени в сессиях',
      affectedRecords: timeConflicts.length
    });
  }

  return {
    isValid: issues.filter(issue => issue.type === 'error').length === 0,
    issues
  };
}



