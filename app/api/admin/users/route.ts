// app/api/admin/users/route.ts (полностью исправленная версия)
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
  type User,
  type CreateUserData
} from '@/lib/users-db';

// ✅ OPTIONS для CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// ✅ GET - Получить всех пользователей
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /admin/users GET вызван');
    console.log('🔍 URL:', request.url);
    
    // Проверяем авторизацию
    const sessionId = request.cookies.get('session_id')?.value || 
                     request.cookies.get('session_id_debug')?.value;
    
    console.log('🍪 Session ID найден:', !!sessionId);
    
    if (!sessionId) {
      console.log('❌ Нет session ID');
      return NextResponse.json({ 
        error: 'Не авторизован',
        debug: 'No session ID found'
      }, { status: 401 });
    }

    const session = getSession(sessionId);
    console.log('👤 Session найдена:', !!session);
    
    if (!session) {
      console.log('❌ Сессия недействительна');
      return NextResponse.json({ 
        error: 'Сессия недействительна',
        debug: 'Invalid session'
      }, { status: 401 });
    }

    console.log('👤 Пользователь:', session.user.email, session.user.role);

    // Проверяем права доступа
    if (!['super-admin', 'admin', 'manager'].includes(session.user.role)) {
      console.log('❌ Недостаточно прав');
      return NextResponse.json({ 
        error: 'Недостаточно прав',
        debug: `Role ${session.user.role} not allowed`
      }, { status: 403 });
    }

    // Получаем параметры
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role');
    
    console.log('🔍 Фильтр по роли:', roleFilter);

    // Получаем пользователей
    console.log('📋 Получаем всех пользователей...');
    const users: User[] = await getAllUsers();
    
    console.log('📋 Всего пользователей:', users.length);
    console.log('📋 Роли пользователей:', users.map(u => ({ name: u.name, role: u.role })));
    
    // Фильтруем пользователей в зависимости от роли запрашивающего
    let filteredUsers = users;
    
    if (session.user.role === 'admin') {
      filteredUsers = users.filter(user => !['super-admin'].includes(user.role));
    } else if (session.user.role === 'manager') {
      filteredUsers = users.filter(user => !['super-admin', 'admin'].includes(user.role));
    }

    // Дополнительная фильтрация по параметру role
    if (roleFilter === 'trainers') {
      filteredUsers = filteredUsers.filter(user => 
        user.role === 'trainer' || 
        user.role === 'admin' || 
        user.role === 'super-admin'
      );
      console.log('🏋️ Отфильтровано тренеров:', filteredUsers.length);
    }

    // Убираем пароли из ответа и добавляем photoUrl
    const safeUsers = filteredUsers.map(user => ({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      createdAt: user.createdAt,
      createdBy: user.createdBy,
      isActive: user.isActive,
      photoUrl: user.photoUrl || null,
      lastLogin: user.lastLogin || null
    }));

    console.log('✅ Возвращаем пользователей:', safeUsers.length);
    if (roleFilter === 'trainers') {
      console.log('🏋️ Тренеры:', safeUsers.map(u => ({ id: u.id, name: u.name, role: u.role })));
    }

    return NextResponse.json({
      success: true,
      users: safeUsers,
      canCreate: canCreateRole(session.user.role, 'member'),
      userRole: session.user.role,
      debug: {
        totalUsers: users.length,
        filteredUsers: filteredUsers.length,
        roleFilter,
        userRole: session.user.role
      },
      // Для обратной совместимости с компонентом расписания
      trainers: roleFilter === 'trainers' ? safeUsers : undefined
    });

  } catch (error) {
    console.error('💥 Ошибка в GET /api/admin/users:', error);
    
    return NextResponse.json({ 
      error: 'Ошибка сервера',
      debug: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      users: [],
      trainers: undefined
    }, { status: 500 });
  }
}

