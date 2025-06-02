// components/admin/products/ProductImport.tsx
import React, { memo, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useDropzone } from 'react-dropzone';

interface ImportResult {
  success: number;
  errors: Array<{ row: number; message: string; data?: any }>;
  warnings: Array<{ row: number; message: string; data?: any }>;
}

interface ProductImportProps {
  onImport: (data: any[]) => Promise<ImportResult>;
}

export const ProductImport = memo(function ProductImport({
  onImport
}: ProductImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const text = await file.text();
      let data: any[] = [];

      if (file.name.endsWith('.csv')) {
        data = parseCSV(text);
      } else if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      }

      setPreviewData(data.slice(0, 5)); // Показываем первые 5 строк для превью
    } catch (error) {
      console.error('Error parsing file:', error);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    maxFiles: 1
  });

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj: any = { _row: index + 2 };
        headers.forEach((header, i) => {
          obj[header] = values[i] || '';
        });
        return obj;
      });
  };

  const handleImport = async () => {
    if (!previewData) return;

    setIsImporting(true);
    setProgress(0);

    try {
      // Симуляция прогресса
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await onImport(previewData);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(result);
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setPreviewData(null);
    setResult(null);
    setProgress(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Импорт продуктов
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!previewData && !result && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              {isDragActive 
                ? 'Отпустите файл здесь...' 
                : 'Перетащите файл сюда или нажмите для выбора'
              }
            </p>
            <p className="text-sm text-gray-500">
              Поддерживаются форматы: CSV, JSON
            </p>
          </div>
        )}

        {previewData && !result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Превью данных ({previewData.length} строк)</h3>
              <Button variant="outline" size="sm" onClick={resetImport}>
                Выбрать другой файл
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(previewData[0] || {})
                        .filter(key => key !== '_row')
                        .map(key => (
                          <th key={key} className="px-3 py-2 text-left font-medium">
                            {key}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 3).map((row, index) => (
                      <tr key={index} className="border-t">
                        {Object.entries(row)
                          .filter(([key]) => key !== '_row')
                          .map(([key, value]) => (
                            <td key={key} className="px-3 py-2">
                              {String(value)}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {isImporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Импортирование...</span>
                  <span className="text-sm">{progress}%</span>
                </div>
                                <Progress value={progress} className="w-full" />
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="w-full"
            >
              {isImporting ? 'Импортирование...' : `Импортировать ${previewData.length} продуктов`}
            </Button>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Результат импорта</h3>
              <Button variant="outline" size="sm" onClick={resetImport}>
                Импортировать еще
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{result.success}</div>
                  <div className="text-sm text-gray-600">Успешно</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">{result.warnings.length}</div>
                  <div className="text-sm text-gray-600">Предупреждения</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                  <div className="text-sm text-gray-600">Ошибки</div>
                </CardContent>
              </Card>
            </div>

            {result.errors.length > 0 && (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">Ошибки импорта:</div>
                    {result.errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="text-sm">
                        Строка {error.row}: {error.message}
                      </div>
                    ))}
                    {result.errors.length > 5 && (
                      <div className="text-sm text-gray-500">
                        И еще {result.errors.length - 5} ошибок...
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {result.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">Предупреждения:</div>
                    {result.warnings.slice(0, 3).map((warning, index) => (
                      <div key={index} className="text-sm">
                        Строка {warning.row}: {warning.message}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

