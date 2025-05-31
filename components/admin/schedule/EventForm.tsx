import React, { useState, useEffect } from 'react';
import { CreateEventData, TrainerSchedule, Client } from '@/hooks/useScheduleData';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEventData) => Promise<void>;
  initialData?: any;
  initialDate?: string;
  initialHour?: number;
  trainers: TrainerSchedule[];
  clients: Client[];
  isEditing: boolean;
}

export function EventForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  initialDate, 
  initialHour, 
  trainers, 
  clients, 
  isEditing 
}: EventFormProps) {
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    type: 'personal',
    startTime: '',
    endTime: '',
    trainerId: '',
    location: '',
    notes: '',
    status: 'scheduled'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        type: initialData.type || 'personal',
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        trainerId: initialData.trainerId || '',
        clientId: initialData.clientId || '',
        location: initialData.location || '',
        notes: initialData.notes || '',
        status: initialData.status || 'scheduled'
      });
    } else if (initialDate) {
      const startDate = new Date(initialDate);
      if (initialHour) {
        startDate.setHours(initialHour, 0, 0, 0);
      } else {
        startDate.setHours(9, 0, 0, 0);
      }
      
            const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1);

      setFormData(prev => ({
        ...prev,
        startTime: startDate.toISOString().slice(0, 16),
        endTime: endDate.toISOString().slice(0, 16)
      }));
    }
  }, [initialData, initialDate, initialHour]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Введите название события');
      return;
    }
    
    if (!formData.trainerId) {
      alert('Выберите тренера');
      return;
    }
    
    if (!formData.startTime || !formData.endTime) {
      alert('Укажите время начала и окончания');
      return;
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      alert('Время окончания должно быть позже времени начала');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Ошибка отправки формы:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateEventData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? 'Редактировать событие' : 'Создать событие'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Название */}
          <div>
            <label className="block text-sm font-medium mb-2">Название *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите название события"
              required
            />
          </div>

          {/* Тип события */}
          <div>
            <label className="block text-sm font-medium mb-2">Тип события</label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="personal">Персональная тренировка</option>
              <option value="group">Групповая тренировка</option>
              <option value="consultation">Консультация</option>
              <option value="other">Другое</option>
            </select>
          </div>

          {/* Тренер */}
          <div>
            <label className="block text-sm font-medium mb-2">Тренер *</label>
            <select
              value={formData.trainerId}
              onChange={(e) => handleChange('trainerId', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">
                {trainers.length === 0 ? 'Тренеры не найдены' : 'Выберите тренера'}
              </option>
              {trainers.map((trainer) => (
                <option key={trainer.trainerId} value={trainer.trainerId}>
                  {trainer.trainerName} ({trainer.trainerRole})
                </option>
              ))}
            </select>
            
            {trainers.length === 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                <p className="text-red-600 font-medium">⚠️ Тренеры не найдены</p>
                <p className="text-red-500 text-xs mt-1">
                  Добавьте тренеров в систему для создания событий
                </p>
              </div>
            )}
          </div>

          {/* Клиент */}
          <div>
            <label className="block text-sm font-medium mb-2">Клиент</label>
            <select
              value={formData.clientId || ''}
              onChange={(e) => handleChange('clientId', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Без клиента (групповая тренировка)</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </div>

          {/* Время */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Начало *</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Окончание *</label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Местоположение */}
          <div>
            <label className="block text-sm font-medium mb-2">Местоположение</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Зал, адрес или онлайн"
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium mb-2">Описание</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Дополнительная информация о тренировке"
            />
          </div>

          {/* Заметки */}
          <div>
            <label className="block text-sm font-medium mb-2">Заметки</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Внутренние заметки"
            />
          </div>

          {/* Статус (только при редактировании) */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium mb-2">Статус</label>
              <select
                value={formData.status || 'scheduled'}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="scheduled">Запланировано</option>
                <option value="confirmed">Подтверждено</option>
                <option value="completed">Завершено</option>
                <option value="cancelled">Отменено</option>
                <option value="no-show">Не явился</option>
              </select>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || trainers.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Сохранение...' : (isEditing ? 'Обновить' : 'Создать')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

