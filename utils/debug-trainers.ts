// utils/debug-trainers.ts
export function debugTrainerData(trainers: any[]) {
  console.log("🔍 === ОТЛАДКА ТРЕНЕРОВ ===");
  console.log("Количество тренеров:", trainers?.length || 0);
  
  if (trainers && trainers.length > 0) {
    trainers.forEach((trainer, index) => {
      console.log(`\n🔍 Тренер ${index + 1}:`, {
        raw: trainer,
        _id: trainer._id,
        id: trainer.id,
        email: trainer.email,
        name: trainer.name,
        trainerName: trainer.trainerName,
        role: trainer.role,
        trainerRole: trainer.trainerRole,
        keys: Object.keys(trainer)
      });
    });
  } else {
    console.log("❌ Тренеры не найдены или массив пустой");
  }
  console.log("🔍 === КОНЕЦ ОТЛАДКИ ===\n");
}
