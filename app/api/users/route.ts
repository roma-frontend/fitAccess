// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mockTrainers, mockClients, Trainer, Client, normalizeWorkingHours, createDefaultWorkingHours } from '@/lib/mock-data';
import { withUserManagement, withUserCreation, AuthenticatedRequest } from '@/lib/api-middleware';
import { canManageRole, validateUserCreationData } from '@/lib/permissions';

// Типы для объединенных пользователей
interface TrainerUser extends Trainer {
  type: 'trainer';
}

interface ClientUser extends Client {
  type: 'client';
}

type CombinedUser = TrainerUser | ClientUser;

// GET /api/users - Получение списка пользователей
export const GET = withUserManagement(async (req: AuthenticatedRequest) => {
  try {
    console.log('👥 API: получение списка пользователей');
    
    const { user } = req;
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const role = url.searchParams.get('role');
    const search = url.searchParams.get('search') || '';

    // Получение всех пользователей (тренеры + клиенты)
    let allUsers: CombinedUser[] = [
      ...mockTrainers.map(t => ({ ...t, type: 'trainer' as const })),
      ...mockClients.map(c => ({ ...c, type: 'client' as const }))
    ];

    // Фильтрация по роли текущего пользователя
    if (user.role === 'trainer') {
      // Тренеры видят только своих клиентов и себя
      allUsers = allUsers.filter(u => 
        (u.type === 'trainer' && u.id === user.id) ||
        (u.type === 'client' && 'trainerId' in u && u.trainerId === user.id)
      );
    } else if (user.role === 'manager') {
      // Менеджеры не видят администраторов
      allUsers = allUsers.filter(u => {
        if (u.type === 'trainer') {
          return u.role !== 'admin' && u.role !== 'super-admin';
        }
        return true; // Клиенты не имеют роли admin
      });
    }

    // Фильтрация по роли (только для тренеров, у клиентов нет поля role)
    if (role) {
      allUsers = allUsers.filter(u => 
        u.type === 'trainer' && u.role === role
      );
    }

    // Поиск
    if (search) {
      allUsers = allUsers.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total: allUsers.length,
        pages: Math.ceil(allUsers.length / limit)
      }
    });

  } catch (error) {
    console.error('💥 API: ошибка получения пользователей:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка получения списка пользователей' },
      { status: 500 }
    );
  }
});

