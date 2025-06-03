// components/TrainerForm.tsx (исправленная версия)
"use client";

import React, { useState, useEffect } from 'react';
import { useCreateTrainer, useUpdateTrainer, useTrainer } from '@/hooks/useTrainersAPI';
import type { CreateTrainerData } from '@/hooks/useTrainersAPI';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, X, User, Mail, Phone, DollarSign, Award, FileText } from "lucide-react";

interface TrainerFormProps {
    trainerId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function TrainerForm({ trainerId, onSuccess, onCancel }: TrainerFormProps) {
    const isEditing = !!trainerId;

    const [formData, setFormData] = useState<CreateTrainerData>({
        name: '',
        email: '',
        phone: '',
        specialization: [],
        experience: 0,
        hourlyRate: 1500,
        certifications: [],
        bio: '',
        avatar: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [newSpecialization, setNewSpecialization] = useState('');
    const [newCertification, setNewCertification] = useState('');

    const { trainer, isLoading: isLoadingTrainer } = useTrainer(trainerId || '');
    const { createTrainer, isCreating, error: createError } = useCreateTrainer();
    const { updateTrainer, isUpdating, error: updateError } = useUpdateTrainer();

    // Загрузка данных для редактирования
    useEffect(() => {
        if (isEditing && trainer) {
            setFormData({
                name: trainer.name || '',
                email: trainer.email || '',
                phone: trainer.phone || '',
                specialization: trainer.specialization || [],
                experience: trainer.experience || 0,
                hourlyRate: trainer.hourlyRate || 1500,
                certifications: trainer.certifications || [],
                bio: trainer.bio || '',
                avatar: trainer.avatar || ''
            });
        }
    }, [isEditing, trainer]);

    // Валидация формы
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Имя обязательно';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email обязателен';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Некорректный формат email';
        }

        if (formData.experience < 0) {
            newErrors.experience = 'Опыт не может быть отрицательным';
        }

        if (formData.hourlyRate <= 0) {
            newErrors.hourlyRate = 'Ставка должна быть положительной';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Обработчики изменений
    const handleInputChange = (field: keyof CreateTrainerData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleAddSpecialization = () => {
        if (newSpecialization.trim() && !formData.specialization?.includes(newSpecialization.trim())) {
            setFormData(prev => ({
                ...prev,
                specialization: [...(prev.specialization || []), newSpecialization.trim()]
            }));
            setNewSpecialization('');
        }
    };

    const handleRemoveSpecialization = (index: number) => {
        setFormData(prev => ({
            ...prev,
            specialization: prev.specialization?.filter((_, i) => i !== index) || []
        }));
    };

    const handleAddCertification = () => {
        if (newCertification.trim() && !formData.certifications?.includes(newCertification.trim())) {
            setFormData(prev => ({
                ...prev,
                certifications: [...(prev.certifications || []), newCertification.trim()]
            }));
            setNewCertification('');
        }
    };

    const handleRemoveCertification = (index: number) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications?.filter((_, i) => i !== index) || []
        }));
    };

    // Отправка формы
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            if (isEditing && trainerId) {
                const success = await updateTrainer(trainerId, formData);
                if (success) {
                    onSuccess?.();
                }
            } else {
                const result = await createTrainer(formData);
                if (result) {
                    onSuccess?.();
                }
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        }
    };

    // Обработчик нажатия Enter для добавления специализаций и сертификатов
    const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            action();
        }
    };

    if (isEditing && isLoadingTrainer) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-gray-600">Загрузка данных тренера...</p>
                </CardContent>
            </Card>
        );
    }

    const currentError = createError || updateError;
    const isSubmitting = isCreating || isUpdating;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {isEditing ? 'Редактирование тренера' : 'Новый тренер'}
                </CardTitle>
            </CardHeader>
            
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {currentError && (
                        <Alert variant="destructive">
                            <AlertDescription>{currentError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Основная информация */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Основная информация
                            </h3>

                            <div className="space-y-2">
                                <Label htmlFor="name">Имя *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Введите имя тренера"
                                    className={errors.name ? 'border-red-300' : ''}
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    Email *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="trainer@example.com"
                                    className={errors.email ? 'border-red-300' : ''}
                                />
                                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    Телефон
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="+7 (999) 123-45-67"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="experience">Опыт работы (лет)</Label>
                                    <Input
                                        id="experience"
                                        type="number"
                                        min="0"
                                        value={formData.experience}
                                        onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                                        className={errors.experience ? 'border-red-300' : ''}
                                    />
                                    {errors.experience && <p className="text-sm text-red-600">{errors.experience}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hourlyRate" className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        Почасовая ставка (₽)
                                    </Label>
                                    <Input
                                        id="hourlyRate"
                                        type="number"
                                        min="0"
                                        step="100"
                                        value={formData.hourlyRate}
                                        onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value) || 0)}
                                        className={errors.hourlyRate ? 'border-red-300' : ''}
                                    />
                                    {errors.hourlyRate && <p className="text-sm text-red-600">{errors.hourlyRate}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Дополнительная информация */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Дополнительная информация
                            </h3>

                            {/* Специализации */}
                            <div className="space-y-2">
                                <Label>Специализации</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newSpecialization}
                                        onChange={(e) => setNewSpecialization(e.target.value)}
                                        placeholder="Добавить специализацию"
                                        onKeyPress={(e) => handleKeyPress(e, handleAddSpecialization)}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleAddSpecialization}
                                        size="sm"
                                        disabled={!newSpecialization.trim()}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.specialization?.map((spec, index) => (
                                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                            {spec}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSpecialization(index)}
                                                className="ml-1 hover:text-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Сертификаты */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    <Award className="h-3 w-3" />
                                    Сертификаты
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newCertification}
                                        onChange={(e) => setNewCertification(e.target.value)}
                                        placeholder="Добавить сертификат"
                                        onKeyPress={(e) => handleKeyPress(e, handleAddCertification)}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleAddCertification}
                                        size="sm"
                                        variant="outline"
                                        disabled={!newCertification.trim()}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {formData.certifications?.map((cert, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md"
                                        >
                                            <span className="text-green-800 text-sm">{cert}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCertification(index)}
                                                className="text-green-600 hover:text-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Аватар */}
                            <div className="space-y-2">
                                <Label htmlFor="avatar">URL аватара</Label>
                                <Input
                                    id="avatar"
                                    type="url"
                                    value={formData.avatar}
                                    onChange={(e) => handleInputChange('avatar', e.target.value)}
                                    placeholder="https://example.com/avatar.jpg"
                                />
                                {formData.avatar && (
                                    <div className="mt-2">
                                        <img
                                            src={formData.avatar}
                                            alt="Предпросмотр аватара"
                                            className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                                                        {/* Биография */}
                            <div className="space-y-2">
                                <Label htmlFor="bio">Биография</Label>
                                <Textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    rows={4}
                                    placeholder="Расскажите о тренере..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {isEditing ? 'Сохранение...' : 'Создание...'}
                                </>
                            ) : (
                                isEditing ? 'Сохранить изменения' : 'Создать тренера'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

