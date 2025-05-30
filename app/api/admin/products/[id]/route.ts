// app/api/products/[id]/route.ts (исправленная версия)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;
    
    console.log("🔄 API: Обновление продукта:", id, body);

    // Используем строку вместо api.products.update
    const result = await convex.mutation("products:update", {
      id: id,
      name: body.name,
      description: body.description,
      category: body.category,
      price: body.price,
      inStock: body.inStock,
      isPopular: body.isPopular || false,
      nutrition: body.nutrition
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log("🔄 API: Удаление продукта:", id);

    // Используем строку вместо api.products.remove
    const result = await convex.mutation("products:remove", {
      id: id
    });

    console.log("✅ API: Продукт удален:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Продукт успешно удален'
    });
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
