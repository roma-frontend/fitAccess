// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api-middleware';
import { mockTrainers, mockClients, Trainer, Client } from '@/lib/mock-data';

// Типы для пользователей
interface TrainerProfile extends Trainer {
  type: 'trainer';
  lastLogin?: string;
}

interface ClientProfile extends Client {
  type: 'client';
  lastLogin?: string;
}

type UserProfile = TrainerProfile | ClientProfile;

// GET /api/auth/me - Получение информации о текущем пользователе
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    console.log('🔐 API: получение информации о пользователе');

    const { user } = req;

    // Поиск пользователя в базе данных
    let foundUser: Trainer | Client | undefined = mockTrainers.find(t => t.id === user.id);
    let userType: 'trainer' | 'client' = 'trainer';

    if (!foundUser) {
      foundUser = mockClients.find(c => c.id === user.id);
      userType = 'client';
    }

    if (!foundUser) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден в системе' },
        { status: 404 }
      );
    }

    // Формирование информации о пользователе
    let userInfo: UserProfile;

    if (userType === 'trainer') {
      const trainer = foundUser as Trainer;
      userInfo = {
        ...trainer,
        type: 'trainer',
        lastLogin: new Date().toISOString()
      };
    } else {
      const client = foundUser as Client;
      userInfo = {
        ...client,
        type: 'client',
        lastLogin: new Date().toISOString()
      };
    }

    console.log(`✅ API: информация получена для ${foundUser.name} (${userType})`);

    return NextResponse.json({
      success: true,
      data: userInfo
    });

  } catch (error) {
    console.error('💥 API: ошибка получения информации о пользователе:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка получения информации о пользователе' },
      { status: 500 }
    );
  }
});

// PUT /api/auth/me - Обновление профиля пользователя
export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    console.log('✏️ API: обновление профиля пользователя');

    const { user } = req;
    const body = await req.json();

    // Поиск пользователя
    let userIndex = mockTrainers.findIndex(t => t.id === user.id);
    let userType: 'trainer' | 'client' = 'trainer';

    if (userIndex === -1) {
      userIndex = mockClients.findIndex(c => c.id === user.id);
      userType = 'client';
    }

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверка изменения email
    if (body.email && body.email !== user.email) {
      const emailExists = [
        ...mockTrainers,
        ...mockClients
      ].some(u => u.email === body.email && u.id !== user.id);

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email уже используется' },
          { status: 409 }
        );
      }
    }

    if (userType === 'trainer') {
      const trainer = mockTrainers[userIndex];
      
      // Обновление данных тренера (только разрешенные поля)
      const allowedTrainerFields = ['name', 'phone', 'email', 'specialization', 'experience'];
      const updatedTrainerData: Partial<Trainer> = {};
      
      allowedTrainerFields.forEach(field => {
        if (body[field] !== undefined) {
          (updatedTrainerData as any)[field] = body[field];
        }
      });

      // Валидация специфичных полей тренера
      if (body.specialization && !Array.isArray(body.specialization)) {
        return NextResponse.json(
          { success: false, error: 'Специализация должна быть массивом' },
          { status: 400 }
        );
      }

      if (body.experience && (typeof body.experience !== 'number' || body.experience < 0)) {
        return NextResponse.json(
          { success: false, error: 'Опыт должен быть положительным числом' },
          { status: 400 }
        );
      }

      const updatedTrainer: Trainer = {
        ...trainer,
        ...updatedTrainerData,
        updatedAt: new Date().toISOString()
      };

      mockTrainers[userIndex] = updatedTrainer;

      console.log(`✅ API: профиль тренера обновлен для ${updatedTrainer.name}`);

      return NextResponse.json({
        success: true,
        data: { ...updatedTrainer, type: 'trainer' },
        message: 'Профиль успешно обновлен'
      });

    } else {
      const client = mockClients[userIndex];
      
      // Обновление данных клиента (только разрешенные поля)
      const allowedClientFields = ['name', 'phone', 'email'];
      const updatedClientData: Partial<Client> = {};
      
      allowedClientFields.forEach(field => {
        if (body[field] !== undefined) {
          (updatedClientData as any)[field] = body[field];
        }
      });

      const updatedClient: Client = {
        ...client,
        ...updatedClientData,
        updatedAt: new Date().toISOString()
      };

      mockClients[userIndex] = updatedClient;

      console.log(`✅ API: профиль клиента обновлен для ${updatedClient.name}`);

      return NextResponse.json({
        success: true,
        data: { ...updatedClient, type: 'client' },
        message: 'Профиль успешно обновлен'
      });
    }

  } catch (error) {
    console.error('💥 API: ошибка обновления профиля:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления профиля' },
      { status: 500 }
    );
  }
});

