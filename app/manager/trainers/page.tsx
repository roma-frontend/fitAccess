// app/manager/trainers/page.tsx (исправленная финальная версия)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ManagerHeader from "@/components/manager/ManagerHeader";
import { ManagerProvider, useManager } from "@/contexts/ManagerContext";

// Импорт компонентов
import LoadingState from "@/components/manager/trainers/LoadingState";
import PageHeader from "@/components/manager/trainers/PageHeader";
import TrainerFilters from "@/components/manager/trainers/TrainerFilters";
import TrainerStats from "@/components/manager/trainers/TrainerStats";
import TrainerGrid from "@/components/manager/trainers/TrainerGrid";
import TrainerMobileList from "@/components/manager/trainers/TrainerMobileList";
import StatusChangeDialog from "@/components/manager/trainers/StatusChangeDialog";
import EmptyState from "@/components/manager/trainers/EmptyState";

// Импорт хуков
import { useTrainerFilters } from "@/hooks/useTrainerFilters";
import { useTrainerStats } from "@/hooks/useTrainerStats";
import { useTrainerActions } from "@/hooks/useTrainerActions";

// Импорт типов
import { Trainer } from "@/types/trainer";

function TrainersManagementContent() {
  const router = useRouter();
  const { trainers, loading, updateTrainerStatus } = useManager();
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    specializationFilter,
    setSpecializationFilter,
    allSpecializations,
    filteredTrainers,
    resetFilters,
    hasActiveFilters,
  } = useTrainerFilters(trainers || []);

  const stats = useTrainerStats(trainers || []);
  
  const {
    navigateToAdd,
    navigateToImport,
    navigateToView,
    navigateToEdit,
    navigateToSchedule,
  } = useTrainerActions();

  // Обработчики событий
  const handleStatusChange = async (trainerId: string, newStatus: string) => {
    try {
      await updateTrainerStatus(trainerId, newStatus);
      setShowStatusDialog(false);
      setSelectedTrainer(null);
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
      // Здесь можно добавить toast уведомление об ошибке
    }
  };

  const handleStatusChangeDialog = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setShowStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setShowStatusDialog(false);
    setSelectedTrainer(null);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок и действия */}
        <PageHeader onAddTrainer={navigateToAdd} onImport={navigateToImport} />

        {/* Фильтры и поиск */}
        <TrainerFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          specializationFilter={specializationFilter}
          setSpecializationFilter={setSpecializationFilter}
          specializations={allSpecializations}
          onReset={resetFilters}
        />

        {/* Статистика */}
        <TrainerStats {...stats} />

        {/* Список тренеров - мобильная версия */}
        <TrainerMobileList
          trainers={filteredTrainers}
          onView={navigateToView}
          onEdit={navigateToEdit}
          onStatusChange={handleStatusChangeDialog}
          onSchedule={navigateToSchedule}
        />

        {/* Список тренеров - десктопная версия */}
        <TrainerGrid
          trainers={filteredTrainers}
          onView={navigateToView}
          onEdit={navigateToEdit}
          onStatusChange={handleStatusChangeDialog}
          onSchedule={navigateToSchedule}
        />

        {/* Пустое состояние */}
        {filteredTrainers.length === 0 && (
          <EmptyState
            hasFilters={hasActiveFilters}
            onAddTrainer={navigateToAdd}
          />
        )}
      </div>

      {/* Диалог изменения статуса */}
      <StatusChangeDialog
        open={showStatusDialog}
        onOpenChange={handleCloseStatusDialog}
        trainer={selectedTrainer}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

export default function TrainersManagement() {
  return (
    <ProtectedRoute
      allowedRoles={["manager", "admin", "super-admin"]}
      redirectTo="/staff-login"
    >
      <ManagerProvider>
        <TrainersManagementContent />
      </ManagerProvider>
    </ProtectedRoute>
  );
}
