// components/manager/trainers/TrainerGridWithSkeleton.tsx (компонент с загрузкой)
"use client";

import { memo } from "react";
import TrainerCard from "./TrainerCard";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { Trainer } from "@/types/trainer";

interface TrainerGridWithSkeletonProps {
  trainers: Trainer[];
  loading?: boolean;
  onView: (trainerId: string) => void;
  onEdit: (trainerId: string) => void;
  onStatusChange: (trainer: Trainer) => void;
  onSchedule: (trainerId: string) => void;
  onDelete?: (trainerId: string) => void;
}

const TrainerGridWithSkeleton = memo(function TrainerGridWithSkeleton({
  trainers,
  loading = false,
  onView,
  onEdit,
  onStatusChange,
  onSchedule,
  onDelete,
}: TrainerGridWithSkeletonProps) {
  if (loading) {
    return <LoadingSkeleton variant="card" rows={6} />;
  }

  return (
    <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {trainers.map((trainer: Trainer) => (
        <TrainerCard
          key={trainer.id || trainer._id}
          trainer={trainer}
          onView={() => onView(trainer.id)}
          onEdit={() => onEdit(trainer.id)}
          onStatusChange={() => onStatusChange(trainer)}
          onSchedule={() => onSchedule(trainer.id)}
          onDelete={onDelete ? () => onDelete(trainer.id) : undefined}
        />
      ))}
    </div>
  );
});

export default TrainerGridWithSkeleton;
