// app/api/upload/route.ts (обновленная версия с Cloudinary и детальным логированием)
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('📁 POST /api/upload - начало загрузки файла');

    // Проверяем авторизацию
    const sessionId = request.cookies.get('session_id')?.value;
    console.log('🍪 Session ID найден:', !!sessionId);

    if (!sessionId) {
      console.log('❌ Нет session ID');
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const sessionData = getSession(sessionId);
    console.log('👤 Session data найдена:', !!sessionData);

    if (!sessionData) {
      console.log('❌ Сессия недействительна');
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    // Проверяем права доступа
    console.log('🔐 Роль пользователя:', sessionData.user.role);
    if (!['super-admin', 'admin', 'manager'].includes(sessionData.user.role)) {
      console.log('❌ Недостаточно прав');
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    console.log('✅ Авторизация пройдена, обрабатываем файл...');

    // Получаем данные формы
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'profile';
    const uploadTo = formData.get('uploadTo') as string || 'local';

    console.log('📋 Параметры загрузки:', {
      hasFile: !!file,
      type,
      uploadTo
    });

    if (!file) {
      console.log('❌ Файл не найден в FormData');
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    console.log('📄 Информация о файле:', {
      name: file.name,
      size: file.size,
      type: file.type,
      uploadTo
    });

    // Проверяем тип файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Неподдерживаемый тип файла:', file.type);
      return NextResponse.json({
        error: 'Неподдерживаемый тип файла. Разрешены: JPEG, PNG, WebP'
      }, { status: 400 });
    }

    // Проверяем размер файла (максимум 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log('❌ Файл слишком большой:', file.size);
      return NextResponse.json({
        error: 'Файл слишком большой. Максимальный размер: 5MB'
      }, { status: 400 });
    }

    // Если загружаем в Cloudinary
    if (uploadTo === 'cloudinary') {
      console.log('☁️ Загружаем в Cloudinary...');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      console.log('🌐 Cloud Name:', cloudName);

      if (!cloudName) {
        console.log('❌ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME не установлен');
        return NextResponse.json({
          error: 'Cloudinary не настроен. Проверьте переменные окружения.'
        }, { status: 500 });
      }

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', file);

      const uploadPreset = 'ml_default';
      cloudinaryFormData.append('upload_preset', uploadPreset);
      cloudinaryFormData.append('folder', `user-${type}`);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      console.log('📤 URL Cloudinary:', cloudinaryUrl);
      console.log('📤 Upload preset:', uploadPreset);
      console.log('📤 Folder: user-' + type);

      try {
        console.log('📡 Отправляем запрос в Cloudinary...');

        const cloudinaryResponse = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: cloudinaryFormData,
        });

        console.log('📡 Ответ от Cloudinary:', {
          status: cloudinaryResponse.status,
          statusText: cloudinaryResponse.statusText,
          ok: cloudinaryResponse.ok
        });

        const responseText = await cloudinaryResponse.text();
        console.log('📄 Текст ответа от Cloudinary:', responseText);

        if (!cloudinaryResponse.ok) {
          console.error('❌ Ошибка от Cloudinary:', {
            status: cloudinaryResponse.status,
            statusText: cloudinaryResponse.statusText,
            response: responseText
          });

          return NextResponse.json({
            error: 'Ошибка загрузки в Cloudinary',
            details: `${cloudinaryResponse.status}: ${responseText}`,
            cloudinaryUrl,
            cloudName
          }, { status: 500 });
        }

        let cloudinaryData;
        try {
          cloudinaryData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ Ошибка парсинга ответа от Cloudinary:', parseError);
          return NextResponse.json({
            error: 'Ошибка обработки ответа от Cloudinary',
            details: responseText
          }, { status: 500 });
        }

        console.log('✅ Файл успешно загружен в Cloudinary:', {
          url: cloudinaryData.secure_url,
          publicId: cloudinaryData.public_id
        });

        return NextResponse.json({
          success: true,
          message: 'Файл успешно загружен в Cloudinary',
          url: cloudinaryData.secure_url,
          data: {
            fileName: cloudinaryData.public_id,
            originalName: file.name,
            size: file.size,
            type: file.type,
            url: cloudinaryData.secure_url,
            uploadedAt: new Date().toISOString(),
            uploadedBy: sessionData.user.name,
            cloudinaryData: {
              publicId: cloudinaryData.public_id,
              width: cloudinaryData.width,
              height: cloudinaryData.height,
              format: cloudinaryData.format,
              bytes: cloudinaryData.bytes
            }
          }
        });

      } catch (cloudinaryError) {
        console.error('❌ Исключение при запросе к Cloudinary:', cloudinaryError);
        return NextResponse.json({
          error: 'Ошибка соединения с Cloudinary',
          details: cloudinaryError instanceof Error ? cloudinaryError.message : 'Неизвестная ошибка'
        }, { status: 500 });
      }
    }

    // Локальная загрузка (твой существующий код)
    console.log('💾 Загружаем локально...');

    // Создаем уникальное имя файла
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${type}_${timestamp}_${randomString}.${fileExtension}`;

    // Определяем путь для сохранения
    const uploadDir = join(process.cwd(), 'public', 'uploads', type);
    const filePath = join(uploadDir, fileName);

    console.log('📁 Путь сохранения:', filePath);

    // Создаем директорию если не существует
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
      console.log('📁 Создана директория:', uploadDir);
    }

    // Сохраняем файл
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);
    console.log('✅ Файл сохранен локально:', fileName);

    // Формируем URL для доступа к файлу
    const fileUrl = `/uploads/${type}/${fileName}`;

    return NextResponse.json({
      success: true,
      message: 'Файл успешно загружен локально',
      url: fileUrl,
      data: {
        fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: sessionData.user.name
      }
    });

  } catch (error) {
    console.error('❌ Общая ошибка загрузки файла:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка загрузки файла',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}
