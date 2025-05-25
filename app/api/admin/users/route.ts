// app/api/admin/users/route.ts (обновленная версия с типизацией)
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { 
  createUser, 
  getAllUsers, 
  canCreateRole, 
  canManageUser,
  updateUser,
  deleteUser,
  findUserById,
  isValidRole,
  User,
  CreateUserData
} from '@/lib/users-db';

// Получить всех пользователей
export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const sessionId = request.cookies.get('session_id')?.value || 
                     request.cookies.get('session_id_debug')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    // Проверяем права доступа
    if (!['super-admin', 'admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const users: User[] = await getAllUsers();
    
    // Фильтруем пользователей в зависимости от роли
    let filteredUsers = users;
    if (session.user.role === 'admin') {
      filteredUsers = users.filter(user => !['super-admin'].includes(user.role));
    } else if (session.user.role === 'manager') {
      filteredUsers = users.filter(user => !['super-admin', 'admin'].includes(user.role));
    }

    // Убираем пароли из ответа
    const safeUsers = filteredUsers.map(user => ({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      createdAt: user.createdAt,
      createdBy: user.createdBy,
      isActive: user.isActive
    }));

    return NextResponse.json({
      success: true,
      users: safeUsers,
      canCreate: canCreateRole(session.user.role, 'member'),
      userRole: session.user.role
    });

  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    return NextResponse.json({ 
      error: 'Ошибка сервера' 
    }, { status: 500 });
  }
}

// Создать пользователя
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/admin/users - начало обработки');
    
    // Проверяем авторизацию
    const sessionId = request.cookies.get('session_id')?.value || 
                     request.cookies.get('session_id_debug')?.value;
    
    console.log('🍪 Session ID:', sessionId ? 'найден' : 'НЕ найден');
    
    if (!sessionId) {
      console.log('❌ Нет session ID');
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const session = getSession(sessionId);
    console.log('👤 Session:', session ? `найдена для ${session.user.email} (${session.user.role})` : 'НЕ найдена');
    
    if (!session) {
      console.log('❌ Сессия недействительна');
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    // Получаем данные из запроса
    const body = await request.json();
    console.log('📝 Данные запроса:', body);
    
    const { email, password, role, name } = body;

    // Проверяем обязательные поля
    if (!email || !password || !role || !name) {
      console.log('❌ Отсутствуют обязательные поля:', { email: !!email, password: !!password, role: !!role, name: !!name });
      return NextResponse.json({ 
        error: 'Все поля обязательны для заполнения' 
      }, { status: 400 });
    }

    // Проверяем валидность роли
    console.log('🔍 Проверяем роль:', role);
    if (!isValidRole(role)) {
      console.log('❌ Недопустимая роль:', role);
      return NextResponse.json({ 
        error: `Недопустимая роль: ${role}` 
      }, { status: 400 });
    }

    // Проверяем права на создание роли
    console.log('🔐 Проверяем права:', `${session.user.role} -> ${role}`);
    if (!canCreateRole(session.user.role, role)) {
      console.log('❌ Недостаточно прав для создания роли');
      return NextResponse.json({ 
        error: `У вас нет прав для создания роли: ${role}` 
      }, { status: 403 });
    }

    console.log('✅ Все проверки пройдены, создаем пользователя...');

    // Подготавливаем данные для создания пользователя
    const userData: CreateUserData = {
      email,
      password,
      role,
      name,
      isActive: true
    };

    // Создаем пользователя
    const newUser: User = await createUser(userData, session.user.email);

    console.log('✅ Пользователь создан успешно:', newUser._id);

    return NextResponse.json({
      success: true,
      message: 'Пользователь создан успешно',
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        createdAt: newUser.createdAt,
        isActive: newUser.isActive
      }
    });

  } catch (error) {
    console.error('💥 Ошибка создания пользователя:', error);
    
    // Более детальное логирование ошибки
    if (error instanceof Error) {
      console.error('📋 Сообщение ошибки:', error.message);
      console.error('📋 Stack trace:', error.stack);
    }
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Ошибка создания пользователя',
      details: error instanceof Error ? error.stack : 'Неизвестная ошибка'
    }, { status: 400 });
  }
}

// Обновить пользователя
export async function PUT(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value || 
                     request.cookies.get('session_id_debug')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    const { id, updates } = await request.json();
    
    const targetUser: User | null = await findUserById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    if (!canManageUser(session.user.role, targetUser.role)) {
      return NextResponse.json({ 
        error: 'У вас нет прав для управления этим пользователем' 
      }, { status: 403 });
    }

    if (updates.role) {
      if (!isValidRole(updates.role)) {
        return NextResponse.json({ 
          error: `Недопустимая роль: ${updates.role}` 
        }, { status: 400 });
      }

      if (!canCreateRole(session.user.role, updates.role)) {
        return NextResponse.json({ 
          error: `У вас нет прав для назначения роли: ${updates.role}` 
        }, { status: 403 });
      }
    }

    const updatedUser: User | null = await updateUser(id, updates, session.user.email);

    return NextResponse.json({
      success: true,
      message: 'Пользователь обновлен успешно',
      user: {
        id: updatedUser!._id,
        email: updatedUser!.email,
        role: updatedUser!.role,
        name: updatedUser!.name,
        isActive: updatedUser!.isActive
      }
    });

  } catch (error) {
    console.error('Ошибка обновления пользователя:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Ошибка обновления пользователя' 
    }, { status: 400 });
  }
}

// Удалить пользователя
export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value || 
                     request.cookies.get('session_id_debug')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    const { id } = await request.json();
    
    const targetUser: User | null = await findUserById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    if (!canManageUser(session.user.role, targetUser.role)) {
      return NextResponse.json({ 
        error: 'У вас нет прав для удаления этого пользователя' 
      }, { status: 403 });
    }

    const deleted: boolean = await deleteUser(id, session.user.email);

    if (deleted) {
      return NextResponse.json({
        success: true,
        message: 'Пользователь удален успешно'
      });
    } else {
      return NextResponse.json({ error: 'Не удалось удалить пользователя' }, { status: 400 });
    }

  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Ошибка удаления пользователя' 
    }, { status: 400 });
  }
}
