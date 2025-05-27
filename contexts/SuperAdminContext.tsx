// contexts/SuperAdminContext.tsx (исправленная версия)
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSchedule } from "./ScheduleContext";

// Интерфейсы для данных
export interface TrainerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  joinDate: string;
  status: "active" | "inactive" | "suspended";
  specializations: string[];
  rating: number;
  totalClients: number;
  activeClients: number;
  totalWorkouts: number;
  monthlyRevenue: number;
  workingHours: {
    start: string;
    end: string;
    days: number[];
  };
  lastActivity: string;
}

export interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  trainerId?: string;
  trainerName?: string;
  status: "active" | "trial" | "inactive";
  joinDate: string;
  currentProgram?: string;
  totalWorkouts: number;
  progress: number;
  lastWorkout?: string;
  goals?: string[];
  notes?: string;
}

export interface SuperAdminStats {
  trainers: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  };
  clients: {
    total: number;
    active: number;
    trial: number;
    newThisMonth: number;
  };
  workouts: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    growth: number;
    byTrainer: Record<string, number>;
  };
  activity: {
    activeTrainers: number;
    busySlots: number;
    utilizationRate: number;
    avgSessionsPerTrainer: number;
  };
}

export interface SuperAdminContextType {
  trainers: TrainerData[];
  clients: ClientData[];
  stats: SuperAdminStats;
  error: string | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  getTrainerClients: (trainerId: string) => ClientData[];
  getTrainerStats: (trainerId: string) => {
    totalEvents: number;
    thisWeekEvents: number;
    thisMonthEvents: number;
    completedEvents: number;
    cancelledEvents: number;
    totalClients: number;
    activeClients: number;
    avgProgress: number;
  };
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTrainer: string | null;
  setSelectedTrainer: (trainerId: string | null) => void;
  dateRange: {
    start: Date;
    end: Date;
  };
  setDateRange: (range: { start: Date; end: Date }) => void;
  // Добавляем дополнительные утилиты
  getFilteredTrainers: () => TrainerData[];
  getFilteredClients: () => ClientData[];
  getRecentActivity: () => {
    events: any[];
    clients: ClientData[];
  };
}

// Создаем контекст
const SuperAdminContext = createContext<SuperAdminContextType | undefined>(
  undefined
);

