// components/trainer/modals/EditClientModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { useTrainer, Client } from '@/contexts/TrainerContext';
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
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface EditClientModalProps {
  isOpen: boolean;
  clientId: string;
  onClose: () => void;
}

export default function EditClientModal({ isOpen, clientId, onClose }: EditClientModalProps) {
  const { clients, updateClient } = useTrainer();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentProgram: '',
    notes: '',
    status: 'trial' as Client['status'],
    progress: 0
  });
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState('');

  const client = clients.find(c => c.id === clientId);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        currentProgram: client.currentProgram,
        notes: client.notes || '',
        status: client.status,
        progress: client.progress
      });
      setGoals(client.goals);
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      updateClient(clientId, {
        ...formData,
        goals
      });
      handleClose();
    } catch (error) {
      console.error('Ошибка обновления клиента:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewGoal('');
    onClose();
  };

  const addGoal = () => {
    if (newGoal.trim() && !goals.includes(newGoal.trim())) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeGoal = (goalToRemove: string) => {
    setGoals(goals.filter(goal => goal !== goalToRemove));
  };

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать клиента</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Полное имя *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="program">Программа тренировок</Label>
            <Input
              id="program"
              value={formData.currentProgram}
              onChange={(e) => setFormData({ ...formData, currentProgram: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="status">Статус</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Client['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="trial">Пробный</option>
              <option value="active">Активный</option>
              <option value="inactive">Неактивный</option>
            </select>
          </div>

          <div>
            <Label htmlFor="progress">Прогресс (%)</Label>
            <Input
              id="progress"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label>Цели</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Добавить цель"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
              />
              <Button type="button" onClick={addGoal} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {goals.map((goal, index) => (
                <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeGoal(goal)}>
                  {goal} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
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

