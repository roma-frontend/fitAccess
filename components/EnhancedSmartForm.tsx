// components/EnhancedSmartForm.tsx
// Улучшенная версия SmartForm с продвинутой валидацией

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ValidatedInput } from './ValidatedInput';
import { ValidationSummary } from './ValidationSummary';
import { useAdvancedValidation } from '@/hooks/useAdvancedValidation';
import { Loader2, Shield, Zap } from 'lucide-react';

interface EnhancedSmartFormProps {
  type: 'login' | 'register' | 'staff-login';
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  autoValidate?: boolean;
  showValidationSummary?: boolean;
}

export const EnhancedSmartForm: React.FC<EnhancedSmartFormProps> = ({
  type,
  onSubmit,
  isLoading = false,
  autoValidate = true,
  showValidationSummary = true
}) => {
  // Конфигурация формы
  const getFormConfig = () => {
    switch (type) {
      case 'register':
        return {
          fields: [
            { name: 'name', type: 'text', label: 'Имя', placeholder: 'Введите ваше имя', required: true },
            { name: 'email', type: 'email', label: 'Email', placeholder: 'Введите email', required: true },
            { name: 'password', type: 'password', label: 'Пароль', placeholder: 'Создайте надежный пароль', required: true, showStrength: true },
            { name: 'confirmPassword', type: 'password', label: 'Подтвердите пароль', placeholder: 'Повторите пароль', required: true }
          ],
          title: 'Регистрация',
          description: 'Создайте новый аккаунт с надежной защитой',
          submitText: 'Зарегистрироваться',
          icon: Shield
        };
      case 'staff-login':
        return {
          fields: [
            { name: 'role', type: 'select', label: 'Роль', required: true, options: [
              { value: 'admin', label: 'Администратор' },
              { value: 'super-admin', label: 'Супер Администратор' },
              { value: 'manager', label: 'Менеджер' },
              { value: 'trainer', label: 'Тренер' }
            ]},
            { name: 'email', type: 'email', label: 'Email адрес', placeholder: 'your@email.com', required: true },
            { name: 'password', type: 'password', label: 'Пароль', placeholder: 'Введите пароль', required: true, showToggle: true }
          ],
          title: 'Вход для персонала',
          description: 'Войдите в панель управления',
          submitText: 'Войти в систему',
          icon: Zap
        };
      default: // login
        return {
          fields: [
            { name: 'email', type: 'email', label: 'Email', placeholder: 'Введите email', required: true },
            { name: 'password', type: 'password', label: 'Пароль', placeholder: 'Введите пароль', required: true, showToggle: true }
          ],
          title: 'Вход в систему',
          description: 'Войдите в свой аккаунт',
          submitText: 'Войти',
          icon: Shield
        };
    }
  };

  const config = getFormConfig();
  const IconComponent = config.icon;

  // Инициализация данных формы
  const initialData = config.fields.reduce((acc, field) => {
    acc[field.name] = field.name === 'role' ? 'admin' : '';
    return acc;
  }, {} as Record<string, string>);

  // Используем продвинутую валидацию
  const {
    formData,
    validationStates,
    isFormValid,
    updateField,
    validateForm,
    hasErrors,
    hasWarnings,
    isValidating,
    totalErrors,
    totalWarnings
  } = useAdvancedValidation(initialData, {
    debounceMs: 300,
    validateOnMount: autoValidate,
    cacheResults: true
  });

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || isLoading) return;
    
    // Финальная валидация перед отправкой
    const finalValidation = await validateForm();
    const hasValidationErrors = Object.values(finalValidation).some(state => !state.isValid);
    
    if (hasValidationErrors) {
      console.warn('Форма содержит ошибки валидации');
      return;
    }
    
    await onSubmit(formData);
  };

  // Рендер поля формы
  const renderField = (field: any) => {
    const fieldState = validationStates[field.name];
    
    if (field.type === 'select') {
      return (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label} {field.required && '*'}
          </label>
          <select
            value={formData[field.name] || (field.options?.[0]?.value || '')}
            onChange={(e) => updateField(field.name, e.target.value)}
            className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          >
            {field.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={field.name}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {field.label} {field.required && '*'}
        </label>
        <ValidatedInput
          type={field.type}
          name={field.name}
          value={formData[field.name] || ''}
          onChange={(e) => updateField(field.name, e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          showPasswordToggle={field.showToggle}
          className="w-full"
        />
        
        {/* Отображение ошибок поля */}
        {fieldState && fieldState.errors.length > 0 && (
          <div className="mt-1 space-y-1">
            {fieldState.errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600 flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2" />
                {error}
              </p>
            ))}
          </div>
        )}
        
        {/* Отображение предупреждений */}
        {fieldState && fieldState.warnings && fieldState.warnings.length > 0 && (
          <div className="mt-1 space-y-1">
            {fieldState.warnings.map((warning, index) => (
              <p key={index} className="text-sm text-orange-600 flex items-center">
                <span className="w-1 h-1 bg-orange-600 rounded-full mr-2" />
                {warning}
              </p>
            ))}
          </div>
        )}
        
        {/* Индикатор валидации */}
        {fieldState && fieldState.isValidating && (
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Проверка...
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconComponent className="h-8 w-8 text-white" />
        </div>
        // components/EnhancedSmartForm.tsx (продолжение)
        <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
        <CardDescription className="text-base">{config.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {config.fields.map(renderField)}

          {/* Сводка валидации */}
          {showValidationSummary && Object.keys(validationStates).length > 0 && (
            <ValidationSummary
              validationResults={validationStates}
              showOnlyErrors={false}
            />
          )}

          <Button
            type="submit"
            disabled={isLoading || !isFormValid || isValidating}
            className={`w-full h-11 transition-all duration-300 ${
              isFormValid && !isValidating
                ? 'bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 shadow-lg' 
                : 'bg-gradient-to-r from-gray-400 to-gray-600 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Обработка...
              </>
            ) : isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Проверка данных...
              </>
            ) : (
              config.submitText
            )}
          </Button>
        </form>

        {/* Статистика валидации (только в режиме разработки) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-gray-700">🔧 Статистика валидации</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-600">Форма валидна:</p>
                  <p className={`font-medium ${isFormValid ? 'text-green-600' : 'text-red-600'}`}>
                    {isFormValid ? '✅ Да' : '❌ Нет'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Ошибки:</p>
                  <p className={`font-medium ${totalErrors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {totalErrors}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Предупреждения:</p>
                  <p className={`font-medium ${totalWarnings > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {totalWarnings}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Проверка:</p>
                  <p className={`font-medium ${isValidating ? 'text-blue-600' : 'text-gray-600'}`}>
                    {isValidating ? '🔄 Да' : '⏸️ Нет'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Индикатор прогресса заполнения */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                Прогресс заполнения
              </span>
              <span className="text-sm font-bold text-blue-900">
                {Math.round((Object.keys(formData).filter(key => formData[key]).length / config.fields.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(Object.keys(formData).filter(key => formData[key]).length / config.fields.length) * 100}%`
                }}
              />
            </div>
            <div className="mt-2 space-y-1">
              {config.fields.map(field => {
                const isFilled = Boolean(formData[field.name]);
                const fieldState = validationStates[field.name];
                const isValid = !fieldState || fieldState.isValid;
                
                return (
                  <div key={field.name} className="flex items-center text-xs">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      isFilled && isValid ? 'bg-green-500' :
                      isFilled && !isValid ? 'bg-red-500' :
                      'bg-gray-300'
                    }`} />
                    <span className={`${
                      isFilled && isValid ? 'text-green-700' :
                      isFilled && !isValid ? 'text-red-700' :
                      'text-gray-600'
                    }`}>
                      {field.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

