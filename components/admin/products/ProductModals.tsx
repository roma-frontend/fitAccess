// components/admin/products/ProductModals.tsx
import React, { memo } from 'react';
import { ProductForm } from './ProductForm';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Archive, Trash2 } from 'lucide-react';
import { Product, ProductFormData } from '@/hooks/useProducts';

interface DeleteDialogState {
  open: boolean;
  productId: string;
  productName: string;
  deleteType: 'soft' | 'hard';
}

interface ProductModalsProps {
  showCreateForm: boolean;
  editingProduct: Product | null;
  deleteDialog: DeleteDialogState;
  formLoading: boolean;
  onCloseCreateForm: () => void;
  onCloseEditForm: () => void;
  onCloseDeleteDialog: () => void;
  onCreateProduct: (data: ProductFormData) => Promise<void>;
  onUpdateProduct: (data: ProductFormData, product: Product | null) => Promise<void>;
  onConfirmDelete: (id: string, name: string, deleteType: 'soft' | 'hard') => Promise<void>;
}

export const ProductModals = memo(function ProductModals({
  showCreateForm,
  editingProduct,
  deleteDialog,
  formLoading,
  onCloseCreateForm,
  onCloseEditForm,
  onCloseDeleteDialog,
  onCreateProduct,
  onUpdateProduct,
  onConfirmDelete
}: ProductModalsProps) {
  return (
    <>
      {/* Форма создания продукта */}
      {showCreateForm && (
        <ProductForm
          isOpen={showCreateForm}
          onClose={onCloseCreateForm}
          onSubmit={onCreateProduct}
          isLoading={formLoading}
        />
      )}

      {/* Форма редактирования продукта */}
      {editingProduct && (
        <ProductForm
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={onCloseEditForm}
          onSubmit={(data) => onUpdateProduct(data, editingProduct)}
          isLoading={formLoading}
        />
      )}

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            onCloseDeleteDialog();
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
        onConfirm={() => onConfirmDelete(deleteDialog.productId, deleteDialog.productName, deleteDialog.deleteType)}
        onCancel={onCloseDeleteDialog}
        variant={deleteDialog.deleteType === 'hard' ? 'destructive' : 'warning'}
        icon={
          deleteDialog.deleteType === 'hard' 
            ? <Trash2 className="h-5 w-5 text-red-600" />
            : <Archive className="h-5 w-5 text-yellow-600" />
        }
      />
    </>
  );
});
