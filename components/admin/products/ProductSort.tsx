// components/admin/products/ProductSort.tsx
import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface ProductSortProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export const ProductSort = memo(function ProductSort({
  sortBy,
  sortOrder,
  onSortChange
}: ProductSortProps) {
  const sortOptions = [
    { value: 'name', label: 'Название' },
    { value: 'price', label: 'Цена' },
    { value: 'inStock', label: 'Количество' },
    { value: 'createdAt', label: 'Дата создания' },
    { value: 'updatedAt', label: 'Дата обновления' },
    { value: 'category', label: 'Категория' }
  ];

  const toggleSortOrder = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const SortIcon = sortOrder === 'asc' ? ArrowUp : ArrowDown;

  return (
    <div className="flex items-center gap-2">
      <Select value={sortBy} onValueChange={(value) => onSortChange(value, sortOrder)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Сортировка" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={toggleSortOrder}
        className="flex items-center gap-1"
      >
        <SortIcon className="h-4 w-4" />
        {sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
      </Button>
    </div>
  );
});
