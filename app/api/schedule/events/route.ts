// app/api/schedule/events/route.ts (исправленная версия)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Загрузка событий из Convex...');
    
    // Получаем события из Convex
    const eventsFromConvex = await convex.query("events:getAll");
    
    if (eventsFromConvex && eventsFromConvex.length > 0) {
      console.log('✅ События загружены из Convex:', eventsFromConvex.length);
      
      // Преобразуем данные из Convex в формат для расписания
      const formattedEvents = eventsFromConvex.map((event: any) => ({
        _id: event._id,
        title: event.title,
        description: event.description || '',
        type: event.type || 'training',
        startTime: event.startTime,
        endTime: event.endTime,
        trainerId: event.trainerId,
        trainerName: event.trainerName,
        clientId: event.clientId || null,
        clientName: event.clientName || null,
        status: event.status || 'scheduled',
        location: event.location || '',
        createdAt: event._creationTime,
        createdBy: event.createdBy || event.trainerId
      }));

      return NextResponse.json(formattedEvents);
    } else {
      console.log('⚠️ Нет событий в Convex, используем mock данные');
      return NextResponse.json(getMockEvents());
    }

  } catch (error) {
    console.error('❌ Ошибка получения событий из Convex:', error);
    console.log('🔄 Переключаемся на mock данные...');
    
    return NextResponse.json(getMockEvents());
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('🔄 Создание события в Convex...', data);
    
    // Создаем событие в Convex
    const eventId = await convex.mutation("events:create", {
      title: data.title,
      description: data.description || '',
      type: data.type || 'training',
      startTime: data.startTime,
      endTime: data.endTime,
      trainerId: data.trainerId,
      trainerName: data.trainerName,
      clientId: data.clientId || null,
      clientName: data.clientName || null,
      status: 'scheduled',
      location: data.location || '',
      createdBy: data.createdBy || data.trainerId
    });

    console.log('✅ Событие создано в Convex:', eventId);

    // Возвращаем созданное событие
    const newEvent = {
      _id: eventId,
      title: data.title,
      description: data.description || '',
      type: data.type || 'training',
      startTime: data.startTime,
      endTime: data.endTime,
      trainerId: data.trainerId,
      trainerName: data.trainerName,
      clientId: data.clientId || null,
      clientName: data.clientName || null,
      status: 'scheduled',
      location: data.location || '',
      createdAt: new Date().toISOString(),
      createdBy: data.createdBy || data.trainerId
    };

    return NextResponse.json(newEvent);

  } catch (error) {
    console.error('❌ Ошибка создания события в Convex:', error);
    
    // Получаем данные заново для fallback
    let fallbackData;
    try {
      fallbackData = await request.json();
    } catch (parseError) {
      console.error('❌ Ошибка парсинга данных для fallback:', parseError);
      return NextResponse.json(
        { error: 'Ошибка обработки данных события' },
        { status: 400 }
      );
    }
    
    // Fallback - создаем событие локально
    const newEvent = {
      _id: `event_${Date.now()}`,
      title: fallbackData.title,
      description: fallbackData.description || '',
      type: fallbackData.type || 'training',
      startTime: fallbackData.startTime,
      endTime: fallbackData.endTime,
      trainerId: fallbackData.trainerId,
      trainerName: fallbackData.trainerName,
      clientId: fallbackData.clientId || null,
      clientName: fallbackData.clientName || null,
      status: 'scheduled',
      location: fallbackData.location || '',
      createdAt: new Date().toISOString(),
      createdBy: fallbackData.createdBy || fallbackData.trainerId
    };

    return NextResponse.json(newEvent);
  }
}

// Mock данные для событий
function getMockEvents() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return [
    {
      _id: 'event1',
      title: 'Персональная тренировка',
      description: 'Силовая тренировка на верх тела',
      type: 'training',
      startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() + 11 * 60 * 60 * 1000).toISOString(),
      trainerId: 'trainer1',
      trainerName: 'Александр Петров',
      clientId: 'client1',
      clientName: 'Анна Смирнова',
      status: 'confirmed',
      location: 'Зал №1',
      createdAt: new Date().toISOString(),
      createdBy: 'trainer1'
    },
    {
      _id: 'event2',
      title: 'Групповая йога',
      description: 'Утренняя практика йоги',
      type: 'training',
      startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
      trainerId: 'trainer2',
      trainerName: 'Мария Иванова',
      status: 'scheduled',
      location: 'Йога-студия',
      createdAt: new Date().toISOString(),
      createdBy: 'trainer2'
    },
    {
      _id: 'event3',
      title: 'Функциональная тренировка',
      description: 'Комплексная тренировка с собственным весом',
      type: 'training',
      startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() + 15 * 60 * 60 * 1000).toISOString(),
      trainerId: 'trainer1',
      trainerName: 'Александр Петров',
      clientId: 'client3',
      clientName: 'Елена Васильева',
      status: 'confirmed',
      location: 'Зал №2',
      createdAt: new Date().toISOString(),
      createdBy: 'trainer1'
    },
    {
      _id: 'event4',
      title: 'Бокс для начинающих',
      description: 'Основы бокса и техника ударов',
      type: 'training',
      startTime: new Date(today.getTime() + 48 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() + 48 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000).toISOString(),
      trainerId: 'trainer5',
      trainerName: 'Игорь Волков',
      clientId: 'client4',
      clientName: 'Михаил Петров',
      status: 'completed',
      location: 'Боксерский зал',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'trainer5'
    },
    {
      _id: 'event5',
      title: 'Зумба',
      description: 'Энергичная танцевальная тренировка',
      type: 'training',
      startTime: new Date(today.getTime() + 72 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() + 72 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000).toISOString(),
      trainerId: 'trainer4',
      trainerName: 'Елена Сидорова',
      clientId: 'client2',
      clientName: 'Дмитрий Козлов',
      status: 'scheduled',
      location: 'Танцевальный зал',
      createdAt: new Date().toISOString(),
      createdBy: 'trainer4'
    },
    {
      _id: 'event6',
      title: 'Плавание для начинающих',
      description: 'Обучение основам плавания',
      type: 'training',
      startTime: new Date(today.getTime() + 96 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() + 96 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(),
      trainerId: 'trainer3',
      trainerName: 'Дмитрий Козлов',
      clientId: 'client5',
      clientName: 'Ольга Петрова',
      status: 'scheduled',
      location: 'Бассейн',
      createdAt: new Date().toISOString(),
      createdBy: 'trainer3'
    },
    {
      _id: 'event7',
      title: 'Консультация по питанию',
      description: 'Разработка индивидуального плана питания',
      type: 'consultation',
      startTime: new Date(today.getTime() + 120 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() + 120 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000).toISOString(),
      trainerId: 'trainer1',
      trainerName: 'Александр Петров',
      clientId: 'client6',
      clientName: 'Сергей Иванов',
      status: 'confirmed',
      location: 'Кабинет консультаций',
      createdAt: new Date().toISOString(),
      createdBy: 'trainer1'
    }
  ];
}
