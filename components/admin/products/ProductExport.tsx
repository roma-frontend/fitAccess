// components/admin/products/ProductExport.tsx
import React, { memo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, Table, Image } from "lucide-react";
import { Product } from "@/hooks/useProducts";

interface ProductExportProps {
  products: Product[];
  selectedProducts?: string[];
}

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  fields: string[];
  includeImages: boolean;
  onlySelected: boolean;
}

export const ProductExport = memo(function ProductExport({
  products,
  selectedProducts = []
}: ProductExportProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    fields: ['name', 'price', 'category', 'inStock'],
    includeImages: false,
    onlySelected: false
  });
  const [isExporting, setIsExporting] = useState(false);

  const availableFields = [
    { id: 'name', label: 'Название' },
    { id: 'description', label: 'Описание' },
    { id: 'price', label: 'Цена' },
    { id: 'category', label: 'Категория' },
    { id: 'inStock', label: 'Количество' },
    { id: 'isPopular', label: 'Популярный' },
    { id: 'createdAt', label: 'Дата создания' },
    { id: 'updatedAt', label: 'Дата обновления' }
  ];

  const handleFieldToggle = (fieldId: string) => {
    setOptions(prev => ({
      ...prev,
      fields: prev.fields.includes(fieldId)
        ? prev.fields.filter(f => f !== fieldId)
        : [...prev.fields, fieldId]
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const dataToExport = options.onlySelected 
        ? products.filter(p => selectedProducts.includes(p._id))
        : products;

      const exportData = dataToExport.map(product => {
        const row: Record<string, any> = {};
        options.fields.forEach(field => {
          row[field] = product[field as keyof Product];
        });
        return row;
      });

      switch (options.format) {
        case 'csv':
          await exportToCSV(exportData);
          break;
        case 'xlsx':
          await exportToExcel(exportData);
          break;
        case 'json':
          await exportToJSON(exportData);
          break;
        case 'pdf':
          await exportToPDF(exportData);
          break;
      }
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async (data: any[]) => {
    const headers = options.fields.join(',');
    const rows = data.map(row => 
      options.fields.map(field => `"${row[field] || ''}"`).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = async (data: any[]) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = async (data: any[]) => {
    // Здесь можно использовать библиотеку типа xlsx
    console.log('Excel export not implemented yet');
  };

  const exportToPDF = async (data: any[]) => {
    // Здесь можно использовать библиотеку типа jsPDF
    console.log('PDF export not implemented yet');
  };

  const formatIcons = {
    csv: Table,
    xlsx: Table,
    json: FileText,
    pdf: FileText
  };

  const FormatIcon = formatIcons[options.format];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Экспорт продуктов
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Формат экспорта */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Формат файла</label>
          <Select 
            value={options.format} 
            onValueChange={(value: any) => setOptions(prev => ({ ...prev, format: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Поля для экспорта */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Поля для экспорта</label>
          <div className="grid grid-cols-2 gap-2">
            {availableFields.map(field => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox
                  id={field.id}
                  checked={options.fields.includes(field.id)}
                  onCheckedChange={() => handleFieldToggle(field.id)}
                />
                <label htmlFor={field.id} className="text-sm">
                  {field.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Дополнительные опции */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeImages"
              checked={options.includeImages}
              onCheckedChange={(checked) => 
                setOptions(prev => ({ ...prev, includeImages: !!checked }))
              }
            />
            <label htmlFor="includeImages" className="text-sm">
              Включить ссылки на изображения
            </label>
          </div>

          {selectedProducts.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="onlySelected"
                checked={options.onlySelected}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, onlySelected: !!checked }))
                }
              />
              <label htmlFor="onlySelected" className="text-sm">
                Только выбранные продукты ({selectedProducts.length})
              </label>
            </div>
          )}
        </div>

        {/* Кнопка экспорта */}
        <Button
          onClick={handleExport}
          disabled={isExporting || options.fields.length === 0}
          className="w-full"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Экспортирование...
            </>
          ) : (
            <>
              <FormatIcon className="h-4 w-4 mr-2" />
              Экспортировать {options.format.toUpperCase()}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
});
