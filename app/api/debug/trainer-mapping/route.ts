// app/api/debug/trainer-mapping/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    // Получаем всех тренеров из базы
    const trainersResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'trainers:getAll',
        args: {}
      })
    });

    if (!trainersResponse.ok) {
      throw new Error('Ошибка получения тренеров');
    }

    const trainersData = await trainersResponse.json();
    const trainers = trainersData.value || [];

    // Ваши существующие slug'и из структуры папок
    const existingSlugs = [
      'elena-smirnova',
      'aleksandr-petrov', 
      'dmitriy-kozlov',
      'anna-petrova',
      'mikhail-volkov'
    ];

    // Создаем маппинг
    const mapping: { [key: string]: string } = {};
    const suggestions: { slug: string, possibleNames: string[] }[] = [];

    existingSlugs.forEach(slug => {
      // Пытаемся найти подходящего тренера по частичному совпадению имени
      const possibleTrainers = trainers.filter((trainer: any) => {
        const name = trainer.name.toLowerCase();
        const slugParts = slug.split('-');
        return slugParts.some(part => name.includes(part) || name.includes(part.replace('elena', 'елена').replace('aleksandr', 'александр').replace('dmitriy', 'дмитрий').replace('anna', 'анна').replace('mikhail', 'михаил')));
      });

      suggestions.push({
        slug,
        possibleNames: possibleTrainers.map((t: any) => t.name)
      });

      // Если найден точно один подходящий тренер, добавляем в маппинг
      if (possibleTrainers.length === 1) {
        mapping[slug] = possibleTrainers[0].name;
      }
    });

    return NextResponse.json({
      success: true,
      debug: {
        existingSlugs,
        trainersInDatabase: trainers.map((t: any) => ({ id: t._id, name: t.name })),
        automaticMapping: mapping,
        suggestions,
        recommendedMapping: {
          'elena-smirnova': 'Елена Смирнова',
          'aleksandr-petrov': 'Александр Петров', 
          'dmitriy-kozlov': 'Дмитрий Козлов',
          'anna-petrova': 'Анна Петрова',
          'mikhail-volkov': 'Михаил Волков'
        }
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
