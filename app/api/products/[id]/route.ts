import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log("🔄 API PUT: Обновление продукта:", id);
    console.log("📦 API PUT: Данные для обновления:", body);

    const { _id, createdAt, ...updateData } = body;

    // ✅ Выполняем обновление и получаем результат сразу
    const updatedProduct = await convex.mutation("products:update", {
      id,
      ...updateData,
      updatedAt: Date.now()
    });

    console.log("✅ API PUT: Результат мутации:", updatedProduct);

    // ✅ Если мутация вернула обновленный продукт, используем его
    if (updatedProduct) {
      const response = NextResponse.json({ 
        success: true, 
        data: updatedProduct,
        message: 'Продукт успешно обновлен',
        timestamp: Date.now()
      });

      // Добавляем заголовки для принудительного обновления
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      response.headers.set('ETag', `"${Date.now()}"`); // Уникальный ETag
      
      return response;
    }

    // ✅ Если мутация не вернула продукт, получаем его отдельно
    const freshProduct = await convex.query("products:getById", { id });
    
    const response = NextResponse.json({ 
      success: true, 
      data: freshProduct,
      message: 'Продукт успешно обновлен',
      timestamp: Date.now()
    });

    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('ETag', `"${Date.now()}"`);
    
    return response;
    
  } catch (error) {
    console.error("❌ API PUT: Ошибка обновления продукта:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка обновления продукта'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("🔄 API POST: Перенаправление на PUT логику");
  return PUT(request, { params });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("🔄 API PATCH: Перенаправление на PUT логику");
  return PUT(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const deleteType = searchParams.get('type') || 'soft';
    
    console.log(`🔄 API DELETE: ${deleteType === 'hard' ? 'Физическое' : 'Мягкое'} удаление продукта:`, id);

    if (deleteType === 'hard') {
      const result = await convex.mutation("products:hardDelete", { id });
      
      console.log("✅ API DELETE: Продукт физически удален:", result);
      
      const response = NextResponse.json({ 
        success: true, 
        message: 'Продукт навсегда удален из базы данных',
        data: result,
        timestamp: Date.now()
      });
      
      // Заголовки для предотвращения кэширования
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return response;
    } else {
      const result = await convex.mutation("products:softDelete", { id });

      console.log("✅ API DELETE: Продукт мягко удален:", result);
      
      const response = NextResponse.json({ 
        success: true, 
        message: 'Продукт деактивирован',
        data: result,
        timestamp: Date.now()
      });
      
      // Заголовки для предотвращения кэширования
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return response;
    }
  } catch (error) {
    console.error("❌ API DELETE: Ошибка удаления продукта:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка удаления продукта' 
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
    const { id } = await params;
    
    console.log("🔄 API GET: Получение продукта:", id);

    const result = await convex.query("products:getById", { id });

    if (!result) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Продукт не найден' 
        },
        { status: 404 }
      );
    }

    console.log("✅ API GET: Продукт получен:", result);
    
    const response = NextResponse.json({ 
      success: true, 
      data: result,
      timestamp: Date.now()
    });
    
    // Заголовки для предотвращения кэширования
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return response;
  } catch (error) {
    console.error("❌ API GET: Ошибка получения продукта:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения продукта' 
      },
      { status: 500 }
    );
  }
}

// Добавляем OPTIONS для CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
