// app/api/debug/check-trainers/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 debug-trainers: проверяем тренеров');

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({
        error: 'CONVEX_URL не настроен'
      });
    }

    // Получаем всех тренеров
    const trainersResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'trainers:getAll',
        args: {}
      })
    });

    let allTrainers = [];
    let trainersError = null;

    if (trainersResponse.ok) {
      const trainersData = await trainersResponse.json();
      allTrainers = trainersData.value || [];
      console.log('👨‍💼 debug-trainers: найдено тренеров:', allTrainers.length);
    } else {
      trainersError = `HTTP ${trainersResponse.status}: ${await trainersResponse.text()}`;
      console.error('❌ debug-trainers: ошибка получения тренеров:', trainersError);
    }

    // Проверяем конкретного тренера elena-smirnova
    const testTrainerId = 'elena-smirnova'; // ID из URL
    let specificTrainer = null;
    let specificTrainerError = null;

    try {
      const specificTrainerResponse = await fetch(`${convexUrl}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: 'trainers:getById',
          args: { id: testTrainerId }
        })
      });

      if (specificTrainerResponse.ok) {
        const specificTrainerData = await specificTrainerResponse.json();
        specificTrainer = specificTrainerData.value;
        console.log('👨‍💼 debug-trainers: тренер elena-smirnova найден:', !!specificTrainer);
      } else {
        specificTrainerError = `HTTP ${specificTrainerResponse.status}: ${await specificTrainerResponse.text()}`;
        console.error('❌ debug-trainers: ошибка поиска elena-smirnova:', specificTrainerError);
      }
    } catch (error) {
      specificTrainerError = error instanceof Error ? error.message : 'Unknown error';
    }

    return NextResponse.json({
      success: true,
      debug: {
        convexUrl,
        totalTrainers: allTrainers.length,
        trainersError,
        
        // Информация о всех тренерах
        allTrainers: allTrainers.map((trainer: any) => ({
          id: trainer._id,
          name: trainer.name,
          email: trainer.email,
          isActive: trainer.isActive
        })),
        
        // Проверка конкретного тренера
        searchedTrainerId: testTrainerId,
        specificTrainerFound: !!specificTrainer,
        specificTrainerError,
        specificTrainerData: specificTrainer ? {
          id: specificTrainer._id,
          name: specificTrainer.name,
          email: specificTrainer.email,
          isActive: specificTrainer.isActive
        } : null
      }
    });

  } catch (error) {
    console.error('❌ debug-trainers: критическая ошибка:', error);
    return NextResponse.json({
      error: 'Критическая ошибка при проверке тренеров',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
