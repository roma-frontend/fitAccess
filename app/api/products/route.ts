// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Временные данные товаров для тестирования
let mockProducts = [
  {
    _id: '1',
    name: 'Протеиновый коктейль',
    description: 'Высококачественный сывороточный протеин для роста мышц',
    category: 'supplements',
    price: 150,
    inStock: 25,
    isPopular: true,
    nutrition: {
      calories: 120,
      protein: 25,
      carbs: 3,
      fat: 1,
    },
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    _id: '2',
    name: 'Энергетический напиток',
    description: 'Натуральный энергетик с витаминами',
    category: 'drinks',
    price: 80,
    inStock: 50,
    isPopular: true,
    nutrition: {
      calories: 45,
      carbs: 11,
      sugar: 10,
    },
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 172800000,
  },
  {
    _id: '3',
    name: 'Протеиновый батончик',
    description: 'Вкусный батончик с высоким содержанием белка',
    category: 'snacks',
    price: 120,
    inStock: 30,
    nutrition: {
      calories: 200,
      protein: 20,
      carbs: 15,
      fat: 8,
    },
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 259200000,
  },
  {
    _id: '4',
    name: 'Футболка FitAccess',
    description: 'Стильная футболка из дышащего материала',
    category: 'merchandise',
    price: 1200,
    inStock: 15,
    createdAt: Date.now() - 345600000,
    updatedAt: Date.now() - 345600000,
  },
  {
    _id: '5',
    name: 'Изотонический напиток',
    description: 'Восстанавливает водно-солевой баланс',
    category: 'drinks',
    price: 60,
    inStock: 40,
    nutrition: {
      calories: 25,
      carbs: 6,
    },
    createdAt: Date.now() - 432000000,
    updatedAt: Date.now() - 432000000,
  },
  {
    _id: '6',
    name: 'BCAA комплекс',
    description: 'Незаменимые аминокислоты для восстановления',
    category: 'supplements',
    price: 200,
    inStock: 20,
    isPopular: true,
    createdAt: Date.now() - 518400000,
    updatedAt: Date.now() - 518400000,
  },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      products: mockProducts,
    });
  } catch (error) {
    console.error('Ошибка получения товаров:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка загрузки товаров',
        products: [] 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Создаем новый продукт
    const newProduct = {
      _id: Date.now().toString(),
      ...body,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockProducts.push(newProduct);

    return NextResponse.json({
      success: true,
      product: newProduct
    });

  } catch (error) {
    console.error('Ошибка создания продукта:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка создания продукта' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { _id, ...updates } = body;

    const productIndex = mockProducts.findIndex(p => p._id === _id);
    
    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Продукт не найден' },
        { status: 404 }
      );
    }

    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...updates,
      updatedAt: Date.now(),
    };

    return NextResponse.json({
      success: true,
      product: mockProducts[productIndex]
    });

  } catch (error) {
    console.error('Ошибка обновления продукта:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления продукта' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { _id } = body;

    const productIndex = mockProducts.findIndex(p => p._id === _id);
    
    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Продукт не найден' },
        { status: 404 }
      );
    }

    mockProducts.splice(productIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Продукт удален успешно'
    });

  } catch (error) {
    console.error('Ошибка удаления продукта:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка удаления продукта' },
      { status: 500 }
    );
  }
}
