// utils/trainerValidation.ts (новый файл для валидации)
"use client";

import { Trainer } from "@/types/trainer";

export const validateTrainer = (trainer: Partial<Trainer>): string[] => {
  const errors: string[] = [];

  if (!trainer.name?.trim()) {
    errors.push("Имя тренера обязательно");
  }

  if (!trainer.email?.trim()) {
    errors.push("Email обязателен");
  } else if (!isValidEmail(trainer.email)) {
    errors.push("Некорректный формат email");
  }

  if (!trainer.phone?.trim()) {
    errors.push("Телефон обязателен");
  }

  if (!trainer.specialization?.length) {
    errors.push("Необходимо указать хотя бы одну специализацию");
  }

  if (trainer.hourlyRate !== undefined && trainer.hourlyRate < 0) {
    errors.push("Почасовая ставка не может быть отрицательной");
  }

  if (trainer.experience !== undefined && trainer.experience < 0) {
    errors.push("Опыт работы не может быть отрицательным");
  }

  return errors;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-$]/g, ''));
};

export const normalizeTrainer = (trainer: Partial<Trainer>): Trainer => {
  return {
    id: trainer.id || '',
    _id: trainer._id,
    name: trainer.name || '',
    email: trainer.email || '',
    phone: trainer.phone || '',
    specialization: trainer.specialization || [],
    experience: trainer.experience || 0,
    hourlyRate: trainer.hourlyRate || 0,
    certifications: trainer.certifications || [],
    bio: trainer.bio || '',
    avatar: trainer.avatar || '',
    rating: trainer.rating || 0,
    isActive: trainer.isActive ?? true,
    status: trainer.status || 'inactive',
    activeClients: trainer.activeClients || 0,
    totalSessions: trainer.totalSessions || 0,
    createdAt: trainer.createdAt || Date.now(),
    _creationTime: trainer._creationTime || Date.now(),
    totalClients: trainer.totalClients || 0,
    monthlyEarnings: trainer.monthlyEarnings || 0,
    workingHours: trainer.workingHours || {
      start: '09:00',
      end: '18:00',
      days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт']
    },
    nextSession: trainer.nextSession,
  };
};