// ✅ POST - Создать пользователя
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/admin/users - начало обработки');
    
    // Проверяем авторизацию
    const sessionId = request.cookies.get('session_id')?.value || 
                     request.cookies.get('session_id_debug')?.value;
    
    console.log('🍪 Session ID:', sessionId ? 'найден' : 'НЕ найден');
    
    if (!sessionId) {
      console.log('❌ Нет session ID');
      return NextResponse.json({ 
        error: 'Не авторизован',
        debug: 'No session ID found'
      }, { status: 401 });
    }

    const session = getSession(sessionId);
    console.log('👤 Session:', session ? `найдена для ${session.user.email} (${session.user.role})` : 'НЕ найдена');
    
    if (!session) {
      console.log('❌ Сессия недействительна');
      return NextResponse.json({ 
        error: 'Сессия недействительна',
        debug: 'Invalid session'
      }, { status: 401 });
    }

    // Получаем данные из запроса
    const body = await request.json();
    console.log('📝 Данные запроса:', {
      ...body,
      password: body.password ? '[СКРЫТ]' : 'отсутствует',
      hasPhoto: !!body.photoUrl
    });
    
    const { email, password, role, name, isActive, photoUrl, phone, bio, specializations, experience, hourlyRate } = body;

    // Проверяем обязательные поля
    if (!email || !password || !role || !name) {
      console.log('❌ Отсутствуют обязательные поля:', { 
        email: !!email, 
        password: !!password, 
        role: !!role, 
        name: !!name 
      });
      return NextResponse.json({ 
        error: 'Все поля обязательны для заполнения',
        debug: 'Missing required fields'
      }, { status: 400 });
    }

    // Проверяем валидность роли
    console.log('🔍 Проверяем роль:', role);
    if (!isValidRole(role)) {
      console.log('❌ Недопустимая роль:', role);
      return NextResponse.json({ 
        error: `Недопустимая роль: ${role}`,
        debug: 'Invalid role'
      }, { status: 400 });
    }

    // Проверяем права на создание роли
    console.log('🔐 Проверяем права:', `${session.user.role} -> ${role}`);
    if (!canCreateRole(session.user.role, role)) {
      console.log('❌ Недостаточно прав для создания роли');
      return NextResponse.json({ 
        error: `У вас нет прав для создания роли: ${role}`,
        debug: `User role: ${session.user.role}, target role: ${role}`
      }, { status: 403 });
    }

    // Валидация URL фото (если предоставлен)
    if (photoUrl) {
      console.log('🖼️ Проверяем URL фото:', photoUrl.substring(0, 50) + '...');
      
      // Проверяем, что это валидный URL
      if (!photoUrl.includes('cloudinary.com') && !photoUrl.startsWith('http')) {
        console.log('❌ Недопустимый URL фото');
        return NextResponse.json({ 
          error: 'Недопустимый URL фотографии',
          debug: 'Invalid photo URL'
        }, { status: 400 });
      }
    }

    console.log('✅ Все проверки пройдены, создаем пользователя...');

    // Подготавливаем данные для создания пользователя
    const userData: CreateUserData = {
      email,
      password,
      role,
      name,
      isActive: isActive !== undefined ? isActive : true,
      photoUrl: photoUrl || undefined,
      // Дополнительные поля для тренеров
      phone: phone || undefined,
      bio: bio || undefined,
      specializations: specializations || undefined,
      experience: experience || undefined,
      hourlyRate: hourlyRate || undefined
    };

    console.log('📤 Данные для создания пользователя:', {
      ...userData,
      password: '[СКРЫТ]',
      hasPhoto: !!userData.photoUrl
    });

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
        isActive: newUser.isActive,
        photoUrl: newUser.photoUrl || null,
        phone: newUser.phone || null,
        bio: newUser.bio || null,
        specializations: newUser.specializations || null,
        experience: newUser.experience || null,
        hourlyRate: newUser.hourlyRate || null
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
      debug: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 400 });
  }
}

