// app/admin/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, Plus, BarChart3, Zap, Activity, Archive, Trash2 } from "lucide-react";
import { ProductGrid } from "@/components/admin/products/ProductGrid";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { ProductFilters } from "@/components/admin/products/ProductFilters";
import { DeletedProductsTab } from "@/components/admin/products/DeletedProductsTab";
import { ProductAnalytics } from "@/components/admin/products/ProductAnalytics";
import { ProductQuickActions } from "@/components/admin/products/ProductQuickActions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useProducts, useProductManagement, Product, ProductFormData } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";

export default function ProductsPage() {
  const router = useRouter();
  const { products, isLoading, error, refetch } = useProducts();
  const { createProduct, updateProduct, deleteProduct } = useProductManagement();
  const { toast } = useToast();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"supplements" | "drinks" | "snacks" | "merchandise" | "all">("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "low-stock" | "out-of-stock">("all");
  const [popularFilter, setPopularFilter] = useState<"popular" | "all" | "regular">("all");
  const [formLoading, setFormLoading] = useState(false);

  // Состояние для диалога подтверждения удаления
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    productId: string;
    productName: string;
    deleteType: 'soft' | 'hard';
  }>({
    open: false,
    productId: '',
    productName: '',
    deleteType: 'soft'
  });

  // Фильтрация продуктов
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStock = stockFilter === "all" ||
      (stockFilter === "in-stock" && product.inStock > 10) ||
      (stockFilter === "low-stock" && product.inStock > 0 && product.inStock <= 10) ||
      (stockFilter === "out-of-stock" && product.inStock === 0);
    const matchesPopular = popularFilter === "all" ||
      (popularFilter === "popular" && product.isPopular) ||
      (popularFilter === "regular" && !product.isPopular);

    return matchesSearch && matchesCategory && matchesStock && matchesPopular;
  });

  const productsCount = products.length;

  // Обработчики
  const handleCreateProduct = async (data: ProductFormData) => {
    console.log("🔄 Создание продукта:", data);

    setFormLoading(true);
    
    toast({
      title: "Создание продукта...",
      description: "Пожалуйста, подождите",
    });

    try {
      const success = await createProduct(data);

      if (success) {
        toast({
          title: "Продукт успешно создан!",
          description: `${data.name} добавлен в каталог`,
          variant: "default",
        });
        setShowCreateForm(false);
        if (refetch) {
          await refetch();
        }
      } else {
        toast({
          title: "Ошибка создания продукта",
          description: "Попробуйте еще раз или обратитесь к администратору",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка создания продукта",
        description: "Произошла неожиданная ошибка",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!editingProduct) return;

    console.log("🔄 Обновление продукта:", editingProduct._id, data);

    setFormLoading(true);
    
    toast({
      title: "Обновление продукта...",
      description: "Пожалуйста, подождите",
    });

    try {
      const success = await updateProduct(editingProduct._id, data);

      if (success) {
        toast({
          title: "Продукт успешно обновлен!",
          description: `${data.name} был изменен`,
          variant: "default",
        });
        setEditingProduct(null);
        if (refetch) {
          await refetch();
        }
      } else {
        toast({
          title: "Ошибка обновления продукта",
          description: "Попробуйте еще раз или обратитесь к администратору",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка обновления продукта",
        description: "Произошла неожиданная ошибка",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Открываем диалог подтверждения удаления
  const handleDeleteProduct = async (id: string, name: string, deleteType: 'soft' | 'hard' = 'soft') => {
    console.log(`🔄 handleDeleteProduct вызвана:`, { id, name, deleteType });

    setDeleteDialog({
      open: true,
      productId: id,
      productName: name,
      deleteType
    });
  };

  // Подтверждение удаления
  const confirmDelete = async () => {
    const { productId: id, productName: name, deleteType } = deleteDialog;
    
    console.log(`🗑️ ${deleteType === 'hard' ? 'Физическое' : 'Мягкое'} удаление продукта:`, id, name);

    // Закрываем диалог
    setDeleteDialog({ open: false, productId: '', productName: '', deleteType: 'soft' });

    toast({
      title: deleteType === 'hard' ? "Удаление продукта..." : "Деактивация продукта...",
      description: "Пожалуйста, подождите",
    });

    try {
      const success = await deleteProduct(id, deleteType);
      console.log(`🔄 Результат удаления:`, success);

      if (success) {
        if (deleteType === 'hard') {
          toast({
            title: "Продукт удален навсегда",
            description: `${name} полностью удален из базы данных`,
            variant: "default",
          });
        } else {
          toast({
            title: "Продукт деактивирован",
            description: `${name} скрыт из каталога`,
            variant: "default",
          });
        }

        if (refetch) {
          console.log("🔄 Обновляем список продуктов");
          await refetch();
        }
      } else {
        toast({
          title: "Ошибка удаления продукта",
          description: "Попробуйте еще раз или обратитесь к администратору",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Ошибка в handleDeleteProduct:", error);
      toast({
        title: "Ошибка удаления продукта",
        description: "Произошла неожиданная ошибка",
        variant: "destructive",
      });
    }
  };

  // Отмена удаления
  const cancelDelete = () => {
    console.log("❌ Пользователь отменил удаление");
  };

  // Показать ошибку загрузки как toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Ошибка загрузки продуктов",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Управление продуктами</h1>
              <p className="text-gray-600">Создавайте, редактируйте и управляйте продуктами</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowCreateForm(true)}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить продукт
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Всего продуктов</p>
                  <p className="text-2xl font-bold text-gray-900">{productsCount}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Отфильтровано</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredProducts.length}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Популярные</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.isPopular).length}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Заканчиваются</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.inStock > 0 && p.inStock <= 10).length}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Активные ({filteredProducts.length})
            </TabsTrigger>
            <TabsTrigger value="deleted" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Удаленные
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
              totalProducts={productsCount}
              filteredProducts={filteredProducts.length}
            />

            <ProductGrid
              products={filteredProducts}
              onEdit={setEditingProduct}
              onDelete={handleDeleteProduct}
              isLoading={isLoading}
            />
          </TabsContent>

          {/* Deleted Products Tab */}
          <TabsContent value="deleted" className="space-y-6">
            <DeletedProductsTab />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <ProductAnalytics products={products} />
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <ProductQuickActions products={products} onRefresh={refetch} />
          </TabsContent>
        </Tabs>

        {/* Модальные окна */}
        {showCreateForm && (
          <ProductForm
            isOpen={showCreateForm}
            onClose={() => setShowCreateForm(false)}
            onSubmit={handleCreateProduct}
            isLoading={formLoading}
          />
        )}

        {editingProduct && (
          <ProductForm
            product={editingProduct}
            isOpen={!!editingProduct}
            onClose={() => setEditingProduct(null)}
            onSubmit={handleUpdateProduct}
            isLoading={formLoading}
          />
        )}

        {/* Диалог подтверждения удаления */}
        <ConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteDialog({ open: false, productId: '', productName: '', deleteType: 'soft' });
            }
          }}
          title={deleteDialog.deleteType === 'hard' ? 'Удалить навсегда?' : 'Деактивировать продукт?'}
          description={
            deleteDialog.deleteType === 'hard'
              ? `Вы уверены, что хотите навсегда удалить продукт "${deleteDialog.productName}"?`
              : `Деактивировать продукт "${deleteDialog.productName}"?`
          }
          confirmText={
            deleteDialog.deleteType === 'hard' ? 'Удалить навсегда' : 'Деактивировать'
          }
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          variant={deleteDialog.deleteType === 'hard' ? 'destructive' : 'warning'}
          icon={
            deleteDialog.deleteType === 'hard' 
              ? <Trash2 className="h-5 w-5 text-red-600" />
              : <Archive className="h-5 w-5 text-yellow-600" />
          }
        />
      </div>
    </div>
  );
}