// POST /api/users - Создание нового пользователя
export const POST = withUserCreation(async (req: AuthenticatedRequest) => {
  try {
    console.log('➕ API: создание нового пользователя');
    
    const body = await req.json();
    const { user } = req;

    // Валидация данных
    const validation = validateUserCreationData(body, user.role);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ошибки валидации', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Проверка уникальности email
    const allUsers = [...mockTrainers, ...mockClients];
    const existingUser = allUsers.find(u => u.email === body.email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Создание пользователя в зависимости от типа
    if (body.type === 'trainer') {
      const newTrainer: Trainer = {
        id: `trainer_${Date.now()}`,
        name: body.name,
        email: body.email,
        role: body.role,
        status: body.status || 'active',
        phone: body.phone || '',
        specialization: Array.isArray(body.specialization) ? body.specialization : [],
        experience: typeof body.experience === 'number' ? body.experience : 0,
        rating: 0,
        activeClients: 0,
        totalSessions: 0,
        hourlyRate: typeof body.hourlyRate === 'number' ? body.hourlyRate : 1500,
        certifications: Array.isArray(body.certifications) ? body.certifications : [],
        workingHours: body.workingHours ? normalizeWorkingHours(body.workingHours) : createDefaultWorkingHours(),
        createdAt: new Date().toISOString(),
        createdBy: user.id
      };

      mockTrainers.push(newTrainer);

      console.log(`✅ API: тренер создан - ${newTrainer.name} (${newTrainer.role})`);

      return NextResponse.json({
        success: true,
        data: { ...newTrainer, type: 'trainer' },
        message: 'Тренер успешно создан'
      });

    } else if (body.type === 'client') {
      // Проверка существования тренера если указан
      if (body.trainerId) {
        const trainer = mockTrainers.find(t => t.id === body.trainerId);
        if (!trainer) {
          return NextResponse.json(
            { success: false, error: 'Указанный тренер не найден' },
            { status: 400 }
          );
        }
      }

      const newClient: Client = {
        id: `client_${Date.now()}`,
        name: body.name,
        email: body.email,
        phone: body.phone || '',
        status: body.status || 'active',
        trainerId: body.trainerId || undefined,
        membershipType: body.membershipType || 'basic',
        joinDate: new Date().toISOString().split('T')[0],
        totalSessions: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.id
      };

      mockClients.push(newClient);

      console.log(`✅ API: клиент создан - ${newClient.name}`);

      return NextResponse.json({
        success: true,
        data: { ...newClient, type: 'client' },
        message: 'Клиент успешно создан'
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Неизвестный тип пользователя' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('💥 API: ошибка создания пользователя:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка создания пользователя' },
      { status: 500 }
    );
  }
});

// PUT /api/users - Обновление пользователя
export const PUT = withUserManagement(async (req: AuthenticatedRequest) => {
  try {
    console.log('📝 API: обновление пользователя');
    
    const body = await req.json();
    const { user } = req;
    const { id, type, ...updateData } = body;

    if (!id || !type) {
      return NextResponse.json(
        { success: false, error: 'ID и тип пользователя обязательны' },
        { status: 400 }
      );
    }

    if (type === 'trainer') {
      const trainerIndex = mockTrainers.findIndex(t => t.id === id);
      if (trainerIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Тренер не найден' },
          { status: 404 }
        );
      }

      const trainer = mockTrainers[trainerIndex];

      // Проверка прав доступа
      if (user.role === 'trainer' && trainer.id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав для редактирования этого тренера' },
          { status: 403 }
        );
      }

      // Проверка изменения роли
      if (updateData.role && updateData.role !== trainer.role) {
        if (!canManageRole(user.role, updateData.role)) {
          return NextResponse.json(
            { success: false, error: `Недостаточно прав для назначения роли ${updateData.role}` },
            { status: 403 }
          );
        }
      }

      // Проверка уникальности email
      if (updateData.email && updateData.email !== trainer.email) {
        const existingUser = [...mockTrainers, ...mockClients].find(u => u.email === updateData.email);
        if (existingUser) {
          return NextResponse.json(
            { success: false, error: 'Пользователь с таким email уже существует' },
            { status: 409 }
          );
        }
      }

      const updatedTrainer = {
        ...trainer,
        ...updateData,
                id, // ID не должен изменяться
        workingHours: updateData.workingHours ? normalizeWorkingHours(updateData.workingHours) : trainer.workingHours,
        updatedAt: new Date().toISOString(),
        updatedBy: user.id
      };

      mockTrainers[trainerIndex] = updatedTrainer;

      return NextResponse.json({
        success: true,
        data: { ...updatedTrainer, type: 'trainer' },
        message: 'Тренер успешно обновлен'
      });

    } else if (type === 'client') {
      const clientIndex = mockClients.findIndex(c => c.id === id);
      if (clientIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Клиент не найден' },
          { status: 404 }
        );
      }

      const client = mockClients[clientIndex];

      // Проверка прав доступа
      if (user.role === 'trainer' && client.trainerId !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав для редактирования этого клиента' },
          { status: 403 }
        );
      }

      // Проверка существования тренера если указан
      if (updateData.trainerId) {
        const trainer = mockTrainers.find(t => t.id === updateData.trainerId);
        if (!trainer) {
          return NextResponse.json(
            { success: false, error: 'Указанный тренер не найден' },
            { status: 400 }
          );
        }
      }

      // Проверка уникальности email
      if (updateData.email && updateData.email !== client.email) {
        const existingUser = [...mockTrainers, ...mockClients].find(u => u.email === updateData.email);
        if (existingUser) {
          return NextResponse.json(
            { success: false, error: 'Пользователь с таким email уже существует' },
            { status: 409 }
          );
        }
      }

      const updatedClient = {
        ...client,
        ...updateData,
        id, // ID не должен изменяться
        updatedAt: new Date().toISOString(),
        updatedBy: user.id
      };

      mockClients[clientIndex] = updatedClient;

      return NextResponse.json({
        success: true,
        data: { ...updatedClient, type: 'client' },
        message: 'Клиент успешно обновлен'
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Неизвестный тип пользователя' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('💥 API: ошибка обновления пользователя:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления пользователя' },
      { status: 500 }
    );
  }
});

// DELETE /api/users - Удаление пользователя
export const DELETE = withUserManagement(async (req: AuthenticatedRequest) => {
  try {
    console.log('🗑️ API: удаление пользователя');
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const type = url.searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json(
        { success: false, error: 'ID и тип пользователя обязательны' },
        { status: 400 }
      );
    }

    if (type === 'trainer') {
      const trainerIndex = mockTrainers.findIndex(t => t.id === id);
      if (trainerIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Тренер не найден' },
          { status: 404 }
        );
      }

      const trainer = mockTrainers[trainerIndex];

      // Проверка на самоудаление
      if (trainer.id === req.user.id) {
        return NextResponse.json(
          { success: false, error: 'Нельзя удалить самого себя' },
          { status: 400 }
        );
      }

      // Проверка активных клиентов
      if (trainer.activeClients > 0) {
        return NextResponse.json(
          { success: false, error: 'Нельзя удалить тренера с активными клиентами' },
          { status: 400 }
        );
      }

      // Мягкое удаление
      mockTrainers[trainerIndex] = {
        ...trainer,
        status: 'inactive',
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.id
      };

      return NextResponse.json({
        success: true,
        message: 'Тренер успешно удален'
      });

    } else if (type === 'client') {
      const clientIndex = mockClients.findIndex(c => c.id === id);
      if (clientIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Клиент не найден' },
          { status: 404 }
        );
      }

      const client = mockClients[clientIndex];

      // Проверка прав доступа
      if (req.user.role === 'trainer' && client.trainerId !== req.user.id) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав для удаления этого клиента' },
          { status: 403 }
        );
      }

      // Мягкое удаление
      mockClients[clientIndex] = {
        ...client,
        status: 'inactive',
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.id
      };

      return NextResponse.json({
        success: true,
        message: 'Клиент успешно удален'
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Неизвестный тип пользователя' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('💥 API: ошибка удаления пользователя:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка удаления пользователя' },
      { status: 500 }
    );
  }
});

