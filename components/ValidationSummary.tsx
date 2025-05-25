// components/ValidationSummary.tsx
// Компонент для отображения сводки валидации

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface ValidationSummaryProps {
  validationResults: Record<string, {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
    info?: string[];
  }>;
  showOnlyErrors?: boolean;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  validationResults,
  showOnlyErrors = false
}) => {
  const allErrors = Object.values(validationResults).flatMap(result => result.errors);
  const allWarnings = Object.values(validationResults).flatMap(result => result.warnings || []);
  const allInfo = Object.values(validationResults).flatMap(result => result.info || []);
  
  const isFormValid = allErrors.length === 0;

  if (showOnlyErrors && isFormValid) return null;

  return (
    <Card className={`border-2 transition-colors ${
      isFormValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className={`text-sm flex items-center ${
          isFormValid ? 'text-green-900' : 'text-red-900'
        }`}>
          {isFormValid ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Форма готова к отправке
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
              Исправьте ошибки в форме
            </>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Ошибки */}
        {allErrors.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-red-800">Ошибки:</p>
            {allErrors.map((error, index) => (
              <div key={index} className="flex items-start text-xs text-red-700">
                <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}

        {/* Предупреждения */}
        {!showOnlyErrors && allWarnings.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-orange-800">Рекомендации:</p>
            {allWarnings.map((warning, index) => (
              <div key={index} className="flex items-start text-xs text-orange-700">
                <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}

        {/* Информация */}
        {!showOnlyErrors && allInfo.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-blue-800">Советы:</p>
            {allInfo.map((info, index) => (
              <div key={index} className="flex items-start text-xs text-blue-700">
                <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                <span>{info}</span>
              </div>
            ))}
          </div>
        )}

        {/* Прогресс заполнения */}
        {!showOnlyErrors && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Готовность формы:</span>
              <span className={`font-medium ${
                isFormValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {isFormValid ? '100%' : `${Math.max(0, 100 - (allErrors.length * 20))}%`}
              </span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isFormValid ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{
                  width: `${isFormValid ? 100 : Math.max(0, 100 - (allErrors.length * 20))}%`
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