// PATCH /api/auth/me - Частичное обновление профиля (смена пароля, настройки)
export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  try {
    console.log('🔧 API: частичное обновление профиля пользователя');

    const { user } = req;
    const body = await req.json();

    if (!body.action) {
      return NextResponse.json(
        { success: false, error: 'Действие не указано' },
        { status: 400 }
      );
    }

    // Поиск пользователя
    let userIndex = mockTrainers.findIndex(t => t.id === user.id);
    let userType: 'trainer' | 'client' = 'trainer';

    if (userIndex === -1) {
      userIndex = mockClients.findIndex(c => c.id === user.id);
      userType = 'client';
    }

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    switch (body.action) {
      case 'changePassword':
        // В реальном приложении здесь была бы логика смены пароля
        if (!body.currentPassword || !body.newPassword) {
          return NextResponse.json(
            { success: false, error: 'Необходимо указать текущий и новый пароль' },
            { status: 400 }
          );
        }

        if (body.newPassword.length < 8) {
          return NextResponse.json(
            { success: false, error: 'Новый пароль должен содержать минимум 8 символов' },
            { status: 400 }
          );
        }

        console.log(`🔑 API: пароль изменен для пользователя ${user.id}`);
        break;

      case 'updateNotifications':
        // В реальном приложении здесь была бы логика обновления настроек уведомлений
        console.log(`🔔 API: настройки уведомлений обновлены для пользователя ${user.id}`);
        break;

      case 'updatePrivacy':
        // В реальном приложении здесь была бы логика обновления настроек приватности
        console.log(`🔒 API: настройки приватности обновлены для пользователя ${user.id}`);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Неизвестное действие' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Действие "${body.action}" выполнено успешно`
    });

  } catch (error) {
    console.error('💥 API: ошибка частичного обновления профиля:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления профиля' },
      { status: 500 }
    );
  }
});

// DELETE /api/auth/me - Удаление аккаунта пользователя
export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    console.log('🗑️ API: удаление аккаунта пользователя');

    const { user } = req;
    const body = await req.json();

    // Подтверждение удаления
    if (!body.confirmDelete || body.confirmDelete !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json(
        { success: false, error: 'Для удаления аккаунта необходимо подтверждение' },
        { status: 400 }
      );
    }

    // Поиск пользователя
    let userIndex = mockTrainers.findIndex(t => t.id === user.id);
    let userType: 'trainer' | 'client' = 'trainer';

    if (userIndex === -1) {
      userIndex = mockClients.findIndex(c => c.id === user.id);
      userType = 'client';
    }

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    if (userType === 'trainer') {
      const trainer = mockTrainers[userIndex];
      
      // Проверка активных клиентов
      if (trainer.activeClients > 0) {
        return NextResponse.json(
          { success: false, error: 'Нельзя удалить аккаунт тренера с активными клиентами' },
          { status: 400 }
        );
      }

      // Мягкое удаление
      mockTrainers[userIndex] = {
        ...trainer,
        status: 'inactive',
        updatedAt: new Date().toISOString()
      };
    } else {
      const client = mockClients[userIndex];
      
      // Мягкое удаление
      mockClients[userIndex] = {
        ...client,
        status: 'inactive',
        updatedAt: new Date().toISOString()
      };
    }

    console.log(`✅ API: аккаунт удален для пользователя ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Аккаунт успешно удален'
    });

  } catch (error) {
    console.error('💥 API: ошибка удаления аккаунта:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка удаления аккаунта' },
      { status: 500 }
    );
  }
});