// PATCH /api/users - Частичное обновление пользователя (смена статуса, назначение тренера и т.д.)
export const PATCH = withUserManagement(async (req: AuthenticatedRequest) => {
  try {
    console.log('🔧 API: частичное обновление пользователя');
    
    const body = await req.json();
    const { user } = req;
    const { id, type, action, ...actionData } = body;

    if (!id || !type || !action) {
      return NextResponse.json(
        { success: false, error: 'ID, тип пользователя и действие обязательны' },
        { status: 400 }
      );
    }

    if (type === 'trainer') {
      const trainerIndex = mockTrainers.findIndex(t => t.id === id);
      if (trainerIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Тренер не найден' },
          { status: 404 }
        );
      }

      const trainer = mockTrainers[trainerIndex];

      // Проверка прав доступа
      if (user.role === 'trainer' && trainer.id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав для редактирования этого тренера' },
          { status: 403 }
        );
      }

      switch (action) {
        case 'activate':
          if (user.role !== 'admin' && user.role !== 'manager') {
            return NextResponse.json(
              { success: false, error: 'Недостаточно прав для активации тренера' },
              { status: 403 }
            );
          }
          trainer.status = 'active';
          break;

        case 'suspend':
          if (user.role !== 'admin' && user.role !== 'manager') {
            return NextResponse.json(
              { success: false, error: 'Недостаточно прав для приостановки тренера' },
              { status: 403 }
            );
          }
          trainer.status = 'suspended';
          break;

        case 'updateRating':
          if (typeof actionData.rating === 'number' && actionData.rating >= 0 && actionData.rating <= 5) {
            trainer.rating = actionData.rating;
          } else {
            return NextResponse.json(
              { success: false, error: 'Некорректное значение рейтинга' },
              { status: 400 }
            );
          }
          break;

        case 'updateStats':
          if (typeof actionData.activeClients === 'number' && actionData.activeClients >= 0) {
            trainer.activeClients = actionData.activeClients;
          }
          if (typeof actionData.totalSessions === 'number' && actionData.totalSessions >= 0) {
            trainer.totalSessions = actionData.totalSessions;
          }
          break;

        case 'changeRole':
          if (!actionData.newRole) {
            return NextResponse.json(
              { success: false, error: 'Новая роль обязательна' },
              { status: 400 }
            );
          }
          if (!canManageRole(user.role, actionData.newRole)) {
            return NextResponse.json(
              { success: false, error: `Недостаточно прав для назначения роли ${actionData.newRole}` },
              { status: 403 }
            );
          }
          trainer.role = actionData.newRole;
          break;

        default:
          return NextResponse.json(
            { success: false, error: 'Неизвестное действие для тренера' },
            { status: 400 }
          );
      }

      trainer.updatedAt = new Date().toISOString();
      trainer.updatedBy = user.id;
      mockTrainers[trainerIndex] = trainer;

      return NextResponse.json({
        success: true,
        data: { ...trainer, type: 'trainer' },
        message: `Действие "${action}" выполнено успешно`
      });

    } else if (type === 'client') {
      const clientIndex = mockClients.findIndex(c => c.id === id);
      if (clientIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Клиент не найден' },
          { status: 404 }
        );
      }

      const client = mockClients[clientIndex];

      // Проверка прав доступа
      if (user.role === 'trainer' && client.trainerId !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав для редактирования этого клиента' },
          { status: 403 }
        );
      }

      switch (action) {
        case 'activate':
          client.status = 'active';
          break;

        case 'suspend':
          client.status = 'suspended';
          break;

        case 'assignTrainer':
          if (actionData.trainerId) {
            const trainer = mockTrainers.find(t => t.id === actionData.trainerId);
            if (!trainer) {
              return NextResponse.json(
                { success: false, error: 'Указанный тренер не найден' },
                { status: 400 }
              );
            }
            client.trainerId = actionData.trainerId;
          } else {
            client.trainerId = undefined;
          }
          break;

        case 'updateMembership':
          if (['basic', 'premium', 'vip'].includes(actionData.membershipType)) {
            client.membershipType = actionData.membershipType;
          } else {
            return NextResponse.json(
              { success: false, error: 'Некорректный тип членства' },
              { status: 400 }
            );
          }
          break;

        case 'updateStats':
          if (typeof actionData.totalSessions === 'number' && actionData.totalSessions >= 0) {
            client.totalSessions = actionData.totalSessions;
          }
          break;

        default:
          return NextResponse.json(
            { success: false, error: 'Неизвестное действие для клиента' },
            { status: 400 }
          );
      }

      client.updatedAt = new Date().toISOString();
      client.updatedBy = user.id;
      mockClients[clientIndex] = client;

      return NextResponse.json({
        success: true,
        data: { ...client, type: 'client' },
        message: `Действие "${action}" выполнено успешно`
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Неизвестный тип пользователя' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('💥 API: ошибка частичного обновления пользователя:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления пользователя' },
      { status: 500 }
    );
  }
});

