// app/api/admin/users/[id]/route.ts (исправленная версия для Next.js 15)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { getSession } from '@/lib/simple-auth';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🎯 PUT /api/admin/users/[id] - НАЧАЛО обработки');
  
  try {
    // Ожидаем разрешения Promise для получения параметров
    const { id } = await params;
    console.log('📍 ID пользователя для обновления:', id);
    
    // Проверяем все куки
    const allCookies = request.cookies.getAll();
    console.log('🍪 Все куки в PUT запросе:', allCookies);
    
    const sessionId = request.cookies.get('session_id')?.value;
    console.log('🔑 Session ID в PUT запросе:', sessionId ? `найден: ${sessionId.substring(0, 20)}...` : 'НЕ НАЙДЕН');
    
    if (!sessionId) {
      console.log('❌ PUT: Session ID отсутствует, возвращаем 401');
      return NextResponse.json({ 
        success: false, 
        error: 'Не авторизован - сессия отсутствует' 
      }, { status: 401 });
    }

    console.log('🔧 PUT: Проверяем сессию через getSession...');
    const sessionData = getSession(sessionId);
    
    if (!sessionData) {
      console.log('❌ PUT: Сессия не найдена или истекла - возвращаем 401');
      return NextResponse.json({ 
        success: false, 
        error: 'Не авторизован - сессия недействительна' 
      }, { status: 401 });
    }

    console.log('✅ PUT: Сессия валидна, данные пользователя:', {
      userId: sessionData.user.id,
      name: sessionData.user.name,
      role: sessionData.user.role,
      email: sessionData.user.email
    });
    
    if (!['super-admin', 'admin', 'manager'].includes(sessionData.user.role)) {
      console.log('❌ PUT: Недостаточно прав, роль:', sessionData.user.role);
      return NextResponse.json({ 
        success: false, 
        error: `Недостаточно прав (роль: ${sessionData.user.role})` 
      }, { status: 403 });
    }

    console.log('✅ PUT: Авторизация пройдена, продолжаем обработку');
    
    const body = await request.json();
    console.log('📄 PUT: Данные для обновления:', body);
    const { name, email, role, isActive, photoUrl, password } = body;

    // Получаем текущего пользователя из Convex (используем строковые названия)
    console.log('🔍 PUT: Получаем данные пользователя из Convex...');
    const currentUser = await convex.query("users:getUserById", { 
      userId: id as any 
    });

    if (!currentUser) {
      console.log('❌ PUT: Пользователь не найден в Convex');
      return NextResponse.json({ 
        success: false, 
        error: 'Пользователь не найден' 
      }, { status: 404 });
    }

    console.log('👤 PUT: Данные обновляемого пользователя:', {
      id: currentUser._id,
      name: currentUser.name,
      role: currentUser.role,
      email: currentUser.email
    });

    // Проверяем права на изменение роли
    if (role && role !== currentUser.role) {
      console.log('🔄 PUT: Попытка изменить роль с', currentUser.role, 'на', role);
      
      if (currentUser.role === 'super-admin') {
        console.log('❌ PUT: Попытка изменить роль супер-админа');
        return NextResponse.json({ 
          success: false,
          error: 'Нельзя изменить роль супер-админа' 
        }, { status: 403 });
      }

      if (role === 'admin' && sessionData.user.role !== 'super-admin') {
        console.log('❌ PUT: Попытка назначить админа не супер-админом');
        return NextResponse.json({ 
          success: false,
          error: 'Только супер-админ может назначать админов' 
        }, { status: 403 });
      }

      if (role === 'super-admin') {
        console.log('❌ PUT: Попытка назначить супер-админа');
        return NextResponse.json({ 
          success: false,
          error: 'Нельзя назначить роль супер-админа' 
        }, { status: 403 });
      }
    }

    // Нельзя деактивировать самого себя
    if (id === sessionData.user.id && isActive === false) {
      console.log('❌ PUT: Попытка деактивировать самого себя');
      return NextResponse.json({ 
        success: false,
        error: 'Нельзя деактивировать самого себя' 
      }, { status: 403 });
    }

    // Подготавливаем обновления
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    if (photoUrl !== undefined) updates.photoUrl = photoUrl;
    if (password !== undefined && password.trim()) updates.password = password;

    console.log('📝 PUT: Обновления для применения:', updates);

    // Обновляем пользователя через Convex (используем строковые названия)
    console.log('💾 PUT: Обновляем пользователя через Convex...');
    const updatedUser = await convex.mutation("users:updateUser", {
      userId: id as any,
      updates
    });

    console.log('✅ PUT: Пользователь успешно обновлен в Convex');

    return NextResponse.json({
      success: true,
      message: 'Пользователь обновлен успешно',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ PUT: КРИТИЧЕСКАЯ ошибка:', error);
    console.error('❌ PUT: Стек ошибки:', error instanceof Error ? error.stack : 'Нет стека');
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Внутренняя ошибка сервера' 
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ожидаем разрешения Promise для получения параметров
    const { id } = await params;
    console.log('🔍 GET /api/admin/users/[id] - получение пользователя:', id);
    
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const sessionData = getSession(sessionId);
    if (!sessionData) {
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }
    
    if (!['super-admin', 'admin', 'manager'].includes(sessionData.user.role)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const user = await convex.query("users:getUserById", { 
      userId: id as any 
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    console.log('✅ GET: Пользователь найден:', user.name);

    // Убираем пароль из ответа
    const { password, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      user: safeUser
    });

  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка получения пользователя' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ожидаем разрешения Promise для получения параметров
    const { id } = await params;
    console.log('🗑️ DELETE /api/admin/users/[id] - удаление пользователя:', id);
    
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const sessionData = getSession(sessionId);
    if (!sessionData) {
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }
    
    if (!['super-admin', 'admin'].includes(sessionData.user.role)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const user = await convex.query("users:getUserById", { 
      userId: id as any 
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    if (user.role === 'super-admin') {
      return NextResponse.json({ 
        error: 'Нельзя удалить супер-админа' 
      }, { status: 403 });
    }

    if (id === sessionData.user.id) {
      return NextResponse.json({ 
        error: 'Нельзя удалить самого себя' 
      }, { status: 403 });
    }

    await convex.mutation("users:deleteUser", {
      id: id as any
    });

    console.log('✅ DELETE: Пользователь удален:', user.name);

    return NextResponse.json({
      success: true,
      message: 'Пользователь удален успешно'
    });

  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления пользователя' },
      { status: 500 }
    );
  }
}
