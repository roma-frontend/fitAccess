// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ожидаем разрешения Promise для получения параметров
    const { id } = await params;
    const body = await request.json();
    
    console.log("🔄 API: Обновление продукта:", id, body);

    const result = await convex.mutation("products:update", {
      id,
      ...body,
      updatedAt: Date.now()
    });

    console.log("✅ API: Продукт обновлен:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Продукт успешно обновлен'
    });
  } catch (error) {
    console.error("❌ API: Ошибка обновления продукта:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка обновления продукта' 
      },
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
    const { searchParams } = new URL(request.url);
    const deleteType = searchParams.get('type') || 'soft';
    
    console.log(`🔄 API: ${deleteType === 'hard' ? 'Физическое' : 'Мягкое'} удаление продукта:`, id);

    if (deleteType === 'hard') {
      const result = await convex.mutation("products:hardDelete", {
        id
      });
      
      console.log("✅ API: Продукт физически удален:", result);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Продукт навсегда удален из базы данных',
        data: result 
      });
    } else {
      const result = await convex.mutation("products:softDelete", {
        id
      });

      console.log("✅ API: Продукт мягко удален:", result);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Продукт деактивирован',
        data: result 
      });
    }
  } catch (error) {
    console.error("❌ API: Ошибка удаления продукта:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка удаления продукта' 
      },
      { status: 500 }
    );
  }
}

// Опционально: добавьте GET метод для получения конкретного продукта
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log("🔄 API: Получение продукта:", id);

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

    console.log("✅ API: Продукт получен:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error("❌ API: Ошибка получения продукта:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения продукта' 
      },
      { status: 500 }
    );
  }
}