export function SuperAdminProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { events } = useSchedule();

  const [trainers, setTrainers] = useState<TrainerData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });

  // Загрузка данных с улучшенной обработкой ошибок
  const loadData = async () => {
    setLoading(true);
    setError(null); // ← Сбрасываем ошибку при новой загрузке

    try {
      console.log("🔄 Загрузка данных супер-админа...");

      const [trainersResponse, clientsResponse] = await Promise.allSettled([
        fetch("/api/admin/trainers"),
        fetch("/api/admin/clients"),
      ]);

      let trainersData: TrainerData[] = [];
      let clientsData: ClientData[] = [];

      // Обрабатываем ответ тренеров
      if (
        trainersResponse.status === "fulfilled" &&
        trainersResponse.value.ok
      ) {
        trainersData = await trainersResponse.value.json();
        console.log("✅ Тренеры загружены с API:", trainersData.length);
      } else {
        console.log("⚠️ API тренеров недоступен, используем mock данные");
        trainersData = getMockTrainers();
      }

      // Обрабатываем ответ клиентов
      if (clientsResponse.status === "fulfilled" && clientsResponse.value.ok) {
        clientsData = await clientsResponse.value.json();
        console.log("✅ Клиенты загружены с API:", clientsData.length);
      } else {
        console.log("⚠️ API клиентов недоступен, используем mock данные");
        clientsData = getMockClients();
      }

      setTrainers(trainersData);
      setClients(clientsData);

      console.log("✅ Данные супер-админа загружены успешно");
    } catch (err) {
      console.error("❌ Критическая ошибка загрузки данных супер-админа:", err);
      
      // ← Устанавливаем ошибку
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка загрузки данных';
      setError(errorMessage);

      // Fallback к mock данным
      setTrainers(getMockTrainers());
      setClients(getMockClients());
    } finally {
      setLoading(false);
    }
  };

  // Mock данные для тренеров
  const getMockTrainers = (): TrainerData[] => {
    return [
      {
        id: "trainer1",
        name: "Александр Петров",
        email: "alex@fitaccess.ru",
        phone: "+7 (999) 123-45-67",
        role: "Персональный тренер",
        avatar: "/avatars/alex.jpg",
        joinDate: "2024-01-15",
        status: "active",
        specializations: [
          "Силовые тренировки",
          "Функциональный тренинг",
          "Реабилитация",
        ],
        rating: 4.8,
        totalClients: 25,
        activeClients: 18,
        totalWorkouts: 342,
        monthlyRevenue: 180000,
        workingHours: {
          start: "09:00",
          end: "18:00",
          days: [1, 2, 3, 4, 5],
        },
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "trainer2",
        name: "Мария Иванова",
        email: "maria@fitaccess.ru",
        phone: "+7 (999) 234-56-78",
        role: "Фитнес-инструктор",
        avatar: "/avatars/maria.jpg",
        joinDate: "2024-02-01",
        status: "active",
        specializations: ["Йога", "Пилатес", "Стретчинг"],
        rating: 4.9,
        totalClients: 30,
        activeClients: 22,
        totalWorkouts: 298,
        monthlyRevenue: 165000,
        workingHours: {
          start: "08:00",
          end: "17:00",
          days: [1, 2, 3, 4, 5, 6],
        },
        lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: "trainer3",
        name: "Дмитрий Козлов",
        email: "dmitry@fitaccess.ru",
        phone: "+7 (999) 345-67-89",
        role: "Йога-инструктор",
        avatar: "/avatars/dmitry.jpg",
        joinDate: "2024-03-10",
        status: "active",
        specializations: ["Хатха-йога", "Виньяса", "Медитация"],
        rating: 4.7,
        totalClients: 20,
        activeClients: 15,
        totalWorkouts: 156,
        monthlyRevenue: 120000,
        workingHours: {
          start: "10:00",
          end: "19:00",
          days: [1, 2, 3, 4, 5, 6, 0],
        },
        lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "trainer4",
        name: "Елена Сидорова",
        email: "elena@fitaccess.ru",
        phone: "+7 (999) 456-78-90",
        role: "Групповой инструктор",
        avatar: "/avatars/elena.jpg",
        joinDate: "2024-04-05",
        status: "active",
        specializations: ["Аэробика", "Зумба", "Степ"],
        rating: 4.6,
        totalClients: 35,
        activeClients: 28,
        totalWorkouts: 220,
        monthlyRevenue: 140000,
        workingHours: {
          start: "07:00",
          end: "16:00",
          days: [1, 2, 3, 4, 5, 6],
        },
        lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "trainer5",
        name: "Игорь Волков",
        email: "igor@fitaccess.ru",
        phone: "+7 (999) 567-89-01",
        role: "Тренер по боксу",
        avatar: "/avatars/igor.jpg",
        joinDate: "2024-02-20",
        status: "active",
        specializations: ["Бокс", "Кикбоксинг", "Самооборона"],
        rating: 4.9,
        totalClients: 18,
        activeClients: 15,
        totalWorkouts: 180,
        monthlyRevenue: 200000,
        workingHours: {
          start: "14:00",
          end: "22:00",
          days: [1, 2, 3, 4, 5, 6],
        },
        lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
    ];
  };

  // Mock данные для клиентов
  const getMockClients = (): ClientData[] => {
    return [
      {
        id: "client1",
        name: "Анна Смирнова",
        email: "anna@example.com",
        phone: "+7 (999) 345-67-89",
        trainerId: "trainer1",
        trainerName: "Александр Петров",
        status: "active",
        joinDate: "2024-03-01",
        currentProgram: "Силовая подготовка",
        totalWorkouts: 24,
        progress: 75,
        lastWorkout: "2024-05-23",
        goals: ["Похудение", "Увеличение силы", "Улучшение выносливости"],
        notes: "Отличная мотивация, быстро прогрессирует",
      },
      {
        id: "client2",
        name: "Дмитрий Козлов",
        email: "dmitry@example.com",
        phone: "+7 (999) 456-78-90",
        trainerId: "trainer2",
        trainerName: "Мария Иванова",
        status: "active",
        joinDate: "2024-04-15",
        currentProgram: "Йога и растяжка",
        totalWorkouts: 16,
        progress: 60,
        lastWorkout: "2024-05-24",
        goals: ["Гибкость", "Снятие стресса", "Улучшение осанки"],
      },
      {
        id: "client3",
        name: "Елена Васильева",
        email: "elena@example.com",
        phone: "+7 (999) 567-89-01",
        trainerId: "trainer1",
        trainerName: "Александр Петров",
        status: "trial",
        joinDate: "2024-05-20",
        currentProgram: "Пробная программа",
        totalWorkouts: 3,
        progress: 30,
        lastWorkout: "2024-05-25",
        goals: ["Общая физическая подготовка", "Снижение веса"],
      },
      {
        id: "client4",
        name: "Михаил Петров",
        email: "mikhail@example.com",
        phone: "+7 (999) 678-90-12",
        trainerId: "trainer3",
        trainerName: "Дмитрий Козлов",
        status: "active",
        joinDate: "2024-04-01",
        currentProgram: "Йога для начинающих",
        totalWorkouts: 20,
        progress: 80,
        lastWorkout: "2024-05-24",
        goals: ["Гибкость", "Расслабление", "Улучшение сна"],
      },
      {
        id: "client5",
        name: "Ольга Петрова",
        email: "olga@example.com",
        phone: "+7 (999) 789-01-23",
        trainerId: "trainer4",
        trainerName: "Елена Сидорова",
        status: "active",
        joinDate: "2024-03-15",
        currentProgram: "Групповые тренировки",
        totalWorkouts: 32,
        progress: 85,
        lastWorkout: "2024-05-25",
        goals: ["Кардио выносливость", "Координация", "Социализация"],
      },
      {
        id: "client6",
        name: "Сергей Иванов",
        email: "sergey@example.com",
        phone: "+7 (999) 890-12-34",
        trainerId: "trainer5",
        trainerName: "Игорь Волков",
        status: "active",
        joinDate: "2024-04-10",
        currentProgram: "Бокс для начинающих",
        totalWorkouts: 18,
        progress: 70,
                lastWorkout: "2024-05-24",
        goals: ["Самооборона", "Физическая подготовка", "Снятие стресса"],
      },
    ];
  };

  // Вычисление статистики на основе реальных данных
  const calculateStats = (): SuperAdminStats => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const todayEvents = events.filter((e) => {
      const eventDate = new Date(e.startTime);
      return (
        eventDate >= startOfToday &&
        eventDate < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
      );
    });

    const weekEvents = events.filter(
      (e) => new Date(e.startTime) >= startOfWeek
    );
    const monthEvents = events.filter(
      (e) => new Date(e.startTime) >= startOfMonth
    );

    const completedEvents = events.filter((e) => e.status === "completed");
    const cancelledEvents = events.filter((e) => e.status === "cancelled");

    const activeTrainerIds = new Set(weekEvents.map((e) => e.trainerId));
    const activeTrainersCount = activeTrainerIds.size;

    const revenueByTrainer = trainers.reduce(
      (acc, trainer) => {
        acc[trainer.id] = trainer.monthlyRevenue;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalRevenue = trainers.reduce(
      (sum, trainer) => sum + trainer.monthlyRevenue,
      0
    );

    return {
      trainers: {
        total: trainers.length,
        active: trainers.filter((t) => t.status === "active").length,
        inactive: trainers.filter((t) => t.status === "inactive").length,
        newThisMonth: trainers.filter(
          (t) => new Date(t.joinDate) >= startOfMonth
        ).length,
      },
      clients: {
        total: clients.length,
        active: clients.filter((c) => c.status === "active").length,
        trial: clients.filter((c) => c.status === "trial").length,
        newThisMonth: clients.filter(
          (c) => new Date(c.joinDate) >= startOfMonth
        ).length,
      },
      workouts: {
        total: events.length,
        today: todayEvents.length,
        thisWeek: weekEvents.length,
        thisMonth: monthEvents.length,
        completed: completedEvents.length,
        cancelled: cancelledEvents.length,
      },
      revenue: {
        total: totalRevenue,
        thisMonth: totalRevenue,
        growth: 12.5, // Можно вычислять на основе исторических данных
        byTrainer: revenueByTrainer,
      },
      activity: {
        activeTrainers: activeTrainersCount,
        busySlots: weekEvents.length,
        utilizationRate: Math.min(
          (weekEvents.length / (trainers.length * 40)) * 100,
          100
        ),
        avgSessionsPerTrainer:
          trainers.length > 0 ? weekEvents.length / trainers.length : 0,
      },
    };
  };

  // Мемоизируем статистику для производительности
  const stats = React.useMemo(
    () => calculateStats(),
    [events, trainers, clients]
  );

  const refreshData = async () => {
    await loadData();
  };

  const getTrainerClients = (trainerId: string): ClientData[] => {
    return clients.filter((client) => client.trainerId === trainerId);
  };

  const getTrainerStats = (trainerId: string) => {
    const trainerEvents = events.filter(
      (event) => event.trainerId === trainerId
    );
    const trainerClients = getTrainerClients(trainerId);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisWeekEvents = trainerEvents.filter(
      (e) => new Date(e.startTime) >= startOfWeek
    );
    const thisMonthEvents = trainerEvents.filter(
      (e) => new Date(e.startTime) >= startOfMonth
    );

    return {
      totalEvents: trainerEvents.length,
      thisWeekEvents: thisWeekEvents.length,
      thisMonthEvents: thisMonthEvents.length,
      completedEvents: trainerEvents.filter((e) => e.status === "completed")
        .length,
      cancelledEvents: trainerEvents.filter((e) => e.status === "cancelled")
        .length,
      totalClients: trainerClients.length,
      activeClients: trainerClients.filter((c) => c.status === "active").length,
      avgProgress:
        trainerClients.length > 0
          ? trainerClients.reduce((sum, c) => sum + c.progress, 0) /
            trainerClients.length
          : 0,
    };
  };

  // Дополнительные утилиты
  const getFilteredTrainers = (): TrainerData[] => {
    let filtered = trainers;

    if (searchTerm) {
      filtered = filtered.filter(
        (trainer) =>
          trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trainer.specializations.some((spec) =>
            spec.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    return filtered;
  };

  const getFilteredClients = (): ClientData[] => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.trainerName &&
            client.trainerName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedTrainer) {
      filtered = filtered.filter(
        (client) => client.trainerId === selectedTrainer
      );
    }

    return filtered;
  };

  const getRecentActivity = () => {
    // Последние 10 активностей
    const recentEvents = events
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);

    const recentClients = clients
      .filter((c) => c.lastWorkout)
      .sort(
        (a, b) =>
          new Date(b.lastWorkout!).getTime() -
          new Date(a.lastWorkout!).getTime()
      )
      .slice(0, 5);

    return {
      events: recentEvents,
      clients: recentClients,
    };
  };

  // Загружаем данные при инициализации
  useEffect(() => {
    loadData();
  }, []);

  const value: SuperAdminContextType = {
    trainers,
    clients,
    stats,
    loading,
    error,
    refreshData,
    getTrainerClients,
    getTrainerStats,
    searchTerm,
    setSearchTerm,
    selectedTrainer,
    setSelectedTrainer,
    dateRange,
    setDateRange,
    getFilteredTrainers,
    getFilteredClients,
    getRecentActivity,
  };

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const context = useContext(SuperAdminContext);
  if (context === undefined) {
    throw new Error("useSuperAdmin must be used within a SuperAdminProvider");
  }
  return context;
}

// Экспортируем дополнительные хуки для удобства
export function useTrainerData(trainerId: string) {
  const { trainers, getTrainerStats, getTrainerClients } = useSuperAdmin();

  const trainer = trainers.find((t) => t.id === trainerId);
  const stats = trainer ? getTrainerStats(trainerId) : null;
  const clients = trainer ? getTrainerClients(trainerId) : [];

  return {
    trainer,
    stats,
    clients,
    isLoading: !trainer,
  };
}

export function useClientData(clientId: string) {
  const { clients, trainers } = useSuperAdmin();

  const client = clients.find((c) => c.id === clientId);
  const trainer = client
    ? trainers.find((t) => t.id === client.trainerId)
    : null;

  return {
    client,
    trainer,
    isLoading: !client,
  };
}

// Хук для получения аналитики (ИСПРАВЛЕННАЯ ВЕРСИЯ)
export function useSuperAdminAnalytics() {
  const { stats, trainers, clients } = useSuperAdmin(); // Используем useSuperAdmin вместо useSchedule

  const getTopPerformers = () => {
    return {
      byRevenue: [...trainers]
        .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
        .slice(0, 5),
      byRating: [...trainers].sort((a, b) => b.rating - a.rating).slice(0, 5),
      byClients: [...trainers]
        .sort((a, b) => b.activeClients - a.activeClients)
        .slice(0, 5),
    };
  };

  const getGrowthMetrics = () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthClients = clients.filter((c: ClientData) => {
      const joinDate = new Date(c.joinDate);
      return joinDate >= lastMonth && joinDate < thisMonth;
    }).length;

    const thisMonthClients = clients.filter((c: ClientData) => {
      const joinDate = new Date(c.joinDate);
      return joinDate >= thisMonth;
    }).length;

    const clientGrowth =
      lastMonthClients > 0
        ? ((thisMonthClients - lastMonthClients) / lastMonthClients) * 100
        : 0;

    return {
      clientGrowth,
      newClientsThisMonth: thisMonthClients,
      newClientsLastMonth: lastMonthClients,
    };
  };

  const getRevenueAnalytics = () => {
    const totalRevenue = trainers.reduce((sum, trainer) => sum + trainer.monthlyRevenue, 0);
    const avgRevenuePerTrainer = trainers.length > 0 ? totalRevenue / trainers.length : 0;
    
    const revenueBySpecialization = trainers.reduce((acc, trainer) => {
      trainer.specializations.forEach(spec => {
        acc[spec] = (acc[spec] || 0) + trainer.monthlyRevenue;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      avgRevenuePerTrainer,
      revenueBySpecialization,
      topEarners: trainers
        .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
        .slice(0, 3)
    };
  };

  const getClientAnalytics = () => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'active').length;
    const trialClients = clients.filter(c => c.status === 'trial').length;
    
    const avgProgress = clients.length > 0 
      ? clients.reduce((sum, c) => sum + c.progress, 0) / clients.length 
      : 0;

    const clientsByTrainer = trainers.map(trainer => ({
      trainerId: trainer.id,
      trainerName: trainer.name,
      clientCount: clients.filter(c => c.trainerId === trainer.id).length,
      avgProgress: (() => {
        const trainerClients = clients.filter(c => c.trainerId === trainer.id);
        return trainerClients.length > 0
          ? trainerClients.reduce((sum, c) => sum + c.progress, 0) / trainerClients.length
          : 0;
      })()
    }));

    return {
      totalClients,
      activeClients,
      trialClients,
      avgProgress,
      clientsByTrainer,
      retentionRate: totalClients > 0 ? (activeClients / totalClients) * 100 : 0
    };
  };

  return {
    getTopPerformers,
    getGrowthMetrics,
    getRevenueAnalytics,
    getClientAnalytics,
    stats,
  };
}

// Хук для работы с поиском и фильтрацией
export function useSuperAdminFilters() {
  const { 
    searchTerm, 
    setSearchTerm, 
    selectedTrainer, 
    setSelectedTrainer,
    getFilteredTrainers,
    getFilteredClients 
  } = useSuperAdmin();

  const filteredTrainers = getFilteredTrainers();
  const filteredClients = getFilteredClients();

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTrainer(null);
  };

  const searchTrainers = (query: string) => {
    setSearchTerm(query);
  };

  const filterByTrainer = (trainerId: string | null) => {
    setSelectedTrainer(trainerId);
  };

  return {
    searchTerm,
    selectedTrainer,
    filteredTrainers,
    filteredClients,
    searchTrainers,
    filterByTrainer,
    clearFilters,
    hasActiveFilters: searchTerm !== '' || selectedTrainer !== null
  };
}

