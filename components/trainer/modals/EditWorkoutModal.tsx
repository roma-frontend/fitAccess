// components/trainer/modals/EditWorkoutModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { useTrainer, Workout } from '@/contexts/TrainerContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditWorkoutModalProps {
  isOpen: boolean;
  workoutId: string;
  onClose: () => void;
}

export default function EditWorkoutModal({ isOpen, workoutId, onClose }: EditWorkoutModalProps) {
  const { clients, workouts, updateWorkout } = useTrainer();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    date: '',
    time: '',
    type: '',
    location: '',
    duration: 60,
    notes: '',
    status: 'scheduled' as Workout['status']
  });

  const workout = workouts.find(w => w.id === workoutId);

  useEffect(() => {
    if (workout) {
      setFormData({
        clientId: workout.clientId,
        date: workout.date,
        time: workout.time,
        type: workout.type,
        location: workout.location,
        duration: workout.duration || 60,
        notes: workout.notes || '',
        status: workout.status
      });
    }
  }, [workout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedClient = clients.find(c => c.id === formData.clientId);
      if (!selectedClient) {
        throw new Error('Клиент не найден');
      }

      updateWorkout(workoutId, {
        ...formData,
        clientName: selectedClient.name,
      });
      
      handleClose();
    } catch (error) {
      console.error('Ошибка обновления тренировки:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!workout) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать тренировку</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client">Клиент *</Label>
            <select
              id="client"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Выберите клиента</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Дата *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Время *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="type">Тип тренировки *</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Выберите тип</option>
              <option value="Персональная тренировка">Персональная тренировка</option>
              <option value="Силовая тренировка">Силовая тренировка</option>
              <option value="Кардио тренировка">Кардио тренировка</option>
              <option value="Функциональная тренировка">Функциональная тренировка</option>
              <option value="Консультация">Консультация</option>
              <option value="Групповое занятие">Групповое занятие</option>
            </select>
          </div>

          <div>
            <Label htmlFor="location">Место проведения *</Label>
            <select
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Выберите место</option>
              <option value="Зал №1">Зал №1</option>
              <option value="Зал №2">Зал №2</option>
              <option value="Кардио зона">Кардио зона</option>
              <option value="Функциональная зона">Функциональная зона</option>
              <option value="Кабинет">Кабинет</option>
              <option value="Онлайн">Онлайн</option>
            </select>
          </div>

          <div>
            <Label htmlFor="duration">Продолжительность (минуты)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="180"
              step="15"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
            />
          </div>

          <div>
            <Label htmlFor="status">Статус</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Workout['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="scheduled">Запланировано</option>
              <option value="completed">Завершено</option>
              <option value="cancelled">Отменено</option>
            </select>
          </div>

          <div>
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
                    </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

