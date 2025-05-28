// app/admin/products/page.tsx (обновленная версия с табами)
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, Plus, BarChart3, Zap } from "lucide-react";

// Импорт компонентов
import { ProductStats } from "@/components/admin/products/ProductStats";
import { ProductFilters } from "@/components/admin/products/ProductFilters";
import { ProductGrid } from "@/components/admin/products/ProductGrid";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { ProductQuickActions } from "@/components/admin/products/ProductQuickActions";
import { Product, ProductFormData } from "@/components/admin/products/types";
import { useRouter } from 'next/navigation';

export default function ProductsManagementPage() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Product['category'] | 'all'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [popularFilter, setPopularFilter] = useState<'all' | 'popular' | 'regular'>('all');

  const router = useRouter()

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      } else {
        alert('Ошибка загрузки продуктов: ' + data.error);
      }
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error);
      alert('Ошибка загрузки продуктов');
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      const matchesStock = stockFilter === 'all' || 
        (stockFilter === 'in-stock' && product.inStock > 10) ||
        (stockFilter === 'low-stock' && product.inStock > 0 && product.inStock <= 10) ||
        (stockFilter === 'out-of-stock' && product.inStock === 0);

      const matchesPopular = popularFilter === 'all' ||
        (popularFilter === 'popular' && product.isPopular) ||
        (popularFilter === 'regular' && !product.isPopular);

      return matchesSearch && matchesCategory && matchesStock && matchesPopular;
    });
  }, [products, searchTerm, categoryFilter, stockFilter, popularFilter]);

  // Handlers
  const handleCreateProduct = async (formData: ProductFormData) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Продукт создан успешно!');
        loadProducts();
        setShowCreateForm(false);
      } else {
        alert('Ошибка создания продукта: ' + data.error);
      }
    } catch (error) {
      console.error('Ошибка создания продукта:', error);
      alert('Ошибка создания продукта');
    }
  };

  const handleUpdateProduct = async (formData: ProductFormData) => {
    if (!editingProduct) return;

    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: editingProduct._id, ...formData })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Продукт обновлен успешно!');
        loadProducts();
        setEditingProduct(null);
      } else {
        alert('Ошибка обновления продукта: ' + data.error);
      }
    } catch (error) {
      console.error('Ошибка обновления продукта:', error);
      alert('Ошибка обновления продукта');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить продукт "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Продукт удален успешно!');
        loadProducts();
      } else {
        alert('Ошибка удаления продукта: ' + data.error);
      }
    } catch (error) {
      console.error('Ошибка удаления продукта:', error);
            alert('Ошибка удаления продукта');
    }
  };

  const handleBulkAction = async (action: string, productIds: string[]) => {
    switch (action) {
      case 'restock':
        // Пополнение склада - можно открыть модальное окно для ввода количества
        alert(`Пополнение склада для ${productIds.length} товаров`);
        break;
      case 'mark-popular':
        // Массовое обновление популярности
        for (const id of productIds) {
          await fetch('/api/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: id, isPopular: true })
          });
        }
        alert(`${productIds.length} товаров отмечено как популярные`);
        loadProducts();
        break;
      case 'export':
        // Экспорт в CSV
        const csvData = products.map(product => ({
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.inStock,
          popular: product.isPopular ? 'Да' : 'Нет'
        }));
        
        const csv = [
          ['Название', 'Категория', 'Цена', 'Остаток', 'Популярный'],
          ...csvData.map(row => Object.values(row))
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products.csv';
        a.click();
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка продуктов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Управление продуктами</h1>
                  <p className="text-sm text-gray-600">Создание и управление товарами</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить продукт
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8">
          <ProductStats products={products} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Продукты
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Действия
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <ProductFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              stockFilter={stockFilter}
              onStockFilterChange={setStockFilter}
              popularFilter={popularFilter}
              onPopularFilterChange={setPopularFilter}
              totalProducts={products.length}
              filteredProducts={filteredProducts.length}
            />

            <ProductGrid
              products={filteredProducts}
              onEdit={setEditingProduct}
              onDelete={handleDeleteProduct}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Распределение по категориям</h3>
                <div className="space-y-3">
                  {['supplements', 'drinks', 'snacks', 'merchandise'].map(category => {
                    const count = products.filter(p => p.category === category).length;
                    const percentage = products.length > 0 ? (count / products.length) * 100 : 0;
                    const categoryNames = {
                      supplements: 'Добавки',
                      drinks: 'Напитки', 
                      snacks: 'Снеки',
                      merchandise: 'Мерч'
                    };
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {categoryNames[category as keyof typeof categoryNames]}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stock Status */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Статус остатков</h3>
                <div className="space-y-3">
                  {[
                    { label: 'В наличии', filter: (p: Product) => p.inStock > 10, color: 'bg-green-600' },
                    { label: 'Заканчивается', filter: (p: Product) => p.inStock > 0 && p.inStock <= 10, color: 'bg-yellow-600' },
                    { label: 'Нет в наличии', filter: (p: Product) => p.inStock === 0, color: 'bg-red-600' }
                  ].map(status => {
                    const count = products.filter(status.filter).length;
                    const percentage = products.length > 0 ? (count / products.length) * 100 : 0;
                    
                    return (
                      <div key={status.label} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{status.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${status.color} h-2 rounded-full`} 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Ценовые диапазоны</h3>
                <div className="space-y-3">
                  {[
                    { label: 'До 100₽', filter: (p: Product) => p.price < 100 },
                    { label: '100-500₽', filter: (p: Product) => p.price >= 100 && p.price < 500 },
                    { label: '500-1000₽', filter: (p: Product) => p.price >= 500 && p.price < 1000 },
                    { label: 'Свыше 1000₽', filter: (p: Product) => p.price >= 1000 }
                  ].map(range => {
                    const count = products.filter(range.filter).length;
                    const percentage = products.length > 0 ? (count / products.length) * 100 : 0;
                    
                    return (
                      <div key={range.label} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{range.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Топ продукты по стоимости</h3>
                <div className="space-y-3">
                  {products
                    .sort((a, b) => (b.price * b.inStock) - (a.price * a.inStock))
                    .slice(0, 5)
                    .map((product, index) => (
                      <div key={product._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                          <span className="text-sm font-medium truncate">{product.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {(product.price * product.inStock).toLocaleString()}₽
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <ProductQuickActions
              products={products}
              onBulkAction={handleBulkAction}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Product Form */}
      <ProductForm
        product={null}
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateProduct}
      />

      {/* Edit Product Form */}
      <ProductForm
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSubmit={handleUpdateProduct}
      />
    </div>
  );
}