// ✅ PUT - Обновить пользователя
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 PUT /api/admin/users - начало обновления');
    
    const sessionId = request.cookies.get('session_id')?.value || 
                     request.cookies.get('session_id_debug')?.value;
    
    if (!sessionId) {
      console.log('❌ Нет session ID');
      return NextResponse.json({ 
        error: 'Не авторизован',
        debug: 'No session ID'
      }, { status: 401 });
    }

    const session = getSession(sessionId);
    if (!session) {
      console.log('❌ Сессия недействительна');
      return NextResponse.json({ 
        error: 'Сессия недействительна',
        debug: 'Invalid session'
      }, { status: 401 });
    }

    const { id, updates } = await request.json();
    
    console.log('📝 Данные для обновления:', {
      id,
      updates: {
        ...updates,
        password: updates.password ? '[СКРЫТ]' : 'не изменяется',
        hasPhoto: !!updates.photoUrl
      }
    });
    
    const targetUser: User | null = await findUserById(id);
    if (!targetUser) {
      console.log('❌ Пользователь не найден:', id);
      return NextResponse.json({ 
        error: 'Пользователь не найден',
        debug: `User ID: ${id}`
      }, { status: 404 });
    }

    if (!canManageUser(session.user.role, targetUser.role)) {
      console.log('❌ Недостаточно прав для управления пользователем');
      return NextResponse.json({ 
        error: 'У вас нет прав для управления этим пользователем',
        debug: `Manager role: ${session.user.role}, target role: ${targetUser.role}`
      }, { status: 403 });
    }

    // Проверяем роль, если она обновляется
    if (updates.role) {
      console.log('🔍 Проверяем новую роль:', updates.role);
      
      if (!isValidRole(updates.role)) {
        console.log('❌ Недопустимая роль:', updates.role);
        return NextResponse.json({ 
          error: `Недопустимая роль: ${updates.role}`,
          debug: 'Invalid role'
        }, { status: 400 });
      }

      if (!canCreateRole(session.user.role, updates.role)) {
        console.log('❌ Недостаточно прав для назначения роли');
        return NextResponse.json({ 
          error: `У вас нет прав для назначения роли: ${updates.role}`,
          debug: `User role: ${session.user.role}, target role: ${updates.role}`
        }, { status: 403 });
      }
    }

        // Валидация URL фото (если обновляется)
    if (updates.photoUrl !== undefined) {
      console.log('🖼️ Обновляем фото:', updates.photoUrl ? 'новое фото' : 'удаляем фото');
      
      if (updates.photoUrl && !updates.photoUrl.includes('cloudinary.com') && !updates.photoUrl.startsWith('http')) {
        console.log('❌ Недопустимый URL фото');
        return NextResponse.json({ 
          error: 'Недопустимый URL фотографии',
          debug: 'Invalid photo URL'
        }, { status: 400 });
      }
    }

    console.log('✅ Все проверки пройдены, обновляем пользователя...');

    const updatedUser: User | null = await updateUser(id, updates, session.user.email);

    if (!updatedUser) {
      console.log('❌ Не удалось обновить пользователя');
      return NextResponse.json({ 
        error: 'Не удалось обновить пользователя',
        debug: 'Update operation failed'
      }, { status: 400 });
    }

    console.log('✅ Пользователь обновлен успешно:', updatedUser._id);

    return NextResponse.json({
      success: true,
      message: 'Пользователь обновлен успешно',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name,
        isActive: updatedUser.isActive,
        photoUrl: updatedUser.photoUrl || null,
        lastLogin: updatedUser.lastLogin || null,
        phone: updatedUser.phone || null,
        bio: updatedUser.bio || null,
        specializations: updatedUser.specializations || null,
        experience: updatedUser.experience || null,
        hourlyRate: updatedUser.hourlyRate || null
      }
    });

  } catch (error) {
    console.error('💥 Ошибка обновления пользователя:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Ошибка обновления пользователя',
      debug: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 400 });
  }
}

// ✅ DELETE - Удалить пользователя
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ DELETE /api/admin/users - начало удаления');
    
    const sessionId = request.cookies.get('session_id')?.value || 
                     request.cookies.get('session_id_debug')?.value;
    
    if (!sessionId) {
      console.log('❌ Нет session ID');
      return NextResponse.json({ 
        error: 'Не авторизован',
        debug: 'No session ID'
      }, { status: 401 });
    }

    const session = getSession(sessionId);
    if (!session) {
      console.log('❌ Сессия недействительна');
      return NextResponse.json({ 
        error: 'Сессия недействительна',
        debug: 'Invalid session'
      }, { status: 401 });
    }

    const { id } = await request.json();
    console.log('🎯 Удаляем пользователя с ID:', id);
    
    if (!id) {
      console.log('❌ Не указан ID пользователя');
      return NextResponse.json({ 
        error: 'Не указан ID пользователя',
        debug: 'Missing user ID'
      }, { status: 400 });
    }
    
    const targetUser: User | null = await findUserById(id);
    if (!targetUser) {
      console.log('❌ Пользователь не найден:', id);
      return NextResponse.json({ 
        error: 'Пользователь не найден',
        debug: `User ID: ${id}`
      }, { status: 404 });
    }

    console.log('👤 Найден пользователь для удаления:', targetUser.name, targetUser.email);

    if (!canManageUser(session.user.role, targetUser.role)) {
      console.log('❌ Недостаточно прав для удаления пользователя');
      return NextResponse.json({ 
        error: 'У вас нет прав для удаления этого пользователя',
        debug: `Manager role: ${session.user.role}, target role: ${targetUser.role}`
      }, { status: 403 });
    }

    console.log('✅ Права проверены, удаляем пользователя...');

    const deleted: boolean = await deleteUser(id, session.user.email);

    if (deleted) {
      console.log('✅ Пользователь удален успешно');
      
      // Примечание: В реальном приложении здесь можно добавить логику
      // для удаления фото из Cloudinary, если это необходимо
      if (targetUser.photoUrl) {
        console.log('🖼️ Пользователь имел фото:', targetUser.photoUrl);
        // TODO: Добавить удаление фото из Cloudinary при необходимости
        // await deleteFromCloudinary(targetUser.photoUrl);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Пользователь удален успешно',
        deletedUser: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role
        }
      });
    } else {
      console.log('❌ Не удалось удалить пользователя');
      return NextResponse.json({ 
        error: 'Не удалось удалить пользователя',
        debug: 'Delete operation failed'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('💥 Ошибка удаления пользователя:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Ошибка удаления пользователя',
      debug: error instanceof Error ? error.stack : 'Unknown error'
    }, { status: 400 });
  }
}

