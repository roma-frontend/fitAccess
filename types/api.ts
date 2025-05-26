// types/api.ts (новый файл для API типов)
export interface TrainerPatchActions {
  activate: {};
  suspend: {};
  updateRating: {
    rating: number;
  };
  updateStats: {
    activeClients?: number;
    totalSessions?: number;
  };
  updateWorkingHours: {
    workingHours: any; // Можно заменить на более строгий тип
  };
  addCertification: {
    certification: string;
  };
  removeCertification: {
    certification: string;
  };
  updateSpecialization: {
    specialization: string[];
  };
  addSpecialization: {
    certification: string; // Используем certification как новую специализацию
  };
  removeSpecialization: {
    certification: string; // Используем certification как удаляемую специализацию
  };
}

export type TrainerPatchBody<T extends keyof TrainerPatchActions> = {
  action: T;
} & TrainerPatchActions[T];
