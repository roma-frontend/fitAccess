// app/api/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withScheduleManagement, withPermissions } from '@/lib/api-middleware';
import { mockEvents, mockTrainers, mockClients } from '@/lib/mock-data';

// GET /api/schedule - Получение расписания
export const GET = withScheduleManagement(async (req) => {
  try {
    console.log('📅 API: получение расписания');
    
    const { user } = req;
    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const trainerId = url.searchParams.get('trainerId');
    const clientId = url.searchParams.get('clientId');
    const status = url.searchParams.get('status');

    let events = [...mockEvents];

    // Фильтрация по правам доступа
    if (user.role === 'trainer') {
      // Тренеры видят только свои события
      events = events.filter(event => event.trainerId === user.id);
    } else if (user.role === 'client') {
      // Клиенты видят только свои события
      events = events.filter(event => event.clientId === user.id);
    }

    // Фильтрация по тренеру
    if (trainerId && user.role !== 'trainer') {
      events = events.filter(event => event.trainerId === trainerId);
    }

    // Фильтрация по клиенту
    if (clientId) {
      events = events.filter(event => event.clientId === clientId);
    }

    // Фильтрация по статусу
    if (status) {
      events = events.filter(event => event.status === status);
    }

    // Фильтрация по датам
    if (startDate) {
      events = events.filter(event => 
        new Date(event.startTime) >= new Date(startDate)
      );
    }

    if (endDate) {
      events = events.filter(event => 
        new Date(event.startTime) <= new Date(endDate)
      );
    }

    // Добавление дополнительной информации
    const enrichedEvents = events.map(event => {
      const trainer = mockTrainers.find(t => t.id === event.trainerId);
      const client = mockClients.find(c => c.id === event.clientId);
      
      return {
        ...event,
        trainerName: trainer?.name || 'Неизвестный тренер',
        clientName: client?.name || 'Неизвестный клиент',
        trainerPhone: trainer?.phone,
        clientPhone: client?.phone
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedEvents,
      total: enrichedEvents.length
    });

  } catch (error) {
    console.error('💥 API: ошибка получения расписания:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка получения расписания' },
      { status: 500 }
    );
  }
});

// POST /api/schedule - Создание нового события
export const POST = withPermissions(
  { resource: 'schedule', action: 'create' },
  async (req) => {
    try {
      console.log('➕ API: создание нового события');
      
      const body = await req.json();
      const { user } = req;

      // Валидация данных
      if (!body.title || !body.startTime || !body.endTime || !body.trainerId || !body.clientId) {
        return NextResponse.json(
          { success: false, error: 'Отсутствуют обязательные поля' },
          { status: 400 }
        );
      }

      // Проверка прав на создание события для конкретного тренера
      if (user.role === 'trainer' && body.trainerId !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Нет прав на создание события для другого тренера' },
          { status: 403 }
        );
      }

      // Проверка существования тренера и клиента
      const trainer = mockTrainers.find(t => t.id === body.trainerId);
      const client = mockClients.find(c => c.id === body.clientId);

      if (!trainer) {
        return NextResponse.json(
          { success: false, error: 'Тренер не найден' },
          { status: 404 }
        );
      }

      if (!client) {
        return NextResponse.json(
          { success: false, error: 'Клиент не найден' },
          { status: 404 }
        );
      }

      // Проверка конфликтов времени
      const conflictingEvent = mockEvents.find(event => 
        event.trainerId === body.trainerId &&
        event.status !== 'cancelled' &&
        (
          (new Date(body.startTime) >= new Date(event.startTime) && 
           new Date(body.startTime) < new Date(event.endTime)) ||
          (new Date(body.endTime) > new Date(event.startTime) && 
           new Date(body.endTime) <= new Date(event.endTime)) ||
          (new Date(body.startTime) <= new Date(event.startTime) && 
           new Date(body.endTime) >= new Date(event.endTime))
        )
      );

      if (conflictingEvent) {
        return NextResponse.json(
          { success: false, error: 'Конфликт времени с существующим событием' },
          { status: 409 }
        );
      }

      const newEvent = {
        _id: `event_${Date.now()}`,
        title: body.title,
        description: body.description || '',
        startTime: body.startTime,
        endTime: body.endTime,
        trainerId: body.trainerId,
        clientId: body.clientId,
        status: body.status || 'pending',
        type: body.type || 'training',
        location: body.location || '',
        notes: body.notes || '',
        createdAt: new Date().toISOString(),
        createdBy: user.id,
        updatedAt: new Date().toISOString()
      };

      mockEvents.push(newEvent);

      console.log(`✅ API: событие создано - ${newEvent.title}`);

      return NextResponse.json({
        success: true,
        data: {
          ...newEvent,
          trainerName: trainer.name,
          clientName: client.name
        },
        message: 'Событие успешно создано'
      });

    } catch (error) {
      console.error('💥 API: ошибка создания события:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка создания события' },
        { status: 500 }
      );
    }
  }
);
