// app/api/admin/users/route.ts (обновленная версия с Cloudinary)
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

    // Убираем пароли из ответа и добавляем photoUrl
    const safeUsers = filteredUsers.map(user => ({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      createdAt: user.createdAt,
      createdBy: user.createdBy,
      isActive: user.isActive,
      photoUrl: user.photoUrl || null, // ✅ Добавляем поддержку фото
      lastLogin: user.lastLogin || null
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
    console.log('📝 Данные запроса:', {
      ...body,
      password: body.password ? '[СКРЫТ]' : 'отсутствует',
      hasPhoto: !!body.photoUrl
    });
    
    const { email, password, role, name, isActive, photoUrl } = body;

    // Проверяем обязательные поля
    if (!email || !password || !role || !name) {
      console.log('❌ Отсутствуют обязательные поля:', { 
        email: !!email, 
        password: !!password, 
        role: !!role, 
        name: !!name 
      });
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

    // Валидация URL фото (если предоставлен)
    if (photoUrl) {
      console.log('🖼️ Проверяем URL фото:', photoUrl.substring(0, 50) + '...');
      
      // Проверяем, что это валидный URL Cloudinary
      if (!photoUrl.includes('cloudinary.com') && !photoUrl.startsWith('http')) {
        console.log('❌ Недопустимый URL фото');
        return NextResponse.json({ 
          error: 'Недопустимый URL фотографии' 
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
      photoUrl: photoUrl || undefined // ✅ Добавляем поддержку фото
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
        photoUrl: newUser.photoUrl || null // ✅ Возвращаем URL фото
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
    console.log('🔄 PUT /api/admin/users - начало обновления');
    
    const sessionId = request.cookies.get('session_id')?.value || 
                     request.cookies.get('session_id_debug')?.value;
    
    if (!sessionId) {
      console.log('❌ Нет session ID');
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const session = getSession(sessionId);
    if (!session) {
      console.log('❌ Сессия недействительна');
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
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
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    if (!canManageUser(session.user.role, targetUser.role)) {
      console.log('❌ Недостаточно прав для управления пользователем');
      return NextResponse.json({ 
        error: 'У вас нет прав для управления этим пользователем' 
      }, { status: 403 });
    }

    // Проверяем роль, если она обновляется
    if (updates.role) {
      console.log('🔍 Проверяем новую роль:', updates.role);
      
      if (!isValidRole(updates.role)) {
        console.log('❌ Недопустимая роль:', updates.role);
        return NextResponse.json({ 
          error: `Недопустимая роль: ${updates.role}` 
        }, { status: 400 });
      }

      if (!canCreateRole(session.user.role, updates.role)) {
        console.log('❌ Недостаточно прав для назначения роли');
        return NextResponse.json({ 
          error: `У вас нет прав для назначения роли: ${updates.role}` 
        }, { status: 403 });
      }
    }

    // Валидация URL фото (если обновляется)
    if (updates.photoUrl !== undefined) {
      console.log('🖼️ Обновляем фото:', updates.photoUrl ? 'новое фото' : 'удаляем фото');
      
      if (updates.photoUrl && !updates.photoUrl.includes('cloudinary.com') && !updates.photoUrl.startsWith('http')) {
        console.log('❌ Недопустимый URL фото');
        return NextResponse.json({ 
          error: 'Недопустимый URL фотографии' 
        }, { status: 400 });
      }
    }

    console.log('✅ Все проверки пройдены, обновляем пользователя...');

    const updatedUser: User | null = await updateUser(id, updates, session.user.email);

    if (!updatedUser) {
      console.log('❌ Не удалось обновить пользователя');
      return NextResponse.json({ error: 'Не удалось обновить пользователя' }, { status: 400 });
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
        lastLogin: updatedUser.lastLogin || null
      }
    });

  } catch (error) {
    console.error('💥 Ошибка обновления пользователя:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Ошибка обновления пользователя' 
    }, { status: 400 });
  }
}

// Удалить пользователя
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ DELETE /api/admin/users - начало удаления');
    
    const sessionId = request.cookies.get('session_id')?.value || 
                     request.cookies.get('session_id_debug')?.value;
    
    if (!sessionId) {
      console.log('❌ Нет session ID');
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const session = getSession(sessionId);
    if (!session) {
      console.log('❌ Сессия недействительна');
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    const { id } = await request.json();
    console.log('🎯 Удаляем пользователя с ID:', id);
    
    const targetUser: User | null = await findUserById(id);
    if (!targetUser) {
      console.log('❌ Пользователь не найден:', id);
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    console.log('👤 Найден пользователь для удаления:', targetUser.name, targetUser.email);

    if (!canManageUser(session.user.role, targetUser.role)) {
      console.log('❌ Недостаточно прав для удаления пользователя');
      return NextResponse.json({ 
        error: 'У вас нет прав для удаления этого пользователя' 
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
        message: 'Пользователь удален успешно'
      });
    } else {
      console.log('❌ Не удалось удалить пользователя');
      return NextResponse.json({ error: 'Не удалось удалить пользователя' }, { status: 400 });
    }

  } catch (error) {
    console.error('💥 Ошибка удаления пользователя:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Ошибка удаления пользователя' 
    }, { status: 400 });
  }
}

