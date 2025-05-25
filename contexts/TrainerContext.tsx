// contexts/TrainerContext.tsx (обновленная версия)
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'trial' | 'inactive';
  currentProgram: string;
  joinDate: string;
  lastWorkout: string;
  totalWorkouts: number;
  progress: number;
  goals: string[];
  notes?: string;
}

export interface Workout {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  type: string;
  location: string;
  duration?: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Message {
  id: string;
  clientId: string;
  content: string;
  timestamp: string;
  isFromTrainer: boolean;
  read: boolean;
}

export interface TrainerStats {
  totalClients: number;
  activeClients: number;
  todayWorkouts: number;
  avgRating: number;
}

interface TrainerContextType {
  clients: Client[];
  workouts: Workout[];
  messages: Message[];
  stats: TrainerStats;
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  updateWorkout: (id: string, updates: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  sendMessage: (clientId: string, content: string) => void;
  markAsRead: (messageId: string) => void;
  loading: boolean;
}

const TrainerContext = createContext<TrainerContextType | undefined>(undefined);

export function TrainerProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Инициализация с тестовыми данными
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    // Тестовые клиенты
    const testClients: Client[] = [
      {
        id: '1',
        name: 'Анна Петрова',
        email: 'anna@example.com',
        phone: '+7 (999) 123-45-67',
        status: 'active',
        currentProgram: 'Похудение и тонус',
        joinDate: '2024-01-15',
        lastWorkout: '2024-01-20',
        totalWorkouts: 15,
        progress: 75,
        goals: ['Похудение', 'Улучшение выносливости'],
        notes: 'Очень мотивированная, любит кардио'
      },
      {
        id: '2',
        name: 'Михаил Сидоров',
        email: 'mikhail@example.com',
        phone: '+7 (999) 234-56-78',
        status: 'trial',
        currentProgram: 'Набор мышечной массы',
        joinDate: '2024-01-18',
        lastWorkout: '2024-01-19',
        totalWorkouts: 3,
        progress: 25,
        goals: ['Набор массы', 'Увеличение силы'],
        notes: 'Новичок, требует особого внимания'
      },
      {
        id: '3',
        name: 'Елена Козлова',
        email: 'elena@example.com',
        phone: '+7 (999) 345-67-89',
        status: 'active',
        currentProgram: 'Функциональный тренинг',
        joinDate: '2023-12-01',
        lastWorkout: '2024-01-21',
        totalWorkouts: 28,
        progress: 90,
        goals: ['Поддержание формы', 'Гибкость'],
        notes: 'Опытная спортсменка'
      }
    ];

    // Тестовые тренировки
    const testWorkouts: Workout[] = [
      {
        id: '1',
        clientId: '1',
        clientName: 'Анна Петрова',
        date: '2024-01-22',
        time: '10:00',
        type: 'Кардио тренировка',
        location: 'Кардио зона',
        duration: 60,
        status: 'scheduled',
        notes: 'Интервальная тренировка'
      },
      {
        id: '2',
        clientId: '2',
        clientName: 'Михаил Сидоров',
        date: '2024-01-22',
        time: '14:00',
        type: 'Силовая тренировка',
        location: 'Зал №1',
        duration: 90,
        status: 'scheduled',
        notes: 'Работа с базовыми упражнениями'
      },
      {
        id: '3',
        clientId: '3',
        clientName: 'Елена Козлова',
        date: '2024-01-21',
        time: '16:00',
        type: 'Функциональная тренировка',
        location: 'Функциональная зона',
        duration: 75,
        status: 'completed',
        notes: 'Отличная работа!'
      }
    ];

    // Тестовые сообщения
    const testMessages: Message[] = [
      {
        id: '1',
        clientId: '1',
        content: 'Привет! Можем ли мы перенести завтрашнюю тренировку на час позже?',
        timestamp: '2024-01-21T15:30:00',
        isFromTrainer: false,
        read: false
      },
      {
        id: '2',
        clientId: '1',
        content: 'Конечно! Переносим на 11:00. Увидимся завтра!',
        timestamp: '2024-01-21T15:45:00',
        isFromTrainer: true,
        read: true
      },
      {
        id: '3',
        clientId: '2',
        content: 'Спасибо за отличную тренировку! Чувствую себя супер 💪',
        timestamp: '2024-01-21T17:00:00',
        isFromTrainer: false,
        read: false
      }
    ];

    setClients(testClients);
    setWorkouts(testWorkouts);
    setMessages(testMessages);
    setLoading(false);
  };

  // Вычисляем статистику
  const stats: TrainerStats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    todayWorkouts: workouts.filter(w => w.date === new Date().toISOString().split('T')[0]).length,
    avgRating: 4.8
  };

  // Функции управления клиентами
  const addClient = (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString()
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(client => 
      client.id === id ? { ...client, ...updates } : client
    ));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
    setWorkouts(prev => prev.filter(workout => workout.clientId !== id));
    setMessages(prev => prev.filter(message => message.clientId !== id));
  };

  // Функции управления тренировками
  const addWorkout = (workoutData: Omit<Workout, 'id'>) => {
    const newWorkout: Workout = {
      ...workoutData,
      id: Date.now().toString()
    };
    setWorkouts(prev => [...prev, newWorkout]);
  };

  const updateWorkout = (id: string, updates: Partial<Workout>) => {
    setWorkouts(prev => prev.map(workout => 
      workout.id === id ? { ...workout, ...updates } : workout
    ));
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(workout => workout.id !== id));
  };

  // Функции управления сообщениями
  const sendMessage = (clientId: string, content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      clientId,
      content,
      timestamp: new Date().toISOString(),
      isFromTrainer: true,
      read: true
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev => prev.map(message => 
      message.id === messageId ? { ...message, read: true } : message
    ));
  };

  const value: TrainerContextType = {
    clients,
    workouts,
    messages,
    stats,
    addClient,
    updateClient,
    deleteClient,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    sendMessage,
    markAsRead,
    loading
  };

  return (
    <TrainerContext.Provider value={value}>
      {children}
    </TrainerContext.Provider>
  );
}

export function useTrainer() {
  const context = useContext(TrainerContext);
  if (context === undefined) {
    throw new Error('useTrainer must be used within a TrainerProvider');
  }
  return context;
}