// Хук для управления состоянием дашборда
export function useSuperAdminDashboard() {
  const { stats, loading, refreshData } = useSuperAdmin();
  const { events } = useSchedule();
  
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Автообновление каждые 5 минут
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      await refreshData();
      setLastRefresh(new Date());
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshData]);

  const handleRefresh = async () => {
    await refreshData();
    setLastRefresh(new Date());
  };

  const getDashboardAlerts = () => {
    const alerts = [];
    
    // Проверяем неактивных тренеров
    if (stats.trainers.inactive > 0) {
      alerts.push({
                type: 'warning' as const,
        message: `${stats.trainers.inactive} неактивных тренеров требуют внимания`,
        action: 'Проверить тренеров'
      });
    }

    // Проверяем низкую загрузку
    if (stats.activity.utilizationRate < 50) {
      alerts.push({
        type: 'info' as const,
        message: `Низкая загрузка системы: ${stats.activity.utilizationRate.toFixed(1)}%`,
        action: 'Оптимизировать расписание'
      });
    }

    // Проверяем отмененные тренировки
    const cancellationRate = stats.workouts.total > 0 
      ? (stats.workouts.cancelled / stats.workouts.total) * 100 
      : 0;
    
    if (cancellationRate > 10) {
      alerts.push({
        type: 'error' as const,
        message: `Высокий процент отмен: ${cancellationRate.toFixed(1)}%`,
        action: 'Анализировать причины'
      });
    }

    // Проверяем предстоящие события без подтверждения
    const unconfirmedEvents = events.filter(e => 
      e.status === 'scheduled' && 
      new Date(e.startTime) > new Date() &&
      new Date(e.startTime).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000
    );

    if (unconfirmedEvents.length > 0) {
      alerts.push({
        type: 'warning' as const,
        message: `${unconfirmedEvents.length} событий требуют подтверждения`,
        action: 'Подтвердить события'
      });
    }

    return alerts;
  };

  const getSystemHealth = () => {
    const health = {
      overall: 'good' as 'excellent' | 'good' | 'warning' | 'critical',
      scores: {
        trainers: 0,
        clients: 0,
        revenue: 0,
        activity: 0
      }
    };

    // Оценка тренеров
    const activeTrainerRate = stats.trainers.total > 0 
      ? (stats.trainers.active / stats.trainers.total) * 100 
      : 0;
    health.scores.trainers = activeTrainerRate;

    // Оценка клиентов
    const activeClientRate = stats.clients.total > 0 
      ? (stats.clients.active / stats.clients.total) * 100 
      : 0;
    health.scores.clients = activeClientRate;

    // Оценка выручки (рост)
    health.scores.revenue = Math.max(0, Math.min(100, stats.revenue.growth * 10 + 50));

    // Оценка активности
    health.scores.activity = Math.min(100, stats.activity.utilizationRate);

    // Общая оценка
    const avgScore = Object.values(health.scores).reduce((sum, score) => sum + score, 0) / 4;
    
    if (avgScore >= 90) health.overall = 'excellent';
    else if (avgScore >= 75) health.overall = 'good';
    else if (avgScore >= 60) health.overall = 'warning';
    else health.overall = 'critical';

    return health;
  };

  return {
    stats,
    loading,
    lastRefresh,
    autoRefresh,
    setAutoRefresh,
    handleRefresh,
    getDashboardAlerts,
    getSystemHealth,
    isDataStale: new Date().getTime() - lastRefresh.getTime() > 10 * 60 * 1000 // 10 минут
  };
}

