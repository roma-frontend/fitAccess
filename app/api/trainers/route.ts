// app/api/trainers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withTrainerManagement, withPermissions } from '@/lib/api-middleware';
import { canManageRole } from '@/lib/permissions';
import { mockTrainers } from '@/lib/mock-data';

// GET /api/trainers - Получение списка тренеров
export const GET = withTrainerManagement(async (req) => {
  try {
    console.log('📋 API: получение списка тренеров');
    
    const { user } = req;
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    // Фильтрация по правам доступа
    let trainers = mockTrainers;
    
    // Тренеры видят только себя
    if (user.role === 'trainer') {
      trainers = trainers.filter(trainer => trainer.id === user.id);
    }
    
    // Поиск
    if (search) {
      trainers = trainers.filter(trainer =>
        trainer.name.toLowerCase().includes(search.toLowerCase()) ||
        trainer.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTrainers = trainers.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedTrainers,
      pagination: {
        page,
        limit,
        total: trainers.length,
        pages: Math.ceil(trainers.length / limit)
      }
    });

  } catch (error) {
    console.error('💥 API: ошибка получения тренеров:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка получения списка тренеров' },
      { status: 500 }
    );
  }
});

// POST /api/trainers - Создание нового тренера
export const POST = withPermissions(
  { resource: 'trainers', action: 'create' },
  async (req) => {
    try {
      console.log('➕ API: создание нового тренера');
      
      const body = await req.json();
      const { user } = req;

      // Валидация данных
      if (!body.name || !body.email) {
        return NextResponse.json(
          { success: false, error: 'Отсутствуют обязательные поля (name, email)' },
          { status: 400 }
        );
      }

      // Проверка прав на создание роли (используем функцию напрямую, а не хук)
      const targetRole = body.role || 'trainer';
      if (!canManageRole(user.role, targetRole)) {
        return NextResponse.json(
          { success: false, error: `Недостаточно прав для создания роли ${targetRole}` },
          { status: 403 }
        );
      }

      // Проверка уникальности email
      const existingTrainer = mockTrainers.find(t => t.email === body.email);
      if (existingTrainer) {
        return NextResponse.json(
          { success: false, error: 'Тренер с таким email уже существует' },
          { status: 409 }
        );
      }

      // Создание нового тренера со всеми обязательными полями
      const newTrainer = {
        id: `trainer_${Date.now()}`,
        name: body.name,
        email: body.email,
        role: targetRole,
        status: body.status || 'active',
        phone: body.phone || '',
        specialization: Array.isArray(body.specialization) ? body.specialization : [],
        experience: typeof body.experience === 'number' ? body.experience : 0,
        rating: 0,
        activeClients: 0,
        totalSessions: 0,
        hourlyRate: typeof body.hourlyRate === 'number' ? body.hourlyRate : 1500, // Дефолтная ставка
        certifications: Array.isArray(body.certifications) ? body.certifications : [],
        workingHours: body.workingHours || {
          monday: { start: '09:00', end: '18:00', isWorking: true },
          tuesday: { start: '09:00', end: '18:00', isWorking: true },
          wednesday: { start: '09:00', end: '18:00', isWorking: true },
          thursday: { start: '09:00', end: '18:00', isWorking: true },
          friday: { start: '09:00', end: '18:00', isWorking: true },
          saturday: { start: '10:00', end: '16:00', isWorking: true },
          sunday: { start: '10:00', end: '16:00', isWorking: false }
        },
        createdAt: new Date().toISOString(),
        createdBy: user.id
      };

      // В реальном приложении здесь будет сохранение в БД
      mockTrainers.push(newTrainer);

      console.log(`✅ API: тренер создан - ${newTrainer.name} (${newTrainer.email})`);

      return NextResponse.json({
        success: true,
        data: newTrainer,
        message: 'Тренер успешно создан'
      });

    } catch (error) {
      console.error('💥 API: ошибка создания тренера:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка создания тренера' },
        { status: 500 }
      );
    }
  }
);

// PUT /api/trainers - Обновление тренера
export const PUT = withPermissions(
  { resource: 'trainers', action: 'update' },
  async (req) => {
    try {
      console.log('📝 API: обновление тренера');
      
      const body = await req.json();
      const { user } = req;
      const { id, ...updateData } = body;

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'ID тренера не указан' },
          { status: 400 }
        );
      }

      const trainerIndex = mockTrainers.findIndex(t => t.id === id);
      if (trainerIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Тренер не найден' },
          { status: 404 }
        );
      }

      const trainer = mockTrainers[trainerIndex];

      // Проверка прав доступа к объекту
      if (user.role === 'trainer' && trainer.id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав для редактирования этого тренера' },
          { status: 403 }
        );
      }

      // Проверка уникальности email при изменении
      if (updateData.email && updateData.email !== trainer.email) {
        const existingTrainer = mockTrainers.find(t => t.email === updateData.email && t.id !== id);
        if (existingTrainer) {
          return NextResponse.json(
            { success: false, error: 'Тренер с таким email уже существует' },
            { status: 409 }
          );
        }
      }

      // Обновление тренера
      const updatedTrainer = {
        ...trainer,
        ...updateData,
        id, // Сохраняем оригинальный ID
        updatedAt: new Date().toISOString(),
        updatedBy: user.id
      };

      mockTrainers[trainerIndex] = updatedTrainer;

      console.log(`✅ API: тренер обновлен - ${updatedTrainer.name}`);

      return NextResponse.json({
        success: true,
        data: updatedTrainer,
        message: 'Тренер успешно обновлен'
      });

    } catch (error) {
      console.error('💥 API: ошибка обновления тренера:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка обновления тренера' },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/trainers - Удаление тренера
export const DELETE = withPermissions(
  { resource: 'trainers', action: 'delete' },
  async (req) => {
    try {
      console.log('🗑️ API: удаление тренера');
      
      const url = new URL(req.url);
      const id = url.searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'ID тренера не указан' },
          { status: 400 }
        );
      }

      const trainerIndex = mockTrainers.findIndex(t => t.id === id);
      if (trainerIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Тренер не найден' },
          { status: 404 }
        );
      }

      const trainer = mockTrainers[trainerIndex];

      // Проверка, что у тренера нет активных клиентов
      if (trainer.activeClients > 0) {
        return NextResponse.json(
          { success: false, error: 'Нельзя удалить тренера с активными клиентами' },
          { status: 400 }
        );
      }

      // Удаление тренера
      mockTrainers.splice(trainerIndex, 1);

      console.log(`✅ API: тренер удален - ${trainer.name}`);

      return NextResponse.json({
        success: true,
        message: 'Тренер успешно удален'
      });

    } catch (error) {
      console.error('💥 API: ошибка удаления тренера:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка удаления тренера' },
        { status: 500 }
      );
    }
  }
);
