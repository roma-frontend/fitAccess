// app/api/schedule/trainers/route.ts (обновленная версия)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Загрузка тренеров для расписания из Convex...');
    
    // Получаем тренеров из Convex
    const trainersFromConvex = await convex.query("trainers:getActiveTrainers");
    
    if (trainersFromConvex && trainersFromConvex.length > 0) {
      console.log('✅ Тренеры для расписания загружены из Convex:', trainersFromConvex.length);
      
      // Преобразуем данные из Convex в формат для расписания
      const scheduleTrainers = trainersFromConvex.map((trainer: any) => ({
        trainerId: trainer._id,
        trainerName: trainer.name,
        trainerRole: trainer.role,
        events: [], // События будут загружены отдельно
        workingHours: trainer.workingHours || {
          start: '09:00',
          end: '18:00',
          days: [1, 2, 3, 4, 5]
        }
      }));

      return NextResponse.json(scheduleTrainers);
    } else {
      console.log('⚠️ Нет активных тренеров в Convex, используем mock данные');
      return NextResponse.json(getMockScheduleTrainers());
    }

  } catch (error) {
    console.error('❌ Ошибка получения тренеров для расписания из Convex:', error);
    console.log('🔄 Переключаемся на mock данные...');
    
    return NextResponse.json(getMockScheduleTrainers());
  }
}

// Mock данные для расписания
function getMockScheduleTrainers() {
  return [
    {
      trainerId: 'trainer1',
      trainerName: 'Александр Петров',
      trainerRole: 'Персональный тренер',
      events: [],
      workingHours: {
        start: '09:00',
        end: '18:00',
        days: [1, 2, 3, 4, 5]
      }
    },
    {
      trainerId: 'trainer2',
      trainerName: 'Мария Иванова',
      trainerRole: 'Фитнес-инструктор',
      events: [],
      workingHours: {
        start: '08:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5, 6]
      }
    },
    {
      trainerId: 'trainer3',
      trainerName: 'Дмитрий Козлов',
      trainerRole: 'Йога-инструктор',
      events: [],
      workingHours: {
        start: '10:00',
        end: '19:00',
        days: [1, 2, 3, 4, 5, 6, 0]
      }
    },
    {
      trainerId: 'trainer4',
      trainerName: 'Елена Сидорова',
      trainerRole: 'Групповой инструктор',
      events: [],
      workingHours: {
        start: '07:00',
        end: '16:00',
        days: [1, 2, 3, 4, 5, 6]
      }
    },
    {
      trainerId: 'trainer5',
      trainerName: 'Игорь Волков',
      trainerRole: 'Тренер по боксу',
      events: [],
      workingHours: {
        start: '14:00',
        end: '22:00',
        days: [1, 2, 3, 4, 5, 6]
      }
    }
  ];
}