// Хук для экспорта данных
export function useSuperAdminExport() {
  const { trainers, clients, stats } = useSuperAdmin();
  const { events } = useSchedule();

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Экранируем запятые и кавычки
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTrainers = () => {
    const exportData = trainers.map(trainer => ({
      'ID': trainer.id,
      'Имя': trainer.name,
      'Email': trainer.email,
      'Телефон': trainer.phone,
      'Роль': trainer.role,
      'Статус': trainer.status,
      'Рейтинг': trainer.rating,
      'Активных клиентов': trainer.activeClients,
      'Всего клиентов': trainer.totalClients,
      'Тренировок': trainer.totalWorkouts,
      'Выручка за месяц': trainer.monthlyRevenue,
      'Дата присоединения': trainer.joinDate,
      'Специализации': trainer.specializations.join('; ')
    }));
    
    exportToCSV(exportData, 'trainers');
  };

  const exportClients = () => {
    const exportData = clients.map(client => ({
      'ID': client.id,
      'Имя': client.name,
      'Email': client.email,
      'Телефон': client.phone,
      'Тренер': client.trainerName || 'Не назначен',
      'Статус': client.status,
      'Программа': client.currentProgram || 'Не указана',
      'Прогресс': `${client.progress}%`,
      'Тренировок': client.totalWorkouts,
      'Последняя тренировка': client.lastWorkout || 'Нет данных',
      'Дата присоединения': client.joinDate,
      'Цели': client.goals?.join('; ') || 'Не указаны'
    }));
    
    exportToCSV(exportData, 'clients');
  };

  const exportEvents = () => {
    const exportData = events.map(event => ({
      'ID': event._id,
      'Название': event.title,
      'Тип': event.type,
      'Тренер': event.trainerName,
      'Клиент': event.clientName || 'Групповое занятие',
      'Статус': event.status,
      'Дата начала': new Date(event.startTime).toLocaleString('ru'),
      'Дата окончания': new Date(event.endTime).toLocaleString('ru'),
      'Место': event.location || 'Не указано',
      'Описание': event.description || '',
      'Создано': new Date(event.createdAt).toLocaleString('ru')
    }));
    
    exportToCSV(exportData, 'events');
  };

  const exportStats = () => {
    const exportData = [
      {
        'Метрика': 'Всего тренеров',
        'Значение': stats.trainers.total,
        'Категория': 'Тренеры'
      },
      {
        'Метрика': 'Активных тренеров',
        'Значение': stats.trainers.active,
        'Категория': 'Тренеры'
      },
      {
        'Метрика': 'Всего клиентов',
        'Значение': stats.clients.total,
        'Категория': 'Клиенты'
      },
      {
        'Метрика': 'Активных клиентов',
        'Значение': stats.clients.active,
        'Категория': 'Клиенты'
      },
      {
        'Метрика': 'Тренировок сегодня',
        'Значение': stats.workouts.today,
        'Категория': 'Активность'
      },
      {
        'Метрика': 'Тренировок за неделю',
        'Значение': stats.workouts.thisWeek,
        'Категория': 'Активность'
      },
      {
        'Метрика': 'Выручка за месяц',
        'Значение': stats.revenue.thisMonth,
        'Категория': 'Финансы'
      },
      {
        'Метрика': 'Загрузка системы (%)',
        'Значение': stats.activity.utilizationRate.toFixed(1),
        'Категория': 'Система'
      }
    ];
    
    exportToCSV(exportData, 'statistics');
  };

  const exportAll = () => {
    exportTrainers();
    setTimeout(() => exportClients(), 500);
    setTimeout(() => exportEvents(), 1000);
    setTimeout(() => exportStats(), 1500);
  };

  return {
    exportTrainers,
    exportClients,
    exportEvents,
    exportStats,
    exportAll
  };
}

