// app/api/shop/products/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("🔄 SHOP API GET: Начало обработки");
    
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL не установлен");
    }
    
    console.log("🔗 SHOP API GET: Convex URL:", process.env.NEXT_PUBLIC_CONVEX_URL);
    
    const { ConvexHttpClient } = await import("convex/browser");
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    
    console.log("📞 SHOP API GET: Вызываем Convex query");
    const products = await convex.query("products:getAll");
    
    console.log("✅ SHOP API GET: Получено продуктов:", products?.length || 0);
    
    return NextResponse.json({ 
      success: true, 
      data: products || [],
      count: products?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ SHOP API GET: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения продуктов',
        data: []
      },
      { status: 500 }
    );
  }
}