// Хук для уведомлений супер-админа
export function useSuperAdminNotifications() {
  const { stats } = useSuperAdmin();
  const { events } = useSchedule();


  type NotificationType = {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  };

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>>([]);

  useEffect(() => {
    const checkAndCreateNotifications = () => {
      const newNotifications: NotificationType[] = [];
      const now = new Date();

      // Проверяем критически низкую загрузку
      if (stats.activity.utilizationRate < 30) {
        newNotifications.push({
          id: `low_utilization_${now.getTime()}`,
          type: 'warning' as const,
          title: 'Низкая загрузка системы',
          message: `Загрузка составляет всего ${stats.activity.utilizationRate.toFixed(1)}%. Рассмотрите возможность оптимизации расписания.`,
          timestamp: now,
          read: false
        });
      }

      // Проверяем новых клиентов
      if (stats.clients.newThisMonth > 5) {
        newNotifications.push({
          id: `new_clients_${now.getTime()}`,
          type: 'success' as const,
          title: 'Рост клиентской базы',
          message: `За этот месяц присоединилось ${stats.clients.newThisMonth} новых клиентов!`,
          timestamp: now,
          read: false
        });
      }

      // Проверяем события, требующие внимания
      const urgentEvents = events.filter(e => {
        const eventTime = new Date(e.startTime);
        const timeDiff = eventTime.getTime() - now.getTime();
        return e.status === 'scheduled' && timeDiff > 0 && timeDiff < 2 * 60 * 60 * 1000; // 2 часа
      });

      if (urgentEvents.length > 0) {
        newNotifications.push({
          id: `urgent_events_${now.getTime()}`,
          type: 'info' as const,
          title: 'События требуют подтверждения',
          message: `${urgentEvents.length} событий начинаются в течение 2 часов и требуют подтверждения.`,
          timestamp: now,
          read: false
        });
      }

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev].slice(0, 50)); // Ограничиваем 50 уведомлениями
      }
    };

    // Проверяем каждые 5 минут
    const interval = setInterval(checkAndCreateNotifications, 5 * 60 * 1000);
    
    // Первоначальная проверка
    checkAndCreateNotifications();

    return () => clearInterval(interval);
  }, [stats, events]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  };
}


